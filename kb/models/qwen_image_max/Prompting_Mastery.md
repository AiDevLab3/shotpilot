# Qwen Image Max: Complete Prompting Mastery Guide

**Model:** Qwen Image Max  
**API Model IDs:** `fal-ai/qwen-image-max/text-to-image` · `fal-ai/qwen-image-max/edit`  
**Developer:** Alibaba Cloud (Qwen Team)  
**Release:** 2025  
**Status:** Premium image generation model on fal.ai

> **Lineage:** Qwen Image Max improves upon the Qwen Image Plus series by enhancing the realism and naturalness of images. It is the flagship of Alibaba's image generation lineup, succeeding models like `qwen-image-2512`.

---

## Executive Summary

Qwen Image Max is Alibaba's most advanced image generation model, designed for photorealistic output with strong text rendering capabilities (supporting both Chinese and English). The model emphasizes **realism, naturalness, and prompt adherence** while maintaining competitive pricing at $0.075 per image. It supports both text-to-image generation and image editing (with up to 3 reference images), making it versatile for cinematic production workflows.

**Key Differentiators:**
- Bilingual prompt support (Chinese and English) — unique advantage for international productions
- Built-in LLM prompt expansion for automatic prompt optimization
- Image editing with up to 3 reference images and natural language instructions
- Competitive pricing at $0.075/image (all sizes)
- Strong text rendering in generated images
- Clean, simple API with sensible defaults

---

## Section 0: The Golden Rules of Prompting

Qwen Image Max responds well to natural language prompts but has its own personality. Understanding these rules will get you 80% of the way to professional results.

### Rule 1: Let Prompt Expansion Work For You

By default, `enable_prompt_expansion: true` engages an internal LLM to enhance your prompt. This is **extremely effective** for short or vague prompts. For precise cinematic control, consider disabling it.

**When to enable (default):**
- Quick concept exploration
- Loose creative briefs
- When you want the model to "fill in the gaps"

**When to disable:**
```json
{ "enable_prompt_expansion": false }
```
- Precise art direction with specific lighting/camera specs
- Reproducible outputs for production pipelines
- When your prompt is already detailed (500+ characters)

### Rule 2: Use Full Sentences, Not Tag Soup

Like most modern models, Qwen Image Max responds to natural language far better than comma-separated keywords.

**❌ Bad (Tag Soup):**
```
cinematic, 8k, ultra-realistic, film grain, anamorphic, bokeh, dramatic lighting
```

**✅ Good (Natural Language):**
```
A cinematic wide shot of a detective standing in a rain-soaked alley at midnight. Shot on anamorphic lenses with shallow depth of field, the neon signs behind him create bokeh circles in crimson and electric blue. The wet cobblestones reflect the light, creating a mirror effect. Film grain texture, dramatic side lighting from a flickering streetlamp.
```

### Rule 3: Front-Load the Subject

Qwen Image Max gives the strongest weight to the first clause of your prompt. Put your main subject first, then build context around it.

**Structure:**
```
[SUBJECT + ACTION] + [ENVIRONMENT] + [LIGHTING] + [CAMERA/STYLE] + [MOOD/ATMOSPHERE]
```

### Rule 4: Leverage Negative Prompts Strategically

The negative prompt (max 500 characters) is your quality control valve. Use it to suppress common artifacts rather than listing desired qualities.

**Recommended Baseline Negative Prompt:**
```
low resolution, error, worst quality, low quality, deformed, blurry, watermark, text overlay, cropped, out of frame, extra limbs, disfigured, bad anatomy, jpeg artifacts
```

### Rule 5: Use the Edit Endpoint for Iteration

Don't regenerate from scratch. Use `fal-ai/qwen-image-max/edit` with your existing image and a natural language instruction to refine.

```json
{
  "prompt": "Change the lighting to golden hour and add lens flare from the upper left",
  "image_urls": ["https://your-generated-image.png"]
}
```

---

## Section 1: Complete API Reference

### Text-to-Image Endpoint

**Endpoint:** `https://fal.run/fal-ai/qwen-image-max/text-to-image`  
**Method:** POST  
**Authentication:** `Authorization: Key $FAL_KEY`

#### Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | string | ✅ | — | Text prompt, max 800 chars. Supports Chinese & English |
| `negative_prompt` | string | ❌ | `""` | Content to avoid, max 500 chars |
| `image_size` | ImageSize \| Enum | ❌ | `"square_hd"` | Output dimensions |
| `enable_prompt_expansion` | boolean | ❌ | `true` | LLM prompt optimization |
| `seed` | integer | ❌ | random | Reproducibility seed (0–2147483647) |
| `enable_safety_checker` | boolean | ❌ | `true` | Content moderation |
| `sync_mode` | boolean | ❌ | `false` | Return as data URI |
| `num_images` | integer | ❌ | `1` | Batch size (1–4) |
| `output_format` | enum | ❌ | `"png"` | `jpeg`, `png`, `webp` |

#### Image Size Options

**Preset Enum Values:**
| Preset | Approximate Resolution | Aspect Ratio | Best For |
|--------|----------------------|--------------|----------|
| `square_hd` | 1024×1024 | 1:1 | Instagram, thumbnails, portraits |
| `square` | 512×512 | 1:1 | Quick previews, icons |
| `portrait_4_3` | 768×1024 | 3:4 | Character sheets, posters |
| `portrait_16_9` | 576×1024 | 9:16 | Mobile wallpapers, stories |
| `landscape_4_3` | 1024×768 | 4:3 | Traditional film, presentations |
| `landscape_16_9` | 1024×576 | 16:9 | Cinematic widescreen, YouTube |

**Custom Sizes:**
```json
{
  "image_size": {
    "width": 1920,
    "height": 1080
  }
}
```

#### Output Schema

```json
{
  "images": [
    {
      "url": "https://v3b.fal.media/files/...",
      "content_type": "image/png",
      "file_name": "generated.png",
      "file_size": 2048576
    }
  ],
  "seed": 42
}
```

### Image Edit Endpoint

**Endpoint:** `https://fal.run/fal-ai/qwen-image-max/edit`  
**Method:** POST

#### Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | string | ✅ | — | Edit instruction, max 800 chars |
| `image_urls` | list\<string\> | ✅ | — | 1–3 reference images |
| `negative_prompt` | string | ❌ | `""` | Content to avoid |
| `image_size` | ImageSize \| Enum | ❌ | input size | Output dimensions |
| `enable_prompt_expansion` | boolean | ❌ | `true` | LLM optimization |
| `seed` | integer | ❌ | random | Reproducibility |
| `num_images` | integer | ❌ | `1` | Batch size |
| `output_format` | enum | ❌ | `"png"` | Output format |

**Key Details:**
- Accepts 1–3 reference images
- Reference images in prompt as "image 1", "image 2", "image 3"
- Resolution per image: 384–5000px each dimension
- Max size: 10MB each
- Formats: JPEG, JPG, PNG (no alpha), WEBP

#### Edit Workflow Example

```json
{
  "prompt": "Replace the background with a moody cyberpunk cityscape at night, keeping the character from image 1 exactly as they are",
  "image_urls": [
    "https://your-character-shot.png"
  ],
  "enable_prompt_expansion": false,
  "output_format": "png"
}
```

**Multi-Image Compositing:**
```json
{
  "prompt": "Place the character from image 1 into the environment from image 2, matching the lighting style of image 3",
  "image_urls": [
    "https://character.png",
    "https://environment.png",
    "https://lighting-reference.png"
  ]
}
```

---

## Section 2: Pricing & Cost Optimization

### Cost Structure

| Operation | Cost |
|-----------|------|
| Text-to-Image (any size) | **$0.075** per image |
| Image Edit (any size) | **$0.075** per image |

### Cost Comparison with Competitors

| Model | Cost per Image | Notes |
|-------|---------------|-------|
| **Qwen Image Max** | $0.075 | Flat rate, all sizes |
| Flux 2 | ~$0.025–0.05 | Size-dependent |
| Ideogram V3 | $0.03–0.09 | Speed-dependent |
| DALL-E 3 | $0.04–0.12 | Size-dependent |
| Nano Banana Pro | Via Gemini API | Token-based |

