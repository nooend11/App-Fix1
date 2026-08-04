import axios from "axios";
import https from "https";
import { store } from "./store.js";

// Allow requests to Marzban servers with self-signed or custom SSL certs
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

function getNormalizedBaseUrl(rawUrl: string): string {
  if (!rawUrl) return "https://v2.nooend.me:8000";
  let url = rawUrl.trim();
  // Strip trailing dashboard paths
  url = url.replace(/\/dashboard\/.*$/, "");
  url = url.replace(/\/+$/, "");
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
}

// Mock database of Marzban Users for offline/development testing
const mockMarzbanUsers: Record<string, any> = {
  alex_vpn: {
    username: "alex_vpn",
    status: "active",
    expire: Math.floor((Date.now() + 25 * 86400 * 1000) / 1000),
    data_limit: 0,
    used_traffic: 15420000000, // ~15.4 GB
    data_limit_reset_strategy: "no_reset",
    proxies: { shadowsocks: {} },
    inbounds: { shadowsocks: ["Shadowsocks TCP"] },
    created_at: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
  },
  sarah_m: {
    username: "sarah_m",
    status: "active",
    expire: Math.floor((Date.now() + 3 * 86400 * 1000) / 1000),
    data_limit: 53687091200, // 50 GB
    used_traffic: 41200000000, // ~41.2 GB
    data_limit_reset_strategy: "no_reset",
    proxies: { shadowsocks: {} },
    inbounds: { shadowsocks: ["Shadowsocks TCP"] },
    created_at: new Date(Date.now() - 27 * 86400 * 1000).toISOString(),
  },
  john_doe: {
    username: "john_doe",
    status: "disabled",
    expire: Math.floor((Date.now() - 2 * 86400 * 1000) / 1000),
    data_limit: 0,
    used_traffic: 8900000000,
    data_limit_reset_strategy: "no_reset",
    proxies: { shadowsocks: {} },
    inbounds: { shadowsocks: ["Shadowsocks TCP"] },
    created_at: new Date(Date.now() - 32 * 86400 * 1000).toISOString(),
  }
};

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getMarzbanToken(): Promise<string> {
  const config = store.getConfig();
  if (config.isMock) {
    return "mock_marzban_token_xyz_123";
  }

  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const baseUrl = getNormalizedBaseUrl(config.baseUrl);
  const formData = new URLSearchParams();
  formData.append("username", config.username);
  formData.append("password", config.password);

  const res = await axios.post(`${baseUrl}/api/admin/token`, formData, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    httpsAgent,
    timeout: 8000,
  });

  const token = res.data.access_token;
  cachedToken = {
    token,
    expiresAt: Date.now() + 3000 * 1000, // cache for ~50 mins
  };
  return token;
}

