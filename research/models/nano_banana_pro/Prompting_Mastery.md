# Nano Banana Pro: Complete Prompting Mastery Guide

**Model:** Nano Banana Pro (Gemini 3 Pro Image)  
**API Model ID:** `nano-banana-pro-preview` (accessed via Gemini API)  
**Developer:** Google DeepMind  
**Release:** November 2025  
**Status:** Best 4K image model ever (as of February 2026)

> **Naming Note:** "Nano Banana Pro" is the internal/community codename. The model is accessed via the Gemini API using the model ID `nano-banana-pro-preview`. In Google AI Studio and Vertex AI, use this exact identifier.

---

## Executive Summary

Nano Banana Pro represents a paradigm shift from "fun" image generation to "functional" professional asset production. Built on Gemini 3, it's a **"Thinking" model** that understands intent, physics, and composition rather than just matching keywords. It excels in **text rendering, character consistency, visual synthesis, world knowledge (Google Search integration), and native 4K output**.

**Key Differentiators:**
- State-of-the-art text rendering in 100+ languages
- Up to 14 reference images (6 with high fidelity)
- Google Search grounding for real-time data
- Conversational editing (no need to regenerate from scratch)
- Native 1K-4K resolution support
- Advanced reasoning capabilities

---

## Section 0: The Golden Rules of Prompting

Nano Banana Pro is fundamentally different from traditional image models. To achieve professional results, you must shift from "tag soup" prompting to **Creative Director** communication.

### Rule 1: Edit, Don't Re-roll

The model excels at understanding conversational edits. If an image is 80% correct, **never generate from scratch**. Instead, request specific changes.

**Example:**
```
Initial: "A cinematic shot of a futuristic sports car in Tokyo at night"
Edit: "That's great, but change the lighting to sunset and make the neon signs blue instead of red"
```

**Why This Works:** The model maintains context and applies surgical edits, preserving what's working while fixing what isn't.

### Rule 2: Use Natural Language & Full Sentences

Talk to Nano Banana Pro as if briefing a human artist. Use proper grammar, descriptive adjectives, and complete thoughts.

**❌ Bad (Tag Soup):**
```
cool car, neon, city, night, 8k, realistic, cinematic
```

**✅ Good (Natural Language):**
```
A cinematic wide shot of a futuristic sports car speeding through a rainy Tokyo street at night. The neon signs reflect off the wet pavement and the car's metallic chassis. Shot with anamorphic lens, shallow depth of field.
```

### Rule 3: Be Specific and Descriptive

Vague prompts yield generic results. Define every element with precision.

**Subject Specificity:**
- ❌ "a woman" 
- ✅ "a sophisticated elderly woman wearing a vintage Chanel-style suit with pearl earrings"

**Materiality Matters:**
- Describe textures: "matte finish," "brushed steel," "soft velvet," "crumpled paper," "weathered wood"
- Specify surfaces: "glossy," "reflective," "translucent," "opaque"

### Rule 4: Provide Context (The "Why" or "For Whom")

Because Nano Banana Pro "thinks," giving it context helps it make logical artistic decisions.

**Example:**
```
"Create an image of a gourmet sandwich for a Brazilian high-end cookbook"
```

**What the Model Infers:**
- Professional food styling
- Shallow depth of field (f/1.8-f/2.8)
- Perfect studio lighting
- Premium plating and garnish
- Editorial-quality composition

---

## Section 1: The 6-Variable Framework

For maximum creative control, structure your prompts using these six variables:

### 1. Subject
**Who or what is in the image?**

Avoid ambiguity. Be hyper-specific about identity, appearance, and characteristics.

**Examples:**
- ❌ "a dog"
- ✅ "A Shiba Inu with metallic cyberpunk plating and glowing blue circuit patterns"

### 2. Composition
**How is the virtual camera positioned?**

Direct the shot like a cinematographer.

**Camera Angles:**
- Extreme close-up (macro lens for texture)
- Wide shot (establishing scene)
- Low-angle shot (subject dominance)
- High-angle shot (vulnerability)
- Isometric view (technical/architectural)
- Fisheye distortion (immersive/surreal)

