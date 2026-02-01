# Model Selection Guide

**Version:** 2.0  
**Last Updated:** January 31, 2026  
**Coverage:** 18 AI Generation Models (11 Image + 7 Video)

---

## 🎯 The "Model Exhaustion" Protocol

### Philosophy: Single-Model Success Standard

To maintain maximum **character consistency** and **style coherence**, Cine-AI prioritizes staying within a single model for the entire workflow (Stills → Video). Premature model pivots fragment visual identity and introduce unnecessary translation layers.

---

### The 3-Strike Rule (Physics & Identity Fail-Safe)

Agents must **exhaust the primary model** before suggesting a pivot to external tools.

**Strike 1: Initial Attempt**
- Execute the hardware-informed prompt with full technical specifications
- Use the model's native syntax and recommended parameters
- Document any artifacts or failures

**Strike 2: Correction Pass**
- If artifacts appear (e.g., "unmotivated blue glow," soft faces, physics errors):
  - Apply **negative constraints** (e.g., "no blue rim light," "no CGI sheen")
  - Add **strict lighting motivation** (e.g., "single practical source: desk lamp, camera left")
  - Increase technical descriptor density

**Strike 3: Final Override**
- Force a physics-correct re-render with the most aggressive technical language
- Use **Gaffer-Agent audit** to identify specific physics violations
- Apply maximum prompt weight to realism constraints

**The Pivot Decision**
- **Only after Strike 3 fails** does the Chief of Staff initiate an "Optical Translation" to a specialized secondary rig
- The pivot must be **justified** with specific technical reasons (not aesthetic preferences)

---

### The "90/10" Translation Layer

When a pivot becomes necessary, agents must **NOT simply copy-paste the prompt**.

**Translation Protocol:**
1. **Identify the 90% Success**: What worked in the previous model? (composition, soul, lighting intent)
2. **Diagnose the 10% Failure**: What specific technical issue forced the pivot? (physics error, identity drift, motion artifacts)
3. **Translate, Don't Transfer**: Rewrite the prompt in the new model's native syntax, preserving the successful 90% while addressing the failure point
4. **Metadata Handoff**: Pass critical parameters (focal length, aperture, lighting ratios) to maintain optical consistency

**Example:**
- **Imagen 3 (90% Success)**: Achieved perfect character identity and composition
- **10% Failure**: Unmotivated blue rim lighting persists after 3 strikes
- **Pivot to Higgsfield**: Translate composition and identity descriptors while adding physics-first lighting constraints specific to Higgsfield's syntax

---

## Executive Summary

This guide provides a comprehensive framework for selecting the optimal AI generation model based on your specific needs, constraints, and creative goals. With **10 image models** and **11 video models** now available, making the right choice requires understanding each model's strengths, limitations, and ideal use cases.

**Key Principle**: Exhaust your primary model before pivoting. Consistency beats perfection.

---

## Quick Selection Matrix

### Image Generation Models

| Model | Best For | Key Strength | Speed | Quality | Cost |
|-------|----------|--------------|-------|---------|------|
| **Nano Banana Pro** | Text rendering, 4K output | Best-in-class text | Fast | Excellent | Medium |
| **GPT Image 1.5** | Natural language, iterations | Conversational prompting | Fast | Very Good | Low |
| **Seedream 4.5** | Typography, professional design | 4K + text rendering | Medium | Excellent | Medium |
| **FLUX.2** | Precise control, developers | JSON structured prompts | Fast | Excellent | Medium |
| **Z-Image** | Portraits, bilingual text | Instant lifelike faces | Very Fast | Very Good | Low |
| **Kling O1 Image** | Photorealism, accuracy | Prompt-accurate output | Medium | Excellent | Medium |
| **Kling 2.6 Image** | Image-to-video prep | Motion-ready composition | Fast | Very Good | Low |
| **Seedance 1.5 Pro** | Unified image-video | Seamless I2V workflow | Medium | Excellent | Medium |
| **Wan 2.2 Image** | Human details, portraits | Detailed human rendering | Fast | Very Good | Low |
| **Reve** | Image editing | Natural language editing | Fast | Good | Low |
| **Topaz** | Upscaling, enhancement | AI-powered upscaling | Medium | Excellent | Medium |

### Video Generation Models

| Model | Best For | Key Strength | Duration | Quality | Cost |
|-------|----------|--------------|----------|---------|------|
| **Veo 3.1** | Cinematic video + audio | Native audio generation | 8s | Excellent | High |
| **Sora 2** | Extended duration, complex | Advanced scene understanding | 20s | Excellent | High |
| **Kling O1 Edit** | Multimodal generation | Unified I2V + V2V | 10s | Excellent | Medium |
| **Kling Motion Control** | Character motion | Precision motion transfer | 10s | Very Good | Medium |
| **Wan 2.6** | Flexible workflows | Three generation modes | 10s | Very Good | Medium |
| **Minimax Hailuo 02** | Cinematic quality | Professional output | 6s | Excellent | Medium |
| **Kling Avatars 2.0** | Talking avatars | 5-min consistency | 5min | Very Good | Medium |

---

## Decision Tree

### Step 1: Have you exhausted your primary model?

**If NO**: Return to Strike 2 or Strike 3 before considering a pivot.

**If YES (3 strikes completed)**: Proceed to model selection based on the specific failure type:
- **Identity Drift**: Consider Midjourney v6.1 or Z-Image for face lock
- **Physics Errors**: Consider Higgsfield v1.5 for optical realism
- **Motion Artifacts**: Consider Kling Motion Control or Wan 2.6

### Step 2: Image or Video?
