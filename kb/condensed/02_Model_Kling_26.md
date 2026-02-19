# Kling 2.6 — AI Video Generation with Native Audio

> Last Updated: 2026-02-08 | Source: kling_2.6_prompting_mastery_guide.md

## Model Type
- **VIDEO generation** with native synchronized audio
- First model to generate video + audio simultaneously (no separate audio step)

## Technical Specs

| Feature | Value |
|---------|-------|
| Resolution | 720p–1080p native (upscaling available) |
| Clip Lengths | 5s or 10s |
| Frame Rate | Standard (24 FPS) |
| Audio | Native dialogue, ambience, music, SFX |
| Lip-Sync | Frame-accurate native |
| Cost | $0.07/s audio off, $0.14/s audio on |
| Input Modes | Text-to-Video, Image-to-Video, Motion Control, Multi-reference |
| Frame Control | Start frame, End frame, Multiple keyframes |

## Strengths & Limitations

**Strengths:**
- Motion realism — best-in-class character physics, cloth, hair
- Camera motion — professional handheld shake, dolly, lens distortion
- Identity stability — characters stay consistent across shots
- Audio-visual sync — frame-level sound/visual synchronization
- Scene coherence — stable architecture, matched shadows, consistent lighting
- Fast generation for rapid iteration

**Limitations:**
- Text rendering — struggles with on-screen text/signage (add in post)
- Complex hand interactions — typing, instruments can be inconsistent
- Extreme camera angles — very low/high angles may distort geometry
- Long-form — best at 5–10s clips; stitch for longer sequences

## 3 Generation Modes

### 1. Text-to-Video (T2V)
- Create videos from scratch via text prompt
- Full creative control over subject, action, context, style

### 2. Image-to-Video (I2V)
- Animate static images with motion and camera movement
- Upload image + write motion-focused text prompt
- Visual elements already locked in image; prompt controls motion

### 3. Motion Control (V2V Motion Transfer)
- Transfer choreography from reference video to character image
- Upload: character image + motion reference video + optional environment prompt
- Frame-accurate motion transfer for dance, martial arts, athletics
- Improved hand/finger articulation and orientation control

## Core Prompting Framework — 4 Essentials

Every prompt MUST include:

| Element | What It Is | Example |
|---------|-----------|---------|
| **Subject** | Primary focus (character, object) | "A determined basketball player" |
| **Action** | What subject does | "takes a free-throw shot" |
| **Context** | Setting, environment, time, weather | "in a packed stadium under bright lights" |
| **Style** | Visual aesthetic, genre, tone | "Cinematic, sports ad, aspirational" |

### Optional Modifiers (add after 4 essentials)

| Modifier | Examples |
|----------|---------|
| Camera Movement | "Slow dolly-in," "Pan left to right," "Tracking shot from behind" |
| Camera Angle | "Low angle," "High angle," "Eye level," "Dutch angle" |
| Camera Framing | "Close-up," "Medium shot," "Wide shot," "Extreme close-up" |
| Lighting | "Volumetric fog," "Golden hour," "Harsh overhead," "Rim lighting" |
| Lens Effects | "Shallow depth of field," "Rack focus," "Motion blur," "Lens flare" |
| Pacing | "Slow-motion," "Real-time," "Dramatic timing" |

## Camera Movement Mastery

**4 Purposes:** Show Action, Reveal Information, Show Emotion, Show Perspective

### Pan & Tilt
- **Slow Pan:** suspense, gradual reveal — use "slowly," "deliberately"
- **Fast Pan (Whip):** surprise, energy, shock
- **Tilt Up:** power, dominance — subject appears powerful
- **Tilt Down:** vulnerability — subject appears small/weak
- Always specify emotional state + what is being revealed

### Push In & Pull Out (Dolly)
- **Slow Push-In:** intimacy, realization — specify speed ("very slow," "gradual")
- **Fast Push-In:** urgency, shock, immediacy
- **Slow Pull-Out:** isolation, broader context
- **Fast Pull-Out:** sudden revelation, overwhelming scale
- Describe emotional progression + focus changes

### Tracking & Trucking
- **Tracking (Following):** immersion, tension — walking beside character
- **Tracking (Leading):** anticipation — wondering where character goes
- **Trucking (Parallel):** observational — car chases, action
- Specify relationship: "parallel," "following from behind," "leading from front"
- Note framing: "locked in center of frame"

### Boom & Crane
- **Boom Up:** reveal scale (intimate to epic)
- **Boom Down:** focus on detail (epic to intimate)
- **Crane Shot:** establish location, cinematic spectacle
- Describe vertical movement + how subject/environment relationship changes

