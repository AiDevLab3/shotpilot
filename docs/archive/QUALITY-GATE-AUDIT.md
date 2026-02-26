# Quality Gate System Audit

**Date:** 2026-02-25  
**Auditor:** DevClaw (CTO)  
**Scope:** Full audit of QG implementation, KB research, legacy repo, and test results

---

## 1. Current Implementation (`qualityGate.js`)

### Architecture
- **Location:** `app/server/services/agents/qualityGate.js`
- **AI Backend:** Gemini (via `callGemini`) with thinking enabled
- **KB Loading:** RAG-first with hardcoded file fallback
- **Two Functions:** `auditImage()` (shot QA) and `screenReference()` (reference pre-screening)

### KB Sources Loaded
1. **Realism Principles** — RAG query: `'realism principles photographic quality'` → fallback: `01_Core_Realism_Principles.md`
2. **Quality Control Pack** — RAG query: `'quality control image artifacts assessment scoring'` → fallback: `03_Pack_Quality_Control.md`
3. **Image QC Pack** — RAG query: `'image quality assessment realism score audit'` → fallback: `03_Pack_Image_Quality_Control.md`

### `auditImage()` — 5 Scored Dimensions

| Dimension | Score Range | What It Measures |
|-----------|------------|------------------|
| `realism` | 1-10 | Photographic realism quality |
| `style_match` | 1-10 | Adherence to style profile |
| `ai_artifacts` | 1-10 | Absence of AI artifacts (10 = clean) |
| `video_readiness` | 1-10 | Suitability as video generation input |
| `reference_suitability` | 1-10 | Usefulness as a reference for downstream work |

Plus: `overall_score` (1-10), `recommendation` (approve/iterate/reject), `iteration_guidance` (text).

### `screenReference()` — Reference Pre-Screening

Separate, more detailed scoring focused on **downstream contamination risk**:

| Output Field | Type | Purpose |
|-------------|------|---------|
| `suitable` | bool | Pass/fail |
| `quality_score` | 1-10 | Overall quality |
| `downstream_risk` | low/med/high/critical | Pipeline contamination risk |
| `best_use` | enum | primary_ref / style_ref_only / concept_mood_only / unusable |
| `realism_breakdown.skin_texture` | 1-10 | Skin realism |
| `realism_breakdown.fabric_materials` | 1-10 | Material realism |
| `realism_breakdown.lighting_physics` | 1-10 | Light accuracy |
| `realism_breakdown.color_naturalism` | 1-10 | Color naturalness |
| `realism_breakdown.entropy_imperfection` | 1-10 | Real-world wear/imperfection |
| `realism_breakdown.overall_photographic` | 1-10 | Aggregate photographic realism |
| `ai_tells` | string[] | Specific artifacts found |
| `warnings` | string[] | Pipeline contamination risks |

**Key insight:** `screenReference` is significantly more sophisticated than `auditImage` — it has a detailed realism breakdown that `auditImage` lacks.

---

## 2. KB Research Findings

### 2.1 Quality Control Pack (`03_Pack_Quality_Control.md`)
- **Focus:** Shot completeness scoring (field weights), common AI artifacts catalog, iterative refinement loop, model-specific troubleshooting, color continuity rules, prompt debugging framework
- **Scoring:** Shot completeness tiers (Production ≥70%, Draft <70%) based on weighted field presence — NOT image quality scoring
- **Artifacts Covered:** AI Sheen, Flickering, Morphing, Jitter, Identity Drift, Inconsistent Style, Flat/Lifeless Image, Uncanny Valley
- **Checklists:** Visual audit, Technical audit, Narrative audit

### 2.2 Image Quality Control Pack (`03_Pack_Image_Quality_Control.md`)
- Nearly identical to QC Pack but image-specific (removes video artifacts like flickering/jitter, adds Extra/Missing Limbs, Text Rendering Issues, Background Incoherence, Scale Inconsistency)
- Same completeness scoring system, same checklists adapted for still images

