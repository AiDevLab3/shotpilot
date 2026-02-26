# Recraft V4 Pro: Complete Prompting Mastery Guide

**Model:** Recraft V4 Pro  
**API Model ID (Recraft Direct):** `recraftv4_pro`  
**API Endpoint (fal.ai):** `fal-ai/recraft/v4/pro/text-to-image`  
**Developer:** Recraft AI  
**Release:** February 2026  
**Status:** Design-taste-forward 4MP image generation model

> **Family Note:** Recraft V4 comes in four variants: V4 (1MP standard), V4 Vector (SVG), V4 Pro (4MP high-res), and V4 Pro Vector (high-res SVG). This guide focuses on **V4 Pro** for cinematic/film production use, but the prompting principles apply to all V4 variants.

---

## Executive Summary

Recraft V4 Pro is a design-focused image generation model that prioritizes **visual taste, balanced composition, and cohesive color relationships** over raw photorealism alone. Unlike models that chase maximum realism (Nano Banana Pro, GPT Image), Recraft V4 Pro produces images that feel **intentional and art-directed** — closer to what a skilled designer or cinematographer would compose than what a camera would capture.

**Key Differentiators:**
- **Design Taste as Core Philosophy** — outputs feel deliberate, stylish, and modern rather than generic or stock-like
- **Native 2048×2048 (4MP) Output** — highest native resolution of the V4 family, print-ready
- **10,000 Character Prompt Limit** — 10x longer than V3, enabling extremely detailed creative briefs
- **Exceptional Prompt Understanding** — accurately follows complex visual relationships, reflections, materials, spatial interactions
- **Production-Grade Text Rendering** — clear, legible text for signage, packaging, infographics
- **No Style Presets** — V4 relies entirely on prompt-driven aesthetic control (styles are V2/V3 only)
- **Color Palette Control** — specify preferred colors and background colors via API parameters
- **Exploration Mode** — generate multiple visual directions from a single prompt (Studio app)

