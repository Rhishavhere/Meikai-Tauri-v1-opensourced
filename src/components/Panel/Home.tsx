import { motion, Variants, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { 
  Search, 
  Globe, 
  User, 
  Settings,
  Clock,
  ArrowRight,
  Calendar,
  Star,
  Zap,
  Bookmark as BookmarkIcon,
  History,
  Download,
  EyeOff
} from "lucide-react";
import { Bookmark } from "../../hooks/useBookmarks";
import { Settings as SettingsType, SEARCH_ENGINES } from "../../hooks/useSettings";

interface HomeTabProps {
  onNavigate: (url: string) => void;
  onQuickLink: (url: string) => void;
  starredBookmarks: Bookmark[];
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenBookmarks: () => void;
  settings: SettingsType;
  getSearchUrl: (query: string) => string;
}

// Quick Actions toolbar items
const QUICK_ACTIONS = [
  { id: 'profile', icon: User, label: 'Profile' },
  { id: 'settings', icon: Settings, label: 'Settings' },
  { id: 'bookmarks', icon: BookmarkIcon, label: 'Bookmarks' },
  { id: 'history', icon: History, label: 'History' },
  { id: 'downloads', icon: Download, label: 'Downloads' },
  { id: 'incognito', icon: EyeOff, label: 'Incognito' },
];

export default function HomeTab({ 
  onNavigate, 
  onQuickLink, 
  starredBookmarks,
  onOpenProfile,
  onOpenSettings,
  onOpenBookmarks,
  settings,
  getSearchUrl
}: HomeTabProps) {
  const [url, setUrl] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced search suggestions fetch
  useEffect(() => {
    if (!url.trim() || url.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await invoke<string[]>("get_search_suggestions", { query: url });
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
        setSelectedIndex(-1);
      } catch {
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [url]);

  // Time update effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Handler for quick actions
  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'profile': onOpenProfile(); break;
      case 'settings': onOpenSettings(); break;
      case 'bookmarks': onOpenBookmarks(); break;
      case 'history':
      case 'downloads':
      case 'incognito':
        setShowComingSoon(true);
        setTimeout(() => setShowComingSoon(false), 2000);
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;

    navigateToUrl(trimmedUrl);
  };

  const navigateToUrl = (query: string) => {
    let fullUrl = query;

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

    setShowSuggestions(false);
    setSuggestions([]);
    onNavigate(fullUrl);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setUrl(suggestion);
    navigateToUrl(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        if (selectedIndex >= 0) {
          e.preventDefault();
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
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



  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });

  const shouldAnimate = settings.animationsEnabled;

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] font-poppins selection:bg-[var(--color-accent)]/30">
      
      {/* Coming Soon Toast */}
      <AnimatePresence>
        {showComingSoon && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] shadow-lg"
          >
            <span className="font-poppins text-sm text-[var(--color-text-primary)]">Coming soon!</span>
          </motion.div>
        )}
      </AnimatePresence>
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
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
              <img 
                src={settings.theme === "dark" ? "/logo-dark.png" : "/logo-light.png"} 
                alt="Meikai" 
                className={`w-8 h-8 object-contain`}
              />
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

          {/* <motion.div variants={itemVariants} className="flex gap-2">
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
          </motion.div> */}
        </div>

        {/* Main Content - Bento Grid Layout */}
        <div className="flex-1 grid grid-cols-10 gap-4 max-h-[calc(100vh-140px)] overflow-hidden">
          
          {/* Left Column */}
          <div className="col-span-2 flex flex-col gap-4">
            
            {/* Time Widget */}
            <motion.div 
              variants={itemVariants}
              className="bg-gradient-to-br from-[var(--color-bg-primary)] to-[var(--color-bg-primary)]/80 backdrop-blur-xl rounded-2xl border border-[var(--color-border)] p-5 relative overflow-hidden group transition-all duration-300"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-[var(--color-accent)]" />
                  <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-text-secondary)]">Local Time</span>
                </div>
                <p className="text-2xl text-[var(--color-text-secondary)] font-medium tracking-tight font-zain">{formattedTime}</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  {currentTime.toLocaleDateString([], { year: 'numeric' })}
                </p>
              </div>
            </motion.div>

            {/* Quick Actions - Vertical Card */}
            <motion.div 
              variants={itemVariants}
              className="flex-1 bg-[var(--color-bg-primary)]/60 backdrop-blur-sm rounded-2xl border border-[var(--color-border)] p-3 flex flex-col gap-1"
            >
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action.id)}
                    className="group flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-all duration-200 text-left"
                  >
                    <Icon className="w-4 h-4 text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)] transition-colors shrink-0" />
                    <span className="text-xs text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">{action.label}</span>
                  </button>
                );
              })}
            </motion.div>

            {/* Meikai Info */}
            <motion.div 
              variants={itemVariants}
              className="bg-[var(--color-bg-primary)]/30 rounded-2xl p-4"
            >
              <div className="text-center space-y-1">
                <p className="text-xs font-light text-[var(--color-text-primary)]/50">Meikai - v0.1.4<br/> Private Beta</p>
                {/* <p className="text-[10px] text-[var(--color-text-secondary)]/60">
                  
                </p> */}
              </div>
            </motion.div>
          </div>
          
          {/* Center - Search & Brand */}
          <motion.div 
            variants={itemVariants}
            className="col-span-8 bg-gradient-to-br from-[var(--color-bg-primary)] via-[var(--color-bg-primary)] to-[var(--color-bg-primary)]/90 backdrop-blur-xl rounded-2xl border border-[var(--color-border)] p-8 flex flex-col justify-center items-center relative overflow-hidden group transition-all duration-500"
          >
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 w-32 h-32 bg-[var(--color-accent)]/8 blur-3xl rounded-full" />
            <div className="absolute bottom-4 left-4 w-24 h-24 bg-blue-500/5 blur-2xl rounded-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-secondary)]/30 to-transparent opacity-50" />
            
            <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center">
              {/* Brand */}
              <div className="mb-8 text-center">
                <h2 className="font-tangerine text-7xl text-[var(--color-accent)] opacity-90 mb-2">Meikai</h2>
                <p className="text-xs text-[var(--color-text-secondary)]/60 uppercase tracking-[0.3em]">Seamless <span className="text-[var(--color-accent)]">Browsing</span></p>
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
                    onBlur={() => {
                      setIsFocused(false);
                      // Delay hiding to allow click on suggestion
                      setTimeout(() => setShowSuggestions(false), 150);
                    }}
                    onKeyDown={handleKeyDown}
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

                {/* Suggestions Dropdown */}
                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                      ref={suggestionsRef}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl shadow-xl overflow-hidden z-50"
                    >
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                            index === selectedIndex
                              ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                              : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]'
                          }`}
                        >
                          <Search className="w-3.5 h-3.5 text-[var(--color-text-secondary)] shrink-0" />
                          <span className="truncate">{suggestion}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
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

        {/* Bottom Slide Indicator */}
        <motion.div 
          variants={itemVariants}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 cursor-pointer group"
        >
          <div className="w-20 h-1 rounded-full bg-[var(--color-accent)]/80 group-hover:bg-[var(--color-accent)]/50 transition-colors mt-1" />
        </motion.div>

      </motion.div>
    </div>
  );
}
