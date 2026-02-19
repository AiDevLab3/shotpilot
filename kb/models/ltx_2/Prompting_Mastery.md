# LTX-2 19B: Complete Prompting Mastery Guide

**Model:** LTX-2 19B  
**API Model IDs:** `fal-ai/ltx-2-19b/text-to-video` · `fal-ai/ltx-2-19b/image-to-video`  
**Developer:** Lightricks  
**Architecture:** 19B parameter DiT (Diffusion Transformer)  
**Status:** Leading open-source video generation model

> **Family:** LTX-2 is available in two variants on fal.ai: the full **19B** model for maximum quality and a lighter **13B distilled** variant for faster/cheaper inference. This guide focuses on the 19B flagship.

---

## Executive Summary

LTX-2 19B is Lightricks' flagship open-source video generation model, capable of producing high-quality video **with synchronized audio** from both text prompts and image inputs. It features built-in **camera LoRA controls**, **multi-scale generation**, **first/last frame interpolation**, and **multiple output formats** including ProRes 4444 for professional post-production. At $0.0018/megapixel, it's one of the most cost-effective video generation solutions available.

**Key Differentiators:**
- Native audio generation synchronized with video content
- Built-in camera LoRA controls (dolly, jib, static — no external adapter needed)
- First-frame AND last-frame conditioning (image-to-video with end frame)
- Multi-scale generation for improved coherence and detail
- Up to 481 frames (~19 seconds at 25fps)
- ProRes 4444 output for professional VFX pipelines
- Adjustable acceleration levels for speed/quality tradeoff
- Open source (commercially licensable)

---

## Section 0: The Golden Rules of Video Prompting

Video prompting is fundamentally different from image prompting. Motion, timing, and temporal coherence add an entirely new dimension.

### Rule 1: Describe Motion Explicitly

The model needs clear motion cues. Static descriptions produce static-looking video.

**❌ Bad:**
```
A woman in a city at night
```

**✅ Good:**
```
A woman stands still amid a busy neon-lit street at night. The camera slowly dollies in toward her face as people blur past, their motion emphasizing her calm presence. City lights flicker and reflections shift across her denim jacket.
```

### Rule 2: Separate Subject Motion from Camera Motion

Keep your motion descriptions layered:
1. **Subject motion** — what the characters/objects are doing
2. **Environment motion** — what the world is doing (wind, water, traffic)
3. **Camera motion** — how the viewport moves

```
Subject: A barista pours steamed milk in a slow, controlled arc, creating latte art.
Environment: Steam rises from the cup, catching morning light. Other customers move softly in the blurred background.
Camera: Tight close-up, slowly pulling back to reveal the full cup and the barista's satisfied expression.
```

### Rule 3: Use Camera LoRAs for Reliable Movement

Don't just describe camera motion in text — use the built-in `camera_lora` parameter for reliable, smooth camera work:

| LoRA | Motion | Best For |
|------|--------|----------|
| `dolly_in` | Camera moves toward subject | Reveals, dramatic emphasis |
| `dolly_out` | Camera moves away from subject | Context reveals, endings |
| `dolly_left` | Camera tracks left | Following motion, panning |
| `dolly_right` | Camera tracks right | Following motion, panning |
| `jib_up` | Camera cranes upward | Reveals, establishing shots |
| `jib_down` | Camera cranes downward | Introductions, settling |
| `static` | Locked camera, no movement | Dialogue, portraits, stability |
| `none` | Model decides based on prompt | Default, flexible |

### Rule 4: Think in Seconds, Not Frames

Calculate your video timing:
- **121 frames at 25fps** = ~4.84 seconds (default)
- **241 frames at 25fps** = ~9.64 seconds
- **481 frames at 25fps** = ~19.24 seconds

Match your prompt complexity to the duration. A 5-second clip should describe ONE action or moment. A 19-second clip can handle a short sequence.

### Rule 5: The Negative Prompt is Pre-Loaded — Modify, Don't Replace

LTX-2 ships with an extensive default negative prompt covering common video artifacts. You can override it, but the default is well-tuned. Only modify if you have specific needs.

---

## Section 1: Complete API Reference

### Text-to-Video Endpoint

