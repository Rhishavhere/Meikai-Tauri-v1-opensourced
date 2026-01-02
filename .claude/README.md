# Meikai Browser - .claude Project Documentation

> **The Web Reimagined. Calm and Pure with Advanced AI Browsing.**

This folder contains organized documentation for AI assistants and developers working on Meikai Browser.

## 🌊 Vision

Meikai is evolving from a minimal browser into an **AI-native browser** with three pillars:

| Feature | Description |
|---------|-------------|
| **🗨️ AI Chat** | Ask AI about any page you're viewing |
| **🔍 Semantic History** | Search history with natural language |
| **🤖 AI Agent** | AI automates tasks visibly in the browser |

## 📁 Documentation Structure

```
.claude/
├── README.md               # This file
├── settings.json           # Project metadata & AI context
│
├── docs/
│   ├── MEIKAI_AI.md        # ⭐ AI vision & architecture (START HERE)
│   ├── ROADMAP.md          # ⭐ Implementation timeline & phases
│   │
│   ├── AI_CHAT.md          # AI Chat feature spec
│   ├── SEMANTIC_HISTORY.md # Semantic History feature spec
│   ├── AI_AGENT.md         # AI Agent feature spec
│   ├── CDP_INTEGRATION.md  # Chrome DevTools Protocol guide
│   │
│   ├── ARCHITECTURE.md     # Current browser architecture
│   ├── COMPONENTS.md       # React component reference
│   ├── BACKEND.md          # Rust backend reference
│   ├── FILE_MAP.md         # Complete file inventory
│   ├── GLOSSARY.md         # Terms and concepts
│   └── QUICK_START.md      # Developer quick start
│
├── workflows/
│   ├── development.md      # Dev environment setup
│   ├── add-component.md    # Adding React components
│   ├── add-tauri-command.md # Adding Tauri commands
│   └── debugging.md        # Debugging guide
│
└── commands/
    ├── run-dev.md          # Start dev server
    ├── build.md            # Production build
    └── clean.md            # Clean artifacts
```

## 🚀 Getting Started

### For the AI Vision
1. Read [MEIKAI_AI.md](docs/MEIKAI_AI.md) - Full architecture
2. Read [ROADMAP.md](docs/ROADMAP.md) - Implementation plan

### For Feature Details
- [AI_CHAT.md](docs/AI_CHAT.md) - Context-aware chat
- [SEMANTIC_HISTORY.md](docs/SEMANTIC_HISTORY.md) - Vector search
- [AI_AGENT.md](docs/AI_AGENT.md) - Browser automation

### For Current Browser Code
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - How it works now
- [COMPONENTS.md](docs/COMPONENTS.md) - React components
- [BACKEND.md](docs/BACKEND.md) - Rust commands

## 🛠️ Tech Stack

| Layer | Current | Adding for AI |
|-------|---------|---------------|
| Frontend | React 19, TypeScript, Tailwind | AI Chat UI, Agent UI |
| Desktop | Tauri 2.0, WebView2 | CDP integration |
| Backend | Rust | Window Registry, CDP Bridge |
| AI | - | **Python Sidecar**, Gemini Flash |
| Storage | JSON files | **SQLite + Vectors** |

## 📋 Implementation Phases

```
Phase 1: Foundation     [Weeks 1-3]  → CDP, Registry, Python Sidecar
Phase 2: AI Chat        [Weeks 4-5]  → Page context → Gemini → Response
Phase 3: Semantic Hist  [Weeks 6-8]  → Vector search over history
Phase 4: AI Agent       [Weeks 9-14] → Function calling + automation
```

## 🔗 Other Documentation

- [CLAUDE.md](../CLAUDE.md) - Root AI context
- [INFO.md](../INFO.md) - Customization guide
- [README.md](../README.md) - Project overview
