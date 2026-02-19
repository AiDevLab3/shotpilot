# Minimax Hailuo 02

> **Official Model Name:** Minimax Hailuo 02 (codename "Kangaroo") | **Developer:** MiniMax
> **Type:** VIDEO generation | **Last Updated:** 2026-02-19 | Source: minimax_hailuo_02/Prompting_Mastery.md

## Model Overview
- **Type:** VIDEO generation (no native audio)
- **Engine:** NCR (Noise-aware Compute Redistribution) architecture
- **Resolution:** Native 1080p
- **Ranking:** #2 globally on Artificial Analysis Video Arena
- **Cost:** ~30 credits per generation
- **Use in ShotPilot:** Stylized content, smooth motion, experimental visuals, social media

## Key Differentiators
- Director-style camera controls (industry first)
- Best-in-class physics mastery (viral "Cat Olympics" demos)
- Exceptional motion quality and smoothness
- Outstanding artistic style versatility
- NCR architecture: 2.5x efficiency, dynamic resource allocation
- Affordable pricing for experimentation
- Supports negative prompting

## Golden Rules

### Rule 1: Use Director Control Toolkit
Hailuo 02 introduced director-style camera controls. Use them:
- "Camera: slow dolly-in, eye-level, 85mm equivalent"
- "Camera: crane shot ascending from ground to bird's eye"
- "Camera: orbiting 360° around subject at waist height"

### Rule 2: Motion Keywords Are Your Superpower
Hailuo excels at motion. Use specific motion descriptors:
- "Fluid cascading motion," "explosive burst," "gentle swaying"
- "Slow-motion water splash with individual droplets visible"
- "Hair billowing in wind with strand-level detail"

### Rule 3: Lean Into Artistic Styles
Hailuo 02 is the creative/artistic specialist. Don't fight it:
- "Stop-motion claymation style with visible fingerprints on clay"
- "Anime cel-shaded with dynamic speed lines"
- "Oil painting coming to life, visible brush strokes in motion"

### Rule 4: Use Negative Prompts
Unlike FLUX.2, Hailuo supports and benefits from negative prompting:
- "static, still, frozen, blurry, distorted, morphing faces"

## Prompt Structure
```
[SUBJECT]: Who/what is in the scene
[ACTION]: Motion and dynamics (be specific!)
[CAMERA]: Director controls — movement, angle, framing
[STYLE]: Artistic aesthetic (Hailuo's strength)
[ENVIRONMENT]: Setting, lighting, atmosphere
[NEGATIVE]: What to avoid
```

### Example Prompt
```
A samurai warrior unsheathes a katana in a bamboo forest at twilight. Cherry blossom petals drift through the air in slow motion. Camera: slow tracking shot from left to right at eye level, shallow depth of field on the blade. Style: cinematic with subtle anime influence, desaturated warm tones. Rain begins falling gently, each drop catching the last light.

Negative: static, blurry, morphing face, distorted hands
```

## Camera Director Controls

| Control | Keywords |
|---|---|
| **Movement** | dolly, tracking, crane, orbit, pan, tilt, zoom, push-in, pull-out |
| **Speed** | slow, medium, fast, accelerating, decelerating |
| **Angle** | low-angle, high-angle, eye-level, Dutch, bird's eye, worm's eye |
| **Framing** | extreme wide, wide, medium, close-up, extreme close-up |
| **Focus** | shallow DOF, deep focus, rack focus, follow focus |

## Motion Specialties
- Fluid dynamics: water, smoke, fire, fog (physics-accurate)
- Cloth/fabric: silk, hair, capes, flags (strand-level detail)
- Particle effects: sparks, dust, snow, petals, debris
- Physics interactions: collisions, gravity, momentum
- Character motion: martial arts, dance, athletics

## Artistic Style Keywords
- Photorealistic, hyperrealistic
- Anime/cel-shaded, manga-inspired
- Oil painting, watercolor, impressionist
- Stop-motion, claymation
- Noir, cyberpunk, steampunk
- Retro film grain, VHS aesthetic
- Miniature/tilt-shift

## Common Mistakes & Fixes

| Mistake | Fix |
|---|---|
| Generic camera ("cinematic") | Use specific director controls with angle + movement + speed |
| Not leveraging motion strengths | Add detailed motion descriptors — Hailuo's superpower |
| Fighting the artistic bias | Lean into stylized looks; use style keywords |
| Forgetting negative prompts | Add negatives for face/hand stability |
| Expecting native audio | Hailuo 02 is video-only; add audio in post |
| Overly complex scenes | Focus on one hero action with supporting elements |

## Known Limitations
- No native audio generation (video only)
- Text rendering in video unreliable
- Very long clips may lose consistency
- Complex multi-character dialogue scenes challenging
- Fine motor skills (typing, writing) inconsistent

## Cross-Model Translation
- **To VEO 3.1:** Add audio cues, use 5-part formula, specify resolution/duration
- **To Kling 2.6:** Similar visual framework; Kling offers motion control features
- **To Sora 2:** Add audio layer, adjust for Sora's remix workflow

## Quick Reference Prompt Template
```
[SUBJECT]: Who/what
[ACTION]: Specific motion and dynamics
[CAMERA]: Director controls (movement + angle + framing + speed)
[STYLE]: Artistic aesthetic
[ENVIRONMENT]: Setting, lighting, atmosphere
[NEGATIVE]: Artifacts, static, distortion to avoid
```