### Arc Shot
- **Slow Arc:** multiple angles, builds tension
- **Fast Arc:** disorientation, chaos, energy
- Specify arc start/end positions + what is revealed

## Native Audio Generation

### 4 Audio Types

**1. Dialogue**
- Frame-accurate lip-sync, natural voice, emotional tone matching
- Syntax: `[Character] says, "[words]" with [emotion]`
- Example: `A woman in a coffee shop says, "I can't believe you're here!" with surprise and joy.`

**2. Ambient Sound**
- Environmental audio (city noise, nature, room tone)
- Describe environment sounds matching visual context
- Example: `Cars honking, people talking, footsteps on pavement.`

**3. Sound Effects (Foley)**
- Frame-level sync: impacts, footsteps, breaking, splashing
- Specify exact timing: `The sound of breaking glass occurs at the exact moment of impact.`

**4. Music**
- Underscore, mood music, genre-specific styles
- Example: `Soft, romantic piano music plays.`

### Audio Prompting Best Practices

| Rule | BAD | GOOD |
|------|-----|------|
| Be specific about type | "with sound" | "with ambient city noise and distant traffic" |
| Describe emotional tone | "she speaks" | "she speaks with urgency and fear" |
| Specify timing for SFX | "glass breaks" | "glass breaks at the exact moment it hits the floor" |
| Layer audio elements | single element | "Dialogue: 'We need to go now.' Ambient: wind howling. Music: tense orchestral underscore." |

### Hierarchical Audio Mixing
Layer with priority:
- Primary: Dialogue
- Secondary: Ambient
- Tertiary: Music/Underscore

## Advanced Techniques

### Start/End Frame Control
1. Provide/generate a start frame (hero image)
2. Provide/generate an end frame
3. Describe the transition in prompt
- Model interpolates smoothly between keyframes

### Multi-Reference Fusion
Combine: Character Photo (identity) + Location Reference (environment) + Style Sample (aesthetic) + Motion Clip (movement)
- Prompt pattern: `[Character from Ref A] walks through [Location from Ref B] in the style of [Ref C].`

### Emotion Interpolation
- Describe start + end emotional states; model interpolates between them
- Pattern: `Start: [emotion]. End: [emotion]. Camera [movement] as expression shifts.`

## 7 Best Practices

1. **Motivated movement** — every camera move serves narrative purpose (reveal, emotion, action, perspective). Never "moves around randomly"
2. **Specify pacing/speed** — slow = tension/intimacy, fast = urgency/shock. Always include "slowly," "gradually," "quickly"
3. **Describe emotional progression** — give clear emotional direction, not just physical description
4. **Layer visual + audio** — rich sensory details: engine roaring + tires screeching + tracking shot
5. **Use start/end frames** for complex shots — don't hope for perfect framing; provide hero frames
6. **Iterate on motion quality** — regenerate until both visuals AND motion feel cinematic
7. **Keep clips short and focused** — one 5–10s shot with one clear camera movement; stitch for longer sequences

## 6 Common Mistakes + Fixes

| Problem | Cause | Fix |
|---------|-------|-----|
| Camera feels random | No narrative purpose | Connect every move to reveal/emotion/action/perspective |
| Character identity drifts | Extreme angles, fast movement | Use strong reference image, smooth gradual movements, start/end frames |
| Audio doesn't match visuals | Vague audio description | Be explicit about timing ("at exact moment"), describe audio in detail, layer elements |
| Motion feels floaty/unnatural | Missing physics cues | Specify weight: "heavy footsteps," "cloth fluttering in wind"; use reference videos for complex motion |
| Scene coherence breaks | Extreme camera stress | Describe lighting consistently, avoid extreme movements, use start/end frames to anchor |
| Text/fine details garbled | Model limitation | Avoid on-screen text (add in post); keep fine details simple and bold |

## Integration Workflows

### Image-First Pipeline
Generate hero frame (Cinema Studio/Nano Banana/Midjourney) → Upscale (Topaz 4x) → Upload as Kling start frame → Prompt camera + action → Generate 5–10s clip

### Multi-Shot Assembly
Plan shot list (5–10 shots, 5–10s each) → Generate hero frames → Generate shots with consistent style → Assemble in editor → Add transitions, color grade, final audio

### External Audio Replacement
Generate with Audio Off ($0.07/s) → Record custom dialogue/music separately → Sync in editor

### Cross-Model Character Consistency
Generate character ref sheet (front/side/back) → Use same ref across all shots → Maintain consistent lighting/angles → Use start/end frames to anchor identity
