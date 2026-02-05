# Sora 2 Prompting Mastery Guide

**Model:** Sora 2 / Sora 2 Pro  
**Developer:** OpenAI  
**Specialty:** State-of-the-art video generation with synchronized audio  
**Platform:** API (preview), iOS app "Sora"  
**Last Updated:** January 2026

---

## Table of Contents

1. [Model Overview](#model-overview)
2. [Technical Specifications](#technical-specifications)
3. [Prompting Philosophy](#prompting-philosophy)
4. [Core Prompting Framework](#core-prompting-framework)
5. [Cinematography Mastery](#cinematography-mastery)
6. [Motion and Timing Control](#motion-and-timing-control)
7. [Lighting and Color Consistency](#lighting-and-color-consistency)
8. [Image Input for Enhanced Control](#image-input-for-enhanced-control)
9. [Audio and Dialogue Generation](#audio-and-dialogue-generation)
10. [Remix Functionality](#remix-functionality)
11. [Ultra-Detailed Cinematic Prompting](#ultra-detailed-cinematic-prompting)
12. [Best Practices](#best-practices)
13. [Common Mistakes & Troubleshooting](#common-mistakes--troubleshooting)
14. [Advanced Workflows](#advanced-workflows)
15. [Use Case Examples](#use-case-examples)

---

## Model Overview

### What is Sora 2?

Sora 2 represents OpenAI's most advanced frontier in generative media, bringing state-of-the-art video generation capabilities to developers and creators. Built on years of research into multimodal diffusion and trained on diverse visual data, Sora 2 demonstrates deep understanding of three-dimensional space, realistic motion physics, and scene continuity that rivals traditional video production. The model generates richly detailed, dynamic video clips with synchronized audio directly from natural language descriptions or image references, eliminating the traditional barriers between creative vision and execution.

### Key Strengths

**Deep Spatial Understanding:** Sora 2 comprehends three-dimensional space with remarkable sophistication, accurately rendering depth relationships, perspective changes, and spatial continuity across frames. This enables complex camera movements and scene transitions that maintain geometric consistency.

**Natural Motion Physics:** The model generates motion that respects real-world physics, from subtle gestures to complex actions. Characters move with natural weight and momentum, objects interact believably, and camera movements feel grounded in physical reality.

**Synchronized Audio Generation:** Unlike most AI video models, Sora 2 generates audio that is perfectly synchronized with visual content. Dialogue matches lip movements, sound effects align with visual events, and ambient soundscapes complement the scene atmosphere.

**Iterative Refinement:** The remix functionality allows precise, controlled modifications to generated videos. You can adjust specific elements while preserving everything else, enabling efficient iteration toward your exact vision.

**Flexible Quality Tiers:** With two model variants (sora-2 and sora-2-pro), you can choose between rapid iteration for exploration or high-fidelity output for final production, optimizing for either speed or quality based on your workflow stage.

**Image-to-Video Animation:** Reference images can be used as anchors for the first frame, locking in specific visual elements like character design, wardrobe, or setting while the model animates the scene according to your text prompt.

### When to Use Sora 2

**Use Sora 2 when you need:**
- Rapid iteration and exploration of creative concepts (sora-2)
- Production-quality cinematic output (sora-2-pro)
- Synchronized audio generation with dialogue and sound effects
- Image-to-video animation from reference images
- Iterative refinement through remix functionality
- API-based integration for automated workflows
- Flexible resolution options including vertical formats

**Consider alternatives when you need:**
- Longer video durations beyond 12 seconds (use Kling O1 Edit or Veo 3.1)
- Precise character motion transfer from reference videos (use Kling Motion Control)
- 4K resolution output (use Veo 3.1 or sora-2-pro with upscaling)
- Advanced video editing and style transfer (use Kling O1 Edit)

---

## Technical Specifications

### Model Variants

| Model | Purpose | Quality | Speed | Best For |
|-------|---------|---------|-------|----------|
| **sora-2** | Speed & flexibility | Good | Fast | Iteration, concepting, social media, prototypes |
| **sora-2-pro** | Production quality | Excellent | Slower | Final output, marketing, high-fidelity content |

### Resolution & Output

| Parameter | sora-2 | sora-2-pro |
|-----------|--------|------------|
| **Landscape** | 1280x720 | 1280x720, 1024x1792 |
| **Portrait** | 720x1280 | 720x1280, 1792x1024 |
| **Duration** | 4, 8, 12 seconds | 4, 8, 12 seconds |
| **Default Duration** | 4 seconds | 4 seconds |

### API Parameters

**Required Parameters:**
- `model`: "sora-2" or "sora-2-pro"
- `prompt`: Text description of desired video

**Optional Parameters:**
- `size`: "{width}x{height}" (default varies by model)
- `seconds`: "4", "8", or "12" (default: "4")
- `input_reference`: Image file for image-to-video generation
- `remix_id`: ID of previous video to remix

### Content Restrictions

**Current Limitations:**
- Content must be suitable for audiences under 18
- No copyrighted characters or copyrighted music
- No real people or public figures
- No input images containing human faces (temporary restriction)

### Platform Access

**API Access (Preview):**
- Asynchronous generation with webhooks
- Five endpoints: create, status, download, list, delete
- Programmatic integration for workflows

**iOS App "Sora":**
- Social feed for exploration
- Direct creation interface
- Community sharing

---

## Prompting Philosophy

### The Cinematographer Analogy

Think of prompting Sora 2 like briefing a cinematographer who has never seen your storyboard. If you leave out critical details, they will improvise based on their training and experience. Sometimes this improvisation yields beautiful, unexpected results. Other times, it diverges from your vision. The key is understanding when to be specific and when to leave creative space.

**Detailed prompts** give you control and consistency. They work best when you have a precise vision and need predictable results across multiple generations or when maintaining continuity across shots.

**Lighter prompts** open space for creative outcomes. They work best during exploration, when you want surprising variations, or when you trust the model's aesthetic judgment.

The right balance depends on your goals and the result you're aiming for. Treat your prompt as a creative wish list, not a contract.

### The Iteration Mindset

Using the same prompt multiple times will lead to different results. This is a feature, not a bug. Each generation is a fresh take, and sometimes the second or third option is better than the first. Be prepared to iterate. Small changes to camera work, lighting, or action can shift the outcome dramatically.

Collaborate with the model: you provide direction, and the model delivers creative variations. Most importantly, **shorter clips follow instructions more reliably**. If your project allows, you may see better results by stitching together two 4-second clips in editing instead of generating a single 8-second clip.

### Control vs. Creativity Spectrum

```
High Control                                                    High Creativity
(Detailed Prompts)                                              (Light Prompts)
|----------------------------------------------------------------|
Predictable, consistent results                    Surprising, varied outcomes
Best for: production, continuity                   Best for: exploration, discovery
```

Understanding where your current task falls on this spectrum will guide how much detail to include in your prompts.

---

## Core Prompting Framework

### The Five-Part Structure

Sora 2 responds best to prompts that separate different types of information into clear sections. This structure is not mandatory, but it provides a reliable framework for consistent results.

```
[Style/Aesthetic] + [Scene Description] + [Cinematography] + [Actions] + [Audio/Dialogue]
```

### Component Breakdown

#### 1. Style/Aesthetic

**Purpose:** Establish the overall visual tone and reference point for all creative decisions.

**Why It Matters:** Style is one of the most powerful levers for guiding the model. Describing the aesthetic early (e.g., "1970s film," "epic IMAX-scale scene," "16mm black-and-white") sets a visual tone that frames all other choices.

**Examples:**
```
"Style: Hand-painted 2D/3D hybrid animation with soft brush textures, warm tungsten lighting, and a tactile, stop-motion feel."

"Style: 1970s romantic drama, shot on 35mm film with natural flares, soft focus, and warm halation."

"Style: Modern smartphone footage, handheld with natural shake, vertical format optimized for social media."
```

#### 2. Scene Description

**Purpose:** Provide the prose description of what's happening, where it's happening, and who's involved.

**Elements:**
- Characters and their appearance
- Setting and environment details
- Costumes and props
- Weather and atmospheric conditions
- Background activity

**Examples:**
```
"Inside a cluttered workshop, shelves overflow with gears, bolts, and yellowing blueprints. At the center, a small round robot sits on a wooden bench, its dented body patched with mismatched plates and old paint layers."

"At golden hour, a brick tenement rooftop transforms into a small stage. Laundry lines strung with white sheets sway in the wind, catching the last rays of sunlight."
```

#### 3. Cinematography

**Purpose:** Define camera framing, angle, lens characteristics, and depth of field.

**Structure:**
```
Cinematography:
Camera shot: [framing and angle]
Lens: [focal length and characteristics]
Depth of field: [shallow, deep, or specific description]
Mood: [overall tone]
```

**Examples:**
```
Cinematography:
Camera: medium close-up, slow push-in with gentle parallax
Lens: 35mm virtual lens; shallow depth of field
Mood: gentle, whimsical, a touch of suspense
```

```
Cinematography:
Camera shot: wide shot, low angle
Depth of field: shallow (sharp on subject, blurred background)
Lighting + palette: warm backlight with soft rim
```

#### 4. Actions

**Purpose:** Describe what happens in the shot, broken down into specific beats or gestures.

**Best Practices:**
- Describe actions in beats or counts
- One clear camera move, one clear subject action
- Use concrete verbs and specific gestures
- Keep movement simple and grounded in time

**Examples:**
```
Actions:
- The robot taps the bulb; sparks crackle.
- It flinches, dropping the bulb, eyes widening.
- The bulb tumbles in slow motion; it catches it just in time.
- A puff of steam escapes its chest — relief and pride.
```

```
Actions:
- She spins; her dress flares, catching sunlight.
- He steps in, catches her hand, and dips her into shadow.
- Sheets drift across frame, briefly veiling the skyline before parting again.
```

#### 5. Audio/Dialogue

**Purpose:** Specify spoken dialogue and background sound.

**Structure:**
```
Dialogue:
- [Speaker]: "[Exact words]"
- [Speaker]: "[Exact words]"

Background Sound:
[Description of ambient atmosphere and sound effects]
```

**Examples:**
```
Dialogue:
- Robot says quietly: "Almost lost it… but I got it!"

Background Sound:
Rain, ticking clock, soft mechanical hum, faint bulb sizzle.
```

```
Dialogue:
- Woman (laughing): "See? Even the city dances with us tonight."
- Man (smiling): "Only because you lead."

Background Sound:
Natural ambience only: faint wind, fabric flutter, street noise, muffled music. No added score.
```

### Complete Example

**Full Prompt Using Five-Part Structure:**

```
Style: 1970s romantic drama, shot on 35mm film with natural flares, soft focus, and warm halation. Slight gate weave and handheld micro-shake evoke vintage intimacy. Warm Kodak-inspired grade; light halation on bulbs; film grain and soft vignette for period authenticity.

At golden hour, a brick tenement rooftop transforms into a small stage. Laundry lines strung with white sheets sway in the wind, catching the last rays of sunlight. Strings of mismatched fairy bulbs hum faintly overhead. A young woman in a flowing red silk dress dances barefoot, curls glowing in the fading light. Her partner — sleeves rolled, suspenders loose — claps along, his smile wide and unguarded. Below, the city hums with car horns, subway tremors, and distant laughter.

Cinematography:
Camera: medium-wide shot, slow dolly-in from eye level
Lens: 40mm spherical; shallow focus to isolate the couple from skyline
Lighting: golden natural key with tungsten bounce; edge from fairy bulbs
Mood: nostalgic, tender, cinematic

Actions:
- She spins; her dress flares, catching sunlight.
- Woman (laughing): "See? Even the city dances with us tonight."
- He steps in, catches her hand, and dips her into shadow.
- Man (smiling): "Only because you lead."
- Sheets drift across frame, briefly veiling the skyline before parting again.

Background Sound:
Natural ambience only: faint wind, fabric flutter, street noise, muffled music. No added score.
```

### Simplified Prompt Example

For rapid iteration or when creative freedom is desired, a simpler prompt works well:

```
In a 90s documentary-style interview, an old Swedish man sits in a study and says, "I still remember when I was young."
```

This prompt will reliably produce videos matching these requirements, but many details (time of day, lighting, character appearance, set design) are left to the model's interpretation.

---

## Cinematography Mastery

### Visual Cues That Steer the Look

Clarity wins. Instead of vague cues like "a beautiful street," write "wet asphalt, zebra crosswalk, neon sign reflection." Instead of "moves quickly," specify "jogs three steps and stops at the curb." Verbs and nouns that point to visible results will always give you clearer, more consistent output.

### Weak vs. Strong Prompts

| Weak Prompt | Strong Prompt |
|-------------|---------------|
| "A beautiful street at night" | "Wet asphalt, zebra crosswalk, neon signs reflecting in puddles" |
| "Person moves quickly" | "Cyclist pedals three times, brakes, and stops at crosswalk" |
| "Cinematic look" | "Anamorphic 2.0x lens, shallow DOF, volumetric light" |
| "Camera shot: cinematic look" | "Camera shot: wide shot, low angle; Depth of field: shallow (sharp on subject, blurred background); Lighting + palette: warm backlight with soft rim" |

### Shot Framing

**Wide Establishing Shot:**
- **Purpose:** Establish location, show spatial relationships, provide context
- **Example:** "wide establishing shot, eye level"
- **Use When:** Opening scenes, location changes, showing scale

**Medium Shot:**
- **Purpose:** Balance subject and environment, standard for dialogue
- **Example:** "medium shot, slight angle from behind"
- **Use When:** Conversations, character interactions, balanced storytelling

**Medium Close-Up:**
- **Purpose:** Focus on character while maintaining some context
- **Example:** "medium close-up shot, slight angle from behind"
- **Use When:** Emotional moments, important dialogue, character focus

**Close-Up:**
- **Purpose:** Emphasize emotion, reveal detail, create intimacy
- **Example:** "close-up, shallow depth of field, subject sharp"
- **Use When:** Emotional peaks, important objects, intimate moments

**Extreme Close-Up:**
- **Purpose:** Maximum detail, intense focus on specific element
- **Example:** "extreme close-up of hands threading a needle"
- **Use When:** Critical details, tactile moments, heightened tension

### Camera Angles

**Eye Level:**
- **Effect:** Neutral, natural perspective
- **Example:** "wide shot, eye level"
- **Use When:** Balanced storytelling, neutral observation

**Low Angle:**
- **Effect:** Subject appears powerful, imposing, heroic
- **Example:** "wide shot, low angle looking up at the building"
- **Use When:** Emphasizing power, scale, or importance

**High Angle:**
- **Effect:** Subject appears vulnerable, small, overwhelmed
- **Example:** "high angle looking down at the character"
- **Use When:** Showing vulnerability, isolation, or weakness

**Dutch Angle (Canted):**
- **Effect:** Disorientation, unease, dynamic tension
- **Example:** "medium shot, canted angle 15 degrees"
- **Use When:** Psychological tension, action sequences, unease

### Camera Movement

**Static Shot:**
- **Description:** Camera remains completely still
- **Effect:** Stable, focused, allows subject action to dominate
- **Example:** "static camera, medium shot of character at desk"

**Slow Push-In (Dolly In):**
- **Description:** Camera moves slowly toward subject
- **Effect:** Builds intimacy, increases tension, draws viewer closer
- **Example:** "slow push-in toward character's face"

**Slow Pull-Out (Dolly Out):**
- **Description:** Camera moves slowly away from subject
- **Effect:** Reveals context, creates distance, shows isolation
- **Example:** "slow pull-out revealing the empty room"

**Tracking Shot:**
- **Description:** Camera moves laterally alongside subject
- **Effect:** Dynamic energy, maintains framing while showing movement
- **Example:** "tracking left to right with the character walking"

**Slow Pan:**
- **Description:** Camera rotates horizontally on fixed position
- **Effect:** Reveals environment, shows spatial relationships
- **Example:** "slowly panning across the cityscape"

**Slow Tilt:**
- **Description:** Camera rotates vertically on fixed position
- **Effect:** Reveals scale, shows height relationships
- **Example:** "slowly tilting camera up the skyscraper"

**Handheld:**
- **Description:** Natural camera shake mimicking human movement
- **Effect:** Realism, urgency, documentary feel, intimacy
- **Example:** "handheld ENG camera following the action"

**Crane/Jib:**
- **Description:** Camera moves vertically, often revealing scale
- **Effect:** Epic scope, dramatic reveals, establishing scale
- **Example:** "crane shot ascending to reveal the landscape"

**Orbit/Arc:**
- **Description:** Camera circles around subject
- **Effect:** Reveals subject from multiple angles, creates emphasis
- **Example:** "slow arc around the character"

### Depth of Field

**Shallow Depth of Field:**
- **Description:** Narrow focus range, blurred foreground/background
- **Effect:** Isolates subject, creates cinematic look, directs attention
- **Example:** "shallow depth of field, subject sharp, background blurred"
- **Use When:** Portraits, emphasis on specific subject, cinematic aesthetic

**Deep Focus:**
- **Description:** Wide focus range, everything sharp from foreground to background
- **Effect:** Shows spatial depth, allows viewer to explore frame
- **Example:** "deep focus, foreground and background both sharp"
- **Use When:** Complex scenes, spatial relationships, environmental storytelling

**Rack Focus:**
- **Description:** Focus shifts from one subject to another during shot
- **Effect:** Redirects attention, reveals new information
- **Example:** "rack focus from foreground object to background character"
- **Use When:** Revealing new elements, shifting narrative focus

### Lens Characteristics

**Wide-Angle Lens (24mm-35mm):**
- **Effect:** Broader field of view, slight distortion, emphasizes space
- **Example:** "35mm lens, wide field of view"
- **Use When:** Establishing shots, confined spaces, dynamic perspective

**Standard Lens (40mm-50mm):**
- **Effect:** Natural perspective similar to human vision
- **Example:** "50mm lens, natural perspective"
- **Use When:** General purpose, balanced storytelling, neutral look

**Telephoto Lens (85mm-135mm):**
- **Effect:** Compressed perspective, shallow depth of field, isolated subject
- **Example:** "85mm lens, compressed perspective"
- **Use When:** Portraits, isolating subjects, compressed backgrounds

**Anamorphic Lens:**
- **Effect:** Widescreen aspect ratio, characteristic lens flares, oval bokeh
- **Example:** "anamorphic 2.0x lens, cinematic widescreen"
- **Use When:** Epic cinematic look, stylized aesthetic

---

## Motion and Timing Control

### The Challenge of Movement

Movement is often the hardest part to get right in AI video generation. The key is to keep it simple. Each shot should have **one clear camera move** and **one clear subject action**. Actions work best when described in beats or counts—small steps, gestures, or pauses—so they feel grounded in time.

### Describing Actions in Beats

**Weak:**
```
"Actor walks across the room."
```

**Strong:**
```
"Actor takes four steps to the window, pauses, and pulls the curtain in the final second."
```

The strong example breaks the action into specific beats: four steps (timed motion), pause (moment of stillness), pulls curtain (final action). This gives the model clear temporal structure.

### Action Timing Guidelines

| Clip Duration | Recommended Actions |
|---------------|---------------------|
| **4 seconds** | 1-2 simple actions or gestures |
| **8 seconds** | 2-4 distinct beats or movements |
| **12 seconds** | 3-6 beats, or one complex sequence |

### Simple vs. Complex Actions

**Simple Actions (Reliable):**
```
- Character turns head to look at camera
- Person picks up coffee cup and takes a sip
- Door opens and character steps through
- Character waves and smiles
```

**Complex Actions (Less Reliable):**
```
- Character performs elaborate dance routine
- Multiple characters interact with complex choreography
- Rapid action sequences with many movements
- Precise timing of multiple simultaneous actions
```

**Strategy:** Start with simple actions. Once a simple version works, use remix to add complexity incrementally.

### Camera Movement Guidelines

**One Move Per Shot:**
Each shot should have one primary camera movement. Combining multiple camera moves (e.g., "dolly in while panning left and tilting up") often produces unpredictable results.

**Reliable Camera Moves:**
```
- Slow push-in toward subject
- Tracking shot following character
- Static camera with no movement
- Slow pan across environment
- Gentle tilt up or down
```

**Less Reliable Camera Moves:**
```
- Complex multi-axis movements
- Rapid camera movements
- Precise choreographed camera paths
- Camera movements synchronized with complex subject actions
```

### Pacing and Rhythm

**Slow Pacing:**
- Use words like "slowly," "gently," "gradually"
- Describe pauses and stillness
- Allow moments to breathe

**Example:**
```
"The character slowly turns toward the window, pauses for a moment, then gently pulls back the curtain."
```

**Medium Pacing:**
- Standard action description without modifiers
- Natural, conversational rhythm

**Example:**
```
"The character walks to the window and pulls back the curtain."
```

**Fast Pacing:**
- Use words like "quickly," "suddenly," "rapidly"
- Describe urgent movements
- Note: Fast pacing is less reliable in AI generation

**Example:**
```
"The character suddenly spins around and quickly moves to the window."
```

---

## Lighting and Color Consistency

### Why Lighting Matters

Light determines mood as much as action or setting. Diffuse light across the frame feels calm and neutral, while a single strong source creates sharp contrast and tension. When you want to cut multiple clips together, keeping lighting logic consistent is what makes the edit seamless.

### Weak vs. Strong Lighting Descriptions

**Weak:**
```
"Lighting + palette: brightly lit room"
```

**Strong:**
```
"Lighting + palette: soft window light with warm lamp fill, cool rim from hallway
Palette anchors: amber, cream, walnut brown"
```

The strong example specifies:
- Light quality (soft)
- Light sources (window, lamp, hallway)
- Color temperature (warm, cool)
- Specific color anchors (amber, cream, walnut brown)

### Lighting Quality

**Soft/Diffused Light:**
- **Description:** Even, gentle illumination with gradual shadows
- **Effect:** Flattering, calm, inviting, natural
- **Examples:**
  - "Soft window light filtering through sheer curtains"
  - "Diffused overcast daylight, even and gentle"
  - "Soft bounce light from white walls"

**Hard Light:**
- **Description:** Direct, strong illumination with sharp shadows
- **Effect:** Dramatic, tense, high contrast, stylized
- **Examples:**
  - "Single hard key light from above, sharp shadows"
  - "Direct sunlight creating strong contrast"
  - "Harsh spotlight with defined edges"

**Volumetric Light:**
- **Description:** Visible light beams through atmosphere (fog, dust, haze)
- **Effect:** Atmospheric, cinematic, ethereal, dramatic
- **Examples:**
  - "Volumetric light beams through dusty warehouse windows"
  - "God rays filtering through forest canopy"
  - "Visible light shafts in foggy alley"

### Light Direction

**Front Light:**
- **Effect:** Even illumination, minimal shadows, flat
- **Example:** "Front-lit with soft key light at camera position"

**Side Light:**
- **Effect:** Reveals texture, creates dimension, dramatic
- **Example:** "Side light from window creating half-lit face"

**Back Light (Rim Light):**
- **Effect:** Separates subject from background, creates glow, dramatic
- **Example:** "Warm backlight creating rim around subject"

**Top Light:**
- **Effect:** Dramatic shadows under eyes and nose, can be unflattering
- **Example:** "Overhead lighting casting shadows downward"

**Under Light:**
- **Effect:** Unnatural, eerie, horror aesthetic
- **Example:** "Light from below creating ominous shadows"

### Color Temperature

**Warm Light (2700K-3500K):**
- **Colors:** Amber, orange, golden, yellow
- **Mood:** Cozy, inviting, nostalgic, intimate
- **Examples:**
  - "Warm tungsten lamp glow"
  - "Golden hour sunlight"
  - "Candlelight ambiance"

**Neutral Light (4000K-5000K):**
- **Colors:** White, balanced, natural
- **Mood:** Neutral, realistic, balanced
- **Examples:**
  - "Neutral daylight through windows"
  - "Balanced studio lighting"
  - "Overcast natural light"

**Cool Light (5500K-7000K):**
- **Colors:** Blue, cyan, steel, ice
- **Mood:** Clinical, modern, melancholic, tense
- **Examples:**
  - "Cool fluorescent office lighting"
  - "Blue twilight atmosphere"
  - "Cold moonlight through windows"

### Color Palette Anchors

Naming three to five specific colors helps keep the palette stable across shots and makes editing seamless.

**Example Palettes:**

**Warm and Cozy:**
```
Palette anchors: amber, cream, walnut brown, rust, soft gold
```

**Cool and Modern:**
```
Palette anchors: steel blue, charcoal gray, ice white, silver, cool teal
```

**Nostalgic and Vintage:**
```
Palette anchors: faded yellow, dusty rose, olive green, sepia, cream
```

**Dramatic and Moody:**
```
Palette anchors: deep burgundy, charcoal, burnt orange, midnight blue, gold
```

### Lighting Consistency Across Shots

When generating multiple shots for the same scene, maintain consistent lighting logic:

**Consistent Elements:**
- Light source positions (window left, lamp right)
- Color temperature (warm interior, cool exterior)
- Time of day (golden hour, midday, night)
- Weather conditions (sunny, overcast, rainy)
- Palette anchors (same color names across prompts)

**Example Multi-Shot Consistency:**

**Shot 1:**
```
Lighting: soft window light from camera left, warm lamp fill from right
Palette anchors: amber, cream, walnut brown
```

**Shot 2 (Same Scene):**
```
Lighting: soft window light from camera left, warm lamp fill from right
Palette anchors: amber, cream, walnut brown
```

By repeating the exact lighting description and palette anchors, the shots will cut together seamlessly.

---

## Image Input for Enhanced Control

### Overview

For fine-grained control over composition and style, you can use an image input as a visual reference. This locks in elements like character design, wardrobe, set dressing, or overall aesthetic. The model uses the image as an anchor for the first frame, while your text prompt defines what happens next.

### How to Use Image Input

**API Implementation:**
```javascript
const video = await openai.videos.create({
    model: 'sora-2-pro',
    prompt: "She turns around and smiles, then slowly walks out of the frame.",
    input_reference: imageFile, // Image file as reference
    size: "1280x720",
    seconds: "8"
});
```

**Requirements:**
- Image must match target video resolution
- Supported formats: JPEG, PNG, WebP
- Image becomes the anchor for the first frame

### Use Cases

**Character Consistency:**
Use a reference image of a specific character to maintain their appearance across multiple shots.

**Example:**
```
Reference Image: Portrait of a young woman with red curly hair, wearing a blue jacket
Prompt: "She turns around and smiles, then slowly walks out of the frame."
Result: Video starts with the exact character from the reference, then animates according to prompt
```

**Setting and Environment:**
Use a reference image of a specific location or set design.

**Example:**
```
Reference Image: Cozy coffee shop interior with warm lighting
Prompt: "Camera slowly pans across the coffee shop, revealing customers at tables."
Result: Video uses the exact coffee shop from reference, then animates the camera movement
```

**Style and Aesthetic:**
Use a reference image that captures a specific visual style or mood.

**Example:**
```
Reference Image: Moody noir-style street scene with neon lights
Prompt: "A detective walks down the street, collar up against the rain."
Result: Video maintains the noir aesthetic from reference while animating the action
```

**Product Visualization:**
Use a reference image of a product to create marketing content.

**Example:**
```
Reference Image: Sleek smartwatch on white background
Prompt: "The watch screen illuminates, showing the time, then the camera slowly orbits around it."
Result: Video features the exact product from reference with animated presentation
```

### Generating Reference Images

If you don't already have visual references, OpenAI's GPT Image model (or other AI image generators) can create them. This workflow allows you to:

1. Generate a reference image with specific visual characteristics
2. Pass that image to Sora 2 as input_reference
3. Animate the scene with your text prompt

**Example Workflow:**

**Step 1: Generate Reference Image**
```
GPT Image Prompt: "A cozy workshop interior with wooden workbench, tools hanging on walls, warm lighting from overhead lamp, vintage aesthetic, photorealistic"
```

**Step 2: Animate with Sora 2**
```
Input Reference: Generated workshop image
Sora 2 Prompt: "Camera slowly pans across the workshop, revealing details of the tools and workbench. Dust particles float in the warm light."
```

### Best Practices

**Match Resolution:**
Always ensure your reference image matches the target video resolution to avoid scaling artifacts.

**Clear Composition:**
Use reference images with clear, unambiguous composition. Cluttered or ambiguous images may produce unexpected results.

**Consistent Lighting:**
If generating multiple shots, use reference images with consistent lighting to maintain visual continuity.

**Describe the Action, Not the Image:**
Your text prompt should describe what happens after the first frame, not re-describe the reference image.

❌ **Don't:**
```
Reference Image: Woman in blue jacket
Prompt: "A woman in a blue jacket stands in a room"
```

✅ **Do:**
```
Reference Image: Woman in blue jacket
Prompt: "She turns around and smiles, then slowly walks out of the frame"
```

---

## Audio and Dialogue Generation

### Overview

Sora 2 generates synchronized audio directly from text descriptions, including dialogue, sound effects, and ambient soundscapes. Audio generation is one of Sora 2's most distinctive features, eliminating the need for separate audio production workflows.

### Dialogue Generation

**Structure:**
Place dialogue in a separate block below your prose description so the model clearly distinguishes visual description from spoken lines.

**Format:**
```
Dialogue:
- [Speaker]: "[Exact words]"
- [Speaker]: "[Exact words]"
```

**Best Practices:**
- Keep lines concise and natural
- Limit exchanges to match clip length
- Label speakers consistently
- Use alternating turns for multi-character scenes

**Timing Guidelines:**

| Clip Duration | Dialogue Capacity |
|---------------|-------------------|
| **4 seconds** | 1-2 short exchanges |
| **8 seconds** | 2-4 short exchanges |
| **12 seconds** | 4-6 short exchanges or 1-2 longer lines |

### Dialogue Examples

**Simple Single-Line Dialogue:**
```
Dialogue:
- Robot says quietly: "Almost lost it… but I got it!"
```

**Two-Person Exchange:**
```
Dialogue:
- Detective: "You're lying. I can hear it in your silence."
- Suspect: "Or maybe I'm just tired of talking."
```

**Dialogue with Emotional Direction:**
```
Dialogue:
- Woman (laughing): "See? Even the city dances with us tonight."
- Man (smiling): "Only because you lead."
```

**Dialogue Integrated with Actions:**
```
Actions:
- She spins; her dress flares, catching sunlight.
- Woman (laughing): "See? Even the city dances with us tonight."
- He steps in, catches her hand, and dips her into shadow.
- Man (smiling): "Only because you lead."
```

### Background Sound

**Purpose:**
Describe ambient atmosphere and sound effects that complement the visual scene.

**Structure:**
```
Background Sound:
[Description of ambient soundscape and sound effects]
```

**Examples:**

**Simple Ambient Sound:**
```
Background Sound:
Rain, ticking clock, soft mechanical hum, faint bulb sizzle.
```

**Detailed Soundscape:**
```
Background Sound:
The hum of espresso machines and the murmur of voices form the background. Occasional clink of cups and saucers. Soft jazz music playing quietly.
```

**Natural Ambience Only:**
```
Background Sound:
Natural ambience only: faint wind, fabric flutter, street noise, muffled music. No added score.
```

**Diegetic Sound (Sound from within the scene):**
```
Background Sound:
Diegetic only: faint rail screech, train brakes hiss, distant announcement muffled, low ambient hum. Footsteps and paper rustle; no score or added foley.
```

### Sound as Rhythm Cue

Even if your shot is silent, you can suggest pacing with one small sound. Think of it as a rhythm cue rather than a full soundtrack.

**Examples:**
```
Background Sound:
Distant traffic hiss

Background Sound:
A crisp snap

Background Sound:
Faint clock ticking
```

### Complete Audio Example

**Full Prompt with Dialogue and Sound:**

```
A cramped, windowless room with walls the color of old ash. A single bare bulb dangles from the ceiling, its light pooling onto the scarred metal table at the center. Two chairs face each other across it. On one side sits the Detective, trench coat draped across the back of his chair, eyes sharp and unblinking. Across from him, the Suspect slouches, cigarette smoke curling lazily toward the ceiling. The silence presses in, broken only by the faint hum of the overhead light.

Dialogue:
- Detective: "You're lying. I can hear it in your silence."
- Suspect: "Or maybe I'm just tired of talking."
- Detective: "Either way, you'll talk before the night's over."

Background Sound:
The hum of the overhead light, occasional cigarette smoke exhale, distant muffled sounds from outside the room.
```

### Audio Best Practices

**1. Match Audio to Visual Mood:**
Ensure audio atmosphere aligns with visual tone. A tense visual scene should have tense audio (silence, distant sounds, ominous hums), while a joyful scene should have uplifting audio (laughter, music, cheerful ambiance).

**2. Be Specific About Sound Quality:**
Instead of "footsteps," describe "heavy boot footsteps echoing on marble floor."

**3. Describe Timing:**
"As she opens the door, the hinges creak" is better than "door creaking sound."

**4. Layer Audio Elements:**
Combine dialogue, sound effects, and ambient noise for rich soundscapes.

**5. Consider Silence:**
Sometimes the absence of sound is powerful. You can specify "quiet, minimal sound" or "eerie silence."

---

## Remix Functionality

### Overview

Remix is Sora 2's iterative refinement tool. It allows you to make controlled changes to a generated video while preserving everything else. Think of remix as nudging, not gambling. Use it to make one change at a time, and say exactly what you're changing.

### How Remix Works

**Workflow:**
1. Generate initial video
2. Identify what needs to change
3. Use remix with specific modification instruction
4. Generate new version with that change applied

**API Implementation:**
```javascript
const remixVideo = await openai.videos.create({
    model: 'sora-2-pro',
    prompt: "Same shot, switch to 85mm lens",
    remix_id: "video_abc123", // ID of original video
    size: "1280x720",
    seconds: "8"
});
```

### Remix Strategies

**One Change at a Time:**
Make controlled, incremental changes rather than multiple simultaneous modifications.

❌ **Don't:**
```
"Change the lighting, camera angle, and character wardrobe"
```

✅ **Do:**
```
First remix: "Same shot, change lighting to warm golden hour"
Second remix: "Same shot, change camera angle to low angle"
Third remix: "Same shot, change character wardrobe to blue jacket"
```

**Pin and Tweak:**
When a result is close, pin it as a reference and describe only the tweak.

**Example:**
```
Original: Medium shot of character at desk
Remix 1: "Same shot, switch to 85mm lens"
Remix 2: "Same lighting, new palette: teal, sand, rust"
Remix 3: "Same framing, character turns head to look at camera"
```

### Common Remix Use Cases

**Lens Change:**
```
"Same shot, switch to 50mm lens"
"Same shot, change to wide-angle 35mm lens"
```

**Lighting Adjustment:**
```
"Same shot, change lighting to warm afternoon sunlight"
"Same lighting, add cool rim light from behind"
```

**Color Palette Shift:**
```
"Same shot, new palette: teal, sand, rust"
"Same composition, shift to cooler color temperature"
```

**Camera Movement Modification:**
```
"Same shot, change camera movement to slow push-in"
"Same framing, make camera static instead of moving"
```

**Action Timing:**
```
"Same shot, slow down the character's movement"
"Same action, add a pause before the final gesture"
```

**Character Modification:**
```
"Same shot, character wears a blue jacket instead of red"
"Same framing, character smiles at the end"
```

**Background Changes:**
```
"Same shot, change background to urban street"
"Same composition, add rain falling in background"
```

### Troubleshooting with Remix

**If a shot keeps misfiring:**

1. **Strip it back:** Freeze the camera, simplify the action, clear the background
2. **Get a working version:** Generate the simplest version that works
3. **Layer complexity:** Use remix to add elements step by step

**Example:**

**Initial Attempt (Too Complex):**
```
"Tracking shot following character through crowded market, camera weaving between stalls, character interacts with vendors, warm golden hour lighting, vibrant colors"
Result: Inconsistent, motion artifacts
```

**Simplified Version:**
```
"Static shot of character standing in market, warm lighting"
Result: Works well
```

**Remix 1 - Add Camera Movement:**
```
"Same shot, add slow tracking movement following character"
Result: Works well
```

**Remix 2 - Add Background Activity:**
```
"Same shot, add vendors and customers in background"
Result: Works well
```

**Remix 3 - Refine Lighting:**
```
"Same shot, enhance golden hour lighting with warmer tones"
Result: Final polished version
```

### Remix Best Practices

**Be Explicit:**
Always start with "Same shot" or "Same composition" to anchor the remix, then specify the change.

**Preserve What Works:**
If lighting is perfect, don't mention it in the remix. Only describe what's changing.

**Iterate Patiently:**
Remix is most effective when used for incremental refinement, not radical transformation.

**Use as Quality Control:**
If a generation is 90% perfect, remix to fix the 10% rather than regenerating from scratch.

---

## Ultra-Detailed Cinematic Prompting

### Overview

For complex, cinematic shots that require precise control, you can go beyond the standard prompt structure and specify the look, camera setup, grading, soundscape, and even shot rationale in professional production terms. This approach is similar to how a director briefs a camera crew or VFX team.

### When to Use Ultra-Detailed Prompting

**Use ultra-detailed prompts when:**
- Matching real cinematography styles (IMAX aerials, 35mm handheld, vintage 16mm)
- Maintaining strict continuity across shots
- Creating production-quality output for professional use
- Requiring precise control over every visual element
- Building a specific, recognizable aesthetic

**Use standard prompts when:**
- Exploring creative concepts
- Rapid iteration and experimentation
- Allowing model creative freedom
- Time-sensitive projects

### Ultra-Detailed Prompt Structure

```
Format & Look
[Technical specifications: shutter, capture format, grain, halation, etc.]

Lenses & Filtration
[Focal lengths, lens type, filters, optical characteristics]

Grade / Palette
[Highlights, mids, blacks with specific color descriptions]

Lighting & Atmosphere
[Light direction, quality, sources, atmospheric elements]

Location & Framing
[Foreground, midground, background elements, spatial composition]

Wardrobe / Props / Extras
[Detailed descriptions of all visual elements]

Sound
[Diegetic sound with technical specifications]

Optimized Shot List
[Timestamped breakdown of shots with specific purposes]

Camera Notes
[Technical guidance on why specific choices work]

Finishing
[Post-production treatments, grain, color, mix]
```

### Complete Ultra-Detailed Example

**Urban Commuter Platform Scene:**

```
Format & Look
Duration 4s; 180° shutter; digital capture emulating 65mm photochemical contrast; fine grain; subtle halation on speculars; no gate weave.

Lenses & Filtration
32mm / 50mm spherical primes; Black Pro-Mist 1/4; slight CPL rotation to manage glass reflections on train windows.

Grade / Palette
Highlights: clean morning sunlight with amber lift.
Mids: balanced neutrals with slight teal cast in shadows.
Blacks: soft, neutral with mild lift for haze retention.

Lighting & Atmosphere
Natural sunlight from camera left, low angle (07:30 AM).
Bounce: 4×4 ultrabounce silver from trackside.
Negative fill from opposite wall.
Practical: sodium platform lights on dim fade.
Atmos: gentle mist; train exhaust drift through light beam.

Location & Framing
Urban commuter platform, dawn.
Foreground: yellow safety line, coffee cup on bench.
Midground: waiting passengers silhouetted in haze.
Background: arriving train braking to a stop.
Avoid signage or corporate branding.

Wardrobe / Props / Extras
Main subject: mid-30s traveler, navy coat, backpack slung on one shoulder, holding phone loosely at side.
Extras: commuters in muted tones; one cyclist pushing bike.
Props: paper coffee cup, rolling luggage, LED departure board (generic destinations).

Sound
Diegetic only: faint rail screech, train brakes hiss, distant announcement muffled (-20 LUFS), low ambient hum.
Footsteps and paper rustle; no score or added foley.

Optimized Shot List (2 shots / 4s total)

0.00–2.40 — "Arrival Drift" (32mm, shoulder-mounted slow dolly left)
Camera slides past platform signage edge; shallow focus reveals traveler mid-frame looking down tracks. Morning light blooms across lens; train headlights flare softly through mist. Purpose: establish setting and tone, hint anticipation.

2.40–4.00 — "Turn and Pause" (50mm, slow arc in)
Cut to tighter over-shoulder arc as train halts; traveler turns slightly toward camera, catching sunlight rim across cheek and phone screen reflection. Eyes flick up toward something unseen. Purpose: create human focal moment with minimal motion.

Camera Notes (Why It Reads)
Keep eyeline low and close to lens axis for intimacy.
Allow micro flares from train glass as aesthetic texture.
Preserve subtle handheld imperfection for realism.
Do not break silhouette clarity with overexposed flare; retain skin highlight roll-off.

Finishing
Fine-grain overlay with mild chroma noise for realism; restrained halation on practicals; warm-cool LUT for morning split tone.
Mix: prioritize train and ambient detail over footstep transients.
Poster frame: traveler mid-turn, golden rim light, arriving train soft-focus in background haze.
```

### Professional Cinematography Terminology

**Shutter Angle:**
- 180° shutter: Standard cinematic motion blur
- 90° shutter: Reduced motion blur, sharper action (Saving Private Ryan style)
- 360° shutter: Increased motion blur, dreamy quality

**Film Stock Emulation:**
- 65mm photochemical: Large format, high resolution, rich contrast
- 35mm film: Standard cinematic look, moderate grain
- 16mm film: Smaller format, more grain, documentary feel

**Lens Characteristics:**
- Spherical primes: Standard lenses, natural look
- Anamorphic: Widescreen, oval bokeh, horizontal flares
- Black Pro-Mist filter: Softens highlights, creates glow

**Lighting Terms:**
- Key light: Primary light source
- Fill light: Secondary light to soften shadows
- Rim light: Backlight that creates edge glow
- Practical: Light source visible in frame (lamp, candle)
- Bounce: Reflected light from surface
- Negative fill: Blocking light to deepen shadows

**Color Grading:**
- Lift: Adjusts blacks/shadows
- Gamma: Adjusts midtones
- Gain: Adjusts highlights
- LUT (Look-Up Table): Color grading preset

---

## Best Practices

### 1. Start with Style

Establish the overall aesthetic early in your prompt. Style is one of the most powerful levers for guiding the model toward your desired outcome.

**Examples:**
```
"Style: 1970s film"
"Style: Epic, IMAX-scale scene"
"Style: 16mm black-and-white film"
"Style: Modern smartphone footage, handheld, vertical format"
```

### 2. Use Concrete, Specific Language

Clarity wins. Vague descriptions produce unpredictable results. Specific, concrete language produces consistent output.

**Vague → Specific:**
- "Beautiful street" → "Wet asphalt, zebra crosswalk, neon signs reflecting in puddles"
- "Moves quickly" → "Jogs three steps and stops at the curb"
- "Nice lighting" → "Soft window light with warm lamp fill, cool rim from hallway"

### 3. Describe Actions in Beats

Break actions into specific, timed beats or counts. This grounds movement in time and makes it more reliable.

**Example:**
```
Actions:
- Character takes four steps to the window
- Pauses and looks outside
- Reaches up and pulls the curtain in the final second
```

### 4. Keep Movement Simple

Each shot should have one clear camera move and one clear subject action. Combining multiple movements often produces unpredictable results.

**Simple (Reliable):**
```
"Slow push-in toward character's face as they turn to look at camera"
```

**Complex (Less Reliable):**
```
"Camera dollies in while panning left and tilting up as character spins and jumps"
```

### 5. Specify Lighting and Color Anchors

Describe both the quality of light and specific color anchors (3-5 colors) to keep the palette stable.

**Example:**
```
Lighting: Soft window light with warm lamp fill, cool rim from hallway
Palette anchors: amber, cream, walnut brown
```

### 6. Use Shorter Clips for Reliability

The model follows instructions more reliably in shorter clips. If your project allows, generate two 4-second clips and stitch them together in editing instead of generating a single 8-second clip.

### 7. Iterate and Collaborate

Using the same prompt multiple times will lead to different results. This is a feature. Generate multiple options and choose the best. Use remix to refine results incrementally.

### 8. Match Resolution to Platform

Choose the appropriate resolution for your target platform:
- **1280x720 (landscape):** YouTube, general web content
- **720x1280 (portrait):** TikTok, Instagram Reels, YouTube Shorts
- **1024x1792 / 1792x1024 (sora-2-pro):** High-resolution vertical/horizontal content

### 9. Use Image References for Consistency

When you need consistent characters, settings, or styles across multiple shots, use image references to lock in visual elements.

### 10. Leverage Remix for Refinement

When a result is 90% perfect, use remix to fix the 10% rather than regenerating from scratch. Make one change at a time for best results.

---

## Common Mistakes & Troubleshooting

### Issue 1: Unpredictable or Inconsistent Results

**Symptoms:**
- Generated video doesn't match expectations
- Elements are random or inconsistent
- Each generation is wildly different

**Causes:**
- Prompt too vague
- Missing key details (cinematography, lighting, style)
- Ambiguous descriptions

**Solutions:**
1. **Use the five-part structure:** Style, scene, cinematography, actions, audio
2. **Add specific details:** Replace vague terms with concrete descriptions
3. **Establish style early:** Set the aesthetic tone at the beginning
4. **Use image references:** Lock in visual elements with reference images

**Example Fix:**

❌ **Vague:**
```
"A person in a room"
```

✅ **Specific:**
```
Style: Modern, naturalistic smartphone footage

A young woman sits at a desk in a cozy home office, typing on a laptop. Warm afternoon sunlight streams through a window to her left, creating soft shadows. She pauses, looks thoughtfully at the screen, then continues typing.

Cinematography:
Camera: medium shot, static, eye level
Lens: 50mm, shallow depth of field
Mood: peaceful, productive

Actions:
- Types for two seconds
- Pauses and looks at screen
- Resumes typing

Background Sound:
Quiet keyboard clicks, distant birds outside
```

### Issue 2: Camera Movement Not as Expected

**Symptoms:**
- Camera moves differently than described
- Camera doesn't move when it should
- Unpredictable or jerky camera motion

**Causes:**
- Vague camera descriptions
- Using non-standard terminology
- Combining multiple camera movements
- Conflicting instructions

**Solutions:**
1. **Use standard cinematography terms:** Dolly, tracking, pan, tilt, static
2. **One movement per shot:** Avoid combining multiple camera moves
3. **Be explicit:** "Slow dolly forward" not just "camera moves"
4. **Specify speed:** "Slowly," "gradually," "gently"

**Example Fix:**

❌ **Vague:**
```
"Camera moves around the subject"
```

✅ **Explicit:**
```
"Camera slowly orbits clockwise around the subject, completing a 90-degree arc from front to side view over 4 seconds"
```

### Issue 3: Actions Don't Match Description

**Symptoms:**
- Character actions are different from prompt
- Timing is off
- Actions feel rushed or incomplete

**Causes:**
- Actions not described in beats
- Too many actions for clip duration
- Complex actions that are difficult to generate
- Vague action descriptions

**Solutions:**
1. **Describe actions in beats:** Break into specific steps
2. **Match actions to duration:** 4s = 1-2 actions, 8s = 2-4 actions
3. **Keep actions simple:** One clear action at a time
4. **Use concrete verbs:** "Takes four steps" not "walks"

**Example Fix:**

❌ **Vague:**
```
"Character walks across the room"
```

✅ **Specific Beats:**
```
Actions:
- Character takes four steps toward the window
- Pauses and looks outside for one second
- Reaches up and pulls the curtain in the final second
```

### Issue 4: Lighting Doesn't Match Description

**Symptoms:**
- Lighting quality is different from prompt
- Color temperature is wrong
- Mood doesn't match description

**Causes:**
- Lighting description too vague
- Conflicting lighting information
- Lighting description buried in prompt
- Missing color temperature specification

**Solutions:**
1. **Be specific about lighting:** Direction, quality, source, color temperature
2. **Prioritize lighting:** Mention early or in dedicated section
3. **Specify color anchors:** Name 3-5 specific colors
4. **Describe light quality:** Soft, hard, diffused, directional

**Example Fix:**

❌ **Vague:**
```
"A room with good lighting"
```

✅ **Specific:**
```
Lighting: Soft afternoon sunlight streaming through large windows on the left side, creating gentle directional light with soft shadows. Warm lamp on desk provides fill light. Cool ambient light from hallway visible in background.

Palette anchors: warm amber, cream, soft gold, cool blue (hallway)
```

### Issue 5: Dialogue Doesn't Sync or Sound Natural

**Symptoms:**
- Dialogue timing is off
- Lip sync doesn't match
- Lines sound unnatural
- Too much dialogue for clip duration

**Causes:**
- Dialogue too long for clip duration
- Dialogue not in separate block
- Unnatural phrasing
- Too many speakers or exchanges

**Solutions:**
1. **Match dialogue to duration:** 4s = 1-2 short lines, 8s = 2-4 short lines
2. **Use separate dialogue block:** Distinguish from visual description
3. **Keep lines concise:** Short, natural phrases
4. **Label speakers consistently:** Use same names throughout

**Example Fix:**

❌ **Too Long:**
```
4-second clip with dialogue:
- Character: "I've been thinking about what you said yesterday, and I believe you're absolutely right about everything."
```

✅ **Appropriate Length:**
```
4-second clip with dialogue:
- Character: "You're right."
```

### Issue 6: Inconsistent Results Across Multiple Generations

**Symptoms:**
- Same prompt produces wildly different results
- Cannot reproduce a successful generation
- Difficult to maintain consistency

**Causes:**
- This is expected behavior (feature, not bug)
- Prompt leaves too much open to interpretation
- Not using image references for consistency

**Solutions:**
1. **Accept variability:** Generate multiple options and choose the best
2. **Use image references:** Lock in visual elements for consistency
3. **Add more detail:** Reduce ambiguity in prompts
4. **Use remix:** Build on successful generations incrementally

### Issue 7: Video Quality Lower Than Expected

**Symptoms:**
- Output looks soft or low quality
- Motion artifacts or inconsistencies
- Less detail than desired

**Causes:**
- Using sora-2 instead of sora-2-pro
- Lower resolution selected
- Complex motion or actions
- Clip duration too long

**Solutions:**
1. **Use sora-2-pro:** For production-quality output
2. **Select higher resolution:** Use maximum available resolution
3. **Simplify motion:** Reduce complexity of actions and camera movement
4. **Use shorter clips:** 4-second clips are more reliable than 8 or 12

---

## Advanced Workflows

### Workflow 1: Multi-Shot Sequence with Consistent Lighting

**Purpose:** Create multiple shots for the same scene with seamless visual continuity.

**Steps:**

**Step 1: Define Consistent Elements**

Establish lighting, color palette, and style that will be maintained across all shots.

```
Consistent Elements:
- Style: 1970s romantic drama, 35mm film
- Lighting: Golden hour sunlight from camera left, warm tungsten bounce
- Palette anchors: amber, cream, rust, soft gold
- Setting: Brick tenement rooftop at sunset
```

**Step 2: Shot 1 - Wide Establishing**

```
Style: 1970s romantic drama, shot on 35mm film with natural flares, soft focus, warm halation.

At golden hour, a brick tenement rooftop transforms into a small stage. Laundry lines strung with white sheets sway in the wind, catching the last rays of sunlight. Strings of mismatched fairy bulbs hum faintly overhead.

Cinematography:
Camera: wide shot, static, eye level
Lens: 40mm spherical; deep focus to show full environment
Lighting: golden natural key from camera left with tungsten bounce
Palette anchors: amber, cream, rust, soft gold
Mood: nostalgic, romantic, cinematic

Actions:
- Sheets sway gently in the wind
- Fairy lights twinkle
- Cityscape visible in background

Background Sound:
Faint wind, distant city traffic, muffled music
```

**Step 3: Shot 2 - Medium Two-Shot**

```
Style: 1970s romantic drama, shot on 35mm film with natural flares, soft focus, warm halation.

Same rooftop setting. A young woman in a flowing red silk dress and her partner (sleeves rolled, suspenders loose) dance together.

Cinematography:
Camera: medium-wide shot, slow dolly-in
Lens: 40mm spherical; shallow focus to isolate couple
Lighting: golden natural key from camera left with tungsten bounce; edge from fairy bulbs
Palette anchors: amber, cream, rust, soft gold
Mood: nostalgic, tender, cinematic

Actions:
- She spins; her dress flares, catching sunlight
- He steps in, catches her hand
- They sway together

Background Sound:
Faint wind, fabric flutter, distant city sounds
```

**Step 4: Shot 3 - Close-Up**

```
Style: 1970s romantic drama, shot on 35mm film with natural flares, soft focus, warm halation.

Same rooftop setting, focusing on the couple.

Cinematography:
Camera: close-up, static
Lens: 85mm; very shallow depth of field
Lighting: golden natural key from camera left with tungsten bounce; rim light from fairy bulbs
Palette anchors: amber, cream, rust, soft gold
Mood: intimate, romantic, cinematic

Actions:
- Woman smiles
- Man looks at her with affection
- Subtle movement, mostly stillness

Dialogue:
- Woman: "See? Even the city dances with us tonight."
- Man: "Only because you lead."

Background Sound:
Faint wind, distant city sounds, muffled music
```

**Step 5: Edit Together**

- Import all shots into editing software
- Verify lighting and color consistency
- Add transitions if needed
- Final color grade for uniformity

**Result:** Seamless multi-shot sequence with perfect visual continuity.

### Workflow 2: Iterative Refinement with Remix

**Purpose:** Start with a simple concept and progressively refine it to perfection using remix.

**Steps:**

**Step 1: Generate Simple Base Version**

```
Static shot of a detective sitting at his desk in a noir-style office. Moody lighting, 1940s aesthetic.
```

**Step 2: Remix - Add Camera Movement**

```
Remix Prompt: "Same shot, add slow push-in toward detective's face"
```

**Step 3: Remix - Refine Lighting**

```
Remix Prompt: "Same shot, enhance venetian blind shadows across the scene"
```

**Step 4: Remix - Add Action**

```
Remix Prompt: "Same shot, detective looks up at camera at the end"
```

**Step 5: Remix - Add Dialogue**

```
Remix Prompt: "Same shot, detective says: 'She walked in like trouble always does.'"
```

**Step 6: Remix - Final Color Grade**

```
Remix Prompt: "Same shot, increase contrast and deepen shadows for classic noir look"
```

**Result:** Polished, refined shot built incrementally through controlled iterations.

### Workflow 3: Image Reference to Video Pipeline

**Purpose:** Create consistent character-driven content using AI-generated reference images.

**Steps:**

**Step 1: Generate Character Reference Image**

Use GPT Image or another AI image generator:

```
GPT Image Prompt: "Portrait of a young female detective in her 30s, wearing a brown leather jacket, short dark hair, confident expression, film noir aesthetic, photorealistic, 1280x720 resolution"
```

**Step 2: Generate Setting Reference Image**

```
GPT Image Prompt: "Noir-style detective office interior, wooden desk with vintage lamp, venetian blinds casting shadows, 1940s aesthetic, moody lighting, photorealistic, 1280x720 resolution"
```

**Step 3: Shot 1 - Character Introduction**

```
Input Reference: Character portrait image
Sora 2 Prompt: "She turns her head to look directly at camera, slight smile forming. Moody noir lighting, confident expression."
Size: 1280x720
Seconds: 4
```

**Step 4: Shot 2 - Character in Setting**

```
Input Reference: Office setting image
Sora 2 Prompt: "Camera slowly pans across the detective office, revealing the desk, lamp, and venetian blind shadows. The detective enters frame from the right and sits at the desk."
Size: 1280x720
Seconds: 8
```

**Step 5: Shot 3 - Character Action**

```
Input Reference: Character portrait image
Sora 2 Prompt: "She sits at her desk, picks up a file, opens it and reads. Looks up with concern. Noir lighting with venetian blind shadows."
Size: 1280x720
Seconds: 8
```

**Step 6: Edit Sequence**

- Assemble shots in editing software
- Add transitions
- Color grade for consistency
- Add music and additional sound design if needed

**Result:** Character-consistent narrative sequence with professional continuity.

### Workflow 4: Platform-Specific Content Creation

**Purpose:** Efficiently create optimized versions of content for multiple platforms.

**Steps:**

**Step 1: Master Version (Landscape for YouTube)**

```
Model: sora-2-pro
Size: 1280x720
Seconds: 8

Prompt: "Wide shot of a chef demonstrating a cooking technique in a modern kitchen. She chops vegetables with precision, looks up at camera and smiles. Bright, clean lighting, professional cooking show aesthetic."
```

**Step 2: Vertical Version (Portrait for TikTok/Instagram Reels)**

```
Model: sora-2-pro
Size: 720x1280
Seconds: 8

Prompt: "Medium shot of a chef demonstrating a cooking technique, framed vertically for mobile viewing. She chops vegetables with precision, looks up at camera and smiles. Bright, clean lighting, professional cooking show aesthetic optimized for vertical format."
```

**Step 3: Short Teaser (4 seconds for quick social posts)**

```
Model: sora-2
Size: 720x1280
Seconds: 4

Prompt: "Close-up of chef's hands chopping vegetables with precision. Quick, dynamic shot. Bright, clean lighting."
```

**Step 4: Platform Optimization**

- Add platform-specific captions and text overlays
- Include CTAs appropriate for each platform
- Optimize thumbnails
- Schedule posts

**Result:** Multi-platform content suite from single concept, optimized for each destination.

---

## Use Case Examples

### 1. Social Media Content Creator: Daily Motivational Videos

**Scenario:** A motivational content creator needs to produce daily 8-second inspirational videos for Instagram Reels and TikTok.

**Requirements:**
- Vertical format (720x1280)
- Inspiring visuals with uplifting message
- Consistent aesthetic across series
- Sustainable daily production

**Workflow:**

**Day 1 - Mountain Sunrise:**
```
Model: sora-2
Size: 720x1280
Seconds: 8

Style: Cinematic, inspirational, vertical format optimized for mobile

Wide shot of a lone figure standing on a mountain peak at sunrise, arms raised in triumph. Camera slowly pushes in as golden sunlight breaks over the horizon, illuminating the figure.

Cinematography:
Camera: wide shot transitioning to medium, slow push-in
Mood: epic, inspiring, hopeful

Actions:
- Figure stands still for 2 seconds
- Raises arms slowly over 2 seconds
- Holds triumphant pose as sunlight breaks

Dialogue:
- Voiceover: "Every day is a new beginning."

Background Sound:
Gentle wind, distant birds, inspirational ambient music
```

**Day 2 - Ocean Waves:**
```
Model: sora-2
Size: 720x1280
Seconds: 8

Style: Peaceful, inspiring, vertical format

Medium shot of a person standing at the ocean's edge, waves washing over their feet. Camera slowly pushes in as they look out at the horizon with determination. Golden hour lighting.

Cinematography:
Camera: medium shot, slow push-in
Mood: peaceful, determined, hopeful

Actions:
- Person stands still, looking at horizon
- Takes a deep breath
- Slight smile forms

Dialogue:
- Voiceover: "The only limits are the ones you create."

Background Sound:
Waves crashing gently, seagulls, peaceful ocean ambiance
```

**Production Strategy:**
- Generate 7 videos per week in one session using sora-2 for speed
- Consistent style and format across all videos
- Add text overlays and branding in post-production
- Schedule daily posts

**Results:**
- Consistent daily content
- Professional quality
- Sustainable production schedule
- Cost: ~$50/week vs. daily filming costs

### 2. Marketing Agency: Product Launch Campaign

**Scenario:** A marketing agency needs to create promotional video content for a new smartwatch launch across multiple platforms.

**Requirements:**
- Hero video for website (landscape, high quality)
- Social media teasers (vertical, various lengths)
- Feature highlight videos
- Fast turnaround (3 days)

**Hero Video (Website):**
```
Model: sora-2-pro
Size: 1280x720
Seconds: 12

Style: Premium product photography, sleek and modern

Slow dolly shot moving toward a sleek smartwatch displayed on a minimalist white pedestal. Dramatic studio lighting with soft shadows creates premium aesthetic. The watch screen illuminates, showing the interface. Camera continues pushing in to close-up of the display.

Cinematography:
Camera: slow dolly forward, starting wide and ending on close-up
Lens: 50mm, shallow depth of field
Lighting: Soft key light from above, rim light from behind, clean studio aesthetic
Mood: premium, sophisticated, modern

Actions:
- Watch sits on pedestal for 3 seconds
- Screen illuminates at 3 seconds
- Interface animates on screen
- Camera reaches close-up at 12 seconds

Background Sound:
Subtle electronic hum, interface sounds, quiet high-tech atmosphere
```

**Social Teaser 1 (Fitness Feature):**
```
Model: sora-2
Size: 720x1280
Seconds: 8

Style: Dynamic, energetic, vertical format

Close-up of a person's wrist wearing the smartwatch during a morning run. Camera tracks with the runner's arm movement. The watch display shows heart rate and pace data. Sunrise lighting creates energetic atmosphere.

Cinematography:
Camera: close-up, tracking with arm movement
Mood: energetic, motivating, dynamic

Actions:
- Runner's arm swings naturally
- Watch display shows active workout data
- Beep sound as watch tracks milestone

Dialogue:
- Text overlay: "Track Every Step"

Background Sound:
Footsteps, breathing, outdoor morning sounds, motivational music
```

**Feature Highlight (Water Resistance):**
```
Model: sora-2-pro
Size: 1280x720
Seconds: 8

Style: Clean product demonstration, impressive

Medium shot of the smartwatch submerged in water, bubbles rising around it. The display remains active underwater, showing the time. Camera slowly rotates around the watch. Dramatic underwater lighting with rays of light from above.

Cinematography:
Camera: medium shot, slow rotation around watch
Lighting: Underwater with light rays from above
Mood: impressive, clean, professional

Actions:
- Watch sits underwater
- Bubbles rise around it
- Display remains active and clear
- Camera completes 90-degree rotation

Dialogue:
- Voiceover: "Water resistant up to 50 meters."

Background Sound:
Underwater bubbles, water movement
```

**Campaign Results:**
- 1 hero video (12s, 1280x720)
- 3 social teasers (8s each, 720x1280)
- 2 feature highlights (8s each, 1280x720)
- Total production time: 2 days
- Traditional production cost equivalent: $15,000-30,000
- AI generation cost: ~$200

### 3. Independent Filmmaker: Short Film Sequences

**Scenario:** An independent filmmaker is creating a noir-style short film and needs to generate multiple shots for a key scene.

**Requirements:**
- Cinematic quality (sora-2-pro)
- Consistent characters and setting
- Film noir aesthetic
- Multiple camera angles

**Scene: Detective Office Confrontation**

**Shot 1 - Establishing Wide:**
```
Model: sora-2-pro
Size: 1280x720
Seconds: 8

Style: 1940s film noir, shot on 35mm film with natural grain, high contrast black and white aesthetic

Wide shot of a dimly lit detective office. A single desk lamp casts harsh shadows. Venetian blinds create striped light patterns across the walls. A detective sits behind the desk, a mysterious woman stands near the door.

Cinematography:
Camera: wide shot, static
Lens: 40mm, deep focus to show full environment
Lighting: Single practical desk lamp, venetian blind shadows, high contrast noir lighting
Mood: tense, mysterious, classic film noir

Actions:
- Detective looks up from papers
- Woman takes two steps forward
- Cigarette smoke drifts through light beam

Background Sound:
Quiet, tense atmosphere, distant city traffic, faint rain on window
```

**Shot 2 - Detective Close-Up:**
```
Model: sora-2-pro
Size: 1280x720
Seconds: 8

Style: 1940s film noir, 35mm film, high contrast black and white

Close-up of the detective's face, venetian blind shadows across his features. He looks up with weary, suspicious expression.

Cinematography:
Camera: close-up, slight low angle, static
Lens: 85mm, shallow depth of field
Lighting: Harsh side light from desk lamp, venetian blind shadows, high contrast
Mood: weary, suspicious, noir

Actions:
- Detective looks down at papers for 2 seconds
- Looks up slowly toward the woman
- Slight narrowing of eyes, suspicious

Dialogue:
- Detective: "Of all the offices in this town, you had to walk into mine."

Background Sound:
Quiet tension, distant rain
```

**Shot 3 - Woman's Response:**
```
Model: sora-2-pro
Size: 1280x720
Seconds: 8

Style: 1940s film noir, 35mm film, high contrast black and white

Medium shot of the mysterious woman, backlit by light from the doorway, creating a dramatic silhouette. She steps forward into the light, revealing her face.

Cinematography:
Camera: medium shot, slight high angle, static
Lens: 50mm, shallow depth of field
Lighting: Backlight from doorway, gradual reveal as she steps into desk lamp light
Mood: mysterious, confident, noir

Actions:
- Woman stands in doorway silhouette for 2 seconds
- Takes two steps forward into light
- Slight smile forms

Dialogue:
- Woman: "You were highly recommended."

Background Sound:
Footsteps, fabric rustling, rain continues
```

**Post-Production:**
- Edit shots together with noir-style transitions
- Add film grain and damage effects
- Color grade for consistent black and white contrast
- Mix audio for atmospheric noir soundscape
- Add period-appropriate music

**Result:** Cinematic noir sequence with professional continuity, created in a fraction of the time and cost of traditional production.

### 4. Educational Content: History Documentary

**Scenario:** An educational YouTuber is creating a history documentary series and needs to generate historical recreation scenes.

**Requirements:**
- Cinematic documentary aesthetic
- Historical accuracy in visuals
- Narration with ambient audio
- Multiple episodes covering different periods

**Episode: Ancient Rome - Colosseum Scene**

```
Model: sora-2-pro
Size: 1280x720
Seconds: 12

Style: Historical documentary, cinematic, slightly desaturated for period feel

Dramatic low-angle shot looking up at the interior of the Roman Colosseum filled with spectators. The arena floor is visible below. Camera slowly tilts up to reveal the scale. Bright Mediterranean sunlight streams through the openings.

Cinematography:
Camera: wide shot, low angle, slow tilt up
Lens: 35mm, deep focus to show full scale
Lighting: Bright natural sunlight from above, dramatic shadows
Mood: grand, imposing, historical epic

Actions:
- Camera starts focused on arena floor
- Slowly tilts up revealing tiers of spectators
- Continues to reveal full scale of structure

Dialogue:
- Narrator: "The Colosseum could hold up to 80,000 spectators, making it one of the largest amphitheaters ever built."

Background Sound:
Roar of crowd, echoing voices, ambient historical atmosphere
```

**Production Strategy:**
- Generate establishing shots and key scenes for each historical period
- Use sora-2-pro for high-quality documentary footage
- Add professional narration in post-production
- Include educational graphics and text
- Assemble into 10-15 minute episodes

**Results:**
- Professional documentary quality
- Historical scenes impossible to film traditionally
- Cost-effective production
- Rapid episode creation
- Engaging educational content

---

## Quick Reference

### Five-Part Prompt Structure

```
[Style/Aesthetic]
[Scene Description]

Cinematography:
Camera: [framing, angle, movement]
Lens: [focal length, characteristics]
Lighting: [quality, direction, sources]
Mood: [overall tone]

Actions:
- [Action 1 in beats]
- [Action 2 in beats]

Dialogue:
- [Speaker]: "[Words]"

Background Sound:
[Ambient atmosphere and sound effects]
```

### API Parameters Quick Reference

```javascript
const video = await openai.videos.create({
    model: 'sora-2' or 'sora-2-pro',
    prompt: "Your detailed prompt",
    size: "1280x720" or "720x1280" or "1024x1792" or "1792x1024",
    seconds: "4" or "8" or "12",
    input_reference: imageFile, // Optional
    remix_id: "video_abc123" // Optional
});
```

### Cinematography Terms Quick Reference

**Shot Types:**
- Wide establishing shot
- Medium shot
- Medium close-up
- Close-up
- Extreme close-up

**Camera Angles:**
- Eye level
- Low angle
- High angle
- Dutch angle (canted)

**Camera Movements:**
- Static (no movement)
- Slow push-in (dolly in)
- Slow pull-out (dolly out)
- Tracking shot
- Slow pan
- Slow tilt
- Handheld
- Crane/jib
- Orbit/arc

**Depth of Field:**
- Shallow (blurred background)
- Deep (everything sharp)
- Rack focus (shift focus)

### Troubleshooting Quick Guide

| Problem | Solution |
|---------|----------|
| Unpredictable results | Use five-part structure, add specific details, establish style |
| Camera movement wrong | Use standard terms, one movement per shot, be explicit |
| Actions don't match | Describe in beats, match actions to duration, keep simple |
| Lighting doesn't match | Be specific about direction/quality/source, specify color anchors |
| Dialogue doesn't sync | Match length to duration, use separate block, keep concise |
| Inconsistent across generations | Use image references, add more detail, use remix |
| Lower quality than expected | Use sora-2-pro, select higher resolution, simplify motion |

---

## Resources

### Official Documentation
- **Sora 2 Prompting Guide:** https://developers.openai.com/cookbook/examples/sora/sora2_prompting_guide/
- **Video Generation API:** https://platform.openai.com/docs/guides/video-generation
- **Sora 2 Model Documentation:** https://platform.openai.com/docs/models/sora-2
- **OpenAI Sora Announcement:** https://openai.com/index/sora-2/

### Platform Access
- **API Access:** https://platform.openai.com/ (preview access required)
- **iOS App "Sora":** Available on iOS App Store
- **Webhook Configuration:** https://platform.openai.com/webhooks

### Community & Learning
- **OpenAI Community Forum:** https://community.openai.com/
- **Reddit r/SoraAi:** Community discussions and examples
- **Twitter/X #Sora2:** Latest examples and techniques

### Related Tools
- **GPT Image:** For generating reference images
- **ChatGPT:** For prompt enhancement and refinement
- **DaVinci Resolve:** For professional video editing and color grading
- **Adobe Premiere Pro:** For video editing and post-production

---

**Last Updated:** January 2026  
**Version:** 1.0  
**Model:** Sora 2 / Sora 2 Pro (OpenAI)
