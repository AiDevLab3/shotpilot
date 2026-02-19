# 🧪 Validation Test Results: KB vs Raw Prompts

**Date:** 2026-02-19
**Brief:** "A cinematic 21:9 wide shot of a lone figure standing at the edge of a rain-soaked rooftop at night. The city sprawls below, neon signs reflecting in puddles. The figure wears a long dark coat, facing away from camera. Moody, atmospheric, neo-noir aesthetic. Think Blade Runner meets Se7en."

## Scoring Matrix

| Model | Prompt | Gemini Flash | Gemini Pro | GPT-4o | **Consensus** |
|-------|--------|-------------|-----------|--------|--------------|
| nano-banana-pro | KB | 92 | 92 | 92 | **92** |
| nano-banana-pro | RAW | 92 | 95 | 92 | **93** |
| gpt-image-1.5 | KB | 88 | 88 | 92 | **89.3** |
| gpt-image-1.5 | RAW | 92 | 93 | 92 | **92.3** |
| grok-imagine | KB | 78 | 70 | 92 | **80** |
| grok-imagine | RAW | 78 | 78 | 92 | **82.7** |
| ideogram | KB | 72 | 72 | 92 | **78.7** |
| ideogram | RAW | 72 | 68 | 85 | **75** |

## KB Lift Analysis

| Model | KB Score | Raw Score | **KB Lift** |
|-------|---------|----------|------------|
| nano-banana-pro | 92 | 93 | **-1** 📉 |
| gpt-image-1.5 | 89.3 | 92.3 | **-3** 📉 |
| grok-imagine | 80 | 82.7 | **-2.7** 📉 |
| ideogram | 78.7 | 75 | **+3.7** 📈 |
| **Average** | | | **-0.8** |

## Auditor Agreement Analysis

- **nano-banana-pro [KB]**: strong agreement (spread: 0)
- **nano-banana-pro [RAW]**: strong agreement (spread: 3)
- **gpt-image-1.5 [KB]**: strong agreement (spread: 4)
- **gpt-image-1.5 [RAW]**: strong agreement (spread: 1)
- **grok-imagine [KB]**: weak agreement (spread: 22)
  - Highest: gpt (92), Lowest: gemini_pro (70)
- **grok-imagine [RAW]**: moderate agreement (spread: 14)
- **ideogram [KB]**: moderate agreement (spread: 20)
  - Highest: gpt (92), Lowest: gemini_pro (72)
- **ideogram [RAW]**: moderate agreement (spread: 17)
  - Highest: gpt (85), Lowest: gemini_pro (68)

## Dimension Averages (Consensus)

| Model | Type | Comp | Light | Color | Real | Mood | Brief |
|-------|------|------|-------|-------|------|------|-------|
| nano-banana-pro | KB | 9 | 9 | 9.3 | 8 | 10 | 10 |
| nano-banana-pro | RAW | 9 | 9 | 9.3 | 8 | 10 | 9.7 |
| gpt-image-1.5 | KB | 8.7 | 8.7 | 8.7 | 8 | 10 | 9 |
| gpt-image-1.5 | RAW | 9 | 9 | 9.3 | 8 | 10 | 10 |
| grok-imagine | KB | 7.7 | 8.3 | 8.7 | 6.7 | 9.3 | 7.3 |
| grok-imagine | RAW | 8 | 9 | 9 | 7 | 9.3 | 7.3 |
| ideogram | KB | 7.3 | 8.7 | 9 | 7.7 | 9.7 | 6.3 |
| ideogram | RAW | 7.3 | 8 | 8.3 | 7.7 | 9 | 6 |

## Conclusions

*Auto-generated — review and update manually.*

- ❌ **KB shows no clear benefit** (avg -0.8 points) — investigate prompt compiler.