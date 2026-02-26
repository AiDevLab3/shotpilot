# FLUX.2

> **Official Model Name:** FLUX.2 Family (max, pro, flex, klein) | **Developer:** Black Forest Labs
> **Type:** IMAGE generation | **Last Updated:** 2026-02-19 | Source: flux_2/Prompting_Mastery.md

## Model Overview
- **Type:** IMAGE generation (still images only, no video)
- **Engine:** FLUX.2 diffusion model family — multiple variants for different use cases
- **Resolution:** Up to 4MP (2048×2048)
- **Use in ShotPilot:** Hero Frame generation, product photography, typography, brand assets

## Model Variants

| Variant | Strengths | Best For |
|---|---|---|
| **FLUX.2 [max]** | Highest quality, best prompt following | Final production assets, client work |
| **FLUX.2 [pro]** | Balanced quality + speed, 4MP output | Professional workflows, commercial projects |
| **FLUX.2 [flex]** | Adjustable guidance (1.5-10) and steps (max 50) | Experimentation, aesthetic control |
| **FLUX.2 [klein]** | Sub-second inference, runs locally | Real-time apps, rapid prototyping |

## Key Differentiators
- JSON structured prompting for precise scene control
- Hex color precision (#FF5733) for exact brand matching
- Multi-reference editing (up to 8-10 reference images)
- Excellent typography and text rendering
- No negative prompts needed — describe what you want
- Multi-language support for native language prompting

## Golden Rules

### Rule 1: Use JSON for Complex Scenes
For multi-element scenes, JSON structured prompts give precise control over each element's position, color, and style.

### Rule 2: Natural Language for Simple Scenes
- BAD: `beautiful landscape, 8k, realistic, cinematic, masterpiece`
- GOOD: "A sweeping panoramic landscape of the Scottish Highlands at golden hour, with rolling green hills and a distant loch reflecting the warm sky. Shot with a wide-angle 24mm lens, f/11 for deep focus."

### Rule 3: Hex Colors for Brand Work
Specify exact colors: `"color": "#FF5733"` for precise brand matching. FLUX.2 interprets hex codes directly.

### Rule 4: No Negative Prompts
Unlike other models, FLUX.2 does NOT use negative prompts. Describe what you want, not what you don't.

## Prompt Structure

### Natural Language Format
```
[Style/Medium] + [Subject] + [Action/Pose] + [Setting/Background] + [Lighting/Mood] + [Camera/Lens]
```

### JSON Structured Format
```json
{
  "subject": "A professional chef in a modern kitchen",
  "style": "Commercial food photography, bright and clean",
  "lighting": "Soft diffused overhead lighting with fill from left",
  "camera": "Shot on Canon R5, 85mm f/1.8, shallow depth of field",
  "color_palette": ["#FFFFFF", "#E8D5B7", "#2C3E50"],
  "text": "SEASONAL MENU",
  "text_style": "Bold sans-serif, top center, white with subtle shadow"
}
```

## API Parameters

| Parameter | Values | Notes |
|---|---|---|
| **Seed** | Integer | Reproducible results |
| **Guidance** | 1.5-10 (flex only) | Prompt adherence strength, default 4.5 |
| **Steps** | 1-50 (flex only) | Quality vs speed tradeoff |
| **Prompt Upsampling** | Boolean | Auto-enhance prompt detail |
| **Image References** | Up to ~6-10 | For editing, style transfer |

## Camera & Lens Simulation
- Wide-angle: "14mm f/2.8 ultra-wide, architecture and landscapes"
- Portrait: "85mm f/1.4, creamy bokeh, studio portrait"
- Macro: "100mm f/2.8 macro, extreme close-up, shallow DOF"
- Cinematic: "Anamorphic lens, 2.39:1 aspect ratio, lens flare"

## Typography Best Practices
- Use double quotes for text: `"URBAN EXPLORER"`
- Specify font style: "bold sans-serif," "elegant script," "retro display"
- Define placement: "top center," "bottom third," "overlaid on subject"
- Specify effects: "white with drop shadow," "neon glow," "embossed"

## Common Mistakes & Fixes

| Mistake | Fix |
|---|---|
| Using negative prompts | Remove them — describe what you want |
| Tag soup (keyword lists) | Write natural language sentences |
| Vague color descriptions | Use hex codes for precision |
| Ignoring variant strengths | Use [max] for finals, [klein] for iteration |
| Overly long prompts | Keep focused — 2-4 sentences for natural, structured JSON for complex |
| Not using JSON for multi-element | Switch to JSON for scenes with 3+ distinct elements |

## Known Limitations
- No video generation capability
- Text rendering good but not perfect — verify spelling
- Complex multi-character interactions can be inconsistent
- Very long prompts may dilute focus
- [klein] trades quality for speed — use [max/pro] for finals

## Cross-Model Translation
- **To Nano Banana Pro:** Add camera/lens specs, expand to narrative sentences, add context/purpose
- **To Midjourney:** Simplify to descriptive phrases, add --ar, --style, --v parameters
- **To VEO 3.1:** Extract scene description, add camera movement, action, and audio cues

## Quick Reference Prompt Template
```
[SUBJECT]: Specific description
[STYLE]: Artistic medium, aesthetic
[COMPOSITION]: Framing, aspect ratio
[LIGHTING]: Light quality, direction
[CAMERA]: Lens, aperture, DOF
[COLORS]: Hex codes for key colors
[TEXT]: "Exact text" in font style at placement
[MOOD]: Emotional tone, atmosphere
```
