# ShotPilot KB Audit — Agent Handoff Document

**Created:** 2026-02-08
**Branch:** `claude/fix-blank-screen-bug-S2fQt`
**Source of Truth Branch:** `claude/create-shotpilot-code-brief-E63ZH`
**Status:** Option C COMPLETE — All items implemented, committed, pushed, merged

---

## Project Overview

**ShotPilot** is an AI-assisted cinematography shot planning tool. It uses a condensed knowledge base (KB) of expert filmmaking knowledge loaded into Gemini 3.0 Flash API context to power quality checks, recommendations, and prompt generation.

**Tech Stack:**
- Frontend: React/TypeScript (Vite)
- Backend: Express/Node.js + SQLite
- AI: Gemini 3.0 Flash Preview (with thinking budget support)
- KB: 11 condensed markdown files (~17K tokens) in `shotpilot-app/kb/`

**6 Lite Models (the ONLY supported models):**
- Image: Higgsfield Cinema Studio V1.5, Midjourney, Nano Banana Pro (Gemini 3 Pro Image), GPT Image 1.5
- Video: VEO 3.1, Kling 2.6

---

## What Has Been Completed

### KB Audit Phases 4-6: Analysis (All Complete)
- Phase 4: AI readability scoring of all 11 KB files
- Phase 5: Retrieval strategy validation (token counts, loading paths, cost analysis)
- Phase 6: Conflict & consistency detection

### KB Audit Phases 8-10: Reports (All Complete)
Written to `shotpilot-app/audit_reports/`:
- `phase5_retrieval_strategy.md` — Token inventory, loading path mapping, cost analysis, CRITICAL pack path finding
- `phase8_consolidation_plan.md` — Skill protocol review, Spatial Composition Pack assessment, gap analysis
- `phase9_optimization_plan.md` — Master optimization matrix, before/after token analysis
- `phase10_implementation_roadmap.md` — Three timeline options with effort estimates

### TIER 1 Fixes (All Complete)
1. **Quality Control Pack expansion** — `shotpilot-app/kb/03_Pack_Quality_Control.md` rewritten from 430 to 1,181 words with shot scoring, artifact tables, model troubleshooting, prompt debugging
2. **Seedance reference removal** — `shotpilot-app/kb/03_Pack_Character_Consistency.md` line 122 updated to cross-reference Motion Readiness Pack instead of unsupported Seedance model
3. **Focal length conflict fix** — `shotpilot-app/kb/01_Core_Realism_Principles.md` split single ambiguous portrait row into environmental (35-50mm) vs compression (85-105mm)

### TIER 2 Fixes (All Complete)
4. **Midjourney V7 params** — `shotpilot-app/kb/04_Translation_Matrix.md` updated all `--sw` → `--s`, `--sref` → `--cref`
5. **Character Consistency → checklists** — `shotpilot-app/kb/03_Pack_Character_Consistency.md` converted philosophy prose to 3 operational checklists + numbered workflows
6. **Motion Readiness → checklists** — `shotpilot-app/kb/03_Pack_Motion_Readiness.md` replaced philosophy prose with Pre-Animation Checklist + structured Storyboard table
7. **Nano Banana Pro naming** — `shotpilot-app/kb/02_Model_Nano_Banana_Pro.md` added explicit naming blockquote

---

## What Remains — Option C Implementation

### Item 8: Fix Pack Path References (CRITICAL — Do First)

**Problem:** `kbLoader.js` and `qualityCheck.js` reference old pack files from `packs/` directory instead of the optimized condensed `03_*` files. This means ALL TIER 1 & 2 pack optimizations are NOT being used.

**File 1: `shotpilot-app/server/services/kbLoader.js`**

Current (lines 51-55):
```javascript
const PACK_FILES = {
    character_consistency: 'packs/Cine-AI_Character_Consistency_Pack_v1.md',
    quality_control:       'packs/Cine-AI_Quality_Control_Pack_v1.md',
    motion_readiness:      'packs/Cine-AI_Motion_Readiness_Pack_v1.md',
};
```

Change to:
```javascript
const PACK_FILES = {
    character_consistency: '03_Pack_Character_Consistency.md',
    quality_control:       '03_Pack_Quality_Control.md',
    motion_readiness:      '03_Pack_Motion_Readiness.md',
};
```

**File 2: `shotpilot-app/server/services/qualityCheck.js`**

Current (lines 81-84):
```javascript
const kbFiles = [
    '01_Core_Realism_Principles.md',
    'packs/Cine-AI_Quality_Control_Pack_v1.md',
];
```

Change to:
```javascript
const kbFiles = [
    '01_Core_Realism_Principles.md',
    '03_Pack_Quality_Control.md',
];
```

Current (line 89):
```javascript
kbFiles.push('packs/Cine-AI_Character_Consistency_Pack_v1.md');
```

Change to:
```javascript
kbFiles.push('03_Pack_Character_Consistency.md');
```

### Item 9: Create Condensed Spatial Composition Pack (HIGH)

**Source material:** `shotpilot-app/kb/packs/Cine-AI_Spatial_Composition_Anatomy_Pack_v1.md` (827 words)

