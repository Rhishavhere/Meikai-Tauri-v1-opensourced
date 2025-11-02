# Meikai Browser - Structure & Customization Guide

This guide explains the project structure and where to make changes to customize the main window, floating dock (notch), and new browser windows.

## 📁 Project Structure Overview

```
meikai-browser/
├── src/                          # Frontend code
│   ├── App.tsx                   # ⭐ MAIN WINDOW (Panel + Notch modes)
│   ├── main.tsx                  # Entry point for main window
│   ├── index.css                 # Global styles
│   └── [unused components]       # BrowserWindow, NavigationBar, etc.
│
├── src-tauri/                    # Backend code
│   ├── src/
│   │   └── lib.rs               # ⭐ RUST COMMANDS (window creation, navigation)
│   ├── capabilities/
│   │   └── default.json         # ⭐ PERMISSIONS
│   └── tauri.conf.json          # Tauri configuration
│
├── index.html                    # HTML entry for main window
└── vite.config.ts               # Build configuration
```

---

## 🎯 Where to Make Changes

### 1️⃣ **Main Window (Panel Mode & Notch Mode)**
**File**: `src/App.tsx`

This single file contains **BOTH modes**:

#### **Panel Mode** (Lines 140-228)
```tsx
if (!isNotchMode) {
  return (
    // 🎨 Full launcher interface
    // - Search bar
    // - Quick links
    // - Window controls
  );
}
```

**What you can customize:**

**Title & Subtitle** (Lines 173-178):
```tsx
<h1 className="text-6xl font-bold text-black mb-4">
  Meikai Browser  {/* Change title here */}
</h1>
<p className="text-gray-500 text-lg">
  Using native WebView2 - Each site opens in a new window
</p>
```

**Quick Links** (Lines 208-215):
```tsx
{[
  { name: "Google", url: "https://google.com" },  // Add/remove/edit
  { name: "YouTube", url: "https://youtube.com" },
  { name: "GitHub", url: "https://github.com" },
  { name: "Twitter", url: "https://twitter.com" },
  { name: "Apple", url: "https://apple.com" },
  { name: "Rhishav.com", url: "https://rhishav.com" },
].map((site) => (
  <button
    key={site.name}
    onClick={() => handleQuickLink(site.url)}
    className="p-4 bg-white rounded-xl hover:shadow-xl transition-all border-2 border-gray-100 hover:border-blue-200"
  >
    <div className="text-base font-medium text-gray-800">{site.name}</div>
  </button>
))}
```

**Search Bar Styling** (Lines 189-198):
```tsx
<input
  type="text"
  value={url}
  onChange={(e) => setUrl(e.target.value)}
  onFocus={(e) => e.target.select()}
  className="w-full px-6 py-4 bg-white rounded-xl text-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all shadow-lg"
  placeholder="Search or enter URL"
  autoFocus
/>
```

**Background Color** (Line 142):
```tsx
<div className="h-screen w-screen flex flex-col bg-linear-to-br from-blue-50 to-purple-50 overflow-hidden">
```

**Window Controls** (Lines 144-163):
```tsx
<div
  data-tauri-drag-region
  className="h-8 bg-gray-900 flex items-center justify-between px-4 select-none"
>
  <div className="text-xs text-gray-300 font-medium">Meikai Browser</div>
  <div className="flex gap-2">
    <button onClick={() => getCurrentWindow().minimize()}>
      <Minus className="w-3 h-3" />
    </button>
    <button onClick={() => getCurrentWindow().close()}>
      <X className="w-3 h-3" />
    </button>
  </div>
</div>
```

---

#### **Notch Mode (Floating Dock)** (Lines 230-299)
```tsx
// 🎨 Floating dock at top of screen
return (
  <div className="h-full w-full flex flex-col bg-gray-900 shadow-2xl border-b-4 border-blue-500">
    // Navigation controls + URL bar
  );
}
```

**What you can customize:**

