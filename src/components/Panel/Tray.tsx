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

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return null;
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
              className="absolute inset-0 pointer-events-auto bg-black/10 backdrop-blur-xs rounded-xl"
              onClick={onClose} 
            />

            {/* Glass Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-2xl bg-white border-t border-[var(--color-border)] shadow-[var(--shadow-md)] rounded-t-3xl pointer-events-auto overflow-hidden flex flex-col max-h-[85vh] relative z-10"
            >
                
                {/* Handle Bar (Click to close) */}
                <div 
                  className="w-full flex justify-center pt-3 pb-1 cursor-pointer active:cursor-grabbing hover:opacity-70 transition-opacity"
                  onClick={onClose}
                >
                    <div className="w-12 h-1.5 bg-gray-300/50 rounded-full" />
                </div>

                {/* Header Actions */}
                <div className="px-6 py-2 flex items-center justify-between shrink-0">
                    <h2 className="font-poppins font-semibold text-[var(--color-text-primary)]">Your Apps</h2>
                    <button 
                        onClick={() => setIsAdding(!isAdding)}
                        className={`p-2 rounded-full transition-all ${isAdding ? 'bg-gray-100 text-gray-500 rotate-45' : 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]'}`}
                    >
                        <Plus className="w-5 h-5" />
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
                            className="px-6 overflow-hidden shrink-0"
                        >
                            <div className="bg-[var(--color-bg-secondary)] rounded-xl p-3 mb-4 space-y-2 border border-[var(--color-border)]">
                                <input
                                    type="text"
                                    placeholder="URL (e.g. twitter.com)"
                                    value={newAppUrl}
                                    onChange={e => setNewAppUrl(e.target.value)}
                                    className="w-full bg-transparent text-sm font-poppins focus:outline-none text-[var(--color-text-primary)]"
                                    autoFocus
                                />
                                <div className="h-[1px] bg-gray-200 w-full" />
                                <input
                                    type="text"
                                    placeholder="Name (optional)"
                                    value={newAppName}
                                    onChange={e => setNewAppName(e.target.value)}
                                    className="w-full bg-transparent text-sm font-poppins focus:outline-none text-[var(--color-text-secondary)]"
                                />
                                <button type="submit" className="hidden" /> 
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                {/* Compact List - Scrollable */}
                <div 
                  className="px-4 pb-8 overflow-y-auto overscroll-contain"
                  onWheel={handleWheel}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {bookmarks.map((bookmark) => (
                            <motion.div
                                key={bookmark.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="group relative flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer border border-transparent hover:border-[var(--color-border)]"
                                onClick={() => onQuickLink(bookmark.url)}
                            >
                                {/* Favicon */}
                                <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0 border border-gray-100 overflow-hidden">
                                    <img 
                                      src={getFaviconUrl(bookmark.url) || ""} 
                                      alt="" 
                                      className="w-6 h-6 object-contain" 
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                        (e.currentTarget.nextElementSibling as HTMLElement)?.style.setProperty("display", "block");
                                      }} 
                                    />
                                    <Globe className="w-5 h-5 text-gray-400 hidden" />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-poppins font-medium text-sm text-[var(--color-text-primary)] truncate">{bookmark.name}</h3>
                                    <p className="font-poppins text-xs text-[var(--color-text-secondary)] truncate opacity-70">{bookmark.url}</p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onToggleStar(bookmark.id); }}
                                        className={`p-1.5 rounded-lg transition-colors ${bookmark.starred ? 'text-amber-400 hover:text-amber-500 hover:bg-amber-50' : 'text-gray-400 hover:text-amber-400 hover:bg-amber-50'}`}
                                        title={bookmark.starred ? "Remove from Quick Links" : "Add to Quick Links"}
                                    >
                                        <Star className={`w-4 h-4 ${bookmark.starred ? 'fill-current' : ''}`} />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onDeleteBookmark(bookmark.id); }}
                                        className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                     <button 
                                        onClick={(e) => { e.stopPropagation(); onQuickLink(bookmark.url); }}
                                        className="p-1.5 hover:bg-blue-50 text-gray-400 hover:text-blue-500 rounded-lg transition-colors sm:hidden"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    
                    {bookmarks.length === 0 && (
                        <div className="text-center py-10 text-[var(--color-text-secondary)] opacity-50 font-poppins text-sm">
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
