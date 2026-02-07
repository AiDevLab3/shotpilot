# Character Consistency Pack

## Purpose
Maintain character identity, appearance, and personality across multiple shots, scenes, and AI models for believable AI filmmaking narratives.

## Universal Techniques (All Models)

### Character Bible: Single Source of Truth
Document every defining element before generation begins:

**Physical Appearance:**
- Facial features (eye color, nose shape, jawline, distinguishing marks)
- Age & skin tone (specific: "early 30s, olive skin with warm undertones")
- Hair (style, color, length, texture: "short, messy, platinum blonde with dark roots")
- Clothing & accessories (wardrobe, jewelry, props)
- Posture & body type ("slight slouch, athletic build")

**Personality & Mannerisms:**
- Personality traits (confident, shy, aggressive, pensive)
- Vocal tone & speech quirks
- Recurring gestures or habits

### High-Quality Reference Images
- Start with a single, high-resolution master reference image as visual anchor
- Prefer image-to-video workflow when possible
- Use image-to-image for variations (angles, poses, expressions)
- Embed visual descriptors in text prompts to reinforce the reference

### Frame-to-Frame Chaining
For multi-shot sequences, prevent drift by chaining:
1. Generate first shot
2. Download last frame
3. Upload as reference for next prompt
4. Repeat for each subsequent shot

### Feedback Loop
- Review each clip for mismatched features, wardrobe, voice, mannerisms
- Adjust prompts with specific corrections ("same hairstyle as previous clip")
- Generate multiple takes per shot
- Tighter review cycles = faster consistency

### Tool Chaining Workflow
1. **Character Bible** - use LLM to expand and refine
2. **Reference Image** - generate master in Nano Banana Pro or Midjourney
3. **Video Generation** - feed reference + prompts into VEO, Kling, etc.
4. **Post-Processing** - color grade, focus adjustments, refinements

## Model-Specific Workflows

### VEO 3.1: Ingredients to Video
- Upload up to 3 reference images (character, object, background, style)
- VEO blends ingredients into cohesive video with identity consistency
- Best for: identity consistency across setting changes
- Pro tip: Use Nano Banana Pro to create ingredient images

### Kling 2.6: Custom Face Models + Element Library
**Custom Face Models (train AI actor):**
- Gather 10-30 video clips (10-15 sec each), different poses/angles/backgrounds
- Train custom face model (~90 min)
- Select custom model as face reference in prompts
- Best for: unparalleled face consistency

**Element Library (asset repository):**
- Upload 2-4 multi-angle reference images to create "Element"
- Use `[@element_name]` format in prompts
- Combine up to 7 elements per generation
- AI-assisted creation auto-generates additional views

### Higgsfield Cinema Studio: Hero Frame First
- Create "Hero Frame" using advanced optical simulation (sensors, lenses, focal lengths)
- Lock optical parameters for consistency
- Animate Hero Frame or use as reference for video models
- Best for: deterministic control, cinematic precision

### Midjourney V7: --cref Parameter
- Generate or upload master character image
- Add `--cref [image_URL]` to subsequent prompts
- Use `--cw` (character weight, 0-100) to control influence
- Best for: quick character consistency without extensive setup

### GPT Image: Reference + Detailed Description
- Upload reference image alongside detailed text description
- Reinforce identity with explicit physical descriptors in every prompt
- Best for: editorial and design-oriented character work

### Nano Banana Pro: Multi-Reference Identity Lock
- Upload up to 14 reference images (6 high-fidelity)
- Explicitly state: "Keep facial features exactly the same as Image 1"
- Assign roles per image (identity, style, background)
- Best for: maximum reference control, text + character combinations

## Cross-Model Consistency Strategies

| Strategy | How |
|---|---|
| Consistent Character Bible | Use identical text descriptions across all models |
| Master Reference Image | Create one definitive image, use everywhere |
| Image-to-Image/Video | Upload master reference when switching models |
| Focus on Core Features | Prioritize face structure, hair, signature clothing |
| Hybrid Workflow | Hero frames in Higgsfield --> animate in Kling/VEO --> face-swap if needed |

## Troubleshooting

| Problem | Solution |
|---|---|
| Character drifts over multiple shots | Frame-to-frame chaining; lock core descriptors; reduce variables changed between shots |
| Inconsistent wardrobe | State wardrobe explicitly in every prompt; use same clothing descriptors from Bible; include costume in reference image |
| Face changes across models | Use high-quality master reference; include detailed facial descriptors; face-swap as final pass |
| Expression inconsistency | Use Seedance for emotion-heavy scenes; specify emotional state explicitly; review and iterate |

## 5 Operational Rules

1. **Character Bible is Canon** - Never deviate without explicit versioning (Character v1, v2)
2. **Reference Image is Anchor** - Always use same master reference unless intentionally updating
3. **Review Every Shot** - Tight feedback loop; check consistency before moving forward
4. **Chain Strategically** - Frame-to-frame for sequences; start fresh for new scenes to avoid accumulated drift
5. **Version Your Characters** - If appearance must change (aging, costume), create versioned Bible entries