### 2.3 Video Quality Control Pack (`03_Pack_Video_Quality_Control.md`)
- Extends base QC Pack with video-specific: Physics Breaks, Temporal Inconsistency, Motion Blur Artifacts, Audio-Visual Mismatch
- Adds Motion Audit checklist and Camera Movement Best Practices
- Same completeness scoring tiers

### 2.4 Cine-AI Quality Control Pack v1 (`research/packs/`)
- **Duplicate:** Same content as `03_Pack_Quality_Control.md` (Manus AI authored, Jan 26 2026)
- General guide — common artifacts, troubleshooting, checklists (Visual, Audio, Narrative)

### 2.5 Core Quality Control (`research/core/quality-control.md`)
- **Duplicate:** Identical to the Cine-AI QC Pack v1

### 2.6 Core Realism Principles (`01_Core_Realism_Principles.md`)
- **Critical KB file** — loaded into both QG functions
- Contains: Realism Lock Block (inject into every prompt), Universal Negative Pack, AI Sheen symptom detection, Lens Defaults, Lighting Motivation Rules
- This is the most actionable KB file for quality scoring

### Summary of KB Quality Dimensions Discussed

| Dimension | Where Discussed | Scoring Criteria Defined? |
|-----------|----------------|--------------------------|
| Photographic realism | Realism Principles, screenReference | ✅ Detailed (skin, fabric, lighting, color, entropy) |
| AI artifacts | All QC packs, auditImage | ⚠️ Checklist only, no numeric rubric in KB |
| Style consistency | All QC packs | ⚠️ Checklist only |
| Shot completeness | QC packs | ✅ Weighted field scoring (70% threshold) |
| Composition | Realism Principles (lens defaults) | ⚠️ Guidelines only |
| Lighting motivation | Realism Principles | ✅ 5-element checklist (source, direction, quality, contrast, fill) |
| Color continuity | QC packs | ⚠️ Rules only, no scoring |
| Video readiness | auditImage prompt | ❌ No KB backing — dimension is prompt-only |
| Reference suitability | screenReference prompt | ✅ Detailed in screenReference system prompt |

---

## 3. Legacy Repo Findings (`cine-ai-knowledge-base/`)

### Structure
The legacy repo contains the original KB files, a prompt compiler, and test infrastructure.

### KB Files
- Identical copies of all QC packs exist in `kb/condensed/`, `kb/packs/`, `kb/core/`, and `shotpilot-app/kb/`
- `kb/archive/video_analysis_guide.md` — Manus AI guide on using GPT-4o/Gemini for automated video QC (feedback loops, reference analysis)

### Compiler Test Results

#### Cross-Model Shootout (2026-02-19)
8 models tested on a neo-noir rooftop scene. **Scoring dimensions used:**

| Dimension | Description |
|-----------|-------------|
| Brief adherence | How well the image matches the prompt |
| Physics | Physical plausibility |
| Style consistency | Aesthetic coherence |
| Lighting/atmosphere | Lighting quality and mood |
| Clarity | Image sharpness and detail |
| Composition | Framing and visual balance |
| Identity | Character/subject consistency |

**Top results:** Nano Banana Pro (92/100), GPT Image 1.5 (92/100)

#### KB Validation Test (2026-02-19)
Compared KB-compiled prompts vs raw prompts across 4 models. **Scoring dimensions:**

| Dimension | Abbreviation |
|-----------|-------------|
| Composition | Comp |
| Lighting | Light |
| Color | Color |
| Realism | Real |
| Mood | Mood |
| Brief adherence | Brief |

**Key finding:** KB showed no clear benefit (avg -0.8 points). Auditor agreement was weak for lower-scoring models (GPT-4o consistently scored higher than Gemini Pro).

### Observations
1. The shootout used **7 dimensions** different from the current QG's 5
2. The validation test used **6 dimensions** — also different from the QG's 5
3. Neither legacy test set matches the current `auditImage` dimensions exactly
4. The legacy dimensions (especially Composition, Lighting, Color, Mood, Brief Adherence) are arguably more useful for filmmakers than the current QG's generic set

---

## 4. Test Results (`shotpilot-v2/app/test-results/results.json`)

