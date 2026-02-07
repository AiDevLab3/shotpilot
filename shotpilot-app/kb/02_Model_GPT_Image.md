# GPT Image 1.5 - AI Prompt Generation Guide

**Model:** gpt-image-1.5 | **Type:** IMAGE generation (NOT video) | **Developer:** OpenAI

---

## Core Strengths

- **Photorealism** - Natural lighting, real textures (pores, wrinkles, fabric wear), believable physics
- **World Knowledge** - Infers context from minimal cues (e.g., "Bethel, NY, August 1969" yields Woodstock imagery)
- **Text Rendering** - Crisp lettering, consistent layout, reliable typography
- **Identity Preservation** - Maintains character consistency across edits and multi-step workflows
- **Structured Visuals** - Infographics, storyboards, multi-panel compositions, UI mockups
- **Style Control** - Minimal prompting needed for style transfer; consistent across iterations

---

## Prompt Structure

Always follow this order:

```
[Background/Scene] -> [Subject] -> [Key Details] -> [Constraints]
```

For complex requests, use labeled segments:

```
Scene: Cozy coffee shop interior, warm afternoon light
Subject: Barista making latte art, focused expression
Details: Steam rising, espresso machine in background, wooden counter
Style: Photorealistic, shot on 35mm film, shallow depth of field
Constraints: No watermarks, no text, natural color balance
```

**Include intended use** to set generation mode:
- "for a social media ad"
- "photorealistic product shot"
- "cinematic establishing shot for video workflow"

---

## Key Techniques

### Specificity Over Buzzwords

**Use photography language, NOT generic quality terms:**

| DO | DON'T |
|----|-------|
| `50mm lens, shallow depth of field (f/1.8)` | `8K ultra-detailed hyper-realistic` |
| `golden hour, soft diffuse light` | `beautiful lighting` |
| `subtle film grain, natural color balance` | `masterpiece, best quality` |
| `visible skin texture, pores, fine lines` | `ultra-realistic person` |
| `shot on 35mm film` | `photographic` |

**Be concrete about:**
- Materials: leather, brushed steel, velvet, aged wood
- Textures: rough, smooth, glossy, matte
- Visual medium: photo, watercolor, 3D render, pencil sketch

### Composition Control

**Framing:** close-up, medium shot, wide shot, extreme close-up
**Viewpoint:** eye-level, low-angle, high-angle, Dutch angle, bird's eye, worm's eye
**Layout:** "logo top-right", "subject centered with negative space on left", "text overlaid on bottom third"

### Lighting Specification

- Quality: soft diffuse, hard directional, rim lighting
- Source: golden hour, overcast, studio, backlit
- Mood: high-contrast dramatic, low-contrast soft, chiaroscuro

---

## Multi-Image Input Syntax

Reference each input by index and description:

```
Image 1: Product photo of red sneaker on white background
Image 2: Style reference showing watercolor painting aesthetic

Apply Image 2's watercolor style to Image 1's sneaker while preserving the product's shape and color.
```

For compositing, specify which elements move where:

```
Image 1: Photo of a bird in flight
Image 2: Photo of an elephant in a savanna

Place the bird from Image 1 onto the back of the elephant in Image 2.
Keep the elephant's environment and lighting. Match the bird's lighting to the scene.
```

---

## Character Consistency Workflow

### Step 1: Generate Hero Image
```
Character design: Woman, age 30, short black hair, brown eyes, round glasses.
Wearing blue denim jacket, white t-shirt, black jeans.
Neutral expression, standing pose, white background.
```

### Step 2: Use Hero as Reference in Each Scene
```
Image 1: Character reference (woman with short black hair, glasses, denim jacket)

Place this character in a library, browsing books on shelf.
Maintain exact appearance: short black hair, round glasses, blue denim jacket, white t-shirt.
Natural library lighting, photorealistic.
```

**Rules:**
- Always pass the hero image as Image 1 input
- Repeat the full character description in every scene prompt
- Keep descriptions identical across all prompts

---

## Iterative Editing Rules

**Re-specify critical details each iteration to prevent drift:**

