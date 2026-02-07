# Core Realism Principles

## REALISM_LOCK_BLOCK (Inject Into Every Realism Prompt)

```
cinematic still frame, raw photographed realism, captured through a physical lens
natural depth of field, realistic highlight rolloff, subtle filmic grain
physically plausible lighting and shadows, realistic skin texture (no plastic)
imperfect real-world entropy: mild wear, micro-scratches, natural variation
avoid AI sheen, avoid HDR/glow, avoid sterile symmetry
```

## Universal Negative Pack (Default Exclusion List)

```
no CGI, no render, no plastic skin, no waxy texture, no hyper-detailed, no oversharpened,
no HDR, no perfect symmetry, no airbrushed skin, no unnatural bokeh, no glossy surfaces,
no fake volumetrics, no surreal glow, no uncanny valley, no deformed anatomy,
no extra fingers, no bad hands, no text artifacts, no watermark, no jpeg artifacts
```

---

## AI Sheen Symptoms (Detect and Fix)

Flag the image as synthetic if ANY of these appear:
- Overly crisp micro-contrast (everything looks etched)
- HDR glow / haloing around edges
- Plastic or waxy skin texture
- Perfectly clean gradients (no natural noise)
- Sterile symmetry and overly perfect composition
- Unrealistic bokeh or "fake lens blur"
- Volumetrics that look like smoke simulation instead of atmosphere
- Lighting with no motivated source (flat studio fill everywhere)
- Surfaces too glossy, too clean, too new

---

## Lens Defaults

Pick ONE lens and ONE aperture. Never stack camera brands.

| Shot Type | Lens | Aperture | Notes |
|---|---|---|---|
| Portrait / Dialogue | 35mm or 50mm | f/2.8 - f/5.6 | Natural facial proportions; avoid wafer-thin DOF unless motivated |
| Environment / Architecture | 24mm - 35mm | f/8 - f/11 | Deep focus, spatial clarity |
| Close Detail / Insert | 85mm | f/2.8 - f/4 | Background separation; use sparingly (can look "beauty ad") |
| Documentary Grit | 35mm - 50mm | f/4 - f/8 | Less beauty blur |

**Focus behavior keywords:** "natural focus falloff," "subtle lens breathing," "no over-sharpening"

---

## Lighting Motivation Rules (Non-Negotiable)

Every prompt MUST specify all 5:

1. **Source** - What creates the light (window daylight, tungsten practical, neon sign, streetlight, overcast skylight, overhead fluorescent)
2. **Direction** - Where it hits from (camera-left, camera-right, top-down, backlight, side light, frame-left 35 degrees)
3. **Quality** - How it feels (soft diffused, hard specular)
4. **Contrast** - How it falls off (soft rolloff, hard shadow edge, high contrast noir, gentle fill)
5. **Fill** - Secondary illumination (minimal fill, bounce fill, no fill)

**Rule: If lighting is not motivated, the output looks synthetic.**

Optional atmosphere interaction: subtle haze, dust in air, light fog, none

---

## Filmic Tonality Rules (Kill HDR / AI Sheen)

**Always include one of:**
- "filmic tone mapping"
- "soft highlight rolloff"
- "natural shadows with detail"
- "no HDR glow"
- "subtle grain"

**Never use these (they trigger AI sheen):**
- "cinematic HDR"
- "ultra vibrant"
- "extreme clarity"
- "8K clarity"
- "hyper detailed"

---

## Entropy / Imperfection Rules

Add controlled realism texture appropriate to scene:
- Scuffed edges, imperfect paint, worn fabric
- Fingerprints on glass, slight sensor noise / grain
- Wrinkled clothing, natural skin texture with pores
- Micro-scratches, dust, natural variation

**Constraint:** Do not overdo grime unless the story calls for it. Entropy must be subtle and motivated.

---

## 9-Component Prompt Template

Build prompts in this order:

### (1) Core Concept & Realism Anchor
```
Cinematic still photograph, raw realistic capture through a physical lens
```

### (2) Setting & Environment
- Time of day, location, weather, practical details
- Example: `Interior of a dimly lit diner booth at night, neon sign glow visible through rain-streaked window`