**Framing:**
- Portrait (9:16)
- Landscape (16:9)
- Cinematic (21:9)
- Square (1:1)
- Custom aspect ratios

### 3. Action
**What movement or energy exists?**

Static images are boring. Define motion and dynamics.

**Examples:**
- "Leaping across a rooftop gap mid-stride"
- "Brewing coffee with steam rising from the cup"
- "Casting a magical spell with glowing particles swirling"

### 4. Location
**Where does the scene take place?**

Establish atmosphere through setting.

**Examples:**
- "A neon-lit Tokyo back alley with rain-soaked pavement"
- "A sun-drenched Tuscan vineyard at golden hour"
- "A futuristic Mars cafe with red dust visible through the windows"

### 5. Style
**What is the artistic medium and aesthetic?**

Dictate the visual output.

**Style Options:**
- Photorealistic (Shot on ARRI Alexa, Hasselblad, etc.)
- 3D animation (Pixar-style, Unreal Engine render)
- Film noir (high contrast, dramatic shadows)
- Vintage photography (1980s Polaroid, 1950s Kodachrome)
- Watercolor painting
- Technical illustration
- Editorial fashion photography

### 6. Mood/Lighting
**What is the emotional tone and light quality?**

**Lighting Scenarios:**
- Golden hour (warm, soft, long shadows)
- Blue hour (cool, ethereal)
- Harsh midday sun (high contrast, sharp shadows)
- Overcast (soft, diffused, even lighting)
- Studio lighting (controlled, professional)
- Volumetric fog (atmospheric, cinematic)

---

## Section 2: Advanced Prompting Techniques

### Technique 1: Composition and Aspect Ratio Control

Establish rigid canvas boundaries to prevent composition drift.

**Best Practice:**
```
"A 9:16 vertical poster featuring..."
"A cinematic 21:9 wide shot of..."
"A 1:1 square Instagram post showing..."
```

**Why It Matters:** Explicit aspect ratios force the model to compose within defined boundaries, preventing awkward cropping or composition drift.

### Technique 2: Camera and Lighting Details

Simulate physical photography by defining technical parameters.

**Camera Technical Specs:**
```
"Shot on ARRI Alexa 35 with Cooke S4 85mm lens, f/1.4 aperture, shallow depth of field"
"Macro lens at f/2.8, focus on texture, soft bokeh background"
"Wide-angle 24mm lens, f/11 for deep focus, everything sharp"
```

**Lighting Technical Specs:**
```
"Three-point lighting setup with key light at 45 degrees"
"Golden hour backlighting creating rim light around subject"
"Soft box diffused lighting from camera left, fill light from right"
"Volumetric fog with god rays streaming through windows"
```

### Technique 3: Text Integration (SOTA Text Rendering)

Nano Banana Pro has state-of-the-art text rendering capabilities in 100+ languages.

**Best Practices:**
1. **Use Double Quotes:** Isolate text strings in double quotes for maximum legibility
2. **Specify Font Family:** "Bold sans-serif," "Elegant serif," "Hand-drawn brush script"
3. **Define Placement:** "Top center," "Bottom third," "Overlaid on subject"
4. **Specify Effects:** "White outline with drop shadow," "Neon glow effect," "Embossed 3D text"

**Example:**
```
"Create a movie poster in 9:16 format. The headline 'URBAN EXPLORER' should be rendered in bold, white, sans-serif font at the top with a thick black outline and subtle drop shadow. Below it, the tagline 'One City. Infinite Stories.' in smaller elegant serif font."
```

### Technique 4: Factual Constraints (For Diagrams & Infographics)

Enforce logical consistency and prevent geometric distortion.

**Best Practices:**
```
"Create a scientifically accurate cross-section diagram of the human heart. Ensure anatomical precision with correctly labeled chambers."

"Generate a bar chart comparing GDP growth. Negative constraints: No distorted axes, no misleading scales, ensure data accuracy."
```

**Pro Tip:** Always verify factual accuracy of data-driven visuals. The model can hallucinate data.

### Technique 5: Reference Inputs (Multi-Image Control)

Nano Banana Pro supports **up to 14 reference images** (6 with high fidelity).

