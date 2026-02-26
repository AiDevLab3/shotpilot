# FLUX.2 Prompting Mastery Guide

Model Family: FLUX.2 [max], FLUX.2 [pro], FLUX.2 [flex], FLUX.2 [klein]
Developer: Black Forest Labs
Primary Use: Production-grade AI image generation and editing with 4MP photorealistic output
Key Strengths: JSON structured prompting, hex color precision, multi-reference editing, typography, photorealism
Version: February 2026



## Table of Contents

Model Overview

Technical Specifications

Prompt Structure Fundamentals

Natural Language Prompting

JSON Structured Prompting

Hex Color Control

Photorealistic Styles

Camera and Lens Simulation

Typography and Text Rendering

Multi-Reference Image Editing

Advanced Techniques

Common Mistakes & Troubleshooting

Best Practices

Genre-Specific Examples



## Model Overview

### FLUX.2 Model Family

FLUX.2 [max] - Highest quality, production-grade


4MP maximum output resolution

Best prompt following and detail

Ideal for: Final production assets, client work, high-end marketing


FLUX.2 [pro] - Balanced quality and speed


4MP maximum output resolution

Fast inference with excellent quality

Ideal for: Professional workflows, rapid iteration, commercial projects


FLUX.2 [flex] - Customizable parameters


Adjustable guidance (1.5-10) and steps (max 50)

Fine control over generation

Ideal for: Experimentation, specific aesthetic control


FLUX.2 [klein] - Speed-optimized


Sub-second inference time

Production quality visuals

Run locally, ready to fine-tune

Ideal for: Real-time applications, local deployment, rapid prototyping

### Key Capabilities

