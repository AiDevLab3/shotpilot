# Image Generation Models Guide: Complete Reference for Cinematic AI Filmmaking

**The Comprehensive Guide to AI Image Generation for Motion-Ready Stills**

_A deep-dive into the leading AI image generation models, with specific focus on creating motion-ready stills for cinematic video production. This guide provides model-specific prompting techniques, parameter references, workflow strategies, and use case recommendations._

**Author:** Manus AI  
**Date:** January 27, 2026  
**Version:** 4.0

---

## Table of Contents

1. [Introduction](#introduction)
2. [Midjourney v6.1: The Cinematic Powerhouse](#midjourney-v61-the-cinematic-powerhouse)
3. [Nano Banana Pro: The Reasoning-Guided Specialist](#nano-banana-pro-the-reasoning-guided-specialist)
4. [DALL-E 3 / GPT Image 1.5: The Natural Language Master](#dall-e-3--gpt-image-15-the-natural-language-master)
5. [Imagen 3: The Google Photorealism Engine](#imagen-3-the-google-photorealism-engine)
6. [Flux: The Open-Weight Alternative](#flux-the-open-weight-alternative)
7. [Model Comparison & Selection Guide](#model-comparison--selection-guide)
8. [Cross-Model Workflows](#cross-model-workflows)
9. [Integration with Video Generation](#integration-with-video-generation)

---

## Introduction

The **Image-First Workflow** is the foundation of professional AI filmmaking. Before generating a single frame of video, you must create a **Visual Bible**—a collection of motion-ready stills that establish your film's aesthetic, character designs, environments, and emotional tone. This guide provides comprehensive, model-specific instruction for mastering the five leading AI image generation platforms, with a specific focus on creating stills optimized for animation in AI video generators.

### Why Image Generation Matters for Video Production

**The Image-First Workflow Philosophy:**
1. **Visual Consistency:** Pre-generated stills ensure consistent character designs, environments, and aesthetic across all shots
2. **Motion Optimization:** Stills designed with animation in mind (balanced composition, clear subject separation, appropriate depth) animate more successfully
3. **Cost Efficiency:** Iterating on stills (fast, cheap) before video generation (slow, expensive) saves time and credits
4. **Creative Control:** Image models offer more precise control over composition, lighting, and style than video models
5. **Reference Management:** A Visual Bible of stills serves as reference material for video generation models (Veo Ingredients, Runway References, Kling Custom Face Models)

### The Five Models Covered in This Guide

| Model | Developer | Best For | Key Strength |
|-------|-----------|----------|--------------|
| **Midjourney v6.1** | Midjourney Inc. | Cinematic aesthetics, artistic control | Parameter-based fine-tuning |
| **Nano Banana Pro** | Google (via Higgsfield) | Photorealism, Higgsfield integration | Reasoning-guided synthesis |
| **DALL-E 3 / GPT Image 1.5** | OpenAI | Conversational prompting, creative concepts | Natural language understanding |
| **Imagen 3** | Google | Photorealism, text rendering | Google ecosystem integration |
| **Flux** | Black Forest Labs | Open-weight flexibility, API integration | Structured prompting framework |

---

## Midjourney v6.1: The Cinematic Powerhouse

Midjourney is the industry standard for high-quality, artistic, and cinematic AI image generation. Its v6.1 model is particularly well-suited for creating motion-ready stills due to its advanced photorealism, prompt adherence, and extensive parameter control.

### Technical Specifications

| Feature | Specification | Notes |
|---------|---------------|-------|
| **Model Version** | v6.1 | Latest and most advanced model (as of Jan 2026) |
| **Resolution** | 1024x1024 (default) | Upscalable to 2048x2048 or 4096x4096 |
| **Aspect Ratios** | Any ratio supported | Use `--ar` parameter (e.g., `--ar 16:9`) |
| **Prompting Style** | Natural language + parameters | Excels at interpreting descriptive, cinematic language |
| **Interface** | Discord bot, Web app | Web app recommended for beginners |
| **Pricing** | $10-$120/month | Based on Fast GPU time allocation |

### Core Parameters for Cinematic Realism

Midjourney's power lies in its **parameter system**—special codes added to the end of your prompt that control specific aspects of image generation.

#### Essential Parameters

| Parameter | Syntax | Description | Recommended Value for Cinematic Realism |
|-----------|--------|-------------|----------------------------------------|
| **Aspect Ratio** | `--ar <width>:<height>` | Sets the image dimensions | `--ar 16:9` for cinematic video, `--ar 2:3` for portrait shots |
| **Style** | `--style <value>` | Switches between Midjourney's aesthetic styles | `--style raw` for photorealism (removes artistic bias) |
| **Stylize** | `--s <value>` | Controls the strength of Midjourney's artistic interpretation | `50-150` for subtle, photorealistic results (default: 100) |
| **Chaos** | `--c <value>` | Controls variation in the initial grid of 4 images | `0-10` to maintain consistency (default: 0) |
| **Quality** | `--q <value>` | Controls rendering quality and time | `1` for best results (default), `2` for ultra-high quality (V6.1+) |
| **Version** | `--v <value>` | Specifies the model version | `6.1` for latest features |
| **No** | `--no <value>` | Excludes elements from the image | `--no text, watermark, blurry, distorted` |

#### Advanced Parameters

| Parameter | Syntax | Description | Use Case |
|-----------|--------|-------------|----------|
| **Seed** | `--seed <number>` | Sets a specific starting point for generation | Consistency across multiple images |
| **Tile** | `--tile` | Creates seamless repeating patterns | Background textures, environments |
| **Weird** | `--weird <value>` or `--w <value>` | Makes images quirky and unconventional | Experimental, surreal aesthetics (0-3000) |
| **Character Reference** | `--cref <URL>` | Uses a character from a reference image | Character consistency across shots |
| **Style Reference** | `--sref <URL>` | Matches the look and feel of another image | Aesthetic consistency |
| **Image Weight** | `--iw <value>` | Controls the impact of image prompts | 0.5-2 (default: 1) |

### The Ultimate Midjourney Prompt Template

```
[SCENE DESCRIPTION] --ar [ASPECT RATIO] --style [STYLE] --s [STYLIZATION] --c [CHAOS] --q [QUALITY] --v [VERSION] --no [NEGATIVE PROMPT]
```

**Example for Cinematic Realism:**
```
A cinematic wide shot of a lone astronaut standing on a desolate Martian landscape, the red sun setting on the horizon, casting long shadows across the rust-colored dunes. The astronaut's white spacesuit contrasts against the barren terrain. 35mm film still, grainy texture, anamorphic lens flare, atmospheric haze. --ar 16:9 --style raw --s 100 --c 5 --q 1 --v 6.1 --no text, watermark, blurry
```

### Midjourney Prompting Best Practices

#### 1. **Front-Load Important Elements**
Midjourney pays more attention to words at the beginning of your prompt. Structure your prompts as:
- **Shot type** (wide shot, close-up, medium shot)
- **Subject** (who or what)
- **Action** (what they're doing)
- **Environment** (where)
- **Lighting** (time of day, mood)
- **Camera/Film Stock** (35mm, anamorphic, etc.)
- **Style** (cinematic, documentary, etc.)

#### 2. **Use Cinematic Language**
Midjourney v6.1 understands film terminology:
- **Shot types:** "Wide shot," "Close-up," "Over-the-shoulder," "Dutch angle," "Bird's eye view"
- **Camera movement:** "Tracking shot," "Dolly zoom," "Handheld camera"
- **Lighting:** "Golden hour," "Rembrandt lighting," "Rim lighting," "Volumetric fog"
- **Film stocks:** "Shot on Kodak Vision3 500T," "35mm film grain," "Anamorphic bokeh"

#### 3. **Leverage Style Raw for Photorealism**
The `--style raw` parameter removes Midjourney's default artistic bias, resulting in more photorealistic images. Compare:
- **Without `--style raw`:** More artistic, painterly, stylized
- **With `--style raw`:** More photographic, realistic, grounded

#### 4. **Control Stylization for Realism**
The `--s` parameter controls how much "Midjourney aesthetic" is applied:
- `--s 0`: Maximum prompt adherence, minimal artistic interpretation
- `--s 50-150`: Balanced photorealism (recommended for cinematic stills)
- `--s 500-1000`: Highly artistic, stylized results

#### 5. **Use Character Reference for Consistency**
For multi-shot sequences with the same character:
```
[Your prompt] --cref [URL of character reference image] --cw [weight 0-100]
```
- `--cw 100`: Strong character consistency (face, hair, clothing)
- `--cw 50`: Moderate consistency (allows some variation)
- `--cw 0`: Only face consistency

### Motion-Ready Composition Techniques

When creating stills for video animation, follow these composition rules:

#### 1. **Subject Separation**
- **Clear foreground/background separation:** Ensures the video model can distinguish the subject from the environment
- **Avoid complex overlapping elements:** Simplifies motion tracking
- **Use depth of field:** Shallow depth (bokeh background) helps isolate subjects

#### 2. **Balanced Composition**
- **Rule of thirds:** Place key elements on intersecting gridlines
- **Negative space:** Leave room for motion (don't fill the entire frame)
- **Directional space:** If a character is looking/moving right, leave space on the right side of the frame

#### 3. **Lighting for Animation**
- **Consistent lighting direction:** Helps video models maintain lighting continuity during animation
- **Avoid extreme contrast:** High contrast can cause flickering in video generation
- **Volumetric elements:** Fog, mist, and atmospheric haze animate beautifully

### Midjourney Workflow for AI Filmmaking

**Step 1: Create Your Visual Bible**
Generate 10-20 reference images establishing:
- Character designs (multiple angles: front, profile, 3/4 view)
- Key environments (establishing shots)
- Lighting mood (time of day, atmosphere)
- Color palette (consistent tones across all images)

**Step 2: Refine with Variations**
Use Midjourney's **Vary (Strong)** and **Vary (Subtle)** buttons to iterate on promising images.

**Step 3: Upscale for Video**
Upscale your final images to 2048x2048 or higher for maximum quality when used as video generation inputs.

**Step 4: Export for Video Models**
- **For Veo 3.1:** Use as "Ingredients" (reference images)
- **For Runway Gen-4.5:** Use as "Image to Video" inputs
- **For Kling 2.6:** Use as first-frame references or Custom Face Model training data
- **For Higgsfield:** Use as Hero Frame inputs in Cinema Studio

---

## Nano Banana Pro: The Reasoning-Guided Specialist

Nano Banana Pro is Google's next-generation AI image generation model, built on the Gemini 3.0 Pro reasoning engine. Unlike traditional diffusion models, Nano Banana Pro uses **reasoning-guided synthesis**—it "thinks" about your prompt before rendering, ensuring logical consistency, physics-accurate lighting, and flawless text rendering.

### Technical Specifications

| Feature | Specification | Notes |
|---------|---------------|-------|
| **Model Version** | Nano Banana Pro (Gemini 3.0 Pro Image) | Successor to Nano Banana v1 (Gemini 2.5 Flash Image) |
| **Resolution** | Native 2K (2048x2048), upscales to 4K | 16-bit color pipeline |
| **Generation Speed** | Under 10 seconds | Fastest among professional models |
| **Aspect Ratios** | 1:1, 16:9, 4:3, 3:4, 9:16 | Supports all standard formats |
| **Interface** | Higgsfield Platform (web app) | Seamless integration with Higgsfield video tools |
| **Pricing** | Unlimited on Higgsfield Pro+ plans | No per-generation cost |

### Key Features

#### 1. **Reasoning-Guided Synthesis**
Nano Banana Pro's **GemPix 2 architecture** functions like a digital art director:
- **Pre-rendering analysis:** The Gemini 3.0 "brain" analyzes your prompt for semantic logic, physical causality, and emotional intent
- **Physics-aware rendering:** Fluids flow correctly, reflections map accurately, gravity affects objects realistically
- **Logical consistency:** Objects maintain proper spatial relationships and scale

#### 2. **Perfect Text Rendering**
Best-in-class ability to render legible text within images:
- **Multi-language support:** Complex scripts and characters (Latin, Cyrillic, Arabic, Chinese, Japanese, etc.)
- **Typography control:** Specify font families, styles, and placements
- **Orthographic accuracy:** Text is spelled correctly with proper grammar

#### 3. **Native 4K Fidelity**
- **2K native resolution:** Intelligently upscales to 4K clarity
- **16-bit color pipeline:** Richer color depth than standard 8-bit models
- **High dynamic range:** Better handling of bright highlights and deep shadows

#### 4. **Data Visualization**
Unique capability to generate accurate infographics, dashboard mockups, and presentation slides:
- **Spatial understanding:** Labels align perfectly with data points
- **Chart accuracy:** Generates realistic bar charts, line graphs, pie charts
- **UI mockups:** Creates believable interface designs

### Nano Banana Pro Prompting Framework

Nano Banana Pro uses a **six-variable prompting structure** for maximum control:

```
[SUBJECT] + [COMPOSITION] + [ACTION] + [LOCATION] + [STYLE] + [TECHNICAL DETAILS]
```

#### The Six Variables

1. **Subject:** Who or what is in the image? Be specific.
   - ❌ "A dog"
   - ✅ "A Shiba Inu with metallic plating and glowing blue eyes"

2. **Composition:** Direct the virtual camera.
   - "Macro lens for texture," "Isometric view from above," "Fisheye distortion," "Dutch angle"

3. **Action:** What is the movement? Static images are boring.
   - "Leaping across a rooftop gap," "Turning to face the camera," "Reaching for a glowing orb"

4. **Location:** Where is the scene? Establish the atmosphere.
   - "A neon-lit Tokyo back alley," "Inside a Victorian library," "On a windswept cliff at sunset"

5. **Style:** What is the medium? Dictate the artistic output.
   - "Vintage 1980s polaroid," "Cinematic film still," "Hyperrealistic digital art," "Documentary photography"

6. **Technical Details:** Camera gear, lighting, and rendering specs.
   - "Shot on Arri Alexa," "85mm lens, f/1.4," "Rembrandt lighting," "4K, HDR"

### Example Prompts

**Example 1: Character Portrait**
```
Close-up shot of a detective's face, rain-streaked, looking through a car window at night, neon city lights reflecting in the glass, shot on Kodak Vision3 500T film, cinematic, moody, shallow depth of field
```

**Example 2: Action Scene**
```
Wide shot of a samurai in red armor wearing a fierce red oni mask and a bloody headband, mid-leap with katana raised, cherry blossoms swirling around him, dramatic sunset lighting, shot on 35mm anamorphic lens, cinematic action photography
```

**Example 3: Environment**
```
Brutalist geometric balconies, repeating curved brick shapes, lush plants cascading down, black-and-white architectural photograph atmosphere, high contrast, sharp details, shot from low angle
```

### Nano Banana Pro Best Practices

#### 1. **Use Command-Line Style Syntax**
Remove polite phrases like "please" and "I would like." Be direct:
- ❌ "Please create an image of a futuristic city"
- ✅ "Futuristic city skyline, neon lights, flying cars, cyberpunk aesthetic, night scene"

#### 2. **Specify Text with Quotation Marks**
For text rendering, isolate string literals in double quotes:
```
A vintage movie poster with the text "THE LAST FRONTIER" in bold red letters at the top, and "Coming Soon" in smaller white text at the bottom, 1950s sci-fi aesthetic
```

#### 3. **Use Negative Constraints**
Define what to exclude to narrow the model's search space:
```
Ultra-detailed portrait of a woman, photorealistic, studio lighting, 85mm lens. Negative: blurry, distorted, cartoon, anime, low quality, watermark
```

#### 4. **Lock the Seed for Consistency**
Once you achieve a specific result, note the seed value and reuse it to generate a consistent series of images.

#### 5. **Leverage Multi-Image Fusion**
Nano Banana Pro can blend up to **14 separate input images** into a single, cohesive output:
- Upload multiple reference images (character face, clothing style, environment, lighting mood)
- Assign specific weight values to control influence of each image
- Model synthesizes a unified result maintaining unique characteristics of each input

### Integration with Higgsfield Video Generation

Nano Banana Pro is optimized for seamless integration with Higgsfield's video generation tools:

**Workflow:**
1. **Generate motion-ready stills** with Nano Banana Pro
2. **Use as Hero Frame** in Higgsfield Cinema Studio
3. **Animate with Veo 3.1, Kling 2.6, or Sora 2** (all available on Higgsfield Platform)
4. **Maintain character consistency** using the same Nano Banana Pro seed across multiple stills

---

## DALL-E 3 / GPT Image 1.5: The Natural Language Master

DALL-E 3 (and its successor, GPT Image 1.5) is OpenAI's flagship image generation model, integrated directly into ChatGPT. Its key strength is **natural language understanding**—it excels at interpreting long, detailed, conversational prompts and generating highly creative and diverse images.

### Technical Specifications

| Feature | Specification | Notes |
|---------|---------------|-------|
| **Model Version** | GPT Image 1.5 (latest), DALL-E 3 | GPT Image 1.5 released March 2025 |
| **Resolution** | 1024x1024, 1024x1792, 1792x1024 | Square, portrait, and landscape |
| **Generation Speed** | 10-30 seconds | Varies based on complexity |
| **Aspect Ratios** | 1:1, 9:16, 16:9 | Fixed ratios (no custom) |
| **Interface** | ChatGPT, OpenAI API | Conversational interface in ChatGPT |
| **Pricing** | Included with ChatGPT Plus ($20/month) | API: $0.040-0.080 per image |

### Key Features

#### 1. **Natural Language Understanding**
DALL-E 3 / GPT Image 1.5 understands complex, conversational prompts:
- **Long-form descriptions:** Write a detailed paragraph as if describing to a human artist
- **Contextual understanding:** Interprets relationships, emotions, and abstract concepts
- **Prompt refinement:** ChatGPT can help you refine your prompt before generation

#### 2. **Creative Concept Generation**
Excellent for generating unique and imaginative concepts:
- **Storyboarding:** Quickly iterate on visual ideas
- **Concept art:** Explore multiple design directions
- **Abstract ideas:** Translates metaphors and emotions into visuals

#### 3. **Image Analysis and Iteration**
GPT Image 1.5 can analyze and learn from user-uploaded images:
- **Reference-based generation:** Upload an image and ask for variations or similar styles
- **Seamless integration:** Details from uploaded images inform new generations
- **Iterative refinement:** Conversational back-and-forth to perfect results

#### 4. **Safety and Content Policy**
Strict content policies ensure responsible use:
- **No public figures:** Cannot generate images of real, named individuals
- **No harmful content:** Filters for violence, explicit content, etc.
- **Watermarking:** All images include invisible digital watermarks

### DALL-E 3 / GPT Image 1.5 Prompting Best Practices

#### 1. **Write Detailed Paragraphs**
Unlike Midjourney's parameter-based approach, DALL-E excels with natural language:

**Example:**
```
Create a photorealistic image of a 1920s jazz club. In the foreground, a woman in a flapper dress is laughing, holding a cocktail. She has short bobbed hair and pearl jewelry. In the background, a jazz band is playing on a small stage, with a saxophone player in the spotlight. The lighting is warm and smoky, with light filtering through the haze. The style should be reminiscent of a vintage photograph, with a slight sepia tone and soft focus around the edges.
```

#### 2. **Use Conversational Refinement**
In ChatGPT, you can iteratively refine your image:
- **First generation:** "Create an image of a futuristic city"
- **Refinement:** "Make the buildings taller and add more neon lights"
- **Further refinement:** "Change the time to night and add rain"

#### 3. **Specify Style and Mood**
DALL-E understands artistic styles and emotional tones:
- **Artistic styles:** "In the style of Edward Hopper," "Impressionist painting," "Film noir aesthetic"
- **Moods:** "Melancholic," "Joyful," "Mysterious," "Serene"

#### 4. **Leverage Image-to-Image**
GPT Image 1.5 can edit existing images based on text instructions:
- **Upload an image:** Provide a reference or starting point
- **Describe changes:** "Add a sunset in the background," "Change the character's clothing to a red dress"
- **Seamless modifications:** Model integrates changes naturally

### DALL-E 3 vs. GPT Image 1.5

| Feature | DALL-E 3 | GPT Image 1.5 |
|---------|----------|---------------|
| **Release Date** | October 2023 | March 2025 |
| **Prompt Understanding** | Excellent | Superior (multimodal context) |
| **Image Analysis** | No | Yes (can analyze uploaded images) |
| **Editing Capabilities** | Limited | Advanced (text-based editing) |
| **Generation Speed** | 15-30 seconds | 10-20 seconds |
| **Quality** | High | Higher (improved fidelity) |

### Use Cases for AI Filmmaking

**Best For:**
- **Storyboarding:** Quickly generate multiple scene concepts
- **Concept exploration:** Iterate on visual ideas in conversation with ChatGPT
- **Abstract concepts:** Translating emotions, metaphors, and themes into visuals
- **Character design exploration:** Generate multiple character variations

**Not Ideal For:**
- **Precise parameter control:** No equivalent to Midjourney's `--ar`, `--s`, etc.
- **Character consistency:** Harder to maintain exact character appearance across multiple images
- **Photorealism:** Generally more stylized than Midjourney or Nano Banana Pro

---

## Imagen 3: The Google Photorealism Engine

Imagen 3 is Google's flagship image generation model, known for its **photorealism**, **text rendering**, and deep integration with the Google ecosystem (Gemini, Vertex AI).

### Technical Specifications

| Feature | Specification | Notes |
|---------|---------------|-------|
| **Model Version** | Imagen 3 | Released August 2024 |
| **Resolution** | Up to 2048x2048 | High-resolution outputs |
| **Aspect Ratios** | 1:1, 16:9, 4:3, 3:4, 9:16 | Supports multiple formats |
| **Interface** | Gemini (AI Studio), Vertex AI | Google ecosystem integration |
| **Pricing** | Free tier available, paid tiers for high volume | API pricing via Vertex AI |

### Key Features

#### 1. **Photorealism**
Imagen 3 generates highly realistic and detailed images:
- **Texture detail:** Exceptional rendering of skin, fabric, metal, etc.
- **Lighting accuracy:** Realistic shadows, reflections, and highlights
- **Color fidelity:** Natural color reproduction

#### 2. **Best-in-Class Text Rendering**
Imagen 3 excels at rendering text accurately within images:
- **Legible typography:** Text is sharp and readable
- **Proper spelling:** Minimal text errors
- **Multi-language support:** Supports various scripts and languages

#### 3. **Google Ecosystem Integration**
- **Gemini integration:** Generate images directly in Gemini conversations
- **Vertex AI:** Enterprise-grade API access with custom training
- **Google Workspace:** Potential integration with Docs, Slides, etc.

#### 4. **Safety and Watermarking**
- **SynthID watermarking:** Invisible digital watermarks for provenance tracking
- **Content filtering:** Strict safety policies
- **User-configurable safety settings:** Adjust filtering levels

### Imagen 3 Prompting Best Practices

#### 1. **Use Detailed, Descriptive Prompts**
Similar to DALL-E 3, Imagen 3 responds well to detailed descriptions:

**Example:**
```
A macro photograph of a single drop of water hitting the surface of a still pond, creating perfect concentric ripples. The lighting is soft and diffused, coming from the side. The background is a dark, out-of-focus green. The image should be incredibly sharp and detailed, with visible texture on the water's surface.
```

#### 2. **Specify Camera and Lighting Keywords**
Imagen 3 understands photography terminology:
- **Camera angles:** "Macro," "Wide-angle," "Telephoto," "Bird's eye view"
- **Lighting:** "Golden hour," "Soft diffused light," "Harsh shadows," "Backlit"

#### 3. **Leverage Text Rendering**
For images with text (posters, signs, UI mockups):
```
A vintage movie poster for a 1950s sci-fi film. The title "INVASION FROM MARS" is written in bold red letters at the top. Below, a flying saucer hovers over a city skyline. At the bottom, the text "Coming to theaters this summer" in smaller white letters. Retro aesthetic, vibrant colors.
```

### Use Cases for AI Filmmaking

**Best For:**
- **Product shots:** Photorealistic rendering of objects
- **Images with text:** Posters, signs, UI elements
- **Realistic environments:** Landscapes, interiors, architectural shots
- **Google ecosystem workflows:** If you're already using Gemini or Vertex AI

**Not Ideal For:**
- **Artistic stylization:** Less flexible than Midjourney for non-photorealistic styles
- **Parameter control:** No equivalent to Midjourney's extensive parameter system

---

## Flux: The Open-Weight Alternative

Flux is a family of open-weight image generation models developed by **Black Forest Labs** (founded by former Stability AI researchers). Flux models are available in multiple versions (Pro, Dev, Schnell) and can be run locally or via API.

### Technical Specifications

| Model | Resolution | Speed | Quality | Use Case |
|-------|------------|-------|---------|----------|
| **Flux Pro** | Up to 2048x2048 | Slow (60-120s) | Highest | Professional work, final outputs |
| **Flux Dev** | Up to 2048x2048 | Medium (20-40s) | High | Development, iteration |
| **Flux Schnell** | Up to 1024x1024 | Fast (5-10s) | Good | Rapid prototyping, concept exploration |

### Key Features

#### 1. **Open-Weight Architecture**
- **Local deployment:** Run on your own hardware (requires high-end GPU)
- **API access:** Available via Black Forest Labs API, Replicate, Hugging Face
- **Customization:** Fine-tune models for specific use cases

#### 2. **Structured Prompting Framework**
Flux uses a clear, structured prompting approach:
```
Subject + Action + Style + Context
```

#### 3. **No Negative Prompts Required**
Flux is designed to work without negative prompts—describe what you **want**, not what you **don't want**:
- ❌ "No crowds, no text, no blur"
- ✅ "Peaceful solitude, clear focus, sharp details"

#### 4. **Professional Photography Control**
Flux understands camera terminology:
- **Aperture (f-numbers):** `f/1.4` (blurry background), `f/8` (sharp background)
- **Focal length (mm):** `24mm` (wide scene), `85mm` (zoomed in)
- **Lighting:** "Rembrandt lighting," "Golden hour," "Studio lighting"

### Flux Prompting Framework

**Basic Structure:**
```
[Subject] + [Action] + [Style] + [Context]
```

**Example:**
```
Red fox sitting in tall grass, wildlife documentary photography, misty dawn
```

**Enhanced Structure (with layers):**
```
[Foundation] + [Visual Layer] + [Technical Layer] + [Atmospheric Layer]
```

**Example:**
```
An astronaut with silver spacesuit floating gracefully outside the International Space Station, cinematic photography with dramatic lighting, bathed in golden sunlight, deep blue Earth tones, shallow depth of field, 85mm lens, conveying wonder and achievement
```

### Flux Prompting Best Practices

#### 1. **Front-Load Important Elements**
Flux pays more attention to words at the beginning of your prompt:
- **Priority order:** Main subject → Key action → Critical style → Essential context → Secondary details

#### 2. **Use Structured Descriptions**
Use natural language for relationships, but direct specifications for technical elements:
```
Human explorer in futuristic gear walking through cyberpunk forest, dramatic atmospheric lighting, sci-fi fantasy art style, cinematic composition
```

#### 3. **Optimal Prompt Length**
- **Short (10-30 words):** Quick concepts and style exploration
- **Medium (30-80 words):** Usually ideal for most projects
- **Long (80+ words):** Complex scenes requiring detailed specifications

#### 4. **Avoid Negative Prompts**
Instead of saying what you don't want, describe what you **do** want:
- Instead of "no crowds," write "peaceful solitude"
- Instead of "without glasses," write "clear, unobstructed eyes"

### Use Cases for AI Filmmaking

**Best For:**
- **API integration:** Developers building custom workflows
- **Local deployment:** Users with high-end GPUs who want full control
- **Open-source projects:** Customization and fine-tuning
- **Rapid iteration:** Flux Schnell for fast concept exploration

**Not Ideal For:**
- **Beginners:** Requires more technical knowledge than web-based tools
- **Non-technical users:** No user-friendly web interface (unless using third-party platforms)

---

## Model Comparison & Selection Guide

### Quick Comparison Table

| Model | Photorealism | Artistic Control | Speed | Text Rendering | Character Consistency | Ease of Use | Price |
|-------|--------------|------------------|-------|----------------|----------------------|-------------|-------|
| **Midjourney v6.1** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | $10-120/mo |
| **Nano Banana Pro** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Unlimited |
| **DALL-E 3 / GPT Image** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | $20/mo |
| **Imagen 3** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | Free tier |
| **Flux** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | Open-weight |

### When to Use Which Model

#### **Use Midjourney v6.1 when:**
- You need **cinematic aesthetics** and artistic control
- You want **extensive parameter-based fine-tuning**
- You're creating a **Visual Bible** for a film project
- You need **character consistency** across multiple shots (using `--cref`)
- You value **community and inspiration** (Midjourney's Discord and web gallery)

#### **Use Nano Banana Pro when:**
- You need **photorealism** with **reasoning-guided synthesis**
- You're working within the **Higgsfield ecosystem** (seamless video integration)
- You need **perfect text rendering** (posters, signs, UI mockups)
- You want **unlimited generations** (included in Higgsfield Pro+ plans)
- You need **fast generation** (under 10 seconds)

#### **Use DALL-E 3 / GPT Image 1.5 when:**
- You prefer **conversational prompting** (natural language)
- You're **storyboarding** or exploring concepts
- You need **image analysis and editing** (GPT Image 1.5)
- You're already using **ChatGPT** for other tasks
- You want **creative, imaginative** results

#### **Use Imagen 3 when:**
- You need **photorealism** with **best-in-class text rendering**
- You're working within the **Google ecosystem** (Gemini, Vertex AI)
- You need **product shots** or **realistic environments**
- You want **free tier access** for experimentation

#### **Use Flux when:**
- You need **open-weight models** for customization
- You're building **custom workflows** via API
- You want **local deployment** (full control, no cloud dependency)
- You're a **developer** integrating image generation into applications

---

## Cross-Model Workflows

### Workflow 1: Midjourney + Nano Banana Pro
**Use Case:** Artistic concept (Midjourney) → Photorealistic refinement (Nano Banana Pro)

1. **Generate artistic concept** in Midjourney with `--style raw`
2. **Download and analyze** the result
3. **Upload to Nano Banana Pro** as a reference image
4. **Refine with detailed prompt** for photorealistic output

### Workflow 2: DALL-E 3 + Midjourney
**Use Case:** Storyboarding (DALL-E 3) → Final production stills (Midjourney)

1. **Brainstorm concepts** in ChatGPT with DALL-E 3
2. **Select best concepts** from rapid iterations
3. **Recreate in Midjourney** with precise parameters for final quality

### Workflow 3: Flux + Higgsfield
**Use Case:** Local generation (Flux) → Video animation (Higgsfield)

1. **Generate stills locally** with Flux Dev
2. **Upload to Higgsfield** as Hero Frames
3. **Animate with Veo 3.1, Kling 2.6, or Sora 2**

---

## Integration with Video Generation

### From Image to Video: The Complete Workflow

**Phase 0: Image Generation (This Guide)**
1. Choose your image model based on use case
2. Generate motion-ready stills (Visual Bible)
3. Refine and upscale final images

**Phase 1: Video Generation (See Video Generation Guide)**
4. Use images as inputs for video models:
   - **Veo 3.1:** "Ingredients to Video"
   - **Runway Gen-4.5:** "Image to Video"
   - **Kling 2.6:** First-frame reference or Custom Face Model training
   - **Seedance 1.5 Pro:** Reference images for lip-sync
   - **Higgsfield:** Hero Frame in Cinema Studio

**Phase 2: Character Consistency (See Character Consistency Guide)**
5. Maintain character appearance across multiple shots using:
   - **Veo:** Ingredients (character reference images)
   - **Runway:** References panel
   - **Kling:** Custom Face Models
   - **Seedance:** Reference images
   - **Higgsfield:** Hero Frame + Soul ID

### Best Practices for Motion-Ready Stills

1. **Aspect Ratio:** Match your target video format (16:9 for cinematic, 9:16 for vertical)
2. **Composition:** Leave space for motion (don't fill the entire frame)
3. **Lighting:** Consistent lighting direction across all stills
4. **Subject Separation:** Clear foreground/background distinction
5. **Resolution:** Generate at highest quality (2K-4K) for video upscaling

---

## Conclusion

Mastering AI image generation is the **foundation of professional AI filmmaking**. By understanding the strengths, weaknesses, and specific prompting techniques of each model, you can create a comprehensive Visual Bible that ensures consistency, quality, and creative control throughout your video production pipeline.

**Key Takeaways:**
- **Midjourney v6.1** is the industry standard for cinematic aesthetics and artistic control
- **Nano Banana Pro** offers reasoning-guided photorealism with seamless Higgsfield integration
- **DALL-E 3 / GPT Image 1.5** excels at conversational prompting and creative exploration
- **Imagen 3** provides best-in-class text rendering and Google ecosystem integration
- **Flux** offers open-weight flexibility for developers and advanced users

**Next Steps:**
1. Experiment with each model to understand their unique characteristics
2. Build your Visual Bible using the model(s) best suited to your project
3. Proceed to the **Video Generation Guide** to animate your stills
4. Consult the **Character Consistency Guide** for multi-shot workflows

---

## References

[1] Midjourney Documentation. (2026). *Parameter List*. Retrieved from https://docs.midjourney.com/hc/en-us/articles/32859204029709-Parameter-List

[2] Higgsfield AI. (2026). *Nano Banana Pro: 4K AI Image Generator*. Retrieved from https://higgsfield.ai/nano-banana-2-intro

[3] Higgsfield AI. (2026). *Nano Banana Pro Prompt Guide*. Retrieved from https://higgsfield.ai/nano-banana-pro-prompt-guide

[4] OpenAI. (2025). *Introducing 4o Image Generation*. Retrieved from https://openai.com/index/introducing-4o-image-generation/

[5] Google Cloud. (2024). *Imagen 3 on Vertex AI*. Retrieved from https://cloud.google.com/blog/products/ai-machine-learning/a-developers-guide-to-imagen-3-on-vertex-ai

[6] Black Forest Labs. (2026). *Prompting Guide - Text to Image*. Retrieved from https://docs.bfl.ai/guides/prompting_summary

---

**End of Image Generation Models Guide**
