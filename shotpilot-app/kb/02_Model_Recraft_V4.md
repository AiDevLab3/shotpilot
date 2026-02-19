# Recraft V4 Pro

> **Official Model Name:** Recraft V4 Pro | **ShotPilot Display Name:** Recraft V4 Pro | **API Model ID:** `recraftv4_pro` (Recraft Direct) / `fal-ai/recraft/v4/pro/text-to-image` (fal.ai)
> Last Updated: 2026-02-19 | Source: recraft_v4_prompting_mastery_guide.md

## Model Overview
- **Type:** IMAGE generation (still images only, no video)
- **Engine:** Recraft V4 Pro — design-taste-forward image model, released February 2026
- **Resolution:** Native 2048×2048 (4MP), up to 3072×1536 at 2:1
- **Use in ShotPilot:** Concept art, mood boards, production design, title cards, establishing shots

## Key Differentiators
- Design taste as core philosophy — outputs feel art-directed, not generic
- 10,000 character prompt limit (10x more than V3)
- Exceptional prompt understanding for complex visual relationships
- Production-grade text rendering (signage, packaging, infographics)
- Color palette API control via RGB values (`colors` parameter)
- No style presets — ALL aesthetic direction comes from prompt text
- No reference images, no iterative editing, no negative prompts

## Golden Rules

### Rule 1: Lead With Subject
Model anchors composition on the first noun/subject. Always put your focal point first.
- BAD: "A dark moody shot with rain where a detective stands under a lamp"
- GOOD: "A detective in a rumpled trenchcoat stands under a single street lamp, rain-soaked urban street, dark moody atmosphere"

### Rule 2: Style Must Be In The Prompt
V4 has NO style presets. If you want photorealism, say "photorealistic photograph." If you want illustration, say "digital illustration."
- For cinematic: "cinematic still, shot on ARRI Alexa, anamorphic lens"
- For editorial: "editorial fashion photography, studio lighting"
- For concept art: "professional concept art, matte painting quality"

### Rule 3: Use the Color API
Don't rely solely on prompt text for colors. Use the `colors` parameter:
```json
{"colors": [{"r": 180, "g": 140, "b": 60}, {"r": 40, "g": 60, "b": 90}]}
```

### Rule 4: Be Extremely Specific
Short generic prompts get the model's default interpretation. Use the 10K character budget for detailed scene descriptions.

## Prompt Template (Recraft Official)

```
[SUBJECT + ACTION], [COMPOSITION], [CONTEXT], [MEDIUM], [STYLE], [VIBE], [ATTRIBUTES: lighting, color, texture, technical details]
```

| Component | Description | Example |
|---|---|---|
| **Subject** | Who/what — focal point | "A weathered detective in a trenchcoat" |
| **Composition** | Camera angle, framing | "Medium shot from slightly below, rule of thirds" |
| **Context** | Environment, setting | "Rain-soaked alley with fire escapes above" |
| **Medium** | Image type | "Professional cinematic photograph" |
| **Style** | Artistic reference | "Film noir, Gordon Willis lighting" |
| **Vibe** | Emotional quality | "Tense, brooding, morally ambiguous" |
| **Attributes** | Technical specs | "f/2.0 shallow DOF, desaturated blues, film grain" |

## Aspect Ratios (V4 Pro)

| Ratio | Pixels | Film Use |
|---|---|---|
| `1:1` | 2048×2048 | Square |
| `16:9` | 2688×1536 | **HD / Flat widescreen** |
| `2:1` | 3072×1536 | **Scope / Anamorphic** |
| `4:3` | 2432×1792 | **Academy ratio** |
| `3:2` | 2560×1664 | Classic photo |
| `9:16` | 1536×2688 | Vertical/mobile |
| `2:3` | 1664×2560 | Portrait |

## API Parameters

### Recraft Direct API
| Param | Type | Default | Notes |
|---|---|---|---|
| `prompt` | string (required) | — | Max 10,000 chars |
| `model` | string | `recraftv4` | Use `recraftv4_pro` |
| `n` | integer | 1 | 1-6 images per request |
| `size` | string | `1:1` | Aspect ratio or WxH |
| `response_format` | string | `url` | `url` or `b64_json` |

### fal.ai API
| Param | Type | Default | Notes |
|---|---|---|---|
| `prompt` | string (required) | — | Text description |
| `image_size` | string/object | `square_hd` | Preset or `{width, height}` |
| `colors` | array | [] | RGB color preferences |
| `background_color` | object | null | RGB background color |

**NOT supported in V4:** `style`, `style_id`, `negative_prompt`, `text_layout`, seeds

## Strengths
- **Design-forward composition** — professional layout judgment, rule of thirds, leading lines
- **Color harmony** — cohesive palettes, professional-quality color grading
- **Text rendering** — clear signage, labels, title cards
- **Clean geometry** — architecture, vehicles, products render with accurate perspective
- **Material intelligence** — glass, metal, fabric, wood, wet surfaces
- **10K prompt length** — describe complex multi-element scenes in detail

## Limitations
- **No iterative editing** — text-to-image only, no inpainting/img2img
- **No reference images** — cannot maintain character consistency
- **No negative prompts** — can't explicitly exclude elements
- **No style presets** — must describe aesthetic entirely in prompt
- **No seed control** — every generation is unique
- **~30 second generation** — slower than standard V4 (10s)
- **$0.25/image** — 6x more expensive than V4 standard
- **Design taste overrides** — model may "improve" deliberately rough/ugly scenes

## Cinematic Style Vocabulary

### Camera/Lens
- "shot on ARRI Alexa 65" / "RED V-RAPTOR" / "Panavision"
- "anamorphic lens" / "Cooke S4/i at T2.0" / "50mm f/1.4"
- "24mm wide angle" / "200mm telephoto compression" / "tilt-shift"

### Lighting
- "golden hour backlighting" / "blue hour ambient"
- "single-source dramatic side lighting" / "chiaroscuro"
- "practical lighting only" / "neon with color spill"
- "volumetric fog with god rays" / "rim light separation"

### Color Grade
- "teal and orange grade" / "bleach bypass desaturated"
- "warm golden like The Godfather" / "cold clinical like Zodiac"
- "crushed blacks with milky highlights" / "pastel muted like Moonlight"

### Production Context
- "cinematic still from a $200M historical epic"
- "indie A24 drama frame" / "BBC documentary screenshot"
- "IMAX large format presentation"

## Cost

| Model | Per Image | Speed |
|---|---|---|
| V4 Pro | $0.25 | ~30s |
| V4 Standard | $0.04 | ~10s |
| V3 | $0.04 | ~10s |

**Strategy:** Explore with V4 Standard ($0.04), finalize with V4 Pro ($0.25).

## When to Use vs. Other Models

| Scenario | Best Model |
|---|---|
| Mood boards, look development | **Recraft V4 Pro** |
| Concept art, production design | **Recraft V4 Pro** |
| Character-specific storyboards | Nano Banana Pro |
| Iterative refinement | Nano Banana Pro / GPT Image |
| Title cards with text | **Recraft V4 Pro** |
| Photo-matching real footage | Nano Banana Pro |
| Rapid cheap exploration | Recraft V4 Standard |
| Artistic inspiration | Midjourney |

## Batch Consistency Tips
1. Lock color palette via `colors` API parameter across all generations
2. Keep camera/lens descriptions identical across the batch
3. Maintain consistent lighting direction language
4. Generate 4-6 variations per prompt (`n: 4-6`), curate the best
5. Accept character face variation — focus continuity on environment, palette, mood
