# Bria FIBO: Complete Prompting Mastery Guide

**Model:** Bria FIBO  
**API Model IDs:** `bria/fibo/generate` · `bria/fibo-edit/edit`  
**Developer:** Bria AI  
**Architecture:** 8B parameter diffusion model  
**Status:** Enterprise-grade, 100% licensed training data

> **The Legal Shield:** FIBO is the only major image generation model trained **exclusively on licensed data**. For any commercial project where training data provenance matters — advertising, brand work, editorial — FIBO eliminates the legal gray area entirely.

---

## Executive Summary

Bria FIBO is an enterprise-focused image generation model that solves the biggest commercial deployment problem in AI art: **legal certainty**. Trained exclusively on licensed, rights-cleared data, FIBO provides governance, repeatability, and legal clarity that no other model can match. But FIBO isn't just a compliance checkbox — it introduces a revolutionary **JSON-native structured prompting system** with disentangled control over lighting, camera, composition, color, and individual objects.

**Key Differentiators:**
- 100% licensed training data — full legal clarity for commercial use
- JSON-native structured prompting — control every visual parameter independently
- Disentangled control — change one attribute without breaking the scene
- Three workflows: Generate, Refine, Inspire
- 8B parameters — efficient, fast inference
- Structured prompt returned with every generation (for iterative refinement)
- Enterprise-grade governance and repeatability
- Edit endpoint with structured instruction control
- Open source

---

## Section 0: The Golden Rules of Prompting

FIBO is fundamentally different from other models. It thinks in **structured visual parameters**, not just text.

### Rule 1: Use Structured Prompts for Professional Control

FIBO's killer feature is JSON-native structured prompting. Instead of hoping the model interprets "warm golden hour lighting from the left," you specify it explicitly:

```json
{
  "structured_prompt": {
    "short_description": "A weathered fisherman mending nets at a harbor",
    "lighting": {
      "conditions": "golden hour",
      "direction": "camera left, 45 degrees above",
      "shadows": "long, soft-edged"
    },
    "photographic_characteristics": {
      "depth_of_field": "shallow, f/2.8",
      "focus": "sharp on hands and nets",
      "camera_angle": "slightly below eye level",
      "lens_focal_length": "85mm"
    },
    "aesthetics": {
      "composition": "rule of thirds, subject at left intersection",
      "color_scheme": "warm amber and teal complement",
      "mood_atmosphere": "contemplative, end of day calm"
    }
  }
}
```

### Rule 2: Start Simple, Then Refine

FIBO's three-stage workflow is designed for iteration:
1. **Generate**: Start with a short prompt → get image + expanded structured prompt
2. **Refine**: Modify specific attributes in the returned structured prompt → regenerate
3. **Inspire**: Use an existing image → get a structured prompt describing it → use that as a starting point

### Rule 3: Change One Thing at a Time

FIBO's disentangled control means you CAN change just the camera angle without affecting lighting, or just the color scheme without changing composition. This is revolutionary — USE it.

### Rule 4: Plain Text Prompts Still Work

You don't HAVE to use structured prompts. A simple `prompt` string works fine:
```json
{
  "prompt": "A hyper-detailed, ultra-fluffy owl sitting in the trees at night"
}
```
The model will generate the image AND return a full structured prompt you can then refine.

### Rule 5: Trust the Commercial Safety

FIBO's licensed training data means you can confidently use outputs for:
- Advertising campaigns
- Brand marketing materials
- Editorial content
- Product packaging
- Social media marketing
- Client deliverables

No other model offers this level of legal certainty.

---

## Section 1: Complete API Reference

### Generate Endpoint

**Endpoint:** `https://fal.run/bria/fibo/generate`  
**Method:** POST  
**Authentication:** `Authorization: Key $FAL_KEY`

#### Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | string | ❌* | — | Simple text prompt |
| `structured_prompt` | StructuredPrompt | ❌* | — | JSON structured prompt |
| `image_url` | string | ❌ | — | Reference image for Inspire mode |
| `seed` | integer | ❌ | `5555` | Reproducibility seed |
| `steps_num` | integer | ❌ | `50` | Inference steps (20–50) |
| `aspect_ratio` | enum | ❌ | `"1:1"` | Output aspect ratio |
| `negative_prompt` | string | ❌ | `""` | Content to avoid |
| `guidance_scale` | integer | ❌ | `5` | Prompt adherence (3–5) |
| `sync_mode` | boolean | ❌ | `false` | Data URI return |

*At least one of `prompt`, `structured_prompt`, or `image_url` should be provided.

#### Aspect Ratios

| Ratio | Orientation | Best For |
|-------|-------------|----------|
| `1:1` | Square | Social media, thumbnails |
| `2:3` | Portrait | Posters, character art |
| `3:2` | Landscape | Photography, scenes |
| `3:4` | Portrait | Print, editorial |
| `4:3` | Landscape | Traditional screens |
| `4:5` | Portrait | Instagram portrait |
| `5:4` | Landscape | Art prints |
| `9:16` | Portrait | Stories, mobile |
| `16:9` | Landscape | Widescreen, cinematic |

#### Structured Prompt Schema

```json
{
  "structured_prompt": {
    "short_description": "string — One-line scene description",
    
    "objects": [
      {
        "description": "string — What the object is",
        "location": "string — Where in the frame",
        "relationship": "string (required) — Relation to other objects",
        "relative_size": "string — Size relative to frame/other objects",
        "shape_and_color": "string — Visual appearance",
        "texture": "string — Surface quality",
        "appearance_details": "string — Fine details",
        "number_of_objects": "integer — Count",
        "pose": "string — Body position (for characters)",
        "expression": "string — Facial expression",
        "clothing": "string — What they're wearing",
        "action": "string — What they're doing",
        "gender": "string — Gender presentation",
        "skin_tone_and_texture": "string — Skin appearance",
        "orientation": "string — Direction facing"
      }
    ],
    
    "background_setting": "string — Environment description",
    
    "lighting": {
      "conditions": "string — Light type (golden hour, studio, overcast...)",
      "direction": "string — Where light comes from",
      "shadows": "string — Shadow characteristics"
    },
    
    "aesthetics": {
      "composition": "string — Framing and layout",
      "color_scheme": "string — Color palette description",
      "mood_atmosphere": "string — Emotional tone"
    },
    
    "photographic_characteristics": {
      "depth_of_field": "string — Focus range",
      "focus": "string — What's sharp",
      "camera_angle": "string — Viewpoint",
      "lens_focal_length": "string — Lens specification"
    },
    
    "style_medium": "string — Art style or medium",
    "text_render": ["list — Text to render in image"],
    "context": "string — Scene context or purpose",
    "artistic_style": "string — Artistic movement or reference"
  }
}
```

#### Output Schema

```json
{
  "image": {
    "url": "https://...",
    "content_type": "image/png",
    "file_name": "output.png",
    "file_size": 4404019,
    "width": 1024,
    "height": 1024
  },
  "images": [],
  "structured_prompt": {
    // Full structured prompt used/expanded
    // USE THIS for refinement iterations!
  }
}
```

### Edit Endpoint

**Endpoint:** `https://fal.run/bria/fibo-edit/edit`  
**Method:** POST

#### Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `image_url` | string | ❌ | — | Image to edit |
| `mask_url` | string | ❌ | — | Optional mask for targeted edits |
| `instruction` | string | ❌ | — | Natural language edit instruction |
| `structured_instruction` | StructuredInstruction | ❌ | — | JSON structured edit |
| `seed` | integer | ❌ | `5555` | Reproducibility |
| `steps_num` | integer | ❌ | `30` | Inference steps |
| `negative_prompt` | string | ❌ | `""` | Content to avoid |
| `guidance_scale` | float \| int | ❌ | `5` | Edit strength |

#### Edit Workflow Example

```json
{
  "image_url": "https://your-generated-image.png",
  "instruction": "change lighting to starlight nighttime",
  "seed": 5555,
  "steps_num": 30,
  "guidance_scale": 5
}
```

#### Edit Output