### (3) Subject
- Identity anchors + action + emotion
- Example: `A woman in her early 30s with shoulder-length dark hair, expression pensive and tired`

### (4) Wardrobe & Textures
- Fabric realism + wear level
- Example: `Scuffed leather jacket with visible wear on elbows, faded blue jeans, simple white t-shirt with slight wrinkles`

### (5) Camera Rig
- Lens + aperture + focus behavior
- Example: `Shot on 50mm lens at f/4, natural depth of field with subtle lens breathing, no over-sharpening`

### (6) Composition & Framing
- Shot type, camera height, blocking, negative space
- Example: `Medium close-up, camera at eye level, subject frame-left with negative space frame-right`

### (7) Lighting & Color
- Motivated source + direction + quality + contrast + color temperature
- Example: `Single warm practical lamp frame-right as key light at 35 degree angle, minimal fill, soft falloff into shadows, warm amber color temperature`

### (8) Filmic Tonality
- Highlight rolloff + grain + anti-HDR
- Example: `Filmic tone mapping, soft highlight rolloff, natural shadows with detail, subtle grain, realistic skin texture with slight imperfections, no HDR glow`

### (9) Negative Prompts
- Universal negative pack tailored per model
- Example: `Avoid: CGI, plastic skin, oversharpen, HDR glow, hyper detailed, 8K clarity, perfectly sharp, flawless skin`

---

## DO / DON'T Table

| Goal | DO | DON'T |
|---|---|---|
| Real film still | "raw photographed cinematic still" | "hyper detailed 8K masterpiece" |
| Natural skin | "subtle pores, natural texture" | "perfect smooth airbrushed skin" |
| Real lighting | "motivated key from window at 35 degrees" | "perfect studio lighting everywhere" |
| Cinematic depth | "natural depth of field, f/4" | "everything sharp front to back" |
| Kill AI sheen | "subtle grain, gentle rolloff" | "HDR glow, oversharpened edges" |
| Real surfaces | "scuffed edges, slight wear" | "pristine, flawless, immaculate" |
| Composition | "one primary subject hierarchy" | "everything centered, everything sharp" |
| Atmosphere | "subtle haze, airborne dust" | "fake volumetrics, smoke simulation" |
| Poses | "weight shifted, shoulders relaxed" | "perfect model pose, symmetrical stance" |
| Hands | Specify hands only when needed | Request detailed hand close-ups |

---

## Realism Kill Switch Terms (Ban List)

Remove ALL of these from any realism prompt:
- `hyper detailed`
- `ultra sharp` / `perfectly sharp`
- `8K clarity`
- `masterpiece` / `award-winning` / `epic`
- `perfect symmetry`
- `flawless skin` / `porcelain skin`
- `CGI` / `render` / `unreal engine` (unless intentionally stylized)
- `ultra crisp`
- `ultra vibrant`
- `extreme clarity`
- `cinematic HDR`

---

## Quick Troubleshooting

### Problem: "Too clean / AI plastic look"
- **Cause:** Kill-switch terms present ("hyper detailed," "8K," "perfect skin"); no entropy; unmotivated lighting
- **Fix:** Remove killer terms. Add filmic tonality + grain. Specify motivated lighting + falloff. Add subtle entropy (wear, scuffs, grain)

### Problem: "Flat / lifeless image"
- **Cause:** No directional light; no contrast ratio; no atmosphere depth cues
- **Fix:** Specify key light direction + quality. Add negative space and subject separation. Add subtle haze/dust if appropriate

### Problem: "Looks like CGI / game engine"
- **Cause:** Glossy highlights + perfect edges; too much micro-contrast; render-like background sharpness
- **Fix:** Soften tonality, add rolloff. Reduce global sharpness. Add subtle lens imperfections. Enforce photographic anchor language ("captured through a physical lens")

### Problem: "Lighting drifts between shots"
- **Cause:** Light direction and source not locked across shots
- **Fix:** Define scene-level lighting lock (source + direction + quality + contrast ratio). Treat lighting as canon within a scene. Change ONE variable at a time when iterating

---

## Core Principle

Realism = physics + hierarchy, NOT keyword density. "More detail" often makes it worse. Constrain optics, lighting, tonality, entropy, and continuity.
