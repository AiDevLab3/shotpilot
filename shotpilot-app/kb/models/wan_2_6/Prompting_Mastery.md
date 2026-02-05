# Wan 2.6 Prompting Mastery Guide

## Executive Summary

**Wan 2.6** represents a paradigm shift in AI video generation, developed by Alibaba (Kuaishou) as the first model to achieve true **simultaneous audio-visual generation**. Unlike traditional workflows that generate video first and add audio later, Wan 2.6 natively understands the relationship between sound and vision, producing synchronized multimedia content from a single prompt.

Built on a **Mixture of Experts (MoE) architecture**, Wan 2.6 activates specialized sub-models for different tasks, enabling efficient rendering of complex scenes with multiple elements. The model excels at **temporal stability** in 5-10 second clips, maintaining consistent character designs and object properties across hundreds of frames—a critical advancement over earlier models that struggled beyond 2-4 seconds.

**Key Capabilities:**
- Native audio-visual synchronization
- Multi-modal input processing (text, image, audio)
- 1080p resolution at 24 FPS
- Three generation modes: Text-to-Video, Image-to-Video, Reference-to-Video
- Multi-shot generation from single prompts
- Temporal consistency across 5-10 second durations

This guide provides comprehensive strategies for mastering Wan 2.6's unique capabilities, from fundamental prompt structures to advanced cinematic techniques.

---

## Table of Contents