**Notch Height** (Line 26):
```tsx
await window.setSize(new PhysicalSize(screenWidth, 100));  // Change 100 to adjust height
```

**Background Color & Border** (Line 232):
```tsx
className="h-full w-full flex flex-col bg-gray-900 shadow-2xl border-b-4 border-blue-500"
// Change:
// - bg-gray-900 → any background color
// - border-b-4 border-blue-500 → border style/color
```

**Remove Debug Indicator** (Lines 234-236):
```tsx
{/* Delete this entire div to remove red "NOTCH MODE ACTIVE" label */}
<div className="absolute top-0 left-0 bg-red-500 text-white text-xs px-2 py-1 z-50">
  NOTCH MODE ACTIVE
</div>
```

**Navigation Buttons** (Lines 244-267):
```tsx
<button
  onClick={handleBack}
  className="p-2 rounded hover:bg-gray-700 transition-colors text-white"
  title="Go back"
>
  <ChevronLeft className="w-5 h-5" />  {/* Change icon size w-5 h-5 */}
</button>

<button onClick={handleForward} className="p-2 rounded hover:bg-gray-700">
  <ChevronRight className="w-5 h-5" />
</button>

<button onClick={handleReload} className="p-2 rounded hover:bg-gray-700">
  <RotateCw className="w-5 h-5" />
</button>

<button onClick={handleHome} className="p-2 rounded hover:bg-gray-700">
  <Home className="w-5 h-5" />
</button>
```

**URL Bar Styling** (Lines 270-279):
```tsx
<form onSubmit={handleNavigate} className="flex-1 mx-4">
  <input
    type="text"
    value={url}
    onChange={(e) => setUrl(e.target.value)}
    onFocus={(e) => e.target.select()}
    placeholder="Search or enter URL"
    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
  />
</form>
```

**Control Buttons** (Lines 282-295):
```tsx
{/* Close Button - closes content window and returns to panel */}
<button
  onClick={handleClose}
  className="p-2 rounded hover:bg-red-600 transition-colors text-white"
  title="Close window and return to panel"
>
  <X className="w-5 h-5" />
</button>

{/* Minimize Button */}
<button
  onClick={() => getCurrentWindow().minimize()}
  className="p-2 rounded hover:bg-gray-700 transition-colors text-white"
  title="Minimize"
>
  <Minus className="w-5 h-5" />
</button>
```

---

### 2️⃣ **Content Windows (New Browser Windows)**
**File**: `src-tauri/src/lib.rs` (Lines 3-28)

```rust
#[tauri::command]
async fn create_content_window(
    app: tauri::AppHandle,
    url: String,
) -> Result<String, String> {
    let window_id = uuid::Uuid::new_v4().to_string();
    let content_label = format!("content-{}", window_id);

    // Create the content window (native WebView2 loading the actual URL)
    // Opens at center, fully resizable and draggable
    WebviewWindowBuilder::new(
        &app,
        &content_label,
        WebviewUrl::External(url.parse().map_err(|e| format!("Invalid URL: {:?}", e))?)
    )
    .title("Meikai Browser")           // 🎨 Window title
    .inner_size(1200.0, 800.0)       // 🎨 Window size (width, height)
    .center()                         // 🎨 Position (center on screen)
    .resizable(true)                  // 🎨 Resizable?
    .decorations(true)                // 🎨 Show native titlebar?
    .build()
    .map_err(|e| e.to_string())?;

    // Return the window label so frontend can track it
    Ok(content_label)
}
```

**What you can customize:**

**Default Window Size** (Line 19):
```rust
.inner_size(1200.0, 800.0)  // Width, Height in pixels
// Example: .inner_size(1600.0, 900.0) for larger window
```

**Window Title** (Line 18):
```rust
.title("Meikai Browser")  // Change to anything
// Example: .title("My Custom Browser")
```

**Starting Position** (Line 20):
```rust
.center()  // Center on screen

// Or use specific position:
// .position(100.0, 100.0)  // x, y coordinates
```