```json
{
  "image": { "url": "...", "width": 1024, "height": 1024 },
  "images": [{ "url": "..." }],
  "structured_instruction": {
    // The structured version of your instruction
    // Useful for understanding what the model interpreted
  }
}
```

---

## Section 2: Pricing & Cost Optimization

### Cost Structure

| Operation | Cost |
|-----------|------|
| Generate (any aspect ratio) | **$0.04** per image |
| Edit (any size) | **$0.04** per image |

### Cost Comparison

| Model | Cost | Licensed Data | Structured Control |
|-------|------|--------------|-------------------|
| **Bria FIBO** | $0.04 | ✅ 100% | ✅ JSON-native |
| Ideogram V3 TURBO | $0.03 | ❌ | ❌ |
| Flux 2 | ~$0.03 | ❌ | ❌ |
| Qwen Image Max | $0.075 | ❌ | ❌ |
| DALL-E 3 | $0.04+ | ❌ | ❌ |

**FIBO is competitively priced** AND legally safe. The $0.04/image cost is essentially the same as competitors that DON'T guarantee licensed training data.

### Cost Optimization

1. **Start with plain prompts** ($0.04) → get structured prompt back → refine ($0.04)
2. **Use the edit endpoint** ($0.04) for modifications instead of regenerating
3. **Lower `steps_num` to 20-30** for drafts (same price, faster)
4. **Use seed for reproducibility** — avoid regenerating to find a lost composition
5. **Inspire workflow**: Use a reference image to skip the exploration phase entirely

---

## Section 3: The Three Workflows

### 3.1 Generate — Start from Text

The simplest path. Provide a prompt, get an image + structured prompt.

**Simple prompt:**
```json
{
  "prompt": "A cinematic portrait of a jazz musician playing saxophone in a smoky club",
  "aspect_ratio": "3:2",
  "steps_num": 50
}
```

**The model returns the image AND a full structured prompt:**
```json
{
  "image": { "url": "..." },
  "structured_prompt": {
    "short_description": "A jazz musician playing saxophone in a dimly lit club",
    "objects": [
      {
        "description": "Middle-aged man playing alto saxophone",
        "location": "Center-right of frame",
        "relationship": "Main subject",
        "clothing": "Dark suit, loosened tie",
        "expression": "Eyes closed, absorbed in music",
        "action": "Playing saxophone with intense focus",
        "pose": "Standing, leaning slightly back"
      }
    ],
    "lighting": {
      "conditions": "Low-key, single spotlight",
      "direction": "Above and slightly left",
      "shadows": "Deep, dramatic"
    },
    "aesthetics": {
      "composition": "Slightly off-center, negative space on left",
      "color_scheme": "Warm amber spotlight against cool blue-gray shadows",
      "mood_atmosphere": "Intimate, soulful, late-night"
    },
    "photographic_characteristics": {
      "depth_of_field": "Shallow",
      "focus": "Sharp on musician's face and hands",
      "camera_angle": "Slightly below eye level",
      "lens_focal_length": "85mm"
    }
  }
}
```

### 3.2 Refine — Tweak One Attribute

Take the structured prompt from step 1 and modify ONE thing:

**Change just the lighting:**
```json
{
  "structured_prompt": {
    "short_description": "A jazz musician playing saxophone in a dimly lit club",
    "objects": [/* ... same as before ... */],
    "lighting": {
      "conditions": "Colored stage lighting, red and blue gels",
      "direction": "Multiple colored spots from above",
      "shadows": "Multicolored, overlapping"
    },
    "aesthetics": {/* ... same as before ... */},
    "photographic_characteristics": {/* ... same as before ... */}
  },
  "seed": 5555
}
```

**Change just the camera angle:**
```json
{
  "structured_prompt": {
    "short_description": "A jazz musician playing saxophone in a dimly lit club",
    "objects": [/* ... same ... */],
    "lighting": {/* ... same ... */},
    "aesthetics": {/* ... same ... */},
    "photographic_characteristics": {
      "depth_of_field": "Shallow",
      "focus": "Sharp on musician's hands on the keys",
      "camera_angle": "Low angle, looking up from below the stage",
      "lens_focal_length": "35mm wide angle"
    }
  }
}
```

