# Knowledge Base Audit Report

**Date:** February 18, 2026  
**Auditor:** DevClaw (CTO)  
**Scope:** LITE model KB files for Prompt Compiler MVP  

---

## Executive Summary

The KB is **strong overall** — well-structured, practical, and production-ready. The full Prompting_Mastery guides are thorough with good examples and troubleshooting. The condensed app versions retain critical information well. The Translation Matrix is excellent and covers all 7 models (including Kling 3.0 which isn't even a LITE model yet).

**Key issues found:**
1. Nano Banana Pro has factual naming confusion (Gemini 3 vs actual Google model name)
2. Midjourney kb/ and shotpilot-app/kb/models/ are now identical (both v2.0, 14781 bytes) — the drift mentioned in the task is already resolved
3. Higgsfield guide lacks explicit limitations section
4. Some guides reference January 2026 dates despite being current — minor staleness risk
5. Translation Matrix is missing a condensed Midjourney app version comparison (02_Model_Midjourney.md exists but wasn't in the original task scope — it's well done)

---

## Model-by-Model Audit

### 1. Nano Banana Pro — Grade: **A-**

**Full guide:** 32,551 bytes, 10 sections, comprehensive  
**Condensed (02_Model_Nano_Banana_Pro.md):** 7,131 bytes — well condensed

| Criteria | Score | Notes |
|----------|-------|-------|
| Exact prompt syntax/format | ✅ | 6-Variable Framework, prompt template, aspect ratio specs |
| Concrete examples | ✅ | Multiple workflow examples with full prompts (thumbnails, storyboards, products, etc.) |
| Limitations & failure modes | ✅ | Section 7 covers 5 known limitations with workarounds |
| Unique features | ✅ | Conversational editing, 14 refs, Google Search grounding, thinking model, 4K native |
| Reference image handling | ✅ | Up to 14 refs (6 high-fidelity), weight control, identity locking |
| Currency | ⚠️ | "Last Updated: January 28, 2026" — slightly dated. Model name "Gemini 3 Pro Image" needs verification |
| Errors | ⚠️ | See below |

**Issues Found:**
1. **Model naming uncertainty:** States "Gemini 3 Pro Image" and "Nano Banana Pro" as aliases. "Nano Banana Pro" appears to be an internal/codename. The guide should clarify whether "Gemini 3 Pro Image" is the actual Google model name or if this is speculative. If Google hasn't released "Gemini 3 Pro Image" as a product name, this could confuse the Prompt Compiler.
2. **Cost section references Higgsfield Platform** (Section 9) — implies Nano Banana Pro is hosted on Higgsfield. This is potentially misleading if the model is a Google product accessed via Google AI Studio/Vertex AI. The cost info may be platform-specific, not model-specific.
3. **No API parameter documentation** — Unlike GPT Image (which documents `quality=`, `size=`), this guide doesn't specify API-level parameters (resolution selection, seed locking mechanism, etc.). It describes concepts ("lock the seed") without showing how.
4. **Condensed version** is well done — retains all key frameworks, rules, techniques. No critical information lost.

---

### 2. Midjourney — Grade: **A**

**Full guide:** 14,781 bytes (v2.0, Feb 13 2026), both kb/ and shotpilot-app/kb/models/ are identical  
**Condensed (02_Model_Midjourney.md):** 8,383 bytes

| Criteria | Score | Notes |
|----------|-------|-------|
| Exact prompt syntax/format | ✅ | Full parameter table with every flag (--ar, --oref, --sref, --sw, --ow, --iw, etc.) |
| Concrete examples | ✅ | Cinematic storytelling, product photography examples with full params |
| Limitations & failure modes | ✅ | 6 common mistakes with fixes; limitations clearly stated |
| Unique features | ✅ | --oref (replaces --cref), Personalization, Draft Mode, Vary Region, Pan, Zoom |
| Reference image handling | ✅ | --oref documented with --ow weight control, --sref for style, --iw for image weight |
| Currency | ✅ | V7 current, --cref deprecated note, Feb 13 2026 date |
| Errors | ✅ | None found |

**Issues Found:**
1. **Minor: No video mention in V7 features** — The v1.0 had a "Video (V7)" row that was removed in v2.0. If MJ V7 has basic video capabilities, this should be noted (even if just to say "basic, not recommended").
2. **Condensed version** is solid — retains framework, all parameters, key techniques. Good job.

---

### 3. GPT Image 1.5 — Grade: **A**

**Full guide:** 35,349 bytes, comprehensive  
**Condensed (02_Model_GPT_Image.md):** 8,548 bytes

| Criteria | Score | Notes |
|----------|-------|-------|
| Exact prompt syntax/format | ✅ | API params (quality=, size=, image input), structured prompt format |
| Concrete examples | ✅ | Hero frame, character consistency, iterative editing workflows |
| Limitations & failure modes | ✅ | 5 common mistakes table, text rendering workarounds |
| Unique features | ✅ | World knowledge, conversational context, identity preservation, structured visuals |
| Reference image handling | ✅ | Multi-image input syntax, index-based referencing, compositing instructions |
| Currency | ✅ | "gpt-image-1.5" model name, December 2025 release, current API patterns |
| Errors | ✅ | None found |

**Issues Found:**
1. **No explicit limitations section in full guide** — Limitations are scattered across "Common Mistakes" and inline notes. A dedicated "Known Limitations" section (like Nano Banana Pro has) would be clearer for the Prompt Compiler.
2. **Condensed version** is excellent — clean, actionable, well-structured. No critical information lost. The iterative editing rules (accumulating preserve list) are well preserved.

---

### 4. Higgsfield Cinema Studio v1.5 — Grade: **B+**

**Full guide:** 26,770 bytes  
**Condensed (02_Model_Higgsfield_Cinema_Studio.md):** 9,076 bytes

| Criteria | Score | Notes |
|----------|-------|-------|
| Exact prompt syntax/format | ✅ | Detailed rig build: Camera Body → Lens → Focal Length → Aperture → Film Stock dropdowns |
| Concrete examples | ✅ | 3 practical examples (fashion portrait, film noir, anamorphic landscape) with full rig specs |
| Limitations & failure modes | ⚠️ | Only a 6-row troubleshooting table. No dedicated limitations section. |
| Unique features | ✅ | Virtual camera rig, optical physics simulation, preset management, integrated upscaling (Topaz) |
| Reference image handling | ❌ | Minimal — mentions "Image-to-Video Handoff" but no detail on reference image input for image generation |
| Currency | ✅ | Version 1.5, January 27 2026 |
| Errors | ⚠️ | See below |

**Issues Found:**
1. **No explicit limitations/failure modes section** — The troubleshooting table is too brief. Missing: What the model CAN'T do (text rendering? complex multi-character scenes? specific resolution limits?). The Prompt Compiler needs to know when NOT to route to this model.
2. **Reference image handling undocumented** — Does Cinema Studio accept reference images for image generation? If so, how? If not, this should be stated explicitly. Currently silent on this.
3. **No API/programmatic access info** — Is this UI-only? Can the Prompt Compiler call it via API? This is critical for the MVP.
4. **Upscaling section is very long** (Part II) relative to the core image generation content. Consider whether upscaling belongs in this guide or should be a separate doc.
5. **Missing: Resolution/output specs** — What resolution does Cinema Studio output natively? Only upscaling resolutions are documented.
6. **Condensed version** is adequate but inherits the same gaps.

---

### 5. Kling 2.6 — Grade: **A**

**Full guide:** 31,973 bytes, 11 sections  
**Condensed (02_Model_Kling_26.md):** 9,211 bytes

| Criteria | Score | Notes |
|----------|-------|-------|
| Exact prompt syntax/format | ✅ | 4-Essentials Framework, camera movement vocabulary, audio syntax |
| Concrete examples | ✅ | 6 genre-specific examples (action, romance, horror, commercial, documentary, sci-fi) |
| Limitations & failure modes | ✅ | 6 detailed problem/solution sections with bad/good examples |
| Unique features | ✅ | Native audio-visual synthesis, motion control, start/end frame, multi-reference fusion |
| Reference image handling | ✅ | Multi-Reference Fusion (character + location + style + motion), start/end frames |
| Currency | ✅ | Version 1.1, February 1 2026 |
| Errors | ✅ | None found |

**Issues Found:**
1. **Minor: No mention of Kling 3.0** — The Translation Matrix already covers Kling 3.0 but the Kling 2.6 guide doesn't mention its successor or how they differ. A brief note would help.
2. **Condensed version** is well done — retains framework, camera vocabulary, audio syntax, troubleshooting. Good compression.

---

### 6. Veo 3.1 — Grade: **A+**

**Full guide:** 65,118 bytes (largest guide), extremely comprehensive  
**Condensed (02_Model_VEO_31.md):** 9,422 bytes

| Criteria | Score | Notes |
|----------|-------|-------|
| Exact prompt syntax/format | ✅ | 5-Part Formula, audio syntax (dialogue/SFX/ambient), timestamp prompting |
| Concrete examples | ✅ | 5 detailed use cases (YouTube Shorts, product launch, documentary, music video, corporate training) |
| Limitations & failure modes | ✅ | 7 detailed issues with bad/good examples and solutions |
| Unique features | ✅ | 4K output, native audio, Ingredients to Video, First/Last Frame, Video Extension, Add/Remove Object |
| Reference image handling | ✅ | Image-to-Video (20MB), Ingredients to Video (multiple refs), First/Last Frame |
| Currency | ✅ | "January 2026" — current |
| Errors | ✅ | None found |

**Issues Found:**
1. **Minor: Guide is massive (65KB)** — Could benefit from a "Quick Start" section at the top for the Prompt Compiler to grab essentials without parsing 1700+ lines. The condensed version handles this well though.
2. **Condensed version** is excellent — distills the 65KB guide into 9.4KB without losing any critical functionality. The 5-part formula, camera vocabulary, audio syntax, and troubleshooting are all preserved. Best condensation in the KB.

---

## Condensed App Versions Assessment

| File | Full Source Size | Condensed Size | Ratio | Quality | Critical Info Lost? |
|------|-----------------|----------------|-------|---------|-------------------|
| 02_Model_Nano_Banana_Pro.md | 32,551 | 7,131 | 22% | Good | No — all frameworks, rules, techniques retained |
| 02_Model_Midjourney.md | 14,781 | 8,383 | 57% | Good | No — all params and framework retained |
| 02_Model_GPT_Image.md | 35,349 | 8,548 | 24% | Excellent | No — iterative editing rules well preserved |
| 02_Model_Higgsfield_Cinema_Studio.md | 26,770 | 9,076 | 34% | Adequate | Inherits full version's gaps (no limitations, no ref image docs) |
| 02_Model_Kling_26.md | 31,973 | 9,211 | 29% | Good | No — framework, camera vocab, audio syntax retained |
| 02_Model_VEO_31.md | 65,118 | 9,422 | 14% | Excellent | No — best compression ratio with no critical loss |

**Verdict:** Condensing was done well across the board. No critical information was lost in any condensed version.

---

## Core Realism Principles (01_Core_Realism_Principles.md) — Grade: **A**

10,875 bytes. Comprehensive and well-structured.

**Strengths:**
- REALISM_LOCK_BLOCK is injectable — perfect for Prompt Compiler
- Universal Negative Pack is model-agnostic
- AI Sheen detection symptoms are specific and actionable
- 9-Component Prompt Template provides clear structure
- Lens defaults table with shot-type recommendations
- Lighting motivation rules (5 required elements) are non-negotiable
- Kill Switch Terms ban list prevents common AI-look triggers
- GSS (Global Style System) with Layer A/B separation is architecturally sound
- Prompt Compiler Output Format (4-Block Standard) is exactly what the compiler needs

**Issues:**
1. **No model-specific adaptation notes** — The file says Block 4 is "Model Wrapper" but doesn't reference the Translation Matrix. Should cross-reference 04_Translation_Matrix.md explicitly.
2. **Minor: "Canon Master Look Template"** uses the word "Canon" which could confuse with Canon cameras. Consider "Project Master Look Template."

---

## Translation Matrix (04_Translation_Matrix.md) — Grade: **A**

19,173 bytes. The most critical file for the Prompt Compiler.

**Strengths:**
- Covers ALL 7 models (including Kling 3.0, which isn't even a LITE model yet — forward-looking)
- Model Language Profiles table is clear and actionable
- 5 translation domains: Lighting, Camera/Lens, Color Grading, Atmospheric Effects, Character Consistency
- Aspect Ratio Quick Reference across all models
- Character/Identity Consistency section is excellent — documents each model's mechanism
- Cross-Model Character Consistency Workflow (4 steps) is practical
- Video Motion Translation section with per-model syntax
- "When to Use Each Model" table is a decision engine
- 6-Step Translation Workflow is the compiler's algorithm

**Issues:**
1. **Missing translation domains:** No texture/material translation table (how to describe "weathered leather" across models). No composition/framing translation (how to say "rule of thirds" in each model's language).
2. **Missing model pairs:** The matrix is organized by concept (lighting, camera, etc.) not by model pair. For A→B translation, you have to mentally extract from each table. Consider adding a "quick translate" section: "If translating from Nano Banana Pro to Midjourney, do X, Y, Z."
3. **Kling 3.0 presence:** Included in translation tables despite not being a LITE model. This is fine (forward-looking) but should be noted as "upcoming" or "extended support."
4. **GPT Image aspect ratio** lists `2016x864` for 21:9 — verify this is a supported output size. The GPT Image guide only lists 1024x1024, 1792x1024, and 1024x1792.

---

## Overall KB Health Summary

| Component | Grade | Priority Fix |
|-----------|-------|-------------|
| Nano Banana Pro | A- | Clarify model naming; add API params; fix Higgsfield cost section |
| Midjourney | A | Minor: note video capabilities |
| GPT Image 1.5 | A | Add dedicated limitations section |
| Higgsfield Cinema Studio | B+ | **Add limitations section; document reference image handling; add API/resolution info** |
| Kling 2.6 | A | Minor: mention Kling 3.0 |
| Veo 3.1 | A+ | None critical |
| Core Realism Principles | A | Cross-reference Translation Matrix |
| Translation Matrix | A | Add texture/material domain; verify GPT Image 21:9 size |
| Condensed App Versions | A | All good — no critical info lost |

### Top 5 Priority Fixes for MVP

1. **Higgsfield: Add limitations section and reference image documentation** — The Prompt Compiler can't make routing decisions without knowing what the model can't do.
2. **Nano Banana Pro: Clarify model naming** — Is "Gemini 3 Pro Image" the real product name? The compiler needs the correct API model identifier.
3. **Nano Banana Pro: Remove/fix Higgsfield cost section** — Misleading if this is a Google model.
4. **Translation Matrix: Verify GPT Image 21:9 output size** — `2016x864` may not be a valid output size.
5. **Core Realism Principles: Add explicit cross-reference to Translation Matrix** for Block 4 (Model Wrapper).

---

**Bottom line:** This KB is production-quality. The guides are thorough, well-structured, and the condensing preserved all critical information. Higgsfield is the weakest link — it needs a limitations section and reference image documentation before the Prompt Compiler can make informed routing decisions. Everything else is minor polish.
