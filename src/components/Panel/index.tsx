import { useState, useRef, useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, X } from "lucide-react";
import { AnimatePresence } from "framer-motion";

// Tab Components
import HomeTab from "./Home";
import Profile from "./Profile";
import Settings from "./Settings";
import Tray from "./Tray";
import { useBookmarks } from "../../hooks/useBookmarks";
import { Settings as SettingsType, Theme, SearchEngine } from "../../hooks/useSettings";

interface PanelProps {
  onNavigate: (url: string) => void;
  onQuickLink: (url: string) => void;
  // Settings passed from App level
  settings: SettingsType;
  onThemeChange: (theme: Theme) => void;
  onSearchEngineChange: (engine: SearchEngine) => void;
  onQuickLinksLimitChange: (limit: number) => void;
  onAnimationsChange: (enabled: boolean) => void;
  onResetSettings: () => void;
  getSearchUrl: (query: string) => string;
}

type TabView = "home" | "settings" | "profile";

export function Panel({ 
  onNavigate, 
  onQuickLink,
  settings,
  onThemeChange,
  onSearchEngineChange,
  onQuickLinksLimitChange,
  onAnimationsChange,
  onResetSettings,
  getSearchUrl
}: PanelProps) {
  const [showTray, setShowTray] = useState(false);
  const [activeView, setActiveView] = useState<TabView>("home");
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Bookmark management (still local since bookmarks persist via file)
  const { 
    bookmarks, 
    starredBookmarks, 
    addBookmark, 
    deleteBookmark, 
    toggleStar,
    clearAllBookmarks,
    importBookmarks
  } = useBookmarks();

  // Handle scroll to show/hide tray (ONLY on home view)
  useEffect(() => {
    // Close tray when leaving home view
    if (activeView !== "home") {
      setShowTray(false);
      return;
    }

    const handleWheel = (e: WheelEvent) => {
      // Only allow tray to open when on home view
      if (activeView !== "home") return;
      
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
  }, [activeView, showTray]);

  const renderTabContent = () => {
    switch (activeView) {
      case "home":
        return (
          <HomeTab 
            onNavigate={onNavigate} 
            onQuickLink={onQuickLink} 
            starredBookmarks={starredBookmarks}
            onOpenProfile={() => setActiveView("profile")}
            onOpenSettings={() => setActiveView("settings")}
            onOpenBookmarks={() => setShowTray(true)}
            settings={settings}
            getSearchUrl={getSearchUrl}
          />
        );
      case "profile":
        return (
          <Profile 
            onBack={() => setActiveView("home")}
            bookmarksCount={bookmarks.length}
            starredCount={starredBookmarks.length}
            settings={settings}
          />
        );
      case "settings":
        return (
          <Settings 
            onBack={() => setActiveView("home")}
            settings={settings}
            onThemeChange={onThemeChange}
            onSearchEngineChange={onSearchEngineChange}
            onQuickLinksLimitChange={onQuickLinksLimitChange}
            onAnimationsChange={onAnimationsChange}
            onResetSettings={onResetSettings}
            bookmarks={bookmarks}
            onClearBookmarks={clearAllBookmarks}
            onImportBookmarks={importBookmarks}
          />
        );
      default:
        return (
          <HomeTab 
            onNavigate={onNavigate} 
            onQuickLink={onQuickLink} 
            starredBookmarks={starredBookmarks}
            onOpenProfile={() => setActiveView("profile")}
            onOpenSettings={() => setActiveView("settings")}
            onOpenBookmarks={() => setShowTray(true)}
            settings={settings}
            getSearchUrl={getSearchUrl}
          />
        );
    }
  };

  return (
    <div
      ref={containerRef}
      data-tauri-drag-region
      className="h-screen w-screen flex flex-col overflow-hidden rounded-xl relative"
    >
      {/* Main Section */}
      <div data-tauri-drag-region className="bg-[var(--color-bg-primary)] h-full w-full flex flex-col overflow-hidden justify-center items-center rounded-xl relative">
        {/* Dedicated Drag Bar at Top - always draggable */}
        <div
          data-tauri-drag-region
          className="absolute top-0 left-0 right-0 h-8 z-40"
          style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        />
        
        {/* Window Controls Bar */}
        <div
          data-tauri-drag-region
          className="flex fixed gap-1 right-4 top-2 justify-center items-center z-50"
        >
          <button
            onClick={() => getCurrentWindow().minimize()}
            className="w-7 h-6 hover:bg-[var(--color-text-secondary)]/20 hover:backdrop-blur-md rounded-2xl flex items-center justify-center transition-colors text-[var(--color-text-primary)]"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => getCurrentWindow().close()}
            className="w-7 h-6 hover:bg-rose-600/70 hover:backdrop-blur-md hover:text-white rounded-2xl flex items-center justify-center transition-colors text-red-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Content with AnimatePresence for smooth transitions */}
        <div
          data-tauri-drag-region
          className="flex-1 flex items-center justify-center w-full overflow-hidden relative rounded-xl"
        >
          <AnimatePresence mode="wait">
            {renderTabContent()}
          </AnimatePresence>
        </div>

        {/* Tray - only visible on home view */}
        {activeView === "home" && (
          <Tray
            isVisible={showTray}
            bookmarks={bookmarks}
            onQuickLink={onQuickLink}
            onAddBookmark={addBookmark}
            onDeleteBookmark={deleteBookmark}
            onToggleStar={toggleStar}
            onClose={() => setShowTray(false)}
          />
        )}
      </div>
    </div>
  );
}

export default Panel;
