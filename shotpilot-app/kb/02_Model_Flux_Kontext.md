# FLUX.1 Kontext (Pro + Max) — ShotPilot Model Guide

**Type:** Image Editing & Generation (Image-to-Image, Text-to-Image, Multi-Reference)  
**Developer:** Black Forest Labs (BFL)  
**Cost:** $0.04/image (Pro), ~$0.08/image (Max)

---

## Quick Overview

FLUX.1 Kontext is a 12B parameter multimodal flow transformer for in-context image editing and generation. NOT the same as Flux 2 — Kontext is specifically designed for editing existing images, maintaining character consistency across scenes, and handling typography. Two tiers: Pro (standard) and Max (enhanced prompt adherence).

---

## Endpoints

| Endpoint | ID | Use Case |
|----------|----|----------|
| Pro Image Edit | `fal-ai/flux-pro/kontext` | Edit images with text instructions |
| Pro Text-to-Image | `fal-ai/flux-pro/kontext/text-to-image` | Generate from text only |
| Max Image Edit | `fal-ai/flux-pro/kontext/max` | Premium editing quality |
| Max Text-to-Image | `fal-ai/flux-pro/kontext/max/text-to-image` | Premium generation |
| Multi-Reference | `fal-ai/flux-pro/kontext/multi` | Edit with 2+ reference images |
| LoRA | `fal-ai/flux-kontext-lora` | Custom LoRA model support |

---

## Core Parameters

### Image-to-Image (Primary)

| Parameter | Type | Default | Values |
|-----------|------|---------|--------|
| `prompt` | string | — | Required — editing instruction |
| `image_url` | string | — | Required — reference image URL |
| `guidance_scale` | float | 3.5 | CFG scale (sweet spot: 2.5–5.0) |
| `seed` | integer | Random | Reproducibility |
| `num_images` | integer | 1 | Number of outputs |
| `output_format` | enum | `"jpeg"` | `jpeg`, `png` |
| `safety_tolerance` | enum | `"2"` | `1`–`6` (API only) |
| `enhance_prompt` | boolean | false | Auto-enhance short prompts |
| `aspect_ratio` | enum | (from input) | `21:9`, `16:9`, `4:3`, `3:2`, `1:1`, `2:3`, `3:4`, `9:16`, `9:21` |

### Text-to-Image — Same minus `image_url`

### Multi — Same but `image_url` accepts array of 2+ URLs

---

## Prompting Paradigm

**Kontext uses INSTRUCTIONS, not descriptions.**

❌ "A woman in a blue dress in a sunny field"  
✅ "Change her dress to blue. Keep everything else identical."

### Prompt Template
```
[Action verb] [target] to [desired state]. Keep [preservation list] exactly the same.
```

### Key Action Verbs
`Change`, `Replace`, `Add`, `Remove`, `Transform`, `Adjust`, `Make`, `Place`, `Turn`, `Keep`

### Guidance Scale Guide
| Value | Use |
|-------|-----|
| 2.5–3.0 | Subtle lighting/color tweaks |
| 3.5 | Default — wardrobe/object changes |
| 4.0–5.0 | Typography, precise edits |
| 5.0–6.0 | Maximum prompt adherence |
| 7.0+ | Usually causes artifacts — avoid |

---

## Cinematic Examples

### Noir Lighting Edit
```json
{
  "prompt": "Transform lighting to film noir. Hard directional light upper-left, deep shadows right side. Add cigarette smoke. High-contrast black and white, film grain. Keep face, pose, clothing identical.",
  "image_url": "portrait.jpg",
  "guidance_scale": 4.0,
  "output_format": "png"
}
```

### Scene Change (Character Consistency)
```json
{
  "prompt": "Move this person to a rain-soaked Tokyo intersection at night. Neon reflections in puddles. Translucent umbrella. 35mm film, anamorphic lens flare. Maintain exact facial features and proportions.",
  "image_url": "character-ref.jpg",
  "guidance_scale": 3.5,
  "aspect_ratio": "16:9"
}
```

### Color Grade
```json
{
  "prompt": "Apply Sicario color grade: desaturated warm tones, amber highlights, blue-green shadow tint. Atmospheric haze in background. Keep all subjects and composition identical.",
  "image_url": "scene.jpg",
  "guidance_scale": 3.0
}
```

### Movie Poster (T2I)
```json
{
  "endpoint": "fal-ai/flux-pro/kontext/text-to-image",
  "prompt": "Movie poster: 'LAST BREATH' in large distressed white sans-serif. Diver silhouette descending into deep ocean. Tagline: 'Some depths were never meant to be reached.' Deep blue/black palette, film grain.",
  "guidance_scale": 4.5,
  "aspect_ratio": "2:3",
  "output_format": "png"
}
```

### Multi-Reference Composition
```json
{
  "endpoint": "fal-ai/flux-pro/kontext/multi",
  "prompt": "Person from first image sitting across table from person in second image. Dimly lit restaurant, candlelight. Both faces preserved exactly. Cinematic shallow DOF.",
  "image_url": ["char-a.jpg", "char-b.jpg"],
  "aspect_ratio": "16:9"
}
```

---

## Key Use Cases for Cinematic Production

### Keyframe Pipeline
1. Generate/source base character image
2. Kontext I2I → create keyframes in different scenes (consistent character)
3. Feed keyframes into PixVerse/Kling/Veo for video generation
4. Result: Consistent character across video shots

### Shot-to-Shot Consistency
Use same character reference → Kontext edits for wide, medium, close-up → each maintains identity

### Color Grading
Reference specific DPs/films: "Apply Roger Deakins 'Blade Runner 2049' grade" — Kontext handles this exceptionally well

### Typography
Create/edit movie posters, title cards, in-scene signage. Quote exact text in your prompt.

---

## Strengths
- Best-in-class image editing without masks or inpainting
- Excellent character consistency across scenes (no LoRA needed)
- Superior typography/text rendering and editing
- Multi-image input for composition and style transfer
- 8× faster inference than competitors
- $0.04/image — extremely cost-effective
- LoRA support for specialized domains

## Limitations
- Image-only (no video generation)
- Not pixel-perfect consistency — identity preserved, minor variations expected
- Complex multi-step edits should be chained, not crammed into one prompt
- guidance_scale above 7 causes artifacts (unlike SD where 7-12 is normal)
- Max output ~2048px (no 4K)
- Character consistency degrades with 3+ characters or extreme pose changes

---

## Cost Reference

| Endpoint | Cost |
|----------|------|
| Kontext Pro (all modes) | $0.04/image |
| Kontext Max (all modes) | ~$0.08/image |
| Kontext LoRA | ~$0.05/image |

**Production budget:** 10-shot character sequence with 3× iteration = ~$1.20 total

---

## Common Mistakes
1. **Descriptive prompts for editing** — Use instructions ("Change X to Y"), not descriptions
2. **guidance_scale too high** — Stay 2.5–5.0; 7+ causes artifacts
3. **No preservation instructions** — Always specify what to keep unchanged
4. **Using I2I endpoint for pure generation** — Use the T2I endpoint instead
5. **Expecting pixel-perfect consistency** — Identity preserved, not exact pixels
6. **Too many edits in one prompt** — Chain 2-3 sequential calls instead
