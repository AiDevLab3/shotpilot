# Character Consistency Pack

## Purpose
Maintain character identity across multiple shots, scenes, and AI models.

---

## Character Bible Checklist (Complete Before Generation)

### Physical Appearance — All Required
- [ ] **Face:** Eye color, nose shape, jawline, distinguishing marks (scars, moles, freckles)
- [ ] **Age & Skin:** Specific age range + skin tone (e.g., "early 30s, olive skin with warm undertones")
- [ ] **Hair:** Style, color, length, texture (e.g., "short, messy, platinum blonde with dark roots")
- [ ] **Build & Posture:** Body type + posture habits (e.g., "slight slouch, athletic build")
- [ ] **Wardrobe:** Clothing, accessories, jewelry, props per scene
- [ ] **Personality:** 2-3 core traits (confident, pensive, aggressive)
- [ ] **Mannerisms:** Recurring gestures or habits (optional but improves consistency)

### Master Reference Image — Required
- [ ] Generate ONE high-resolution master reference image
- [ ] Use Nano Banana Pro or Midjourney for master reference
- [ ] Attach master reference to every subsequent generation
- [ ] Embed physical descriptors from Bible in every prompt (do not rely on image alone)

---

## Frame-to-Frame Chaining Workflow

Prevents character drift across multi-shot sequences:

1. Generate first shot with master reference + full Bible descriptors
2. Download last frame of output
3. Upload last frame as reference for next prompt
4. Include Bible descriptors again in new prompt (never skip text anchors)
5. Repeat for each subsequent shot
6. If drift occurs: reset to master reference, not the drifted frame

---

## Shot Review Checklist (After Every Generation)

- [ ] Face matches Bible (eye color, jawline, distinguishing marks)
- [ ] Hair matches Bible (style, color, length)
- [ ] Wardrobe matches scene specification
- [ ] Skin tone consistent with master reference
- [ ] Build/posture consistent
- [ ] Expression appropriate for narrative context
- [ ] If FAIL on any item: adjust prompt with specific correction, regenerate

---

## Production Workflow

1. **Complete Character Bible** — fill all checklist items above
2. **Generate Master Reference** — Nano Banana Pro or Midjourney
3. **Generate Shots** — attach master reference + Bible descriptors to every prompt
4. **Review Every Shot** — run Shot Review Checklist
5. **Chain Frames** — use last frame as reference for next shot in sequence
6. **Post-Process** — color grade, focus adjustments to match Master Look

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
| Expression inconsistency | Use micro-expression prompting (see Motion Readiness Pack); specify emotional state explicitly; generate 2-3 variations and select best |

## 5 Operational Rules

1. **Character Bible is Canon** - Never deviate without explicit versioning (Character v1, v2)
2. **Reference Image is Anchor** - Always use same master reference unless intentionally updating
3. **Review Every Shot** - Tight feedback loop; check consistency before moving forward
4. **Chain Strategically** - Frame-to-frame for sequences; start fresh for new scenes to avoid accumulated drift
5. **Version Your Characters** - If appearance must change (aging, costume), create versioned Bible entries
