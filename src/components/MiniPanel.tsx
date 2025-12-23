import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search } from 'lucide-react';

interface MiniPanelProps {
  isVisible: boolean;
  onNavigate: (url: string) => void;
  onClose: () => void;
}

export function MiniPanel({ isVisible, onNavigate, onClose }: MiniPanelProps) {
  const [url, setUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const quickLinks = [
    { name: "Google", url: "https://google.com" },
    { name: "YouTube", url: "https://youtube.com" },
    { name: "GitHub", url: "https://github.com" },
    { name: "Twitter", url: "https://twitter.com" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;

    let fullUrl = trimmedUrl;

    const isUrl = fullUrl.includes('.') && !fullUrl.includes(' ') ||
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
    setUrl("");
  };

  const handleQuickLink = (siteUrl: string) => {
    onNavigate(siteUrl);
    setUrl("");
  };

  // Focus input when panel becomes visible
  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop overlay */}
          <div
            className="absolute inset-0 top-10 bg-transparent"
          />

          {/* Mini Panel */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 1, scale: 0.95, y: -30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 1, scale: 0.95, y: -10 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute top-14 left-1/2 -translate-x-1/2 z-50 w-[70%]"
          >
            <div className="bg-[var(--color-bg-primary)] backdrop-blur-xl rounded-2xl shadow-2xl border border-[var(--color-border)] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
                <span className="text-sm font-medium text-[var(--color-text-primary)] font-poppins">New Window</span>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-[var(--color-text-secondary)]" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Search Input */}
                <form onSubmit={handleSubmit} className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Search or enter URL"
                      className="w-full h-10 pl-10 pr-4 bg-[var(--color-bg-secondary)] rounded-xl text-sm text-[var(--color-text-primary)] border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all placeholder-[var(--color-text-secondary)] font-poppins"
                    />
                  </div>
                </form>

                {/* Quick Links */}
                <div className="grid grid-cols-4 gap-2">
                  {quickLinks.map((site) => (
                    <button
                      key={site.name}
                      onClick={() => handleQuickLink(site.url)}
                      className="p-2 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-secondary)]/80 rounded-xl transition-all hover:shadow-sm border border-transparent hover:border-[var(--color-accent)]/30"
                    >
                      <span className="text-xs font-poppins text-[var(--color-text-primary)]">{site.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
