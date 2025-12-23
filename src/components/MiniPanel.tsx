import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Globe, Star, ExternalLink, Bookmark } from 'lucide-react';
import { Bookmark as BookmarkType } from "../hooks/useBookmarks";

interface MiniPanelProps {
  isVisible: boolean;
  onNavigate: (url: string) => void;
  onClose: () => void;
  bookmarks: BookmarkType[];
  starredBookmarks: BookmarkType[];
  getSearchUrl: (query: string) => string;
}

export function MiniPanel({ 
  isVisible, 
  onNavigate, 
  onClose, 
  bookmarks,
  starredBookmarks,
  getSearchUrl
}: MiniPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Filter bookmarks based on search query (for left panel search results)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return bookmarks.filter(
      b => b.name.toLowerCase().includes(query) || b.url.toLowerCase().includes(query)
    );
  }, [bookmarks, searchQuery]);

  // Get favicon URL for a bookmark
  const getFaviconUrl = (bookmarkUrl: string) => {
    try {
      const domain = new URL(bookmarkUrl.startsWith("http") ? bookmarkUrl : `https://${bookmarkUrl}`).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;

    let fullUrl = trimmedQuery;

    const isUrl = fullUrl.includes('.') && !fullUrl.includes(' ') ||
                   fullUrl.startsWith("http://") ||
                   fullUrl.startsWith("https://");

    if (isUrl) {
      if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
        fullUrl = "https://" + fullUrl;
      }
    } else {
      fullUrl = getSearchUrl(trimmedQuery);
    }

    onNavigate(fullUrl);
    setSearchQuery("");
  };

  const handleBookmarkClick = (url: string) => {
    onNavigate(url);
    setSearchQuery("");
  };

  // Focus input when panel becomes visible
  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isVisible) {
      setSearchQuery("");
    }
  }, [isVisible]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisible, onClose]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop overlay */}
          <div className="absolute inset-0 top-12 bg-transparent" />

          {/* Two Card Layout */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute top-14 left-0 right-0 mx-4 z-50 flex gap-3"
          >
            {/* LEFT CARD - Search & Quick Links (Wider) */}
            <div className="flex-[2] bg-[var(--color-bg-primary)] backdrop-blur-xl rounded-2xl shadow-md border border-[var(--color-border)] overflow-hidden">
              <div className="font-poppins p-3 border-b border-[var(--color-border)]">
                New Window
              </div>
              {/* Search Input */}
              <form onSubmit={handleSubmit} className="p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search or enter URL..."
                    className="w-full h-10 pl-10 pr-10 bg-[var(--color-bg-secondary)] rounded-xl text-sm text-[var(--color-text-primary)] border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all placeholder-[var(--color-text-secondary)] font-poppins"
                  />
                  <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-[var(--color-text-secondary)]" />
                  </button>
                </div>
              </form>

              {/* Content Area */}
              <div className="p-3 max-h-[200px] overflow-y-auto">
                
                {/* Search Results - Only when searching */}
                {isSearching ? (
                  <div>
                    <p className="text-[10px] font-poppins text-[var(--color-text-secondary)] uppercase tracking-wider mb-2 px-1">
                      Results ({searchResults.length})
                    </p>
                    {searchResults.length > 0 ? (
                      <div className="space-y-1">
                        {searchResults.slice(0, 8).map((bookmark) => (
                          <motion.button
                            key={bookmark.id}
                            whileHover={{ x: 2 }}
                            onClick={() => handleBookmarkClick(bookmark.url)}
                            className="w-full flex items-center gap-3 px-3 py-2 bg-[var(--color-bg-secondary)]/50 hover:bg-[var(--color-bg-secondary)] rounded-xl transition-all group"
                          >
                            <div className="w-5 h-5 rounded-lg bg-[var(--color-bg-secondary)] flex items-center justify-center overflow-hidden flex-shrink-0">
                              {getFaviconUrl(bookmark.url) ? (
                                <img src={getFaviconUrl(bookmark.url)!} alt="" className="w-4 h-4" />
                              ) : (
                                <Globe className="w-3 h-3 text-[var(--color-text-secondary)]" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <span className="text-sm font-poppins text-[var(--color-text-primary)] truncate block">{bookmark.name}</span>
                            </div>
                            {bookmark.starred && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-sm font-poppins text-[var(--color-text-secondary)]">No bookmarks found</p>
                        <button onClick={handleSubmit} className="mt-2 text-xs font-poppins text-[var(--color-accent)] hover:underline">
                          Search the web for "{searchQuery}"
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Quick Links - Only when not searching */
                  <div>
                    <p className="text-[10px] font-poppins text-[var(--color-text-secondary)] uppercase tracking-wider mb-2 px-1">
                      Quick Links
                    </p>
                    {starredBookmarks.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {starredBookmarks.slice(0, 8).map((bookmark) => (
                          <motion.button
                            key={bookmark.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleBookmarkClick(bookmark.url)}
                            className="flex items-center gap-2 px-3 py-2 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-accent)]/10 rounded-xl transition-all border border-transparent hover:border-[var(--color-accent)]/30"
                          >
                            <div className="w-5 h-5 rounded-lg bg-[var(--color-bg-primary)] flex items-center justify-center overflow-hidden flex-shrink-0">
                              {getFaviconUrl(bookmark.url) ? (
                                <img src={getFaviconUrl(bookmark.url)!} alt="" className="w-4 h-4" />
                              ) : (
                                <Globe className="w-3 h-3 text-[var(--color-text-secondary)]" />
                              )}
                            </div>
                            <span className="text-[14px] font-poppins text-[var(--color-text-primary)] truncate">
                              {bookmark.name}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Star className="w-8 h-8 text-[var(--color-text-secondary)]/30 mx-auto mb-2" />
                        <p className="text-sm font-poppins text-[var(--color-text-secondary)]">No quick links yet</p>
                        <p className="text-xs font-poppins text-[var(--color-text-secondary)]/60 mt-1">Star bookmarks to add them here</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT CARD - All Bookmarks (Compact) */}
            <div className="flex-1 bg-[var(--color-bg-primary)] backdrop-blur-xl rounded-2xl shadow-md border border-[var(--color-border)] overflow-hidden max-w-[260px]">
              
              {/* Header */}
              <div className="px-3 py-2.5 border-b border-[var(--color-border)] flex items-center gap-2">
                <Bookmark className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span className="text-xs font-poppins font-medium text-[var(--color-text-primary)]">All Bookmarks</span>
                <span className="text-[10px] font-poppins text-[var(--color-text-secondary)] ml-auto">{bookmarks.length}</span>
              </div>

              {/* Bookmarks List */}
              <div className="p-2 max-h-[200px] overflow-y-auto">
                {bookmarks.length > 0 ? (
                  <div className="space-y-0">
                    {bookmarks.map((bookmark) => (
                      <button
                        key={bookmark.id}
                        onClick={() => handleBookmarkClick(bookmark.url)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-[var(--color-bg-secondary)] rounded-lg transition-all group text-left"
                      >
                        <div className="w-4 h-4 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                          {getFaviconUrl(bookmark.url) ? (
                            <img src={getFaviconUrl(bookmark.url)!} alt="" className="w-3.5 h-3.5" />
                          ) : (
                            <Globe className="w-3 h-3 text-[var(--color-text-secondary)]" />
                          )}
                        </div>
                        <span className="text-xs font-poppins text-[var(--color-text-primary)] truncate flex-1">
                          {bookmark.name}
                        </span>
                        {bookmark.starred && (
                          <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                        )}
                        <ExternalLink className="w-3 h-3 text-[var(--color-text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Globe className="w-8 h-8 text-[var(--color-text-secondary)]/30 mx-auto mb-2" />
                    <p className="text-xs font-poppins text-[var(--color-text-secondary)]">No bookmarks yet</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
