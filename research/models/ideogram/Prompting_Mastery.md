# Ideogram V3: Complete Prompting Mastery Guide

**Model:** Ideogram V3  
**API Model ID:** `fal-ai/ideogram/v3`  
**Developer:** Ideogram AI  
**Release:** 2025  
**Status:** Industry-leading typography and design-focused image generation model

> **The Typography King:** Ideogram built its reputation on one thing no other model could do well — render text in images accurately. V3 extends this into a full-featured generation model with exceptional design capabilities, style presets, color palettes, and style codes.

---

## Executive Summary

Ideogram V3 is the premier image generation model for projects requiring **accurate text rendering, graphic design, poster/logo creation, and stylized visual output**. While other models treat text as an afterthought, Ideogram makes it a first-class feature. V3 adds 60+ style presets, style code transfer, color palette control, multiple rendering speeds, and style reference images — making it the most design-aware generation model available.

**Key Differentiators:**
- Best-in-class text/typography rendering in generated images
- 60+ curated style presets (Art Deco, Bauhaus, Pop Art, Editorial, etc.)
- Style codes — 8-character hex codes for transferable, shareable styles
- Color palette control (presets or custom hex colors with weights)
- Three rendering speeds: TURBO ($0.03), BALANCED ($0.06), QUALITY ($0.09)
- Style reference images for visual style transfer
- MagicPrompt (prompt expansion) with intelligent design understanding
- Four style modes: AUTO, GENERAL, REALISTIC, DESIGN

---

## Section 0: The Golden Rules of Prompting

Ideogram V3 thinks like a designer, not a photographer. Work with that.

### Rule 1: Put Text in Quotation Marks

This is the most important rule. Ideogram renders quoted text with high accuracy.

**❌ Bad:**
```
A poster that says welcome to the future
```

**✅ Good:**
```
A sleek futuristic poster with bold typography reading "WELCOME TO THE FUTURE" in metallic chrome letters
```

### Rule 2: Specify the Design Medium

Ideogram excels when it knows what it's making. Name the deliverable.

```
A movie poster for...
A book cover for...
A logo design for...
A magazine cover featuring...
A product label for...
A neon sign that reads...
A storefront with a sign saying...
```

### Rule 3: Use Style Presets for Consistency

Don't describe a style in words when a preset does it better. The 60+ presets encode complex aesthetic combinations that would take paragraphs to describe.

### Rule 4: Leverage Design Vocabulary

Ideogram understands graphic design terminology:
- Typography: "sans-serif", "serif", "hand-lettered", "bold condensed", "italic script"
- Layout: "centered composition", "rule of thirds", "negative space", "asymmetric balance"
- Color: "complementary colors", "monochromatic", "triadic color scheme", "warm palette"
- Effects: "drop shadow", "embossed", "gold foil", "letterpress", "knockout type"

### Rule 5: Choose the Right Rendering Speed

- **TURBO** ($0.03): Quick concepts, social media, rapid iteration
- **BALANCED** ($0.06): Production work, most use cases
- **QUALITY** ($0.09): Final deliverables, print-ready, maximum detail

---

## Section 1: Complete API Reference

### Text-to-Image Endpoint

**Endpoint:** `https://fal.run/fal-ai/ideogram/v3`  
**Method:** POST  
**Authentication:** `Authorization: Key $FAL_KEY`

#### Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | string | ✅ | — | Image description with text in quotes |
| `negative_prompt` | string | ❌ | `""` | Content to avoid |
| `image_size` | ImageSize \| Enum | ❌ | `"square_hd"` | Output resolution |
| `rendering_speed` | enum | ❌ | `"BALANCED"` | `TURBO`, `BALANCED`, `QUALITY` |
| `style` | enum | ❌ | — | `AUTO`, `GENERAL`, `REALISTIC`, `DESIGN` |
| `style_preset` | enum | ❌ | — | 60+ named presets |
| `style_codes` | list\<string\> | ❌ | — | 8-char hex style codes |
| `image_urls` | list\<string\> | ❌ | — | Style reference images (max 10MB total) |
| `color_palette` | ColorPalette | ❌ | — | Color control (preset name or hex members) |
| `expand_prompt` | boolean | ❌ | `true` | MagicPrompt enhancement |
| `num_images` | integer | ❌ | `1` | Batch size (1–8) |
| `seed` | integer | ❌ | random | Reproducibility |
| `sync_mode` | boolean | ❌ | `false` | Data URI return |

