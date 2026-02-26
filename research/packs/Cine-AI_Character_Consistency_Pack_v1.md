# Cine-AI Character Consistency Pack v1

**Purpose:** Maintain character identity, appearance, and personality across multiple shots, scenes, and AI models to create believable narratives.

**Version:** 1.0  
**Date:** February 2, 2026

This pack consolidates universal techniques and model-specific workflows for achieving professional-grade character consistency in AI filmmaking.

---

## 0) The Character Consistency Challenge

Character consistency is the foundation of believable AI filmmaking. Without it, narratives fall apart and audience immersion is broken. This pack provides:

- **Universal techniques** that work across all models
- **Model-specific workflows** for advanced features
- **Cross-model strategies** for hybrid productions
- **Troubleshooting guidance** for common issues

---

## 1) Universal Techniques (Model-Agnostic)

### 1.1 The Character Bible: Single Source of Truth

Create a detailed Character Bible documenting every defining element:

**Physical Appearance:**
- Facial features (eye color, nose shape, jawline, distinguishing marks)
- Age & skin tone (be specific: "early 30s, olive skin with warm undertones")
- Hair (style, color, length, texture: "short, messy, platinum blonde with dark roots")
- Clothing & accessories (wardrobe, jewelry, props)
- Posture & body type ("slight slouch, athletic build")

**Personality & Mannerisms:**
- Personality traits (confident, shy, aggressive, pensive)
- Vocal tone & speech quirks
- Recurring gestures or habits

**Pro Tip:** Use a personalized GPT trained on your Character Bible to generate consistent prompts automatically.

---

### 1.2 High-Quality Image References

Always start with a high-quality reference image as your visual anchor.

**Best Practices:**
- Use a single, high-resolution image
- Prefer image-to-video workflow when possible
- Use image-to-image for variations (angles, poses, expressions)
- Embed visual descriptors in text prompts to reinforce the reference

---

### 1.3 Frame-to-Frame Chaining

For multi-shot sequences, use the last frame of each clip as the reference for the next.

**Workflow:**
1. Generate the first shot
2. Download the last frame
3. Upload as reference for next prompt
4. Repeat for each subsequent shot

This creates a strong visual throughline and prevents drift.

---

### 1.4 The Feedback Loop: Iteration and Refinement

Treat each generation like a film take and build a tight review cycle.

**Best Practices:**
- Review each clip for mismatched features, wardrobe, voice, mannerisms
- Adjust prompts with specific corrections ("same hairstyle as previous clip")
- Generate multiple takes to get the perfect shot
- Tighter review cycles = faster consistency

---

### 1.5 Chaining Tools for Enhanced Quality

Combine multiple tools in a cohesive workflow:

1. **Character Bible:** Use ChatGPT/LLM to expand and refine
2. **Reference Image:** Generate master image with Nano Banana Pro or Midjourney
3. **Video Generation:** Feed reference + prompts into Veo, Kling, Runway, etc.
4. **Post-Processing:** Color grade, focus adjustments, refinements

---

## 2) Model-Specific Workflows

### 2.1 Google Veo 3.1: Ingredients to Video

**Best for:** Identity consistency across setting changes

**Workflow:**
1. Gather up to 3 reference images (character, object, background, style)
2. Craft detailed prompt describing scene and action
3. Veo blends ingredients into cohesive video

**Features:**
- Identity consistency across scenes
- Background & object consistency
- Seamless blending of disparate elements

**Pro Tip:** Use Nano Banana Pro (Gemini 3 Pro Image) to create ingredient images for best results.

---

### 2.2 Runway Gen-4.5: References System

**Best for:** Single reference transformations and multi-reference precision

**Workflow:**
1. Upload character image and save as named reference (e.g., `@bryan`)
2. Use `@reference_name` format in prompts
3. Combine up to 3 references (e.g., `@bryan in @forest`)

**Features:**
- Excels at consistent characters across different lighting/locations
- Multi-reference control (character + scene + style)
- Tag and save references for reuse

---

### 2.3 Kling AI: Ultimate Character Control

#### 2.3.1 Custom Face Models (Train Your AI Actor)

**Best for:** Unparalleled face consistency

**Workflow:**
1. Gather 10-30 video clips (10-15 sec each) with different poses/angles/backgrounds
2. Upload footage and train custom face model (~90 minutes)
3. Select custom model as face reference in prompts

