# Reve Prompting Mastery Guide

**Model:** Reve (Advanced AI Image Editor + Transformer)  
**Developer:** fal.ai  
**Specialty:** Natural language image editing and transformation  
**Variants:** Reve Edit, Reve Remix, Reve Fast Edit, Reve Fast Remix  
**Last Updated:** January 2026

---

## Table of Contents

1. [Model Overview](#model-overview)
2. [Technical Specifications](#technical-specifications)
3. [Prompt Structure Framework](#prompt-structure-framework)
4. [Best Practices](#best-practices)
5. [Common Mistakes & Troubleshooting](#common-mistakes--troubleshooting)
6. [Advanced Techniques](#advanced-techniques)
7. [Use Case Examples](#use-case-examples)
8. [Integration Workflows](#integration-workflows)

---

## Model Overview

### What is Reve?

Reve is a natural language image editing and transformation system that eliminates traditional editing workflows. Instead of using layers, masks, or manual selection tools, you simply describe the changes you want in plain English. The model handles spatial relationships, context preservation, and visual coherence automatically.

### Model Variants

| Variant | Purpose | Cost | Speed | Quality |
|---------|---------|------|-------|---------|
| **Reve Edit** | Modify existing images while maintaining original composition | $0.04 | Standard | High |
| **Reve Fast Edit** | Rapid iteration for high-volume testing | $0.02 | 2x faster | Good |
| **Reve Remix** | Reimagine entire scene based on reference | $0.04 | Standard | High |
| **Reve Fast Remix** | Quick creative reinterpretation | $0.02 | 2x faster | Good |

### Key Strengths

- **Natural Language Control:** Describe edits conversationally instead of using complex tools
- **Context-Aware:** Automatically understands spatial relationships and preserves coherence
- **No Preprocessing:** No masking, layering, or manual selection required
- **Batch Variations:** Generate up to 4 edited versions per request for A/B testing
- **Format Flexibility:** Output as PNG, JPEG, or WebP based on delivery needs
- **Direct Integration:** Reference images via public URLs or base64 data URIs

### When to Use Reve

**Use Reve Edit when you need:**
- Quick adjustments to existing images (change colors, add/remove objects, modify backgrounds)
- Product variation testing (different colors, styles, contexts)
- Content adaptation (seasonal variations, localization, demographic targeting)
- Rapid design iteration without manual editing tools

**Use Reve Remix when you need:**
- Creative reinterpretation of a reference image
- Style transfer while maintaining subject essence
- Conceptual variations based on an existing composition

**Consider alternatives when you need:**
- Photorealistic generation from scratch (use Wan 2.2, Nano Banana Pro, Seedream 4.5)
- Precise pixel-level control (use traditional editing tools like Photoshop)
- Maximum 4K resolution output (use Topaz for upscaling after Reve)

---

## Technical Specifications

### Input Requirements

| Parameter | Specification |
|-----------|---------------|
| **Reference Image** | Required (PNG, JPEG, WebP, AVIF, HEIF) |
| **Input Method** | Public URL or base64 data URI |
| **Prompt** | Required (natural language description of desired changes) |
| **Batch Size** | 1-4 images per request |

### Output Formats

| Format | Use Case | File Size | Quality |
|--------|----------|-----------|---------|
| **PNG** | Highest quality, transparency support | Largest | Best |
| **JPEG** | Web-optimized, smaller files | Medium | Good |
| **WebP** | Modern format, balanced size/quality | Smallest | Good |

### Performance

| Metric | Reve Edit | Reve Fast Edit | Reve Remix | Reve Fast Remix |
|--------|-----------|----------------|------------|-----------------|
| **Cost** | $0.04 | $0.02 | $0.04 | $0.02 |
| **Speed** | 3-5 seconds | 1-2 seconds | 3-5 seconds | 1-2 seconds |
| **Quality** | High | Good | High | Good |
| **Use Case** | Final production | Rapid testing | Creative reinterpretation | Quick exploration |

### API Parameters

```
prompt (required): Natural language description of desired changes
image_url (required): Public URL or base64 data URI of reference image
num_images (optional): Number of variations to generate (1-4, default: 1)
output_format (optional): png, jpeg, or webp (default: png)
```

---

## Prompt Structure Framework

### Basic Formula (Simple Edits)

For straightforward modifications:

```
Prompt = Action + Target + Description
```

**Action:** What you want to do (change, add, remove, replace, modify)  
**Target:** What element to affect (background, subject, color, object)  
**Description:** How it should look after the change

**Examples:**
```
"Change the background to a sunset beach"
"Add a coffee cup on the table"
"Remove the person in the background"
"Replace the blue shirt with a red one"
"Make the lighting warmer and more golden"
```

### Advanced Formula (Complex Transformations)

For detailed, multi-element changes:

```
Prompt = Primary Change + Secondary Changes + Style/Mood + Preservation Notes
```

**Primary Change:** Main transformation (most important)  
**Secondary Changes:** Supporting modifications  
**Style/Mood:** Overall aesthetic direction  
**Preservation Notes:** What should remain unchanged

**Example:**
```
"Change the background from indoor to outdoor cafe patio with string lights and plants. Add a latte on the table in front of the subject. Make the lighting warm and golden hour. Keep the subject's pose, expression, and clothing exactly the same."
```

### Reve Edit vs Reve Remix Prompting

**Reve Edit Prompts** (Controlled Adjustments):
- Focus on specific elements to change
- Preserve overall composition and structure
- Use precise, targeted language
- Example: "Change the wall color from white to sage green"

**Reve Remix Prompts** (Creative Reinterpretation):
- Describe the overall vision or concept
- Allow more creative freedom
- Use broader, conceptual language
- Example: "Transform this into a cyberpunk aesthetic with neon lights and futuristic elements"

---

## Best Practices

### 1. Be Specific About What to Change

**Why:** Reve works best when you clearly identify the target element and desired outcome.

**How:**
- Name the specific element (background, shirt, lighting, object)
- Describe the desired state in detail
- Use comparative language when helpful ("from X to Y")

**Examples:**
```
❌ Weak: "Make it better"
✅ Strong: "Change the dull gray background to a vibrant sunset with orange and pink tones"

❌ Weak: "Add something"
✅ Strong: "Add a small potted succulent plant on the left side of the desk"

❌ Weak: "Fix the colors"
✅ Strong: "Increase the warmth of the lighting by adding golden tones, reduce the blue cast"
```

### 2. Specify What to Preserve

**Why:** Explicitly stating what should remain unchanged helps maintain consistency in critical elements.

**How:**
- List elements that must stay the same
- Use phrases like "keep the same," "preserve," "maintain"
- Especially important for subject identity, pose, and key objects

**Examples:**
```
"Change the background to a forest scene. Keep the subject's face, clothing, and pose exactly the same."

"Add a friend standing next to the main subject. Preserve the original subject's position and appearance."

"Replace the daytime sky with a night sky full of stars. Maintain all foreground elements unchanged."
```

### 3. Use Conversational Language

**Why:** Reve is designed for natural language input. You don't need technical editing terminology.

**How:**
- Write as if describing changes to a human editor
- Use everyday language, not Photoshop jargon
- Be direct and clear

**Examples:**
```
❌ Technical: "Apply a warm color grading LUT with increased luminance in the midtones"
✅ Conversational: "Make the lighting warmer and brighter"

❌ Technical: "Mask out the background and replace with a gaussian-blurred outdoor scene"
✅ Conversational: "Change the background to a blurred outdoor garden"

❌ Technical: "Clone stamp the object in the foreground and remove via content-aware fill"
✅ Conversational: "Remove the cup from the table"
```

### 4. Generate Multiple Variations

**Why:** Reve can produce up to 4 variations per request. This increases your chances of getting the perfect result.

**How:**
- Set `num_images` to 4 for important edits
- Review all variations and select the best
- Use variations for A/B testing or client options

**Cost Consideration:**
- 1 image: $0.04 (Edit) or $0.02 (Fast Edit)
- 4 images: $0.16 (Edit) or $0.08 (Fast Edit)
- Significantly increases success rate

### 5. Choose the Right Variant

**Why:** Different variants optimize for different priorities (speed vs quality, control vs creativity).

**Decision Matrix:**

| Need | Use This Variant |
|------|------------------|
| High-quality final production | **Reve Edit** |
| Rapid testing/iteration | **Reve Fast Edit** |
| Creative reinterpretation | **Reve Remix** |
| Quick concept exploration | **Reve Fast Remix** |
| Controlled, specific changes | **Reve Edit** |
| Broad, conceptual transformation | **Reve Remix** |

### 6. Optimize Output Format

**Why:** Different formats serve different purposes and affect file size and quality.

**Format Guidelines:**
- **PNG:** Use for final production, transparency needs, or further editing
- **JPEG:** Use for web delivery, social media, or when file size matters
- **WebP:** Use for modern web applications, balances size and quality

---

## Common Mistakes & Troubleshooting

### Issue 1: Changes Are Too Subtle or Ignored

**Symptom:** The edited image looks almost identical to the original, or requested changes didn't apply

**Cause:** Prompt is too vague or conflicts with image context

**Solution:**
- Be more explicit and detailed in your prompt
- Use stronger action verbs (replace, transform, completely change)
- Generate multiple variations (some may interpret better than others)

**Example Fix:**
```
❌ Before: "Make it nicer"
✅ After: "Replace the plain white background with a vibrant sunset beach scene with palm trees and orange sky"
```

### Issue 2: Unintended Elements Changed

**Symptom:** Elements you wanted to keep unchanged were modified

**Cause:** Didn't explicitly specify what to preserve

**Solution:**
- Add preservation instructions to your prompt
- Be specific about what should remain identical
- Use phrases like "keep the same," "preserve exactly," "maintain"

**Example Fix:**
```
❌ Before: "Add a friend next to her"
✅ After: "Add a friend standing next to her on the right side. Keep her face, clothing, pose, and expression exactly the same."
```

### Issue 3: Inconsistent Results Across Variations

**Symptom:** The 4 generated variations are wildly different from each other

**Cause:** Prompt allows too much creative interpretation

**Solution:**
- Be more specific and prescriptive
- Add more descriptive details
- Use Reve Edit instead of Reve Remix for controlled changes

**Example Fix:**
```
❌ Before: "Change the background"
✅ After: "Change the background to a modern office with white walls, large windows, and a potted plant in the corner. Keep the lighting consistent with the original."
```

### Issue 4: Quality Loss or Artifacts

**Symptom:** Edited image has visible artifacts, blurriness, or quality degradation

**Cause:** Using Fast variant when quality is critical, or complex transformation beyond model capabilities

**Solution:**
- Use standard Reve Edit instead of Reve Fast Edit
- Output as PNG instead of JPEG
- Break complex edits into multiple sequential steps
- Consider upscaling with Topaz after editing

**Example Workflow:**
```
Step 1: Reve Edit - Change background (PNG output)
Step 2: Reve Edit - Add object (PNG output)
Step 3: Topaz Upscale - Enhance to 4K
```

### Issue 5: Subject Identity Changes

**Symptom:** The person's face or identity changes slightly during editing

**Cause:** Reve Edit is not a face-preserving model; complex transformations can affect identity

**Solution:**
- Use simpler, more targeted edits
- Explicitly state "preserve the subject's face and identity exactly"
- Consider using Z-Image for portrait-specific edits
- Generate multiple variations and select the one that preserves identity best

---

## Advanced Techniques

### 1. Sequential Editing Workflow

**Technique:** Apply multiple edits in sequence, using each output as the input for the next step.

**Why:** Complex transformations are more successful when broken into smaller, targeted edits.

**Workflow:**
1. **Edit 1:** Change background
2. **Edit 2:** Add/remove objects
3. **Edit 3:** Adjust lighting/colors
4. **Edit 4:** Final refinements

**Example:**
```
Original Image: Woman at desk, plain white background

Edit 1 Prompt: "Change the background to a modern office with windows and plants"
→ Output 1

Edit 2 Prompt: "Add a laptop on the desk in front of her"
→ Output 2

Edit 3 Prompt: "Make the lighting warmer and more golden, as if late afternoon sunlight is coming through the windows"
→ Final Output
```

**Cost:** 3 edits × $0.04 = $0.12 total

### 2. A/B Testing with Batch Variations

**Technique:** Generate 4 variations with slightly different prompts to test which approach works best.

**Workflow:**
1. Create 4 prompt variations with subtle differences
2. Generate 1 image per prompt (4 total requests)
3. Compare results
4. Select best approach for final production

**Example:**
```
Variation A: "Change background to sunset beach"
Variation B: "Change background to sunset beach with palm trees"
Variation C: "Change background to sunset beach with orange and pink sky"
Variation D: "Change background to tropical sunset beach with palm trees and warm golden light"
```

**Cost:** 4 edits × $0.04 = $0.16 total

### 3. Style Transfer via Reve Remix

**Technique:** Use Reve Remix to reinterpret an image in a completely different style while maintaining subject essence.

**Workflow:**
1. Upload reference image
2. Describe target style in detail
3. Generate 4 variations
4. Select best result

**Example:**
```
Reference: Modern portrait photo
Remix Prompt: "Transform this into a vintage 1920s art deco portrait with sepia tones, dramatic lighting, and period-appropriate styling. Maintain the subject's pose and expression but reimagine everything else in the art deco aesthetic."
```

**Cost:** $0.04 per remix

### 4. Product Variation Pipeline

**Technique:** Create multiple product variations from a single base image for e-commerce or marketing.

**Workflow:**
1. Start with hero product image
2. Generate color variations
3. Generate context variations (different backgrounds/settings)
4. Generate seasonal variations

**Example:**
```
Base Image: Red handbag on white background

Color Variations:
- "Change the handbag color to navy blue"
- "Change the handbag color to forest green"
- "Change the handbag color to burgundy"

Context Variations:
- "Place the handbag on a marble countertop in a luxury boutique"
- "Show the handbag on a wooden table in a cozy home setting"
- "Display the handbag outdoors on a park bench with natural lighting"

Seasonal Variations:
- "Add autumn leaves and warm tones to the background"
- "Add winter snow and cool tones to the background"
- "Add spring flowers and bright tones to the background"
```

**Cost:** 9 variations × $0.04 = $0.36 total

### 5. Reve + Upscaling Workflow

**Technique:** Edit at standard resolution with Reve, then upscale to 4K for final delivery.

**Why:** Reve doesn't output at 4K, but Topaz can upscale edited images while preserving quality.

**Workflow:**
1. Edit image with Reve Edit (PNG output)
2. Upscale with Topaz to 4K
3. Final output is high-resolution edited image

**Example:**
```
Step 1: Reve Edit - "Change background to sunset beach, add palm trees, make lighting warm and golden" → 1024×1024 PNG
Step 2: Topaz Upscale - 4x upscale → 4096×4096 PNG
```

**Cost:** $0.04 (Reve) + $0.10 (Topaz) = $0.14 total

---

## Use Case Examples

### 1. Product Variation Testing

**Scenario:** E-commerce company needs to test multiple product colors without reshooting.

**Base Image:** Red sneaker on white background

**Prompts:**
```
Variation 1: "Change the sneaker color to navy blue. Keep everything else identical."
Variation 2: "Change the sneaker color to forest green. Keep everything else identical."
Variation 3: "Change the sneaker color to black. Keep everything else identical."
Variation 4: "Change the sneaker color to white with black accents. Keep everything else identical."
```

**Settings:**
- **Variant:** Reve Edit
- **Num Images:** 1 per color
- **Output Format:** PNG (for further editing if needed)

**Cost:** 4 colors × $0.04 = $0.16

### 2. Content Adaptation for Localization

**Scenario:** Marketing team needs to adapt a US-based image for international markets.

**Base Image:** American family at Thanksgiving dinner

**Prompts:**
```
European Market: "Remove the turkey and replace with a roasted chicken. Change the fall decorations to more neutral autumn elements. Keep the family and their expressions exactly the same."

Asian Market: "Replace the Thanksgiving meal with a variety of Asian dishes on the table. Change the background decorations to be more culturally neutral. Preserve the family's poses and expressions."

Latin American Market: "Replace the Thanksgiving setting with a festive family gathering with colorful decorations and Latin American cuisine. Keep the family composition and warm atmosphere."
```

**Settings:**
- **Variant:** Reve Edit
- **Num Images:** 4 per market (for options)
- **Output Format:** JPEG (for web delivery)

**Cost:** 3 markets × 4 variations × $0.04 = $0.48

### 3. Rapid Design Iteration

**Scenario:** Designer needs to quickly explore different background options for a portrait.

**Base Image:** Professional headshot with plain gray background

**Prompts:**
```
Option 1: "Change the background to a blurred modern office with windows and plants"
Option 2: "Change the background to a blurred bookshelf with colorful books"
Option 3: "Change the background to a blurred outdoor garden with greenery"
Option 4: "Change the background to a solid gradient from dark blue to light blue"
```

**Settings:**
- **Variant:** Reve Fast Edit (speed priority)
- **Num Images:** 1 per option
- **Output Format:** JPEG (for quick client review)

**Cost:** 4 options × $0.02 = $0.08

### 4. Seasonal Content Creation

**Scenario:** Brand needs seasonal variations of their hero image for year-round campaigns.

**Base Image:** Product display in neutral setting

**Prompts:**
```
Spring: "Add spring elements: pastel colors, cherry blossoms, soft pink and green tones, fresh and light atmosphere"

Summer: "Add summer elements: bright sunny lighting, tropical plants, vibrant warm colors, energetic atmosphere"

Fall: "Add fall elements: autumn leaves, warm orange and brown tones, cozy atmosphere, soft golden lighting"

Winter: "Add winter elements: snow, cool blue and white tones, evergreen decorations, cozy warm lighting indoors"
```

**Settings:**
- **Variant:** Reve Edit
- **Num Images:** 4 per season (for options)
- **Output Format:** PNG (for high-quality marketing)

**Cost:** 4 seasons × 4 variations × $0.04 = $0.64

### 5. Social Media Content Variations

**Scenario:** Influencer needs multiple versions of a single photo for different platforms and audiences.

**Base Image:** Lifestyle photo in living room

**Prompts:**
```
Instagram (Warm & Cozy): "Make the lighting warmer and more golden, add soft glow, enhance the cozy atmosphere"

LinkedIn (Professional): "Make the lighting brighter and more even, add professional elements like a laptop or notebook, create a more business-appropriate atmosphere"

Pinterest (Aspirational): "Enhance the aesthetic appeal, add stylish decor elements, make the scene more magazine-worthy and aspirational"

TikTok (Casual & Fun): "Add playful elements, make the colors more vibrant and saturated, create a more energetic and casual vibe"
```

**Settings:**
- **Variant:** Reve Edit
- **Num Images:** 2 per platform (for options)
- **Output Format:** JPEG (for social media)

**Cost:** 4 platforms × 2 variations × $0.04 = $0.32

---

## Integration Workflows

### Workflow 1: Generation → Reve Edit → Final Output

**Use Case:** Generate a base image with another model, then refine specific elements with Reve.

**Steps:**
1. **Generate Base Image**
   - Use Wan 2.2, Nano Banana Pro, or Seedream 4.5
   - Cost: $0.025-0.04

2. **Refine with Reve Edit**
   - Upload generated image
   - Make targeted adjustments
   - Cost: $0.04

3. **Final Output**
   - Total cost: $0.065-0.08
   - Total time: ~8-12 seconds

**Example:**
```
Step 1 (Wan 2.2): "Woman sitting at cafe, morning light, white dress"
Step 2 (Reve Edit): "Change the dress to red, add a latte on the table, make the background more blurred"
Result: Refined image with specific adjustments
```

### Workflow 2: Reve Edit → Topaz Upscale → High-Res Output

**Use Case:** Edit an image with Reve, then upscale to 4K for print or high-quality digital use.

**Steps:**
1. **Edit with Reve**
   - Make all desired changes
   - Output as PNG for quality
   - Cost: $0.04

2. **Upscale with Topaz**
   - 4x upscale to 4K
   - Preserves edited details
   - Cost: $0.05-0.10

3. **Final Output**
   - Total cost: $0.09-0.14
   - Total time: ~15-20 seconds
   - Result: 4K edited image

### Workflow 3: Sequential Reve Edits → Final Output

**Use Case:** Complex transformation requiring multiple editing steps.

**Steps:**
1. **Edit 1:** Background change
   - Cost: $0.04

2. **Edit 2:** Add/remove objects
   - Cost: $0.04

3. **Edit 3:** Lighting/color adjustment
   - Cost: $0.04

4. **Final Output**
   - Total cost: $0.12
   - Total time: ~15-20 seconds
   - Result: Fully transformed image

**Example:**
```
Original: Professional headshot, plain background
Edit 1: "Change background to modern office"
Edit 2: "Add a laptop on the desk in front of subject"
Edit 3: "Make lighting warmer and more golden"
Result: Completely transformed professional photo
```

### Workflow 4: Reve Batch Variations → Client Selection

**Use Case:** Create multiple options for client review and selection.

**Steps:**
1. **Generate 4 Variations**
   - Single Reve Edit request with `num_images: 4`
   - Cost: $0.16

2. **Client Review**
   - Present all 4 options
   - Client selects favorite

3. **Optional Refinement**
   - If needed, apply additional Reve Edit to selected image
   - Cost: $0.04

4. **Final Output**
   - Total cost: $0.16-0.20
   - Total time: ~5-10 seconds
   - Result: Client-approved edited image

### Workflow 5: Multi-Model Pipeline

**Use Case:** Combine multiple AI models for optimal results.

**Steps:**
1. **Generate Base** (Wan 2.2)
   - Photorealistic starting point
   - Cost: $0.025

2. **Edit Elements** (Reve Edit)
   - Adjust specific details
   - Cost: $0.04

3. **Upscale** (Topaz)
   - Enhance to 4K
   - Cost: $0.10

4. **Final Output**
   - Total cost: $0.165
   - Total time: ~20-25 seconds
   - Result: High-resolution, refined, photorealistic image

---

## Quick Reference

### Prompt Formula Cheat Sheet

```
Simple: Action + Target + Description
Advanced: Primary Change + Secondary Changes + Style/Mood + Preservation Notes
```

### Variant Selection Guide

| Priority | Variant |
|----------|---------|
| Quality | Reve Edit |
| Speed | Reve Fast Edit |
| Control | Reve Edit |
| Creativity | Reve Remix |
| Cost | Reve Fast Edit / Fast Remix |

### Output Format Guide

| Format | Quality | File Size | Use Case |
|--------|---------|-----------|----------|
| PNG | Highest | Largest | Final production, further editing |
| JPEG | Good | Medium | Web delivery, social media |
| WebP | Good | Smallest | Modern web applications |

### Cost Calculator

| Variant | 1 Image | 4 Images | 10 Images |
|---------|---------|----------|-----------|
| Reve Edit | $0.04 | $0.16 | $0.40 |
| Reve Fast Edit | $0.02 | $0.08 | $0.20 |
| Reve Remix | $0.04 | $0.16 | $0.40 |
| Reve Fast Remix | $0.02 | $0.08 | $0.20 |

---

## Resources

### Official Documentation
- **fal.ai Reve Edit:** https://fal.ai/models/fal-ai/reve/edit
- **fal.ai Reve Remix:** https://fal.ai/models/fal-ai/reve/remix
- **fal.ai API Documentation:** https://fal.ai/docs

### Related Models
- **Wan 2.2 Image:** Photorealistic generation (pairs well with Reve for refinement)
- **Topaz:** Upscaling for high-resolution output
- **Z-Image:** Portrait-specific generation and editing

---

**Last Updated:** January 2026  
**Version:** 1.0  
**Model Variants:** Reve Edit, Reve Remix, Reve Fast Edit, Reve Fast Remix
