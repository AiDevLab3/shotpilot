# Phase 9: Optimization Plan

**Date:** 2026-02-08
**Scope:** Complete audit findings, before/after analysis, master optimization matrix

---

## 1. Completed Optimizations (TIER 1 & 2)

### TIER 1 — Critical (All Complete)

| Fix | File | Change | Before | After | Impact |
|---|---|---|---|---|---|
| Quality Control expansion | 03_Pack_Quality_Control.md | Complete rewrite | 430 words, 5/10 readability | 1,181 words, 9/10 readability | Shot scoring, artifact tables, model troubleshooting, prompt debugging, decision tree |
| Seedance reference removal | 03_Pack_Character_Consistency.md | Line edit | Referenced unsupported model | Cross-refs Motion Readiness Pack | Eliminates AI confusion from unsupported model |
| Focal length conflict | 01_Core_Realism_Principles.md | Row split | Single ambiguous "35mm or 50mm" row | Two rows: environmental (35-50mm) vs compression (85-105mm) | Eliminates contradictory guidance |

### TIER 2 — High (All Complete)

| Fix | File | Change | Before | After | Impact |
|---|---|---|---|---|---|
| Midjourney V7 params | 04_Translation_Matrix.md | 6 param updates | --sw (deprecated), --sref (deprecated) | --s (stylize), --cref (character ref) | Correct V7 syntax in all examples |
| Character Consistency format | 03_Pack_Character_Consistency.md | Structure rewrite | Philosophy prose, narrative paragraphs | 3 checklists (Bible, Reference, Review) + numbered workflows | Scannable, actionable for AI |
| Motion Readiness format | 03_Pack_Motion_Readiness.md | Structure rewrite | Philosophy prose, bullet lists | Pre-Animation Checklist + structured Storyboard table | Scannable, actionable for AI |
| Nano Banana Pro naming | 02_Model_Nano_Banana_Pro.md | Header addition | Parenthetical mention only | Explicit blockquote: "Official Model Name: Gemini 3 Pro Image" | Eliminates AI name confusion |

---

## 2. Newly Discovered Issues (Phase 5 & 8)

### CRITICAL: Pack Path Mismatch (Phase 5 Finding)

**Problem:** `kbLoader.js` and `qualityCheck.js` reference `packs/` directory (old, unoptimized files) instead of condensed `03_*` files (optimized).

**Impact:** ALL TIER 1 & 2 pack optimizations are NOT being used by the running application.

| Pack | Code Reads (packs/) | Should Read (condensed) | Difference |
|---|---|---|---|
| Quality Control | 783 tokens, generic | 1,535 tokens, comprehensive | Condensed is 2x better |
| Character Consistency | 1,709 tokens, may have stale refs | 1,184 tokens, checklists | Condensed is cleaner + smaller |
| Motion Readiness | 3,036 tokens, philosophy prose | 1,294 tokens, actionable | Condensed is 2.3x smaller |

**Fix:** Update 2 files to reference condensed versions. **15 minutes.**

### HIGH: Missing Spatial Composition Pack (Phase 8 Finding)

**Problem:** No KB content covers spatial composition, left/right confusion, or anatomy issues — the most common AI generation failures.

**Source material exists:** `packs/Cine-AI_Spatial_Composition_Anatomy_Pack_v1.md` (827 words)

**Fix:** Create condensed `03_Pack_Spatial_Composition.md` and integrate into loading. **40 minutes.**

---

## 3. Before/After Token Analysis

### Current State (What Code Actually Loads)

| Operation | Min Tokens | Max Tokens | Quality Rating |
|---|---|---|---|
| Quality Check | 2,427 | 5,989 | POOR — uses old 783-token QC pack |
| Prompt Gen (image) | 5,881 | 6,434 | GOOD for models, POOR for packs |
| Prompt Gen (video) | 8,917 | 9,470 | GOOD for models, POOR for packs |

### After Fix (Using Condensed Files + Spatial Pack)

| Operation | Min Tokens | Max Tokens | Quality Rating |
|---|---|---|---|
| Quality Check | 3,179 | 7,256 | EXCELLENT — comprehensive QC + spatial |
| Prompt Gen (image) | 7,148 | 7,701 | EXCELLENT — all optimized |
| Prompt Gen (video) | 8,442 | 8,995 | EXCELLENT — all optimized, smaller than before |

### Net Impact

| Metric | Before | After | Change |
|---|---|---|---|
| Total condensed KB size | 17,034 tokens | ~18,074 tokens | +6% |
| Video prompt gen tokens | ~9,470 max | ~8,995 max | -5% (more efficient) |
| Quality check content quality | 5/10 | 9/10 | +80% |
| Pack content accuracy | Stale refs, philosophy prose | Clean checklists, current params | Significant |
| Context utilization | 0.9% | 1.8% | Still minimal |

---

## 4. Master Optimization Matrix

| # | Item | Status | Priority | Effort | Token Impact | Quality Impact |
|---|---|---|---|---|---|---|
| 1 | Quality Control Pack expansion | DONE | CRITICAL | — | +752 | +80% QC quality |
| 2 | Seedance reference removal | DONE | CRITICAL | — | 0 | Eliminates bad model ref |
| 3 | Focal length conflict fix | DONE | CRITICAL | — | 0 | Removes contradiction |
| 4 | Midjourney V7 params update | DONE | HIGH | — | 0 | Correct model syntax |
| 5 | Character Consistency → checklists | DONE | HIGH | — | -525 | Better AI parseability |
| 6 | Motion Readiness → checklists | DONE | HIGH | — | -308 | Better AI parseability |
| 7 | Nano Banana Pro naming | DONE | HIGH | — | +30 | Eliminates name confusion |
| **8** | **Pack path fix (kbLoader + qualityCheck)** | **TODO** | **CRITICAL** | **15 min** | **varies** | **Enables all above fixes** |
| **9** | **Create Spatial Composition Pack** | **TODO** | **HIGH** | **30 min** | **+1,040** | **Fills biggest gap** |
| **10** | **Integrate Spatial Pack into loaders** | **TODO** | **HIGH** | **10 min** | **0** | **Enables spatial content** |
| 11 | Add cache TTL to kbLoader.js | DEFERRED | LOW | 15 min | 0 | Dev convenience only |
| 12 | Consolidate aspect ratio specs | DEFERRED | LOW | 20 min | -200 est | Minor dedup |
| 13 | Add "Last Updated" dates to model files | DEFERRED | LOW | 10 min | +60 | Versioning clarity |
| 14 | Remove redundant Cinematic Realism full pack | DEFERRED | LOW | 5 min | 0 | Cleaner repo |

---

## 5. Recommended Implementation Order

1. **Pack path fix** (Item 8) — CRITICAL, enables all prior work
2. **Spatial Composition Pack** (Items 9-10) — HIGH, fills biggest gap
3. Everything else is deferred (LOW priority, diminishing returns)

**Total remaining effort: ~55 minutes**
**Total remaining token cost: ~+1,040 tokens**
**Expected quality improvement: Significant (packs actually used + spatial coverage)**
