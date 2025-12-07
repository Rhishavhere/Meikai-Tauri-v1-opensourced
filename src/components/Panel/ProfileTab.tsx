import { motion } from "framer-motion";
import { User, Mail, Cloud, LogOut, Edit3, Camera } from "lucide-react";

export default function ProfileTab() {
  // Sample profile data
  const profile = {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: null, // Placeholder for avatar
    syncStatus: "Synced",
    lastSync: "2 minutes ago",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-2xl px-8 h-full flex flex-col pt-8"
    >
      <div className="bg-white/50 backdrop-blur-xl rounded-2xl p-6 flex-1 shadow-sm border border-white/20 overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-[#ee8a93]/10 rounded-xl">
            <User className="w-6 h-6 text-[#ee8a93]" />
          </div>
          <h2 className="text-2xl font-merri text-gray-800">Profile</h2>
        </div>

        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ee8a93] to-[#FFB88C] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {profile.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors group-hover:scale-110">
              <Camera className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <h3 className="mt-4 text-xl font-semibold text-gray-800">
            {profile.name}
          </h3>
          <p className="text-gray-500 flex items-center gap-1">
            <Mail className="w-4 h-4" />
            {profile.email}
          </p>
        </div>

        {/* Sync Status */}
        <div className="bg-white/60 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Cloud className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Sync Status</h4>
                <p className="text-sm text-gray-500">Last synced {profile.lastSync}</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
              {profile.syncStatus}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">
            Account Actions
          </h3>

          <button className="w-full flex items-center gap-4 p-4 bg-white/60 rounded-xl hover:bg-white/80 transition-colors text-left">
            <div className="p-2 bg-[#ee8a93]/10 rounded-lg">
              <Edit3 className="w-5 h-5 text-[#ee8a93]" />
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Edit Profile</h4>
              <p className="text-sm text-gray-500">
                Update your name and photo
              </p>
            </div>
          </button>

          <button className="w-full flex items-center gap-4 p-4 bg-white/60 rounded-xl hover:bg-white/80 transition-colors text-left">
            <div className="p-2 bg-[#ee8a93]/10 rounded-lg">
              <Cloud className="w-5 h-5 text-[#ee8a93]" />
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Sync Settings</h4>
              <p className="text-sm text-gray-500">
                Manage what data syncs across devices
              </p>
            </div>
          </button>

          <button className="w-full flex items-center gap-4 p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors text-left group">
            <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200">
              <LogOut className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h4 className="font-medium text-red-600">Sign Out</h4>
              <p className="text-sm text-red-400">
                Sign out of your account
              </p>
            </div>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
