# Qwen Image Max — ShotPilot Quick Reference

## Model Overview

**ID:** `fal-ai/qwen-image-max/text-to-image` | `fal-ai/qwen-image-max/edit`  
**Type:** Image generation + editing  
**Cost:** $0.075/image (flat rate, all sizes)  
**Developer:** Alibaba Cloud (Qwen Team)

Qwen Image Max is Alibaba's flagship image model emphasizing **photorealism, bilingual prompting (Chinese + English), and text rendering**. It includes an edit endpoint supporting up to 3 reference images.

## Key Parameters

### Text-to-Image
| Parameter | Default | Options |
|-----------|---------|---------|
| `prompt` | required | Max 800 chars, Chinese + English |
| `negative_prompt` | `""` | Max 500 chars |
| `image_size` | `square_hd` | `square_hd`, `square`, `portrait_4_3`, `portrait_16_9`, `landscape_4_3`, `landscape_16_9`, custom `{width, height}` |
| `enable_prompt_expansion` | `true` | Built-in LLM rewrites prompt for better results |
| `num_images` | `1` | 1–4 |
| `seed` | random | 0–2147483647 |
| `output_format` | `png` | `jpeg`, `png`, `webp` |

### Image Edit
Same params plus:
| Parameter | Description |
|-----------|-------------|
| `image_urls` | 1–3 reference images (384–5000px, max 10MB each, JPEG/PNG/WEBP) |

Reference images as "image 1", "image 2", "image 3" in prompt.

## Prompting Rules

1. **Let prompt expansion work** — enable for exploration, disable for precision
2. **Natural language > tag soup** — write full sentences, not keyword lists
3. **Front-load the subject** — first clause gets strongest weight
4. **Use the edit endpoint** for iteration instead of regenerating from scratch
5. **Text in quotes** — `"HELLO WORLD"` for text rendering in images

## Prompt Structure
```
[SUBJECT + ACTION] → [ENVIRONMENT] → [LIGHTING] → [CAMERA/LENS] → [MOOD/ATMOSPHERE]
```

## Cinematic Examples

**Establishing Shot:**
```
A breathtaking aerial establishing shot of an ancient Japanese temple complex nestled in misty mountains at dawn. Golden rays pierce through fog, illuminating curved rooftops with warm amber light. Shot with tilt-shift effect.
```

**Portrait:**
```
An extreme close-up portrait of a weathered sea captain. Deep wrinkles, steel-blue eyes catching setting sun light from camera left, creating Rembrandt triangle on right cheek. Shot on 85mm f/1.4, subtle film grain.
```

**Edit — Sky Replacement:**
```json
{
  "prompt": "Replace the sky with a dramatic stormy sky, matching the lighting",
  "image_urls": ["scene.jpg", "sky-reference.jpg"]
}
```

## Strengths
- ⭐ Bilingual Chinese/English (unique advantage)
- ⭐ Strong photorealism, especially human subjects
- ⭐ Text rendering (both languages)
- ⭐ Multi-image editing with natural language
- ⭐ Built-in LLM prompt expansion
- ⭐ Simple, clean API

## Limitations
- ❌ No ControlNet/spatial control
- ❌ No LoRA/fine-tuning
- ❌ Max 4 images per batch
- ❌ 800 char prompt limit
- ❌ No inpainting/masking (edit is global)
- ❌ Higher price point vs Flux/Ideogram

## When to Use
✅ Bilingual content, photorealistic humans, text rendering, generation-then-edit workflow  
❌ Need spatial control → Flux | Need video → LTX-2 | Budget-tight → Ideogram TURBO | Typography → Ideogram

## Quick Code
```javascript
const result = await fal.subscribe("fal-ai/qwen-image-max/text-to-image", {
  input: {
    prompt: "A cinematic wide shot of a samurai in a bamboo forest at dawn",
    image_size: "landscape_16_9",
    enable_prompt_expansion: false,
    output_format: "png"
  }
});
```

## Negative Prompt Baseline
```
low resolution, error, worst quality, low quality, deformed, blurry, watermark, text overlay, cropped, out of frame, extra limbs, disfigured, bad anatomy, jpeg artifacts
```