**Window Decorations** (Line 22):
```rust
.decorations(true)   // true = show titlebar, false = no titlebar
```

**Add Min/Max Size Constraints** (Add after line 20):
```rust
.min_inner_size(800.0, 600.0)    // Minimum size
.max_inner_size(1920.0, 1080.0)  // Maximum size
```

**Make Window Always on Top** (Add after line 21):
```rust
.always_on_top(true)  // Keep window above others
```

**Make Window Fullscreen** (Add after line 21):
```rust
.fullscreen(true)  // Start in fullscreen
```

---

### 3️⃣ **Navigation Functionality**

#### **Frontend Navigation Handlers** (`src/App.tsx`)

**Back Button** (Lines 106-110):
```tsx
const handleBack = async () => {
  if (activeContentWindow) {
    await invoke("go_back", { windowLabel: activeContentWindow });
  }
};
```

**Forward Button** (Lines 112-116):
```tsx
const handleForward = async () => {
  if (activeContentWindow) {
    await invoke("go_forward", { windowLabel: activeContentWindow });
  }
};
```

**Reload Button** (Lines 118-122):
```tsx
const handleReload = async () => {
  if (activeContentWindow) {
    await invoke("reload_page", { windowLabel: activeContentWindow });
  }
};
```

**Home Button** (Lines 124-130):
```tsx
const handleHome = async () => {
  const homeUrl = "https://www.google.com";  // Change default home page
  setUrl(homeUrl);
  if (activeContentWindow) {
    await invoke("navigate_to_url", { windowLabel: activeContentWindow, url: homeUrl });
  }
};
```

**Navigate from URL Bar** (Lines 85-104):
```tsx
const handleNavigate = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!activeContentWindow) return;

  let fullUrl = url.trim();

  // URL detection logic
  const isUrl = fullUrl.includes('.') && !fullUrl.includes(' ') ||
                 fullUrl.startsWith("http://") ||
                 fullUrl.startsWith("https://");

  if (isUrl) {
    if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
      fullUrl = "https://" + fullUrl;
    }
  } else {
    // Treat as search query
    fullUrl = `https://www.google.com/search?q=${encodeURIComponent(fullUrl)}`;
  }

  await invoke("navigate_to_url", { windowLabel: activeContentWindow, url: fullUrl });
};
```

---

#### **Backend Navigation Commands** (`src-tauri/src/lib.rs`)

**Navigate to URL** (Lines 30-41):
```rust
#[tauri::command]
async fn navigate_to_url(
    app: tauri::AppHandle,
    window_label: String,
    url: String,
) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(&window_label) {
        window.eval(&format!("window.location.href = '{}'", url))
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}
```

**Go Back** (Lines 43-53):
```rust
#[tauri::command]
async fn go_back(
    app: tauri::AppHandle,
    window_label: String,
) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(&window_label) {
        window.eval("window.history.back()")
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}
```

**Go Forward** (Lines 55-65):
```rust
#[tauri::command]
async fn go_forward(
    app: tauri::AppHandle,
    window_label: String,
) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(&window_label) {
        window.eval("window.history.forward()")
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}
```

**Reload Page** (Lines 67-77):
```rust
#[tauri::command]
async fn reload_page(
    app: tauri::AppHandle,
    window_label: String,
) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(&window_label) {
        window.eval("window.location.reload()")
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}
```

**Close Window** (Lines 79-88):
```rust
#[tauri::command]
async fn close_browser_window(
    app: tauri::AppHandle,
    window_label: String,
) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(&window_label) {
        window.close().map_err(|e| e.to_string())?;
    }
    Ok(())
}
```

---

### 4️⃣ **Window Transformation Settings**
**File**: `src/App.tsx`

#### **Transform to Notch** (Lines 14-32)
```tsx
const transformToNotch = async () => {
  const window = getCurrentWindow();
  const monitors = await availableMonitors();

  if (monitors && monitors.length > 0) {
    const primaryMonitor = monitors[0];
    const screenWidth = primaryMonitor.size.width;

    console.log('Transforming to notch mode...', { screenWidth });

    // Transform to notch at top of screen
    await window.setPosition(new PhysicalPosition(0, 0));        // Top-left corner
    await window.setSize(new PhysicalSize(screenWidth, 100));    // Full width, 100px tall
    await window.setAlwaysOnTop(true);                           // Stay on top

    console.log('Notch mode activated');
    setIsNotchMode(true);
  }
};
```

**Transform Back to Panel** (Lines 34-42):
```tsx
const transformToPanel = async () => {
  const window = getCurrentWindow();

  // Transform back to panel at center
  await window.setAlwaysOnTop(false);                      // Don't stay on top
  await window.setSize(new PhysicalSize(1200, 800));      // Panel size
  await window.center();                                   // Center on screen

  setIsNotchMode(false);
  setActiveContentWindow(null);
};
```

---

## 🎨 Common Customizations

### 1. **Make Notch Transparent/Glass Effect**
**File**: `src/App.tsx` (Line 232)
```tsx
// Current:
className="h-full w-full flex flex-col bg-gray-900 shadow-2xl border-b-4 border-blue-500"