#### Style Modes

| Mode | Description | Best For |
|------|-------------|----------|
| `AUTO` | Model decides based on prompt | General use |
| `GENERAL` | Balanced between styles | Versatile output |
| `REALISTIC` | Photographic realism | Photos, product shots |
| `DESIGN` | Graphic design / illustration | Posters, logos, art |

#### Style Presets (Complete List)

**Retro & Vintage:**
`80S_ILLUSTRATION`, `90S_NOSTALGIA`, `ANALOG_NOSTALGIA`, `EXPIRED_FILM`, `HIPPIE_ERA`, `OLD_CARTOONS`, `RETRO_ETCHING`, `SPOTLIGHT_80S`, `VINTAGE_GEO`, `VINTAGE_POSTER`

**Fine Art:**
`ART_BRUT`, `ART_DECO`, `ART_POSTER`, `AVANT_GARDE`, `BAUHAUS`, `CUBISM`, `OIL_PAINTING`, `WATERCOLOR`, `WOODBLOCK_PRINT`

**Modern Design:**
`ABSTRACT_ORGANIC`, `BRIGHT_ART`, `FLAT_ART`, `FLAT_VECTOR`, `GEO_MINIMALIST`, `ICONIC`, `JAPANDI_FUSION`, `MINIMAL_ILLUSTRATION`

**Photography & Cinema:**
`BLURRY_MOTION`, `DOUBLE_EXPOSURE`, `DRAMATIC_CINEMA`, `EDITORIAL`, `GOLDEN_HOUR`, `HIGH_CONTRAST`, `LONG_EXPOSURE`, `MAGAZINE_EDITORIAL`, `MONOCHROME`

**Urban & Street:**
`GRAFFITI_I`, `GRAFFITI_II`, `NIGHTLIFE`, `POP_ART`, `RIVIERA_POP`

**Mixed Media & Experimental:**
`AURA`, `BLUEPRINT`, `C4D_CARTOON`, `CHILDRENS_BOOK`, `COLLAGE`, `COLORING_BOOK_I`, `COLORING_BOOK_II`, `DARK_AURA`, `DOODLE`, `EMOTIONAL_MINIMAL`, `ETHEREAL_PARTY`, `FOREST_REVERIE`, `GLASS_PRISM`, `HALFTONE_PRINT`, `MIXED_MEDIA`, `PAINT_GESTURE`, `STYLIZED_RED`, `SURREAL_COLLAGE`, `TRAVEL_POSTER`, `WEIRD`

#### Color Palette

**By Preset Name:**
```json
{
  "color_palette": {
    "name": "EMBER"
  }
}
```

**By Custom Hex Colors:**
```json
{
  "color_palette": {
    "members": [
      { "color_hex": "#FF5733", "weight": 0.4 },
      { "color_hex": "#1A1A2E", "weight": 0.3 },
      { "color_hex": "#E8D5B7", "weight": 0.2 },
      { "color_hex": "#00FF88", "weight": 0.1 }
    ]
  }
}
```

#### Output Schema

```json
{
  "images": [
    {
      "url": "https://v3.fal.media/files/penguin/lHdRabS80guysb8Zw1kul_image.png",
      "content_type": "image/png",
      "file_name": "image.png",
      "file_size": 2048576,
      "width": 1024,
      "height": 1024
    }
  ],
  "seed": 123456
}
```

---

## Section 2: Pricing & Cost Optimization

### Cost Structure

| Rendering Speed | Cost per Image | Quality Level |
|----------------|---------------|---------------|
| **TURBO** | $0.03 | Good — fast iteration |
| **BALANCED** | $0.06 | High — production default |
| **QUALITY** | $0.09 | Maximum — final deliverables |

