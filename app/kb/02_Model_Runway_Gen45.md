# Runway Gen-4.5 — The Photorealism Benchmark Leader

> Last Updated: 2026-02-19 | Source: runway_gen4_5/Prompting_Mastery.md

## Model Type
- **VIDEO generation** — Benchmark leader for photorealism (Elo 1,247)
- Precise prompt adherence and physically accurate motion
- Director Mode — 6-axis numerical camera control
- NO native audio (add in post)

## Technical Specs

| Feature | Value |
|---------|-------|
| Resolution | 720p native (upscale for delivery) |
| Clip Lengths | 5s, 8s, 10s |
| Frame Rate | 24 FPS |
| Aspect Ratios | 16:9, 9:16, 1:1 |
| Native Audio | ❌ No |
| Input Modes | Text-to-Video, Image-to-Video |
| Camera Control | Director Mode (6-axis, ±10 scale) |
| Physics | Implicit — weight, momentum, inertia, fluid dynamics |
| API | Runway API only (NOT on fal.ai) |

## Strengths & Limitations

**Strengths:**
- Best-in-class photorealism — textures, skin, fabric, lighting
- Highest prompt adherence (Elo #1)
- Director Mode for precise, repeatable camera control
- Physical accuracy — objects behave with realistic physics
- Excellent at sequenced multi-step actions
- Surface detail — pores, fabric weave, metal reflection, water caustics
- Consistent output quality, low variance

**Limitations:**
- No native audio — major gap
- 720p native resolution (VEO 3.1 does 4K)
- 10-second maximum (Kling 3.0 does 15s)
- No multi-shot editing
- Premium pricing
- Not on fal.ai (Runway API only)
- No Elements/character lock system
- Slower generation

## Core Prompt Structure

```
[Camera Movement] + [Subject] + [Action] + [Environment] + [Style/Mood]
```

**Each element must be specific:**

| Element | Bad | Good |
|---------|-----|------|
| Subject | "A person" | "A woman in her 40s, silver-streaked hair, charcoal blazer, pearl earrings" |
| Action | "She walks and sits" | "She pushes through the door, scans the room, spots someone, adjusts her blazer, walks forward" |
| Environment | "In a restaurant" | "Upscale Italian, Edison bulbs, exposed brick, white marble tables, rain through floor-to-ceiling windows" |
| Camera | "Camera moves" | "Slow dolly in from MS to MCU, f/1.4, background dissolving into bokeh" |
| Style | "Cinematic" | "Fincher grade, desaturated teal shadows, naturalistic lighting, Kodak 500T warmth" |

## Director Mode — 6-Axis Camera Control

| Axis | Negative (-) | Positive (+) |
|------|-------------|-------------|
| **Pan** | Pan left | Pan right |
| **Tilt** | Tilt down | Tilt up |
| **Roll** | Counter-clockwise | Clockwise |
| **Zoom** | Zoom out | Zoom in |
| **Truck** | Truck left | Truck right |
| **Dolly** | Pull back | Push forward |

**Intensity:** ±1-2 subtle, ±3-4 standard, ±5-6 moderate, ±7-8 strong, ±9-10 extreme

### Director Mode Recipes

| Recipe | Values | Effect |
|--------|--------|--------|
| Slow dolly in | dolly: 3 | Gentle forward, intimacy |
| Vertigo effect | dolly: 5, zoom: -5 | Hitchcock disorientation |
| Orbital arc | truck: 6, pan: -4, dolly: 2 | Smooth arc around subject |
| Handheld feel | pan: 1, tilt: 1, roll: 1 | Organic, documentary |
| Dramatic push + Dutch | dolly: 7, roll: 3, zoom: 2 | Tension, unease |

## Sequenced Instructions (Superpower)

Chain 5–8 actions chronologically for complex single-shot scenes:

```
"A barista reaches for the pour-over dripper [1], places it on the scale [2], 
adds a filter [3], lifts the copper kettle [4], pours a thin spiral — coffee 
blooms with steam [5], watches the drawdown [6]."
```

**Rules:** Chronological order, one action per step, include transitions ("then," "next"), describe physics at each step, max 5–8 steps for 10s.

## Photorealism Checklist

For maximum realism, include ALL of these:
1. Camera/Lens — "Shot on ARRI Alexa Mini LF with Cooke 75mm at T2.3"
2. Film Stock — "Kodak Vision3 200T" or "ACES pipeline"
3. Lighting Source — "Practical desk lamp, no fill"
4. Surface Materials — 3+ specific materials described
5. Atmospheric Elements — Dust, fog, steam, breath
6. Imperfections — Scratches, wear, fingerprints
7. Scale Reference — Include known-size object

**Anti-patterns:** Don't use "8K ultra realistic photorealistic" — describe specific camera/lens/lighting instead.

## Material Keywords for Realism

- Metals: brushed steel, hammered copper, patinated bronze
- Fabrics: raw silk, woven linen, distressed denim, cashmere
- Wood: quarter-sawn oak, reclaimed barn wood, live-edge walnut
- Stone: Carrara marble, rough granite, polished obsidian
- Glass: hand-blown, leaded crystal, frosted, dichroic

## Physical Accuracy

Describe physics cues for realistic motion:

| Category | Keywords |
|----------|---------|
| Weight | "heavy, massive, substantial, light as air" |
| Friction | "slippery, grippy, sliding on ice, dragging" |
| Momentum | "building speed, sudden halt, carrying inertia" |
| Fluids | "viscous, thin, splashing, pouring slowly" |
| Fabric | "billowing, draping, clinging, fluttering" |

## Competitor Comparison

| Feature | Gen-4.5 | Kling 3.0 | VEO 3.1 | Sora 2 |
|---------|---------|-----------|---------|--------|
| Photorealism | ★★★★★ | ★★★★ | ★★★★ | ★★★★ |
| Audio | ❌ | ✅ | ✅ | ✅ |
| Max Duration | 10s | 15s | 8s | 20s |
| Resolution | 720p | 1080p | 4K | 1080p |
| Camera Control | ★★★★★ Director Mode | ★★★ text | ★★★ text | ★★★ text |
| Character Consistency | ★★ I2V only | ★★★★★ Elements | ★★ | ★★★ |

**Use Gen-4.5 when:** Max photorealism needed, precise camera control, complex sequenced actions, visual quality is priority  
**Use something else when:** Need audio (Kling/VEO), 4K (VEO), multi-shot (Kling 3.0), 20s clips (Sora 2), budget (Kling 2.6)

## 8 Common Issues + Fixes

| Problem | Fix |
|---------|-----|
| Looks "AI-ish" | Use specific camera/lens/film; add imperfections and atmospheric elements |
| Camera feels mechanical | Combine Director Mode with text motivation: "push in to reveal..." |
| Action sequence fails | Max 5–8 steps for 10s; simplify for shorter durations |
| Subject floats/slides | Describe ground interaction: "boots gripping wet stone" |
| Hands look wrong | Simplify gestures; describe what hands touch, not finger positions |
| Lighting is flat | Name the source: "key light from window camera-left, no fill" |
| Colors look digital | Use film stock: "Kodak 5219 500T color science" |
| Expecting audio | No audio — plan for ElevenLabs dialogue, Epidemic music in post |

## Integration Workflows

### Ultimate Quality Shot
Hero frame (Nano Banana Pro) → Upscale 4K → Gen-4.5 I2V + Director Mode → Upscale video (Topaz) → Add audio → Color grade

### Multi-Shot Assembly
Plan shot list → Generate hero frames → Gen-4.5 I2V each → Assemble in NLE → Transitions, audio, grade

### Hybrid Audio
Generate video (Gen-4.5) → Dialogue (ElevenLabs) → SFX (Foley) → Music (Suno/Udio) → Mix in DAW → Sync
