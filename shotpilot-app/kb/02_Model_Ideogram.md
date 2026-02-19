# Ideogram V3 — ShotPilot Quick Reference

## Model Overview

**ID:** `fal-ai/ideogram/v3`  
**Type:** Image generation (typography + design focused)  
**Cost:** TURBO $0.03 | BALANCED $0.06 | QUALITY $0.09  
**Developer:** Ideogram AI

Ideogram V3 is the industry leader for **text rendering in images**. Features 60+ style presets, style codes, color palette control, and style reference images. Best for posters, logos, signage, packaging, and design work.

## Key Parameters

| Parameter | Default | Options |
|-----------|---------|---------|
| `prompt` | required | Put text in "quotes" |
| `negative_prompt` | `""` | Content to avoid |
| `image_size` | `square_hd` | Standard presets + custom `{width, height}` |
| `rendering_speed` | `BALANCED` | `TURBO`, `BALANCED`, `QUALITY` |
| `style` | — | `AUTO`, `GENERAL`, `REALISTIC`, `DESIGN` |
| `style_preset` | — | 60+ presets (see below) |
| `style_codes` | — | List of 8-char hex codes (not compatible with style/image_urls) |
| `image_urls` | — | Style reference images (max 10MB total, JPEG/PNG/WebP) |
| `color_palette` | — | `{name}` or `{members: [{color_hex, weight}]}` |
| `expand_prompt` | `true` | MagicPrompt enhancement |
| `num_images` | `1` | 1–8 |
| `seed` | random | Reproducibility |

## Prompting Rules

1. **Text in "quotation marks"** — most important rule for typography
2. **Name the deliverable** — "movie poster", "logo", "neon sign", "book cover"
3. **Use style presets** over long style descriptions
4. **Use design vocabulary** — "sans-serif", "negative space", "rule of thirds"
5. **TURBO for exploration, QUALITY for final** — 3× price difference

## Style Presets (Highlights)

**Cinema:** `DRAMATIC_CINEMA`, `GOLDEN_HOUR`, `MONOCHROME`, `LONG_EXPOSURE`, `DOUBLE_EXPOSURE`  
**Design:** `ART_DECO`, `BAUHAUS`, `FLAT_VECTOR`, `MINIMAL_ILLUSTRATION`, `POP_ART`  
**Editorial:** `EDITORIAL`, `MAGAZINE_EDITORIAL`, `HIGH_CONTRAST`  
**Retro:** `80S_ILLUSTRATION`, `90S_NOSTALGIA`, `VINTAGE_POSTER`, `RETRO_ETCHING`  
**Art:** `WATERCOLOR`, `OIL_PAINTING`, `WOODBLOCK_PRINT`, `CUBISM`, `ART_BRUT`  
**Experimental:** `COLLAGE`, `SURREAL_COLLAGE`, `GLASS_PRISM`, `AURA`, `WEIRD`

Full list: 60+ presets including `TRAVEL_POSTER`, `GRAFFITI_I/II`, `BLUEPRINT`, `C4D_CARTOON`, `CHILDRENS_BOOK`, `COLORING_BOOK_I/II`, `HALFTONE_PRINT`, etc.

## Color Palette Control

**Custom hex with weights:**
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

## Cinematic Examples

**Movie Poster:**
```
A cinematic movie poster for "NIGHT SHIFT". Bold distressed sans-serif title in white. 
Silhouetted figure under a streetlight. Tagline: "The city never sleeps" in thin italic. 
Dramatic lighting, film grain, classic one-sheet composition.
```

**Title Card:**
```
Cinematic title card on dark charcoal. "CHAPTER THREE" in thin widely-spaced serif. 
Below: "THE RECKONING" in smaller matching type. Film grain overlay. Criterion Collection style.
```

**Neon Sign:**
```
Realistic neon sign on dark brick wall reading "COCKTAILS & DREAMS" in cursive pink neon 
with blue martini glass icon. Soft glow halo. Some tubes flicker. Photorealistic.
```

**Logo Design:**
```json
{
  "prompt": "Minimalist logo for coffee brand \"EMBER ROAST\". Warm amber modern geometric sans-serif. Flame icon in letter E. Clean white background. Flat vector.",
  "rendering_speed": "QUALITY",
  "style": "DESIGN",
  "num_images": 4
}
```

## Strengths
- ⭐ Best-in-class text/typography rendering
- ⭐ 60+ curated style presets
- ⭐ Style codes (transferable, shareable)
- ⭐ Color palette with weighted hex
- ⭐ Batch up to 8 images
- ⭐ Three speed/cost tiers
- ⭐ Style reference images

## Limitations
- ❌ Photorealism not best-in-class (humans)
- ❌ No edit/inpaint endpoint
- ❌ No ControlNet/spatial control
- ❌ No video
- ❌ Style codes opaque (discover, don't design)
- ❌ Long text (15+ words) degrades accuracy

## When to Use
✅ Typography, posters, logos, signage, packaging, design, style consistency  
❌ Photorealistic humans → Qwen/Flux | Video → LTX-2 | Editing → Qwen/FIBO | Licensed data → Bria FIBO

## Quick Code
```javascript
const result = await fal.subscribe("fal-ai/ideogram/v3", {
  input: {
    prompt: 'Movie poster for "BEYOND THE VEIL" with bold metallic letters...',
    rendering_speed: "BALANCED",
    style: "DESIGN",
    style_preset: "DRAMATIC_CINEMA",
    color_palette: {
      members: [
        { color_hex: "#0A0A1A", weight: 0.4 },
        { color_hex: "#00FF88", weight: 0.3 }
      ]
    },
    num_images: 4
  }
});
```

## Budget Strategy
1. **TURBO × 8** for exploration = $0.24 (8 concepts)
2. **BALANCED × 2** for refinement = $0.12
3. **QUALITY × 1** for final = $0.09
4. **Total: $0.45** for a professionally iterated deliverable
