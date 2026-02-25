# PixVerse v5.6 — ShotPilot Model Guide

**Type:** Video Generation (Text-to-Video, Image-to-Video, Transition)  
**Developer:** PixVerse (via fal.ai)  
**Cost:** $0.35–$1.50/clip (resolution dependent)

---

## Quick Overview

PixVerse v5.6 is a versatile AI video generation model offering text-to-video, image-to-video, and transition capabilities. Key differentiators: native audio generation, 5 style presets, 20 camera movement presets, prompt optimization ("thinking mode"), and a dedicated transition endpoint for scene morphing.

---

## Endpoints

| Endpoint | ID | Use Case |
|----------|----|----------|
| Text-to-Video | `fal-ai/pixverse/v5.6/text-to-video` | Generate video from text prompt |
| Image-to-Video | `fal-ai/pixverse/v5.6/image-to-video` | Animate a reference image |
| Transition | `fal-ai/pixverse/v5.6/transition` | Morph between two keyframe images |
| Extend | `fal-ai/pixverse/extend` (model: v5.6) | Continue an existing video |
| Fast I2V (v5.5) | `fal-ai/pixverse/v5.5/fast/image-to-video` | Camera movement presets |

---

## Core Parameters

### Text-to-Video

| Parameter | Type | Default | Values |
|-----------|------|---------|--------|
| `prompt` | string | — | Required |
| `aspect_ratio` | enum | `"16:9"` | `16:9`, `4:3`, `1:1`, `3:4`, `9:16` |
| `resolution` | enum | `"720p"` | `360p`, `540p`, `720p`, `1080p` |
| `duration` | enum | `"5"` | `5`, `8`, `10` (1080p: 5/8 only) |
| `negative_prompt` | string | `""` | Quality exclusions |
| `style` | enum | None | `anime`, `3d_animation`, `clay`, `comic`, `cyberpunk` |
| `seed` | integer | Random | Reproducibility |
| `generate_audio_switch` | boolean | false | Enable BGM/SFX/dialogue |
| `thinking_type` | enum | None | `enabled`, `disabled`, `auto` |

### Image-to-Video (v5.6) — Same as above plus:
- `image_url` (required) — Reference image as first frame
- No `aspect_ratio` (inherits from image)

### Transition — Same as T2V plus:
- `first_image_url` (required) — Starting keyframe
- `end_image_url` (optional) — Ending keyframe
- Duration limited to `5` or `8`

### Camera Movements (Fast I2V v5.5 only)

`horizontal_left`, `horizontal_right`, `vertical_up`, `vertical_down`, `zoom_in`, `zoom_out`, `crane_up`, `quickly_zoom_in`, `quickly_zoom_out`, `smooth_zoom_in`, `camera_rotation`, `robo_arm`, `super_dolly_out`, `whip_pan`, `hitchcock`, `left_follow`, `right_follow`, `pan_left`, `pan_right`, `fix_bg`

---

## Prompt Structure

**Format:** `[Camera/Shot] + [Subject] + [Action] + [Environment] + [Lighting] + [Mood/Quality]`

### Thinking Mode Strategy
- **`enabled`**: Short/vague prompts — model expands them
- **`disabled`**: Detailed cinematic prompts — model follows exactly
- **`auto`**: Mixed workflows — model decides

### Recommended Negative Prompt
```
blurry, low quality, pixelated, noisy, out of focus, distorted faces, extra limbs, deformed hands, text, watermark, morphing artifacts, flickering, jittery motion
```

---

## Cinematic Examples

### Noir Close-Up
```json
{
  "prompt": "Close-up of a man's weathered face illuminated by flickering neon, rain on his fedora. Cigarette smoke curling upward. Low key lighting, deep shadows. 35mm film, anamorphic lens, shallow DOF, neon bokeh. Film noir, desaturated with neon red/blue pops.",
  "resolution": "1080p",
  "duration": "5",
  "negative_prompt": "blurry, distorted face, bright, cartoon, text",
  "thinking_type": "disabled",
  "generate_audio_switch": true
}
```

### Fantasy Establishing Shot
```json
{
  "prompt": "Sweeping crane shot rising above a medieval fortress on a cliff over turbulent ocean at golden hour. Banners whipping in wind. Volumetric god rays through storm clouds. Epic scale, hyper-detailed.",
  "resolution": "1080p",
  "duration": "8",
  "thinking_type": "disabled",
  "generate_audio_switch": true
}
```

### Transition (Day → Night)
```json
{
  "endpoint": "fal-ai/pixverse/v5.6/transition",
  "prompt": "Golden afternoon fades to deep blue twilight. Café empties, chairs stacked, warm lights flicker on as sunlight disappears.",
  "first_image_url": "cafe-day.jpg",
  "end_image_url": "cafe-night.jpg",
  "duration": "8"
}
```

---

## Strengths
- 5 built-in style presets (anime, 3D animation, clay, comic, cyberpunk)
- 20 camera movement presets (fast I2V endpoint)
- Native audio generation (BGM, SFX, dialogue)
- Dedicated transition endpoint for scene morphing
- Prompt optimization via thinking mode
- Competitive pricing ($0.35–$1.50/clip)

## Limitations
- Max 1080p (no 4K)
- 10s max duration (1080p limited to 8s)
- Character consistency is fair (no dedicated consistency system)
- Audio quality is functional but not production-grade
- Camera presets only on v5.5 fast endpoint, not v5.6

## Cost Matrix

| Duration | 360p/540p | 720p | 1080p |
|----------|-----------|------|-------|
| 5s video | $0.35 | $0.45 | $0.75 |
| 5s + audio | $0.80 | $0.90 | $1.50 |
| 8s video | $0.70 | $0.90 | $1.50 |
| 8s + audio | $1.60 | $1.80 | $3.00 |
| 10s video | $0.77 | $0.99 | ❌ |

---

## Common Mistakes
1. **1080p + 10s** — Not supported. Use 720p for 10s or 1080p for 8s max
2. **Thinking mode on detailed prompts** — Use `disabled` for precise prompts
3. **Style preset for realism** — Omit `style` for photorealistic output
4. **Conflicting camera instructions** — Don't describe camera motion in prompt when using `camera_movement` parameter
5. **Audio without sound descriptions** — Include sound cues in prompt when audio enabled
