# The Rosetta Stone: Cross-Model Cinematic Translation Guide

## Purpose

This document maps how the **same cinematic concept** must be phrased differently across four major AI image generation models to achieve visually consistent results. It serves as a translation layer for an AI agent acting as a "Chief Cinematographer."

---

## 1. LIGHTING TRANSLATION

### Golden Hour / Warm Sunset Light

| **Concept** | **Midjourney** | **Higgsfield Cinema Studio** | **GPT Image 1.5** | **Nano Banana Pro** |
|-------------|----------------|------------------------------|-------------------|---------------------|
| **Prompt Language** | `golden hour lighting, warm sunset glow --sw 150` | `Camera: ARRI Alexa 35, Lens: Cooke, Time: Late afternoon, golden hour, warm directional sunlight` | `Shot during golden hour with warm, directional sunlight creating long shadows and a golden glow. Soft, diffused light with rich amber tones.` | `Golden hour. Warm directional sunlight from the left at 15-degree angle. Soft ambient fill. Color temperature 3200K. Gentle highlight rolloff.` |
| **Style Reference** | Use `--sref` with a golden hour reference image | Use "Hero Frame" with golden hour lighting locked in | Provide golden hour reference image: "Image 1: golden hour reference... apply this lighting to the scene" | Upload golden hour reference: "Match the warm color temperature and directional quality of this lighting" |
| **Key Differences** | Abstract, relies on --sw to control intensity | Technical camera/time-of-day language | Natural descriptive language with photography terms | Physics-based (angle, color temp, rolloff) |

### Chiaroscuro / High Contrast Dramatic

| **Concept** | **Midjourney** | **Higgsfield Cinema Studio** | **GPT Image 1.5** | **Nano Banana Pro** |
|-------------|----------------|------------------------------|-------------------|---------------------|
| **Prompt Language** | `chiaroscuro lighting, dramatic shadows, single light source --sw 200` | `Camera: RED V-Raptor, Lens: Zeiss Ultra Prime, Lighting: Single harsh spotlight from above, deep shadows, high contrast` | `Lit by a single, harsh overhead spotlight, creating deep shadows and high contrast (chiaroscuro). Strong directional light with minimal fill.` | `Single point light source 45 degrees above subject. Hard light. Deep cast shadows. High contrast ratio 8:1. Minimal ambient fill.` |
| **Style Reference** | Use `--sref` with film noir reference | Lock "Hero Frame" with chiaroscuro setup | "Image 1: chiaroscuro reference... apply this dramatic lighting with deep shadows" | "Match the contrast ratio and shadow depth of this reference" |
| **Key Differences** | Style-based keywords | Camera + lens + lighting setup | Descriptive with cinematography terms | Precise ratios and angles |

### Soft Diffused / High-Key

| **Concept** | **Midjourney** | **Higgsfield Cinema Studio** | **GPT Image 1.5** | **Nano Banana Pro** |
|-------------|----------------|------------------------------|-------------------|---------------------|
| **Prompt Language** | `soft diffused lighting, high-key, bright and airy --sw 100` | `Camera: ARRI Alexa 35, Lens: Cooke, Lighting: Soft, diffused daylight through large windows, high-key setup` | `Bright, soft, high-key lighting with diffused natural light. Minimal shadows, even illumination, airy and optimistic mood.` | `Soft diffused light. Multiple fill sources. Low contrast ratio 2:1. Bright ambient. Gentle shadows. High-key exposure.` |
| **Style Reference** | Use `--sref` with bright, airy reference | "Hero Frame" with high-key lighting | "Image 1: high-key reference... apply this soft, bright lighting" | "Match the low contrast and even illumination of this reference" |
| **Key Differences** | Mood-based keywords | Technical setup description | Natural language with mood | Contrast ratios and source count |

---

## 2. CAMERA & LENS TRANSLATION

### Wide-Angle Epic Landscape (24mm)

| **Concept** | **Midjourney** | **Higgsfield Cinema Studio** | **GPT Image 1.5** | **Nano Banana Pro** |
|-------------|----------------|------------------------------|-------------------|---------------------|
| **Prompt Language** | `shot with 24mm wide-angle lens, expansive landscape --ar 21:9` | `Camera: IMAX, Lens: Zeiss Ultra Prime, Focal Length: 24mm, Aperture: f/11` | `Wide-angle shot using a 24mm lens at f/11 for deep focus. Expansive landscape with horizon in sharp focus.` | `24mm focal length. f/11 aperture. Deep depth of field. Horizon to foreground in focus. Wide perspective.` |
| **Style Reference** | Use `--sref` with epic landscape code | Select IMAX camera + 24mm preset | "Shot with a 24mm wide-angle lens for expansive perspective" | "24mm equivalent. Deep focus. Match the perspective distortion of this reference" |
| **Key Differences** | Focal length + aspect ratio | Camera body + lens + focal length + aperture | Photography language | Technical specs with depth of field |

