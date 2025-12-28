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

  // Corner radius size in pixels
  const cornerRadius = 12;

  return (
    <div 
      className="relative flex items-center justify-between h-[20px] bg-[#101010] select-none font-poppins"
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {/* Top-left corner overlay */}
      <div 
        className="absolute top-0 left-0 pointer-events-none z-50"
        style={{ width: cornerRadius, height: cornerRadius }}
      >
        <svg width={cornerRadius} height={cornerRadius} viewBox={`0 0 ${cornerRadius} ${cornerRadius}`}>
          <path
            d={`M 0 0 L ${cornerRadius} 0 L ${cornerRadius} ${cornerRadius} A ${cornerRadius} ${cornerRadius} 0 0 0 0 0 Z`}
            fill="#101010"
          />
        </svg>
      </div>

      {/* Top-right corner overlay */}
      <div 
        className="absolute top-0 right-0 pointer-events-none z-50"
        style={{ width: cornerRadius, height: cornerRadius }}
      >
        <svg width={cornerRadius} height={cornerRadius} viewBox={`0 0 ${cornerRadius} ${cornerRadius}`}>
          <path
            d={`M 0 0 L ${cornerRadius} 0 L ${cornerRadius} ${cornerRadius} A ${cornerRadius} ${cornerRadius} 0 0 1 0 0 Z`}
            fill="#101010"
          />
        </svg>
      </div>

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
    return <div className="flex items-center justify-between h-[20px]"/>
  }

  return <TitleBar windowLabel={windowLabel} initialUrl={url} />;
}
