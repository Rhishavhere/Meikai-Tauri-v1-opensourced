---
description: How to add a new Tauri IPC command to Meikai Browser
---

# Adding a New Tauri Command

## 1. Define the Command (Rust)

Choose or create an appropriate module in `src-tauri/src/`:

```rust
// src-tauri/src/your_module.rs

use tauri::Manager;

#[tauri::command]
pub async fn your_command_name(
    app: tauri::AppHandle,
    param1: String,
    param2: i32,
) -> Result<ReturnType, String> {
    // Implementation
    Ok(result)
}
```

### Command Patterns

#### Sync Command (Blocking)
```rust
#[tauri::command]
pub fn sync_command() -> String {
    "result".to_string()
}
```

#### Async Command
```rust
#[tauri::command]
pub async fn async_command() -> Result<String, String> {
    Ok("result".to_string())
}
```

#### With Window Access
```rust
#[tauri::command]
pub async fn with_window(app: tauri::AppHandle, label: String) -> Result<(), String> {
    if let Some(window) = app.get_window(&label) {
        window.close().map_err(|e| e.to_string())?;
    }
    Ok(())
}
```

#### With Webview Access (Multi-webview)
```rust
#[tauri::command]
pub async fn with_webview(app: tauri::AppHandle, label: String) -> Result<(), String> {
    if let Some(webview) = app.get_webview(&label) {
        webview.eval("console.log('hello')").map_err(|e| e.to_string())?;
    }
    Ok(())
}
```

## 2. Register in lib.rs

Add your module and register the command:

```rust
// src-tauri/src/lib.rs

mod your_module;  // Add module import

pub fn run() {
    tauri::Builder::default()
        // ... plugins ...
        .invoke_handler(tauri::generate_handler![
            // ... existing commands ...
            your_module::your_command_name,  // Add here
        ])
        // ...
}
```

## 3. Add Permissions (If Needed)

If your command uses protected APIs, add to `src-tauri/capabilities/default.json`:

```json
{
  "permissions": [
    // ... existing permissions ...
    "core:window:allow-your-operation"
  ]
}
```

## 4. Call from Frontend

```typescript
import { invoke } from "@tauri-apps/api/core";

const result = await invoke<ReturnType>("your_command_name", {
  param1: "value",
  param2: 42
});
```

## 5. Rebuild and Test

// turbo
```bash
cargo build --manifest-path src-tauri/Cargo.toml
```

Then restart dev server if needed:
// turbo
```bash
npm run tauri dev
```

## Common Mistakes

1. **Forgot to register** - Command won't be found
2. **Param name mismatch** - Rust uses snake_case, JS uses camelCase
3. **Missing permissions** - Will error at runtime
4. **Using get_window vs get_webview** - Multi-webview uses get_webview for child webviews
