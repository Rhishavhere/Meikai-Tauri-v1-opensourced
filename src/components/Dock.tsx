import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { ChevronLeft, ChevronRight, RotateCw, X, Minus, Square, Plus, Search, Bookmark } from 'lucide-react';

interface ContentWindow {
  windowLabel: string;
  url: string;
}

interface DockProps {
  activeContentWindow: string | null;
  initialUrl: string;
  onClose: () => void;
  onNewWindow: () => void;
  isMiniPanelOpen?: boolean;
  contentWindows: ContentWindow[];
  activeWindowIndex: number;
  onSwitchWindow: (index: number) => void;
  onAddBookmark?: (name: string, url: string) => void;
  isBookmarked?: boolean;
}

interface UrlChangedPayload {
  url: string;
  windowLabel: string;
}

export function Dock({ activeContentWindow, initialUrl, onClose, onNewWindow, isMiniPanelOpen = false, contentWindows, activeWindowIndex, onSwitchWindow, onAddBookmark, isBookmarked = false }: DockProps) {
  const [url, setUrl] = useState(initialUrl);
  const [isEditing, setIsEditing] = useState(false);
  const isEditingRef = useRef(isEditing);

  // Keep ref in sync with state
  useEffect(() => {
    isEditingRef.current = isEditing;
  }, [isEditing]);

  // Set up URL monitor and listen for URL change events
  useEffect(() => {
    if (!activeContentWindow) return;

    // Set up the URL monitor in the content window
    invoke("setup_url_monitor", { windowLabel: activeContentWindow })
      .catch(err => console.error("Failed to setup URL monitor:", err));

    // Listen for URL change events
    const unlistenPromise = listen<UrlChangedPayload>("url-changed", (event) => {
      // Only update if it's from our content window and we're not editing
      if (event.payload.windowLabel === activeContentWindow && !isEditingRef.current) {
        setUrl(event.payload.url);
      }
    });

    return () => {
      unlistenPromise.then(unlisten => unlisten());
    };
  }, [activeContentWindow]); // Only re-run when content window changes

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
    setIsEditing(false);
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
    <div className="h-full w-full flex flex-col bg-[var(--color-bg-primary)] rounded-3xl border border-[var(--color-border)]">
      {/* Dock Bar */}
      <div className="flex-1 flex items-center justify-between px-4 py-0.5">
        {/* Left Group: Navigation Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleBack}
            className="p-2 rounded hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] transition-colors"
            title="Go back"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleForward}
            className="p-2 rounded hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] transition-colors"
            title="Go forward"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={onNewWindow}
            disabled={isMiniPanelOpen}
            className={`p-2 rounded transition-colors text-[var(--color-text-primary)] ${isMiniPanelOpen ? 'opacity-40' : 'hover:bg-[var(--color-bg-secondary)]'}`}
            title="New Window"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleReload}
            className="p-2 rounded hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] transition-colors"
            title="Reload"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (onAddBookmark && url && !isBookmarked) {
                try {
                  const urlObj = new URL(url);
                  const name = urlObj.hostname.replace('www.', '');
                  onAddBookmark(name, url);
                } catch {
                  onAddBookmark(url, url);
                }
              }
            }}
            disabled={isBookmarked}
            className={`p-2 rounded transition-colors ${
              isBookmarked 
                ? 'text-[var(--color-accent)]' 
                : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]'
            }`}
            title={isBookmarked ? "Bookmarked" : "Add to bookmarks"}
          >
            <Bookmark className="w-4 h-4" fill={isBookmarked ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Center Group: URL Bar */}
        <div className="flex-1 flex justify-start px-4 items-center gap-4">
          <form 
            onSubmit={handleNavigate} 
            className="relative transition-all duration-300 ease-in-out w-10 hover:w-full focus-within:w-full max-w-xl bg-[var(--color-bg-secondary)] backdrop-blur-md rounded-lg overflow-hidden group"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)] pointer-events-none" />
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setIsEditing(true);
                setUrl(e.target.value);
              }}
              onFocus={(e) => {
                setIsEditing(true);
                e.target.select();
              }}
              onBlur={() => setIsEditing(false)}
              placeholder="Search or enter URL"
              className="w-full h-full pl-10 pr-4 py-1 bg-transparent text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none text-sm transition-opacity duration-300 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
            />
          </form>
          <div 
            className="flex flex-1 gap-1 px-1 mr-2"
            onWheel={(e) => {
              e.preventDefault();
              if (contentWindows.length <= 1) return;
              
              // Scroll down = next window, scroll up = previous window
              const direction = e.deltaY > 0 ? 1 : -1;
              const newIndex = Math.max(0, Math.min(contentWindows.length - 1, activeWindowIndex + direction));
              if (newIndex !== activeWindowIndex) {
                onSwitchWindow(newIndex);
              }
            }}
          >
            {contentWindows.map((_, index) => (
              <button
                key={index}
                onClick={() => onSwitchWindow(index)}
                className={`w-3 h-3 rounded-full transition-colors hover:scale-110 ${
                  index === activeWindowIndex ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-accent)]/30 hover:bg-[var(--color-accent)]/50'
                }`}
                title={`Window ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Right Group: Window Controls & Extras */}
        <div className="flex items-center gap-2">
          <div className="flex justify-center items-center gap-1">
            <button
              onClick={handleMinimize}
              className="w-7 h-6 hover:bg-[var(--color-text-secondary)]/20 hover:backdrop-blur-md rounded-2xl flex items-center justify-center transition-colors text-[var(--color-text-primary)]"
              title="Minimize/Restore content window"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={handleMaximize}
              className="w-7 h-6 hover:bg-[var(--color-text-secondary)]/20 hover:backdrop-blur-md rounded-2xl flex items-center justify-center transition-colors text-[var(--color-text-primary)]"
              title="Maximize/Unmaximize content window"
            >
              <Square strokeWidth="2" className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-7 h-6 hover:bg-rose-600/70 hover:backdrop-blur-md hover:text-white rounded-2xl flex items-center justify-center transition-colors text-red-500"
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