```
Iteration 1: Make the lighting warmer with golden tones.
Preserve: subject's face, pose, expression, background, composition.

Iteration 2: Increase contrast slightly.
Preserve: subject's face, pose, expression, background, composition, warm golden lighting.

Iteration 3: Add subtle film grain.
Preserve: subject's face, pose, expression, warm golden lighting, blurred background, composition.
```

**Key rules:**
- Use "change only X" + "keep everything else the same"
- The preserve list must grow with each iteration (accumulate prior changes)
- Start fresh if drift becomes severe
- Single-change follow-ups produce better results than multi-change edits

---

## Text Rendering Rules

- Put literal text in **quotes**: `Create a poster with the text "FIELD & FLOUR"`
- For tricky/uncommon words, **spell letter-by-letter**: `H-I-G-G-S-F-I-E-L-D`
- Specify typography: font style (serif/sans-serif), size, color, placement
- Use `quality="high"` for text-heavy images
- Keep text short and simple when possible

---

## Cinematic Realism DO/DON'T

### DO
- Prompt as if capturing a real photo in the moment
- Use camera/lens language: `ARRI Alexa, 50mm lens, anamorphic, f/2.8`
- Request real texture: pores, wrinkles, fabric wear, imperfections
- Specify natural imperfections: `subtle film grain`, `slight motion blur`
- Include negative space and clear subject separation for video-ready frames
- Use `quality="high"` for final hero frames
- Specify aspect ratio for cinematic: `1792x1024` for widescreen

### DON'T
- Use AI buzzwords: "8K ultra-detailed hyper-realistic masterpiece"
- Over-specify with conflicting instructions
- Forget to state constraints (no watermarks, no extra text)
- Skip re-specifying details during iterative edits
- Use overly cluttered backgrounds (complicates downstream video animation)
- Rely on generic "beautiful" or "stunning" qualifiers

---

## Integration: Hero Frame Generation for Video

GPT Image 1.5 generates hero frames that feed into image-to-video models (Higgsfield, Kling, Veo).

### Hero Frame Best Practices
1. Use photorealistic prompting with camera language
2. Compose for motion: leave negative space, separate subject from background
3. Use shallow depth of field for subject isolation
4. Avoid cluttered backgrounds
5. Use `quality="high"` and widescreen size (`1792x1024`)
6. Generate 10-20 variations per shot, select best

### Example Hero Frame Prompt
```
Cinematic medium shot of astronaut discovering alien artifact in cave.
Astronaut in left third of frame, artifact glowing in right third.
Shot on ARRI Alexa with 50mm lens, shallow depth of field (f/2.8).
Dramatic side lighting from artifact (blue glow), rim light on astronaut from behind.
Rich textures: worn spacesuit, rough cave walls, crystalline artifact.
Anamorphic lens flare, film grain, cinematic color grading (teal and orange).
Photorealistic, production-quality detail.
```

### Cross-Model Workflow
1. Generate hero frame with GPT Image 1.5 (quality="high")
2. Optionally refine: adjust lighting, add grain, deepen shadows
3. Export to video generation platform
4. Use hero frame as reference image in video model
5. Specify motion/camera movement in video prompt while preserving hero aesthetic

---

## Common Mistakes + Fixes

| # | Mistake | Fix |
|---|---------|-----|
| 1 | **Text misspelled/garbled** | Put text in quotes, spell tricky words letter-by-letter, specify font style, use quality="high" |
| 2 | **Image doesn't match prompt** | Use structured prompts with labeled sections, be specific about materials/colors, add constraints, include intended use |
| 3 | **Edits drift from original** | Re-specify ALL critical details each iteration, use "change only X / keep everything else", accumulate preserve list |
| 4 | **Results look "AI-generated"** | Use photography language (lens/lighting/framing), request real texture and imperfections, avoid "8K ultra-detailed" buzzwords |
| 5 | **Inconsistent character across images** | Generate hero/reference image first, pass it as input for every scene, repeat full character description in every prompt |

---

## Output Sizes

| Size | Use Case |
|------|----------|
| 1024x1024 | Square, default |
| 1792x1024 | Widescreen cinematic |
| 1024x1792 | Vertical/portrait |

## Quality Settings

- `quality="low"` - Fast generation, good for prototyping and iteration
- `quality="high"` - Production output, text-heavy images, detail-critical work
