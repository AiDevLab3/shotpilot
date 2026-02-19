# Kling 3.0 — AI Video Generation with Multi-Shot Intelligence

> Last Updated: 2026-02-19 | Source: kling_3_0/Prompting_Mastery.md

## Model Type
- **VIDEO generation with Multi-Shot Intelligence + Native Audio**
- Generate 2–6 shots with cuts, transitions, and continuous narrative in one API call
- Elements 3.0 for character/object consistency across shots
- Voice cloning for up to 2 custom character voices

## Technical Specs

| Feature | Value |
|---------|-------|
| Resolution | 720p–1080p native |
| Clip Lengths | 3–15s (per-second control) |
| Frame Rate | 24 FPS / 30 FPS |
| Aspect Ratios | 16:9, 9:16, 1:1 |
| Audio | Native multilingual (EN, ZH, JA, KO, ES) with code-switching |
| Voice Control | Up to 2 custom voice IDs per generation |
| Lip-Sync | Frame-accurate native |
| Input Modes | Text-to-Video, Image-to-Video (with Elements), O3 Frame Interpolation |
| Frame Control | Start Frame + End Frame |
| Multi-Shot | 2–6 shots per generation via multi_prompt |
| Elements | Elements 3.0 — Identity Lock, Object Lock, Style Lock |
| Cost | $0.224/s (audio off), $0.336/s (audio on), $0.392/s (voice control) |

## Strengths & Limitations

**Strengths:**
- Multi-Shot Intelligence — edited sequences with cuts in one API call
- Extended Duration — up to 15 seconds (granular per-second)
- Elements 3.0 — superior identity/object/style locking via reference images + video
- Voice Cloning — custom voices with <<<voice_1>>> and <<<voice_2>>> syntax
- Audio-visual sync — frame-level synchronization of dialogue, Foley, ambient, music
- Narrative coherence across cuts

**Limitations:**
- Slower render time than Kling 2.6
- Higher cost (3x vs V2.6)
- Text rendering struggles (add in post)
- Complex hand interactions inconsistent
- Occasional "sliding" in multi-character scenes
- Transitions between shots are hard cuts only (dissolves in post)

## API Endpoints (fal.ai exclusive)

| Endpoint | Model ID |
|----------|----------|
| V3 Pro T2V | `fal-ai/kling-video/v3/pro/text-to-video` |
| V3 Pro I2V | `fal-ai/kling-video/v3/pro/image-to-video` |
| O3 Standard I2V | `fal-ai/kling-video/o3/standard/image-to-video` |

## 5-Layer Prompt Structure

Every prompt MUST follow this order for best results:

| Layer | Purpose | Example |
|-------|---------|---------|
| **[SCENE]** | Location, lighting, atmosphere | "Rain-soaked Tokyo alley at 2 AM, neon reflections on wet pavement" |
| **[CHARACTER]** | Identity, wardrobe, emotion | "A weary hacker in her 30s, shaved head, neural port behind ear" |
| **[ACTION]** | Movement with physics cues | "She slams the enter key, leans back, exhales with relief" |
| **[CAMERA]** | Angle, movement, DOF | "Slow dolly in to MCU, rack focus to screen, f/2.0" |
| **[AUDIO]** | Dialogue, ambient, SFX, music | "She whispers 'Finally.' Rain ambience, keyboard clatter, low synth drone" |

## Multi-Shot System

Use `multi_prompt` array instead of single prompt. Each element = one shot:

```json
{
  "multi_prompt": [
    { "prompt": "Shot 1 description...", "duration": "5" },
    { "prompt": "Shot 2 description...", "duration": "5" }
  ],
  "shot_type": "customize",
  "generate_audio": true
}
```

**Shot Types:**
- `customize` — You define exact divisions and durations
- `intelligent` — AI determines optimal cut points

**Continuity Tips:**
- Repeat key visual details across shots
- Use "Same location" or "Reverse angle" explicitly
- Maintain audio continuity: "Same jazz piano continues"
- Keep lighting language consistent across shots

