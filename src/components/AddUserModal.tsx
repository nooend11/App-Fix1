import React, { useState } from "react";
import { X, UserPlus, Calendar, Smartphone } from "lucide-react";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { username: string; days: number; device_name?: string }) => Promise<void>;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [username, setUsername] = useState("");
  const [days, setDays] = useState(30);
  const [deviceName, setDeviceName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await onSubmit({
        username: username.trim(),
        days: Number(days) || 30,
        device_name: deviceName.trim() || undefined,
      });
      setUsername("");
      setDays(30);
      setDeviceName("");
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-100 font-bold text-lg">
            <UserPlus className="w-5 h-5 text-amber-500" />
            <span>Create New User & Device</span>
          </div>
          <button
            id="close-add-user-modal-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="new-user-username-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Username <span className="text-amber-500">*</span>
            </label>
            <input
              id="new-user-username-input"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. client_user_123"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label htmlFor="new-user-days-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Subscription Days
            </label>
            <div className="flex items-center space-x-2">
              <input
                id="new-user-days-input"
                type="number"
                min={1}
                max={3650}
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value, 10) || 30)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
              />
              <div className="flex space-x-1">
                {[30, 60, 90, 365].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDays(d)}
                    className={`px-2.5 py-2 text-xs font-semibold rounded-xl border transition ${
                      days === d
                        ? "bg-amber-500 text-slate-950 border-amber-500"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="new-user-device-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Device Name (Optional)
            </label>
            <input
              id="new-user-device-input"
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="e.g. Samsung Galaxy S23"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3">
            <button
              id="cancel-add-user-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              id="submit-add-user-btn"
              type="submit"
              disabled={loading || !username.trim()}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm rounded-xl transition shadow-md shadow-amber-500/10 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
