# Meikai Browser - Backend (Rust/Tauri) Reference

## Overview

The Tauri backend handles native window management, browser navigation, and inter-process communication. It's organized into modular Rust files for maintainability.

## Module Structure

```
src-tauri/src/
├── lib.rs               # App bootstrap, window events, command registration
├── main.rs              # Entry point (calls lib::run())
├── constants.rs         # Sizing constants
├── window.rs            # Multi-webview window creation
├── navigation.rs        # Navigation commands
├── window_controls.rs   # Window visibility/state
├── titlebar.rs          # Title bar specific commands
├── url_monitor.rs       # URL change detection
└── search.rs            # Search suggestions API
```

---

## Constants (`constants.rs`)

```rust
/// Custom title bar height in pixels
pub const TITLE_BAR_HEIGHT: f64 = 20.0;

/// Browser window sizing
pub const WINDOW_WIDTH_PERCENT: f64 = 0.73;     // 73% of screen width
pub const WINDOW_ASPECT_RATIO: (f64, f64) = (7.0, 4.0); // 7:4 aspect ratio

/// Main panel sizing
pub const PANEL_WIDTH_PERCENT: f64 = 0.47;      // 47% of screen width
pub const PANEL_ASPECT_RATIO: (f64, f64) = (3.0, 2.0); // 3:2 aspect ratio

/// Fallback dimensions if monitor detection fails
pub const FALLBACK_WINDOW_WIDTH: f64 = 1400.0;
pub const FALLBACK_WINDOW_HEIGHT: f64 = 800.0;
```

---

## Window Creation (`window.rs`)

### `create_content_window`
Creates a new browser window with multi-webview architecture.

```rust
#[tauri::command]
pub async fn create_content_window(
    app: tauri::AppHandle,
    url: String,
) -> Result<String, String>
```

**Window Structure:**
1. Parent Window (`window-{uuid}`) - Frameless, transparent container
2. TitleBar Webview (`titlebar-{uuid}`) - Custom React title bar (20px height)
3. Content Webview (`content-{uuid}`) - External URL content

**Special Handling:**
- OAuth URLs (Google, Microsoft, Facebook, etc.) open in native popup to preserve `window.opener`
- Regular `window.open()` / `target="_blank"` links create new Meikai windows
- Emits `new-window-created` event for frontend tracking

---

## Navigation (`navigation.rs`)

### Commands

| Command | Parameters | Description |
|---------|------------|-------------|
| `navigate_to_url` | `window_label`, `url` | Navigate to URL via `window.location.href` |
| `go_back` | `window_label` | Execute `window.history.back()` |
| `go_forward` | `window_label` | Execute `window.history.forward()` |
| `reload_page` | `window_label` | Execute `window.location.reload()` |

**Note:** These commands use `get_webview()` to access the content webview in the multi-webview architecture.

---

## Window Controls (`window_controls.rs`)

Controls for managing browser windows from the frontend (dock/title bar).

### Label Mapping
Content label (`content-xxx`) → Parent window label (`window-xxx`)

### Commands

| Command | Description |
|---------|-------------|
| `show_browser_window` | Show (unhide) a window |
| `hide_browser_window` | Hide a window |
| `close_browser_window` | Close a window |
| `minimize_browser_window` | Toggle minimize state |
| `toggle_maximize_browser_window` | Toggle maximize/restore |

---

## Title Bar Commands (`titlebar.rs`)

Controls invoked from the TitleBar webview to manage its parent window.

| Command | Description |
|---------|-------------|
| `titlebar_minimize` | Minimize window |
| `titlebar_maximize` | Toggle maximize/restore |
| `titlebar_close` | Close window |
| `titlebar_drag` | Start window drag operation |

---

## URL Monitoring (`url_monitor.rs`)

### `get_current_url`
Returns the current URL of a content webview.

```rust
#[tauri::command]
pub async fn get_current_url(
    app: tauri::AppHandle,
    window_label: String,
) -> Result<String, String>
```

### `setup_url_monitor`
Spawns a background thread that polls the webview URL every 300ms and emits `url-changed` events on changes.

```rust
// Emits:
{
    "url": "https://example.com/page",
    "windowLabel": "content-xxxx"
}
```

---

## Search Suggestions (`search.rs`)

### `get_search_suggestions`
Fetches autocomplete suggestions from Google's Suggest API.

```rust
#[tauri::command]
pub fn get_search_suggestions(query: String) -> Result<Vec<String>, String>
```

**API:** `https://suggestqueries.google.com/complete/search?client=firefox&q={query}`

**Features:**
- 3-second timeout
- Returns up to 5 suggestions
- Blocking HTTP client (runs in thread pool)

---

## App Bootstrap (`lib.rs`)

### Plugins Initialized
- `tauri_plugin_opener` - Open URLs/files
- `tauri_plugin_shell` - Shell commands
- `tauri_plugin_fs` - File system access
- `tauri_plugin_dialog` - File dialogs

### Setup
1. Get primary monitor dimensions
2. Calculate panel size (47% width, 3:2 ratio)
3. Resize main window before React loads (prevents size flash)
4. Center window

### Window Event Handlers

#### `WindowEvent::Destroyed`
When a `window-xxx` closes, emits `window-closed` event with the content label.

#### `WindowEvent::Resized`
Updates child webview bounds when parent window resizes:
- TitleBar: Full width, 20px height
- Content: Full width, remaining height

---

## Tauri Command Registration

All commands must be registered in `lib.rs`:

```rust
.invoke_handler(tauri::generate_handler![
    window::create_content_window,
    navigation::navigate_to_url,
    navigation::go_back,
    navigation::go_forward,
    navigation::reload_page,
    window_controls::show_browser_window,
    window_controls::hide_browser_window,
    window_controls::close_browser_window,
    window_controls::minimize_browser_window,
    window_controls::toggle_maximize_browser_window,
    url_monitor::get_current_url,
    url_monitor::setup_url_monitor,
    titlebar::titlebar_minimize,
    titlebar::titlebar_maximize,
    titlebar::titlebar_close,
    titlebar::titlebar_drag,
    search::get_search_suggestions
])
```

---

## Permissions (`capabilities/default.json`)

### Window Permissions
```json
"core:window:allow-minimize",
"core:window:allow-maximize",
"core:window:allow-close",
"core:window:allow-set-position",
"core:window:allow-set-size",
"core:window:allow-set-always-on-top",
"core:window:allow-center",
"core:window:allow-available-monitors"
```

### Event Permissions
```json
"core:event:allow-listen",
"core:event:allow-emit"
```

### File System Permissions
```json
{
  "identifier": "fs:allow-read-text-file",
  "allow": [{ "path": "$APPDATA/**" }]
},
{
  "identifier": "fs:allow-write-text-file",
  "allow": [{ "path": "$APPDATA/**" }]
}
```

---

## Adding New Commands

1. **Create/Edit module** in `src-tauri/src/`
2. **Define command** with `#[tauri::command]` attribute
3. **Export** from module (`pub async fn ...`)
4. **Import** in `lib.rs` (`mod your_module; use your_module::*;`)
5. **Register** in `.invoke_handler()`
6. **Add permissions** if using protected APIs
7. **Rebuild backend:** `cargo build --manifest-path src-tauri/Cargo.toml`
