import { useState, useEffect, useCallback } from "react";
import { readTextFile, writeTextFile, exists, mkdir, BaseDirectory } from "@tauri-apps/plugin-fs";

export interface Bookmark {
  id: string;
  name: string;
  url: string;
  favicon?: string;
  starred?: boolean;
}

const BOOKMARKS_FILE = "bookmarks.json";

// Default bookmarks for first-time users (first 4 are starred for quick links)
const DEFAULT_BOOKMARKS: Bookmark[] = [
  { id: "1", name: "Google", url: "https://google.com", starred: true },
  { id: "2", name: "YouTube", url: "https://youtube.com", starred: true },
  { id: "3", name: "GitHub", url: "https://github.com", starred: true },
  { id: "4", name: "Twitter", url: "https://twitter.com", starred: true },
  { id: "5", name: "Reddit", url: "https://reddit.com", starred: false },
  { id: "6", name: "Stack Overflow", url: "https://stackoverflow.com", starred: false },
  { id: "7", name: "Medium", url: "https://medium.com", starred: false },
  { id: "8", name: "LinkedIn", url: "https://linkedin.com", starred: false },
];

async function loadBookmarksFromFile(): Promise<Bookmark[]> {
  try {
    const fileExists = await exists(BOOKMARKS_FILE, { baseDir: BaseDirectory.AppData });
    
    if (!fileExists) {
      await saveBookmarksToFile(DEFAULT_BOOKMARKS);
      return DEFAULT_BOOKMARKS;
    }
    
    const content = await readTextFile(BOOKMARKS_FILE, { baseDir: BaseDirectory.AppData });
    return JSON.parse(content);
  } catch (error) {
    console.error("Failed to load bookmarks from file:", error);
    return DEFAULT_BOOKMARKS;
  }
}

async function saveBookmarksToFile(bookmarks: Bookmark[]): Promise<void> {
  try {
    // Try to create the AppData directory if it doesn't exist
    // We do this by simply attempting the write - Tauri creates parent dirs automatically
    // If that fails, we try to create the directory first
    try {
      await writeTextFile(BOOKMARKS_FILE, JSON.stringify(bookmarks, null, 2), { baseDir: BaseDirectory.AppData });
    } catch {
      // Directory might not exist, try to create it
      await mkdir("", { baseDir: BaseDirectory.AppData, recursive: true });
      await writeTextFile(BOOKMARKS_FILE, JSON.stringify(bookmarks, null, 2), { baseDir: BaseDirectory.AppData });
    }
  } catch {
    // Failed to save bookmarks silently
  }
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load bookmarks on mount
  useEffect(() => {
    loadBookmarksFromFile().then((loaded) => {
      setBookmarks(loaded);
      setIsLoading(false);
    });
  }, []);

  // Save to file whenever bookmarks change (after initial load)
  useEffect(() => {
    if (!isLoading) {
      saveBookmarksToFile(bookmarks);
    }
  }, [bookmarks, isLoading]);

  const addBookmark = useCallback((name: string, url: string, starred: boolean = false) => {
    const newBookmark: Bookmark = {
      id: Date.now().toString(),
      name,
      url: url.startsWith("http") ? url : `https://${url}`,
      starred,
    };
    setBookmarks((prev) => [...prev, newBookmark]);
  }, []);

  const editBookmark = useCallback((id: string, name: string, url: string) => {
    setBookmarks((prev) =>
      prev.map((bookmark) =>
        bookmark.id === id
          ? { ...bookmark, name, url: url.startsWith("http") ? url : `https://${url}` }
          : bookmark
      )
    );
  }, []);

  const deleteBookmark = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== id));
  }, []);

  const toggleStar = useCallback((id: string) => {
    setBookmarks((prev) =>
      prev.map((bookmark) =>
        bookmark.id === id
          ? { ...bookmark, starred: !bookmark.starred }
          : bookmark
      )
    );
  }, []);

  const clearAllBookmarks = useCallback(() => {
    setBookmarks([]);
  }, []);

  const importBookmarks = useCallback((imported: Bookmark[]) => {
    // Merge imported bookmarks with existing, avoiding duplicates by URL
    setBookmarks((prev) => {
      const existingUrls = new Set(prev.map(b => b.url));
      const newBookmarks = imported.filter(b => !existingUrls.has(b.url));
      return [...prev, ...newBookmarks.map(b => ({
        ...b,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
      }))];
    });
  }, []);

  // Get only starred bookmarks for quick links
  const starredBookmarks = bookmarks.filter((b) => b.starred);

  return {
    bookmarks,
    starredBookmarks,
    isLoading,
    addBookmark,
    editBookmark,
    deleteBookmark,
    toggleStar,
    clearAllBookmarks,
    importBookmarks,
  };
}

export default useBookmarks;
