import { useState, useEffect, useCallback } from "react";
import { readTextFile, writeTextFile, exists, mkdir, BaseDirectory } from "@tauri-apps/plugin-fs";

export interface Bookmark {
  id: string;
  name: string;
  url: string;
  favicon?: string;
}

const BOOKMARKS_FILE = "bookmarks.json";

// Default bookmarks for first-time users
const DEFAULT_BOOKMARKS: Bookmark[] = [
  { id: "1", name: "Reddit", url: "https://reddit.com" },
  { id: "2", name: "Stack Overflow", url: "https://stackoverflow.com" },
  { id: "3", name: "Medium", url: "https://medium.com" },
  { id: "4", name: "LinkedIn", url: "https://linkedin.com" },
  { id: "5", name: "Netflix", url: "https://netflix.com" },
  { id: "6", name: "Spotify", url: "https://spotify.com" },
];

async function loadBookmarksFromFile(): Promise<Bookmark[]> {
  try {
    // Check if file exists
    const fileExists = await exists(BOOKMARKS_FILE, { baseDir: BaseDirectory.AppData });
    
    if (!fileExists) {
      // Create default bookmarks file
      await saveBookmarksToFile(DEFAULT_BOOKMARKS);
      return DEFAULT_BOOKMARKS;
    }
    
    // Read and parse bookmarks
    const content = await readTextFile(BOOKMARKS_FILE, { baseDir: BaseDirectory.AppData });
    return JSON.parse(content);
  } catch (error) {
    console.error("Failed to load bookmarks from file:", error);
    return DEFAULT_BOOKMARKS;
  }
}

async function saveBookmarksToFile(bookmarks: Bookmark[]): Promise<void> {
  try {
    // Ensure the app data directory exists
    const dirExists = await exists("", { baseDir: BaseDirectory.AppData });
    if (!dirExists) {
      await mkdir("", { baseDir: BaseDirectory.AppData, recursive: true });
    }
    
    // Write bookmarks to file
    await writeTextFile(BOOKMARKS_FILE, JSON.stringify(bookmarks, null, 2), { baseDir: BaseDirectory.AppData });
  } catch (error) {
    console.error("Failed to save bookmarks to file:", error);
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

  const addBookmark = useCallback((name: string, url: string) => {
    const newBookmark: Bookmark = {
      id: Date.now().toString(),
      name,
      url: url.startsWith("http") ? url : `https://${url}`,
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

  return {
    bookmarks,
    isLoading,
    addBookmark,
    editBookmark,
    deleteBookmark,
  };
}

export default useBookmarks;
