import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { 
  Search, 
  Globe, 
  User, 
  Settings
} from "lucide-react";
import { Bookmark } from "../../hooks/useBookmarks";

interface HomeTabProps {
  onNavigate: (url: string) => void;
  onQuickLink: (url: string) => void;
  starredBookmarks: Bookmark[];
  onOpenProfile: () => void;
  onOpenSettings: () => void;
}

export default function HomeTab({ 
  onNavigate, 
  onQuickLink, 
  starredBookmarks,
  onOpenProfile,
  onOpenSettings 
}: HomeTabProps) {
  const [url, setUrl] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;

    let fullUrl = trimmedUrl;

    const isUrl =
      (fullUrl.includes(".") && !fullUrl.includes(" ")) ||
      fullUrl.startsWith("http://") ||
      fullUrl.startsWith("https://");

    if (isUrl) {
      if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
        fullUrl = "https://" + fullUrl;
      }
    } else {
      fullUrl = `https://www.google.com/search?q=${encodeURIComponent(fullUrl)}`;
    }

    onNavigate(fullUrl);
  };

  // Get favicon URL for a bookmark
  const getFaviconUrl = (bookmarkUrl: string) => {
    try {
      const domain = new URL(bookmarkUrl.startsWith("http") ? bookmarkUrl : `https://${bookmarkUrl}`).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return null;
    }
  };

  return (
    <motion.div
      key="home"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full h-full flex flex-col justify-center items-center relative overflow-hidden bg-[#fafbfc]"
    >
      {/* Subtle Background Gradients */}
      <div className="absolute top-[-15%] right-[-5%] w-[400px] h-[400px] bg-gradient-to-br from-rose-200/30 to-pink-200/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] bg-gradient-to-tr from-blue-100/30 to-indigo-100/20 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute top-[30%] left-[50%] w-[200px] h-[200px] bg-gradient-to-br from-amber-100/20 to-orange-100/10 blur-[60px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center w-full max-w-xl z-10 px-6"
      >
        {/* Brand */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className="font-tangerine text-[4.5rem] leading-[0.9] text-[var(--color-accent)] font-bold">
            Meikai
          </h1>
          <p className="font-poppins text-[var(--color-text-secondary)] text-xs tracking-[0.3em] uppercase opacity-60 mt-3">
            Focus • Flow • Fluidity
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.form
          onSubmit={handleSubmit}
          className="w-full relative group z-20"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            animate={{
              boxShadow: isFocused 
                ? "0 8px 32px -8px rgba(238, 138, 147, 0.25), 0 0 0 1px rgba(238, 138, 147, 0.1)" 
                : "0 4px 20px -6px rgba(0,0,0,0.08)",
              scale: isFocused ? 1.01 : 1
            }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-3 w-full h-12 pl-5 pr-3 bg-white rounded-2xl border border-gray-200/80 group-hover:border-[var(--color-accent)]/30 transition-all duration-300"
          >
            <Search className={`w-4 h-4 transition-colors duration-200 ${isFocused ? 'text-[var(--color-accent)]' : 'text-gray-400'}`} />
            
            <input
              ref={inputRef}
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="flex-1 bg-transparent text-sm text-[var(--color-text-primary)] placeholder-gray-400 focus:outline-none font-poppins"
              placeholder="Search the web or enter URL..."
              autoFocus
            />
            
            <div className="flex items-center gap-1">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenProfile}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-[var(--color-accent)] transition-all duration-200"
              >
                <User className="w-4 h-4" />
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenSettings}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-[var(--color-accent)] transition-all duration-200"
              >
                <Settings className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </motion.form>

        {/* Quick Links */}
        {starredBookmarks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-10 w-full"
          >
            <p className="text-xs font-poppins text-gray-400 uppercase tracking-wider mb-4 text-center">Quick Links</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {starredBookmarks.slice(0, 6).map((bookmark, index) => (
                <motion.button
                  key={bookmark.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onQuickLink(bookmark.url)}
                  className="group flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-100 hover:border-[var(--color-accent)]/30 hover:shadow-md transition-all duration-300"
                >
                  <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
                    {getFaviconUrl(bookmark.url) ? (
                      <img 
                        src={getFaviconUrl(bookmark.url)!} 
                        alt="" 
                        className="w-4 h-4" 
                        onError={(e) => { 
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }} 
                      />
                    ) : null}
                    <Globe className={`w-3 h-3 text-gray-400 ${getFaviconUrl(bookmark.url) ? 'hidden' : ''}`} />
                  </div>
                  <span className="text-xs font-poppins text-gray-600 group-hover:text-gray-800 max-w-[80px] truncate transition-colors">
                    {bookmark.name}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State for Quick Links */}
        {starredBookmarks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 text-center"
          >
            <p className="text-sm font-poppins text-gray-400">
              Star bookmarks to see them here
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