### Cost Comparison

| Model | Cost Range | Typography | Design Control |
|-------|-----------|------------|----------------|
| **Ideogram V3** | $0.03–0.09 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Qwen Image Max | $0.075 | ⭐⭐⭐ | ⭐⭐ |
| Flux 2 | $0.025–0.05 | ⭐⭐ | ⭐⭐⭐ |
| DALL-E 3 | $0.04–0.12 | ⭐⭐⭐ | ⭐⭐ |

### Optimization Strategies

1. **TURBO for exploration** — at $0.03, generate 8 variations for $0.24 (less than one QUALITY image)
2. **Use `num_images: 8`** with TURBO for maximum exploration efficiency
3. **Style codes save money** — find a style you like once, reuse the code forever
4. **Style presets are free** — no additional cost for any preset
5. **BALANCED for 90% of work** — the quality jump from TURBO is significant, from BALANCED to QUALITY is marginal
6. **Batch workflow**: TURBO (explore) → BALANCED (refine) → QUALITY (final)

---

## Section 3: Typography Mastery

### 3.1 Text Rendering Best Practices

**The Quotation Rule:**
Always wrap desired text in double quotes within your prompt:
```
A vintage diner sign reading "OPEN 24 HOURS" in glowing red neon against a dark blue night sky
```

**Character Limits:**
- 1-3 words: Nearly perfect accuracy
- 4-8 words: Very good, occasional minor errors
- 9-15 words: Good, may need regeneration for perfection
- 16+ words: Unreliable, split into multiple elements

**Font Style Description:**
```
Bold sans-serif          → Clean, modern (Helvetica-like)
Elegant serif            → Traditional, literary (Times-like)
Hand-lettered script     → Personal, artisanal
Condensed bold           → Impact, urgency
Art deco geometric       → Vintage glamour
Brush script             → Dynamic, energetic
Monospace typewriter     → Technical, vintage
Gothic blackletter       → Medieval, dramatic
Stencil military         → Tactical, industrial
Neon sign                → Nightlife, retro
```

### 3.2 Typography-Focused Prompt Templates

#### Movie Poster
```
A cinematic movie poster for a film called "NIGHT SHIFT". Bold, distressed sans-serif title in white against a dark moody background. A silhouetted figure stands under a single streetlight. Tagline at the bottom reads "The city never sleeps" in thin italic type. Dramatic lighting, film grain texture, classic one-sheet composition.
```

#### Logo Design
```
A minimalist logo design for a coffee brand called "EMBER ROAST". The text is in a warm amber color with a modern geometric sans-serif font. A subtle flame icon integrated into the letter 'E'. Clean white background. Professional brand identity style. Flat vector design.
```

#### Neon Sign
```
A realistic neon sign mounted on a dark brick wall reading "COCKTAILS & DREAMS" in cursive pink neon with a blue neon martini glass icon. The neon tubes glow with a soft halo effect. Some tubes flicker slightly. Dark moody atmosphere. Photorealistic.
```

#### Book Cover
```
An elegant book cover for a novel titled "THE GLASS GARDEN" by Alexandra Stone. Art nouveau inspired border design with flowing botanical illustrations in gold and deep green. The title is in an elegant serif font with gold foil texture. Rich, sophisticated color palette of emerald, gold, and cream.
```

#### Product Packaging
```
Premium chocolate bar packaging design. The brand name "NOIR" in large embossed gold letters on a matte black wrapper. Subtle geometric cocoa bean pattern. Tagline "72% Single Origin" in small elegant type below. Luxury minimalist design. Product photography style with dramatic side lighting.
```

### 3.3 Multi-Text Compositions

For multiple text elements, be explicit about placement and hierarchy:

```
A concert poster with three text elements:
- Large headline at top: "MIDNIGHT SYMPHONY" in bold condensed white type
- Medium subheading in the middle: "LIVE AT THE GRAND HALL" in thin spaced-out letters
- Date at bottom: "DECEMBER 31, 2026" in small elegant serif type
Background is a dramatic starfield with a silhouetted orchestra. Color palette: deep navy blue, white, and gold accents.
```

