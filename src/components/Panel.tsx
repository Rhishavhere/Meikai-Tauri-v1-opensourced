import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, X, Settings, User, LayoutGrid, BookOpen, ArrowLeft } from 'lucide-react';
import Tray from "./Tray";

interface PanelProps {
  onNavigate: (url: string) => void;
  onQuickLink: (url: string) => void;
}

export function Panel({ onNavigate, onQuickLink }: PanelProps) {
  const [url, setUrl] = useState("");
  const [showTray, setShowTray] = useState(false);
  const [activeView, setActiveView] = useState<'home' | 'settings' | 'profile' | 'apps' | 'library'>('home');
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

  const renderContent = () => {
    if (activeView === 'home') {
      return (
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
      );
    }

    const views = {
      settings: { title: 'Settings', icon: Settings, content: 'Settings content goes here.' },
      profile: { title: 'Profile', icon: User, content: 'User profile details.' },
      apps: { title: 'Apps', icon: LayoutGrid, content: 'Your installed apps.' },
      library: { title: 'Library', icon: BookOpen, content: 'Bookmarks and history.' },
    };

    const currentView = views[activeView as keyof typeof views];

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl px-8 h-full flex flex-col pt-12"
      >
         <button
            onClick={() => setActiveView('home')}
            className="self-start mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        
        <div className="bg-white/50 backdrop-blur-xl rounded-2xl p-8 flex-1 shadow-sm border border-white/20">
            <div className="flex items-center gap-3 mb-6">
                <currentView.icon className="w-8 h-8 text-[#ee8a93]" />
                <h2 className="text-3xl font-merri text-gray-800">{currentView.title}</h2>
            </div>
            <div className="prose prose-gray">
                <p className="text-lg text-gray-600">{currentView.content}</p>
                 <div className="mt-8 p-4 border border-dashed border-gray-300 rounded-lg text-center text-gray-400">
                    Placeholder Component
                 </div>
            </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div ref={containerRef} data-tauri-drag-region className="h-screen w-screen flex flex-col overflow-hidden p-1 bg-linear-to-t from-[#DE6262] to-[#FFB88C] rounded-xl">
      {/* Main Section */}
      <div className="bg-white/90 h-full w-full flex flex-col overflow-hidden justify-center items-center rounded-xl">
        {/* Window Controls Bar */}
        <div data-tauri-drag-region className="flex fixed gap-1 right-4 top-2 justify-center items-center">
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

        <div data-tauri-drag-region className="flex-1 flex items-center justify-center w-full">
            {renderContent()}
        </div>
        {/* Tray */}
        <Tray isVisible={showTray} onQuickLink={onQuickLink} />
      </div>

      {/* Utility Section */}
      <div className="flex justify-center h-10 pt-1 items-center gap-6 text-white bg-transparent w-full">
        {[
          { icon: Settings, label: "Settings", view: "settings" },
          { icon: User, label: "Profile", view: "profile" },
          { icon: LayoutGrid, label: "Apps", view: "apps" },
          { icon: BookOpen, label: "Library", view: "library" },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => setActiveView(item.view as any)}
            className={`p-1 rounded-full hover:bg-white/20 hover:scale-110 transition-all duration-300 group relative ${activeView === item.view ? 'bg-white/30' : ''}`}
            title={item.label}
          >
            <item.icon className="w-5 h-5 text-white/90 group-hover:text-white" strokeWidth={2} />
          </button>
        ))}
      </div>
    </div>
  );
}
