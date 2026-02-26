# Z-Image

> **Official Model Name:** Z-Image / Z-Image Turbo | **Developer:** Alibaba Tongyi-MAI
> **Type:** IMAGE generation | **Last Updated:** 2026-02-19 | Source: z_image/Prompting_Mastery.md

## Model Overview
- **Type:** IMAGE generation (still images only)
- **Engine:** 6B parameter diffusion model, optimized for speed and photorealism
- **Resolution:** Up to 4MP (2048×2048)
- **Variants:** Z-Image (standard, 1-10s), Z-Image Turbo (<5s, $0.005/MP)
- **Use in ShotPilot:** Portrait photography, product shots, rapid iteration, hero frames

## Key Differentiators
- Exceptional photorealism — skin textures, fabric detail, lighting accuracy
- Lightning-fast generation (Turbo: <5 seconds)
- Bilingual text rendering (English + Chinese)
- Lightweight (6B params) — runs locally
- Open-source with permissive commercial licensing
- Extremely cost-effective ($0.005/megapixel)

## Golden Rules

### Rule 1: Use the 4-Layer Formula
```
[Intent] + [Subject] + [Setting] + [Technical Specs]
```
Start with photographic intent (editorial, commercial, documentary), then layer details.

### Rule 2: Lead with Photographic Intent
- BAD: "a woman in a park"
- GOOD: "An editorial portrait of a confident woman in her 30s standing in a sun-dappled urban park, shot on Sony A7R IV with 85mm f/1.4 lens, shallow depth of field, golden hour backlighting creating rim light on her hair."

### Rule 3: Specify Camera & Lens for Realism
Z-Image excels at simulating real photography. Always include:
- Camera body: "Shot on Canon R5," "Nikon Z9," "Hasselblad X2D"
- Lens: "85mm f/1.4," "35mm f/2," "100mm macro"
- Settings: "f/2.8, 1/250s, ISO 200"

### Rule 4: Use Negative Prompts for Cleanup
Unlike FLUX.2, Z-Image supports and benefits from negative prompts:
- "blurry, distorted, extra fingers, deformed hands, watermark, text overlay"

## Prompt Structure
```
[INTENT]: Editorial / Commercial / Documentary / Fashion / Product
[SUBJECT]: Detailed description of who/what
[SETTING]: Location, time of day, atmosphere
[CAMERA]: Body, lens, aperture, focal length
[LIGHTING]: Direction, quality, color temperature
[MOOD]: Emotional tone, energy
[NEGATIVE]: What to avoid
```

### Example Prompt
```
A documentary portrait of an elderly fisherman mending nets on a weathered wooden dock at dawn. Deep wrinkles and sun-weathered skin, wearing a faded blue work shirt. Shot on Leica M11 with 50mm Summilux f/1.4, slightly stopped down to f/2. Soft golden dawn light from the left, misty harbor background with fishing boats in soft focus. Contemplative, quiet dignity.

Negative: blurry, distorted face, extra fingers, watermark, oversaturated
```

## Technical Specs

| Feature | Z-Image | Z-Image Turbo |
|---|---|---|
| **Parameters** | 6B | 6B (optimized) |
| **Speed** | 1-10 seconds | <5 seconds |
| **Resolution** | Up to 4MP | Up to 4MP |
| **Cost** | ~$0.005/MP | ~$0.005/MP |
| **Local Deploy** | Yes | Yes |
| **License** | Open-source, commercial OK | Open-source, commercial OK |

## Portrait Photography Tips
- Define photographic intent FIRST (editorial, beauty, documentary)
- Specify identity details: age, ethnicity, expression, clothing, accessories
- Describe skin: "natural skin texture with pores," "soft retouching"
- Handle hands carefully: keep poses simple, describe hand position explicitly
- Series consistency: reuse seed + similar prompts for character continuity

## Product Photography Tips
- Describe products like a spec sheet: materials, dimensions, colors, finish
- Control lighting: "soft diffused overhead," "dramatic side light," "product on white"
- Text on products: bilingual rendering (English + Chinese)
- Background control: "clean white infinity curve," "lifestyle context on marble"

## Common Mistakes & Fixes

| Mistake | Fix |
|---|---|
| No camera/lens specs | Always include camera, lens, aperture for photorealism |
| Forgetting negative prompts | Use negatives for cleanup (hands, artifacts, watermarks) |
| Vague subjects | Hyper-specific descriptions: age, clothing, expression, pose |
| Expecting video | Z-Image is image-only |
| Style drift from photorealism | Reinforce: "photorealistic, photograph, not illustration" |
| Ignoring Turbo for iteration | Use Turbo for rapid drafts, standard for finals |

## Known Limitations
- Image-only, no video
- Text rendering limited to English + Chinese
- Complex hand poses still challenging
- Very fine detail at small scales may be lost
- Limited style range compared to FLUX.2 (optimized for photorealism)

## Cross-Model Translation
- **To Nano Banana Pro:** Add narrative context, expand to full sentences, add purpose
- **To FLUX.2:** Remove negative prompts, use JSON for complex scenes, add hex colors
- **To Seedream 4.5:** Add text/typography requirements if needed

## Quick Reference Prompt Template
```
[INTENT]: Photography type
[SUBJECT]: Detailed who/what
[SETTING]: Location, time, atmosphere
[CAMERA]: Body, lens, aperture
[LIGHTING]: Direction, quality, temperature
[MOOD]: Emotional tone
[NEGATIVE]: Artifacts to avoid
```
