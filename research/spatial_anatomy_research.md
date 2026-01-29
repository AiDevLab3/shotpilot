# Spatial & Anatomy Research Notes

## Source 1: OpenAI Community Discussion on Left-Right Confusion

**URL:** https://community.openai.com/t/image-gneration-is-great-but-struggles-with-left-right-direction/1245598

### Key Findings:

**The Problem:**
- User reports that GPT-4o (DALL-E 3) struggles with left-right direction "almost 100% of the time"
- Tried multiple variations: "screen right," "facing his left," "our right," "facing camera right," "facing the camera's right" - all failed
- Even when the model acknowledges its mistake and offers to correct it, it recreates the same incorrect direction
- **Critical Issue:** Adding a reference image makes the problem worse - the model ignores directional prompts when a style reference is uploaded

**Attempted Solutions That Failed:**
- Uploading pose examples facing the correct direction
- Asking the model to assess the direction it created
- Trying to "trick" it by prompting the opposite direction

**One Partial Solution (from community member "polepole"):**
```
The character stands side-on in profile view, body and feet facing strongly toward the right side of the frame (the viewer's right). His left shoulder is closest to the viewer, and his right shoulder is farther away.
```

**Key Insight:** This works by describing **relative spatial relationships** ("left shoulder is closest to the viewer") rather than using directional terms like "left" or "right."

**However:** This solution breaks down when a reference image is uploaded.

### Takeaway:
- Models have fundamental "spatial dyslexia" when reference images are involved
- Directional terms ("left," "right," "screen right") are unreliable
- Describing **relative spatial relationships** ("nearest the camera," "farther away") may be more effective


## Source 2: Medium Article - "The 'left-hand' problem of AI Image Generation"

**URL:** https://medium.com/@santaryan27/the-left-hand-problem-of-ai-image-generation-d6f2cc5763d8

### Key Findings:

**The Core Problem:**
- Author tested multiple models (X's Grok, Google's Gemini) with the prompt: "Create an image of a man writing with his LEFT HAND on paper"
- All models consistently generated right-handed writing, even with explicit instructions
- Even when explicitly correcting ("this is all right hand. I want the pen to be in the left hand"), models ignored the handedness instruction

**Root Causes:**

**1. Skewed Training Data:**
- ~90% of humans are right-handed
- Training datasets contain millions of examples of right-handed writing vs. a small fraction of left-handed
- Dataset annotations often say "person writing" without specifying which hand
- The model's internal world becomes: "writing equals right hand"

**2. Statistical Learning Bias:**
- Diffusion models learn visual concepts statistically
- When a pattern appears thousands of times more often, it becomes the default
- Explicit instructions like "left hand" lose the battle against overwhelming statistical priors

**3. Symmetry Challenge:**
- Human hands are almost perfectly symmetrical
- Left and right hands share the same shape, proportions, textures, motion patterns
- Differences are extremely subtle—even humans get confused with mirrored images
- Machine learning models have almost nothing to "latch onto" to distinguish left from right

**4. Economic Barriers to Fixing:**
- Left-handed examples are rare and expensive to collect
- Cannot simply use mirrored images (lighting, shadows, perspective must remain consistent)
- Training/fine-tuning both the transformer and diffusion model is computationally expensive
- Low commercial priority (few users explicitly request left-handed images)

### Takeaway:
- This is a **fundamental architectural limitation**, not just a prompting problem
- Models have a deeply ingrained statistical bias toward right-handedness
- The symmetry of hands makes it nearly impossible for models to learn the distinction
- **Implication:** Prompting alone cannot solve this—post-generation editing (in-painting) is likely the only reliable solution


## Source 3: Sider AI - "Fixing distorted hands in Nano Banana prompts: a practical guide"

**URL:** https://sider.ai/blog/ai-image/fixing-distorted-hands-in-nano-banana-prompts-a-practical-guide

### Key Findings:

**The Core Challenge:**
Models struggle with hands when they are partially hidden, heavily stylized, or posed at odd angles. A 2023 evaluation of diffusion models notes higher error rates in fine anatomical structures under occlusion and extreme perspective.

**Quick Wins Before You Prompt:**
- Choose references with visible hands, neutral lighting, minimal motion blur
- Avoid heavy jewelry or props that intersect fingers
- Keep the pose simple: relaxed, open palm or natural grasp
- Plan to use inpainting for dynamic gestures

