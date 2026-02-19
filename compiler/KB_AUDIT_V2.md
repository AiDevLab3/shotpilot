# KB Audit V2 — Quality, Consistency & Completeness

> **Auditor:** DevClaw (CTO)  
> **Date:** 2026-02-19  
> **Gold Standard:** kb/models/veo_3_1/Prompting_Mastery.md (65KB, Grade A+)

---

## Part 1: Full Guide Audit

### Gold Standard Sections (VEO 3.1)
The VEO 3.1 guide establishes the format benchmark with:
1. Model Overview (What, Key Strengths, When to Use/Not Use)
2. Technical Specifications (Resolution, API params, capabilities table)
3. Prompting Framework (structured formula with component breakdown)
4. Cinematography Techniques
5. Audio Generation
6. Advanced Creative Controls
7. Best Practices
8. Common Mistakes & Troubleshooting
9. Advanced Workflows
10. Use Case Examples
11. Quick Reference
12. Resources

### Guide-by-Guide Audit

#### FLUX.2 (35KB) — Grade: B+
- **Sections:** ✅ Has overview, specs, prompt structure, examples, mistakes, best practices, quick reference
- **Missing:** No explicit "When to Use / Not Use" section. No "Resources" section.
- **Variants Coverage:** Covers [max], [pro], [flex], [klein]. Does NOT cover FLUX.1 Kontext (separate model on fal.ai), FLUX.1 Schnell (predecessor), or FLUX.2 Ultra (not a real variant — "Ultra" in guide is just an example word). Guide correctly scopes to FLUX.2 family.
- **Flux 2 Variant Analysis:** The guide covers the 4 core FLUX.2 variants adequately. FLUX.1 Kontext is a separate model (image editing, not generation) and doesn't belong here. No split needed — one guide with variant sections is correct.
- **Quality:** Expert-level, specific prompting techniques. JSON structured prompting section is unique and valuable.
- **Issues:** Some section headers lack the `##` markdown formatting (uses plain text). Minor formatting inconsistency vs gold standard.

#### Sora 2 (74KB) — Grade: A
- **Sections:** ✅ All required sections present including overview, specs, framework, cinematography, audio, advanced workflows, examples, quick reference, resources
- **Quality:** Comprehensive and well-structured. Matches gold standard format closely.
- **Specificity:** Expert-level with API parameter details, remix workflow, image-to-video techniques
- **Issues:** Slightly longer than necessary at 74KB. Could benefit from tighter editing. Otherwise excellent.

#### Wan 2.6 (67KB) — Grade: A-
- **Sections:** ✅ Has executive summary, technical architecture, generation modes, prompt framework, benchmarks, advanced techniques, pitfalls, production workflow
- **Missing:** No explicit "Resources" section. Uses "Executive Summary" instead of "Model Overview" (format deviation).
- **Quality:** Excellent technical depth. MoE architecture explanation is uniquely valuable. 10-prompt benchmark library is a strong addition.
- **Issues:** Format deviates from gold standard (different section naming). "Executive Summary" style vs "Model Overview" style.

