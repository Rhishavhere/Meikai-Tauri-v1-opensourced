---
description: How to set up and run the development environment
---

# Development Workflow

## Initial Setup (First Time)

1. Ensure prerequisites are installed:
   - Node.js 18+
   - Rust 1.70+
   - Windows with WebView2 runtime

2. Install Node dependencies:
   ```bash
   npm install
   ```

## Running Development Server

// turbo
```bash
npm run tauri dev
```

This starts:
- Vite dev server on http://localhost:1420
- Tauri application with hot reload

## Making Changes

### Frontend Changes (React/TypeScript)
- Edit files in `src/`
- Changes hot reload automatically
- No restart needed

### Backend Changes (Rust)
- Edit files in `src-tauri/src/`
- Tauri will rebuild automatically
- App restarts when Rust changes

### Adding New Tauri Commands
1. Create/edit module in `src-tauri/src/`
2. Add `#[tauri::command]` attribute
3. Register in `lib.rs` invoke_handler
4. Add permissions to `capabilities/default.json` if needed

## Build for Production

```bash
npm run tauri build
```

Output location: `src-tauri/target/release/Meikai.exe`
Installers: `src-tauri/target/release/bundle/`
