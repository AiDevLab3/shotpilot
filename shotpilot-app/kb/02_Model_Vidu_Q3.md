# Vidu Q3 — ShotPilot Model Guide

**Model:** Vidu Q3 (Pro & Turbo) | **Maker:** Shengshu Technology | **Type:** Video Generation  
**Available on:** fal.ai | **Commercial Use:** Yes

---

## Overview

Vidu Q3 is a video generation model with **up to 16-second clips**, **native audio co-generation**, and **start/end frame interpolation**. Available in Pro (best quality) and Turbo (half-price, faster) tiers.

## Endpoints

| Endpoint | Model ID | Input |
|---|---|---|
| Text-to-Video Pro | `fal-ai/vidu/q3/text-to-video` | Text |
| Text-to-Video Turbo | `fal-ai/vidu/q3/text-to-video/turbo` | Text |
| Image-to-Video Pro | `fal-ai/vidu/q3/image-to-video` | Image + Text |
| Image-to-Video Turbo | `fal-ai/vidu/q3/image-to-video/turbo` | Image + Text |

## API Parameters

### Text-to-Video

| Parameter | Type | Required | Default | Options |
|---|---|---|---|---|
| `prompt` | string | ✅ | — | Max 2000 chars |
| `duration` | integer | ❌ | 5 | 1–16 seconds |
| `seed` | integer | ❌ | Random | Any integer |
| `aspect_ratio` | string | ❌ | "16:9" | 16:9, 9:16, 4:3, 3:4, 1:1 |
| `resolution` | string | ❌ | "720p" | 360p, 540p, 720p, 1080p |
| `audio` | boolean | ❌ | true | Audio co-generation |

### Image-to-Video (additional params)

| Parameter | Type | Required | Default | Notes |
|---|---|---|---|---|
| `image_url` | string | ✅ | — | Start frame (URL or base64) |
| `end_image_url` | string | ❌ | — | End frame for interpolation |

> I2V has no `aspect_ratio` — ratio comes from input image. 360p unavailable with end frame.

## Pricing

| Tier | 360p/540p | 720p/1080p |
|---|---|---|
| **Pro** | $0.070/sec | $0.154/sec |
| **Turbo** | $0.035/sec | $0.077/sec |

HD costs 2.2x SD. Example: 10s @ 1080p Pro = **$1.54**.

## Prompt Framework

**Structure:** `[VISUAL STYLE] + [SUBJECT & ACTION] + [ENVIRONMENT & LIGHTING] + [AUDIO CUE]`

- **Always include motion verbs** — "walks," "turns," "drifts," not static descriptions
- **Include audio cues** when `audio: true` — "rain pattering," "distant jazz piano"
- **Sweet spot:** 200–600 characters
- **For I2V:** Describe what CHANGES, don't re-describe the image

## Cinematic Examples

### Neo-Noir Scene
```json
{
  "prompt": "High contrast noir cinematography, 35mm film grain. A lone detective in a trench coat walks down a rain-slicked alley at night, neon signs reflecting in puddles, cigarette smoke curling. Camera follows from behind at low angle. Jazz saxophone faintly in the distance, rain on metal fire escapes.",
  "duration": 12, "resolution": "1080p", "aspect_ratio": "16:9", "audio": true
}
```

### Nature Documentary
```json
{
  "prompt": "Ultra-realistic underwater macro cinematography. A sea turtle glides through sunlight shafts piercing the ocean surface, small fish scatter as it passes vibrant coral. Bioluminescent particles drift. Bubbles and distant whale song.",
  "duration": 10, "resolution": "1080p", "aspect_ratio": "16:9", "audio": true
}
```

### Fashion Slow-Mo (Vertical)
```json
{
  "prompt": "Fashion editorial slow motion, Phantom Flex 1000fps, shallow DOF. Model in flowing red silk dress spins, fabric billowing in golden backlight. Dark studio, single spotlight rim light.",
  "duration": 8, "resolution": "1080p", "aspect_ratio": "9:16", "audio": false
}
```

### Time-Lapse (Start/End Frame)
```json
{
  "prompt": "Cinematic time-lapse, seasons changing, clouds racing, leaves appearing then falling, light shifting summer to winter",
  "image_url": "tree_summer.jpg", "end_image_url": "tree_winter.jpg",
  "duration": 16, "resolution": "720p", "audio": true
}
```

## Strengths

- **16-second clips** — longest in class
- **Native audio** — dialogue, SFX, ambient generated with video
- **Start + end frame** interpolation for transitions
- **Turbo mode** — half price for iteration
- **Smooth natural motion** — especially humans, fabric, water
- **Per-second duration** — any integer 1–16, not just fixed 5s/10s

## Limitations

- **No character consistency** — no Elements/CharacterLock system
- **No camera parameters** — camera movement only via prompt
- **No negative prompt** — can't explicitly exclude elements
- **No multi-shot** — single continuous shot only
- **Audio is black-box** — no mixing/level control
- **Face drift** at durations >10s with complex expressions

## Common Mistakes

| Mistake | Fix |
|---|---|
| Static scene descriptions | Add motion verbs and camera movement |
| No audio cues in prompt | Add 1-2 sound descriptions |
| 1080p for every test | Use Turbo @ 360p for iteration |
| Duration too long for action | Match duration to complexity (3-5s gesture, 6-10s walk, 10-16s establishing) |
| Radical start/end frames | Keep similar composition, change lighting/state only |
| Re-describing image in I2V | Describe what happens NEXT, not what's shown |

## Workflow

1. **Iterate:** Turbo @ 360p, 5s → cheapest testing ($0.175)
2. **Lock composition:** Turbo @ 720p, target duration
3. **Quality check:** Pro @ 720p
4. **Final render:** Pro @ 1080p with locked seed

## vs Other Models

| | Vidu Q3 | Kling 3.0 | Runway Gen4.5 | Sora 2 |
|---|---|---|---|---|
| Max Duration | **16s** | 15s | 10s | 20s |
| Audio | ✅ | ✅ | ❌ | ✅ |
| Multi-Shot | ❌ | ✅ | ❌ | ❌ |
| Char Lock | ❌ | ✅ | ✅ | ❌ |
| End Frame | ✅ | ✅ | ✅ | ❌ |
| Turbo Mode | ✅ | ❌ | ❌ | ❌ |
