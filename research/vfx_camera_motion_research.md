# VFX & Camera Motion Research Notes

**Research Date:** January 26, 2026  
**Purpose:** Document VFX techniques, camera motion capabilities, and first-frame/last-frame control for Cine-AI knowledge base

---

## Part 1: Camera Motion Presets & Techniques

### Higgsfield Camera Controls: 50+ Cinematic AI-Motion Presets

**Source:** https://higgsfield.ai/camera-controls  
**Date:** 2026

**Overview:** Higgsfield offers **50+ pre-programmed camera movement presets** that can be applied to video generation. These are AI-crafted cinematic moves designed to replicate professional cinematography techniques.

---

### Complete Camera Movement Catalog

**Basic Movements:**
- **Static** - No camera movement
- **Pan Left / Pan Right** - Horizontal camera rotation
- **Tilt Up / Tilt Down** - Vertical camera rotation
- **Zoom In / Zoom Out** - Lens focal length change

**Dolly Movements:**
- **Dolly In / Dolly Out** - Camera moves forward/backward on track
- **Dolly Left / Dolly Right** - Camera moves horizontally on track
- **Super Dolly In / Super Dolly Out** - Extreme dolly movements
- **Double Dolly** - Complex dual-axis dolly movement

**Advanced Zoom Techniques:**
- **Crash Zoom In / Crash Zoom Out** - Rapid, aggressive zoom
- **Rapid Zoom In / Rapid Zoom Out** - Fast zoom movement
- **Dolly Zoom In / Dolly Zoom Out** - "Vertigo effect" (dolly + zoom in opposite directions)
- **YoYo Zoom** - Zoom in then out (or vice versa) in single shot
- **Eating Zoom** - Zoom focused on eating action
- **Mouth In** - Extreme zoom into subject's mouth

**Crane & Jib Movements:**
- **Crane Up / Crane Down** - Vertical crane movement
- **Crane Over The Head** - Crane movement that passes over subject
- **Jib Up / Jib Down** - Shorter vertical arm movements

**Arc & Orbit Movements:**
- **Arc Left / Arc Right** - Curved camera path around subject
- **360 Orbit** - Complete circular movement around subject
- **Lazy Susan** - Rotating platform shot (subject rotates, camera static)
- **3D Rotation** - Complex three-dimensional rotation

**Specialty Movements:**
- **Bullet Time** - Matrix-style frozen time with camera movement
- **Snorricam** - Camera mounted to actor (face stays centered, world moves)
- **Head Tracking** - Camera follows subject's head movement
- **Hero Cam** - Dynamic movement highlighting hero subject
- **Glam** - Beauty/fashion-focused movement

**Drone & Aerial:**
- **FPV Drone** - First-person view drone flight
- **Aerial Pullback** - Drone pulling back and up from subject
- **Flying Cam Transition** - Dynamic flying camera transition
- **Road Rush** - Fast-moving road/vehicle shot

**Vehicle-Mounted:**
- **Car Grip** - Camera mounted to moving vehicle
- **Car Chasing** - Camera following/chasing vehicle
- **Buckle Up** - Interior vehicle shot with movement

**Perspective & Angle:**
- **Dutch Angle** - Tilted camera angle
- **Overhead** - Top-down view
- **Fisheye** - Wide-angle fisheye lens effect
- **Object POV** - Point of view from object's perspective
- **Incline** - Camera on inclined angle

**Through-Object Techniques:**
- **Through Object In** - Camera moves through object toward subject
- **Through Object Out** - Camera moves through object away from subject
- **Eyes In** - Zoom into character's eyes

**Time Manipulation:**
- **Timelapse Landscape** - Accelerated landscape footage
- **Timelapse Human** - Accelerated human activity
- **Timelapse Glam** - Accelerated beauty/styling process
- **Hyperlapse** - Moving timelapse
- **Low Shutter** - Motion blur effect (slow shutter speed)

**Focus & Framing:**
- **Focus Change** - Rack focus between subjects
- **Robo Arm** - Precise robotic arm movement
- **Whip Pan** - Extremely fast pan creating motion blur
- **Wiggle** - Subtle camera shake/movement
- **Handheld** - Handheld camera shake/movement
- **BTS** - Behind-the-scenes style movement

---

### Camera Motion Best Practices

**Key Principles:**
1. **Match Movement to Emotion** - Slow dolly for drama, crash zoom for shock, handheld for tension
2. **Simplicity Often Wins** - Simple pushes, pans, and drifts with strong composition often outperform complex movements
3. **Preset Selection** - Choose preset that matches your narrative intent
4. **Combine with Composition** - Camera movement + strong lighting + clear composition = professional result

**When to Use Which Movement:**

