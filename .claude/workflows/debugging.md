---
description: How to debug issues in Meikai Browser
---

# Debugging Meikai Browser

## Frontend Debugging

### DevTools
Press F12 in any Meikai window to open Chrome DevTools.

### Console Logging
```typescript
console.log("Debug message", variable);
```

### React Component Inspection
Use React DevTools browser extension for component state inspection.

## Backend Debugging

### Rust Logging
Add logging to Rust code:
```rust
println!("Debug: {:?}", variable);
```

View logs in the terminal where `npm run tauri dev` is running.

### Tracing (Advanced)
```rust
use tauri::Manager;
// Log window labels
app.windows().iter().for_each(|(label, _)| {
    println!("Window: {}", label);
});
```

## Common Issues

### Command Not Found
**Symptom:** `Command your_command not found`

**Causes:**
1. Command not registered in `lib.rs`
2. Module not imported
3. Typo in command name

**Fix:** Check `invoke_handler` in `lib.rs`

### Permission Denied
**Symptom:** `Permission denied for core:window:allow-xyz`

**Fix:** Add permission to `capabilities/default.json`

### Window Not Found
**Symptom:** `Window "xxx" not found`

**Causes:**
1. Using wrong label format
2. Window already closed
3. Using `get_window` for child webviews

**Fix:** 
- For parent windows: `app.get_window("window-xxx")`
- For child webviews: `app.get_webview("content-xxx")`

### URL Changes Not Detected
**Symptom:** URL bar doesn't update on navigation

**Causes:**
1. URL monitor not started
2. Event listener not set up

**Fix:** Check that `setup_url_monitor` is called after window creation

## Debugging Multi-Webview Windows

The window structure is:
```
window-{uuid}           (parent Window)
├── titlebar-{uuid}     (TitleBar webview)
└── content-{uuid}      (Content webview)
```

To debug:
1. Main window shows Panel/Dock
2. Each browser "tab" is a separate window with this structure
3. Use DevTools in the content webview for actual web page debugging

## Event Debugging

Listen to all events:
```typescript
import { listen } from "@tauri-apps/api/event";

listen("*", (event) => {
  console.log("Event:", event.event, event.payload);
});
```

Or specific events:
```typescript
listen("url-changed", (event) => {
  console.log("URL changed:", event.payload);
});
```

## Build Issues

### Clean Build
```bash
# Clean Rust artifacts
cargo clean --manifest-path src-tauri/Cargo.toml

# Clean node modules
rm -rf node_modules
npm install

# Fresh build
npm run tauri build
```

### Check Dependencies
```bash
# Rust dependencies
cargo tree --manifest-path src-tauri/Cargo.toml

# Node dependencies
npm ls
```