### Optimization Strategies

1. **Use `num_images: 4`** for batch exploration — same API call, 4× the options
2. **Start with `square` (512×512)** for concept validation, then upscale winners to `square_hd`
3. **Enable prompt expansion** for initial exploration, disable for final renders
4. **Use `jpeg` output** for non-final renders (smaller files, faster transfer)
5. **Use `webp`** for web-ready deliverables (best compression)

---

## Section 3: Cinematic Prompting Strategies

### 3.1 Cinematic Shot Types

#### Establishing Shot
```
A breathtaking aerial establishing shot of a ancient Japanese temple complex nestled in misty mountains at dawn. The first golden rays of sunlight pierce through the fog, illuminating the curved rooftops with warm amber light while the surrounding cedar forests remain in cool blue shadow. Shot with a tilt-shift effect to emphasize the miniature-like scale of the architecture against the vast mountain range.
```

#### Close-Up Character Portrait
```
An extreme close-up portrait of a weathered sea captain, his face filling the frame. Deep wrinkles map decades of ocean voyages. His steel-blue eyes catch the light of a setting sun from camera left, creating a warm Rembrandt triangle on his right cheek. Salt-and-pepper stubble, cracked lips, a thin scar across his left eyebrow. The background is a smooth, out-of-focus wash of ocean blue. Shot on 85mm lens, f/1.4, with subtle film grain.
```

#### Medium Shot — Dialogue Scene
```
A medium two-shot of two detectives standing in a dimly lit parking garage, facing each other in tense conversation. The woman on the left wears a rumpled blazer, her badge catching the overhead fluorescent light. The man on the right leans against a concrete pillar, arms crossed, his face half in shadow. The space between them is charged with unspoken tension. Overhead sodium vapor lights cast harsh yellow pools on the oil-stained concrete floor.
```

#### Wide Shot — Action Sequence
```
A wide shot of a lone samurai mid-leap across a rooftop gap in feudal Kyoto at twilight. Cherry blossom petals swirl in the wind around him, catching the last purple-pink light of dusk. His katana is drawn, blade reflecting the sky. Below, lantern-lit streets buzz with merchants closing their stalls. Motion blur on the petals and his flowing hakama convey explosive movement, while his face remains sharp and focused.
```

### 3.2 Lighting Setups

#### Three-Point Lighting (Studio)
```
Professional studio portrait with classic three-point lighting setup. Strong key light from 45 degrees camera left creates defined shadows. Soft fill light from camera right at half intensity. Hair light from above and behind separates the subject from the seamless dark gray backdrop. Clean, commercial quality.
```

#### Chiaroscuro / Noir
```
A femme fatale sits at a bar in deep chiaroscuro lighting. A single harsh light source from a hanging bare bulb above creates extreme contrast — her face is split precisely between brilliant white and absolute black. Smoke from her cigarette curls upward through the light beam. Everything beyond the pool of light dissolves into impenetrable darkness. High contrast, no fill light.
```

#### Natural Golden Hour
```
Golden hour portrait on a wheat field. The sun sits just above the horizon at camera-left, wrapping the subject in warm amber light. Long shadows stretch across the golden wheat. Backlit hair creates a glowing halo effect. Lens flare enters from the upper left corner. The sky transitions from deep orange near the horizon through peach to soft lavender above.
```

#### Neon / Cyberpunk
```
A street vendor in a futuristic night market illuminated entirely by neon signs. Competing light sources in magenta, cyan, and electric green create complex colored shadows on every surface. Reflections in puddles multiply the colors. The vendor's face is lit from below by the warm glow of their food stall, creating an inviting contrast against the cold neon environment.
```

### 3.3 Camera and Lens Simulation

**Wide Angle (14-24mm):**
```
Shot on ultra-wide 14mm lens with dramatic perspective distortion. The leading lines of the corridor converge sharply toward a distant vanishing point. Objects near the camera appear oversized while the far end of the hallway shrinks dramatically. Slight barrel distortion at the edges.
```

