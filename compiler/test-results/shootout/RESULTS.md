# 🎬 Cine-AI Cross-Model Shootout Results

**Date:** 2026-02-19  
**Total Time:** ~8 minutes  
**Models Tested:** 12 (8 succeeded, 4 unavailable on fal.ai)

## Brief

> A cinematic 21:9 wide shot of a lone figure standing at the edge of a rain-soaked rooftop at night. The city sprawls below, neon signs reflecting in puddles. The figure wears a long dark coat, facing away from camera. Moody, atmospheric, neo-noir aesthetic. Think Blade Runner meets Se7en.

## Rankings

| Rank | Model | Score | Recommendation | Gen Time | Provider |
|------|-------|-------|----------------|----------|----------|
| 1 | **Nano Banana Pro** | 92/100 | ACCEPT | 43.2s | Gemini |
| 2 | **GPT Image 1.5** | 92/100 | ACCEPT | 55.9s | OpenAI |
| 3 | **Grok Imagine** | 88/100 | REFINE_SAME_MODEL | 72.4s | fal.ai (xAI) |
| 4 | **Ideogram V3** | 88/100 | REFINE_SAME_MODEL | 21.7s | fal.ai |
| 5 | **Flux 2 Flex** | 68/100 | SWITCH_MODEL | 40.2s | fal.ai |
| 6 | **Reve** | 68/100 | SWITCH_MODEL | 19.1s | fal.ai |
| 7 | **Kling Image V3** | 68/100 | SWITCH_MODEL | 59.1s | fal.ai |
| 8 | **Bria FIBO** | 68/100 | REGENERATE | 27.3s | fal.ai |

### Unavailable Models (fal.ai endpoint not live)

- **Recraft V4 Pro** — `fal-ai/recraft/v4/pro` returns 404 (only V3 exists on fal.ai)
- **Seedream 4.5** — `fal-ai/bytedance/seedream/v4.5` returns 404
- **Z-Image** — `fal-ai/z-image` returns 404
- **Qwen Image Max** — `fal-ai/qwen-image-max/text-to-image` returns 504 (downstream unavailable)

---

## Detailed Results

### 1. Nano Banana Pro — 92/100 🏆

**Dimensions:**
- Brief adherence: 9/10
- Physics: 8/10
- Style consistency: 9/10
- Lighting/atmosphere: 10/10
- Clarity: 9/10
- Composition: 9/10
- Identity: 9/10

**Summary:** Exceptional neo-noir atmosphere with strong cinematic quality. Nailed the Blade Runner aesthetic with motivated neon lighting, convincing rain, and excellent figure placement. The 4K output showed strong detail in both the foreground figure and background cityscape.

**Strengths:** Outstanding lighting and atmosphere, natural-looking rain interaction, strong cinematic framing, excellent coat texture detail.

**Weaknesses:** Minor over-rendering on some clean surfaces (known Gemini trait).

**Generation Time:** 43.2s

---

### 2. GPT Image 1.5 — 92/100 🏆

**Dimensions:**
- Brief adherence: 9/10
- Physics: 9/10
- Style consistency: 9/10
- Lighting/atmosphere: 9/10
- Clarity: 9/10
- Composition: 9/10
- Identity: 9/10

**Summary:** Precise instruction following produced an extremely faithful rendering of the brief. Every element was present and well-executed. The image had a slightly cleaner, more polished look compared to Nano Banana Pro — less "gritty" but technically superior in physics and consistency.

**Strengths:** Exceptional prompt adherence, strong physics (puddle reflections), clean composition, precise instruction following.

**Weaknesses:** Slightly too "clean/corporate" for the gritty neo-noir aesthetic — lacks raw film grain.

**Generation Time:** 55.9s

---

### 3. Grok Imagine — 88/100

**Dimensions:**
- Brief adherence: 9/10
- Physics: 8/10
- Style consistency: 8/10
- Lighting/atmosphere: 9/10
- Clarity: 8/10
- Composition: 9/10
- Identity: 8/10

**Summary:** Strong performance for a budget model ($0.02/image). Excellent atmospheric quality with good neon reflections. The moody palette was spot-on for neo-noir.

**Strengths:** Great value, strong atmosphere, good color palette, solid composition.

**Weaknesses:** Slightly less detail in background elements, some minor AI artifacts in distant neon signs.

**Generation Time:** 72.4s

---

### 4. Ideogram V3 — 88/100

**Dimensions:**
- Brief adherence: 10/10
- Physics: 7/10
- Style consistency: 9/10
- Lighting/atmosphere: 9/10
- Clarity: 8/10
- Composition: 9/10
- Identity: 9/10

**Summary:** Surprisingly strong for a typography-focused model. Achieved a natural 35mm film still look with good grain texture, avoiding common AI sheen. The coat texture was highly realistic.

**Strengths:** Natural film-like aesthetic, strong composition, excellent texture rendering, avoids AI sheen.

**Weaknesses:** Reflection alignment slightly off at character's feet, rain streaks too sharp/etched in some areas.

**Generation Time:** 21.7s ⚡ (fastest successful model)

---

### 5. Flux 2 Flex — 68/100