### 3.3 Inspire — Start from an Image

Provide a reference image and FIBO's vision-language model extracts a structured prompt:

```json
{
  "image_url": "https://your-reference-photo.jpg",
  "prompt": "Make it more dramatic with deeper shadows"
}
```

The model:
1. Analyzes the reference image
2. Generates a structured prompt describing it
3. Applies your modification instruction
4. Generates a new image
5. Returns both the image and the combined structured prompt

This is perfect for:
- Recreating a look from an existing photo with modifications
- Exploring variations of a reference image
- Extracting the "DNA" of an image for reuse

---

## Section 4: Cinematic Prompting with Structured Control

### 4.1 Film Noir Scene

```json
{
  "structured_prompt": {
    "short_description": "A femme fatale in a 1940s detective office",
    "objects": [
      {
        "description": "A woman in her early 30s with striking features",
        "location": "Left third of frame, standing in doorway",
        "relationship": "Main subject, dominates the frame",
        "clothing": "Form-fitting dark dress, fur stole, wide-brimmed hat casting shadow over eyes",
        "expression": "Mysterious half-smile, eyes calculating",
        "pose": "Leaning against door frame, one hand on hip",
        "gender": "Female",
        "skin_tone_and_texture": "Porcelain, flawless, high contrast against shadows"
      },
      {
        "description": "Venetian blinds on a window",
        "location": "Background right",
        "relationship": "Creates light pattern across scene",
        "appearance_details": "Half-open, creating horizontal light stripes"
      }
    ],
    "background_setting": "1940s private detective office with wooden desk, whiskey bottle, scattered papers, frosted glass door",
    "lighting": {
      "conditions": "Single hard source through venetian blinds",
      "direction": "Strong from camera right through window",
      "shadows": "Hard-edged stripe pattern from blinds across subject and wall"
    },
    "aesthetics": {
      "composition": "Classic film noir framing with strong diagonal light",
      "color_scheme": "Monochrome with rich tonal range from pure black to pure white",
      "mood_atmosphere": "Tension, mystery, sexual danger"
    },
    "photographic_characteristics": {
      "depth_of_field": "Deep focus, everything sharp",
      "focus": "Critical focus on woman's face",
      "camera_angle": "Slightly low angle, emphasizing her power",
      "lens_focal_length": "35mm"
    },
    "artistic_style": "Classic Hollywood film noir, Double Indemnity era",
    "style_medium": "Black and white film photography, silver gelatin print quality"
  },
  "aspect_ratio": "16:9"
}
```

### 4.2 Sci-Fi Environment

```json
{
  "structured_prompt": {
    "short_description": "Interior of a massive space station observation deck",
    "objects": [
      {
        "description": "A lone figure in a sleek space suit",
        "location": "Small, lower right, back to camera",
        "relationship": "Scale reference against massive window",
        "pose": "Standing, hands behind back, gazing out",
        "appearance_details": "Reflective helmet visor shows stars"
      },
      {
        "description": "Curved observation window",
        "location": "Entire background wall",
        "relationship": "Dominates frame, dwarfs the figure",
        "appearance_details": "Floor-to-ceiling, showing Earth and stars beyond"
      }
    ],
    "background_setting": "Clean, minimal space station interior with brushed steel floors and subtle ambient lighting strips along the ceiling",
    "lighting": {
      "conditions": "Earthlight — blue-white reflected light from Earth through the window",
      "direction": "Frontal from the window, backlighting the interior",
      "shadows": "Soft, long shadows stretching from window toward camera"
    },
    "aesthetics": {
      "composition": "Extreme scale contrast — tiny human vs vast cosmos",
      "color_scheme": "Cool steel blues and blacks with warm Earth tones through window",
      "mood_atmosphere": "Awe, solitude, the sublime"
    },
    "photographic_characteristics": {
      "depth_of_field": "Deep, everything in focus",
      "focus": "Sharp throughout",
      "camera_angle": "Wide, slightly elevated, looking down toward figure and window",
      "lens_focal_length": "24mm ultra-wide"
    },
    "context": "Key art for a science fiction film",
    "artistic_style": "2001: A Space Odyssey meets Interstellar"
  },
  "aspect_ratio": "16:9"
}
```