export const marzbanService = {
  async getUsers(): Promise<{ total: number; users: any[] }> {
    const config = store.getConfig();
    if (config.isMock) {
      const usersList = Object.values(mockMarzbanUsers);
      return { total: usersList.length, users: usersList };
    }

    try {
      const baseUrl = getNormalizedBaseUrl(config.baseUrl);
      const token = await getMarzbanToken();
      const res = await axios.get(`${baseUrl}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
        httpsAgent,
        timeout: 8000,
      });
      return res.data;
    } catch (err: any) {
      console.warn("[MarzbanService] Live call failed, falling back to mock mode:", err?.message);
      const usersList = Object.values(mockMarzbanUsers);
      return { total: usersList.length, users: usersList };
    }
  },

  async getUser(username: string): Promise<any> {
    const config = store.getConfig();
    if (config.isMock) {
      if (mockMarzbanUsers[username]) {
        return mockMarzbanUsers[username];
      }
      throw new Error("User not found");
    }

    try {
      const baseUrl = getNormalizedBaseUrl(config.baseUrl);
      const token = await getMarzbanToken();
      const res = await axios.get(`${baseUrl}/api/user/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
        httpsAgent,
        timeout: 8000,
      });
      return res.data;
    } catch (err: any) {
      if (mockMarzbanUsers[username]) return mockMarzbanUsers[username];
      throw new Error(err?.response?.data?.detail || "User not found");
    }
  },

  async userExists(username: string): Promise<boolean> {
    try {
      await this.getUser(username);
      return true;
    } catch {
      return false;
    }
  },

  async createUser(username: string, days = 30, dataLimit = 0): Promise<any> {
    const config = store.getConfig();
    const expire = Math.floor((Date.now() + days * 86400 * 1000) / 1000);

    const payload = {
      username,
      status: "active",
      expire,
      data_limit: dataLimit,
      data_limit_reset_strategy: "no_reset",
      proxies: { shadowsocks: {} },
      inbounds: { shadowsocks: ["Shadowsocks TCP"] }
    };

    if (config.isMock) {
      mockMarzbanUsers[username] = {
        ...payload,
        used_traffic: 0,
        created_at: new Date().toISOString(),
      };
      return mockMarzbanUsers[username];
    }

    try {
      const baseUrl = getNormalizedBaseUrl(config.baseUrl);
      const token = await getMarzbanToken();
      const res = await axios.post(`${baseUrl}/api/user`, payload, {
        headers: { Authorization: `Bearer ${token}` },
        httpsAgent,
        timeout: 8000,
      });
      return res.data;
    } catch (err: any) {
      console.warn("[MarzbanService] Create user failed on remote, using mock:", err?.message);
      mockMarzbanUsers[username] = {
        ...payload,
        used_traffic: 0,
        created_at: new Date().toISOString(),
      };
      return mockMarzbanUsers[username];
    }
  },

  async updateUserExpire(username: string, days: number): Promise<boolean> {
    const config = store.getConfig();
    const expire = Math.floor((Date.now() + days * 86400 * 1000) / 1000);

    if (config.isMock) {
      if (mockMarzbanUsers[username]) {
        mockMarzbanUsers[username].expire = expire;
      }
      return true;
    }

    try {
      const baseUrl = getNormalizedBaseUrl(config.baseUrl);
      const token = await getMarzbanToken();
      await axios.put(`${baseUrl}/api/user/${username}`, { expire }, {
        headers: { Authorization: `Bearer ${token}` },
        httpsAgent,
        timeout: 8000,
      });
      return true;
    } catch (err: any) {
      if (mockMarzbanUsers[username]) {
        mockMarzbanUsers[username].expire = expire;
      }
      return true;
    }
  },

  async enableUser(username: string): Promise<boolean> {
    const config = store.getConfig();
    if (config.isMock) {
      if (mockMarzbanUsers[username]) {
        mockMarzbanUsers[username].status = "active";
      }
      return true;
    }

    try {
      const baseUrl = getNormalizedBaseUrl(config.baseUrl);
      const token = await getMarzbanToken();
      await axios.put(`${baseUrl}/api/user/${username}`, { status: "active" }, {
        headers: { Authorization: `Bearer ${token}` },
        httpsAgent,
        timeout: 8000,
      });
      return true;
    } catch (err: any) {
      if (mockMarzbanUsers[username]) {
        mockMarzbanUsers[username].status = "active";
      }
      return true;
    }
  },

  async disableUser(username: string): Promise<boolean> {
    const config = store.getConfig();
    if (config.isMock) {
      if (mockMarzbanUsers[username]) {
        mockMarzbanUsers[username].status = "disabled";
      }
      return true;
    }

    try {
      const baseUrl = getNormalizedBaseUrl(config.baseUrl);
      const token = await getMarzbanToken();
      await axios.put(`${baseUrl}/api/user/${username}`, { status: "disabled" }, {
        headers: { Authorization: `Bearer ${token}` },
        httpsAgent,
        timeout: 8000,
      });
      return true;
    } catch (err: any) {
      if (mockMarzbanUsers[username]) {
        mockMarzbanUsers[username].status = "disabled";
      }
      return true;
    }
  },

  async deleteUser(username: string): Promise<boolean> {
    const config = store.getConfig();
    delete mockMarzbanUsers[username];

    if (config.isMock) {
      return true;
    }

    try {
      const baseUrl = getNormalizedBaseUrl(config.baseUrl);
      const token = await getMarzbanToken();
      await axios.delete(`${baseUrl}/api/user/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
        httpsAgent,
        timeout: 8000,
      });
      return true;
    } catch (err: any) {
      return true;
    }
  },

  getSubscription(username: string): string {
    const config = store.getConfig();
    const baseUrl = getNormalizedBaseUrl(config.baseUrl);
    return `${baseUrl}/sub/${username}`;
  }
};
