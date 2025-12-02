import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";


interface TrayProps {
  isVisible: boolean;
  onQuickLink: (url: string) => void;
}

export default function Tray({ isVisible, onQuickLink }: TrayProps) {
  const additionalLinks = [
    { name: "Reddit", url: "https://reddit.com" },
    { name: "Stack Overflow", url: "https://stackoverflow.com" },
    { name: "Medium", url: "https://medium.com" },
    { name: "LinkedIn", url: "https://linkedin.com" },
    { name: "Netflix", url: "https://netflix.com" },
    { name: "Amazon", url: "https://amazon.com" },
    { name: "Wikipedia", url: "https://wikipedia.org" },
    { name: "Spotify", url: "https://spotify.com" },
  ];

  return (
    <AnimatePresence mode="popLayout">
      {isVisible ? (
        <motion.div
          key="expanded-tray"
          initial={{ opacity: 1, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: [1,0], y: 60, scale: 0.95 }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1]
          }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="w-120 h-50 bg-white/70 backdrop-blur-md flex justify-center items-baseline shadow-xl rounded-2xl p-4 border border-black/10 overflow-hidden">
            <div className="flex gap-3 flex-wrap justify-center items-center max-w-2xl">
              {additionalLinks.map((site) => (
                <button
                  key={site.name}
                  onClick={() => onQuickLink(site.url)}
                  className="p-2 bg-white/80 backdrop-blur-md rounded-xl shadow-sm hover:shadow-md hover:bg-white transition-all hover:border-[#ee8a93] border border-transparent"
                >
                  <div className="text-xs font-poppins text-gray-800">{site.name}</div>
                </button>
              ))}
            </div>

            {/* Add new link */}
            <div className="absolute bottom-3 left-4 flex gap-2 justify-center items-center">
              <div className="bg-transparent hover:bg-red-100 hover:border-red-300 border border-transparent transition-all p-0.5 rounded-xl flex justify-center items-center">
                <Plus className="w-4 h-4 text-[#fd7e88]"></Plus>
              </div>

              <div className="flex justify-center">
                <input
                  type="text"
                  value=""
                  className="w-96 h-8 px-6 py-2 bg-white rounded-xl hover:bg-white/50 backdrop-blur-lg text-sm font-poppins shadow-md hover:shadow-lg border border-transparent focus:border-[#ee8a93] focus:outline-none transition-all placeholder-gray-600"
                  placeholder="Add new link"
                  autoFocus
                />
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="collapsed-tray"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 1 }}
          transition={{
            duration: 0.2,
            ease: [0.4, 0, 0.2, 1]
          }}
          className="relative flex justify-center items-center"
        >
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-16 h-1 bg-white/70 shadow-xl shadow-black backdrop-blur-sm rounded-lg"></div>
        </motion.div>
      )}

      
    </AnimatePresence>
  );
}