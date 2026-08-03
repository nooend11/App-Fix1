import React, { useState } from "react";
import {
  Search,
  Plus,
  RefreshCw,
  Smartphone,
  Calendar,
  Clock,
  Ban,
  CheckCircle2,
  Trash2,
  RotateCcw,
  Copy,
  Check,
  MoreVertical,
  SlidersHorizontal,
  ExternalLink
} from "lucide-react";
import { Device } from "../types";

interface UserTableProps {
  users: Device[];
  loading: boolean;
  filter: "all" | "active" | "expired" | "banned";
  setFilter: (f: "all" | "active" | "expired" | "banned") => void;
  onRefresh: () => void;
  onOpenAddModal: () => void;
  onOpenExtendModal: (device: Device) => void;
  onBanUser: (username: string) => void;
  onUnbanUser: (username: string) => void;
  onResetDevice: (username: string) => void;
  onDeleteUser: (username: string) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  loading,
  filter,
  setFilter,
  onRefresh,
  onOpenAddModal,
  onOpenExtendModal,
  onBanUser,
  onUnbanUser,
  onResetDevice,
  onDeleteUser,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedUser, setCopiedUser] = useState<string | null>(null);

  // Filter users based on tab and search
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.device_name && user.device_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.device_id && user.device_id.toLowerCase().includes(searchTerm.toLowerCase()));

    const isExpired = user.expire_at ? new Date(user.expire_at).getTime() < Date.now() : false;

    if (!matchesSearch) return false;

    if (filter === "active") return user.active && !isExpired;
    if (filter === "expired") return isExpired;
    if (filter === "banned") return !user.active;

    return true;
  });

  const handleCopySubLink = (username: string) => {
    const subUrl = `${window.location.origin}/sub/${username}`;
    navigator.clipboard.writeText(subUrl);
    setCopiedUser(username);
    setTimeout(() => setCopiedUser(null), 2000);
  };

  const formatDate = (isoString: string | null) => {
    if (!isoString) return "Never";
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDaysRemaining = (isoString: string | null) => {
    if (!isoString) return null;
    const diff = new Date(isoString).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl shadow-slate-950/40 overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="user-table-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search username, device ID, or model..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Pills */}
          <div className="flex items-center bg-slate-950 p-1 border border-slate-800 rounded-xl">
            {(["all", "active", "expired", "banned"] as const).map((f) => (
              <button
                key={f}
                id={`filter-pill-${f}`}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider capitalize transition ${
                  filter === f
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            id="refresh-users-btn"
            onClick={onRefresh}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-slate-100 hover:border-slate-700 transition"
            title="Refresh Users"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            id="add-user-modal-btn"
            onClick={onOpenAddModal}
            className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm rounded-xl transition shadow-md shadow-amber-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>Create User</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-6">User & Status</th>
              <th className="py-3.5 px-6">Device Info</th>
              <th className="py-3.5 px-6">Expiration Date</th>
              <th className="py-3.5 px-6">Subscription Link</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  <div className="inline-flex items-center space-x-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-amber-500" />
                    <span>Loading device accounts...</span>
                  </div>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  <p className="text-base font-medium text-slate-400">No users found</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try adjusting search filter or create a new user.
                  </p>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const isExpired = user.expire_at ? new Date(user.expire_at).getTime() < Date.now() : false;
                const daysRemaining = getDaysRemaining(user.expire_at);

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-800/40 transition group"
                  >
                    {/* User & Status */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200">
                          {user.username[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-100 flex items-center space-x-2">
                            <span>{user.username}</span>
                            {!user.active && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/30">
                                Banned
                              </span>
                            )}
                            {user.active && isExpired && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                Expired
                              </span>
                            )}
                            {user.active && !isExpired && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                Active
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-400">ID #{user.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Device Info */}
                    <td className="py-4 px-6">
                      {user.device_id ? (
                        <div className="flex items-start space-x-2">
                          <Smartphone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-slate-200">
                              {user.device_name || "Bound Device"}
                            </p>
                            <p className="text-[11px] font-mono text-slate-400 truncate max-w-[150px]">
                              {user.device_id}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs italic text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800/80">
                          No device bound (Ready for login)
                        </span>
                      )}
                    </td>

                    {/* Expiration */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-slate-200">
                            {formatDate(user.expire_at)}
                          </p>
                          {daysRemaining !== null && (
                            <p
                              className={`text-[11px] ${
                                daysRemaining <= 0
                                  ? "text-red-400 font-semibold"
                                  : daysRemaining <= 5
                                  ? "text-orange-400"
                                  : "text-slate-400"
                              }`}
                            >
                              {daysRemaining <= 0
                                ? "Expired"
                                : `${daysRemaining} days left`}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Subscription Link */}
                    <td className="py-4 px-6">
                      <button
                        id={`copy-sub-${user.username}`}
                        onClick={() => handleCopySubLink(user.username)}
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-amber-400 transition"
                      >
                        {copiedUser === user.username ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span>/sub/{user.username}</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {/* Extend Days */}
                        <button
                          id={`extend-user-${user.username}`}
                          onClick={() => onOpenExtendModal(user)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 hover:text-amber-400 text-xs font-semibold text-slate-300 transition border border-slate-700/50"
                          title="Extend Subscription Days"
                        >
                          + Extend
                        </button>

                        {/* Reset Device */}
                        {user.device_id && (
                          <button
                            id={`reset-device-${user.username}`}
                            onClick={() => onResetDevice(user.username)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition"
                            title="Reset Device ID Lock"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}

                        {/* Ban / Unban */}
                        {user.active ? (
                          <button
                            id={`ban-user-${user.username}`}
                            onClick={() => onBanUser(user.username)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                            title="Ban User"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            id={`unban-user-${user.username}`}
                            onClick={() => onUnbanUser(user.username)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition"
                            title="Unban User"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          id={`delete-user-${user.username}`}
                          onClick={() => onDeleteUser(user.username)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
