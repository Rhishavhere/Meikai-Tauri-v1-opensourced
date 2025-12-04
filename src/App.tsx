import { useState, useEffect } from "react";
import { getCurrentWindow, availableMonitors } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { PhysicalPosition, PhysicalSize } from '@tauri-apps/api/dpi';
import { Panel, Dock, MiniPanel } from './components';

interface ContentWindow {
  windowLabel: string;
  url: string;
}

function App() {
  const [url, setUrl] = useState("");
  const [isNotchMode, setIsNotchMode] = useState(false);
  const [contentWindows, setContentWindows] = useState<ContentWindow[]>([]);
  const [showMiniPanel, setShowMiniPanel] = useState(false);

  // Get the most recently opened window as "active"
  const activeContentWindow = contentWindows.length > 0 
    ? contentWindows[contentWindows.length - 1].windowLabel 
    : null;

  // Listen for new windows created from redirect links (target="_blank", window.open)
  useEffect(() => {
    const unlisten = listen<{ windowLabel: string; url: string }>("new-window-created", (event) => {
      const { windowLabel, url: newUrl } = event.payload;
      setContentWindows(prev => [...prev, { windowLabel, url: newUrl }]);
      setUrl(newUrl);
    });

    return () => {
      unlisten.then(fn => fn());
    };
  }, []);

  const transformToNotch = async () => {
    const window = getCurrentWindow();
    const monitors = await availableMonitors();

    if (monitors && monitors.length > 0) {
      const primaryMonitor = monitors[0];
      const screenWidth = primaryMonitor.size.width;

      console.log('Transforming to notch mode...', { screenWidth });

      // Transform to notch at top of screen
      const x = (screenWidth - 700) / 2;
      await window.setPosition(new PhysicalPosition(x, 10));
      await window.setSize(new PhysicalSize(700, 40));
      await window.setAlwaysOnTop(false);

      console.log('Notch mode activated');
      setIsNotchMode(true);
    }
  };

  const transformToPanel = async () => {
    const window = getCurrentWindow();

    // Transform back to panel at center
    setUrl("")
    await window.setAlwaysOnTop(false);
    await window.setSize(new PhysicalSize(600, 400));
    await window.center();

    setIsNotchMode(false);
    setContentWindows([]);
  };

  const handleNavigate = async (fullUrl: string) => {
    // Create new content window
    const windowLabel = await invoke<string>("create_content_window", { url: fullUrl });
    setContentWindows([{ windowLabel, url: fullUrl }]);
    setUrl(fullUrl);

    // Transform main window to notch
    await transformToNotch();
  };

  const handleQuickLink = async (siteUrl: string) => {
    const windowLabel = await invoke<string>("create_content_window", { url: siteUrl });
    setContentWindows([{ windowLabel, url: siteUrl }]);
    setUrl(siteUrl);

    // Transform main window to notch
    await transformToNotch();
  };

  // Handler for opening new window from MiniPanel
  const handleNewWindow = async () => {
    const window = getCurrentWindow();
    // Expand dock height to show MiniPanel
    await window.setSize(new PhysicalSize(700, 300));
    setShowMiniPanel(true);
  };

  // Handler for creating additional windows
  const handleCreateNewWindow = async (fullUrl: string) => {
    const window = getCurrentWindow();
    const windowLabel = await invoke<string>("create_content_window", { url: fullUrl });
    setContentWindows(prev => [...prev, { windowLabel, url: fullUrl }]);
    setUrl(fullUrl);
    setShowMiniPanel(false);
    // Shrink dock back to notch size
    await window.setSize(new PhysicalSize(700, 40));
  };

  // Handler for closing MiniPanel without action
  const handleCloseMiniPanel = async () => {
    const window = getCurrentWindow();
    setShowMiniPanel(false);
    // Shrink dock back to notch size
    await window.setSize(new PhysicalSize(700, 40));
  };

  const handleClose = async () => {
    // Close all content windows
    for (const win of contentWindows) {
      await invoke("close_browser_window", { windowLabel: win.windowLabel });
    }
    await transformToPanel();
  };

  // Render Panel or Dock based on mode
  if (!isNotchMode) {
    return <Panel onNavigate={handleNavigate} onQuickLink={handleQuickLink} />;
  }

  return (
    <>
      <Dock 
        activeContentWindow={activeContentWindow} 
        initialUrl={url} 
        onClose={handleClose}
        onNewWindow={handleNewWindow}
      />
      <MiniPanel 
        isVisible={showMiniPanel}
        onNavigate={handleCreateNewWindow}
        onClose={handleCloseMiniPanel}
      />
    </>
  );
}

export default App;

