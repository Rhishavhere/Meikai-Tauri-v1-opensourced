# Meikai AI - Implementation


## Phase 1: Foundation

### Goal
Establish infrastructure that all AI features depend on.

### Tasks

#### 1.1 CDP Research & Prototype
- [ ] Enable WebView2 remote debugging in Tauri
- [ ] Connect to CDP from Rust
- [ ] Test basic commands: screenshot, DOM access
- [ ] Document findings / workarounds

#### 1.2 Window Registry
- [ ] Create `window_registry.rs` with global state
- [ ] Register/unregister tabs on create/close
- [ ] Track URL, title, active state
- [ ] Sync events to React frontend
- [ ] Commands: `get_open_tabs`, `find_tab`, `switch_tab`

#### 1.3 Python Sidecar Setup
- [ ] Create Python project structure
- [ ] Gemini Flash client with function calling
- [ ] Communication protocol (stdin/stdout JSON)
- [ ] Tauri sidecar integration (`externalBin`)
- [ ] PyInstaller build script

#### 1.4 Basic Commands
- [ ] `get_page_state(tab_id)` → screenshot + content
- [ ] `get_accessibility_tree(tab_id)` via CDP
- [ ] Test end-to-end: Python → Rust → WebView2

### Deliverable
Python sidecar can request screenshot + A11y tree from any tab.

---

## Phase 2: AI Chat

### Goal
User can ask AI about the current page.

### Tasks

#### 2.1 Chat UI
- [ ] Chat panel component (slide-in or overlay)
- [ ] Message history display
- [ ] Input with send button
- [ ] Manual "attach screenshot" button
- [ ] Loading/thinking states

#### 2.2 Chat Backend
- [ ] Rust command: `send_chat_message`
- [ ] Python handler: receive message + context
- [ ] Gemini API call with page context
- [ ] Stream response back to UI

#### 2.3 Context Extraction
- [ ] Extract readable text from page
- [ ] Extract metadata (title, description)
- [ ] Screenshot on demand (when user clicks button)

### Deliverable
Working AI chat that understands current page context.

---

## Phase 3: Semantic History 

### Goal
Natural language search over browsing history.

### Tasks

#### 3.1 Page Indexing
- [ ] Hook into URL change events
- [ ] Background extraction (after page load)
- [ ] Generate summary + tags via Gemini
- [ ] Generate embedding (Gemini or local model)
- [ ] Store in SQLite with vector column

#### 3.2 Vector Storage
- [ ] Set up sqlite-vss or ChromaDB
- [ ] Schema: id, url, title, timestamp, summary, tags, embedding
- [ ] Efficient similarity search

#### 3.3 Search UI
- [ ] Enhanced search bar in Panel Mode
- [ ] Detect "semantic" vs "direct URL" queries
- [ ] Display results with previews
- [ ] Click to open page

#### 3.4 Search Backend
- [ ] Embed user query
- [ ] Vector similarity search
- [ ] Optional: LLM rerank for better results
- [ ] Return top matches

### Deliverable
"What was that article about X" returns relevant history.

---

## Phase 4: AI Agent

### Goal
AI can automate browser tasks visibly.

### Tasks

#### 4.1 Action Commands
- [ ] `agent_click(selector)`
- [ ] `agent_type(selector, text)`
- [ ] `agent_navigate(url)`
- [ ] `agent_scroll(direction)`
- [ ] `agent_open_tab(url)`
- [ ] `agent_close_tab(tab_id)`
- [ ] `agent_wait(seconds)`

#### 4.2 Agent Loop (Python)
- [ ] Receive task from user
- [ ] Loop: get state → call Gemini → execute action
- [ ] Parse function call responses
- [ ] Handle errors / retries
- [ ] Detect completion

#### 4.3 Function Calling
- [ ] Define tool schemas for Gemini
- [ ] Parse structured outputs
- [ ] Map to Rust commands

#### 4.4 Agent UI
- [ ] Agent mode activation (button/command)
- [ ] Live status display ("Looking at WhatsApp...")
- [ ] Action history log
- [ ] Pause / Stop controls
- [ ] Completion summary

#### 4.5 Safety & Polish
- [ ] Action preview (optional "confirm" mode)
- [ ] Rate limiting
- [ ] Error recovery strategies
- [ ] Edge case handling

### Deliverable
User says "Send message to X on WhatsApp" → AI does it visibly.

---

## Risk Mitigation

| Risk | Mitigation | When to Address |
|------|------------|-----------------|
| CDP doesn't work with Tauri's WebView2 | Research spike in Phase 1 | Week 1 |
| Gemini accuracy issues | Prompt engineering, fallbacks | Phase 4 |
| Python bundle too large | Optimize PyInstaller, exclude unused | Phase 1 |
| Performance on low-end PCs | Add "lite" mode, reduce polling | Phase 4 |

---

## Success Criteria

### Phase 1 ✓
- [ ] CDP commands work from Rust
- [ ] Python sidecar starts and communicates
- [ ] Window registry tracks all tabs

### Phase 2 ✓
- [ ] Chat UI opens and closes
- [ ] AI responds with page context
- [ ] Screenshot attachment works

### Phase 3 ✓
- [ ] Pages auto-index on visit
- [ ] "Article about X" finds correct page
- [ ] Search feels fast (<1 sec)

### Phase 4 ✓
- [ ] "Open Google and search for Y" works
- [ ] Multi-step tasks complete
- [ ] User can pause/stop anytime
- [ ] Actions visible in real-time