### Portrait Compression (85mm, Shallow DoF)

| **Concept** | **Midjourney** | **Higgsfield Cinema Studio** | **GPT Image 1.5** | **Nano Banana Pro** |
|-------------|----------------|------------------------------|-------------------|---------------------|
| **Prompt Language** | `shot with 85mm portrait lens, shallow depth of field, bokeh --sw 150` | `Camera: ARRI Alexa 35, Lens: Cooke, Focal Length: 85mm, Aperture: f/1.4` | `Portrait shot using an 85mm lens at f/1.4 for very shallow depth of field. Subject in sharp focus, background beautifully blurred with soft bokeh.` | `85mm focal length. f/1.4 aperture. Shallow depth of field. Subject sharp, background bokeh. Compression effect.` |
| **Style Reference** | Use `--sref` with portrait bokeh reference | Select Cooke lens + 85mm + f/1.4 | "Image 1: shallow DoF reference... apply this bokeh and compression" | "Match the bokeh character and subject isolation of this reference" |
| **Key Differences** | Lens type + bokeh keyword | Full rig specification | Natural language with technical terms | Precise aperture and effect |

---

## 3. COLOR GRADING TRANSLATION

### Teal & Orange Blockbuster

| **Concept** | **Midjourney** | **Higgsfield Cinema Studio** | **GPT Image 1.5** | **Nano Banana Pro** |
|-------------|----------------|------------------------------|-------------------|---------------------|
| **Prompt Language** | `teal and orange color grading, cinematic blockbuster look --sref [code]` | `Camera: Sony Venice, Film Stock: Digital Cinema with teal shadows and orange highlights` | `Color graded with teal shadows and warm orange highlights, creating a modern blockbuster cinematic look.` | `Color grade: Teal in shadows (#1A535C), warm orange in highlights (#FF6B35). Complementary contrast. Cinematic LUT.` |
| **Style Reference** | Use `--sref` with teal/orange reference image | Lock "Hero Frame" with teal/orange grading | "Image 1: teal/orange reference... apply this color palette" | "Match the specific teal/orange split toning of this reference" |
| **Key Differences** | Style keywords + sref code | Camera + film stock description | Descriptive color language | Hex codes + technical terms |

### Desaturated Gritty Realism

| **Concept** | **Midjourney** | **Higgsfield Cinema Studio** | **GPT Image 1.5** | **Nano Banana Pro** |
|-------------|----------------|------------------------------|-------------------|---------------------|
| **Prompt Language** | `desaturated, muted colors, gritty realism, film grain --sw 180` | `Camera: Panavision Panaflex, Film Stock: Kodak 5219 pushed 2 stops, desaturated, gritty` | `Desaturated color palette with muted earth tones, subtle film grain, and a gritty, realistic feel.` | `Desaturated (-30% saturation). Muted earth tones. Film grain overlay. Low color contrast. Gritty texture.` |
| **Style Reference** | Use `--sref` with gritty film reference | Select film stock + push processing | "Image 1: desaturated reference... apply this muted color palette" | "Match the saturation level and grain structure of this reference" |
| **Key Differences** | Mood keywords | Film stock + processing | Natural description | Percentage-based adjustments |

---

## 4. ATMOSPHERIC EFFECTS TRANSLATION

### Volumetric Light / God Rays

| **Concept** | **Midjourney** | **Higgsfield Cinema Studio** | **GPT Image 1.5** | **Nano Banana Pro** |
|-------------|----------------|------------------------------|-------------------|---------------------|
| **Prompt Language** | `volumetric lighting, god rays, light shafts through fog --sw 200` | `Lighting: Volumetric light shafts through atmospheric haze, god rays visible` | `Volumetric lighting with visible god rays streaming through the atmosphere, creating dramatic light shafts.` | `Volumetric scattering. Light shafts at 30-degree angle. Atmospheric haze density 40%. God rays visible.` |
| **Style Reference** | Use `--sref` with god rays reference | Include in lighting description of "Hero Frame" | "Image 1: god rays reference... add these volumetric light shafts" | "Match the scattering intensity and shaft angle of this reference" |
| **Key Differences** | Effect keywords | Atmospheric description | Natural language | Physics parameters (density, angle) |

### Rain / Wet Surfaces

