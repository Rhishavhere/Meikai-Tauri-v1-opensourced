import { motion, AnimatePresence } from "framer-motion";
import { div } from "framer-motion/client";

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
    <AnimatePresence>
      {isVisible? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-white/70 backdrop-blur-md shadow-xl rounded-2xl p-4 border border-black/10">
            <div className="flex gap-3 justify-center items-center flex-wrap max-w-2xl">
              {additionalLinks.map((site) => (
                <button
                  key={site.name}
                  onClick={() => onQuickLink(site.url)}
                  className="p-2 bg-white/80 backdrop-blur-md rounded-xl shadow-sm hover:shadow-md hover:bg-white transition-all hover:border-blue-400 border border-transparent"
                >
                  <div className="text-xs font-poppins text-gray-800">{site.name}</div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      ):(
        <div>HI</div>
      )}
    </AnimatePresence>
  );
}