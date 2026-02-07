# Veo 3.1 — AI Video Generation with Native Audio (Google DeepMind)

## Model Type
- **VIDEO generation** with native audio (dialogue, SFX, ambient)
- Google DeepMind's flagship cinematic video model

## Key Strengths
- **4K output** — 720p, 1080p, and 4K at 24 FPS, broadcast-quality
- **Native audio** — dialogue with lip-sync, SFX, ambient noise, all from text
- **Complex scene comprehension** — multi-person conversations, emotional subtleties, spatial relationships
- **Stronger prompt adherence** — improved over Veo 3, fewer regenerations needed
- **Platform optimization** — native 16:9 and 9:16 aspect ratios

## Technical Specs

| Parameter | Value |
|-----------|-------|
| Resolutions | 720p, 1080p, 4K |
| Frame Rate | 24 FPS |
| Base Durations | 4s, 6s, 8s |
| Extended Duration | Up to 1 minute (with extension feature) |
| Aspect Ratios | 16:9 (landscape), 9:16 (portrait/vertical) |
| Image Reference | Optional, up to 20MB |
| Start/End Frames | Optional, for controlled transitions |
| Ingredients | Optional, multiple refs for consistency |
| Watermark | SynthID on all outputs |

## Five-Part Prompt Formula

```
[Cinematography] + [Subject] + [Action] + [Context] + [Style & Ambiance]
```

Lead with cinematography — it carries the most weight in scene composition.

| Part | Purpose | Example |
|------|---------|---------|
| **Cinematography** | Camera work, shot type, lens, angle | "Crane shot starting low and ascending high above..." |
| **Subject** | Main character or focal point | "A tired corporate worker..." |
| **Action** | What is happening, pacing, emotion | "rubbing his temples in exhaustion..." |
| **Context** | Location, time, weather, background | "in a cluttered office late at night..." |
| **Style & Ambiance** | Lighting, color, mood, aesthetic | "Retro aesthetic, shot as if on 1980s film, slightly grainy." |

Prompt length: 3–5 sentences standard; 6–10 for complex scenes. Start standard, add detail only where needed.

## Camera Movement Vocabulary

| Movement | Effect | When to Use |
|----------|--------|-------------|
| **Dolly** (forward/back) | Smooth controlled approach/retreat | Build tension (in) or provide context (out) |
| **Tracking** (lateral follow) | Dynamic energy, forward momentum | Subject moving through space |
| **Crane** (vertical sweep) | Dramatic reveals, epic scope | Establishing shots, scale revelation |
| **Aerial** (high above) | Context, spatial relationships, scale | Isolation, geography, overview |
| **Slow Pan** (horizontal rotate) | Builds anticipation, reveals environment | Gradual scene reveals |
| **POV** (character perspective) | Immersion, empathy | Placing viewer in character's position |
| **Handheld** (natural shake) | Realism, urgency, documentary feel | Action, chaos, intimate moments |
| **Steadicam** (smooth mobile) | Fluid motion through complex spaces | Moving through environments |
| **Static** (no movement) | Focus on performance | Dialogue, contemplation |
| **Orbit/Circular** (around subject) | Dramatic emphasis, reveals all angles | Hero moments, tension building |

## Shot Composition

| Shot Type | Purpose |
|-----------|---------|
| **Wide/Establishing** | Show full subject + environment, establish location |
| **Medium** | Waist up, balances subject and environment, standard for dialogue |
| **Close-Up** | Face or detail, emphasizes emotion, creates intimacy |
| **Extreme Close-Up** | Eyes, hands, object detail — maximum emphasis |
| **Two-Shot** | Two subjects, shows relationship and interaction |
| **Over-the-Shoulder** | Conversation framing, spatial relationship |
| **Low Angle** | Subject appears powerful, imposing, heroic |
| **High Angle** | Subject appears vulnerable, small, overwhelmed |

## Lens & Focus Options

| Technique | Effect | Use For |
|-----------|--------|---------|
| **Shallow DOF** | Blurred background, subject isolation | Cinematic look, directing attention |
| **Deep Focus** | Everything sharp front to back | Showing spatial depth, realism |
| **Soft Focus** | Diffused, dreamy quality | Romantic/nostalgic mood |
| **Macro** | Extreme close-up of tiny details | Intricate details, abstract beauty |
| **Wide-Angle** | Broad field, slight edge distortion | Capturing space, dynamic perspective |
| **Telephoto** | Compressed perspective, narrow field | Isolating distant subjects, intimacy from distance |
| **Bokeh** | Soft circular out-of-focus lights | Dreamy cinematic aesthetic, subject separation |

## Audio Generation Syntax

