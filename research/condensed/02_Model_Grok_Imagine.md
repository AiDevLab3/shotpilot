# Grok Imagine

> **Official Model Name:** Grok Imagine | **Developer:** xAI
> **Type:** VIDEO + IMAGE generation with native audio | **Last Updated:** 2026-02-19 | Source: grok_imagine/Prompting_Mastery.md

## Model Overview
- **Type:** VIDEO generation with native synchronized audio; also IMAGE generation/editing
- **Engine:** xAI's multimodal generation model
- **Resolution:** 1080p native
- **Clip Lengths:** 5s, 10s, 15s (extendable)
- **Use in ShotPilot:** Cinematic storytelling with dialogue, music videos, commercials

## Key Differentiators
- Native audio-visual synthesis (dialogue, music, SFX generated simultaneously)
- Advanced camera control via natural language
- Multi-modal input: Text-to-Video, Image-to-Video, Video-to-Video
- Frame-accurate lip-syncing
- High-fidelity 1080p output

## Golden Rules

### Rule 1: Use the "Five Ws" Framework
Structure every prompt around: Who, What, When, Where, Why (mood/tone).

### Rule 2: Describe Audio Explicitly
Unlike silent models, Grok Imagine generates audio. Describe what you want to HEAR:
- "The sound of rain on a tin roof, distant thunder rolling"
- "She whispers 'I'll never forget this place' with a trembling voice"
- "Upbeat jazz piano plays softly in the background"

### Rule 3: Camera Direction is Natural Language
- "Slow dolly-in from wide shot to close-up on her face"
- "Handheld tracking shot following the character through the crowd"
- "Static low-angle shot looking up at the building"

### Rule 4: Layer Your Prompts
Build complexity in layers: establish scene → add action → add audio → add mood.

## Prompt Structure
```
[WHO] is [WHAT] [WHEN] in [WHERE], creating a [WHY/MOOD] mood.
[CAMERA]: Camera movement and framing
[AUDIO]: Dialogue, music, sound effects, ambient sound
[STYLE]: Visual aesthetic, color grading, film reference
```

### Example Prompt
```
A tired detective in a rumpled trenchcoat examines evidence at midnight in a dimly-lit forensics lab, creating a tense, noir mood. Slow push-in from medium to close-up on his hands. The hum of fluorescent lights, the scratch of his pen on paper, and distant sirens outside. Desaturated color palette with harsh overhead lighting, reminiscent of Fincher's Zodiac.
```

## Technical Specs

| Feature | Specification |
|---|---|
| **Resolution** | 1080p native |
| **Clip Lengths** | 5s, 10s, 15s |
| **Audio** | Native dialogue, music, SFX, ambient |
| **Input Modes** | Text-to-Video, Image-to-Video, Video-to-Video |
| **Lip-Sync** | Frame-accurate |
| **API** | xAI API |

## Camera Control Keywords
- **Movement:** dolly, tracking, crane, pan, tilt, zoom, orbit, steadicam
- **Shot Types:** extreme wide, wide, medium, close-up, extreme close-up
- **Angles:** low-angle, high-angle, eye-level, Dutch angle, bird's eye, worm's eye
- **Lens Effects:** shallow DOF, deep focus, rack focus, lens flare, anamorphic

## Audio Prompting
- **Dialogue:** Use quotes with emotional direction: `"I can't do this anymore," she says, voice breaking`
- **Music:** Specify genre, tempo, instruments: "melancholic cello solo, slow tempo"
- **SFX:** Time to visual events: "glass shatters as the ball hits the window"
- **Ambient:** Environmental sounds: "busy café atmosphere, clinking cups, murmured conversation"

## Common Mistakes & Fixes

| Mistake | Fix |
|---|---|
| Forgetting audio direction | Always include [AUDIO] layer — the model generates sound |
| Generic camera ("cinematic shot") | Specify exact movement, angle, lens |
| Overloading a single prompt | Focus on one key action per clip |
| No emotional context | Add mood/tone — it affects both visuals AND audio |
| Complex hand interactions | Simplify hand actions, keep them minimal |

## Known Limitations
- Complex hand/finger interactions can be inconsistent
- On-screen text rendering is unreliable
- Can be more expensive than competitors for short clips
- Not ideal for abstract/experimental visuals without narrative
- Extreme slow-motion/time-lapse not well supported

## Cross-Model Translation
- **To VEO 3.1:** Similar audio capabilities; add resolution/duration specs, use 5-part formula
- **To Sora 2:** Similar structure; adjust for Sora's remix workflow and API params
- **To Kling 2.6:** Remove audio cues (Kling is silent), focus on visual description

## Quick Reference Prompt Template
```
[WHO]: Character description
[WHAT]: Action/movement
[WHEN]: Time period, time of day
[WHERE]: Location/setting
[WHY]: Mood/emotional tone
[CAMERA]: Movement, angle, framing, lens
[AUDIO]: Dialogue, music, SFX, ambient
[STYLE]: Color palette, film reference, aesthetic
```
