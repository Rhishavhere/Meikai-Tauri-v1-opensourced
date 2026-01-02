# Meikai Browser - Glossary

Quick reference for terms and concepts used in Meikai Browser.

## Window Terms

| Term | Description |
|------|-------------|
| **Panel Mode** | The main launcher interface with search bar and quick links (default state) |
| **Dock Mode** | Compact control bar that appears when browsing (transforms from panel) |
| **MiniPanel** | Quick access overlay that appears in dock mode for search/bookmarks |
| **Content Window** | A browser window containing a website |
| **TitleBar** | Custom 20px title bar with window controls on each browser window |

## Architecture Terms

| Term | Description |
|------|-------------|
| **Multi-webview** | A window containing multiple webview components (title bar + content) |
| **Parent Window** | The native window container (`window-{uuid}`) |
| **Child Webview** | A webview inside a parent window (`titlebar-{uuid}` or `content-{uuid}`) |
| **WebView2** | Microsoft's Chromium-based web engine for Windows |

## Labels

| Label Pattern | Description |
|---------------|-------------|
| `main` | The main application window (Panel/Dock) |
| `window-{uuid}` | Parent window for browser content |
| `titlebar-{uuid}` | Title bar webview (loads React TitleBar) |
| `content-{uuid}` | Content webview (loads external URL) |

## File Locations

| Location | Description |
|----------|-------------|
| `$APPDATA` | `C:\Users\<user>\AppData\Roaming\com.meikai.browser\` |
| `bookmarks.json` | User bookmarks stored in $APPDATA |
| `settings.json` | User settings stored in $APPDATA |

## Component Types

| Type | Location | Purpose |
|------|----------|---------|
| React Component | `src/components/` | UI components |
| Hook | `src/hooks/` | Shared state logic |
| Tauri Command | `src-tauri/src/*.rs` | Backend functionality |
| Capability | `capabilities/*.json` | API permissions |

## Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `url-changed` | Backend → Frontend | URL navigation detected |
| `window-closed` | Backend → Frontend | Browser window closed |
| `new-window-created` | Backend → Frontend | Popup/link opened new window |

## Technologies

| Name | Version | Purpose |
|------|---------|---------|
| Tauri | 2.0 | Desktop application framework |
| React | 19 | UI library |
| Vite | 7 | Build tool |
| Tailwind CSS | 4 | Styling |
| Framer Motion | 12 | Animations |
| Rust | 2021 | Backend language |
| WebView2 | - | Browser engine (Windows) |