- **Date:** 2026-02-06
- **Scope:** App integration tests (16 total, 14 passed, 2 skipped due to no Gemini access)
- **QG-related tests:** "Quality check — draft shot returns draft tier" ✅, "Quality check — production shot returns production tier" ✅
- **Note:** These test shot completeness scoring (field weights), NOT image quality scoring. No image-level QG tests exist.

---

## 5. Gap Analysis

### Current Problems

1. **`auditImage` dimensions are too generic.** "video_readiness" and "reference_suitability" overlap with what `screenReference` already does better. A filmmaker doesn't need to know "video_readiness" — they need to know if the shot looks cinematic.

2. **`screenReference` is great but separate.** Its realism breakdown (skin, fabric, lighting, color, entropy) is exactly what `auditImage` should also surface.

3. **No composition scoring.** The legacy shootout scored composition — the current QG doesn't. Composition is fundamental to cinematography.

4. **No mood/atmosphere scoring.** The legacy validation test scored mood — the current QG doesn't. Mood is what separates cinematic from generic.

5. **No brief/intent adherence scoring.** Both legacy tests scored this. It's the most basic question: "Did the AI make what I asked for?"

6. **KB backing is thin for most dimensions.** Only realism and lighting have strong KB support. The other dimensions rely entirely on the LLM's general knowledge.

7. **Auditor agreement is weak.** The validation tests showed GPT-4o consistently scored 10-20 points higher than Gemini Pro on the same images — the QG uses Gemini, meaning scores may be inconsistent.

---

## 6. RECOMMENDED FINAL SOLUTION

### Proposed Dimensions (7)

These dimensions are chosen to be: (a) directly useful to filmmakers, (b) backed by KB research, (c) proven in legacy testing, and (d) non-overlapping.

| # | Dimension | Weight | KB Backing | Why It Matters |
|---|-----------|--------|------------|----------------|
| 1 | **Photographic Realism** | 20% | ✅ Core Realism Principles (skin, fabric, lighting physics, color naturalism, entropy) | The #1 challenge with AI images. Detects AI sheen, plastic skin, fake bokeh. |
| 2 | **Intent Adherence** | 20% | ✅ Shot completeness system defines what fields matter | Did the AI actually make what was asked? Wrong framing, missing elements, wrong mood = fail. |
| 3 | **Composition & Framing** | 15% | ⚠️ Lens Defaults + shot type guidance | Rule of thirds, leading lines, headroom, negative space. Core cinematography skill. |
| 4 | **Lighting & Atmosphere** | 15% | ✅ Lighting Motivation Rules (5-element system) | Motivated lighting, atmospheric depth, mood-appropriate contrast. Separates cinematic from flat. |
| 5 | **Style Consistency** | 10% | ⚠️ Color Continuity Rules + Style Lock guidance | Does this match the project's established look? Master Look adherence. |
| 6 | **AI Artifact Severity** | 10% | ✅ AI Sheen symptoms + Common Artifacts catalog | Extra fingers, morphing, text garbling, impossible geometry. Binary-ish: bad artifacts = hard fail. |
| 7 | **Cinematic Mood** | 10% | ⚠️ Scene Mood/Tone field guidance | Does the image evoke the intended emotion? Tension, warmth, dread, wonder. The "feel" test. |

### Proposed Scoring Rubric

**Each dimension scored 1-10:**

| Score | Label | Meaning |
|-------|-------|---------|
| 9-10 | **Excellent** | Production-ready. No notes. |
| 7-8 | **Good** | Minor issues. Usable with awareness. |
| 5-6 | **Fair** | Noticeable problems. Iterate recommended. |
| 3-4 | **Poor** | Significant issues. Likely needs regeneration. |
| 1-2 | **Fail** | Unusable. Hard reject. |

### Overall Score Calculation

```
overall = (realism × 0.20) + (intent × 0.20) + (composition × 0.15) 
        + (lighting × 0.15) + (style × 0.10) + (artifacts × 0.10) + (mood × 0.10)
```

### Decision Thresholds

