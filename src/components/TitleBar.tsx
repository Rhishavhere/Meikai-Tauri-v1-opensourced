import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface TitleBarProps {
  windowLabel: string;
  initialUrl: string;
}

function TitleBar({ windowLabel, initialUrl }: TitleBarProps) {
  const [url, setUrl] = useState(initialUrl);
  const [pageTitle, setPageTitle] = useState('Meikai Browser');

  // Update URL periodically (since we can't directly access content webview's URL)
  useEffect(() => {
    const contentLabel = windowLabel.replace('window-', 'content-');
    
    const updateUrl = async () => {
      try {
        const currentUrl = await invoke<string>('get_current_url', { windowLabel: contentLabel });
        if (currentUrl && currentUrl !== url) {
          setUrl(currentUrl);
          // Extract domain for display
          try {
            const urlObj = new URL(currentUrl);
            setPageTitle(urlObj.hostname);
          } catch {
            setPageTitle('Meikai Browser');
          }
        }
      } catch {
        // Window might not exist yet
      }
    };

    updateUrl();
    const interval = setInterval(updateUrl, 1000);
    return () => clearInterval(interval);
  }, [windowLabel, url]);

  const handleMinimize = async () => {
    await invoke('titlebar_minimize', { windowLabel });
  };

  const handleMaximize = async () => {
    await invoke('titlebar_maximize', { windowLabel });
  };

  const handleClose = async () => {
    await invoke('titlebar_close', { windowLabel });
  };

  const handleMouseDown = async (e: React.MouseEvent) => {
    // Only trigger drag on left mouse button and when clicking the draggable area
    if (e.button === 0 && (e.target as HTMLElement).dataset.dragRegion) {
      await invoke('titlebar_drag', { windowLabel });
    }
  };

  const handleDoubleClick = async (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).dataset.dragRegion) {
      await handleMaximize();
    }
  };

  return (
    <div 
      className="flex items-center justify-between h-[20px] bg-white select-none font-poppins"
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {/* Drag region - left side */}
      <div 
        className="flex-1 h-full flex items-center pl-3 cursor-default" 
        data-drag-region="true"
      >
        <div className="flex items-center gap-2" data-drag-region="true">
          <span 
            className="text-[10px] tracking-widest font-medium text-white/50 max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap"
            data-drag-region="true"
          >
            {pageTitle}
          </span>
        </div>
      </div>

      {/* Window controls - right side */}
      <div className="flex h-full mr-2 gap-2">
        <button 
          onClick={handleMinimize}
          title="Minimize"
        >
          <div className="w-8 h-2 bg-orange-200 hover:bg-orange-300 rounded-full"></div>
        </button>
        <button 
          onClick={handleMaximize}
          title="Maximize"
        >
          <div className="w-8 h-2 bg-green-200 hover:bg-green-300 rounded-full"></div>
        </button>
        <button 
          onClick={handleClose}
          title="Close"
        >
          <div className="w-8 h-2 bg-red-300 hover:bg-red-400 rounded-full"></div>
        </button>
      </div>
    </div>
  );
}

// Main component that parses URL params and renders TitleBar
export default function TitleBarPage() {
  const [windowLabel, setWindowLabel] = useState<string | null>(null);
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const label = params.get('windowLabel');
    const urlParam = params.get('url');
    
    if (label) setWindowLabel(label);
    if (urlParam) setUrl(decodeURIComponent(urlParam));
  }, []);

  if (!windowLabel) {
    return <div className="flex items-center justify-between h-10 bg-gradient-to-b from-[#1a1a2e] to-[#16213e] border-b border-white/10 select-none font-poppins">Loading...</div>;
  }

  return <TitleBar windowLabel={windowLabel} initialUrl={url} />;
}