**Endpoint:** `https://fal.run/fal-ai/ltx-2-19b/text-to-video`  
**Method:** POST

#### Input Parameters

| Parameter | Type | Required | Default | Range | Description |
|-----------|------|----------|---------|-------|-------------|
| `prompt` | string | ✅ | — | — | Video description |
| `num_frames` | integer | ❌ | `121` | 9–481 | Frame count |
| `video_size` | ImageSize \| Enum | ❌ | `"landscape_4_3"` | — | Resolution |
| `generate_audio` | boolean | ❌ | `true` | — | Sync audio generation |
| `use_multiscale` | boolean | ❌ | `true` | — | Multi-scale for coherence |
| `fps` | float | ❌ | `25` | 1–60 | Frames per second |
| `guidance_scale` | float | ❌ | `3` | 1–10 | Prompt adherence strength |
| `num_inference_steps` | integer | ❌ | `40` | 8–50 | Denoising steps |
| `acceleration` | enum | ❌ | `"regular"` | — | Speed/quality tradeoff |
| `camera_lora` | enum | ❌ | `"none"` | — | Camera movement control |
| `camera_lora_scale` | float | ❌ | `1` | 0–1 | Camera LoRA intensity |
| `negative_prompt` | string | ❌ | (extensive default) | — | Content to avoid |
| `seed` | integer | ❌ | random | — | Reproducibility |
| `enable_prompt_expansion` | boolean | ❌ | `true` | — | LLM prompt enhancement |
| `enable_safety_checker` | boolean | ❌ | `true` | — | Content moderation |
| `video_output_type` | enum | ❌ | `"X264 (.mp4)"` | — | Container/codec |
| `video_quality` | enum | ❌ | `"high"` | — | Encoding quality |
| `video_write_mode` | enum | ❌ | `"balanced"` | — | Encoding speed |
| `sync_mode` | boolean | ❌ | `false` | — | Data URI return |

### Image-to-Video Endpoint

**Endpoint:** `https://fal.run/fal-ai/ltx-2-19b/image-to-video`  
**Method:** POST

#### Additional Parameters (beyond text-to-video)

| Parameter | Type | Required | Default | Range | Description |
|-----------|------|----------|---------|-------|-------------|
| `image_url` | string | ✅ | — | — | Source image URL |
| `end_image_url` | string | ❌ | — | — | Target end frame image |
| `interpolation_direction` | enum | ❌ | `"forward"` | — | `forward` or `backward` |
| `image_strength` | float | ❌ | `1` | 0–1 | Start image influence |
| `end_image_strength` | float | ❌ | `1` | 0–1 | End image influence |

**Note:** The image-to-video endpoint defaults `video_size` to `"auto"` (matches input image).

#### Output Schema (Both Endpoints)

```json
{
  "video": {
    "url": "https://v3b.fal.media/files/.../output.mp4",
    "content_type": "video/mp4",
    "file_name": "output.mp4",
    "width": 1248,
    "height": 704,
    "duration": 6.44,
    "fps": 25,
    "num_frames": 161
  },
  "seed": 149063119,
  "prompt": "The expanded prompt used for generation..."
}
```

### Acceleration Levels

| Level | Speed | Quality | Cost | Best For |
|-------|-------|---------|------|----------|
| `none` | Slowest | Highest | Highest | Final renders |
| `regular` | Standard | High | Standard | Default production |
| `high` | Fast | Good | Lower | Rapid iteration |
| `full` | Fastest | Acceptable | Lowest | Previews, storyboards |

### Video Output Formats

| Format | Codec | Extension | Best For |
|--------|-------|-----------|----------|
| `X264 (.mp4)` | H.264 | .mp4 | Web delivery, general use |
| `VP9 (.webm)` | VP9 | .webm | Web-optimized, smaller files |
| `PRORES4444 (.mov)` | ProRes 4444 | .mov | Professional VFX/compositing |
| `GIF (.gif)` | GIF | .gif | Social media, previews |

### Video Quality Settings

| Quality | Bitrate | File Size | Use Case |
|---------|---------|-----------|----------|
| `low` | Minimum | Smallest | Quick previews |
| `medium` | Moderate | Small | Social media |
| `high` | High | Large | Production (default) |
| `maximum` | Maximum | Largest | Master files |

