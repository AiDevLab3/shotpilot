| **Trucking** | Lateral (side-to-side) movement parallel to subject | Observational, perfect for car chases and action |

**Example Prompt:**
> "The camera trucks (moves laterally) at the same high speed, perfectly parallel to the car and its driver. The car stays locked in the center of the frame. In the second half of the shot, the car executes a quick, slight S-curve maneuver, kicking up a small plume of white salt dust from its tires. The camera perfectly mirrors this S-curve, moving with the car to keep it locked in the center of the frame, before both straighten out again. Cinematic, car commercial, high-energy."

**Key Technique:** Specify that subject "stays locked in center of frame" and describe camera mirroring subject's movements

---

#### **Boom & Crane**

**Definition:** Vertical camera movements (up/down) for dramatic reveals and scale

**Narrative Use:**
- Rising shot = revelation, expanding perspective, showing scale
- Descending shot = intimacy, focusing down, creating claustrophobia

---

#### **Arc Shot**

**Definition:** Camera moves in a circular path around subject

**Narrative Use:**
- Showcase subject from multiple angles
- Create dynamic, three-dimensional reveal
- Build tension through continuous motion

---

### First-Frame Integration

**Capability:** Works seamlessly with first-frame image inputs

**Workflow:**
1. Generate perfect still image (using Lucid Origin, Nano Banana Pro, etc.)
2. Upload as first frame to Kling
3. Prompt for camera movement and action
4. Kling animates while maintaining visual consistency

**Example:**
> "We first generated an image using our Lucid Origin model that we then used as the starting frame of the video—the Leonardo.Ai app makes it easy to instantly switch between image and video generations"

---

### Prompting Best Practices

**DO:**
✅ Specify camera movement speed (slow, steady, quick, very slow)
✅ Use descriptive adverbs for pacing (gradually, deliberately, steadily, perfectly)
✅ Include emotional context for characters (shocked, determined, petrified)
✅ Define style/mood at end of prompt (cinematic, suspenseful, high-energy)
✅ Describe how background behaves (blurs away, stays sharp, reveals)
✅ Use "locked in center of frame" for tracking shots

**DON'T:**
❌ Add camera movement without narrative justification
❌ Use vague speed descriptors
❌ Omit any of the 4 essential elements (Subject, Action, Context, Style)
❌ Forget to specify what the movement reveals or emphasizes

---

### Motion-Ready Stills for Kling 2.6

**Key Principles:**
✅ Create clear, unambiguous starting frames
✅ Ensure subject has "air" (negative space) around them
✅ Avoid complex overlapping elements
✅ Use first-frame generation for precise control
✅ Lock composition and lighting before animating

---

### API vs. Direct Interface

**TBD** - Need to research if prompting differs between:
- Direct access via Kling platform
- API integration (e.g., through Leonardo.Ai or other platforms)

---

### Next Research Items for Kling 2.6:
- [ ] Audio generation capabilities
- [ ] Reference image system (beyond first frame)
- [ ] Extend/continuation features
- [ ] API vs. Direct Interface prompting differences
- [ ] Community best practices from Reddit/forums
- [ ] Comparison with Kling 1.x versions

---

## Next Models to Research:
- Runway Gen-3
- Seedance 1.5



---

## Model 4: Runway Gen-3 Alpha

### Official Documentation
**Sources:** 
- https://help.runwayml.com/hc/en-us/articles/30586818553107-Gen-3-Alpha-Prompting-Guide
- https://help.runwayml.com/hc/en-us/articles/34926468947347-Creating-with-Camera-Control-on-Gen-3-Alpha-Turbo
**Date:** 2025

### Core Capabilities
- **Model Variants:** Gen-3 Alpha and Gen-3 Alpha Turbo (faster, more cost-efficient)
- **Generation Length:** **Up to 10 seconds** (confirmed from official documentation)
- **First Frame Support:** Yes - image-to-video with precise camera control
- **Camera Control:** Advanced 6-axis camera control system (Gen-3 Alpha Turbo only)

---

### Camera Control System (Gen-3 Alpha Turbo)

