import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { getCurrentWindow, availableMonitors } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import { ChevronLeft, ChevronRight, RotateCw, Home, X, Minus } from 'lucide-react';
import { PhysicalPosition, PhysicalSize } from '@tauri-apps/api/dpi';

function App() {
  const [url, setUrl] = useState("https://www.google.com");
  const [isNotchMode, setIsNotchMode] = useState(false);
  const [activeContentWindow, setActiveContentWindow] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const transformToNotch = async () => {
    const window = getCurrentWindow();
    const monitors = await availableMonitors();

    if (monitors && monitors.length > 0) {
      const primaryMonitor = monitors[0];
      const screenWidth = primaryMonitor.size.width;

      console.log('Transforming to notch mode...', { screenWidth });

      // Transform to notch at top of screen
      await window.setPosition(new PhysicalPosition(0, 0));
      await window.setSize(new PhysicalSize(screenWidth, 100));
      await window.setAlwaysOnTop(true);

      console.log('Notch mode activated');
      setIsNotchMode(true);
    }
  };

  const transformToPanel = async () => {
    const window = getCurrentWindow();

    // Transform back to panel at center
    await window.setAlwaysOnTop(false);
    await window.setSize(new PhysicalSize(1200, 800));
    await window.center();

    setIsNotchMode(false);
    setActiveContentWindow(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let fullUrl = url.trim();

    if (!fullUrl) return;

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

    // Create new content window
    const windowLabel = await invoke<string>("create_content_window", { url: fullUrl });
    setActiveContentWindow(windowLabel);

    // Transform main window to notch
    await transformToNotch();
  };

  const handleQuickLink = async (siteUrl: string) => {
    const windowLabel = await invoke<string>("create_content_window", { url: siteUrl });
    setActiveContentWindow(windowLabel);
    setUrl(siteUrl);

    // Transform main window to notch
    await transformToNotch();
  };

  const handleNavigate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeContentWindow) return;

    let fullUrl = url.trim();

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

    await invoke("navigate_to_url", { windowLabel: activeContentWindow, url: fullUrl });
  };

  const handleBack = async () => {
    if (activeContentWindow) {
      await invoke("go_back", { windowLabel: activeContentWindow });
    }
  };

  const handleForward = async () => {
    if (activeContentWindow) {
      await invoke("go_forward", { windowLabel: activeContentWindow });
    }
  };

  const handleReload = async () => {
    if (activeContentWindow) {
      await invoke("reload_page", { windowLabel: activeContentWindow });
    }
  };

  const handleHome = async () => {
    const homeUrl = "https://www.google.com";
    setUrl(homeUrl);
    if (activeContentWindow) {
      await invoke("navigate_to_url", { windowLabel: activeContentWindow, url: homeUrl });
    }
  };

  const handleClose = async () => {
    if (activeContentWindow) {
      await invoke("close_browser_window", { windowLabel: activeContentWindow });
    }
    await transformToPanel();
  };

  // Normal Panel Mode
  if (!isNotchMode) {
    return (
      <div className="h-screen w-screen flex flex-col bg-linear-to-br from-blue-50 to-purple-50 overflow-hidden">
        {/* Window Controls Bar */}
        <div
          data-tauri-drag-region
          className="h-8 bg-gray-900 flex items-center justify-between px-4 select-none"
        >
          <div className="text-xs text-gray-300 font-medium">Meikai Browser</div>
          <div className="flex gap-2">
            <button
              onClick={() => getCurrentWindow().minimize()}
              className="w-8 h-6 hover:bg-gray-700 rounded flex items-center justify-center transition-colors text-gray-300"
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              onClick={() => getCurrentWindow().close()}
              className="w-8 h-6 hover:bg-red-500 hover:text-white rounded flex items-center justify-center transition-colors text-gray-300"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-2xl px-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-6xl font-bold text-black mb-4">
                Meikai Browser
              </h1>
              <p className="text-gray-500 text-lg">
                Using native WebView2 - Each site opens in a new window
              </p>
            </motion.div>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onSubmit={handleSubmit}
              className="mb-8"
            >
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  className="w-full px-6 py-4 bg-white rounded-xl text-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all shadow-lg"
                  placeholder="Search or enter URL"
                  autoFocus
                />
              </div>
            </motion.form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex text-xl gap-4 justify-center items-center"
            >
              {[
                { name: "Google", url: "https://google.com" },
                { name: "YouTube", url: "https://youtube.com" },
                { name: "GitHub", url: "https://github.com" },
                { name: "Twitter", url: "https://twitter.com" },
                { name: "Apple", url: "https://apple.com" },
                { name: "Rhishav.com", url: "https://rhishav.com" },
              ].map((site) => (
                <button
                  key={site.name}
                  onClick={() => handleQuickLink(site.url)}
                  className="p-4 bg-white rounded-xl hover:shadow-xl transition-all border-2 border-gray-100 hover:border-blue-200"
                >
                  <div className="text-base font-medium text-gray-800">{site.name}</div>
                </button>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Notch Mode
  return (
    <div className="h-full w-full flex flex-col bg-gray-900 shadow-2xl border-b-4 border-blue-500">
      {/* Debug indicator */}
      <div className="absolute top-0 left-0 bg-red-500 text-white text-xs px-2 py-1 z-50">
        NOTCH MODE ACTIVE
      </div>

      {/* Notch Bar */}
      <div
        data-tauri-drag-region
        className="flex-1 flex items-center gap-2 px-4 bg-gradient-to-r from-gray-800 to-gray-900"
      >
        {/* Navigation Controls */}
        <button
          onClick={handleBack}
          className="p-2 rounded hover:bg-gray-700 transition-colors text-white"
          title="Go back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleForward}
          className="p-2 rounded hover:bg-gray-700 transition-colors text-white"
          title="Go forward"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <button
          onClick={handleReload}
          className="p-2 rounded hover:bg-gray-700 transition-colors text-white"
          title="Reload"
        >
          <RotateCw className="w-5 h-5" />
        </button>
        <button
          onClick={handleHome}
          className="p-2 rounded hover:bg-gray-700 transition-colors text-white"
          title="Home"
        >
          <Home className="w-5 h-5" />
        </button>

        {/* URL Bar */}
        <form onSubmit={handleNavigate} className="flex-1 mx-4">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={(e) => e.target.select()}
            placeholder="Search or enter URL"
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </form>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="p-2 rounded hover:bg-red-600 transition-colors text-white"
          title="Close window and return to panel"
        >
          <X className="w-5 h-5" />
        </button>

        <button
          onClick={() => getCurrentWindow().minimize()}
          className="p-2 rounded hover:bg-gray-700 transition-colors text-white"
          title="Minimize"
        >
          <Minus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default App;
