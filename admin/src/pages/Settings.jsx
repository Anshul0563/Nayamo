import { useState, useEffect } from "react";
import {
  Shield,
  Bell,
  Database,
  Palette,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function Settings() {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: true,
    autoRefresh: false,
    refreshInterval: 30,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem("adminSettings");
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  const saveSettings = () => {
    try {
      setLoading(true);
      localStorage.setItem("adminSettings", JSON.stringify(settings));
      setMessage({ type: "success", text: "Settings saved successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch {
      setMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const SettingRow = ({ icon: Icon, title, description, children }) => (
    <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-xl bg-white/5">
          <Icon size={20} className="text-zinc-400" />
        </div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-zinc-500">{description}</p>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );

  const Toggle = ({ checked, onChange }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full transition-colors relative ${
        checked ? "bg-indigo-600" : "bg-zinc-700"
      }`}
    >
      <div
        className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
          checked ? "translate-x-6" : "translate-x-0.5"
        }`}
      />
    </button>
  );

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6">
        <h1 className="text-2xl md:text-4xl font-bold">Settings</h1>
        <p className="text-zinc-400 mt-1">Configure your admin panel preferences.</p>
      </div>

      {/* Alert */}
      {message.text && (
        <div
          className={`rounded-2xl px-4 py-3 border flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      {/* Settings */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-2">
        <h2 className="text-lg font-semibold mb-4">General</h2>

        <SettingRow
          icon={Bell}
          title="Notifications"
          description="Receive alerts for new orders and updates"
        >
          <Toggle checked={settings.notifications} onChange={(v) => updateSetting("notifications", v)} />
        </SettingRow>

        <SettingRow
          icon={Palette}
          title="Dark Mode"
          description="Use dark theme for the admin panel"
        >
          <Toggle checked={settings.darkMode} onChange={(v) => updateSetting("darkMode", v)} />
        </SettingRow>

        <SettingRow
          icon={Database}
          title="Auto Refresh"
          description="Automatically refresh dashboard data"
        >
          <Toggle checked={settings.autoRefresh} onChange={(v) => updateSetting("autoRefresh", v)} />
        </SettingRow>

        {settings.autoRefresh && (
          <div className="flex items-center justify-between py-4 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-white/5">
                <Database size={20} className="text-zinc-400" />
              </div>
              <div>
                <h3 className="font-medium">Refresh Interval</h3>
                <p className="text-sm text-zinc-500">How often to refresh data (seconds)</p>
              </div>
            </div>
            <input
              type="number"
              min={10}
              max={300}
              value={settings.refreshInterval}
              onChange={(e) => updateSetting("refreshInterval", Number(e.target.value))}
              className="w-20 px-3 py-2 rounded-xl bg-black/30 border border-white/10 outline-none text-center"
            />
          </div>
        )}
      </div>

      {/* Security */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-2">
        <h2 className="text-lg font-semibold mb-4">Security</h2>

        <SettingRow
          icon={Shield}
          title="Session Info"
          description="Your current session details"
        >
          <div className="text-right text-sm text-zinc-400">
            <p>Role: Administrator</p>
            <p className="text-xs">Token expires in 15 minutes</p>
          </div>
        </SettingRow>
      </div>

      {/* Save */}
      <button
        onClick={saveSettings}
        disabled={loading}
        className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition"
      >
        {loading ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <Save size={18} />
        )}
        {loading ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}

