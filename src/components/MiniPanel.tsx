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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 top-10 bg-transparent"
          />

          {/* Mini Panel */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute top-12 left-1/2 -translate-x-1/2 z-50 w-[380px]"
          >
            <div className="bg-white backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/50">
                <span className="text-sm font-medium text-gray-700 font-poppins">New Window</span>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-200/70 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Search Input */}
                <form onSubmit={handleSubmit} className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Search or enter URL"
                      className="w-full h-10 pl-10 pr-4 bg-gray-100/70 rounded-xl text-sm border border-gray-200/50 focus:border-[#ee8a93] focus:outline-none focus:ring-2 focus:ring-[#ee8a93]/20 transition-all placeholder-gray-400 font-poppins"
                    />
                  </div>
                </form>

                {/* Quick Links */}
                <div className="grid grid-cols-4 gap-2">
                  {quickLinks.map((site) => (
                    <button
                      key={site.name}
                      onClick={() => handleQuickLink(site.url)}
                      className="p-2 bg-gray-100/70 hover:bg-gray-200/70 rounded-xl transition-all hover:shadow-sm border border-transparent hover:border-[#ee8a93]/30"
                    >
                      <span className="text-xs font-poppins text-gray-700">{site.name}</span>
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
