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
  Lock,
  Clock,
  Mail,
  ShoppingBag,
  RefreshCcw,
} from "lucide-react";
import { adminAPI } from "../services/api";

export default function Settings() {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: true,
    autoRefresh: false,
    refreshInterval: 30,
    orderAlerts: true,
    emailNotifications: true,
    autoLogoutTime: 60,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Load settings from API on mount, fallback to localStorage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getSettings();
        const apiSettings = res.data?.settings || res.data;
        if (apiSettings) {
          setSettings((prev) => ({ ...prev, ...apiSettings }));
          // Sync to localStorage as cache
          localStorage.setItem("adminSettings", JSON.stringify(apiSettings));
        }
      } catch (error) {
        console.error("Failed to load settings from API, falling back to localStorage");
        const saved = localStorage.getItem("adminSettings");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setSettings((prev) => ({ ...prev, ...parsed }));
          } catch {
            // ignore parse errors
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const saveSettings = async () => {
    try {
      setLoading(true);
      // Save to API
      await adminAPI.updateSettings(settings);
      // Save to localStorage as cache fallback
      localStorage.setItem("adminSettings", JSON.stringify(settings));
      setMessage({ type: "success", text: "Settings saved successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      // Fallback to localStorage only
      localStorage.setItem("adminSettings", JSON.stringify(settings));
      setMessage({ type: "error", text: error.response?.data?.message || "Saved locally. API sync failed." });
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setMessage({ type: "error", text: "All password fields are required" });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: "error", text: "New password must be at least 6 characters" });
      return;
    }

    try {
      setPasswordLoading(true);
      await adminAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setMessage({ type: "success", text: "Password changed successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to change password" });
    } finally {
      setPasswordLoading(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const SettingRow = ({ icon: Icon, title, description, children }) => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-b border-white/5 last:border-0 gap-3">
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-xl bg-white/5 shrink-0">
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
      className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
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
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold">Settings</h1>
          <p className="text-zinc-400 mt-1">Configure your admin panel preferences.</p>
        </div>
        <button
          onClick={saveSettings}
          disabled={loading}
          className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition shrink-0"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Save size={18} />
          )}
          {loading ? "Saving..." : "Save Settings"}
        </button>
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

      {/* General Settings */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-2">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Database size={20} className="text-zinc-400" /> General
        </h2>

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
          icon={RefreshCcw}
          title="Auto Refresh"
          description="Automatically refresh dashboard data"
        >
          <Toggle checked={settings.autoRefresh} onChange={(v) => updateSetting("autoRefresh", v)} />
        </SettingRow>

        {settings.autoRefresh && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-b border-white/5 gap-3">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-white/5 shrink-0">
                <Clock size={20} className="text-zinc-400" />
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
              className="w-20 px-3 py-2 rounded-xl bg-black/30 border border-white/10 outline-none text-center shrink-0"
            />
          </div>
        )}

        <SettingRow
          icon={ShoppingBag}
          title="Order Alerts"
          description="Get notified when new orders arrive"
        >
          <Toggle checked={settings.orderAlerts} onChange={(v) => updateSetting("orderAlerts", v)} />
        </SettingRow>

        <SettingRow
          icon={Mail}
          title="Email Notifications"
          description="Receive email summaries of daily activity"
        >
          <Toggle checked={settings.emailNotifications} onChange={(v) => updateSetting("emailNotifications", v)} />
        </SettingRow>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-b border-white/5 gap-3">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-white/5 shrink-0">
              <Clock size={20} className="text-zinc-400" />
            </div>
            <div>
              <h3 className="font-medium">Auto Logout</h3>
              <p className="text-sm text-zinc-500">Minutes of inactivity before logout</p>
            </div>
          </div>
          <input
            type="number"
            min={5}
            max={240}
            value={settings.autoLogoutTime}
            onChange={(e) => updateSetting("autoLogoutTime", Number(e.target.value))}
            className="w-20 px-3 py-2 rounded-xl bg-black/30 border border-white/10 outline-none text-center shrink-0"
          />
        </div>
      </div>

      {/* Password Change */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-2">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Lock size={20} className="text-zinc-400" /> Change Password
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400 block mb-2">Current Password</label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              className="w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-indigo-500"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400 block mb-2">New Password</label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              className="w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-indigo-500"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400 block mb-2">Confirm New Password</label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-indigo-500"
              placeholder="Confirm new password"
            />
          </div>

          <button
            onClick={changePassword}
            disabled={passwordLoading}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition"
          >
            {passwordLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Lock size={18} />
            )}
            {passwordLoading ? "Changing..." : "Change Password"}
          </button>
        </div>
      </div>

      {/* Security Info */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-2">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield size={20} className="text-zinc-400" /> Security
        </h2>

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
    </div>
  );
}