**Use Cases:**
- **Identity Locking:** Maintain character consistency across generations
- **Style Transfer:** Apply artistic style from one image to another
- **Image Blending:** Combine multiple images into cohesive composition
- **Brand Consistency:** Apply logos, patterns, and brand elements

**Best Practice:**
```
"Use Image 1 for the character's facial features (keep identity exact). Use Image 2 for the art style and color palette. Use Image 3 for the background environment composition."
```

**Weight Control:**
```
"Apply 80% influence from Image 1 (character identity), 20% influence from Image 2 (lighting style)"
```

---

## Section 3: Professional Workflows

### Workflow 1: Text Rendering & Infographics

**Capability:** SOTA text rendering in 100+ languages, complex data visualization.

**Best Practices:**
- **Compression:** Ask the model to "compress" dense PDFs or text into visual aids
- **Style Specification:** "Polished editorial," "Technical diagram," "Hand-drawn whiteboard"
- **Multi-language:** Specify language explicitly for non-English text

**Example Prompts:**

**Earnings Report Infographic:**
```
[Upload PDF of earnings report]
"Generate a clean, modern infographic summarizing the key financial highlights from this earnings report. Include bar charts for 'Revenue Growth' and 'Net Income', and highlight the CEO's key quote in a stylized pull-quote box. Use corporate blue and white color scheme."
```

**Retro Infographic:**
```
"Create a retro, 1950s-style infographic about the history of the American diner. Include distinct sections for 'The Food,' 'The Jukebox,' and 'The Decor.' Use period-appropriate fonts and pastel color palette. Ensure all text is legible."
```

**Technical Diagram:**
```
"Create an orthographic blueprint of a modern tiny house showing plan, elevation, and section views. Label 'North Elevation' and 'Main Entrance' in technical architectural font. Use blue lines on white background. Format: 16:9."
```

**Whiteboard Educational:**
```
"Summarize the concept of 'Transformer Neural Network Architecture' as a hand-drawn whiteboard diagram suitable for a university lecture. Use different colored markers (blue for Encoder, red for Decoder). Include legible labels for 'Self-Attention' and 'Feed Forward' layers."
```

### Workflow 2: Character Consistency & Viral Thumbnails

**Capability:** Up to 14 reference images, identity locking, multi-character consistency.

**Best Practices:**
- **Explicit Identity Locking:** "Keep the person's facial features exactly the same as Image 1"
- **Expression/Action Changes:** Describe emotional or pose changes while maintaining identity
- **Group Consistency:** Maintain multiple characters in same scene

**Example Prompts:**

**Viral Thumbnail (Identity + Text + Graphics):**
```
[Upload reference image of person]
"Design a viral YouTube thumbnail using the person from Image 1.

**Face Consistency:** Keep facial features exactly the same as Image 1, but change expression to excited and surprised with mouth open.

**Action:** Pose the person on the left side, pointing finger towards the right.

**Subject:** On the right side, place a high-quality image of delicious avocado toast on white plate.

**Graphics:** Add a bold yellow arrow connecting the person's finger to the toast.

**Text:** Overlay massive pop-style text in the middle: '3分钟搞定!' (Done in 3 mins!) with thick white outline and drop shadow.

**Background:** Blurred bright kitchen. High saturation and contrast. Format: 16:9."
```

**Multi-Character Story (Group Consistency):**
```
[Upload 3 images of different characters]
"Create a 10-part story with these 3 characters going on a tropical vacation. The story should have emotional highs and lows and end happily.

**Consistency Rules:**
- Keep attire and identity consistent for all 3 characters
- Vary expressions and angles throughout
- Only one of each character per image
- Maintain character proportions and features exactly"
```

**Brand Asset Generation:**
```
[Upload 1 product image]
"Create 9 fashion editorial shots using this product as the brand reference. Add variety to the range (different angles, lighting, settings) while maintaining consistent brand aesthetic. Professional design touch. Generate one at a time."
```

### Workflow 3: Google Search Grounding

**Capability:** Real-time data integration, current events, factual verification.

**Best Practices:**
- Use for dynamic data (weather, stocks, news, trends)
- The model will "Think" (reason) about search results before generating
- Always verify factual accuracy (model can still hallucinate)

**Example Prompts:**

