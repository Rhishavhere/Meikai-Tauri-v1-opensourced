# Meikai Browser - Quick Start Guide

## Prerequisites

- **Windows 10/11** (WebView2 runtime required)
- **Node.js 18+** and npm
- **Rust 1.70+** with cargo

## Development Setup

### 1. Install Dependencies

```bash
# Install Node.js dependencies
npm install
```

### 2. Run in Development

```bash
# Start Tauri dev server (frontend + backend)
npm run tauri dev
```

This will:
1. Start Vite dev server on port 1420
2. Build and run the Tauri application
3. Enable hot module replacement for frontend changes

### 3. Build for Production

```bash
# Build production executable
npm run tauri build
```

Output: `src-tauri/target/release/Meikai.exe`

---

## Project Structure at a Glance

```
meikai-browser/
├── src/                    # React frontend
│   ├── App.tsx             # Main app logic
│   ├── components/         # UI components
│   │   ├── Dock.tsx        # Browser control bar
│   │   ├── MiniPanel.tsx   # Quick access overlay
│   │   ├── TitleBar.tsx    # Custom window title bar
│   │   └── Panel/          # Panel mode views
│   └── hooks/              # Custom React hooks
├── src-tauri/              # Rust backend
│   ├── src/                # Rust source files
│   ├── capabilities/       # Tauri permissions
│   └── tauri.conf.json     # Tauri configuration
└── .claude/                # AI/Project documentation
```

---

## Key Commands

| Command | Description |
|---------|-------------|
| `npm run tauri dev` | Development mode |
| `npm run tauri build` | Production build |
| `npm run build` | Build frontend only |
| `npm run dev` | Vite dev server only |
| `cargo clean --manifest-path src-tauri/Cargo.toml` | Clean Rust build |

---

## Common Development Tasks

### Modify UI Styling
- Edit `src/index.css` for global styles
- Use Tailwind CSS classes in components
- Theme colors controlled via `data-theme` attribute

### Add New Component
1. Create file in `src/components/`
2. Export from component
3. Import and use in parent component

### Add New Tauri Command
1. Add function in `src-tauri/src/` module
2. Register in `lib.rs` invoke_handler
3. Add permissions if needed
4. Call from frontend: `await invoke("command_name", { args })`

### Modify Window Behavior
- Sizing: `src-tauri/src/constants.rs`
- Creation: `src-tauri/src/window.rs`
- Controls: `src-tauri/src/window_controls.rs`

---

## Debugging Tips

1. **Frontend Console**: Open DevTools with F12 in the main window
2. **Rust Logs**: Check terminal output from `npm run tauri dev`
3. **Window Events**: Listen with `listen("event-name", callback)`
4. **URL Issues**: Check `url_monitor.rs` for URL tracking

---

## Useful Paths

| Path | Description |
|------|-------------|
| `src/App.tsx` | Main application orchestrator |
| `src/components/Dock.tsx` | Browser control dock |
| `src-tauri/src/lib.rs` | Tauri app bootstrap |
| `src-tauri/src/window.rs` | Window creation logic |
| `src-tauri/tauri.conf.json` | App configuration |
| `src-tauri/capabilities/default.json` | API permissions |
| `$APPDATA/com.meikai.browser/` | User data location |
