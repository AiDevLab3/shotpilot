# Kling Image V3 / O3 — ShotPilot Model Guide

**Model:** Kling Image V3 & O3 (Omni 3) | **Maker:** Kuaishou Technology | **Type:** Image Generation  
**Available on:** fal.ai | **Commercial Use:** Yes

---

## Overview

Kling Image V3 and O3 are dedicated **image generation models** (separate from Kling's video models). Key features: **Elements face control** (@Element syntax), **series generation** (O3), **multi-image reference** (O3 I2I, up to 10 images), and up to **4K resolution** (O3).

## Endpoints

| Endpoint | Model ID | Key Feature |
|---|---|---|
| V3 Text-to-Image | `fal-ai/kling-image/v3/text-to-image` | Standard T2I + Elements |
| V3 Image-to-Image | `fal-ai/kling-image/v3/image-to-image` | Single ref I2I |
| O3 Text-to-Image | `fal-ai/kling-image/o3/text-to-image` | 4K, series, enhanced reasoning |
| O3 Image-to-Image | `fal-ai/kling-image/o3/image-to-image` | Multi-ref (10 imgs), @Image syntax |

## V3 vs O3

| Feature | V3 | O3 |
|---|---|---|
| Max Resolution | 2K | **4K** |
| Series Mode | ❌ | ✅ (2–9 images) |
| Multi-Image Ref | Single | **Up to 10** |
| Text Rendering | Good | **Excellent** |
| Price (1K/2K) | $0.028 | $0.028 |
| Price (4K) | N/A | $0.056 |

## API Parameters

### V3 Text-to-Image

| Parameter | Type | Required | Default | Options |
|---|---|---|---|---|
| `prompt` | string | ✅ | — | Max 2500 chars |
| `negative_prompt` | string | ❌ | — | Prefer positive framing instead |
| `elements` | list | ❌ | — | Face/character control |
| `resolution` | string | ❌ | "1K" | 1K, 2K |
| `num_images` | integer | ❌ | 1 | 1–9 |
| `aspect_ratio` | string | ❌ | "16:9" | 16:9, 9:16, 1:1, 4:3, 3:4, 3:2, 2:3, 21:9 |
| `output_format` | string | ❌ | "png" | jpeg, png, webp |

### O3 Additional Parameters

| Parameter | Type | Default | Notes |
|---|---|---|---|
| `resolution` | string | "1K" | Adds **"4K"** option |
| `result_type` | string | "single" | "single" or **"series"** |
| `series_amount` | integer | — | 2–9 (only with series mode) |

### O3 Image-to-Image Differences

- Uses `image_urls` (list, up to 10) instead of `image_url` (single)
- Reference images via `@Image1`, `@Image2` in prompt
- Adds `aspect_ratio: "auto"` option

## Elements (Face Control)

```json
{
  "prompt": "@Element1 stands at cliff edge overlooking ocean at sunset, dramatic backlighting, cinematic 35mm",
  "elements": [{ "image_url": "https://example.com/actor_face.jpg" }]
}
```

- Use frontal, well-lit reference photos
- Reference as `@Element1`, `@Element2`, etc.
- Works for face insertion — body/clothing from prompt
- Keep same reference images across project for consistency

## Pricing

| Resolution | Price |
|---|---|
| 1K / 2K | **$0.028** per image |
| 4K (O3 only) | **$0.056** per image |

Series mode: priced per image in the series. 4-image series at 2K = $0.112.

## Prompt Framework

**Structure:** `[SHOT TYPE & LENS] + [SUBJECT] + [ACTION/POSE] + [ENVIRONMENT] + [LIGHTING & MOOD]`

- Use cinematographic terms: "Medium shot, 50mm, f/1.4"
- Embed negatives in positive prompt (not negative_prompt)
- For O3 series: "Panel 1: ... Panel 2: ... Panel 3: ..."
- For O3 multi-ref: "Combine @Image1 composition with @Image2 style"

## Cinematic Examples

### Film Noir Still
```json
{
  "prompt": "Cinematic film noir, black and white, high contrast. Femme fatale in black evening gown in smoky jazz club doorway, backlit by hanging bulb. Venetian blind shadows across face. 4x5 large format, Ilford HP5 grain.",
  "resolution": "2K", "aspect_ratio": "2:3", "num_images": 3
}
```

### Character Concept with Face Control
```json
{
  "prompt": "@Element1 as space marine commander on warship bridge. Holographic displays glow blue and orange. Ringed gas giant through viewport. Chris Foss palette, Syd Mead design. 35mm, dramatic volumetric lighting.",
  "elements": [{ "image_url": "actor_headshot.jpg" }],
  "resolution": "2K", "aspect_ratio": "21:9"
}
```

### Storyboard Series (O3)
```json
{
  "prompt": "Cinematic storyboard, 35mm look. Panel 1: Wide shot, empty courtroom, morning light. Panel 2: @Element1 stands from defense table. Panel 3: Close-up judge's gavel mid-strike. Panel 4: Gallery gasps in shock.",
  "elements": [{ "image_url": "lawyer_ref.jpg" }],
  "result_type": "series", "series_amount": 4, "resolution": "2K", "aspect_ratio": "16:9"
}
```

### Multi-Reference Style Transfer (O3 I2I)
```json
{
  "prompt": "Reimagine @Image1 in the color palette and lighting of @Image2. Maintain composition from @Image1, transform mood to teal-orange grading with volumetric haze.",
  "image_urls": ["original_photo.jpg", "blade_runner_ref.jpg"],
  "resolution": "2K", "aspect_ratio": "auto"
}
```

### Movie Poster with Text
```json
{
  "prompt": "Movie poster: text 'MIDNIGHT SYNDICATE' in Art Deco gold lettering at top. Silhouetted figure with gun at center, city skyline at bottom. Noir palette: black, gold, deep red.",
  "resolution": "2K", "aspect_ratio": "2:3"
}
```

## Strengths

- **Elements face control** — cast specific faces into any scene
- **Series mode (O3)** — storyboards in a single call
- **Multi-image reference (O3)** — composite from up to 10 refs
- **4K resolution (O3)** — print-ready output
- **Strong text rendering (O3)** — reliable poster/sign text
- **8 aspect ratios** including 21:9 ultrawide
- **Affordable** — $0.028/image, batch 9 for $0.252

## Limitations

- No ControlNet/spatial guidance (pose, depth maps)
- No inpainting or regional editing
- Elements: face-only, not full body/clothing control
- Series consistency may drift beyond 4 panels
- No upscaling endpoint (use external tools)
- V3 lacks series, multi-ref, and 4K

## Common Mistakes

| Mistake | Fix |
|---|---|
| Using negative_prompt | Embed negatives in positive prompt |
| O3 I2I with single image | Use multiple refs with @Image syntax |
| Vague series prompts | Delineate each panel clearly |
| 4K for iteration | Use 1K, scale up for finals only |
| JPEG for compositing work | Use PNG (lossless) |
| Inconsistent character across shots | Use Elements with same ref images |

## Workflow

1. **Iterate:** V3 @ 1K, 4 images per prompt ($0.112)
2. **Refine:** V3 or O3 @ 2K, best prompt ($0.028–$0.112)
3. **Series/Final:** O3 @ 2K/4K with Elements ($0.028–$0.056/img)
4. **Feed to video:** Best stills → Kling 3.0 or Vidu Q3 I2V

## vs Other Models

| | Kling V3/O3 | Flux 2 | Midjourney | GPT Image |
|---|---|---|---|---|
| Face Control | ✅ Elements | ❌ | ❌ | ❌ |
| Series Mode | ✅ (O3) | ❌ | ❌ | ❌ |
| Multi-Ref I2I | ✅ (O3) | ❌ | ❌ | ❌ |
| Max Resolution | 4K | 2K | 2K | 2K |
| Text Rendering | Strong | Moderate | Moderate | Strong |
| Price | $0.028 | ~$0.03 | $0.05+ | ~$0.02 |