**Real-Time Data Visualization:**
```
"Visualize the current stock values of the main tech companies (Apple, Microsoft, Google, Amazon, Meta) and their recent trends. For each company, add a brief explanation of recent events that could explain the trend. Use a clean infographic style with color-coded trend arrows."
```

**Event Visualization:**
```
"Generate an infographic of the best times to visit U.S. National Parks in 2025 based on current travel trends. Include weather patterns, crowd levels, and seasonal highlights for top 5 parks."
```

**Current News Summary:**
```
"Create a visual timeline of major tech announcements from CES 2026. Include company logos, product images, and key specifications in a modern editorial layout."
```

### Workflow 4: Advanced Editing & Restoration

**Capability:** Conversational editing, in-painting, restoration, colorization, style swapping.

**Best Practices:**
- **Semantic Instructions:** No manual masking needed - describe changes naturally
- **Physics Understanding:** Model understands physical constraints ("fill glass with liquid")
- **Iterative Refinement:** Make multiple small edits rather than one complex change

**Example Prompts:**

**Object Removal & In-painting:**
```
[Upload photo with unwanted elements]
"Remove the tourists from the background and fill the space with logical textures (cobblestones and storefronts) that match the surrounding environment. Maintain consistent lighting and perspective."
```

**Manga/Comic Colorization:**
```
[Upload black and white manga panel]
"Colorize this manga panel using vibrant anime-style palette. Ensure lighting effects on energy beams are glowing neon blue. Character's outfit should use their official colors (red jacket, black pants). Maintain line art integrity."
```

**Localization (Text + Cultural Adaptation):**
```
[Upload London bus stop ad]
"Localize this concept to a Tokyo setting. Translate the tagline into Japanese. Change background to bustling Shibuya street at night with neon signs. Maintain brand colors and layout structure."
```

**Seasonal Transformation:**
```
[Upload summer house photo]
"Transform this scene to winter. Keep house architecture exactly the same, but add snow to roof and yard. Change lighting to cold, overcast afternoon. Add bare tree branches and frozen pond."
```

### Workflow 5: Dimensional Translation (2D ↔ 3D)

**Capability:** Convert 2D schematics to 3D visualizations and vice versa.

**Use Cases:** Interior design, architecture, product visualization, meme creation.

**Example Prompts:**

**2D Floor Plan to 3D Interior Design Board:**
```
[Upload 2D floor plan]
"Based on this floor plan, generate a professional interior design presentation board in a single image.

**Layout:** Collage with one large main image at top (wide-angle perspective of living area), and three smaller images below (Master Bedroom, Home Office, 3D top-down floor plan).

**Style:** Modern Minimalist with warm oak wood flooring and off-white walls across ALL images.

**Quality:** Photorealistic rendering, soft natural lighting, 4K resolution."
```

**2D to 3D Meme Conversion:**
```
"Transform the 'This is Fine' dog meme into a photorealistic 3D render. Keep composition identical but make the dog look like a realistic plush toy and the fire look like actual flames with heat distortion. Maintain the ironic calm expression."
```

### Workflow 6: High-Resolution & Textures

**Capability:** Native 1K-4K generation, extreme detail preservation.

**Best Practices:**
- Explicitly request resolution (2K or 4K) if interface allows
- Describe high-fidelity details (imperfections, surface textures, micro-details)
- Use for large-format prints, product photography, texture maps

**Example Prompts:**

**4K Texture Generation:**
```
"Generate a 4K seamless texture of weathered oak wood planks. Include realistic grain patterns, subtle color variation, small knots, and micro-scratches. Ensure tileable edges for 3D mapping. Photorealistic quality."
```

**Product Photography (4K):**
```
"Create a 4K product shot of a luxury watch on black velvet surface. Extreme macro detail showing brushed metal texture, sapphire crystal clarity, and engraved serial number. Studio lighting with soft reflections. Shot on Hasselblad H6D-400c."
```

### Workflow 7: Thinking & Reasoning

**Capability:** Model "thinks" before generating, understanding complex multi-step instructions.

**Best Practices:**
- Give complex, multi-layered prompts
- The model will reason through constraints and make logical decisions
- Use for problem-solving scenarios (spatial reasoning, physics, composition)

