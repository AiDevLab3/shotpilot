# Topaz AI Upscaling Prompting Mastery Guide

**Model:** Topaz Gigapixel AI & Topaz Photo AI  
**Developer:** Topaz Labs  
**Specialty:** AI-powered image upscaling and enhancement  
**Version:** Gigapixel 8.x, Photo AI 3.x  
**Last Updated:** January 2026

---

## Table of Contents

1. [Model Overview](#model-overview)
2. [Technical Specifications](#technical-specifications)
3. [AI Model Selection Framework](#ai-model-selection-framework)
4. [Best Practices](#best-practices)
5. [Common Mistakes & Troubleshooting](#common-mistakes--troubleshooting)
6. [Advanced Techniques](#advanced-techniques)
7. [Use Case Examples](#use-case-examples)
8. [Integration Workflows](#integration-workflows)

---

## Model Overview

### What is Topaz AI Upscaling?

Topaz Labs offers industry-leading AI-powered image upscaling through two primary products: **Topaz Gigapixel AI** (dedicated upscaling tool) and **Topaz Photo AI** (all-in-one photo enhancement with upscaling). These tools use specialized AI models to increase image resolution while preserving and even enhancing details, making them essential for print preparation, AI-generated image enhancement, and restoration of low-quality photos.

### Product Comparison

| Feature | Topaz Gigapixel AI | Topaz Photo AI |
|---------|-------------------|----------------|
| **Primary Focus** | Dedicated upscaling | All-in-one enhancement |
| **Maximum Upscale** | Up to 6x original size | Up to 600% (6x) |
| **Maximum Output** | 32,000px longest side or 2GB file | 32,000px longest side or 2GB file |
| **AI Models** | Core, Generative, Legacy | Core models (simplified) |
| **Additional Features** | Upscaling only | Denoise, Sharpen, Face Recovery, more |
| **Best For** | Maximum upscaling control | Comprehensive photo workflow |

### Key Strengths

- **Specialized AI Models:** Different models optimized for specific image types (photos, graphics, text, AI art)
- **Generative Enhancement:** Advanced models (Recover, Redefine) add detail, not just enlarge
- **Massive Upscaling:** Up to 6x enlargement while maintaining or improving quality
- **Artifact Removal:** Fixes compression artifacts, blur, and low-resolution issues
- **Text Preservation:** Dedicated model for maintaining sharp text and shapes
- **Batch Processing:** Upscale multiple images with consistent settings

### When to Use Topaz

**Use Topaz when you need:**
- Upscaling AI-generated images to print resolution (4K, 8K)
- Restoring old, low-quality, or compressed photos
- Preparing images for large-format printing
- Enhancing screenshots or web images for professional use
- Fixing compression artifacts while enlarging
- Upscaling graphics, illustrations, or text-heavy images

**Consider alternatives when you need:**
- Initial image generation (use Nano Banana Pro, Seedream 4.5, Wan 2.2)
- Content-aware editing (use Reve Edit)
- Video upscaling (use Topaz Video AI, a separate product)

---

## Technical Specifications

### Resolution & Upscaling Limits

| Parameter | Specification |
|-----------|---------------|
| **Maximum Upscale Factor** | 6x (600%) |
| **Maximum Output Size** | 32,000 pixels on longest side |
| **Maximum File Size** | 2GB (whichever limit reached first) |
| **Minimum Input Size** | No minimum (works with any size) |
| **Recommended Input for Generative Models** | 1MP or less (Recover), varies (Redefine) |

### Output Formats

| Format | Quality | File Size | Use Case |
|--------|---------|-----------|----------|
| **TIFF** | Highest | Largest | Print, archival, further editing |
| **JPEG** | Good | Medium | Web, social media, general use |
| **PNG** | High | Medium-Large | Transparency needs, web |
| **RAW/DNG** | Highest | Largest | Professional editing workflows |

### System Requirements

**Core Models (Standard, High Fidelity, Low Resolution, Text & Shapes, Art & CG):**
- Standard computer with dedicated or integrated graphics
- 8GB+ RAM recommended
- Local processing on most hardware

**Generative Models (Recover v2, Redefine):**
- Dedicated graphics card with 8GB+ VRAM (required for local processing)
- 24GB+ system RAM for ARM-based systems
- NOT supported on integrated graphics
- Cloud rendering available for systems that don't meet requirements
- Cloud rendering supports up to 256MP output

### Processing Speed

| Model Type | Speed | Quality | Use Case |
|------------|-------|---------|----------|
| **Core Models** | Fast | High | General upscaling |
| **High Fidelity** | Slower | Highest | Premium quality needed |
| **Recover v2** | Medium | High | Old photo restoration |
| **Redefine** | Slow | Variable | Creative enhancement |

---

## AI Model Selection Framework

### Core Models (Non-Generative)

These models enlarge images while preserving existing details. They do not generate new content.

#### Standard (v2)

**When to Use:**
- General-purpose upscaling for most images
- AI-generated images (Midjourney, DALL-E, Nano Banana Pro, etc.)
- Photos from point-and-shoot cameras or older smartphones
- Graphics and digital artwork

**Characteristics:**
- Balanced approach to detail preservation and artifact reduction
- v2 reduces blurry patches that occurred in v1
- Fastest of the core models for most images

**Example Use Cases:**
```
✓ Upscaling Midjourney outputs from 1024×1024 to 4096×4096 for print
✓ Enhancing smartphone photos for web display
✓ Enlarging digital graphics for presentations
✓ General photography from consumer cameras
```

#### High Fidelity (v2)

**When to Use:**
- High-quality source images from DSLRs or modern smartphones
- Images where preserving original character is critical
- Photos with natural grain or texture you want to maintain
- Professional photography requiring minimal alteration

**Characteristics:**
- Maintains original look with minimal distortion
- Preserves authentic textures and capture details
- v2 option preserves grain/noise for aesthetic purposes
- Slower processing time for better output quality

**Settings Guidance:**
- **Denoise slider:** Lower values preserve grain/noise
- **Fix Compression slider:** Lower values maintain original texture
- Use when original image quality is already high

**Example Use Cases:**
```
✓ DSLR photos for large-format printing
✓ Professional portraits requiring texture preservation
✓ Film scans where grain is part of the aesthetic
✓ Architectural photography with fine detail
```

#### Low Resolution

**When to Use:**
- Screenshots from computers or mobile devices
- Images downloaded from the web (typically 72 ppi)
- Highly compressed JPEG files
- Small social media images being repurposed

**Characteristics:**
- Prioritizes overall quality over fine detail preservation
- Removes blur by default
- Optimized for images with significant compression artifacts

**Example Use Cases:**
```
✓ Web screenshots for documentation or presentations
✓ Social media images being repurposed for print
✓ Low-quality product photos from online sources
✓ Compressed email attachments
```

#### Text & Shapes

**When to Use:**
- Images containing readable text (signs, documents, typography)
- Graphic design with sharp edges and geometric shapes
- Architectural photos with text elements
- Infographics or diagrams

**Characteristics:**
- Enables distinct patterns and shapes during upscaling
- Preserves text legibility and sharpness
- Maintains hard edges on man-made objects

**Example Use Cases:**
```
✓ Street photography with signage
✓ Product photos with visible branding/text
✓ Infographics being enlarged for presentations
✓ Architectural photos with building names/addresses
✓ Screenshots of text-heavy interfaces
```

#### Art & CG

**When to Use:**
- Artwork, drawings, and illustrations
- Computer-generated graphics (3D renders, game assets)
- AI-generated art with stylized elements
- Paintings or sketches (digital or scanned)

**Characteristics:**
- Optimized for non-photographic content
- Preserves artistic style and intentional elements
- Works well with flat colors and stylized rendering

**Example Use Cases:**
```
✓ Digital illustrations for print
✓ 3D renders for marketing materials
✓ AI art (Midjourney, Stable Diffusion) with artistic styles
✓ Scanned traditional artwork
✓ Game assets and concept art
```

### Generative Models

These advanced models add detail and enhance images beyond simple enlargement. They require more powerful hardware or cloud rendering.

#### Recover v2

**When to Use:**
- Old, degraded, or low-quality photographs
- Images 1MP or less (optimal performance)
- Photos with significant quality loss from age or compression
- Restoration projects

**Characteristics:**
- Optimized for speed (faster than Recover v1)
- Brings best upscaling fidelity for old photos
- Adds realistic detail based on AI training
- Detail slider for controlling enhancement intensity

**Pre-Downscaling Feature (v8.4.0+):**
- For images with "false resolution" (enlarged without detail)
- Resamples image to concentrate density, then upscales
- Three intensity levels: None, Low, Medium, High
- Use when images exceed 1000px on both sides
- Ideal for old JPEGs, scanned photos, poorly upscaled content

**Example Use Cases:**
```
✓ Family photos from the 1980s-1990s
✓ Scanned prints with degradation
✓ Old digital camera photos (early 2000s)
✓ Compressed images from early internet era
```

#### Redefine BETA

**When to Use:**
- Low-quality images requiring creative enhancement
- AI-generated images needing more definition
- Images where adding detail is acceptable/desired
- Creative projects allowing interpretation

**Two Modes:**

**Redefine Realistic:**
- None or Subtle adjustment levels
- Maintains realistic fidelity
- Subtle mode enables Image Description input
- For controlled, believable enhancement

**Redefine Creative:**
- Low, Medium, High, Max creativity levels
- Image Description directs changes
- Texture slider refines detail generation
- Allows more dramatic transformations

**Image Description Guidelines:**
- Use descriptive statements, NOT directives
- ✓ "girl with red hair and blue eyes"
- ✗ "change the girl's hair to red and make her eyes blue"
- Be specific about desired details
- Describe what you want to see, not what to change

**Example Use Cases:**
```
✓ AI-generated images lacking detail
✓ Creative reinterpretation of low-quality photos
✓ Artistic enhancement of existing images
✓ Conceptual projects allowing AI interpretation
```

---

## Best Practices

### 1. Select the Correct AI Model

**Why:** Each model is optimized for specific image types. Using the wrong model produces suboptimal results.

**Decision Tree:**

```
Is it a photograph?
├─ Yes → Is it high quality (DSLR, modern phone)?
│   ├─ Yes → High Fidelity
│   └─ No → Is it very low quality or old?
│       ├─ Yes → Recover v2
│       └─ No → Standard
└─ No → Does it contain text or geometric shapes?
    ├─ Yes → Text & Shapes
    └─ No → Is it artwork or CG?
        ├─ Yes → Art & CG
        └─ No → Standard
```

**Quick Reference:**
- **AI-generated images (Midjourney, etc.):** Standard or Art & CG
- **DSLR/professional photos:** High Fidelity
- **Smartphone photos:** Standard
- **Old/degraded photos:** Recover v2
- **Screenshots/web images:** Low Resolution
- **Graphics with text:** Text & Shapes
- **Illustrations/3D renders:** Art & CG

### 2. Only Upscale to Needed Size

**Why:** Larger upscales require more processing time, memory, and may introduce artifacts. Unnecessary upscaling wastes resources.

**Guidelines:**
- **For artifact removal only:** Use 1x scale (no size increase)
- **For web display:** 2x scale usually sufficient
- **For print:** Calculate required resolution based on print size and DPI
- **Maximum quality:** Use highest scale only when truly needed

**Print Resolution Calculator:**
```
Required pixels = Print size (inches) × Desired DPI

Example: 16×20 inch print at 300 DPI
Width: 16 × 300 = 4,800 pixels
Height: 20 × 300 = 6,000 pixels
Total: 4,800 × 6,000 = 28.8 MP

If source is 1,200 × 1,500 (1.8 MP):
Scale factor needed: 4x
```

### 3. Optimize Output Format

**Why:** Different formats serve different purposes and affect file size, quality, and compatibility.

**Format Selection:**
- **TIFF:** Use for print, archival, or further editing (highest quality, largest file)
- **JPEG:** Use for web, social media, or general sharing (good quality, smaller file)
- **PNG:** Use when transparency is needed or for web graphics
- **RAW/DNG:** Use only for professional editing workflows (uses most memory)

**Recommendation:** Export to TIFF for maximum quality, then convert to JPEG for delivery if needed.

### 4. Use Auto Mode for Quick Selection

**Why:** Topaz's Auto Mode analyzes your image and selects the most appropriate model automatically.

**When to Use Auto Mode:**
- Batch processing multiple image types
- Uncertain which model is best
- Quick processing without manual testing

**When to Override Auto Mode:**
- You know the specific model needed
- Auto Mode selection produces suboptimal results
- Specialized use case (text preservation, grain retention, etc.)

**Workflow:**
1. Import image
2. Let Auto Mode select model
3. Preview result
4. If unsatisfactory, manually select different model
5. Use Compare Tool to evaluate options

### 5. Leverage the Compare Tool

**Why:** Side-by-side comparison helps identify which model produces the best results for your specific image.

**How to Use:**
1. Import image
2. Hover over model name header
3. Activate Compare Tool
4. Select 2-4 models to compare
5. Generate previews
6. Zoom in to evaluate details
7. Select best result

**What to Compare:**
- Detail preservation vs. smoothing
- Artifact removal effectiveness
- Text/edge sharpness
- Overall aesthetic quality

### 6. Adjust Additional Settings

**Why:** Fine-tuning additional settings optimizes results for specific image characteristics.

**Minor Denoise:**
- Removes noise before upscaling
- Use for low-light photos or images with visible grain
- **Caution:** Don't use if Remove Noise filter already enabled (overprocessing)

**Minor Deblur:**
- Prevents emphasizing existing blur during upscaling
- Use for images with motion blur, camera shake, or soft focus
- **Caution:** Don't use if Sharpen filter already enabled (overprocessing)

**Fix Compression:**
- Addresses JPEG compression artifacts
- Use for heavily compressed images (web downloads, social media)
- Especially effective with Low Resolution model

**Detail Slider (Recover v2):**
- Controls enhancement intensity
- Lower values: subtle enhancement
- Higher values: more aggressive detail addition

**Creativity Levels (Redefine Creative):**
- Low: Minimal AI interpretation
- Medium: Balanced enhancement
- High: Significant detail addition
- Max: Maximum creative freedom

### 7. Export Locally, Not to Network Drives

**Why:** Exporting to network drives or external hard drives can cause conflicts, slow processing, and potential file corruption.

**Best Practice:**
- Export to local SSD or internal hard drive
- After export completes, move files to network storage if needed
- Ensures fastest processing and avoids write errors

---

## Common Mistakes & Troubleshooting

### Issue 1: Blurry or Soft Results

**Symptom:** Upscaled image lacks sharpness, looks soft or blurry

**Possible Causes:**
- Wrong AI model selected
- Source image quality too low for chosen model
- Minor Deblur enabled when not needed

**Solutions:**
1. **Try Different Model:**
   - If using Standard, try High Fidelity
   - If using High Fidelity, try Standard v2
   - For AI art, try Art & CG instead of Standard

2. **Disable Minor Deblur:**
   - Only use Minor Deblur for images with existing blur
   - Disable if image was already sharp

3. **Use Generative Model:**
   - For very low-quality sources, try Recover v2
   - For AI-generated images, try Redefine

4. **Check Source Quality:**
   - Upscaling cannot create detail that doesn't exist
   - Extremely low-quality sources have inherent limitations

### Issue 2: Artifacts or Distortions

**Symptom:** Upscaled image has visible artifacts, strange patterns, or distortions

**Possible Causes:**
- Inappropriate model for image type
- Over-processing (multiple enhancement filters)
- Source image has severe compression artifacts

**Solutions:**
1. **Switch to Appropriate Model:**
   - For photos: Use Standard or High Fidelity (not Art & CG)
   - For graphics: Use Art & CG or Text & Shapes (not photo models)
   - For compressed images: Use Low Resolution

2. **Enable Fix Compression:**
   - Turn on Fix Compression setting
   - Especially effective for JPEG artifacts

3. **Avoid Over-Processing:**
   - Don't use Minor Denoise + Remove Noise simultaneously
   - Don't use Minor Deblur + Sharpen simultaneously
   - Choose one enhancement method per category

4. **Try Generative Model:**
   - Recover v2 can rebuild severely degraded images
   - Redefine can reinterpret problematic areas

### Issue 3: Text Becomes Unreadable

**Symptom:** Text in image becomes blurry, distorted, or illegible after upscaling

**Possible Causes:**
- Wrong AI model (not optimized for text)
- Text too small in source image

**Solutions:**
1. **Use Text & Shapes Model:**
   - Specifically designed for text preservation
   - Maintains sharp edges on letters and geometric shapes

2. **Increase Upscale Factor:**
   - Small text benefits from higher upscale factors
   - Try 4x or 6x instead of 2x

3. **Check Source Quality:**
   - Extremely low-resolution text may be unrecoverable
   - Consider recreating text elements manually if critical

### Issue 4: Slow Processing or Crashes

**Symptom:** Processing takes very long or software crashes during export

**Possible Causes:**
- Upscaling to unnecessarily large size
- Insufficient system resources
- Using generative models without adequate hardware

**Solutions:**
1. **Reduce Upscale Size:**
   - Only upscale to needed resolution
   - Use 1x if only fixing artifacts

2. **Change Output Format:**
   - Export to JPEG instead of TIFF or RAW/DNG
   - Reduces memory requirements

3. **Use Cloud Rendering:**
   - For generative models (Recover, Redefine)
   - When local system doesn't meet requirements
   - For very large upscales (>100MP)

4. **Close Other Applications:**
   - Free up RAM and VRAM
   - Ensure Topaz has maximum resources available

5. **Process in Batches:**
   - If batch processing, reduce batch size
   - Process 10-20 images at a time instead of hundreds

### Issue 5: Generative Models Unavailable

**Symptom:** Recover v2 or Redefine options are grayed out or not working

**Possible Causes:**
- System doesn't meet hardware requirements
- Integrated graphics (not supported)
- Insufficient VRAM

**Solutions:**
1. **Check System Requirements:**
   - Dedicated graphics card with 8GB+ VRAM required
   - 24GB+ system RAM for ARM-based systems
   - Integrated graphics NOT supported

2. **Use Cloud Rendering:**
   - Available for systems that don't meet requirements
   - Upload image to Topaz cloud servers
   - Download enhanced result
   - Supports up to 256MP output

3. **Use Core Models Instead:**
   - Standard, High Fidelity, Low Resolution work on all systems
   - Still provide excellent results for most use cases

---

## Advanced Techniques

### 1. Two-Pass Upscaling for Maximum Quality

**Technique:** Upscale in two stages using different models for optimal results.

**Workflow:**
1. **First Pass:** Upscale 2-3x with appropriate core model
   - Standard for AI art
   - High Fidelity for photos
   - Low Resolution for compressed images

2. **Second Pass:** Upscale remaining 2-3x with High Fidelity
   - Preserves details added in first pass
   - Reaches final target resolution
   - Often produces better results than single 6x upscale

**Example:**
```
Source: 1024×1024 AI-generated image
Target: 6144×6144 (6x upscale)

Pass 1: 1024×1024 → 3072×3072 (3x with Standard)
Pass 2: 3072×3072 → 6144×6144 (2x with High Fidelity)

Result: Better detail preservation than single 6x Standard upscale
```

**When to Use:**
- Maximum quality needed for print
- Very large upscales (4x or more)
- AI-generated images requiring fine detail

### 2. Model Comparison Workflow

**Technique:** Generate multiple versions with different models, then select the best.

**Workflow:**
1. Import image
2. Activate Compare Tool
3. Select 3-4 relevant models:
   - Standard
   - High Fidelity
   - Low Resolution (if applicable)
   - Art & CG (if applicable)

4. Generate previews
5. Zoom to 100% and examine:
   - Fine details (hair, texture, edges)
   - Text legibility (if present)
   - Artifact presence
   - Overall aesthetic

6. Export with best-performing model

**Time Investment:** 5-10 minutes for comparison vs. potential hours of rework

### 3. Selective Enhancement Pipeline

**Technique:** Combine Topaz with other tools for targeted enhancement.

**Workflow:**
1. **Topaz Upscaling:** Enlarge image with appropriate model
2. **Photoshop/Lightroom:** Selective adjustments (color, exposure, local edits)
3. **Topaz Photo AI (optional):** Additional sharpening or noise reduction
4. **Final Export:** Optimal format for use case

**Example:**
```
1. Topaz Gigapixel: 1024×1024 → 4096×4096 (Standard model)
2. Photoshop: Adjust colors, dodge/burn, selective sharpening
3. Topaz Photo AI: Face recovery, final sharpening
4. Export: TIFF for print, JPEG for web
```

### 4. Recover v2 with Pre-Downscaling

**Technique:** Use pre-downscaling feature for images with false resolution.

**When to Use:**
- Old images previously upscaled poorly
- Scanned photos at unnecessarily high resolution
- Images >1000px on both sides with low information density

**Workflow:**
1. Import image
2. Select Recover v2 model
3. Enable Pre-Downscaling
4. Choose intensity level:
   - **Low:** Subtle resampling
   - **Medium:** Moderate resampling
   - **High:** Aggressive resampling

5. Adjust Detail slider
6. Preview and export

**Result:** Better detail generation by concentrating image density before enhancement

### 5. Redefine Creative with Image Descriptions

**Technique:** Use descriptive prompts to guide generative enhancement.

**Prompt Guidelines:**
- Use descriptive statements, not commands
- Be specific about desired details
- Describe visual characteristics
- Avoid vague terms

**Examples:**

**Portrait Enhancement:**
```
❌ Weak: "Make it better"
✅ Strong: "Woman with smooth skin, bright eyes, natural makeup, soft lighting"

❌ Weak: "Fix the face"
✅ Strong: "Clear facial features with defined eyes, nose, and lips, natural skin texture"
```

**Landscape Enhancement:**
```
❌ Weak: "Add detail"
✅ Strong: "Mountain landscape with sharp peaks, detailed rock textures, clear sky, vibrant green vegetation"

❌ Weak: "Make it look good"
✅ Strong: "Crisp architectural details, clean windows, defined brick texture, clear signage"
```

**Workflow:**
1. Select Redefine Creative
2. Choose creativity level (start with Medium)
3. Write descriptive image description
4. Adjust Texture slider
5. Preview small area first
6. If satisfactory, preview entire image or export
7. Iterate description if needed

---

## Use Case Examples

### 1. Upscaling AI-Generated Images for Print

**Scenario:** Midjourney image (1024×1024) needs to be printed at 16×20 inches at 300 DPI.

**Requirements:**
- Target resolution: 4,800 × 6,000 pixels
- Upscale factor: ~5x
- Maintain AI art aesthetic
- Print-ready quality

**Workflow:**
1. **Import to Topaz Gigapixel**
   - Load 1024×1024 Midjourney output

2. **Select AI Model**
   - Use **Standard** (optimized for AI-generated images)
   - Alternative: **Art & CG** if stylized

3. **Set Dimensions**
   - Width: 4,800 pixels
   - Height: 6,000 pixels
   - Scale: ~5x

4. **Adjust Settings**
   - Minor Denoise: Off (AI images usually clean)
   - Minor Deblur: Off
   - Fix Compression: Off

5. **Export**
   - Format: TIFF (highest quality for print)
   - Location: Local drive

6. **Post-Processing (Optional)**
   - Import to Photoshop for color adjustments
   - Convert to CMYK if needed for commercial printing

**Cost:** One-time software purchase ($99-199)  
**Time:** 2-5 minutes processing  
**Result:** Print-ready 4,800 × 6,000 image maintaining AI art quality

### 2. Restoring Old Family Photos

**Scenario:** Scanned family photo from 1985, 600×800 pixels, faded and compressed.

**Requirements:**
- Remove degradation
- Enhance details
- Upscale for 8×10 print (2,400 × 3,000 at 300 DPI)

**Workflow:**
1. **Import to Topaz Gigapixel**
   - Load 600×800 scanned photo

2. **Select AI Model**
   - Use **Recover v2** (optimized for old, degraded photos)
   - Image is <1MP (ideal for Recover)

3. **Enable Pre-Downscaling**
   - Set to **Low** or **None** (image already small)

4. **Adjust Detail Slider**
   - Start at 50%
   - Preview and adjust based on results
   - Higher values add more detail (may look less authentic)

5. **Set Dimensions**
   - Width: 2,400 pixels
   - Height: 3,000 pixels
   - Scale: 4x

6. **Export**
   - Format: TIFF for further editing, JPEG for sharing

7. **Post-Processing**
   - Import to Photoshop or Lightroom
   - Color correction (remove fading)
   - Spot removal (dust, scratches)
   - Final sharpening

**Result:** Restored, print-ready 8×10 photo with enhanced details

### 3. Enhancing Screenshots for Documentation

**Scenario:** Software interface screenshot (1920×1080) needs to be enlarged for training materials while maintaining text legibility.

**Requirements:**
- Upscale to 3840×2160 (2x)
- Preserve text sharpness
- Maintain UI element clarity

**Workflow:**
1. **Import to Topaz Gigapixel**
   - Load 1920×1080 screenshot

2. **Select AI Model**
   - Use **Text & Shapes** (optimized for text preservation)

3. **Set Dimensions**
   - Width: 3840 pixels
   - Height: 2160 pixels
   - Scale: 2x

4. **Adjust Settings**
   - Minor Denoise: Off
   - Minor Deblur: Off
   - Fix Compression: On (if screenshot was saved as JPEG)

5. **Export**
   - Format: PNG (maintains sharp edges, supports transparency if needed)

**Result:** Crisp, readable 4K screenshot suitable for presentations or documentation

### 4. Preparing Web Images for Print

**Scenario:** Product photo downloaded from website (800×800, 72 DPI) needs to be printed in catalog (5×5 inches at 300 DPI).

**Requirements:**
- Target resolution: 1,500 × 1,500 pixels
- Upscale factor: ~2x
- Remove web compression artifacts
- Print-ready quality

**Workflow:**
1. **Import to Topaz Gigapixel**
   - Load 800×800 web image

2. **Select AI Model**
   - Use **Low Resolution** (optimized for web images)

3. **Set Dimensions**
   - Width: 1,500 pixels
   - Height: 1,500 pixels
   - Resolution: 300 DPI

4. **Adjust Settings**
   - Fix Compression: On (web images often compressed)
   - Minor Denoise: On (if image has noise)

5. **Export**
   - Format: TIFF for print preparation

6. **Post-Processing**
   - Color correction for print (CMYK conversion if needed)
   - Final sharpening

**Result:** Print-ready product photo at correct resolution and DPI

### 5. Batch Processing AI Art Collection

**Scenario:** 100 AI-generated images (various sizes, mostly 1024×1024) need to be upscaled to 4K for portfolio website.

**Requirements:**
- Target resolution: 3840×2160 or similar 4K dimensions
- Consistent quality across all images
- Efficient processing

**Workflow:**
1. **Import Batch to Topaz Gigapixel**
   - Drag and drop all 100 images

2. **Select AI Model**
   - Use **Auto Mode** (analyzes each image)
   - Or manually select **Standard** for consistency

3. **Set Dimensions**
   - Use "Fit to" 3840×2160 (maintains aspect ratios)
   - Or set specific dimensions if all images same size

4. **Adjust Settings**
   - Minor Denoise: Off
   - Minor Deblur: Off
   - Fix Compression: Off

5. **Set Output**
   - Format: JPEG (web-optimized, smaller files)
   - Quality: 90-95%
   - Location: Dedicated output folder

6. **Start Batch Processing**
   - Process overnight or during off-hours
   - Review results in morning

7. **Quality Check**
   - Spot-check 10-20 images
   - If issues found, reprocess problematic images with different model

**Time:** 5-10 hours processing (unattended)  
**Result:** 100 4K images ready for web portfolio

---

## Integration Workflows

### Workflow 1: AI Generation → Topaz Upscale → Print

**Use Case:** Create AI art and prepare for large-format printing.

**Steps:**
1. **Generate with AI Model** (Nano Banana Pro, Midjourney, etc.)
   - Create image at maximum available resolution
   - Cost: $0.03-0.05 per image

2. **Upscale with Topaz Gigapixel**
   - Use Standard or Art & CG model
   - Upscale to print resolution (calculate based on print size and DPI)
   - Cost: One-time software purchase

3. **Post-Process (Optional)**
   - Color adjustments in Photoshop/Lightroom
   - CMYK conversion for commercial printing

4. **Print**
   - Export as TIFF or high-quality JPEG
   - Send to printer

**Total Time:** 5-15 minutes per image  
**Result:** Gallery-quality prints from AI-generated art

### Workflow 2: Photo Shoot → Topaz Enhance → Delivery

**Use Case:** Professional photography workflow with AI enhancement.

**Steps:**
1. **Capture Photos** (DSLR, mirrorless camera)
   - Shoot in RAW format
   - Standard professional photography workflow

2. **Initial Processing** (Lightroom, Capture One)
   - RAW development
   - Color grading
   - Basic retouching
   - Export as TIFF or high-quality JPEG

3. **Upscale with Topaz Gigapixel** (if needed)
   - Use High Fidelity model
   - Upscale for specific deliverables (large prints, billboards)

4. **Final Retouching** (Photoshop)
   - Advanced retouching
   - Compositing if needed

5. **Delivery**
   - Export in client-specified formats
   - Multiple resolutions (web, print, archival)

**Result:** Professional-quality images with AI-enhanced resolution when needed

### Workflow 3: Topaz Upscale → Reve Edit → Final Output

**Use Case:** Upscale an image, then make content-aware edits.

**Steps:**
1. **Upscale with Topaz Gigapixel**
   - Enlarge to desired resolution
   - Use appropriate model for image type
   - Export as PNG (for further editing)

2. **Edit with Reve**
   - Make content-aware changes (background, objects, lighting)
   - Natural language prompts
   - Cost: $0.04 per edit

3. **Final Export**
   - Save in final delivery format

**Example:**
```
1. Topaz: 1024×1024 → 4096×4096 (Standard model)
2. Reve: "Change background to sunset beach, add palm trees"
3. Export: 4096×4096 final image with edited content
```

**Total Cost:** Topaz (one-time) + $0.04 per Reve edit  
**Result:** High-resolution image with content modifications

### Workflow 4: Scan → Topaz Restore → Archive

**Use Case:** Digitize and restore old photo collection.

**Steps:**
1. **Scan Physical Photos**
   - Use flatbed scanner at 600-1200 DPI
   - Save as TIFF for maximum quality

2. **Restore with Topaz Gigapixel**
   - Use Recover v2 model
   - Enable Pre-Downscaling if needed
   - Adjust Detail slider for optimal results
   - Export as TIFF

3. **Color Correction** (Photoshop/Lightroom)
   - Remove color casts from aging
   - Adjust exposure and contrast
   - Spot removal (dust, scratches)

4. **Archive**
   - Save master TIFF files
   - Create JPEG versions for sharing
   - Organize with metadata (dates, people, locations)

**Result:** Restored, archival-quality digital photo collection

### Workflow 5: Multi-Model Pipeline for Maximum Quality

**Use Case:** Critical project requiring absolute best quality.

**Steps:**
1. **Initial Upscale** (Topaz Gigapixel)
   - First pass: 2-3x with appropriate core model
   - Export as TIFF

2. **Second Upscale** (Topaz Gigapixel)
   - Second pass: 2-3x with High Fidelity
   - Reaches final target resolution
   - Export as TIFF

3. **Enhancement** (Topaz Photo AI)
   - Noise reduction if needed
   - Sharpening
   - Face recovery (for portraits)

4. **Final Retouching** (Photoshop)
   - Selective adjustments
   - Local sharpening
   - Color grading

5. **Export**
   - Master: TIFF (archival)
   - Delivery: Format as needed (JPEG, PNG, etc.)

**Time Investment:** 20-30 minutes per image  
**Result:** Maximum possible quality for critical projects

---

## Quick Reference

### AI Model Selection Chart

| Image Type | Recommended Model | Alternative |
|------------|-------------------|-------------|
| AI-generated (Midjourney, DALL-E) | Standard | Art & CG |
| DSLR / Professional photos | High Fidelity | Standard |
| Smartphone photos | Standard | High Fidelity |
| Old / degraded photos | Recover v2 | Low Resolution |
| Screenshots / web images | Low Resolution | Text & Shapes |
| Graphics with text | Text & Shapes | Standard |
| Illustrations / 3D renders | Art & CG | Standard |
| Highly compressed images | Low Resolution | Standard |

### Upscale Factor Guidelines

| Use Case | Recommended Scale |
|----------|-------------------|
| Artifact removal only | 1x (no enlargement) |
| Web display | 2x |
| Standard print (8×10) | 2-3x |
| Large print (16×20) | 4-5x |
| Maximum quality | 6x (if needed) |

### Output Format Guidelines

| Format | Quality | Size | Use Case |
|--------|---------|------|----------|
| TIFF | Highest | Largest | Print, archival, further editing |
| JPEG (95%) | High | Medium | Web, sharing, general use |
| JPEG (85%) | Good | Small | Web-optimized, social media |
| PNG | High | Medium-Large | Transparency, web graphics |

### System Requirements Quick Check

| Feature | Core Models | Generative Models |
|---------|-------------|-------------------|
| Graphics | Integrated or Dedicated | Dedicated 8GB+ VRAM only |
| RAM | 8GB+ | 24GB+ (ARM systems) |
| Processing | Local | Local or Cloud |
| Speed | Fast | Slower |

---

## Resources

### Official Documentation
- **Topaz Labs Website:** https://www.topazlabs.com/
- **Topaz Gigapixel AI:** https://www.topazlabs.com/topaz-gigapixel
- **Topaz Photo AI:** https://www.topazlabs.com/topaz-photo-ai
- **Documentation:** https://docs.topazlabs.com/
- **Community Forum:** https://community.topazlabs.com/

### Tutorials & Learning
- **Official Video Tutorials:** https://www.topazlabs.com/learn
- **YouTube Channel:** Topaz Labs official channel
- **Workflow Tutorials:** https://docs.topazlabs.com/topaz-photo/workflow-tutorials

### Related Tools
- **Topaz Video AI:** Video upscaling and enhancement
- **Topaz Photo AI:** Comprehensive photo enhancement suite
- **Reve Edit:** Natural language image editing (complements Topaz)
- **Photoshop/Lightroom:** Professional editing integration

---

**Last Updated:** January 2026  
**Version:** 1.0  
**Software Versions:** Topaz Gigapixel AI 8.x, Topaz Photo AI 3.x