**Base Prompt Template (Preventive):**
```
"portrait of a woman, medium shot, hands visible resting on table, natural daylight, soft shadows, crisp focus, realistic skin texture, anatomically correct hands, five fingers on each hand, clean nails, natural knuckles, subtle veins, professional editorial style, award-winning photography, 50mm depth of field"
```

**Negative Prompt Anchors:**
```
"deformed hands, extra fingers, fused fingers, blurry hands, missing thumbs, warped joints, mangled wrists, melted details, gloves, occluded hands, overlapping hands, cropped hands, low-resolution, over-smoothed skin"
```

**Practical Anatomy Cues:**
- "five fingers on each hand, thumb visible"
- "index finger and middle finger separated"
- "natural knuckle creases, subtle tendons"
- "hand resting, relaxed pose, no tension"
- "wrist alignment straight, no twist"

**Fast Inpainting Workflow (Surgical Repair):**
1. Generate your base image with clean prompts and negative constraints
2. **Select the hand region**; brush only the warped joints or extra digits
3. Inpaint with a short, precise prompt: "natural knuckles, five fingers, clean nails, realistic skin folds"
4. **Keep denoise/modulation low** to preserve the rest of the image

**Real-World Case Study:**
A marketer needed a barista holding a cup. Early outputs showed stretched thumbs and a sixth finger.

**Solution:**
- Prompt: "barista holding ceramic cup with right hand, thumb visible, index and middle finger around handle, natural grip, clean fingernails, realistic knuckle folds, ambient cafe light, 35mm documentary style"
- Negative: "extra fingers, fused digits, missing thumb, warped joints, glove artifacts, occluded fingers, hand cropped"
- Composition tweak: "camera angle slightly above cup, clear view of hand, handle turned toward camera"
- Post-edit: Used inpainting on two finger joints to fix micro-warping
- Result: Natural grasp with correct finger count

### Takeaway:
- **Prevention is better than cure:** Use explicit anatomy cues in the initial prompt
- **Surgical in-painting is the final fix:** For persistent artifacts, use targeted in-painting with low denoise to preserve the rest of the image
- **Occlusion is the enemy:** Props and jewelry near fingers are the #1 cause of fused fingers


## Source 4: Skywork AI - "How to Fix Soft Faces, Hands, and Eyes in Nano Banana"

**URL:** https://skywork.ai/blog/how-to-fix-soft-faces-hands-eyes-nano-banana-guide/

### Key Findings:

**The "Branching" Strategy (Critical for Quality Preservation):**
- **Avoid long edit chains** - Each sequential edit can introduce drift and quality degradation
- **Branch from the clean base** - For each major change, start from the original "clean reference" rather than the already-edited version
- **Lock identity and composition** - Save the base image as your "clean" reference and use it to preserve likeness

**The Two-Pass Hand Repair Workflow:**

**Pass 1: Shape/Structure (No Detail)**
- Prompt: "Adjust only the visible hand for correct structure: five distinct fingers, clear thumb orientation, natural knuckle spacing and finger lengths; no occlusion, no extra fingers"
- Goal: Get the anatomy right first

**Pass 2: Surface Detail**
- Prompt: "Now refine only the hand's surface details: subtle skin creases, natural nail shape, gentle shading; maintain realism and match existing lighting"
- Goal: Add believable texture without changing structure

**The "Micro-Edit" Philosophy:**
- Target **only the problem region** with narrow instructions
- If UI supports masks, select a tight area; if not, explicitly state "edit only the eyes" or "adjust only the visible hand"
- Keep changes subtle - prioritize one fix per edit

**Eye-Specific Surgical Editing:**
- Prompt: "Tighten only the eyes: sharp iris detail, natural catchlights in the upper iris, symmetrical pupils, realistic eyelid contour, neutral sclera tone; avoid over-sharpening"
- Verify: Are both pupils the same size? Do catchlights match key light direction? Is the eye closest to camera the sharpest?

**Composition as Prevention:**
- Start at portrait-friendly distance (50mm/85mm look) to reduce distortion
- Minimize occlusion: begin with one relaxed, open hand rather than complex gestures
- Favor neutral, directional light (soft key light) with natural catchlights

### Takeaway:
- **Branching > Iteration** - Always start from the clean base, never chain edits
- **Two-pass repair** - Fix structure first, then add detail
- **Micro-edits only** - Target the specific problem region with narrow instructions
- **Prevention through composition** - Simple poses and good lighting reduce the need for repair
