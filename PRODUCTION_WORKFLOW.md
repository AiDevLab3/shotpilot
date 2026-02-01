# Cine-AI Production Workflow: Shot-Lock Protocol

**Version:** 3.0  
**Last Updated:** January 31, 2026  
**Purpose:** Define the mandatory sequential workflow with hard-stop validation gates to prevent Context Drift

---

## 🚨 Critical: Read This First

**This workflow is MANDATORY for all AI agents and human users.**

Agents have a documented tendency to "skip ahead" to video generation when they see the end goal, bypassing the critical Master Still phase. This causes:
- Character identity hallucination
- Inconsistent composition  
- Physics errors that can't be corrected
- Wasted compute on unusable outputs

**The Solution**: Hard-stop validation gates that require explicit user approval before proceeding to the next phase.

---

## The Four-Phase Production Pipeline

```
PHASE 0: Pre-Production → ⛔ USER APPROVAL → PHASE 1: Master ID → ⛔ USER LOCK → PHASE 2: Master Still → ⛔ USER LOCK → PHASE 3: Motion
```

**Rule**: Each phase must be completed and approved before the next phase can begin.

---

## PHASE 0: Pre-Production (Creative Development)

### Objective
Collaborate with the user to formulate a cohesive creative vision before production begins. Extract all relevant information needed for the production crew to succeed.

### Agent Responsible
- **Creative Director**: Vision formulation, script development, shot planning

### Deliverables

#### 1. Project DNA Document
Defines the creative foundation for the entire project:
- **Theme**: What the story is about
- **Tone**: How it feels (dramatic, hopeful, melancholic, etc.)
- **Mood**: Visual atmosphere (gritty, whimsical, cinematic, etc.)
- **Visual Style**: Cinematic realism, cyberpunk, noir, etc.
- **Color Palette**: Warm/cool, saturated/desaturated, specific colors
- **Lighting Key**: Golden hour, harsh fluorescent, volumetric fog, neon, etc.
- **Visual References**: Films, photographers, artists that inspire the vision
- **Recommended Models**: Image and video models based on aesthetic goals

#### 2. Script
Scene-by-scene breakdown with:
- **Scene descriptions**: Location, time of day, environment details
- **Character actions**: What characters do and why
- **Narrative beats**: Story progression and emotional moments
- **Visual notes**: Lighting mood, key visual elements, emotional tone

#### 3. Shot List
Detailed breakdown of every shot:
- **Shot number and description**
- **Camera angle**: Low angle, eye level, high angle, bird's eye
- **Camera movement**: Dolly, pan, tilt, static
- **Composition notes**: Rule of thirds, leading lines, depth, symmetry
- **Duration**: 6s, 8s, 10s
- **Narrative purpose**: What this shot communicates

#### 4. Style Guide
Visual aesthetic documentation:
- **Visual style definition**: Cinematic realism, stylized noir, etc.
- **Lighting mood**: Golden hour sunset, harsh office fluorescent, etc.
- **Character descriptions**: Physical appearance, clothing, SoulID foundation

### Creative Director Process

The Creative Director collaborates with the user through clarifying questions:

**Vision Formulation Questions**:
- "What's the emotional journey of this character?"
- "Is this dramatic and melancholic, or hopeful and liberating?"
- "What's the most important visual moment in this story?"
- "What should the audience feel when they watch this?"

**Style & Aesthetic Questions**:
- "What visual style resonates with you? (e.g., cinematic realism, stylized noir, whimsical animation)"
- "What time of day? What's the lighting like?"
- "Are there any films, photographers, or artists whose work inspires this vision?"

**Narrative Questions**:
- "What happens in this story? Beginning, middle, end?"
- "Who is this character? What motivates them?"
- "What's the key conflict or transformation?"

### Adaptive Workflow

**If User Has a Script**:
1. Review the script and extract Project DNA
2. Ask clarifying questions about visual style and tone
3. Create Shot List based on script
4. Present complete pre-production package

**If User Has a Vague Idea**:
1. Collaborate to develop the concept through questions
2. Build the script and shot list from scratch
3. Iterate until user approves the vision
4. Formalize into Project DNA and deliverables

