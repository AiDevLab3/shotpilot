# Midjourney - AI Prompt Generation Guide

> Last Updated: 2026-02-08 | Source: midjourney_prompting_mastery_guide.md (V7 params verified)

**Model:** Midjourney V7 | **Type:** IMAGE generation (artistic + photorealistic) | **Developer:** Midjourney Inc.

---

## 8-Component Photography Prompt Framework

Build prompts using these components in order:

| # | Component | Description | Example |
|---|-----------|-------------|---------|
| 1 | **Subject** | Main focus with specific details | `An elderly man with a weathered face and long white beard` |
| 2 | **Photography Style** | Genre of the photograph | `A dramatic black and white portrait` |
| 3 | **Technical Details** | Camera, lens, film stock | `Shot on Hasselblad medium format, 150mm lens, Ilford HP5+` |
| 4 | **Lighting** | Quality and direction of light | `Low-key Rembrandt-style key light from the side` |
| 5 | **Composition** | Arrangement and framing | `Close-up, face filling the frame, rule of thirds` |
| 6 | **Atmosphere & Mood** | Emotional tone and color grading | `Somber, contemplative mood with deep blacks, high contrast` |
| 7 | **Camera Settings** | Aperture, shutter speed, ISO | `f/8, 1/125s, ISO 400` |
| 8 | **MJ Parameters** | Technical output controls | `--ar 4:5 --style raw --v 7` |

---

## V7 Features

### Personalization
- Rate ~200 images to build your aesthetic profile
- MJ tailors generations to your taste
- Toggle on/off per generation
- Use for consistent look across a project

### Draft Mode
- 10x faster generation at lower resolution and reduced GPU cost
- Parameter: `--draft`
- Use for rapid prototyping and idea exploration

### Character Consistency (--cref)
- Pass a character reference image URL: `--cref [image URL]`
- Maintains character appearance across multiple generations
- Essential for narrative sequences and character-driven stories

### Text Generation
- Enclose desired text in quotation marks within the prompt
- Works for posters, signs, book covers
- Still less reliable than GPT Image for complex text

---

## Key Parameters

| Parameter | Function | Example |
|-----------|----------|---------|
| `--ar` (aspect ratio) | Set output dimensions | `--ar 16:9`, `--ar 21:9`, `--ar 4:5` |
| `--chaos` / `--c` | Increase randomness/variety (0-100) | `--c 50` |
| `--no` | Exclude specific elements | `--no people`, `--no text` |
| `--quality` / `--q` | Rendering quality/time | `--q 2` |
| `--repeat` / `--r` | Multiple jobs from single prompt | `--r 4` |
| `--seed` | Reproduce similar results | `--seed 12345` |
| `--stylize` / `--s` | Strength of MJ aesthetic (0-1000) | `--s 750` |
| `--style` | Model sub-version | `--style raw` |
| `--cref` | Character reference image | `--cref [URL]` |
| `--draft` | Fast low-res generation | `--draft` |

### Parameter Tips
- `--style raw` reduces MJ's artistic interpretation for more literal results
- Higher `--stylize` = more artistic; lower = more literal
- `--chaos 0` = consistent results; `--chaos 100` = maximum variety
- Use `--seed` to iterate on a composition you like

---

## Cinematic Prompting Structure

For narrative, film-like aesthetic, use this layered structure:

1. **Introductory Words:** `Cinematic still`, `footage from...`, `film still`
2. **Genre & Style:** `modern spy movie`, `horror`, `action`, `film noir`
3. **Camera & Shot:** `Over-the-shoulder shot`, `medium close-up`, `wide establishing`
4. **Director Reference:** `Spielberg`, `Kubrick`, `Villeneuve`, `Wes Anderson`
5. **Technical Details:** `IMAX 70mm`, `Kodak Portra 400`, `35mm lens`
6. **Character & Attire:** `young brunette wearing a black evening dress`
7. **Setting & Lighting:** `luxurious restaurant, daytime, natural lighting`
8. **Parameters:** `--ar 21:9 --style raw --v 7`

### Example
```
Cinematic still from a Wes Anderson film. A young boy in a red beanie
stands on a windswept beach, looking out at the ocean. Shot on Kodak
Portra 400 with a 35mm lens, warm nostalgic look. Perfectly symmetrical
composition with the boy in the exact center. --ar 16:9 --style raw --v 7
```

---

## Best Practices for Cinematic Realism

- **Think like a photographer** - Specify camera, lens, film stock, not abstract qualities
- **Use --style raw** for photorealism to reduce MJ's artistic embellishment
- **Specify real skin texture:** `detailed skin`, `visible pores`, `freckles`, `unretouched`
- **Name director references** to evoke specific visual styles (Kubrick = symmetry, Villeneuve = scale)
- **Layer detail gradually** - Start with core prompt, add complexity iteratively
- **Use --cref for consistency** when generating multiple shots of the same character
- **Aspect ratios matter:** `--ar 21:9` or `--ar 16:9` for cinematic widescreen; `--ar 4:5` for portraits
- **Low --stylize (100-250)** for realistic results; high (750+) for artistic interpretation

---

## Common Mistakes + Fixes

| # | Mistake | Fix |
|---|---------|-----|
| 1 | **Vague prompts** ("nice photo of a person") | Be specific: name camera, lens, lighting, composition, materials |
| 2 | **Overly complex single prompt** | Start simple, add layers of detail incrementally |
| 3 | **Ignoring parameters** | Always set --ar, --style, --stylize at minimum |
| 4 | **Generic quality words** ("ultra HD, masterpiece") | Use photography terms: lens focal length, film stock, aperture |
| 5 | **No negative prompting** | Use --no to exclude unwanted elements (text, watermarks, people) |
| 6 | **Inconsistent characters** | Use --cref with a reference image for every generation |

---

## Integration with Other Models

### As Hero Frame Generator
- Generate cinematic stills in MJ using photographer framework
- Use `--style raw` + specific camera/lens for maximum realism
- Export hero frame to video models (Higgsfield, Kling, Veo)

### Workflow with GPT Image 1.5
- MJ for initial artistic exploration and mood development
- GPT Image for precise edits, text rendering, identity-preserving refinements
- MJ for stylistic variations; GPT Image for production polish

### Workflow with Higgsfield Cinema Studio
- MJ generates concept/mood reference images
- Cinema Studio rebuilds shot with precise rig control (camera body + lens + aperture)
- Cinema Studio hero frame feeds into video generation

### Aspect Ratios for Cross-Model Use
| Downstream Use | MJ Aspect Ratio |
|---------------|-----------------|
| Cinematic video (16:9) | `--ar 16:9` |
| Ultra-widescreen | `--ar 21:9` |
| Portrait/vertical video | `--ar 9:16` |
| Square (social) | `--ar 1:1` |
| Standard photo | `--ar 4:5` |
