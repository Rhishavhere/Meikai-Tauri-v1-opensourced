# Meikai AI - Architecture & Vision

> **The Web Reimagined. Calm and Pure with Advanced AI Browsing.**

## Vision

Meikai transforms from a minimal browser into an **AI-native browser** where:
- Users can **ask AI about any page** they're viewing
- History becomes **semantically searchable** ("that article about black holes last week")
- AI can **automate browser tasks** visibly in front of the user

---

## Three Pillars of Meikai AI

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           MEIKAI AI                                      │
├──────────────────┬───────────────────────┬──────────────────────────────┤
│   🗨️ AI CHAT     │  🔍 SEMANTIC HISTORY   │   🤖 AI AGENT                │
│   (Passive)      │     (Indexer)          │     (Active Control)         │
│                  │                        │                              │
│  Ask questions   │  Natural language      │  "Send my flight times      │
│  about current   │  history search        │   to Rhishav on WhatsApp"   │
│  page            │                        │                              │
│                  │  "What was that site   │  AI opens tabs, clicks,     │
│  Get summaries,  │   about cooking I      │  types, navigates -         │
│  explanations    │   saw yesterday?"      │  all visible to user        │
└──────────────────┴───────────────────────┴──────────────────────────────┘
```

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MEIKAI BROWSER                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  FRONTEND (React)                                                        │
│  ├── Panel Mode (launcher with AI search)                               │
│  ├── Dock Mode (browser control + AI button)                            │
│  ├── AI Chat Panel                                                       │
│  ├── Semantic History Search UI                                          │
│  └── Agent Mode UI (live action view)                                    │
├─────────────────────────────────────────────────────────────────────────┤
│  RUST BACKEND (Tauri)                                                    │
│  ├── Window Management (existing)                                        │
│  ├── Window Registry (NEW - tracks all tabs globally)                   │
│  ├── Browser Control (VERIFIED - using eval())                          │
│  │   ├── agent_click(selector)   → eval("el.click()")                   │
│  │   ├── agent_type(selector, text) → eval("el.value = x")              │
│  │   ├── agent_scroll(direction) → eval("scrollBy()")                   │
│  │   └── capture_screenshot()    → html2canvas                          │
│  └── Python Sidecar Communication (stdin/stdout)                        │
├─────────────────────────────────────────────────────────────────────────┤
│  PYTHON SIDECAR                                                          │
│  ├── Gemini Flash Integration                                            │
│  ├── AI Chat Handler                                                     │
│  ├── Semantic History                                                    │
│  │   ├── Page Analyzer (summarize, tag, embed)                          │
│  │   ├── Local Vector Store (ChromaDB / sqlite-vss)                     │
│  │   └── Search Handler                                                  │
│  └── AI Agent                                                            │
│       ├── Task Planner                                                   │
│       ├── Action Executor (function calling)                             │
│       └── Result Reporter                                                │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## AI Agent - How It Works

### Input (Every Step)
```
┌────────────────────────────────────────┐
│  TO GEMINI FLASH:                      │
│  ├── Screenshot (visual context)       │
│  ├── A11y Tree (element structure)     │
│  ├── Current URL                        │
│  ├── Open tabs list                     │
│  └── Task + conversation history        │
└────────────────────────────────────────┘
```

### Output (Function Call)
```python
# Gemini returns structured function calls:
click(selector="button[aria-label='Send']")
type(selector="input#message", text="Hello!")
navigate(url="https://whatsapp.com")
open_tab(url="https://calendar.google.com")
switch_tab(tab_id="tab-2")
scroll(direction="down")
wait(seconds=2)
done(result="Message sent successfully")
```

### Execution
```
Gemini → Function Call → Rust (CDP) → Browser Action → Screenshot → Loop
```

---

## LLM Choice

| Provider | Model | Use Case |
|----------|-------|----------|
| **Gemini Flash** | `gemini-2.0-flash-exp` | Primary - fast, cheap, good vision |
| Fallback | User's own API key | OpenAI, Claude, etc. |

---

## Data Storage

| Data | Location | Format |
|------|----------|--------|
| Bookmarks | `$APPDATA/bookmarks.json` | JSON |
| Settings | `$APPDATA/settings.json` | JSON |
| Semantic History | `$APPDATA/history.db` | SQLite + vectors |
| Embeddings | Same DB | Float arrays |

---

## Key New Components

### 1. Window Registry (Rust)
Global state tracking all browser windows:
```rust
struct BrowserTab {
    id: String,           // "tab-1", "tab-2"
    window_label: String, // Internal Tauri label
    url: String,
    title: String,
    is_active: bool,
}
```

### 2. CDP Bridge (Rust)
Interface to Chrome DevTools Protocol:
```rust
// Enable via WebView2 remote debugging
cdp_click(selector) 
cdp_type(text)
get_accessibility_tree()
capture_screenshot()
```

### 3. Python Sidecar
Bundled Python executable for AI:
```
meikai-ai.exe (PyInstaller bundle)
├── gemini_client.py
├── agent.py
├── history.py
└── embeddings.py
```

### 4. Rust ↔ Python Communication
```
stdin/stdout JSON
  OR
Local HTTP (127.0.0.1:PORT)
```

---

## User Experience

### AI Chat
- Button in Dock → Opens chat panel
- Manual screenshot button (user decides when to share visual)
- Ask anything about current page

### Semantic History  
- Search bar in Panel Mode accepts natural language
- "That recipe site from last week" → Vector search → Results

### AI Agent
- Trigger via command or dedicated mode
- User watches AI work in real-time
- Pause/Stop always available
- Clear feedback on what AI is doing

---

## Performance Expectations

| Action | Time |
|--------|------|
| Screenshot + A11y capture | ~100-200ms |
| Gemini API round trip | ~500-1500ms |
| CDP action execution | ~50-100ms |
| **Per step total** | ~1-2 seconds |
| **Full task (6 steps)** | ~10-15 seconds |

---

## Security & Privacy

- **Local-first**: History stored locally, no cloud sync by default
- **User API keys**: User provides their own Gemini key
- **Visible AI**: All agent actions visible, nothing hidden
- **Pause/Stop**: User can halt agent anytime
- **No background execution**: Agent only works when user is watching