**Six Movement Directions:**
1. **Pan** (Horizontal) - Left/Right camera movement
2. **Tilt** (Vertical) - Up/Down camera movement
3. **Roll** - Rotation around lens axis
4. **Zoom** - In/Out movement
5. **Dolly** - Forward/Backward camera movement
6. **Orbit** - Circular movement around subject

**Control Values:**
- Range: **-10 to +10** for each axis
- **0** = No movement (neutral)
- Positive values = One direction (e.g., +10 = maximum right pan)
- Negative values = Opposite direction (e.g., -10 = maximum left pan)
- **Static Camera Checkbox:** Prevents all camera movement

**CRITICAL INSIGHT:** Camera control values are **relative to the input image**. The same numeric value will produce different results depending on:
- Subject distance from camera
- Scene composition (close-up vs. wide shot)
- Environmental context

---

### Prompting Structure (Official Guide)

**Recommended Format:**
1. **Subject** - Main focus of the shot
2. **Action** - What is happening
3. **Camera Movement** - How the camera moves (if not using camera controls)
4. **Style/Mood** - Cinematic tone

**Best Practices:**
- **Combine camera controls with text prompts** for best results
- Text prompts guide scene content, camera controls guide movement
- Higher camera control values benefit from descriptive end-scene prompts
- For static shots, use **Static Camera checkbox + motion-focused text prompt**

**Example:**
- **Camera Control:** Zoom -8 (intense zoom out)
- **Text Prompt:** "The camera reveals a vast cyberpunk cityscape with neon skyscrapers stretching to the horizon"

---

### Static Camera Mode

**Purpose:** Reduce camera motion while allowing subject/scene motion

**Best Results:** Realistic and cinematic input images

**Workflow:**
1. Enable **Static Camera** checkbox
2. Write text prompt describing **subject and scene motion** (not camera)
3. Generate

**Example:**
- **Static Camera:** ✓ Enabled
- **Text Prompt:** "The woman dynamically swings back and forth. She gently kicks out her legs and swings towards and away from the camera. Dynamic motion."

---

### How Camera Controls Interact with Input Images

**Key Principle:** Same numeric values behave differently across different input types

**Example Scenarios:**

| Input Type | Same Camera Value | Result |
|-----------|------------------|--------|
| **Subject-focused close-up** | Pan +5 | Subtle horizontal movement |
| **Wide environmental shot** | Pan +5 | More dramatic horizontal sweep |
| **Mid-range portrait** | Pan +5 | Moderate pan across frame |

**Implication:** Requires experimentation to find the right values for your specific input image

---

### Text Prompts with Camera Control

**Why Text Prompts Matter:**
- Greatly improve controllability and adherence
- Especially important with higher camera control values
- Describe the **desired end scene** for zoom/dolly movements
- Indicate **character and scene motion**

**Example Comparison:**

| Scenario | No Prompt | With End Scene Description | With Subject Motion |
|----------|-----------|---------------------------|---------------------|
| **Intense Zoom Out** | Model fills scene randomly | "Reveals a vast desert with ancient pyramids" | "Character steps back in awe" |

---

### API vs. Direct Interface

**Direct Interface:** Runway web app with visual camera control sliders
**API Access:** Available through Runway API with JSON parameters

**API Prompting Structure:** (To be confirmed - requires deeper API documentation research)

---

### Generation Length Planning for Shot Sheets

**CRITICAL:** Runway Gen-3 maximum is **10 seconds**

**Shot Sheet Strategy:**
- Scene needs: Shot A (4s) + Shot B (6s) = 10s total → **Generate as single clip**
- Scene needs: Shot A (7s) + Shot B (5s) = 12s total → **Generate as 2 separate clips, cut in post**

---

### Motion-Ready Stills for Runway Gen-3

**Best Practices:**
✅ Use high-quality, cinematic input images for best camera control results
✅ Ensure clear subject separation from background
✅ Avoid ambiguous spatial relationships
✅ Test camera control values incrementally (start with ±3, adjust as needed)

---