#### 2.3.2 Kling O1 Element Library (Personal Asset Repository)

**Best for:** Industry-level feature consistency across dramatic scene changes

**Workflow:**
1. Upload 2-4 multi-angle reference images to create "Element"
2. Use `[@element_name]` format in prompts
3. Combine up to 7 elements in single generation

**Features:**
- Multi-angle understanding of character
- AI-assisted creation (auto-generate additional views)
- One-click reuse in image and video generation

---

### 2.4 Seedance 1.5 Pro: Lip-Sync and Emotion King

**Best for:** Dialogue-heavy scenes and emotional close-ups

**Workflow:**
1. Use 1-4 reference images to guide generation
2. Leverage strengths in lip-sync and emotional expression
3. Chain shots for narrative sequences

**Features:**
- Robust style consistency during multi-shot transitions
- Emotional consistency (subtle emotions, natural expressions)
- Best-in-class lip-sync accuracy

---

### 2.5 Higgsfield Cinema Studio: Hero Frame First

**Best for:** Deterministic control and cinematic precision

**Workflow:**
1. Create "Hero Frame" using advanced optical simulation (sensors, lenses, focal lengths)
2. Lock optical parameters for consistency
3. Animate Hero Frame or use as reference for video models

**Features:**
- Professional environment with deterministic control
- Advanced optical simulation
- Seamless integration with video generation models

---

### 2.6 Midjourney V7: Character Reference (`--cref`)

**Best for:** Quick and easy character consistency without extensive setup

**Workflow:**
1. Generate or upload master character image
2. Add `--cref [image_URL]` to prompts
3. Optionally use `--cw` (character weight) to control influence (0-100)

**Features:**
- Simple parameter-based consistency
- Works with any image URL
- Adjustable character weight for fine control

---

## 3) Cross-Model Consistency Strategies

Maintaining consistency when switching between models:

### 3.1 Use a Consistent Character Bible
Your detailed character description is your most important cross-model tool.

### 3.2 Generate a High-Quality Master Image
Create a definitive reference image in your preferred model.

### 3.3 Use Image-to-Image/Video
Use the master image as reference when switching models.

### 3.4 Focus on Core Features
Prioritize maintaining the most important character traits (face structure, hair, signature clothing).

### 3.5 Hybrid Workflows
- Generate hero frames in Higgsfield Cinema Studio
- Animate in Kling or Veo
- Use face-swapping tools for final consistency pass if needed

---

## 4) Best Practices & Troubleshooting

### 4.1 Start with a Clear Vision
The more precise you are, the more consistent your results will be.

### 4.2 Iterate and Refine
Don't expect perfect results on the first try. Review, adjust, regenerate.

### 4.3 Use a Combination of Techniques
Combine universal techniques with model-specific features for best results.

### 4.4 Common Issues and Solutions

**Problem: Character drifts over multiple shots**
- Use frame-to-frame chaining
- Lock core descriptors in Character Bible
- Reduce number of variables changed between shots

**Problem: Inconsistent wardrobe**
- Explicitly state wardrobe in every prompt
- Use same clothing descriptors from Character Bible
- Consider using reference image with character in costume

**Problem: Face changes across models**
- Use high-quality master reference image
- Include detailed facial descriptors in prompts
- Consider face-swapping as final consistency pass

**Problem: Emotional expression inconsistency**
- Use Seedance for emotion-heavy scenes
- Specify emotional state explicitly in prompts
- Review and iterate on emotional beats

---

## 5) Operational Rules

### Rule 1: Character Bible is Canon
Never deviate from Character Bible without explicit versioning (Character v1, v2, etc.).

### Rule 2: Reference Image is Anchor
Always use the same master reference image for a given character unless intentionally updating.

### Rule 3: Review Every Shot
Build a tight feedback loop. Review each generation for consistency before moving forward.

### Rule 4: Chain Strategically
Use frame-to-frame chaining for sequences, but start fresh for new scenes to avoid accumulated drift.

### Rule 5: Version Your Characters
If character appearance must change (aging, costume change, etc.), create versioned Character Bible entries.

---

## 6) Appendix: Character Consistency Cheatsheet

- Character Bible = single source of truth
- High-quality reference image = visual anchor
- Frame-to-frame chaining = seamless sequences
- Feedback loop = catch drift early
- Model-specific features = leverage advanced capabilities
- Cross-model strategy = maintain core features
- Iterate, don't settle = professional results require refinement
