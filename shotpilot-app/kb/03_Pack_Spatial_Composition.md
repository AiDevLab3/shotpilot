# Spatial Composition & Anatomy Pack

## Purpose
Solve AI spatial confusion (left/right errors) and prevent anatomical artifacts in generated images and video.

---

## The Core Problem: AI Spatial Dyslexia

AI models cannot reliably interpret "left" and "right" due to:
- **Training bias:** ~90% of training data shows right-handed actions — model defaults to right hand
- **Symmetry ambiguity:** Left/right hands are near-mirrors; model lacks visual differentiators
- **Reference dominance:** Style/character reference images override spatial text instructions

**Rule: Never use "left" or "right" in prompts. Use relative spatial descriptions instead.**

---

## Directional Rosetta Stone

### Universal Technique — Relative Positioning

| Instead of... | Use... |
|---|---|
| "holding purse in her **left** hand" | "holding purse in the hand **closest to the window**" |
| "character facing **screen right**" | "character in profile, **left shoulder nearest the camera**" |
| "object in **right** hand" | "object in the hand **furthest from the door**" |
| "move from **right** to **left** hand" | "the hand **without the object** is now holding it" |

### Per-Model Best Practices

| Model | Spatial Strategy |
|---|---|
| **GPT Image 1.5** | Describe relative positions using landmarks. Avoid reference images if directional accuracy is critical. |
| **Higgsfield** | Use camera-centric terms: "camera left," "camera right." |
| **Midjourney** | Use `--cref` with a correctly-posed image. Visual reference overrides text for positioning. |
| **Nano Banana Pro** | Use conversational editing: "The hand on the right side of the image should be holding the object." |
| **VEO 3.1** | Describe spatial movement relative to environment: "walks toward the window," "turns away from camera." |
| **Kling 2.6** | Use Element Library with pre-posed references. Spatial text prompts are unreliable. |

---

## Anatomy Prevention Rules

### Composition Rules (Prevent Artifacts Before Generation)

- [ ] **Simple limb positions** — avoid overlapping, crossed, or hidden limbs
- [ ] **Hands visible and separated** — no hands behind back, in pockets, or gripping complex objects
- [ ] **Face at clean angle** — direct front or clear profile; avoid sharp three-quarter angles
- [ ] **Single focal subject** — multiple independent subjects increase anatomy errors
- [ ] **No complex hand-object interaction** — holding a cup is fine; playing piano is not

### Preventative Negative Prompts

Include when generating source images:
```
--no deformed hands, extra fingers, fused fingers, blurry hands, missing thumbs, warped joints, floating limbs, distorted face
```

### Anatomy-Specific Positive Prompts

Add when hands or faces are prominent:
```
five fingers on each hand, thumb visible, natural knuckle spacing, index finger and middle finger separated
```

---

## Repair Strategy: Branching (Not Chaining)

When anatomy errors occur in generated output:

1. **Save the clean base image** (the best overall composition before errors)
2. **Branch for each fix** — start each correction from the clean base, NOT from a previously edited version
3. **One fix per edit** — don't fix eyes and hands in the same pass
4. **Target, don't re-roll** — isolate the problem area, keep everything else

**Why branching:** Chained edits (edit → edit → edit) cause cumulative quality degradation. Branching from the clean base preserves quality.

---

## DO / DON'T Quick Reference

| DO | DON'T |
|---|---|
| Use landmarks and relative positions | Use "left" or "right" in prompts |
| Keep hands simple and visible | Stack complex hand poses or props |
| Use camera-centric terms per model | Assume text overrides reference images |
| Branch repairs from clean base | Chain multiple edits sequentially |
| Add anatomy negative prompts | Rely on model to get anatomy right by default |
| Use correctly-posed reference images | Fight spatial errors with more text |
