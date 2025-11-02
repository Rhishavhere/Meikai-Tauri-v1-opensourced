<div align="center">

# 🌊 Meikai Browser

### *A Reimagined Desktop Browser Experience*

[![Tauri](https://img.shields.io/badge/Tauri-2.0-24C8D8?style=for-the-badge&logo=tauri&logoColor=white)](https://tauri.app/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Rust](https://img.shields.io/badge/Rust-1.80-CE422B?style=for-the-badge&logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Windows](https://img.shields.io/badge/Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white)](https://www.microsoft.com/windows)

---

**Meikai Browser** or **Meik** reimagines web browsing with a unique transformation architecture. Start with an elegant launcher panel, then watch it morph into a screen-top "notch" control bar while your websites open in native, fully-featured windows.

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Architecture](#-architecture) • [Development](#-development) • [Contributing](#-contributing)

---

</div>

## ✨ Features

### 🎯 **Dynamic Window Transformation**
- **Panel Mode**: Beautiful launcher interface with search bar and quick links
- **Notch Mode**: Main window transforms into a screen-top control bar when browsing
- **Seamless Transition**: Smooth transformation between modes

### 🪟 **Native Window Experience**
- Each website opens in a **separate native WebView2 window**
- Fully resizable, draggable, and independent
- Native window decorations and controls
- No tab clutter - pure multi-window browsing

### 🎮 **Powerful Controls**
- **Navigation**: Back, Forward, Reload, Home buttons
- **Smart URL Bar**: Detects URLs vs. search queries automatically
- **Window Management**: Minimize, maximize, close from the notch
- **Always on Top**: Notch stays accessible above all windows

### 🚀 **Modern Tech Stack**
- Built with **Tauri 2.0** - Fast, secure, and lightweight
- **React 19** + **TypeScript** for type-safe UI
- **Tailwind CSS 4** for beautiful, responsive design
- **Framer Motion** for smooth animations
- **WebView2** - Native Windows browser engine

### 🎨 **Customizable Design**
- Clean, modern interface
- Customizable quick links
- Smooth animations and transitions
- Dark mode notch with glass-morphism effects

---

## 📦 Installation

### Prerequisites
- **Windows 10/11** (WebView2 required)
- **Node.js** 18+ and npm
- **Rust** 1.70+

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/manta-browser.git
   cd manta-browser
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode**
   ```bash
   npm run tauri dev
   ```

4. **Build for production**
   ```bash
   npm run tauri build
   ```

The built executable will be in `src-tauri/target/release/`.

---

## 🎯 Usage

### Panel Mode (Launcher)
1. Launch Manta Browser
2. Enter a URL or search query in the search bar
3. Or click one of the quick link buttons (Google, YouTube, GitHub, etc.)

### Notch Mode (Active Browsing)
- Once you navigate to a URL, the main window transforms into a notch at the top of your screen
- The website opens in a new centered window
- Use the notch controls to:
  - Navigate back/forward
  - Reload the page
  - Go to home page
  - Enter new URLs
  - Close the window (returns to Panel Mode)

### Keyboard Shortcuts
- `Enter` - Navigate to URL or search
- Focus URL bar - Click or auto-selected on navigation

---



### Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite |
| **Styling** | Tailwind CSS 4 (@tailwindcss/vite) |
| **UI Library** | Lucide React (icons), Framer Motion (animations) |
| **Desktop Framework** | Tauri 2.0 (unstable features) |
| **Backend** | Rust |
| **Browser Engine** | WebView2 (Windows) |
| **Build Tool** | Vite 5 |

### Key Components

- **`src/App.tsx`** - Main UI with Panel/Notch dual modes
- **`src-tauri/src/lib.rs`** - Rust backend with Tauri commands
- **`src-tauri/capabilities/default.json`** - Window permissions
- **`src-tauri/tauri.conf.json`** - Tauri configuration

---

## 🛠️ Development

### Project Structure

```
manta-browser/
├── src/                      # React frontend
│   ├── App.tsx              # Main application (Panel + Notch modes)
│   ├── main.tsx             # React entry point
│   └── index.css            # Tailwind styles
├── src-tauri/               # Rust backend
│   ├── src/
│   │   ├── lib.rs          # Tauri commands and logic
│   │   └── main.rs         # Application entry point
│   ├── capabilities/
│   │   └── default.json    # Window permissions
│   ├── Cargo.toml          # Rust dependencies
│   └── tauri.conf.json     # Tauri configuration
├── index.html               # Main HTML entry
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
├── CLAUDE.md                # AI assistant documentation
├── INFO.md                  # Customization guide
└── README.md                # This file
```

### Available Commands

```bash
# Development
npm run tauri dev          # Start dev server + Tauri app
npm run dev                # Start Vite dev server only
npm run build              # Build frontend

# Production
npm run tauri build        # Build production executable

# Rust
cargo clean --manifest-path src-tauri/Cargo.toml  # Clean Rust build
cargo build --manifest-path src-tauri/Cargo.toml  # Build Rust backend
```

### Customization

For detailed customization guides, see **[INFO.md](INFO.md)**:
- Modify Panel Mode UI
- Customize Notch Mode appearance
- Add new Tauri commands
- Configure window behavior
- Update permissions
- Add new quick links

## 🧪 Testing

Currently, the browser is in active development. Testing includes:
- Manual testing of window transformations
- URL navigation verification
- Window control functionality
- Permission system validation




### 🌊 Made with passion for innovative browsing experiences


</div>
