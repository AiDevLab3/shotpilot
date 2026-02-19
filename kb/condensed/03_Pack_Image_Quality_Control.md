# Image Quality Control Pack

## Purpose
Identify, troubleshoot, and fix common issues in AI-generated **images** to achieve professional production quality. Use this pack to audit every image before marking it "complete."

---

## Shot Completeness Scoring

### Critical Fields (weight 10) — Must be filled
- **Shot Description** — What happens in the shot; specific action, subject, emotion
- **Shot Type** — Wide, Medium, Close-up, Extreme Close-up, etc.
- **Camera Angle** — Eye Level, Low Angle, High Angle, Dutch, Bird's Eye, Over-the-Shoulder

### Important Fields (weight 7) — Strongly recommended
- **Scene Lighting** — Motivated light source, direction, quality, contrast, fill
- **Scene Mood/Tone** — Emotional feeling guiding all creative decisions
- **Project Style** — Overall aesthetic (noir, naturalistic, stylized, etc.)

### Supporting Fields (weight 3-5) — Improve quality
- **Focal Length** — Affects perspective compression and field of view
- **Camera/Lens** — Specific lens character (Cooke warmth vs. Zeiss sharpness)
- **Scene Location** — Where the scene takes place
- **Time of Day** — Affects natural lighting motivation
- **Blocking** — Subject positioning and movement choreography

### Tier Classification
- **Production tier** (≥70%): All critical fields + most important fields filled. Ready for prompt generation.
- **Draft tier** (<70%): Missing critical or important fields. Recommendations needed before generation.

---

## Common Image Artifacts

| Artifact | Description | Likely Cause | Fix |
|---|---|---|---|
| **AI Sheen** | Overly crisp, plastic, HDR-glow look | Kill-switch terms in prompt ("hyper detailed," "8K") | Remove killer terms; add filmic tonality + grain; specify motivated lighting |
| **Identity Drift** | Character appearance changes between shots | No character reference; inconsistent descriptions | Use Character Bible + master reference image; consistent descriptors every prompt |
| **Inconsistent Style** | Visual style shifts between shots | No style lock; different models without translation | Lock Master Look across project; use Translation Matrix when switching models |
| **Flat/Lifeless Image** | No depth, atmosphere, or visual interest | No directional light; no contrast; no atmosphere | Specify key light direction + quality; add negative space; add subtle haze |
| **Uncanny Valley** | Almost-human faces that feel wrong | Imperfect facial generation; micro-expression issues | Neutral starting expression; tight facial descriptors; high-quality reference |
| **Extra/Missing Limbs** | Wrong number of fingers, hands, arms | Complex poses; multiple subjects interacting | Simplify pose; specify exact hand/finger positioning; use reference image |
| **Text Rendering Issues** | Garbled, misspelled, or floating text | Most models struggle with text generation | Use models with strong text support (GPT Image 1.5); spell out text explicitly |
| **Background Incoherence** | Nonsensical or inconsistent background elements | Model filling in details without guidance | Describe background explicitly; specify environment details |
| **Scale Inconsistency** | Objects or people at wrong relative sizes | Missing spatial context in prompt | Specify relative positions and sizes; use composition references |

---

## Iterative Refinement Loop

1. **Isolate** — Identify the specific artifact or issue
2. **Simplify** — Remove all but the most essential prompt elements
3. **Adjust One Variable** — Change ONE element (composition, subject, lighting, style) and regenerate
4. **Compare** — Analyze new output against previous: improved or worsened?
5. **Repeat** — Continue until root cause is isolated and resolved

**Rule:** Never change more than one variable per iteration. Stacking changes makes it impossible to identify what helped.

---

## Model-Specific Image Troubleshooting

| Model | Common Issue | Fix |
|---|---|---|
| **Midjourney** | Artistic drift from realism | Use `--style raw`; lower `--s` value (100-250); specify camera/lens |
| **GPT Image 1.5** | Iterative drift over edits | Reset to reference image periodically; explicit facial descriptors each edit |
| **Nano Banana Pro** | Generic stock-photo look | Use full 6-variable framework; provide context/purpose; avoid tag-soup prompts |

---

## Color Continuity Rules

| Rule | Description |
|---|---|
| **Lock Color Palette** | Define 3-5 dominant colors per project; reference in every prompt |
| **Scene-Level Grading** | Same color temperature + contrast ratio across all shots in a scene |
| **Motivated Color Shifts** | Only change palette for narrative reasons (day→night, mood shift) |
| **Reference Master Look** | First approved shot sets the color standard; grade all subsequent to match |
| **Cross-Model Consistency** | When switching models, use Translation Matrix to maintain color language |

---

## Prompt Debugging Framework

### If output looks wrong:
1. **Check for kill-switch terms** — Remove "hyper detailed," "8K," "masterpiece," "ultra sharp," "cinematic HDR"
2. **Check lighting motivation** — Every light must have a real-world source; no "perfect studio lighting"
3. **Check lens specification** — Pick ONE lens and ONE aperture; never stack camera brands
4. **Check negative prompts** — Include Universal Negative Pack; model-specific additions as needed
5. **Check entropy** — Add controlled imperfections (grain, wear, texture) appropriate to scene
6. **Check character anchoring** — Reference image attached? Name used (not "a person")? Bible descriptors included?

### If output is inconsistent across shots:
1. **Verify scene lighting lock** — Same source + direction + quality + contrast across all shots
2. **Verify character reference** — Same master reference used; descriptors match Bible
3. **Verify style lock** — Realism Lock Block included; same tonality keywords
4. **Verify model translation** — If switching models, Translation Matrix applied correctly

---

## Quality Control Checklist

### Visual Audit
- [ ] Style consistent across all shots in scene
- [ ] No distracting artifacts (AI sheen, extra limbs, uncanny valley)
- [ ] Character identity consistent (face, hair, wardrobe, build)
- [ ] Lighting motivated and consistent within scene
- [ ] Color grading matches Master Look
- [ ] Composition follows intended framing (rule of thirds, leading lines)
- [ ] Entropy appropriate (not too clean, not too grungy)
- [ ] Background coherent and consistent with scene description

### Technical Audit
- [ ] Resolution sufficient for intended output
- [ ] Aspect ratio correct for delivery format
- [ ] No generation artifacts at edges or borders
- [ ] Text (if any) renders correctly and is readable
- [ ] Depth of field appropriate for specified lens/focal length
- [ ] No unintended cropping of subjects

### Narrative Audit
- [ ] Shot supports the story beat it was designed for
- [ ] Emotional tone matches scene mood
- [ ] Character expressions match narrative context
- [ ] Continuity maintained with adjacent shots (wardrobe, props, time of day)

---

## Decision Tree: Quality Check Result

```
IF completeness >= 70%:
  → Production tier
  → Ready for prompt generation
  → Proceed to model selection

IF completeness 40-69%:
  → Draft tier
  → Show AI recommendations for missing fields
  → User accepts/edits recommendations → re-check

IF completeness < 40%:
  → Incomplete
  → Require critical fields (description, type, angle) before proceeding
  → Block prompt generation until minimum viable context exists
```
