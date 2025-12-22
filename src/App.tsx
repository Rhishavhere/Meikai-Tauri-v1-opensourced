import { useState, useEffect } from "react";
import { getCurrentWindow, availableMonitors } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { PhysicalPosition, PhysicalSize } from '@tauri-apps/api/dpi';
import { Panel, Dock, MiniPanel } from './components';

// Global panel window size
export const PANEL_SIZE = { width: 900, height: 600 };

interface ContentWindow {
  windowLabel: string;
  url: string;
}

function App() {
  const [url, setUrl] = useState("");
  const [isNotchMode, setIsNotchMode] = useState(false);
  const [contentWindows, setContentWindows] = useState<ContentWindow[]>([]);
  const [activeWindowIndex, setActiveWindowIndex] = useState(0);
  const [showMiniPanel, setShowMiniPanel] = useState(false);

  // Get the actively selected window
  const activeContentWindow = contentWindows.length > 0 
    ? contentWindows[activeWindowIndex]?.windowLabel 
    : null;

  // Listen for new windows created from redirect links (target="_blank", window.open)
  useEffect(() => {
    const unlisten = listen<{ windowLabel: string; url: string }>("new-window-created", async (event) => {
      const { windowLabel, url: newUrl } = event.payload;
      
      // Hide current active window before showing new one
      if (contentWindows.length > 0 && contentWindows[activeWindowIndex]) {
        await invoke("hide_browser_window", { windowLabel: contentWindows[activeWindowIndex].windowLabel });
      }
      
      setContentWindows(prev => [...prev, { windowLabel, url: newUrl }]);
      setActiveWindowIndex(contentWindows.length); // New window becomes active (will be at the end)
      setUrl(newUrl);
    });

    return () => {
      unlisten.then(fn => fn());
    };
  }, [contentWindows, activeWindowIndex]);

  // Listen for windows being closed (user clicks X on window title bar)
  useEffect(() => {
    const unlisten = listen<{ windowLabel: string }>("window-closed", async (event) => {
      const closedLabel = event.payload.windowLabel;
      
      // Check if this is one of our content windows
      const closedIndex = contentWindows.findIndex(w => w.windowLabel === closedLabel);
      if (closedIndex === -1) return; // Not a content window we're tracking
      
      // Remove the closed window from our list
      const newWindows = contentWindows.filter((_, i) => i !== closedIndex);
      
      if (newWindows.length === 0) {
        // No more windows, go back to panel mode
        const appWindow = getCurrentWindow();
        setUrl("");
        await appWindow.setAlwaysOnTop(false);
        await appWindow.setSize(new PhysicalSize(PANEL_SIZE.width, PANEL_SIZE.height));
        await appWindow.center();
        setIsNotchMode(false);
        setContentWindows([]);
        setActiveWindowIndex(0);
      } else {
        // Calculate new active index
        let newActiveIndex = activeWindowIndex;
        if (closedIndex === activeWindowIndex) {
          // Closed window was active, switch to another
          newActiveIndex = Math.min(closedIndex, newWindows.length - 1);
          // Show the new active window
          await invoke("show_browser_window", { windowLabel: newWindows[newActiveIndex].windowLabel });
          setUrl(newWindows[newActiveIndex].url);
        } else if (closedIndex < activeWindowIndex) {
          // Closed window was before active, adjust index
          newActiveIndex = activeWindowIndex - 1;
        }
        
        setContentWindows(newWindows);
        setActiveWindowIndex(newActiveIndex);
      }
    });

    return () => {
      unlisten.then(fn => fn());
    };
  }, [contentWindows, activeWindowIndex]);

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
    await window.setSize(new PhysicalSize(PANEL_SIZE.width, PANEL_SIZE.height));
    await window.center();

    setIsNotchMode(false);
    setContentWindows([]);
    setActiveWindowIndex(0);
  };

  const handleNavigate = async (fullUrl: string) => {
    // Create new content window
    const windowLabel = await invoke<string>("create_content_window", { url: fullUrl });
    setContentWindows([{ windowLabel, url: fullUrl }]);
    setActiveWindowIndex(0);
    setUrl(fullUrl);

    // Transform main window to notch
    await transformToNotch();
  };

  const handleQuickLink = async (siteUrl: string) => {
    const windowLabel = await invoke<string>("create_content_window", { url: siteUrl });
    setContentWindows([{ windowLabel, url: siteUrl }]);
    setActiveWindowIndex(0);
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
    const appWindow = getCurrentWindow();
    
    // Hide current active window before creating new one
    if (contentWindows.length > 0 && contentWindows[activeWindowIndex]) {
      await invoke("hide_browser_window", { windowLabel: contentWindows[activeWindowIndex].windowLabel });
    }
    
    const windowLabel = await invoke<string>("create_content_window", { url: fullUrl });
    setContentWindows(prev => {
      setActiveWindowIndex(prev.length); // Set to new window's index
      return [...prev, { windowLabel, url: fullUrl }];
    });
    setUrl(fullUrl);
    setShowMiniPanel(false);
    // Shrink dock back to notch size
    await appWindow.setSize(new PhysicalSize(700, 40));
  };

  // Handler for switching between windows (tab-like behavior)
  const handleSwitchWindow = async (index: number) => {
    if (index === activeWindowIndex || index < 0 || index >= contentWindows.length) return;
    
    // Hide current active window
    if (contentWindows[activeWindowIndex]) {
      await invoke("hide_browser_window", { windowLabel: contentWindows[activeWindowIndex].windowLabel });
    }
    
    // Show the selected window
    if (contentWindows[index]) {
      await invoke("show_browser_window", { windowLabel: contentWindows[index].windowLabel });
      setActiveWindowIndex(index);
      setUrl(contentWindows[index].url);
    }
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
        isMiniPanelOpen={showMiniPanel}
        contentWindows={contentWindows}
        activeWindowIndex={activeWindowIndex}
        onSwitchWindow={handleSwitchWindow}
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

