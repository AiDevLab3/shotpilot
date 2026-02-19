> **⚠️ VERSION NOTE (February 2026):** Kling O1 Image has been **superseded by Kling O3 Image** (`kling-image/o3`).
> The O3 endpoints (`fal-ai/kling-image/o3/text-to-image` and `fal-ai/kling-image/o3/image-to-image`) offer
> "top-tier image generation with flawless consistency" and use the same @Element reference system.
> **New projects should use Kling O3 Image.** This guide remains useful for prompting patterns and
> reference syntax, which carry over to O3. Cost: $0.028/image (1K/2K), double for 4K.

# Kling O1 Image Prompting Mastery Guide

Model: Kling O1 Image (⚠️ Legacy — see Kling O3 Image)
Developer: Kuaishou (Kwai)
Release: December 2025
Specialty: Multi-reference image editing, photorealistic composition, precise subject transplantation
Architecture: Reference-based semantic editing with up to 10 input images



## Table of Contents

Technical Specifications

What Makes Kling O1 Image Unique

The @Image Reference System

Optimal Prompting Structure

Portrait Photography & Editing

Product Photo Editing

Style Transfer Techniques

Advanced Multi-Reference Workflows

Common Issues & Troubleshooting

Genre-Specific Examples

Integration Workflows



## Technical Specifications

### Model Capabilities

Core Strengths:


✅ Multi-reference editing - Up to 10 input images in a single prompt

✅ Semantic understanding - Contextual interpretation of relationships between images

✅ No manual masking - Automatic subject extraction and transplantation

✅ Lighting preservation - Maintains original lighting, shadows, and depth

✅ High prompt adherence - Precise execution of complex editing instructions

✅ Batch generation - 1-9 variations per request


Technical Specifications:


### What Kling O1 Image Excels At

✅ Subject transplantation - Move people/objects between scenes
✅ Background replacement - Swap environments while preserving subject
✅ Style transfer - Apply artistic styles from reference images
✅ Material modification - Change textures, fabrics, finishes
✅ Photo colorization - Add realistic color to black-and-white images
✅ Beauty enhancements - Skin retouching, makeup, hairstyle changes
✅ Product editing - Remove watermarks, adjust materials, refine details
✅ Vintage effects - Apply film grain, sepia tones, aged looks

### What Kling O1 Image Struggles With

❌ Text generation - Not designed for creating new text in images
❌ Complex scene generation from scratch - Optimized for editing, not pure generation
❌ Extreme transformations - Works best with realistic edits
❌ Speed-critical workflows - Prioritizes accuracy over generation speed



## What Makes Kling O1 Image Unique

### 1. Reference-Based Editing Without Manual Masks

Traditional image editing requires:


Manual masking or selection tools

Layer management

Pixel-level editing instructions

Regional prompting


Kling O1 Image eliminates all of this with semantic understanding. You simply tell it what to do in natural language, and it interprets the relationships between images contextually.


Example:


Put @Image1 to the back seat of the car in @Image2



The model understands:


@Image1 is the subject (person)

@Image2 is the environment (car interior)

"back seat" is the target location

Lighting, perspective, and scale need to match


No masking. No layers. No regional prompting.

### 2. Multi-Reference Composition (Up to 10 Images)

Most image editing models handle 1-2 reference images. Kling O1 Image supports up to 10 images in a single prompt, enabling complex compositions that would require multiple editing passes in traditional tools.


Use Cases:


Composite multiple subjects into a single scene

Apply style from one image, lighting from another, background from a third

Build complex product shots with multiple reference angles

Create fashion lookbooks with consistent styling across multiple garments

### 3. Contextual Transplantation

When you move a subject from one image to another, Kling O1 Image automatically:


Matches lighting direction - Adjusts shadows and highlights to fit the new environment

Preserves perspective - Scales and rotates the subject to match the scene

Maintains visual consistency - Keeps color temperature, contrast, and depth of field coherent

Handles occlusion - Places subjects behind/in front of objects naturally


This is the key differentiator - you don't need to manually adjust lighting, perspective, or scale. The model does it contextually.

### 4. Prompt Adherence & Consistency