### Video Write Mode

| Mode | Encoding Speed | File Size | Use Case |
|------|---------------|-----------|----------|
| `fast` | Fastest encode | Larger | Quick turnaround |
| `balanced` | Standard | Standard | Default |
| `small` | Slowest encode | Smallest | Storage efficiency |

---

## Section 2: Pricing & Cost Optimization

### Cost Structure

**$0.0018 per megapixel of generated video data** (width × height × frames)

#### Cost Examples

| Resolution | Frames | Duration @25fps | Megapixels | Cost |
|-----------|--------|-----------------|------------|------|
| 1280×720 | 121 | 4.84s | ~112 MP | **$0.20** |
| 1280×720 | 241 | 9.64s | ~222 MP | **$0.40** |
| 1280×720 | 481 | 19.24s | ~443 MP | **$0.80** |
| 768×512 | 121 | 4.84s | ~48 MP | **$0.09** |
| 1920×1080 | 121 | 4.84s | ~251 MP | **$0.45** |
| 1920×1080 | 481 | 19.24s | ~998 MP | **$1.80** |

### Cost Optimization Strategies

1. **Start small:** Use 768×512 + `acceleration: "full"` for concept validation (~$0.05/clip)
2. **Use fewer frames** for simple motions — 65 frames (2.6s) often suffices
3. **Use `high` acceleration** for iterative prompting, `regular` for final
4. **Multi-scale ON** improves quality enough to use lower resolution
5. **Use `fast` write mode** during development
6. **GIF output** for quick review (smaller files)
7. **Batch your final renders** with `none` acceleration + `maximum` quality + ProRes

### Cost Comparison

| Model | ~5s clip at 720p | Notes |
|-------|-----------------|-------|
| **LTX-2 19B** | ~$0.20 | Open source, with audio |
| Kling 3.0 | ~$0.30-0.50 | Higher quality, closed |
| Veo 3.1 | ~$0.50-1.00 | Google's flagship |
| Runway Gen-3 | ~$0.50 | Via Runway API |

---

## Section 3: Cinematic Video Prompting

### 3.1 The Anatomy of a Video Prompt

```
[SCENE DESCRIPTION] + [SUBJECT MOTION] + [CAMERA MOTION] + [LIGHTING/ATMOSPHERE] + [AUDIO CUES]
```

**Note:** When `generate_audio: true`, the model will interpret audio cues from your prompt.

### 3.2 Shot-by-Shot Examples

#### Establishing Shot — City at Dawn
```json
{
  "prompt": "Aerial view of a sprawling coastal city as dawn breaks. The camera slowly jib up, revealing the full skyline as golden light spreads across the buildings from left to right. Morning fog clings to the harbor. Ships begin to move in the water below. The city gradually awakens with tiny lights turning on and off in buildings.",
  "camera_lora": "jib_up",
  "camera_lora_scale": 0.7,
  "num_frames": 241,
  "video_size": "landscape_16_9",
  "fps": 25,
  "generate_audio": true
}
```

#### Character Introduction — Walking Shot
```json
{
  "prompt": "A woman in a long dark coat walks purposefully down a rain-soaked European cobblestone street at night. She passes under a sequence of warm streetlights that illuminate her face momentarily before she moves back into shadow. Her heels click rhythmically. Raindrops catch the light. Puddles reflect neon signs from nearby cafes. She does not look back.",
  "camera_lora": "dolly_right",
  "camera_lora_scale": 0.8,
  "num_frames": 161,
  "video_size": "landscape_16_9",
  "guidance_scale": 4,
  "generate_audio": true
}
```

#### Dramatic Reveal — Dolly In
```json
{
  "prompt": "A lone chess piece — a white king — stands on an otherwise empty chessboard in a dark room. A single overhead spotlight creates a tight circle of light around it. The camera slowly dollies in from a wide shot to an extreme close-up of the piece, revealing intricate carved details and hairline cracks in the marble. Dust particles drift through the spotlight beam.",
  "camera_lora": "dolly_in",
  "camera_lora_scale": 1.0,
  "num_frames": 121,
  "video_size": "landscape_4_3",
  "guidance_scale": 5,
  "generate_audio": false
}
```

