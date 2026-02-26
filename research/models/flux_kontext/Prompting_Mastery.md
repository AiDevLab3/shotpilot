# FLUX.1 Kontext Prompting Mastery Guide

**Model:** FLUX.1 Kontext (Pro + Max)  
**Developer:** Black Forest Labs (BFL)  
**Specialty:** In-context image editing, character consistency, text/typography handling  
**Platform:** fal.ai API  
**Last Updated:** February 2026

---

## Table of Contents

1. [Model Overview](#model-overview)
2. [Technical Specifications](#technical-specifications)
3. [API Endpoints & Parameters](#api-endpoints--parameters)
4. [Prompting Framework](#prompting-framework)
5. [Image Editing Techniques](#image-editing-techniques)
6. [Character Consistency](#character-consistency)
7. [Typography & Text Editing](#typography--text-editing)
8. [Multi-Image Workflows](#multi-image-workflows)
9. [Best Practices for Cinematic Use](#best-practices-for-cinematic-use)
10. [Common Mistakes & Troubleshooting](#common-mistakes--troubleshooting)
11. [Cinematic Prompting Examples](#cinematic-prompting-examples)
12. [Comparison vs Other Models](#comparison-vs-other-models)
13. [Cost Reference](#cost-reference)

---

## Model Overview

### What is FLUX.1 Kontext?

FLUX.1 Kontext is Black Forest Labs' 12-billion parameter multimodal flow transformer designed specifically for in-context image generation and editing. Unlike standard text-to-image models that generate from scratch each time, Kontext understands both text instructions AND reference images simultaneously, enabling intelligent edits, consistent character preservation, and complex scene transformations.

**This is NOT Flux 2 (FLUX.1 [pro/dev/schnell]).** Kontext is a fundamentally different model architecture built for editing and consistency, not just generation. While Flux 2 excels at text-to-image generation, Kontext excels at image-to-image editing, character preservation across scenes, and precise visual modifications.

### Model Tiers

FLUX.1 Kontext ships in two tiers:

**Kontext [pro]** — The standard tier offering excellent editing quality at $0.04/image:
- Image-to-image editing (`fal-ai/flux-pro/kontext`)
- Text-to-image generation (`fal-ai/flux-pro/kontext/text-to-image`)
- Multi-image input (`fal-ai/flux-pro/kontext/multi`)

**Kontext [max]** — Premium tier with enhanced prompt adherence and quality:
- Image-to-image editing (`fal-ai/flux-pro/kontext/max`)
- Text-to-image generation (`fal-ai/flux-pro/kontext/max/text-to-image`)
- Greater fidelity for complex edits and fine details

### Key Strengths

**In-Context Image Editing:** Kontext reads both your text instruction and reference image to make intelligent modifications. Say "change the red car to blue" and it modifies ONLY the car while preserving everything else — no masking, no inpainting workflow needed.

**Character Consistency Without Fine-Tuning:** Preserve unique characters, objects, or visual identities across completely different scenes, backgrounds, and lighting conditions. No LoRA training, no IP-Adapter, no complex pipeline — just provide the reference image and describe the new scene.

**Typography and Text Handling:** One of very few models capable of accurately rendering and editing text within images. Change signs, labels, posters, or any text element with precision — a critical capability for production work.

**Multimodal Understanding:** The model genuinely comprehends both visual and textual context simultaneously, enabling edits that are logically and visually coherent. It understands spatial relationships, material properties, and scene semantics.

**Speed:** Up to 8× faster inference than competing state-of-the-art editing models. Fast enough for iterative creative workflows where you're making multiple successive edits.

**Multi-Image Input:** The Kontext Multi endpoint accepts up to 2+ reference images, enabling character merging, style blending, and complex compositional work.

### When to Use Kontext

**Use Kontext when you need:**
- Precise image editing without complex inpainting workflows
- Character consistency across multiple shots/scenes
- Text/typography rendering or editing within images
- Style transfer while preserving subject identity
- Iterative refinement through successive edits
- Keyframe preparation for video generation pipelines
- Quick turnaround on visual modifications ($0.04/image)

**Consider alternatives when you need:**
- Pure text-to-image generation without reference (use Flux 2 Pro or Midjourney)
- Video generation (Kontext is image-only)
- Extreme photorealism from scratch (use GPT Image 1.5 or Recraft v4)
- Batch generation of many unrelated images (standard T2I models are more efficient)
- Complex multi-region editing with precise masks (use dedicated inpainting models)

---

## Technical Specifications

### Architecture

| Specification | Detail |
|---------------|--------|
| **Parameters** | 12 billion |
| **Architecture** | Multimodal flow transformer |
| **Input Modalities** | Text + Image (simultaneous) |
| **Output** | Single image (JPEG or PNG) |
| **Max Output Resolution** | Up to ~2048px (aspect-ratio dependent) |
| **Inference Speed** | Up to 8× faster than comparable SOTA |

### Supported Image Formats

| Format | Input | Output |
|--------|-------|--------|
| JPEG | ✅ | ✅ (default) |
| PNG | ✅ | ✅ |
| WebP | ✅ | ❌ |
| GIF | ✅ | ❌ |
| AVIF | ✅ | ❌ |

---

## API Endpoints & Parameters

### Endpoint 1: Kontext Pro — Image-to-Image (Primary Editing)

**Endpoint:** `fal-ai/flux-pro/kontext`  
**Primary use:** Edit existing images with text instructions

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | string | ✅ Yes | — | Text editing instruction |
| `image_url` | string | ✅ Yes | — | Input image to edit (URL or data URI) |
| `guidance_scale` | float | No | 3.5 | CFG scale — how closely to follow the prompt |
| `seed` | integer | No | Random | Seed for reproducible results |
| `sync_mode` | boolean | No | false | Return image as data URI (no history storage) |
| `num_images` | integer | No | 1 | Number of output images to generate |
| `output_format` | enum | No | `"jpeg"` | Output format: `jpeg` or `png` |
| `safety_tolerance` | enum | No | `"2"` | Safety filter (1=strictest, 6=most permissive). API only |
| `enhance_prompt` | boolean | No | false | Let the model enhance your prompt |
| `aspect_ratio` | enum | No | (from input) | Output aspect ratio: `21:9`, `16:9`, `4:3`, `3:2`, `1:1`, `2:3`, `3:4`, `9:16`, `9:21` |

### Endpoint 2: Kontext Max — Image-to-Image (Premium)

**Endpoint:** `fal-ai/flux-pro/kontext/max`  
**Primary use:** Higher-quality image editing with enhanced prompt adherence

Same parameters as Kontext Pro. The difference is in model quality:
- Better prompt following for complex, multi-element instructions
- Higher fidelity preservation of fine details during edits
- More accurate color matching and material rendering
- Premium pricing (higher per-image cost)

### Endpoint 3: Kontext Pro — Text-to-Image

**Endpoint:** `fal-ai/flux-pro/kontext/text-to-image`  
**Primary use:** Generate images from text (no reference image needed)

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | string | ✅ Yes | — | Image description |
| `guidance_scale` | float | No | 3.5 | CFG scale |
| `seed` | integer | No | Random | Reproducibility seed |
| `sync_mode` | boolean | No | false | Data URI return mode |
| `num_images` | integer | No | 1 | Number of images |
| `output_format` | enum | No | `"jpeg"` | `jpeg` or `png` |
| `safety_tolerance` | enum | No | `"2"` | Safety filter (1-6). API only |
| `enhance_prompt` | boolean | No | false | Model prompt enhancement |
| `aspect_ratio` | enum | No | `"1:1"` | Output aspect ratio |

**Note:** The T2I endpoint does NOT require `image_url` — it's pure generation. Use this when you need Kontext's superior typography and prompt following without a reference image.

### Endpoint 4: Kontext Max — Text-to-Image

**Endpoint:** `fal-ai/flux-pro/kontext/max/text-to-image`  
**Primary use:** Premium text-to-image with maximum prompt adherence

Same parameters as Kontext Pro T2I. Enhanced quality and prompt following at premium pricing.

### Endpoint 5: Kontext Multi — Multi-Reference Editing

**Endpoint:** `fal-ai/flux-pro/kontext/multi`  
**Primary use:** Edit using multiple reference images simultaneously

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | string | ✅ Yes | — | Editing instruction referencing multiple images |
| `image_url` | array of strings | ✅ Yes | — | Multiple reference image URLs (2+) |
| `guidance_scale` | float | No | 3.5 | CFG scale |
| `seed` | integer | No | Random | Reproducibility seed |
| `num_images` | integer | No | 1 | Number of outputs |
| `output_format` | enum | No | `"jpeg"` | `jpeg` or `png` |
| `safety_tolerance` | enum | No | `"2"` | Safety filter (API only) |

**Multi-Reference Use Cases:**
- Combine character from image 1 with background from image 2
- Apply style from one image to the content of another
- Merge multiple character references into a group scene
- Transfer specific elements (clothing, objects) between images

### Endpoint 6: Kontext LoRA

**Endpoint:** `fal-ai/flux-kontext-lora`  
**Primary use:** Kontext editing with custom LoRA model support

Extends base Kontext functionality with trained LoRA adapters for specialized styles, characters, or domains. Parameters are similar to the base Kontext endpoint with additional LoRA-specific configuration.

---

## Prompting Framework

### The Editing Instruction Paradigm

Kontext prompting is fundamentally different from standard T2I prompting. Instead of describing what you want to SEE, you describe what you want to CHANGE.

**Standard T2I prompt:** "A woman in a red dress standing in a field of sunflowers at golden hour"

**Kontext editing prompt:** "Change her dress to deep navy blue, add a pearl necklace, and shift the lighting to dramatic sunset with long shadows"

### Prompt Structure for Image-to-Image

**Recommended structure:**

```
[Action verb] + [specific target] + [desired change] + [preservation instructions]
```

**Examples:**
- "Change the background to a rainy Tokyo street at night while keeping the person's pose and expression identical"
- "Replace the text on the storefront sign from 'OPEN' to 'CLOSED' in the same font and color"
- "Add dramatic rim lighting from the right side, casting deep shadows on the left half of her face"

### Prompt Structure for Text-to-Image

For T2I, use standard descriptive prompting — Kontext T2I excels at prompt following and typography:

```
[Subject] + [Setting/Environment] + [Lighting] + [Style] + [Text elements if needed]
```

### Guidance Scale Tuning

The `guidance_scale` parameter (default 3.5) is critical for Kontext:

| Value | Effect | When to Use |
|-------|--------|-------------|
| **1.0–2.0** | Very loose adherence, more creative freedom | Abstract/artistic edits, style exploration |
| **2.5–3.5** | Balanced adherence (default range) | Most editing tasks, general use |
| **4.0–5.0** | Strong adherence, may lose subtle details | Precise technical edits, typography |
| **5.0–7.0** | Very strict adherence | When prompt following is failing at lower values |
| **7.0+** | Risk of artifacts, over-saturation | Rarely recommended; last resort for stubborn edits |

**Key insight:** Unlike Stable Diffusion where CFG 7-12 is normal, Kontext works best in the 2.5-5.0 range. Higher values don't mean better — they often mean artifacts.

### Action Verbs That Work Well

Kontext responds strongly to clear action verbs:

| Verb | Use Case |
|------|----------|
| **Change** | Swap one element for another: "Change the car color from red to blue" |
| **Replace** | Substitute elements: "Replace the background with a mountain landscape" |
| **Add** | Insert new elements: "Add a cat sitting on the windowsill" |
| **Remove** | Delete elements: "Remove the person in the background" |
| **Transform** | Holistic changes: "Transform this into a watercolor painting" |
| **Adjust** | Subtle modifications: "Adjust the lighting to be warmer and more golden" |
| **Make** | Quality changes: "Make the image look like it was shot on 35mm film" |
| **Place** | Position elements: "Place a coffee cup on the table in front of her" |
| **Turn** | Convert: "Turn this daytime scene into night" |
| **Keep** | Preservation: "Keep the person identical, change everything else" |

### Preservation Instructions

One of Kontext's superpowers is selective editing. Always specify what to PRESERVE:

**✅ Good:** "Change the background to a beach sunset **while keeping the person's face, pose, clothing, and expression exactly the same**"

**❌ Bad:** "Beach sunset background" (ambiguous — may alter the subject too)

---

## Image Editing Techniques

### Local Edits (Targeted Changes)

Modify specific regions without affecting the rest:

```
"Change only the color of her lipstick from red to deep burgundy. 
Keep all other makeup, skin tone, and features identical."
```

```
"Replace the painting on the wall behind the desk with a window 
showing a city skyline at night. Keep the desk and person unchanged."
```

### Global Edits (Scene-Wide Changes)

Transform the entire image while maintaining structural integrity:

```
"Transform this photo into a cyberpunk-style illustration. Neon color 
palette, digital glitch effects, holographic overlays. Maintain the 
original composition and person's likeness."
```

```
"Shift the entire color grade to teal and orange cinema look. Add film 
grain and subtle lens vignetting. Keep all subjects and composition."
```

### Lighting Edits

Kontext handles lighting modifications remarkably well:

```
"Change the flat office lighting to dramatic Rembrandt lighting from 
the upper left. Deep shadows on the right side of the face, warm 
directional light. Keep the person and background identical."
```

```
"Add volumetric fog and rim lighting from behind the subject. 
The light should create a glowing halo around their silhouette."
```

### Wardrobe and Appearance

```
"Change her casual t-shirt and jeans to a formal black evening gown 
with subtle sequin details. Add diamond stud earrings. Keep face, 
hair, and pose identical."
```

### Environment Swaps

```
"Move this person from the studio backdrop to a bustling Italian piazza 
at golden hour. Maintain their exact pose, expression, and clothing. 
Add natural outdoor lighting with warm tones."
```

### Time-of-Day Changes

```
"Transform this daytime exterior into a nighttime scene. Add street 
lamp lighting, a crescent moon, and deep blue sky tones. Windows 
should glow with warm interior light. Keep architecture identical."
```

---

## Character Consistency

### The Core Workflow

Kontext's character consistency workflow is elegant:

1. **Generate or provide** a reference character image
2. **Use Kontext I2I** to place that character in different scenes
3. **The model preserves** facial features, body type, distinctive features
4. **You describe** the new scene, pose, lighting, wardrobe

### Character Consistency Prompting

**Template:**
```
"Place this person in [new scene]. They are [new pose/action]. 
[New lighting/environment details]. Maintain their exact facial 
features, body proportions, and distinctive characteristics. 
[Optional: change/keep clothing]."
```

**Example sequence for a character across 3 shots:**

Shot 1 (reference): Original photo of character
Shot 2: "Place this person sitting at a café table in Paris, reading a newspaper. Afternoon sunlight. They wear the same clothing. Maintain exact facial features."
Shot 3: "This person standing on a rooftop at night, city lights behind them. Wind in their hair. Same face and build, now wearing a leather jacket."

### Multi-Image Character Consistency

Using the Kontext Multi endpoint for combining characters:

```python
result = client.subscribe("fal-ai/flux-pro/kontext/multi", {
    "prompt": "These two people standing together in a formal portrait, 
    dressed in matching black suits, in front of an elegant marble wall. 
    Preserve both faces and builds exactly.",
    "image_url": [
        "https://character-a-reference.jpg",
        "https://character-b-reference.jpg"
    ]
})
```

### Consistency Limitations

- **Not pixel-perfect:** Kontext preserves identity but not exact pixel-level details. Small variations in fringe hair, minor facial proportions, and skin texture are normal
- **Pose changes affect consistency:** Extreme pose changes (front-facing to profile) reduce facial consistency
- **Multiple characters:** Consistency quality degrades with 3+ characters in one scene
- **Best results:** Front-facing, well-lit reference images with clear facial features

---

## Typography & Text Editing

### Kontext's Typography Advantage

Kontext is one of very few AI image models that handles text rendering reliably. This makes it invaluable for:

- Movie poster creation and iteration
- In-scene signage and label editing
- Title cards and lower thirds for video
- Product mockup text changes

### Text Editing in Existing Images

```
"Change the neon sign from 'BAR' to 'JAZZ CLUB' in the same retro 
neon style. Keep the same glow color and tube thickness."
```

```
"Replace the movie poster title from 'THE MATRIX' to 'PHANTOM CODE' 
in the same font style and color. Adjust subtitle to 'Coming 2026'."
```

### Text Generation (T2I)

```
"A vintage movie poster for a noir film titled 'SHADOWS OF DOUBT'. 
Black and white with red accent color. A detective silhouette under 
a street lamp. Art deco typography, distressed texture."
```

### Typography Best Practices

1. **Quote the exact text** you want: Use quotation marks around text strings
2. **Specify font style** in natural language: "bold sans-serif," "elegant script," "hand-written"
3. **Reference existing style:** "in the same font and color as the original"
4. **Keep text short:** Kontext handles 1-5 word phrases best; longer text increases error rates
5. **Specify placement:** "centered at the top," "bottom-left corner"

---

## Multi-Image Workflows

### Style Transfer

Use Multi endpoint to apply the style of one image to the content of another:

```python
{
    "prompt": "Apply the artistic style and color palette of the first 
    image to the scene composition of the second image. Maintain the 
    subjects and layout from the second image.",
    "image_url": [
        "https://style-reference.jpg",
        "https://content-image.jpg"
    ]
}
```

### Element Composition

Combine specific elements from different images:

```python
{
    "prompt": "Place the person from the first image into the 
    environment shown in the second image. Match the lighting 
    and perspective of the second image.",
    "image_url": [
        "https://person-reference.jpg",
        "https://background-reference.jpg"
    ]
}
```

### Iterative Multi-Turn Editing

Chain multiple Kontext edits for complex transformations:

```
Turn 1: "Change the lighting to dramatic golden hour" → output_1.jpg
Turn 2: Input output_1.jpg → "Add a vintage film grain texture" → output_2.jpg
Turn 3: Input output_2.jpg → "Change the text to 'FINAL CUT'" → output_3.jpg
```

Each turn preserves the changes from previous edits while applying new modifications.

---

## Best Practices for Cinematic Use

### Keyframe Pipeline for Video Generation

Kontext is invaluable as a keyframe preparation tool before video generation:

```
1. Generate base character image (Kontext T2I or Midjourney)
2. Use Kontext I2I to create Shot A keyframe (character in scene 1)
3. Use Kontext I2I to create Shot B keyframe (character in scene 2)
4. Feed keyframes into PixVerse Transition or Kling I2V for video
5. Result: Consistent character across video shots
```

### Shot-to-Shot Consistency Workflow

For a multi-shot sequence with consistent characters:

```python
# Shot 1: Establishing shot
shot_1 = kontext_edit(
    image_url=character_ref,
    prompt="This person walking into a dimly lit bar, wide shot, 
    atmospheric lighting, shot on 35mm film"
)

# Shot 2: Close-up
shot_2 = kontext_edit(
    image_url=character_ref,
    prompt="Close-up of this person's face as they sit at the bar, 
    warm amber light from the bartender's lamp, reflective glass 
    surface, shallow depth of field"
)

# Shot 3: Over-shoulder
shot_3 = kontext_edit(
    image_url=character_ref,
    prompt="Over-the-shoulder shot as this person looks at a 
    mysterious stranger across the bar, soft focus background, 
    noir lighting"
)
```

### Color Grading with Kontext

Kontext excels at applying film-grade color treatments:

```
"Apply a Kodak Portra 400 color profile to this image. Warm skin 
tones, slightly lifted blacks, gentle pastel highlight rolloff. 
Maintain all subjects and composition."
```

```
"Grade this image in the style of 'Blade Runner 2049': teal shadows, 
orange highlights, desaturated midtones, high contrast. Atmospheric 
haze in the background."
```

### Cinematic Aspect Ratio Conversion

Kontext can intelligently extend compositions for different aspect ratios:

```
# Convert 1:1 portrait to cinematic 16:9
kontext_edit(
    image_url=square_portrait,
    prompt="Extend the scene to a wide cinematic 16:9 composition. 
    Add environmental context on both sides that matches the mood 
    and lighting of the original.",
    aspect_ratio="16:9"
)
```

### Production Asset Management

**Seed locking** is critical for Kontext production work:

1. When you achieve a good edit, **record the seed**
2. Recreate with same seed + same prompt = identical result
3. Modify prompt while keeping seed for controlled variation
4. Different seed + same prompt = same edit intent, different execution

---

## Common Mistakes & Troubleshooting

### Mistake 1: Standard T2I Prompting for Editing

**Problem:** Using descriptive prompts instead of instruction prompts for I2I:

❌ "A woman in a blue dress in a field of sunflowers"
✅ "Change her dress to blue. Keep everything else identical."

**Why:** Kontext I2I interprets prompts as INSTRUCTIONS. Descriptive prompts confuse the editing context.

### Mistake 2: Guidance Scale Too High

**Problem:** Setting `guidance_scale` to 7+ and getting artifacts, over-saturation, or distorted features.

**Fix:** Keep guidance_scale between 2.5 and 5.0 for most edits. Start at 3.5 (default) and adjust.

### Mistake 3: No Preservation Instructions

**Problem:** "Add a hat" → model also changes the face, lighting, and background.

**Fix:** "Add a stylish fedora hat. Keep face, hair (except where covered by hat), expression, clothing, and background completely unchanged."

### Mistake 4: Using I2I Endpoint for Pure Generation

**Problem:** Using `fal-ai/flux-pro/kontext` with a random image as `image_url` when you actually want T2I generation.

**Fix:** Use `fal-ai/flux-pro/kontext/text-to-image` for pure generation. The I2I endpoint always references the input image.

### Mistake 5: Expecting Pixel-Perfect Consistency

**Problem:** Expecting identical pixel-level reproduction of a character across scenes.

**Fix:** Kontext preserves identity (face shape, features, build) but not exact pixels. Minor variations are inherent. For critical consistency, generate several options and choose the closest match.

### Mistake 6: Complex Multi-Step Edits in One Prompt

**Problem:** "Change the background to mountains, make her dress red, add a sunset, remove the chair, and add birds in the sky"

**Fix:** Break complex edits into 2-3 sequential Kontext calls. Each call handles 1-2 changes cleanly.

### Mistake 7: Low-Quality Reference Images

**Problem:** Providing a blurry, low-res, or poorly lit reference image and expecting high-quality edits.

**Fix:** Use the highest quality reference image available. Clean, well-lit, properly exposed references produce the best edits. Consider upscaling references first if needed.

### Mistake 8: Forgetting Output Format

**Problem:** Using default JPEG output for images that need transparency or lossless quality.

**Fix:** Set `output_format: "png"` when you need lossless quality or when the output will undergo further processing. JPEG is fine for final delivery.

---

## Cinematic Prompting Examples

### Example 1: Film Noir Character Edit

```json
{
  "endpoint": "fal-ai/flux-pro/kontext",
  "prompt": "Transform the lighting to classic film noir. Hard directional light from upper-left creating deep shadows across the right side of the face. Add cigarette smoke wisping upward. Convert to high-contrast black and white with deep blacks and bright highlights. Add subtle film grain. Keep the person's face, pose, and clothing exactly the same.",
  "image_url": "https://your-character-portrait.jpg",
  "guidance_scale": 4.0,
  "output_format": "png",
  "seed": 42
}
```

**Why this works:** Clear editing instructions (transform lighting, add smoke, convert to B&W), specific lighting description (directional, shadows), explicit preservation ("face, pose, clothing exactly the same").

### Example 2: Cinematic Keyframe — Scene Change

```json
{
  "endpoint": "fal-ai/flux-pro/kontext",
  "prompt": "Move this person to a rain-soaked Tokyo intersection at night. Neon signs reflecting in puddles on the asphalt. They hold a translucent umbrella. Traffic lights create red and green color splashes. Shot on 35mm film with anamorphic lens flare from the neon lights. Maintain their exact facial features and body proportions.",
  "image_url": "https://your-character-ref.jpg",
  "guidance_scale": 3.5,
  "aspect_ratio": "16:9",
  "output_format": "jpeg",
  "seed": 8675309
}
```

**Why this works:** Specific environment (Tokyo, rain, neon), added prop (umbrella), lighting details (neon reflections, traffic lights), film stock reference (35mm anamorphic), character preservation.

### Example 3: Movie Poster Typography

```json
{
  "endpoint": "fal-ai/flux-pro/kontext/text-to-image",
  "prompt": "Cinematic movie poster for a thriller called 'LAST BREATH'. Dark atmospheric image of a diver silhouette descending into deep ocean blackness. Title 'LAST BREATH' in large, distressed white sans-serif text at the top. Tagline 'Some depths were never meant to be reached.' in smaller text below. Deep blue and black color palette with a single beam of light from above. Film grain texture. Award laurel at bottom: 'Official Selection — Sundance 2026'.",
  "guidance_scale": 4.5,
  "aspect_ratio": "2:3",
  "output_format": "png",
  "seed": 2026
}
```

**Why this works:** Uses T2I endpoint for pure generation. Quoted text strings for exact typography. Specific layout instructions (top, below, bottom). Visual style clearly defined.

### Example 4: Color Grade Application

```json
{
  "endpoint": "fal-ai/flux-pro/kontext",
  "prompt": "Apply a cinematic color grade inspired by 'Sicario' (2015, Roger Deakins). Desaturated warm tones, amber highlights, deep shadow detail with slight blue-green tint in the blacks. Add atmospheric haze that reduces contrast in the background. Increase the perception of heat and dust in the air. Keep all subjects, composition, and framing identical.",
  "image_url": "https://your-scene-image.jpg",
  "guidance_scale": 3.0,
  "output_format": "jpeg"
}
```

**Why this works:** References a specific film/DP for color style, describes the grade in technical terms (desaturated, amber highlights, blue-green blacks), adds atmospheric elements, strong preservation.

### Example 5: Character Wardrobe Change for Multi-Shot

```json
{
  "endpoint": "fal-ai/flux-pro/kontext",
  "prompt": "Change this person's outfit from casual wear to a tailored charcoal three-piece suit with a dark red tie and white pocket square. Add a luxury wristwatch visible on the left wrist. Keep the exact same face, hairstyle, pose, and expression. Maintain the same background and lighting.",
  "image_url": "https://your-character-casual.jpg",
  "guidance_scale": 4.0,
  "output_format": "jpeg",
  "seed": 1234
}
```

### Example 6: Multi-Reference Scene Composition

```json
{
  "endpoint": "fal-ai/flux-pro/kontext/multi",
  "prompt": "Create a scene where the person from the first image is sitting across a table from the person in the second image. They are in a moody, dimly lit restaurant. Candlelight between them. Shot at eye level, medium-wide framing. Both faces preserved exactly as in references. Cinematic shallow depth of field.",
  "image_url": [
    "https://character-a-reference.jpg",
    "https://character-b-reference.jpg"
  ],
  "guidance_scale": 3.5,
  "aspect_ratio": "16:9",
  "output_format": "jpeg"
}
```

### Example 7: Text-to-Image Cinematic Still

```json
{
  "endpoint": "fal-ai/flux-pro/kontext/text-to-image",
  "prompt": "Cinematic still from a science fiction film. A lone astronaut stands on the surface of Mars, their visor reflecting a distant Earth. The Martian landscape stretches to the horizon — rust-red dunes, scattered rocks, thin wispy atmosphere. Late afternoon sun casts long dramatic shadows. Shot on ARRI Alexa, anamorphic 2.39:1, shallow focus on the astronaut with the landscape softly defocused. Color graded with teal shadows and warm amber highlights.",
  "guidance_scale": 4.0,
  "aspect_ratio": "21:9",
  "output_format": "jpeg",
  "seed": 2001
}
```

---

## Comparison vs Other Models

### Kontext vs Image Editing/Generation Alternatives

| Feature | Kontext Pro | Kontext Max | GPT Image 1.5 | Midjourney v6 | Flux 2 Pro | Recraft v4 |
|---------|-------------|-------------|----------------|---------------|------------|------------|
| **Image-to-Image Editing** | ✅ Excellent | ✅ Superior | ✅ Good | ❌ No I2I | ❌ No I2I (Redux only) | ❌ No I2I |
| **Character Consistency** | ✅ Excellent | ✅ Excellent | ✅ Good | ⚠️ Inconsistent | ❌ | ❌ |
| **Typography** | ✅ Excellent | ✅ Excellent | ✅ Good | ⚠️ Fair | ✅ Good | ✅ Excellent |
| **Text-to-Image Quality** | ✅ Very Good | ✅ Excellent | ✅ Excellent | ✅ Excellent | ✅ Excellent | ✅ Excellent |
| **Multi-Image Input** | ✅ Multi endpoint | ✅ Multi endpoint | ❌ | ❌ | ❌ | ❌ |
| **Speed** | ✅ Fast | ✅ Fast | ⚠️ Slower | ⚠️ Slower | ✅ Fast | ✅ Fast |
| **Price/Image** | $0.04 | ~$0.08 | ~$0.04 | ~$0.01 | $0.05 | $0.04 |
| **Prompt Following** | Very Good | Excellent | Very Good | Good | Excellent | Excellent |
| **Style Transfer** | ✅ Via I2I | ✅ Via I2I | ❌ | ⚠️ Limited | ⚠️ Redux only | ❌ |
| **LoRA Support** | ✅ Dedicated endpoint | ❌ | ❌ | ❌ | ✅ | ❌ |

### When Kontext Wins Decisively

1. **Image editing without masks:** No other model makes editing this easy — just describe the change
2. **Character consistency across scenes:** The reference image → new scene workflow is unmatched
3. **Typography editing:** Changing text in existing images reliably
4. **Speed for iterative editing:** 8× faster than competitors enables real-time creative iteration
5. **Cost for editing workflows:** $0.04/edit is extremely competitive
6. **Multi-image composition:** The Multi endpoint enables unique composition workflows

### When to Use Something Else

1. **Pure photorealistic generation from text:** GPT Image 1.5 or Midjourney may produce more stunning results
2. **Video content:** Kontext is image-only; use PixVerse, Kling, Veo, or Runway for video
3. **Extreme detail at large resolutions:** Recraft v4 can output 4K+
4. **Budget bulk generation:** Midjourney is cheaper per image for non-editing use cases
5. **Complex inpainting with precise masks:** Dedicated inpainting pipelines (SD + mask) offer more precise region control

---

## Cost Reference

### Pricing

| Endpoint | Cost Per Image |
|----------|---------------|
| Kontext Pro — Image-to-Image | $0.04 |
| Kontext Pro — Text-to-Image | $0.04 |
| Kontext Pro — Multi | $0.04 |
| Kontext Max — Image-to-Image | ~$0.08 (estimated; check fal.ai) |
| Kontext Max — Text-to-Image | ~$0.08 (estimated; check fal.ai) |
| Kontext LoRA | ~$0.05 (estimated; check fal.ai) |

### Cost Optimization Strategies

1. **Use Pro for iteration, Max for finals:** Iterate edits with Kontext Pro ($0.04), switch to Max only for the final output
2. **Batch seed exploration:** Generate `num_images: 4` in one call to explore variations (4 × $0.04 = $0.16 for 4 options)
3. **Chain edits efficiently:** Each edit is $0.04, so a 5-step edit chain = $0.20 — still very cheap
4. **JPEG for drafts, PNG for finals:** JPEG is lighter on bandwidth; PNG for lossless production assets
5. **Skip enhance_prompt for precise work:** The prompt enhancement adds computation; use only when your prompts are short/vague

### Budget Planning for Production

**Character consistency across a 10-shot sequence:**
- 10 Kontext Pro edits × $0.04 = $0.40
- With 3× iteration rate: ~$1.20 per sequence
- Extremely cost-effective compared to manual Photoshop work

**Movie poster iteration:**
- 20 variations × $0.04 = $0.80 for extensive exploration
- Kontext Max finals: 3 × $0.08 = $0.24
- Total: ~$1.04 for professional poster development

---

## Appendix: Quick Reference Card

### Editing Prompt Template

```
"[Action verb] [specific target] to/from [current state] to [desired state]. 
Keep [preservation list] exactly the same. [Additional quality instructions]."
```

### Production-Ready API Call Template (Image Edit)

```python
result = client.subscribe("fal-ai/flux-pro/kontext", {
    "prompt": "YOUR_EDITING_INSTRUCTION",
    "image_url": "YOUR_REFERENCE_IMAGE_URL",
    "guidance_scale": 3.5,
    "output_format": "jpeg",
    "seed": YOUR_LOCKED_SEED,
    "num_images": 1
})
```

### Production-Ready API Call Template (Text-to-Image)

```python
result = client.subscribe("fal-ai/flux-pro/kontext/text-to-image", {
    "prompt": "YOUR_DETAILED_DESCRIPTION",
    "guidance_scale": 4.0,
    "aspect_ratio": "16:9",
    "output_format": "png",
    "seed": YOUR_SEED,
    "num_images": 1
})
```

### Guidance Scale Quick Reference

| Edit Type | Recommended guidance_scale |
|-----------|---------------------------|
| Subtle lighting/color changes | 2.5–3.0 |
| Wardrobe/object changes | 3.5 (default) |
| Environment swaps | 3.5–4.0 |
| Typography/text edits | 4.0–5.0 |
| Style transfer | 3.0–3.5 |
| Maximum prompt adherence | 5.0–6.0 |