**Portrait Lens (85mm):**
```
Shot on 85mm f/1.2 lens with extremely shallow depth of field. The subject's eyes are tack-sharp while the tip of their nose and ears begin to soften. The background dissolves into creamy circular bokeh orbs from distant city lights.
```

**Telephoto Compression (200mm):**
```
Shot on 200mm telephoto lens with strong background compression. A runner on a long straight road appears to make no progress as the distant mountains loom impossibly large behind them. The compressed perspective flattens the depth, stacking the layers of landscape like a collage.
```

**Anamorphic:**
```
Shot on vintage anamorphic lenses. Oval bokeh shapes in the background, characteristic horizontal lens flare streaking across the frame in cyan. Slight edge softness and subtle barrel distortion. The widescreen 2.39:1 framing emphasizes the horizontal expanse of the desert landscape.
```

### 3.4 Genre-Specific Templates

#### Film Noir
```
[SUBJECT] in a 1940s film noir setting. High contrast black and white with deep blacks and blown-out whites. Venetian blind shadows striping across the scene. Fog or cigarette smoke diffusing the light. Dutch angle composition creating unease. Wet streets reflecting neon signs.
```

#### Sci-Fi Epic
```
[SUBJECT] in a vast science fiction environment. Brutalist megastructure architecture stretching to impossible heights. Volumetric lighting from massive industrial sources. Atmospheric haze revealing light beams. Scale-indicating human figures in the distance. Cool blue-steel color palette with warm accent lights.
```

#### Period Drama
```
[SUBJECT] in a meticulously accurate [ERA] setting. Natural candlelight/gaslight/oil lamp illumination appropriate to the period. Authentic costume details with period-correct fabrics and silhouettes. Set decoration matching the socioeconomic status of the characters. Painterly quality reminiscent of [RELEVANT PAINTER] compositions.
```

#### Horror
```
[SUBJECT] in a deeply unsettling horror setting. Darkness encroaching from the edges with only a single unreliable light source. Something wrong with the geometry — slightly off angles, impossible shadows. Desaturated color palette except for one accent color. The uncanny valley between normalcy and nightmare.
```

---

## Section 4: Bilingual Prompting (Chinese + English)

### The Bilingual Advantage

Qwen Image Max has a unique strength: native-level understanding of both Chinese and English prompts. This opens up culturally-specific generation that other models struggle with.

#### Chinese Cultural Concepts
```
一位身着汉服的少女站在苏州园林的月亮门前。背景是精致的太湖石假山和翠竹。江南水乡的柔和光线透过花窗投下斑驳的光影。工笔画风格，细节精致。
```
*Translation: A young woman in Hanfu standing before a moon gate in a Suzhou garden. Background features exquisite Taihu rock formations and green bamboo. Soft Jiangnan water-town light filtering through lattice windows creates dappled shadows. Gongbi painting style, exquisite details.*

#### Mixed-Language Prompting
You can combine Chinese cultural specificity with English technical direction:
```
一位唐代宫廷美人, shot in the style of Zhang Yimou's "House of Flying Daggers". Dramatic side lighting with warm golden tones. Shallow depth of field, 85mm lens. The silk robes have visible texture and sheen. Cinematic color grading with teal shadows and warm highlights.
```

### Cultural Specificity Examples

**Chinese Architecture:**
```
A cinematic establishing shot of the Forbidden City at dawn, viewed from Jingshan Park. Morning mist clings to the golden rooftops as the first rays of sunlight ignite the imperial yellow glazed tiles. The contrast between the warm rooftops and cool blue-gray walls creates visual depth. Shot with telephoto compression to stack the layered rooflines.
```

**Chinese Calligraphy / Text:**
```
An elegant vertical scroll with the characters "天下太平" written in flowing grass script calligraphy. The black ink on aged rice paper, with visible brush texture showing the speed and pressure of each stroke. Red seal stamps in the lower left corner. Warm indirect lighting from the side.
```

---

## Section 5: Text Rendering in Images

Qwen Image Max has strong text rendering capabilities, especially for shorter text and both Chinese and English characters.

### Best Practices for Text

1. **Use quotation marks** around the text you want rendered:
   ```
   A coffee shop chalkboard sign that reads "Today's Special: Lavender Oat Latte - $5.50"
   ```