**Dimensions:** Scored lower across physics and style consistency. The auditor recommended switching models.

**Summary:** Decent photorealistic base but lacked the cinematic atmosphere needed for this brief. The neo-noir mood didn't come through strongly enough.

**Weaknesses:** Less atmospheric default aesthetic, required more prompt engineering for mood, weaker neon reflection handling.

**Generation Time:** 40.2s

---

### 6. Reve — 68/100

**Dimensions:**
- Composition: 9/10 (strongest)
- Lighting/atmosphere: 8/10
- Style consistency: 6/10
- Physics: 7/10
- Brief adherence: 5/10

**Summary:** Good compositional framing but heavy AI artifacts. Neon text on buildings was blurry/nonsensical. Rain looked like a 2D overlay rather than 3D particles.

**Weaknesses:** Garbled neon sign text, flat rain overlay, visible AI sheen, lacks photographic grain.

**Generation Time:** 19.1s

---

### 7. Kling Image V3 — 68/100

**Dimensions:**
- Composition: 9/10 (strongest)
- Lighting/atmosphere: 8/10
- Style consistency: 7/10
- Physics: 6/10

**Summary:** Strong Neo-Noir framing with excellent lighting, but background buildings had "melting" texture artifacts. Rain didn't interact with the subject realistically.

**Weaknesses:** Background architectural artifacts, poor rain-subject interaction, character not grounded in puddle, gibberish neon text.

**Generation Time:** 59.1s

---

### 8. Bria FIBO — 68/100

**Dimensions:**
- Composition: 9/10 (strongest)
- Clarity: 8/10
- Style consistency: 7/10
- Physics: 6/10
- Lighting/atmosphere: 6/10

**Summary:** Clean output but the subject felt disconnected from the environment — a "cutout" effect. Reflections didn't align with light sources. Scene was too clean for a rain-soaked rooftop.

**Weaknesses:** Poor subject-background integration, misaligned reflections, repetitive sky texture artifacts, too clean/sanitized for noir aesthetic.

**Generation Time:** 27.3s

---

## Summary Analysis

### 🏆 Top Performers

- **Nano Banana Pro** (92/100): Best atmosphere and cinematic quality. The clear winner for mood and lighting.
- **GPT Image 1.5** (92/100): Most faithful to the brief with superior physics. Tied at the top but slightly too polished for "gritty noir."
- **Ideogram V3** (88/100): The surprise performer — fastest generation with a natural film-like aesthetic.

### 😮 Surprises

- **Ideogram V3** scored 88/100 — remarkable for a model known primarily for typography/design work. Its natural film grain aesthetic was a perfect match for this noir brief.
- **Grok Imagine** at 88/100 delivers exceptional value at $0.02/image — nearly matching the top-tier models at a fraction of the cost.

### 😞 Disappointments

- **Flux 2 Flex** (68/100) — expected stronger photorealistic output, but it lacked the atmospheric/mood capabilities needed for cinematic work.
- **4 models unavailable** — Recraft V4, Seedream 4.5, Z-Image, and Qwen Image Max all have endpoint issues on fal.ai. Their model IDs in the codebase need verification/updating.

### 📊 Speed vs Quality

| Model | Score | Time | Score/Second |
|-------|-------|------|--------------|
| Ideogram V3 | 88 | 21.7s | 4.06 |
| Bria FIBO | 68 | 27.3s | 2.49 |
| Reve | 68 | 19.1s | 3.56 |
| Flux 2 Flex | 68 | 40.2s | 1.69 |
| Nano Banana Pro | 92 | 43.2s | 2.13 |
| GPT Image 1.5 | 92 | 55.9s | 1.65 |
| Kling Image V3 | 68 | 59.1s | 1.15 |
| Grok Imagine | 88 | 72.4s | 1.22 |

### 🎯 Recommendation for Neo-Noir Cinematic Briefs

**Primary:** **Nano Banana Pro** — Best overall for moody, atmospheric, cinematic scenes. Its conversational editing capability also means you can iterate on the result naturally.

**Runner-up:** **GPT Image 1.5** — Tied on score, superior physics and prompt adherence. Choose this when precision matters more than raw atmosphere.

**Budget/Speed Pick:** **Ideogram V3** — 88/100 in just 21.7s. Best score-per-second ratio by far. Excellent for rapid iteration and drafting before committing to a final render with a top-tier model.

**Value Pick:** **Grok Imagine** — 88/100 at $0.02/image. Can't beat the economics for exploration and concept development.

### 🔧 Bug Found: fal.ai URL Routing

During the shootout, discovered that fal.ai's queue API returns shortened `status_url` and `response_url` fields that don't match the full model path. Fixed `fal.js` to use the returned URLs instead of constructing them from the base URL. Additionally, 4 model endpoint IDs in `fal.js` need updating — they reference endpoints that don't exist (yet) on fal.ai.

**Models needing endpoint verification:**
- `fal-ai/recraft/v4/pro` → should probably be `fal-ai/recraft/v3/text-to-image`
- `fal-ai/bytedance/seedream/v4.5` → endpoint doesn't exist
- `fal-ai/z-image` → endpoint doesn't exist
- `fal-ai/qwen-image-max/text-to-image` → returns 504