### 4.3 Product Photography

```json
{
  "structured_prompt": {
    "short_description": "Luxury watch product shot on marble surface",
    "objects": [
      {
        "description": "Luxury chronograph watch with black dial",
        "location": "Center frame, slightly angled",
        "relationship": "Hero product, sole subject",
        "shape_and_color": "Round silver case, black textured dial, blue accents on subdials",
        "texture": "Brushed and polished steel, sapphire crystal with anti-reflective coating",
        "appearance_details": "Time set to 10:10, visible chronograph pushers, crocodile leather strap"
      }
    ],
    "background_setting": "Dark Carrara marble surface with subtle gray veining, gradient to black background",
    "lighting": {
      "conditions": "Professional studio product lighting, two softboxes",
      "direction": "Main light from upper left, fill from right",
      "shadows": "Clean, controlled, soft edge shadow on surface"
    },
    "aesthetics": {
      "composition": "Centered, slight three-quarter angle to show dial and case profile",
      "color_scheme": "Silver, black, dark blue — luxury monochrome with accent",
      "mood_atmosphere": "Premium, aspirational, precision craftsmanship"
    },
    "photographic_characteristics": {
      "depth_of_field": "Moderate, sharp on dial with subtle softening on strap ends",
      "focus": "Critical sharpness on watch dial and hands",
      "camera_angle": "45-degree overhead angle",
      "lens_focal_length": "100mm macro"
    },
    "context": "E-commerce hero image for luxury watch brand"
  },
  "aspect_ratio": "1:1"
}
```

### 4.4 The Disentangled Control Advantage

Here's what makes FIBO special for production — change ONE thing:

**Original scene → Change only lighting direction:**
```json
"lighting": {
  "conditions": "golden hour",
  "direction": "directly behind subject (backlighting)",  // ← ONLY this changed
  "shadows": "long, soft-edged"
}
```

**Same scene → Change only camera lens:**
```json
"photographic_characteristics": {
  "depth_of_field": "shallow",
  "focus": "sharp on subject's face",
  "camera_angle": "eye level",
  "lens_focal_length": "200mm telephoto"  // ← ONLY this changed
}
```

**Same scene → Change only mood:**
```json
"aesthetics": {
  "composition": "rule of thirds",
  "color_scheme": "desaturated, cold blue tones",  // ← changed
  "mood_atmosphere": "melancholic, isolated"  // ← changed
}
```

Each generates a recognizably similar scene with JUST that parameter different. This is incredibly valuable for art direction.

---

## Section 5: Edit Endpoint Deep Dive

### Simple Edits

```json
{
  "image_url": "https://your-image.png",
  "instruction": "change the sky to a dramatic sunset with orange and purple clouds"
}
```

### Masked Edits

For targeted modifications, provide a mask:

```json
{
  "image_url": "https://your-image.png",
  "mask_url": "https://your-mask.png",
  "instruction": "replace this area with a vintage car parked on the street"
}
```

### Structured Edit Instructions

The edit endpoint also supports structured instructions for precise control:

```json
{
  "image_url": "https://your-image.png",
  "structured_instruction": {
    // Mirrors the structured prompt schema but applied as edits
  }
}
```

### Edit Use Cases for Production

| Use Case | Instruction Example |
|----------|-------------------|
| Time of day | `"change to nighttime, add street lights"` |
| Season | `"change to winter, add snow on surfaces"` |
| Weather | `"add heavy rain and wet reflections"` |
| Lighting mood | `"change lighting to dramatic horror style"` |
| Color grade | `"apply warm vintage color grading"` |
| Background swap | `"replace background with modern office interior"` |
| Wardrobe change | `"change the clothing to a formal black suit"` |
| Age progression | `"make the subject appear 20 years older"` |

---

## Section 6: Strengths & Limitations

### Strengths

