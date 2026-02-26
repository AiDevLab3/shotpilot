# Quality Gate Weights Research Report
> Research compiled 2026-02-26 | Sources: Academic papers, industry standards, AI benchmarks, professional photography competitions

## Executive Summary

**No universal standard exists** for weighting image quality dimensions — not in academia, not in VFX studios, not in AI benchmarks. However, converging patterns across multiple domains give us a research-backed starting point that's significantly better than gut instinct.

### Key Finding: Three-Tier Consensus

Across all sources studied, image quality dimensions consistently cluster into three tiers of importance:

| Tier | Weight Range | What It Covers | Why |
|------|-------------|----------------|-----|
| **Tier 1: Foundation** | 20-35% each | Fidelity/Realism + Intent Adherence | If these fail, nothing else matters |
| **Tier 2: Craft** | 10-20% each | Composition, Lighting, Style | The cinematic differentiators |
| **Tier 3: Polish** | 5-10% each | Artifacts, Mood/Impact | Important but rarely the deciding factor alone |

---

## Source Analysis

### 1. Academic AI Image Quality (AIGCIQA2023, ImageReward, T2I-CompBench)

**AIGCIQA2023** (Shanghai Jiao Tong University, 2023) — the most directly relevant academic framework — scores AI-generated images on **three independent dimensions:**
- **Quality** (perceptual quality / how good does it look)
- **Authenticity** (does it look real vs. AI-generated)
- **Correspondence** (does it match the prompt/intent)

Key insight: They deliberately **do not combine these into a single weighted score** because the dimensions are independently important. However, their dataset of 420,000 subjective ratings shows **authenticity and correspondence** are the strongest predictors of human rejection — a low score on either is a dealbreaker regardless of overall quality.

**ImageReward** (Tsinghua University, 2023, arXiv:2304.05977) — trained on 137K expert comparisons — uses three annotation dimensions:
- **Text-Image Alignment** (does it match the prompt)
- **Fidelity** (realism / quality)
- **Overall Satisfaction** (aesthetic appeal)

Their finding: Alignment and Fidelity are the **primary drivers** of human preference. Aesthetic satisfaction matters but is secondary — humans will pick a less "pretty" image if it's more accurate and realistic.

**T2I-CompBench** (NeurIPS 2023) breaks evaluation into:
- Attribute binding (color, shape, texture accuracy)
- Object relationships (spatial correctness)
- Complex compositions

This maps to our "Intent Adherence" — getting the content right.

**Implication for ShotPilot:** Realism and Intent Adherence as top-tier (20-25% each) is **validated by academic research.**

### 2. Professional Photography Competitions

Multiple photography competition rubrics converge on a **three-pillar model:**

**Common breakdown (La Crosse Camera Club, PSA-affiliated clubs, f3c.org):**
- **Technique** (focus, lighting, exposure): ~33%
- **Composition** (arrangement, framing, leading lines): ~33%
- **Impact/Interest** (creativity, emotional response, "wow factor"): ~33%

**Film competition variant (Scribd film rubric):**
- **Content/Storyline:** 35%
- **Lighting & Technical Quality:** 25%
- **Originality/Creativity:** 30%
- **Presentation:** 10%

**Photography awards breakdown (lightandcomposition.com):**
- **Composition:** 35%
- **Storytelling/Impact:** 35%
- **Technical Quality:** 20%
- **Presentation:** 10%

**Implication for ShotPilot:** Composition carries **more weight in professional evaluation than we originally assigned** (35% in competitions vs. our 15%). However, photography competitions evaluate human-created images where composition is a skill differentiator. For AI-generated images, composition is more controllable via prompting, which may justify a lower weight. Lighting consistently appears at 20-25% when broken out separately.

### 3. VFX Industry (ILM, Weta FX, DNEG, Netflix)

VFX studios use **binary pass/fail gates** rather than weighted scores:

**Netflix VFX delivery requirements** mandate:
- Technical compliance (resolution, color space, format) — **hard gate**
- Color matching / integration with live action — **hard gate**
- Framing consistency — **hard gate**
- Creative approval from VFX supervisor/director — **subjective gate**

**Key VFX QC insight from industry (r/vfx, dazzle.pictures):**
Studios evaluate shots in a **hierarchical** order:
1. **Does it integrate?** (lighting match, perspective, motion blur) — instant reject if no
2. **Does it serve the story?** (creative intent) — director's call
3. **Is it technically clean?** (artifacts, matte edges, grain match) — fixable if close
4. **Is it consistent?** (matches adjacent shots) — continuity check

This maps almost perfectly to our dimension priority: Realism/Integration > Intent > Technical Quality > Consistency.

**Critical insight: VFX uses VETO gates, not just weights.** A shot can score well on everything but if integration/realism fails, it's rejected outright. This supports the "artifact hard veto" idea I raised earlier.

### 4. Perceptual Research (BRISQUE, NIQE, SSIM literature)

Academic IQA research (University of Waterloo, UT Austin) focuses on:
- **Structural similarity** (SSIM) — how well structure is preserved
- **Natural scene statistics** — does the image follow natural statistical patterns
- **Information content weighting** — regions with more visual information matter more

Key finding from information content weighting research (Wang & Li, IEEE TIP 2011): **Perceptual importance is NOT uniform across an image.** Areas with high information content (faces, text, detailed textures) contribute disproportionately to quality perception. This suggests our scoring should weight *what's in the image* contextually, not just apply flat dimensional weights.

### 5. Realism-Specific Research

**Rademacher et al. (EGRW 2001) — "Measuring Perception of Visual Realism":**
- Shadow softness and surface smoothness are **the two strongest determinants** of perceived realism
- Number of light sources does NOT significantly affect realism perception
- Color saturation is a significant factor — oversaturation breaks realism

