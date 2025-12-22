import { motion } from "framer-motion";
import { useState } from "react";
import { 
  Bell, 
  Shield, 
  Palette, 
  HelpCircle,
  ChevronRight,
  ArrowLeft,
  Moon,
  Volume2,
  Eye,
  Lock,
  Trash2,
  Database,
  RotateCcw,
  Info
} from "lucide-react";

interface SettingsProps {
  onBack: () => void;
}

export default function Settings({ onBack }: SettingsProps) {
  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full h-full flex flex-col overflow-hidden bg-[#fafbfc]"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </motion.button>
        <h2 className="font-poppins font-semibold text-gray-800">Settings</h2>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <p className="text-xs font-poppins text-gray-400 uppercase tracking-wider mb-3 px-1">Appearance</p>
          <div className="space-y-2">
            <SettingsMenuItem 
              icon={<Palette className="w-4 h-4" />}
              label="Theme"
              value="Light"
              chevron
            />
            <SettingsMenuItem 
              icon={<Moon className="w-4 h-4" />}
              label="Dark Mode"
              toggle
            />
          </div>
        </motion.div>

        {/* Privacy & Security */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <p className="text-xs font-poppins text-gray-400 uppercase tracking-wider mb-3 px-1">Privacy & Security</p>
          <div className="space-y-2">
            <SettingsMenuItem 
              icon={<Shield className="w-4 h-4" />}
              label="Block Trackers"
              toggle
              defaultOn
            />
            <SettingsMenuItem 
              icon={<Eye className="w-4 h-4" />}
              label="Private Browsing"
              chevron
            />
            <SettingsMenuItem 
              icon={<Lock className="w-4 h-4" />}
              label="Site Permissions"
              chevron
            />
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <p className="text-xs font-poppins text-gray-400 uppercase tracking-wider mb-3 px-1">Notifications</p>
          <div className="space-y-2">
            <SettingsMenuItem 
              icon={<Bell className="w-4 h-4" />}
              label="Push Notifications"
              toggle
            />
            <SettingsMenuItem 
              icon={<Volume2 className="w-4 h-4" />}
              label="Sound"
              toggle
              defaultOn
            />
          </div>
        </motion.div>

        {/* Data */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-6"
        >
          <p className="text-xs font-poppins text-gray-400 uppercase tracking-wider mb-3 px-1">Data</p>
          <div className="space-y-2">
            <SettingsMenuItem 
              icon={<Database className="w-4 h-4" />}
              label="Clear Browsing Data"
              chevron
            />
            <SettingsMenuItem 
              icon={<Trash2 className="w-4 h-4" />}
              label="Clear Cache"
              chevron
            />
            <SettingsMenuItem 
              icon={<RotateCcw className="w-4 h-4" />}
              label="Reset Settings"
              destructive
            />
          </div>
        </motion.div>

        {/* About */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs font-poppins text-gray-400 uppercase tracking-wider mb-3 px-1">About</p>
          <div className="space-y-2">
            <SettingsMenuItem 
              icon={<Info className="w-4 h-4" />}
              label="Version"
              value="1.0.0"
            />
            <SettingsMenuItem 
              icon={<HelpCircle className="w-4 h-4" />}
              label="Help & Support"
              chevron
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Settings Menu Item Component
interface SettingsMenuItemProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  chevron?: boolean;
  toggle?: boolean;
  defaultOn?: boolean;
  destructive?: boolean;
}

function SettingsMenuItem({ icon, label, value, chevron, toggle, defaultOn, destructive }: SettingsMenuItemProps) {
  const [isOn, setIsOn] = useState(defaultOn || false);

  return (
    <button 
      onClick={() => toggle && setIsOn(!isOn)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group ${destructive ? 'hover:border-red-100 hover:bg-red-50' : ''}`}
    >
      <span className={`${destructive ? 'text-red-400 group-hover:text-red-500' : 'text-gray-400 group-hover:text-[var(--color-accent)]'} transition-colors`}>
        {icon}
      </span>
      <span className={`flex-1 text-left font-poppins text-sm ${destructive ? 'text-red-500' : 'text-gray-700'}`}>
        {label}
      </span>
      {value && (
        <span className="font-poppins text-xs text-gray-400">{value}</span>
      )}
      {toggle && (
        <div className={`w-10 h-6 rounded-full p-0.5 transition-colors ${isOn ? 'bg-[var(--color-accent)]' : 'bg-gray-200'}`}>
          <motion.div
            animate={{ x: isOn ? 16 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="w-5 h-5 rounded-full bg-white shadow-sm"
          />
        </div>
      )}
      {chevron && (
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
      )}
    </button>
  );
}