**What This Model Is NOT:**
- Not a "thinking" model like Nano Banana Pro — no conversational editing or iterative refinement
- No image-to-image, inpainting, or outpainting support (those are V3-only operations)
- No negative prompt support (V4 does not support `negative_prompt`)
- No style preset system (V4 doesn't use the style/style_id parameters)
- No reference image support
- No seed control for reproducibility

---

## Section 0: The Critical Difference — Design Taste vs. Raw Realism

Before diving into parameters and techniques, understand what makes Recraft V4 Pro fundamentally different from other models:

### The "Design Taste" Philosophy

Most image generation models optimize for one of:
- **Photorealism** (Nano Banana Pro, GPT Image) — "Does this look like a photograph?"
- **Artistic Expression** (Midjourney) — "Does this look like art?"
- **Speed/Cost** (FLUX, Stable Diffusion) — "Can I generate this cheaply and fast?"

Recraft V4 Pro optimizes for **design judgment**:
- "Does this composition feel balanced and intentional?"
- "Do the colors work together as a cohesive palette?"
- "Would a professional designer approve this layout?"

### What This Means in Practice

**Recraft V4 Pro will:**
- Automatically apply sophisticated color harmony to scenes
- Choose compositions that feel editorially considered rather than snapshots
- Handle typography and layout with professional sensibility
- Produce clean geometry and consistent visual depth
- Avoid the "flat" or "synthetic" look common in stock imagery

**Recraft V4 Pro will NOT:**
- Maximize photographic realism at the expense of aesthetic coherence
- Generate images that look like casual photographs
- Apply "chaos" or unexpected creative interpretations (it's controlled, not wild)
- Maintain character consistency across generations (no reference image system)

### The Cinematic Implication

For film production use, this means Recraft V4 Pro excels at:
- **Concept art and mood boards** — art-directed compositions with intentional palettes
- **Production design reference** — interior/exterior designs with cohesive aesthetic
- **Title card and poster design** — text rendering + design sensibility
- **Storyboard frames** — clean, readable compositions
- **Establishing shots** — landscapes and environments with cinematic framing

It is weaker for:
- **Photo-matching** — when you need images that look exactly like camera footage
- **Character consistency** — when the same character must appear across multiple shots
- **Iterative refinement** — when you need to edit specific regions of an existing image

---

## Section 1: API Parameters — Complete Reference

### Recraft Direct API

**Endpoint:** `POST https://external.api.recraft.ai/v1/images/generations`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `prompt` | string (required) | — | Text description of desired image. **Max 10,000 characters** for V4 models. |
| `model` | string | `recraftv4` | Set to `recraftv4_pro` for V4 Pro. |
| `n` | integer | 1 | Number of images to generate (1–6). |
| `size` | string | `1:1` | Aspect ratio or explicit dimensions (see Size Table below). |
| `response_format` | string | `url` | `url` or `b64_json`. |
| `controls` | object | null | Custom generation parameters (partially supported for V4). |

**NOT Supported for V4 Pro:**
- `style` / `style_id` — Styles are V2/V3 only
- `negative_prompt` — Not available for V4 models
- `text_layout` — V3 only feature

### fal.ai API

**Endpoint:** `fal-ai/recraft/v4/pro/text-to-image`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `prompt` | string (required) | — | Text description of desired image. |
| `image_size` | string or object | `square_hd` | Preset name or `{width, height}` object. |
| `colors` | array of RGBColor | [] | Array of preferred colors as `{r, g, b}` objects. |
| `background_color` | RGBColor | null | Preferred background color as `{r, g, b}`. |
| `enable_safety_checker` | boolean | true | Enable/disable safety filtering. |

**fal.ai Image Size Presets:**
- `square_hd` — High-res square (2048×2048)
- `square` — Standard square (1024×1024)
- `portrait_4_3` — Portrait 4:3
- `portrait_16_9` — Portrait 16:9
- `landscape_4_3` — Landscape 4:3
- `landscape_16_9` — Landscape 16:9
- Custom: `{"width": 2688, "height": 1536}` for exact dimensions

---

## Section 2: Resolution and Aspect Ratios — Complete Size Table

### V4 Pro Supported Sizes (Native 4MP)

| Aspect Ratio | Pixel Dimensions | Use Case |
|---|---|---|
| `1:1` | 2048 × 2048 | Square compositions, social media, product shots |
| `2:1` | 3072 × 1536 | Ultra-wide panoramic, dual-screen displays |
| `1:2` | 1536 × 3072 | Tall vertical, full-page editorial |
| `3:2` | 2560 × 1664 | Classic photography ratio, horizontal prints |
| `2:3` | 1664 × 2560 | Portrait prints, vertical editorial |
| `4:3` | 2432 × 1792 | Standard monitor ratio, presentations |
| `3:4` | 1792 × 2432 | Portrait standard, book covers |
| `5:4` | 2304 × 1792 | Large format photography |
| `4:5` | 1792 × 2304 | Instagram portrait, vertical social |
| `6:10` | 1664 × 2688 | Tall portrait, phone wallpapers |
| `14:10` | 2560 × 1792 | Widescreen presentation |
| `10:14` | 1792 × 2560 | Tall editorial |
| **`16:9`** | **2688 × 1536** | **Cinematic widescreen — PRIMARY for film use** |
| `9:16` | 1536 × 2688 | Vertical video, mobile-first content |

### Cinematic Aspect Ratio Strategy

For film production work, these are your primary ratios:

| Film Format | Closest V4 Pro Ratio | Dimensions | Notes |
|---|---|---|---|
| **2.39:1 Anamorphic** | `2:1` (2.0:1) | 3072 × 1536 | Closest to scope; slightly narrower |
| **1.85:1 Flat** | `16:9` (1.78:1) | 2688 × 1536 | Very close to theatrical flat |
| **1.78:1 HD** | `16:9` | 2688 × 1536 | Exact HD match |
| **1.33:1 Academy** | `4:3` | 2432 × 1792 | Classic Academy ratio |
| **2.0:1 Univisium** | `2:1` | 3072 × 1536 | Exact match for Netflix format |

**Pro Tip:** For true 2.39:1 anamorphic, use `2:1` and crop in post. The extra vertical space gives you room to reframe.

---

## Section 3: Prompt Structure — The Recraft Way

### V4's Prompt Interpretation Model

Recraft V4 differs fundamentally from other models in how it reads prompts:

1. **Subject-First Parsing** — The model anchors on the first noun/subject mentioned. Lead with your focal point.
2. **Natural Language Over Tags** — V4 interprets flowing descriptions, not comma-separated keyword lists.
3. **Composition Awareness** — Explicit camera/framing language is understood and followed accurately.
4. **Material Intelligence** — Mentions of materials (glass, steel, fabric, wood) trigger realistic physical rendering.
5. **10K Character Budget** — You can write extremely detailed scene descriptions. Use this.
6. **No Style Shortcuts** — Without style presets, ALL aesthetic direction must come from the prompt text itself.

### The Universal Prompt Template (Recraft Official)

Recraft recommends this structure:

```
[SUBJECT + ACTION], [COMPOSITION], [CONTEXT], [MEDIUM], [STYLE], [VIBE], [ATTRIBUTES: lighting, color, texture, technical details]
```

**Components Breakdown:**

| Component | What It Does | Example |
|---|---|---|
| **Subject** | Who/what — the focal point | "A weathered detective in a rumpled trenchcoat" |
| **Composition** | Camera angle, framing, crop | "Medium shot from slightly below, rule of thirds" |
| **Context** | Environment, setting, atmosphere | "Standing in a rain-soaked alley with fire escapes above" |
| **Medium** | What kind of image this is | "Professional cinematic photograph" |
| **Style** | Artistic tradition/reference | "Film noir aesthetic, 1940s crime drama" |
| **Vibe** | Emotional quality | "Tense, brooding, morally ambiguous" |
| **Attributes** | Technical specifics | "Hard shadows, single overhead street lamp, desaturated blues and ambers, f/2.0 shallow depth" |

### Critical Prompting Rules for V4 Pro

#### Rule 1: Lead With Subject, Always
The model anchors the entire composition around the first subject mentioned. Burying your focal point mid-prompt weakens it.

**❌ Bad:**
```
A dark and moody atmospheric shot with rain and neon lights where a woman stands at a crosswalk
```

**✅ Good:**
```
A woman in a black leather jacket stands at a rain-soaked crosswalk, dark moody atmosphere, neon lights reflecting off wet asphalt
```

#### Rule 2: Style Must Be In The Prompt
V4 has NO style presets. If you want a specific aesthetic, you MUST describe it in text:

**❌ Bad (relying on non-existent style parameter):**
```
prompt: "a mountain landscape"
style: "Photorealism"  // THIS DOESN'T WORK FOR V4
```

**✅ Good (style baked into prompt):**
```
prompt: "Photorealistic landscape photograph of snow-capped mountain range at golden hour, shot on medium format digital camera, National Geographic editorial quality, rich saturated colors, sharp detail throughout"
```

#### Rule 3: Be Explicit About Photorealism vs. Illustration
Without a style parameter, V4 defaults to its own "design-forward" aesthetic. If you want photorealism, you MUST say so:

- **For photorealism:** Include phrases like "photorealistic," "professional photograph," "shot on [camera]," "editorial photography"
- **For illustration:** Include "digital illustration," "hand-drawn," "vector art," "graphic design"
- **For cinematic:** Include "cinematic still," "movie screenshot," "film frame," "shot on ARRI Alexa"

#### Rule 4: Leverage the 10K Character Limit
V4 Pro supports 10x the prompt length of V3. Use it for:
- Detailed material descriptions
- Multiple lighting sources with specific qualities
- Complex spatial relationships between elements
- Layered atmospheric effects
- Specific color palette descriptions

#### Rule 5: Use Color Parameters for Palette Control
Instead of (or in addition to) describing colors in the prompt, use the API `colors` parameter:

```python
# fal.ai example
result = await fal.subscribe("fal-ai/recraft/v4/pro/text-to-image", {
    "input": {
        "prompt": "A moody cyberpunk street scene at night, neon signs reflecting on wet pavement",
        "colors": [
            {"r": 0, "g": 200, "b": 255},   # Cyan neon
            {"r": 255, "g": 0, "b": 128},     # Magenta accent
            {"r": 20, "g": 20, "b": 40}       # Deep navy shadows
        ],
        "image_size": "landscape_16_9"
    }
})
```

This gives you fine-grained palette control beyond what prompt text alone can achieve.

---

## Section 4: Cinematic Prompting Examples

### Example 1: Film Noir Detective Scene

**Scenario:** Opening shot of a crime thriller, establishing mood and protagonist.

```
A weathered detective in a rumpled brown trenchcoat and loosened tie stands beneath a single 
overhead street lamp on a rain-soaked urban street, medium shot from slightly below eye level, 
the detective's face half-illuminated by the harsh amber lamplight creating dramatic chiaroscuro 
shadows, rain falling in visible streaks through the cone of light, wet cobblestones reflecting 
the lamp in elongated golden streaks, background dissolving into darkness with distant blurred 
red taillights, professional cinematic photograph, classic film noir aesthetic reminiscent of 
Gordon Willis cinematography, brooding and morally ambiguous atmosphere, desaturated color 
palette dominated by deep blacks, warm ambers, and cold steel blues, shot on ARRI Alexa with 
vintage Cooke S4 lenses at T2.0, shallow depth of field with the detective sharp against a 
soft rain-bokeh background, film grain texture, 2.39:1 anamorphic framing
```

**API Configuration:**
- Size: `2:1` (3072×1536) for scope framing
- Colors: `[{r:180, g:140, b:60}, {r:40, g:60, b:90}, {r:15, g:15, b:15}]`

---

### Example 2: Sci-Fi Establishing Shot

**Scenario:** Wide establishing shot of a dystopian megacity for a cyberpunk feature.

```
Massive aerial establishing shot of a dystopian megacity stretching to the horizon at twilight, 
towering brutalist skyscrapers with holographic advertisements cascading down their facades, 
elevated monorail tracks weaving between buildings with glowing transit pods, ground level 
obscured by dense smog and steam vents creating layered atmospheric depth, extreme wide shot 
captured from a high vantage point looking slightly downward, the city grid visible as patterns 
of light in the haze, a massive corporate headquarters tower dominating the center frame backlit 
by the last amber glow of sunset behind chemical clouds, professional cinematic still from a 
big-budget science fiction film, Blade Runner meets Akira visual language, oppressive yet 
awe-inspiring scale, rich color palette of toxic oranges, deep teals, electric purples, and 
harsh white artificial light, volumetric god rays cutting through industrial haze, shot on 
large format digital with extreme depth of field, every building sharp from foreground to 
infinity, production design quality suitable for ILM concept art
```

**API Configuration:**
- Size: `16:9` (2688×1536) or `2:1` (3072×1536)
- Colors: `[{r:255, g:120, b:30}, {r:0, g:140, b:160}, {r:160, g:50, b:200}]`

---

### Example 3: Intimate Character Study

**Scenario:** Close-up emotional beat from a drama, capturing internal conflict.

```
Extreme close-up of a young woman's face in a dimly lit kitchen, tears welling in her eyes 
but expression composed and controlled, the warm amber light of a single overhead pendant lamp 
casting soft downward shadows under her eyes and chin, her hand barely visible at the bottom 
of frame gripping a coffee mug, background completely dissolved into warm out-of-focus bokeh 
of kitchen elements — indistinct shapes of wooden shelves and copper pots, photorealistic 
cinematic still from an A24 independent drama, intimate and emotionally raw, naturalistic 
lighting with no fill creating deep eye sockets and emphasizing the glossiness of unshed tears, 
skin rendered with pores and imperfections visible, muted earth tone palette with warm amber 
highlights against cool shadow tones, shot on vintage Panavision C-series anamorphic at T1.4 
wide open, the extreme shallow depth of field rendering only one eye in critical focus, slight 
lens breathing and organic bokeh characteristics, 35mm film texture with restrained grain
```

**API Configuration:**
- Size: `16:9` (2688×1536)
- Colors: `[{r:200, g:150, b:80}, {r:60, g:50, b:40}, {r:180, g:160, b:140}]`

---

### Example 4: Action Sequence Freeze Frame

**Scenario:** High-energy action beat frozen in time, suitable for storyboard or concept art.

```
Dynamic low-angle shot of a parkour runner mid-leap between two industrial rooftops at dusk, 
body fully extended in a horizontal dive with arms reaching forward and legs trailing behind, 
captured at the apex of the jump with the gap visible below — a narrow urban alley with 
dumpsters and fire escapes eight stories down, the runner wearing a dark hoodie and tactical 
pants with fabric rippling from wind resistance, the leading rooftop edge approaching in the 
foreground slightly out of focus, background cityscape of water towers and ventilation units 
silhouetted against a gradient sky from deep orange at horizon to dark blue overhead, 
professional cinematic action photography frozen at 1/2000s, high-octane energy with palpable 
danger, intense vertigo-inducing perspective emphasizing height, warm-to-cool color transition 
from sunset horizon to shadowed buildings, strong rim lighting from the setting sun creating 
a bright edge along the runner's silhouette, shot on RED V-RAPTOR at 8K with Angenieux 
Optimo zoom at 24mm, slight barrel distortion from wide angle enhancing dynamism
```

**API Configuration:**
- Size: `16:9` (2688×1536)
- Colors: `[{r:255, g:140, b:40}, {r:20, g:30, b:60}, {r:200, g:80, b:30}]`

---

### Example 5: Period Drama Interior

**Scenario:** Art department reference for a historical drama set piece.

```
Wide interior shot of an opulent 1920s Art Deco ballroom during a grand party, crystal 
chandeliers hanging at three depths creating layered sparkle, the room filled with elegantly 
dressed guests in beaded flapper dresses and tuxedos captured as gentle motion blurs suggesting 
movement and music, polished black marble floor reflecting the overhead lights like a dark 
mirror, tall arched windows along the far wall showing a nighttime cityscape of early Manhattan, 
gold leaf columns framing the dance floor, a jazz band visible on an elevated stage at the 
far end, streamers and champagne bubbles catching the light, shot from a slightly elevated 
dolly position at one end of the room looking down the length, symmetrical one-point perspective 
drawing the eye to the band, professional cinematic still in the style of a Baz Luhrmann 
production, The Great Gatsby meets Boardwalk Empire, intoxicating glamour with an undercurrent 
of excess, rich warm palette of golds, deep burgundies, black, and champagne, practical 
lighting from the chandeliers supplemented by warm fill, shot on Panavision Millennium DXL2 
with anamorphic Primo 70 lenses, deep depth of field at T5.6 keeping foreground guests and 
background band both readable, subtle lens flares from the crystal chandeliers
```

**API Configuration:**
- Size: `16:9` (2688×1536)
- Colors: `[{r:218, g:165, b:32}, {r:128, g:0, b:32}, {r:20, g:15, b:15}]`

---

### Example 6: Atmospheric Horror

**Scenario:** Key art concept for a supernatural horror film.

```
A lone figure in a white nightgown stands at the end of a long dark hospital corridor, 
seen from behind in a deep one-point perspective composition, the corridor walls covered in 
cracked institutional green tiles with overhead fluorescent lights flickering — some dead, 
creating alternating pools of sickly green light and absolute darkness, the figure's bare 
feet visible on the cold linoleum floor with long black hair hanging past her shoulders, 
at the far vanishing point of the corridor a door stands slightly ajar with an unnatural 
warm golden light seeping through the crack, wheelchair abandoned mid-hallway creating an 
off-center obstacle in the otherwise symmetrical frame, water damage stains on the ceiling 
tiles, peeling paint, institutional decay, cinematic horror still from a prestige supernatural 
thriller, suffocating dread and creeping wrongness, Stanley Kubrick's The Shining meets 
Ari Aster's Hereditary, cold desaturated palette with sickly green-yellow fluorescent tones 
contrasting against the warm impossible light from the door, practical fluorescent lighting 
with no fill — deep impenetrable shadows in the dead zones between lights, shot on Alexa 65 
with Hasselblad Prime DNA lenses at T2.8, sharp throughout with no depth of field falloff 
to maintain the oppressive clarity, subtle wide-angle distortion stretching the corridor's 
apparent length
```

**API Configuration:**
- Size: `2:1` (3072×1536) for maximum corridor depth
- Colors: `[{r:80, g:120, b:60}, {r:200, g:170, b:50}, {r:10, g:10, b:10}]`

---

### Example 7: Documentary-Style Landscape

**Scenario:** Natural history documentary establishing shot.

```
Sweeping aerial photograph of the Namibian Skeleton Coast at sunrise, where the orange-red 
sand dunes of the Namib Desert meet the cold dark Atlantic Ocean in sharp geometric contrast, 
captured from 500 meters altitude looking along the coastline at an oblique angle, the 
serpentine line where sand meets surf creating an S-curve leading the eye into the distance, 
fog bank rolling in from the ocean partially obscuring the dune crests, the rusted hull of a 
shipwreck visible at the waterline casting a long shadow across the wet sand, photorealistic 
aerial photograph suitable for a BBC Earth or National Geographic documentary, vast and humbling 
natural beauty with an undertone of desolation, warm desert tones of burnt sienna and ochre 
clashing against cold steel-blue ocean and white fog, early morning golden light raking across 
the dune ridges creating deep orange highlights and purple-blue shadows in the valleys, shot 
from a stabilized helicopter mount with Phase One IQ4 150MP medium format digital back and 
Schneider 80mm lens at f/8, extreme clarity and detail from corner to corner, no digital 
manipulation aesthetic — raw honest documentary photography
```

**API Configuration:**
- Size: `16:9` (2688×1536)
- Colors: `[{r:200, g:100, b:30}, {r:50, g:80, b:120}, {r:255, g:200, b:140}]`

---

## Section 5: Strengths — Where Recraft V4 Pro Excels

### 1. Design-Forward Composition
V4 Pro consistently produces images with **professional compositional judgment**. It naturally applies:
- Rule of thirds (when appropriate)
- Leading lines
- Color blocking
- Balanced negative space
- Intentional focal hierarchy

This makes it exceptional for **concept art, mood boards, and production design reference** where aesthetic coherence matters more than documentary realism.

### 2. Color Harmony
Perhaps V4 Pro's strongest quality. The model produces images with **cohesive color relationships** that feel professionally graded:
- Complementary color palettes emerge naturally
- Shadows and highlights maintain color harmony
- The `colors` API parameter provides fine control without fighting the model

### 3. Text Rendering
V4 Pro produces **clear, legible text** for:
- Signage and storefront lettering
- Packaging and label design
- Menu and infographic layouts
- Title cards and poster text
- Short-to-medium phrases with high fidelity

This is a major advantage for production design reference (shop signs, street names, props).

### 4. Clean Geometry and Architecture
Architectural elements, vehicles, product designs, and geometric patterns render with **clean lines and consistent perspective**. The model avoids the warping and distortion common in other models.

### 5. Material and Texture Intelligence
Mentions of specific materials trigger physically plausible rendering:
- Glass reflections and refractions
- Metal specularity and patina
- Fabric draping and wrinkles
- Wood grain and weathering
- Wet surfaces and water interaction

### 6. Massive Prompt Length (10K Characters)
V4's 10,000-character prompt limit is transformative for complex scenes. You can describe:
- Multiple light sources with individual qualities
- Complex spatial relationships between many elements
- Layered atmospheric effects
- Detailed costume and production design
- Specific camera/lens technical characteristics

### 7. High Native Resolution
At 2048×2048 (and up to 3072×1536 at 2:1), V4 Pro outputs are **print-ready without upscaling** for many production uses:
- Storyboard frames at sufficient detail
- Concept art boards
- Pitch deck visuals
- Set reference imagery

### 8. Color Palette API Control
The `colors` and `background_color` parameters provide programmatic control over the color direction:
```python
colors: [
    {"r": 255, "g": 200, "b": 100},  # Warm gold
    {"r": 50, "g": 70, "b": 120},    # Cool steel blue
]
```
This is unique among image generators and incredibly useful for maintaining visual continuity across a series of concept images.

---

## Section 6: Limitations and Failure Modes

### 1. No Iterative Editing
**This is the biggest limitation for production workflows.** V4 Pro is text-to-image only:
- No inpainting (can't fix specific regions)
- No image-to-image (can't use reference images as starting points)
- No conversational editing (can't say "change the lighting to warmer")
- Every generation is from scratch

**Workaround:** Use V3 for inpainting/editing workflows, or use external tools (Photoshop generative fill, etc.) for iterative refinement of V4 Pro outputs.

### 2. No Reference Image Support
Cannot upload reference images for:
- Character consistency
- Style matching
- Composition reference
- Color grading reference

**Impact:** Every generation of a character will produce a different person. Maintaining visual continuity across a storyboard sequence is extremely difficult.

### 3. No Negative Prompts
V4 does not support `negative_prompt`. You cannot explicitly exclude elements:
- Can't say "no text" or "no watermark"
- Can't say "avoid blurry" or "not cartoonish"
- Must rely entirely on positive description to guide output

**Workaround:** Be extremely specific about what you DO want. Instead of "no cartoon look," specify "photorealistic editorial photograph with natural skin textures and realistic lighting."

### 4. No Style Presets
While V2/V3 offer 50+ curated styles (Photorealism, Film Noir, Illustration, etc.), V4 has none. ALL aesthetic direction must come from the prompt.

**Impact:** More work per prompt, but also more control. You must explicitly describe the aesthetic every time.

### 5. No Seed Control
No way to set a random seed for reproducible outputs. Every generation is unique. Combined with no reference images, this makes consistency very challenging.

### 6. Slower Generation (~30 seconds)
V4 Pro takes ~30 seconds per image (vs. ~10s for standard V4). For high-volume storyboard generation, this adds up.

### 7. Higher Cost ($0.25/image)
V4 Pro is 6.25x more expensive than standard V4 ($0.04) and V3 ($0.04). For large batches:
- 100 images = $25.00
- 1,000 images = $250.00

Via fal.ai, pricing may differ.

### 8. "Design Taste" Can Override Intent
The model's strong design opinions can sometimes override your specific intent:
- It may "improve" a deliberately ugly or chaotic scene
- Gritty, messy, or imperfect aesthetics may get cleaned up
- The model resists producing truly ugly or visually unpleasant images

**Workaround:** Explicitly describe imperfection: "deliberately rough, unpolished, raw documentary quality, handheld camera shake, blown-out highlights, crushed blacks."

### 9. Anatomy in Complex Poses
While V4 Pro improved on V3, complex multi-figure poses and hand/finger detail can still fail. The model is better than average but not flawless.

### 10. No Artistic Level Control
V4 does not support the "artistic level" control available in V3, which allowed trading creative variance for prompt adherence.

---

## Section 7: Style and Aesthetic Control (Via Prompt)

Since V4 has no style presets, ALL aesthetic control comes from your prompt text. Here's a comprehensive style vocabulary that V4 Pro responds to well:

### Photographic Styles
```
"photorealistic photograph"
"editorial fashion photography"
"documentary photography"
"street photography"
"architectural photography"
"product photography on white background"
"cinematic film still"
"shot on [camera model]" — e.g., "shot on ARRI Alexa Mini"
"vintage film photography with [film stock]" — e.g., "Kodak Portra 400"
"large format photography"
"medium format photography"
"35mm film aesthetic"
```

### Illustration Styles
```
"digital illustration"
"concept art"
"matte painting"
"hand-drawn illustration"
"watercolor painting"
"oil painting"
"graphic novel panel"
"storyboard sketch"
"technical illustration"
"architectural rendering"
```

### Cinematic References That Work Well
```
"in the style of Roger Deakins cinematography"
"Gordon Willis lighting"
"Emmanuel Lubezki natural light"
"Wes Anderson symmetrical composition"
"Denis Villeneuve atmospheric sci-fi"
"Terrence Malick magic hour"
"Christopher Nolan IMAX scale"
"Baz Luhrmann opulent excess"
"Ari Aster slow horror"
"David Fincher clinical precision"
```

### Camera/Lens Language
V4 Pro responds to technical camera language:
```
"shot on ARRI Alexa 65"
"Panavision anamorphic lens"
"Cooke S4/i prime at T2.0"
"50mm f/1.4 shallow depth of field"
"24mm wide angle with slight barrel distortion"
"telephoto compression at 200mm"
"macro close-up with 1:1 magnification"
"tilt-shift miniature effect"
```

### Lighting Language
```
"golden hour backlighting"
"blue hour ambient"
"harsh midday overhead sun"
"overcast soft diffuse light"
"single-source dramatic side lighting"
"chiaroscuro lighting"
"Rembrandt lighting pattern"
"practical lighting only"
"neon light with color spill"
"volumetric fog with god rays"
"rim light separating subject from background"
```

### Vibe/Mood Descriptors
```
"serene and contemplative"
"tense and claustrophobic"
"melancholic nostalgia"
"joyful and warm"
"oppressive dread"
"whimsical wonder"
"stark brutalist"
"cozy and intimate"
"epic and awe-inspiring"
"clinical and cold"
```

---

## Section 8: Best Practices for Cinematic/Film Use

### 1. Frame Prompt as a Director's Brief
Think of your prompt as instructions to a cinematographer, not a search query:

**❌ Search Query Style:**
```
dark forest, night, scary, cinematic, 4k, professional
```

**✅ Director's Brief Style:**
```
Wide establishing shot of a dense old-growth forest at night, captured from ground level 
looking up through the canopy where fractured moonlight creates silver geometric patterns on 
the forest floor, mist rising from the undergrowth creating depth layers — near trees sharp 
and dark, middle-distance trees ghostly in the fog, background completely obscured, a single 
narrow dirt path visible leading into the depths, cinematic still from a prestige horror film, 
oppressive silence and ancient presence, desaturated blue-green moonlight palette with deep 
black shadows, shot on Alexa 65 at high ISO with visible but controlled grain, 21mm wide 
angle lens at T2.8 creating vast depth while maintaining sharpness
```

### 2. Specify Film Format Context
Adding production context helps V4 Pro make better aesthetic decisions:

```
"cinematic still from a $200M historical epic"
"indie A24 drama frame"  
"BBC documentary screenshot"
"Netflix original series production still"
"Sundance indie film aesthetic"
"IMAX large format presentation"
```

### 3. Describe Color Grade in Film Terms
V4 Pro responds well to color grading language:

```
"teal and orange color grade"
"bleach bypass desaturated look"
"warm golden grade like The Godfather"
"cold clinical grade like Zodiac"
"crushed blacks with milky highlights"
"high-contrast contrasty grade with deep shadows"
"pastel muted grade like Moonlight"
```

### 4. Use Camera Movement as Context (Even for Stills)
Describing the implied camera movement helps V4 Pro choose the right composition and motion blur:

```
"frozen frame from a steady dolly move"
"handheld documentary feel with slight tilt"  
"locked-off tripod composition, perfectly level"
"Steadicam following shot"
"crane shot descending into the scene"
"crash zoom frozen at moment of impact"
```

### 5. Batch Generation Strategy
Since V4 Pro lacks seed control, use this strategy for visual continuity:
1. **Write a "series brief"** with consistent color palette, camera language, and lighting descriptions
2. **Use the `colors` API parameter** with the same RGB values across all generations
3. **Keep camera and lens descriptions identical** across the batch
4. **Accept variation** in character appearance — focus continuity on environment, palette, and mood
5. **Generate 4-6 variations** (using `n` parameter) and curate the best

### 6. Storyboard Workflow
For storyboard sequences:
1. Use `16:9` ratio consistently
2. Describe shot type explicitly: "wide shot," "medium close-up," "over-the-shoulder"
3. Maintain consistent lighting direction: "key light from camera right"
4. Use the same color palette API values for the entire sequence
5. Accept that character faces will vary — focus on pose, framing, and mood

---

## Section 9: Comparison with Other Models

### Recraft V4 Pro vs. Nano Banana Pro (Gemini 3)

| Feature | Recraft V4 Pro | Nano Banana Pro |
|---|---|---|
| **Aesthetic** | Design-forward, art-directed | Photorealistic, functional |
| **Resolution** | Native 2048×2048 (4MP) | Native up to 4K |
| **Prompt Length** | 10,000 characters | ~2,000 characters |
| **Reference Images** | ❌ None | ✅ Up to 14 |
| **Iterative Editing** | ❌ No | ✅ Conversational editing |
| **Text Rendering** | Excellent | State-of-the-art |
| **Color Control** | ✅ RGB palette API | ❌ Prompt only |
| **Negative Prompt** | ❌ No | ❌ No |
| **Character Consistency** | ❌ No | ✅ Via reference images |
| **Cost per Image** | $0.25 | ~$0.05-0.10 |
| **Speed** | ~30 seconds | ~15-20 seconds |
| **Best For** | Concept art, mood boards, design | Photo-matching, character work |

**When to use Recraft V4 Pro:** Early pre-production concept exploration, mood boards, production design reference, title design, poster concepts.

**When to use Nano Banana Pro:** Character-specific storyboards, photo-matching, iterative refinement, text-heavy designs, 4K final assets.

### Recraft V4 Pro vs. Midjourney

| Feature | Recraft V4 Pro | Midjourney |
|---|---|---|
| **Aesthetic** | Clean, design-forward | Artistic, painterly |
| **API Access** | ✅ Full REST API | Limited (Discord/Web) |
| **Color Control** | ✅ RGB API | ❌ Prompt only |
| **Prompt Adherence** | Very high | Moderate (more creative interpretation) |
| **Text Rendering** | Excellent | Poor |
| **Resolution** | 2048×2048 | 1024×1024 (upscalable) |
| **Best For** | Production reference, design | Inspiration, art direction exploration |

### Recraft V4 Pro vs. GPT Image

| Feature | Recraft V4 Pro | GPT Image |
|---|---|---|
| **Aesthetic** | Design-forward | Versatile, instruction-following |
| **Color Control** | ✅ RGB API | ❌ Prompt only |
| **Text Rendering** | Excellent | Excellent |
| **Iterative Editing** | ❌ No | ✅ Via conversation |
| **Prompt Length** | 10,000 chars | ~4,000 chars |
| **Cost** | $0.25/image | $0.04-0.08/image |
| **Best For** | Design-quality concept art | General purpose, rapid iteration |

### Where Recraft V4 Pro Fits in the Production Pipeline

```
PRE-PRODUCTION PIPELINE:

[Script] → [Mood Board / Look Development]  ← RECRAFT V4 PRO (design taste, palette control)
                    ↓
         [Concept Art]                        ← RECRAFT V4 PRO (compositions, environments)
                    ↓
         [Storyboards]                        ← NANO BANANA PRO (character consistency)
                    ↓
         [Shot Lists / Visual References]     ← RECRAFT V4 PRO (camera/lighting concepts)
                    ↓
         [Production Design Packages]         ← RECRAFT V4 PRO (set design, props, signage)
```

---

## Section 10: Cost Analysis

### Direct Recraft API Pricing

| Model | Cost per Image | Speed |
|---|---|---|
| Recraft V4 Pro | **$0.25** | ~30 seconds |
| Recraft V4 | $0.04 | ~10 seconds |
| Recraft V4 Pro Vector | $0.30 | ~45 seconds |
| Recraft V4 Vector | $0.08 | ~15 seconds |
| Recraft V3 | $0.04 | ~10 seconds |

### Budget Planning for Production

| Use Case | Est. Images | V4 Pro Cost | V4 Standard Cost |
|---|---|---|---|
| Mood board (1 film) | 50-100 | $12.50-$25.00 | $2.00-$4.00 |
| Concept art package | 200-500 | $50-$125 | $8-$20 |
| Full storyboard (feature) | 500-2000 | $125-$500 | $20-$80 |
| Look dev exploration | 100-300 | $25-$75 | $4-$12 |

**Cost Optimization Strategy:**
1. **Explore with V4 Standard** ($0.04) to find the right prompt/direction
2. **Finalize with V4 Pro** ($0.25) for presentation-quality outputs
3. Use `n: 4` to generate 4 variations per call for maximum selection
4. Curate aggressively — better to generate 6 and pick 1 than iterate endlessly

### fal.ai Pricing
fal.ai charges based on compute time. Check current rates at fal.ai/pricing. Typically comparable to or slightly above direct Recraft API pricing.

---

## Section 11: Advanced Techniques

### Technique 1: Color Palette Locking for Series

When generating a series of related images (e.g., all concept frames for a single scene), lock the color palette:

```python
SCENE_PALETTE = [
    {"r": 180, "g": 140, "b": 60},   # Warm amber key
    {"r": 40, "g": 60, "b": 90},      # Cool steel fill
    {"r": 15, "g": 15, "b": 15},      # Deep shadow
    {"r": 200, "g": 180, "b": 150},   # Warm highlight
]

# Use identical palette for every shot in the scene
for shot_prompt in scene_shots:
    result = generate(prompt=shot_prompt, colors=SCENE_PALETTE, size="16:9")
```

### Technique 2: Progressive Detail Layering

Leverage the 10K character limit with a layered approach:

```
Layer 1 - Subject: [Who/what, specific details]
Layer 2 - Action/Pose: [What they're doing, body language]
Layer 3 - Foreground: [Elements between camera and subject]
Layer 4 - Midground: [Subject's immediate surroundings]
Layer 5 - Background: [Distant elements, sky, horizon]
Layer 6 - Atmosphere: [Weather, particles, volumetrics]
Layer 7 - Lighting: [Key, fill, rim, practicals, quality]
Layer 8 - Color: [Palette, grade, temperature]
Layer 9 - Camera: [Lens, angle, depth of field, format]
Layer 10 - Mood: [Emotional quality, reference films]
```

### Technique 3: Exploration Mode (Studio App Only)

In the Recraft Studio web app, Exploration Mode generates multiple visual interpretations from a single prompt. Use this for:
- Finding unexpected compositional approaches
- Comparing different interpretation angles
- Rapid ideation without prompt revision

Note: This is a Studio-only feature, not available via API.

### Technique 4: Cross-Model Workflow

Best results often come from combining models:
1. **V4 Pro** for initial concept and palette (highest design quality)
2. **V3** for inpainting refinements (add/modify specific regions)
3. **Creative Upscale** ($0.25) for final 4K+ delivery

### Technique 5: Typography Integration

For images with text (title cards, signage, props):
- Place text description early in the prompt
- Be explicit about font style: "bold sans-serif," "elegant serif," "hand-painted script"
- Specify text placement: "centered in the upper third," "along the bottom edge"
- Keep text short — V4 handles short-to-medium phrases best
- For long text, consider generating the image without text and compositing in post

---

## Section 12: Common Mistakes and How to Avoid Them

### Mistake 1: Using V3 Prompt Style
V3 prompts relied on style presets and negative prompts. V4 ignores both.

**❌ V3 Style:**
```python
response = client.images.generate(
    prompt="a sunset over the ocean",
    model="recraftv4_pro",
    style="Photorealism",           # IGNORED
    negative_prompt="blurry, ugly"  # IGNORED
)
```

**✅ V4 Style:**
```python
response = client.images.generate(
    prompt="Photorealistic landscape photograph of a golden sunset over a calm Pacific Ocean, warm amber light reflecting on gentle waves, dramatic cloud formations painted in coral and violet, shot on medium format Hasselblad X2D with 65mm lens at f/8, National Geographic editorial quality",
    model="recraftv4_pro",
    size="16:9"
)
```

### Mistake 2: Generic Short Prompts
V4 Pro's design taste will fill in gaps with its own judgment. Short prompts give you the model's default — which may not match your intent.

**❌ Too Short:**
```
A car in a city at night
```

**✅ Directed:**
```
A matte black 1968 Ford Mustang Fastback parked under a single sodium-vapor street lamp on a deserted San Francisco street at 3AM, the car's chrome trim catching warm amber light, dense fog rolling in from the bay creating a soft glow around the lamp, the steep street visible behind leading down toward distant fog-obscured lights, photorealistic cinematic still, Steve McQueen Bullitt atmosphere, lonely and cinematic tension
```

### Mistake 3: Fighting the Design Taste
If you want something deliberately ugly, messy, or chaotic, you must override V4 Pro's instinct to "make it look good":

**❌ Will Get Cleaned Up:**
```
A messy room
```

**✅ Explicitly Ugly:**
```
Harshly lit cluttered hoarder apartment photographed with direct flash camera, unflattering overhead fluorescent light mixing with flash creating flat shadowless illumination, stacks of newspapers and takeout containers covering every surface, no sense of composition or artistic arrangement, raw documentary photograph by a social worker, deliberately unartistic and clinical, disturbing mundane reality
```

### Mistake 4: Expecting Character Consistency
V4 Pro will generate a different face every time. Plan accordingly:
- Focus on silhouette, costume, and posture for character recognition
- Accept face variation in concept art phase
- Use other tools (Nano Banana Pro with reference images) for character-specific work

### Mistake 5: Ignoring the Color API
Many users describe colors only in the prompt. The `colors` parameter is more reliable:

```python
# Don't just say "teal and orange" in the prompt
# ALSO set it in the API:
colors=[
    {"r": 0, "g": 128, "b": 128},   # Teal
    {"r": 255, "g": 165, "b": 0},   # Orange
]
```

---

## Appendix A: Quick Reference Card

```
MODEL:           Recraft V4 Pro
API ID:          recraftv4_pro (direct) | fal-ai/recraft/v4/pro/text-to-image (fal.ai)
RESOLUTION:      Native 2048×2048, up to 3072×1536
COST:            $0.25 per image (direct API)
SPEED:           ~30 seconds
PROMPT LIMIT:    10,000 characters
BATCH SIZE:      1-6 images per request

SUPPORTS:        Text-to-image, color palette control, text rendering
DOES NOT SUPPORT: Styles, negative prompts, reference images, inpainting, 
                   image-to-image, seeds, artistic level control, text layout

CINEMATIC RATIOS:
  Scope (2.39:1)  → use 2:1 (3072×1536)
  Flat (1.85:1)   → use 16:9 (2688×1536)  
  HD (1.78:1)     → use 16:9 (2688×1536)
  Academy (1.33:1) → use 4:3 (2432×1792)

PROMPT TEMPLATE:
  [SUBJECT], [COMPOSITION], [CONTEXT], [MEDIUM], [STYLE], [VIBE], [ATTRIBUTES]
```

## Appendix B: Prompt Template for Cinematic Frames

```
[Character/subject with specific visual details], [shot type and camera angle], 
[setting/environment with atmospheric details], [foreground and background elements], 
professional cinematic still from [genre/reference], [emotional quality], 
[color palette description], [lighting setup], shot on [camera] with [lens] at [aperture], 
[depth of field and focus description], [film format/texture]
```

---

*Last Updated: 2026-02-19*
*Source: Recraft Official Documentation, fal.ai API Reference, Recraft Prompt Engineering Guide*
*Guide Version: 1.0*