Kling O1 Image is described as "one of the easiest, most intuitive, and most prompt-adherent AI image generators" available. Even simple instructions deliver clean, consistent results.


Example:


Colorize this black-and-white portrait with natural skin tones and soft warm lighting.



Result: Accurate colorization without oversaturation, maintaining original texture and detail.



## The @Image Reference System

### How It Works

Kling O1 Image uses a numbered reference system to identify and manipulate specific images in your prompt.


Syntax:


@Image1 - First uploaded image

@Image2 - Second uploaded image

@Image3 through @Image10 - Additional images

@Element1 through @Element10 - Specific elements with frontal + reference views


Upload Order Matters: The order you upload images determines their @Image number. Always upload in the order you'll reference them in your prompt.

### Basic Reference Examples

Single Image Edit:


Enhance skin texture in @Image1, add soft diffused lighting from the left



Two-Image Composition:


Put @Image1 in the background of @Image2, maintain original lighting



Multi-Image Composition:


Place @Image1 in the foreground, @Image2 in the middle ground, and @Image3 as the background, create depth with atmospheric perspective

### Element System (@Element1-10)

For more precise control, use the Element system. Each element includes:


Frontal Image - Main view of the subject

Reference Images - Additional angles or context


Example:


Put @Element1 on @Image1, match lighting and perspective



When to Use Elements:


Product photography (multiple angles of the same product)

Character consistency (frontal + profile views)

Complex subject transplantation (need multiple reference angles)



## Optimal Prompting Structure

### The 6-Layer Framework

Kling O1 Image prompts work best when structured in 6 layers, building from intent to technical details:

#### Layer 1: One-Line Intent + Style

Start with a single clear sentence stating the goal and visual style.


Examples:


"Colorize a 1920s family portrait with natural film tones"

"Generate a dreamy forest-fairytale portrait in French vintage style"

"Replace the background in @Image1 with a modern studio setup"


Why: Orients the model immediately and reduces ambiguous outputs.

#### Layer 2: Subject & Exact Changes

For Generation: Describe the subject's age, ethnicity, clothing, pose, and expression.


Example:


Young South Asian woman, braided hair, soft smile, sitting on a white floral chair



For Editing: Explicitly reference the source image and the element to change.


Example:


From @Image1: replace the dog with the man from @Image2, keep head proportions, maintain lighting



Always name the layer/element you want edited: background, hair, jacket, label, etc.

#### Layer 3: Camera + Lighting Language

Add focal length, aperture, and light direction to control depth and mood.


Examples:


"50mm, f/2.0, warm window key left + cool rim right, soft cinematic grain"

"85mm, f/1.4, golden hour sunlight from behind, lens flare"

"35mm, f/5.6, overcast diffused lighting, no harsh shadows"


For Motion or Blur: Include shutter speed: "1/30s for subtle motion trails"

#### Layer 4: Textures, Materials & Technical Constraints

Tell the model how things should feel: skin porosity, fabric weave, metal polish, glass reflections, film grain, readable typography.


Include Dos and Don'ts:


Fine skin pores, natural freckles; avoid plastic sheen; keep label text legible; no extra limbs



For Edits: Optionally give an edit strength: "subtle retouch (30% strength)"

#### Layer 5: Deliverable & Safety/Consistency Rules

End with output constraints and preservation rules:


Resolution/Aspect: "8K, vertical poster 4:5"

Identity Preservation: "Maintain facial likeness"

Format Choices: "Output as PNG with transparency"


For Multi-Step Edits: Request variants: "Produce 3 variations: soft, medium, strong"


If Editing Real People: Remind to follow consent/ethics: "Only edit images with permission"

#### Layer 6: Negative Prompts (If Needed)

While Kling O1 Image doesn't have a dedicated negative prompt field in all interfaces, you can include "avoid" statements in your main prompt:


Examples:


"Avoid extra fingers, distorted hands, warped faces"

"No watermarks, logos, or text overlays"

"Avoid oversaturation, plastic skin, artificial lighting"

### Complete Prompt Examples

Generation:


