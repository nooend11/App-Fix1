import express from "express";
import cors from "cors";
import path from "path";
import jwt from "jsonwebtoken";
import { createServer as createViteServer } from "vite";
import { store } from "./server/store.js";
import { marzbanService } from "./server/marzban.ts";

const JWT_SECRET = process.env.JWT_SECRET || "marzban-admin-secret-2026";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  /*
  |--------------------------------------------------------------------------
  | Client Device Authentication API
  |--------------------------------------------------------------------------
  */
  app.post("/api/login", async (req, res) => {
    try {
      const { username, device_id, device_name } = req.body || {};

      if (!username || !device_id || !device_name) {
        return res.status(400).json({
          success: false,
          message: "username, device_id, and device_name are required.",
        });
      }

      const cleanUsername = String(username).trim();
      const cleanDeviceId = String(device_id).trim();
      const cleanDeviceName = String(device_name).trim();

      let device = store.getDeviceByUsername(cleanUsername);

      // First Login -> Create Device
      if (!device) {
        const expireAt = new Date(Date.now() + 30 * 86400 * 1000).toISOString();
        device = store.createDevice({
          username: cleanUsername,
          device_id: cleanDeviceId,
          device_name: cleanDeviceName,
          active: true,
          expire_at: expireAt,
        });
      }

      // If expire_at is null
      if (!device.expire_at) {
        device = store.updateDevice(cleanUsername, {
          expire_at: new Date(Date.now() + 30 * 86400 * 1000).toISOString(),
        })!;
      }

      // Disabled Account Check
      if (!device.active) {
        return res.status(403).json({
          success: false,
          message: "Account disabled",
        });
      }

      // Expired Subscription Check
      if (new Date(device.expire_at).getTime() < Date.now()) {
        return res.status(403).json({
          success: false,
          message: "Subscription expired",
        });
      }

      // Device Binding Check
      if (!device.device_id) {
        device = store.updateDevice(cleanUsername, {
          device_id: cleanDeviceId,
          device_name: cleanDeviceName,
        })!;
      } else if (device.device_id !== cleanDeviceId) {
        return res.status(403).json({
          success: false,
          message: "Device not allowed",
        });
      }

      // Sync with Marzban
      const userExists = await marzbanService.userExists(cleanUsername);
      if (!userExists) {
        await marzbanService.createUser(cleanUsername, 30);
      }

      const subscription = marzbanService.getSubscription(cleanUsername);

      return res.json({
        success: true,
        message: "Login successful",
        username: cleanUsername,
        device_name: device.device_name,
        expire_at: device.expire_at,
        subscription,
        config: subscription,
      });
    } catch (err: any) {
      console.error("[/api/login Error]:", err);
      return res.status(500).json({
        success: false,
        message: err?.message || "Internal server error",
      });
    }
  });

  /*
  |--------------------------------------------------------------------------
  | Admin Auth API
  |--------------------------------------------------------------------------
  */
  app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password required.",
      });
    }

    const admin = store.getAdminByUsername(String(username).trim());

    if (!admin || admin.password !== String(password).trim()) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const token = jwt.sign(
      { id: admin.id, name: admin.name, username: admin.username },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        username: admin.username,
      },
    });
  });

  /*
  |--------------------------------------------------------------------------
  | Admin Dashboard & Management APIs
  |--------------------------------------------------------------------------
  */
  app.get("/api/admin/dashboard", (req, res) => {
    const devices = store.getDevices();
    const now = Date.now();

    const total_users = devices.length;
    const active_users = devices.filter(
      (d) => d.active && d.expire_at && new Date(d.expire_at).getTime() >= now
    ).length;
    const expired_users = devices.filter(
      (d) => d.expire_at && new Date(d.expire_at).getTime() < now
    ).length;
    const banned_users = devices.filter((d) => !d.active).length;

    return res.json({
      success: true,
      data: {
        total_users,
        active_users,
        expired_users,
        banned_users,
      },
    });
  });

  app.get("/api/admin/users", (req, res) => {
    const devices = store.getDevices().sort((a, b) => b.id - a.id);
    return res.json({
      success: true,
      count: devices.length,
      users: devices,
    });
  });

  app.post("/api/admin/users", async (req, res) => {
    try {
      const { username, days = 30, device_name } = req.body || {};
      if (!username) {
        return res.status(400).json({ success: false, message: "Username required" });
      }

      const cleanUsername = String(username).trim();
      const numDays = parseInt(String(days), 10) || 30;

      const existing = store.getDeviceByUsername(cleanUsername);
      if (existing) {
        return res.status(400).json({ success: false, message: "Username already exists" });
      }

      const expireAt = new Date(Date.now() + numDays * 86400 * 1000).toISOString();
      const newDevice = store.createDevice({
        username: cleanUsername,
        device_name: device_name ? String(device_name).trim() : null,
        active: true,
        expire_at: expireAt,
      });

      await marzbanService.createUser(cleanUsername, numDays);

      return res.json({
        success: true,
        message: "User created successfully",
        user: newDevice,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err?.message || "Failed to create user" });
    }
  });

  app.get("/api/admin/search/:username", (req, res) => {
    const { username } = req.params;
    const user = store.getDeviceByUsername(username);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user,
    });
  });

  app.post("/api/admin/extend/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const days = parseInt(req.body.days, 10);

      if (!days || isNaN(days) || days < 1) {
        return res.status(400).json({
          success: false,
          message: "Valid days parameter (>= 1) required.",
        });
      }

      const device = store.getDeviceByUsername(username);
      if (!device) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const now = Date.now();
      const currentExpire = device.expire_at ? new Date(device.expire_at).getTime() : now;
      const baseTime = currentExpire > now ? currentExpire : now;
      const newExpire = new Date(baseTime + days * 86400 * 1000).toISOString();

      const updated = store.updateDevice(username, { expire_at: newExpire })!;
      await marzbanService.updateUserExpire(username, days);

      return res.json({
        success: true,
        message: "Subscription extended",
        expire_at: updated.expire_at,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err?.message || "Failed to extend subscription",
      });
    }
  });

  app.post("/api/admin/ban/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const device = store.getDeviceByUsername(username);

      if (!device) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      store.updateDevice(username, { active: false });
      await marzbanService.disableUser(username);

      return res.json({
        success: true,
        message: "User banned",
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err?.message || "Failed to ban user",
      });
    }
  });

  app.post("/api/admin/unban/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const device = store.getDeviceByUsername(username);

      if (!device) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      store.updateDevice(username, { active: true });
      await marzbanService.enableUser(username);

      return res.json({
        success: true,
        message: "User unbanned",
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err?.message || "Failed to unban user",
      });
    }
  });

  app.post("/api/admin/reset-device/:username", (req, res) => {
    const { username } = req.params;
    const device = store.getDeviceByUsername(username);

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    store.updateDevice(username, {
      device_id: null,
      device_name: null,
    });

    return res.json({
      success: true,
      message: "Device reset successful",
    });
  });

  app.delete("/api/admin/delete/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const device = store.getDeviceByUsername(username);

      if (!device) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      await marzbanService.deleteUser(username);
      store.deleteDevice(username);

      return res.json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err?.message || "Failed to delete user",
      });
    }
  });

  /*
  |--------------------------------------------------------------------------
  | Marzban Direct Test Endpoints (From api.php)
  |--------------------------------------------------------------------------
  */
  app.get("/marzban-test", async (req, res) => {
    try {
      const data = await marzbanService.getUsers();
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err?.message });
    }
  });

  app.get("/create-user/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const data = await marzbanService.createUser(username, 30);
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err?.message });
    }
  });

  app.get("/user/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const data = await marzbanService.getUser(username);
      return res.json(data);
    } catch (err: any) {
      return res.status(404).json({ error: err?.message });
    }
  });

  app.delete("/user/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const ok = await marzbanService.deleteUser(username);
      return res.json({ success: ok });
    } catch (err: any) {
      return res.status(500).json({ error: err?.message });
    }
  });

  /*
  |--------------------------------------------------------------------------
  | Marzban Configuration Management
  |--------------------------------------------------------------------------
  */
  app.get("/api/admin/config", (req, res) => {
    return res.json({
      success: true,
      config: store.getConfig(),
    });
  });

  app.post("/api/admin/config", (req, res) => {
    const { baseUrl, username, password, isMock } = req.body || {};
    const updated = store.updateConfig({
      ...(baseUrl ? { baseUrl: String(baseUrl).trim() } : {}),
      ...(username ? { username: String(username).trim() } : {}),
      ...(password ? { password: String(password).trim() } : {}),
      ...(isMock !== undefined ? { isMock: Boolean(isMock) } : {}),
    });

    return res.json({
      success: true,
      message: "Marzban configuration updated",
      config: updated,
    });
  });

  /*
  |--------------------------------------------------------------------------
  | Vite Middleware (Dev) or Static Assets (Prod)
  |--------------------------------------------------------------------------
  */
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Marzban Backend] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
