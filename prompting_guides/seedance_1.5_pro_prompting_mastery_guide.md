# Seedance 1.5 Pro Prompting Mastery Guide: Native Audio-Visual Generation

**Version:** 1.0  
**Date:** January 29, 2026  
**Author:** Cine-AI Knowledge Base Team

---

## Table of Contents

1. [Introduction](#introduction)
2. [Technical Specifications](#technical-specifications)
3. [Core Prompting Framework](#core-prompting-framework)
4. [Image-to-Video Techniques](#image-to-video-techniques)
5. [Text-to-Video Techniques](#text-to-video-techniques)
6. [Native Audio Generation](#native-audio-generation)
7. [Camera Movement Mastery](#camera-movement-mastery)
8. [Advanced Techniques](#advanced-techniques)
9. [Best Practices](#best-practices)
10. [Common Mistakes & Troubleshooting](#common-mistakes--troubleshooting)
11. [Genre-Specific Examples](#genre-specific-examples)
12. [Integration Workflows](#integration-workflows)

---

## Introduction

**Seedance 1.5 Pro** represents a paradigm shift in AI video generation by introducing **native audio-visual synthesis**—the first model to treat sound and picture as a unified system rather than two separate outputs. This breakthrough eliminates the traditional workflow of generating silent video first, then adding audio separately.

### What Makes Seedance 1.5 Pro Unique

- **Native Audio-Visual Joint Generation:** Dialogue, ambient sound, music, and sound effects generated simultaneously with video
- **Film-Grade Cinematography:** Complex camera movements, cinematic composition, and atmospheric depth
- **Best-in-Class Lip-Sync:** Frame-accurate lip-syncing across multiple languages (English, Spanish, Mandarin, regional dialects)
- **Emotional Storytelling:** Auto-fills narrative beats based on prompt intent, maintaining emotional coherence
- **Human-Optimized:** Prioritizes facial landmarks and micro-expressions for character-driven content
- **Multi-Language Support:** Native speech generation with phoneme-accurate lip reshaping

### When to Use Seedance 1.5 Pro

**Best For:**
- Dialogue-driven UGC and talking-head content
- Character performances requiring emotional nuance and micro-expressions
- Product demos with voiceover narration
- Cinematic storytelling with synchronized sound design
- Multi-language content requiring native lip-sync
- Professional commercials needing clean audio delivery

**Not Ideal For:**
- Abstract or experimental visuals without narrative structure
- Projects requiring extreme camera movements (may stress identity stability)
- Content with complex on-screen text (text rendering is limited)
- Fine motor skills (typing, playing instruments) - may be inconsistent

---

## Technical Specifications

### Model Capabilities

| Feature | Specification |
|---------|--------------|
| **Resolution** | Native 1080p-4K |
| **Clip Lengths** | 5 seconds or 10 seconds |
| **Audio** | Native dialogue, ambience, music, sound effects |
| **Input Modes** | Text-to-video, Image-to-video |
| **Frame Control** | Start frame (image-to-video) |
| **Camera Control** | Described movements (pan, tilt, zoom, tracking, aerial, handheld) |
| **Lip-Sync** | Frame-accurate across multiple languages |
| **Languages** | English, Spanish, Mandarin, regional dialects |
| **Cost** | Varies by platform (typically $0.10-0.15/second) |

### Strengths

✅ **Lip-Sync Quality** - Best-in-class frame-accurate lip-syncing  
✅ **Emotional Expression** - Superior micro-expressions and facial performance  
✅ **Audio Cleanliness** - Clean dialogue delivery with minimal artifacts  
✅ **Cinematic Composition** - Film-grade framing and atmospheric depth  
✅ **Multi-Language Support** - Native phoneme-accurate lip reshaping  
✅ **Narrative Coherence** - Auto-fills emotional beats and story progression  
✅ **Human-Optimized** - Prioritizes facial landmarks for character work  

### Limitations

❌ **Text Rendering** - On-screen text and signage are limited  
❌ **Fine Motor Skills** - Complex hand interactions may be inconsistent  
❌ **Extreme Camera Movements** - Very fast or complex movements may stress identity stability  
❌ **Long-Form Continuity** - Best for 5-10 second clips; longer sequences require stitching  

---

## Core Prompting Framework

### The Director-Style Prompting Structure

Seedance 1.5 Pro responds best to prompts that read like a **shot plan**, not a single sentence. The key is to specify elements in a hierarchical order that mirrors how the model "thinks":

**Optimal Prompt Order:**
1. **Composition** (framing, camera angle, background)
2. **Main Character** (description, clothing, action)
3. **Camera Movement** (action sequence, focus)
4. **Overall Mood** (cinematic style, audio cues)

**Why This Order Matters:**
- Composition first "locks" the frame before motion begins
- Character description anchors identity before action
- Camera movement is applied to a stable foundation
- Mood/style provides final polish without contradicting earlier elements

---

## Image-to-Video Techniques

### The Fundamental Formula

```
Prompt = [Subject + Motion] + [Background + Motion] + [Camera + Motion]
```

### Core Principles

#### 1. Simple and Direct Language

✅ **Do:** Use simple words and sentence structures  
❌ **Don't:** Use complex, flowery, or overly descriptive language

**Why:** The model expands your prompt based on its understanding of the input image. Simple, clear language reduces ambiguity.

**Example:**

❌ **Complex:** "The elegantly dressed woman gracefully extends her delicate hand toward the shimmering, ornate golden chalice"  
✅ **Simple:** "Woman reaches for the golden cup"

---

#### 2. Negative Prompts Are Ineffective

❌ **Don't:** Use negative prompt words ("no blur," "not distorted," "without artifacts")

**Why:** Seedance 1.5 Pro does not respond to negative prompts. Only describe what you want, not what you don't want.

---

#### 3. Minimize Static Descriptions

✅ **Do:** Focus on describing **motion** and **change**  
❌ **Don't:** Describe static elements already visible in the image

**Why:** The image already contains the scene. Your prompt should describe what **moves** or **changes**.

**Example:**

Given an image of a woman in a red dress standing in a cafe:

❌ **Bad:** "A woman in a red dress stands in a cozy cafe with wooden tables and warm lighting"  
✅ **Good:** "Woman walks toward the camera, smiling. Camera slowly pushes in"

---

#### 4. Use Characteristic Descriptions for Subject Identification

✅ **Do:** Add prominent features to locate the subject ("old man," "woman wearing sunglasses," "person in blue jacket")  
❌ **Don't:** Assume the model knows which subject you mean in complex scenes

**Example:**

Given an image with multiple people:

❌ **Bad:** "Person walks forward"  
✅ **Good:** "Woman in sunglasses walks forward"

---

#### 5. Follow the Picture (Don't Contradict It)

✅ **Do:** Write prompts that align with the input image content  
❌ **Don't:** Contradict the image (e.g., "woman dancing" when image shows a man, or "cafe" when image shows grassland)

**Why:** Contradictions confuse the model and lead to poor results.

---

### Multiple Continuous Actions

Seedance 1.5 Pro has strong support for **multiple continuous actions in temporal sequence** and **different actions by multiple subjects**.

**Structure:**

```
Prompt = Subject 1 + Movement 1 + Movement 2
Prompt = Subject 1 + Movement 1 + Subject 2 + Movement 2
```

**Example:**

```
Man in suit picks up briefcase, then walks toward door. Woman in background waves goodbye.
```

---

### Adverbs of Degree

**Key Principle:** The model cannot infer the **degree of motion** from the input image, so you must be explicit.

**Essential Degree Adverbs:**
- **fast** / **slowly** / **gradually**
- **violent** / **gentle** / **subtle**
- **large** / **small** / **slight**
- **high frequency** / **low frequency**
- **strong** / **weak**
- **crazy** / **calm** / **deliberate**

**Examples:**

❌ **Vague:** "The car drove by"  
✅ **Clear:** "The car drove by quickly"

❌ **Vague:** "Man roaring"  
✅ **Clear:** "Man roaring madly"

❌ **Vague:** "Wings flapping"  
✅ **Clear:** "Wings flapping vigorously"

**Pro Tip:** You can **exaggerate the degree appropriately** to enhance expressiveness. The model responds well to strong, clear degree modifiers.

---

## Text-to-Video Techniques

### The Fundamental Formula

```
Prompt = [Subject + Movement] + [Scene] + [Lens] + [Style]
```

**Core Elements:**
- **Subject + Movement:** The primary focus and action
- **Scene:** Environmental context and setting
- **Lens:** Camera work and framing
- **Style:** Visual aesthetic and mood

### How to Better Describe What You Need

#### 1. Detailed Character Description

Focus on:
- **Appearance:** Age, gender, ethnicity, distinctive features
- **Clothing:** Style, color, texture
- **Posture:** Body language, stance, gesture

**Example:**

❌ **Vague:** "A person walks"  
✅ **Detailed:** "A middle-aged man in a gray suit walks with confident strides, hands in pockets, shoulders back"

---

#### 2. Environmental Details

Provide rich sensory descriptions of:
- **Natural environments:** Mountains, deserts, waterfalls, forests, oceans
- **Architectural environments:** Studios, cafes, offices, streets, interiors

**Example:**

❌ **Vague:** "In a forest"  
✅ **Detailed:** "In a dense pine forest with dappled sunlight filtering through the canopy, moss-covered ground, distant bird calls"

---

#### 3. Combination of Emotions and Dynamics

Depict:
- **Character emotional states:** Joy, fear, determination, confusion
- **Environmental dynamics:** Wind, rain, moving crowds, flowing water

**Example:**

```
A woman stands at the edge of a cliff, wind whipping her hair, expression shifting from fear to determination. The ocean crashes against rocks below.
```

---

#### 4. Rendering of Atmosphere

Use lighting and time-of-day descriptions:
- **Dusk** / **early morning** / **golden hour** / **midday harsh light**
- **Dim** / **bright** / **moody** / **warm light** / **cool light**
- **Volumetric fog** / **hazy** / **clear** / **overcast**

**Example:**

```
A detective walks down a rain-slicked alley at dusk. Warm streetlights cast long shadows. Volumetric fog drifts between buildings. Film noir, moody, atmospheric.
```

---

## Native Audio Generation

Seedance 1.5 Pro's revolutionary feature is **simultaneous audio-visual generation**—sound and visuals are created together as a unified system.

### Audio Types

#### 1. Dialogue

- **Frame-accurate lip-syncing** across multiple languages
- **Emotional tone matching** (urgent, calm, fearful, joyful)
- **Natural voice generation** with regional accents

**Prompting Technique:**

```
A woman in a coffee shop says, "I can't believe you're here!" with surprise and joy. Her facial expression shifts from shock to delight. Warm, intimate lighting. Cinematic.
```

**Key Elements:**
- Specify the **exact dialogue** in quotes
- Describe the **emotional tone** ("with surprise and joy")
- Note **facial expression changes**

---

#### 2. Ambient Sound

- **Environmental audio:** City noise, nature sounds, room tone, weather sounds
- **Spatial audio placement:** Sounds positioned in 3D space
- **Consistent with visual context:** Audio matches what's visible

**Prompting Technique:**

```
A busy city street at rush hour. Cars honking, people talking, footsteps on pavement, distant sirens. The camera pans across the crowded sidewalk. Urban, energetic, documentary style.
```

**Key Elements:**
- List **specific ambient sounds** ("cars honking, people talking")
- Describe **spatial relationships** ("distant sirens")
- Match audio to **visual context**

---

#### 3. Sound Effects (Foley)

- **Frame-level synchronization:** Impact sounds occur at exact moment of visual action
- **Impact sounds:** Footsteps, door slams, glass breaking, object drops
- **Movement sounds:** Cloth rustling, water splashing, wind howling

**Prompting Technique:**

```
A glass falls from a table and shatters on the floor. The sound of breaking glass occurs at the exact moment of impact. Slow-motion, dramatic, cinematic.
```

**Key Elements:**
- Specify **timing explicitly** ("at the exact moment of impact")
- Describe **sound characteristics** ("breaking glass," "loud thud")
- Match sound to **visual action**

---

#### 4. Music

- **Underscore and mood music:** Emotional tone support
- **Genre-specific styles:** Orchestral, piano, electronic, ambient
- **Emotional tone matching:** Music reflects scene mood

**Prompting Technique:**

```
A couple walks hand-in-hand through a park at sunset. Soft, romantic piano music plays. Warm golden hour lighting. Cinematic, romantic, aspirational.
```

**Key Elements:**
- Specify **music style** ("soft, romantic piano")
- Match music to **emotional tone** ("romantic, aspirational")
- Integrate with **visual mood**

---

### Audio Prompting Best Practices

1. **Be Specific About Audio Type**
   - ❌ "with sound"
   - ✅ "with ambient city noise: distant traffic, people talking, wind rustling leaves"

2. **Describe Emotional Tone**
   - ❌ "she speaks"
   - ✅ "she speaks with urgency and fear, voice trembling"

3. **Specify Timing for Sound Effects**
   - ❌ "glass breaks"
   - ✅ "glass breaks at the exact moment it hits the floor, sharp shattering sound"

4. **Layer Audio Elements**
   - ✅ "Dialogue: 'We need to go now!' (urgent). Ambient: wind howling, rain on windows. Music: tense orchestral underscore, low strings."

---

## Camera Movement Mastery

Seedance 1.5 Pro supports natural language descriptions of camera movements. When using camera movement prompts, **select "unfixed camera" in basic parameters**.

### Supported Camera Movements

| Movement | Description | When to Use |
|----------|-------------|-------------|
| **Pan** | Horizontal rotation from fixed position | Reveal information, follow action laterally |
| **Tilt** | Vertical rotation from fixed position | Show scale, reveal height/depth |
| **Zoom** | Lens focal length change (in/out) | Focus attention, reveal context |
| **Dolly** | Camera moves physically closer/farther | Build intimacy (in) or isolation (out) |
| **Tracking** | Camera follows subject through space | Immerse viewer, follow action |
| **Aerial** | High-angle bird's-eye view | Establish location, show scale |
| **Handheld** | Slight shake and drift | Add realism, urgency, documentary feel |
| **Surround/Arc** | Camera moves in circle around subject | Show subject from multiple angles |

### Camera Movement Prompting Techniques

#### 1. Pan (Left-Right)

**Example:**

```
The camera pans slowly from left to right, revealing the empty chairs where the family used to sit. The character remains still, expression shifting from calm to sadness. Cinematic, melancholic.
```

**Key Elements:**
- Specify **direction** ("left to right")
- Specify **speed** ("slowly")
- Describe **what's revealed**
- Note **character emotional state**

---

#### 2. Zoom (In/Out)

**Example:**

```
The camera zooms in slowly on the detective's face as he realizes the truth. His expression shifts from confusion to shock. Dramatic lighting, film noir, tense.
```

**Key Elements:**
- Specify **direction** ("in" or "out")
- Specify **speed** ("slowly," "quickly")
- Describe **emotional progression**

---

#### 3. Tracking Shot

**Example:**

```
The camera tracks the runner from behind, following her through the forest trail. Handheld, slightly shaky. Heavy breathing, footsteps on leaves. Documentary style, immersive.
```

**Key Elements:**
- Specify **camera position** ("from behind," "from the side")
- Specify **camera style** ("handheld, slightly shaky")
- Include **audio cues** ("heavy breathing, footsteps")

---

#### 4. Aerial Shot

**Example:**

```
Aerial shot: The camera rises vertically, revealing the vast desert landscape stretching to the horizon. The lone figure becomes smaller and more isolated. Epic, cinematic, contemplative.
```

**Key Elements:**
- Specify **camera movement** ("rises vertically")
- Describe **scale reveal** ("vast desert landscape")
- Note **subject's relationship to environment** ("becomes smaller and more isolated")

---

### Multi-Shot Sequences

Seedance 1.5 Pro supports **multiple continuous shots** with clear transitions.

**Key Principles:**
1. **Write out the intrinsic connections** between shots
2. Use the clear prompt **"shot switch"** to indicate transitions
3. **Describe the new scene** after cutting
4. Maintain **visual and emotional continuity**

**Example:**

```
Shot 1: Close-up of detective's shocked face. Shot switch. Shot 2: Wide shot reveals the crime scene he's looking at, yellow tape and forensic team in background. Shot switch. Shot 3: Medium shot of detective walking toward the scene, determined expression. Film noir, tense, dramatic.
```

---

## Advanced Techniques

### 1. Hierarchical Prompt Structure for Complex Scenes

For complex scenes with multiple elements, use a hierarchical structure:

**Level 1: Composition**
```
Medium close-up, eye level, soft background bokeh, clean indoor lighting
```

**Level 2: Main Character**
```
Confident creator, natural skin texture, subtle micro-expressions, relaxed posture
```

**Level 3: Camera Movement**
```
Slow push-in, focus locked on eyes, minimal shake
```

**Level 4: Overall Mood**
```
Cinematic UGC ad, clean audio, natural room tone, soft film texture
```

---

### 2. Dialogue UGC (Best for Seedance Lip-Sync)

**Optimal Structure:**

```
Composition: medium close-up, eye level, soft background bokeh, clean indoor lighting

Main character: confident creator, natural skin texture, subtle micro-expressions, relaxed posture

Camera movement: slow push-in, focus locked on eyes, minimal shake

Overall mood: cinematic UGC ad, clean audio, natural room tone, soft film texture

Dialogue: "This product changed my life" (enthusiastic, genuine)
```

**Why This Works:**
- Seedance excels at **lip-sync and facial performance**
- **Medium close-up** keeps face readable
- **Slow push-in** builds intimacy without stressing identity
- **Clean audio** showcases Seedance's audio strength

---

### 3. Product Demo Without Face Drift

**Optimal Structure:**

```
Composition: tabletop hero shot, product foreground, hands enter frame, label readable

Main character: only hands and torso visible, clean wardrobe, no face in frame

Camera movement: gentle dolly-in and slight tilt down to label, then hold

Overall mood: bright lifestyle commercial, crisp ambience, realistic reflections
```

**Why This Works:**
- **No face in frame** eliminates identity drift concerns
- **Product-focused** framing keeps attention on the product
- **Gentle camera movement** adds cinematic polish without complexity

---

### 4. Emotional Progression Anchoring

Describe emotional transitions to guide the model's narrative understanding:

**Example:**

```
Start: Character looks calm and hopeful. Middle: Expression shifts to concern as she reads the letter. End: Tears well up, expression of heartbreak. Slow push-in throughout. Dramatic lighting, intimate, emotional.
```

---

### 5. Multi-Language Lip-Sync

Seedance 1.5 Pro natively supports **phoneme-accurate lip reshaping** across languages.

**Example:**

**English:**
```
Woman says, "Hello, how are you?" with a warm smile. Friendly, conversational.
```

**Spanish:**
```
Woman says, "Hola, ¿cómo estás?" with a warm smile. Friendly, conversational.
```

**Mandarin:**
```
Woman says, "你好，你好吗？" with a warm smile. Friendly, conversational.
```

**Key:** The model automatically reshapes lips to match the phonemes of each language.

---

## Best Practices

### 1. Always Use the Director-Style Structure

❌ **Bad:** "A woman walks down a street"  
✅ **Good:**
```
Composition: Wide shot, eye level, urban street background
Main character: Woman in red coat walks confidently
Camera movement: Tracking shot from the side, steady
Overall mood: Cinematic, urban, aspirational
```

**Why:** Hierarchical structure reduces contradictions and helps the model "lock" the frame before motion.

---

### 2. Specify Pacing and Speed

❌ **Bad:** "Camera moves closer"  
✅ **Good:** "Camera slowly pushes in, building tension"

**Why:** Speed controls emotional impact. Slow = tension/intimacy, Fast = urgency/shock.

---

### 3. Describe Emotional Progression

❌ **Bad:** "A woman looks at the camera"  
✅ **Good:** "A woman's expression shifts from hope to despair as she realizes the truth"

**Why:** Seedance excels at emotional nuance. Give it clear emotional direction.

---

### 4. Layer Visual and Audio Elements

❌ **Bad:** "A car drives fast"  
✅ **Good:** "A sports car races at high speed, engine roaring, tires screeching on asphalt. Tracking shot from the side. High-energy, car commercial."

**Why:** Rich sensory details create immersive experiences.

---

### 5. Use Simple, Direct Language

❌ **Bad:** "The elegantly dressed woman gracefully extends her delicate hand"  
✅ **Good:** "Woman reaches for the cup"

**Why:** Simple language reduces ambiguity and lets the model expand naturally.

---

### 6. Avoid Contradicting the Input Image

❌ **Bad:** Input image shows a man, prompt says "woman dancing"  
✅ **Good:** Input image shows a man, prompt says "man dancing"

**Why:** Contradictions confuse the model and lead to poor results.

---

### 7. Keep Clips Short and Focused

❌ **Bad:** "A 30-second sequence with multiple camera moves and scene changes"  
✅ **Good:** "A single 5-10 second shot with one clear camera movement"

**Why:** Seedance excels at focused, single-shot sequences. Stitch multiple clips for longer sequences.

---

## Common Mistakes & Troubleshooting

### Problem 1: Lip-Sync is Off

**Symptoms:**
- Mouth movements don't match dialogue
- Lips lag behind or lead audio

**Solutions:**
- Use **medium close-up** framing (not extreme close-up or wide shot)
- Specify dialogue **in quotes** with emotional tone
- Avoid **fast camera movements** during dialogue
- Use **slow push-in** or **static shot** for best lip-sync

**Example Fix:**

❌ **Before:** "Woman talks while camera spins around her"  
✅ **After:** "Woman says, 'I can't believe it' (shocked). Medium close-up, static shot, clean audio."

---

### Problem 2: Character Identity Drifts

**Symptoms:**
- Face changes subtly across frames
- Features morph or distort

**Solutions:**
- Use **simple, smooth camera movements** (avoid complex arcs or spins)
- Avoid **extreme camera angles** (very low, very high)
- Use **medium shots** or **close-ups** (not extreme close-ups)
- Specify **characteristic features** ("woman in sunglasses," "man with beard")

**Example Fix:**

❌ **Before:** "Character spins around while camera circles them"  
✅ **After:** "Character turns head slowly. Camera pushes in gently. Medium shot."

---

### Problem 3: Audio Doesn't Match Visuals

**Symptoms:**
- Sound effects don't align with actions
- Ambient sound doesn't match environment
- Music doesn't fit mood

**Solutions:**
- Be explicit about **timing**: "at the exact moment," "when the door slams"
- Describe audio in **detail**: "urgent, fearful dialogue" not just "she speaks"
- **Layer audio elements**: dialogue + ambient + music

**Example Fix:**

❌ **Before:** "A door closes with sound"  
✅ **After:** "A heavy wooden door slams shut with a loud bang at the exact moment it closes. The sound echoes in the empty hallway."

---

### Problem 4: Motion Feels Unnatural or Floaty

**Symptoms:**
- Characters glide instead of walk
- Objects don't obey physics
- Hair and cloth don't move naturally

**Solutions:**
- Specify **weight and physics**: "heavy footsteps," "cloth fluttering in wind"
- Use **degree adverbs**: "fast," "violent," "large," "strong"
- Avoid overly **complex actions** (fine motor skills, intricate hand movements)

**Example Fix:**

❌ **Before:** "A person walks"  
✅ **After:** "A person walks with heavy, deliberate footsteps, their coat fluttering behind them in the wind"

---

### Problem 5: Scene Coherence Breaks Down

**Symptoms:**
- Lighting changes mid-shot
- Architecture warps or collapses
- Colors flicker or shift

**Solutions:**
- Describe **lighting consistently**: "consistent golden hour lighting throughout"
- Avoid **extreme camera movements** that stress the model
- Use **simple, smooth camera work**

**Example Fix:**

❌ **Before:** "Camera spins wildly around a building"  
✅ **After:** "Camera arcs smoothly around a building, maintaining consistent lighting and stable architecture throughout"

---

### Problem 6: Prompt Contradicts Image (Image-to-Video)

**Symptoms:**
- Generated video doesn't match input image
- Characters or objects appear/disappear
- Environment changes unexpectedly

**Solutions:**
- **Follow the picture**: Write prompts that align with input image content
- **Don't contradict**: If image shows a man, don't prompt for a woman
- **Minimize static descriptions**: Focus on motion, not static elements already visible

**Example Fix:**

Given an image of a man in a cafe:

❌ **Before:** "Woman dances in a nightclub"  
✅ **After:** "Man stands up from table, walks toward camera. Cafe background."

---

## Genre-Specific Examples

### 1. Dialogue UGC / Talking-Head Content

**Goal:** Perfect lip-sync, natural performance, clean audio

**Example Prompt:**
```
Composition: Medium close-up, eye level, soft background bokeh, clean indoor lighting

Main character: Confident creator, natural skin texture, subtle micro-expressions, relaxed posture, wearing casual clothing

Camera movement: Slow push-in, focus locked on eyes, minimal shake

Overall mood: Cinematic UGC ad, clean audio, natural room tone, soft film texture

Dialogue: "This product changed my life. I can't believe the results!" (enthusiastic, genuine)
```

**Key Elements:**
- Medium close-up for readable lip-sync
- Slow push-in for intimacy
- Clean audio showcase
- Enthusiastic dialogue with emotional tone

---

### 2. Product Demo / Commercial

**Goal:** Stable product focus, professional polish, no face drift

**Example Prompt:**
```
Composition: Tabletop hero shot, product in foreground, hands enter frame from right, label readable

Main character: Only hands and torso visible, clean wardrobe, no face in frame

Camera movement: Gentle dolly-in and slight tilt down to product label, then hold

Overall mood: Bright lifestyle commercial, crisp ambience, realistic reflections, professional

Audio: Soft background music, gentle product handling sounds
```

**Key Elements:**
- No face eliminates identity drift
- Product-focused framing
- Gentle camera movement
- Professional lighting and audio

---

### 3. Cinematic Storytelling / Drama

**Goal:** Emotional depth, atmospheric lighting, narrative progression

**Example Prompt:**
```
Composition: Wide shot, low angle, dramatic sky background, character silhouetted

Main character: Lone figure stands at cliff edge, wind whipping hair and coat, posture shifts from tense to resolved

Camera movement: Slow boom up, revealing vast ocean and horizon, character becomes smaller

Overall mood: Epic, cinematic, contemplative, dramatic

Audio: Wind howling, distant ocean waves, emotional orchestral underscore
```

**Key Elements:**
- Epic framing and scale
- Emotional progression
- Atmospheric audio layering
- Slow, deliberate camera movement

---

### 4. Action / High-Energy Content

**Goal:** Dynamic motion, urgency, immersive camera work

**Example Prompt:**
```
Composition: Medium shot, eye level, urban alley background, character running toward camera

Main character: Runner in athletic gear, determined expression, powerful strides

Camera movement: Handheld tracking shot from behind, slightly shaky, following character's movement

Overall mood: High-energy, action, immersive, documentary style

Audio: Heavy breathing, rapid footsteps, distant sirens, urban ambience
```

**Key Elements:**
- Handheld for urgency and realism
- Tracking shot for immersion
- Dynamic audio layering
- Action-focused framing

---

### 5. Documentary / Observational

**Goal:** Natural, unobtrusive, realistic

**Example Prompt:**
```
Composition: Medium wide shot, eye level, market stall background, natural lighting

Main character: Street vendor prepares food, natural movements, focused on task

Camera movement: Static shot, observational, minimal movement

Overall mood: Documentary style, observational, authentic, natural

Audio: Ambient market sounds - people talking, sizzling food, distant music, natural room tone
```

**Key Elements:**
- Static or minimal camera movement
- Natural lighting
- Rich ambient audio
- Observational framing

---

### 6. Romance / Emotional Intimacy

**Goal:** Intimacy, emotional connection, soft aesthetic

**Example Prompt:**
```
Composition: Close-up, eye level, soft background bokeh, warm golden hour lighting

Main character: Couple sitting close, holding hands, eyes locked, subtle smiles

Camera movement: Very slow push-in, focus on intertwined hands, then up to faces

Overall mood: Romantic, intimate, aspirational, cinematic

Audio: Soft romantic piano music, gentle ambient nature sounds, quiet conversation
```

**Key Elements:**
- Close-up for intimacy
- Very slow push-in for emotional build
- Warm, soft lighting
- Romantic audio layering

---

## Integration Workflows

### Workflow 1: Image-First → Seedance 1.5 Pro Animation

**Best For:** Character-driven scenes, controlled aesthetics, perfect lip-sync

**Steps:**
1. Generate hero frame using Cinema Studio V1.5, Nano Banana Pro, or Midjourney
2. Upscale hero frame using Topaz (4x, Standard preset)
3. Upload hero frame to Seedance 1.5 Pro as start frame
4. Write prompt using director-style structure (Composition → Character → Camera → Mood)
5. Generate 5-10 second clip
6. Upscale video if needed (Topaz Video)

**Example:**

**Hero Frame:** Woman in coffee shop (generated in Nano Banana Pro)  
**Seedance Prompt:**
```
Composition: Medium close-up, eye level, soft cafe background bokeh
Main character: Woman in casual clothing, warm smile, relaxed posture
Camera movement: Slow push-in, focus on face
Overall mood: Cinematic, intimate, warm
Dialogue: "I'm so glad you're here" (genuine, warm)
```

---

### Workflow 2: Multi-Shot Sequence Assembly

**Best For:** Longer narratives, cinematic sequences, storytelling

**Steps:**
1. Plan shot list (5-10 shots, each 5-10 seconds)
2. Generate hero frames for each shot (if using image-to-video)
3. Generate each shot in Seedance 1.5 Pro with consistent style prompts
4. Assemble shots in video editor (Premiere, DaVinci Resolve)
5. Add transitions, color grading, final audio mix (if needed)

**Example Shot List:**

| Shot | Description | Duration |
|------|-------------|----------|
| 1 | Wide shot: Character enters cafe | 5s |
| 2 | Medium shot: Character orders coffee | 5s |
| 3 | Close-up: Character's surprised expression | 5s |
| 4 | Pan: Reveal who character sees | 10s |

---

### Workflow 3: Seedance → External Audio Replacement

**Best For:** Projects requiring custom voice actors, licensed music, or professional sound design

**Steps:**
1. Generate video in Seedance 1.5 Pro (use native audio as reference)
2. Export video
3. Record custom dialogue with voice actors
4. Add licensed music
5. Create professional Foley and sound effects
6. Mix audio in DAW (Pro Tools, Logic Pro)
7. Sync audio with video in editor

**Why:** Gives you full creative control over audio while leveraging Seedance's visual strengths

---

### Workflow 4: Cross-Model Character Consistency

**Best For:** Maintaining character identity across multiple models

**Steps:**
1. Generate character reference sheet (front, side, back views) in Nano Banana Pro
2. Use character reference in Seedance 1.5 Pro for video generation
3. Maintain consistent lighting and camera angles
4. Generate multiple shots with same character reference
5. Assemble in editor

**Example:**

**Character Reference:** Young woman, brown hair, blue eyes, casual clothing  
**Shot 1 Prompt:** "Woman walks down street, tracking shot from side"  
**Shot 2 Prompt:** "Woman sits at cafe, slow push-in to close-up"  
**Shot 3 Prompt:** "Woman looks out window, static shot"

---

### Workflow 5: Seedance + Cinema Studio Hybrid

**Best For:** Combining Cinema Studio's camera controls with Seedance's lip-sync and audio

**Steps:**
1. Generate hero frame in Cinema Studio V1.5 (precise camera/lens/aperture control)
2. Upload to Seedance 1.5 Pro as start frame
3. Generate video with Seedance's superior lip-sync and native audio
4. Upscale final video

**Why:** Cinema Studio gives you precise camera control, Seedance gives you lip-sync and audio

---

## Conclusion

Seedance 1.5 Pro represents a major leap forward in AI video generation by introducing **native audio-visual synthesis**. By mastering its director-style prompting framework, understanding its strengths in lip-sync and emotional expression, and leveraging its multi-language capabilities, you can create professional-grade cinematic content with perfect audio-visual synchronization.

### Key Takeaways

1. **Use the director-style structure:** Composition → Character → Camera → Mood
2. **Simple, direct language** works best—avoid flowery descriptions
3. **Negative prompts don't work**—only describe what you want
4. **Focus on motion, not static elements** (especially for image-to-video)
5. **Use degree adverbs** to specify intensity and speed
6. **Layer audio elements** for immersive experiences
7. **Keep clips short and focused** (5-10 seconds per shot)
8. **Stitch multiple shots** for longer sequences

### Next Steps

- Experiment with different prompting structures and analyze results
- Practice layering audio elements for rich soundscapes
- Build a library of hero frames for consistent character work
- Study cinematic techniques from professional films and apply them to your prompts

**Seedance 1.5 Pro is a powerful tool, but it's your understanding of cinematic language and audio-visual storytelling that will make your work truly professional.**

---

**Version History:**
- v1.0 (January 29, 2026) - Initial comprehensive guide

**Sources:**
- Higgsfield Seedance 1.5 Pro Practical Creator Guide
- WaveSpeed AI Seedance Prompting Guide
- ByteDance Seed+1 Official Documentation
- Community best practices and examples
