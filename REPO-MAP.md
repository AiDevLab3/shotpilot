# REPO-MAP.md — What Everything Is

> **Last updated:** 2026-02-23
> **Source of truth for project state:** OpenClaw workspace docs (`~/.openclaw/workspace/`), NOT the older markdown files in this repo.

This repo went through rapid direction changes in Feb 2026 (KB tool → generic agents → expert specialists → brief workbench detour → full app + Scene Workshop). Some files reflect earlier approaches and are intentionally kept.

---

## 📁 Top-Level Structure

### `shotpilot-app/` — THE APP (active)
The full ShotPilot filmmaking studio. React + Express + SQLite. This is where all development happens.

### `kb/` — Knowledge Base (250K+ words)
83 markdown files covering AI image/video models. Powers the RAG system (`shotpilot-app/server/rag/`). **Do not modify casually** — these are carefully curated model guides.

### `compiler/` — KB Compiler (legacy tool)
Node.js tool that audited and compiled the KB. Used during the knowledge-base-first era. Contains `audit.js`, `brief-analyzer.js`, etc. **Not actively used** but harmless to keep.

### `generated-refs/` — Generated Reference Images
Test images generated during early visual testing. Named by scene (`astrodome_reveal_v1.jpg`, etc.).

### `tests/` and `test-results/` — Legacy Test Suites
From earlier phases. The app's current tests live inside `shotpilot-app/tests/`.

---

## 📄 Root-Level Markdown (mostly stale)

| File | Status | Notes |
|------|--------|-------|
| `README.md` | ⚠️ Stale | From the KB era, not the app era |
| `AGENTS.md` | ⚠️ Stale | Original KB-era agent design doc |
| `CLAUDE.md` | ⚠️ Stale | Instructions from earlier phases — different model list, auth system, etc. |
| `CONCEPT_PITCH.md` | 📌 Reference | Original product vision — still directionally valid |
| `CONTEXT_HANDOFF.md` | ⚠️ Stale | Old handoff doc, superseded by OpenClaw workspace handoff docs |
| `PRODUCTION_WORKFLOW.md` | ⚠️ Stale | Described a workflow that's been redesigned |
| `MASTER_INDEX.md` | ⚠️ Stale | Old KB index |
| `CHANGELOG.md` | 📌 Reference | Has some useful history |
| `KB_AUDIT_REPORT.md` | 📌 Reference | KB quality audit results |
| `MORNING_NOTES.md` | ⚠️ Stale | One-time session notes |

**Rule:** Don't use these for current architecture decisions. Use the OpenClaw workspace docs.

---

## 📁 Inside `shotpilot-app/`

### Stale/Outdated Docs
| File | Notes |
|------|-------|
| `CLAUDE_CODE_BRIEF.md` | ⚠️ Phase 2C instructions — outdated model list, references auth system, wrong port numbers. **Ignore.** |
| `PHASE_3_TEST_REPORT.md` | Completion report from Phase 3 build |
| `USER-IN-LOOP-REFACTOR-COMPLETE.md` | Completion report from agent refactor |

### One-Off Scripts (root of shotpilot-app)
These were used during development/debugging and left in place:
- `check_shots.js`, `fix_shots.js` — DB inspection/repair utilities
- `final-rag-test.js`, `test-rag-api.js`, `test-rag-simple.js` — RAG system verification
- `test-user-in-loop-workflow.js` — Agent pipeline testing
- `cookies.txt` — Test artifact
- Loose `.jpg` files — Imported test images

Safe to clean up eventually, but not hurting anything.

### The v2/Workbench Files (DO NOT DELETE)
Built during a miscommunication on 2026-02-22 where "simplify the UI" was interpreted as "build a standalone workbench." Reverted to the full app, but **intentionally kept** as a potential future standalone API product or lightweight client.

**Files:**
- `src/AppV2.tsx` — Standalone workbench entry point
- `src/components/v2/` — Workbench UI components
- `src/stores/workbenchStore.ts` — Zustand store for workbench
- `src/services/v2Api.ts` — API client for workbench endpoints
- `server/routes/ai.js` — Backend routes powering the workbench

**Rule:** Don't delete. Don't wire into main app. If reorganizing, move to `v2-standalone/`.

### Active Code
- `src/App.tsx` — **THE active app entry point**
- `src/pages/` — 6 pages (Creative Director, Characters, Objects, Scene Manager, Asset Manager, Agent Studio)
- `src/components/` — Shared components including new Scene Workshop pieces (StoryboardPanel, StagingArea, ExpandedShotPanel)
- `server/` — Express backend with agents, RAG, generation, routes
- `server/services/agents/specialists/prompts/` — 10 expert system prompts (one per model, handcrafted)
- `kb/` (inside shotpilot-app) — Condensed KB copy used by RAG indexer
- `data/shotpilot.db` — SQLite database (the actual DB, not `shotpilot.db` in root)

### Data Files
- `data/shotpilot.db` — **Active database** (SQLite)
- `shotpilot.db` (root of shotpilot-app) — Old/copy, not used by server
- `data-export/` — DB export/backup
- `uploads/` — User-uploaded images

---

## 🏗️ For New Agents

1. **Read the OpenClaw workspace handoff docs first** — they're the source of truth
2. **Ignore `CLAUDE.md` and `CLAUDE_CODE_BRIEF.md`** — outdated phase instructions
3. **Don't delete anything that looks unused without checking this doc** — it might be intentionally preserved
4. **The `kb/` folders are curated** — don't bulk-edit the knowledge base
5. **`App.tsx` is active, `AppV2.tsx` is preserved but inactive**