// Change to:
className="h-full w-full flex flex-col bg-gray-900/70 backdrop-blur-lg shadow-2xl border-b-4 border-blue-500"
```

### 2. **Add More Quick Links**
**File**: `src/App.tsx` (Lines 208-215)
```tsx
{[
  { name: "Google", url: "https://google.com" },
  { name: "YouTube", url: "https://youtube.com" },
  { name: "Reddit", url: "https://reddit.com" },           // ← Add new
  { name: "Stack Overflow", url: "https://stackoverflow.com" },  // ← Add new
  { name: "Netflix", url: "https://netflix.com" },         // ← Add new
].map((site) => (
  <button
    key={site.name}
    onClick={() => handleQuickLink(site.url)}
    className="p-4 bg-white rounded-xl hover:shadow-xl transition-all"
  >
    <div className="text-base font-medium text-gray-800">{site.name}</div>
  </button>
))}
```

### 3. **Change Notch Position to Bottom**
**File**: `src/App.tsx` (Line 25)
```tsx
// Current (top of screen):
await window.setPosition(new PhysicalPosition(0, 0));

// Change to bottom:
const screenHeight = primaryMonitor.size.height;
await window.setPosition(new PhysicalPosition(0, screenHeight - 100));
```

### 4. **Make Notch Centered (Not Full Width)**
**File**: `src/App.tsx` (Lines 25-26)
```tsx
const screenWidth = primaryMonitor.size.width;
const notchWidth = 1000;  // Custom width
const x = (screenWidth - notchWidth) / 2;  // Center calculation

await window.setPosition(new PhysicalPosition(x, 0));
await window.setSize(new PhysicalSize(notchWidth, 100));
```

### 5. **Change Notch Height**
**File**: `src/App.tsx` (Line 26)
```tsx
await window.setSize(new PhysicalSize(screenWidth, 150));  // 150px instead of 100px
```

### 6. **Add Animation to Notch**
**File**: `src/App.tsx` (Line 231)
```tsx
import { motion } from "framer-motion";

// Wrap notch in motion.div:
return (
  <motion.div
    initial={{ y: -100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.3 }}
    className="h-full w-full flex flex-col bg-gray-900"
  >
    {/* Notch content */}
  </motion.div>
);
```

### 7. **Change Default Search Engine**
**File**: `src/App.tsx` (Lines 8, 100, 124)
```tsx
// Line 8 - Default URL
const [url, setUrl] = useState("https://duckduckgo.com");  // Change from Google

// Line 100 - Search query
fullUrl = `https://duckduckgo.com/?q=${encodeURIComponent(fullUrl)}`;

