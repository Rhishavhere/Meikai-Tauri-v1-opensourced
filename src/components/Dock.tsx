import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ChevronLeft, ChevronRight, RotateCw, Home, X, Minus, Square } from 'lucide-react';

interface DockProps {
  activeContentWindow: string | null;
  initialUrl: string;
  onClose: () => void;
}

export function Dock({ activeContentWindow, initialUrl, onClose }: DockProps) {
  const [url, setUrl] = useState(initialUrl);

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
      <div className="flex-1 flex items-center gap-2 px-4 mt-1">
        {/* Navigation Controls */}
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
          onClick={handleReload}
          className="p-2 rounded hover:bg-gray-300 transition-colors"
          title="Reload"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button
          onClick={handleHome}
          className="p-2 rounded hover:bg-gray-300 transition-colors"
          title="Home"
        >
          <Home className="w-4 h-4" />
        </button>

        {/* URL Bar */}
        <form onSubmit={handleNavigate} className="flex-1 mx-4">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={(e) => e.target.select()}
            placeholder="Search or enter URL"
            className="w-full px-4 py-1 bg-gray-200 backdrop-blur-md rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </form>

        {/* Window Control Buttons */}
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
  );
}
