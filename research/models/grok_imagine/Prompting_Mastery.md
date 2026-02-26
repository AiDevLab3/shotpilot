# Grok Imagine Image: Complete Prompting Mastery Guide

**Version:** 2.0  
**Date:** February 19, 2026  
**Author:** Cine-AI Knowledge Base Team

---

## Table of Contents

1. [Introduction](#introduction)
2. [Technical Specifications](#technical-specifications)
3. [API Reference — fal.ai](#api-reference--falai)
4. [Generation Modes](#generation-modes)
5. [Core Prompting Framework](#core-prompting-framework)
6. [The 6-Variable Prompt Structure](#the-6-variable-prompt-structure)
7. [Advanced Prompting Techniques](#advanced-prompting-techniques)
8. [Aspect Ratio Mastery](#aspect-ratio-mastery)
9. [Image Editing Mode](#image-editing-mode)
10. [Prompt Revision System](#prompt-revision-system)
11. [Cinematic Still Photography](#cinematic-still-photography)
12. [Style & Aesthetic Control](#style--aesthetic-control)
13. [Genre-Specific Examples](#genre-specific-examples)
14. [Best Practices](#best-practices)
15. [Common Mistakes & Troubleshooting](#common-mistakes--troubleshooting)
16. [Failure Modes & Edge Cases](#failure-modes--edge-cases)
17. [Comparison with Other Image Models](#comparison-with-other-image-models)
18. [Integration Workflows](#integration-workflows)
19. [Pricing & Optimization](#pricing--optimization)

---

## Introduction

**Grok Imagine Image** is xAI's flagship image generation model, accessible via fal.ai. It excels at producing **highly aesthetic, stylistically bold images** with a distinctive visual personality. Unlike models optimized purely for photorealism (Nano Banana Pro) or technical precision (Flux 2), Grok Imagine Image has a strong aesthetic bias toward dramatic, eye-catching, and emotionally resonant compositions.

### What Makes Grok Imagine Unique

- **Aesthetic Intelligence:** Strong built-in sense of composition, color harmony, and visual drama — produces images that "pop" without extensive prompt engineering
- **Prompt Revision:** The model automatically enhances your prompt (returned as `revised_prompt`), adding compositional and stylistic details — learn from what it adds
- **Broad Aspect Ratio Support:** 12 aspect ratios from ultra-wide (2:1) to ultra-tall (1:2), including device-specific ratios (19.5:9, 9:19.5)
- **Image Editing:** Native edit mode that modifies existing images based on text instructions
- **Stylistic Versatility:** Excels across photorealism, illustration, concept art, fashion, editorial, and abstract styles
- **Fast Generation:** Quick inference with results typically under 10 seconds
- **xAI Ecosystem:** Part of the broader Grok family (including Grok Imagine Video for T2V and I2V)

### When to Use Grok Imagine Image

**Best For:**
- Hero frames for cinematic video pipelines (feed into Kling, VEO, Sora)
- Social media content requiring immediate visual impact
- Concept art and mood boards for film/video pre-production
- Editorial and fashion photography stills
- Dramatic, emotionally charged portraits and scenes
- Quick iteration with strong aesthetic defaults

**Not Ideal For:**
- Technical accuracy requiring precise text rendering (use Nano Banana Pro)
- Multi-image character consistency across generations (use Flux 2 with LoRA)
- Scientific or technical illustration requiring precision
- Images requiring extensive reference image input (Grok has no image reference for generation)
- Controlled editing with masks (use Nano Banana Pro or Flux 2)

---

## Technical Specifications

### Model Capabilities

| Feature | Specification |
|---------|--------------|
| **Model Type** | Text-to-Image, Image-to-Image (edit) |
| **Output Resolution** | High resolution (model-determined, typically 1024×1024 base) |
| **Aspect Ratios** | 2:1, 20:9, 19.5:9, 16:9, 4:3, 3:2, 1:1, 2:3, 3:4, 9:16, 9:19.5, 9:20, 1:2 |
| **Batch Generation** | Multiple images per request (num_images) |
| **Output Formats** | JPEG, PNG, WebP |
| **Prompt Revision** | Automatic prompt enhancement (returned in response) |
| **Editing** | Text-guided image editing |
| **API Provider** | fal.ai (xai/grok-imagine-image) |
| **Cost** | $0.02 per image |

### Strengths

✅ **Aesthetic Quality** — Strong visual drama and composition out of the box  
✅ **Color Mastery** — Excellent color grading, harmony, and palette control  
✅ **Emotional Resonance** — Images feel charged with mood and atmosphere  
✅ **Fast Generation** — Quick inference for rapid iteration  
✅ **Broad Aspect Ratios** — 12 ratios including device-specific formats  
✅ **Prompt Enhancement** — Model improves prompts automatically  
✅ **Image Editing** — Native edit capability for refinements  
✅ **Cost Effective** — $0.02/image is very competitive  

### Limitations

❌ **No Reference Image Input** — Cannot use reference images for generation (only for editing)  
❌ **No Character Consistency** — Cannot lock identity across generations  
❌ **Limited Text Rendering** — On-screen text is inconsistent  
❌ **Prompt Revision Opacity** — Model modifies your prompt; sometimes adds unwanted elements  
❌ **No Inpainting/Masking** — Edit mode is global, not region-specific  
❌ **No Multi-Image Coherence** — Each generation is independent  
❌ **Resolution Control** — Cannot specify exact pixel dimensions  

---

## API Reference — fal.ai

### Endpoints

| Endpoint | Model ID | Description |
|----------|----------|-------------|
| **Text-to-Image** | `xai/grok-imagine-image` | Generate images from text |
| **Image Edit** | `xai/grok-imagine-image/edit` | Edit existing images with text |

### Text-to-Image — Input Schema

```json
{
  "prompt": "string",              // Required: text description
  "num_images": 1,                 // Number of images to generate (default: 1)
  "aspect_ratio": "1:1",          // Aspect ratio (default: "1:1")
  "output_format": "jpeg",         // "jpeg", "png", or "webp" (default: "jpeg")
  "sync_mode": false               // If true, returns data URI (no history)
}
```

### Image Edit — Input Schema

```json
{
  "prompt": "string",              // Required: edit instruction
  "image_url": "string",          // Required: URL of image to edit
  "num_images": 1,                 // Number of variations
  "output_format": "jpeg"          // "jpeg", "png", or "webp"
}
```

### Output Schema

```json
{
  "images": [
    {
      "url": "string",
      "content_type": "string",
      "file_name": "string",
      "file_size": 0,
      "width": 0,
      "height": 0
    }
  ],
  "revised_prompt": "string"       // The enhanced prompt used by the model
}
```

### API Call Example (JavaScript)

```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("xai/grok-imagine-image", {
  input: {
    prompt: "A noir detective in a rain-soaked alley, fedora casting shadow over eyes, cigarette smoke curling into neon light, cinematic lighting, film grain, moody atmosphere",
    num_images: 1,
    aspect_ratio: "16:9",
    output_format: "png"
  }
});

console.log(result.data.images[0].url);
console.log(result.data.revised_prompt);  // See what the model enhanced
```

### API Call Example (Python)

```python
import fal_client

result = fal_client.subscribe(
    "xai/grok-imagine-image",
    arguments={
        "prompt": "A noir detective in a rain-soaked alley...",
        "aspect_ratio": "16:9",
        "output_format": "png"
    }
)
print(result["images"][0]["url"])
print(result["revised_prompt"])
```

---

## Generation Modes

### 1. Text-to-Image (T2I)

The primary mode. Provide a text description and receive one or more images.

**Key Behaviors:**
- The model automatically revises your prompt (check `revised_prompt` in output)
- Strong aesthetic defaults — minimal prompting produces visually appealing results
- No seed control — each generation is unique; regenerate for variations
- Batch generation via `num_images` for exploring variations

### 2. Image Editing (I2I Edit)

Modify an existing image based on text instructions. The model understands the input image and applies your described changes.

**Key Behaviors:**
- Preserves overall composition while applying changes
- Global edits (cannot target specific regions via mask)
- Works best for style changes, lighting adjustments, and adding/removing elements
- Maintains spatial relationship of existing elements

---

## Core Prompting Framework

Grok Imagine responds best to **descriptive, evocative natural language** rather than keyword lists. Think like an art director briefing a photographer.

### The Golden Rules

#### Rule 1: Lead with Visual Impact

Start your prompt with the most visually striking element. The model gives priority to early prompt content.

```
❌ "A photo of a woman standing in the rain with dramatic lighting"
✅ "Dramatic rain-soaked portrait, a woman's face half-lit by a single streetlight, water streaming down her skin, eyes catching the light"
```

#### Rule 2: Describe the Feeling, Not Just the Scene

Grok Imagine excels when you communicate emotion and mood.

```
❌ "A forest at night"
✅ "A suffocating darkness between ancient trees, barely visible silver moonlight filtering through the canopy, the kind of forest where you feel watched"
```

#### Rule 3: Use Cinematic and Photographic Language

The model responds strongly to camera, lighting, and film terminology.

```
❌ "A portrait with nice lighting"
✅ "Shot on Hasselblad 500C, Kodak Portra 400, 80mm lens at f/2.8, golden hour backlighting creating a rim light halo, slight lens flare"
```

#### Rule 4: Embrace the Revised Prompt

Check the `revised_prompt` output. The model adds details it considers important. Learn from these additions to improve future prompts.

```
Your prompt: "A samurai at sunset"
Revised prompt: "A lone samurai standing on a cliff edge at sunset, silhouetted against a 
burning orange and crimson sky, traditional armor reflecting the dying light, wind catching 
his cloak, distant mountains fading into mist, cinematic composition with rule of thirds, 
dramatic backlighting, epic atmosphere"
```

**Lesson:** The model added composition (rule of thirds), specific colors (orange, crimson), environmental details (mountains, mist), and atmosphere. Incorporate these elements directly in future prompts for more control.

---

## The 6-Variable Prompt Structure

For maximum control, structure prompts using these six variables:

### 1. Subject

The primary focus of the image. Be hyper-specific about identity, appearance, and characteristics.

**Specificity Ladder:**
```
Level 1 (vague): "a woman"
Level 2 (better): "a middle-aged woman with silver hair"
Level 3 (good): "a severe-looking woman in her 50s with cropped silver hair, sharp jawline, wearing wire-rimmed glasses"
Level 4 (expert): "a distinguished architect in her 50s, Scandinavian features, cropped silver hair with an asymmetric cut, sharp jawline softened by laugh lines, wearing minimalist wire-rimmed glasses, dressed in a black structured blazer over a white linen shirt, confident posture with arms crossed"
```

### 2. Composition

Camera position, framing, and spatial arrangement.

**Key Terms:**
- **Framing:** Extreme close-up, close-up, medium close-up, medium shot, medium wide, wide shot, extreme wide shot
- **Angle:** Eye level, low angle (power), high angle (vulnerability), bird's eye, worm's eye, Dutch angle
- **Composition Rules:** Rule of thirds, centered, golden ratio, leading lines, frame within frame, negative space
- **Perspective:** Forced perspective, aerial view, over-the-shoulder, POV

### 3. Action/Pose

What the subject is doing. Even for still images, implied motion creates dynamism.

**Examples:**
```
Static: "Standing in a doorway, one hand on the frame, weight on one hip"
Dynamic: "Mid-leap across a puddle, coat flaring, hair caught by wind"
Subtle: "Adjusting a cufflink, glancing up with one eyebrow raised"
```

### 4. Location/Environment

Where the scene takes place, with specific environmental details.

**Environmental Detail Layers:**
```
Layer 1: General location — "Tokyo street"
Layer 2: Specifics — "Narrow Shinjuku back alley, vending machines humming"  
Layer 3: Atmosphere — "Wet pavement reflecting neon, steam from a grate, 2 AM emptiness"
Layer 4: Sensory — "The kind of alley that smells like rain and ramen, where every surface glows"
```

### 5. Style/Medium

The artistic approach and technical aesthetic.

**Style Categories:**

| Category | Examples |
|----------|---------|
| **Photographic** | "Shot on Leica M10, 35mm Summilux, Kodak Tri-X 400, street photography" |
| **Cinematic** | "Anamorphic lens, 2.39:1, Alexa 35, teal-orange grade, film grain" |
| **Painterly** | "Oil painting on linen canvas, visible brushstrokes, chiaroscuro" |
| **Illustration** | "Digital illustration, cel shading, clean linework, flat color" |
| **Fashion/Editorial** | "Vogue editorial, high-fashion lighting, beauty dish key light" |
| **Concept Art** | "Film concept art, matte painting style, epic scale, digital painting" |

### 6. Mood/Lighting

The emotional tone conveyed through light and atmosphere.

**Lighting Setups:**

| Setup | Description | Mood |
|-------|-------------|------|
| **Rembrandt** | Triangle of light on shadow-side cheek | Classic, dramatic, painterly |
| **Butterfly** | Light directly above, creating nose shadow | Glamorous, fashion |
| **Split** | Light on exactly half the face | Mystery, duality, conflict |
| **Rim/Edge** | Light from behind, outlining subject | Ethereal, mysterious, angelic |
| **High Key** | Bright, even, minimal shadows | Happy, clean, commercial |
| **Low Key** | Mostly dark, selective highlights | Noir, dramatic, moody |
| **Golden Hour** | Warm, low-angle, long shadows | Romantic, nostalgic, warm |
| **Blue Hour** | Cool, twilight, soft | Melancholic, ethereal, quiet |
| **Volumetric** | God rays, fog, visible light beams | Cinematic, atmospheric, epic |

---

## Advanced Prompting Techniques

### Technique 1: Negative Space Composition

Grok Imagine responds well to deliberate negative space direction.

```
"A lone figure standing in the bottom-right corner of the frame, vast empty sky occupying 80% of the image, the smallness emphasizing solitude. Minimalist composition, muted earth tones."
```

### Technique 2: Color Palette Control

Specify exact color relationships for controlled palettes.

```
"Strictly limited palette: deep navy (#1B1F3B), warm amber (#E8A838), and off-white (#F5F0E8). A jazz club interior where every element exists within these three colors. No other hues."
```

```
"Complementary color clash: electric cyan hair against deep magenta neon, everything else desaturated to near-monochrome. Fashion portrait, editorial."
```

### Technique 3: Texture and Materiality

Describe surfaces and materials with specificity for tactile realism.

```
"Close-up of weathered hands holding a ceramic bowl. The skin: cracked and calloused, visible fingerprints, subtle scars across the knuckles. The bowl: wabi-sabi imperfect, matte glaze with hairline crazing, handmade wobble to the rim. Warm directional light catching every texture."
```

### Technique 4: Temporal Implication in Stills

Imply motion and time in a static image.

```
"The exact moment a wine glass shatters on a marble floor — red wine frozen mid-splash, shards catching light, droplets suspended in air. Ultra-high-speed photography feel, f/2.8, dark background, single flash."
```

### Technique 5: Multi-Layer Depth

Describe distinct foreground, midground, and background elements.

```
"Foreground: rain-soaked wrought iron railing, water droplets in sharp focus. Midground: a woman in a yellow raincoat crossing the street, slightly soft. Background: Parisian buildings fading into gray mist, completely out of focus. Depth layering creating dimension. 85mm lens, f/2.0."
```

### Technique 6: Film Stock Emulation

Grok responds strongly to specific film stock references.

```
"Shot on Kodak Vision3 500T, pushed one stop. Warm tungsten cast, visible grain structure, slightly lifted blacks, that specific Kodak warmth in the highlights. 35mm film, mechanical camera texture."
```

```
"Fujifilm Velvia 50 color rendition — hyper-saturated greens and blues, punchy contrast, the way Velvia makes sunsets look nuclear. Landscape photography, golden hour."
```

### Technique 7: Lighting Diagram Descriptions

Describe lighting setups like a cinematographer or photographer.

```
"Three-point setup: Key light — large octabox camera-left at 45 degrees, 2 stops above ambient. Fill — bounce card camera-right, 1 stop below key. Hair light — small strip softbox directly behind subject, creating edge separation. Background: slightly underexposed, charcoal gray seamless."
```

### Technique 8: Generating Batch Variations

Use `num_images` > 1 with prompts designed for variation:

```javascript
const result = await fal.subscribe("xai/grok-imagine-image", {
  input: {
    prompt: "Portrait of a character with striking eyes, each generation should explore a different lighting mood and color palette. Cinematic quality.",
    num_images: 4,
    aspect_ratio: "3:4"
  }
});
// Result: 4 different interpretations to choose from
```

---

## Aspect Ratio Mastery

Grok Imagine supports 12 aspect ratios, each suited for different purposes:

### Landscape Ratios

| Ratio | Use Case | Cinematic Equivalent |
|-------|----------|---------------------|
| **2:1** | Ultra-wide panoramic, epic landscapes | Univisium (2.00:1) |
| **20:9** | Ultra-wide cinematic | Near anamorphic feel |
| **19.5:9** | Modern smartphone landscape | iPhone display ratio |
| **16:9** | Standard widescreen | HD/4K video frame |
| **4:3** | Classic film/TV | Academy ratio feel |
| **3:2** | Standard photography | 35mm film frame |

### Square

| Ratio | Use Case |
|-------|----------|
| **1:1** | Instagram, album art, profile images, balanced compositions |

### Portrait Ratios

| Ratio | Use Case | Platform |
|-------|----------|----------|
| **2:3** | Standard portrait photography | Print photography |
| **3:4** | Portrait, product | Pinterest, Instagram portrait |
| **9:16** | Vertical video frame, stories | Instagram/TikTok stories |
| **9:19.5** | Modern smartphone full-screen | iPhone full-screen |
| **9:20** | Tall smartphone format | Extended mobile |
| **1:2** | Ultra-tall | Dramatic vertical compositions |

### Aspect Ratio Selection Strategy

```
Hero frame for 16:9 video → aspect_ratio: "16:9"
Instagram story content → aspect_ratio: "9:16"
Film poster concept → aspect_ratio: "2:3"
Cinematic ultra-wide → aspect_ratio: "2:1"
Product photography → aspect_ratio: "1:1" or "3:4"
Phone wallpaper → aspect_ratio: "9:19.5"
```

---

## Image Editing Mode

The edit endpoint allows text-guided modification of existing images.

### Edit Mode Capabilities

| Edit Type | Quality | Example |
|-----------|---------|---------|
| **Style Transfer** | ✅ Excellent | "Make this photo look like a watercolor painting" |
| **Lighting Change** | ✅ Excellent | "Change the lighting to golden hour" |
| **Color Grade** | ✅ Excellent | "Apply a teal and orange color grade" |
| **Element Addition** | ✅ Good | "Add rain to this scene" |
| **Element Removal** | ⚠️ Variable | "Remove the person in the background" |
| **Style Preservation** | ✅ Good | "Make this more realistic but keep the composition" |
| **Background Change** | ⚠️ Variable | "Change the background to a city at night" |

### Edit Prompt Best Practices

```
❌ "Make it better"
✅ "Increase the contrast, add warm golden hour lighting from the left, make the shadows deeper and more dramatic"

❌ "Change the background"
✅ "Replace the plain wall background with a rainy Tokyo street at night, maintaining the same lighting on the subject"

❌ "Fix the colors"
✅ "Shift the color palette to cool blues and teals, desaturate the warm tones, add a subtle film grain"
```

### Edit API Example

```javascript
const editResult = await fal.subscribe("xai/grok-imagine-image/edit", {
  input: {
    prompt: "Make this scene more cinematic: add volumetric fog, deepen the shadows, apply a teal-orange color grade, add subtle film grain. Keep the composition and subject identical.",
    image_url: "https://example.com/original_image.png",
    output_format: "png"
  }
});
```

---

## Prompt Revision System

Grok Imagine automatically revises your prompt, adding details it considers important. This is both a feature and a challenge.

### How to Work With Prompt Revision

**Strategy 1: Learn and Adapt**
Generate with a simple prompt, read the `revised_prompt`, and incorporate the best additions into your next prompt for more control.

**Strategy 2: Be Exhaustively Specific**
The more complete your prompt, the less the model needs to revise. Detailed prompts experience less unwanted revision.

**Strategy 3: Override by Contradiction**
If the model keeps adding unwanted elements, explicitly exclude them:
```
"A minimalist landscape. NO people, NO animals, NO text, NO buildings. Pure nature: a single tree on a hill against a gradient sky."
```

### Common Revision Patterns

| Your Prompt | Model Tends to Add | Control Strategy |
|-------------|-------------------|-----------------|
| "A portrait" | Dramatic lighting, composition details | Specify your own lighting explicitly |
| "A landscape" | Time of day, atmospheric effects | Define atmosphere yourself |
| "A character" | Backstory-implied visual details | Describe appearance exhaustively |
| Simple/short prompt | Extensive additions | Write longer, more specific prompts |

---

## Cinematic Still Photography

Grok Imagine excels at generating frames that look like they're pulled from films. This makes it an excellent **hero frame generator** for video pipelines.

### Cinematic Frame Recipe

```
"[Shot type] from a [genre] film. [Subject description]. [Lighting setup]. [Lens/camera]. [Color treatment]. [Atmosphere]. Film grain, shallow depth of field."
```

### Examples by Genre

**Thriller:**
```
"Medium close-up from a psychological thriller. A man sits alone in a dimly lit interrogation room, face half in shadow. Single overhead practical light creating harsh downward shadows. Shot on ARRI Alexa with vintage Cooke Speed Panchro 50mm, f/2.0. Desaturated with cold blue shadows and warm amber highlights. Claustrophobic, tense. Subtle film grain."
```

**Romance:**
```
"Two-shot from a French romantic drama. A couple seated at a tiny cafe table, foreheads nearly touching, soft laughter frozen in time. Late afternoon light streaming through the window, catching dust motes. Shot on 85mm at f/1.4, Kodak 5219 500T film stock. Warm, golden, intimate. Shallow depth of field blurring the Parisian street beyond."
```

**Western:**
```
"Extreme wide shot from a Sergio Leone western. A lone gunslinger stands in the center of a dusty main street, town stretching to either side, mountains in the distance. Harsh midday sun, no shadows, bleached colors. Anamorphic 2.39:1, Panavision C-series lens flares. Heat shimmer rising from the ground. Scope and isolation."
```

**Sci-Fi:**
```
"Over-the-shoulder shot from a Blade Runner-inspired sci-fi noir. A detective gazes through rain-streaked glass at a neon-soaked cityscape of holographic advertisements and towering megastructures. Warm interior light mixing with cold blue neon reflections. 40mm anamorphic, bokeh ovals from the neon. Atmospheric, contemplative, overwhelming scale."
```

**Horror:**
```
"Low angle close-up from a slow-burn horror film. A woman's face, eyes wide, lit only by a candle she holds below chin level — classic campfire horror lighting. Deep shadows consuming everything beyond her face. Grain-heavy, desaturated, cold color temperature. The darkness behind her is absolute and suggesting presence."
```

---

## Style & Aesthetic Control

### Photography Styles

| Style | Prompt Keywords | Output Character |
|-------|----------------|-----------------|
| **Street Photography** | "Leica M10, 35mm, decisive moment, candid, urban, natural light" | Documentary, authentic, gritty |
| **Fashion Editorial** | "Vogue, beauty dish, high-fashion, styled, editorial, studio" | Polished, aspirational, bold |
| **Film Photography** | "Kodak Portra 400, 35mm film, grain, soft colors, analog" | Warm, nostalgic, organic |
| **Fine Art** | "Museum quality, gallery print, conceptual, metaphorical" | Deliberate, meaningful, elevated |
| **Product** | "Commercial, clean background, three-point lighting, catalog" | Clean, professional, sellable |
| **Architectural** | "Symmetrical, leading lines, golden hour, wide angle, precision" | Geometric, structured, impressive |

### Illustration Styles

| Style | Prompt Keywords | Output Character |
|-------|----------------|-----------------|
| **Concept Art** | "Film concept art, digital painting, matte painting, epic" | Cinematic, grand, narrative |
| **Anime/Manga** | "Anime style, cel shading, vibrant, clean linework" | Dynamic, colorful, expressive |
| **Watercolor** | "Watercolor painting, wet-on-wet, soft edges, paper texture" | Delicate, organic, atmospheric |
| **Oil Painting** | "Oil on canvas, impasto, visible brushstrokes, classical" | Rich, textured, traditional |
| **Graphic Novel** | "Heavy inks, noir, high contrast, panel composition" | Bold, dramatic, narrative |

---

## Genre-Specific Examples

### Film Noir Hero Frame

```
"A femme fatale in a 1940s fitted black dress stands in a rain-slicked alley, half her face illuminated by a single streetlight creating classic Rembrandt lighting. Smoke curls from a cigarette in a long holder. Venetian blind shadows stripe the wall behind her. Shot on 50mm, f/2.0, Kodak Double-X black and white film stock. Deep blacks, bright highlights, no mid-tones. Film noir, mystery, danger."

Aspect ratio: 16:9
```

### Cyberpunk Environment

```
"A towering megacity at night, seen from street level looking up. Holographic advertisements in Mandarin and English float between buildings. Rain falls through neon light, creating colored streaks. Street vendors with steaming food stalls in the foreground, their warm light contrasting the cold blue and magenta neon. Aerial walkways and flying vehicles at various heights. Atmospheric, dense, lived-in. Anamorphic lens, 24mm, f/4, deep focus."

Aspect ratio: 2:3
```

### Portrait for Character Reference

```
"A weathered sea captain in his 60s, deeply tanned leathery skin, salt-crusted beard, piercing pale blue eyes that have seen everything. Wearing a faded navy peacoat with tarnished brass buttons, a thick cable-knit sweater underneath. Wind-blown silver hair. Shot against an overcast sky at a harbor. 85mm portrait lens, f/2.0, Fujifilm Pro 400H color science. Honest, characterful, lived-in."

Aspect ratio: 3:4
```

### Product Shot

```
"A luxury mechanical watch displayed on a raw concrete slab, water droplets scattered around it. Single dramatic side light from the right creating deep shadows and highlighting the brushed steel case and sapphire crystal. The dial catches light, showing the intricate movement through a skeleton back. Black background, zero distractions. Macro lens, f/4, focus stacked for full sharpness. Commercial, premium, desire."

Aspect ratio: 1:1
```

### Establishing Shot for Film

```
"An abandoned art deco movie palace, seats rotting, chandelier hanging at an angle, screen torn but still catching light from holes in the roof. God rays streaming through the damaged ceiling, illuminating dust particles and making the decay beautiful. Symmetrical composition, the aisle creating a leading line to the screen. Wide angle, 24mm, f/8, deep focus. Beautiful decay, nostalgic, haunted grandeur."

Aspect ratio: 2:1
```

---

## Best Practices

### The 8 Rules of Grok Imagine Prompting

1. **Lead with the most important visual element** — The model weights early prompt content more heavily

2. **Use photographic/cinematic language** — Lens focal length, f-stop, film stock, lighting setups. The model understands these deeply

3. **Describe mood through lighting, not adjectives** — "Rembrandt lighting with deep shadows" is more effective than "moody"

4. **Specify color relationships** — Don't just name colors; describe how they interact: "warm amber highlights against cool blue shadows"

5. **Check revised_prompt and learn** — The model's revisions reveal what it considers important. Incorporate these patterns

6. **Use the right aspect ratio** — Match to final use case. Hero frames for 16:9 video should be generated at 16:9

7. **Generate multiple and select** — Use `num_images: 4` and pick the best. Grok's aesthetic variation is a feature

8. **Edit rather than regenerate** — If 80% is right, use the edit endpoint to refine rather than starting over

### Prompt Length Guidelines

| Scenario | Length | Notes |
|----------|--------|-------|
| Quick concept | 20-40 words | Let the model's aesthetic defaults do the work |
| Standard generation | 50-100 words | Good balance of control and creative freedom |
| Precise control | 100-200 words | Covers all 6 variables in detail |
| Maximum control | 200+ words | Leaves little room for model revision |

---

## Common Mistakes & Troubleshooting

### 10 Common Issues + Fixes

| # | Problem | Cause | Fix |
|---|---------|-------|-----|
| 1 | Image doesn't match prompt | Model's prompt revision overrode your intent | Be more specific; add "exactly as described, no additions" |
| 2 | Unwanted elements appear | Model added via prompt revision | Check `revised_prompt`; explicitly exclude with "NO [element]" |
| 3 | Wrong style/aesthetic | Insufficient style direction | Add specific camera, film stock, and lighting keywords |
| 4 | Text is garbled | Model limitation | Don't rely on in-image text; add in post |
| 5 | Composition is wrong | No explicit composition direction | Specify shot type, framing, composition rule |
| 6 | Colors are off | Generic color descriptions | Use specific hex codes, film stock references, or Pantone names |
| 7 | Face/hands look wrong | Complex anatomy | Simplify pose; specify "anatomically correct, natural proportions" |
| 8 | Background is distracting | No background control | Explicitly describe background OR use "clean background, no distractions" |
| 9 | Aspect ratio feels wrong | Default 1:1 doesn't fit subject | Match aspect ratio to content: portraits → 3:4, landscapes → 16:9 |
| 10 | Edit mode changes too much | Edit prompt too broad | Be surgical: "ONLY change the lighting to golden hour. Keep everything else identical." |

---

## Failure Modes & Edge Cases

### Known Failure Modes

| Failure | Trigger | Workaround |
|---------|---------|------------|
| **Text/Typography** | Any on-screen text request | Generate without text; add in post (Photoshop/Figma) |
| **Consistent characters** | Multiple images of same person | Use Elements/LoRA-based models (Flux 2) for consistency |
| **Exact poses** | Very specific body positions | Use reference-based models or pose-to-image workflows |
| **Counting objects** | "Exactly 7 birds" type requests | Generate and edit; or accept approximate counts |
| **Optical illusions** | Mirrors, reflections, glass | Accept imperfections or composite in post |
| **Famous faces** | Real celebrities/politicians | Model may refuse or distort; use character descriptions instead |
| **Small text details** | Book spines, license plates | Always illegible; add in post |

---

## Comparison with Other Image Models

| Feature | Grok Imagine | Nano Banana Pro | Flux 2 | Midjourney |
|---------|-------------|----------------|--------|------------|
| **Aesthetic Default** | ★★★★★ | ★★★★ | ★★★ | ★★★★★ |
| **Text Rendering** | ★★ | ★★★★★ | ★★★ | ★★ |
| **Photorealism** | ★★★★ | ★★★★★ | ★★★★ | ★★★★ |
| **Character Consistency** | ★ | ★★★★ | ★★★★★ | ★★★ |
| **Image Editing** | ★★★ | ★★★★★ | ★★★ | ★ |
| **Aspect Ratio Options** | ★★★★★ | ★★★ | ★★★ | ★★★★ |
| **Speed** | ★★★★★ | ★★★ | ★★★★ | ★★★ |
| **Cost** | ★★★★★ ($0.02) | ★★★ | ★★★★ | ★★ |
| **API Access** | ★★★★ (fal.ai) | ★★★★ (fal.ai) | ★★★★★ (fal.ai) | ★★ (limited) |

### When to Choose Grok Imagine Over Others

- **Over Nano Banana Pro:** When aesthetic impact matters more than text rendering or precision; for faster/cheaper iteration
- **Over Flux 2:** When you don't need character consistency or LoRA customization; for stronger default aesthetics
- **Over Midjourney:** When you need API access, image editing, or broader aspect ratio support

---

## Integration Workflows

### Pipeline 1: Hero Frame → Cinematic Video

```
1. Generate hero frame with Grok Imagine (aspect_ratio matching target video)
2. Optional: Edit/refine with Grok Imagine edit endpoint
3. Upload to Kling 3.0 I2V / VEO 3.1 / Sora 2 as start frame
4. Prompt motion, camera, and audio in video model
5. Result: Cinematic video starting from your perfect hero frame
```

### Pipeline 2: Concept Art Pipeline

```
1. Generate initial concept with Grok Imagine (broad prompt)
2. Review revised_prompt for the model's interpretation
3. Iterate with refined prompts, generating 4 variations each time
4. Select best candidates
5. Edit mode for refinements (lighting, color, details)
6. Final output: Polished concept art ready for production
```

### Pipeline 3: Character Design → Video

```
1. Generate character portrait with Grok Imagine (3:4 ratio)
2. Generate full-body reference (2:3 ratio)
3. Feed both into Kling 3.0 Elements as frontal + reference
4. Generate video with character consistency via Elements 3.0
```

### Pipeline 4: Social Media Content Factory

```
1. Generate batch: num_images: 4 at target aspect ratio
2. Select best 1-2 candidates
3. Edit for final polish (color grade, atmosphere)
4. Export in appropriate format (jpeg for speed, png for quality)
5. Total cost: $0.08-0.12 per final image (including iterations)
```

---

## Pricing & Optimization

### Cost Structure

| Action | Cost |
|--------|------|
| Generate 1 image | $0.02 |
| Generate 4 images (batch) | $0.08 |
| Edit 1 image | $0.02 |

### Cost Optimization

1. **Batch generate** — `num_images: 4` costs $0.08 for 4 options; cheaper than 4 separate calls
2. **Edit instead of regenerate** — When 80% is right, a $0.02 edit beats multiple $0.02 regenerations
3. **Use specific prompts** — Reduces need for iteration; get closer to target on first try
4. **Choose format wisely** — JPEG for smaller file sizes when PNG quality isn't needed
5. **Match aspect ratio upfront** — Avoid cropping/re-generating due to wrong ratio

---

**Version History:**
- v2.0 (February 19, 2026) — Complete rewrite: full API documentation, 6-variable framework, advanced techniques, image editing, prompt revision system, genre examples, integration workflows
- v1.0 (February 1, 2026) — Initial guide

**Sources:**
- fal.ai Grok Imagine Image API documentation (xai/grok-imagine-image)
- fal.ai Grok Imagine Image Edit API documentation (xai/grok-imagine-image/edit)
- xAI official documentation
- Community testing and best practices
