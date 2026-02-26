# Quality Control Pack

## Purpose
Identify, troubleshoot, and fix common issues in AI-generated images and video to achieve professional production quality. Use this pack to audit every shot before marking it "complete."

---

## Shot Completeness Scoring

### Critical Fields (weight 10) — Must be filled
- **Shot Description** — What happens in the shot; specific action, subject, emotion
- **Shot Type** — Wide, Medium, Close-up, Extreme Close-up, etc.
- **Camera Angle** — Eye Level, Low Angle, High Angle, Dutch, Bird's Eye, Over-the-Shoulder

### Important Fields (weight 7) — Strongly recommended
- **Camera Movement** — Static, Pan, Tilt, Dolly, Handheld, Orbit
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

## Common AI Artifacts

| Artifact | Description | Likely Cause | Fix |
|---|---|---|---|
| **AI Sheen** | Overly crisp, plastic, HDR-glow look | Kill-switch terms in prompt ("hyper detailed," "8K") | Remove killer terms; add filmic tonality + grain; specify motivated lighting |
| **Flickering** | Rapid inconsistent changes in light, color, texture | Conflicting style prompts; no lighting lock | Define scene-level lighting lock; same source/direction/quality across shots |
| **Morphing** | Characters or objects transform mid-shot | Vague prompts; long generation; no reference image | Use frame-to-frame chaining; anchor with reference image; shorter clips |
| **Jitter** | Shaky or unstable camera movement | Complex motion prompts; multiple simultaneous moves | ONE camera movement per generation; simplify to dominant move only |
| **Identity Drift** | Character appearance changes between shots | No character reference; inconsistent descriptions | Use Character Bible + master reference image; frame chaining |
| **Inconsistent Style** | Visual style shifts between shots | No style lock; different models without translation | Lock Master Look across project; use Translation Matrix when switching models |
| **Flat/Lifeless Image** | No depth, atmosphere, or visual interest | No directional light; no contrast; no atmosphere | Specify key light direction + quality; add negative space; add subtle haze |
| **Uncanny Valley** | Almost-human faces that feel wrong | Imperfect facial generation; micro-expression issues | Neutral starting expression; tight facial descriptors; high-quality reference |

---

## Iterative Refinement Loop

1. **Isolate** — Identify the specific artifact or issue
2. **Simplify** — Remove all but the most essential prompt elements
3. **Adjust One Variable** — Change ONE element (camera, motion, subject, lighting) and regenerate
4. **Compare** — Analyze new output against previous: improved or worsened?
5. **Repeat** — Continue until root cause is isolated and resolved

**Rule:** Never change more than one variable per iteration. Stacking changes makes it impossible to identify what helped.

---

## Model-Specific Troubleshooting

| Model | Common Issue | Fix |
|---|---|---|
| **VEO 3.1** | Character consistency problems | Use "Ingredients to Video" with high-quality reference images; limit to 3 references |
| **Kling 2.6** | Physics-related issues (floating, clipping) | Rephrase prompt to be explicit about physical interactions; simpler poses |
| **Higgsfield Cinema Studio** | Overly static / "posed" feeling | Specify subtle motion cues; use hero frame + animate workflow |
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
5. **Frame chain** — Download last frame of previous shot; upload as reference for next

---

## Post-Production Fixes

| Problem | Fix |
|---|---|
| Flickering | De-flicker plugin in editing software |
| Jitter | Warp stabilizer effect |
| Inconsistent color | Match color grade to Master Look reference frame |
| Style drift | Re-grade to first approved shot's color/contrast |

---

## Quality Control Checklist

### Visual Audit
- [ ] Style consistent across all shots in scene
- [ ] No distracting artifacts (flickering, morphing, jitter, AI sheen)
- [ ] Character identity consistent (face, hair, wardrobe, build)
- [ ] Lighting motivated and consistent within scene
- [ ] Color grading matches Master Look
- [ ] Composition follows intended framing (rule of thirds, leading lines)
- [ ] Entropy appropriate (not too clean, not too grungy)

### Technical Audit
- [ ] Resolution sufficient for intended output
- [ ] Aspect ratio correct for delivery format
- [ ] No generation artifacts at edges or borders
- [ ] Text (if any) renders correctly and is readable

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
