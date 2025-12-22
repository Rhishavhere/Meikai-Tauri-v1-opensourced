import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Check, Globe } from "lucide-react";
import { Bookmark } from "../../hooks/useBookmarks";

interface TrayProps {
  isVisible: boolean;
  bookmarks: Bookmark[];
  onQuickLink: (url: string) => void;
  onAddBookmark: (name: string, url: string) => void;
  onEditBookmark: (id: string, name: string, url: string) => void;
  onDeleteBookmark: (id: string) => void;
}

interface ModalState {
  isOpen: boolean;
  mode: "add" | "edit";
  editingId?: string;
  name: string;
  url: string;
}

export default function Tray({
  isVisible,
  bookmarks,
  onQuickLink,
  onAddBookmark,
  onEditBookmark,
  onDeleteBookmark,
}: TrayProps) {
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    mode: "add",
    name: "",
    url: "",
  });
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const openAddModal = () => {
    setModal({ isOpen: true, mode: "add", name: "", url: "" });
  };

  const openEditModal = (bookmark: Bookmark) => {
    setModal({
      isOpen: true,
      mode: "edit",
      editingId: bookmark.id,
      name: bookmark.name,
      url: bookmark.url,
    });
  };

  const closeModal = () => {
    setModal({ isOpen: false, mode: "add", name: "", url: "" });
  };

  const handleSubmit = () => {
    if (!modal.name.trim() || !modal.url.trim()) return;

    if (modal.mode === "add") {
      onAddBookmark(modal.name.trim(), modal.url.trim());
    } else if (modal.mode === "edit" && modal.editingId) {
      onEditBookmark(modal.editingId, modal.name.trim(), modal.url.trim());
    }
    closeModal();
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteBookmark(id);
  };

  // Get favicon URL for a bookmark
  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return null;
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {isVisible ? (
          <motion.div
            key="expanded-tray"
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="fixed inset-0 z-40 bg-gradient-to-b from-white via-white to-gray-50"
          >
            {/* Header */}
            <div className="pt-12 pb-6 px-8">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <h1 className="text-3xl font-poppins font-semibold text-gray-800 mb-2">
                  Your Apps
                </h1>
                <p className="text-gray-500 font-poppins text-sm">
                  Quick access to your favorite sites
                </p>
              </motion.div>
            </div>

            {/* Apps Grid */}
            <div className="flex-1 px-8 pb-24 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-4 gap-4 max-w-2xl mx-auto"
              >
                {bookmarks.map((bookmark, index) => (
                  <motion.div
                    key={bookmark.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + index * 0.03 }}
                    className="relative group"
                    onMouseEnter={() => setHoveredId(bookmark.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <button
                      onClick={() => onQuickLink(bookmark.url)}
                      className="w-full p-4 bg-white hover:bg-gray-50 rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 hover:border-[#ee8a93] flex flex-col items-center gap-3"
                    >
                      {/* Favicon */}
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center overflow-hidden shadow-inner">
                        {getFaviconUrl(bookmark.url) ? (
                          <img
                            src={getFaviconUrl(bookmark.url)!}
                            alt=""
                            className="w-8 h-8"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <Globe className={`w-6 h-6 text-gray-400 ${getFaviconUrl(bookmark.url) ? 'hidden' : ''}`} />
                      </div>
                      
                      {/* Name */}
                      <span className="text-sm font-poppins text-gray-700 truncate w-full text-center">
                        {bookmark.name}
                      </span>
                    </button>

                    {/* Edit/Delete overlay */}
                    <AnimatePresence>
                      {hoveredId === bookmark.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute -top-2 -right-2 flex gap-1"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(bookmark);
                            }}
                            className="w-7 h-7 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(bookmark.id, e)}
                            className="w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}

                {/* Add New App Button */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + bookmarks.length * 0.03 }}
                  onClick={openAddModal}
                  className="w-full p-4 bg-gradient-to-br from-[#ee8a93]/10 to-[#fd7e88]/10 hover:from-[#ee8a93]/20 hover:to-[#fd7e88]/20 rounded-2xl border-2 border-dashed border-[#ee8a93]/40 hover:border-[#ee8a93] transition-all flex flex-col items-center gap-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ee8a93] to-[#fd7e88] flex items-center justify-center shadow-md">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-poppins text-[#ee8a93] font-medium">
                    Add App
                  </span>
                </motion.button>
              </motion.div>
            </div>

            {/* Scroll down indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
              <p className="text-xs text-gray-400 font-poppins">Scroll down to go back</p>
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-8 h-1 bg-[#ee8a93] rounded-full"
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="collapsed-tray"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{
              duration: 0.2,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="relative flex justify-center items-center"
          >
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#ee8a93] shadow-xl shadow-black backdrop-blur-sm rounded-lg"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] flex items-center justify-center"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-2xl w-80"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-poppins font-semibold text-gray-800">
                  {modal.mode === "add" ? "Add App" : "Edit App"}
                </h3>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-poppins text-gray-600 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={modal.name}
                    onChange={(e) =>
                      setModal((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full h-10 px-4 bg-gray-50 rounded-xl text-sm font-poppins border border-gray-200 focus:border-[#ee8a93] focus:outline-none transition-all"
                    placeholder="e.g., YouTube"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-poppins text-gray-600 mb-1">
                    URL
                  </label>
                  <input
                    type="text"
                    value={modal.url}
                    onChange={(e) =>
                      setModal((prev) => ({ ...prev, url: e.target.value }))
                    }
                    className="w-full h-10 px-4 bg-gray-50 rounded-xl text-sm font-poppins border border-gray-200 focus:border-[#ee8a93] focus:outline-none transition-all"
                    placeholder="e.g., youtube.com"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={closeModal}
                    className="flex-1 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-poppins text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!modal.name.trim() || !modal.url.trim()}
                    className="flex-1 h-10 bg-gradient-to-r from-[#ee8a93] to-[#fd7e88] hover:from-[#fd7e88] hover:to-[#ee8a93] text-white rounded-xl font-poppins text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    {modal.mode === "add" ? "Add" : "Save"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
