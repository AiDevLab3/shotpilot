# Seedance 1.5 Pro

> **Official Model Name:** Seedance 1.5 Pro | **Developer:** ByteDance
> **Type:** VIDEO generation with native audio | **Last Updated:** 2026-02-19 | Source: seedance_1_5_pro/Prompting_Mastery.md

## Model Overview
- **Type:** VIDEO generation with native audio-visual joint generation
- **Engine:** ByteDance's Seedance model — treats sound and picture as unified system
- **Resolution:** Up to 1080p
- **Input Modes:** Text-to-Video, Image-to-Video (supports start & end frame)
- **Use in ShotPilot:** Dialogue-driven content, character performances, commercials, multi-language content

## Key Differentiators
- Native audio-visual joint generation (dialogue, music, SFX, ambient simultaneously)
- Best-in-class lip-sync across multiple languages (English, Spanish, Mandarin, dialects)
- Emotional storytelling: auto-fills narrative beats, maintains emotional coherence
- Human-optimized: prioritizes facial landmarks and micro-expressions
- Film-grade cinematography: complex camera movements, atmospheric depth
- Start + end frame support for controlled transitions

## Golden Rules

### Rule 1: Lead with Character and Emotion
Seedance 1.5 Pro is human-optimized. Lead prompts with character description and emotional state:
- "A nervous young man rehearsing his wedding speech in front of a bathroom mirror, voice trembling with excitement and anxiety"

### Rule 2: Audio Is Integral, Not Added
Describe audio as part of the scene narrative, not as a separate layer:
- "She laughs mid-sentence, her voice echoing slightly in the empty gallery"
- "He speaks in a hushed whisper, 'We need to leave now,' footsteps approaching from behind"

### Rule 3: Specify Language for Lip-Sync
For non-English content, explicitly state the language:
- "Speaking in conversational Mandarin with Beijing accent"
- "Dialogue in Spanish with Mexican regional dialect"

### Rule 4: Use Image Anchors for Identity
For character consistency, provide start frame (and optionally end frame) as image references.

## Prompt Structure
```
[CHARACTER]: Physical description, emotional state, clothing
[ACTION]: What they're doing, how they're moving
[DIALOGUE]: Spoken words with emotional direction
[ENVIRONMENT]: Setting, time, atmosphere
[CAMERA]: Movement, framing, angle
[AUDIO]: Non-dialogue sounds — ambient, music, SFX
[LANGUAGE]: If non-English
```

### Example Prompt
```
A confident female chef in a pristine white coat stands in a bustling restaurant kitchen, plating a dessert with precise, deliberate movements. She looks up at the camera and says "This is what passion looks like" with a warm, proud smile. Steam rises from nearby pots, kitchen staff move in the background. Medium shot slowly pushing in to close-up on her face. Clattering of pans, sizzling on the grill, soft jazz from the dining room.
```

## Lip-Sync Capabilities

| Language | Quality | Notes |
|---|---|---|
| **English** | Excellent | Native-quality sync |
| **Mandarin** | Excellent | Regional dialects supported |
| **Spanish** | Very Good | Multiple regional variants |
| **Other** | Good | Phoneme-accurate reshaping |

## Camera Movement
- Track, dolly, crane, pan, tilt, orbit, steadicam
- Shot types: wide, medium, close-up, extreme close-up, over-shoulder
- Angles: low, high, eye-level, Dutch
- Focus: shallow DOF, rack focus, follow focus

## Common Mistakes & Fixes

| Mistake | Fix |
|---|---|
| Neglecting character emotion | Lead with emotional state — model is human-optimized |
| Audio as afterthought | Weave audio into narrative description |
| No language specification | State language explicitly for lip-sync accuracy |
| Extreme camera movements | Keep camera moves moderate — extreme can stress identity |
| Complex on-screen text | Avoid — text rendering is limited |
| Fine motor skills | Simplify hand interactions (typing, instruments) |

## Known Limitations
- Text rendering in video is limited
- Fine motor skills (typing, playing instruments) inconsistent
- Extreme camera movements may stress identity stability
- Abstract/experimental visuals not its strength
- Best for human-centric, dialogue-driven content

## Cross-Model Translation
- **To VEO 3.1:** Similar audio capabilities; add resolution options, longer duration
- **To Grok Imagine:** Similar audio framework; use 5W structure
- **To Wan 2.6:** Similar audio-visual synthesis; use 3-pillar framework

## Quick Reference Prompt Template
```
[CHARACTER]: Description + emotional state
[ACTION]: Movement + body language
[DIALOGUE]: "Spoken words" with emotional direction
[ENVIRONMENT]: Setting + atmosphere
[CAMERA]: Movement + framing + angle
[AUDIO]: Ambient + music + SFX
[LANGUAGE]: Specify if non-English
```
