import React, { useState } from "react";
import { Smartphone, Send, CheckCircle2, AlertCircle, Copy, Check, Terminal, ShieldAlert } from "lucide-react";

export const ApiTester: React.FC = () => {
  const [username, setUsername] = useState("alex_vpn");
  const [deviceId, setDeviceId] = useState("android_9921_a");
  const [deviceName, setDeviceName] = useState("Samsung Galaxy S23");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleSimulateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          device_id: deviceId.trim(),
          device_name: deviceName.trim(),
        }),
      });

      const data = await res.json();
      setResponse({ status: res.status, ok: res.ok, data });
    } catch (err: any) {
      setResponse({ status: 500, ok: false, error: err?.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyConfig = (configText: string) => {
    navigator.clipboard.writeText(configText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-start space-x-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Android Client Login Simulator</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Simulate real Android VPN client authentication payloads (<code className="text-amber-400 font-mono text-xs">POST /api/login</code>).
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Controls */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-3">
            Request Payload Parameters
          </h3>

          <form onSubmit={handleSimulateLogin} className="space-y-4">
            <div>
              <label htmlFor="client-sim-username-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Username
              </label>
              <input
                id="client-sim-username-input"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500 font-mono"
                placeholder="alex_vpn"
              />
            </div>

            <div>
              <label htmlFor="client-sim-deviceid-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Device ID (UUID / Hardware ID)
              </label>
              <input
                id="client-sim-deviceid-input"
                type="text"
                required
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500 font-mono"
                placeholder="android_9921_a"
              />
            </div>

            <div>
              <label htmlFor="client-sim-devicename-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Device Name / Model
              </label>
              <input
                id="client-sim-devicename-input"
                type="text"
                required
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                placeholder="Samsung Galaxy S23"
              />
            </div>

            {/* Quick Test Presets */}
            <div className="pt-2">
              <span className="block text-[11px] font-semibold text-slate-400 mb-2">Test Presets:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUsername("alex_vpn");
                    setDeviceId("android_9921_a");
                    setDeviceName("Samsung Galaxy S23");
                  }}
                  className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 hover:border-amber-500/50"
                >
                  Allowed Device
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUsername("alex_vpn");
                    setDeviceId("wrong_device_xyz");
                    setDeviceName("Unknown Device");
                  }}
                  className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-red-400 hover:border-red-500/50"
                >
                  Mismatch Device (403)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUsername("john_doe");
                    setDeviceId("android_3310_c");
                    setDeviceName("Google Pixel 8");
                  }}
                  className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-orange-400 hover:border-orange-500/50"
                >
                  Disabled Account (403)
                </button>
              </div>
            </div>

            <button
              id="simulate-login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/10 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? "Sending..." : "Send POST /api/login"}</span>
            </button>
          </form>
        </div>

        {/* Console & Subscription Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
                <Terminal className="w-4 h-4 text-amber-500" />
                <span>API Response Output</span>
              </div>

              {response && (
                <span
                  className={`text-xs px-2.5 py-0.5 rounded font-mono font-semibold ${
                    response.ok
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  HTTP {response.status}
                </span>
              )}
            </div>

            <div className="p-4 font-mono text-xs text-slate-300 bg-slate-950 overflow-x-auto min-h-[220px]">
              {loading ? (
                <div className="flex items-center justify-center h-40 text-slate-500">
                  <Send className="w-5 h-5 animate-spin text-amber-500 mr-2" />
                  <span>Processing client login...</span>
                </div>
              ) : response ? (
                <pre className="text-emerald-400/90 leading-relaxed">
                  {JSON.stringify(response.data || response, null, 2)}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-slate-500">
                  <Smartphone className="w-8 h-8 mb-2 opacity-50" />
                  <span>Submit form to inspect JSON response</span>
                </div>
              )}
            </div>
          </div>

          {/* Subscription Link Card if successful */}
          {response?.ok && response?.data?.subscription && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Subscription Config Link Generated
                </p>
                <p className="text-sm font-mono text-slate-200 mt-0.5">
                  {response.data.subscription}
                </p>
              </div>
              <button
                id="copy-sim-sub-btn"
                onClick={() => handleCopyConfig(response.data.subscription)}
                className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-xl transition"
                title="Copy Link"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
