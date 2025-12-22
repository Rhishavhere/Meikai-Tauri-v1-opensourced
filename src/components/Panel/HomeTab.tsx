import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { Search, Command } from "lucide-react";

interface HomeTabProps {
  onNavigate: (url: string) => void;
  onQuickLink: (url: string) => void;
}

export default function HomeTab({ onNavigate, onQuickLink }: HomeTabProps) {
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

  const quickLinks = [
    { name: "Google", url: "https://google.com", icon: "G" },
    { name: "YouTube", url: "https://youtube.com", icon: "Y" },
    { name: "GitHub", url: "https://github.com", icon: "GH" },
    { name: "Twitter", url: "https://twitter.com", icon: "X" },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-center items-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[var(--color-accent)] opacity-[0.03] blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-300 opacity-[0.03] blur-[80px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center w-full max-w-xl z-10"
      >
        {/* Brand */}
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className="font-tangerine text-[5rem] leading-[0.8] text-[var(--color-accent)] font-bold drop-shadow-sm">
            Meikai
          </h1>
          <p className="font-poppins text-[var(--color-text-secondary)] text-sm tracking-widest uppercase opacity-60 mt-2">
            Focus • Flow • Fluidity
          </p>
        </motion.div>

        {/* Search Capsule */}
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
                ? "0 20px 40px -10px rgba(238, 138, 147, 0.15)" 
                : "0 10px 30px -10px rgba(0,0,0,0.05)",
              scale: isFocused ? 1.02 : 1
            }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 w-full h-14 pl-6 pr-4 bg-[var(--color-bg-primary)] rounded-full border border-[var(--color-border)] group-hover:border-[var(--color-accent)]/30 transition-colors"
          >
            <Search className={`w-5 h-5 transition-colors ${isFocused ? 'text-[var(--color-accent)]' : 'text-gray-400'}`} />
            
            <input
              ref={inputRef}
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="flex-1 bg-transparent text-lg text-[var(--color-text-primary)] placeholder-gray-400 focus:outline-none font-poppins"
              placeholder="Search or enter URL..."
              autoFocus
            />
            
            <div className="flex items-center gap-2 pr-1">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]">
                <Command className="w-4 h-4 opacity-50" />
              </div>
            </div>
          </motion.div>
        </motion.form>

        {/* Quick Dock */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 flex items-center justify-center gap-6"
        >
            {quickLinks.map((site) => (
                <motion.button
                    key={site.name}
                    whileHover={{ y: -5, scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onQuickLink(site.url)}
                    className="flex flex-col items-center gap-2 group"
                >
                    <div className="w-14 h-14 rounded-2xl bg-[var(--color-bg-primary)] shadow-[var(--shadow-sm)] border border-[var(--color-border)] flex items-center justify-center group-hover:border-[var(--color-accent)]/50 group-hover:shadow-[var(--shadow-md)] transition-all duration-300">
                        <span className="font-poppins font-bold text-lg text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                            {site.icon}
                        </span>
                    </div>
                    <span className="text-xs font-poppins text-[var(--color-text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                        {site.name}
                    </span>
                </motion.button>
            ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