**Example Prompts:**

**Complex Spatial Reasoning:**
```
"Create an image of a transparent glass filled with crushed pink ice. Camera POV is from inside the container looking upward. A young woman leans over the opening, sipping through a bright blue straw. Her face is illuminated by sunlight. Show water droplets on container walls, ice crystal reflections, and blue sky background. Hyperrealistic with slight lens distortion."
```

**Physics-Based Generation:**
```
"Generate an image of a fighter jet performing a high-speed maneuver above the coastline. Show vapor cones forming around the wings due to transonic speed. Include accurate aerodynamic effects, realistic jet exhaust, and proper atmospheric perspective."
```

### Workflow 8: One-Shot Storyboarding

**Capability:** Generate multi-panel storyboards in a single image.

**Best Practices:**
- Specify number of panels and layout
- Describe each shot type (establishing, medium, close-up, POV)
- Maintain visual consistency across panels

**Example Prompt:**

**Film Storyboard:**
```
"Create a black and white storyboard sketch showing 4 panels for a film scene:

Panel 1: Establishing shot - Wide view of abandoned warehouse exterior at dusk
Panel 2: Medium shot - Detective entering through broken door, flashlight in hand
Panel 3: Close-up - Detective's face reacting to something off-screen, expression of shock
Panel 4: POV shot - What detective sees: shadowy figure in corner

Use rough pencil sketch style with shot labels. Format: 16:9 landscape."
```

### Workflow 9: Structural Control & Layout Guidance

**Capability:** Precise control over composition, layout, and spatial relationships.

**Best Practices:**
- Use coordinate-level positioning ("top left," "bottom third," "centered")
- Define relative positioning ("subject in foreground, mountains in background")
- Specify layout grids for multi-element compositions

**Example Prompt:**

**Magazine Layout:**
```
"Design a fashion magazine spread in 16:9 format.

**Layout:**
- Left two-thirds: Full-bleed fashion photograph of model in avant-garde outfit
- Right third: White space with article text
- Top right corner: Magazine logo 'VOGUE' in elegant serif font
- Bottom right: Page number '47' in small sans-serif

**Photography:** High-fashion editorial style, dramatic lighting, shot on medium format film."
```

---

## Section 4: Common Mistakes & Troubleshooting

### Mistake 1: Using Tag Soup Prompts

**Problem:** "dog, park, sunny, 4k, realistic, professional"

**Why It Fails:** Nano Banana Pro is a thinking model. Tag soups provide no context, narrative, or creative direction.

**Solution:** Use full sentences with natural language.

**Fixed:**
```
"A golden retriever playing fetch in a sun-drenched park at golden hour. The dog is mid-leap catching a tennis ball, with grass and trees in soft focus background. Shot with 85mm lens at f/2.8 for shallow depth of field."
```

### Mistake 2: Regenerating Instead of Editing

**Problem:** Image is 80% correct, but user generates entirely new image from scratch.

**Why It Fails:** Wastes time and credits. Loses what was working.

**Solution:** Use conversational editing.

**Example:**
```
Initial: [Generated image of sports car]
Edit: "Perfect! Now change the car color to matte black and add rain on the windshield."
```

### Mistake 3: Vague Subject Descriptions

**Problem:** "a woman in a dress"

**Why It Fails:** Generic, no creative direction, yields stock photo results.

**Solution:** Be hyper-specific about identity, style, and context.

**Fixed:**
```
"A sophisticated elderly woman in her 70s wearing a vintage 1960s Chanel-style tweed suit with pearl earrings and a silk scarf. She has silver hair in an elegant updo and is holding a leather-bound book. Photographed in the style of Annie Leibovitz."
```

### Mistake 4: Ignoring Technical Camera Specs

**Problem:** "make it look cinematic"

**Why It Fails:** "Cinematic" is subjective. Model needs technical direction.

**Solution:** Specify camera, lens, aperture, lighting.

**Fixed:**
```
"Shot on ARRI Alexa 35 with anamorphic lens, 2.39:1 aspect ratio, f/2.8 aperture for shallow depth of field. Cinematic color grading with teal shadows and warm highlights. Volumetric fog with god rays."
```

