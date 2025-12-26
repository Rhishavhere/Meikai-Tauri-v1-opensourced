import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Rocket, Bug, X, BookCheck } from "lucide-react";

interface BetaDisclaimerProps {
  onDismiss: () => void;
}

export function BetaDisclaimer({ onDismiss }: BetaDisclaimerProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-6 rounded-xl"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(8px)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-xl"
          style={{
            backgroundColor: "var(--color-bg-primary)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            border: "1px solid var(--color-border)",
          }}
        >
          {/* Close button */}
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 p-2 rounded-full transition-colors hover:bg-[var(--color-bg-secondary)]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="p-6 pb-4 text-center border-b" style={{ borderColor: "var(--color-border)" }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: "rgba(251, 191, 36, 0.15)",
                color: "#f59e0b",
              }}
            >
              BETA VERSION
            </div>
            <h1 
              className="text-2xl font-semibold mb-2"
              style={{ 
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-poppins)",
              }}
            >
              Welcome to Meikai Browser
            </h1>
            <p 
              className="text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
             Please read through the following before you begin.
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            <section>
              <div className="flex items-center gap-2 mb-3">
                <BookCheck size={18} style={{ color: "#ef4444" }} />
                <h2 
                  className="font-semibold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Quick Guide
                </h2>
              </div>
              <ul 
                className="space-y-2 text-sm pl-6"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <li className="list-disc"><strong>Slide up in Home</strong> to open the bookmarks (app) menu</li>
                <li className="list-disc"><strong>Scroll in Dock</strong> to switch between tabs</li>
                <li className="list-disc">Star bookmarks to add them to Quick Links</li>
              </ul>
            </section>
            {/* Warnings Section */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={18} style={{ color: "#ef4444" }} />
                <h2 
                  className="font-semibold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Important Warnings
                </h2>
              </div>
              <ul 
                className="space-y-2 text-sm pl-6"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <li className="list-disc">This is an <strong>beta build</strong> - crashes and bugs may occur</li>
                <li className="list-disc">Your data may not persist between updates</li>
                <li className="list-disc">Some options in profile and settings are still in development</li>
              </ul>
            </section>

            {/* Features Not Implemented */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Rocket size={18} style={{ color: "#8b5cf6" }} />
                <h2 
                  className="font-semibold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Features Not Yet Implemented
                </h2>
              </div>
              <ul 
                className="space-y-2 text-sm pl-6"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <li className="list-disc">History tracking and management</li>
                <li className="list-disc">Downloads manager</li>
                <li className="list-disc">Ad-Blockers</li>
              </ul>
            </section>

            {/* Help Us Test */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Bug size={18} style={{ color: "#10b981" }} />
                <h2 
                  className="font-semibold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Help Us Test!
                </h2>
              </div>
              <ul 
                className="space-y-2 text-sm pl-6"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <li className="list-disc">Try browsing your favorite websites</li>
                <li className="list-disc">Check performance and memory usage</li>
                <li className="list-disc">Test the bookmark (app) system - add, star, organize</li>
                <li className="list-disc">Check if your settings persist between sessions</li>
                <li className="list-disc">Open multiple windows and switch between them</li>
                <li className="list-disc">Report any crashes, glitches, or unexpected behavior</li>
              </ul>
            </section>
          </div>

          {/* Footer */}
          <div className="p-6 pt-5 border-t" style={{ borderColor: "var(--color-border)" }}>
            <div className="text-center mb-5">
              <p
                className="text-lg font-semibold"
                style={{
                  background: "linear-gradient(135deg, #ee8a93, #a78bfa, #60a5fa)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Enjoy the calm. Enjoy the web.
              </p>
              {/* <p 
                className="text-sm mb-1"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Thank you, have a great day!
              </p> */}
            </div>
            <button
              onClick={onDismiss}
              className="w-full py-3.5 px-4 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg"
              style={{
                background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
                boxShadow: "0 4px 14px rgba(238, 138, 147, 0.4)",
              }}
            >
              I Understand - Let's Go!
            </button>
            <p 
              className="text-[11px] text-center mt-3 opacity-60"
              style={{ color: "var(--color-text-secondary)" }}
            >
              This message won't appear again on this device.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default BetaDisclaimer;
