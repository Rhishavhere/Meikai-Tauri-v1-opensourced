import { motion, AnimatePresence, Variants } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { 
  Search, 
  Globe, 
  User, 
  Settings,
  Sparkles,
  Clock,
  Lightbulb,
  ArrowRight,
  Calendar,
  Star,
  Zap
} from "lucide-react";
import { Bookmark } from "../../hooks/useBookmarks";
import { Settings as SettingsType, SEARCH_ENGINES } from "../../hooks/useSettings";

interface HomeTabProps {
  onNavigate: (url: string) => void;
  onQuickLink: (url: string) => void;
  starredBookmarks: Bookmark[];
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  settings: SettingsType;
  getSearchUrl: (query: string) => string;
}

const TIPS = [
  { icon: "⌨️", text: "Press Ctrl+T to open a new tab quickly." },
  { icon: "🔄", text: "You can drag tabs to reorder them." },
  { icon: "🔇", text: "Right-click on a tab to mute audio." },
  { icon: "⭐", text: "Use bookmarks to save your favorite sites." },
  { icon: "🌙", text: "Dark mode saves battery on OLED screens." },
  { icon: "🇯🇵", text: "Meikai means 'Clear' in Japanese." },
  { icon: "📑", text: "Hover over tab strip to scroll through tabs." },
  { icon: "⚙️", text: "Customize your experience in Settings." }
];