// Line 124 - Home button
const homeUrl = "https://duckduckgo.com";
```

### 8. **Add a "Print" Button to Notch**

**Frontend** (`src/App.tsx` - add after line 130):
```tsx
const handlePrint = async () => {
  if (activeContentWindow) {
    await invoke("print_page", { windowLabel: activeContentWindow });
  }
};

// In notch UI (add after line 263):
<button
  onClick={handlePrint}
  className="p-2 rounded hover:bg-gray-700 transition-colors text-white"
  title="Print"
>
  <Printer className="w-5 h-5" />  {/* Import Printer from lucide-react */}
</button>
```

**Backend** (`src-tauri/src/lib.rs` - add after line 77):
```rust
#[tauri::command]
async fn print_page(
    app: tauri::AppHandle,
    window_label: String,
) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(&window_label) {
        window.eval("window.print()")
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

// Add to invoke_handler (line 95):
.invoke_handler(tauri::generate_handler![
    create_content_window,
    navigate_to_url,
    go_back,
    go_forward,
    reload_page,
    close_browser_window,
    print_page  // ← Add here
])
```

### 9. **Change Content Window to Open Maximized**
**File**: `src-tauri/src/lib.rs` (Add after line 22)
```rust
.maximized(true)  // Start maximized
```

### 10. **Make Content Window Frameless with Custom Controls**
**File**: `src-tauri/src/lib.rs` (Line 22)
```rust
.decorations(false)  // Remove native titlebar
```

---

## 🔧 Adding New Features

### Example: Add "Bookmark" Functionality

#### Step 1: Add Frontend Handler
**File**: `src/App.tsx` (add after line 130)
```tsx
const [bookmarks, setBookmarks] = useState<string[]>([]);

const handleBookmark = async () => {
  if (activeContentWindow && url) {
    setBookmarks([...bookmarks, url]);
    console.log('Bookmarked:', url);
  }
};
```

#### Step 2: Add Button to Notch UI
**File**: `src/App.tsx` (add after line 263)
```tsx
<button
  onClick={handleBookmark}
  className="p-2 rounded hover:bg-yellow-600 transition-colors text-white"
  title="Bookmark"
>
  <Star className="w-5 h-5" />  {/* Import Star from lucide-react */}
</button>
```

#### Step 3: Display Bookmarks (Optional)
**File**: `src/App.tsx` (add in Panel Mode, after quick links)
```tsx
{/* Bookmarks Section */}
{bookmarks.length > 0 && (
  <motion.div className="mt-8">
    <h2 className="text-xl font-bold mb-4">Bookmarks</h2>
    <div className="flex gap-4 flex-wrap">
      {bookmarks.map((bookmark, index) => (
        <button
          key={index}
          onClick={() => handleQuickLink(bookmark)}
          className="px-4 py-2 bg-yellow-100 rounded-lg hover:bg-yellow-200"
        >
          {bookmark}
        </button>
      ))}
    </div>
  </motion.div>
)}
```

---

## 📝 Quick Reference Table

| Component | File | Lines | What It Controls |
|-----------|------|-------|------------------|
| **Panel UI** | `src/App.tsx` | 140-228 | Search bar, quick links, launcher interface |
| **Notch UI** | `src/App.tsx` | 230-299 | Top bar controls, URL bar, navigation buttons |
| **Transformation Logic** | `src/App.tsx` | 14-42 | Size/position of notch and panel |
| **Navigation Handlers** | `src/App.tsx` | 106-130 | Frontend button click handlers |
| **New Window Settings** | `src-tauri/src/lib.rs` | 3-28 | Window size, position, decorations |
| **Navigation Commands** | `src-tauri/src/lib.rs` | 30-88 | Back/forward/reload/close commands |
| **Permissions** | `src-tauri/capabilities/default.json` | All | Required window operation permissions |

---

## 🔨 Rebuilding After Changes

```bash
# For frontend changes (App.tsx, styles, React components):
npm run build

# For backend changes (lib.rs, Rust code):
cargo build --manifest-path src-tauri/Cargo.toml

# Run development server (auto-reloads frontend, requires rebuild for backend):
npm run tauri dev

# Full production build:
npm run tauri build
```

---

## ⚙️ Permissions System

**File**: `src-tauri/capabilities/default.json`

Tauri 2.0 requires explicit permissions for window operations. Current permissions:

```json
{
  "permissions": [
    "core:default",                           // Basic functionality
    "core:window:allow-minimize",             // Minimize window
    "core:window:allow-maximize",             // Maximize window
    "core:window:allow-unmaximize",          // Restore window
    "core:window:allow-toggle-maximize",     // Toggle maximize
    "core:window:allow-close",               // Close window
    "core:window:allow-start-dragging",      // Drag window
    "core:window:allow-set-position",        // Set window position (for notch)
    "core:window:allow-set-size",            // Set window size (for notch)
    "core:window:allow-set-always-on-top",   // Keep window on top
    "core:window:allow-center",              // Center window
    "core:window:allow-available-monitors",  // Get monitor info
    "core:window:allow-primary-monitor",     // Get primary monitor
    "core:window:allow-current-monitor",     // Get current monitor
    "core:event:allow-listen",               // Listen to events
    "core:event:allow-emit",                 // Emit events
    "opener:default"                          // Open URLs
  ]
}
```

**To add new window operations**, you must:
1. Add the permission to this file
2. Rebuild the Rust backend: `cargo build --manifest-path src-tauri/Cargo.toml`

---

## 💡 Tips & Best Practices

1. **Frontend Changes** (UI/styling/logic) → Edit `src/App.tsx`
2. **Backend Changes** (window behavior/commands) → Edit `src-tauri/src/lib.rs`
3. **Always rebuild** after changes:
   - Frontend: `npm run build`
   - Backend: `cargo build --manifest-path src-tauri/Cargo.toml`
4. **Test in dev mode first**: `npm run tauri dev`
5. **Need new window operations?** → Add permissions to `src-tauri/capabilities/default.json`
6. **CSS classes use Tailwind**: Refer to [Tailwind CSS docs](https://tailwindcss.com/docs)
7. **Icons from Lucide React**: See [Lucide icons](https://lucide.dev/icons/)
8. **Keep console open** during dev to see logs and errors

---

## 🐛 Troubleshooting

### Permission Errors
**Error**: `window.set_position not allowed`
**Solution**: Add the required permission to `src-tauri/capabilities/default.json` and rebuild Rust backend

### Window Not Transforming
**Check**:
1. Console logs - should see "Transforming to notch mode..."
2. Permissions are added
3. `isNotchMode` state is updating

### New Command Not Working
**Check**:
1. Command defined in `src-tauri/src/lib.rs` with `#[tauri::command]`
2. Command added to `invoke_handler` in `run()` function
3. Rebuilt Rust backend: `cargo build`
4. Calling correct command name from frontend

### Styling Not Updating
**Solution**:
1. Rebuild frontend: `npm run build`
2. Hard refresh browser: Ctrl+Shift+R
3. Check Tailwind class names are correct

---

## 📚 Additional Resources

- **Tauri Documentation**: https://tauri.app/v2/
- **React Documentation**: https://react.dev/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Lucide Icons**: https://lucide.dev/
- **Framer Motion**: https://www.framer.com/motion/

---

## 🎯 Summary

- **Main Window (Panel + Notch)**: `src/App.tsx`
- **New Browser Windows**: `src-tauri/src/lib.rs` → `create_content_window()`
- **Navigation Commands**: `src-tauri/src/lib.rs` → `go_back()`, `go_forward()`, etc.
- **Permissions**: `src-tauri/capabilities/default.json`
- **Rebuild**: `npm run build` (frontend) + `cargo build` (backend)

Start customizing by editing these files and rebuilding! 🚀
