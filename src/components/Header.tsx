import React from "react";
import { Shield, Users, Server, Smartphone, Settings, LogOut, Activity } from "lucide-react";
import { AdminInfo, MarzbanConfig } from "../types";

interface HeaderProps {
  admin: AdminInfo | null;
  config: MarzbanConfig;
  activeTab: "users" | "marzban" | "client-api" | "settings";
  setActiveTab: (tab: "users" | "marzban" | "client-api" | "settings") => void;
  onLogout: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  admin,
  config,
  activeTab,
  setActiveTab,
  onLogout,
  onOpenSettings,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-100 text-lg tracking-tight">
                  Marzban
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Admin Panel
                </span>
              </div>
              <p className="text-xs text-slate-400">Device & VPN Manager</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              id="tab-users-btn"
              onClick={() => setActiveTab("users")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === "users"
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Users & Devices</span>
            </button>

            <button
              id="tab-marzban-btn"
              onClick={() => setActiveTab("marzban")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === "marzban"
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Server className="w-4 h-4" />
              <span>Marzban Direct API</span>
            </button>

            <button
              id="tab-client-api-btn"
              onClick={() => setActiveTab("client-api")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === "client-api"
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Client Login Simulator</span>
            </button>
          </nav>

          {/* Right Admin Controls */}
          <div className="flex items-center space-x-3">
            {/* Connection Status Badge */}
            <button
              id="open-settings-status-btn"
              onClick={onOpenSettings}
              className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                config.isMock
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{config.isMock ? "Mock Mode" : "Live Marzban"}</span>
            </button>

            {/* Settings */}
            <button
              id="header-settings-btn"
              onClick={onOpenSettings}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
              title="Marzban Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Admin Profile */}
            {admin && (
              <div className="hidden lg:flex items-center space-x-2 pl-2 border-l border-slate-800">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-300">
                  {admin.username[0]?.toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-200">{admin.name}</p>
                  <p className="text-[10px] text-slate-400">@{admin.username}</p>
                </div>
              </div>
            )}

            {/* Logout */}
            <button
              id="header-logout-btn"
              onClick={onLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Nav Tabs */}
        <div className="flex md:hidden items-center space-x-1 overflow-x-auto py-2 border-t border-slate-800/80">
          <button
            id="mobile-tab-users-btn"
            onClick={() => setActiveTab("users")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === "users"
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            Users & Devices
          </button>
          <button
            id="mobile-tab-marzban-btn"
            onClick={() => setActiveTab("marzban")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === "marzban"
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            Marzban Direct API
          </button>
          <button
            id="mobile-tab-client-api-btn"
            onClick={() => setActiveTab("client-api")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === "client-api"
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            Client Simulator
          </button>
        </div>
      </div>
    </header>
  );
};
