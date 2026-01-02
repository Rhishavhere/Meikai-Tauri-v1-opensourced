---
description: How to set up the Python sidecar for AI features
---

# Python Sidecar Setup

## Overview

The Python sidecar handles all AI processing:
- Gemini API calls
- Embedding generation
- Agent logic
- Vector search

## Project Structure

```
meikai-ai/
├── main.py              # Entry point, stdin/stdout communication
├── gemini_client.py     # Gemini Flash API wrapper
├── chat.py              # AI Chat handler
├── history.py           # Semantic history indexing/search
├── agent.py             # AI Agent loop
├── requirements.txt     # Dependencies
└── build.py             # PyInstaller build script
```

## Setup for Development

```bash
# Create virtual environment
cd meikai-ai
python -m venv venv

# Activate
./venv/Scripts/activate  # Windows

# Install dependencies
pip install -r requirements.txt
```

## requirements.txt

```
google-generativeai>=0.3.0
chromadb>=0.4.0
# OR sqlite-vss (for sqlite-based vectors)
```

## Communication Protocol

### Stdin/Stdout JSON

Rust sends JSON commands, Python returns JSON responses:

```json
// Request (from Rust)
{"id": 1, "method": "chat", "params": {"message": "What is this page?", "context": {...}}}

// Response (from Python)
{"id": 1, "result": "This page is about..."}

// Error
{"id": 1, "error": "Something went wrong"}
```

### main.py Template

```python
import sys
import json
from chat import handle_chat
from agent import run_agent
from history import search_history

def main():
    for line in sys.stdin:
        try:
            request = json.loads(line)
            method = request.get("method")
            params = request.get("params", {})
            
            if method == "chat":
                result = handle_chat(**params)
            elif method == "agent":
                result = run_agent(**params)
            elif method == "search_history":
                result = search_history(**params)
            else:
                result = {"error": f"Unknown method: {method}"}
            
            response = {"id": request.get("id"), "result": result}
        except Exception as e:
            response = {"id": request.get("id"), "error": str(e)}
        
        print(json.dumps(response), flush=True)

if __name__ == "__main__":
    main()
```

## Building for Distribution

```bash
# Install PyInstaller
pip install pyinstaller

# Build single executable
pyinstaller --onefile --name meikai-ai main.py

# Output: dist/meikai-ai.exe
```

## Tauri Integration

### tauri.conf.json

```json
{
  "bundle": {
    "externalBin": ["binaries/meikai-ai"]
  }
}
```

### Rust Code

```rust
use tauri_plugin_shell::ShellExt;

#[tauri::command]
async fn call_python(app: tauri::AppHandle, method: String, params: serde_json::Value) -> Result<serde_json::Value, String> {
    let sidecar = app.shell().sidecar("meikai-ai").map_err(|e| e.to_string())?;
    
    let request = serde_json::json!({
        "id": 1,
        "method": method,
        "params": params
    });
    
    // Send request, get response
    // ...
}
```

## Testing Locally

```bash
# Run sidecar manually
echo '{"id":1,"method":"chat","params":{"message":"Hello"}}' | python main.py
```

## Environment Variables

```bash
# Gemini API key (user provides)
GEMINI_API_KEY=xxx

# Or load from config file
```