**If User Has Detailed Vision**:
1. Validate and formalize it into Project DNA
2. Fill in any gaps (shot list, technical specs)
3. Ensure all agents have clear direction
4. Present for approval

### Agent Output Format
```
PHASE 0: PRE-PRODUCTION PACKAGE

=== PROJECT DNA ===
PROJECT: [Name]
THEME: [What the story is about]
TONE: [How it feels]
MOOD: [Visual atmosphere]
VISUAL STYLE: [Cinematic realism, cyberpunk, etc.]
COLOR PALETTE: [Warm/cool, saturated/desaturated]
LIGHTING KEY: [Golden hour, harsh fluorescent, etc.]

VISUAL REFERENCES:
- [Film/photographer/artist 1]
- [Film/photographer/artist 2]

RECOMMENDED MODELS:
- Image: [Model name and why]
- Video: [Model name and why]

=== SCRIPT ===
SCENE 1: [Location - Time of Day]
[Detailed scene description with character actions and narrative beats]

VISUAL NOTES:
- Lighting: [Mood and sources]
- Key Elements: [Important visual details]
- Emotional Tone: [What the audience should feel]

=== SHOT LIST ===
SHOT 1: [Brief Description]
- Camera Angle: [Low angle / Eye level / etc.]
- Camera Movement: [Dolly in / Pan right / Static]
- Composition: [Rule of thirds, leading lines, etc.]
- Duration: [6s / 8s / 10s]
- Narrative Purpose: [What this shot communicates]

[Additional shots...]

⛔ HARD STOP - USER APPROVAL REQUIRED

Please review the complete pre-production package:
- Does the Project DNA capture your vision?
- Does the script tell the story you want to tell?
- Does the shot list break down the narrative effectively?

Reply "APPROVED" to proceed to production (Phase 1: Master ID Generation), or provide revision notes.
```

### User Action Required
- Review the Project DNA, Script, and Shot List
- Reply **"APPROVED"** to proceed to Phase 1
- OR provide specific revision notes

### Why This Phase Exists

**Problem**: Jumping directly into production without a clear vision leads to:
- Vague prompts that require multiple regenerations
- Style inconsistency across shots
- Character identity drift
- Wasted compute on shots that don't match the vision

**Solution**: Upfront investment in pre-production:
- Establishes clear Project DNA that all agents reference
- Prevents style drift and character inconsistency
- Reduces strikes during production
- Ensures all agents have the information they need to succeed

### ⛔ DO NOT PROCEED to Phase 1 until user approval is received

---

## PHASE 1: Master ID Generation (Character Turnaround)

### Objective
Establish the character's visual identity (SoulID) that will be used as a reference for all subsequent shots.

### Agent Responsible
- **Chief of Staff**: Orchestrates the process
- **DP Agent**: Generates the turnaround images

### Deliverable
Character turnaround or reference sheet with:
- **Front view**: Character facing camera directly
- **3/4 view**: Character at 45-degree angle
- **Profile view**: Character in side profile
- **Consistent lighting**: Same lighting setup across all views
- **High resolution**: Minimum 1024x1024 for reference quality

### Tools Allowed
- Image generation models ONLY (Imagen 3, Nano Banana Pro, Seedream 4.5, FLUX.2, etc.)

### Tools FORBIDDEN
- Video generation models (Veo 3.1, Sora 2, Kling, etc.)

### Agent Output Format
```
PHASE 1: MASTER ID GENERATION

Character: [Name]
Model: [Imagen 3/Nano Banana Pro/etc.]
Views Generated: Front, 3/4, Profile

[Display turnaround images]

⛔ HARD STOP - USER APPROVAL REQUIRED

Please review the character turnaround for:
- Visual consistency across views
- Character identity accuracy
- Lighting and style consistency

Reply "LOCKED" to proceed to Hero Frame generation, or provide correction notes.
```

### User Action Required
- Review the Master ID for character consistency
- Reply **"LOCKED"** to approve and proceed to Phase 2
- OR provide specific correction notes (triggers 3-Strike Rule)

### ⛔ DO NOT PROCEED to Phase 2 until user approval is received