2. **Keep text short** — 1-5 words are most reliable, longer text may have errors
3. **Specify the medium** — signs, posters, book covers, screens give context for rendering
4. **Describe the font style** implicitly:
   ```
   A vintage movie poster with bold art deco lettering reading "MIDNIGHT EXPRESS"
   ```

### Text Rendering Examples

**Movie Poster:**
```
A cinematic movie poster for a film called "THE LAST HORIZON". Bold, weathered typography at the top. A lone figure silhouetted against a massive orange sunset. Tagline at the bottom reads "Some journeys have no return". Dark, moody color palette with the sunset as the only warm element. Classic one-sheet poster composition.
```

**Product Shot with Branding:**
```
A premium whiskey bottle on a dark oak surface with the label clearly reading "BLACK MOUNTAIN RESERVE". Studio lighting with a single spot from above creating a halo effect on the amber liquid. The label has gold foil embossing. Background is soft, dark, gradient.
```

---

## Section 6: Advanced Techniques

### 6.1 Seed Control for Iterative Refinement

Use seeds to lock in a composition you like, then modify other parameters:

```json
// Step 1: Find a composition you like
{ "prompt": "A detective in a rainy alley", "seed": 42 }

// Step 2: Refine with same seed, modified prompt
{ "prompt": "A detective in a rainy alley, close-up on face, film noir lighting", "seed": 42 }

// Step 3: Try variations with nearby seeds
{ "prompt": "A detective in a rainy alley, close-up on face, film noir lighting", "seed": 43 }
```

### 6.2 Batch Generation Workflow

Generate 4 images at once for rapid exploration:

```json
{
  "prompt": "Concept art for a post-apocalyptic greenhouse, overgrown with exotic plants reclaiming rusted industrial equipment. Shafts of light through broken glass ceiling. Volumetric fog.",
  "num_images": 4,
  "image_size": "landscape_16_9",
  "enable_prompt_expansion": true
}
```

### 6.3 Edit Endpoint for VFX Compositing

Use the multi-image edit endpoint for compositing-like workflows:

**Sky Replacement:**
```json
{
  "prompt": "Replace the sky in image 1 with the dramatic stormy sky from image 2, matching the lighting and color temperature",
  "image_urls": ["scene.jpg", "sky-reference.jpg"]
}
```

**Style Transfer:**
```json
{
  "prompt": "Render image 1 in the artistic style and color palette of image 2",
  "image_urls": ["photo.jpg", "painting-reference.jpg"]
}
```

**Character Insertion:**
```json
{
  "prompt": "Place the person from image 1 naturally into the scene from image 2, matching perspective, lighting, and scale. They should be standing in the foreground, slightly left of center.",
  "image_urls": ["character.jpg", "background.jpg"]
}
```

### 6.4 Prompt Expansion: On vs Off

**With expansion ON** (default) — the model's internal LLM rewrites your prompt to add detail:
```
Input: "A cat on a windowsill"
Model sees: "A fluffy orange tabby cat lounging on a sunlit windowsill, golden afternoon light streaming through sheer curtains, dust motes floating in the light beams, cozy interior with books and plants visible, shallow depth of field..."
```

**With expansion OFF** — the model uses your prompt verbatim:
```
Input: "A cat on a windowsill"
Model sees: "A cat on a windowsill" (exactly this, nothing more)
```

**Pro tip:** Generate once with expansion ON, read the model's log output to see what it expanded to, then use that as a starting point for your custom prompt with expansion OFF.

---

## Section 7: Strengths & Limitations

### Strengths

| Strength | Details |
|----------|---------|
| **Bilingual Excellence** | True native understanding of Chinese and English — not just translation |
| **Photorealism** | Particularly strong at natural-looking human subjects and environments |
| **Text Rendering** | Reliable short text in both languages, including CJK characters |
| **Edit Workflow** | Multi-image editing with natural language is genuinely useful |
| **Prompt Expansion** | Built-in LLM enhancement turns vague prompts into detailed ones |
| **Simple API** | Clean, well-documented, few parameters to learn |
| **Flat Pricing** | $0.075/image regardless of size — predictable costs |