Generate a vintage colorized family portrait — natural film palette, 85mm f/2, warm window light, fine film grain, ultra-real skin tones, 3:4 aspect



Style Transfer Edit:


Apply painterly Van Gogh style to @Image1, preserve faces and composition, vivid impasto texture, maintain original lighting direction



Material Swap Edit:


Swap cotton jacket in @Image1 for polished brown leather; keep seams and fit; add satin sheen; subtle reflections; 50% edit strength




## Portrait Photography & Editing

Kling O1 Image excels at photorealistic portrait editing by enhancing skin texture, lighting, and depth while keeping faces naturally consistent.

### 1. Portrait Enhancement Workflow

Step 1: Upload Base Image Upload your portrait as @Image1


Step 2: Define Enhancement Goals


Skin texture refinement

Lighting adjustment

Expression modification

Background replacement


Step 3: Write Structured Prompt


Example:


Enhance @Image1: refine skin texture with natural pores and freckles, adjust lighting to soft diffused daylight from the left creating gentle gradient shadow on right cheek, enhance micro-details of eyelashes and brows, keep color palette warm beige honey gold and rose peach, clean studio background, premium magazine-quality finish

### 2. Portrait Editing Techniques

Skin Texture Refinement:


Enhance @Image1 with soft matte skin, natural freckles, and glossy peach lips, maintain micro-details of eyelashes and brows, photorealistic skin pores, no plastic sheen



Lighting Adjustment:


Adjust lighting in @Image1 to late-afternoon sunlight, warm rim light outlining hair and shoulders, deepen shadows under jawline, add subtle film grain, soft moody atmospheric tone



Expression Modification:


Modify expression in @Image1 from neutral to gentle smile, keep facial structure identical, maintain natural eye contact, subtle crow's feet, authentic emotion



Background Replacement:


Replace background in @Image1 with blurred greenery, cinematic bokeh, keep subject lighting unchanged, natural depth of field, 85mm lens look

### 3. Multi-Reference Portrait Composition

Use Case: Composite multiple subjects into a single portrait


Workflow:


Upload subject portraits as @Image1, @Image2, @Image3

Upload target background as @Image4

Write composition prompt


Example:


Place @Image1 on the left, @Image2 in the center, @Image3 on the right, all standing in @Image4 background, match lighting across all subjects to golden hour sunlight from left, maintain individual facial details, create unified group portrait, natural shadows and depth

### 4. Portrait Photography Examples

High-End Beauty Portrait:


High-end beauty portrait of a woman with soft matte skin, natural freckles, and glossy peach lips. Adjust lighting to soft diffused daylight from the left, creating a gentle gradient shadow on the right cheek. Enhance micro-details of eyelashes and brows; keep color palette warm beige, honey gold, and rose peach. Clean studio background, premium magazine-quality finish.



Natural Lifestyle Portrait:


Natural lifestyle portrait of a woman holding a cup of coffee near a window, warm indoor lighting, soft highlights on cheeks, gentle falloff on hair. Add realism in hand texture, fabric folds, and reflections on the mug. Cozy morning vibe with neutral browns, cream tones, and soft blur outside the window.



Studio Fashion Portrait:


Studio portrait of a model wearing a structured black blazer, sharp jawline lighting, and clean white backdrop. Accentuate symmetry, refine skin texture, and polish stray hairs. Add subtle cool-toned shadow behind subject for depth. Crisp, modern, high-fashion energy.




## Product Photo Editing

Kling O1 Image transforms product photography with precise material modifications, watermark removal, and detail refinement while maintaining photorealistic quality.

### 1. Product Enhancement Workflow

Step 1: Upload Product Image Upload your product photo as @Image1


Step 2: Define Editing Goals


Remove watermarks or logos

Enhance material textures

Adjust lighting and shadows

Refine details (stitching, engravings, etc.)

Change colors or finishes


Step 3: Write Structured Prompt


Example:


Enhance @Image1: remove watermark, enhance metal polish and leather grain texture, sharpen engraved numerals, adjust highlights for realistic shine, add subtle soft shadows to anchor the watch, balanced warm key light from top-left and cool rim light from right, maintain color accuracy for silver black and metallic reflections, cinematic professional product photography style

