# Cross-Model Consistency Research Notes

## Midjourney Style Reference (--sref)

### Core Functionality
- **What it does:** Captures the visual vibe (colors, medium, textures, lighting) of an existing image and applies it to new creations
- **What it doesn't do:** Does NOT copy objects or people, only the overall style
- **Compatibility:** Works with Midjourney V6 and V7

### How to Use
1. Upload reference image(s) via the image icon in the Imagine bar
2. Drag and drop into the "Style Reference" section
3. Can use multiple images simultaneously
4. Lock icon keeps images pinned across multiple prompts

### Style Weight Parameter (--sw)
- **Range:** 0 to 1000
- **Default:** 100
- **Effect:** Controls how strongly the style influences the new image
- **Note:** In V7, --sw has more impact with sref codes than with images

### Random Styles & Codes
- Use `--sref random` to select a preset style from Midjourney's internal library
- "random" converts to a numerical code (sref code) that can be reused
- Can mix multiple codes together
- Can combine images with codes
- **Important:** Old V7 sref codes may not work the same; use `--sv 4` for old codes or switch to V6

### Best Practices for Prompting
**DO:**
- Keep text prompts simple
- Focus on content description (what you want to see)
- Add style words selectively if needed

**DON'T:**
- Add style words that conflict with reference image
- Use instructional language ("copy this style", "the look of this image")

**Good Examples:**
- "detailed portrait of a dog"
- "ballpoint pen sketch of a bunny"

**Bad Examples:**
- "the look of this image but a dog"
- "copy this style and make a bunny"

### Style Explorer
- Visual discovery tool for style codes
- Can browse Random, Popular, or search by keywords
- Can save favorites (doesn't affect personalization profiles)
- Click "Use Style" to add --sref code to Imagine bar

---

## Higgsfield Cinema Studio V1.5

### Core Philosophy
**"Hero Frame First"** - Perfect the still image before animating to lock in lighting, composition, and character details. This is the key to maintaining consistency.

### Key Capabilities for Style Consistency

**1. True Optical Simulation**
- Full control over camera sensor (ARRI Alexa 35, VHS profiles, Digital Cinema)
- Lens character selection (e.g., Cooke for unique bokeh)
- Focal length control (12mm to 135mm)
- Aperture control for depth of field

**2. Reference Image System**
- "Use as ref for video" feature - locks the visual style of your Hero Frame
- The animation model strictly adheres to the Hero Frame's visual style
- Seamless handoff from image to video maintains consistency

**3. Camera Presets**
- Team-curated cinematic looks
- Ability to save custom signature setups
- Reusable across projects

### Workflow for Consistency

**Phase 1: Build the Rig & Shoot Your Image**
1. Select camera sensor profile (VHS/Film for nostalgic, Digital Cinema for clarity)
2. Pick lens character (Cooke, etc.)
3. Set focal length based on shot type
4. Adjust aperture for depth of field
5. Write prompt describing scene, lighting, subject
6. Generate and select perfect "Hero Frame"

**Phase 2: Direct the Motion**
1. Use "Use as ref for video" to lock in the Hero Frame
2. Set camera moves (up to 3 movements)
3. Model animates while maintaining Hero Frame's visual style

### Key Insight for Cross-Model Consistency
**The "Hero Frame" acts as a visual anchor.** If you generate your Hero Frame in Higgsfield and need to match it in another model, you would need to:
1. Export the Hero Frame
2. Use it as a style/image reference in the target model
3. Translate Higgsfield's camera/lens terminology into the target model's language

---

## GPT Image 1.5

### Core Philosophy
**"Iterate, Don't Overload"** - Start with a clean base prompt, then refine with small, single-change follow-ups. Leverage context from previous generations.

### Key Capabilities for Style Consistency

**1. Precise Style Control and Style Transfer**
- Can apply consistent visual styles across different subjects
- Transfer the look of one image to another with minimal prompting
- Supports everything from branded design systems to fine-art styles

**2. Robust Facial and Identity Preservation**
- Strong identity preservation for edits
- Character consistency across multi-step workflows
- Maintains facial features across iterations

**3. Multi-Image Referencing and Compositing**
- Reference multiple input images by index and description
- Example: "Image 1: product photo... Image 2: style reference... apply Image 2's style to Image 1"
- Explicit instructions on how images interact

### Prompting Best Practices for Consistency

**Structure + Goal:**
- Consistent order: background/scene → subject → key details → constraints
- Include intended use (ad, UI mock, infographic) to set the "mode"

**Constraints (What to Change vs Preserve):**
- State exclusions explicitly: "no watermark," "no extra text"
- For edits: "change only X" + "keep everything else the same"
- **Critical:** Repeat the preserve list on each iteration to reduce drift

**Iterate Instead of Overloading:**
- Start with clean base prompt
- Refine with small, single-change follow-ups
- Use references like "same style as before" or "the subject" to leverage context
- Re-specify critical details if they start to drift

### Quality Settings
- `quality="low"` - Faster generation, sufficient for many use cases
- `quality="high"` - For dense layouts, heavy in-image text, or when detail matters

### Key Insight for Cross-Model Consistency
**GPT Image 1.5 excels at iterative editing with context preservation.** To maintain consistency:
1. Use multi-image referencing to provide style anchors
2. Explicitly state what must be preserved in every iteration
3. Use "change only X" language to minimize drift
4. Leverage the model's ability to understand "same style as before"

**Translation to Other Models:**
- GPT's natural language approach ("change only the lighting, keep everything else") needs to be converted to parameter-based controls in other models
- Style reference images from GPT can be used as --sref in Midjourney or reference images in Higgsfield

---