### Dialogue
Syntax: `[Character] says, "[exact words]" [delivery style]`
- With emotion: `A detective says in a weary voice, "Of all the offices in this town, you had to walk into mine."`
- Multi-person: `A young man asks excitedly, "Did you see that?" His friend responds with a laugh, "That was incredible!"`
- With action: `While walking through the door, she calls out, "Is anyone home?"`

### Sound Effects
Syntax: `SFX: [specific sound description with timing/quality]`
- Action: `SFX: footsteps echoing on marble floor`
- Timed: `A vase falls from the table. SFX: the crash of breaking ceramic as it hits the floor.`
- Layered: `SFX: distant traffic noise, a car horn honks, footsteps on wet pavement`

### Ambient Noise
Syntax: `Ambient noise: [background soundscape description]`
- Interior: `Ambient noise: quiet hum of a starship bridge, occasional beeps from control panels`
- Exterior: `Ambient noise: city traffic, distant sirens, people talking`
- Atmospheric: `Ambient noise: eerie silence broken only by occasional water drips`

### Audio Best Practices

| Rule | BAD | GOOD |
|------|-----|------|
| Specify sound quality | "SFX: footsteps" | "SFX: heavy boot footsteps echoing on marble floor" |
| Describe timing | "SFX: explosion" | "As the car reaches the end of the street, SFX: a massive explosion erupts behind it" |
| Layer elements | Single sound | Dialogue + SFX + Ambient in same prompt |
| Match mood | Mismatched tone | Tense scene = eerie silence + dripping water + cautious footsteps |
| Enhance storytelling | Passive sound | "SFX: a twig snaps nearby, the child freezes" |

## Advanced Controls

### Image-to-Video
Upload image (up to 20MB) + motion/audio prompt. Describe motion fitting image composition.

### Ingredients to Video
Upload multiple reference images (characters, objects, settings, styles) for visual consistency across shots. Prompt: `Using the provided images for [character], [setting]...`

### First and Last Frame
Provide start + end frame; model generates transition. Use for precise camera movements, transformations, perspective shifts.

### Video Extension
Extend base 8s clip up to 1 minute. Maintains visual and narrative consistency.

### Add/Remove Object
Introduce or remove objects from video. Note: currently uses Veo 2, no audio.

## Best Practices

1. **Start with cinematography** — place camera work first in prompt (highest weight position)
2. **Use professional vocabulary** — "Tracking shot" not "camera moves"; "Shallow DOF" not "blurry background"
3. **Layer descriptions** — Cinematography → Subject/Action → Environment → Audio → Style/Mood
4. **Specific lighting** — direction + quality + source + time of day + color temperature
5. **Match audio to mood** — tense = eerie silence + dripping; joyful = laughter + birds
6. **Negative prompts as positive absence** — not "No buildings" but "desolate landscape with only natural terrain"
7. **Leverage Gemini** — write basic prompt, ask Gemini to expand with cinematic detail
8. **Optimize for platform** — select correct aspect ratio and resolution before generating

## Platform Specs

| Platform | Aspect Ratio | Duration | Resolution |
|----------|--------------|----------|------------|
| YouTube | 16:9 | Any | 1080p, 4K |
| YouTube Shorts | 9:16 | 15–60s | 1080p |
| TikTok | 9:16 | 15–60s | 1080p |
| Instagram Reels | 9:16 | 15–60s | 1080p |
| Instagram Feed | 1:1 or 4:5 | 3–60s | 1080p |
| Twitter/X | 16:9 or 1:1 | 15–45s | 1080p |
| Broadcast/Cinema | 16:9 | Any | 4K |

## 7 Common Issues + Fixes

| Issue | Fix |
|-------|-----|
| Vague/unpredictable results | Use five-part formula; add specific details for each component |
| Audio doesn't match visuals | Integrate audio with action; specify timing: "As she opens the door, SFX: creaking hinges" |
| Camera movement wrong | Use standard terms (dolly, tracking, crane); avoid conflicting instructions |
| Character inconsistency | Use image refs or Ingredients to Video; use First/Last Frame for stability |
| Lighting doesn't match | Specify direction, quality, source, color temperature; mention early in prompt |
| Duration too short | Select 8s base; use extension; describe sustained action filling duration |
| Wrong aspect ratio | Select correct ratio before generating; plan composition for chosen ratio |

## Timestamp Prompting for Multi-Shot Sequences

Structure: `[00:00-00:02] [Shot description with cinematography + action + audio]`

```
[00:00-00:02] [Shot 1: cinematography + action + audio]
[00:02-00:04] [Shot 2: cinematography + action + audio]
[00:04-00:06] [Shot 3: cinematography + action + audio]
[00:06-00:08] [Shot 4: cinematography + action + audio]
```

- Each segment: own cinematography, action, audio
- Maintain consistent character/style across segments
- Vary shot types for visual variety
- Include SFX + ambient per segment
- End with emotional/epic payoff