### 2. Product Editing Techniques

Watermark Removal:


Remove watermark from @Image1, seamlessly fill background texture, maintain product sharpness and detail, no visible editing artifacts



Material Modification:


Change fabric in @Image1 from cotton to silk, add subtle sheen and drape, maintain garment structure and fit, photorealistic textile rendering



Lighting Adjustment:


Adjust lighting in @Image1 to soft studio setup, key light from top-left, fill light from right, subtle rim lighting for depth, eliminate harsh shadows, professional catalog quality



Detail Refinement:


Enhance details in @Image1: sharpen stitching, refine logo embossing, enhance texture of materials, remove dust and fingerprints, ultra-sharp product photography

### 3. Multi-Reference Product Composition

Use Case: Create lifestyle product shots with multiple reference images


Workflow:


Upload product as @Image1

Upload lifestyle background as @Image2

Upload additional props as @Image3, @Image4

Write composition prompt


Example:


Place @Image1 (product) on marble surface in @Image2 (background), add @Image3 (plant) on left side and @Image4 (coffee cup) on right, create lifestyle product scene, soft morning window light from left, natural shadows, depth of field with product in sharp focus, lifestyle e-commerce photography

### 4. Product Photography Examples

Wristwatch (Catalog Style):


Close-up of a silver wristwatch with black leather strap on a reflective marble surface. Enhance metal polish and leather grain texture, sharpen engraved numerals, and adjust highlights for realistic shine. Add subtle soft shadows to anchor the watch, with a balanced warm key light from the top-left and cool rim light from the right. Maintain color accuracy for silver, black, and subtle metallic reflections. Cinematic, professional product photography style.



Perfume Bottle (High-End):


Transparent glass perfume bottle with golden cap placed on a soft velvet surface. Remove any smudges or fingerprints, enhance glass reflections and liquid clarity, and deepen the golden hue of the cap. Apply soft diffused lighting from front-left, subtle rim lighting, and minimal ambient shadows for elegance. Ensure background remains smooth and slightly blurred to emphasize the bottle. Photorealistic, high-end advertising aesthetic.



Sneakers (Lifestyle):


White leather sneakers on wooden floor. Highlight stitching, texture, and material details, remove scuff marks, enhance sole grip pattern, and refine laces to appear crisp and clean. Add natural window light from left with soft fill from right, subtle shadows for depth. Retain accurate color tones with glossy highlights on leather and matte finish on rubber sole. Lifestyle product shot ready for e-commerce.




## Style Transfer Techniques

Kling O1 Image's style transfer capabilities allow you to apply artistic styles from reference images to your photos while preserving composition and subject identity.

### 1. Style Transfer Workflow

Step 1: Upload Images


@Image1 = Content image (your photo)

@Image2 = Style reference (artistic style to apply)


Step 2: Define Style Transfer Goals


Preserve subject identity

Maintain composition

Apply artistic texture/color palette

Control transfer strength


Step 3: Write Structured Prompt


Example:


Apply painterly Van Gogh style from @Image2 to @Image1, preserve faces and composition, vivid impasto texture, maintain original lighting direction, strong style transfer (80% strength)

### 2. Style Transfer Techniques

Artistic Style Transfer:


Apply @Image2 artistic style to @Image1, preserve subject identity and composition, transfer color palette and brush texture, maintain facial details, medium style strength (60%)



Vintage Film Look:


Apply vintage 1970s film aesthetic from @Image2 to @Image1, add film grain, warm color grading, slight vignette, preserve subject sharpness, authentic analog photography feel



Black & White Conversion:


Convert @Image1 to black and white using contrast and tonal range from @Image2, preserve texture and detail, dramatic shadows, high-contrast film noir aesthetic



Watercolor Effect:


Apply watercolor painting style from @Image2 to @Image1, soft edges, color bleeding, paper texture, preserve subject recognizability, artistic illustration feel

### 3. Style Transfer Examples

Van Gogh Style:


Apply painterly Van Gogh style to @Image1, preserve faces and composition, vivid impasto texture, swirling brushstrokes, maintain original lighting direction, vibrant color palette with blues and yellows, strong artistic transformation