✅ JSON Structured Prompting - Precise control over complex scenes
✅ Hex Color Precision - Exact brand color matching (#FF5733)
✅ Multi-Reference Editing - Combine up to 8-10 reference images
✅ Typography Excellence - Clean, readable text generation
✅ Photorealism - Camera and lens simulation
✅ Multi-Language Support - Native language prompting
✅ No Negative Prompts - Describe what you want, not what you don't want



## Technical Specifications

### Resolution and Aspect Ratios

Resolution Limits:


Minimum: 64×64 pixels

Maximum: 4MP (e.g., 2048×2048)

Recommended: Up to 2MP for most use cases

Output dimensions must be multiples of 16


Supported Aspect Ratios:


### Multi-Reference Image Limits

FLUX.2 [pro]:


9MP total limit for input + output

At 1MP output: up to 8 reference images

At 2MP output: up to 7 reference images

At 4MP output: up to 5 reference images


FLUX.2 [flex]:


Up to 10 reference images


FLUX.2 [dev]:


Approximately 6 reference images

### Parameters

Seed - Reproducible results (e.g., seed: 42)
Guidance [flex only] - Prompt adherence strength (1.5-10, default: 4.5)
Steps [flex only] - Quality vs. speed tradeoff (max 50)
Prompt Upsampling - Automatic prompt enhancement (boolean)



## Prompt Structure Fundamentals

### Core Framework: Subject + Action + Style + Context

Subject: The main focus (person, object, character)
Action: What the subject is doing or their pose
Style: Artistic approach, medium, or aesthetic
Context: Setting, lighting, time, mood, or atmospheric conditions


Example:


"Black cat hiding behind a watermelon slice, professional studio shot,

bright red and turquoise background with summer mystery vibe"



Breakdown:


Subject: Black cat

Action: hiding behind a watermelon slice

Style: professional studio shot

Context: bright red and turquoise background with summer mystery vibe

### Word Order Matters

FLUX.2 pays more attention to what comes first in your prompt.


Priority Order:


Main subject

Key action

Critical style

Essential context

Secondary details


Example - Correct Priority:


"Vintage red Ferrari 250 GTO speeding through Italian countryside,

golden hour lighting, shot on Kodak Portra 400, shallow depth of field"



Example - Incorrect Priority:


"Shot on Kodak Portra 400 with shallow depth of field during golden hour

in Italian countryside, vintage red Ferrari 250 GTO speeding"

### Prompt Length Guidance

Short (10-30 words):


Quick concepts and style exploration

Simple, single-subject scenes

When you want FLUX.2 to fill in creative details


Medium (30-80 words):


Usually ideal for most projects

Balanced detail and creative freedom

Professional workflows


Long (80+ words):


Complex scenes requiring detailed specifications

Production work with specific requirements

When using JSON structured prompts



## Natural Language Prompting

### When to Use Natural Language

✅ Quick iterations and exploration
✅ Simple, single-subject scenes
✅ When prompt length isn't a concern
✅ Creative workflows where flexibility matters

### Best Practices

1. Be Specific and Descriptive


❌ Poor: "A dog in a park"
✅ Good: "Golden retriever playing with a red frisbee in Central Park, autumn afternoon, leaves falling, professional pet photography"


2. Describe What You Want (No Negative Prompts)


FLUX.2 does not support negative prompts. Focus on describing what you want, not what you don't want.


❌ Don't say: "A portrait without blurry background"
✅ Do say: "A portrait with sharp focus on subject and crisp background details"


3. Use Descriptive Adjectives


Specific adjectives create more precise results:


Colors: "crimson red" vs. "red"

Textures: "weathered leather" vs. "leather"

Lighting: "soft diffused morning light" vs. "morning light"

Mood: "melancholic autumn atmosphere" vs. "autumn"


4. Reference Specific Eras and Styles


Instead of generic terms, reference specific time periods and aesthetics:


"2000s digicam style" - Early digital camera aesthetic

"80s vintage photo" - Warm color cast, soft focus, film grain

"shot on Kodak Portra 400" - Specific film stock characteristics

### Natural Language Examples

Portrait Photography:


"Close-up portrait of a woman with natural makeup, soft window light from left,

shot on Canon 5D Mark IV with 85mm f/1.4 lens, shallow depth of field,

warm color grading, professional headshot style"



Product Photography:


"Minimalist ceramic coffee mug with steam rising from hot coffee inside,

center foreground on polished concrete surface, three-point softbox lighting,

clean professional aesthetic, shot on Hasselblad X2D with 80mm lens at f/2.8"



Landscape:


"Misty mountain valley at sunrise, layers of fog between pine-covered ridges,

golden light breaking through clouds, shot on Fujifilm X-T5 with 35mm f/1.4,

high dynamic range, natural color palette"




## JSON Structured Prompting

### When to Use JSON

✅ Production workflows requiring consistent structure
✅ Automation and programmatic generation
✅ Complex scenes with multiple subjects and relationships
✅ When you need to iterate on specific elements independently

### The Base Schema

{

"scene": "overall scene description",

"subjects": [

{

"description": "detailed subject description",

"position": "where in frame",

"action": "what they're doing"

}

],

"style": "artistic style",

"color_palette": ["#hex1", "#hex2", "#hex3"],

"lighting": "lighting description",

"mood": "emotional tone",

"background": "background details",

"composition": "framing and layout",

"camera": {

"angle": "camera angle",

"lens": "lens type",

"depth_of_field": "focus behavior"

}

}

### Extended Camera Schema

For photorealistic camera simulation, use detailed camera parameters:


{

"camera": {

"angle": "high angle",

"distance": "medium shot",

"focus": "Sharp focus on main subject",

"lens-mm": 85,

"f-number": "f/5.6",

"ISO": 200

}

}

### JSON Example: Product Photography

{

"scene": "Professional studio product photography setup with polished concrete surface",

"subjects": [

{

"description": "Minimalist ceramic coffee mug with steam rising from hot coffee inside",

"pose": "Stationary on surface",

"position": "Center foreground on polished concrete surface",

"color_palette": ["matte black ceramic"]

}

],

"style": "Ultra-realistic product photography with commercial quality",

"color_palette": ["matte black", "concrete gray", "soft white highlights"],

"lighting": "Three-point softbox setup creating soft, diffused highlights with no harsh shadows",

"mood": "Clean, professional, minimalist",

"background": "Polished concrete surface with studio backdrop",

"composition": "rule of thirds",

"camera": {

"angle": "high angle",

"distance": "medium shot",

"focus": "Sharp focus on steam rising from coffee and mug details",

"lens-mm": 85,

"f-number": "f/5.6",

"ISO": 200

}

}

### JSON Example: Multi-Subject Scene

{

"scene": "Urban rooftop garden at sunset",

"subjects": [

{

"description": "Young woman in casual summer dress watering plants",

"position": "left foreground",

"action": "pouring water from vintage copper watering can"

},

{

"description": "Tabby cat sitting on wooden bench",

"position": "right midground",

"action": "watching the woman curiously"

}

],

"style": "Cinematic lifestyle photography",

"color_palette": ["#FF6B35", "#F7931E", "#4ECDC4", "#1A535C"],

"lighting": "Golden hour sunlight from behind, creating rim light on subjects",

"mood": "Peaceful, warm, nostalgic",

"background": "City skyline silhouette with orange and purple sunset sky",

"composition": "rule of thirds, leading lines from garden rows",

"camera": {

"angle": "eye level",

"lens": "35mm prime",

"depth_of_field": "shallow, f/2.8, subject in focus, background softly blurred"

}

}

### Flattening JSON to Natural Language

You can include JSON directly in your prompt, or flatten it into natural language. FLUX.2 understands both formats.


JSON Version:


{

"scene": "Coffee shop interior",

"subjects": [{"description": "Barista making latte art", "position": "center"}],

"style": "Documentary photography",

"lighting": "Natural window light"

}



Flattened Natural Language Version:


"Coffee shop interior, barista making latte art in center frame,

documentary photography style, natural window light"




## Hex Color Control

### When to Use Hex Colors

✅ Brand consistency and design work
✅ Product photography with specific brand colors
✅ Precise color matching requirements
✅ Gradient and multi-color designs

### Basic Syntax

Signal hex colors with keywords like "color" or "hex" followed by the code:


"The vase has color #02eb3c"

"The background is hex #1a1a2e"

### Gradient Colors

Apply gradients by specifying start and end colors:


"A vase on a table in living room, the color of the vase is a gradient,

starting with color #02eb3c and finishing with color #edfa3c.

The flowers inside the vase have the color #ff0088"

### Hex Colors in JSON Prompts

Combine hex colors with structured prompts for maximum control:


{

"scene": "Makeup flat lay on marble surface",

"subjects": [

{

"description": "eyeshadow palette",

"colors": ["#E91E63", "#9C27B0", "#673AB7", "#3F51B5"]

}

],

"style": "beauty product photography",

"lighting": "soft diffused overhead lighting"

}

### Brand Color Matching Example

For precise brand color matching, break down products into components:


{

"scene": "A front-facing, studio product shot of an adidas sweatshirt, isolated on a clean white background",

"subjects": [

{

"type": "Main Torso",

"description": "The central chest and stomach panel of the sweatshirt, strictly in color #FFFFFF white",

"position": "center body",

"color_match": "exact"

},

{

"type": "Shoulder Panels",

"description": "The panels on the top of the shoulders (raglan style), strictly in color #000000 black",

"position": "shoulders",

"color_match": "exact"

},

{

"type": "Sleeves",

"description": "The long sleeves extending from the shoulder panels, strictly in color #86E04A lime green",

"position": "arms",

"color_match": "exact"

},

{

"type": "Brand Logo",

"description": "The Adidas Trefoil logo embroidered on the upper center chest, strictly in color #000000 black",

"position": "upper chest center",

"detail_preservation": "high"

}

],

"color_palette": ["#FFFFFF", "#86E04A", "#615E5E", "#000000"]

}

### Best Practices for Hex Colors

✅ Clearly associate colors with specific objects
"The chair has color #FF5733" works better than "use #FF5733 somewhere"


✅ Use color_match: "exact" in JSON for brand work
Signals that precise color matching is critical


✅ Combine with detailed object descriptions
"Matte ceramic vase in color #02eb3c" is better than "vase #02eb3c"


❌ Avoid vague color references
"Add some #FF0000" may produce inconsistent results



## Photorealistic Styles

### Style Reference Guide

FLUX.2 generates photorealistic images from simple, natural language prompts. Reference specific eras, cameras, and techniques for distinctive looks.


### Film Stock References

Referencing specific film stocks creates authentic analog aesthetics:


Kodak Portra 400 - Natural skin tones, fine grain, warm colors
Kodak Ektar 100 - Vivid colors, fine grain, high saturation
Fujifilm Pro 400H - Muted greens, soft contrast, pastel tones
Kodak Tri-X 400 - Classic black and white, prominent grain
Kodak Ektachrome 64 - Slide film, saturated colors, high contrast


Example:


"Portrait of a woman in autumn park, shot on Kodak Portra 400,

natural grain, warm organic colors, soft afternoon light"




## Camera and Lens Simulation

### Camera References for Photorealism

Be specific about camera settings for authentic results:


Basic Camera Reference:


"Shot on Hasselblad X2D, 80mm lens, f/2.8, natural lighting"



Detailed Camera Reference:


"Canon 5D Mark IV, 24-70mm at 35mm, golden hour, shallow depth of field,

ISO 200, 1/250 shutter speed"

### Popular Camera Bodies

High-End Digital:


Hasselblad X2D - Medium format, exceptional detail

Sony A7IV / A7R V - Full-frame mirrorless, versatile

Canon 5D Mark IV / R5 - Professional DSLR/mirrorless

Nikon Z9 - Professional sports and wildlife

Fujifilm X-T5 / GFX 100S - APS-C and medium format


Film Cameras:


Leica M6 - Iconic rangefinder, street photography

Canon AE-1 - Classic 35mm SLR

Pentax 67 - Medium format, distinctive look

### Lens Characteristics

Prime Lenses:


35mm f/1.4 - Street photography, environmental portraits

50mm f/1.8 - Standard lens, natural perspective

85mm f/1.4 - Portrait lens, beautiful bokeh

135mm f/2 - Telephoto portrait, compression


Zoom Lenses:


24-70mm f/2.8 - Professional standard zoom

70-200mm f/2.8 - Telephoto zoom, sports and events


Specialty Lenses:


14mm f/2.8 - Ultra-wide, architecture and landscapes

100mm f/2.8 Macro - Macro photography, extreme detail

### Aperture and Depth of Field

Wide Open (f/1.4 - f/2.8):


Shallow depth of field

Subject isolation with blurred background

Low-light capability

Dreamy, cinematic look


Mid-Range (f/4 - f/8):


Balanced depth of field

Sharp subject with some background detail

General photography sweet spot


Narrow (f/11 - f/16):


Deep depth of field

Everything in focus

Landscape photography

Architecture and product shots


Example - Portrait with Shallow DOF:


"Close-up portrait of a woman, shot on Canon 5D Mark IV with 85mm f/1.4 lens,

wide open aperture creating shallow depth of field, subject in sharp focus,

background softly blurred with creamy bokeh"



Example - Landscape with Deep DOF:


"Mountain landscape at sunrise, shot on Fujifilm GFX 100S with 23mm f/8,

deep depth of field with sharp focus from foreground rocks to distant peaks,

high dynamic range"




## Typography and Text Rendering

### FLUX.2 Typography Strengths

FLUX.2 excels at generating clean typography, product marketing materials, and magazine layouts.

### Text Rendering Best Practices

1. Use Quotation Marks


"The text 'OPEN' appears in red neon letters above the door"



2. Specify Placement


"Magazine cover with headline 'FUTURE DESIGN' at the top,

subheading 'The Next Generation' below, author name at bottom"



3. Describe Style


"elegant serif typography"

"bold industrial lettering"

"handwritten script"

"modern sans-serif font"



4. Specify Font Size


"large headline text"

"small body copy"

"medium subheading"



5. Use Hex Colors for Brand Text


"The logo text 'ACME' in color #FF5733"

### Typography Examples

Product Advertisement:


"Samsung Galaxy S25 Ultra product advertisement, 'Ultra-strong titanium' headline,

'Shielded in a strong titanium frame, your Galaxy S25 Ultra always stays protected' subtext,

close-up of phone edge showing titanium frame, dark gradient background,

clean minimalist tech aesthetic, professional product photography"



Magazine Cover:


"Women's Health magazine cover, April 2025 issue, 'Spring forward' headline,

woman in green outfit sitting on orange blocks, white sneakers,

'Covid: five years on' feature text, '15 skincare habits' callout,

professional editorial photography, magazine layout with multiple text elements"

### Infographics and Data Visualization

FLUX.2 can generate infographics with clean typography and structured layouts.


Infographic Template (JSON):


{

"type": "infographic",

"title": "Your Main Title",

"subtitle": "Supporting context",

"sections": [

{

"heading": "Section 1",

"content": "Key information",

"visual": "icon or chart type"

}

],

"color_scheme": ["#primary", "#secondary", "#accent"],

"style": "modern, clean, corporate"

}



Infographic Example (Natural Language):


"Create a vertical infographic about coffee consumption worldwide.

Title: 'Global Coffee Culture'. Include 3 sections with statistics,

use icons for each country, color scheme #4A2C2A (brown) and #F5E6D3 (cream).

Modern minimalist style with clean typography."




## Multi-Reference Image Editing

### When to Use Multi-Reference Editing

✅ Fashion shoots: Combine clothing items into styled outfits
✅ Interior design: Place furniture and decor in rooms
✅ Product composites: Combine multiple products in scenes
✅ Character consistency: Maintain identity across variations

### Multi-Reference Limits

FLUX.2 [pro]:


9MP total limit for input + output

At 1MP output: up to 8 reference images

At 2MP output: up to 7 reference images


FLUX.2 [flex]:


Up to 10 reference images

### Multi-Reference Best Practices

1. Describe How Each Input Should Be Used


"A spiritual architectural photograph featuring model standing before small forest chapel.

The model wears the red dress from image 1, the boots from image 2,

and the accessories from image 3. Position model on stone steps leading to wooden chapel,

red creating stark contrast against weathered brown timber."



2. Be Specific About Integration


Instead of: "Combine these images"
Use: "Place the chair from image 1 in the left corner of the room from image 2, add the lamp from image 3 on the side table"


3. Maintain Consistent Lighting and Style


"Combine furniture items into a cohesive living room scene.

All items should have consistent studio lighting with soft shadows,

matching the professional product photography aesthetic"

### Fashion Editorial Example (8 References)

"A spiritual architectural photograph captured on expired Kodak Ektachrome 64

slide film cross-processed from 1987 with a 35mm spherical lens at f/5.6,

featuring model standing before small forest chapel in clearing.

The model wears the outfit from images 1-5 (dress, boots, jacket, hat, accessories),

positioned on stone steps leading to wooden chapel, red creating stark contrast

against weathered brown timber. Background shows traditional Schwarzwald chapel -

dark wood construction with small bell tower, carved wooden door, religious paintings

under eaves, surrounding clearing with wild flowers, tall firs creating natural cathedral,

small cemetery with wooden crosses. Dappled forest light at 1/125.

Cross-processed Ektachrome showing extreme color shifts - cyan-magenta split,

warm wood tones pushed to orange-brown, oversaturated red, crushed black shadows,

blown highlights, heavy grain creating mysterious atmosphere."




## Advanced Techniques

### 1. Prompt Upsampling

FLUX.2 includes a prompt_upsampling parameter that automatically enhances your prompt.


When to Use:


Quick iterations without crafting detailed prompts

Exploring creative variations

When you have a basic concept but want richer output


How It Works: Prompt upsampling adds detail and context to your prompt automatically. Your original intent is preserved while the model expands on visual elements.


Example:


Your prompt: "A cat in a garden"

Upsampled: "A fluffy orange tabby cat sitting in a lush garden filled with colorful flowers, dappled sunlight filtering through leaves, peaceful afternoon atmosphere, natural colors, soft focus background"

### 2. Multi-Language Prompting

FLUX.2 understands multiple languages. Prompt in your native language for more culturally authentic results.


French:


"Un marché alimentaire dans la campagne normande, des marchands vendent divers légumes, fruits.

Lever de soleil, temps un peu brumeux"



Thai:


"ตลาดอาหารเช้าในชนบทใกล้กรุงเทพฯ พ่อค้าแม่ค้ากำลังขายผักและผลไม้นานาชนิด

บรรยากาศยามพระอาทิตย์ขึ้น มีหมอกจาง ๆ ปกคลุม สงบและอบอุ่น"



Korean:


"서울 도심의 옥상 정원, 저녁 노을이 지는 하늘 아래에서 사람들이 작은 등불을 켜고 있다.

화려한 네온사인이 멀리 반짝이고, 정원에는 다양한 꽃들이 피어 있다. 분위기는 따뜻하고 낭만적이다"



Why It Works: Prompting in the native language of the content you're creating often produces more culturally authentic results - local markets, architecture, and atmosphere are rendered with greater accuracy.

### 3. Comic Strips and Sequential Art

Create consistent comic panels with character continuity.


The Key: Define your character in detail and maintain that description across panels.


Character Description Template:


"[Character name], [age/gender], [skin tone], [hairstyle and color],

[distinctive clothing with specific colors and patterns], [accessories],

[facial features], [body type]"



Example - Diffusion Man:


"Diffusion Man, adult male superhero, brown skin tone, short natural fade haircut,

gradient bodysuit from purple to blue to pink, neural network emblem on chest,

purple half-mask covering upper face"



Panel 1 Prompt:


"Comic book panel: Diffusion Man, adult male superhero, brown skin tone,

short natural fade haircut, gradient bodysuit purple to blue to pink,

neural network emblem, purple half-mask. Standing in destroyed city street,

buildings crumbling, smoke rising. Dynamic action pose, concerned expression.

Bold comic book style with strong outlines."



Panel 2 Prompt:


"Comic book panel: Diffusion Man, adult male superhero, brown skin tone,

short natural fade haircut, gradient bodysuit purple to blue to pink,

neural network emblem, purple half-mask. Close-up of face, eyes glowing with energy,

determined expression. Energy crackling around him. Bold comic book style with strong outlines."



Character Consistency Tip: Repeat the detailed character description in every panel prompt to maintain visual consistency.

### 4. Seed Control for Reproducibility

Use the seed parameter to generate reproducible results:


seed: 42



When to Use:


Testing prompt variations while keeping composition consistent

Creating variations of a successful generation

Debugging and iteration workflows

### 5. Guidance and Steps Control (FLUX.2 [flex] only)

Guidance (1.5-10, default: 4.5):


Lower values (1.5-3): More creative freedom, less literal prompt following

Mid values (4-6): Balanced interpretation

Higher values (7-10): Strict prompt adherence


Steps (max 50):


Fewer steps (15-25): Faster generation, may lack fine details

More steps (35-50): Higher quality, more refined details



## Common Mistakes & Troubleshooting

### Issue 1: Text Not Rendering Correctly

Problem: Generated text is blurry, misspelled, or illegible


Solutions: ✅ Use quotation marks around exact text: "The text 'OPEN' appears..."
✅ Specify text style: "bold sans-serif typography"
✅ Describe placement: "headline at top center"
✅ Use hex colors for brand text: "logo text 'ACME' in color #FF5733"


Example - Before:


"A sign that says open"



Example - After:


"A neon sign with the text 'OPEN' in bright red letters, bold sans-serif font,

mounted above a wooden door"

### Issue 2: Colors Not Matching Brand Guidelines

Problem: Generated colors are close but not exact


Solutions: ✅ Use hex color codes: color #FF5733 or hex #FF5733
✅ In JSON, use color_match: "exact" for critical elements
✅ Break down products into components with specific colors
✅ Clearly associate colors with objects


Example - Before:


"A red chair"



Example - After:


"A chair in color #FF5733, matte finish"

### Issue 3: Composition Not Following Prompt

Problem: Elements are in wrong positions or missing


Solutions: ✅ Put most important elements first in prompt
✅ Use JSON structured prompts for complex scenes
✅ Specify positions: "left foreground", "right background"
✅ Use composition rules: "rule of thirds", "centered composition"


Example - JSON for Precise Positioning:


{

"scene": "Living room interior",

"subjects": [

{

"description": "Red velvet armchair",

"position": "left foreground"

},

{

"description": "Floor lamp with brass finish",

"position": "right side of armchair"

}

],

"composition": "rule of thirds"

}

### Issue 4: Style Not Photorealistic Enough

Problem: Generated image looks too "AI-generated" or lacks photographic authenticity


Solutions: ✅ Reference specific camera models: "shot on Canon 5D Mark IV"
✅ Specify lens and settings: "85mm f/1.4, shallow depth of field"
✅ Reference film stocks: "shot on Kodak Portra 400"
✅ Describe lighting in photographic terms: "three-point softbox lighting"


Example - Before:


"A portrait of a woman"



Example - After:


"Portrait of a woman, shot on Canon 5D Mark IV with 85mm f/1.4 lens,

natural window light from left, shallow depth of field, professional headshot style,

warm color grading"

### Issue 5: Multi-Reference Images Not Integrating Well

Problem: Reference images don't blend cohesively


Solutions: ✅ Describe how each reference should be used
✅ Maintain consistent lighting across all elements
✅ Specify style consistency: "all items should match professional product photography aesthetic"
✅ Use fewer references for simpler scenes


Example:


"Combine furniture items into a cohesive living room scene.

Place the sofa from image 1 centered against the back wall,

the coffee table from image 2 in front of the sofa,

and the floor lamp from image 3 to the left of the sofa.

All items should have consistent studio lighting with soft shadows,

matching the professional product photography aesthetic."

### Issue 6: Prompt Too Long or Complex

Problem: Prompt exceeds practical length or becomes unwieldy


Solutions: ✅ Use JSON structured prompts for complex scenes
✅ Focus on essential details, let FLUX.2 fill in secondary elements
✅ Break complex scenes into multiple generations
✅ Use prompt upsampling for automatic detail enhancement



## Best Practices

### 1. Structure for Control

Use JSON structured prompts when you need precise control over multiple elements.

### 2. Be Specific with Colors

Use hex codes for brand work and precise color matching.

### 3. Describe What You Want

FLUX.2 does not support negative prompts. Focus on what you want, not what you don't want.

### 4. Reference Camera and Style

For photorealism, specify camera models, lenses, and film stocks.

### 5. Use Native Languages

Prompt in the native language of the content for more culturally authentic results.

### 6. Layer Multi-Reference Carefully

Describe how each reference image should be integrated into the final composition.

### 7. Prioritize Important Elements

Put the most important elements at the beginning of your prompt.

### 8. Test with Seed Control

Use seed values to test prompt variations while keeping composition consistent.

### 9. Iterate Incrementally

Build complex prompts step by step, testing each addition.

### 10. Match Prompt Length to Complexity

Short prompts for simple concepts

Medium prompts for most projects

Long/JSON prompts for complex production work



## Genre-Specific Examples

### Portrait Photography

Professional Headshot:


"Corporate headshot of a man in navy blue suit and white shirt,

shot on Canon 5D Mark IV with 85mm f/1.8 lens, soft window light from left,

neutral gray background, shallow depth of field, professional business portrait style"



Environmental Portrait:


"Portrait of a chef in restaurant kitchen, shot on Sony A7IV with 35mm f/1.4 lens,

natural light from large windows, shallow depth of field with kitchen blurred in background,

professional editorial photography style, warm color grading"



Fashion Portrait:


"High fashion portrait of a model in avant-garde clothing, shot on Hasselblad X2D

with 80mm lens, dramatic studio lighting with single key light from above,

dark background, editorial fashion photography style, high contrast,

shot for Vogue magazine"

### Product Photography

E-commerce Product Shot:


"White ceramic mug isolated on pure white background, centered composition,

shot on Canon 5D Mark IV with 100mm macro lens, even studio lighting,

no shadows, clean e-commerce product photography"



Lifestyle Product Shot:


"Minimalist ceramic coffee mug on wooden table with morning newspaper and reading glasses,

natural window light from left, shot on Fujifilm X-T5 with 35mm f/1.4,

shallow depth of field, warm cozy atmosphere, lifestyle product photography"



High-End Product Shot:


{

"scene": "Luxury watch product photography on black marble surface",

"subjects": [

{

"description": "Swiss automatic watch with silver case and black leather strap",

"position": "center foreground, angled at 45 degrees",

"details": "visible watch face showing 10:10, polished case reflecting light"

}

],

"style": "Ultra-high-end luxury product photography",

"lighting": "Dramatic single key light from top-right creating specular highlights on watch case,

subtle fill light from left to reveal strap texture",

"background": "Black polished marble surface with subtle reflections",

"camera": {

"lens-mm": 100,

"f-number": "f/8",

"focus": "Tack sharp focus on watch face and case"

}

}

### Landscape Photography

Mountain Landscape:


"Dramatic mountain landscape at sunrise, layers of fog between pine-covered ridges,

golden light breaking through clouds, shot on Fujifilm GFX 100S with 23mm f/8,

deep depth of field, high dynamic range, natural color palette"



Urban Landscape:


"New York City skyline at blue hour, shot from Brooklyn Bridge,

long exposure creating light trails from traffic,

shot on Sony A7R V with 24mm f/11, deep depth of field,

high dynamic range, cool color grading"



Coastal Landscape:


"Rocky coastline at sunset, waves crashing against cliffs,

dramatic clouds with orange and purple sky,

shot on Canon R5 with 16-35mm at 16mm f/11,

long exposure creating smooth water effect,

high dynamic range, vivid colors"

### Editorial and Magazine

Magazine Cover:


"TIME magazine cover, June 2026 issue, 'The Future of AI' headline in bold red letters,

portrait of tech CEO in modern office, 'Exclusive Interview' subheading,

professional editorial photography, clean magazine layout with multiple text elements"



Fashion Editorial:


"High fashion editorial spread for Vogue, model in avant-garde designer dress,

minimalist white studio background, dramatic pose, shot on Hasselblad X2D with 80mm lens,

professional fashion photography, high contrast black and white"

### Marketing and Advertising

Tech Product Ad:


"iPhone 16 Pro product advertisement, 'Titanium. Tougher than ever.' headline in white text,

close-up of phone edge showing titanium frame with color #A8A9AD,

dark gradient background from #000000 to #1a1a2e,

clean minimalist tech aesthetic, professional product photography"



Automotive Ad:


"Luxury car advertisement, silver Mercedes-Benz S-Class on mountain road at sunset,

'Engineering Excellence' headline, dramatic lighting, shot on RED camera with anamorphic lens,

cinematic automotive photography, high-end commercial aesthetic"




## Quick Reference Table



## Integration with AI Filmmaking Workflow

### FLUX.2 in the Image-First Workflow

Phase 1: Hero Frame Generation


Use FLUX.2 [pro] or [max] for highest quality hero frames

Leverage JSON structured prompts for precise scene control

Use hex colors for brand consistency across shots

Reference specific cameras and lenses for cinematic look


Phase 2: Character Consistency


Use detailed character descriptions in every prompt

Maintain consistent lighting and camera settings

Use seed control to generate variations while keeping character consistent

Save successful character prompts for reuse across shots


Phase 3: Style Coherence


Define global style system using JSON schema

Use consistent color palettes across all shots

Reference same camera/lens/film stock for unified aesthetic

Use multi-reference editing to maintain visual consistency

### Cross-Model Translation

FLUX.2 → Cinema Studio:


Export FLUX.2 hero frames as reference images

Translate FLUX.2 camera settings to Cinema Studio parameters

Maintain color palette using hex codes

Use FLUX.2 for complex compositions, Cinema Studio for animation


FLUX.2 → Nano Banana Pro:


Use FLUX.2 for typography and text-heavy designs

Use Nano Banana Pro for photorealistic portraits

Maintain consistent lighting descriptions across models

Share color palettes between models



## Conclusion

FLUX.2 is a production-grade image generation model with exceptional capabilities in JSON structured prompting, hex color precision, typography, and photorealism. By mastering these techniques, you can create professional-quality images for any use case - from e-commerce product shots to high-end fashion editorials.


Key Takeaways:


Choose the right format: Natural language for simple scenes, JSON for complex production work

Be specific: Reference exact cameras, lenses, colors, and styles

Prioritize elements: Put the most important details first

No negative prompts: Describe what you want, not what you don't want

Use hex colors: For brand consistency and precise color matching

Multi-reference carefully: Describe how each reference should integrate

Iterate incrementally: Build complex prompts step by step


Resources:


Official Documentation: https://docs.bfl.ai/

Playground: https://bfl.ai/

API Documentation: https://docs.bfl.ai/api/

Community: https://discord.gg/blackforestlabs




Last Updated: February 2026
Model Version: FLUX.2 [max], [pro], [flex], [klein]