**Create:** `shotpilot-app/kb/03_Pack_Spatial_Composition.md` (~800 words, ~1,040 tokens)

**Content to include:**
1. Directional Rosetta Stone — per-model spatial rules (most valuable section)
2. Relative spatial description technique (replace "left/right" with landmarks)
3. Anatomy preventative prompts (negative prompts, composition rules)
4. Branching repair strategy (brief)

**Content to omit:**
- Detailed two-pass hand repair workflow (operational, not prompt-relevant)
- Generic AI limitation explanations (background, not actionable)

### Item 10: Integrate Spatial Pack into Loaders (HIGH)

**File: `shotpilot-app/server/services/kbLoader.js`**

Add to PACK_FILES:
```javascript
const PACK_FILES = {
    character_consistency: '03_Pack_Character_Consistency.md',
    quality_control:       '03_Pack_Quality_Control.md',
    motion_readiness:      '03_Pack_Motion_Readiness.md',
    spatial_composition:   '03_Pack_Spatial_Composition.md',  // NEW
};
```

In `loadKBForModel()` function, update the packKeys logic (around line 113) to include spatial_composition for ALL model types:
```javascript
const packKeys = model.type === 'video'
    ? ['motion_readiness', 'character_consistency', 'quality_control', 'spatial_composition']
    : ['character_consistency', 'quality_control', 'spatial_composition'];
```

**File: `shotpilot-app/server/services/qualityCheck.js`**

Add spatial composition pack to the kbFiles array in `checkQualityWithKB()` (after the Quality Control Pack):
```javascript
const kbFiles = [
    '01_Core_Realism_Principles.md',
    '03_Pack_Quality_Control.md',
    '03_Pack_Spatial_Composition.md',  // NEW
];
```

### Item 11: Add Cache TTL to kbLoader.js (LOW)

Add a TTL mechanism to `kbCache` so files are re-read if modified during development. Simple approach: track file mtime, invalidate if changed.

### Item 12: Consolidate Aspect Ratio Specs (LOW)

Multiple KB files mention aspect ratios independently. Consider adding a unified aspect ratio table to `04_Translation_Matrix.md` and removing duplicated specs from model files. Cross-reference carefully before removing.

### Item 13: Add "Last Updated" Dates to Model Files (LOW)

Add a metadata line to each `02_Model_*.md` file:
```markdown
> Last Updated: 2026-02-08 | Source: [model]_prompting_mastery_guide.md
```

### Item 14: Remove Redundant Cinematic Realism Full Pack (LOW)

`shotpilot-app/kb/packs/Cine-AI_Cinematic_Realism_Pack_v1.md` (2,608 words) overlaps entirely with `01_Core_Realism_Principles.md`. Not loaded by any code. Can be safely deleted or moved to an archive.

---

## Implementation Order

1. Item 8 (pack paths) — CRITICAL, 15 min
2. Item 9 (Spatial Pack creation) — HIGH, 25 min
3. Item 10 (Spatial Pack integration) — HIGH, 10 min
4. Items 11-14 (deferred polish) — LOW, 50 min
5. Verify server starts correctly
6. Commit and push to `claude/fix-blank-screen-bug-S2fQt`
7. Merge back to source of truth: `git checkout claude/create-shotpilot-code-brief-E63ZH && git merge claude/fix-blank-screen-bug-S2fQt --no-edit`

---

## Key Files Reference

| File | Purpose |
|---|---|
| `shotpilot-app/kb/*.md` | 11 condensed KB files (loaded by app) |
| `shotpilot-app/kb/packs/*.md` | 5 full pack files (OLD — being replaced) |
| `shotpilot-app/server/services/kbLoader.js` | KB file loading logic + model registry |
| `shotpilot-app/server/services/qualityCheck.js` | Quality check with KB + fast completeness scoring |
| `shotpilot-app/server/services/geminiService.js` | Gemini API calls (analyzeQuality, generateRecommendations, generatePrompt) |
| `shotpilot-app/audit_reports/*.md` | Phase 5, 8, 9, 10 audit reports |
| `shotpilot-app/src/pages/ShotBoardPage.tsx` | Main UI page (ErrorBoundary, 9 form fields, Project Settings) |
| `shotpilot-app/src/components/ErrorBoundary.tsx` | Named export, fallback prop support |
| `shotpilot-app/src/services/api.ts` | API client with auto-login + 401 retry |
| `shotpilot-app/.env` | GEMINI_MODEL=gemini-3-flash-preview |

---

## Git Instructions

- **Push branch:** `claude/fix-blank-screen-bug-S2fQt`
- **Source of truth:** `claude/create-shotpilot-code-brief-E63ZH`
- After completing work, commit to push branch, push, then merge into source of truth
- Push command: `git push -u origin claude/fix-blank-screen-bug-S2fQt`

---

## User Preferences

- Chose **Path B** (full audit before launch) — "I don't want to proceed with anything until the repo is fully organized"
- Then chose **Option C** (full optimization + all deferred items)
- Wants comprehensive, thorough work — no shortcuts
- Expects commit messages to explain what and why
