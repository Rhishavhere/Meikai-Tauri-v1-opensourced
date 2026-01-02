# AI Agent Feature

## Overview

Autonomous browser control where AI performs tasks visibly in front of the user.

## Example Tasks

- "Send my flight timings to Rhishav on WhatsApp"
- "Book a table at the Italian restaurant I looked at yesterday"
- "Find the cheapest flight to Mumbai next weekend"
- "Post this image to Twitter with caption 'Hello world'"

## Agent Loop

```
┌──────────────────────────────────────────────────────────────────┐
│                         AGENT LOOP                                │
│                                                                   │
│   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐         │
│   │ Get     │──▶│ Gemini  │──▶│ Execute │──▶│ Verify  │──▶ Loop │
│   │ State   │   │ Decide  │   │ Action  │   │ Result  │         │
│   └─────────┘   └─────────┘   └─────────┘   └─────────┘         │
│       │                           │                              │
│       │   Screenshot              │   click(), type()            │
│       │   A11y Tree               │   navigate(), etc.           │
│       │   Open Tabs               │                              │
└──────────────────────────────────────────────────────────────────┘
```

## Input to Gemini (Each Step)

```python
{
    "screenshot": "base64...",        # Visual context
    "accessibility_tree": {...},      # Element structure
    "current_url": "https://...",
    "open_tabs": [
        {"id": "tab-1", "url": "...", "title": "..."},
        {"id": "tab-2", "url": "...", "title": "..."}
    ],
    "task": "Send flight times to Rhishav on WhatsApp",
    "previous_actions": [...]
}
```

## Available Functions

```python
AGENT_FUNCTIONS = [
    # Browser actions
    {"name": "click", "params": {"selector": "string"}},
    {"name": "type", "params": {"selector": "string", "text": "string"}},
    {"name": "navigate", "params": {"url": "string"}},
    {"name": "scroll", "params": {"direction": "up|down"}},
    {"name": "press_key", "params": {"key": "Enter|Tab|Escape"}},
    
    # Tab management
    {"name": "open_tab", "params": {"url": "string"}},
    {"name": "switch_tab", "params": {"tab_id": "string"}},
    {"name": "close_tab", "params": {"tab_id": "string"}},
    
    # Control
    {"name": "wait", "params": {"seconds": "number"}},
    {"name": "done", "params": {"result": "string"}},
]
```

## Rust Commands (CDP-based)

```rust
// Actions
agent_click(selector: String) -> Result<(), String>
agent_type(selector: String, text: String) -> Result<(), String>
agent_navigate(url: String) -> Result<(), String>
agent_scroll(direction: String) -> Result<(), String>
agent_press_key(key: String) -> Result<(), String>

// Tab management (via Window Registry)
agent_open_tab(url: String) -> Result<TabInfo, String>
agent_switch_tab(tab_id: String) -> Result<(), String>
agent_close_tab(tab_id: String) -> Result<(), String>

// State
get_page_state(tab_id: String) -> PageState
get_accessibility_tree(tab_id: String) -> A11yTree
capture_screenshot(tab_id: String) -> String
```

## Python Agent

```python
async def run_agent(task: str):
    history = []
    
    while True:
        # 1. Get current state
        state = await call_rust("get_page_state", {"tab_id": get_active_tab()})
        
        # 2. Call Gemini with function calling
        response = await gemini.generate(
            system="You are a browser automation agent...",
            messages=history,
            tools=AGENT_FUNCTIONS,
            context=state
        )
        
        # 3. Extract and execute function call
        fn = response.function_call
        
        if fn.name == "done":
            return {"success": True, "result": fn.args["result"]}
        
        try:
            result = await call_rust(f"agent_{fn.name}", fn.args)
            history.append({"action": fn, "result": "success"})
        except Exception as e:
            history.append({"action": fn, "result": f"error: {e}"})
        
        # 4. Small delay for page to update
        await asyncio.sleep(0.5)
```

## UI

```
┌─────────────────────────────────────────────────────────┐
│  🤖 AI Agent                              [⏸ Pause] [×] │
├─────────────────────────────────────────────────────────┤
│  Task: Send flight times to Rhishav on WhatsApp         │
├─────────────────────────────────────────────────────────┤
│  ✓ Opened Google Calendar                               │
│  ✓ Found flight event: "Mumbai - Jan 15, 2:30 PM"       │
│  → Opening WhatsApp Web...                               │
│  ⋯ Looking for Rhishav's chat...                        │
└─────────────────────────────────────────────────────────┘
```

## Safety Controls

| Control | Implementation |
|---------|----------------|
| **Pause** | Button pauses loop, user can resume |
| **Stop** | Button cancels task immediately |
| **Visible** | All actions happen in visible windows |
| **No sensitive** | Optional blocklist for banking/financial sites |
| **Timeout** | Max 60 steps per task |

## Accessibility Tree Format

```json
{
  "role": "RootWebArea",
  "name": "WhatsApp",
  "children": [
    {
      "role": "navigation",
      "name": "Chat list",
      "children": [
        {
          "role": "listitem",
          "name": "Rhishav",
          "selector": "[data-testid='cell-frame-container']:nth-child(3)"
        }
      ]
    },
    {
      "role": "textbox",
      "name": "Type a message",
      "selector": "[data-testid='conversation-compose-box-input']"
    },
    {
      "role": "button",
      "name": "Send",
      "selector": "[data-testid='send']"
    }
  ]
}
```

## Implementation Tasks

1. [ ] CDP integration for WebView2
2. [ ] A11y tree extraction via CDP
3. [ ] Action commands (click, type, etc.)
4. [ ] Window registry integration
5. [ ] Python agent loop
6. [ ] Gemini function calling
7. [ ] Agent UI panel
8. [ ] Pause/Stop controls
9. [ ] Error handling & retries
10. [ ] Testing on common sites (WhatsApp, Gmail, Calendar)
