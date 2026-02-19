# Vidu Q3 Prompting Mastery Guide: Cinematic Video Generation with Native Audio

**Version:** 1.0  
**Date:** February 19, 2026  
**Author:** Cine-AI Knowledge Base Team

---

## Table of Contents

1. [Introduction](#introduction)
2. [Technical Specifications](#technical-specifications)
3. [API Reference — fal.ai](#api-reference--falai)
4. [Generation Modes & Endpoints](#generation-modes--endpoints)
5. [Core Prompting Framework](#core-prompting-framework)
6. [Image-to-Video Mastery](#image-to-video-mastery)
7. [Start/End Frame Interpolation](#startend-frame-interpolation)
8. [Native Audio Generation](#native-audio-generation)
9. [Resolution & Aspect Ratio Strategy](#resolution--aspect-ratio-strategy)
10. [Cinematic Prompting Examples](#cinematic-prompting-examples)
11. [Turbo vs Pro — When to Use Each](#turbo-vs-pro--when-to-use-each)
12. [Strengths & Unique Features](#strengths--unique-features)
13. [Limitations & Failure Modes](#limitations--failure-modes)
14. [Best Practices for Cinematic/Film Use](#best-practices-for-cinematicfilm-use)
15. [Model Comparison](#model-comparison)
16. [Common Mistakes & Fixes](#common-mistakes--fixes)
17. [Pricing & Cost Optimization](#pricing--cost-optimization)
18. [Q2 vs Q3 — Migration & Differences](#q2-vs-q3--migration--differences)
19. [Integration Workflows](#integration-workflows)

---

## Introduction

**Vidu Q3** is the latest generation video model from **Shengshu Technology** (Beijing-based AI lab), available on fal.ai. Q3 represents a significant leap over Q2 with extended duration support (up to 16 seconds), native audio-video co-generation, start/end frame interpolation, and improved visual fidelity at up to 1080p resolution.

### What Makes Vidu Q3 Unique

- **16-Second Generation:** Industry-leading clip length (1–16s), configurable per-second — most competitors cap at 5–10s
- **Native Audio-Video Co-Generation:** Synchronized sound (dialogue, SFX, ambient) generated alongside video by default
- **Start + End Frame Interpolation:** Provide both a starting and ending image for precise transition control
- **4 Resolution Tiers:** 360p → 540p → 720p → 1080p with proportional pricing
- **5 Aspect Ratios:** 16:9, 9:16, 4:3, 3:4, 1:1 — covers cinema, mobile, and social
- **Turbo Mode:** Half-price, faster generation for iteration and previews
- **Clean API Surface:** Minimal parameters, maximum control — no overcomplicated configs
- **Commercial License:** Licensed for commercial use via fal.ai

### When to Use Vidu Q3

**Best For:**
- Extended single-shot scenes (8–16s) where continuity matters
- Audio-integrated storytelling (dialogue scenes, ambient soundscapes)
- Image-to-video animation from concept art, storyboards, or reference frames
- Start-to-end frame interpolation (morphing, transitions, time-lapses)
- Budget-conscious production using Turbo mode for previews
- Vertical/mobile content (native 9:16 support)

**Less Ideal For:**
- Multi-shot sequences with cuts (use Kling 3.0 instead)
- Character consistency across multiple generations (no Elements system)
- Precise camera movement control (no explicit camera params)
- Text rendering in video (not a strength)

---

## Technical Specifications

| Specification | Value |
|---|---|
| **Model Family** | Vidu Q3 (Shengshu Technology) |
| **Generation** | Q3 Pro / Q3 Turbo |
| **Available On** | fal.ai (exclusive API partner) |
| **Max Duration** | 16 seconds |
| **Min Duration** | 1 second |
| **Resolutions** | 360p, 540p, 720p, 1080p |
| **Aspect Ratios** | 16:9, 9:16, 4:3, 3:4, 1:1 |
| **Max Prompt Length** | 2,000 characters |
| **Native Audio** | Yes (on by default) |
| **Seed Control** | Yes (reproducible generations) |
| **Start Frame** | Yes (image-to-video) |
| **End Frame** | Yes (image-to-video only) |
| **Commercial Use** | Yes |
| **Output Format** | MP4 |

---

## API Reference — fal.ai

Vidu Q3 exposes **4 endpoints** on fal.ai, organized by input type and speed tier:

### Endpoint Matrix

| Endpoint | Model ID | Input | Speed | Cost/sec |
|---|---|---|---|---|
| **Text-to-Video Pro** | `fal-ai/vidu/q3/text-to-video` | Text only | Standard | $0.070 (360p/540p), $0.154 (720p/1080p) |
| **Text-to-Video Turbo** | `fal-ai/vidu/q3/text-to-video/turbo` | Text only | Fast | $0.035 (360p/540p), $0.077 (720p/1080p) |
| **Image-to-Video Pro** | `fal-ai/vidu/q3/image-to-video` | Image + Text | Standard | $0.070 (360p/540p), $0.154 (720p/1080p) |
| **Image-to-Video Turbo** | `fal-ai/vidu/q3/image-to-video/turbo` | Image + Text | Fast | $0.035 (360p/540p), $0.077 (720p/1080p) |

### Text-to-Video Parameters (Pro & Turbo)

| Parameter | Type | Required | Default | Range/Options | Description |
|---|---|---|---|---|---|
| `prompt` | `string` | ✅ | — | Max 2000 chars | Text description of the video to generate |
| `duration` | `integer` | ❌ | `5` | `1` – `16` | Video length in seconds |
| `seed` | `integer` | ❌ | Random | Any integer | Seed for reproducible output |
| `aspect_ratio` | `string` | ❌ | `"16:9"` | `"16:9"`, `"9:16"`, `"4:3"`, `"3:4"`, `"1:1"` | Output aspect ratio |
| `resolution` | `string` | ❌ | `"720p"` | `"360p"`, `"540p"`, `"720p"`, `"1080p"` | Output resolution |
| `audio` | `boolean` | ❌ | `true` | `true` / `false` | Enable native audio co-generation |

### Image-to-Video Parameters (Pro & Turbo)

| Parameter | Type | Required | Default | Range/Options | Description |
|---|---|---|---|---|---|
| `prompt` | `string` | ❌ | `""` | Max 2000 chars | Text guidance for the animation |
| `image_url` | `string` | ✅ | — | URL or base64 | Starting frame image |
| `end_image_url` | `string` | ❌ | — | URL | Ending frame for interpolation |
| `duration` | `integer` | ❌ | `5` | `1` – `16` | Video length in seconds |
| `seed` | `integer` | ❌ | Random | Any integer | Seed for reproducible output |
| `resolution` | `string` | ❌ | `"720p"` | `"360p"`, `"540p"`, `"720p"`, `"1080p"` | Output resolution (360p unavailable with end_image_url) |
| `audio` | `boolean` | ❌ | `true` | `true` / `false` | Enable native audio co-generation |

> **Note:** Image-to-video does NOT have an `aspect_ratio` parameter — the aspect ratio is automatically derived from the input image dimensions.

### Output Schema

All endpoints return the same structure:

```json
{
  "video": {
    "url": "https://v3b.fal.media/files/...output.mp4"
  }
}
```

The `video.url` is a temporary fal.ai CDN link. Download and store it promptly — these URLs expire.

---

## Generation Modes & Endpoints

### Text-to-Video (T2V)

The primary creative mode. Describe a scene and Vidu generates it from scratch.

```json
{
  "prompt": "A weathered fisherman mends his nets on a misty dock at dawn, seagulls circling overhead, golden light breaking through fog banks over a calm harbor",
  "duration": 8,
  "resolution": "1080p",
  "aspect_ratio": "16:9",
  "audio": true
}
```

**Key behaviors:**
- The model interprets cinematic language well: lighting descriptors, camera angles, and mood keywords
- Audio is generated contextually — describe sounds in your prompt for better audio alignment
- Duration beyond 10s may introduce slight drift in complex scenes
- 1080p takes ~2–4x longer than 720p to generate

### Image-to-Video (I2V)

Animate a still image. The `image_url` becomes the first frame (approximately).

```json
{
  "prompt": "The woman slowly turns her head toward the camera and smiles, wind catches her hair",
  "image_url": "https://example.com/portrait.jpg",
  "duration": 5,
  "resolution": "720p",
  "audio": true
}
```

**Key behaviors:**
- The starting frame is preserved with high fidelity for the first 1–2 seconds
- Motion described in the prompt begins gradually
- Without a prompt, the model infers natural motion from the image content
- Image resolution doesn't need to match output resolution — the model handles scaling

### Start + End Frame Interpolation

Provide both `image_url` and `end_image_url` to create a transition between two states.

```json
{
  "prompt": "Smooth cinematic transition from day to night",
  "image_url": "https://example.com/scene_day.jpg",
  "end_image_url": "https://example.com/scene_night.jpg",
  "duration": 8,
  "resolution": "720p"
}
```

**Key behaviors:**
- The model interpolates between the two visual states over the duration
- Works best when the two images share similar composition but differ in lighting, color, or time
- 360p resolution is NOT available when using end frames
- Longer durations (8–16s) produce smoother transitions
- This is excellent for time-lapse effects, season changes, and emotional transitions

---

## Core Prompting Framework

Vidu Q3 responds best to structured, descriptive prompts. Based on extensive testing, the following 4-layer framework produces the most cinematic results:

### The 4-Layer Prompt Structure

```
[VISUAL STYLE] + [SUBJECT & ACTION] + [ENVIRONMENT & LIGHTING] + [AUDIO/MOOD CUE]
```

#### Layer 1: Visual Style
Set the aesthetic before anything else. Vidu Q3 is highly responsive to style priming.

**Effective style tokens:**
- `"Ultra-realistic cinematic photography"` — photorealistic, film-grade
- `"35mm film grain, Kodak Portra 400 tonality"` — vintage film look
- `"Anamorphic widescreen, shallow depth of field"` — cinematic lens effects
- `"High-contrast noir lighting"` — dramatic shadows
- `"Dreamy soft-focus, pastel color palette"` — ethereal/romantic
- `"Documentary-style handheld footage"` — raw/authentic feel

#### Layer 2: Subject & Action
Describe WHO/WHAT is in frame and WHAT THEY DO. Be specific about motion.

**Motion verbs that work well:**
- `walks slowly`, `turns toward camera`, `reaches out`, `collapses`
- `drifts across frame`, `emerges from shadow`, `catches the light`
- Avoid overly complex choreography in a single clip

**Subject detail level:**
- Physical description (age, build, clothing, expression)
- Positioning in frame (center, foreground, silhouette)
- Interaction with environment or other subjects

#### Layer 3: Environment & Lighting
Vidu Q3 excels at atmospheric environments. Light is your most powerful tool.

**Lighting descriptors with strong response:**
- `"Golden hour backlight"`, `"Tungsten warm interior"`, `"Cool blue moonlight"`
- `"Volumetric fog with god rays"`, `"Neon reflections on wet asphalt"`
- `"Harsh overhead fluorescent"`, `"Dappled light through canopy"`
- `"Rim light separating subject from background"`

#### Layer 4: Audio/Mood Cue
Since audio is co-generated, include sound hints in your prompt.

**Audio-influencing phrases:**
- `"The sound of rain against windows"` — triggers rain audio
- `"She whispers softly"` — triggers quiet dialogue audio
- `"Distant thunder rolling across the valley"` — triggers weather SFX
- `"Jazz piano playing in the background"` — triggers music
- `"Complete silence except for footsteps"` — triggers minimal soundscape

### Prompt Length Sweet Spot

- **Too short (<100 chars):** Vidu fills in details unpredictably
- **Sweet spot (200–600 chars):** Best balance of control and creative latitude
- **Long (600–1500 chars):** Works but diminishing returns; model may ignore later details
- **Max (2000 chars):** Use only when stacking style + action + environment + audio cues

---

## Image-to-Video Mastery

### Optimal Input Images

| Factor | Recommendation |
|---|---|
| **Resolution** | 1024×1024 or higher recommended; model upscales as needed |
| **Format** | JPG, PNG, WebP, GIF, AVIF supported |
| **Composition** | Clear subject separation from background |
| **Lighting** | Well-lit images animate better than flat/overexposed |
| **Style Match** | Image style should match prompt style for coherent output |
| **Faces** | Frontal or 3/4 angle faces animate most naturally |

### Prompt Strategy for I2V

When using image-to-video, the prompt should describe **motion and change**, not re-describe the image:

**❌ Bad:** `"A woman standing in a garden with flowers"` (re-describes the image)

**✅ Good:** `"She slowly reaches down to pick a flower, then brings it close to smell it, golden afternoon light shifting"` (describes what happens next)

### End Frame Best Practices

- **Same subject, different state:** Smiling → crying, day → night, young → old
- **Same location, different time:** Empty room → furnished, construction → completed
- **Matching composition:** Keep framing similar between start and end for smooth interpolation
- **Avoid radical changes:** Two completely different scenes will produce chaotic interpolation
- **Duration matters:** 4s for subtle changes, 8–12s for dramatic transformations, 16s for gradual morphs

---

## Native Audio Generation

Vidu Q3's audio co-generation is on by default (`audio: true`). The model generates synchronized audio based on visual content and prompt cues.

### How Audio Works

1. The model analyzes the visual scene and motion
2. It generates contextually appropriate audio: ambient, SFX, dialogue, or music
3. Audio is synchronized to visual events (footsteps match walking, impacts match collisions)

### Controlling Audio Through Prompts

You don't have separate audio parameters — instead, embed audio direction in your text prompt:

```
"A blacksmith hammers glowing metal on an anvil, 
sparks flying, the rhythmic clang of hammer on steel 
echoing through the workshop"
```

This produces: visual of hammering + synchronized metallic clanging audio

### When to Disable Audio

Set `audio: false` when:
- You plan to add a custom soundtrack in post
- The scene is an abstract visualization where audio would be distracting
- You need silence for a specific creative effect
- You're generating transitions/inserts that will be scored in an NLE

### Audio Limitations

- No fine-grained control over audio levels, EQ, or mixing
- Dialogue quality varies — works for ambient speech, not reliable for specific words
- Music generation is basic ambient/mood music, not composed tracks
- Audio may not perfectly sync with rapid or complex motion

---

## Resolution & Aspect Ratio Strategy

### Resolution Tiers

| Resolution | Use Case | Cost Multiplier | Generation Speed |
|---|---|---|---|
| **360p** | Quick tests, composition checks | 1x | Fastest |
| **540p** | Social media drafts, mobile-first content | 1x | Fast |
| **720p** | Standard production, review cuts | 1x (default) | Medium |
| **1080p** | Final output, cinematic delivery | 2.2x | Slowest |

**Pro Tip:** Always iterate at 360p or 540p Turbo first. Once you've locked the prompt and composition, upscale to 1080p Pro for the final render.

### Aspect Ratio Guide

| Ratio | Dimensions | Use Case |
|---|---|---|
| **16:9** | Standard widescreen | Film, YouTube, presentations |
| **9:16** | Vertical | TikTok, Reels, Stories |
| **4:3** | Classic TV | Retro aesthetics, documentary |
| **3:4** | Vertical classic | Instagram portrait posts |
| **1:1** | Square | Instagram feed, thumbnails |

---

## Cinematic Prompting Examples

### Example 1: Neo-Noir Detective Scene

```json
{
  "prompt": "High contrast noir cinematography, 35mm film grain. A lone detective in a trench coat walks down a rain-slicked alley at night, neon signs reflecting in puddles, cigarette smoke curling in the air. Camera follows from behind at a low angle. Jazz saxophone plays faintly in the distance, rain pattering on metal fire escapes.",
  "duration": 12,
  "resolution": "1080p",
  "aspect_ratio": "16:9",
  "audio": true
}
```

**Why it works:** Style primer (noir), specific subject action (walking), rich environment (rain, neon, reflections), camera direction (low angle behind), and audio cues (jazz, rain).

### Example 2: Nature Documentary — Underwater

```json
{
  "prompt": "Ultra-realistic underwater macro cinematography, crystal clear tropical water. A sea turtle glides gracefully through shafts of sunlight piercing the ocean surface, small fish scatter as it passes over a vibrant coral reef. Bioluminescent particles drift in the current. The sound of bubbles and distant whale song.",
  "duration": 10,
  "resolution": "1080p",
  "aspect_ratio": "16:9",
  "audio": true
}
```

**Why it works:** Specific environment (underwater macro), clear subject motion (turtle gliding), atmospheric detail (sunlight shafts, particles), layered depth (coral, fish, turtle), audio direction (bubbles, whale song).

### Example 3: Fashion Film — Slow Motion

```json
{
  "prompt": "Fashion editorial slow motion, shot on Phantom Flex at 1000fps, shallow depth of field. A model in a flowing red silk dress spins in place, fabric billowing and catching warm golden backlight. Wind machine effect, hair flowing upward. Studio setting with dark background, single spotlight creating dramatic rim light.",
  "duration": 8,
  "resolution": "1080p",
  "aspect_ratio": "9:16",
  "audio": false
}
```

**Why it works:** Technical camera reference (Phantom Flex, 1000fps), fabric physics prompt (flowing, billowing), lighting specification (backlight, rim light), audio disabled for music-to-be-added-in-post.

### Example 4: Sci-Fi Establishing Shot

```json
{
  "prompt": "Anamorphic widescreen cinematic, Blade Runner 2049 color palette of deep orange and teal. A massive derelict spaceship sits half-buried in desert sand dunes at sunset, dust storms swirling around its hull. Tiny figures walk toward it in the distance. Lens flares from the setting sun. Low rumbling wind and distant metallic groaning.",
  "duration": 16,
  "resolution": "720p",
  "aspect_ratio": "16:9",
  "audio": true
}
```

**Why it works:** Specific film reference for color palette, scale contrast (massive ship vs tiny figures), environmental effects (dust storms), maximum duration for slow establishing shot, audio cues (wind, metallic groaning).

### Example 5: Intimate Portrait — Image-to-Video

```json
{
  "prompt": "The elderly man slowly looks up from his book, adjusts his reading glasses, and gazes out the rain-streaked window with a melancholy expression. Warm tungsten lamplight flickers slightly. The sound of a ticking clock and gentle rain.",
  "image_url": "https://example.com/elderly_reader_portrait.jpg",
  "duration": 6,
  "resolution": "1080p",
  "audio": true
}
```

**Why it works:** Describes sequential micro-actions (looks up, adjusts glasses, gazes), emotional direction (melancholy), consistent lighting with image (tungsten lamp), subtle audio cues (clock, rain).

### Example 6: Horror Atmosphere

```json
{
  "prompt": "Found footage horror aesthetic, night vision green tint with scan lines. A dark hallway in an abandoned hospital, the camera slowly pushes forward. A door at the end of the hallway creaks open by itself, revealing pitch darkness beyond. Flickering fluorescent light overhead. Heavy breathing and distant scraping sounds.",
  "duration": 14,
  "resolution": "720p",
  "aspect_ratio": "4:3",
  "audio": true
}
```

**Why it works:** Specific genre aesthetic (found footage, night vision), progressive tension (slow push, door opening), 4:3 ratio for surveillance/found footage feel, audio is critical for horror (breathing, scraping).

### Example 7: Time-Lapse Transition — Start/End Frame

```json
{
  "prompt": "Smooth cinematic time-lapse of seasons changing, clouds moving rapidly across the sky, leaves appearing and falling from the tree, light shifting from summer warmth to autumn gold to winter blue",
  "image_url": "https://example.com/tree_summer.jpg",
  "end_image_url": "https://example.com/tree_winter.jpg",
  "duration": 16,
  "resolution": "720p",
  "audio": true
}
```

**Why it works:** Start/end frame provides visual anchors, maximum duration for gradual change, prompt describes the interpolation path (seasons), audio adds ambient texture.

---

## Turbo vs Pro — When to Use Each

### Comparison Table

| Feature | Pro | Turbo |
|---|---|---|
| **Cost** | $0.070/sec (SD), $0.154/sec (HD) | $0.035/sec (SD), $0.077/sec (HD) |
| **Speed** | Standard | ~2x faster |
| **Visual Quality** | Highest | Slightly reduced detail |
| **Audio Quality** | Best | Good |
| **Use Case** | Final renders | Previews, iteration, drafts |

### Recommended Workflow

1. **Prompt development:** Turbo @ 360p, 5s duration → cheapest possible iteration
2. **Composition lock:** Turbo @ 720p, target duration → validate timing
3. **Quality check:** Pro @ 720p, target duration → verify detail level
4. **Final render:** Pro @ 1080p, target duration → delivery quality

**Cost of this workflow for a 10s clip:**
- Step 1: $0.035 × 5 = $0.175
- Step 2: $0.077 × 10 = $0.77
- Step 3: $0.154 × 10 = $1.54
- Step 4: $0.154 × 10 = $1.54
- **Total: ~$4.03** vs blind 1080p Pro = $1.54 but potentially many re-rolls

---

## Strengths & Unique Features

### Top Strengths

1. **Duration King:** 16 seconds is exceptional — most models max at 5–10s. This enables complete scene coverage in a single generation.

2. **Audio-Visual Fusion:** Native audio co-generation means you get a complete audiovisual clip, not just silent video. Reduces post-production work significantly.

3. **Start/End Frame Control:** The `end_image_url` parameter is rare among competitors. It enables precise transition planning — invaluable for music videos, time-lapses, and narrative transitions.

4. **Resolution Flexibility:** 4-tier resolution with linear pricing means you can iterate cheaply and only pay premium for final output.

5. **Turbo Mode:** A dedicated fast/cheap tier that shares the same API surface. No config changes needed — just swap the endpoint.

6. **Clean Motion:** Vidu Q3 produces notably smooth, natural motion — particularly for human subjects, fabric, and environmental effects (water, fog, particles).

7. **Prompt Faithfulness:** Q3 has strong adherence to descriptive prompts, particularly for lighting conditions and atmospheric effects.

### Unique Capabilities

- **Per-second duration control:** Unlike models that only offer fixed durations (5s or 10s), Vidu lets you specify any integer from 1–16
- **Aspect ratio preservation in I2V:** The image-to-video mode automatically matches the input image's aspect ratio
- **Base64 input support:** You can send images directly as base64 strings, useful for pipeline integrations without URL hosting

---

## Limitations & Failure Modes

### Known Limitations

1. **No character consistency system:** Unlike Kling's Elements or Runway's Character Lock, Vidu Q3 has no mechanism to maintain character identity across multiple generations. Each generation is independent.

2. **No camera movement parameters:** Camera motion must be described in the prompt and is interpreted by the model — there's no explicit pan/tilt/zoom control.

3. **No negative prompt:** Unlike image models, there's no `negative_prompt` parameter. You cannot explicitly exclude unwanted elements.

4. **No multi-shot support:** Single continuous shot only. No scene cuts or shot changes within a generation.

5. **No inpainting or regional control:** The entire frame is generated — no masking or region-specific editing.

6. **Audio is black-box:** You can't control audio type, volume, or mixing. What you get is what you get.

### Common Failure Modes

| Failure | Cause | Fix |
|---|---|---|
| **Morphing faces** | Complex facial expressions over long duration | Keep facial action simple; use shorter clips (5–8s) for face-focused shots |
| **Temporal drift** | Scene gradually changes look over 12–16s | Use start frame (I2V) to anchor the visual; shorten duration |
| **Extra limbs/fingers** | Complex human poses | Describe simpler poses; use I2V with a clean reference image |
| **Audio mismatch** | Prompt doesn't mention sounds | Add explicit audio cues in prompt text |
| **Static video** | Prompt describes a state, not an action | Always include motion verbs: "walks," "turns," "moves" |
| **Resolution artifacts** | Using 1080p with complex motion | Use 720p for complex scenes; 1080p for simpler compositions |
| **Aspect ratio surprise (I2V)** | Input image ratio doesn't match expected output | Pre-crop input images to desired aspect ratio |
| **End frame chaos** | Radically different start and end images | Ensure both images share similar composition and subject |

---

## Best Practices for Cinematic/Film Use

### Pre-Production

1. **Storyboard to I2V pipeline:** Generate storyboard frames with an image model (Kling Image V3, Flux 2, etc.), then animate each frame with Vidu Q3 I2V
2. **Shot planning by duration:** Plan shots around Vidu's 1–16s range. Standard film shots average 4–8s — well within Vidu's sweet spot
3. **Batch seed testing:** Generate 3–5 variations using different seeds to find the best motion interpretation

### Production

4. **Iterate fast, render slow:** Use Turbo @ 360p for prompt development, Pro @ 1080p for finals
5. **Audio-first scenes:** For dialogue or SFX-heavy scenes, include detailed sound descriptions in the prompt
6. **Anchor with images:** Use I2V whenever you need consistent visual starting points
7. **Duration padding:** Generate 1–2 extra seconds beyond your edit point for handle frames

### Post-Production

8. **Trim the first/last second:** Generation often has a brief "settling" period at the start and slight drift at the end
9. **Replace audio selectively:** Use Vidu's audio as a guide track but replace with professional audio for critical moments
10. **Color grade consistently:** Vidu's color response varies between generations — apply a consistent LUT across clips
11. **Upscale if needed:** If 1080p isn't sufficient, Vidu's clean output upscales well with Topaz or similar tools

### Working with Audio

12. **Co-generated audio is a starting point:** Treat it as a temp track. It's useful for timing but may not be broadcast quality
13. **Disable audio for scored sequences:** When you have a specific music cue, generate video-only and sync in post
14. **Layer Vidu audio with foley:** The model generates a good ambient bed — layer specific foley on top

---

## Model Comparison

### Vidu Q3 vs Key Competitors

| Feature | Vidu Q3 | Kling 3.0 | Runway Gen4.5 | Sora 2 | Minimax Hailuo 02 |
|---|---|---|---|---|---|
| **Max Duration** | 16s | 15s | 10s | 20s | 6s |
| **Native Audio** | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Multi-Shot** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Character Lock** | ❌ | ✅ (Elements) | ✅ | ❌ | ❌ |
| **Start+End Frame** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Camera Control** | Prompt only | Explicit params | Prompt only | Prompt only | Prompt only |
| **Max Resolution** | 1080p | 1080p | 4K | 1080p | 1080p |
| **Turbo Mode** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Cost (5s/720p)** | ~$0.77 | ~$0.35 | ~$0.50 | ~$0.50 | ~$0.20 |
| **Prompt Adherence** | Strong | Very Strong | Strong | Moderate | Moderate |
| **Motion Quality** | Smooth | Excellent | Excellent | Good | Good |

### When to Choose Vidu Q3 Over Others

- **Over Kling 3.0:** When you need simpler API surface, longer clips, or Turbo iteration mode
- **Over Runway Gen4.5:** When you need native audio or durations beyond 10s
- **Over Sora 2:** When you need image-to-video with end frame control or more consistent prompt adherence
- **Over Hailuo 02:** When you need longer clips, higher resolution, or audio co-generation

---

## Common Mistakes & Fixes

### Mistake 1: Over-describing static scenes

**❌ Wrong:**
```
"A beautiful mountain landscape with snow-capped peaks, pine forests, a crystal clear lake reflecting the sky, wildflowers in the meadow, birds in the sky, clouds"
```

**✅ Fixed:**
```
"Cinematic aerial shot slowly revealing a snow-capped mountain range, camera drifting over pine forests toward a crystal clear lake, wildflowers swaying in a gentle breeze, birds gliding across frame. Wind sounds and distant birdsong."
```

**Why:** The first prompt describes a photograph. The second describes a video — with motion, camera movement, and audio.

### Mistake 2: Ignoring audio potential

**❌ Wrong:** Using `audio: true` (default) but writing prompts with no sound references

**✅ Fixed:** Always include 1–2 audio cues in your prompt when audio is enabled

### Mistake 3: Using 1080p for iteration

**❌ Wrong:** Generating every test at 1080p Pro ($0.154/sec)

**✅ Fixed:** Use Turbo @ 360p for iteration ($0.035/sec) — 4.4x cheaper, much faster

### Mistake 4: Wrong duration for the action

**❌ Wrong:** Setting duration to 16s for a simple head turn

**✅ Fixed:** Match duration to action complexity:
- Simple gesture/expression: 3–5s
- Walk + interact: 6–10s
- Complex scene with environment: 10–16s

### Mistake 5: Radical start/end frames

**❌ Wrong:** Start frame = close-up portrait, end frame = aerial landscape

**✅ Fixed:** Start and end frames should share compositional elements. Change lighting, color, or subject state — not everything at once.

### Mistake 6: Re-describing the input image in I2V

**❌ Wrong:** `"A woman in a red dress standing in a garden"` (when the image already shows this)

**✅ Fixed:** `"She slowly extends her hand to touch the nearest rose, leaning forward slightly"` (describe what CHANGES)

---

## Pricing & Cost Optimization

### Price Table

| Tier | Resolution | Cost Per Second |
|---|---|---|
| **Pro** | 360p / 540p | $0.070 |
| **Pro** | 720p / 1080p | $0.154 |
| **Turbo** | 360p / 540p | $0.035 |
| **Turbo** | 720p / 1080p | $0.077 |

### Cost Examples

| Scenario | Duration | Resolution | Tier | Cost |
|---|---|---|---|---|
| Quick test | 5s | 360p | Turbo | $0.175 |
| Social clip | 8s | 720p | Pro | $1.23 |
| Film shot | 10s | 1080p | Pro | $1.54 |
| Long establishing | 16s | 1080p | Pro | $2.46 |
| Budget iteration | 5s | 540p | Turbo | $0.175 |

### Cost Optimization Strategies

1. **Turbo-first workflow:** Develop prompts at Turbo pricing, render finals at Pro
2. **Resolution ladder:** 360p → 720p → 1080p, only upgrading when satisfied
3. **Duration discipline:** Don't default to 16s — use the minimum duration your scene needs
4. **Seed locking:** Once you find a good result, lock the seed and only change resolution/tier
5. **Batch planning:** Plan all shots before generating — random experimentation burns budget fast

---

## Q2 vs Q3 — Migration & Differences

### Key Differences

| Feature | Q2 | Q3 |
|---|---|---|
| **Max Duration** | 8s | 16s |
| **Audio** | Select variants | Native on all endpoints |
| **End Frame** | Not supported | Supported (I2V) |
| **Resolution** | Up to 720p | Up to 1080p |
| **Turbo Mode** | Available | Available (improved) |
| **Motion Quality** | Good | Significantly improved |
| **Prompt Length** | 1500 chars | 2000 chars |

### Q2 Variants Still Available

The Q2 generation includes specialized endpoints not yet available in Q3:

- `fal-ai/vidu/q2/reference-to-video/pro` — Reference-guided video with character/style consistency
- `fal-ai/vidu/q2/reference-to-image` — Generate reference-matched still images
- `fal-ai/vidu/q2/text-to-image` — Text-to-image generation

If you need reference-based generation (character consistency), the Q2 reference endpoints remain the best option until Q3 adds equivalent features.

### Migration Tips

- **Prompt length:** Q3 supports 500 more characters — take advantage for richer descriptions
- **Duration:** Extend shots that felt cramped in Q2's 8s limit
- **Audio:** Now on by default — set `audio: false` if you were doing silent Q2 workflows
- **End frames:** Start using I2V with end frames for transitions you previously did in post

---

## Integration Workflows

### Storyboard-to-Film Pipeline

```
1. Script → Shot list with descriptions
2. Shot descriptions → Kling Image V3 / Flux 2 (generate storyboard frames)
3. Storyboard frames → Vidu Q3 I2V (animate each frame)
4. Generated clips → NLE (Premiere, Resolve) for editing
5. Replace/enhance audio in post
6. Color grade across all clips for consistency
```

### A/B Testing Pipeline

```
1. Write base prompt
2. Generate 3 variants with different seeds (Turbo @ 360p)
3. Select best seed
4. Re-generate at Pro @ 1080p with locked seed
5. Trim and deliver
```

### API Integration (Python)

```python
import fal_client

# Pro generation
result = fal_client.subscribe(
    "fal-ai/vidu/q3/text-to-video",
    arguments={
        "prompt": "Your cinematic prompt here...",
        "duration": 10,
        "resolution": "1080p",
        "aspect_ratio": "16:9",
        "audio": True,
        "seed": 42
    },
    with_logs=True,
    on_queue_update=lambda u: print(u.logs[-1]["message"]) if hasattr(u, 'logs') and u.logs else None,
)
print(result["video"]["url"])
```

### API Integration (JavaScript)

```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/vidu/q3/text-to-video", {
  input: {
    prompt: "Your cinematic prompt here...",
    duration: 10,
    resolution: "1080p",
    aspect_ratio: "16:9",
    audio: true,
    seed: 42
  },
  logs: true,
  onQueueUpdate: (update) => {
    if (update.status === "IN_PROGRESS") {
      update.logs.map((log) => log.message).forEach(console.log);
    }
  },
});
console.log(result.data.video.url);
```

---

## Appendix: Quick Reference Card

### Text-to-Video Quick Start
```json
{
  "prompt": "[STYLE]. [SUBJECT + ACTION]. [ENVIRONMENT + LIGHTING]. [AUDIO CUE].",
  "duration": 8,
  "resolution": "720p",
  "aspect_ratio": "16:9",
  "audio": true
}
```

### Image-to-Video Quick Start
```json
{
  "prompt": "[DESCRIBE MOTION, NOT THE IMAGE]",
  "image_url": "[YOUR_IMAGE_URL]",
  "duration": 5,
  "resolution": "720p",
  "audio": true
}
```

### Endpoint Quick Reference
| Task | Endpoint |
|---|---|
| Text → Video (best quality) | `fal-ai/vidu/q3/text-to-video` |
| Text → Video (fast/cheap) | `fal-ai/vidu/q3/text-to-video/turbo` |
| Image → Video (best quality) | `fal-ai/vidu/q3/image-to-video` |
| Image → Video (fast/cheap) | `fal-ai/vidu/q3/image-to-video/turbo` |