### Limitations

| Limitation | Details |
|------------|---------|
| **No ControlNet/IP-Adapter** | No fine-grained spatial control (no depth maps, pose guides) |
| **No LoRA Support** | Cannot fine-tune or use custom trained adapters |
| **Limited Batch Size** | Max 4 images per request |
| **800 Char Prompt Limit** | Shorter than some competitors (Flux allows longer) |
| **No Inpainting/Masking** | Edit endpoint is global — no region-specific masks |
| **Higher Price Point** | At $0.075, more expensive than Flux or Ideogram TURBO |
| **Safety Filter** | Can be restrictive for some artistic content |
| **No Video** | Image-only model, no animation capabilities |

### When to Choose Qwen Image Max

✅ **Choose it when:**
- You need bilingual Chinese/English content
- Photorealistic human subjects are critical
- You want a simple, reliable generation-then-edit workflow
- Text rendering in images (especially CJK) is needed
- You're doing rapid concept exploration (prompt expansion is excellent)

❌ **Choose something else when:**
- You need spatial control (ControlNet) → Use Flux
- You need video → Use LTX-2, Kling, or Veo
- Budget is extremely tight → Use Flux or Ideogram TURBO
- You need typography-heavy design → Use Ideogram
- You need legally-safe licensed training data → Use Bria FIBO

---

## Section 8: Comparison with Qwen Image 2512

Qwen Image Max is the successor to the Qwen Image 2512 (also known as Qwen Image Plus). Key improvements:

| Feature | Qwen Image 2512 | Qwen Image Max |
|---------|-----------------|----------------|
| Realism | Good | Significantly improved |
| Naturalness | Standard | Enhanced skin tones, materials |
| Text Rendering | Basic | Improved accuracy |
| Edit Capability | Limited | Full multi-image editing |
| Prompt Expansion | Not available | Built-in LLM expansion |
| Price | Lower | $0.075/image |

**Migration Note:** If you're upgrading from 2512, your prompts should work as-is but may produce different (generally better) results. Test with `enable_prompt_expansion: false` first to compare apples-to-apples.

---

## Section 9: Production Integration

### JavaScript/TypeScript

```javascript
import { fal } from "@fal-ai/client";

// Configure
fal.config({ credentials: process.env.FAL_KEY });

// Text-to-Image
const result = await fal.subscribe("fal-ai/qwen-image-max/text-to-image", {
  input: {
    prompt: "A cinematic wide shot of a samurai standing in a bamboo forest at dawn...",
    negative_prompt: "low quality, blurry, deformed",
    image_size: "landscape_16_9",
    enable_prompt_expansion: false,
    num_images: 1,
    output_format: "png"
  },
  logs: true,
  onQueueUpdate: (update) => {
    if (update.status === "IN_PROGRESS") {
      update.logs.map((log) => log.message).forEach(console.log);
    }
  },
});

console.log(result.data.images[0].url);
console.log(`Seed: ${result.data.seed}`);
```

### Python

```python
import fal_client

def on_queue_update(update):
    if isinstance(update, fal_client.InProgress):
        for log in update.logs:
            print(log["message"])

result = fal_client.subscribe(
    "fal-ai/qwen-image-max/text-to-image",
    arguments={
        "prompt": "A cinematic wide shot of a samurai standing in a bamboo forest at dawn...",
        "negative_prompt": "low quality, blurry, deformed",
        "image_size": "landscape_16_9",
        "enable_prompt_expansion": False,
        "num_images": 1,
        "output_format": "png"
    },
    with_logs=True,
    on_queue_update=on_queue_update,
)

print(result["images"][0]["url"])
print(f"Seed: {result['seed']}")
```

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/qwen-image-max/text-to-image \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
    "prompt": "A cinematic wide shot of a samurai standing in a bamboo forest at dawn",
    "image_size": "landscape_16_9",
    "output_format": "png"
  }'
```

### Queue-Based (Async) Workflow

For production pipelines where you don't want to block:

```javascript
// Submit
const { request_id } = await fal.queue.submit("fal-ai/qwen-image-max/text-to-image", {
  input: { prompt: "..." },
  webhookUrl: "https://your-app.com/webhook/qwen-complete",
});