| Strength | Details |
|----------|---------|
| **Licensed Data** | 100% trained on licensed content — unique legal safety |
| **Structured Prompts** | JSON-native control over every visual parameter |
| **Disentangled Control** | Change one thing without breaking the scene |
| **Three Workflows** | Generate → Refine → Inspire cycle for efficient iteration |
| **Prompt Returned** | Every generation returns a full structured prompt |
| **Edit Endpoint** | Instruction-based and mask-based editing |
| **Competitive Price** | $0.04/image — same as models WITHOUT legal guarantees |
| **Enterprise Ready** | Governance, repeatability, legal clarity |
| **Open Source** | Commercially licensable |
| **8B Parameters** | Efficient, fast, lower compute requirements |

### Limitations

| Limitation | Details |
|------------|---------|
| **Raw Photorealism** | Good but not top-tier for photorealistic humans compared to Flux 2 or Qwen |
| **Single Image Output** | Returns one image per generation (no batch) |
| **Resolution** | Fixed aspect ratios, no custom pixel dimensions |
| **Steps Range** | 20-50 (can't go ultra-fast like some models) |
| **Guidance Range** | Limited to 3-5 (very narrow range) |
| **No Video** | Image-only model |
| **No ControlNet** | No spatial control adapters |
| **Text Rendering** | Not a strength — use Ideogram for typography |
| **Style Presets** | None — structured prompt is your style control |

### When to Choose Bria FIBO

✅ **Choose it when:**
- Commercial use is planned and legal safety matters
- You need structured, repeatable control over visual parameters
- Art direction requires changing individual attributes independently
- Enterprise governance and compliance are requirements
- You want to iterate efficiently (Generate → Refine → Inspire cycle)
- Budget is a factor ($0.04/image is very competitive)
- Open source with commercial rights is needed

❌ **Choose something else when:**
- Maximum photorealism is the only goal → Flux, Qwen
- Typography in images is critical → Ideogram
- Video generation needed → LTX-2, Kling, Veo
- You need style presets/transfers → Ideogram
- Maximum resolution / 4K output → Nano Banana Pro
- Spatial control (ControlNet) → Flux

---

## Section 7: Production Integration

### JavaScript/TypeScript — Generate

```javascript
import { fal } from "@fal-ai/client";

fal.config({ credentials: process.env.FAL_KEY });

// Simple generation
const result = await fal.subscribe("bria/fibo/generate", {
  input: {
    prompt: "A cinematic portrait of a warrior in ornate armor",
    aspect_ratio: "3:2",
    steps_num: 50,
    guidance_scale: 5,
    seed: 5555
  },
  logs: true,
});

console.log(result.data.image.url);
// Save the structured prompt for refinement!
const structuredPrompt = result.data.structured_prompt;
```

### JavaScript — Refine

```javascript
// Modify just the lighting from the previous generation
structuredPrompt.lighting = {
  conditions: "dramatic storm light with breaks in clouds",
  direction: "from above and behind",
  shadows: "deep, dramatic, high contrast"
};

const refined = await fal.subscribe("bria/fibo/generate", {
  input: {
    structured_prompt: structuredPrompt,
    aspect_ratio: "3:2",
    seed: 5555
  },
});
```

### JavaScript — Inspire

```javascript
const inspired = await fal.subscribe("bria/fibo/generate", {
  input: {
    image_url: "https://reference-photo.jpg",
    prompt: "Make it more cinematic with teal and orange color grading",
    aspect_ratio: "16:9"
  },
});
```

### JavaScript — Edit

```javascript
const edited = await fal.subscribe("bria/fibo-edit/edit", {
  input: {
    image_url: result.data.image.url,
    instruction: "change the background to a misty forest at dawn",
    seed: 5555,
    steps_num: 30,
    guidance_scale: 5
  },
});
```

### Python

```python
import fal_client

# Generate
result = fal_client.subscribe(
    "bria/fibo/generate",
    arguments={
        "structured_prompt": {
            "short_description": "A warrior in ornate armor",
            "lighting": {
                "conditions": "golden hour",
                "direction": "from camera left",
                "shadows": "long, warm"
            },
            "photographic_characteristics": {
                "depth_of_field": "shallow",
                "camera_angle": "low angle",
                "lens_focal_length": "85mm"
            },
            "aesthetics": {
                "mood_atmosphere": "epic, heroic",
                "color_scheme": "warm golds and deep reds"
            }
        },
        "aspect_ratio": "3:2",
        "steps_num": 50
    },
    with_logs=True,
)

print(result["image"]["url"])
structured = result["structured_prompt"]

# Refine — change just the mood
structured["aesthetics"]["mood_atmosphere"] = "dark, foreboding, before battle"
structured["aesthetics"]["color_scheme"] = "desaturated, steel gray and blood red"

refined = fal_client.subscribe(
    "bria/fibo/generate",
    arguments={
        "structured_prompt": structured,
        "aspect_ratio": "3:2",
        "steps_num": 50
    },
)
```

### cURL

```bash
curl --request POST \
  --url https://fal.run/bria/fibo/generate \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
    "prompt": "A cinematic landscape of mountains at sunrise",
    "aspect_ratio": "16:9",
    "steps_num": 50,
    "guidance_scale": 5,
    "seed": 5555
  }'
```

---

## Section 8: Workflow Templates

### Art Direction A/B Testing

Generate the same scene with systematic parameter changes:

```javascript
const basePrompt = {
  short_description: "A portrait of a woman in a garden",
  objects: [/* ... character details ... */],
  background_setting: "An English rose garden in bloom",
  aesthetics: { composition: "center frame, medium shot" }
};

// Test lighting variations
const lightingOptions = [
  { conditions: "golden hour", direction: "behind subject", shadows: "long, warm" },
  { conditions: "overcast", direction: "diffused, even", shadows: "minimal, soft" },
  { conditions: "harsh noon sun", direction: "directly above", shadows: "short, hard" },
  { conditions: "blue hour twilight", direction: "ambient, no direct source", shadows: "barely visible" },
];

for (const lighting of lightingOptions) {
  await generate({
    structured_prompt: { ...basePrompt, lighting },
    seed: 5555 // Same seed for fair comparison
  });
}
```

### Client Presentation Pipeline

1. **Phase 1 — Explore** (3 variations × $0.04 = $0.12):
   Generate 3 different interpretations with plain prompts
   
2. **Phase 2 — Refine** (4 lighting tests × $0.04 = $0.16):
   Take the best, modify just lighting across 4 options
   
3. **Phase 3 — Polish** (2 edits × $0.04 = $0.08):
   Fine-tune with edit endpoint for final tweaks

**Total: $0.36** for a professionally iterated, legally-safe commercial asset.

---

## Section 9: Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Image doesn't match prompt | Guidance too low | Increase `guidance_scale` toward 5 |
| Results look generic | Prompt too vague | Use structured prompt with specific parameters |
| Refinement changes too much | Too many params changed | Change ONE attribute per refinement cycle |
| Faces look off | Model limitation | Use close-up with detailed face description in objects |
| Colors wrong | No color control | Use `aesthetics.color_scheme` in structured prompt |
| Edit too aggressive | Steps too high | Reduce `steps_num` for edits (20-25) |
| Inspire doesn't match ref | Reference too complex | Add specific modification instructions |
| Slow generation | Steps at max | Use `steps_num: 30` for drafts |

---

## Appendix: Quick Reference Card

```
GENERATE:      bria/fibo/generate
EDIT:          bria/fibo-edit/edit
COST:          $0.04/image (generate or edit)
TRAINING DATA: 100% licensed — full commercial safety
ARCHITECTURE:  8B parameters
STEPS:         20-50 (default 50 generate, 30 edit)
GUIDANCE:      3-5 (default 5)
SEED:          Default 5555
ASPECT RATIOS: 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9
PROMPT TYPES:  Plain text, Structured JSON, Reference image
WORKFLOWS:     Generate → Refine → Inspire
EDIT MODES:    Instruction-based, Mask-based, Structured instruction
UNIQUE:        Disentangled control, returns structured prompt, licensed data
```

---

*Last updated: February 2026*  
*Cine-AI Prompt Compiler Knowledge Base — Priority 2 Model Guide*
