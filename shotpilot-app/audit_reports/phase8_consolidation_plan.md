# Phase 8: Knowledge Consolidation Plan

**Date:** 2026-02-08
**Scope:** Skill protocol evaluation, Spatial Composition Pack assessment, gap analysis

---

## 1. Skill Protocol Review

### 1a. Asset Producer (`/.agent/skills/asset-producer/SKILL.md`)

**Purpose:** HITL protocol for image/video generation with mandatory human approval gates.

**Key Protocols:**
- Prompt-first delivery (show prompt before generating)
- Permission check (API vs manual generation)
- Reference image identification
- Mandatory expert critique after generation
- Architect sign-off before proceeding

**Relevance to Lite KB:**
- The HITL quality gate pattern is **already partially implemented** in `qualityCheck.js` (calculateCompleteness + checkQualityWithKB)
- The reference attachment protocol is **already implemented** in `geminiService.js` (buildImageParts)
- The prompt-first delivery is **already implemented** in the GeneratePromptModal UI flow

**Recommendation:** NO integration needed. Lite already implements the relevant patterns via code. The full HITL protocol is designed for the Antigravity workspace (Full version) where an AI agent executes generation. In Lite, the human IS the operator — they see the prompt, generate manually, and review results.

**Token impact:** 0 (no changes)

### 1b. Dashboard Developer (`/.agent/skills/dashboard-developer/SKILL.md`)

**Purpose:** Visual node graph production canvas for Antigravity browser.

**Key Features:**
- Interactive shot node graph with status tracking
- Dependency visualization with edge types
- Cost tracking per shot and per project
- Swim lane workflow phases
- Quality assessment badges

**Relevance to Lite KB:**
- This is entirely for the **Full version** (Antigravity workspace)
- ShotPilot Lite has its own simplified ShotBoard UI
- The status tracking concept is implemented differently in Lite (scene/shot cards)

**Recommendation:** DEFER entirely. This is a Full-version skill with no Lite KB implications.

**Token impact:** 0 (no changes)

### 1c. Ingestion Manifest (`/.agent/INGESTION_MANIFEST.md`)

**Purpose:** Documents the full 250K+ word, 22-model knowledge base structure and ingestion priority.

**Relevance:**
- Provides useful context about the full KB hierarchy
- Confirms the 6 Lite models are a subset of 22 total models
- Lists all source materials that the condensed KB files were derived from

**Recommendation:** No integration. This is a meta-document about the KB, not KB content itself.

---

## 2. Spatial Composition Pack Assessment

### Source File
`kb/packs/Cine-AI_Spatial_Composition_Anatomy_Pack_v1.md`

### Content Analysis

| Section | Topic | Words | Value for Lite |
|---|---|---|---|
| Part 1: Spatial Mastery | AI left/right confusion + Directional Rosetta Stone | ~400 | HIGH |
| Part 2: Anatomy Rescue | Surgical in-painting workflow for hand/anatomy fixes | ~400 | MEDIUM |

### Key Knowledge

**Part 1 — Spatial Problem:**
- AI models have "spatial dyslexia" — training data bias (90% right-handed), symmetry ambiguity, reference image dominance
- Solution: Replace directional terms with relative spatial descriptions
- Per-model Directional Rosetta Stone (GPT Image, Higgsfield, Midjourney, Nano Banana Pro)

**Part 2 — Anatomy Rescue:**
- "Branching" strategy: never chain edits, always branch from clean base
- Two-pass hand repair workflow (structure → detail)
- Micro-edit philosophy: target don't re-roll, one fix per edit
- Preventative negative prompts for anatomy

### Assessment

| Criterion | Rating | Notes |
|---|---|---|
| Relevance to shot planning | HIGH | Spatial composition directly affects prompt quality |
| Unique content (not covered elsewhere) | HIGH | No other KB file covers spatial/anatomy issues |
| AI ingestion value | MEDIUM | Some content is generic prompt engineering |
| Token cost | LOW | ~1,075 tokens (well within budget) |
| Cross-references | YES | Motion Readiness refers to composition; QC Pack references artifacts |

### Recommendation: ADD as 12th Condensed KB File

**Priority: HIGH**

Create `03_Pack_Spatial_Composition.md` (~800 words, ~1,040 tokens) containing:
1. Directional Rosetta Stone (per-model spatial rules) — most valuable
2. Anatomy preventative prompts (negative prompts, composition rules)
3. Branching repair strategy (brief reference)

**Omit from condensed version:**
- Detailed two-pass hand repair workflow (operational, not prompt-relevant)
- Generic AI limitation explanations (background context, not actionable)

**Loading integration:**
- Add to `kbLoader.js` PACK_FILES as `spatial_composition`
- Load for ALL models (spatial issues affect all)
- Add to `qualityCheck.js` loading (spatial composition affects quality)

**Token impact:** +1,040 tokens → new total ~18,074 tokens (1.8% of Gemini context)

---

## 3. Gap Analysis

### Currently Covered (11 files)

| Topic | Coverage | File(s) |
|---|---|---|
| Cinematic realism fundamentals | Complete | 01_Core_Realism_Principles |
| 6 model-specific prompting | Complete | 02_Model_* (6 files) |
| Character consistency | Complete | 03_Pack_Character_Consistency |
| Motion readiness | Complete | 03_Pack_Motion_Readiness |
| Quality control | Complete | 03_Pack_Quality_Control |
| Cross-model translation | Complete | 04_Translation_Matrix |

### Gaps Identified

| Gap | Priority | Recommendation |
|---|---|---|
| Spatial composition / anatomy | HIGH | Add as 12th file (see above) |
| Color theory / color grading | LOW | Partially covered in Core Realism (color temperature, grading); full coverage not needed for Lite |
| Sound design / audio | OUT OF SCOPE | Lite is image/video only; no audio generation |
| VFX / compositing | OUT OF SCOPE | Deferred to Full version |
| Lighting design (advanced) | LOW | Core Realism covers fundamentals; advanced lighting is model-specific (in 02_* files) |
| Storyboarding / shot sequencing | COVERED | Motion Readiness Pack has Storyboard Shot Sequence table |
| Prompt debugging | COVERED | Quality Control Pack has Prompt Debugging Framework |

### Unused Full Packs

| Pack | Status | Recommendation |
|---|---|---|
| Cine-AI_Cinematic_Realism_Pack_v1.md (3,390 tokens) | Not loaded by any code | SKIP — content already in 01_Core_Realism_Principles condensed file |
| Cine-AI_Spatial_Composition_Anatomy_Pack_v1.md (1,075 tokens) | Not loaded by any code | ADD as condensed file (see above) |

---

## 4. Consolidation Recommendations (Prioritized)

| # | Action | Priority | Effort | Token Impact |
|---|---|---|---|---|
| 1 | Fix pack path references in kbLoader.js + qualityCheck.js | CRITICAL | 15 min | Net -1,260 tokens (video), +752 (QC quality check) |
| 2 | Create condensed Spatial Composition Pack | HIGH | 30 min | +1,040 tokens |
| 3 | Add spatial_composition to kbLoader.js and qualityCheck.js | HIGH | 10 min | 0 (code only) |
| 4 | Verify packs/ full files don't contain stale/incorrect content | MEDIUM | 20 min | 0 |
| 5 | Remove Cinematic Realism Pack from packs/ (redundant) | LOW | 5 min | 0 |

**Total token impact after all changes:** ~18,074 tokens (1.8% of Gemini context)
