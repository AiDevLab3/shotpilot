# Grok Imagine Image — AI Image Generation by xAI

> Last Updated: 2026-02-19 | Source: grok_imagine/Prompting_Mastery.md

## Model Type
- **IMAGE generation** (Text-to-Image + Image Edit)
- Strong aesthetic intelligence — dramatic, eye-catching compositions out of the box
- Automatic prompt revision system (model enhances your prompt)
- 12 aspect ratios including device-specific formats

## Technical Specs

| Feature | Value |
|---------|-------|
| Model Type | Text-to-Image, Image-to-Image (edit) |
| Resolution | High resolution (model-determined) |
| Aspect Ratios | 2:1, 20:9, 19.5:9, 16:9, 4:3, 3:2, 1:1, 2:3, 3:4, 9:16, 9:19.5, 9:20, 1:2 |
| Batch Generation | Multiple images per request (num_images) |
| Output Formats | JPEG, PNG, WebP |
| Prompt Revision | Automatic — returned in `revised_prompt` |
| Image Editing | Text-guided global edit |
| Cost | $0.02 per image |
| API | fal.ai (`xai/grok-imagine-image`, `xai/grok-imagine-image/edit`) |

## Strengths & Limitations

**Strengths:**
- Aesthetic quality — strong visual drama and composition by default
- Color mastery — excellent grading, harmony, palette control
- Emotional resonance — images feel charged with mood
- Fast generation — quick inference for rapid iteration
- 12 aspect ratios — broadest ratio support of any image model
- Cost effective — $0.02/image
- Image editing mode for refinements

**Limitations:**
- No reference image input for generation (editing only)
- No character consistency across generations
- Limited text rendering (add text in post)
- Prompt revision can add unwanted elements
- No inpainting/masking (global edit only)
- No seed control for exact reproduction
- Cannot specify exact pixel dimensions

## API Endpoints

| Endpoint | Model ID | Input |
|----------|----------|-------|
| Text-to-Image | `xai/grok-imagine-image` | prompt (required), num_images, aspect_ratio, output_format |
| Image Edit | `xai/grok-imagine-image/edit` | prompt (required), image_url (required), num_images, output_format |

## 6-Variable Prompt Structure

| Variable | What It Covers | Example |
|----------|---------------|---------|
| **Subject** | Primary focus, appearance, identity | "A distinguished architect in her 50s, cropped silver hair, black blazer" |
| **Composition** | Camera angle, framing, spatial arrangement | "Low angle close-up, rule of thirds, negative space above" |
| **Action/Pose** | What subject does, implied motion | "Adjusting a cufflink, glancing up with one eyebrow raised" |
| **Location** | Environment with atmospheric detail | "Narrow Shinjuku back alley, vending machines, wet pavement reflecting neon" |
| **Style** | Artistic medium, camera/lens | "Shot on Hasselblad 500C, Kodak Portra 400, 80mm lens at f/2.8" |
| **Mood/Lighting** | Emotional tone via light quality | "Rembrandt lighting, deep shadows, warm amber highlights against cool blue" |

## 4 Golden Rules

1. **Lead with visual impact** — Start prompt with the most striking element (model prioritizes early content)
2. **Describe feeling, not just scene** — "Suffocating darkness between ancient trees where you feel watched" > "A dark forest"
3. **Use cinematic language** — Camera, lens, film stock, lighting setups produce the best results
4. **Check revised_prompt** — Learn from what the model adds; incorporate those patterns

## Advanced Techniques

### Color Palette Control
```
"Strictly limited palette: deep navy (#1B1F3B), warm amber (#E8A838), off-white (#F5F0E8). Every element within these three colors."
```

### Film Stock Emulation
```
"Shot on Kodak Vision3 500T, pushed one stop. Warm tungsten cast, visible grain, slightly lifted blacks."
```

### Lighting Diagram
```
"Key light: large octabox camera-left at 45°. Fill: bounce card camera-right. Hair light: strip softbox behind subject."
```

### Temporal Implication
```
"The exact moment a wine glass shatters — red wine frozen mid-splash, shards catching light. Ultra-high-speed feel."
```

### Depth Layering
```
"Foreground: rain-soaked railing in sharp focus. Midground: woman in yellow coat, slightly soft. Background: buildings fading into mist."
```

## Prompt Revision System

The model automatically enhances your prompt. The enhanced version is returned as `revised_prompt`.

**Strategy:** Generate with simple prompt → Read `revised_prompt` → Incorporate best additions into future prompts for more control.

**Override unwanted additions:** Be exhaustively specific, or explicitly exclude: "NO people, NO animals, NO text."

## Image Editing Mode

Edit existing images with text instructions:

| Edit Type | Quality |
|-----------|---------|
| Style transfer | ✅ Excellent |
| Lighting change | ✅ Excellent |
| Color grade | ✅ Excellent |
| Element addition | ✅ Good |
| Element removal | ⚠️ Variable |
| Background change | ⚠️ Variable |

**Edit tip:** Be surgical — "ONLY change the lighting to golden hour. Keep everything else identical."

## Aspect Ratio Selection

| Use Case | Recommended Ratio |
|----------|------------------|
| Hero frame for 16:9 video | 16:9 |
| Instagram story | 9:16 |
| Film poster | 2:3 |
| Ultra-wide cinematic | 2:1 |
| Product photography | 1:1 or 3:4 |
| Phone wallpaper | 9:19.5 |

## Cinematic Hero Frame Recipe

```
"[Shot type] from a [genre] film. [Subject]. [Lighting]. [Camera/lens]. [Color treatment]. [Atmosphere]. Film grain, shallow depth of field."
```

## Comparison

| vs. Model | Grok Wins When | Other Wins When |
|-----------|---------------|-----------------|
| Nano Banana Pro | Aesthetic impact matters, faster/cheaper | Text rendering, precision editing, masking |
| Flux 2 | Default aesthetics, no LoRA needed | Character consistency, customization |
| Midjourney | API access, image editing, more aspect ratios | Community ecosystem, artistic styles |

## 6 Common Issues + Fixes

| Problem | Fix |
|---------|-----|
| Unwanted elements appear | Check `revised_prompt`; explicitly exclude with "NO [element]" |
| Wrong style | Add specific camera, film stock, and lighting keywords |
| Text is garbled | Don't rely on in-image text; add in post |
| Colors off | Use specific hex codes, film stock, or Pantone references |
| Edit changes too much | Be surgical: "ONLY change [specific thing]" |
| Composition wrong | Specify shot type, framing rule, angle explicitly |

## Integration Workflows

### Hero Frame → Video Pipeline
Generate frame (16:9) → Optional edit/refine → Upload to Kling 3.0/VEO 3.1/Sora 2 as start frame → Generate video

### Character Design → Video
Generate portrait (3:4) + full body (2:3) → Feed into Kling 3.0 Elements → Generate video with character consistency

### Batch Content
Generate num_images: 4 → Select best → Edit for polish → Export ($0.08–0.12 per final image)
