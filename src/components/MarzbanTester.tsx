import React, { useState } from "react";
import { Server, Play, UserPlus, Search, Trash2, Code2, Terminal, CheckCircle2, AlertTriangle } from "lucide-react";

export const MarzbanTester: React.FC = () => {
  const [testUsername, setTestUsername] = useState("test_user_alpha");
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<any>(null);
  const [lastEndpoint, setLastEndpoint] = useState<string | null>(null);

  const runTest = async (endpoint: string, method: string = "GET") => {
    setLoading(true);
    setLastEndpoint(`${method} ${endpoint}`);
    try {
      const res = await fetch(endpoint, { method });
      const data = await res.json();
      setOutput({ status: res.status, ok: res.ok, data });
    } catch (err: any) {
      setOutput({ status: 500, ok: false, error: err?.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Info Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-start space-x-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Marzban Direct API Tester</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Execute test requests directly against the Marzban API service routes configured in Laravel/Node routes.
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <button
            id="test-get-users-btn"
            onClick={() => runTest("/marzban-test")}
            disabled={loading}
            className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-emerald-400">GET</span>
              <Play className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition" />
            </div>
            <p className="text-sm font-semibold text-slate-200 mt-1">/marzban-test</p>
            <p className="text-[11px] text-slate-400">Fetch all Marzban users</p>
          </button>

          <button
            id="test-create-user-btn"
            onClick={() => runTest(`/create-user/${testUsername}`)}
            disabled={loading || !testUsername}
            className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-blue-400">GET</span>
              <UserPlus className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition" />
            </div>
            <p className="text-sm font-semibold text-slate-200 mt-1">/create-user/:username</p>
            <p className="text-[11px] text-slate-400">Create new user in Marzban</p>
          </button>

          <button
            id="test-get-user-btn"
            onClick={() => runTest(`/user/${testUsername}`)}
            disabled={loading || !testUsername}
            className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-emerald-400">GET</span>
              <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition" />
            </div>
            <p className="text-sm font-semibold text-slate-200 mt-1">/user/:username</p>
            <p className="text-[11px] text-slate-400">Get specific user info</p>
          </button>

          <button
            id="test-delete-user-btn"
            onClick={() => runTest(`/user/${testUsername}`, "DELETE")}
            disabled={loading || !testUsername}
            className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-red-400">DELETE</span>
              <Trash2 className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-400 transition" />
            </div>
            <p className="text-sm font-semibold text-slate-200 mt-1">/user/:username</p>
            <p className="text-[11px] text-slate-400">Delete user from Marzban</p>
          </button>
        </div>
      </div>

      {/* Target Username Input */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center space-x-4">
        <div className="flex-1">
          <label htmlFor="marzban-test-username-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Test Username Target
          </label>
          <input
            id="marzban-test-username-input"
            type="text"
            value={testUsername}
            onChange={(e) => setTestUsername(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
            placeholder="test_user_alpha"
          />
        </div>
      </div>

      {/* JSON Response Console */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
            <Terminal className="w-4 h-4 text-amber-500" />
            <span>Response Console</span>
            {lastEndpoint && (
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                {lastEndpoint}
              </span>
            )}
          </div>

          {output && (
            <span
              className={`text-xs px-2.5 py-0.5 rounded font-mono font-semibold ${
                output.ok ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
              }`}
            >
              Status: {output.status || 500}
            </span>
          )}
        </div>

        <div className="p-4 font-mono text-xs text-slate-300 bg-slate-950 overflow-x-auto min-h-[220px]">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-slate-500">
              <Play className="w-5 h-5 animate-spin text-amber-500 mr-2" />
              <span>Sending API request...</span>
            </div>
          ) : output ? (
            <pre className="text-amber-300/90 leading-relaxed">
              {JSON.stringify(output.data || output, null, 2)}
            </pre>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500">
              <Code2 className="w-8 h-8 mb-2 opacity-50" />
              <span>Click any test button above to run request</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
