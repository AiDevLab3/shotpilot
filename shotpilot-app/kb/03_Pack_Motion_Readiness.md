# Motion Readiness Pack

## Purpose
Prepare still images for AI video generation. Build a visual language in stills first, then animate. This prevents the "drifting" effect where characters morph, lighting shifts, and continuity breaks.

## Image-First Workflow Philosophy
- Generate still images first to "lock in" creative decisions (character identity, wardrobe, set design, lighting, camera language)
- A video prompt asks the AI to solve too many variables simultaneously
- Pre-production in stills = predictable, director-aligned video output
- Goal: animate a plan, not gamble on a miracle

## Visual Bible (3-10 Reference Frames)

| Step | Action | Description |
|---|---|---|
| 1. Style Anchor | Select single primary style direction | Consistent aesthetic for entire project (e.g., "1970s sci-fi, grainy 35mm, anamorphic lenses") |
| 2. Visual Rules | Define recurring visual parameters | Color temperature, contrast, camera angles, film grain - repetition creates cohesion |
| 3. Hero Frames | Generate perfect "hero" image for main character/location | Primary visual anchor - AI references this for identity and style |
| 4. Variations | Controlled variations of hero frame | Change pose, angle, environment while keeping core identity stable |

## Storyboard Structure
- **Opening Hook:** Stop-scrolling moment
- **Establishing Shot:** Wide shot answering "where are we?"
- **Detail Shot:** Close-up on narratively important element
- **Action Frame:** Key action or scene change
- **Resolution Frame:** Final emotion or call to action

## Composition for Motion: 5 Key Principles

| Principle | Rule | Why |
|---|---|---|
| Air Around Subject | Compose with negative space, avoid tight crops | Gives AI room for pans/tilts/orbits without edge artifacting |
| Clear Subject-Background Separation | Use DOF, lighting, or color contrast | Well-defined subject is easier for AI to track; prevents morphing with background |
| Simple Limb Positions | Avoid complex overlapping limbs or intricate hand gestures | Hands and overlapping body parts are notorious AI animation failure points |
| Stable Facial Angles | Face directly forward or clear profile | Three-quarter angles and sharp tilts cause facial warping and identity drift |
| Single Focal Point | One clear dominant subject per shot | Multiple independent subjects increase error and incoherence |

## What Breaks When Animated

| Element | Problem | Rule |
|---|---|---|
| Multiple simultaneous actions | "Walking while talking on phone and drinking coffee" = failure | ONE primary action per shot |
| Complex camera combos | "Pan left while zooming in and dollying forward" = chaos | ONE camera movement type per generation |
| Overlapping/obscured elements | Partially hidden objects cause "floating limbs" artifact | Keep all subject parts clearly visible |
| Intricate textures/patterns | Detailed clothing patterns "shimmer" or "crawl" unnaturally | Use simpler textures for animated subjects |

## Motion in 3 Dimensions
Layer these three in a single prompt for cinematic results:

### 1. Subject Motion (what the character/object does)
- Single, clear action only
- "The character slowly turns their head to the left"
- "Steam rises from the coffee cup"
- "The product rotates smoothly on its vertical axis"

### 2. Camera Motion (virtual camera movement)
- Reliable movements: slow push-in/pull-out, orbit around subject, handheld follow, static shot
- "Slow dolly push-in on the character's face"
- Avoid combining multiple camera moves in one generation

### 3. Environment Motion (background life)
- Subtle ambient movements that sell realism
- "Light from window shifts slowly across the wall"
- "Bokeh in background drifts gently"
- "Dust particles float in the sunbeam"

## Micro-Expressions Prompting Table

| Emotion | Prompt Examples |
|---|---|
| **Surprise** | "A brief flash of surprise in her eyes" / "Her eyebrows raise for a fraction of a second" |
| **Doubt** | "A subtle one-sided lip raise" / "A slight squint of skepticism" / "A faint furrowing of the brow" |
| **Joy** | "A genuine smile that reaches her eyes" / "Corners of her mouth twitch upwards in a suppressed smile" |
| **Sadness** | "A flicker of sadness in his expression" / "His lower lip trembles almost imperceptibly" |
| **Anger** | "A subtle tightening of the jaw" / "A fleeting sneer on his lips" / "His nostrils flare for a moment" |

## High-Quality First Frame Requirements
- Clear, well-lit, emotionally neutral or subtly expressive starting image
- Cinematic lighting with clear facial features
- Avoid: poor lighting, blur, overly strong expressions (AI cannot generate nuanced changes from these)

**Performance Workflow:**
1. Generate motion-ready still with neutral/subtle face expression
2. Write layered prompt: simple physical action + emotional/micro-expression cue
3. Generate 2-3 variations per critical shot, select best

## Negative Prompts for Motion-Ready Stills
Always include when generating source images:
```
--no watermark, text artifacts, blurry edges, warped face, distorted hands, floating limbs
```

## DO / DON'T Quick Reference

| DO | DON'T |
|---|---|
| Leave negative space around subject | Tight-crop the subject |
| One action per shot | Stack multiple simultaneous actions |
| One camera move per generation | Combine pan + zoom + dolly |
| Use simple, clear poses | Use complex overlapping limbs |
| Generate 2-3 variations per key shot | Obsess over single perfect generation |
| Chain last frame as next reference | Generate shots in isolation |
| Start with still image, then animate | Jump straight to text-to-video |
