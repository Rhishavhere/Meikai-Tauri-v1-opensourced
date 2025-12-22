import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, X, Settings, User, Home } from "lucide-react";

// Tab Components
import HomeTab from "./HomeTab";
import SettingsTab from "./SettingsTab";
import ProfileTab from "./ProfileTab";
// import Tray from "./Tray";

interface PanelProps {
  onNavigate: (url: string) => void;
  onQuickLink: (url: string) => void;
}

type TabView = "home" | "settings" | "profile" | "apps" | "library";

export function Panel({ onNavigate, onQuickLink }: PanelProps) {
  // const [showTray, setShowTray] = useState(false);
  const [activeView, setActiveView] = useState<TabView>("home");
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle scroll to show/hide tray (only on home tab)
  // useEffect(() => {
  //   if (activeView !== "home") {
  //     setShowTray(false);
  //     return;
  //   }

  //   const handleWheel = (e: WheelEvent) => {
  //     if (e.deltaY > 0) {
  //       // Scrolling down
  //       setShowTray(true);
  //     } else if (e.deltaY < 0) {
  //       // Scrolling up
  //       setShowTray(false);
  //     }
  //   };

  //   const container = containerRef.current;
  //   if (container) {
  //     container.addEventListener("wheel", handleWheel);
  //   }

  //   return () => {
  //     if (container) {
  //       container.removeEventListener("wheel", handleWheel);
  //     }
  //   };
  // }, [activeView]);

  const renderTabContent = () => {
    switch (activeView) {
      case "home":
        return <HomeTab onNavigate={onNavigate} onQuickLink={onQuickLink} />;
      case "settings":
        return <SettingsTab />;
      case "profile":
        return <ProfileTab />;
      default:
        return <HomeTab onNavigate={onNavigate} onQuickLink={onQuickLink} />;
    }
  };

  const tabs = [
    { icon: Home, label: "Home", view: "home" as TabView },
    { icon: Settings, label: "Settings", view: "settings" as TabView },
    { icon: User, label: "Profile", view: "profile" as TabView },
  ];

  return (
    <div
      ref={containerRef}
      data-tauri-drag-region
      className="h-screen w-screen flex flex-col overflow-hidden p-0.5 rounded-xl relative"
    >
      {/* Background Image */}
      {/* <div className="absolute inset-0 -z-10 bg-white" >
        <img src="/bg.jpg" alt="" className="w-full h-full object-cover" />
      </div> */}
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
        {/* {activeView === "home" && (
          <Tray isVisible={showTray} onQuickLink={onQuickLink} />
        )} */}
      </div>
    </div>
  );
}

export default Panel;
