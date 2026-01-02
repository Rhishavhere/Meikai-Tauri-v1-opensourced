# Semantic History Feature

## Overview

Natural language search over browsing history using vector embeddings.

## Example Queries

- "That recipe site I visited last week"
- "Article about black holes"
- "The shopping site with the blue shoes"
- "Where did I read about TypeScript generics"

## How It Works

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Page Visit  │────▶│  Analyzer   │────▶│ Vector DB   │
│             │     │  (summary,  │     │ (store)     │
│             │     │   embed)    │     │             │
└─────────────┘     └─────────────┘     └─────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ User Query  │────▶│  Embed +    │────▶│ Results     │
│ "black      │     │  Search     │     │ (ranked)    │
│  holes"     │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
```

## Data Model

```rust
struct HistoryEntry {
    id: String,
    url: String,
    title: String,
    visited_at: i64,          // Unix timestamp
    duration_seconds: u32,     // Time on page
    summary: String,           // AI-generated 1-2 sentences
    tags: Vec<String>,         // ["cooking", "italian", "pasta"]
    embedding: Vec<f32>,       // 768-dim vector
    content_preview: String,   // First ~500 chars
}
```

## Storage

**Location:** `$APPDATA/com.meikai.browser/history.db`

**Technology:** SQLite + sqlite-vss (vector extension)

```sql
CREATE TABLE history (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    title TEXT,
    visited_at INTEGER,
    duration_seconds INTEGER,
    summary TEXT,
    tags TEXT,              -- JSON array
    content_preview TEXT,
    embedding BLOB          -- Float32 array
);

-- Vector similarity search via sqlite-vss
CREATE VIRTUAL TABLE history_vss USING vss0(embedding(768));
```

## Indexing Pipeline

```python
async def index_page(url: str, content: str):
    # 1. Generate summary + tags
    analysis = await gemini.generate(
        f"Summarize in 1-2 sentences and provide 3-5 tags:\n\n{content[:3000]}"
    )
    
    # 2. Generate embedding
    embedding = await gemini.embed(f"{analysis.summary} {' '.join(analysis.tags)}")
    
    # 3. Store
    db.insert(url, summary=analysis.summary, tags=analysis.tags, embedding=embedding)
```

## Search Pipeline

```python
async def search_history(query: str) -> List[HistoryEntry]:
    # 1. Embed query
    query_embedding = await gemini.embed(query)
    
    # 2. Vector similarity search
    results = db.vector_search(query_embedding, limit=10)
    
    # 3. Optional: LLM rerank for better relevance
    # (skip for MVP)
    
    return results
```

## UI Integration

**Panel Mode Search Bar:**
- Detects semantic queries vs direct URLs
- Shows history results with preview cards
- Click to reopen page

```
┌─────────────────────────────────────────────────────────┐
│  🔍 that cooking website from last week                 │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼─────────────────────────────────┐
│  📄 Italian Pasta Recipes - AllRecipes.com                │
│     "A collection of authentic Italian pasta recipes..."   │
│     Visited: 5 days ago  •  Tags: cooking, italian, pasta │
├───────────────────────────────────────────────────────────┤
│  📄 Best Homemade Pasta Guide - SeriousEats               │
│     "Step by step guide to making fresh pasta at home..." │
│     Visited: 6 days ago  •  Tags: cooking, pasta, guide   │
└───────────────────────────────────────────────────────────┘
```

## Privacy

- All data stored **locally only**
- No cloud sync by default
- User can clear history anytime
- Exclude incognito/private sessions

## Implementation Tasks

1. [ ] URL change listener → trigger indexing
2. [ ] Background content extraction
3. [ ] Gemini summary/tag generation
4. [ ] Embedding generation (Gemini API)
5. [ ] SQLite + sqlite-vss setup
6. [ ] Search command
7. [ ] Search results UI