---

## Section 4: Style System Deep Dive

### 4.1 Style Presets for Cinematic Production

#### Film & Cinema Presets

**`DRAMATIC_CINEMA`:**
Best for cinematic stills, movie posters, film noir aesthetics.
```
A lone detective stands in a rain-soaked alley, dramatic cinema style. Extreme contrast, volumetric light rays through fog, film grain texture.
```

**`EDITORIAL`:**
Best for fashion, portrait, magazine-quality photography.
```
A model in a flowing crimson gown on a Parisian rooftop at sunset, editorial style. Clean, sharp focus, fashion photography lighting.
```

**`MAGAZINE_EDITORIAL`:**
More stylized than EDITORIAL, with graphic design elements.
```
A lifestyle product shot of artisanal perfume bottles, magazine editorial style. Styled flat-lay with botanical elements and soft shadows.
```

**`MONOCHROME`:**
Pure black and white with rich tonal range.
```
A street musician playing saxophone in the rain, monochrome style. Deep blacks, bright highlights, visible rain droplets catching light.
```

**`GOLDEN_HOUR`:**
Warm, romantic lighting reminiscent of magic hour photography.
```
A couple walking along a beach, golden hour style. Warm amber light, long shadows, sun just above the horizon, lens flare.
```

#### Design & Illustration Presets

**`ART_DECO`:**
```
A luxury hotel lobby with geometric patterns and gold accents, art deco style. Symmetrical composition, rich jewel tones, chrome details.
```

**`BAUHAUS`:**
```
A typographic poster with bold geometric shapes and primary colors, Bauhaus style. Clean lines, asymmetric composition, sans-serif type.
```

**`FLAT_VECTOR`:**
```
An infographic-style city map with landmarks, flat vector style. Clean lines, solid colors, no gradients, modern illustration.
```

**`POP_ART`:**
```
A portrait of a woman with headphones, pop art style. Bold outlines, halftone dots, primary colors, Warhol-inspired composition.
```

### 4.2 Style Codes

Style codes are 8-character hexadecimal strings that encode a complete visual style. They're **transferable** — you can share them, save them, and apply them to any prompt.

```json
{
  "prompt": "A mountain landscape at dawn",
  "style_codes": ["A1B2C3D4"]
}
```

**How to discover style codes:**
1. Generate an image you love with a specific style
2. Note the style code from the output/metadata
3. Reuse that code across all future generations for consistency

**Cannot be combined with:** `style` parameter or `image_urls` for style reference.

### 4.3 Style Reference Images

Pass up to 10MB of reference images to guide the visual style:

```json
{
  "prompt": "A portrait of a warrior in ornate armor",
  "image_urls": [
    "https://your-style-reference-1.jpg",
    "https://your-style-reference-2.jpg"
  ]
}
```

The model extracts the **visual style** (not content) from reference images and applies it to your prompt.

**Best practices:**
- Use 1-3 reference images for consistency
- References should share a cohesive style
- Cannot be combined with `style_codes`

---

## Section 5: Color Palette Control

### 5.1 Custom Color Palettes

Define exact colors with optional weights:

```json
{
  "prompt": "A vintage travel poster for Tokyo, Japan",
  "color_palette": {
    "members": [
      { "color_hex": "#C41E3A", "weight": 0.35 },
      { "color_hex": "#FFFFFF", "weight": 0.25 },
      { "color_hex": "#1A1A2E", "weight": 0.25 },
      { "color_hex": "#F4A460", "weight": 0.15 }
    ]
  },
  "style_preset": "TRAVEL_POSTER"
}
```

### 5.2 Color Palette Strategies for Cinema

**Film Noir:**
```json
{
  "members": [
    { "color_hex": "#000000", "weight": 0.45 },
    { "color_hex": "#FFFFFF", "weight": 0.25 },
    { "color_hex": "#404040", "weight": 0.20 },
    { "color_hex": "#C0A060", "weight": 0.10 }
  ]
}
```