| Scene Type | Recommended Movement | Why |
|-----------|---------------------|-----|
| **Dialogue Close-Up** | Static, Slow Dolly In, Head Tracking | Keeps focus on performance |
| **Reveal Shot** | Crane Up, Aerial Pullback, Dolly Out | Shows scale and context |
| **Action Sequence** | FPV Drone, Car Chasing, Crash Zoom | Creates energy and excitement |
| **Emotional Moment** | Dolly Zoom, Slow Push In | Heightens dramatic tension |
| **Establishing Shot** | 360 Orbit, Arc Left/Right, Crane Over | Shows spatial relationships |
| **Horror/Tension** | Handheld, Dutch Angle, Through Object | Creates unease |
| **Beauty/Fashion** | Glam, Lazy Susan, Slow Arc | Showcases subject elegantly |

---

## Part 2: VFX Techniques & Tools

### Beeble AI: Production-Grade Video-to-VFX

**Source:** https://beeble.ai/  
**Date:** 2026

**Core Capability:** Transforms any video into **rotoscoped, camera-tracked, relightable 2.5D VFX asset**

---

### Beeble AI Features

**1. PBR Generation (Physically-Based Rendering)**
- Generates pixel-perfect, production-ready PBR passes from any footage
- Uses SwitchLight 3 technology
- Creates industry-standard material passes

**2. AI Rotoscoping**
- State-of-the-art AI rotoscoping with clean, artifact-free mattes
- Automatic subject separation from background
- Frame-by-frame precision

**3. Relighting Capabilities**
- **Classic Lighting Models** - Physically accurate falloff for predictable results
- **Video Light** - Video-driven lighting that reacts in real-time (mimics DMX and LED-wall behavior)
- **No Setup Required** - Instant operation with zero technical overhead
- **Custom Assets** - Import HDRI, 3D models, Gaussian splats, and backdrops

**4. Compositing Workflow**
- Drop subject into any virtual scene
- Full scene authoring capabilities
- Export passes in multiple formats
- Plugin support for DCC tools (Nuke, etc.)

---

### Beeble Deployment Options

| Feature | Cloud App | Studio (Local) |
|---------|-----------|----------------|
| **Rendering** | Cloud servers | Local GPU |
| **Setup** | Instant, browser-based | Desktop installation |
| **Resolution** | 2K max | 4K max |
| **Duration** | 1 minute per video | 1 hour per video |
| **Pricing** | Credit-based, starts free | $42/mo annual, $60/mo monthly |
| **Processing** | Unlimited cloud | Unlimited local |
| **Offline** | No | Yes (full offline rendering) |
| **Platform** | Any OS (browser) | Windows & Linux |

---

### VFX Workflow with Beeble

**Step 1: Generate or Import Video**
- Create video using AI generator (Higgsfield, Veo, Kling, Runway, Seedance)
- OR import existing footage

**Step 2: Process with Beeble**
- Upload to Beeble Cloud or process locally in Studio
- Automatic generation of:
  - Rotoscoped mattes
  - Camera tracking data
  - PBR passes
  - 2.5D depth information

**Step 3: Relight & Composite**
- Apply new lighting to subject
- Composite into new backgrounds
- Adjust atmosphere and mood
- Export final result or VFX passes

**Step 4: Export**
- Export as final video
- OR export VFX passes for further work in DCC tools

---

### Use Cases for Beeble in Cinematic AI Workflow

**1. Background Replacement**
- Generate character shot with AI video generator
- Use Beeble to extract clean matte
- Composite into different background (real or AI-generated)

**2. Lighting Correction**
- AI-generated video has inconsistent lighting
- Use Beeble to relight subject with consistent, realistic lighting
- Match lighting to desired cinematic mood

**3. VFX Integration**
- Generate practical shot with AI
- Extract VFX passes with Beeble
- Add CGI elements, particles, or effects in post

**4. Scene Matching**
- Multiple AI-generated shots with different lighting
- Use Beeble to relight all shots consistently
- Create cohesive scene with matched lighting

---

## Part 3: First Frame / Last Frame Control Techniques

### Cross-Model Comparison

| Model | First Frame Control | Last Frame Control | Notes |
|-------|--------------------|--------------------|-------|
| **Higgsfield Cinema Studio v1.5** | ✅ Yes - "Hero Frame First" | ❓ TBD | Precise first-frame adherence |
| **Veo 3.1** | ✅ Yes - "Ingredients" | ❓ TBD | Reference images as ingredients |
| **Kling 2.6** | ✅ Yes - Image-to-video | ❓ TBD | Strong first-frame control |
| **Runway Gen-3** | ✅ Yes - Image-to-video | ❓ TBD | Works with camera controls |
| **Seedance 1.5 Pro** | ✅ Yes - Keyframe start | ❓ TBD | Best with human subjects |

**CRITICAL INSIGHT:** All five major video models support **first-frame control** (image-to-video). Last-frame control requires further research.

---

### First-Frame Control Best Practices

**Universal Principles (Apply to All Models):**

1. **Start with High-Quality Image**
   - Use professional image generator (Nano Banana Pro, GPT Image 1.5, Higgsfield Cinema Studio)
   - Ensure proper resolution and aspect ratio
   - Apply cinematic lighting and composition in still image

2. **Clear Subject Separation**
   - Avoid ambiguous spatial relationships
   - Ensure subject is clearly defined against background
   - Minimize overlapping elements

