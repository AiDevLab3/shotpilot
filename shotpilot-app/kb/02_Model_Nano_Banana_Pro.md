# Nano Banana Pro

> **Official Model Name:** Gemini 3 Pro Image | **ShotPilot Display Name:** Nano Banana Pro
> These are the same model. All references to "Nano Banana Pro" in this knowledge base refer to Gemini 3 Pro Image.
> Last Updated: 2026-02-08 | Source: nano_banana_pro_prompting_mastery_guide.md

## Model Overview
- **Type:** IMAGE generation (still images only, no video)
- **Engine:** Gemini 3 Pro Image ("Thinking" model — reasons about intent, physics, composition)
- **Resolution:** Native 1K / 2K / 4K output
- **Use in ShotPilot:** Hero Frame generation, reference images, storyboard panels

## Key Differentiators
- SOTA text rendering in 100+ languages
- Up to 14 reference images (6 with high fidelity)
- Google Search grounding for real-time data
- Conversational editing (edit existing image, never re-roll from scratch)
- Advanced reasoning - understands context, physics, spatial relationships

## Golden Rules

### Rule 1: Edit, Don't Re-roll
If image is 80%+ correct, request specific changes instead of regenerating. Model maintains context and applies surgical edits.

### Rule 2: Natural Language, Not Tag Soup
- BAD: `cool car, neon, city, night, 8k, realistic, cinematic`
- GOOD: "A cinematic wide shot of a futuristic sports car speeding through a rainy Tokyo street at night. Neon signs reflect off the wet pavement. Shot with anamorphic lens, shallow depth of field."

### Rule 3: Be Specific and Descriptive
- BAD: "a woman"
- GOOD: "a sophisticated elderly woman wearing a vintage Chanel-style suit with pearl earrings"
- Describe textures: "matte finish," "brushed steel," "soft velvet," "weathered wood"
- Specify surfaces: "glossy," "reflective," "translucent," "opaque"

### Rule 4: Provide Context
Give purpose/audience so the model can infer artistic decisions.
- "Create an image of a gourmet sandwich for a Brazilian high-end cookbook" --> model infers: professional food styling, shallow DOF, studio lighting, premium plating

## 6-Variable Framework

| Variable | Question | Examples |
|---|---|---|
| **Subject** | Who/what is in the image? | Hyper-specific identity, appearance, characteristics |
| **Composition** | How is the camera positioned? | Extreme close-up, wide shot, low-angle, high-angle, isometric, fisheye |
| **Action** | What movement/energy exists? | "Leaping across a rooftop gap mid-stride" |
| **Location** | Where does the scene take place? | "A neon-lit Tokyo back alley with rain-soaked pavement" |
| **Style** | What artistic medium/aesthetic? | Photorealistic (ARRI Alexa), 3D animation (Pixar), film noir, vintage photography |
| **Mood/Lighting** | Emotional tone and light quality? | Golden hour, blue hour, harsh midday, overcast, studio, volumetric fog |

## Aspect Ratios
- Portrait: 9:16, 2:3, 4:5
- Landscape: 16:9, 3:2, 21:9 (cinematic)
- Square: 1:1
- Always state explicitly: "A 9:16 vertical poster featuring..." or "A cinematic 21:9 wide shot of..."

## Advanced Techniques

### Camera & Lighting Details
Simulate physical photography with technical parameters:
- Camera: "Shot on ARRI Alexa 35 with Cooke S4 85mm lens, f/1.4 aperture"
- Macro: "Macro lens at f/2.8, focus on texture, soft bokeh background"
- Wide: "Wide-angle 24mm lens, f/11 for deep focus"
- Lighting: "Three-point lighting with key light at 45 degrees" / "Golden hour backlighting creating rim light" / "Volumetric fog with god rays"

### Text Integration (SOTA)
- Use double quotes to isolate text strings: `"URBAN EXPLORER"`
- Specify font family: "bold sans-serif," "elegant serif," "hand-drawn brush script"
- Define placement: "top center," "bottom third," "overlaid on subject"
- Specify effects: "white outline with drop shadow," "neon glow," "embossed 3D"

### Reference Inputs (Multi-Image)
- Up to 14 reference images (6 high-fidelity)
- Use cases: identity locking, style transfer, image blending, brand consistency
- Assign roles: "Use Image 1 for facial features (keep exact). Use Image 2 for art style. Use Image 3 for background."
- Weight control: "Apply 80% influence from Image 1, 20% from Image 2"

## Professional Workflows Summary

| Workflow | Key Capability |
|---|---|
| Text & Infographics | Compress PDFs to visual aids, multi-language, data visualization |
| Character Consistency | Identity locking with refs, multi-character group shots |
| Google Search Grounding | Real-time data (stocks, news, trends) - always verify accuracy |
| Editing & Restoration | Object removal, colorization, localization, seasonal transforms - use semantic instructions, no manual masking |
| Dimensional Translation | 2D floor plans to 3D renders, 2D to 3D conversion |
| Storyboarding | Multi-panel storyboards in single image, specify panel count/layout/shot types |
| Structural Control | Coordinate-level positioning, layout grids, relative positioning |

## Common Mistakes & Fixes

| Mistake | Why It Fails | Fix |
|---|---|---|
| Tag soup prompts | No context or narrative for thinking model | Use full natural language sentences |
| Regenerating instead of editing | Wastes credits, loses good elements | Conversational edit: "change car color to matte black" |
| Vague subject descriptions | Generic stock-photo results | Hyper-specific identity, style, context |
| "Make it cinematic" (no specs) | Subjective, model needs technical direction | Specify camera, lens, aperture, aspect ratio, lighting |
| No context provided | Model cannot infer purpose/audience | State who/why/where: "for a high-end cookbook" |
| Expecting perfect text first try | Text rendering needs explicit instructions | Double quotes, font, placement, effects |
| Trusting factual data blindly | Model can hallucinate statistics/data | Always verify; use Google Search grounding |

## Known Limitations
- Small text and fine details may not render perfectly - use larger sizes
- Data in infographics can be hallucinated - always verify
- Multilingual text may have grammar issues - native speaker review recommended
- Complex edits can produce artifacts - make incremental changes
- Character consistency may vary across edits - use high-quality refs, state "keep features exactly the same"

## Hero Frame Integration
1. Generate 20-30 variations using different prompts
2. Select the ONE perfect frame that looks cinematic as a still
3. Lock the seed for consistency across shots
4. Use as reference for video generation in VEO 3.1, Kling 2.6, or Higgsfield

## Cross-Model Translation
- **To Midjourney:** Remove camera specs, add MJ parameters (--ar, --style, --v 7), simplify to descriptive phrases
- **To Higgsfield:** Extract camera/lens/focal/aperture specs, use Cinema Studio UI dropdowns

## Quick Reference Prompt Template

```
[SUBJECT]: Specific description of who/what
[COMPOSITION]: Camera angle, framing, aspect ratio
[ACTION]: What is happening, movement, energy
[LOCATION]: Where the scene takes place, atmosphere
[STYLE]: Artistic medium, aesthetic, reference
[CAMERA]: Technical specs - camera, lens, aperture
[LIGHTING]: Light quality, direction, mood
[TEXT]: "Exact text in quotes" in [font style] at [placement]
[MOOD]: Emotional tone, color grading
```
