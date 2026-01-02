# Meikai Browser - Complete File Map

## Root Directory

| File | Description |
|------|-------------|
| `CLAUDE.md` | AI assistant context documentation |
| `INFO.md` | Detailed customization guide |
| `README.md` | Project overview and installation |
| `index.html` | Main HTML entry point |
| `package.json` | Node.js dependencies and scripts |
| `tsconfig.json` | TypeScript configuration |
| `vite.config.ts` | Vite build configuration |
| `app-icon.svg` | Application icon source |

---

## Frontend (`src/`)

### Core Files
| File | Lines | Description |
|------|-------|-------------|
| `App.tsx` | ~363 | Main application component with Panel/Dock mode logic |
| `main.tsx` | ~19 | React entry point, renders App or TitleBar based on route |
| `index.css` | ~75 | Global styles, Tailwind imports, CSS variables |
| `vite-env.d.ts` | 1 | Vite type declarations |
| `webview.d.ts` | ~20 | WebView type declarations |

### Components (`src/components/`)

| File | Lines | Description |
|------|-------|-------------|
| `Dock.tsx` | ~251 | Browser control bar in dock mode |
| `MiniPanel.tsx` | ~296 | Quick access overlay with search and bookmarks |
| `TitleBar.tsx` | ~160 | Custom window title bar for browser windows |
| `BetaDisclaimer.tsx` | ~220 | First-run beta disclaimer modal |
| `index.ts` | ~6 | Component barrel exports |

### Panel Views (`src/components/Panel/`)

| File | Lines | Description |
|------|-------|-------------|
| `index.tsx` | ~180 | Panel container with tab navigation |
| `Home.tsx` | ~484 | Main launcher with search and quick links |
| `Settings.tsx` | ~549 | Settings management interface |
| `Tray.tsx` | ~248 | Bookmark management tray |
| `Profile.tsx` | ~200 | User profile placeholder |

### Hooks (`src/hooks/`)

| File | Lines | Description |
|------|-------|-------------|
| `useBookmarks.ts` | ~146 | Bookmark state management with file persistence |
| `useSettings.ts` | ~174 | Settings state management with file persistence |

---

## Backend (`src-tauri/src/`)

| File | Lines | Description |
|------|-------|-------------|
| `lib.rs` | ~107 | App bootstrap, plugins, window events |
| `main.rs` | ~5 | Entry point (calls lib::run) |
| `constants.rs` | ~17 | Size and dimension constants |
| `window.rs` | ~158 | Multi-webview window creation |
| `navigation.rs` | ~55 | Back/forward/reload/navigate commands |
| `window_controls.rs` | ~94 | Show/hide/close/minimize/maximize commands |
| `titlebar.rs` | ~42 | Title bar window control commands |
| `url_monitor.rs` | ~58 | URL change detection and events |
| `search.rs` | ~44 | Google suggestions API integration |

---

## Tauri Configuration (`src-tauri/`)

| File | Description |
|------|-------------|
| `tauri.conf.json` | Main Tauri configuration |
| `Cargo.toml` | Rust dependencies |
| `Cargo.lock` | Dependency lock file |
| `build.rs` | Build script |
| `capabilities/default.json` | API permissions |

### Icons (`src-tauri/icons/`)
- `32x32.png` - Small icon
- `128x128.png` - Medium icon
- `128x128@2x.png` - Retina icon
- `icon.ico` - Windows icon
- `icon.icns` - macOS icon

---

## Assets (`src/assets/`)

Contains static assets like logos referenced by components.

---

## Public (`public/`)

Static files served directly (favicon, etc.).

---

## Generated/Build Directories

| Directory | Description |
|-----------|-------------|
| `dist/` | Vite build output (frontend) |
| `target/` | Cargo build output (backend) |
| `node_modules/` | npm dependencies |
| `src-tauri/gen/` | Tauri generated files |
| `src-tauri/target/` | Rust compilation output |

---

## File Dependencies

```
index.html
└── src/main.tsx
    ├── src/App.tsx (default route)
    │   ├── src/components/Panel/index.tsx
    │   │   ├── src/components/Panel/Home.tsx
    │   │   ├── src/components/Panel/Settings.tsx
    │   │   ├── src/components/Panel/Tray.tsx
    │   │   └── src/components/Panel/Profile.tsx
    │   ├── src/components/Dock.tsx
    │   ├── src/components/MiniPanel.tsx
    │   ├── src/components/BetaDisclaimer.tsx
    │   ├── src/hooks/useBookmarks.ts
    │   └── src/hooks/useSettings.ts
    │
    └── src/components/TitleBar.tsx (/titlebar route)
```

---

## Configuration Inheritance

```
vite.config.ts
├── tailwind (via @tailwindcss/vite)
└── react (via @vitejs/plugin-react)

tsconfig.json
├── compilerOptions
└── references → tsconfig.node.json

src-tauri/tauri.conf.json
├── app.windows[] → main window config
├── app.security.capabilities → default.json
└── bundle → installer config
```
