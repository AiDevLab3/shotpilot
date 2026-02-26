# Sora 2

> **Official Model Name:** Sora 2 / Sora 2 Pro | **Developer:** OpenAI
> **Type:** VIDEO generation with synchronized audio | **Last Updated:** 2026-02-19 | Source: sora_2/Prompting_Mastery.md

## Model Overview
- **Type:** VIDEO generation with native audio (dialogue, SFX, ambient)
- **Engine:** OpenAI multimodal diffusion model
- **Variants:** sora-2 (fast/iteration), sora-2-pro (production quality)
- **Resolution:** 1280×720 (landscape), 720×1280 (portrait), sora-2-pro adds 1024×1792/1792×1024
- **Duration:** 4, 8, or 12 seconds
- **Use in ShotPilot:** Cinematic video generation, audio-visual storytelling, rapid iteration

## Key Differentiators
- Deep 3D spatial understanding and perspective consistency
- Natural motion physics (weight, momentum, interactions)
- Synchronized audio generation (dialogue + SFX + ambient)
- Remix functionality for iterative refinement
- Two-tier system: fast iteration (sora-2) vs production quality (sora-2-pro)
- Image-to-video with reference image anchoring

## Golden Rules

### Rule 1: Write Like a Screenwriter
Sora 2 responds to narrative, cinematic descriptions — not keywords.
- BAD: "car chase, night, rain, neon, fast, exciting"
- GOOD: "A black muscle car drifts around a rain-slicked corner in downtown Tokyo at night. Neon signs streak across the wet pavement as the camera tracks alongside at wheel height. Tires screech against asphalt, engine roaring."

### Rule 2: Specify Duration Strategically
- 4s: Single action, reaction shot, establishing shot
- 8s: Complete mini-scene with beginning and end
- 12s: Multi-beat narrative with camera movement changes

### Rule 3: Use Remix for Refinement
Generate first draft with sora-2 (fast), then remix to adjust specific elements while preserving what works. More efficient than re-generating from scratch.

### Rule 4: Anchor with Images
Use reference images as first-frame anchors to lock character design, wardrobe, or setting — then animate with text prompt.

## Prompt Structure
```
[SCENE DESCRIPTION]: Narrative description of what's happening
[CAMERA]: Movement, angle, framing
[LIGHTING]: Quality, direction, color temperature
[AUDIO]: Dialogue, SFX, ambient, music
[STYLE]: Film reference, color grading, aesthetic
```

### Example Prompt
```
A young woman in a vintage yellow dress walks through a sunlit field of wildflowers, reaching out to touch the tall grass as it sways in a gentle breeze. The camera follows her from behind in a slow steadicam movement, gradually rising to reveal rolling hills in the distance. Golden hour light creates a warm backlit glow around her silhouette. Birds chirp softly, grass rustles in the wind, and her footsteps crunch on dry earth. Warm, nostalgic color palette reminiscent of Terrence Malick's Days of Heaven.
```

## API Parameters

| Parameter | Values | Notes |
|---|---|---|
| **model** | "sora-2", "sora-2-pro" | Required |
| **prompt** | Text description | Required |
| **size** | "1280x720", "720x1280", etc. | Optional |
| **seconds** | "4", "8", "12" | Default: "4" |
| **input_reference** | Image file | Optional, first-frame anchor |
| **remix_id** | Previous video ID | For iterative refinement |

## Cinematography Control
- **Camera Movement:** tracking, dolly, crane, pan, tilt, steadicam, handheld
- **Shot Types:** wide establishing, medium, close-up, extreme close-up, over-the-shoulder
- **Depth:** shallow DOF with bokeh, deep focus, rack focus between subjects
- **Angles:** low-angle (power), high-angle (vulnerability), Dutch angle (unease)

## Audio Prompting
- **Dialogue:** Use quotes with character attribution and emotion
- **SFX:** Describe in sync with visual actions
- **Ambient:** Match environment ("bustling café," "quiet forest at dawn")
- **Music:** Specify genre, mood, instruments, tempo

## Common Mistakes & Fixes

| Mistake | Fix |
|---|---|
| Keyword lists instead of narrative | Write complete sentences with context |
| Not specifying duration | Always set seconds based on scene complexity |
| Ignoring audio capabilities | Include [AUDIO] layer — Sora generates sound |
| Re-generating instead of remixing | Use remix_id to iterate on good takes |
| Too many actions for duration | One primary action per 4s segment |
| Vague lighting ("cinematic") | Specify direction, quality, color temperature |

## Known Limitations
- Maximum 12 seconds per generation (no extension feature)
- Maximum resolution 1280×720 for sora-2 base
- Complex multi-character interactions can break consistency
- Text rendering in videos is unreliable
- Cannot do precise motion transfer from reference videos
- Content restrictions limit some creative scenarios

## Cross-Model Translation
- **To VEO 3.1:** Add 4K resolution option, longer duration (up to 60s), use 5-part formula
- **To Grok Imagine:** Similar audio framework; adjust for Grok's 5W structure
- **To Kling 2.6:** Remove audio cues, focus on visual/motion description

## Quick Reference Prompt Template
```
[SCENE]: Narrative description of action and setting
[CAMERA]: Movement type, angle, framing, lens
[LIGHTING]: Direction, quality, color temperature
[AUDIO]: Dialogue, SFX, ambient, music
[STYLE]: Film reference, color grading
[DURATION]: 4s / 8s / 12s based on complexity
[MODEL]: sora-2 (iteration) or sora-2-pro (final)
```
