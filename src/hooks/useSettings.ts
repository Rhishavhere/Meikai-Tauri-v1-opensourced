import { useState, useEffect, useCallback } from "react";
import { readTextFile, writeTextFile, exists, mkdir, BaseDirectory } from "@tauri-apps/plugin-fs";

export type Theme = "light" | "dark";
export type SearchEngine = "google" | "duckduckgo" | "bing" | "yahoo" | "brave";

export interface Settings {
  theme: Theme;
  searchEngine: SearchEngine;
  quickLinksLimit: number;
  animationsEnabled: boolean;
}

const SETTINGS_FILE = "settings.json";

const DEFAULT_SETTINGS: Settings = {
  theme: "light",
  searchEngine: "google",
  quickLinksLimit: 6,
  animationsEnabled: true,
};

// Search engine URL templates
export const SEARCH_ENGINES: Record<SearchEngine, { name: string; url: string; icon: string }> = {
  google: {
    name: "Google",
    url: "https://www.google.com/search?q=",
    icon: "🔍",
  },
  duckduckgo: {
    name: "DuckDuckGo",
    url: "https://duckduckgo.com/?q=",
    icon: "🦆",
  },
  bing: {
    name: "Bing",
    url: "https://www.bing.com/search?q=",
    icon: "🅱️",
  },
  yahoo: {
    name: "Yahoo",
    url: "https://search.yahoo.com/search?p=",
    icon: "🟣",
  },
  brave: {
    name: "Brave",
    url: "https://search.brave.com/search?q=",
    icon: "🦁",
  },
};

async function loadSettingsFromFile(): Promise<Settings> {
  try {
    const fileExists = await exists(SETTINGS_FILE, { baseDir: BaseDirectory.AppData });
    
    if (!fileExists) {
      await saveSettingsToFile(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    
    const content = await readTextFile(SETTINGS_FILE, { baseDir: BaseDirectory.AppData });
    const loaded = JSON.parse(content);
    // Merge with defaults to handle new settings
    const merged = { ...DEFAULT_SETTINGS, ...loaded };
    return merged;
  } catch (error) {
    return DEFAULT_SETTINGS;
  }
}

async function saveSettingsToFile(settings: Settings): Promise<void> {
  try {
    // Check if directory exists, create if not
    try {
      const dirExists = await exists("", { baseDir: BaseDirectory.AppData });
      if (!dirExists) {
        await mkdir("", { baseDir: BaseDirectory.AppData, recursive: true });
      }
    } catch {
      // Directory check/create may fail if already exists
    }
    
    const content = JSON.stringify(settings, null, 2);
    await writeTextFile(SETTINGS_FILE, content, { baseDir: BaseDirectory.AppData });
  } catch {
    // Settings save failed silently
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    loadSettingsFromFile().then((loaded) => {
      setSettings(loaded);
      setIsLoading(false);
      // Apply theme on load
      applyTheme(loaded.theme);
    });
  }, []);

  // Save to file whenever settings change (after initial load)
  useEffect(() => {
    if (!isLoading) {
      saveSettingsToFile(settings);
    }
  }, [settings, isLoading]);

  // Apply theme to document
  const applyTheme = useCallback((theme: Theme) => {
    document.documentElement.setAttribute("data-theme", theme);
  }, []);

  const updateSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: value };
      if (key === "theme") {
        applyTheme(value as Theme);
      }
      return newSettings;
    });
  }, [applyTheme]);

  const setTheme = useCallback((theme: Theme) => {
    updateSetting("theme", theme);
  }, [updateSetting]);

  const setSearchEngine = useCallback((engine: SearchEngine) => {
    updateSetting("searchEngine", engine);
  }, [updateSetting]);

  const setQuickLinksLimit = useCallback((limit: number) => {
    updateSetting("quickLinksLimit", Math.max(3, Math.min(6, limit)));
  }, [updateSetting]);

  const setAnimationsEnabled = useCallback((enabled: boolean) => {
    updateSetting("animationsEnabled", enabled);
  }, [updateSetting]);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    applyTheme(DEFAULT_SETTINGS.theme);
  }, [applyTheme]);

  // Get search URL for a query
  const getSearchUrl = useCallback((query: string) => {
    const engine = SEARCH_ENGINES[settings.searchEngine];
    return engine.url + encodeURIComponent(query);
  }, [settings.searchEngine]);

  return {
    settings,
    isLoading,
    setTheme,
    setSearchEngine,
    setQuickLinksLimit,
    setAnimationsEnabled,
    resetSettings,
    getSearchUrl,
    updateSetting,
  };
}

export default useSettings;
