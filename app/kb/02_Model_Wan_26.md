# Wan 2.6

> **Official Model Name:** Wan 2.6 | **Developer:** Alibaba (Kuaishou)
> **Type:** VIDEO generation with native audio-visual synthesis | **Last Updated:** 2026-02-19 | Source: wan_2_6/Prompting_Mastery.md

## Model Overview
- **Type:** VIDEO generation with simultaneous audio-visual generation
- **Engine:** Mixture of Experts (MoE) architecture with unified multimodal latent space
- **Resolution:** 1080p at 24 FPS
- **Duration:** 5-10 seconds optimal coherence window
- **Modes:** Text-to-Video, Image-to-Video, Reference-to-Video
- **Use in ShotPilot:** Audio-visual scenes, multi-shot generation, character-consistent clips

## Key Differentiators
- First model with true simultaneous audio-visual generation (not post-added)
- MoE architecture: specialized experts for landscapes, portraits, fluid dynamics, etc.
- Exceptional temporal stability (5-10 second coherence without morphing)
- Cross-modal understanding (audio events in text produce matching visuals + sound)
- Multi-shot generation from single prompts
- Native multimodal processing (text + image + audio in unified space)

## Golden Rules

### Rule 1: Use the 3-Pillar Framework
Every Wan 2.6 prompt should address three pillars:
1. **Visual Scene** — What you see (subject, environment, lighting)
2. **Motion Dynamics** — How things move (camera, subject motion, physics)
3. **Audio Landscape** — What you hear (dialogue, SFX, ambient, music)

### Rule 2: Describe Audio as Part of the Scene
Wan 2.6 generates audio natively — describe sounds as naturally as visuals:
- "Footsteps echoing in empty hallway" → produces both visual walking AND synchronized footstep sounds with reverb
- "Thunder and lightning" → produces coordinated flash, rumble, and atmospheric changes

### Rule 3: Stay in the 5-10 Second Sweet Spot
Optimal temporal consistency at 5-10 seconds. Beyond this, character identity and object permanence may drift.

### Rule 4: Leverage MoE Strengths
The model excels when combining domains: a character (portrait expert) in a landscape (landscape expert) with fire (fluid dynamics expert). Mix elements confidently.

## Prompt Structure
```
[VISUAL]: Subject, environment, lighting, composition
[MOTION]: Camera movement, subject action, physics interactions
[AUDIO]: Dialogue, SFX, ambient sound, music
[STYLE]: Film reference, color grading, aesthetic
```

### Example Prompt
```
A blacksmith hammers a glowing orange blade on an anvil in a medieval forge. Sparks fly with each strike as firelight flickers across stone walls. The camera slowly orbits around the workbench at shoulder height. The rhythmic clang of hammer on metal, the roar of the forge bellows, and distant crickets outside. Warm, amber color grading with deep shadows, reminiscent of Barry Lyndon's candlelit scenes.
```

## Generation Modes

| Mode | Input | Best For |
|---|---|---|
| **Text-to-Video** | Text prompt only | Original scene creation |
| **Image-to-Video** | Image + text prompt | Animating hero frames, consistent characters |
| **Reference-to-Video** | Reference image(s) + text | Style/identity transfer, consistent elements |

## Camera Control
- **Movement:** dolly, tracking, crane, orbit, pan, tilt, steadicam, handheld
- **Shot Types:** extreme wide, wide, medium, close-up, extreme close-up
- **Angles:** low-angle, high-angle, eye-level, Dutch, bird's eye
- **Temporal:** slow reveal, quick cut, gradual zoom

## Audio-Visual Sync Tips
- Describe sounds tied to visual events: "glass shatters as the ball hits"
- Environmental audio matches setting automatically: "busy marketplace" implies crowd murmur
- Music direction: specify genre, instruments, tempo, energy level
- Dialogue: use quotes with speaker attribution and emotional direction

## Common Mistakes & Fixes

| Mistake | Fix |
|---|---|
| Ignoring audio pillar | Always include audio description — it generates sound |
| Clips longer than 10s | Keep to 5-10s for temporal consistency |
| Static scene descriptions | Include motion dynamics — camera AND subject movement |
| Conflicting expert domains | Let MoE handle complexity — mix elements confidently |
| No reference images for characters | Use Image-to-Video mode for character consistency |
| Vague environment descriptions | Be specific: "medieval stone forge with exposed beams" not "old workshop" |

## Known Limitations
- Temporal consistency degrades beyond 10 seconds
- Complex multi-character dialogue can desync
- Fine motor skills (typing, playing instruments) inconsistent
- Text rendering in video unreliable
- Very fast motion can produce artifacts

## Cross-Model Translation
- **To VEO 3.1:** Add resolution options (4K), use 5-part formula, longer duration possible
- **To Sora 2:** Similar audio framework, adjust for Sora's remix workflow
- **To Kling 2.6:** Remove audio cues, focus on visual motion description

## Quick Reference Prompt Template
```
[VISUAL]: Subject + environment + lighting + composition
[MOTION]: Camera movement + subject action + physics
[AUDIO]: Dialogue + SFX + ambient + music
[STYLE]: Color grading, film reference, aesthetic
[MODE]: Text-to-Video / Image-to-Video / Reference-to-Video
[DURATION]: 5-10s optimal
```
