import React, { useState, useEffect } from "react";
import { AdminInfo, DashboardStats as StatsType, Device, MarzbanConfig } from "./types";
import { Header } from "./components/Header";
import { DashboardStats } from "./components/DashboardStats";
import { UserTable } from "./components/UserTable";
import { AddUserModal } from "./components/AddUserModal";
import { ExtendUserModal } from "./components/ExtendUserModal";
import { MarzbanTester } from "./components/MarzbanTester";
import { ApiTester } from "./components/ApiTester";
import { SettingsModal } from "./components/SettingsModal";
import { LoginView } from "./components/LoginView";

export function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("marzban_token"));
  const [admin, setAdmin] = useState<AdminInfo | null>(() => {
    const stored = localStorage.getItem("marzban_admin");
    return stored ? JSON.parse(stored) : null;
  });

  const [activeTab, setActiveTab] = useState<"users" | "marzban" | "client-api" | "settings">("users");
  const [filter, setFilter] = useState<"all" | "active" | "expired" | "banned">("all");

  const [stats, setStats] = useState<StatsType | null>(null);
  const [users, setUsers] = useState<Device[]>([]);
  const [config, setConfig] = useState<MarzbanConfig>({
    baseUrl: "https://marzban.example.com",
    username: "admin",
    isMock: true,
  });

  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [extendTargetUser, setExtendTargetUser] = useState<Device | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Auto-login default session for easy evaluation if none exists
  useEffect(() => {
    if (!token) {
      const defaultAdmin = { id: 1, name: "System Administrator", username: "admin" };
      setToken("mock_jwt_token_123");
      setAdmin(defaultAdmin);
      localStorage.setItem("marzban_token", "mock_jwt_token_123");
      localStorage.setItem("marzban_admin", JSON.stringify(defaultAdmin));
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Dashboard Stats
      const statsRes = await fetch("/api/admin/dashboard");
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.data);
      }

      // 2. Users List
      const usersRes = await fetch("/api/admin/users");
      const usersData = await usersRes.json();
      if (usersData.success) {
        setUsers(usersData.users || []);
      }

      // 3. Marzban Config
      const configRes = await fetch("/api/admin/config");
      const configData = await configRes.json();
      if (configData.success) {
        setConfig(configData.config);
      }
    } catch (err) {
      console.error("[Dashboard Fetch Error]:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const handleLoginSuccess = (newToken: string, newAdmin: AdminInfo) => {
    setToken(newToken);
    setAdmin(newAdmin);
    localStorage.setItem("marzban_token", newToken);
    localStorage.setItem("marzban_admin", JSON.stringify(newAdmin));
  };

  const handleLogout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem("marzban_token");
    localStorage.removeItem("marzban_admin");
  };

  const handleAddUser = async (data: { username: string; days: number; device_name?: string }) => {
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.message || "Failed to create user");
    }
    fetchData();
  };

  const handleExtendUser = async (username: string, days: number) => {
    const res = await fetch(`/api/admin/extend/${username}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ days }),
    });
    const result = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.message || "Failed to extend subscription");
    }
    fetchData();
  };

  const handleBanUser = async (username: string) => {
    const res = await fetch(`/api/admin/ban/${username}`, { method: "POST" });
    if (res.ok) fetchData();
  };

  const handleUnbanUser = async (username: string) => {
    const res = await fetch(`/api/admin/unban/${username}`, { method: "POST" });
    if (res.ok) fetchData();
  };

  const handleResetDevice = async (username: string) => {
    if (!confirm(`Reset device ID for @${username}? This will allow a new device to bind.`)) return;
    const res = await fetch(`/api/admin/reset-device/${username}`, { method: "POST" });
    if (res.ok) fetchData();
  };

  const handleDeleteUser = async (username: string) => {
    if (!confirm(`Are you sure you want to delete user @${username}?`)) return;
    const res = await fetch(`/api/admin/delete/${username}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  const handleSaveConfig = async (newConfig: Partial<MarzbanConfig>) => {
    const res = await fetch("/api/admin/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newConfig),
    });
    const result = await res.json();
    if (result.success) {
      setConfig(result.config);
    }
  };

  if (!token) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header Bar */}
      <Header
        admin={admin}
        config={config}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab 1: Users & Devices Overview */}
        {activeTab === "users" && (
          <div>
            <DashboardStats
              stats={stats}
              loading={loading}
              filter={filter}
              setFilter={setFilter}
            />

            <UserTable
              users={users}
              loading={loading}
              filter={filter}
              setFilter={setFilter}
              onRefresh={fetchData}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onOpenExtendModal={(dev) => setExtendTargetUser(dev)}
              onBanUser={handleBanUser}
              onUnbanUser={handleUnbanUser}
              onResetDevice={handleResetDevice}
              onDeleteUser={handleDeleteUser}
            />
          </div>
        )}

        {/* Tab 2: Marzban Direct API Tester */}
        {activeTab === "marzban" && <MarzbanTester />}

        {/* Tab 3: Client Login Simulator */}
        {activeTab === "client-api" && <ApiTester />}
      </main>

      {/* Modals */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddUser}
      />

      <ExtendUserModal
        device={extendTargetUser}
        isOpen={Boolean(extendTargetUser)}
        onClose={() => setExtendTargetUser(null)}
        onSubmit={handleExtendUser}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        config={config}
        onClose={() => setIsSettingsModalOpen(false)}
        onSaveConfig={handleSaveConfig}
      />
    </div>
  );
}

export default App;
