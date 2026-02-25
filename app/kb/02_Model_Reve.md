# Reve

> **Official Model Name:** Reve (Edit, Remix, Fast Edit, Fast Remix) | **Developer:** fal.ai
> **Type:** IMAGE editing and transformation | **Last Updated:** 2026-02-19 | Source: reve/Prompting_Mastery.md

## Model Overview
- **Type:** IMAGE editing and transformation (not generation from scratch)
- **Engine:** Natural language image editor with 4 variants
- **Specialty:** Edit existing images or remix references using plain English descriptions
- **Use in ShotPilot:** Quick image adjustments, product variations, style transfer, A/B testing

## Model Variants

| Variant | Purpose | Cost | Speed |
|---|---|---|---|
| **Reve Edit** | Modify images, preserve composition | $0.04 | Standard |
| **Reve Fast Edit** | Rapid iteration for testing | $0.02 | 2x faster |
| **Reve Remix** | Reimagine scene from reference | $0.04 | Standard |
| **Reve Fast Remix** | Quick creative reinterpretation | $0.02 | 2x faster |

## Key Differentiators
- Natural language control — describe edits conversationally
- Context-aware — understands spatial relationships automatically
- No preprocessing — no masking, layering, or manual selection
- Batch variations — up to 4 edited versions per request
- Format flexibility — PNG, JPEG, WebP output
- Direct URL or base64 image input

## Golden Rules

### Rule 1: Be Specific About What Changes
- BAD: "make it better"
- GOOD: "Change the car color from red to matte black, keep everything else the same"

### Rule 2: Edit vs Remix — Choose Wisely
- **Edit** = surgical changes to existing image (color swap, object add/remove, background change)
- **Remix** = creative reinterpretation (style transfer, scene reimagining, conceptual variation)

### Rule 3: Use Fast Variants for Exploration
Fast Edit/Remix at $0.02 for rapid iteration. Switch to standard for final quality.

### Rule 4: Reference What to Preserve
"Keep the subject's pose and expression exactly the same, only change the background to a tropical beach at sunset"

## Prompt Structure

### For Edit
```
[CHANGE]: What to modify (be specific)
[PRESERVE]: What to keep the same
[STYLE]: Any aesthetic adjustments
```

### For Remix
```
[REFERENCE]: What to take from the source
[TRANSFORM]: How to reimagine it
[STYLE]: Target aesthetic
```

### Edit Example
```
Change the background from an office to a cozy coffee shop with warm lighting. Keep the person's face, expression, and clothing exactly the same. Add soft bokeh in the background with warm amber tones.
```

### Remix Example
```
Reimagine this portrait as a Renaissance oil painting. Keep the subject's pose and facial features but render in the style of Vermeer — soft directional window light, rich earth tones, subtle chiaroscuro.
```

## Use Cases

| Use Case | Variant | Example |
|---|---|---|
| Product color variants | Edit | "Change dress color from blue to emerald green" |
| Seasonal adaptation | Edit | "Transform the background to winter with snow" |
| A/B testing | Fast Edit | Generate 4 background variations for ad testing |
| Style exploration | Remix | "Reimagine as anime / oil painting / noir" |
| Localization | Edit | "Replace English signage with Japanese text" |
| Background swap | Edit | "Replace office with outdoor terrace, match lighting" |

## Common Mistakes & Fixes

| Mistake | Fix |
|---|---|
| Vague edit instructions | Be surgical: exactly what changes, what stays |
| Using Edit when Remix is better | Edit = targeted change; Remix = creative reinterpretation |
| Not specifying preservation | Always state what to keep: "preserve face, pose, clothing" |
| Expecting generation from scratch | Reve needs a source image — it's an editor, not a generator |
| Paying premium for exploration | Use Fast variants for iteration, standard for finals |

## Known Limitations
- Requires source image — cannot generate from text alone
- Complex structural changes may produce artifacts
- Text editing in images limited
- Very fine detail edits may not be precise
- Color matching across multiple edits may drift

## Cross-Model Translation
- **From Nano Banana Pro:** Use Reve for quick edits on generated images
- **From FLUX.2:** Use Reve Edit for post-generation color/style adjustments
- **To Topaz:** Send Reve output to Topaz for upscaling

## Quick Reference
```
EDIT: [What to change] + [What to preserve] + [Style notes]
REMIX: [Reference elements] + [Transformation direction] + [Target style]
Use Fast variants ($0.02) for iteration, Standard ($0.04) for finals
Up to 4 variations per request for A/B testing
```
