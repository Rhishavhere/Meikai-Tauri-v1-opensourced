import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, X } from 'lucide-react';
import Tray from "./Tray";

interface PanelProps {
  onNavigate: (url: string) => void;
  onQuickLink: (url: string) => void;
}

export function Panel({ onNavigate, onQuickLink }: PanelProps) {
  const [url, setUrl] = useState("");
  const [showTray, setShowTray] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;

    let fullUrl = trimmedUrl;

    // Check if it's a URL or a search query
    const isUrl = fullUrl.includes('.') && !fullUrl.includes(' ') ||
                   fullUrl.startsWith("http://") ||
                   fullUrl.startsWith("https://");

    if (isUrl) {
      // Add https:// if no protocol specified
      if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
        fullUrl = "https://" + fullUrl;
      }
    } else {
      // Treat as search query
      fullUrl = `https://www.google.com/search?q=${encodeURIComponent(fullUrl)}`;
    }

    onNavigate(fullUrl);
  };

  const quickLinks = [
    { name: "Google", url: "https://google.com" },
    { name: "YouTube", url: "https://youtube.com" },
    { name: "GitHub", url: "https://github.com" },
    { name: "Twitter", url: "https://twitter.com" },
    { name: "Apple", url: "https://apple.com" },
    { name: "Pinterest", url: "https://pinterest.com" },
  ];

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) {
        // Scrolling down
        setShowTray(true);
      } else if (e.deltaY < 0) {
        // Scrolling up
        setShowTray(false);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel);
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="h-screen w-screen flex flex-col overflow-hidden justify-center items-center bg-[#fff6ee] rounded-xl">
      {/* Background Logo */}
      {/* <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="pointer-events-none -z-10 overflow-hidden inset-0 absolute flex justify-center"
      >
        <motion.img
          src="logo.svg"
          alt=""
          className="w-screen h-auto opacity-50 top-12 absolute"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
        />
      </motion.div> */}

      {/* Window Controls Bar */}
      <div className="flex fixed gap-1 right-4 top-2 justify-center items-center">
        <button
          onClick={() => getCurrentWindow().minimize()}
          className="w-7 h-6 hover:bg-gray-700/50 hover:backdrop-blur-md hover:text-white rounded-2xl flex items-center justify-center transition-colors text-gray-900"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={() => getCurrentWindow().close()}
          className="w-7 h-6 hover:bg-rose-600/70 hover:backdrop-blur-md hover:text-white rounded-2xl flex items-center justify-center transition-colors text-red-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>


      {/* Main Content */}

      <div data-tauri-drag-region className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-2xl px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 flex flex-col justify-center items-center"
          >
            <p className="font-merri text-6xl text-[#ee8a93]">Meikai</p>
            <p className="text-gray-500 text-md font-poppins">
              Built for focus. Designed for flow
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="mb-8"
          >
            <div className="relative flex justify-center">
              <input
                ref={inputRef}
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onFocus={(e) => e.target.select()}
                className="w-96 h-10 px-6 py-2 bg-white rounded-xl hover:bg-white/50 backdrop-blur-lg text-base border border-black/30 focus:border-blue-400 focus:outline-none transition-all shadow-lg placeholder-gray-600"
                placeholder="Search or enter URL"
                autoFocus
              />
            </div>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex text-xl gap-3 justify-center items-center"
          >
            {quickLinks.map((site) => (
              <button
                key={site.name}
                onClick={() => onQuickLink(site.url)}
                className="p-2 bg-white backdrop-blur-md rounded-xl shadow-sm hover:shadow-md hover:bg-white/50 transition-all hover:border-[#ee8a93] border border-transparent"
              >
                <div className="text-xs font-poppins text-gray-800">{site.name}</div>
              </button>
            ))}
          </motion.div>
        </div>
      </div>
      {/* Tray */}
      <Tray isVisible={showTray} onQuickLink={onQuickLink} />
    </div>
  );
}