Vintage Sepia:


Apply vintage sepia tone from @Image2 to @Image1, warm brown color grading, subtle film grain, aged photograph aesthetic, preserve facial details and texture, nostalgic 1920s photography feel



Cyberpunk Neon:


Apply cyberpunk neon aesthetic from @Image2 to @Image1, vibrant cyan and magenta color grading, high contrast, glowing highlights, futuristic urban atmosphere, preserve subject identity, sci-fi editorial style




## Advanced Multi-Reference Workflows

### 1. Complex Scene Composition (3+ Images)

Use Case: Build a complex scene from multiple source images


Workflow:


Upload foreground subject as @Image1

Upload middle ground elements as @Image2

Upload background as @Image3

Write layered composition prompt


Example:


Create composite scene: place @Image1 (person) in sharp focus foreground, @Image2 (car) in middle ground with slight blur, @Image3 (cityscape) as background with atmospheric perspective, match lighting to golden hour from left across all layers, create natural depth of field, cinematic composition

### 2. Fashion Lookbook Creation

Use Case: Create consistent fashion imagery with multiple garments


Workflow:


Upload model portrait as @Image1

Upload garment references as @Image2, @Image3, @Image4

Write outfit composition prompt


Example:


Dress @Image1 (model) in jacket from @Image2, pants from @Image3, shoes from @Image4, maintain model's pose and lighting, match garment colors and textures realistically, create cohesive fashion editorial look, studio lighting, high-end fashion photography

### 3. Before/After Transformations

Use Case: Show dramatic transformations for beauty, fitness, or renovation


Workflow:


Upload "before" image as @Image1

Define transformation goals

Write transformation prompt


Example:


Transform @Image1: enhance skin texture and tone, refine facial contours, adjust lighting to soft beauty lighting, add subtle makeup (natural tones), maintain facial identity, create professional beauty retouch, magazine-quality finish

### 4. Product Variation Generation

Use Case: Create multiple product variations from a single base image


Workflow:


Upload base product as @Image1

Write variation prompt with color/material changes

Generate multiple variations


Example:


Create 3 color variations of @Image1 (product): Version 1 in navy blue, Version 2 in burgundy red, Version 3 in forest green, maintain product shape and lighting, photorealistic material rendering, consistent studio background




## Common Issues & Troubleshooting

### Issue: Poor Subject Extraction

Symptoms:


Subject has rough edges or artifacts

Background elements bleed into subject

Incomplete subject extraction


Solutions:


Use higher resolution source images (2K mode)

Ensure subject has clear separation from background

Add to prompt: "clean subject extraction, sharp edges, no artifacts"

Use @Element system with multiple reference angles

### Issue: Lighting Mismatch

Symptoms:


Subject lighting doesn't match new environment

Shadows point in wrong direction

Color temperature inconsistency


Solutions:


Explicitly state lighting direction in prompt: "match lighting to golden hour from left"

Add: "maintain original lighting direction" or "adjust lighting to match @Image2"

Specify shadow behavior: "add natural shadows beneath subject"

Control color temperature: "warm lighting" or "cool lighting"

### Issue: Scale or Perspective Problems

Symptoms:


Subject appears too large or too small

Perspective doesn't match scene

Unrealistic spatial relationships


Solutions:


Add to prompt: "match scale and perspective to @Image2"

Specify placement: "place subject in middle ground" or "foreground"

Add: "natural perspective, realistic scale, proper depth"

Use reference images with similar perspective angles

### Issue: Loss of Detail or Quality

Symptoms:


Subject appears soft or blurry

Loss of texture detail

Reduced image quality


Solutions:


Use 2K resolution mode

Add to prompt: "maintain original detail and sharpness"

Specify texture preservation: "preserve skin texture, fabric weave, fine details"

Use higher quality source images

### Issue: Unnatural Composition

Symptoms:


Elements don't blend naturally

Obvious editing artifacts

Unrealistic scene


Solutions:


Add: "seamless integration, natural composition, photorealistic"