| **Concept** | **Midjourney** | **Higgsfield Cinema Studio** | **GPT Image 1.5** | **Nano Banana Pro** |
|-------------|----------------|------------------------------|-------------------|---------------------|
| **Prompt Language** | `rain-soaked streets, wet reflections, water droplets --sw 150` | `Weather: Heavy rain, wet surfaces with reflections, water droplets on camera lens` | `Rain-soaked environment with wet surfaces creating reflections. Water droplets visible, slick pavement reflecting neon lights.` | `Rain weather condition. Wet surface reflections. Specular highlights on water. Droplets on surfaces. Caustic patterns.` |
| **Style Reference** | Use `--sref` with rain/wet reference | Include weather in scene description | "Image 1: rain reference... apply this wet, reflective quality" | "Match the reflection intensity and wetness of this reference" |
| **Key Differences** | Visual keywords | Weather + surface description | Descriptive with visual effects | Physics-based (specular, caustics) |

---

## 5. FILM STOCK / MEDIUM TRANSLATION

### Kodak Portra 400 (Film Look)

| **Concept** | **Midjourney** | **Higgsfield Cinema Studio** | **GPT Image 1.5** | **Nano Banana Pro** |
|-------------|----------------|------------------------------|-------------------|---------------------|
| **Prompt Language** | `shot on Kodak Portra 400, film photography, natural colors --sw 120` | `Camera: Panavision Panaflex, Film Stock: Kodak Portra 400, natural color rendering` | `Shot on Kodak Portra 400 film with natural color rendering, subtle grain, and organic film texture.` | `Kodak Portra 400 emulation. Natural color palette. Fine grain structure. Gentle highlight rolloff. Film-like contrast.` |
| **Style Reference** | Use `--sref` with Portra 400 reference | Select Kodak Portra 400 film stock | "Image 1: Portra 400 reference... apply this film look" | "Match the grain, color, and contrast curve of this film stock" |
| **Key Differences** | Film stock name | Camera + film stock selection | Natural language with film name | Emulation with technical characteristics |

### VHS / Lo-Fi Aesthetic

| **Concept** | **Midjourney** | **Higgsfield Cinema Studio** | **GPT Image 1.5** | **Nano Banana Pro** |
|-------------|----------------|------------------------------|-------------------|---------------------|
| **Prompt Language** | `VHS aesthetic, analog video, tracking lines, color bleeding --sw 180` | `Camera: VHS Camcorder, low-fidelity, color bleeding, soft edges, tracking lines` | `VHS camcorder aesthetic with low-fidelity, color bleeding, soft edges, and visible tracking lines.` | `VHS emulation. Color bleeding. Horizontal tracking artifacts. Low resolution. Chroma noise. Analog distortion.` |
| **Style Reference** | Use `--sref` with VHS reference | Select VHS camera profile | "Image 1: VHS reference... apply this lo-fi analog look" | "Match the color bleeding and artifact pattern of this reference" |
| **Key Differences** | Aesthetic keywords | Camera profile selection | Descriptive with technical terms | Technical artifact specification |

---

## USAGE GUIDELINES FOR AI AGENTS

### When to Use Each Model

**Midjourney:**
- Best for: Artistic interpretation, style exploration, abstract concepts
- Use when: You have a strong style reference image or sref code
- Limitation: Less precise control over technical camera parameters

**Higgsfield Cinema Studio:**
- Best for: Technical precision, video generation, "Hero Frame First" workflow
- Use when: You need exact camera/lens/aperture control
- Limitation: Requires understanding of cinematography terminology

**GPT Image 1.5:**
- Best for: Iterative editing, multi-image compositing, natural language instructions
- Use when: You need to make incremental changes while preserving most elements
- Limitation: May drift over many iterations without explicit constraints

**Nano Banana Pro:**
- Best for: Professional editing, character consistency, physics-based control
- Use when: You need the highest level of precision and realism
- Limitation: Requires most technical knowledge (angles, ratios, hex codes)

### Translation Workflow

1. **Define the Master Look** (see Global Style System document)
2. **Identify the primary model** for the current shot
3. **Translate the Master Look** using this Rosetta Stone
4. **Generate the shot**
5. **If switching models**, use the output as a reference image and translate the prompt
6. **Maintain consistency** by always referencing back to the Master Look definition

---

## CRITICAL INSIGHT

**The same visual concept requires different "languages" across models.** An AI agent must:
1. Understand the user's creative intent (the "what")
2. Translate it into the appropriate model-specific language (the "how")
3. Maintain a consistent "Master Look" definition that transcends individual model syntax

This Rosetta Stone enables that translation layer.
