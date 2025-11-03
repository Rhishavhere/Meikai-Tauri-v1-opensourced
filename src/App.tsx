import { useState } from "react";
import { getCurrentWindow, availableMonitors } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import { PhysicalPosition, PhysicalSize } from '@tauri-apps/api/dpi';
import { Panel, Dock } from './components';

function App() {
  const [url, setUrl] = useState("");
  const [isNotchMode, setIsNotchMode] = useState(false);
  const [activeContentWindow, setActiveContentWindow] = useState<string | null>(null);

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
      await window.setAlwaysOnTop(true);

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
    setActiveContentWindow(null);
  };

  const handleNavigate = async (fullUrl: string) => {
    // Create new content window
    const windowLabel = await invoke<string>("create_content_window", { url: fullUrl });
    setActiveContentWindow(windowLabel);
    setUrl(fullUrl);

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

  const handleClose = async () => {
    if (activeContentWindow) {
      await invoke("close_browser_window", { windowLabel: activeContentWindow });
    }
    await transformToPanel();
  };



  // Render Panel or Dock based on mode
  if (!isNotchMode) {
    return <Panel onNavigate={handleNavigate} onQuickLink={handleQuickLink} />;
  }

  return <Dock activeContentWindow={activeContentWindow} initialUrl={url} onClose={handleClose} />;
}

export default App;
