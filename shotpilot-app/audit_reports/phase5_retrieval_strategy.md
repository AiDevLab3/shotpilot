# Phase 5: Retrieval Strategy Validation

**Date:** 2026-02-08
**Scope:** Token analysis, loading paths, cost modeling, strategy comparison

---

## 1. Token Inventory — All 11 Condensed KB Files

| File | Category | Words | Est. Tokens | % of Total |
|---|---|---|---|---|
| 01_Core_Realism_Principles.md | Core | 1,265 | 1,644 | 9.6% |
| 02_Model_GPT_Image.md | Model | 1,229 | 1,597 | 9.4% |
| 02_Model_Higgsfield_Cinema_Studio.md | Model | 1,333 | 1,732 | 10.2% |
| 02_Model_Kling_26.md | Model | 1,324 | 1,721 | 10.1% |
| 02_Model_Midjourney.md | Model | 1,025 | 1,332 | 7.8% |
| 02_Model_Nano_Banana_Pro.md | Model | 1,076 | 1,398 | 8.2% |
| 02_Model_VEO_31.md | Model | 1,426 | 1,853 | 10.9% |
| 03_Pack_Character_Consistency.md | Pack | 911 | 1,184 | 6.9% |
| 03_Pack_Motion_Readiness.md | Pack | 996 | 1,294 | 7.6% |
| 03_Pack_Quality_Control.md | Pack | 1,181 | 1,535 | 9.0% |
| 04_Translation_Matrix.md | Translation | 1,343 | 1,745 | 10.2% |
| **TOTAL** | | **13,109** | **~17,034** | **100%** |

**Context budget:** 17K tokens out of Gemini's 1M context = **1.7% utilization** (if all loaded)

---

## 2. Full Pack Files (packs/ directory) — Currently Used by Code

| File | Words | Est. Tokens | Notes |
|---|---|---|---|
| Cine-AI_Quality_Control_Pack_v1.md | 603 | 783 | OLD — 2x weaker than condensed |
| Cine-AI_Character_Consistency_Pack_v1.md | 1,315 | 1,709 | Larger than condensed; may contain Seedance refs |
| Cine-AI_Motion_Readiness_Pack_v1.md | 2,336 | 3,036 | 2.3x larger than condensed; contains philosophy prose |
| Cine-AI_Cinematic_Realism_Pack_v1.md | 2,608 | 3,390 | NOT loaded by any code |
| Cine-AI_Spatial_Composition_Anatomy_Pack_v1.md | 827 | 1,075 | NOT loaded by any code |

---

## 3. CRITICAL FINDING: Pack Path Mismatch

**`kbLoader.js` PACK_FILES points to `packs/` directory (full/original versions):**
```javascript
const PACK_FILES = {
    character_consistency: 'packs/Cine-AI_Character_Consistency_Pack_v1.md',
    quality_control:       'packs/Cine-AI_Quality_Control_Pack_v1.md',
    motion_readiness:      'packs/Cine-AI_Motion_Readiness_Pack_v1.md',
};
```

**`qualityCheck.js` also reads from `packs/` directory:**
```javascript
const kbFiles = [
    '01_Core_Realism_Principles.md',
    'packs/Cine-AI_Quality_Control_Pack_v1.md',
];
```

**Impact:** All TIER 1 & 2 pack optimizations (Quality Control expansion, Character Consistency checklists, Motion Readiness restructuring) are **NOT being used by the application**. The code reads the old, unoptimized pack files.

**Fix:** Update both `kbLoader.js` and `qualityCheck.js` to reference condensed `03_*` files instead.

---

## 4. Loading Paths Per Operation

### 4a. Quality Check (`qualityCheck.js` → `checkQualityWithKB`)

| File | Condition | Current Tokens | After Fix |
|---|---|---|---|
| 01_Core_Realism_Principles.md | Always | 1,644 | 1,644 |
| Quality Control Pack | Always | 783 (packs/) | 1,535 (condensed) |
| Character Consistency Pack | If characters exist | 1,709 (packs/) | 1,184 (condensed) |
| Model stub (02_*) | If preferred_model set | 1,332-1,853 | 1,332-1,853 |
| **Min total** | | **2,427** | **3,179** |
| **Max total** | | **5,989** | **6,216** |