#### Action Sequence — Explosion
```json
{
  "prompt": "A derelict warehouse engulfed in a massive explosion. Glass shatters outward in slow motion. Flames billow from every window. Debris arcs through the air, trailing smoke. The shockwave visibly distorts the air. The camera is locked on a tripod, perfectly static, as the chaos unfolds. Thick black smoke rises into a gray sky.",
  "camera_lora": "static",
  "camera_lora_scale": 1.0,
  "num_frames": 121,
  "video_size": "landscape_16_9",
  "fps": 25,
  "guidance_scale": 4,
  "generate_audio": true
}
```

#### Nature — Timelapse Style
```json
{
  "prompt": "A timelapse of a flower blooming in a lush garden. The petals slowly unfurl from a tight bud to a fully open blossom over several hours, compressed into seconds. Clouds race across the sky above. Shadows sweep across the ground. Insects briefly visit. The light transitions from cool morning blue through warm midday gold to soft evening amber.",
  "camera_lora": "static",
  "num_frames": 241,
  "video_size": "square_hd",
  "guidance_scale": 3,
  "generate_audio": false
}
```

### 3.3 Image-to-Video Workflows

#### Animating a Still Photo
```json
{
  "prompt": "The portrait comes to life. The woman's eyes blink slowly, then she turns her head slightly to the right with a subtle, knowing smile. Her hair moves gently as if caught by a light breeze. The lighting remains consistent with the original photograph. Subtle, natural movement only.",
  "image_url": "https://your-portrait.jpg",
  "num_frames": 121,
  "image_strength": 0.95,
  "camera_lora": "static",
  "generate_audio": false
}
```

#### First-to-Last Frame Interpolation
```json
{
  "prompt": "A smooth camera movement transitioning from the first scene to the second. The environment gradually transforms — architecture morphing, colors shifting, time of day changing. The transition feels dreamlike and continuous, not abrupt.",
  "image_url": "https://scene-start.jpg",
  "end_image_url": "https://scene-end.jpg",
  "image_strength": 1.0,
  "end_image_strength": 1.0,
  "interpolation_direction": "forward",
  "num_frames": 161,
  "camera_lora": "none"
}
```

#### Concept Art to Motion
```json
{
  "prompt": "The painted concept art transforms into a living scene. Waves begin to move, birds take flight across the sky, trees sway in the wind. The painterly quality is maintained but everything is subtly in motion. Atmospheric particles drift. Clouds move slowly across the sky.",
  "image_url": "https://concept-art.jpg",
  "num_frames": 241,
  "image_strength": 0.85,
  "guidance_scale": 3,
  "generate_audio": true
}
```

### 3.4 Audio-Aware Prompting

When `generate_audio: true`, include sound descriptions:

```
A blacksmith hammers a glowing iron rod on an anvil in a medieval forge. 
Each hammer strike sends sparks flying. The rhythmic CLANG of metal on metal 
echoes in the stone workshop. Fire crackles in the forge. Bellows wheeze. 
The blacksmith grunts with effort on the final powerful strike.
```

**Audio works best with:**
- Clear, distinct sounds (impacts, speech-like sounds, nature)
- Rhythmic/repetitive sounds matching visual motion
- Environmental ambience (rain, wind, traffic, crowds)

**Audio struggles with:**
- Complex musical compositions
- Specific dialogue or lyrics
- Subtle/quiet sounds

---

## Section 4: Multi-Scale Generation

### What is Multi-Scale?

When `use_multiscale: true` (default), the model:
1. Generates the video at a **smaller resolution** first
2. Uses that small video as a **guide** to generate at your requested resolution
3. Results in **better temporal coherence** and **finer details**

### When to Use Multi-Scale

| Scenario | Multi-Scale | Why |
|----------|------------|-----|
| Final production render | ✅ ON | Maximum quality |
| Quick concept test | ❌ OFF | Faster, cheaper |
| Complex multi-subject scenes | ✅ ON | Better coherence |
| Simple single-subject motion | Either | Less benefit |
| High resolution (1080p+) | ✅ ON | Significantly better |
| Low resolution (512p) | ❌ OFF | Minimal benefit |

### Multi-Scale + Acceleration Combos