3. **Consistent Lighting**
   - Lighting in first frame should match desired video lighting
   - Avoid extreme lighting that model can't maintain
   - Consider how lighting will evolve during motion

4. **Motion-Ready Composition**
   - Leave "air" around subject for camera movement
   - Avoid tight crops that limit motion options
   - Consider direction of intended camera movement

5. **Model-Specific Optimization**
   - **Higgsfield:** Focus on cinematic composition (model will maintain it)
   - **Veo 3.1:** Can use multiple reference images as "ingredients"
   - **Kling 2.6:** Strong physics simulation from first frame
   - **Runway Gen-3:** Combine first frame with camera control values
   - **Seedance 1.5 Pro:** Optimize facial landmarks for dialogue scenes

---

### Motion-Ready Still Generation Workflow

**Step 1: Plan the Shot**
- Determine camera movement (dolly in, pan, crane up, etc.)
- Decide on subject action (walking, talking, turning, etc.)
- Choose appropriate focal length and composition

**Step 2: Generate Motion-Ready Still**
- Use image generator with cinematic prompt
- Include camera specs, lighting, and composition details
- Generate with extra space around subject (not tight crop)
- Ensure clear spatial relationships

**Step 3: Validate First Frame**
- Check: Is subject clearly separated from background?
- Check: Is there room for intended camera movement?
- Check: Is lighting consistent and maintainable?
- Check: Are there any ambiguous elements that could confuse motion?

**Step 4: Generate Video**
- Upload first frame to video generator
- Write motion prompt describing action and camera movement
- Apply camera control presets (if available)
- Generate video

**Step 5: VFX Enhancement (Optional)**
- Process through Beeble for relighting/compositing
- Add additional VFX elements
- Color grade and finalize

---

## Part 4: Advanced Camera Motion Techniques

### Combining Camera Controls with Text Prompts

**Key Principle:** Camera control presets/values work best when **combined with descriptive text prompts**

**Example (Runway Gen-3 Style):**
- **Camera Control:** Zoom -8 (intense zoom out)
- **Text Prompt:** "The camera reveals a vast cyberpunk cityscape with neon skyscrapers stretching to the horizon"

**Example (Higgsfield Style):**
- **Camera Preset:** Crane Up
- **Text Prompt:** "Medium shot of detective in rain-soaked alley, camera cranes up to reveal towering buildings above, film noir lighting"

---

### Static Camera with Subject Motion

**Purpose:** Reduce camera motion while allowing dynamic subject/scene motion

**Best For:**
- Dialogue scenes
- Performance-focused shots
- Controlled, theatrical staging

**Workflow:**
1. Enable static camera mode (or choose "Static" preset)
2. Write text prompt describing **subject motion** (not camera motion)
3. Generate

**Example:**
- **Camera:** Static
- **Prompt:** "The woman dynamically swings back and forth on the swing. She gently kicks out her legs and swings towards and away from the camera. Dynamic motion."

---

### Multi-Shot Sequences with Camera Motion

**Challenge:** AI video generators have length limits (5-10 seconds)

**Solution:** Plan multi-shot sequences with intentional camera movements

**Strategy:**

| Shot | Duration | Camera Movement | Purpose |
|------|----------|----------------|---------|
| **Shot 1** | 4s | Dolly In | Establish character |
| **Shot 2** | 3s | Static | Dialogue close-up |
| **Shot 3** | 5s | Crane Up | Reveal environment |
| **Shot 4** | 6s | Arc Right | Show spatial relationship |

**Total:** 18 seconds = 4 separate generations, cut together in post

---

## Next Research Items:

### VFX & Camera Motion:
- [ ] Last-frame control capabilities across all models
- [ ] Video extension techniques (how to extend beyond max length)
- [ ] Multi-shot continuation workflows
- [ ] Advanced VFX tools beyond Beeble (Runway ML, Luma AI, etc.)
- [ ] Camera motion limitations and workarounds
- [ ] Community best practices for complex camera movements

### Integration:
- [ ] How to combine multiple VFX passes
- [ ] Color grading workflows for AI-generated video
- [ ] Audio synchronization with camera movement
- [ ] Transition techniques between AI-generated shots

---

## Summary: VFX & Camera Motion Capabilities

**Camera Motion:**
- **50+ presets available** (Higgsfield) covering all professional cinematography techniques
- **6-axis control** (Runway Gen-3) with numeric values
- **Text + control combination** produces best results
- **Simple movements often outperform complex** when combined with strong composition

**VFX Capabilities:**
- **Beeble AI** enables production-grade relighting and compositing
- **Rotoscoping, tracking, PBR passes** generated automatically
- **Cloud and local processing** options available
- **Seamless integration** with AI video generation workflow

**First-Frame Control:**
- **Universally supported** across all major models
- **Critical for consistency** and professional results
- **Motion-ready composition** essential for best outcomes
- **Model-specific optimization** improves adherence

**Workflow Integration:**
- Generate motion-ready still → Animate with video generator → Enhance with VFX tools → Cut in post
- Plan multi-shot sequences within length constraints
- Use camera presets strategically for narrative impact
- Combine techniques for professional cinematic results

