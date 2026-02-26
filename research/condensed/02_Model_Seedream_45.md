# Seedream 4.5

> **Official Model Name:** Seedream 4.5 | **Developer:** ByteDance
> **Type:** IMAGE generation | **Last Updated:** 2026-02-19 | Source: seedream_4_5/Prompting_Mastery.md

## Model Overview
- **Type:** IMAGE generation (still images only, no video)
- **Engine:** ByteDance's Seedream 4.5 — LM Arena #10 (score 1147)
- **Resolution:** Up to 2048×2048 (4K quality)
- **Use in ShotPilot:** Typography-heavy images, branded content, multi-image series, style transformation

## Key Differentiators
- SOTA text rendering — accurate spelling, multiple fonts, complex layouts, non-Latin scripts
- Multi-image consistency — maintains style, character, theme across series
- Advanced style control — precise style transfer and transformation
- Designer-level composition — professional typography and layout understanding
- Unified generation + editing architecture

## Golden Rules

### Rule 1: Leverage Text Rendering
Seedream 4.5's killer feature is text. Always specify:
- Exact text in double quotes: `"SUMMER SALE"`
- Font style: "bold sans-serif," "elegant serif," "brush script"
- Placement: "centered top," "bottom-right corner," "overlaid on subject"
- Effects: "white with drop shadow," "gold metallic," "neon glow"

### Rule 2: Be Descriptive, Not Terse
- BAD: "poster, summer, beach, sale, colorful"
- GOOD: "A vibrant summer beach poster with 'SUMMER SALE' in bold white sans-serif text across the top, a tropical sunset background with palm tree silhouettes, and '50% OFF' in gold script at the bottom."

### Rule 3: Use Multi-Image for Series
When creating series (campaign images, storyboard panels), describe the consistent elements first, then vary per-image elements. The model maintains visual coherence across generations.

### Rule 4: Style Transfer with Precision
Specify source style precisely: "in the style of vintage 1960s travel posters" or "watercolor illustration with visible brush strokes on textured paper."

## Prompt Structure
```
[SUBJECT]: What the image shows
[TEXT]: "Exact text" in [font] at [position] with [effects]
[STYLE]: Artistic medium, aesthetic, reference
[COMPOSITION]: Layout, framing, aspect ratio
[COLORS]: Color palette, brand colors
[MOOD]: Emotional tone, atmosphere
```

### Example Prompt
```
A premium coffee brand advertisement featuring a steaming ceramic cup on a dark marble countertop. "ARTISAN BLEND" in elegant gold serif text at top center with subtle embossing effect. "Crafted for Connoisseurs" in lighter weight below. Moody studio lighting with a single warm spot from the upper left, dark background with subtle bokeh. Rich brown and gold color palette. Luxurious, sophisticated mood.
```

## Technical Specs

| Feature | Specification |
|---|---|
| **Resolution** | Up to 2048×2048 |
| **Text Rendering** | Multi-line, multi-font, 100+ languages |
| **Style Control** | Transfer, transformation, blending |
| **Multi-Image** | Consistent series generation |
| **Editing** | Unified gen + edit architecture |
| **API** | fal.ai (bytedance/seedream/v4.5) |

## Typography Capabilities
- Multi-line text with consistent formatting
- Various font styles and weights
- Special characters and non-Latin scripts
- Text integration within complex scenes
- Accurate spelling and grammar
- Layout-aware placement (respects composition)

## Style Transformation
- Photorealistic → Illustration
- Photo → Oil painting, watercolor, vector, pixel art
- Modern → Vintage (specific decade)
- Flat design → 3D rendering
- Specify transformation explicitly: "Transform this scene into a 1970s Saul Bass movie poster style"

## Common Mistakes & Fixes

| Mistake | Fix |
|---|---|
| Not specifying text details | Always include font, placement, effects for text |
| Generic style ("make it cool") | Specify exact style reference with technical details |
| Expecting video output | Seedream 4.5 is image-only |
| Inconsistent series elements | Describe consistent elements first, vary only what changes |
| Small text at low resolution | Use larger text sizes, higher resolution output |
| Trusting text accuracy blindly | Always verify rendered text — occasional errors possible |

## Known Limitations
- Image-only, no video generation
- Very small text may render imperfectly
- Complex multi-language text in single image can have issues
- Style transfer quality varies by target style
- Maximum resolution 2048×2048

## Cross-Model Translation
- **To Nano Banana Pro:** Add camera/lens specs, expand narrative context
- **To FLUX.2:** Use JSON structure for complex layouts, add hex colors
- **To Midjourney:** Simplify text requirements (MJ text is weaker), add --style params

## Quick Reference Prompt Template
```
[SUBJECT]: Main visual content
[TEXT]: "Exact text" in [font style] at [placement] with [effects]
[STYLE]: Medium, aesthetic, reference
[COMPOSITION]: Layout, framing, aspect ratio
[COLORS]: Palette, brand colors (hex if needed)
[MOOD]: Emotional tone, atmosphere
[SERIES]: Consistent elements for multi-image sets
```