1. [Technical Architecture](#technical-architecture)
2. [Generation Modes](#generation-modes)
3. [The 3-Pillar Prompt Framework](#the-3-pillar-prompt-framework)
4. [Quick Start: 3 Essential Test Prompts](#quick-start-3-essential-test-prompts)
5. [The 10-Prompt Benchmark Library](#the-10-prompt-benchmark-library)
6. [Image-to-Video Mastery](#image-to-video-mastery)
7. [Audio-Visual Synchronization](#audio-visual-synchronization)
8. [Cinematic Camera Control](#cinematic-camera-control)
9. [Temporal Consistency Strategies](#temporal-consistency-strategies)
10. [Advanced Techniques](#advanced-techniques)
11. [Common Pitfalls and Solutions](#common-pitfalls-and-solutions)
12. [Production Workflow](#production-workflow)
13. [Technical Specifications](#technical-specifications)

---

## Technical Architecture

### Mixture of Experts (MoE) Architecture

Wan 2.6 employs a **Mixture of Experts** architecture, fundamentally different from monolithic neural networks. Instead of processing every pixel through the entire model, MoE activates specialized sub-models (experts) for specific tasks.

**Practical Implications:**

**Efficient Multi-Element Rendering:** The model can simultaneously render a detailed background (landscape expert) and an expressive human face (portrait expert) without performance degradation. Earlier models would either slow down or sacrifice quality when handling multiple complex elements.

**Adaptive Resource Allocation:** Simple scenes (e.g., static landscape) use fewer computational resources, while complex scenes (e.g., crowded marketplace with multiple characters) activate more experts. This enables consistent generation speed regardless of scene complexity.

**Specialized Quality:** Each expert is trained on specific content types, resulting in superior quality for its domain. The fluid dynamics expert handles water, smoke, and fire with physics-accurate behavior, while the character animation expert maintains anatomical consistency.

### Native Multimodality

Unlike models that process text, image, and audio through separate pipelines and merge outputs, Wan 2.6 processes all modalities in a unified latent space.

**Cross-Modal Understanding:**

The model comprehends semantic relationships between modalities:
- **Visual-Audio Correlation:** When generating an explosion, the model understands the visual (expanding fireball, debris) should synchronize with audio (deep rumble, sharp crack).
- **Text-Image-Audio Synthesis:** A prompt describing "thunder and lightning" produces coordinated visual flashes, rumbling audio, and appropriate atmospheric changes.

**Practical Advantage:** You can describe audio events in your text prompt, and the model will generate matching visuals. For example, "footsteps echoing in empty hallway" produces both the visual of walking and synchronized footstep sounds with appropriate reverb.

### Temporal Stability

Wan 2.6's breakthrough in temporal consistency stems from its training on long-duration clips with explicit temporal coherence objectives.

**Frame-to-Frame Consistency:**

Traditional models process video as sequences of semi-independent frames, leading to "morphing" where character clothing, facial features, or object properties shift unpredictably. Wan 2.6 maintains a persistent representation of scene elements across the entire clip.

**5-10 Second Coherence Window:**

The model's optimal performance range is 5-10 seconds, where it maintains:
- **Character Identity:** Facial features, clothing, and accessories remain consistent
- **Object Permanence:** Props and environmental elements don't disappear or transform
- **Spatial Relationships:** Characters maintain correct positions relative to environment

**Temporal Coherence Mechanisms:**

The model employs attention mechanisms that reference earlier frames when generating later frames, ensuring continuity. This is particularly evident in:
- **Motion Continuity:** A character's arm movement follows a smooth trajectory
- **Lighting Consistency:** Shadows and highlights remain coherent with light source position
- **Physics Adherence:** Objects obey momentum and gravity across frames

---

## Generation Modes

Wan 2.6 supports three distinct generation modes, each optimized for different creative workflows.

### 1. Text-to-Video (T2V)

**Description:** Generate video entirely from text descriptions, with no visual reference input.

**Optimal Use Cases:**
- Conceptual visualization (abstract ideas, emotions)
- Quick prototyping and iteration
- Scenes difficult to photograph (fantasy, sci-fi, historical)
- Storyboarding and pre-visualization

**Strengths:**
- Maximum creative freedom
- No need for reference images
- Rapid iteration cycles

**Limitations:**
- Less control over specific visual details
- Character consistency across multiple generations challenging
- Requires detailed, precise prompts

**Example Prompt:**
```
Cinematic medium shot, elderly craftsman carving intricate wooden sculpture in candlelit workshop, warm amber lighting, dust particles floating in light beams, shallow depth of field, wrinkled hands with detailed texture, concentration expression, 24fps smooth motion
```

### 2. Image-to-Video (I2V)

**Description:** Animate a static image with motion described in text prompt.

**Optimal Use Cases:**
- Animating existing artwork or photographs
- Character consistency (use same reference image for multiple clips)
- Product demonstrations
- Architectural walkthroughs

**Strengths:**
- Precise control over initial visual state
- Character/object consistency guaranteed at start frame
- Combines benefits of static image generation with video

**Limitations:**
- Quality ceiling determined by reference image
- Anatomical errors in reference image multiply across frames
- Motion must be compatible with reference image composition

**Critical Rule:** Reference image quality defines 80% of I2V success. Always start with a perfect, high-resolution reference image free of anatomical errors, artifacts, or composition issues.

**Example Workflow:**
1. Generate perfect portrait using image model (e.g., FLUX.2, Seedream 4.5)
2. Use portrait as I2V reference
3. Prompt: "Subject turns head slowly to left, soft smile forming, hair moving gently, natural breathing motion"

### 3. Reference-to-Video

**Description:** Use reference image(s) to guide style, composition, or character appearance while generating new video content.

**Optimal Use Cases:**
- Style transfer (apply artistic style to video)
- Character consistency across different scenes
- Maintaining brand visual identity
- Recreating specific aesthetic from reference

**Strengths:**
- Balances creative freedom with visual consistency
- Enables character/style consistency without rigid constraints
- Flexible interpretation of reference

**Limitations:**
- Requires understanding of how model interprets references
- May not perfectly match reference in all aspects
- Requires experimentation to achieve desired fidelity

**Example Application:**
Reference: Portrait of character in specific costume
Prompt: "Character walking through futuristic city street, neon lights, rain, tracking shot following from behind"
Result: Character maintains costume and appearance from reference while performing new action in new environment

---

## The 3-Pillar Prompt Framework

Wan 2.6 prompts require three essential components for optimal results. Omitting any pillar results in unpredictable outputs.

### Pillar 1: Material (Subject and Physics)

**Purpose:** Define what exists in the scene and its physical properties.

**Key Elements:**

**Subject Identity:**
- Primary subject (character, object, environment)
- Secondary elements (props, background, atmosphere)
- Quantity and spatial relationships

**Physical Properties:**
- Weight and mass (affects movement speed and inertia)
- Material composition (metal, fabric, liquid, organic)
- Scale (relative size to environment)

**Why Physics Matters:**

The model uses physical properties to generate realistic motion. A "giant robot" should move with heavy, deliberate steps, while a "hummingbird" should exhibit rapid, jittery movements. Specifying weight adjectives guides the model's motion generation.

**Examples:**

**Heavy Subject:**
"Massive stone golem, weathered granite texture, each step causing ground tremors, slow deliberate movement, dust clouds rising"

**Light Subject:**
"Delicate butterfly, translucent wings catching sunlight, erratic fluttering motion, weightless drift on air currents"

**Liquid Subject:**
"Viscous honey pouring from jar, thick golden stream, slow flow, surface tension visible, pooling at base"

### Pillar 2: Dynamics (Camera and Movement)

**Purpose:** Control how the viewer perceives the scene through camera movement and framing.

**Cinematic Vocabulary:**

**Camera Movements:**
- **Tracking shot:** Camera follows subject laterally
- **Dolly in/out:** Camera moves toward/away from subject on track
- **Crane shot:** Camera moves vertically on crane
- **Handheld:** Organic, slightly shaky camera movement
- **Steadicam:** Smooth, floating camera movement
- **Orbit:** Camera circles around subject
- **Pan left/right:** Camera rotates horizontally on fixed axis
- **Tilt up/down:** Camera rotates vertically on fixed axis

**Framing:**
- **Extreme close-up (ECU):** Face detail, single object
- **Close-up (CU):** Head and shoulders
- **Medium shot (MS):** Waist up
- **Medium long shot (MLS):** Knees up
- **Long shot (LS):** Full body with environment
- **Extreme long shot (ELS):** Subject small in vast environment
- **Over-the-shoulder (OTS):** View from behind one character toward another

**Lens Characteristics:**
- **Wide angle (16-35mm):** Exaggerated perspective, deep depth of field
- **Standard (50mm):** Natural perspective
- **Telephoto (85-200mm):** Compressed perspective, shallow depth of field
- **Macro:** Extreme close-up of small subjects

**Movement Speed:**
- **Slow motion:** Emphasizes detail, creates drama
- **Real-time:** Natural pacing
- **Time-lapse:** Compresses long duration into seconds
- **Speed ramping:** Variable speed within single shot

**Example Prompts:**

"Tracking shot following runner from side, 50mm lens, medium shot, runner in center frame, background motion blur, smooth steadicam movement"

"Dolly zoom effect (vertigo effect), subject remains same size while background perspective shifts, dramatic psychological tension"

"Handheld POV shot, walking through crowded market, camera weaving between people, organic movement, immersive perspective"

### Pillar 3: Render (Atmosphere and Lighting)

**Purpose:** Define mood, realism, and visual quality through lighting and atmospheric effects.

**Lighting Terminology:**

**Natural Lighting:**
- **Golden hour:** Warm, soft light shortly after sunrise or before sunset
- **Blue hour:** Cool, diffused light just before sunrise or after sunset
- **Overcast:** Soft, even lighting with no harsh shadows
- **Direct sunlight:** Hard shadows, high contrast
- **Moonlight:** Cool, low-intensity, high contrast

**Artificial Lighting:**
- **Studio lighting:** Controlled, multi-source setup
- **Rim light:** Backlight creating edge highlight on subject
- **Key light:** Primary light source
- **Fill light:** Secondary light reducing shadow intensity
- **Practical lights:** Visible light sources in scene (lamps, candles, screens)

**Advanced Lighting:**
- **Volumetric lighting:** Visible light beams through atmosphere (god rays)
- **Ray tracing:** Physically accurate light reflections and refractions
- **Global illumination:** Realistic indirect lighting from bounced light
- **Subsurface scattering:** Light penetrating translucent materials (skin, wax, fruit)
- **Caustics:** Light patterns from refraction through transparent objects

**Atmospheric Effects:**
- **Volumetric fog:** Thick, light-scattering fog
- **Atmospheric haze:** Subtle depth-based fading
- **Particle effects:** Dust, smoke, rain, snow, embers
- **Lens effects:** Bokeh, lens flare, chromatic aberration, vignette

**Color Grading:**
- **Cinematic color grading:** Teal and orange, desaturated, high contrast
- **Warm palette:** Oranges, yellows, reds
- **Cool palette:** Blues, cyans, purples
- **Monochromatic:** Single color variations
- **High key:** Bright, low contrast
- **Low key:** Dark, high contrast

**Example Prompts:**

"Volumetric fog illuminated by neon signs, ray-traced reflections on wet pavement, global illumination creating ambient glow, cinematic color grading with teal and orange tones"

"Golden hour lighting, rim light creating edge glow on subject, soft shadows, warm color temperature, lens flare from sun, shallow depth of field with bokeh background"

"Low key lighting, single practical light source (candle), dramatic chiaroscuro, deep shadows, warm amber tones, subsurface scattering visible on skin"

### The Complete 3-Pillar Prompt Template

```
[MATERIAL: Subject + Physical Properties] + [DYNAMICS: Camera Movement + Framing + Lens] + [RENDER: Lighting + Atmosphere + Color]
```

**Example Application:**

**Material:** "Massive ancient dragon, scales reflecting light, powerful wings creating wind gusts, heavy body causing ground impact"

**Dynamics:** "Crane shot rising from ground level to dragon's eye level, 35mm wide angle lens, camera tilting up, slow steady movement"

**Render:** "Overcast sky with dramatic storm clouds, volumetric fog around dragon's body, ray-traced reflections on wet scales, cinematic color grading, atmospheric haze creating depth"

**Complete Prompt:**
"Massive ancient dragon with scales reflecting light, powerful wings creating wind gusts, heavy body causing ground impact, crane shot rising from ground level to dragon's eye level, 35mm wide angle lens, camera tilting up, slow steady movement, overcast sky with dramatic storm clouds, volumetric fog around dragon's body, ray-traced reflections on wet scales, cinematic color grading, atmospheric haze creating depth"

---

## Quick Start: 3 Essential Test Prompts

Before diving into complex projects, test Wan 2.6's capabilities with these three prompts designed to evaluate core strengths.

### Test 1: Portrait Quality (Skin and Light)

**Purpose:** Evaluate organic texture rendering and lighting accuracy.

**Prompt:**
```
Extreme close-up, 85mm lens, female model looking at camera, detailed skin texture, pores visible, vellus hair, soft studio lighting, rim light, shallow depth of field, 8k resolution, hyperrealistic
```

**What to Observe:**
- **Skin Texture:** Should see individual pores, fine lines, natural skin variation (not waxy or overly smooth)
- **Hair Detail:** Vellus hair (peach fuzz) visible with backlighting
- **Eye Detail:** Catchlights in eyes, iris texture, natural eye moisture
- **Lighting:** Soft gradients on face, rim light creating edge highlight
- **Depth of Field:** Sharp focus on eyes, gradual blur on background

**Success Criteria:**
✅ Photorealistic skin without artificial smoothing
✅ Natural eye movement (blinking, subtle shifts)
✅ Consistent lighting across frames
✅ No morphing of facial features

**Failure Indicators:**
❌ Waxy, plastic-looking skin
❌ Eyes that shift position or change color
❌ Facial features that subtly transform
❌ Unnatural lighting shifts

### Test 2: Animal Realism (Physics and Fur)

**Purpose:** Evaluate complex texture rendering in motion and physics simulation.

**Prompt:**
```
Slow motion close-up of a golden retriever dog shaking off water, water droplets flying everywhere in 4k, sunlight backlighting the droplets, highly detailed wet fur texture, bokeh background, joyful expression
```

**What to Observe:**
- **Fur Dynamics:** Thousands of individual fur strands moving independently
- **Water Physics:** Droplets following realistic trajectories with gravity
- **Slow Motion:** Smooth frame interpolation without stuttering
- **Lighting Interaction:** Sunlight refracting through water droplets
- **Expression:** Dog's joyful expression maintained throughout motion

**Success Criteria:**
✅ Fur moves with realistic weight and inertia
✅ Water droplets have proper physics (parabolic trajectories)
✅ Backlit droplets show light refraction
✅ Smooth slow-motion playback

**Failure Indicators:**
❌ Fur clumps moving as solid mass
❌ Water droplets moving in straight lines or defying gravity
❌ Stuttering or frame skipping in slow motion
❌ Dog's expression morphing unnaturally

### Test 3: Living Nature (Documentary Style)

**Purpose:** Evaluate temporal coherence in biological transformation.

**Prompt:**
```
Time-lapse of a pink lotus flower blooming, soft natural morning light, dew drops on petals, blurred jungle background, high quality, national geographic style, smooth transition
```

**What to Observe:**
- **Temporal Smoothness:** Gradual, continuous opening of petals
- **Biological Accuracy:** Petals unfold in realistic sequence
- **Lighting Consistency:** Morning light remains consistent throughout
- **Detail Preservation:** Dew drops and petal texture maintained
- **Background Stability:** Blurred background doesn't shift or morph

**Success Criteria:**
✅ Smooth, continuous petal movement
✅ Realistic blooming sequence
✅ Consistent lighting and color temperature
✅ Stable background throughout

**Failure Indicators:**
❌ Petals jump between positions
❌ Flower structure morphs unnaturally
❌ Lighting shifts inconsistently
❌ Background elements appear/disappear

---

## The 10-Prompt Benchmark Library

This comprehensive benchmark library tests Wan 2.6's full capability spectrum, from basic rendering to advanced temporal coherence. Use these prompts to evaluate model performance and understand its strengths and limitations.

### Phase 1: Physical World (Render and Physics)

#### Benchmark 1: The Rendering Test (Macro Texture)

**Objective:** Evaluate sharpness and physics of translucent materials.

**Prompt:**
```
Macro shot of a fresh lemon slice dropping into sparkling water, high speed photography, air bubbles rising, detailed pulp texture, backlit by sunlight, 8k resolution, refreshing atmosphere
```

**Evaluation Criteria:**

**❌ Bad Results:**
- Water looks like solid gelatin (no fluid dynamics)
- Lemon texture is blurred or overly smooth
- Bubbles are uniform spheres without variation
- No light refraction through water or lemon

**✅ Good Results:**
- Individual bubbles are sharp with size variation
- Light passes through lemon pulp (subsurface scattering)
- Water surface shows realistic ripples and refraction
- Bubbles rise with realistic physics (faster near surface)

**Technical Insight:** This test evaluates the fluid dynamics expert and subsurface scattering rendering. Success indicates the model can handle product commercials and food photography.

#### Benchmark 2: Movement Dynamics (Complex Action)

**Objective:** Evaluate body consistency at high speed.

**Prompt:**
```
Professional parkour athlete jumping between rooftops, dynamic low angle, motion blur, debris flying, 60fps fluid motion, cinematic color grading
```

**Evaluation Criteria:**

**❌ Bad Results:**
- Athlete gains extra limbs during jump
- Legs pass through ground or building
- Body loses volume (becomes flat)
- Motion blur applied inconsistently

**✅ Good Results:**
- Consistent anatomy from start to finish
- Real physical weight at landing moment (impact, knee bend)
- Motion blur appropriately applied to fast-moving limbs
- Debris follows realistic physics

**Technical Insight:** This test evaluates the character animation expert and physics simulation. Failure here indicates the model will struggle with action sequences and sports content.

#### Benchmark 3: Camera Control (Drone FPV)

**Objective:** Evaluate 3D spatial coherence and rendering speed.

**Prompt:**
```
FPV drone shot, flying fast through a narrow canyon, river below, rock textures, banking left, speed ramping, immersive perspective
```

**Evaluation Criteria:**

**What to Observe:**
- Rocks at screen edges pass quickly with correct motion blur
- Perspective shifts accurately as camera banks left
- River below maintains consistent position and flow
- No "melting" or geometric distortion of rocks

**✅ Good Results:**
- Smooth, immersive flight path
- Accurate perspective shifts during banking
- Consistent rock textures without morphing
- Realistic speed ramping (acceleration/deceleration)

**❌ Bad Results:**
- Rocks change shape as they move past camera
- Perspective shifts feel unnatural or disorienting
- River appears/disappears or shifts position
- Stuttering during speed changes

**Technical Insight:** This test evaluates 3D spatial understanding and motion blur rendering. Success indicates the model can handle complex camera movements and POV shots.

#### Benchmark 4: Fluid Physics (Product Commercial)

**Objective:** Evaluate particle simulation and liquid interaction.

**Prompt:**
```
Luxury perfume bottle spinning in the air, golden liquid splashing around it, slow motion, refraction, studio lighting, water droplets freezing
```

**Evaluation Criteria:**

**What to Observe:**
- Light refracts through liquid and glass realistically
- Liquid maintains volume (doesn't disappear or multiply)
- Droplets have proper surface tension (spherical shape)
- Bottle rotation is smooth and consistent

**✅ Good Results:**
- Realistic light refraction creating caustics
- Liquid follows physics (cohesion, surface tension)
- Droplets are spherical with slight variation
- Smooth bottle rotation without morphing

**❌ Bad Results:**
- Light passes through liquid without refraction
- Liquid volume changes inconsistently
- Droplets are irregular or geometric shapes
- Bottle shape shifts during rotation

**Technical Insight:** This test evaluates ray tracing and fluid simulation. Success indicates the model can handle high-end product commercials and luxury brand content.

### Phase 2: Time and Emotion (The AI Frontier)

#### Benchmark 5: Long-Duration Narrative (Temporal Stability)

**Objective:** Evaluate temporal stability in 5+ second clips.

**Prompt:**
```
A lone astronaut walking on Mars surface towards a giant monolith, wide shot, dust storms, camera tracking forward strictly, consistent character suit
```

**Evaluation Criteria:**

**❌ Bad Results (Morphing):**
- Astronaut suit design changes (color, details) every few seconds
- Helmet shape shifts subtly
- Backpack or equipment appears/disappears
- Monolith changes shape or position

**✅ Good Results:**
- Helmet and suit remain identical from frame 0 to frame 150
- Equipment stays consistent (same backpack, tools, patches)
- Monolith maintains exact shape and position
- Dust storm effects consistent throughout

**Technical Insight:** This is the critical test for narrative filmmaking. If the model fails here, any long-form storytelling becomes unviable. Success indicates the model can maintain character consistency across scenes.

#### Benchmark 6: Emotional Narrative (Micro-Consistency)

**Objective:** Evaluate semantic subtlety and facial muscle control.

**Prompt:**
```
Cinematic medium shot, elderly man reading a letter, hands trembling slightly, a single tear rolling down cheek, expression changing from sorrow to relief
```

**Evaluation Criteria:**

**What to Observe:**
- Expression transition should be gradual (2-3 seconds)
- Tear should follow natural path down cheek
- Hand trembling should be subtle, not exaggerated
- Eyes should show emotion (watering, slight squinting)

**✅ Good Results:**
- Smooth expression transition without "jumps"
- Natural tear physics (follows facial contours)
- Subtle hand tremor (not seizure-like)
- Eyes convey emotion through micro-expressions

**❌ Bad Results (Uncanny Valley):**
- Expression jumps abruptly between emotions
- Tear moves in straight line or defies gravity
- Hand trembling is violent or inconsistent
- Facial features distort during transition

**Technical Insight:** This test evaluates emotional intelligence and facial animation. Success indicates the model can handle dramatic scenes and character-driven narratives.

#### Benchmark 7: Artistic Stylization (Anime/2D)

**Objective:** Evaluate fidelity to 2D style and color palette.

**Prompt:**
```
Anime style, Makoto Shinkai aesthetics, shooting star crossing a purple night sky, vibrant colors, lens flare, highly detailed clouds, 2D animation look
```

**Evaluation Criteria:**

**What to Observe:**
- Video should look like hand-drawn animation
- Colors should be vibrant, not realistic
- Shooting star should have stylized trail
- Clouds should have 2D painted appearance

**✅ Good Results:**
- Authentic 2D animation aesthetic
- Vibrant, saturated colors
- Stylized lens flare (not photorealistic)
- Clouds have painted, layered appearance

**❌ Bad Results:**
- Looks like 3D model attempting 2D style
- Colors are muted or realistic
- Lens flare is photorealistic (breaks 2D illusion)
- Clouds have 3D volumetric appearance

**Technical Insight:** This test evaluates style transfer and artistic rendering. Success indicates the model can handle anime, illustration, and stylized content beyond photorealism.

#### Benchmark 8: Architectural Timelapse

**Objective:** Evaluate temporal global illumination logic.

**Prompt:**
```
Modern minimalist living room, timelapse video, sunlight shadows moving across the floor and furniture, day turning into evening, photorealistic
```

**Evaluation Criteria:**

**What to Observe:**
- Shadows should move in consistent direction (following sun path)
- Color temperature should shift (warm morning → cool midday → warm evening)
- Shadow length should change (short at noon, long at evening)
- Furniture should remain completely static

**✅ Good Results:**
- Shadows move synchronized with supposed sun position
- Color temperature shifts naturally
- Shadow length changes appropriately
- Furniture stays perfectly static (no drifting)

**❌ Bad Results:**
- Shadows move inconsistently or in wrong direction
- Color temperature stays constant or shifts randomly
- Shadow length doesn't change
- Furniture subtly shifts position

**Technical Insight:** This test evaluates global illumination and temporal lighting consistency. Success indicates the model understands light physics and can handle architectural visualization.

#### Benchmark 9: Volumetric Atmosphere

**Objective:** Evaluate rendering of multiple environment layers.

**Prompt:**
```
Cyberpunk street level, heavy rain, neon lights reflecting on wet pavement, volumetric fog, steam rising from vents, people with umbrellas
```

**Evaluation Criteria:**

**What to Observe:**
- Complex interaction between colored neon light, falling rain, and fog
- Reflections on wet pavement should mirror neon signs
- Steam should interact with light (volumetric scattering)
- Rain should have motion blur and proper physics

**✅ Good Results:**
- Neon lights create colored reflections on wet ground
- Fog scatters light creating atmospheric glow
- Steam rises naturally and interacts with light
- Rain has proper motion blur and trajectories

**❌ Bad Results:**
- Reflections are absent or incorrect
- Fog is uniform gray (no light scattering)
- Steam moves unnaturally or disappears
- Rain looks like white lines (no physics)

**Technical Insight:** This test evaluates volumetric rendering and multi-layer compositing. Success indicates the model can handle complex atmospheric scenes and cinematic environments.

#### Benchmark 10: Creative/Text (Experimental)

**Objective:** Evaluate OCR/Text Generation capability.

**Prompt:**
```
Neon sign on a brick wall flickering the word "FUTURE", electrical sparks, dark alley, cinematic lighting
```

**Evaluation Criteria:**

**⚠️ Note:** Generating legible text is the "Holy Grail" of AI video. This capability is experimental and may not be fully realized in current versions.

**What to Observe:**
- Is the word "FUTURE" legible?
- Does the text remain consistent across frames?
- Do letters flicker realistically (not morph)?
- Are electrical sparks physically accurate?

**✅ Good Results:**
- Text is clearly legible
- Letters remain consistent (no morphing)
- Flickering is realistic (entire sign, not individual letters)
- Sparks have proper physics

**❌ Bad Results:**
- Text is illegible or wrong word
- Letters morph or shift
- Flickering causes letters to change
- Sparks move unnaturally

**Technical Insight:** This test evaluates text rendering, a frontier capability. Success indicates the model has reached a milestone in OCR/text generation, enabling signage, titles, and text-based content.

---

## Image-to-Video Mastery

Image-to-Video (I2V) is Wan 2.6's most powerful mode for achieving consistency and control. Mastering I2V requires understanding the relationship between reference image quality and video output.

### The 80% Rule

**Critical Principle:** Reference image quality defines 80% of I2V success.

The model cannot fix problems in the reference image—it can only animate what exists. Anatomical errors, artifacts, composition issues, and quality problems in the reference image will be amplified across 24 frames per second.

**Implication:** Always start with a perfect reference image. Invest time in generating or selecting the highest quality reference possible before attempting I2V.

### Reference Image Requirements

**Technical Specifications:**
- **Resolution:** Minimum 1080p, preferably 2K or 4K
- **Format:** PNG or high-quality JPEG (minimal compression)
- **Aspect Ratio:** Match desired video output (16:9 for landscape, 9:16 for portrait)
- **Sharpness:** In-focus subject with appropriate depth of field
- **Lighting:** Even, consistent lighting without harsh shadows or blown highlights

**Compositional Requirements:**
- **Subject Placement:** Subject positioned to allow desired motion
- **Headroom:** Adequate space around subject for movement
- **Background:** Clean, non-distracting background (unless background motion desired)
- **Pose:** Natural pose compatible with intended animation

**Quality Requirements:**
- **No Anatomical Errors:** Correct number of fingers, proper joint positions, accurate facial features
- **No Artifacts:** No AI generation artifacts, compression artifacts, or noise
- **No Text/Watermarks:** Clean image without overlays (unless intentional)
- **Consistent Style:** Unified artistic style throughout image

### Generating Perfect Reference Images

**Recommended Image Models:**
- **FLUX.2:** JSON-structured prompting, precise control
- **Seedream 4.5:** Best-in-class text rendering, 4K generation
- **Kling O1 Image:** Photorealistic, prompt-accurate
- **Wan 2.2 Image:** Photorealistic with detailed human rendering

**Reference Generation Workflow:**

**Step 1: Generate Multiple Candidates**
Generate 4-8 variations using your chosen image model with identical prompts but different seeds.

**Step 2: Rigorous Selection**
Examine each candidate at 100% zoom:
- Check finger count and hand anatomy
- Verify facial symmetry and feature placement
- Inspect for artifacts or inconsistencies
- Evaluate overall composition

**Step 3: Refinement (if needed)**
If no candidate is perfect:
- Use inpainting to fix minor issues
- Regenerate with adjusted prompts
- Upscale using Topaz for resolution enhancement

**Step 4: Final Validation**
Before using as I2V reference:
- View at full resolution
- Check all critical areas (hands, face, edges)
- Confirm composition allows desired motion

### I2V Prompt Strategy

Unlike T2V where the prompt describes the entire scene, I2V prompts describe only the motion and changes applied to the reference image.

**I2V Prompt Structure:**

```
[Motion Description] + [Camera Movement] + [Atmospheric Changes]
```

**Motion Description:**
- What moves (subject, camera, or both)
- Direction and speed of movement
- Type of motion (smooth, jerky, organic)

**Camera Movement:**
- Camera motion relative to subject
- Zoom, pan, tilt, or static
- Lens effects (focus shifts, depth of field changes)

**Atmospheric Changes:**
- Lighting shifts
- Weather changes
- Particle effects

**Example I2V Prompts:**

**Portrait Animation:**
```
Reference: Portrait of woman looking at camera
Prompt: Subject turns head slowly to the right, soft smile forming, hair moving gently with head turn, natural breathing motion, eyes following camera, shallow depth of field maintained
```

**Landscape Animation:**
```
Reference: Mountain landscape at sunset
Prompt: Camera slowly pans right revealing more mountain range, clouds moving left to right, golden hour light intensifying, birds flying across frame, atmospheric haze creating depth
```

**Product Animation:**
```
Reference: Luxury watch on display
Prompt: Camera orbits around watch clockwise, watch rotating slowly counter-clockwise, light reflections moving across crystal, shallow depth of field with background blur, studio lighting maintained
```

### Common I2V Mistakes

**Mistake 1: Describing What's Already in the Image**

❌ Bad I2V Prompt:
"Beautiful woman with long brown hair wearing red dress standing in garden with flowers"

✅ Good I2V Prompt:
"Woman walks forward slowly, dress flowing, hair moving gently in breeze, camera tracking with subject"

**Explanation:** The reference image already shows the woman, hair, dress, and garden. The I2V prompt should describe motion, not the static scene.

**Mistake 2: Requesting Motion Incompatible with Reference**

❌ Bad:
Reference shows person sitting in chair
Prompt: "Person stands up and walks away"

**Explanation:** Complex motion like standing requires the model to generate new poses and perspectives not present in the reference. This often results in morphing or anatomical errors.

✅ Good:
"Person shifts weight in chair, crosses legs, turns head to look left, natural breathing motion"

**Mistake 3: Using Low-Quality Reference Images**

❌ Bad Reference:
- Blurry image
- Compressed JPEG with artifacts
- Anatomical errors (wrong number of fingers)
- Poor composition

**Result:** All problems multiply across video frames, creating unusable output.

✅ Good Reference:
- Sharp, high-resolution image
- Minimal compression
- Anatomically correct
- Well-composed

### Advanced I2V Techniques

**Technique 1: Subtle Motion for Realism**

For portraits and character shots, subtle motion creates realism without risking morphing:

```
Natural breathing motion, slight head movement (micro-adjustments), eyes blinking naturally, hair moving gently, fabric subtle movement from breathing
```

**Technique 2: Camera Motion for Static Subjects**

When subject should remain static, use camera motion to create dynamic video:

```
Camera slowly dollies in toward subject, shallow depth of field with background gradually blurring, lighting consistent, subject remains perfectly still
```

**Technique 3: Environmental Animation**

Animate environment while keeping subject static:

```
Subject remains still, background clouds moving right to left, leaves falling gently, atmospheric haze creating depth, lighting shifting subtly as clouds pass
```

**Technique 4: Multi-Stage Animation**

For complex motion, chain multiple I2V generations:

**Stage 1:**
Reference: Character standing
Prompt: "Character turns head to left"
Output: Video of head turn

**Stage 2:**
Reference: Final frame of Stage 1 video
Prompt: "Character raises right hand in wave"
Output: Video of wave

**Result:** Complex multi-action sequence with maintained consistency.

---

## Audio-Visual Synchronization

Wan 2.6's breakthrough feature is **native audio-visual synchronization**—the model generates audio and video simultaneously with semantic understanding of their relationship.

### How Native Audio-Visual Sync Works

Traditional video models generate silent video, then add audio in post-production. Wan 2.6 processes audio and visual information in a unified latent space, understanding semantic relationships:

**Visual Event → Audio Correlation:**
- Footsteps on wood → Hollow tapping sound
- Glass shattering → Sharp, high-frequency crack
- Thunder → Deep, rolling rumble
- Fire → Crackling, popping sounds

**Audio Event → Visual Correlation:**
- Explosion sound → Expanding fireball, debris
- Whisper → Minimal mouth movement, intimate framing
- Scream → Wide mouth, tense facial muscles

### Describing Audio in Text Prompts

To leverage native audio-visual sync, describe audio events in your text prompt alongside visual descriptions.

**Audio Description Elements:**

**Sound Source:**
- What creates the sound (footsteps, wind, machinery)
- Diegetic (exists in scene) vs. non-diegetic (soundtrack)

**Sound Characteristics:**
- Volume (loud, quiet, whisper, roar)
- Pitch (high, low, deep, shrill)
- Timbre (hollow, metallic, organic, synthetic)
- Rhythm (steady, irregular, rhythmic, chaotic)

**Acoustic Environment:**
- Reverb (echo in canyon, cathedral)
- Dampening (muffled in snow, absorbed by fabric)
- Distance (close, far, approaching, receding)

**Example Prompts with Audio:**

**Footsteps:**
```
POV shot walking through empty warehouse, footsteps echoing on concrete floor, metallic reverb, distant dripping water, industrial atmosphere, handheld camera
```

**Natural Environment:**
```
Forest clearing at dawn, birds chirping in distance, gentle wind rustling leaves, distant stream babbling, soft morning light filtering through trees, peaceful atmosphere
```

**Urban Environment:**
```
Busy city intersection, car horns honking, distant sirens, footsteps on pavement, muffled conversations, urban soundscape, traffic noise, handheld camera weaving through crowd
```

**Dramatic Scene:**
```
Thunder rumbling in distance, rain pattering on roof, wind howling through broken window, creaking floorboards, tense atmosphere, low key lighting, abandoned house interior
```

### Audio-Visual Sync Best Practices

**Practice 1: Match Audio to Visual Intensity**

Visual and audio intensity should correlate:

**Subtle Visual → Subtle Audio:**
"Close-up of butterfly landing on flower, soft flutter of wings, gentle breeze, quiet natural ambiance"

**Intense Visual → Intense Audio:**
"Explosion erupting from building, deafening blast, debris crashing, glass shattering, chaotic soundscape"

**Practice 2: Use Audio to Enhance Realism**

Audio cues that match visual events dramatically increase perceived realism:

**Without Audio Description:**
"Person walking on gravel path"

**With Audio Description:**
"Person walking on gravel path, crunching footsteps with each step, small stones shifting, rhythmic walking pace"

**Result:** Audio description guides model to generate matching footstep sounds, significantly enhancing realism.

**Practice 3: Describe Acoustic Environment**

Acoustic environment affects how sounds are perceived:

**Cathedral:**
"Voice echoing in vast cathedral, long reverb tail, sound reflecting off stone walls, sacred atmosphere"

**Padded Room:**
"Voice in soundproofed studio, no echo, dry acoustic, intimate sound, close microphone perspective"

**Canyon:**
"Shout echoing through canyon, multiple reflections, sound bouncing between rock walls, long delay"

**Practice 4: Sync Audio Rhythm to Visual Rhythm**

Match audio and visual pacing:

**Slow Visual → Slow Audio:**
"Slow motion water droplet falling, deep resonant splash sound stretched in time, smooth motion"

**Fast Visual → Fast Audio:**
"High-speed chase, rapid footsteps, heavy breathing, quick camera pans, urgent pacing"

### Custom Audio Workflow

While Wan 2.6 generates native audio, you may want precise control over audio. The custom audio workflow allows you to provide your own audio file.

**Custom Audio Workflow:**

**Step 1: Generate Silent Video**
Create video with visual-only prompt (omit audio descriptions):
```
Musician playing violin, bow moving across strings, fingers pressing frets, concentrated expression, studio lighting
```

**Step 2: Create or Source Audio**
- Record actual violin performance
- Generate audio using AI audio tools
- Source royalty-free audio from libraries

**Step 3: Sync Audio to Video**
- Import video and audio into editing software
- Align audio events with visual events (bow movement with notes)
- Adjust timing for perfect sync

**Step 4: Export Final Video**
Export combined video with custom audio track.

**When to Use Custom Audio:**

- **Music Videos:** Sync to specific song or composition
- **Dialogue:** Precise lip-sync with recorded dialogue
- **Sound Design:** Professional sound effects and mixing
- **Brand Audio:** Specific audio branding or jingles

---

## Cinematic Camera Control

Wan 2.6's camera control capabilities enable professional cinematography without physical equipment. Understanding cinematic language is essential for directing the model's virtual camera.

### Camera Movement Types

#### 1. Static Camera

**Description:** Camera remains fixed in position and orientation.

**Use Cases:**
- Formal interviews
- Observational documentary
- Emphasizing subject motion against stable frame

**Prompt Example:**
```
Static camera, tripod-mounted, medium shot, subject walking toward camera, background out of focus, subject entering from distance and filling frame
```

**Technical Note:** Specify "static camera" explicitly, as model may default to subtle camera motion.

#### 2. Pan (Horizontal Rotation)

**Description:** Camera rotates horizontally on fixed axis (left or right).

**Use Cases:**
- Revealing landscape
- Following subject moving laterally
- Establishing spatial relationships

**Prompt Example:**
```
Camera pans right slowly, revealing mountain range, starting with single peak and ending with full panorama, golden hour lighting, smooth motion
```

**Variations:**
- **Whip Pan:** Extremely fast pan creating motion blur
- **Motivated Pan:** Pan following moving subject

#### 3. Tilt (Vertical Rotation)

**Description:** Camera rotates vertically on fixed axis (up or down).

**Use Cases:**
- Revealing height (tilting up tall building)
- Emphasizing scale
- Dramatic reveals

**Prompt Example:**
```
Camera tilts up from character's feet to face, low angle perspective, dramatic reveal, character looking down at camera, backlit silhouette
```

#### 4. Dolly (Linear Movement)

**Description:** Camera moves toward (dolly in) or away from (dolly out) subject on track.

**Use Cases:**
- Emphasizing subject (dolly in)
- Revealing context (dolly out)
- Creating intimacy or distance

**Prompt Example:**
```
Slow dolly in toward character's face, starting medium shot ending extreme close-up, shallow depth of field, background gradually blurring, emotional intensity building
```

**Technical Note:** Dolly creates parallax (foreground and background move at different rates), unlike zoom which doesn't change perspective.

#### 5. Tracking/Trucking (Lateral Movement)

**Description:** Camera moves laterally (left or right) parallel to subject.

**Use Cases:**
- Following walking character
- Revealing environment alongside subject
- Dynamic action scenes

**Prompt Example:**
```
Tracking shot following runner from side, camera moving at same speed as subject, runner in center frame, background motion blur, urban environment, smooth steadicam movement
```

#### 6. Crane/Boom (Vertical Movement)

**Description:** Camera moves vertically (up or down) on crane or boom.

**Use Cases:**
- Establishing shots (rising to reveal environment)
- Dramatic emphasis (descending to subject)
- Transitioning between scales

**Prompt Example:**
```
Crane shot rising from ground level to aerial view, starting with close-up of character and ending with wide shot of entire city, smooth ascending motion, revealing scale
```

#### 7. Orbit/Arc

**Description:** Camera circles around subject while maintaining focus.

**Use Cases:**
- Product showcases
- Revealing 360° view of subject
- Dynamic character introductions

**Prompt Example:**
```
Camera orbits clockwise around sculpture, completing 180-degree arc, sculpture remains in center frame, lighting revealing different angles, smooth circular motion
```

#### 8. Handheld

**Description:** Organic, slightly shaky camera movement simulating handheld operation.

**Use Cases:**
- Documentary realism
- Immersive POV
- Chaotic or tense scenes

**Prompt Example:**
```
Handheld camera, organic movement with subtle shake, following character through crowded market, immersive perspective, documentary style, natural imperfections
```

#### 9. Steadicam

**Description:** Smooth, floating camera movement combining mobility with stability.

**Use Cases:**
- Following characters through complex environments
- Long continuous shots
- Professional, polished look

**Prompt Example:**
```
Steadicam shot following character through house, smooth floating motion, camera weaving through doorways, continuous shot, cinematic quality
```

#### 10. Dolly Zoom (Vertigo Effect)

**Description:** Dolly and zoom simultaneously in opposite directions, keeping subject same size while background perspective shifts.

**Use Cases:**
- Psychological tension
- Disorientation
- Dramatic realization moments

**Prompt Example:**
```
Dolly zoom effect, camera dollying back while zooming in, subject remains same size, background perspective compressing dramatically, vertigo effect, psychological tension
```

### Lens Selection

Lens choice dramatically affects perspective, depth of field, and visual aesthetic.

#### Wide Angle (16-35mm)

**Characteristics:**
- Exaggerated perspective
- Deep depth of field (more in focus)
- Distortion at edges
- Sense of space and scale

**Use Cases:**
- Establishing shots
- Cramped interiors (makes spaces feel larger)
- Action scenes (dynamic perspective)

**Prompt Example:**
```
16mm wide angle lens, exaggerated perspective, deep depth of field, interior of small apartment feeling spacious, slight barrel distortion at edges
```

#### Standard (40-60mm)

**Characteristics:**
- Natural perspective (similar to human vision)
- Moderate depth of field
- Minimal distortion
- Versatile for most scenes

**Use Cases:**
- General purpose
- Natural-looking scenes
- Documentary

**Prompt Example:**
```
50mm lens, natural perspective, moderate depth of field, documentary style, realistic proportions, no distortion
```

#### Telephoto (70-200mm)

**Characteristics:**
- Compressed perspective (background appears closer)
- Shallow depth of field (easy background blur)
- Flattering for portraits
- Isolates subject from background

**Use Cases:**
- Portraits
- Isolating subjects
- Compressed cityscapes

**Prompt Example:**
```
85mm lens, compressed perspective, shallow depth of field, portrait of subject with creamy bokeh background, subject isolated, flattering compression
```

#### Macro

**Characteristics:**
- Extreme close-up capability
- Very shallow depth of field
- Reveals minute details
- Magnified perspective

**Use Cases:**
- Product details
- Nature close-ups (insects, flowers)
- Texture emphasis

**Prompt Example:**
```
Macro lens, extreme close-up of butterfly wing, intricate scale patterns visible, very shallow depth of field, only center in focus, magnified detail
```

### Framing and Composition

#### Rule of Thirds

**Description:** Divide frame into 3x3 grid, place important elements on grid lines or intersections.

**Prompt Example:**
```
Rule of thirds composition, subject positioned on right vertical third, eyes on upper horizontal third, negative space on left, balanced composition
```

#### Leading Lines

**Description:** Use lines in scene to guide viewer's eye toward subject.

**Prompt Example:**
```
Railroad tracks leading toward horizon, subject walking on tracks toward camera, leading lines creating depth, vanishing point composition
```

#### Symmetry

**Description:** Balanced composition with mirrored elements.

**Prompt Example:**
```
Symmetrical composition, subject centered in frame, architectural elements mirrored on left and right, formal balanced aesthetic, Wes Anderson style
```

#### Depth Layering

**Description:** Foreground, midground, and background elements creating depth.

**Prompt Example:**
```
Layered composition, flowers in foreground (out of focus), subject in midground (in focus), mountains in background (slightly out of focus), depth created through layers
```

### Advanced Camera Techniques

#### Technique 1: Motivated Camera Movement

Camera movement motivated by subject action creates natural, professional feel.

**Example:**
```
Camera pans right following subject's gaze, motivated by subject looking off-screen, smooth pan revealing what subject sees, natural camera motivation
```

#### Technique 2: Dynamic Reframing

Camera adjusts framing to maintain optimal composition as subject moves.

**Example:**
```
Subject walking toward camera, camera slowly tilting up to maintain headroom, dynamic reframing keeping subject optimally positioned, professional camera operation
```

#### Technique 3: Rack Focus

Shift focus from one subject to another within same shot.

**Example:**
```
Shallow depth of field, focus starts on foreground object, rack focus shifting to background character, smooth focus pull, cinematic depth
```

#### Technique 4: Push In

Slow dolly in during emotional moment to increase intensity.

**Example:**
```
Slow push in toward character's face during emotional dialogue, starting medium shot ending close-up, increasing intimacy, building tension
```

---

## Temporal Consistency Strategies

Temporal consistency—maintaining stable character designs, object properties, and scene elements across frames—is critical for professional video. Wan 2.6's 5-10 second coherence window is its strength, but requires strategic prompting.

### Understanding Temporal Coherence

**Frame-to-Frame Consistency:**

Video is a sequence of still images (frames) played rapidly. Temporal coherence means each frame is consistent with previous frames:

- **Character Identity:** Facial features, clothing, accessories remain identical
- **Object Permanence:** Props and environmental elements don't disappear or transform
- **Spatial Relationships:** Characters maintain correct positions relative to environment
- **Physics Continuity:** Motion follows realistic trajectories

**The Morphing Problem:**

"Morphing" occurs when the model treats each frame semi-independently, causing subtle shifts in character design, object properties, or scene elements. A character's shirt color might shift from blue to purple, or a building's windows might change shape.

### Strategies for Maximum Temporal Consistency

#### Strategy 1: Explicit Consistency Directives

Include explicit instructions for consistency in prompts.

**Consistency Keywords:**
- "Consistent character design"
- "Maintaining exact appearance"
- "Stable throughout"
- "No morphing"
- "Identical from start to finish"

**Example:**
```
Astronaut walking on Mars surface, consistent character suit design throughout, helmet and backpack remaining identical from start to finish, no morphing, stable character appearance
```

#### Strategy 2: Detailed Character/Object Descriptions

Detailed descriptions anchor the model to specific designs, reducing drift.

**Vague (Prone to Morphing):**
"Person wearing jacket walking"

**Detailed (Consistent):**
"Person wearing navy blue denim jacket with silver zipper, white t-shirt underneath, black jeans, brown leather boots, short brown hair, walking forward"

**Principle:** Specificity reduces the model's degrees of freedom, constraining it to a single consistent design.

#### Strategy 3: Use Image-to-Video for Character Consistency

I2V mode provides a concrete visual reference, dramatically improving consistency.

**Workflow:**
1. Generate perfect character portrait using image model
2. Use portrait as I2V reference for all clips featuring that character
3. Result: Character appearance locked to reference image

**Multi-Clip Consistency:**
Use the same reference image for multiple I2V generations to maintain character consistency across different scenes.

#### Strategy 4: Limit Motion Complexity

Complex motion increases morphing risk. Simpler motion maintains consistency better.

**High Morphing Risk:**
"Character performing backflip, spinning in air, landing in crouch"

**Low Morphing Risk:**
"Character walking forward steadily, natural gait, consistent movement"

**Principle:** The more the model must "imagine" new poses and perspectives, the higher the morphing risk.

#### Strategy 5: Optimal Duration

Wan 2.6's sweet spot is 5-10 seconds. Beyond 10 seconds, consistency degrades.

**Strategy:**
- Generate multiple 5-10 second clips
- Edit clips together in post-production
- Maintain consistency across clips using same reference images

#### Strategy 6: Static Background Elements

Keep background elements static or minimally animated to reduce complexity.

**Example:**
```
Character walking through forest, background trees remain static, only character moving, consistent environment throughout
```

**Principle:** Reducing total motion in scene allows model to allocate more capacity to maintaining character consistency.

### Temporal Consistency Checklist

Before generating, verify prompt includes:

✅ **Explicit consistency directives** ("consistent design throughout")
✅ **Detailed character/object descriptions** (specific colors, features, clothing)
✅ **Appropriate duration** (5-10 seconds optimal)
✅ **Manageable motion complexity** (avoid extreme acrobatics)
✅ **Static or minimal background motion** (reduce total scene complexity)

**For I2V:**
✅ **Perfect reference image** (no anatomical errors)
✅ **Motion compatible with reference** (don't request impossible actions)

---

## Advanced Techniques

### Multi-Shot Generation

Wan 2.6 can generate multiple shots from a single prompt, maintaining consistency across shots.

**Multi-Shot Prompt Structure:**

```
[Shot 1 Description] + [Shot 2 Description] + [Shot 3 Description] + [Consistency Directive]
```

**Example:**
```
Shot 1: Wide shot of detective entering dark office. Shot 2: Medium shot of detective turning on desk lamp. Shot 3: Close-up of detective's face illuminated by lamp. Consistent character design throughout all shots, film noir aesthetic, high contrast lighting
```

**Benefits:**
- Narrative continuity in single generation
- Consistent character across shots
- Efficient workflow for multi-shot sequences

**Limitations:**
- Total duration still limited (5-10 seconds across all shots)
- Complex multi-shot sequences may reduce individual shot quality
- Works best with 2-3 shots maximum

### Style Transfer

Apply specific artistic or cinematic styles to video generation.

**Style Keywords:**

**Film Stocks:**
- "Kodak Vision3 500T film stock"
- "Fujifilm Eterna film look"
- "16mm film grain"

**Cinematic Styles:**
- "Film noir aesthetic"
- "Wes Anderson symmetrical composition"
- "Christopher Nolan IMAX cinematography"
- "Roger Deakins naturalistic lighting"

**Artistic Styles:**
- "Anime style, Studio Ghibli aesthetic"
- "Oil painting animation"
- "Watercolor illustration style"
- "Cyberpunk aesthetic"

**Example:**
```
Film noir aesthetic, high contrast black and white, venetian blind shadows, detective in trench coat, 1940s style, dramatic chiaroscuro lighting, classic Hollywood cinematography
```

### Emotion and Mood Control

Guide emotional tone through lighting, color, pacing, and music description.

**Emotional Lighting:**
- **Hopeful:** Warm, soft, golden hour
- **Tense:** High contrast, harsh shadows
- **Melancholic:** Cool, desaturated, overcast
- **Energetic:** Vibrant, saturated, dynamic lighting

**Emotional Pacing:**
- **Calm:** Slow camera movements, gentle motion
- **Urgent:** Fast camera movements, quick cuts (if multi-shot)
- **Contemplative:** Static camera, minimal motion

**Example:**
```
Melancholic mood, overcast sky, cool color palette, desaturated tones, character sitting alone on bench, slow camera push in, somber atmosphere, quiet contemplation
```

### Weather and Environmental Effects

Weather dramatically affects mood and visual interest.

**Weather Types:**
- **Rain:** "Heavy rain, water droplets on camera lens, wet pavement reflections"
- **Snow:** "Gentle snowfall, snowflakes catching light, winter atmosphere"
- **Fog:** "Dense fog, limited visibility, mysterious atmosphere"
- **Wind:** "Strong wind, leaves blowing, hair and clothing moving"
- **Storm:** "Dark storm clouds, lightning flashes, dramatic weather"

**Example:**
```
Heavy rain, water droplets on camera lens, neon lights reflecting on wet pavement, character with umbrella walking through puddles, cyberpunk city at night, atmospheric rain effects
```

### Time of Day

Time of day affects lighting, color temperature, and mood.

**Golden Hour (Sunrise/Sunset):**
```
Golden hour lighting, warm orange and pink tones, long soft shadows, sun low on horizon, magical quality light
```

**Blue Hour (Pre-Dawn/Post-Sunset):**
```
Blue hour, cool twilight tones, city lights visible, soft diffused light, transition between day and night
```

**Midday:**
```
Harsh midday sun, short shadows, high contrast, bright direct sunlight, hot atmosphere
```

**Night:**
```
Night scene, artificial lighting from streetlamps, deep shadows, cool color temperature, urban night atmosphere
```

### Slow Motion and Time-Lapse

Control time perception through speed manipulation.

**Slow Motion:**
```
Slow motion, water droplets frozen in air, 120fps, detailed motion, dramatic emphasis, smooth motion blur
```

**Time-Lapse:**
```
Time-lapse, clouds moving rapidly across sky, shadows shifting quickly, day turning to night, compressed time, smooth temporal transition
```

---

## Common Pitfalls and Solutions

### Pitfall 1: Vague Prompts

**Problem:** Vague prompts produce unpredictable, inconsistent results.

**Example:**
❌ "Person walking in city"

**Solution:** Provide specific details for all three pillars.

✅ "Professional businesswoman in navy suit walking confidently through downtown financial district, tracking shot from side, 50mm lens, golden hour lighting, warm tones, shallow depth of field, modern glass buildings in background"

### Pitfall 2: Requesting Impossible Motion

**Problem:** Requesting motion incompatible with physics or reference image.

**Example:**
❌ Reference shows person sitting; prompt requests "person jumps and does backflip"

**Solution:** Request motion compatible with starting position and physics.

✅ "Person leans forward in chair, shifts weight, natural sitting adjustments, realistic subtle motion"

### Pitfall 3: Overloading Prompt

**Problem:** Too many elements in prompt causes model to prioritize unpredictably.

**Example:**
❌ "Character walking while juggling while talking on phone while it's raining while car drives by while bird flies overhead while..."

**Solution:** Focus on 1-2 primary elements, keep prompt focused.

✅ "Character walking while talking on phone, urban environment, light rain, natural motion"

### Pitfall 4: Ignoring Reference Image Quality

**Problem:** Using low-quality reference images for I2V.

**Solution:** Always generate or select perfect reference images. Invest time in reference quality.

### Pitfall 5: Inconsistent Lighting Descriptions

**Problem:** Describing lighting that changes mid-clip without motivation.

**Example:**
❌ "Golden hour lighting transitioning to midday harsh sun"

**Solution:** Maintain consistent lighting unless time-lapse or motivated change.

✅ "Consistent golden hour lighting throughout, warm tones, soft shadows"

### Pitfall 6: Neglecting Audio Description

**Problem:** Omitting audio descriptions when native sync is desired.

**Solution:** Include audio descriptions for events that should have sound.

❌ "Glass falling off table and breaking"

✅ "Glass falling off table and shattering on floor, sharp breaking sound, glass fragments scattering, realistic audio"

### Pitfall 7: Unrealistic Duration Expectations

**Problem:** Expecting 30+ second clips with perfect consistency.

**Solution:** Work within 5-10 second optimal range, chain clips in post.

---

## Production Workflow

### Step-by-Step Production Process

#### Phase 1: Concept and Planning

**Step 1: Define Objective**
- What is the video's purpose?
- Who is the target audience?
- What emotion or message should it convey?

**Step 2: Script/Storyboard**
- Write scene descriptions
- Plan shot sequence
- Identify key visual moments

**Step 3: Reference Gathering**
- Collect visual references for style
- Gather audio references for mood
- Research cinematic techniques

#### Phase 2: Asset Creation

**Step 4: Generate Reference Images (if using I2V)**
- Use high-quality image models
- Generate multiple candidates
- Rigorously select perfect references
- Refine as needed

**Step 5: Prepare Custom Audio (if needed)**
- Record or source audio
- Edit and mix audio
- Prepare for sync

#### Phase 3: Video Generation

**Step 6: Craft Prompts**
- Apply 3-Pillar Framework
- Include consistency directives
- Specify audio if using native sync
- Review prompt against checklist

**Step 7: Generate Video**
- Select appropriate mode (T2V, I2V, Reference)
- Generate video
- Review output

**Step 8: Iterate**
- Identify issues
- Adjust prompt
- Regenerate as needed

#### Phase 4: Post-Production

**Step 9: Edit Clips**
- Import clips into editing software
- Arrange in sequence
- Trim and adjust timing

**Step 10: Audio Mixing (if using custom audio)**
- Sync audio to video
- Mix multiple audio tracks
- Add sound effects or music

**Step 11: Color Grading**
- Adjust color balance
- Apply cinematic color grading
- Ensure consistency across clips

**Step 12: Final Export**
- Export at desired resolution
- Optimize for target platform
- Deliver final video

### Platform-Specific Workflows

#### Higgsfield Platform

**Access:** [higgsfield.ai](https://higgsfield.ai)

**Workflow:**
1. Navigate to "Video" section
2. Select "WAN 2.6" from model list
3. Choose generation mode (T2V, I2V, Reference)
4. Set video duration (5-10 seconds recommended)
5. Input prompt
6. Upload reference image (if I2V)
7. Generate video
8. Preview and download

**Features:**
- Multiple generation modes
- Duration control
- Theme templates
- Preview before full generation

#### SeaArt Platform

**Access:** [seaart.ai](https://seaart.ai)

**Workflow:**
1. Access SeaArt Video Generator
2. Generate base image using SeaArt Film v2.0 or Infinity (if I2V)
3. Send image to AI Video tool
4. Select Wan 2.6 engine
5. Input movement prompt
6. Optional: Use video model library templates
7. Generate video
8. Add audio using SeaArt AI Audio tool (if custom audio)
9. Download final video

**Features:**
- Integrated image generation
- Video model library (preset styles)
- AI audio generation
- Browser-based editing

#### API Access

**Providers:** fal.ai, Novita.ai, and others

**Workflow:**
1. Obtain API key from provider
2. Install API client library
3. Construct API request with prompt and parameters
4. Submit generation request
5. Poll for completion or use webhook
6. Download generated video

**Benefits:**
- Automation and batch processing
- Integration into custom workflows
- Programmatic control

---

## Technical Specifications

### Output Specifications

**Resolution:** 1080p (1920x1080)
**Frame Rate:** 24 FPS
**Duration:** 5-10 seconds (optimal), up to 15 seconds (with consistency trade-offs)
**Aspect Ratios:** 16:9 (landscape), 9:16 (portrait), 1:1 (square)
**Format:** MP4 (H.264 codec)
**Audio:** Native audio-visual sync or custom audio support

### Generation Modes

**Text-to-Video (T2V):** Generate video from text prompt only
**Image-to-Video (I2V):** Animate static image with text prompt
**Reference-to-Video:** Use reference image(s) to guide style/character while generating new content

### Model Architecture

**Base Architecture:** Mixture of Experts (MoE)
**Multimodal Processing:** Native text, image, and audio processing in unified latent space
**Temporal Consistency:** 5-10 second coherence window with persistent scene element representation

### Key Capabilities

- Native audio-visual synchronization
- Multi-shot generation from single prompt
- Temporal consistency across 5-10 second clips
- Cinematic camera control
- Style transfer and artistic rendering
- Physics-accurate motion simulation
- Volumetric atmosphere and lighting

### Limitations

**Duration:** Consistency degrades beyond 10 seconds
**Text Rendering:** Experimental, may not be fully reliable
**Complex Motion:** Extreme acrobatics or rapid pose changes increase morphing risk
**Reference Image Dependency:** I2V quality ceiling determined by reference image quality

---

## Conclusion

Wan 2.6 represents a significant advancement in AI video generation, particularly in its native audio-visual synchronization and temporal consistency. By mastering the 3-Pillar Prompt Framework, understanding Image-to-Video best practices, and applying cinematic camera control techniques, you can produce professional-quality video content.

**Key Takeaways:**

1. **3-Pillar Framework:** Always include Material, Dynamics, and Render in prompts
2. **80% Rule:** Reference image quality defines 80% of I2V success
3. **Temporal Consistency:** Work within 5-10 second optimal range, use explicit consistency directives
4. **Audio-Visual Sync:** Describe audio events in prompts to leverage native synchronization
5. **Cinematic Language:** Use professional camera and lighting terminology for best results

**Next Steps:**

- Test model capabilities with the 10-Prompt Benchmark Library
- Practice I2V workflow with perfect reference images
- Experiment with cinematic camera movements
- Explore audio-visual synchronization
- Build production workflows integrating Wan 2.6 into your creative process

Wan 2.6 is a powerful tool that rewards understanding and strategic prompting. With the techniques in this guide, you're equipped to push the boundaries of AI video generation and create compelling, professional content.

---

*Guide Version: 1.0*
*Last Updated: January 2026*
*Model Version: Wan 2.6*