| Combo | Speed | Quality | Use Case |
|-------|-------|---------|----------|
| multiscale ON + acceleration none | Slowest | Best | Final render |
| multiscale ON + acceleration regular | Standard | Great | Production default |
| multiscale OFF + acceleration high | Fast | Good | Rapid iteration |
| multiscale OFF + acceleration full | Fastest | Acceptable | Storyboarding |

---

## Section 5: Camera LoRA Deep Dive

### Combining Camera LoRAs with Prompt Direction

The `camera_lora` parameter provides reliable, smooth camera motion. But you can layer additional camera descriptions in your prompt for complex movements:

```json
{
  "prompt": "Starting from a bird's-eye view of a Japanese garden, the camera slowly descends through cherry blossom branches while simultaneously rotating clockwise. As we pass through the canopy, a tea ceremony is revealed below.",
  "camera_lora": "jib_down",
  "camera_lora_scale": 0.8
}
```

### Camera LoRA Scale

The `camera_lora_scale` (0–1) controls intensity:

| Scale | Effect | Best For |
|-------|--------|----------|
| 0.0 | No camera movement (same as `none`) | — |
| 0.3 | Subtle, gentle movement | Interviews, portraits |
| 0.5 | Moderate movement | Standard coverage |
| 0.7 | Strong, noticeable movement | Dramatic reveals |
| 1.0 | Maximum movement | Extreme dolly/jib shots |

### Cinematic Camera Techniques via LoRA

**Vertigo / Dolly Zoom Effect:**
Combine `dolly_in` with a prompt describing the background pulling away:
```json
{
  "prompt": "A man stands on a cliff edge looking out at the ocean. The camera dollies in toward him while the background appears to stretch and recede, creating a disorienting vertigo effect. His expression shifts from calm to anxious.",
  "camera_lora": "dolly_in",
  "camera_lora_scale": 1.0,
  "guidance_scale": 5
}
```

**Overhead Reveal:**
```json
{
  "prompt": "A perfectly symmetrical overhead view of an ornate ballroom floor. Dancers in period costume twirl in synchronized patterns. The camera slowly jib up, revealing more and more of the intricate floor pattern and the growing number of dancers.",
  "camera_lora": "jib_up",
  "camera_lora_scale": 0.6
}
```

---

## Section 6: Advanced Techniques

### 6.1 Guidance Scale Tuning

| Value | Effect | Best For |
|-------|--------|----------|
| 1–2 | Very creative, loose interpretation | Abstract art, dreamscapes |
| 3 | Balanced (default) | Most use cases |
| 4–5 | Strong prompt adherence | Precise direction, specific actions |
| 6–8 | Very strict, may reduce naturalness | Technical accuracy needed |
| 9–10 | Extremely strict, risk of artifacts | Rarely recommended |

### 6.2 Inference Steps Tuning

| Steps | Quality | Speed | Use Case |
|-------|---------|-------|----------|
| 8–15 | Draft | Very fast | Quick previews |
| 20–30 | Good | Fast | Iteration |
| 40 | High (default) | Standard | Production |
| 50 | Maximum | Slow | Final renders |

### 6.3 Frame Rate Considerations

| FPS | Duration for 121 frames | Feel | Use Case |
|-----|------------------------|------|----------|
| 12 | 10.1s | Stop-motion, stylized | Animation style |
| 24 | 5.0s | Cinema standard | Film look |
| 25 | 4.84s | PAL standard (default) | European broadcast |
| 30 | 4.0s | NTSC standard | American broadcast |
| 48 | 2.5s | HFR cinema | Smooth action |
| 60 | 2.0s | Gaming/sports | Ultra-smooth |

### 6.4 Image Strength for I2V

| Strength | Start Frame Fidelity | Creative Freedom | Best For |
|----------|---------------------|-----------------|----------|
| 1.0 | Exact match | Minimal | Animating photos exactly |
| 0.85 | Very close | Some | Slight reinterpretation |
| 0.7 | Approximate | Moderate | Inspired by source |
| 0.5 | Loose reference | High | Using as mood board |
| 0.3 | Barely visible | Very high | Color/composition hint |

### 6.5 Interpolation Direction

