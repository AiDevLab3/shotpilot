# ShotPilot KB Audit — Agent Handoff Document

**Created:** 2026-02-08
**Branch:** `claude/fix-blank-screen-bug-S2fQt`
**Source of Truth Branch:** `claude/create-shotpilot-code-brief-E63ZH`
**Status:** ALL WORK COMPLETE — KB audit, Option C optimization, and repo cleanup finished

---

## Project Overview

**ShotPilot** is an AI-assisted cinematography shot planning tool. It uses a condensed knowledge base (KB) of expert filmmaking knowledge loaded into Gemini 3.0 Flash API context to power quality checks, recommendations, and prompt generation.

**Tech Stack:**
- Frontend: React/TypeScript (Vite)
- Backend: Express/Node.js + SQLite
- AI: Gemini 3.0 Flash Preview (with thinking budget support)
- KB: 12 condensed markdown files (~18K tokens) in `shotpilot-app/kb/`

**6 Lite Models (the ONLY supported models):**
- Image: Higgsfield Cinema Studio V1.5, Midjourney, Nano Banana Pro (Gemini 3 Pro Image), GPT Image 1.5
- Video: VEO 3.1, Kling 2.6

---

## What Has Been Completed

### KB Audit Phases 4-6: Analysis
- Phase 4: AI readability scoring of all KB files
- Phase 5: Retrieval strategy validation (token counts, loading paths, cost analysis)
- Phase 6: Conflict & consistency detection

### KB Audit Phases 8-10: Reports
Written to `shotpilot-app/audit_reports/`:
- `phase5_retrieval_strategy.md` — Token inventory, loading path mapping, cost analysis
- `phase8_consolidation_plan.md` — Skill protocol review, Spatial Composition Pack assessment, gap analysis
- `phase9_optimization_plan.md` — Master optimization matrix, before/after token analysis
- `phase10_implementation_roadmap.md` — Three timeline options with effort estimates

### TIER 1 Fixes (Critical)
1. **Quality Control Pack expansion** — `03_Pack_Quality_Control.md` rewritten from 430 to 1,181 words with shot scoring, artifact tables, model troubleshooting, prompt debugging
2. **Seedance reference removal** — `03_Pack_Character_Consistency.md` removed unsupported model, cross-references Motion Readiness Pack
3. **Focal length conflict fix** — `01_Core_Realism_Principles.md` split ambiguous portrait row into environmental (35-50mm) vs compression (85-105mm)

### TIER 2 Fixes (High)
4. **Midjourney V7 params** — `04_Translation_Matrix.md` updated all `--sw` → `--s`, `--sref [code]` → `--cref`, `--sw` → `--cw` in summary table
5. **Character Consistency → checklists** — `03_Pack_Character_Consistency.md` converted philosophy prose to 3 operational checklists + numbered workflows
6. **Motion Readiness → checklists** — `03_Pack_Motion_Readiness.md` replaced philosophy prose with Pre-Animation Checklist + structured Storyboard table
7. **Nano Banana Pro naming** — `02_Model_Nano_Banana_Pro.md` added explicit naming blockquote

### Option C Implementation (All Items)
8. **Pack path fix (CRITICAL)** — `kbLoader.js` and `qualityCheck.js` now reference condensed `03_*` files instead of old `packs/` directory. This enabled all TIER 1 & 2 pack optimizations to take effect.
9. **Spatial Composition Pack** — Created `03_Pack_Spatial_Composition.md` (612 words, ~795 tokens) covering AI spatial dyslexia, Directional Rosetta Stone per model, anatomy prevention rules, branching repair strategy
10. **Spatial Pack integration** — Added to `kbLoader.js` PACK_FILES + packKeys (loads for all model types) and `qualityCheck.js` loading
11. **Cache TTL** — `kbLoader.js` kbCache now has 5-minute TTL, re-reads files if stale
12. **Aspect ratio consolidation** — Added cross-model aspect ratio reference table to `04_Translation_Matrix.md`
13. **Last Updated dates** — All 6 model files (`02_Model_*.md`) have source + date metadata
14. **Redundant pack removal** — Deleted `Cine-AI_Cinematic_Realism_Pack_v1.md` (content covered by Core Realism)

### Repo Cleanup
15. **Archive consolidation** — Moved 4 superseded pack files from `packs/` to `archive/`, removed empty `packs/` directory
16. **Stale param fixes in archive** — Fixed all `--sw` → `--s` and `--sref [code]` → `--cref` in `archive/cross_model_translation_reference.md` and `archive/cross_model_consistency_integration_framework.md`
17. **Dead code removal** — Removed unused `dir` fields from LITE_MODELS and `fullGuide` fallback path from `kbLoader.js`

