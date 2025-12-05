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
      className="flex items-center justify-between h-10 bg-gradient-to-b from-[#1a1a2e] to-[#16213e] border-b border-white/10 select-none font-poppins"
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {/* Drag region - left side */}
      <div 
        className="flex-1 h-full flex items-center pl-3 cursor-default" 
        data-drag-region="true"
      >
        <div className="flex items-center gap-2" data-drag-region="true">
          <span className="text-base" data-drag-region="true">🌊</span>
          <span 
            className="text-[13px] font-medium text-white/85 max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap"
            data-drag-region="true"
          >
            {pageTitle}
          </span>
        </div>
      </div>

      {/* Window controls - right side */}
      <div className="flex h-full">
        <button 
          className="w-[46px] h-full flex items-center justify-center border-none bg-transparent text-white/70 cursor-pointer transition-all duration-150 hover:bg-white/10 hover:text-white/95"
          onClick={handleMinimize}
          title="Minimize"
        >
          <svg className="w-2.5 h-2.5" viewBox="0 0 12 12">
            <rect y="5" width="12" height="2" fill="currentColor" />
          </svg>
        </button>
        <button 
          className="w-[46px] h-full flex items-center justify-center border-none bg-transparent text-white/70 cursor-pointer transition-all duration-150 hover:bg-white/10 hover:text-white/95"
          onClick={handleMaximize}
          title="Maximize"
        >
          <svg className="w-2.5 h-2.5" viewBox="0 0 12 12">
            <rect x="1" y="1" width="10" height="10" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </button>
        <button 
          className="w-[46px] h-full flex items-center justify-center border-none bg-transparent text-white/70 cursor-pointer transition-all duration-150 hover:bg-[#e81123] hover:text-white"
          onClick={handleClose}
          title="Close"
        >
          <svg className="w-2.5 h-2.5" viewBox="0 0 12 12">
            <path d="M1 1L11 11M1 11L11 1" stroke="currentColor" strokeWidth="2" />
          </svg>
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