- **`forward`**: Generates from start image toward end image (chronological)
- **`backward`**: Generates from end image toward start image (reverse chronological)

Use `backward` when your end frame is more important than your start frame, or for "how did we get here?" reveals.

---

## Section 7: Strengths & Limitations

### Strengths

| Strength | Details |
|----------|---------|
| **Audio Generation** | Synchronized audio from visual content — unique feature |
| **Camera LoRAs** | Built-in, reliable camera movement control |
| **First+Last Frame** | Interpolation between two key frames |
| **Multi-Scale** | Two-pass generation for better coherence |
| **Long Duration** | Up to 481 frames (~19s) in a single generation |
| **ProRes Output** | Professional VFX-ready output format |
| **Open Source** | Commercially licensable, self-hostable |
| **Acceleration** | Speed/quality tradeoff for iterative workflows |
| **Cost Effective** | Per-megapixel pricing, no minimum charge |
| **Prompt Expansion** | Built-in LLM enhancement |

### Limitations

| Limitation | Details |
|------------|---------|
| **Human Faces** | Can struggle with facial consistency in motion |
| **Complex Multi-Person** | Multiple characters interacting can break down |
| **Fine Text** | Text in video is unreliable |
| **Hand/Finger Detail** | Common AI video weakness persists |
| **Audio Quality** | Generated audio is ambient/effects, not dialogue |
| **No Character Locking** | No way to ensure consistent character across clips |
| **No Lip Sync** | Cannot generate speech-synced mouth movement |
| **Motion Blur** | Fast action can produce excessive blur artifacts |
| **Resolution Ceiling** | Quality degrades noticeably above 1080p |

### When to Choose LTX-2 19B

✅ **Choose it when:**
- You need integrated audio with video
- Camera control is important (LoRA system is excellent)
- You want first+last frame interpolation
- Budget matters (very competitive pricing)
- You need ProRes output for post-production
- Open source / self-hosting is a requirement
- Quick iteration with acceleration levels

❌ **Choose something else when:**
- Photorealistic human faces are critical → Kling 3.0
- You need dialogue/lip sync → Veo 3.1
- Extreme quality is the only concern → Kling 3.0, Veo 3.1
- You need character consistency across scenes → Specialized tools
- Text rendering in video is required → Still frames + composition

---

## Section 8: The 13B Distilled Variant

LTX-2 also comes in a **13B distilled** variant (`fal-ai/ltx-2-13b-distilled`), which offers:

| Feature | 19B | 13B Distilled |
|---------|-----|---------------|
| Quality | Higher | Good (80-90% of 19B) |
| Speed | Standard | Faster |
| Cost | Standard | Lower |
| Parameters | Same API | Same API |
| Best For | Final renders | Rapid prototyping |

Use 13B for storyboarding and concept validation, then switch to 19B for final renders. The API is identical — just change the model ID.

---

## Section 9: Production Integration

### JavaScript/TypeScript

```javascript
import { fal } from "@fal-ai/client";

fal.config({ credentials: process.env.FAL_KEY });

// Text-to-Video
const result = await fal.subscribe("fal-ai/ltx-2-19b/text-to-video", {
  input: {
    prompt: "A cowboy walking through a dusty town at high noon...",
    num_frames: 161,
    video_size: "landscape_16_9",
    generate_audio: true,
    use_multiscale: true,
    fps: 24,
    guidance_scale: 3,
    num_inference_steps: 40,
    acceleration: "regular",
    camera_lora: "dolly_right",
    camera_lora_scale: 0.7,
    video_output_type: "X264 (.mp4)",
    video_quality: "high"
  },
  logs: true,
  onQueueUpdate: (update) => {
    if (update.status === "IN_PROGRESS") {
      update.logs.map((log) => log.message).forEach(console.log);
    }
  },
});

console.log(result.data.video.url);
console.log(`Duration: ${result.data.video.duration}s`);
console.log(`Seed: ${result.data.seed}`);
```

### Python

