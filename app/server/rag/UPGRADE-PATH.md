# RAG Search — Upgrade Path

## Current: SQLite FTS5 (keyword-based full-text search)
- **How it works:** Tokenizes queries and chunks, matches on shared terms with BM25 ranking
- **Why it works now:** KB is well-structured with consistent terminology. "Flux syntax" finds Flux syntax docs reliably.
- **Installed:** Feb 2026 as Phase 1 foundation

## When to Upgrade: FTS5 → Vector Embeddings

**Upgrade IF any of these happen:**

1. **Queries return irrelevant results** — user asks "how to make skin look realistic" but FTS5 matches on "realistic" in unrelated contexts instead of finding the realism principles + model failure docs
2. **Conceptual queries fail** — asking "which model handles close-up portraits best" returns nothing because no chunk contains those exact words, even though the info exists across multiple docs
3. **Cross-model comparisons miss** — "compare Flux and Seedream for environments" should pull from both model docs but FTS5 can't understand intent
4. **KB grows beyond ~500 files** — more content = more noise in keyword matches, semantic search scales better
5. **Agents start hallucinating KB content** — sign that the wrong chunks are being retrieved and the agent is filling gaps

## Upgrade TO: OpenAI Embeddings + SQLite Vector Store

**Stack:**
- `text-embedding-3-small` from OpenAI (~$0.02 per 1M tokens — our full KB costs ~$0.004 to embed)
- Store embedding vectors in SQLite using a BLOB column
- Cosine similarity search in JS (or `sqlite-vss` extension if available)
- Same query interface (`queryKB`, `queryForModel`, `queryForStyle`) — just swap the search backend

**Why this over ChromaDB:**
- ChromaDB had ARM/macOS compatibility issues during initial setup
- SQLite is already our DB — one fewer dependency
- OpenAI embeddings are higher quality than ChromaDB's default model

**Migration steps:**
1. Add `openai` npm package (if not already installed)
2. Create `server/rag/embedder.js` — embed all chunks, store vectors in new SQLite column
3. Update `query-simple.js` — compute query embedding, cosine similarity instead of FTS5 MATCH
4. Re-run indexer: `node server/rag/indexer-simple.js` (adds embeddings to existing chunks)
5. Test with the same queries from `test-rag-simple.js` — compare result quality

**Estimated effort:** 2-3 hours. No architecture changes needed — same DB, same API, same interface.

## Nuclear Option: Managed Vector DB

**Upgrade IF:**
- Multi-user / cloud deployment (need concurrent vector search at scale)
- KB exceeds 10K+ documents
- Need real-time collaborative indexing

**Options:** Pinecone, Weaviate, or MongoDB Atlas Vector Search

**Not needed for:** Single-user local tool with <500 KB files. That's us for the foreseeable future.
