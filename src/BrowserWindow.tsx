import { useState, useEffect } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { ChevronLeft, ChevronRight, RotateCw, X, Minus, Square, Home } from 'lucide-react';

export default function BrowserWindow() {
  const [url, setUrl] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    // Get initial URL from window query params
    const urlParams = new URLSearchParams(window.location.search);
    const initialUrl = urlParams.get('url') || 'https://www.google.com';
    setUrl(initialUrl);
    setCurrentUrl(initialUrl);
    setHistory([initialUrl]);
    setHistoryIndex(0);
  }, []);

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    let targetUrl = url.trim();

    // URL detection logic (same as App.tsx)
    const isUrl = targetUrl.includes('.') && !targetUrl.includes(' ');

    if (!isUrl) {
      targetUrl = `https://www.google.com/search?q=${encodeURIComponent(targetUrl)}`;
    } else if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(targetUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentUrl(targetUrl);
    setUrl(targetUrl);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const prevUrl = history[newIndex];
      setCurrentUrl(prevUrl);
      setUrl(prevUrl);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextUrl = history[newIndex];
      setCurrentUrl(nextUrl);
      setUrl(nextUrl);
    }
  };

  const handleReload = () => {
    // Force iframe reload by adding timestamp
    setCurrentUrl(currentUrl + (currentUrl.includes('?') ? '&' : '?') + '_t=' + Date.now());
  };

  const handleHome = () => {
    const homeUrl = 'https://www.google.com';
    setUrl(homeUrl);
    setCurrentUrl(homeUrl);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(homeUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">
      {/* Custom Title Bar */}
      <div
        className="flex items-center justify-between h-8 bg-gray-800 select-none"
        data-tauri-drag-region
      >
        <div className="flex-1 text-xs px-3" data-tauri-drag-region>
          Meikai Browser
        </div>
        <div className="flex">
          <button
            onClick={() => getCurrentWindow().minimize()}
            className="h-8 w-12 hover:bg-gray-700 flex items-center justify-center"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => getCurrentWindow().toggleMaximize()}
            className="h-8 w-12 hover:bg-gray-700 flex items-center justify-center"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={() => getCurrentWindow().close()}
            className="h-8 w-12 hover:bg-red-600 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="flex items-center gap-2 p-2 bg-gray-800 border-b border-gray-700">
        <button
          onClick={handleBack}
          disabled={!canGoBack}
          className="p-2 rounded hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Go back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleForward}
          disabled={!canGoForward}
          className="p-2 rounded hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Go forward"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <button
          onClick={handleReload}
          className="p-2 rounded hover:bg-gray-700 transition-colors"
          title="Reload"
        >
          <RotateCw className="w-5 h-5" />
        </button>
        <button
          onClick={handleHome}
          className="p-2 rounded hover:bg-gray-700 transition-colors"
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

      {/* WebView Content Area */}
      <div className="flex-1 w-full h-full bg-white">
        <iframe
          key={currentUrl} // Force reload on URL change
          src={currentUrl}
          className="w-full h-full border-0"
          style={{ width: '100%', height: '100%' }}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-downloads"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    </div>
  );
}