Specify occlusion: "place subject behind/in front of [element]"

Add atmospheric effects: "atmospheric perspective, depth haze"

Request multiple variations and select best: "generate 3 variations"



## Genre-Specific Examples

### 1. Portrait Photography

High-End Beauty:


High-end beauty portrait of a woman with soft matte skin, natural freckles, and glossy peach lips. Adjust lighting to soft diffused daylight from the left, creating a gentle gradient shadow on the right cheek. Enhance micro-details of eyelashes and brows; keep color palette warm beige, honey gold, and rose peach. Clean studio background, premium magazine-quality finish.



Lifestyle Portrait:


Natural lifestyle portrait of a woman holding a cup of coffee near a window, warm indoor lighting, soft highlights on cheeks, gentle falloff on hair. Add realism in hand texture, fabric folds, and reflections on the mug. Cozy morning vibe with neutral browns, cream tones, and soft blur outside the window.



Editorial Fashion:


High-fashion editorial close-up portrait of a young European female model in a relaxed, confident pose, wearing a loose denim jacket over a dark shirt, matching loose baggy denim visible in frame, styled in a refined denim-on-denim look, soft studio-controlled lighting creates sharp contrasts and clean highlights, emphasizing facial structure and texture, mood is modern, premium, minimal, and effortlessly cool, 8K, high-end fashion editorial style

### 2. Product Photography

E-Commerce Catalog:


Studio product photo of a 250ml frosted glass skincare bottle with white pump, deep green label reading "LUMINA SERUM" in bold sans-serif, centered on seamless white backdrop, soft diffused lighting from top-left, subtle shadow, ultra sharp, 8K, clipping-path ready



Lifestyle Product:


Product photo of a navy blue running shoe with white swoosh logo, placed on weathered wooden dock at sunrise, golden hour light, lake in soft focus background, dynamic 45-degree angle, shallow depth of field, highly detailed texture, outdoor lifestyle photography



Luxury Product:


Transparent glass perfume bottle with golden cap placed on a soft velvet surface. Remove any smudges or fingerprints, enhance glass reflections and liquid clarity, and deepen the golden hue of the cap. Apply soft diffused lighting from front-left, subtle rim lighting, and minimal ambient shadows for elegance. Photorealistic, high-end advertising aesthetic.

### 3. Photo Restoration

Colorization:


Colorize this black-and-white portrait with natural skin tones and soft warm lighting, maintain original texture and detail, authentic period-appropriate color palette, photorealistic colorization



Vintage Restoration:


Restore @Image1: remove scratches and dust, enhance faded colors, repair torn edges, maintain vintage character and film grain, authentic period aesthetic, professional photo restoration



HD Enhancement:


Enhance @Image1 to HD quality: increase resolution, sharpen details, reduce noise, enhance color vibrancy, maintain natural look, no over-processing, photorealistic enhancement

### 4. Creative Transformations

Seasonal Variations:


Transform @Image1 from summer to winter scene: add snow on ground and trees, change green foliage to bare branches, adjust lighting to cool winter tones, add subtle fog, maintain composition and perspective, photorealistic seasonal transformation



Time of Day Changes:


Transform @Image1 from daytime to golden hour: adjust lighting to warm sunset tones, add long shadows, enhance sky with orange and pink hues, maintain subject detail, cinematic golden hour photography



Architectural Renovation:


Transform @Image1 (old building) to renovated modern aesthetic: update facade materials, add contemporary windows, enhance colors, maintain architectural structure, photorealistic architectural visualization




## Integration Workflows

### Kling O1 Image + Design Tools

Use Case: Product mockups, brand assets, marketing materials


Workflow:


Generate/edit base image in Kling O1 Image

Export high-resolution (2K mode)

Import to Figma/Photoshop

Add brand elements (logos, text, graphics)

Export final assets


Why: Kling O1 Image handles photorealistic editing; design tools handle precise branding.

### Kling O1 Image + Video Production

Use Case: Hero Frames for video generation, storyboard creation


Workflow:


Generate Hero Frames in Kling O1 Image

Select best candidates

Use as reference for video generation (Kling 2.6, Veo, etc.)

