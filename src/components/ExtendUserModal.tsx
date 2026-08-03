import React, { useState } from "react";
import { X, Calendar, Clock } from "lucide-react";
import { Device } from "../types";

interface ExtendUserModalProps {
  device: Device | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (username: string, days: number) => Promise<void>;
}

export const ExtendUserModal: React.FC<ExtendUserModalProps> = ({
  device,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !device) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(device.username, Number(days) || 30);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to extend subscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-100 font-bold text-lg">
            <Clock className="w-5 h-5 text-amber-500" />
            <span>Extend Subscription</span>
          </div>
          <button
            id="close-extend-modal-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Target Username</p>
              <p className="font-bold text-slate-100 text-sm">{device.username}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Current Expiration</p>
              <p className="text-xs font-mono text-amber-400">
                {device.expire_at ? new Date(device.expire_at).toLocaleDateString() : "Never"}
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="extend-days-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Days to Add
            </label>
            <input
              id="extend-days-input"
              type="number"
              min={1}
              max={3650}
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value, 10) || 30)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[7, 30, 60, 90].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={`py-2 text-xs font-semibold rounded-xl border transition ${
                  days === d
                    ? "bg-amber-500 text-slate-950 border-amber-500"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                +{d} Days
              </button>
            ))}
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3">
            <button
              id="cancel-extend-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              id="submit-extend-btn"
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm rounded-xl transition shadow-md shadow-amber-500/10 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Extend Subscription"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