### Strengths
- Precise camera control with numeric values (-10 to +10)
- Static camera mode for motion-focused shots
- Fast generation with Turbo model
- Strong adherence to camera movement instructions
- 10-second generation length (longer than Veo 3.1's 8s)

---

### Weaknesses
- Camera control only available on Turbo model
- Values are relative, not absolute (requires experimentation)
- Limited to 10 seconds per generation

---

### Next Research Items for Runway Gen-3:
- [ ] Complete API parameter documentation
- [ ] Video extension workflow
- [ ] Multi-shot capabilities
- [ ] Community best practices from Reddit/forums
- [ ] Comparison: Gen-3 Alpha vs. Gen-3 Alpha Turbo quality differences



---

## Model 5: Seedance 1.5 Pro (ByteDance)

### Official Documentation
**Sources:** 
- https://higgsfield.ai/blog/Seedance-1.5-Pro-on-Higgsfield-A-Practical-Creator-Guide
- https://seed.bytedance.com/en/seedance1_5_pro
**Date:** December 21, 2025

### Core Philosophy: "Native Audio-Visual Generation"

**Paradigm Shift:** From "video-first, audio-later" to **unified sensory system**

**Key Principle:** Seedance treats sound and picture as **one system** instead of two separate outputs

---

### Model Capabilities

| Feature | Specification |
|---------|--------------|
| **Generation Type** | Joint audio-video model |
| **Generation Length** | **~10 seconds** (to be confirmed) |
| **Audio Generation** | Native speech, spatial sound effects, ambient audio |
| **Language Support** | English, Spanish, Mandarin, regional dialects |
| **Lip-Sync** | Advanced lip movement reshaping for each language's phonemes |
| **Resolution** | Production-grade (specific resolution TBD) |
| **Optimization** | Human subjects (prioritizes facial landmarks) |

---

### What Seedance 1.5 Pro Excels At

1. **Film-Grade Cinematography** - Complex camera movement from close-ups to full shots with cinematic details
2. **Storytelling & Emotional Expression** - Auto-fills narrative beats based on prompt intent
3. **Lip-Sync Mastery** - Best-in-class dialogue delivery with perfect timing
4. **Multi-Language Speech** - Native support for English, Spanish, Mandarin + dialects
5. **Spatial Audio** - Sound effects coordinated with visuals
6. **Human-Centric** - Optimized for facial landmarks and performance

---

### Workflow on Higgsfield

**Step 1: Start with a Strong Keyframe**
- Use your own image OR generate one
- Seedance works best when motion is anchored to a clear first image

**Step 2: Write Your Prompt**
- Describe the action you want
- Include specific camera commands
- Add audio cues for full sensory control

**Step 3: Generate**
- Click "Generate"
- Receive clip with every lip movement and sound effect locked to the frame

---

### Prompting Structure (Director-Style)

**Recommended Order:** Composition → Character → Camera Movement → Mood

**Why This Order?**
- Reduces contradictions
- Helps model "lock" the frame before inventing motion
- Keeps priorities stable for both text-to-video and image-to-video

**Template:**

```
[Composition]: framing, camera angle, background elements
[Main Character]: description, clothing, action
[Camera Movement]: action sequence, focus
[Overall Mood]: cinematic, documentary, hyperrealistic
```

**Example Prompt:**

> **Composition:** Medium close-up, eye level, soft background bokeh, clean indoor lighting
> **Main Character:** Confident creator, natural skin texture, subtle micro-expressions, relaxed posture
> **Camera Movement:** Slow push-in, focus locked on eyes, minimal shake
> **Overall Mood:** Cinematic UGC ad, clean audio, natural room tone, soft film texture

---

### Production Benchmarks: Why Seedance Wins in Dialogue

**Strengths:**
- **Lip-Sync Quality:** Best-in-class for talking-head content
- **Sound Cleanliness:** Slightly better audio clarity than competitors
- **Performance Focus:** Facial landmarks remain stable and expressive

**Ideal Use Cases:**
- Talking-head UGC
- Product explainers with a host
- Short dramatic close-ups where performance is the selling point
- Dialogue-driven scenes

---

### Camera Movement Best Practices

**Recommendation:** Choose **simple pushes, pans, and handheld drift**, then let composition and lighting carry the cinematic feel

**Why?**
- Seedance can handle complex camera movement
- But benefits from coherent prompt intent and stable staging
- Simple movements + strong composition = more consistent professional results

---

### Copy-Ready Prompt Recipes

#### Recipe 1: Dialogue UGC (Best for Seedance Lip-Sync)

```
Composition: medium close-up, eye level, soft background bokeh, clean indoor lighting
Main character: confident creator, natural skin texture, subtle micro-expressions, relaxed posture
Camera movement: slow push-in, focus locked on eyes, minimal shake
Overall mood: cinematic UGC ad, clean audio, natural room tone, soft film texture
```

#### Recipe 2: Product Demo Without Face Drift

```
Composition: tabletop hero shot, product foreground, hands enter frame, label readable
Main character: only hands and torso visible, clean wardrobe, no face in frame
Camera movement: gentle dolly-in and slight tilt down to label, then hold
Overall mood: bright lifestyle commercial, crisp ambience, realistic reflections
```

---

### Audio Generation Capabilities

**Native Audio Features:**
1. **Speech Generation** - Multi-language dialogue with perfect lip-sync
2. **Sound Effects** - Spatial SFX coordinated with visuals
3. **Ambient Audio** - Room tone, environmental sounds
4. **Emotional Delivery** - Voice inflection matches character emotion

**How to Prompt Audio:**
- Include dialogue in quotes: "The character says, 'We need to leave now.'"
- Specify sound effects: "SFX: footsteps on gravel, distant thunder"
- Describe ambient soundscape: "Ambient: quiet coffee shop with soft jazz"

---

### First Frame / Reference Image Support

**Capability:** Image-to-video with strong adherence to starting frame

**Best Practice:** Generate high-quality keyframe first (using Nano Banana Pro or other image generator), then animate with Seedance

---

### Generation Length Planning for Shot Sheets

**CRITICAL:** Seedance 1.5 Pro maximum is **~10 seconds** (to be confirmed)

**Shot Sheet Strategy:**
- Scene needs: Shot A (4s) + Shot B (6s) = 10s total → **Generate as single clip**
- Scene needs: Shot A (7s) + Shot B (5s) = 12s total → **Generate as 2 separate clips, cut in post**

---

### API vs. Direct Interface

**Direct Interface:** Higgsfield platform, seed.bytedance.com
**API Access:** Available through ByteDance API and third-party platforms (fal.ai, n8n, etc.)

**API Prompting Differences:** (To be confirmed - requires API documentation research)

---

### Motion-Ready Stills for Seedance

**Best Practices:**
✅ Start with a strong, clear keyframe
✅ Prioritize facial clarity for dialogue scenes
✅ Use clean, unambiguous composition
✅ Ensure stable lighting in reference image
✅ Avoid complex overlapping elements

---

### Strengths
- **Best-in-class lip-sync** for dialogue
- Native audio-visual generation (no separate audio step)
- Multi-language support with dialect handling
- Human-centric optimization (facial landmarks)
- Strong storytelling and emotional expression
- Clean audio quality

---

### Weaknesses
- Optimized primarily for human subjects (less ideal for abstract/non-human content)
- Complex camera movements can introduce instability
- Limited to ~10 seconds per generation

---

### When to Choose Seedance 1.5 Pro

**Use Seedance When:**
- Dialogue and lip-sync are critical
- Creating talking-head UGC or product demos with hosts
- Need multi-language support
- Prioritizing emotional performance and facial expressions
- Want native audio generation without separate audio workflow

**Choose Another Model When:**
- No dialogue required
- Abstract or non-human subjects
- Need longer than 10 seconds per clip
- Prioritizing complex camera movements over dialogue

---

### Next Research Items for Seedance 1.5 Pro:
- [ ] Confirm exact maximum generation length
- [ ] Complete API parameter documentation
(Content truncated due to size limit. Use line ranges to read remaining content)