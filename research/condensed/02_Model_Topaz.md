# Topaz AI Upscaling

> **Official Model Name:** Topaz Gigapixel AI / Topaz Photo AI | **Developer:** Topaz Labs
> **Type:** IMAGE + VIDEO upscaling and enhancement | **Last Updated:** 2026-02-19 | Source: topaz/Prompting_Mastery.md

## Model Overview
- **Type:** IMAGE and VIDEO upscaling/enhancement (not generation)
- **Engine:** Specialized AI upscaling models (Core, Generative, Legacy)
- **Max Upscale:** Up to 6x original size (32,000px longest side or 2GB)
- **Products:** Gigapixel AI (dedicated upscaling), Photo AI (all-in-one enhancement)
- **Use in ShotPilot:** Post-generation upscaling to print/4K/8K, artifact cleanup, face recovery

## Key Differentiators
- Specialized AI models for different image types (photos, graphics, text, AI art)
- Generative enhancement: adds detail, not just enlarges
- Massive upscaling: up to 6x while maintaining/improving quality
- Artifact removal: fixes compression, blur, low-resolution issues
- Text preservation: dedicated model for sharp text and shapes
- Batch processing with consistent settings
- Available via fal.ai API (image + video endpoints)

## Product Comparison

| Feature | Gigapixel AI | Photo AI |
|---|---|---|
| **Focus** | Dedicated upscaling | All-in-one enhancement |
| **Max Upscale** | 6x | 6x |
| **AI Models** | Core, Generative, Legacy | Core (simplified) |
| **Extra Features** | Upscaling only | Denoise, Sharpen, Face Recovery |
| **Best For** | Max upscaling control | Complete photo workflow |

## AI Model Selection

| Model | Best For | Notes |
|---|---|---|
| **Core** | General photos, versatile | Default choice, balanced quality |
| **Recover** | Low-quality, compressed images | Generative — adds missing detail |
| **Redefine** | AI-generated images | Generative — enhances AI art specifically |
| **Text & Shapes** | Screenshots, documents, graphics | Preserves sharp edges and text |
| **Legacy** | Compatibility, specific use cases | Older models, sometimes preferred |

## Golden Rules

### Rule 1: Match Model to Source
- AI-generated images → **Redefine** model
- Compressed/low-quality photos → **Recover** model
- Screenshots/text/graphics → **Text & Shapes** model
- General photos → **Core** model

### Rule 2: Don't Over-Upscale
- 2x is safe for most images
- 4x for high-quality sources
- 6x only for very clean originals
- Over-upscaling produces artifacts regardless of model

### Rule 3: Process Before Upscaling
For Photo AI workflow: Denoise → Sharpen → Face Recovery → THEN Upscale. Order matters.

### Rule 4: Use Batch for Consistency
When upscaling a series (storyboard, campaign), use batch mode with identical settings for visual consistency.

## Recommended Workflows

### AI Image → Print
1. Generate image at max native resolution (e.g., 2048×2048 from Seedream)
2. Select **Redefine** model in Topaz
3. Upscale 2-4x depending on print size
4. Export as TIFF for print, PNG for digital

### Video Upscaling
1. Use fal.ai API: `topaz/upscale/video`
2. Professional-grade video upscaling
3. Good for upscaling AI-generated video clips

### Low-Quality Restoration
1. Use **Recover** model
2. Enable Face Recovery if faces present
3. Start with 2x, assess, then go higher if needed

## Common Mistakes & Fixes

| Mistake | Fix |
|---|---|
| Using wrong AI model | Match model to image type (see selection guide) |
| Upscaling too aggressively | Start at 2x, go higher only if source is clean |
| Skipping denoise/sharpen first | Process before upscaling (Photo AI workflow) |
| Expecting generation | Topaz enhances existing images, doesn't create new ones |
| Inconsistent batch settings | Lock settings for series processing |

## Known Limitations
- Enhancement only — does not generate new images
- Very low-quality sources may not upscale well even with Recover
- Processing time increases significantly with upscale factor
- Large output files (up to 2GB)
- Generative models may add unwanted detail — verify results

## Integration in Pipeline
1. **Generate** with any image model (Nano Banana Pro, FLUX.2, Seedream, Z-Image)
2. **Edit** with Reve if adjustments needed
3. **Upscale** with Topaz to final resolution
4. **Deliver** at print/broadcast/digital resolution

## Quick Reference
```
AI-generated image → Redefine model → 2-4x
Compressed photo → Recover model → 2x
Screenshot/text → Text & Shapes model → 2-4x
General photo → Core model → 2-4x
Video → fal.ai topaz/upscale/video endpoint
Always: match model to source type, don't over-upscale
```
