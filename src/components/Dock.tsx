import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ChevronLeft, ChevronRight, RotateCw, Home, X, Minus, Square, Plus, Search } from 'lucide-react';

interface DockProps {
  activeContentWindow: string | null;
  initialUrl: string;
  onClose: () => void;
}

export function Dock({ activeContentWindow, initialUrl, onClose }: DockProps) {
  const [url, setUrl] = useState(initialUrl);

  // Poll for current URL from the content window
  useEffect(() => {
    if (!activeContentWindow) return;

    const pollUrl = async () => {
      try {
        const currentUrl = await invoke<string>("get_current_url", {
          windowLabel: activeContentWindow
        });
        if (currentUrl && currentUrl !== url) {
          setUrl(currentUrl);
        }
      } catch (error) {
        console.error("Failed to get current URL:", error);
      }
    };

    // Poll every 500ms
    const interval = setInterval(pollUrl, 500);

    return () => clearInterval(interval);
  }, [activeContentWindow]);

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

  // const handleHome = async () => {
  //   const homeUrl = "https://www.google.com";
  //   setUrl(homeUrl);
  //   if (activeContentWindow) {
  //     await invoke("navigate_to_url", { windowLabel: activeContentWindow, url: homeUrl });
  //   }
  // };

  const handleMinimize = async () => {
    if (activeContentWindow) {
      await invoke("minimize_browser_window", { windowLabel: activeContentWindow });
    }
  };

  const handleMaximize = async () => {
    if (activeContentWindow) {
      await invoke("toggle_maximize_browser_window", { windowLabel: activeContentWindow });
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      {/* Dock Bar */}
      <div className="flex-1 flex items-center justify-between px-4 mt-1">
        {/* Left Group: Navigation Controls */}
        <div className="flex items-center gap-1">
          {/* <button
            onClick={handleHome}
            className="p-2 rounded hover:bg-gray-300 transition-colors"
            title="Home"
          >
            <Home className="w-4 h-4" />
          </button> */}
          <button
            onClick={handleBack}
            className="p-2 rounded hover:bg-gray-300 transition-colors"
            title="Go back"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleForward}
            className="p-2 rounded hover:bg-gray-300 transition-colors"
            title="Go forward"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            className="p-2 rounded hover:bg-gray-300 transition-colors"
            title="New Window"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleReload}
            className="p-2 rounded hover:bg-gray-300 transition-colors"
            title="Reload"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Center Group: URL Bar */}
        <div className="flex-1 flex justify-start px-4 items-center gap-4">
          <form 
            onSubmit={handleNavigate} 
            className="relative transition-all duration-300 ease-in-out w-10 hover:w-full focus-within:w-full max-w-xl bg-gray-200 backdrop-blur-md rounded-lg overflow-hidden group"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onFocus={(e) => e.target.select()}
              placeholder="Search or enter URL"
              className="w-full h-full pl-10 pr-4 py-1 bg-transparent focus:outline-none text-sm transition-opacity duration-300 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
            />
          </form>
          <div className="flex gap-1 px-1 mr-2">
            <div className="w-3 h-3 bg-red-300 rounded-full"></div>
            <div className="w-3 h-3 bg-red-100 rounded-full"></div>
            <div className="w-3 h-3 bg-red-100 rounded-full"></div>
          </div>
        </div>

        {/* Right Group: Window Controls & Extras */}
        <div className="flex items-center gap-2">
          
          
          

          <div className="flex justify-center items-center gap-1">
            <button
              onClick={handleMinimize}
              className="w-7 h-6 hover:bg-gray-700/50 hover:backdrop-blur-md hover:text-white rounded-2xl flex items-center justify-center transition-colors text-gray-900"
              title="Minimize/Restore content window"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={handleMaximize}
              className="w-7 h-6 hover:bg-gray-700/50 hover:backdrop-blur-md hover:text-white rounded-2xl flex items-center justify-center transition-colors text-gray-900"
              title="Maximize/Unmaximize content window"
            >
              <Square strokeWidth="2" className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-7 h-6 hover:bg-rose-600/70 hover:backdrop-blur-md hover:text-white rounded-2xl flex items-center justify-center transition-colors text-red-600"
              title="Close window and return to panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
