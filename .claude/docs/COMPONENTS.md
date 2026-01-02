# Meikai Browser - Component Reference

## Frontend Components

### Main Application

#### `App.tsx`
**Path:** `src/App.tsx`  
**Role:** Main orchestrator component managing window modes and state

**Key State:**
```typescript
isNotchMode: boolean          // Panel vs Dock mode
activeContentWindow: string   // Currently focused window label
activeWindowIndex: number     // Index in contentWindows array
contentWindows: ContentWindow[] // All open browser windows
url: string                   // Current URL (dock mode)
isMiniPanelVisible: boolean   // MiniPanel overlay state
```

**Key Functions:**
| Function | Description |
|----------|-------------|
| `transformToNotch()` | Switch to dock mode (after opening window) |
| `transformToPanel()` | Return to panel mode (close all windows) |
| `handleNavigate(url)` | Navigate/create window from panel mode |
| `handleCreateNewWindow(url)` | Add new window in dock mode |
| `handleSwitchWindow(index)` | Switch between open windows |
| `handleClose()` | Close all windows, return to panel |

---

### Panel Components

#### `Panel/index.tsx`
**Path:** `src/components/Panel/index.tsx`  
**Role:** Panel mode container with tab navigation

Shows different views based on `activeTab`:
- `home` → HomeTab
- `settings` → Settings
- `bookmarks` → Tray
- `profile` → Profile

---

#### `Panel/Home.tsx`
**Path:** `src/components/Panel/Home.tsx`  
**Role:** Main launcher interface

**Features:**
- Dynamic greeting based on time of day
- Search bar with Google autocomplete suggestions
- Quick links (starred bookmarks)
- Quick actions toolbar (Profile, Settings, Bookmarks, History)
- "At a Glance" date/time display
- Rotating tips section

**Props:**
```typescript
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
```

---

#### `Panel/Settings.tsx`
**Path:** `src/components/Panel/Settings.tsx`  
**Role:** Settings management interface

**Features:**
- Theme toggle (light/dark)
- Search engine selection (Google, DuckDuckGo, Bing, Yahoo, Brave)
- Quick links limit configuration (3-6)
- Animation toggle
- Bookmark import/export (JSON)
- Clear bookmark data
- About section

---

#### `Panel/Tray.tsx`
**Path:** `src/components/Panel/Tray.tsx`  
**Role:** Bookmark management tray

**Features:**
- Display all bookmarks with favicons
- Add new bookmark form
- Delete bookmarks
- Star/unstar bookmarks
- Click to navigate

---

#### `Panel/Profile.tsx`
**Path:** `src/components/Panel/Profile.tsx`  
**Role:** User profile placeholder

Currently displays a placeholder for future profile features.

---

### Dock Components

#### `Dock.tsx`
**Path:** `src/components/Dock.tsx`  
**Role:** Compact browser control bar in dock mode

**Features:**
- Tab pills for each open window
- Navigation controls (back, forward, reload)
- URL bar with navigation
- Bookmark current page button
- Window management (+new, minimize, maximize, close)

**Props:**
```typescript
interface DockProps {
  activeContentWindow: string | null;
  initialUrl: string;
  onClose: () => void;
  onNewWindow: () => void;
  isMiniPanelOpen?: boolean;
  contentWindows: ContentWindow[];
  activeWindowIndex: number;
  onSwitchWindow: (index: number) => void;
  onAddBookmark?: (name: string, url: string) => void;
  isBookmarked?: boolean;
}
```

**URL Tracking:**
- Listens to `url-changed` events from backend
- Updates URL bar on navigation
- Sets up URL monitor on new windows

---

#### `MiniPanel.tsx`
**Path:** `src/components/MiniPanel.tsx`  
**Role:** Quick access overlay panel in dock mode

**Features:**
- Activated via (+) button or keyboard shortcut
- Search bar with autocomplete
- Quick links (starred bookmarks)
- All bookmarks grid
- Click outside or Escape to close

---

#### `TitleBar.tsx`
**Path:** `src/components/TitleBar.tsx`  
**Role:** Custom title bar for browser windows

**Features:**
- Displays current page hostname
- Custom window controls (minimize, maximize, close)
- Drag-to-move functionality
- Double-click to maximize
- Rounded corner overlays for visual polish

**Note:** Each browser window has its own TitleBar webview that communicates with the parent window via Tauri commands.

---

### Overlay Components

#### `BetaDisclaimer.tsx`
**Path:** `src/components/BetaDisclaimer.tsx`  
**Role:** First-run beta disclaimer modal

Shows once on first launch, remembered in settings via `hasSeenDisclaimer`.

---

## Custom Hooks

### `useBookmarks`
**Path:** `src/hooks/useBookmarks.ts`

**Persistence:** `$APPDATA/bookmarks.json`

**Interface:**
```typescript
interface Bookmark {
  id: string;
  name: string;
  url: string;
  favicon?: string;
  starred?: boolean;
}
```

**Returns:**
| Property | Type | Description |
|----------|------|-------------|
| `bookmarks` | `Bookmark[]` | All bookmarks |
| `starredBookmarks` | `Bookmark[]` | Starred only |
| `isLoading` | `boolean` | Loading state |
| `addBookmark` | `(name, url, starred?) => void` | Add bookmark |
| `editBookmark` | `(id, name, url) => void` | Edit bookmark |
| `deleteBookmark` | `(id) => void` | Delete bookmark |
| `toggleStar` | `(id) => void` | Toggle starred |
| `clearAllBookmarks` | `() => void` | Clear all |
| `importBookmarks` | `(Bookmark[]) => void` | Import bookmarks |

---

### `useSettings`
**Path:** `src/hooks/useSettings.ts`

**Persistence:** `$APPDATA/settings.json`

**Interface:**
```typescript
interface Settings {
  theme: "light" | "dark";
  searchEngine: "google" | "duckduckgo" | "bing" | "yahoo" | "brave";
  quickLinksLimit: number;
  animationsEnabled: boolean;
  hasSeenDisclaimer: boolean;
}
```

**Returns:**
| Property | Type | Description |
|----------|------|-------------|
| `settings` | `Settings` | Current settings |
| `isLoading` | `boolean` | Loading state |
| `setTheme` | `(theme) => void` | Change theme |
| `setSearchEngine` | `(engine) => void` | Change search engine |
| `setQuickLinksLimit` | `(limit) => void` | Set quick links count |
| `setAnimationsEnabled` | `(enabled) => void` | Toggle animations |
| `setHasSeenDisclaimer` | `(seen) => void` | Mark disclaimer seen |
| `resetSettings` | `() => void` | Reset to defaults |
| `getSearchUrl` | `(query) => string` | Get search URL |

---

## Component Hierarchy

```
App.tsx
├── [Panel Mode]
│   └── Panel/index.tsx
│       ├── Home.tsx (default)
│       ├── Settings.tsx
│       ├── Tray.tsx (bookmarks)
│       └── Profile.tsx
│
├── [Dock Mode]
│   ├── Dock.tsx
│   └── MiniPanel.tsx (overlay)
│
├── BetaDisclaimer.tsx (modal, once)
│
└── [Browser Windows] (separate native windows)
    └── TitleBar.tsx (per window)
```