**Teal & Orange (Blockbuster):**
```json
{
  "members": [
    { "color_hex": "#008080", "weight": 0.30 },
    { "color_hex": "#FF8C00", "weight": 0.30 },
    { "color_hex": "#1A1A2E", "weight": 0.25 },
    { "color_hex": "#F5DEB3", "weight": 0.15 }
  ]
}
```

**Pastel Dream:**
```json
{
  "members": [
    { "color_hex": "#FFB6C1", "weight": 0.25 },
    { "color_hex": "#E6E6FA", "weight": 0.25 },
    { "color_hex": "#FFDAB9", "weight": 0.25 },
    { "color_hex": "#B0E0E6", "weight": 0.25 }
  ]
}
```

**Cyberpunk:**
```json
{
  "members": [
    { "color_hex": "#0D0D0D", "weight": 0.35 },
    { "color_hex": "#FF00FF", "weight": 0.20 },
    { "color_hex": "#00FFFF", "weight": 0.20 },
    { "color_hex": "#7B00FF", "weight": 0.15 },
    { "color_hex": "#333333", "weight": 0.10 }
  ]
}
```

---

## Section 6: Cinematic Prompting Strategies

### 6.1 Movie Poster Design

Ideogram V3 is arguably the best model for movie poster generation:

```
A cinematic movie poster for an epic science fiction film called "BEYOND THE VEIL". 
The title "BEYOND THE VEIL" dominates the upper third in massive, cracked metallic letters 
with blue energy glowing through the cracks. Below, a lone astronaut floats in front of 
an enormous alien structure that defies geometry. Star field background with a massive nebula 
in deep purple and electric blue. Tagline at the bottom: "Reality has a deadline." 
Credits block at the very bottom in standard movie poster format. 
Photorealistic rendering, IMAX poster style.
```

### 6.2 Title Cards and Lower Thirds

```
A cinematic title card on a solid dark charcoal background. The text "CHAPTER THREE" 
in thin, widely-spaced elegant serif letters centered on screen. Below it, in slightly 
smaller matching type: "THE RECKONING". Subtle film grain overlay. 
Minimalist, sophisticated, Criterion Collection style.
```

### 6.3 Production Design Concepts

```
A concept art mood board for a futuristic Tokyo district, design style. Four quadrants 
showing: top-left is a neon-lit street level view, top-right is an aerial shot of holographic 
billboards, bottom-left is an interior of a ramen shop with robotic servers, bottom-right 
is a character wearing cyberpunk fashion. Cohesive color palette of deep blue, hot pink, 
and chrome silver. Clean layout with thin white borders between sections.
```

### 6.4 Storyboard Frames

```
A hand-drawn storyboard frame in pencil sketch style showing a medium close-up shot. 
A man in a trench coat turns to look over his shoulder with alarm. Rough pencil lines 
indicate dramatic lighting from camera left. Arrow notation shows camera dolly direction. 
Shot number "SC.12 SHOT.4" written in the corner. Professional storyboard format.
```

### 6.5 Character Design Sheets

```
A professional character design turnaround sheet for a female cyberpunk hacker character. 
Three views: front, three-quarter, and profile. She wears a cropped jacket with fiber-optic 
accents, cargo pants, and augmented reality visor. Character name "ZERO" written below. 
Height reference marks on the side. Clean white background. Concept art illustration style.
```

---

## Section 7: Advanced Techniques

### 7.1 Rendering Speed Strategy

Use speed as a creative tool:

```javascript
// Phase 1: Rapid exploration (8 images × TURBO = $0.24)
const concepts = await generate({ 
  rendering_speed: "TURBO", 
  num_images: 8 
});

// Phase 2: Refine top 2 candidates (BALANCED = $0.12)
const refined = await generate({ 
  rendering_speed: "BALANCED",
  seed: concepts.bestSeeds,
  num_images: 1 
});

// Phase 3: Final render (QUALITY = $0.09)
const final = await generate({ 
  rendering_speed: "QUALITY",
  seed: refined.bestSeed,
  num_images: 1 
});

// Total: $0.45 for a professionally iterated final image
```

### 7.2 Style Consistency Across a Project