| Overall Score | Decision | Action |
|--------------|----------|--------|
| ≥ 8.0 | **APPROVE** | Ship it. |
| 6.0 – 7.9 | **ITERATE** | Provide specific guidance. Re-generate with adjustments. |
| < 6.0 | **REJECT** | Fundamental problems. Start over or switch models. |

**Hard fail override:** If ANY single dimension scores ≤ 3, force REJECT regardless of overall score. A beautifully composed shot with 6 fingers is still unusable.

### `screenReference` — Keep As-Is

The reference screening function is well-designed with its detailed realism breakdown. It serves a different purpose (pre-screening inputs) and should remain separate from shot QA. No changes recommended.

### Implementation Notes

1. **Update the system prompt** in `buildQASystemPrompt()` to use the 7 dimensions above with explicit rubric descriptions
2. **Add weighted scoring** — calculate overall in the system prompt instructions or post-process the JSON response
3. **Add hard-fail logic** — check for any dimension ≤ 3 after receiving the response
4. **Enrich KB** — the weakest dimensions (Composition, Mood) could benefit from dedicated condensed KB files. Consider creating `01_Core_Composition_Principles.md` and enriching the mood/tone guidance.
5. **Consider multi-auditor** — the legacy validation showed significant scorer disagreement between models. Running the QG through 2 models and averaging could improve reliability, at the cost of latency and API spend.

---

## Appendix A: Dimension Mapping

How the recommended dimensions map to all historical scoring systems:

| Recommended | Current `auditImage` | Shootout (legacy) | Validation (legacy) |
|------------|---------------------|-------------------|---------------------|
| Photographic Realism | `realism` | Physics | Realism |
| Intent Adherence | — | Brief adherence | Brief |
| Composition & Framing | — | Composition | Composition |
| Lighting & Atmosphere | — | Lighting/atmosphere | Lighting |
| Style Consistency | `style_match` | Style consistency | — |
| AI Artifact Severity | `ai_artifacts` | — | — |
| Cinematic Mood | — | — | Mood |
| *(dropped)* | `video_readiness` | Clarity | Color |
| *(dropped)* | `reference_suitability` | Identity | — |

### Why Dimensions Were Dropped

- **`video_readiness`**: Conflates two concerns — image quality and video-model compatibility. The image QG should judge image quality. Video suitability is a separate pipeline concern.
- **`reference_suitability`**: Already handled by `screenReference()`. Redundant in `auditImage`.
- **Clarity** (legacy): Subsumed by Photographic Realism (sharp ≠ good; oversharp = AI artifact).
- **Color** (legacy): Subsumed by Style Consistency (color is part of the look) and Lighting & Atmosphere.
- **Identity** (legacy): Important for multi-shot consistency but not a single-image quality dimension. Better handled at the scene/sequence level.

---

## Appendix B: File Inventory

| File | Location | Status |
|------|----------|--------|
| `qualityGate.js` | `v2/app/server/services/agents/` | Active — needs dimension update |
| `01_Core_Realism_Principles.md` | `v2/kb/condensed/` | Active — strong, keep as-is |
| `03_Pack_Quality_Control.md` | `v2/kb/condensed/` | Active — completeness scoring, artifact catalog |
| `03_Pack_Image_Quality_Control.md` | `v2/kb/condensed/` | Active — image-specific artifact catalog |
| `03_Pack_Video_Quality_Control.md` | `v2/kb/condensed/` | Active — video-specific, not loaded by QG |
| `Cine-AI_Quality_Control_Pack_v1.md` | `v2/research/packs/` | Duplicate of core/quality-control.md — archive |
| `quality-control.md` | `v2/research/core/` | Duplicate of QC Pack v1 — archive |
| `video_analysis_guide.md` | `legacy/kb/archive/` | Reference only — automated QC workflow ideas |
| `RESULTS.md` (shootout) | `legacy/compiler/test-results/shootout/` | Historical — 7-dimension scoring reference |
| `VALIDATION_RESULTS.md` | `legacy/compiler/test-results/validation/` | Historical — 6-dimension scoring, auditor disagreement data |