---

## PHASE 2: Master Still Generation (Hero Frame)

### Objective
Generate the 100% perfect still shot that will serve as the "ingredient" for motion generation.

### Agents Responsible
- **DP Agent**: Composition and optical design
- **Holistic Image Auditor**: Comprehensive image analysis across 6 dimensions (peer-reviews DP's work before user presentation)

### Deliverable
Hero Frame still image with:
- **Composition locked**: Rule of thirds, leading lines, depth layering
- **Optical specs locked**: Focal length (e.g., 35mm), aperture (e.g., f/4), distance (e.g., 8ft)
- **Lighting locked**: Practical sources, motivated ratios, physics-correct (no blue glow, no CGI sheen)
- **Character identity locked**: Using Master ID from Phase 1 as reference
- **Style consistency maintained**: Aesthetic, tone, mood match project DNA
- **Clarity optimized**: Sharpness, focus, depth of field

### Critical Requirement
This is a **STILL IMAGE ONLY**. No motion. No video generation. No animation.

### Tools Allowed
- Image generation models ONLY (Imagen 3, Nano Banana Pro, Seedream 4.5, FLUX.2, Kling O1 Image, etc.)
- Reference image input (Master ID from Phase 1)

### Tools FORBIDDEN
- **Video generation models are STRICTLY DISABLED in this phase**
- Veo 3.1, Sora 2, Kling O1 Edit, Kling Motion Control, Wan 2.6, Minimax Hailuo 02, Kling Avatars 2.0

### Agent Output Format
```
PHASE 2: MASTER STILL (HERO FRAME) GENERATION

Shot: [Shot name/number]
Model: [Imagen 3/Nano Banana Pro/etc.]
Reference: Master ID from Phase 1

Optical Specifications:
- Focal Length: 35mm
- Aperture: f/4
- Distance: 8ft
- Sensor: Full Frame

Lighting Specifications:
- Key Light: Desk lamp, camera left, 3200K
- Fill Light: Bounce, camera right, 50% intensity
- Rim Light: None (motivated lighting only)

Composition:
- Rule of thirds: Subject on right third
- Leading lines: Desk edge guides eye to subject
- Depth: 3 layers (foreground, subject, background)

[Display Hero Frame still image]

🔍 HOLISTIC IMAGE AUDIT (MANDATORY)

Before presenting to user, the Holistic Image Auditor performs comprehensive analysis across 6 dimensions:

1. Physics: Lighting, shadows, perspective
2. Style Consistency: Aesthetic, tone, mood
3. Lighting & Atmosphere: Artistic intent, motivated sources
4. Clarity: Sharpness, focus, depth of field
5. Objects & Composition: Placement, scale, relationships
6. Character Identity: Appearance, clothing, features

HOLISTIC AUDIT REPORT:
[Auditor analyzes all 6 dimensions and provides one of three recommendations]

RECOMMENDATION: [LOCK IT IN / REFINE / REGENERATE]

Overall Quality: [0-100]/100

Analysis Summary:
- Physics: [0-10]/10
- Style Consistency: [0-10]/10
- Lighting & Atmosphere: [0-10]/10
- Clarity: [0-10]/10
- Objects & Composition: [0-10]/10
- Character Identity: [0-10]/10

[Specific Issues or Reasoning]

[Suggested Prompt Adjustments or Action]

---

If LOCK IT IN (95-100%):
  Forwarding to Chief of Staff for final technical audit.
  
If REFINE (70-94%):
  DP regenerates with specific targeted improvements (Strike 1/2/3).
  
If REGENERATE (0-69%):
  DP regenerates with comprehensive prompt adjustment (Strike 1/2/3).

---

⛔ HARD STOP - USER APPROVAL REQUIRED

This Hero Frame will serve as the foundation for motion generation.

Please review:
- Composition and framing
- Lighting & atmosphere (motivated sources, artistic intent)
- Character identity consistency with Master ID
- Style consistency with project DNA
- Clarity and optical quality
- **Holistic quality (6-dimension analysis completed)**

Reply "LOCKED" to proceed to motion generation, or provide correction notes.
```

### User Action Required
- Review the Hero Frame for composition, lighting, and character identity
- Reply **"LOCKED"** to approve and unlock Phase 3
- OR provide specific correction notes (triggers 3-Strike Rule)

### If Corrections Needed
Apply the **3-Strike Rule** within the image model:
1. **Strike 1**: Initial attempt (current output)
2. **Strike 2**: Correction pass with negative constraints (e.g., "no blue glow")
3. **Strike 3**: Aggressive physics-first override
4. **Pivot Decision**: Only after Strike 3 fails, Chief of Staff may suggest a model pivot

### ⛔ DO NOT PROCEED to Phase 3 until user approval is received

### Why This Gate Exists
**Without this gate, agents skip directly to video generation**, which causes:
- The video model to hallucinate the character's appearance
- Inconsistent composition across frames
- Physics errors that can't be corrected post-generation
- Loss of the carefully crafted lighting and optical specs

**The Hero Frame is the mandatory "ingredient"** that anchors the video generation to your exact specifications.

**The Holistic Image Auditor adds a comprehensive peer-review layer** that analyzes the entire image across 6 dimensions (physics, style, lighting, clarity, composition, character identity) before it reaches you. This "friction-based" workflow ensures that only high-quality, consistent Hero Frames are approved for motion generation, with detailed feedback and actionable suggestions for improvement.

---

## PHASE 3: Motion Generation (Video)

### Objective
Animate the locked Hero Frame using image-to-video workflow.

### Prerequisite
**User MUST have approved the Hero Frame from Phase 2.**

If the user has not replied "LOCKED" to Phase 2, **this phase is DISABLED**.

### Agent Responsible
- **Motion Agent**: Video generation and temporal stability

### Deliverable
Video clip using Hero Frame as the primary visual anchor:
- **Camera move specified**: Dolly In, Pan Right, Tilt Up, Static, etc.
- **Duration**: 6s, 8s, or 10s (model-dependent)
- **Temporal stability**: Character identity consistent across all frames
- **Optical metadata applied**: Focal length and aperture from DP for correct DOF
- **Physics-based motion**: No floating, no warping, no unnatural movement

### Tools Allowed
- Video generation models (Veo 3.1, Sora 2, Kling O1 Edit, Kling Motion Control, Wan 2.6, Minimax Hailuo 02)
- Image-to-video workflow (Hero Frame as input)

### Input Required
- **The locked Hero Frame from Phase 2** as the primary visual anchor
- **Optical metadata from DP** (focal length, aperture, distance)
- **Camera move specification** from user or Chief of Staff

### Agent Output Format
```
PHASE 3: MOTION GENERATION

Proceeding to motion generation using locked Hero Frame.

Motion Specifications:
- Camera Move: Dolly In (8ft → 4ft)
- Speed: 2ft/sec
- Duration: 8s
- Model: Veo 3.1

Optical Metadata (from DP):
- Focal Length: 35mm (maintained)
- Aperture: f/4 → f/2.8 equivalent (DOF shift during dolly)
- Sensor: Full Frame

Input: Hero Frame from Phase 2 (LOCKED)

Generating video now...

[Display video output]

Motion generation complete. Please review for:
- Temporal stability (character identity consistent)
- Physics-based motion (no floating/warping)
- Optical accuracy (DOF shift matches camera move)
```

### User Action
- Review the video output
- Provide feedback or request corrections (triggers 3-Strike Rule for video model)

### If Corrections Needed
Apply the **3-Strike Rule** within the video model:
1. **Strike 1**: Initial video generation (current output)
2. **Strike 2**: Correction pass with adjusted motion parameters
3. **Strike 3**: Aggressive physics-first override or different camera move
4. **Pivot Decision**: Only after Strike 3 fails, Chief of Staff may suggest a different video model

---

## Enforcement: Chief of Staff Responsibility

The **Chief of Staff (Producer Agent)** is responsible for enforcing this workflow.

### Enforcement Actions

**If any agent attempts to skip a phase:**
1. **Intervene immediately**: "STOP. Phase [X] has not been completed and approved."
2. **Reset to correct phase**: "Returning to Phase [X] for user approval."
3. **Explain the violation**: "Video generation requires a user-approved Hero Frame to prevent character hallucination."

**If user attempts to skip a phase:**
1. **Politely explain the requirement**: "To ensure character consistency and prevent hallucination, we need to complete Phase [X] first."
2. **Offer to proceed with the correct workflow**: "May I generate the Master Still (Hero Frame) for your approval before proceeding to motion?"

---

## Context Drift Prevention: Why This Matters

### The Problem
Agents suffer from "Context Drift" when they:
- See the entire workflow documentation at once
- Identify the end goal (video generation)
- Take a "creative shortcut" by jumping directly to video
- Skip the critical Master Still phase

### The Consequence
Video generation without a locked Hero Frame leads to:
- **Character identity hallucination**: The video model invents its own version of the character
- **Inconsistent composition**: The framing and layout drift across frames
- **Physics errors**: Unmotivated lighting, CGI sheen, and unnatural motion
- **Wasted compute**: Unusable outputs that can't be corrected

### The Solution
**Hard-stop validation gates** that:
- Force sequential workflow (Phase 1 → Phase 2 → Phase 3)
- Require explicit user approval at each gate
- Disable video tools until the Hero Frame is locked
- Prevent creative shortcuts that break the production pipeline

---

## Quick Reference: Phase Checklist

### Phase 1: Master ID
- [ ] Character turnaround generated (Front, 3/4, Profile)
- [ ] Presented to user for review
- [ ] User replied "LOCKED" or provided approval
- [ ] Proceed to Phase 2

### Phase 2: Master Still (Hero Frame)
- [ ] Hero Frame generated (STILL IMAGE ONLY)
- [ ] Composition, lighting, and character identity locked
- [ ] Gaffer audit completed (no physics errors)
- [ ] Presented to user for review
- [ ] User replied "LOCKED" or provided approval
- [ ] Proceed to Phase 3

### Phase 3: Motion Generation
- [ ] Hero Frame from Phase 2 confirmed as input
- [ ] Camera move specified
- [ ] Optical metadata from DP applied
- [ ] Video generated using image-to-video workflow
- [ ] Temporal stability and physics verified
- [ ] Presented to user for review

---

## For AI Agents: Implementation Instructions

### On Task Start
1. **Read this workflow document first**
2. **Identify the current phase** (default: Phase 1)
3. **Do NOT proceed to Phase 2 or Phase 3** without explicit user approval

### During Execution
1. **Complete the current phase fully**
2. **Present deliverable to user**
3. **State the required user action**: "Reply 'LOCKED' to proceed or provide correction notes."
4. **WAIT for user response** (do NOT proceed automatically)
5. **Only after user approval**: Advance to the next phase

### If Tempted to Skip Ahead
1. **STOP**: Recognize this as Context Drift
2. **Reset**: Return to the current phase
3. **Explain**: "Video generation requires a user-approved Hero Frame to prevent character hallucination."
4. **Proceed correctly**: Complete Phase 2, wait for approval, then proceed to Phase 3

---

## For Human Users: How to Use This Workflow

### Starting a New Shot
1. **Request Phase 1**: "Generate the Master ID for [character name]"
2. **Review the turnaround**: Check for consistency across views
3. **Approve**: Reply "LOCKED" to proceed to Hero Frame
4. **Request Phase 2**: "Generate the Hero Frame for [shot description]"
5. **Review the still**: Check composition, lighting, character identity
6. **Approve**: Reply "LOCKED" to unlock motion generation
7. **Request Phase 3**: "Generate motion: [camera move description]"
8. **Review the video**: Check temporal stability and physics

### If You Want to Skip a Phase
**Don't.** The workflow exists to prevent character hallucination and physics errors. Skipping phases leads to unusable outputs.

### If the Agent Skips a Phase
1. **Call it out**: "You skipped Phase 2. I need to approve the Hero Frame first."
2. **Request the correct phase**: "Please generate the Master Still (Hero Frame) for my approval."
3. **The Chief of Staff should intervene automatically**

---

**This workflow is the foundation of the Cine-AI production pipeline. Follow it religiously to achieve professional-grade, consistent outputs.** 🎬
