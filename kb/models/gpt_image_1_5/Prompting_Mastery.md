# GPT Image 1.5 Prompting Mastery Guide

**Model:** GPT Image 1.5 (gpt-image-1.5)  
**Developer:** OpenAI  
**Type:** Natively Multimodal Large Language Model with Image Generation  
**Release:** December 2025  

---

## Table of Contents

1. [Overview & Key Capabilities](#overview--key-capabilities)
2. [Technical Specifications](#technical-specifications)
3. [Prompting Fundamentals](#prompting-fundamentals)
4. [Text-to-Image Generation](#text-to-image-generation)
5. [Image Editing & Transformation](#image-editing--transformation)
6. [Advanced Techniques](#advanced-techniques)
7. [Best Practices by Use Case](#best-practices-by-use-case)
8. [Common Mistakes & Troubleshooting](#common-mistakes--troubleshooting)
9. [Integration with AI Filmmaking Workflow](#integration-with-ai-filmmaking-workflow)

---

## Overview & Key Capabilities

GPT Image 1.5 represents a fundamental shift in image generation technology. Unlike specialized image models (DALL-E 2/3, Midjourney, Stable Diffusion), **GPT Image 1.5 is a natively multimodal large language model** that can understand text and images simultaneously, leveraging its broad world knowledge to generate images with superior instruction following and contextual awareness.

### **Core Strengths**

1. **High-Fidelity Photorealism**
   - Natural lighting with accurate materials and rich color rendering
   - Real texture (pores, wrinkles, fabric wear, imperfections)
   - Believable physics and environmental interactions

2. **World Knowledge & Reasoning**
   - Understands context without explicit instructions (e.g., "Bethel, NY, August 1969" → Woodstock imagery)
   - Accurate depictions of real-world objects, environments, scenarios
   - Can infer appropriate details from minimal prompts

3. **Robust Text Rendering**
   - Crisp lettering with consistent layout
   - Strong contrast and readability
   - Reliable typography for infographics, logos, marketing materials

4. **Identity & Facial Preservation**
   - Maintains character consistency across edits
   - Preserves facial features in multi-step workflows
   - Excellent for character-driven storytelling

5. **Complex Structured Visuals**
   - Infographics, diagrams, multi-panel compositions
   - UI mockups with functional layouts
   - Comic strips and storyboards

6. **Precise Style Control**
   - Minimal prompting required for style transfer
   - Supports branded design systems to fine-art styles
   - Consistent aesthetic across iterations

7. **Flexible Quality-Latency Tradeoffs**
   - `quality="low"` for fast generation (still exceeds prior-generation models)
   - `quality="high"` for production-quality visuals
   - Optimized for both high-volume and detail-critical use cases

---

## Technical Specifications

### **API Access**

**Endpoints:**
- **Responses API** (recommended): Analyze images and/or generate images as output
- **Images API**: Generate images as output, optionally using images as input
- **Chat Completions API**: Analyze images and generate text/audio (no image output)

**Model Names:**
- `gpt-image-1.5` (state of the art)
- `gpt-image-1` (previous generation)
- `gpt-image-1-mini` (faster, lower cost)

### **Parameters**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `model` | string | Model identifier | Required |
| `prompt` | string | Text description of desired image | Required |
| `image` | file/URL | Input image(s) for editing | Optional |
| `quality` | string | `"low"` or `"high"` | `"high"` |
| `n` | integer | Number of variations to generate (1-10) | 1 |
| `size` | string | Output dimensions (e.g., `"1024x1024"`) | `"1024x1024"` |
| `response_format` | string | `"url"` or `"b64_json"` | `"url"` |

### **Input Formats**

**Image Inputs:**
- Fully qualified URL to image file
- Base64-encoded data URL
- File ID (created with Files API)
- Multiple images per request (each counts as tokens)

**Image Token Calculation:**
- Shortest side scaled to 512px
- Base cost: 65 tokens (low fidelity) or 129 tokens (high fidelity)
- Additional tokens based on aspect ratio:
  - Square: +4160 tokens
  - Portrait/Landscape: +6240 tokens

### **Output Formats**

- **Sizes:** 256x256, 512x512, 1024x1024, 1024x1792, 1792x1024
- **Format:** PNG (via URL or Base64)
- **Quality:** Low (fast) or High (production)

---

## Prompting Fundamentals

### **1. Structure + Goal**

Write prompts in a consistent order:

```
[Background/Scene] → [Subject] → [Key Details] → [Constraints]
```

**Include the intended use** to set the "mode" and level of polish:
- "for a social media ad"
- "UI mockup for a mobile app"
- "infographic for students"
- "photorealistic product shot"

**For complex requests**, use short labeled segments or line breaks instead of one long paragraph:

```
Scene: Cozy coffee shop interior, warm afternoon light
Subject: Barista making latte art, focused expression
Details: Steam rising, espresso machine in background, wooden counter
Style: Photorealistic, shot on 35mm film, shallow depth of field
Constraints: No watermarks, no text, natural color balance
```

### **2. Specificity + Quality Cues**

**Be concrete about:**
- Materials (leather, brushed steel, velvet, aged wood)
- Shapes (geometric, organic, angular, flowing)
- Textures (rough, smooth, glossy, matte)
- Visual medium (photo, watercolor, 3D render, pencil sketch)

**Add targeted "quality levers" only when needed:**
- `film grain` (for analog feel)
- `textured brushstrokes` (for painterly styles)
- `macro detail` (for close-up texture)

**For photorealism**, camera/composition terms work better than generic "8K/ultra-detailed":
- Lens: `50mm lens`, `wide-angle 24mm`, `telephoto 85mm`
- Aperture feel: `shallow depth of field (f/1.8)`, `deep focus (f/11)`
- Lighting: `soft diffuse light`, `golden hour`, `high-contrast studio lighting`

### **3. Latency vs. Fidelity**

**Start with `quality="low"`** for:
- Latency-sensitive applications
- High-volume generation
- Rapid iteration/prototyping

**Use `quality="high"`** for:
- Production-quality final outputs
- Dense layouts with heavy text
- Detail-critical visuals (product shots, portraits)

In many cases, `quality="low"` provides sufficient fidelity with significantly faster generation.

### **4. Composition**

**Specify framing and viewpoint:**
- `close-up`, `medium shot`, `wide shot`, `extreme close-up`
- `top-down view`, `bird's eye view`, `worm's eye view`

**Specify perspective/angle:**
- `eye-level`, `low-angle`, `high-angle`, `Dutch angle`

**Specify lighting/mood:**
- `soft diffuse light`, `golden hour`, `high-contrast`, `dramatic side lighting`
- `overcast`, `backlit`, `rim lighting`

**If layout matters, call out placement:**
- "logo top-right"
- "subject centered with negative space on left"
- "text overlaid on bottom third"

### **5. Constraints (What to Change vs. Preserve)**

**State exclusions explicitly:**
- "no watermark"
- "no extra text"
- "no logos or trademarks"
- "no people in background"

**For edits, use "change only X" + "keep everything else the same":**

```
Change only the lighting to golden hour sunset.
Keep the subject, composition, and background exactly the same.
```

**Repeat the preserve list on each iteration** to reduce drift:

```
Iteration 1: Add warm color grading. Preserve subject, pose, background.
Iteration 2: Increase contrast slightly. Preserve subject, pose, background, warm color grading.
```

### **6. Text in Images**

**Put literal text in quotes or ALL CAPS:**

```
Create a poster with the text "FIELD & FLOUR" in bold serif font at the top.
```

**Specify typography details:**
- Font style (serif, sans-serif, script, monospace)
- Size (large headline, small caption)
- Color (white, black, brand color #FF5733)
- Placement (centered, top-left, overlaid on image)

**For tricky words** (brand names, uncommon spellings), **spell them out letter-by-letter**:

```
Brand name: H-I-G-G-S-F-I-E-L-D (all caps, sans-serif, centered)
```

### **7. Multi-Image Inputs**

**Reference each input by index and description:**

```
Image 1: Product photo of red sneaker on white background
Image 2: Style reference showing watercolor painting aesthetic

Apply Image 2's watercolor style to Image 1's sneaker while preserving the product's shape and color.
```

**When compositing, be explicit about which elements move where:**

```
Image 1: Photo of a bird in flight
Image 2: Photo of an elephant in a savanna

Place the bird from Image 1 onto the back of the elephant in Image 2. 
Keep the elephant's environment and lighting. Match the bird's lighting to the scene.
```

### **8. Iterate Instead of Overloading**

**Start with a clean base prompt**, then refine with small, single-change follow-ups:

```
Base: "Photorealistic portrait of a chef in a restaurant kitchen"
Iteration 1: "Make the lighting warmer"
Iteration 2: "Remove the extra pot on the stove"
Iteration 3: "Restore the original background"
```

**Use references like "same style as before" or "the subject"** to leverage context, but **re-specify critical details if they start to drift**.

---

## Text-to-Image Generation

### **Use Case 1: Infographics**

**Purpose:** Explain structured information for specific audiences (students, executives, customers)

**Best Practices:**
- Use `quality="high"` for dense layouts or heavy text
- Specify audience and purpose in prompt
- Call out hierarchy (headlines, subheadings, captions)
- Request specific layout (grid, flowchart, timeline)

**Example Prompt:**

```python
prompt = """
Create a detailed infographic explaining the water cycle for middle school students.
Include labeled diagrams showing: evaporation, condensation, precipitation, collection.
Use a clean, educational style with bright colors and clear arrows showing flow.
Title at top: "THE WATER CYCLE"
Simple icons for each stage, easy-to-read sans-serif labels.
"""

result = client.images.generate(
    model="gpt-image-1.5",
    prompt=prompt,
    quality="high"
)
```

### **Use Case 2: Photorealistic Images**

**Purpose:** Believable, natural-looking photographs

**Best Practices:**
- Prompt as if a real photo is being captured in the moment
- Use photography language (lens, lighting, framing)
- Explicitly ask for real texture (pores, wrinkles, fabric wear, imperfections)
- Avoid words that imply studio polish or staging
- Use `quality="high"` when detail matters

**Example Prompt:**

```python
prompt = """
Photorealistic candid photograph of a street musician playing violin in a subway station.
Medium shot at eye level, 50mm lens, shallow depth of field (f/2.0).
Natural subway lighting with warm tungsten tones, slight motion blur on bow.
Weathered hands, worn instrument case with coins, authentic street performer aesthetic.
Shot on 35mm film, subtle grain, honest and unposed.
No glamorization, no heavy retouching.
"""

result = client.images.generate(
    model="gpt-image-1.5",
    prompt=prompt,
    quality="high"
)
```

### **Use Case 3: World Knowledge**

**Purpose:** Leverage GPT Image's reasoning to infer context

**Best Practices:**
- Provide minimal but specific context (location, date, event)
- Let the model infer appropriate details
- Trust the model's world knowledge

**Example Prompt:**

```python
prompt = """
Create a realistic outdoor crowd scene in Bethel, New York on August 16, 1969.
Photorealistic, period-accurate clothing, staging, and environment.
"""

result = client.images.generate(
    model="gpt-image-1.5",
    prompt=prompt
)
# Model infers Woodstock and generates appropriate imagery
```

### **Use Case 4: Logo Generation**

**Purpose:** Original, scalable brand marks

**Best Practices:**
- Describe brand personality and use case
- Request clean, vector-like shapes
- Emphasize simplicity and scalability
- Specify "no watermark" and "plain background"
- Use `n` parameter to generate multiple variations

**Example Prompt:**

```python
prompt = """
Create an original, non-infringing logo for a company called "Peak Performance", a fitness coaching brand.
The logo should feel energetic, modern, and aspirational.
Use clean, vector-like shapes with a strong silhouette and balanced negative space.
Favor simplicity over detail so it reads clearly at small and large sizes.
Flat design, minimal strokes, no gradients unless essential.
Plain white background. Single centered logo with generous padding. No watermark.
"""

result = client.images.generate(
    model="gpt-image-1.5",
    prompt=prompt,
    n=4  # Generate 4 variations
)
```

### **Use Case 5: Story-to-Comic Strip**

**Purpose:** Multi-panel visual narratives

**Best Practices:**
- Specify panel count and layout
- Describe each panel's content sequentially
- Maintain consistent character descriptions across panels
- Request clear panel borders

**Example Prompt:**

```python
prompt = """
Create a 4-panel comic strip showing a cat's adventure.
Layout: 4 horizontal panels in a row with clear black borders.

Panel 1: Orange tabby cat sleeping on a windowsill, peaceful expression
Panel 2: Cat suddenly alert, ears perked, looking at a butterfly outside
Panel 3: Cat leaping off windowsill mid-air, paws outstretched
Panel 4: Cat tangled in curtains, sheepish expression, butterfly flying away

Consistent character design across all panels. Clean line art, bright colors, comic book style.
"""

result = client.images.generate(
    model="gpt-image-1.5",
    prompt=prompt
)
```

### **Use Case 6: UI Mockups**

**Purpose:** Interface design concepts

**Best Practices:**
- Specify device type and screen size
- Describe layout structure (header, sidebar, content area)
- Call out specific UI elements (buttons, forms, navigation)
- Request clean, functional design

**Example Prompt:**

```python
prompt = """
Create a mobile app UI mockup for a meditation app.
iPhone screen size, clean modern design.

Layout:
- Top: Gradient header (soft purple to blue) with app name "Calm Mind"
- Center: Large circular timer showing "10:00" with play button
- Below timer: Three meditation type buttons (Breathing, Body Scan, Sleep)
- Bottom: Navigation bar with 5 icons (Home, Library, Timer, Profile, Settings)

Minimalist aesthetic, generous white space, rounded corners, soft shadows.
"""

result = client.images.generate(
    model="gpt-image-1.5",
    prompt=prompt
)
```

---

## Image Editing & Transformation

### **Use Case 1: Style Transfer**

**Purpose:** Apply artistic style to existing image

**Best Practices:**
- Provide reference image and target style
- Specify what to preserve (subject, composition, layout)
- Use "apply X style to Y" language

**Example Prompt:**

```python
prompt = """
Image 1: Product photo of leather jacket
Image 2: Van Gogh's Starry Night painting

Apply the swirling brushstroke style and color palette of Image 2 to Image 1.
Preserve the jacket's shape, form, and recognizability.
Transform the background into Van Gogh-style swirls.
"""

result = client.images.edit(
    model="gpt-image-1.5",
    image=[
        open("jacket.png", "rb"),
        open("starry_night.jpg", "rb")
    ],
    prompt=prompt
)
```

### **Use Case 2: Object Removal**

**Purpose:** Remove unwanted elements from image

**Best Practices:**
- Specify exactly what to remove
- Request seamless fill that matches surrounding area
- Preserve everything else explicitly

**Example Prompt:**

```python
prompt = """
Remove the power lines from the sky in this landscape photo.
Fill the removed areas with natural sky that matches the existing clouds and color.
Keep the landscape, trees, and all other elements exactly as they are.
"""

result = client.images.edit(
    model="gpt-image-1.5",
    image=open("landscape.jpg", "rb"),
    prompt=prompt
)
```

### **Use Case 3: Lighting & Weather Transformation**

**Purpose:** Change environmental conditions

**Best Practices:**
- Specify target lighting/weather condition
- Preserve subject and composition
- Request physically accurate changes (shadows, reflections, color temperature)

**Example Prompt:**

```python
prompt = """
Transform this daytime street scene to golden hour sunset.
Change the lighting to warm, low-angle sunlight with long shadows.
Adjust sky to orange/pink sunset colors.
Update reflections in windows and puddles to match new lighting.
Keep all subjects, buildings, and composition exactly the same.
"""

result = client.images.edit(
    model="gpt-image-1.5",
    image=open("street_day.jpg", "rb"),
    prompt=prompt
)
```

### **Use Case 4: Virtual Try-On**

**Purpose:** Place clothing/accessories on person

**Best Practices:**
- Provide clear product image and person image
- Specify fit and placement
- Request realistic shadows, wrinkles, and draping

**Example Prompt:**

```python
prompt = """
Image 1: Person standing in neutral pose
Image 2: Red leather jacket product shot

Place the red jacket from Image 2 onto the person in Image 1.
Ensure realistic fit, natural wrinkles and folds in the fabric.
Match lighting and shadows to Image 1's environment.
Preserve the person's pose, face, and background.
"""

result = client.images.edit(
    model="gpt-image-1.5",
    image=[
        open("person.jpg", "rb"),
        open("jacket_product.jpg", "rb")
    ],
    prompt=prompt
)
```

### **Use Case 5: Translation in Images**

**Purpose:** Localize designs into other languages

**Best Practices:**
- Specify target language
- Explicitly state "do not change any other aspect"
- Preserve typography style, placement, spacing

**Example Prompt:**

```python
prompt = """
Translate all text in this infographic to Spanish.
Preserve the exact layout, typography style, colors, icons, and imagery.
Do not change any other aspect of the image.
"""

result = client.images.edit(
    model="gpt-image-1.5",
    image=open("infographic_english.png", "rb"),
    prompt=prompt
)
```

---

## Advanced Techniques

### **1. Character Consistency Across Multiple Images**

**Challenge:** Maintaining the same character across different scenes

**Solution:** Use reference image + detailed character description

```python
# Step 1: Generate hero character
prompt_hero = """
Create a character design: young woman, age 25, shoulder-length curly brown hair,
green eyes, freckles, wearing casual jeans and white t-shirt.
Full body shot, neutral pose, white background, character sheet style.
"""

hero_image = client.images.generate(model="gpt-image-1.5", prompt=prompt_hero)

# Step 2: Use hero image as reference for Scene 1
prompt_scene1 = """
Image 1: Character reference (the young woman)

Place this character in a coffee shop, sitting at a table with laptop.
Maintain her exact appearance: curly brown hair, green eyes, freckles, white t-shirt, jeans.
Natural coffee shop lighting, candid moment, photorealistic.
"""

scene1 = client.images.edit(
    model="gpt-image-1.5",
    image=hero_image,
    prompt=prompt_scene1
)

# Step 3: Use hero image as reference for Scene 2
prompt_scene2 = """
Image 1: Character reference (the young woman)

Place this character walking in a park, holding coffee cup.
Maintain her exact appearance: curly brown hair, green eyes, freckles, white t-shirt, jeans.
Golden hour lighting, natural outdoor setting, photorealistic.
"""

scene2 = client.images.edit(
    model="gpt-image-1.5",
    image=hero_image,
    prompt=prompt_scene2
)
```

### **2. Iterative Refinement Without Drift**

**Challenge:** Making multiple edits without losing original quality

**Solution:** Re-specify critical details in each iteration

```python
# Base image
base_prompt = "Photorealistic portrait of chef in restaurant kitchen, neutral lighting"
base = client.images.generate(model="gpt-image-1.5", prompt=base_prompt)

# Iteration 1: Lighting
iter1_prompt = """
Make the lighting warmer with golden tones.
Preserve: chef's face, pose, expression, kitchen background, composition.
"""
iter1 = client.images.edit(model="gpt-image-1.5", image=base, prompt=iter1_prompt)

# Iteration 2: Background
iter2_prompt = """
Blur the background slightly for shallow depth of field effect.
Preserve: chef's face, pose, expression, warm golden lighting, composition.
"""
iter2 = client.images.edit(model="gpt-image-1.5", image=iter1, prompt=iter2_prompt)

# Iteration 3: Final touch
iter3_prompt = """
Add subtle film grain for analog feel.
Preserve: chef's face, pose, expression, warm golden lighting, blurred background, composition.
"""
final = client.images.edit(model="gpt-image-1.5", image=iter2, prompt=iter3_prompt)
```

### **3. Multi-Image Compositing**

**Challenge:** Combining elements from multiple source images

**Solution:** Explicit element-by-element instructions

```python
prompt = """
Image 1: Sunset beach scene
Image 2: Person jumping mid-air
Image 3: Flock of birds flying

Composite these images:
1. Use Image 1 (beach) as the base background
2. Place the jumping person from Image 2 in the center foreground
3. Add the birds from Image 3 in the upper right sky
4. Match all lighting to the sunset in Image 1 (warm, golden, low angle)
5. Ensure shadows and reflections are consistent with sunset lighting
6. Blend all elements seamlessly
"""

result = client.images.edit(
    model="gpt-image-1.5",
    image=[
        open("beach.jpg", "rb"),
        open("jumping_person.jpg", "rb"),
        open("birds.jpg", "rb")
    ],
    prompt=prompt
)
```

### **4. Precision Edits with Masks (Conceptual)**

**Challenge:** Editing only specific regions

**Solution:** Use descriptive language to define edit zones

```python
prompt = """
In this living room photo:
- Change ONLY the wall color from white to sage green
- Keep the furniture, floor, ceiling, lighting, and all other elements exactly the same
- Ensure the new wall color looks natural with realistic paint texture
- Preserve shadows and lighting on the walls
"""

result = client.images.edit(
    model="gpt-image-1.5",
    image=open("living_room.jpg", "rb"),
    prompt=prompt
)
```

---

## Best Practices by Use Case

### **Cinematic Stills for Video Generation**

**Goal:** Generate hero frames for image-to-video animation

**Best Practices:**
1. **Use photorealistic prompting** with camera language
2. **Specify composition** that allows for motion (negative space, clear subject)
3. **Request shallow depth of field** to separate subject from background
4. **Avoid cluttered backgrounds** that complicate animation
5. **Use `quality="high"`** for maximum detail

**Example:**

```python
prompt = """
Cinematic establishing shot of a lone astronaut standing on Mars surface.
Wide shot, astronaut in center-left with vast Martian landscape extending right.
Shot on ARRI Alexa with anamorphic lens, 2.39:1 aspect ratio.
Golden hour lighting (low sun), long shadows, atmospheric haze.
Shallow depth of field, astronaut in sharp focus, background slightly soft.
Rich orange-red Mars terrain, distant mountains, clear sky.
Photorealistic, film-quality detail, no text or watermarks.
"""

result = client.images.generate(
    model="gpt-image-1.5",
    prompt=prompt,
    quality="high",
    size="1792x1024"  # Widescreen for cinematic feel
)
```

### **Product Photography**

**Goal:** Professional product shots for e-commerce

**Best Practices:**
1. **Specify product clearly** (material, color, size, features)
2. **Request clean background** (white, transparent, or contextual)
3. **Define lighting setup** (soft studio, dramatic side, natural)
4. **Call out camera angle** (front, 3/4 view, overhead)
5. **Use `quality="high"`** for detail

**Example:**

```python
prompt = """
Professional product photography of a stainless steel water bottle.
3/4 view angle showing front and right side.
Matte black finish with subtle brand logo embossed on center.
Clean white background, soft studio lighting from upper left.
Subtle reflections on steel surface, no harsh shadows.
Sharp focus throughout, commercial product shot quality.
"""

result = client.images.generate(
    model="gpt-image-1.5",
    prompt=prompt,
    quality="high"
)
```

### **Marketing & Advertising**

**Goal:** Eye-catching visuals with text overlays

**Best Practices:**
1. **Design for text placement** (negative space, clear zones)
2. **Specify brand colors** if applicable
3. **Request high contrast** for readability
4. **Use quotes for exact text**
5. **Specify target audience** to set tone

**Example:**

```python
prompt = """
Create a vibrant social media ad for a summer sale.
Background: Tropical beach scene with turquoise water, palm trees, white sand.
Composition: Beach scene fills entire frame with clear sky in upper third.
Text overlay in upper third: "SUMMER SALE" in bold white sans-serif, all caps.
Below that: "50% OFF" in large yellow text.
High contrast, bright saturated colors, energetic and inviting mood.
Leave center-bottom area clear for product placement.
"""

result = client.images.generate(
    model="gpt-image-1.5",
    prompt=prompt
)
```

---

## Common Mistakes & Troubleshooting

### **Problem 1: Text is Misspelled or Garbled**

**Cause:** Model struggles with uncommon words or complex typography

**Solutions:**
- Put text in **quotes** or **ALL CAPS**
- Spell out tricky words **letter-by-letter**: `"H-I-G-G-S-F-I-E-L-D"`
- Specify font style explicitly: `"sans-serif bold font"`
- Use `quality="high"` for text-heavy images
- Keep text short and simple when possible

**Example:**

```python
# Bad
prompt = "Logo with Higgsfield text"

# Good
prompt = """
Logo with the text "HIGGSFIELD" spelled H-I-G-G-S-F-I-E-L-D.
Bold sans-serif font, all caps, centered, black text on white background.
"""
```

### **Problem 2: Image Doesn't Match Prompt**

**Cause:** Ambiguous or conflicting instructions

**Solutions:**
- Use **structured prompts** with clear sections
- Be **specific** about materials, colors, shapes
- Add **constraints** ("no X", "only Y")
- Include **intended use** to set context
- Break complex requests into **multiple steps**

**Example:**

```python
# Bad
prompt = "Nice photo of a car"

# Good
prompt = """
Photorealistic image of a red sports car.
3/4 front view showing hood and driver side.
Glossy paint finish, chrome accents, black leather interior visible through window.
Parked on wet asphalt reflecting car, overcast lighting.
Shot with 50mm lens, shallow depth of field, background slightly blurred.
No people, no text, no watermarks.
"""
```

### **Problem 3: Edits Drift from Original**

**Cause:** Model doesn't preserve unmentioned elements

**Solutions:**
- **Re-specify critical details** in every iteration
- Use "**change only X**" + "**keep everything else the same**"
- **List what to preserve** explicitly
- Start fresh if drift is severe

**Example:**

```python
# Bad
iter1_prompt = "Make it warmer"
iter2_prompt = "Add more contrast"

# Good
iter1_prompt = """
Make the lighting warmer with golden tones.
Preserve: subject's face, pose, expression, background, composition.
"""

iter2_prompt = """
Increase contrast slightly.
Preserve: subject's face, pose, expression, background, composition, warm golden lighting.
"""
```

### **Problem 4: Unrealistic or "AI-Looking" Results**

**Cause:** Generic prompting without real-world details

**Solutions:**
- Use **photography language** (lens, lighting, framing)
- Request **real texture** (pores, wrinkles, imperfections)
- Avoid **AI buzzwords** ("8K ultra-detailed hyper-realistic")
- Specify **natural imperfections** ("subtle film grain", "slight motion blur")
- Use `quality="high"` for photorealism

**Example:**

```python
# Bad
prompt = "Ultra-realistic 8K photo of a person"

# Good
prompt = """
Candid photograph of a person reading in a cafe.
Shot on 35mm film with 50mm lens, natural window light from left.
Visible skin texture (pores, fine lines), authentic clothing wrinkles.
Subtle film grain, natural color balance, shallow depth of field.
Honest and unposed, no glamorization, no heavy retouching.
"""
```

### **Problem 5: Inconsistent Character Across Images**

**Cause:** Model generates new interpretation each time

**Solutions:**
- Generate **hero/reference image** first
- Use **reference image as input** for subsequent scenes
- Provide **detailed character description** in every prompt
- Maintain **consistent description** across all prompts

**Example:**

```python
# Step 1: Hero image
hero_prompt = """
Character design: Woman, age 30, short black hair, brown eyes, round glasses.
Wearing blue denim jacket, white t-shirt, black jeans.
Neutral expression, standing pose, white background.
"""

# Step 2: Scene with reference
scene_prompt = """
Image 1: Character reference (woman with short black hair, glasses, denim jacket)

Place this character in a library, browsing books on shelf.
Maintain exact appearance: short black hair, round glasses, blue denim jacket, white t-shirt.
Natural library lighting, photorealistic.
"""
```

---

## Integration with AI Filmmaking Workflow

### **Phase 1: Pre-Production**

**Use GPT Image 1.5 for:**
- **Concept art** and mood boards
- **Character design sheets** with multiple angles
- **Location scouting** (generate reference environments)
- **Storyboard panels** with consistent characters

**Workflow:**

```python
# 1. Generate character designs
character_prompt = """
Character design sheet: Protagonist for sci-fi short film.
Male, age 35, rugged appearance, short beard, tactical gear.
Three views: front, side, back. White background, even lighting.
"""

# 2. Generate key locations
location_prompt = """
Establishing shot of abandoned space station interior.
Wide angle, high ceilings, industrial aesthetic, dim emergency lighting.
Cinematic composition, shot on ARRI Alexa, anamorphic lens.
"""

# 3. Generate storyboard
storyboard_prompt = """
6-panel storyboard for opening scene.
Panel 1: Wide shot of space station exterior
Panel 2: Close-up of protagonist's face, concerned expression
Panel 3: POV shot down dark corridor
Panel 4: Medium shot of protagonist drawing weapon
Panel 5: Close-up of glowing alien artifact
Panel 6: Wide shot of protagonist approaching artifact

Consistent character design, clear panel borders, sketch style.
"""
```

### **Phase 2: Hero Frame Generation**

**Use GPT Image 1.5 for:**
- **Cinematic stills** optimized for video generation
- **Motion-ready composition** (negative space, clear subject)
- **Professional camera language** (lens, lighting, framing)

**Best Practices:**
1. Generate **20-30 variations** per shot
2. Use **`quality="high"`** for final hero frames
3. Apply **cinematic composition rules** (rule of thirds, leading lines)
4. Ensure **subject separation** from background (shallow DOF)

**Example:**

```python
prompt = """
Cinematic medium shot of astronaut discovering alien artifact in cave.
Astronaut in left third of frame, artifact glowing in right third.
Shot on ARRI Alexa with 50mm lens, shallow depth of field (f/2.8).
Dramatic side lighting from artifact (blue glow), rim light on astronaut from behind.
Rich textures: worn spacesuit, rough cave walls, crystalline artifact.
Anamorphic lens flare, film grain, cinematic color grading (teal and orange).
Photorealistic, production-quality detail.
"""

result = client.images.generate(
    model="gpt-image-1.5",
    prompt=prompt,
    quality="high",
    size="1792x1024",  # Widescreen cinematic
    n=10  # Generate 10 variations
)
```

### **Phase 3: Image-to-Video Preparation**

**Use GPT Image 1.5 for:**
- **Upscaling** hero frames (if needed)
- **Style consistency** across shots
- **Final refinements** before video generation

**Workflow:**

```python
# 1. Select best hero frame from variations
# 2. Apply final refinements

refinement_prompt = """
Enhance this cinematic still:
- Increase sharpness slightly on subject (astronaut)
- Add subtle film grain for analog feel
- Deepen shadows for more dramatic contrast
- Preserve all composition, lighting, and colors
"""

refined = client.images.edit(
    model="gpt-image-1.5",
    image=hero_frame,
    prompt=refinement_prompt,
    quality="high"
)

# 3. Export for video generation platform (Higgsfield, Kling, etc.)
```

### **Phase 4: Cross-Model Translation**

**Use GPT Image 1.5 for:**
- **Style matching** across different generation models
- **Reference image creation** for video generators
- **Consistency maintenance** in multi-model workflows

**Example: GPT Image → Higgsfield Cinema Studio**

```python
# 1. Generate hero frame with GPT Image 1.5
gpt_prompt = """
Cinematic shot of detective in film noir style.
High-contrast black and white, dramatic shadows, venetian blind light patterns.
Shot on vintage film camera, 50mm lens, shallow depth of field.
"""

hero_frame = client.images.generate(model="gpt-image-1.5", prompt=gpt_prompt, quality="high")

# 2. Use hero frame as reference in Higgsfield Cinema Studio
# Cinema Studio settings:
# - Camera: Panavision Panaflex (film noir aesthetic)
# - Lens: Canon K-35 (vintage character)
# - Focal Length: 50mm
# - Aperture: f/4 (moderate depth)
# - Upload hero_frame as reference image
# - Prompt: "Maintain exact composition and lighting, add subtle camera movement (slow dolly in)"
```

### **Phase 5: Post-Production Assets**

**Use GPT Image 1.5 for:**
- **Title cards** and text overlays
- **End credits** backgrounds
- **Thumbnail** and poster art
- **Marketing materials**

**Example:**

```python
# Title card
title_prompt = """
Create a cinematic title card for sci-fi short film.
Black background with subtle star field.
Title text: "THE ARTIFACT" in bold futuristic sans-serif font, centered.
Subtitle below: "A Short Film" in smaller elegant font.
Subtle blue glow around text, minimalist design.
"""

title_card = client.images.generate(model="gpt-image-1.5", prompt=title_prompt, quality="high")
```

---

## Conclusion

GPT Image 1.5 represents a paradigm shift in AI image generation, combining the reasoning capabilities of large language models with state-of-the-art image synthesis. Its ability to understand context, preserve identity, render text reliably, and generate photorealistic visuals makes it an essential tool for AI filmmakers.

**Key Takeaways:**

1. **Leverage world knowledge** - Let the model infer details from context
2. **Use structured prompts** - Clear sections improve results
3. **Iterate incrementally** - Small changes with explicit preservation
4. **Think like a photographer** - Camera language > generic quality terms
5. **Start with quality="low"** - Optimize for speed, upgrade when needed
6. **Reference images are powerful** - Use for consistency and style transfer
7. **Be explicit about constraints** - State what to change AND what to preserve

**Integration with AI Filmmaking:**

GPT Image 1.5 excels at:
- Pre-production concept art and character design
- Hero frame generation for image-to-video workflows
- Style consistency across multi-shot projects
- Post-production assets (titles, posters, marketing)

When combined with video generation platforms like Higgsfield Cinema Studio, Kling 2.6, or Veo 3.1, GPT Image 1.5 enables a complete **Image-First Workflow** that prioritizes perfect stills before animation, ensuring cinematic quality throughout the production pipeline.

---

**Model:** GPT Image 1.5  
**Developer:** OpenAI  
**Documentation:** https://platform.openai.com/docs/guides/images  
**Cookbook:** https://developers.openai.com/cookbook/examples/multimodal/image-gen-1.5-prompting_guide/