---

## Current State

### KB Files (12 condensed, all loaded by app)

| File | Words | ~Tokens | Category |
|---|---|---|---|
| 01_Core_Realism_Principles.md | 1,265 | 1,644 | Core |
| 02_Model_GPT_Image.md | 1,236 | 1,606 | Model |
| 02_Model_Higgsfield_Cinema_Studio.md | 1,340 | 1,742 | Model |
| 02_Model_Kling_26.md | 1,331 | 1,730 | Model |
| 02_Model_Midjourney.md | 1,035 | 1,345 | Model |
| 02_Model_Nano_Banana_Pro.md | 1,083 | 1,407 | Model |
| 02_Model_VEO_31.md | 1,433 | 1,862 | Model |
| 03_Pack_Character_Consistency.md | 911 | 1,184 | Pack |
| 03_Pack_Motion_Readiness.md | 996 | 1,294 | Pack |
| 03_Pack_Quality_Control.md | 1,181 | 1,535 | Pack |
| 03_Pack_Spatial_Composition.md | 612 | 795 | Pack |
| 04_Translation_Matrix.md | 1,499 | 1,948 | Translation |
| **TOTAL** | **14,922** | **~18,092** | |

**Context utilization:** 1.8% of Gemini's 1M token limit
**Cost per shot workflow:** ~$0.025 (quality check + recommendations + prompt generation)

### KB Loading Paths

**Quality Check** (`qualityCheck.js` → `checkQualityWithKB`):
- Always: Core Realism + Quality Control Pack + Spatial Composition Pack
- Conditional: Character Consistency Pack (if characters exist), Model stub (if preferred_model set)

**Prompt Generation** (`kbLoader.js` → `loadKBForModel`):
- Always: Core Realism + Model stub + Translation Matrix
- Image models: + Character Consistency + Quality Control + Spatial Composition
- Video models: + Motion Readiness + Character Consistency + Quality Control + Spatial Composition

### Directory Structure

```
shotpilot-app/kb/
├── 01_Core_Realism_Principles.md     (core)
├── 02_Model_*.md                     (6 model guides)
├── 03_Pack_*.md                      (4 supplementary packs)
├── 04_Translation_Matrix.md          (cross-model translation)
└── archive/                          (reference material, NOT loaded by app)
    ├── Cine-AI_*_Pack_v1.md          (4 original full packs)
    └── *.md                          (16 guides/reference docs)
```

---

## Key Files Reference

| File | Purpose |
|---|---|
| `shotpilot-app/kb/*.md` | 12 condensed KB files (loaded by app) |
| `shotpilot-app/kb/archive/` | Reference material (NOT loaded by app) |
| `shotpilot-app/server/services/kbLoader.js` | KB loading logic + model registry + 5min cache TTL |
| `shotpilot-app/server/services/qualityCheck.js` | Quality check with KB + fast completeness scoring |
| `shotpilot-app/server/services/geminiService.js` | Gemini API (analyzeQuality, generateRecommendations, generatePrompt) |
| `shotpilot-app/audit_reports/*.md` | Phase 5, 8, 9, 10 audit reports + this handoff |
| `shotpilot-app/src/pages/ShotBoardPage.tsx` | Main UI (ErrorBoundary, 9 form fields, Project Settings) |
| `shotpilot-app/src/components/ErrorBoundary.tsx` | Named export, fallback prop support |
| `shotpilot-app/src/services/api.ts` | API client with auto-login + 401 retry |
| `shotpilot-app/.env` | GEMINI_MODEL=gemini-3-flash-preview |

---

## Git Instructions

- **Push branch:** `claude/fix-blank-screen-bug-S2fQt`
- **Source of truth:** `claude/create-shotpilot-code-brief-E63ZH`
- Both branches are currently in sync
- After completing work, commit to push branch, push, then merge into source of truth
- Push command: `git push -u origin claude/fix-blank-screen-bug-S2fQt`

---

## What's Next

The KB audit is fully complete. No remaining KB work items. Possible next steps:

1. **Phase 3: Application Development** — remaining UI/UX features, API integration testing, deployment prep
2. **Launch Testing** — end-to-end quality check flow, prompt generation verification, multi-model testing
3. **Unit Tests** — no tests currently exist for kbLoader.js, qualityCheck.js, or geminiService.js

---

## User Preferences

- Chose **Path B** (full audit before launch) — "I don't want to proceed with anything until the repo is fully organized"
- Then chose **Option C** (full optimization + all deferred items)
- Wants comprehensive, thorough work — no shortcuts
- Expects commit messages to explain what and why
