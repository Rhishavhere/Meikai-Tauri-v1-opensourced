# Meikai Browser - .claude Project Documentation

This folder contains organized documentation and context for AI assistants and developers working on the Meikai Browser project.

## 📁 Structure

```
.claude/
├── settings.json           # Project metadata and AI context
├── docs/                   # Detailed documentation
│   ├── ARCHITECTURE.md     # System architecture and design
│   ├── COMPONENTS.md       # React component reference
│   ├── BACKEND.md          # Rust/Tauri backend reference
│   ├── QUICK_START.md      # Quick development guide
│   └── FILE_MAP.md         # Complete file inventory
├── workflows/              # Step-by-step guides
│   ├── development.md      # Development workflow
│   ├── add-component.md    # Adding new React components
│   ├── add-tauri-command.md # Adding new Tauri commands
│   └── debugging.md        # Debugging tips and tricks
└── commands/               # Quick command references
    ├── run-dev.md          # Start development server
    ├── build.md            # Build for production
    └── clean.md            # Clean build artifacts
```

## 🎯 Quick Access

### For Understanding the Project
- Start with [ARCHITECTURE.md](docs/ARCHITECTURE.md) for the big picture
- See [COMPONENTS.md](docs/COMPONENTS.md) for UI component details
- Check [BACKEND.md](docs/BACKEND.md) for Rust command reference

### For Development
- [QUICK_START.md](docs/QUICK_START.md) - Get up and running
- [FILE_MAP.md](docs/FILE_MAP.md) - Find any file quickly

### For Common Tasks
- `/development` - Set up and run dev environment
- `/add-component` - Add a new React component  
- `/add-tauri-command` - Add a new Tauri IPC command
- `/debugging` - Debug common issues

## 🌊 About Meikai

**Meikai Browser** reimagines web browsing with a unique architecture:
- **No tabs** - Each website opens in its own native window
- **Dock control** - Central control bar manages all windows
- **Native performance** - Built with Tauri 2.0 and WebView2
- **Clean UI** - Minimal, fresh design philosophy

## 🔗 Other Documentation

- [CLAUDE.md](../CLAUDE.md) - AI assistant context (project root)
- [INFO.md](../INFO.md) - Detailed customization guide
- [README.md](../README.md) - Project overview and installation