## Elements 3.0

Lock character/object identity across shots using reference images:

- **@Element1, @Element2** — Reference in prompt text
- **Frontal image** — Clear front-facing ref (1024px+ recommended)
- **Reference images** — Additional angles (side, 3/4, back)
- **Video reference** — Optional for motion style/mannerisms
- Use in EVERY shot prompt for consistency

## Audio Generation

4 audio types, layered with priority:

| Type | Syntax | Priority |
|------|--------|----------|
| **Dialogue** | `She says, "text" with [emotion]` | Primary |
| **Ambient** | `Rain on windows, distant traffic` | Secondary |
| **SFX** | `Glass shatters on impact` | Tertiary |
| **Music** | `Low piano, minor key, slow` | Underscore |

**Voice Cloning:** Use `<<<voice_1>>>` and `<<<voice_2>>>` in prompt with `voice_ids` parameter.

## Camera Movement Vocabulary

| Movement | Prompt Syntax | Emotional Effect |
|----------|--------------|-----------------|
| Slow dolly in | "Slow dolly in to close-up" | Intimacy, realization |
| Fast push in | "Rapid push in to ECU" | Urgency, shock |
| Pull out | "Slow pull out to wide" | Isolation, context |
| Whip pan | "Whip pan to the right" | Surprise, energy |
| Tilt up | "Slow tilt up from feet to face" | Power, aspiration |
| Tracking | "Camera follows from behind" | Immersion, journey |
| Arc | "Slow arc around subject, 180°" | Examination, drama |
| Handheld | "Handheld, slight shake" | Documentary, tension |
| Crane | "Crane up from subject to aerial" | Scale revelation |

## Advanced Controls

- **CFG Scale** (default 0.5): Lower = creative; Higher = strict adherence
- **Negative Prompt** (default "blur, distort, and low quality"): Add style exclusions
- **Start/End Frame**: Anchor opening and closing visual states (I2V)
- **Duration**: Per-second control 3–15s per shot

## Kling 3.0 vs 2.6

| Feature | Kling 2.6 | Kling 3.0 |
|---------|-----------|-----------|
| Duration | 5s or 10s | 3–15s |
| Multi-Shot | ❌ | ✅ 2–6 shots |
| Elements | Basic refs | Elements 3.0 (multi-ref + video) |
| Voice Control | ❌ | ✅ 2 custom voices |
| Cost (audio off) | $0.07/s | $0.224/s |
| Quality | Excellent | Superior |

**Use 2.6 when:** Budget-sensitive, single-shot, speed matters  
**Use 3.0 when:** Multi-shot, character consistency, voice cloning, max quality

## 8 Common Issues + Fixes

| Problem | Fix |
|---------|-----|
| Identity drift between shots | Use Elements 3.0 with frontal + reference images; repeat description in every shot |
| Dialogue desync | Specify emotion BEFORE dialogue: `says with urgency, "we need to go!"` |
| "Sliding" feet | Specify surface interaction: "heavy boots on wet gravel" |
| Color shift between shots | Add "Color Grade: teal-orange" to EVERY shot prompt |
| Audio overwhelms dialogue | Explicitly layer: "Dialogue clear. Ambient at 30%. Music barely audible." |
| Model hallucinating objects | Simplify prompt; split into multiple shots; use negative prompt |
| Cuts feel jarring | Maintain lighting, audio, and spatial continuity cues |
| Generation too slow | Simplify shot count; use `intelligent` shot_type |

## Integration Workflows

### Hero Frame → Animated Sequence
Generate frame (Nano Banana Pro) → Upscale → Upload as start_image → Prompt action + audio → 10–15s clip

### Multi-Shot Narrative
Write shot list → Generate character refs → Create Elements → Generate in batches (multi_prompt) → Assemble in NLE

### Voice-Cloned Dialogue
Record reference audio → Create voice IDs → Write multi-shot with <<<voice_1>>> → Generate → Polish audio