### Mistake 5: Not Providing Context

**Problem:** "a sandwich"

**Why It Fails:** Model doesn't know the purpose or audience.

**Solution:** Provide context (who, why, where).

**Fixed:**
```
"A gourmet sandwich for a high-end Brazilian cookbook. Professional food styling with artisanal bread, premium ingredients, and elegant plating. Shot from 45-degree angle with shallow depth of field. Studio lighting with soft shadows."
```

### Mistake 6: Expecting Perfect Text on First Try

**Problem:** User expects flawless text rendering without specification.

**Why It Fails:** Text rendering requires explicit instructions.

**Solution:** Use double quotes, specify font, placement, and effects.

**Fixed:**
```
"Create a movie poster with the title 'NEON NIGHTS' in bold, futuristic sans-serif font at the top center. Use glowing neon blue text with pink outline and subtle glow effect. Ensure perfect letter spacing and legibility."
```

### Mistake 7: Not Verifying Factual Data

**Problem:** Trusting infographics and diagrams without verification.

**Why It Fails:** Model can hallucinate data and statistics.

**Solution:** Always verify factual accuracy of data-driven visuals.

**Best Practice:**
- Cross-check statistics with original sources
- Verify anatomical/technical diagrams with references
- Double-check translations and cultural elements

---

## Section 5: Genre-Specific Recipes

### Recipe 1: High-End Fashion Editorial

```
"A high-fashion editorial photograph of a model wearing an avant-garde geometric dress in metallic silver. The model is posed dramatically against a brutalist concrete architecture background. Shot on Hasselblad H6D with 80mm lens at f/2.8. Dramatic side lighting creating strong shadows. Color grading: desaturated with emphasis on silver and concrete tones. Style: Vogue Italia editorial aesthetic."
```

### Recipe 2: Cinematic Film Still

```
"A cinematic film still from a neo-noir thriller. A detective in a trench coat stands in a rain-soaked alley at night, illuminated by a single flickering neon sign. Shot on ARRI Alexa 35 with anamorphic lens, 2.39:1 aspect ratio. High contrast lighting with deep shadows. Color grading: teal and orange, desaturated. Volumetric fog. Style: Blade Runner 2049 aesthetic."
```

### Recipe 3: Product Photography

```
"Professional product photography of a luxury perfume bottle on black marble surface. The bottle is made of cut crystal with gold accents. Dramatic studio lighting with soft reflections and rim lighting. Shot on Phase One XF with 120mm macro lens at f/5.6. Extreme detail showing glass facets and gold engraving. Black background with subtle gradient. 4K resolution."
```

### Recipe 4: Architectural Visualization

```
"Photorealistic architectural rendering of a modern minimalist house at golden hour. The house features floor-to-ceiling glass walls, clean white concrete, and warm wood accents. Surrounded by lush landscaping. Shot from low angle to emphasize verticality. Soft golden hour lighting with long shadows. Rendered in Unreal Engine quality with ray tracing. 4K resolution, 16:9 format."
```

### Recipe 5: Editorial Infographic

```
"Create a modern editorial infographic about 'The Future of AI in Healthcare' for Wired magazine. Use a clean, tech-forward design with data visualizations (bar charts, icons, timeline). Color scheme: electric blue, white, and dark gray. Include section headers in bold sans-serif font. Ensure all text is legible. Layout: vertical 9:16 format suitable for digital publication."
```

### Recipe 6: Vintage Photography

```
"A vintage 1970s Kodachrome photograph of a family road trip. A station wagon is parked at a scenic overlook with mountains in the background. The family is having a picnic on a checkered blanket. Authentic 70s fashion, hairstyles, and car design. Slightly faded colors with warm yellow-orange cast. Film grain and slight vignetting. Nostalgic Americana aesthetic."
```

---

## Section 6: Technical Specifications

### Resolution Options
- **1K:** 1024px (standard quality)
- **2K:** 2048px (high quality)
- **4K:** 4096px (ultra-high quality, best-in-class)

### Aspect Ratio Support
- **Portrait:** 9:16, 2:3, 4:5
- **Landscape:** 16:9, 3:2, 21:9 (cinematic)
- **Square:** 1:1
- **Custom:** Specify exact dimensions

