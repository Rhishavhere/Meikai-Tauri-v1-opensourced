import { motion } from "framer-motion";
import { 
  Shield, 
  Download, 
  ChevronRight,
  ArrowLeft,
  LogOut,
  Edit3,
  Camera,
  Mail,
  Calendar,
  Bookmark,
  History,
  Star
} from "lucide-react";
import { Settings } from "../../hooks/useSettings";

interface ProfileProps {
  onBack: () => void;
  bookmarksCount: number;
  starredCount: number;
  settings: Settings;
}

// Profile data (can be extended with actual user data later)
interface ProfileData {
  name: string;
  email: string;
  avatar: string | null;
  joinDate: string;
  historyCount: number;
}

export default function Profile({ onBack, bookmarksCount, starredCount, settings }: ProfileProps) {
  // Mock profile data
  const profileData: ProfileData = {
    name: "Beta User",
    email: "user@meikai.app",
    avatar: null,
    joinDate: "December 2024",
    historyCount: 0
  };

  return (
    <motion.div
      key="profile"
      initial={settings.animationsEnabled ? { opacity: 0, x: 20 } : false}
      animate={{ opacity: 1, x: 0 }}
      exit={settings.animationsEnabled ? { opacity: 0, x: -20 } : undefined}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full h-full flex flex-col overflow-hidden bg-[var(--color-bg-secondary)]"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]">
        <motion.button
          whileHover={settings.animationsEnabled ? { scale: 1.05 } : undefined}
          whileTap={settings.animationsEnabled ? { scale: 0.95 } : undefined}
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-secondary)]/80 text-[var(--color-text-secondary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </motion.button>
        <h2 className="font-poppins font-semibold text-[var(--color-text-primary)]">Profile</h2>
      </div>

      {/* Profile Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Avatar & Info Card */}
        <motion.div
          initial={settings.animationsEnabled ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[var(--color-accent)]/10 to-rose-100/50 dark:to-rose-900/20 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-accent)] to-rose-400 flex items-center justify-center text-white text-2xl font-poppins font-bold shadow-lg shadow-[var(--color-accent)]/20">
                {profileData.name.charAt(0).toUpperCase()}
              </div>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--color-bg-primary)] shadow-md flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-all">
                <Camera className="w-3 h-3" />
              </button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-poppins font-semibold text-[var(--color-text-primary)] text-lg">{profileData.name}</h3>
                <button className="p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors">
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>
              <p className="font-poppins text-sm text-[var(--color-text-secondary)] flex items-center gap-1 mt-0.5">
                <Mail className="w-3 h-3" /> {profileData.email}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={settings.animationsEnabled ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          <div className="bg-[var(--color-bg-primary)] rounded-xl p-4 border border-[var(--color-border)] text-center">
            <Bookmark className="w-5 h-5 text-[var(--color-accent)] mx-auto mb-2" />
            <p className="font-poppins font-semibold text-[var(--color-text-primary)]">{bookmarksCount}</p>
            <p className="font-poppins text-xs text-[var(--color-text-secondary)]">Bookmarks</p>
          </div>
          <div className="bg-[var(--color-bg-primary)] rounded-xl p-4 border border-[var(--color-border)] text-center">
            <History className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <p className="font-poppins font-semibold text-[var(--color-text-primary)]">{profileData.historyCount}</p>
            <p className="font-poppins text-xs text-[var(--color-text-secondary)]">History</p>
          </div>
          <div className="bg-[var(--color-bg-primary)] rounded-xl p-4 border border-[var(--color-border)] text-center">
            <Star className="w-5 h-5 text-amber-400 mx-auto mb-2" />
            <p className="font-poppins font-semibold text-[var(--color-text-primary)]">{starredCount}</p>
            <p className="font-poppins text-xs text-[var(--color-text-secondary)]">Quick Links</p>
          </div>
        </motion.div>

        {/* Profile Options */}
        <motion.div
          initial={settings.animationsEnabled ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <p className="text-xs font-poppins text-[var(--color-text-secondary)] uppercase tracking-wider mb-3 px-1">Account</p>
          
          <ProfileMenuItem 
            icon={<Calendar className="w-4 h-4" />}
            label="Member since"
            value={profileData.joinDate}
          />
          <ProfileMenuItem 
            icon={<Shield className="w-4 h-4" />}
            label="Privacy"
            chevron
          />
          <ProfileMenuItem 
            icon={<Download className="w-4 h-4" />}
            label="Export Data"
            chevron
          />
          <ProfileMenuItem 
            icon={<LogOut className="w-4 h-4" />}
            label="Sign Out"
            destructive
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

// Profile Menu Item Component
interface ProfileMenuItemProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  chevron?: boolean;
  destructive?: boolean;
}

function ProfileMenuItem({ icon, label, value, chevron, destructive }: ProfileMenuItemProps) {
  return (
    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] hover:shadow-sm transition-all group ${destructive ? 'hover:border-red-100 hover:bg-red-50' : ''}`}>
      <span className={`${destructive ? 'text-red-400 group-hover:text-red-500' : 'text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)]'} transition-colors`}>
        {icon}
      </span>
      <span className={`flex-1 text-left font-poppins text-sm ${destructive ? 'text-red-500' : 'text-[var(--color-text-primary)]'}`}>
        {label}
      </span>
      {value && (
        <span className="font-poppins text-xs text-[var(--color-text-secondary)]">{value}</span>
      )}
      {chevron && (
        <ChevronRight className="w-4 h-4 text-[var(--color-text-secondary)]/50 group-hover:text-[var(--color-text-secondary)] transition-colors" />
      )}
    </button>
  );
}
