# LTX-2 19B — ShotPilot Quick Reference

## Model Overview

**IDs:** `fal-ai/ltx-2-19b/text-to-video` | `fal-ai/ltx-2-19b/image-to-video`  
**Type:** Video generation (with audio)  
**Cost:** $0.0018/megapixel (e.g., 720p × 121 frames ≈ $0.20)  
**Developer:** Lightricks (open source)

LTX-2 19B generates high-quality video with synchronized audio from text or images. Features built-in camera LoRAs, first+last frame interpolation, multi-scale generation, and ProRes output.

## Key Parameters

### Text-to-Video
| Parameter | Default | Options |
|-----------|---------|---------|
| `prompt` | required | Descriptive, motion-focused |
| `num_frames` | `121` | 9–481 |
| `video_size` | `landscape_4_3` | Standard presets + custom |
| `generate_audio` | `true` | Synchronized audio |
| `use_multiscale` | `true` | Two-pass for better coherence |
| `fps` | `25` | 1–60 |
| `guidance_scale` | `3` | 1–10 |
| `num_inference_steps` | `40` | 8–50 |
| `acceleration` | `regular` | `none`, `regular`, `high`, `full` |
| `camera_lora` | `none` | `dolly_in/out`, `dolly_left/right`, `jib_up/down`, `static` |
| `camera_lora_scale` | `1` | 0–1 |
| `video_output_type` | `X264 (.mp4)` | Also `VP9 (.webm)`, `PRORES4444 (.mov)`, `GIF (.gif)` |
| `video_quality` | `high` | `low`, `medium`, `high`, `maximum` |

### Image-to-Video (additional)
| Parameter | Default | Description |
|-----------|---------|-------------|
| `image_url` | required | Source image |
| `end_image_url` | — | Target end frame |
| `image_strength` | `1` | 0–1, start image fidelity |
| `end_image_strength` | `1` | 0–1, end image fidelity |
| `interpolation_direction` | `forward` | `forward` or `backward` |

## Prompting Rules

1. **Describe motion explicitly** — static descriptions → static video
2. **Separate subject/environment/camera motion** in your prompt
3. **Use camera LoRAs** for reliable movement (don't just describe in text)
4. **Think in seconds** — 121 frames @25fps = ~5s, match prompt complexity to duration
5. **Include sound cues** when `generate_audio: true`

## Camera LoRA Quick Guide
| LoRA | Use |
|------|-----|
| `dolly_in` | Dramatic emphasis, reveals |
| `dolly_out` | Context reveals, endings |
| `dolly_left/right` | Following motion, tracking |
| `jib_up` | Establishing shots, reveals |
| `jib_down` | Introductions, settling |
| `static` | Dialogue, stability, portraits |

## Cost Examples
| Resolution | Frames | Duration | Cost |
|-----------|--------|----------|------|
| 1280×720 | 121 | ~5s | $0.20 |
| 1280×720 | 241 | ~10s | $0.40 |
| 768×512 | 121 | ~5s | $0.09 |
| 1920×1080 | 121 | ~5s | $0.45 |

## Cinematic Examples

**Character Introduction:**
```json
{
  "prompt": "A woman in a dark coat walks down a rain-soaked cobblestone street at night. She passes under warm streetlights that illuminate her face momentarily. Puddles reflect neon signs. Her heels click rhythmically.",
  "camera_lora": "dolly_right",
  "camera_lora_scale": 0.8,
  "num_frames": 161,
  "video_size": "landscape_16_9",
  "generate_audio": true
}
```

**Dramatic Reveal:**
```json
{
  "prompt": "A white chess king on an empty board in a dark room. Single overhead spotlight. Camera slowly approaches, revealing carved details and cracks in marble. Dust particles drift through the light beam.",
  "camera_lora": "dolly_in",
  "num_frames": 121,
  "generate_audio": false
}
```

**Image Animation:**
```json
{
  "prompt": "The portrait comes to life. Eyes blink slowly, head turns slightly right with a subtle smile. Hair moves in a light breeze. Natural, subtle movement only.",
  "image_url": "https://portrait.jpg",
  "image_strength": 0.95,
  "camera_lora": "static",
  "num_frames": 121
}
```

## Strengths
- ⭐ Native audio generation
- ⭐ Camera LoRA controls (no external adapters)
- ⭐ First + last frame interpolation
- ⭐ Multi-scale for temporal coherence
- ⭐ Up to 481 frames (~19s)
- ⭐ ProRes 4444 output
- ⭐ Acceleration levels for speed/quality tradeoff
- ⭐ Open source, commercially licensable

## Limitations
- ❌ Faces can be inconsistent in motion
- ❌ No character locking across clips
- ❌ No lip sync / dialogue
- ❌ Hand/finger detail issues
- ❌ Audio is ambient/effects only (not speech)
- ❌ Quality degrades above 1080p

## When to Use
✅ Video with audio, camera control, interpolation, ProRes workflow, budget-conscious  
❌ Need photorealistic faces → Kling 3.0 | Need dialogue → Veo 3.1 | Need images → Use image models

## Quick Code
```javascript
const result = await fal.subscribe("fal-ai/ltx-2-19b/text-to-video", {
  input: {
    prompt: "A cowboy walks through a dusty town at high noon...",
    num_frames: 121,
    video_size: "landscape_16_9",
    camera_lora: "dolly_right",
    generate_audio: true,
    acceleration: "regular"
  }
});
console.log(result.data.video.url);
```

## Speed/Quality Matrix
| Combo | Use |
|-------|-----|
| multiscale ON + accel none | Final render |
| multiscale ON + accel regular | Production default |
| multiscale OFF + accel high | Rapid iteration |
| multiscale OFF + accel full | Storyboarding |
