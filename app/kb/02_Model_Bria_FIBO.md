# Bria FIBO — ShotPilot Quick Reference

## Model Overview

**IDs:** `bria/fibo/generate` | `bria/fibo-edit/edit`  
**Type:** Image generation + editing (JSON-native structured prompting)  
**Cost:** $0.04/image (generate or edit)  
**Developer:** Bria AI (open source)  
**Training Data:** 100% licensed — full commercial/legal safety

FIBO is the only major model trained exclusively on licensed data. It features a revolutionary JSON-native structured prompting system with **disentangled control** — change one visual parameter without breaking the scene. Three workflows: Generate → Refine → Inspire.

## Key Parameters

### Generate
| Parameter | Default | Options |
|-----------|---------|---------|
| `prompt` | — | Simple text prompt |
| `structured_prompt` | — | JSON object (see schema below) |
| `image_url` | — | Reference image (Inspire mode) |
| `seed` | `5555` | Reproducibility |
| `steps_num` | `50` | 20–50 |
| `aspect_ratio` | `1:1` | `1:1`, `2:3`, `3:2`, `3:4`, `4:3`, `4:5`, `5:4`, `9:16`, `16:9` |
| `negative_prompt` | `""` | Content to avoid |
| `guidance_scale` | `5` | 3–5 |

### Edit
| Parameter | Default | Description |
|-----------|---------|-------------|
| `image_url` | — | Image to edit |
| `mask_url` | — | Optional mask for targeted edits |
| `instruction` | — | Natural language edit instruction |
| `structured_instruction` | — | JSON structured edit |
| `steps_num` | `30` | 20–50 |

## Structured Prompt Schema (Key Fields)

```json
{
  "structured_prompt": {
    "short_description": "One-line scene description",
    "objects": [{
      "description": "What it is",
      "location": "Where in frame",
      "relationship": "Relation to other objects (REQUIRED)",
      "pose": "Body position",
      "expression": "Facial expression",
      "clothing": "What they wear",
      "action": "What they're doing"
    }],
    "background_setting": "Environment description",
    "lighting": {
      "conditions": "golden hour / studio / overcast...",
      "direction": "camera left / above / behind...",
      "shadows": "soft / hard / long..."
    },
    "aesthetics": {
      "composition": "rule of thirds / centered...",
      "color_scheme": "warm amber / teal complement...",
      "mood_atmosphere": "contemplative / epic..."
    },
    "photographic_characteristics": {
      "depth_of_field": "shallow / deep",
      "focus": "sharp on...",
      "camera_angle": "low / eye level / overhead",
      "lens_focal_length": "85mm / 35mm wide..."
    },
    "style_medium": "Photography / oil painting...",
    "artistic_style": "Film noir / impressionist..."
  }
}
```

## Three Workflows

### 1. Generate — Start from text
```json
{ "prompt": "A jazz musician in a smoky club", "aspect_ratio": "3:2" }
```
→ Returns image + full structured prompt

### 2. Refine — Modify one attribute
Take returned structured prompt, change ONE field:
```json
{ "structured_prompt": { "...same...", "lighting": { "conditions": "colored stage gels" } } }
```
→ Same scene, different lighting only

### 3. Inspire — Start from image
```json
{ "image_url": "https://reference.jpg", "prompt": "Make it more dramatic" }
```
→ Extracts visual DNA + applies your modification

## Cinematic Example

**Film Noir (Structured):**
```json
{
  "structured_prompt": {
    "short_description": "A femme fatale in a 1940s detective office",
    "objects": [{
      "description": "Woman in her 30s with striking features",
      "location": "Left third, doorway",
      "relationship": "Main subject",
      "clothing": "Dark dress, fur stole, wide-brimmed hat",
      "expression": "Mysterious half-smile"
    }],
    "lighting": {
      "conditions": "Single hard source through venetian blinds",
      "direction": "Camera right through window",
      "shadows": "Hard stripe pattern from blinds"
    },
    "aesthetics": {
      "color_scheme": "Monochrome, rich tonal range",
      "mood_atmosphere": "Tension, mystery"
    },
    "photographic_characteristics": {
      "camera_angle": "Slightly low angle",
      "lens_focal_length": "35mm"
    }
  },
  "aspect_ratio": "16:9"
}
```

## The Disentangled Control Advantage

Change ONLY lighting → same scene, different mood:
```json
"lighting": { "conditions": "harsh noon sun", "direction": "directly above", "shadows": "short, hard" }
```

Change ONLY lens → same scene, different feel:
```json
"photographic_characteristics": { "lens_focal_length": "200mm telephoto" }
```

Each generates a recognizably similar scene with JUST that parameter different.

## Strengths
- ⭐ 100% licensed training data — legal certainty
- ⭐ JSON structured prompting (disentangled control)
- ⭐ Change one attribute without breaking scene
- ⭐ Returns structured prompt for iteration
- ⭐ Generate / Refine / Inspire workflows
- ⭐ Edit with masks + instructions
- ⭐ $0.04/image (competitive WITH legal safety)
- ⭐ Open source

## Limitations
- ❌ Not top-tier photorealism (vs Flux/Qwen)
- ❌ Single image output (no batch)
- ❌ Fixed aspect ratios only
- ❌ Narrow guidance range (3–5)
- ❌ No text rendering strength
- ❌ No ControlNet / style presets
- ❌ No video

## When to Use
✅ Commercial/advertising work, brand assets, structured art direction, A/B testing parameters, enterprise compliance  
❌ Photorealism → Flux/Qwen | Typography → Ideogram | Video → LTX-2 | Style presets → Ideogram

## Quick Code
```javascript
// Generate
const result = await fal.subscribe("bria/fibo/generate", {
  input: {
    prompt: "A warrior in ornate armor at golden hour",
    aspect_ratio: "16:9",
    steps_num: 50,
    guidance_scale: 5
  }
});

// Refine (change lighting only)
const sp = result.data.structured_prompt;
sp.lighting = { conditions: "storm light", direction: "above and behind", shadows: "deep, dramatic" };
const refined = await fal.subscribe("bria/fibo/generate", {
  input: { structured_prompt: sp, aspect_ratio: "16:9" }
});

// Edit
const edited = await fal.subscribe("bria/fibo-edit/edit", {
  input: {
    image_url: result.data.image.url,
    instruction: "change background to misty forest at dawn"
  }
});
```

## Budget Strategy
- Explore: 3 generations × $0.04 = $0.12
- Refine: 4 lighting tests × $0.04 = $0.16
- Polish: 2 edits × $0.04 = $0.08
- **Total: $0.36** for a legally-safe, professionally iterated commercial asset