// Check status later
const status = await fal.queue.status("fal-ai/qwen-image-max/text-to-image", {
  requestId: request_id,
  logs: true,
});

// Get result when ready
if (status.status === "COMPLETED") {
  const result = await fal.queue.result("fal-ai/qwen-image-max/text-to-image", {
    requestId: request_id,
  });
}
```

---

## Section 10: Prompt Templates for Cinematic Production

### Shot List Template

```
SHOT [NUMBER]: [SHOT TYPE]
A [shot type] of [subject] in [location]. [Action/pose description]. 
[Lighting setup]. [Camera details — lens, aperture, angle]. 
[Atmosphere/mood]. [Color palette]. [Special effects/post-processing].
```

### Storyboard Sequence Template

Generate a consistent sequence by using the same seed base and edit endpoint:

1. **Establish:** Wide shot of location (seed: 1000)
2. **Introduce:** Medium shot of character in location (edit endpoint with image from step 1)
3. **Reveal:** Close-up on key detail (edit endpoint, crop instruction)
4. **React:** Character reaction shot (new generation with matching description)

### Character Consistency Technique

While Qwen Image Max doesn't have native character locking, you can improve consistency:

1. Generate a detailed character portrait
2. Use the edit endpoint with that portrait as reference for subsequent shots
3. Include extremely specific character descriptions in every prompt:
   ```
   The same woman: early 30s, sharp jawline, dark brown pixie cut with auburn highlights, 
   olive skin, prominent cheekbones, wearing a navy blue leather jacket with silver zipper details
   ```

---

## Section 11: Troubleshooting

### Common Issues and Solutions

| Problem | Likely Cause | Solution |
|---------|-------------|----------|
| Results look generic/stock | Prompt too vague | Disable prompt expansion, add specific details |
| Text not rendering correctly | Text too long or complex | Keep text to 1-5 words, use quotes |
| Colors don't match intent | Prompt expansion overriding | Set `enable_prompt_expansion: false` |
| Safety filter blocking | Content too aggressive | Rephrase using artistic/medical/historical context |
| Inconsistent style in batch | Prompt expansion varies | Use fixed seed + expansion off for consistency |
| Edit doesn't preserve original | Edit prompt too broad | Be specific about what to change AND what to keep |
| Chinese text garbled | Encoding issue | Ensure UTF-8 encoding in API call |

### Output Format Recommendations

| Use Case | Format | Why |
|----------|--------|-----|
| Concept exploration | `jpeg` | Smallest files, fastest transfer |
| Final production assets | `png` | Lossless, supports transparency metadata |
| Web delivery | `webp` | Best compression-to-quality ratio |
| Print production | `png` | No compression artifacts |

---

## Appendix A: Quick Reference Card

```
MODEL ID:     fal-ai/qwen-image-max/text-to-image
EDIT ID:      fal-ai/qwen-image-max/edit
COST:         $0.075/image (all sizes)
PROMPT LIMIT: 800 characters
NEG PROMPT:   500 characters
BATCH SIZE:   1-4 images
SIZES:        square_hd, square, portrait_4_3, portrait_16_9, landscape_4_3, landscape_16_9, custom
FORMATS:      jpeg, png, webp
LANGUAGES:    Chinese, English
EDIT IMAGES:  1-3 reference images (384-5000px, max 10MB each)
```

## Appendix B: Prompt Length Optimization

With an 800-character limit, every word counts. Here's a condensed cinematic prompt structure:

```
[85 chars] Subject + action + key feature
[120 chars] Environment + time of day + weather
[100 chars] Lighting setup (type, direction, color temperature)
[100 chars] Camera (lens, aperture, angle, movement)
[95 chars] Atmosphere + mood + color palette
[100 chars] Texture + material + special details
[100 chars] Post-processing + film stock + style reference
[100 chars] Buffer for adjustments
= 800 characters total
```

---

*Last updated: February 2026*  
*Cine-AI Prompt Compiler Knowledge Base — Priority 2 Model Guide*
