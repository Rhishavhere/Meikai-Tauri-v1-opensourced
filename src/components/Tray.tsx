import { motion, AnimatePresence } from "framer-motion";


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
    <AnimatePresence mode="wait">
      {isVisible ? (
        <motion.div
          key="expanded-tray"
          initial={{ opacity: 1, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1]
          }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="w-120 h-50 bg-white/70 backdrop-blur-md shadow-xl rounded-2xl p-4 border border-black/10 overflow-hidden">
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
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-90 h-8 bg-white/70 shadow-xl shadow-black backdrop-blur-sm rounded-lg"></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}