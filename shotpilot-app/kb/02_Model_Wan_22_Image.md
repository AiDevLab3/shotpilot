# Wan 2.2 Image (⚠️ Legacy — see Wan 2.6)

> **Official Model Name:** Wan 2.2 Text-to-Image Realism | **Developer:** Alibaba / Wan AI
> **Type:** IMAGE generation | **Last Updated:** 2026-02-19 | Source: wan_2_2_image/Prompting_Mastery.md
> **⚠️ LEGACY:** Superseded by Wan 2.6 (`wan/v2.6/text-to-image`, `wan/v2.6/image-to-image`). See 02_Model_Wan_26.md.

## Model Overview
- **Type:** IMAGE generation (still images only)
- **Engine:** Wan 2.2 — specialized photorealistic image generation
- **Resolution:** Up to 1280×720 and beyond
- **Specialty:** Photorealistic scenes, authentic human subjects, natural environments
- **Use in ShotPilot:** Lifestyle photography, group portraits, marketing visuals, concept visualization

## Key Differentiators
- Optimized specifically for photorealism (photograph-like outputs)
- Excellent human rendering: natural skin tones, expressions, group compositions
- Custom dimensions: precise width/height control for any aspect ratio
- Built-in prompt enhancer: auto-refines and expands descriptions
- Reproducible results via seed parameter

## Golden Rules

### Rule 1: Think Like a Photographer
Wan 2.2 Image is tuned for photo-realism. Frame prompts as if directing a photo shoot:
- "Lifestyle editorial of three friends sharing brunch on a sunlit patio, laughing naturally, shot on Nikon Z8 with 35mm f/1.8"

### Rule 2: Use the Prompt Enhancer
Enable the built-in prompt enhancer for automatic expansion of terse descriptions. It adds photographic details you might miss.

### Rule 3: Specify Group Dynamics
For multi-person shots, describe relationships and interactions:
- "Two siblings, mid-20s, arms around each other's shoulders, genuine smiles, matching denim jackets"

### Rule 4: Seeds for Consistency
Use the seed parameter to recreate exact outputs or explore controlled variations (same seed + tweaked prompt).

## Prompt Structure
```
[SUBJECT]: People/objects with specific details
[INTERACTION]: How subjects relate to each other
[SETTING]: Location, time, atmosphere
[CAMERA]: Body, lens, settings
[LIGHTING]: Natural/studio, direction, quality
[MOOD]: Emotional tone
```

### Example Prompt
```
A candid lifestyle photograph of a young couple cooking together in a bright, modern kitchen. She's stirring a pot while he chops vegetables, both smiling. Morning sunlight streams through large windows. Shot on Sony A7 III with 35mm f/2 lens, natural light, slightly warm white balance. Relaxed, joyful, authentic mood.
```

## Technical Specs

| Feature | Specification |
|---|---|
| **Resolution** | Up to 1280×720+ |
| **Aspect Ratios** | Custom width×height |
| **Prompt Enhancer** | Built-in auto-expansion |
| **Seed Control** | Reproducible results |
| **Specialty** | Photorealism, humans |

## Strengths
- Multi-person compositions with natural interactions
- Authentic lifestyle and event photography
- Natural outdoor settings and environments
- Consistent skin tones and expressions across subjects
- Group shots with believable spatial relationships

## Common Mistakes & Fixes

| Mistake | Fix |
|---|---|
| Abstract/artistic prompts | Focus on photorealistic, real-world scenes |
| Ignoring group dynamics | Describe relationships, interactions, body language |
| No camera specs | Always include camera, lens, lighting for realism |
| Generic descriptions | Be specific: age, clothing, expression, pose |
| Not using seed for series | Lock seed for consistent character appearance |
| Skipping prompt enhancer | Enable it for automatic detail expansion |

## Known Limitations
- Optimized for photorealism — not ideal for stylized/artistic content
- Resolution ceiling lower than some competitors (1280×720 base)
- Complex hand interactions can be inconsistent
- Text rendering in images limited
- Less versatile than models like FLUX.2 or Nano Banana Pro

## Cross-Model Translation
- **To Nano Banana Pro:** Add narrative context, camera/lens specs, purpose statement
- **To Z-Image:** Very similar prompt style; Z-Image offers faster generation, bilingual text
- **To FLUX.2:** Remove photorealism focus if needed; add JSON structure for complex scenes

## Quick Reference Prompt Template
```
[SUBJECT]: Specific people/objects with details
[INTERACTION]: Relationships, body language, dynamics
[SETTING]: Location, time of day, atmosphere
[CAMERA]: Body, lens, aperture, focal length
[LIGHTING]: Type, direction, quality
[MOOD]: Emotional tone, energy
[SEED]: For reproducibility (optional)
```