```python
import fal_client

result = fal_client.subscribe(
    "fal-ai/ltx-2-19b/image-to-video",
    arguments={
        "prompt": "The scene comes to life with gentle motion...",
        "image_url": "https://your-image.jpg",
        "end_image_url": "https://your-end-frame.jpg",
        "num_frames": 161,
        "generate_audio": True,
        "camera_lora": "dolly_in",
        "camera_lora_scale": 0.8,
        "video_output_type": "PRORES4444 (.mov)",
        "video_quality": "maximum"
    },
    with_logs=True,
)

print(result["video"]["url"])
```

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/ltx-2-19b/text-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
    "prompt": "A cowboy walking through a dusty town at high noon, camera following from behind",
    "num_frames": 121,
    "video_size": "landscape_16_9",
    "camera_lora": "dolly_right",
    "generate_audio": true
  }'
```

---

## Section 10: Workflow Templates

### Storyboard-to-Video Pipeline

1. **Generate concept frames** with an image model (Qwen, Flux, etc.)
2. **Animate key frames** using LTX-2 image-to-video
3. **Connect scenes** using first+last frame interpolation
4. **Add camera work** with camera LoRAs
5. **Export ProRes** for editing in DaVinci Resolve / Premiere

### Shot List Execution Template

```json
// SHOT 1: Establishing
{
  "prompt": "[Wide establishing shot description]",
  "camera_lora": "jib_up",
  "num_frames": 161,
  "video_size": "landscape_16_9"
}

// SHOT 2: Introduction  
{
  "prompt": "[Character introduction]",
  "image_url": "[character reference]",
  "camera_lora": "dolly_in",
  "num_frames": 121
}

// SHOT 3: Detail
{
  "prompt": "[Close-up detail shot]",
  "camera_lora": "static",
  "num_frames": 81,
  "guidance_scale": 5
}
```

### A/B Testing Template

Generate the same scene with different camera treatments:
```javascript
const basePrompt = "A dancer performs a contemporary routine in an empty warehouse...";
const cameras = ["static", "dolly_in", "dolly_right", "jib_up"];
const seed = 42;

for (const camera of cameras) {
  await fal.subscribe("fal-ai/ltx-2-19b/text-to-video", {
    input: {
      prompt: basePrompt,
      camera_lora: camera,
      seed: seed,
      num_frames: 121,
      acceleration: "high" // Fast for testing
    }
  });
}
```

---

## Section 11: Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Jittery/flickering video | Low inference steps or frames | Increase `num_inference_steps` to 40+, enable `use_multiscale` |
| Camera doesn't move | LoRA scale too low or conflicting prompt | Increase `camera_lora_scale`, simplify camera description in prompt |
| Subject morphs/changes | Temporal inconsistency | Enable multi-scale, increase `guidance_scale` to 4-5 |
| Audio doesn't match | Vague audio cues | Add explicit sound descriptions in prompt |
| Output too large | High quality + long duration | Use `video_write_mode: "small"`, reduce quality for drafts |
| Faces distort | Common video model limitation | Use shorter clips, `static` camera, higher `guidance_scale` |
| Motion too fast | Too much action for frame count | Increase `num_frames` or simplify the action |
| Colors washed out | Default negative prompt too aggressive | Customize negative prompt, increase `guidance_scale` |

---

## Appendix: Quick Reference Card

```
TEXT-TO-VIDEO:  fal-ai/ltx-2-19b/text-to-video
IMAGE-TO-VIDEO: fal-ai/ltx-2-19b/image-to-video
COST:           $0.0018/megapixel (width × height × frames)
FRAMES:         9-481 (default 121)
FPS:            1-60 (default 25)
SIZES:          square_hd, square, portrait/landscape variants, custom, auto (i2v)
CAMERA LORAS:   dolly_in, dolly_out, dolly_left, dolly_right, jib_up, jib_down, static, none
ACCELERATION:   none, regular, high, full
FORMATS:        X264 (.mp4), VP9 (.webm), PRORES4444 (.mov), GIF (.gif)
QUALITY:        low, medium, high, maximum
AUDIO:          Built-in (generate_audio: true)
MULTI-SCALE:    Built-in (use_multiscale: true)
GUIDANCE:       1-10 (default 3)
STEPS:          8-50 (default 40)
I2V STRENGTH:   0-1 (default 1.0 for both start and end)
```

---

*Last updated: February 2026*  
*Cine-AI Prompt Compiler Knowledge Base — Priority 2 Model Guide*
