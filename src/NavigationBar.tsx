import { useState, useEffect } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { invoke } from '@tauri-apps/api/core';
import { ChevronLeft, ChevronRight, RotateCw, X, Minus, Square, Home } from 'lucide-react';

export default function NavigationBar() {
  const [url, setUrl] = useState('');
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [contentWindowLabel, setContentWindowLabel] = useState('');

  useEffect(() => {
    // Get the content window label from query params
    const urlParams = new URLSearchParams(window.location.search);
    const initialUrl = urlParams.get('url') || 'https://www.google.com';
    const contentLabel = urlParams.get('content') || '';

    setUrl(initialUrl);
    setContentWindowLabel(contentLabel);
  }, []);

  const handleNavigate = async (e: React.FormEvent) => {
    e.preventDefault();
    let targetUrl = url.trim();

    // URL detection logic
    const isUrl = targetUrl.includes('.') && !targetUrl.includes(' ');

    if (!isUrl) {
      targetUrl = `https://www.google.com/search?q=${encodeURIComponent(targetUrl)}`;
    } else if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }

    try {
      await invoke('navigate_to_url', {
        windowLabel: contentWindowLabel,
        url: targetUrl
      });
      setUrl(targetUrl);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleBack = async () => {
    try {
      await invoke('go_back', { windowLabel: contentWindowLabel });
      // Note: In real implementation, you'd need to track navigation state
      setCanGoBack(false);
    } catch (error) {
      console.error('Back error:', error);
    }
  };

  const handleForward = async () => {
    try {
      await invoke('go_forward', { windowLabel: contentWindowLabel });
      setCanGoForward(false);
    } catch (error) {
      console.error('Forward error:', error);
    }
  };

  const handleReload = async () => {
    try {
      await invoke('reload_page', { windowLabel: contentWindowLabel });
    } catch (error) {
      console.error('Reload error:', error);
    }
  };

  const handleHome = async () => {
    const homeUrl = 'https://www.google.com';
    setUrl(homeUrl);
    try {
      await invoke('navigate_to_url', {
        windowLabel: contentWindowLabel,
        url: homeUrl
      });
    } catch (error) {
      console.error('Home error:', error);
    }
  };

  const closeWindow = async () => {
    try {
      // Close both the control and content windows
      await invoke('close_browser_window', { windowLabel: contentWindowLabel });
      await getCurrentWindow().close();
    } catch (error) {
      console.error('Close error:', error);
    }
  };

  const minimizeWindow = async () => {
    try {
      await invoke('minimize_browser_window', { windowLabel: contentWindowLabel });
    } catch (error) {
      console.error('Minimize error:', error);
    }
  };

  const maximizeWindow = async () => {
    try {
      await invoke('maximize_browser_window', { windowLabel: contentWindowLabel });
    } catch (error) {
      console.error('Maximize error:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-transparent">
      {/* Custom Title Bar */}
      <div
        className="flex items-center justify-between h-8 bg-gray-800/95 backdrop-blur-sm select-none shadow-lg"
        data-tauri-drag-region
      >
        <div className="flex-1 text-xs px-3 text-white" data-tauri-drag-region>
          Meikai Browser
        </div>
        <div className="flex">
          <button
            onClick={minimizeWindow}
            className="h-8 w-12 hover:bg-gray-700 flex items-center justify-center text-white transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={maximizeWindow}
            className="h-8 w-12 hover:bg-gray-700 flex items-center justify-center text-white transition-colors"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={closeWindow}
            className="h-8 w-12 hover:bg-red-600 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="flex items-center gap-2 p-2 bg-gray-800/95 backdrop-blur-sm shadow-lg">
        <button
          onClick={handleBack}
          disabled={!canGoBack}
          className="p-2 rounded hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white"
          title="Go back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleForward}
          disabled={!canGoForward}
          className="p-2 rounded hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white"
          title="Go forward"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <button
          onClick={handleReload}
          className="p-2 rounded hover:bg-gray-700 transition-colors text-white"
          title="Reload"
        >
          <RotateCw className="w-5 h-5" />
        </button>
        <button
          onClick={handleHome}
          className="p-2 rounded hover:bg-gray-700 transition-colors text-white"
          title="Home"
        >
          <Home className="w-5 h-5" />
        </button>

        {/* URL Bar */}
        <form onSubmit={handleNavigate} className="flex-1">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={(e) => e.target.select()}
            placeholder="Search or enter URL"
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </form>
      </div>

      {/* Transparent spacer - allows clicking through to content */}
      <div className="flex-1" />
    </div>
  );
}
