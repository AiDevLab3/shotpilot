# Cinematic Realism Master Prompt Template

**Version:** 1.0  
**Date:** February 2, 2026  
**Source:** [Cine-AI Cinematic Realism Pack v1](../packs/Cine-AI_Cinematic_Realism_Pack_v1.md)

This template demonstrates how to apply the principles from the Cinematic Realism Pack to create professional, filmic AI-generated imagery.

---

## Template Structure

A complete cinematic realism prompt should include these 9 components in order:

### **(1) Core Concept & Realism Anchor**
Start with language that forces the model into "captured" not "rendered" mode.

**Example:**
```
Cinematic still photograph, raw realistic capture through a physical lens
```

---

### **(2) Setting & Environment**
Describe time of day, location, weather, and practical details.

**Example:**
```
Interior of a dimly lit diner booth at night, neon sign glow visible through rain-streaked window
```

---

### **(3) Subject**
Define identity anchors, action, and emotion.

**Example:**
```
A woman in her early 30s with shoulder-length dark hair, wearing a worn leather jacket, 
eyes reflecting the practical lamp light, expression pensive and tired
```

---

### **(4) Wardrobe & Textures**
Specify fabric realism and wear level.

**Example:**
```
Scuffed leather jacket with visible wear on elbows, faded blue jeans, 
simple white t-shirt with slight wrinkles
```

---

### **(5) Camera Rig**
Define lens, aperture, and focus behavior.

**Example:**
```
Shot on 50mm lens at f/4, natural depth of field with subtle lens breathing, 
no over-sharpening
```

---

### **(6) Composition & Framing**
Specify shot type, camera height, blocking, and negative space.

**Example:**
```
Medium close-up, camera at eye level, subject frame-left with negative space frame-right, 
controlled composition with one primary subject hierarchy
```

---

### **(7) Lighting & Color**
Define motivated source, direction, quality, contrast, and color temperature.

**Example:**
```
Single warm practical lamp frame-right as key light at 35° angle, minimal fill, 
soft falloff into shadows, gentle contrast, warm amber color temperature (2700K)
```

---

### **(8) Filmic Tonality**
Specify highlight rolloff, grain, and avoid HDR sheen.

**Example:**
```
Filmic tone mapping, soft highlight rolloff, natural shadows with detail, 
subtle grain, realistic skin texture with slight imperfections, no HDR glow
```

---

### **(9) Negative Prompts**
Use the universal negative pack tailored to your model.

**Example:**
```
Avoid: CGI, 3D render, plastic skin, doll-like, waxy, oversharpened, overprocessed, 
HDR, surreal glow, uncanny valley, hyper detailed, 8K clarity, perfectly sharp, 
masterpiece, award-winning, flawless skin
```

---

## Complete Example Prompt

### Dialogue Close-Up (Diner Scene)

```
Cinematic still photograph, raw realistic capture through a physical lens.

Interior of a dimly lit diner booth at night, neon sign glow visible through 
rain-streaked window.

A woman in her early 30s with shoulder-length dark hair, wearing a worn leather 
jacket, eyes reflecting the practical lamp light, expression pensive and tired, 
shoulders relaxed.

Scuffed leather jacket with visible wear on elbows, faded blue jeans, simple 
white t-shirt with slight wrinkles.

Shot on 50mm lens at f/4, natural depth of field with subtle lens breathing, 
no over-sharpening.

Medium close-up, camera at eye level, subject frame-left with negative space 
frame-right, controlled composition.

Single warm practical lamp frame-right as key light at 35° angle, minimal fill, 
soft falloff into shadows, gentle contrast, warm amber color temperature.

Filmic tone mapping, soft highlight rolloff, natural shadows with detail, subtle 
grain, realistic skin texture with slight imperfections, no HDR glow.

Avoid: CGI, plastic skin, oversharpen, HDR glow, hyper detailed, 8K clarity, 
perfectly sharp, flawless skin.
```

---

## Model-Specific Adaptations

### For Higgsfield Cinema Studio v1.5
Keep optical metadata explicit and structured. Use the 6-block skeleton:
1. Scene intent
2. Camera rig (lens + aperture + focus + camera height)
3. Composition (framing + blocking)
4. Lighting (source + direction + quality + contrast)
5. Filmic tonality + texture
6. Negatives

### For Nano Banana Pro
Use structured framework with variables. Add "do not change X" lists for edits.
Emphasize negatives aggressively.

### For GPT Image 1.5
Speak like a director + cinematographer. Keep it concrete and compact.
Use natural language: "Cinematic still photograph of... Shot on... Lighting:... Tone:... Avoid:..."

### For Midjourney
Keep technical metadata lighter. Emphasize lighting + tonality + "photographed."
Use parameters to stabilize style when applicable.

---

## Customization Guidelines

### For Different Shot Types

**Wide Establishing Shot:**
- Lens: 28mm-35mm
- Aperture: f/8-f/11
- Add foreground elements for depth
- Specify atmospheric elements (haze, dust)

**Portrait/Dialogue:**
- Lens: 35mm-50mm
- Aperture: f/2.8-f/5.6
- Focus on motivated lighting
- Specify emotional state

**Tele Compression:**
- Lens: 85mm
- Aperture: f/2.8-f/4
- Use sparingly (can look "beauty ad")
- Emphasize background compression

---

## Common Mistakes to Avoid

❌ **Don't stack multiple camera brands**  
✅ Choose ONE lens and ONE aperture

❌ **Don't use "hyper detailed," "8K," "ultra sharp"**  
✅ Use "natural depth of field," "subtle grain," "realistic texture"

❌ **Don't describe lighting as "cinematic" without specifics**  
✅ Always specify source, direction, quality, contrast, and fill

❌ **Don't request "perfect" anything**  
✅ Add controlled imperfections (scuffs, wear, grain)

❌ **Don't use "cinematic HDR"**  
✅ Use "filmic tone mapping," "soft highlight rolloff"

---

## Related Resources

- **[Cinematic Realism Pack v1](../packs/Cine-AI_Cinematic_Realism_Pack_v1.md)** - Complete realism system
- **[Quality Control Pack v1](../packs/Cine-AI_Quality_Control_Pack_v1.md)** - Troubleshooting and refinement
- **[KB Master Index](../index/KB_MASTER_INDEX.md)** - Full knowledge base navigation

---

**Template Version:** 1.0  
**Last Updated:** February 2, 2026  
**Maintained by:** Cine-AI Knowledge Base Team
