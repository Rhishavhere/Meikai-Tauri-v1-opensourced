import { useState, useRef, useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, X } from "lucide-react";

// Tab Components
import HomeTab from "./HomeTab";
import Tray from "./Tray";
import { useBookmarks } from "../../hooks/useBookmarks";

interface PanelProps {
  onNavigate: (url: string) => void;
  onQuickLink: (url: string) => void;
}

type TabView = "home" | "settings" | "profile" | "apps" | "library";

export function Panel({ onNavigate, onQuickLink }: PanelProps) {
  const [showTray, setShowTray] = useState(false);
  const [activeView, setActiveView] = useState<TabView>("home");
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Bookmark management
  const { bookmarks, addBookmark, deleteBookmark } = useBookmarks();

  // Handle scroll to show/hide tray (only on home tab)
  useEffect(() => {
    if (activeView !== "home") {
      setShowTray(false);
      return;
    }

    const handleWheel = (e: WheelEvent) => {
      // Scrolling DOWN (deltaY > 0) - show tray
      if (e.deltaY > 0 && !showTray) {
        setShowTray(true);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel);
      return () => container.removeEventListener("wheel", handleWheel);
    }
  }, [activeView, showTray]); // Added showTray dependency to prevent re-triggering

  const renderTabContent = () => {
    switch (activeView) {
      case "home":
        return <HomeTab onNavigate={onNavigate} onQuickLink={onQuickLink} />;
      default:
        return <HomeTab onNavigate={onNavigate} onQuickLink={onQuickLink} />;
    }
  };

  return (
    <div
      ref={containerRef}
      data-tauri-drag-region
      className="h-screen w-screen flex flex-col overflow-hidden rounded-xl relative"
    >
      {/* Main Section */}
      <div className="bg-white h-full w-full flex flex-col overflow-hidden justify-center items-center rounded-xl relative">
        {/* Window Controls Bar */}
        <div
          data-tauri-drag-region
          className="flex fixed gap-1 right-4 top-2 justify-center items-center z-50"
        >
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

        {/* Tab Content */}
        <div
          data-tauri-drag-region
          className="flex-1 flex items-center justify-center w-full overflow-hidden"
        >
          {renderTabContent()}
        </div>

        {/* Tray - only visible on home tab */}
        <Tray
          isVisible={showTray}
          bookmarks={bookmarks}
          onQuickLink={onQuickLink}
          onAddBookmark={addBookmark}
          onDeleteBookmark={deleteBookmark}
          onClose={() => setShowTray(false)}
        />
      </div>
    </div>
  );
}

export default Panel;
