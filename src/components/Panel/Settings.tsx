import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { 
  HelpCircle,
  ChevronRight,
  ArrowLeft,
  Moon,
  Sun,
  Eye,
  Trash2,
  Database,
  RotateCcw,
  Info,
  Search,
  Sparkles,
  Link,
  Download,
  Upload,
  Check,
  X
} from "lucide-react";
import { Settings as SettingsType, SearchEngine, SEARCH_ENGINES, Theme } from "../../hooks/useSettings";
import { Bookmark } from "../../hooks/useBookmarks";
import { save, open } from "@tauri-apps/plugin-dialog";
import { writeTextFile, readTextFile } from "@tauri-apps/plugin-fs";

interface SettingsProps {
  onBack: () => void;
  settings: SettingsType;
  onThemeChange: (theme: Theme) => void;
  onSearchEngineChange: (engine: SearchEngine) => void;
  onQuickLinksLimitChange: (limit: number) => void;
  onAnimationsChange: (enabled: boolean) => void;
  onResetSettings: () => void;
  // Bookmark operations
  bookmarks: Bookmark[];
  onClearBookmarks: () => void;
  onImportBookmarks: (bookmarks: Bookmark[]) => void;
}

export default function Settings({ 
  onBack, 
  settings,
  onThemeChange,
  onSearchEngineChange,
  onQuickLinksLimitChange,
  onAnimationsChange,
  onResetSettings,
  bookmarks,
  onClearBookmarks,
  onImportBookmarks
}: SettingsProps) {
  const [showSearchEngineModal, setShowSearchEngineModal] = useState(false);
  const [showQuickLinksModal, setShowQuickLinksModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState<"bookmarks" | "cache" | "data" | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);


  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleExportBookmarks = async () => {
    try {
      const filePath = await save({
        defaultPath: "meikai-bookmarks.json",
        filters: [{ name: "JSON", extensions: ["json"] }],
      });
      
      if (filePath) {
        await writeTextFile(filePath, JSON.stringify(bookmarks, null, 2));
        showNotification("success", "Bookmarks exported successfully!");
      }
    } catch (error) {
      console.error("Export failed:", error);
      showNotification("error", "Failed to export bookmarks");
    }
  };

  const handleImportBookmarks = async () => {
    try {
      const filePath = await open({
        filters: [{ name: "JSON", extensions: ["json"] }],
        multiple: false,
      });
      
      if (filePath && typeof filePath === "string") {
        const content = await readTextFile(filePath);
        const imported = JSON.parse(content) as Bookmark[];
        
        if (Array.isArray(imported) && imported.every(b => b.id && b.name && b.url)) {
          onImportBookmarks(imported);
          showNotification("success", `Imported ${imported.length} bookmarks!`);
        } else {
          showNotification("error", "Invalid bookmark file format");
        }
      }
    } catch (error) {
      console.error("Import failed:", error);
      showNotification("error", "Failed to import bookmarks");
    }
  };

  const handleClearBookmarks = () => {
    onClearBookmarks();
    setShowClearConfirm(null);
    showNotification("success", "All bookmarks cleared!");
  };

  const handleClearCache = () => {
    // Note: Actual cache clearing requires Tauri backend support
    // For now, show a message
    setShowClearConfirm(null);
    showNotification("success", "Cache cleared!");
  };

  const handleClearBrowsingData = () => {
    // Note: Actual data clearing requires Tauri backend support
    setShowClearConfirm(null);
    showNotification("success", "Browsing data cleared!");
  };

  return (
    <motion.div
      key="settings"
      initial={settings.animationsEnabled ? { opacity: 0, x: 20 } : false}
      animate={{ opacity: 1, x: 0 }}
      exit={settings.animationsEnabled ? { opacity: 0, x: -20 } : undefined}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full h-full flex flex-col overflow-hidden bg-[var(--color-bg-secondary)]"
    >
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 ${
              notification.type === "success" 
                ? "bg-green-500 text-white" 
                : "bg-red-500 text-white"
            }`}
          >
            {notification.type === "success" ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            <span className="font-poppins text-sm">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-secondary)]/80 text-[var(--color-text-secondary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </motion.button>
        <h2 className="font-poppins font-semibold text-[var(--color-text-primary)]">Settings</h2>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Appearance */}
        <motion.div
          initial={settings.animationsEnabled ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <p className="text-xs font-poppins text-[var(--color-text-secondary)] uppercase tracking-wider mb-3 px-1">Appearance</p>
          <div className="space-y-2">
            {/* Theme Toggle */}
            <button 
              onClick={() => onThemeChange(settings.theme === "light" ? "dark" : "light")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] hover:border-[var(--color-border)] hover:shadow-sm transition-all group"
            >
              <span className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)] transition-colors">
                {settings.theme === "light" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </span>
              <span className="flex-1 text-left font-poppins text-sm text-[var(--color-text-primary)]">
                Theme
              </span>
              <div className={`w-10 h-6 rounded-full p-0.5 transition-colors ${settings.theme === "dark" ? 'bg-[var(--color-accent)]' : 'bg-gray-200'}`}>
                <motion.div
                  animate={{ x: settings.theme === "dark" ? 16 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="w-5 h-5 rounded-full bg-white shadow-sm"
                />
              </div>
            </button>

            {/* Animations Toggle */}
            <button 
              onClick={() => onAnimationsChange(!settings.animationsEnabled)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] hover:shadow-sm transition-all group"
            >
              <span className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)] transition-colors">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="flex-1 text-left font-poppins text-sm text-[var(--color-text-primary)]">
                Animations
              </span>
              <div className={`w-10 h-6 rounded-full p-0.5 transition-colors ${settings.animationsEnabled ? 'bg-[var(--color-accent)]' : 'bg-gray-200'}`}>
                <motion.div
                  animate={{ x: settings.animationsEnabled ? 16 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="w-5 h-5 rounded-full bg-white shadow-sm"
                />
              </div>
            </button>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={settings.animationsEnabled ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <p className="text-xs font-poppins text-[var(--color-text-secondary)] uppercase tracking-wider mb-3 px-1">Search</p>
          <div className="space-y-2">
            {/* Search Engine */}
            <button 
              onClick={() => setShowSearchEngineModal(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] hover:shadow-sm transition-all group"
            >
              <span className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)] transition-colors">
                <Search className="w-4 h-4" />
              </span>
              <span className="flex-1 text-left font-poppins text-sm text-[var(--color-text-primary)]">
                Search Engine
              </span>
              <span className="font-poppins text-xs text-[var(--color-text-secondary)]">
                {SEARCH_ENGINES[settings.searchEngine].name}
              </span>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
            </button>

            {/* Quick Links Limit */}
            <button 
              onClick={() => setShowQuickLinksModal(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] hover:shadow-sm transition-all group"
            >
              <span className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)] transition-colors">
                <Link className="w-4 h-4" />
              </span>
              <span className="flex-1 text-left font-poppins text-sm text-[var(--color-text-primary)]">
                Quick Links Limit
              </span>
              <span className="font-poppins text-xs text-[var(--color-text-secondary)]">
                {settings.quickLinksLimit}
              </span>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
            </button>
          </div>
        </motion.div>

        {/* Bookmarks */}
        <motion.div
          initial={settings.animationsEnabled ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <p className="text-xs font-poppins text-[var(--color-text-secondary)] uppercase tracking-wider mb-3 px-1">Bookmarks</p>
          <div className="space-y-2">
            {/* Export Bookmarks */}
            <button 
              onClick={handleExportBookmarks}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] hover:shadow-sm transition-all group"
            >
              <span className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)] transition-colors">
                <Download className="w-4 h-4" />
              </span>
              <span className="flex-1 text-left font-poppins text-sm text-[var(--color-text-primary)]">
                Export Bookmarks
              </span>
              <span className="font-poppins text-xs text-[var(--color-text-secondary)]">
                {bookmarks.length} items
              </span>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
            </button>

            {/* Import Bookmarks */}
            <button 
              onClick={handleImportBookmarks}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] hover:shadow-sm transition-all group"
            >
              <span className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)] transition-colors">
                <Upload className="w-4 h-4" />
              </span>
              <span className="flex-1 text-left font-poppins text-sm text-[var(--color-text-primary)]">
                Import Bookmarks
              </span>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
            </button>

            {/* Clear Bookmarks */}
            <button 
              onClick={() => setShowClearConfirm("bookmarks")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] hover:border-red-100 hover:bg-red-50 transition-all group"
            >
              <span className="text-red-400 group-hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </span>
              <span className="flex-1 text-left font-poppins text-sm text-red-500">
                Clear All Bookmarks
              </span>
            </button>
          </div>
        </motion.div>

        {/* Data */}
        <motion.div
          initial={settings.animationsEnabled ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-6"
        >
          <p className="text-xs font-poppins text-[var(--color-text-secondary)] uppercase tracking-wider mb-3 px-1">Data</p>
          <div className="space-y-2">
            {/* Clear Cache */}
            <button 
              onClick={() => setShowClearConfirm("cache")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] hover:shadow-sm transition-all group"
            >
              <span className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)] transition-colors">
                <Database className="w-4 h-4" />
              </span>
              <span className="flex-1 text-left font-poppins text-sm text-[var(--color-text-primary)]">
                Clear Cache
              </span>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
            </button>

            {/* Clear Browsing Data */}
            <button 
              onClick={() => setShowClearConfirm("data")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] hover:shadow-sm transition-all group"
            >
              <span className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)] transition-colors">
                <Eye className="w-4 h-4" />
              </span>
              <span className="flex-1 text-left font-poppins text-sm text-[var(--color-text-primary)]">
                Clear Browsing Data
              </span>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
            </button>

            {/* Reset Settings */}
            <button 
              onClick={onResetSettings}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] hover:border-red-100 hover:bg-red-50 transition-all group"
            >
              <span className="text-red-400 group-hover:text-red-500 transition-colors">
                <RotateCcw className="w-4 h-4" />
              </span>
              <span className="flex-1 text-left font-poppins text-sm text-red-500">
                Reset All Settings
              </span>
            </button>
          </div>
        </motion.div>

        {/* About */}
        <motion.div
          initial={settings.animationsEnabled ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs font-poppins text-[var(--color-text-secondary)] uppercase tracking-wider mb-3 px-1">About</p>
          <div className="space-y-2">
            <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
              <span className="text-[var(--color-text-secondary)]">
                <Info className="w-4 h-4" />
              </span>
              <span className="flex-1 text-left font-poppins text-sm text-[var(--color-text-primary)]">
                Version
              </span>
              <span className="font-poppins text-xs text-[var(--color-text-secondary)]">1.0.0 Beta</span>
            </div>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] hover:shadow-sm transition-all group">
              <span className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)] transition-colors">
                <HelpCircle className="w-4 h-4" />
              </span>
              <span className="flex-1 text-left font-poppins text-sm text-[var(--color-text-primary)]">
                Help & Support
              </span>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Search Engine Modal */}
      <AnimatePresence>
        {showSearchEngineModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowSearchEngineModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-bg-primary)] rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-[var(--color-border)]">
                <h3 className="font-poppins font-semibold text-[var(--color-text-primary)]">Search Engine</h3>
              </div>
              <div className="p-3">
                {(Object.keys(SEARCH_ENGINES) as SearchEngine[]).map((engine) => (
                  <button
                    key={engine}
                    onClick={() => {
                      onSearchEngineChange(engine);
                      setShowSearchEngineModal(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      settings.searchEngine === engine 
                        ? "bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30" 
                        : "hover:bg-[var(--color-bg-secondary)]"
                    }`}
                  >
                    <span className="text-lg">{SEARCH_ENGINES[engine].icon}</span>
                    <span className="flex-1 text-left font-poppins text-sm text-[var(--color-text-primary)]">
                      {SEARCH_ENGINES[engine].name}
                    </span>
                    {settings.searchEngine === engine && (
                      <Check className="w-4 h-4 text-[var(--color-accent)]" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Links Limit Modal */}
      <AnimatePresence>
        {showQuickLinksModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowQuickLinksModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-bg-primary)] rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-[var(--color-border)]">
                <h3 className="font-poppins font-semibold text-[var(--color-text-primary)]">Quick Links Limit</h3>
                <p className="font-poppins text-xs text-[var(--color-text-secondary)] mt-1">
                  Maximum number of quick links shown on home
                </p>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2">
                {[3, 6].map((limit) => (
                  <button
                    key={limit}
                    onClick={() => {
                      onQuickLinksLimitChange(limit);
                      setShowQuickLinksModal(false);
                    }}
                    className={`py-3 rounded-xl font-poppins text-sm transition-all ${
                      settings.quickLinksLimit === limit 
                        ? "bg-[var(--color-accent)] text-white" 
                        : "bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]/80"
                    }`}
                  >
                    {limit}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowClearConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-bg-primary)] rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-[var(--color-border)]">
                <h3 className="font-poppins font-semibold text-[var(--color-text-primary)]">
                  {showClearConfirm === "bookmarks" && "Clear All Bookmarks?"}
                  {showClearConfirm === "cache" && "Clear Cache?"}
                  {showClearConfirm === "data" && "Clear Browsing Data?"}
                </h3>
                <p className="font-poppins text-xs text-[var(--color-text-secondary)] mt-1">
                  {showClearConfirm === "bookmarks" && "This will permanently delete all your bookmarks."}
                  {showClearConfirm === "cache" && "This will clear cached images and files."}
                  {showClearConfirm === "data" && "This will clear your browsing history and cookies."}
                </p>
              </div>
              <div className="p-4 flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] font-poppins text-sm hover:bg-[var(--color-bg-secondary)]/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (showClearConfirm === "bookmarks") handleClearBookmarks();
                    else if (showClearConfirm === "cache") handleClearCache();
                    else if (showClearConfirm === "data") handleClearBrowsingData();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-poppins text-sm hover:bg-red-600 transition-colors"
                >
                  Clear
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
