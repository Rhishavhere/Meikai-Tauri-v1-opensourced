import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Globe, Trash2, ExternalLink, Star } from "lucide-react";
import { Bookmark } from "../../hooks/useBookmarks";

interface TrayProps {
  isVisible: boolean;
  bookmarks: Bookmark[];
  onQuickLink: (url: string) => void;
  onAddBookmark: (name: string, url: string) => void;
  onDeleteBookmark: (id: string) => void;
  onToggleStar: (id: string) => void;
  onClose: () => void;
}

export default function Tray({
  isVisible,
  bookmarks,
  onQuickLink,
  onAddBookmark,
  onDeleteBookmark,
  onToggleStar,
  onClose,
}: TrayProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newAppUrl, setNewAppUrl] = useState("");
  const [newAppName, setNewAppName] = useState("");

  const getFaviconUrls = (url: string): string[] => {
    try {
      const parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
      const domain = parsedUrl.hostname;
      const origin = parsedUrl.origin;
      return [
        `${origin}/favicon.ico`, // Try direct favicon first
        `https://www.google.com/s2/favicons?domain=${domain}&sz=64`, // Google as fallback
      ];
    } catch {
      return [];
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppUrl) return;
    
    // Auto-generate name from URL if empty
    let name = newAppName;
    if (!name) {
      try {
        const hostname = new URL(newAppUrl.startsWith("http") ? newAppUrl : `https://${newAppUrl}`).hostname;
        name = hostname.replace("www.", "").split(".")[0];
        name = name.charAt(0).toUpperCase() + name.slice(1);
      } catch {
        name = "Bookmark";
      }
    }

    onAddBookmark(name, newAppUrl);
    setNewAppName("");
    setNewAppUrl("");
    setIsAdding(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    // We only care about closing interactions here
    // e.deltaY < 0 means scrolling UP
    if (e.deltaY < 0) {
      const target = e.currentTarget as HTMLDivElement;
      // If we are at the top of the scroll container
      if (target.scrollTop <= 0) {
        onClose();
      }
    }
    // Prevent bubbling to parent Panel, which handles OPEN logic
    e.stopPropagation();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="tray-overlay"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-end pointer-events-none"
        >
            {/* Click-outside backdrop with dim blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 pointer-events-auto bg-black/10 backdrop-blur-xs rounded-[clamp(0.5rem,1.5vw,0.75rem)]"
              onClick={onClose} 
            />

            {/* Glass Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-[calc(100%-6rem)] max-w-2xl mx-4 bg-white border-t border-[var(--color-border)] shadow-[var(--shadow-md)] rounded-t-[clamp(1rem,3vw,1.5rem)] pointer-events-auto overflow-hidden flex flex-col max-h-[85vh] relative z-10"
            >
                
                {/* Handle Bar (Click to close) */}
                <div 
                  className="w-full flex justify-center pt-[clamp(0.5rem,1.5vw,0.75rem)] pb-[clamp(0.125rem,0.5vw,0.25rem)] cursor-pointer active:cursor-grabbing hover:opacity-70 transition-opacity"
                  onClick={onClose}
                >
                    <div className="w-[clamp(2rem,5vw,3rem)] h-[clamp(0.25rem,0.75vw,0.375rem)] bg-gray-300/50 rounded-full" />
                </div>

                {/* Header Actions */}
                <div className="px-[clamp(1rem,3vw,1.5rem)] py-[clamp(0.25rem,1vw,0.5rem)] flex items-center justify-between shrink-0">
                    <h2 className="font-poppins font-semibold text-[clamp(0.875rem,2vw,1rem)] text-[var(--color-text-primary)]">Your Apps</h2>
                    <button 
                        onClick={() => setIsAdding(!isAdding)}
                        className={`p-[clamp(0.25rem,0.75vw,0.5rem)] rounded-full transition-all ${isAdding ? 'bg-gray-100 text-gray-500 rotate-45' : 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]'}`}
                    >
                        <Plus className="w-[clamp(0.875rem,2vw,1.25rem)] h-[clamp(0.875rem,2vw,1.25rem)]" />
                    </button>
                </div>

                {/* Add Form */}
                <AnimatePresence>
                    {isAdding && (
                        <motion.form
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            onSubmit={handleAddSubmit}
                            className="px-[clamp(1rem,3vw,1.5rem)] overflow-hidden shrink-0"
                        >
                            <div className="bg-[var(--color-bg-secondary)] rounded-[clamp(0.5rem,1.5vw,0.75rem)] p-[clamp(0.375rem,1vw,0.75rem)] mb-[clamp(0.5rem,1.5vw,1rem)] space-y-[clamp(0.25rem,0.75vw,0.5rem)] border border-[var(--color-border)]">
                                <input
                                    type="text"
                                    placeholder="URL (e.g. twitter.com)"
                                    value={newAppUrl}
                                    onChange={e => setNewAppUrl(e.target.value)}
                                    className="w-full bg-transparent text-[clamp(0.7rem,1.5vw,0.875rem)] font-poppins focus:outline-none text-[var(--color-text-primary)]"
                                    autoFocus
                                />
                                <div className="h-[1px] bg-gray-200 w-full" />
                                <input
                                    type="text"
                                    placeholder="Name (optional)"
                                    value={newAppName}
                                    onChange={e => setNewAppName(e.target.value)}
                                    className="w-full bg-transparent text-[clamp(0.7rem,1.5vw,0.875rem)] font-poppins focus:outline-none text-[var(--color-text-secondary)]"
                                />
                                <button type="submit" className="hidden" /> 
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                {/* Compact List - Scrollable */}
                <div 
                  className="px-[clamp(0.5rem,2vw,1rem)] pb-[clamp(1rem,3vw,2rem)] overflow-y-auto overscroll-contain"
                  onWheel={handleWheel}
                >
                    <div className="grid grid-cols-2 gap-[clamp(0.25rem,0.75vw,0.5rem)]">
                        {bookmarks.map((bookmark) => (
                            <motion.div
                                key={bookmark.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="group relative flex items-center gap-[clamp(0.375rem,1.25vw,0.75rem)] p-[clamp(0.375rem,1.25vw,0.75rem)] rounded-[clamp(0.5rem,1.5vw,0.75rem)] hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer border border-transparent hover:border-[var(--color-border)]"
                                onClick={() => onQuickLink(bookmark.url)}
                            >
                                {/* Favicon */}
                                <div className="w-[clamp(1.5rem,4vw,2.5rem)] h-[clamp(1.5rem,4vw,2.5rem)] rounded-[clamp(0.25rem,0.75vw,0.5rem)] bg-white shadow-sm flex items-center justify-center shrink-0 border border-gray-100 overflow-hidden">
                                    <img 
                                      src={getFaviconUrls(bookmark.url)[0] || ""} 
                                      alt="" 
                                      className="w-[clamp(0.875rem,2.5vw,1.5rem)] h-[clamp(0.875rem,2.5vw,1.5rem)] object-contain" 
                                      data-favicon-index="0"
                                      data-bookmark-url={bookmark.url}
                                      onError={(e) => {
                                        const img = e.currentTarget;
                                        const currentIndex = parseInt(img.dataset.faviconIndex || "0", 10);
                                        const urls = getFaviconUrls(img.dataset.bookmarkUrl || "");
                                        const nextIndex = currentIndex + 1;
                                        
                                        if (nextIndex < urls.length) {
                                          // Try the next URL in the list
                                          img.dataset.faviconIndex = nextIndex.toString();
                                          img.src = urls[nextIndex];
                                        } else {
                                          // All URLs failed, show fallback icon
                                          img.style.display = "none";
                                          (img.nextElementSibling as HTMLElement)?.style.setProperty("display", "block");
                                        }
                                      }} 
                                    />
                                    <Globe className="w-[clamp(0.75rem,2vw,1.25rem)] h-[clamp(0.75rem,2vw,1.25rem)] text-gray-400 hidden" />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-poppins font-medium text-[clamp(0.65rem,1.5vw,0.875rem)] text-[var(--color-text-primary)] truncate">{bookmark.name}</h3>
                                    <p className="font-poppins text-[clamp(0.55rem,1.25vw,0.75rem)] text-[var(--color-text-secondary)] truncate opacity-70">{bookmark.url}</p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-[clamp(0.125rem,0.5vw,0.25rem)] opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onToggleStar(bookmark.id); }}
                                        className={`p-[clamp(0.25rem,0.75vw,0.375rem)] rounded-[clamp(0.25rem,0.75vw,0.5rem)] transition-colors ${bookmark.starred ? 'text-amber-400 hover:text-amber-500 hover:bg-amber-50' : 'text-gray-400 hover:text-amber-400 hover:bg-amber-50'}`}
                                        title={bookmark.starred ? "Remove from Quick Links" : "Add to Quick Links"}
                                    >
                                        <Star className={`w-[clamp(0.625rem,1.5vw,1rem)] h-[clamp(0.625rem,1.5vw,1rem)] ${bookmark.starred ? 'fill-current' : ''}`} />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onDeleteBookmark(bookmark.id); }}
                                        className="p-[clamp(0.25rem,0.75vw,0.375rem)] hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-[clamp(0.25rem,0.75vw,0.5rem)] transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-[clamp(0.625rem,1.5vw,1rem)] h-[clamp(0.625rem,1.5vw,1rem)]" />
                                    </button>
                                     <button 
                                        onClick={(e) => { e.stopPropagation(); onQuickLink(bookmark.url); }}
                                        className="p-[clamp(0.25rem,0.75vw,0.375rem)] hover:bg-blue-50 text-gray-400 hover:text-blue-500 rounded-[clamp(0.25rem,0.75vw,0.5rem)] transition-colors sm:hidden"
                                    >
                                        <ExternalLink className="w-[clamp(0.625rem,1.5vw,1rem)] h-[clamp(0.625rem,1.5vw,1rem)]" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    
                    {bookmarks.length === 0 && (
                        <div className="text-center py-[clamp(1.5rem,5vw,2.5rem)] text-[var(--color-text-secondary)] opacity-50 font-poppins text-[clamp(0.7rem,1.5vw,0.875rem)]">
                            Always within reach.<br/>Add your first bookmark.
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
