# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Meikai is a Tauri-based desktop application that provides a unique web browsing experience using native WebView2. The main window transforms into a screen-top "notch" control bar when browsing, while each website opens in a separate native window at the center of the screen.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 4 (using @tailwindcss/vite plugin)
- **Desktop Framework**: Tauri 2 (with unstable features enabled)
- **UI Animations**: Framer Motion
- **Icons**: Lucide React
- **Native Webview**: WebView2 (Windows)

## Development Commands

```bash
# Start development server (runs both Vite dev server and Tauri)
npm run tauri dev

# Build the frontend only
npm run build

# Build production application
npm run tauri build

# Clean Rust build artifacts (when needed)
cargo clean --manifest-path src-tauri/Cargo.toml
```

## Architecture

### Frontend (React)

#### Main Application (src/App.tsx)
The main window has **two modes**:

1. **Panel Mode** (default):
   - Full launcher interface (1200x800, centered)
   - Search bar with URL/search detection
   - Quick links to popular websites
   - Custom titlebar with minimize/close buttons

2. **Notch Mode** (activated when browsing):
   - Transforms to full-screen-width bar at top of screen (100px height)
   - Always-on-top positioning
   - Navigation controls: Back, Forward, Reload, Home
   - URL bar to control active content window
   - Close button returns to Panel Mode

#### Other Components
- **src/main.tsx**: React app entry point for main window

### Backend (Rust)

**src-tauri/src/lib.rs**: Core Tauri application logic with commands:

- `create_content_window(url)` → `Result<String, String>`:
  - Creates native WebView2 window loading the URL directly
  - Returns window label for frontend tracking
  - Window opens centered, resizable, draggable with native decorations
  - Size: 1200x800

- `navigate_to_url(window_label, url)` → `Result<(), String>`:
  - Navigates specified content window to new URL via JavaScript eval

- `go_back(window_label)` → `Result<(), String>`:
  - Executes browser back navigation via `window.history.back()`

- `go_forward(window_label)` → `Result<(), String>`:
  - Executes browser forward navigation via `window.history.forward()`

- `reload_page(window_label)` → `Result<(), String>`:
  - Reloads current page via `window.location.reload()`

- `close_browser_window(window_label)` → `Result<(), String>`:
  - Closes specified content window

**Dependencies**:
- `uuid`: Generate unique window IDs
- `urlencoding`: URL encoding for query parameters
- `tauri-plugin-opener` and `tauri-plugin-shell`

### Window Architecture

**Transformation Flow**:
1. Main window starts in Panel Mode (centered, 1200x800)
2. User searches URL or clicks quick link
3. Main window transforms to Notch Mode:
   - Moves to position (0, 0) - top-left of screen
   - Resizes to (screen_width, 100)
   - Sets always-on-top
4. Content window opens (centered, 1200x800, resizable, draggable)
5. Notch controls the active content window via window label tracking
6. Close button in notch → closes content window + returns to Panel Mode

**Window Types**:
- **Main Window**: Transforms between Panel/Notch, no decorations, custom controls
- **Content Windows**: Native decorations, fully independent, loads external URLs directly

### Tauri Configuration

**tauri.conf.json**:
- Main window: decorations disabled, not transparent, resizable
- Dev server: port 1420, HMR on 1421
- Uses `unstable` Tauri features in Cargo.toml

**capabilities/default.json** - Window permissions required:
- `core:window:allow-set-position` - Transform notch position
- `core:window:allow-set-size` - Transform notch size
- `core:window:allow-set-always-on-top` - Keep notch on top
- `core:window:allow-center` - Center panel mode
- `core:window:allow-available-monitors` - Get screen dimensions
- Standard: minimize, maximize, close, drag

### Vite Configuration

**Vite Config** (`vite.config.ts`):
- Single-page application setup
- Entry point: `index.html` → Main window (Panel/Notch modes)

## Key Implementation Details

### URL Handling (src/App.tsx)

**Detection Logic**:
- URL: Contains `.` without spaces OR starts with http(s)://
- Search: Everything else → Google search query
- Auto-prepends `https://` if no protocol

### Window Transformation (src/App.tsx)

**transformToNotch()**:
```typescript
- Get screen dimensions via availableMonitors()
- setPosition(new PhysicalPosition(0, 0))
- setSize(new PhysicalSize(screenWidth, 100))
- setAlwaysOnTop(true)
- setState: isNotchMode = true
```

**transformToPanel()**:
```typescript
- setAlwaysOnTop(false)
- setSize(new PhysicalSize(1200, 800))
- center()
- setState: isNotchMode = false
```

### Navigation Control Flow

1. User interacts with notch URL bar/buttons
2. Frontend calls Tauri command with `activeContentWindow` label
3. Rust finds window by label via `app.get_webview_window()`
4. Executes JavaScript: `window.eval("window.history.back()")` etc.

### State Management

**Main Window State**:
- `isNotchMode`: boolean - Controls UI rendering
- `activeContentWindow`: string | null - Tracks which window to control
- `url`: string - Current URL in address bar

## Build System

- **Vite**: Watches src directory, ignores src-tauri, single-page app
- **Tauri build hooks**:
  - `beforeDevCommand`: npm run dev
  - `beforeBuildCommand`: npm run build
  - `frontendDist`: ../dist

## Common Patterns

### Adding New Tauri Commands
1. Define in `src-tauri/src/lib.rs` with `#[tauri::command]` attribute
2. Add to `invoke_handler` in `run()` function
3. Call from frontend: `invoke("command_name", { args })`
4. Add required permissions to `capabilities/default.json`

### Modifying Window Behavior
- Window configuration: `src-tauri/tauri.conf.json` → `app.windows`
- Permissions: `src-tauri/capabilities/default.json`
- Always add permissions before using window APIs

### Working with Content Windows
- Create: `invoke("create_content_window", { url })` returns label
- Control: Use returned label with navigation commands
- Track: Store label in React state (`activeContentWindow`)

## Important Notes

- Content windows use **native WebView2** - no iframe restrictions
- All websites work without X-Frame-Options issues
- Notch controls one active window at a time (tracked by label)
- Window position/size changes require explicit permissions
- Use `PhysicalPosition` and `PhysicalSize` from `@tauri-apps/api/dpi`