### Reference Image Limits
- **Maximum:** 14 reference images
- **High Fidelity:** 6 images with maximum influence
- **Use Cases:** Character consistency, style transfer, image blending

### Language Support
- **100+ languages** for text rendering
- **Best Performance:** English, Spanish, French, German, Japanese, Korean, Chinese
- **Localization:** Cultural adaptation and translation

### API Access
- **Google AI Studio:** Web interface with conversational editing
- **Vertex AI:** Enterprise API for production workflows
- **Gemini App:** Mobile and web app integration

---

## Section 7: Current Limitations (As of February 2026)

### 1. Visual and Text Fidelity
**Issue:** Small text, fine details, and complex spellings may not render perfectly.

**Workaround:**
- Use larger text sizes
- Simplify complex words
- Request multiple generations and select best result

### 2. Data and Factual Accuracy
**Issue:** Model can hallucinate data in infographics and diagrams.

**Workaround:**
- Always verify factual accuracy
- Provide reference data explicitly
- Use Google Search grounding when possible

### 3. Translation and Localization
**Issue:** Multilingual text may have grammar mistakes or miss cultural nuances.

**Workaround:**
- Have native speakers review translations
- Provide cultural context explicitly
- Use reference images for cultural elements

### 4. Complex Edits and Image Blending
**Issue:** Advanced editing tasks can produce unnatural artifacts.

**Workaround:**
- Make edits incrementally (small changes at a time)
- Use multiple reference images for complex blends
- Request "seamless blending" explicitly

### 5. Character Features
**Issue:** Character consistency may vary across edits despite identity locking.

**Workaround:**
- Use high-quality reference images (clear, well-lit)
- Explicitly state "Keep facial features exactly the same"
- Lock seed values for consistency

---

## Section 8: Integration with AI Filmmaking Workflow

### Image-First Workflow (Hero Frame Generation)

Nano Banana Pro is ideal for generating **Hero Frames** (motion-ready stills) that will be animated in video models.

**Best Practices:**
1. **Generate 20-30 variations** using different prompts
2. **Select the ONE perfect frame** that looks cinematic as a still
3. **Lock the seed** for consistency across shots
4. **Use as reference** for video generation in Cinema Studio, Kling, or Veo

**Example Workflow:**
```
Step 1: Generate Hero Frame in Nano Banana Pro
"A cinematic medium shot of a detective in a trench coat standing in a rain-soaked alley at night. Neon signs reflect in puddles. Shot on ARRI Alexa with anamorphic lens, 2.39:1 aspect ratio, f/2.8. Film noir aesthetic with high contrast lighting."

Step 2: Select best result and note seed value

Step 3: Use Hero Frame as reference in Cinema Studio V1.5
Upload Hero Frame → Animate with camera movement (slow dolly-in)

Step 4: Upscale final video with Topaz Video
```

### Cross-Model Translation

Use **The Rosetta Stone** framework to translate Nano Banana Pro prompts to other models.

**Nano Banana Pro → Midjourney:**
- Remove camera technical specs
- Add Midjourney parameters (--ar, --style, --v 6.1)
- Simplify to descriptive phrases

**Nano Banana Pro → Cinema Studio:**
- Extract camera, lens, focal length, aperture specs
- Use Cinema Studio UI dropdowns (not text prompts)
- Maintain lighting and composition descriptions

---

## Section 8.5: API Parameters Reference

When using Nano Banana Pro via the Gemini API (`nano-banana-pro-preview`), the following parameters are available:

| Parameter | Type | Description | Values |
|-----------|------|-------------|--------|
| `model` | string | Model identifier | `nano-banana-pro-preview` |
| `prompt` | string | Natural language prompt | Free text (follow Golden Rules) |
| `resolution` | string | Output resolution | `1024x1024`, `2048x2048`, `4096x4096` (1K/2K/4K) |
| `aspect_ratio` | string | Output aspect ratio | `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `21:9` |
| `seed` | integer | Seed for reproducibility | 0–2147483647 (lock for consistency across series) |
| `number_of_images` | integer | Batch size | 1–4 |
| `reference_images` | array | Reference image inputs | Up to 14 images (6 high-fidelity slots) |
| `safety_filter_level` | string | Content filter strictness | `block_none`, `block_few`, `block_some`, `block_most` |
| `person_generation` | string | People generation policy | `allow_adult`, `dont_allow` |

### Seed Locking for Consistency

To maintain visual consistency across a series:
```
// First generation — note the seed from response
{ seed: 42, prompt: "..." }