For maintaining visual consistency across multiple images in a project:

**Method 1: Style Codes**
Generate one image you love, extract its style code, apply to all subsequent generations.

**Method 2: Style References**
Use your approved key art as style reference images for all subsequent generations.

**Method 3: Preset + Palette Lock**
Lock a `style_preset` + `color_palette` combination and use identical values across all prompts.

### 7.3 MagicPrompt (Expand Prompt) Control

When `expand_prompt: true`, Ideogram's MagicPrompt rewrites your prompt with additional design detail. This is usually beneficial, but disable for:
- Exact text positioning control
- Minimal/negative-space designs where you want simplicity
- When your prompt is already design-specific and detailed

### 7.4 Combining Multiple Style Controls

You can layer (some) style controls:

✅ **Compatible combinations:**
- `style_preset` + `color_palette`
- `style` + `color_palette`
- `style` + `style_preset`
- `image_urls` (reference) + `color_palette`

❌ **Incompatible:**
- `style_codes` + `image_urls`
- `style_codes` + `style`

---

## Section 8: Strengths & Limitations

### Strengths

| Strength | Details |
|----------|---------|
| **Typography** | Best-in-class text rendering — logos, posters, signs, packaging |
| **Style Presets** | 60+ curated presets for instant aesthetic control |
| **Style Codes** | Transferable, shareable 8-char style encoding |
| **Color Palettes** | Precise color control with weighted hex values |
| **Design Intelligence** | Understands graphic design principles natively |
| **Speed Tiers** | TURBO/BALANCED/QUALITY for budget-appropriate quality |
| **Batch Size** | Up to 8 images per request |
| **Style Reference** | Image-based style transfer |
| **Pricing Flexibility** | $0.03–$0.09 range covers all budgets |

### Limitations

| Limitation | Details |
|------------|---------|
| **Photorealism** | Good but not best-in-class for photorealistic humans |
| **No Video** | Image-only model |
| **No Edit/Inpaint** | No iterative editing endpoint (generate only) |
| **No ControlNet** | No spatial control (depth, pose, edge maps) |
| **No LoRA/Fine-tuning** | Cannot custom-train on your data |
| **Style Code Opacity** | No way to "design" a style code — must discover through generation |
| **Color Palette Limits** | Palette is a guide, not absolute — model interprets creatively |
| **Long Text** | Accuracy degrades past ~15 words |
| **Complex Layouts** | Multi-element precise layouts can be hit-or-miss |

### When to Choose Ideogram V3

✅ **Choose it when:**
- Text/typography in images is essential (posters, logos, signs, packaging)
- You're doing graphic design work (not just photography)
- You want style consistency via codes/presets across a project
- Budget-conscious rapid exploration (TURBO at $0.03)
- Color control is critical for brand work
- You need design-native output (not photographic by default)

❌ **Choose something else when:**
- Photorealistic humans are the priority → Qwen Image Max, Flux
- You need video → LTX-2, Kling, Veo
- You need iterative editing → Qwen Image Max (edit endpoint)
- Spatial control needed → Flux with ControlNet
- Licensed training data required → Bria FIBO

---

## Section 9: Production Integration

### JavaScript/TypeScript

```javascript
import { fal } from "@fal-ai/client";

fal.config({ credentials: process.env.FAL_KEY });

const result = await fal.subscribe("fal-ai/ideogram/v3", {
  input: {
    prompt: 'A cinematic movie poster for "MIDNIGHT PROTOCOL" with bold typography...',
    negative_prompt: "blurry, low quality, deformed text, misspelled",
    image_size: "portrait_4_3",
    rendering_speed: "BALANCED",
    style: "DESIGN",
    style_preset: "DRAMATIC_CINEMA",
    color_palette: {
      members: [
        { color_hex: "#0A0A1A", weight: 0.4 },
        { color_hex: "#00FF88", weight: 0.3 },
        { color_hex: "#FFFFFF", weight: 0.2 },
        { color_hex: "#333333", weight: 0.1 }
      ]
    },
    expand_prompt: true,
    num_images: 4,
    seed: 42
  },
  logs: true,
  onQueueUpdate: (update) => {
    if (update.status === "IN_PROGRESS") {
      update.logs.map((log) => log.message).forEach(console.log);
    }
  },
});

result.data.images.forEach((img, i) => {
  console.log(`Image ${i + 1}: ${img.url}`);
});
```