export default function HomeTab({ 
  onNavigate, 
  onQuickLink, 
  starredBookmarks,
  onOpenProfile,
  onOpenSettings,
  settings,
  getSearchUrl
}: HomeTabProps) {
  const [url, setUrl] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Time update effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Tip rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;

    let fullUrl = trimmedUrl;

    const isUrl =
      (fullUrl.includes(".") && !fullUrl.includes(" ")) ||
      fullUrl.startsWith("http://") ||
      fullUrl.startsWith("https://");

    if (isUrl) {
      if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
        fullUrl = "https://" + fullUrl;
      }
    } else {
      fullUrl = getSearchUrl(fullUrl);
    }

    onNavigate(fullUrl);
  };

  const getFaviconUrl = (bookmarkUrl: string) => {
    try {
      const domain = new URL(bookmarkUrl.startsWith("http") ? bookmarkUrl : `https://${bookmarkUrl}`).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return null;
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 400, damping: 28 }
    }
  };

  const tipVariants: Variants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -15 }
  };

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });

  const shouldAnimate = settings.animationsEnabled;

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] font-poppins selection:bg-[var(--color-accent)]/30">
      
      {/* Enhanced Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-30%] right-[-15%] w-[700px] h-[700px] bg-[var(--color-accent)]/8 blur-[150px] rounded-full animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-25%] left-[-15%] w-[600px] h-[600px] bg-blue-500/6 blur-[130px] rounded-full animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-purple-500/5 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '12s' }} />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'linear-gradient(var(--color-text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-text-primary) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      <motion.div 
        className="w-full h-full p-6 flex flex-col z-10"
        variants={shouldAnimate ? containerVariants : undefined}
        initial={shouldAnimate ? "hidden" : "visible"}
        animate="visible"
      >
        {/* Compact Header */}
        <div className="flex justify-between items-center mb-6">
          <motion.div variants={itemVariants} className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-hover)] flex items-center justify-center shadow-lg shadow-[var(--color-accent)]/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                {getGreeting()}
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {formattedDate}
              </p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex gap-2">
            <button 
              onClick={onOpenProfile}
              className="p-2.5 rounded-xl bg-[var(--color-bg-primary)]/80 backdrop-blur-sm border border-[var(--color-border)] hover:border-[var(--color-accent)]/50 transition-all text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:scale-105 active:scale-95"
            >
              <User className="w-4 h-4" />
            </button>
            <button 
              onClick={onOpenSettings}
              className="p-2.5 rounded-xl bg-[var(--color-bg-primary)]/80 backdrop-blur-sm border border-[var(--color-border)] hover:border-[var(--color-accent)]/50 transition-all text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:scale-105 active:scale-95"
            >
              <Settings className="w-4 h-4" />
            </button>
          </motion.div>
        </div>

        {/* Main Content - Bento Grid Layout */}
        <div className="flex-1 grid grid-cols-12 gap-4 max-h-[calc(100vh-140px)] overflow-hidden">
          
          {/* Left Column */}
          <div className="col-span-4 flex flex-col gap-4">
            
            {/* Time Widget */}
            <motion.div 
              variants={itemVariants}
              className="bg-gradient-to-br from-[var(--color-bg-primary)] to-[var(--color-bg-primary)]/80 backdrop-blur-xl rounded-2xl border border-[var(--color-border)] p-5 relative overflow-hidden group hover:border-[var(--color-accent)]/30 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-accent)]/5 blur-2xl rounded-full" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-[var(--color-accent)]" />
                  <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-text-secondary)]">Local Time</span>
                </div>
                <p className="text-4xl font-bold tracking-tight font-zain">{formattedTime}</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  {currentTime.toLocaleDateString([], { year: 'numeric' })}
                </p>
              </div>
            </motion.div>

            {/* Tips Widget */}
            <motion.div 
              variants={itemVariants}
              className="flex-1 bg-[var(--color-bg-primary)]/80 backdrop-blur-xl rounded-2xl border border-[var(--color-border)] p-5 relative overflow-hidden group hover:border-[var(--color-accent)]/30 transition-all duration-300"
            >
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-text-secondary)]">Quick Tip</span>
                </div>
                <div className="flex-1 flex items-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentTipIndex}
                      variants={shouldAnimate ? tipVariants : undefined}
                      initial={shouldAnimate ? "initial" : "animate"}
                      animate="animate"
                      exit={shouldAnimate ? "exit" : undefined}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col gap-2"
                    >
                      <span className="text-2xl">{TIPS[currentTipIndex].icon}</span>
                      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                        {TIPS[currentTipIndex].text}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
                {/* Tip Progress Dots */}
                <div className="flex gap-1 mt-4">
                  {TIPS.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        idx === currentTipIndex 
                          ? 'w-4 bg-[var(--color-accent)]' 
                          : 'w-1 bg-[var(--color-border)]'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Center - Search & Brand */}
          <motion.div 
            variants={itemVariants}
            className="col-span-8 bg-gradient-to-br from-[var(--color-bg-primary)] via-[var(--color-bg-primary)] to-[var(--color-bg-primary)]/90 backdrop-blur-xl rounded-2xl border border-[var(--color-border)] p-8 flex flex-col justify-center items-center relative overflow-hidden group hover:border-[var(--color-accent)]/20 transition-all duration-500"
          >
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 w-32 h-32 bg-[var(--color-accent)]/8 blur-3xl rounded-full" />
            <div className="absolute bottom-4 left-4 w-24 h-24 bg-blue-500/5 blur-2xl rounded-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-secondary)]/30 to-transparent opacity-50" />
            
            <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center">
              {/* Brand */}
              <div className="mb-8 text-center">
                <h2 className="font-tangerine text-7xl text-[var(--color-accent)] opacity-90 mb-2">Meikai</h2>
                <p className="text-xs text-[var(--color-text-secondary)]/60 uppercase tracking-[0.3em]">Browser</p>
              </div>
               
              {/* Search Bar */}
              <form onSubmit={handleSubmit} className="w-full relative">
                <div className={`
                  flex items-center gap-3 w-full h-12 px-5
                  bg-[var(--color-bg-secondary)]/80 backdrop-blur-sm rounded-xl
                  border-2 transition-all duration-300
                  ${isFocused 
                    ? 'border-[var(--color-accent)] shadow-lg shadow-[var(--color-accent)]/10' 
                    : 'border-transparent hover:border-[var(--color-border)]'
                  }
                `}>
                  <Search className={`w-4 h-4 shrink-0 transition-colors ${isFocused ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)]'}`} />
                  <input
                    ref={inputRef}
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="flex-1 bg-transparent text-sm focus:outline-none placeholder-[var(--color-text-secondary)]/40"
                    placeholder={`Search ${SEARCH_ENGINES[settings.searchEngine].name} or enter URL...`}
                    autoFocus
                  />
                  {url && (
                    <motion.button 
                      type="submit"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="p-1.5 rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </motion.button>
                  )}
                </div>
              </form>

              {/* Quick Links */}
              <div className="mt-8 w-full">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Star className="w-3 h-3 text-[var(--color-accent)]" />
                  <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-text-secondary)]">Quick Links</span>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {starredBookmarks.slice(0, 6).map((bookmark, index) => (
                    <motion.button
                      key={bookmark.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => onQuickLink(bookmark.url)}
                      className="group/link flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[var(--color-bg-secondary)]/60 backdrop-blur-sm border border-[var(--color-border)] hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-bg-secondary)] transition-all duration-200 hover:shadow-md hover:shadow-[var(--color-accent)]/5"
                      title={bookmark.name}
                    >
                      <div className="w-5 h-5 rounded-md bg-[var(--color-bg-primary)] flex items-center justify-center overflow-hidden">
                        {getFaviconUrl(bookmark.url) ? (
                          <img src={getFaviconUrl(bookmark.url)!} alt="" className="w-3.5 h-3.5" />
                        ) : (
                          <Globe className="w-3 h-3 text-[var(--color-text-secondary)]" />
                        )}
                      </div>
                      <span className="text-xs font-medium max-w-[100px] truncate group-hover/link:text-[var(--color-accent)] transition-colors">{bookmark.name}</span>
                    </motion.button>
                  ))}
                  {starredBookmarks.length === 0 && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-[var(--color-border)] text-[var(--color-text-secondary)]/50">
                      <Zap className="w-4 h-4" />
                      <span className="text-xs">Pin bookmarks to see them here</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}