// Subsequent generations — lock the same seed
{ seed: 42, prompt: "Same scene but change the lighting to golden hour" }
```

The seed preserves composition, character appearance, and spatial layout while allowing prompt-driven edits.

---

## Section 9: Cost Optimization

### Credit Usage (via Gemini API / Google AI Studio)

**Nano Banana Pro Costs:**
- **2K Generation:** Included in Pro plan (600 credits/month) - Unlimited
- **4K Generation:** Included in Ultimate plan (1200 credits/month) - Unlimited
- **Reference Images:** No additional cost (up to 14 images)
- **Editing:** Same cost as generation (no premium for conversational edits)

### Best Practices for Cost Efficiency

1. **Edit Instead of Regenerate:** Save credits by making conversational edits
2. **Use 2K for Drafts:** Generate at 2K, upscale final selection to 4K
3. **Lock Seeds:** Once you find a good result, lock the seed for consistency
4. **Batch Generations:** Generate multiple variations in one session
5. **Use Reference Images:** Leverage existing assets to guide generation

---

## Section 10: Quick Reference

### Prompt Template

```
[SUBJECT]: [Specific description of who/what]
[COMPOSITION]: [Camera angle, framing, aspect ratio]
[ACTION]: [What is happening, movement, energy]
[LOCATION]: [Where the scene takes place, atmosphere]
[STYLE]: [Artistic medium, aesthetic, reference]
[CAMERA]: [Technical specs: camera, lens, aperture]
[LIGHTING]: [Light quality, direction, mood]
[TEXT]: "[Exact text in quotes]" in [font style] at [placement]
[MOOD]: [Emotional tone, color grading]
```

### Example Using Template

```
SUBJECT: A sophisticated elderly woman in her 70s wearing a vintage 1960s Chanel-style tweed suit with pearl earrings
COMPOSITION: Medium shot, portrait orientation (2:3), subject centered
ACTION: Holding a leather-bound book, slight smile, confident posture
LOCATION: Elegant library with floor-to-ceiling bookshelves, warm wood tones
STYLE: Editorial portrait photography, Annie Leibovitz aesthetic
CAMERA: Shot on Hasselblad H6D with 80mm lens at f/2.8
LIGHTING: Soft window light from camera left, subtle fill light from right, warm color temperature
MOOD: Timeless elegance, intellectual sophistication
```

### Golden Rules Checklist

- [ ] Use natural language, not tag soup
- [ ] Edit instead of regenerating from scratch
- [ ] Be specific about subject, location, action
- [ ] Provide context (who, why, where)
- [ ] Specify camera technical details
- [ ] Use double quotes for text rendering
- [ ] Verify factual accuracy of data
- [ ] Request explicit resolution (2K/4K)
- [ ] Use reference images for consistency
- [ ] Lock seed values for series

---

## Conclusion

Nano Banana Pro represents a fundamental shift in AI image generation—from keyword matching to creative understanding. By treating it as a **thinking collaborator** rather than a keyword processor, you unlock professional-grade results that rival traditional photography and illustration.

**Key Takeaways:**
1. **Communicate naturally** - Full sentences, not tags
2. **Edit conversationally** - Refine, don't regenerate
3. **Be specific** - Every detail matters
4. **Provide context** - Help the model think
5. **Use technical specs** - Camera, lighting, composition
6. **Verify accuracy** - Always check factual data
7. **Leverage references** - Up to 14 images for control

Master these principles, and Nano Banana Pro becomes an indispensable tool in your AI filmmaking workflow—generating Hero Frames that look like they belong in a feature film, not a stock photo library.

---

**Last Updated:** February 19, 2026  
**Model Version:** Nano Banana Pro (Gemini 3 Pro Image) — API ID: `nano-banana-pro-preview`  
**Guide Version:** 1.1
