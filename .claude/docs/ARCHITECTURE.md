# Meikai Browser - Architecture Guide

## Overview

Meikai Browser reimagines the traditional web browsing experience with a unique **multi-window architecture**. Instead of tabs, each website opens in its own native WebView2 window, controlled by a central dock interface.

```
┌──────────────────────────────────────────────────────────────┐
│                         DOCK                                  │
│  ┌──────┐ ┌──────┐ ┌──────┐    [←][→][↻]  [URL Bar]  [+][×]  │
│  │ Tab1 │ │ Tab2 │ │ Tab3 │                                   │
└──────────────────────────────────────────────────────────────┘
                    ↓ Controls ↓
    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
    │  Browser Win 1  │  │  Browser Win 2  │  │  Browser Win 3  │
    │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │
    │ │  TitleBar   │ │  │ │  TitleBar   │ │  │ │  TitleBar   │ │
    │ ├─────────────┤ │  │ ├─────────────┤ │  │ ├─────────────┤ │
    │ │             │ │  │ │             │ │  │ │             │ │
    │ │   WebView   │ │  │ │   WebView   │ │  │ │   WebView   │ │
    │ │             │ │  │ │             │ │  │ │             │ │
    │ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘ │
    └─────────────────┘  └─────────────────┘  └─────────────────┘
```

## Core Concepts

### 1. Window Modes

The main application window has **two operational modes**:

#### Panel Mode (Default/Launcher)
- Full-screen launcher interface
- Search bar with auto-suggestions
- Quick links (starred bookmarks)
- Profile, Settings, Bookmarks access
- Dynamic sizing: 47% screen width, 3:2 aspect ratio

#### Dock Mode (Active Browsing)
- Compact control bar at screen bottom
- Tab indicators for open windows
- Navigation controls (back/forward/reload)
- URL bar for active window
- Window management (+/× buttons)
- Dynamic sizing: 36% screen width, minimal height

### 2. Multi-Webview Windows

Each browser "tab" is actually a **separate native window** containing:

| Component | Description |
|-----------|-------------|
| Parent Window | Frameless container (`window-{uuid}`) |
| TitleBar Webview | Custom React title bar (`titlebar-{uuid}`) |
| Content Webview | External URL content (`content-{uuid}`) |

**Benefits:**
- No iframe/X-Frame-Options restrictions
- Native window decorations option
- Independent resizing per window
- True multi-window experience

### 3. State Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   App.tsx   │────▶│    Dock     │────▶│  Browser    │
│   (Main)    │◀────│   (Panel)   │◀────│  Windows    │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ useBookmarks│     │ useSettings │     │  Tauri IPC  │
│   (Hook)    │     │   (Hook)    │     │  Commands   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                           ▼
                   ┌─────────────┐
                   │  AppData/   │
                   │   Files     │
                   └─────────────┘
```

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1.0 | UI Framework |
| TypeScript | 5.8.3 | Type Safety |
| Vite | 7.0.4 | Build Tool |
| Tailwind CSS | 4.1.16 | Styling |
| Framer Motion | 12.23.24 | Animations |
| Lucide React | 0.552.0 | Icons |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Tauri | 2.0 | Desktop Framework |
| Rust | 2021 Edition | Backend Logic |
| WebView2 | Native | Browser Engine (Windows) |
| serde/serde_json | 1.x | Serialization |
| reqwest | 0.12 | HTTP Client |
| uuid | 1.x | Unique IDs |

### Data Persistence
- **Location**: `$APPDATA/com.meikai.browser/`
- **Format**: JSON files
- **Files**: `bookmarks.json`, `settings.json`

## Module Organization

### Frontend (`src/`)
```
src/
├── App.tsx              # Main application orchestrator
├── main.tsx             # React entry point
├── index.css            # Global styles + Tailwind
├── components/
│   ├── Dock.tsx         # Browser control bar (dock mode)
│   ├── MiniPanel.tsx    # Quick access overlay panel
│   ├── TitleBar.tsx     # Custom window title bar
│   ├── BetaDisclaimer.tsx
│   └── Panel/
│       ├── index.tsx    # Panel container
│       ├── Home.tsx     # Main launcher view
│       ├── Settings.tsx # Settings panel
│       ├── Tray.tsx     # Bookmark tray
│       └── Profile.tsx  # User profile view
└── hooks/
    ├── useBookmarks.ts  # Bookmark state management
    └── useSettings.ts   # Settings state management
```

### Backend (`src-tauri/src/`)
```
src-tauri/src/
├── lib.rs               # Tauri app bootstrap + window events
├── main.rs              # Entry point
├── constants.rs         # Size/dimension constants
├── window.rs            # Multi-webview window creation
├── navigation.rs        # Back/forward/reload/navigate
├── window_controls.rs   # Show/hide/close/minimize/maximize
├── titlebar.rs          # Title bar window controls
├── url_monitor.rs       # URL change detection
└── search.rs            # Google suggestions API
```

## Event System

### Frontend → Backend (Commands)
| Command | Module | Description |
|---------|--------|-------------|
| `create_content_window` | window.rs | Create new browser window |
| `navigate_to_url` | navigation.rs | Navigate active window |
| `go_back` / `go_forward` | navigation.rs | History navigation |
| `reload_page` | navigation.rs | Refresh page |
| `get_current_url` | url_monitor.rs | Get URL of window |
| `get_search_suggestions` | search.rs | Google autocomplete |
| `titlebar_*` | titlebar.rs | Window controls from title bar |
| `*_browser_window` | window_controls.rs | Window visibility controls |

### Backend → Frontend (Events)
| Event | Payload | Description |
|-------|---------|-------------|
| `url-changed` | `{ url, windowLabel }` | URL navigation detected |
| `window-closed` | `{ windowLabel }` | Browser window destroyed |
| `new-window-created` | `{ windowLabel, url }` | Popup/target="_blank" opened |

## Key Configuration Files

### `tauri.conf.json`
- Main window: decorations=false, transparent=true, centered
- Dev server: port 1420, HMR on 1421
- Bundle: MSI + NSIS installers

### `capabilities/default.json`
- Window permissions (position, size, always-on-top)
- Event permissions (listen, emit)
- File system permissions (AppData read/write)

### `vite.config.ts`
- React + Tailwind plugins
- Fixed port 1420 for Tauri
- Ignores `src-tauri/` for HMR