Animate with image-to-video tools

Assemble in editing software


Why: Image-First Workflow - perfect the still, then animate.

### Kling O1 Image + Other Image Generators

Use Case: Cross-model workflows for specialized tasks


Workflow:


Generate base image in Midjourney/DALL-E/Nano Banana Pro

Import to Kling O1 Image as @Image1

Refine with multi-reference editing

Export final image


Why: Combine generation strengths of other models with Kling O1's editing precision.

### Kling O1 Image + Upscaling

Use Case: High-resolution prints, large-format displays


Workflow:


Generate/edit image in Kling O1 Image (2K mode)

Export and upscale with Topaz Gigapixel (2x-4x)

Refine in Photoshop (color correction, sharpening)

Export final for print/display


Why: Kling O1 Image provides base quality; upscalers add resolution.



## Ethical Considerations

### 1. Consent & Permission

When editing images of real people:


Always obtain consent before editing someone's photo

Respect privacy - don't edit or share images without permission

Avoid deepfakes - don't create misleading or harmful content

Disclose AI editing when sharing publicly

### 2. Transparency

When AI-edited imagery appears in:


Advertising - Disclose AI editing in fine print or captions

Social media - Tag as AI-edited or use #AIart

Professional work - Inform clients of AI editing methods


Why: Builds trust and avoids misleading audiences.

### 3. Copyright & Ownership

Respect source images - Only edit images you own or have permission to use

Avoid copyrighted characters - Don't edit trademarked or copyrighted subjects

Commercial use - Ensure you have rights for commercial applications

Attribution - Credit original photographers when appropriate

### 4. Bias Mitigation

AI models can inherit biases from training data:


Vary representation - Edit diverse subjects (age, ethnicity, body type)

Avoid stereotypes - Don't reinforce harmful stereotypes

Test for bias - Check if edits treat all subjects equally



## Quick Reference

### Prompt Formula

[One-line intent + style] + [Subject & exact changes] + [Camera + lighting] + [Textures & materials] + [Deliverable & constraints] + [Negative prompts]

### @Image Reference Syntax

@Image1 through @Image10 - Reference uploaded images

@Element1 through @Element10 - Reference elements with frontal + reference views

### Common Prompt Patterns

Subject Transplantation:


Put @Image1 in @Image2, match lighting and perspective, seamless integration



Background Replacement:


Replace background in @Image1 with @Image2, maintain subject lighting, natural depth of field



Style Transfer:


Apply style from @Image2 to @Image1, preserve composition and subject identity, [strength]% style transfer



Material Modification:


Change [element] in @Image1 from [material A] to [material B], maintain shape and lighting, photorealistic rendering

### Resolution & Aspect Ratios

1K (Standard): Faster generation, good for previews

2K (High-Resolution): Up to 4MP, best for final outputs

9 Preset Aspect Ratios: Intelligent detection based on content

### Cost & Performance

$0.028 per image (36 generations per $1.00)

1-9 variations per request

Up to 10 input images per prompt

Commercial use allowed



## Conclusion

Kling O1 Image represents a paradigm shift in image editing: multi-reference semantic editing without manual masking. By understanding the contextual relationships between up to 10 input images, it eliminates the tedious layer management, masking, and regional prompting required by traditional editing tools.


Key Takeaways:


Use the @Image reference system for precise control over multi-image compositions

Structure prompts in 6 layers for consistent, high-quality results

Leverage semantic understanding - tell the model what to do in natural language

Preserve lighting and perspective by explicitly stating these in prompts

Use 2K mode for final outputs requiring maximum detail

Generate multiple variations (1-9) to select the best result

Obtain consent when editing images of real people


Next Steps:


Experiment with the genre-specific examples

Build prompt templates for your most common editing tasks

Integrate with design tools and video workflows

Share your best prompts and techniques with the community


Kling O1 Image is a production-ready tool that fits into real-world workflows. Use it to accelerate editing tasks, create complex compositions, and achieve results that would require hours of manual work in traditional editing software.




Last Updated: January 29, 2026
Model Version: Kling O1 Image (public release)
Guide Version: 1.0


