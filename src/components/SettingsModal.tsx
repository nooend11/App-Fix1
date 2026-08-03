import React, { useState } from "react";
import { X, Settings, Server, Check, Activity, ShieldCheck } from "lucide-react";
import { MarzbanConfig } from "../types";

interface SettingsModalProps {
  isOpen: boolean;
  config: MarzbanConfig;
  onClose: () => void;
  onSaveConfig: (newConfig: Partial<MarzbanConfig>) => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  config,
  onClose,
  onSaveConfig,
}) => {
  const [baseUrl, setBaseUrl] = useState(config.baseUrl || "");
  const [username, setUsername] = useState(config.username || "");
  const [password, setPassword] = useState("");
  const [isMock, setIsMock] = useState(config.isMock);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await onSaveConfig({
        baseUrl: baseUrl.trim(),
        username: username.trim(),
        ...(password ? { password: password.trim() } : {}),
        isMock,
      });
      setMessage("Configuration saved successfully!");
      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 1000);
    } catch (err: any) {
      setMessage("Error saving configuration: " + (err?.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-100 font-bold text-lg">
            <Settings className="w-5 h-5 text-amber-500" />
            <span>Marzban Service Configuration</span>
          </div>
          <button
            id="close-settings-modal-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {message && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs rounded-xl flex items-center space-x-2">
              <Check className="w-4 h-4" />
              <span>{message}</span>
            </div>
          )}

          {/* Mode Toggle */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-200">Operation Mode</p>
                <p className="text-xs text-slate-400">
                  Choose between local simulated mock mode or live Marzban panel.
                </p>
              </div>

              <button
                id="toggle-mock-mode-btn"
                type="button"
                onClick={() => setIsMock(!isMock)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isMock ? "bg-amber-500" : "bg-emerald-500"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-slate-950 transition-transform ${
                    isMock ? "translate-x-1" : "translate-x-6"
                  }`}
                />
              </button>
            </div>

            <div className="text-xs pt-1 text-slate-400">
              Current Mode:{" "}
              <strong className={isMock ? "text-amber-400" : "text-emerald-400"}>
                {isMock ? "Mock / Simulator Mode" : "Live Marzban Server"}
              </strong>
            </div>
          </div>

          <div>
            <label htmlFor="settings-baseurl-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Marzban Base URL (<code className="text-amber-400">MARZBAN_URL</code>)
            </label>
            <input
              id="settings-baseurl-input"
              type="text"
              required
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://your-marzban-panel.com"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="settings-username-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Admin Username
              </label>
              <input
                id="settings-username-input"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label htmlFor="settings-password-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Admin Password
              </label>
              <input
                id="settings-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3">
            <button
              id="cancel-settings-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              id="submit-settings-btn"
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm rounded-xl transition shadow-md shadow-amber-500/10 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