### 4b. Prompt Generation (`kbLoader.js` → `loadKBForModel`)

| File | Condition | Current Tokens | After Fix |
|---|---|---|---|
| 01_Core_Realism_Principles.md | Always | 1,644 | 1,644 |
| Model stub (02_*) | Always | 1,332-1,853 | 1,332-1,853 |
| Character Consistency Pack | Image + Video | 1,709 (packs/) | 1,184 (condensed) |
| Quality Control Pack | Image + Video | 783 (packs/) | 1,535 (condensed) |
| Motion Readiness Pack | Video only | 3,036 (packs/) | 1,294 (condensed) |
| 04_Translation_Matrix.md | Always | 1,745 | 1,745 |
| **Image total** | | **5,881-6,434** | **6,108-6,661** |
| **Video total** | | **8,917-9,470** | **7,402-7,955** |

### 4c. Recommendations (`geminiService.js` → `generateRecommendations`)

Same KB content as quality check, passed via context parameter.

---

## 5. Cost Analysis

**Gemini 3.0 Flash pricing (estimated):**
- Input: $0.075/1M tokens
- Output: $0.30/1M tokens
- Thinking tokens (high budget = 24,576): counted as output → $0.007/call

### Per-Operation Costs

| Operation | KB Tokens (max) | System+User | Output | Thinking | Total |
|---|---|---|---|---|---|
| Quality Check | ~6,200 | ~700 | ~1,000 | 24,576 | ~$0.008 |
| Recommendations | ~6,200 | ~800 | ~2,000 | 24,576 | ~$0.009 |
| Prompt Generation | ~7,000 | ~800 | ~1,000 | 24,576 | ~$0.008 |

### Full Shot Workflow Cost

| Workflow | Operations | Estimated Cost |
|---|---|---|
| Quick check only | Quality Check | ~$0.008 |
| Check + Recommendations | QC + Recs | ~$0.017 |
| Full workflow | QC + Recs + Prompt Gen | ~$0.025 |
| 10-shot project (full) | 3 ops × 10 shots | ~$0.25 |
| 50-shot project (full) | 3 ops × 50 shots | ~$1.25 |

---

## 6. Strategy Comparison

### Option A: Current Smart Selection (Status Quo)

| Metric | Value |
|---|---|
| Tokens per call | 2,400-9,500 |
| Cost per workflow | ~$0.025 |
| Latency impact | Minimal (file read from cache) |
| Quality | HIGH — model-specific context + relevant packs |
| Complexity | LOW — simple conditional logic |

### Option B: Load All 11 Files Every Call

| Metric | Value |
|---|---|
| Tokens per call | ~17,034 |
| Cost per workflow | ~$0.030 (+20%) |
| Latency impact | Minimal (all under 1M limit) |
| Quality | MARGINAL improvement — includes irrelevant model data |
| Complexity | LOWER — no conditional logic |

### Option C: Vector Search (RAG)

| Metric | Value |
|---|---|
| Tokens per call | ~2,000-4,000 (top-k chunks) |
| Cost per workflow | ~$0.020 (-20%) + embedding costs |
| Latency impact | HIGH — requires embedding + search step |
| Quality | LOWER — loses document structure, misses cross-references |
| Complexity | HIGH — requires vector DB, chunking, embedding pipeline |

---

## 7. Recommendations

### CRITICAL: Fix Pack Path References (Priority: URGENT)

Update `kbLoader.js` and `qualityCheck.js` to use condensed `03_*` files instead of `packs/` directory. This is the single highest-impact fix remaining — all TIER 1 & 2 KB optimizations are currently unused by the running application.

**Estimated effort:** 15 minutes
**Impact:** Enables all KB audit improvements to take effect

### Strategy: Keep Smart Selection (No Change Needed)

The current smart selection strategy is **optimal** for ShotPilot Lite:
- At 17K total tokens, even loading ALL files uses only 1.7% of Gemini's context
- The 20% cost increase from loading all is negligible ($0.005/workflow)
- But smart selection provides better signal-to-noise ratio (no irrelevant model data)
- Vector search would add complexity and latency for marginal cost savings
- The in-memory cache (`kbCache`) eliminates repeated file reads

**Verdict: Current approach is correct. Fix the pack paths. No architectural changes needed.**