**Fan et al. (CVPR 2014) — "Automated Estimator of Image Visual Realism":**
- Illumination, color, and saturation are the top attributes for composite image realism
- These overlap heavily with our Lighting & Atmosphere dimension

**Implication:** Lighting/atmosphere may deserve **higher weight** than our original 15% for a realism-focused pipeline specifically. The research suggests lighting is the #1 technical factor in realism perception.

---

## Synthesis: Research-Backed Weight Recommendations

### Option A: Conservative (closest to academic consensus)

| Dimension | Weight | Rationale |
|-----------|--------|-----------|
| Photographic Realism | **25%** | AIGCIQA authenticity + perceptual realism research. Top predictor of rejection. |
| Intent Adherence | **25%** | ImageReward alignment + T2I-CompBench. Equally critical — wrong content = useless. |
| Lighting & Atmosphere | **18%** | Rademacher + Fan research: #1 technical factor in realism. Elevated from 15%. |
| Composition & Framing | **12%** | Important but more controllable in AI generation than human photography. Reduced from competition's 33%. |
| Style Consistency | **8%** | Project-level concern, less per-image critical. |
| AI Artifact Severity | **7%** | Low weight BUT with **hard veto at ≤ 3** (VFX industry pattern). |
| Cinematic Mood | **5%** | Most subjective, hardest to score reliably. |
| **Total** | **100%** | |

### Option B: Realism-Heavy (optimized for our Cinematic Realism Engine differentiator)

| Dimension | Weight | Rationale |
|-----------|--------|-----------|
| Photographic Realism | **28%** | Our core differentiator. Pipeline exists to maximize this. |
| Intent Adherence | **22%** | Critical but slightly below realism since our RAG compiler handles prompt accuracy. |
| Lighting & Atmosphere | **20%** | Research says this IS realism in practice. Shadow/illumination are the tell. |
| Composition & Framing | **12%** | AI models handle this reasonably well via prompting. |
| Style Consistency | **8%** | Project cohesion matters but is a scene-level concern. |
| AI Artifact Severity | **5%** | Low weight + **hard veto at ≤ 3**. Modern models rarely catastrophically fail here. |
| Cinematic Mood | **5%** | Subjective overlay. |
| **Total** | **100%** | |

### Recommended: Hard Veto System (from VFX industry)

In ADDITION to weighted scoring, implement binary gates:

| Dimension | Veto Threshold | Action |
|-----------|---------------|--------|
| AI Artifact Severity | Score ≤ 3 | **Auto-REJECT** regardless of overall score |
| Photographic Realism | Score ≤ 3 | **Auto-REJECT** — fundamentally synthetic look can't be fixed |
| Intent Adherence | Score ≤ 2 | **Auto-REJECT** — completely wrong content |

This mirrors how ILM/Weta/DNEG actually work: certain failures are instant rejects, no matter how good everything else is.

---

## What We Still Don't Know

1. **No published study directly compares these 7 specific dimensions with empirical weights.** Our weights are triangulated from adjacent research, not directly measured.
2. **Weights may need to be model-specific.** Flux 2 might need heavier artifact checking than GPT Image 1.5. Could be a v2 enhancement.
3. **The optimal weights will shift as models improve.** Today's artifact severity weight should decrease as models get better at hands/text.
4. **User testing is still essential.** These weights are a research-informed starting point, not a final answer. We need to calibrate against real ShotPilot usage.

---

## Sources

### Academic Papers
- AIGCIQA2023: "A Large-scale Image Quality Assessment Database for AI Generated Images" (arXiv:2307.00211)
- ImageReward: "Learning and Evaluating Human Preferences for Text-to-Image Generation" (arXiv:2304.05977, Tsinghua)
- T2I-CompBench: "A Comprehensive Benchmark for Compositional Text-to-Image Generation" (NeurIPS 2023)
- AIGIQA-20K: "A Large Database for AI-Generated Image Quality Assessment" (CVPR 2024 Workshop)
- TSP-MGS: "AI-Generated Image Quality Assessment Based on Task-Specific Prompt" (Nov 2024)
- Rademacher et al.: "Measuring the Perception of Visual Realism in Images" (EGRW 2001)
- Fan et al.: "An Automated Estimator of Image Visual Realism" (CVPR 2014)
- Wang & Li: "Information Content Weighting for Perceptual Image Quality Assessment" (IEEE TIP 2011)
- PVQA Principles: "Spatial and Temporal Dimensions in Perceptual Visual Quality Assessment" (March 2025, arXiv:2503.00625)

### Industry
- Netflix VFX Best Practices & Delivery Specifications (partnerhelp.netflixstudios.com)
- UK National Occupational Standards for VFX (ukstandards.org.uk — SKSVFX3)
- VFX QC discussion (reddit.com/r/vfx)
- Dazzle Pictures: "Role and Importance of Quality Control in VFX" (dazzle.pictures)

### Photography Competition Rubrics
- La Crosse Area Camera Club judging criteria (lacrosseareacameraclub.org)
- f3c.org short film competition judging criteria
- Light and Composition awards rubric (lightandcomposition.com)
- Film Evaluation Rubric (scribd.com/document/924406529)

### Benchmarks & Datasets
- NTIRE 2024 Quality Assessment of AI-Generated Content Challenge (CVPR 2024)
- HuggingFace objective metrics guide (huggingface.co/blog/PrunaAI)
- LINE Yahoo Tech Blog: "How to Evaluate AI-Generated Images" (techblog.lycorp.co.jp)
