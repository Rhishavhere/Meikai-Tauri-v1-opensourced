import { motion } from "framer-motion";
import {
  Settings,
  Moon,
  Sun,
  Monitor,
  Search,
  Shield,
  Bell,
  Download,
  Globe,
} from "lucide-react";
import { useState } from "react";

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
}

function SettingItem({ icon, title, description, children }: SettingItemProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl hover:bg-white/80 transition-colors">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-[#ee8a93]/10 rounded-lg text-[#ee8a93]">
          {icon}
        </div>
        <div>
          <h4 className="font-medium text-gray-800">{title}</h4>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`w-11 h-6 rounded-full transition-colors relative ${
        checked ? "bg-[#ee8a93]" : "bg-gray-300"
      }`}
    >
      <motion.div
        className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-md"
        animate={{ left: checked ? "22px" : "2px" }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

export default function SettingsTab() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [notifications, setNotifications] = useState(true);
  const [blockTrackers, setBlockTrackers] = useState(true);
  const [autoDownload, setAutoDownload] = useState(false);

  const themes = [
    { id: "light", icon: Sun, label: "Light" },
    { id: "dark", icon: Moon, label: "Dark" },
    { id: "system", icon: Monitor, label: "System" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-2xl px-8 h-full flex flex-col pt-8"
    >
      <div className="bg-white/50 backdrop-blur-xl rounded-2xl p-6 flex-1 shadow-sm border border-white/20 overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#ee8a93]/10 rounded-xl">
            <Settings className="w-6 h-6 text-[#ee8a93]" />
          </div>
          <h2 className="text-2xl font-merri text-gray-800">Settings</h2>
        </div>

        {/* Theme Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">
            Appearance
          </h3>
          <div className="flex gap-3">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id as typeof theme)}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  theme === t.id
                    ? "border-[#ee8a93] bg-[#ee8a93]/5"
                    : "border-transparent bg-white/60 hover:bg-white/80"
                }`}
              >
                <t.icon
                  className={`w-6 h-6 mx-auto mb-2 ${
                    theme === t.id ? "text-[#ee8a93]" : "text-gray-500"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    theme === t.id ? "text-[#ee8a93]" : "text-gray-600"
                  }`}
                >
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Settings List */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">
            Preferences
          </h3>

          <SettingItem
            icon={<Search className="w-5 h-5" />}
            title="Search Engine"
            description="Google"
          >
            <select className="bg-white/80 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-[#ee8a93]">
              <option>Google</option>
              <option>DuckDuckGo</option>
              <option>Bing</option>
            </select>
          </SettingItem>

          <SettingItem
            icon={<Globe className="w-5 h-5" />}
            title="Default Language"
            description="Browser language preference"
          >
            <select className="bg-white/80 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-[#ee8a93]">
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
          </SettingItem>

          <SettingItem
            icon={<Bell className="w-5 h-5" />}
            title="Notifications"
            description="Allow site notifications"
          >
            <Toggle checked={notifications} onChange={() => setNotifications(!notifications)} />
          </SettingItem>

          <SettingItem
            icon={<Shield className="w-5 h-5" />}
            title="Block Trackers"
            description="Enhanced privacy protection"
          >
            <Toggle checked={blockTrackers} onChange={() => setBlockTrackers(!blockTrackers)} />
          </SettingItem>

          <SettingItem
            icon={<Download className="w-5 h-5" />}
            title="Auto-download"
            description="Download files automatically"
          >
            <Toggle checked={autoDownload} onChange={() => setAutoDownload(!autoDownload)} />
          </SettingItem>
        </div>
      </div>
    </motion.div>
  );
}
