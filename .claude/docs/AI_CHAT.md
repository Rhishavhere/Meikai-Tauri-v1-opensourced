# AI Chat Feature

## Overview

Context-aware AI assistant that understands the page user is viewing.

## User Flow

```
1. User clicks AI button in Dock
2. Chat panel opens
3. User types question
4. (Optional) User clicks "📷" to attach screenshot
5. AI responds with page context
```

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  React UI   │────▶│    Rust     │────▶│   Python    │
│  Chat Panel │◀────│   Bridge    │◀────│   Gemini    │
└─────────────┘     └─────────────┘     └─────────────┘
```

## Input to AI

| Data | When Sent |
|------|-----------|
| Page URL | Always |
| Page title | Always |
| Page text content | Always |
| Screenshot | When user clicks attach |
| Previous messages | Always (context) |

## Rust Commands

```rust
// Get page content for AI
get_page_content(tab_id: String) -> PageContent

struct PageContent {
    url: String,
    title: String,
    text: String,           // Extracted readable text
    meta_description: String,
}

// Get screenshot
capture_screenshot(tab_id: String) -> String  // base64

// Send to Python sidecar
send_chat_message(message: String, context: ChatContext) -> String
```

## Python Handler

```python
async def handle_chat(message: str, context: ChatContext) -> str:
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": [
            {"type": "text", "text": f"Page: {context.url}\n\n{context.text}"},
            {"type": "text", "text": message}
        ]}
    ]
    
    if context.screenshot:
        messages[1]["content"].insert(1, {
            "type": "image",
            "data": context.screenshot
        })
    
    response = await gemini.generate(messages)
    return response.text
```

## UI Components

```
┌─────────────────────────────────────┐
│  AI Chat                       [×]  │
├─────────────────────────────────────┤
│                                     │
│  🤖 How can I help with this page? │
│                                     │
│  👤 What's the main topic here?    │
│                                     │
│  🤖 This page is about...          │
│                                     │
├─────────────────────────────────────┤
│  [📷] [Type a message...    ] [➤]  │
└─────────────────────────────────────┘
```

## Implementation Priorities

1. [ ] Chat panel React component
2. [ ] Page content extraction (JS injection)
3. [ ] Screenshot capture command
4. [ ] Python Gemini client
5. [ ] Streaming responses (nice to have)