#### Seedream 4.5 (45KB) — Grade: B+
- **Sections:** ✅ Overview, specs, strengths, prompting techniques, advanced techniques, API integration, examples, quick reference
- **Missing:** No "Advanced Workflows" section. No "Resources" section.
- **Quality:** Good depth on typography (the model's key strength). Model comparison section is useful.
- **Issues:** Section headers use inconsistent formatting (some bold, some plain). Could use more cinematic-specific examples.

#### Z-Image (27KB) — Grade: B
- **Sections:** ✅ Specs, unique features, prompt structure, domain-specific techniques (portrait, product, landscape), text rendering, troubleshooting, examples, quick reference
- **Missing:** No "Model Overview" intro section (jumps straight to specs). No "When to Use / Not Use." No "Resources."
- **Quality:** Good domain-specific guidance (portrait, product, landscape). Ethical considerations section is a nice touch.
- **Issues:** Smallest of the audited guides. Could use more depth on advanced techniques. Missing the introductory framing that other guides have.

---

## Part 2: Flux 2 Variant Analysis

### Variants on fal.ai
From fal.ai search (121 results for "flux"):
- **FLUX.2 [dev]** — Base text-to-image (fal-ai/flux-2)
- **FLUX.2 [pro]** — Higher quality text-to-image (fal-ai/flux-2-pro)
- **FLUX.2 [klein]** — Speed-optimized, including realtime endpoint (fal-ai/flux-2/klein)
- **FLUX.2 [dev] + LoRA** — Custom fine-tuned variants (fal-ai/flux-2/lora)
- **FLUX.2 [dev] Edit** — Image-to-image editing (fal-ai/flux-2/edit)
- **FLUX.2 [pro] Edit** — Pro-tier editing (fal-ai/flux-2-pro/edit)
- **FLUX.2 [klein] 9B Base** — Larger klein variant with LoRA support
- **FLUX.1 Kontext [pro]** — Separate model for targeted edits (NOT FLUX.2)

### Recommendation
**No split needed.** The current single guide covering [max], [pro], [flex], [klein] is the correct approach. FLUX.1 Kontext is a different model family. The guide could add a brief note about edit variants (flux-2/edit, flux-2-pro/edit) but doesn't need restructuring.

**Action item:** Add a short section on FLUX.2 Edit variants (image-to-image editing endpoints) to the existing guide.

---

## Part 3: Condensed Versions Created

All 11 missing condensed files created in `shotpilot-app/kb/` and copied to `kb/condensed/`:

| Model | File | Size |
|---|---|---|
| FLUX.2 | 02_Model_Flux_2.md | ~5KB |
| Grok Imagine | 02_Model_Grok_Imagine.md | ~4.5KB |
| Sora 2 | 02_Model_Sora_2.md | ~5.3KB |
| Wan 2.6 | 02_Model_Wan_26.md | ~5.2KB |
| Seedream 4.5 | 02_Model_Seedream_45.md | ~5KB |
| Z-Image | 02_Model_Z_Image.md | ~5KB |
| Minimax Hailuo 02 | 02_Model_Minimax_Hailuo_02.md | ~5KB |
| Seedance 1.5 Pro | 02_Model_Seedance_15_Pro.md | ~4.7KB |
| Reve | 02_Model_Reve.md | ~4.5KB |
| Topaz | 02_Model_Topaz.md | ~4.5KB |
| Wan 2.2 Image | 02_Model_Wan_22_Image.md | ~4.3KB |

All follow the format established by 02_Model_Nano_Banana_Pro.md:
- Header with official name, developer, type
- Model Overview with bullet points
- Key Differentiators
- Golden Rules (numbered, actionable)
- Prompt Structure with template
- Example Prompt (complete, ready-to-use)
- Technical Specs table
- Common Mistakes & Fixes table
- Known Limitations
- Cross-Model Translation
- Quick Reference Template

---

## Part 4: fal.ai Availability

See `compiler/MODEL_AVAILABILITY.md` for full matrix.

**Summary:** 18 of 24 KB models are available on fal.ai (75%). Notable gaps:
- Midjourney (Discord/Web only)
- Higgsfield models (own API)
- Runway Gen4.5 (own API)
- GPT Image 1.5 (OpenAI API only)
- Nano Banana Pro / Gemini 3 Pro Image (Google API only)

---

## Recommendations

### Priority 1: Format Consistency
- **Z-Image:** Add "Model Overview" intro section with "When to Use / Not Use"
- **Wan 2.6:** Rename "Executive Summary" to "Model Overview" for consistency
- **FLUX.2:** Fix markdown section headers (some use plain text instead of `##`)
- **All guides:** Add "Resources" section with links to official docs, API reference

### Priority 2: Content Gaps
- **FLUX.2:** Add section on Edit variants (flux-2/edit, flux-2-pro/edit)
- **Z-Image:** Expand advanced techniques section
- **Grok Imagine:** Guide is only 10KB — significantly thinner than others. Needs expansion.
- **Kling 3.0:** Guide is only 5KB — needs major expansion
- **Runway Gen4.5:** Guide is only 8KB — needs expansion

### Priority 3: Missing Condensed Versions
Still need condensed versions for:
- Kling 3.0, Kling O1 Image, Kling O1 Edit, Kling Motion Control, Kling Avatars 2.0
- Higgsfield DOP
- Runway Gen4.5

### Priority 4: Thin Guides Needing Expansion
| Model | Current Size | Recommended Min |
|---|---|---|
| Kling 3.0 | 5KB | 25KB+ |
| Runway Gen4.5 | 8KB | 25KB+ |
| Grok Imagine | 10KB | 25KB+ |
| Higgsfield DOP | 10KB | 20KB+ |