### Python

```python
import fal_client

result = fal_client.subscribe(
    "fal-ai/ideogram/v3",
    arguments={
        "prompt": 'A vintage travel poster for Paris with text "PARIS" in art deco lettering',
        "rendering_speed": "QUALITY",
        "style_preset": "ART_DECO",
        "color_palette": {
            "members": [
                {"color_hex": "#C41E3A", "weight": 0.3},
                {"color_hex": "#1A1A2E", "weight": 0.3},
                {"color_hex": "#F4D03F", "weight": 0.25},
                {"color_hex": "#FFFFFF", "weight": 0.15}
            ]
        },
        "num_images": 1,
        "image_size": "portrait_4_3"
    },
    with_logs=True,
)

print(result["images"][0]["url"])
```

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/ideogram/v3 \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
    "prompt": "A neon sign reading \"OPEN\" in pink cursive neon on a dark brick wall",
    "rendering_speed": "BALANCED",
    "style": "REALISTIC",
    "num_images": 1
  }'
```

---

## Section 10: Prompt Templates

### Movie Poster Template
```
A [genre] movie poster for a film called "[TITLE]". [Title typography description]. 
[Main visual element]. [Background/setting]. Tagline: "[tagline text]" in [tagline style]. 
[Credits block description]. [Overall mood and color palette]. [Style reference].
```

### Brand/Logo Template
```
A [style] logo design for [brand type] called "[BRAND NAME]". 
[Typography style for brand name]. [Icon/symbol description]. 
[Color scheme]. [Background]. [Additional design elements].
Professional brand identity, clean vector style.
```

### Editorial/Magazine Template
```
A [publication type] cover featuring [subject]. Masthead reads "[PUBLICATION NAME]" 
in [type style] at the top. Headline: "[headline text]" in [type style]. 
[Supporting cover lines]. [Photography/illustration style]. 
[Color palette and mood].
```

### Signage Template
```
A [sign type] reading "[TEXT]" in [material/style] letters. 
[Mounting/environment]. [Lighting]. [Weathering/condition]. 
[Surrounding context]. [Photography style].
```

---

## Section 11: Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Text misspelled | Common with long text | Shorten text, use QUALITY speed, regenerate |
| Text not appearing | Text not in quotes | Always use "quotation marks" around desired text |
| Wrong font style | Insufficiently described | Be explicit: "bold condensed sans-serif", not just "bold" |
| Style preset not applied | Conflicting parameters | Check compatibility (style_codes vs style) |
| Colors don't match palette | Palette is a guide | Increase weight of key colors, simplify palette |
| Too much going on | MagicPrompt over-expanding | Set `expand_prompt: false` |
| Inconsistent batch | Random style variation | Use seed + style_codes for consistency |
| Design looks cluttered | Too many elements | Simplify prompt, use negative space descriptions |

---

## Appendix: Quick Reference Card

```
MODEL ID:        fal-ai/ideogram/v3
COST:            TURBO $0.03 | BALANCED $0.06 | QUALITY $0.09
BATCH SIZE:      1-8 images
SIZES:           square_hd, square, portrait_4_3, portrait_16_9, landscape_4_3, landscape_16_9, custom
STYLES:          AUTO, GENERAL, REALISTIC, DESIGN
STYLE PRESETS:   60+ named presets
STYLE CODES:     8-char hex, transferable
COLOR PALETTE:   Preset name OR custom hex with weights
STYLE REFERENCE: Up to 10MB total across reference images
MAGIC PROMPT:    expand_prompt (default: true)
TYPOGRAPHY:      Best-in-class, use "quotes" for text
FORMATS:         Standard image output (URL)
```

---

*Last updated: February 2026*  
*Cine-AI Prompt Compiler Knowledge Base — Priority 2 Model Guide*
