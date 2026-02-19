# Wan 2.2 Image Prompting Mastery Guide

Model: Wan 2.2 Text-to-Image Realism
Developer: Alibaba / Wan AI
Specialty: Photorealistic image generation with detailed human rendering
Version: 2.2
Last Updated: February 2026



## Table of Contents

Model Overview

Technical Specifications

Prompt Structure Framework

Best Practices

Common Mistakes & Troubleshooting

Advanced Techniques

Genre-Specific Examples

Integration Workflows



## Model Overview

### What is Wan 2.2 Image?

Wan 2.2 Text-to-Image Realism is a specialized photorealistic image generation model optimized for creating lifelike scenes, authentic human subjects, and natural environments. It excels at generating images that look like real photographs, making it ideal for lifestyle photography, group portraits, marketing visuals, and concept visualization.

### Key Strengths

Photorealistic Focus: Optimized specifically for realistic, photograph-like outputs

Detailed Human Rendering: Excels at natural skin tones, expressions, and group compositions

Custom Dimensions: Precise control over width and height for any aspect ratio

High Resolution Support: Generate images up to 1280×720 and beyond

Prompt Enhancer: Built-in tool to refine and expand descriptions automatically

Reproducible Results: Use seed parameter to recreate exact outputs or explore variations

### When to Use Wan 2.2 Image

Use Wan 2.2 Image when you need:


Authentic lifestyle scenes and stock photography

Realistic multi-person compositions with natural interactions

Believable outdoor settings, gatherings, and events

Photorealistic visuals for marketing and advertising campaigns

Concept visualization for presentations and pitches


Consider alternatives when you need:


Artistic or stylized outputs (use Midjourney, Nano Banana Pro)

Maximum 4K resolution (use Seedream 4.5, Nano Banana Pro)

Cinematic camera control (use Higgsfield Cinema Studio)

Fast speed-optimized generation (use FLUX.2)



## Technical Specifications

### Resolution & Dimensions

### Output Formats

### Performance

### API Parameters

prompt (required): Detailed text description

width (optional): Output width in pixels (256-1536)

height (optional): Output height in pixels (256-1536)

seed (optional): Random seed for reproducibility (-1 for random)

output_format (optional): jpeg, png, or webp (default: jpeg)

enable_sync_mode (optional): Wait for result before returning (API only)

enable_base64_output (optional): Return BASE64 string instead of URL (API only)




## Prompt Structure Framework

### Basic Formula (Simple Prompts)

For beginners or quick generation:


Prompt = Subject + Scene + Motion



Subject: The main focus (person, animal, plant, object, or imagined entity)
Scene: The environment (background, foreground, real or fictional setting)
Motion: Movement characteristics (stillness, subtle movements, or dynamic action)


Example:


A young woman sitting at a cafe table, outdoor patio setting, gently sipping coffee

### Advanced Formula (Detailed Prompts)

For experienced users seeking high-quality, vivid results:


Prompt = Subject (Description) + Scene (Description) + Motion (Description) + Aesthetic Control + Stylization



Subject Description: Detailed appearance using adjectives or short phrases
Scene Description: Detailed environment characteristics
Motion Description: Amplitude, speed, and effects of movement
Aesthetic Control: Light source, lighting environment, shot size, camera angle, lens, camera movement
Stylization: Visual style (photorealistic, cinematic, documentary, etc.)


Example:


A group of four women are seated around a wooden picnic table outdoors at a backyard gathering. The woman in the foreground, light-skinned and young adult, has shoulder-length light brown hair and a friendly, smiling expression. She's wearing a white, sleeveless top with small, pearl-like embellishments on the shoulders. The background shows several people in light-colored clothing, and a long wooden table with wine bottles, glasses, candles, and food on it. The setting is a backyard at twilight, with trees and a string of outdoor lights creating a warm ambiance. A large white paper lantern hangs above the gathering. The composition is casual, focusing on the smiling woman seated at the table. The perspective is from slightly above and a bit to the left of the woman's position. The lighting is soft, warm, and ambient, highlighting the faces and creating a welcoming atmosphere. Colors are muted and natural tones with pops of light from the candles and lights. The overall style is casual and social, evoking a friendly backyard dinner party.

### Prompt Enhancer Feature

Wan 2.2 includes a built-in Prompt Enhancer that automatically refines and expands your descriptions:


How to Use:


Write a basic prompt (e.g., "Woman at cafe")

Click "Prompt Enhancer" button

System automatically expands to detailed prompt

Review and adjust if needed

Generate


Example Transformation:


Input: "Woman at cafe"

Enhanced: "A young woman with shoulder-length brown hair sits at a small round cafe table on an outdoor patio. She's wearing a casual white blouse and has a warm, friendly expression. A cappuccino sits on the table in front of her. The background shows blurred cafe umbrellas and other patrons. Natural daylight creates soft shadows. The atmosphere is relaxed and inviting."



## Best Practices

### 1. Be Extremely Detailed

Why: Wan 2.2 excels with detailed prompts. The more specific you are, the more realistic and controlled the output.


How:


Describe physical features (hair color, length, style; eye color; skin tone; age)

Specify clothing (type, color, style, accessories)

Detail expressions (smiling, pensive, confident, relaxed)

Include positioning (sitting, standing, leaning, walking)


Example:


❌ Weak: "A man in a suit"

✅ Strong: "A middle-aged businessman with short gray hair and a confident expression, wearing a navy blue three-piece suit with a burgundy tie, standing with arms crossed, professional studio lighting"

### 2. Include Lighting Details

Why: Lighting is critical for photorealism. Wan 2.2 responds well to specific lighting descriptions.


Lighting Types:


Natural sunlight - Golden hour, midday, overcast

Soft studio lighting - Even, flattering, professional

Ambient lighting - Warm, atmospheric, environmental

Side lighting - Dramatic, sculptural, dimensional

Backlighting - Silhouette, halo effect, ethereal

Mixed lighting - Multiple sources, complex, realistic


Example:


"Natural morning light streams through large windows, creating soft shadows and a warm golden glow on the subject's face"

### 3. Specify Skin Tones and Ages

Why: Wan 2.2 excels at accurate human rendering when given specific demographic details.


How:


Skin Tone: Light-skinned, medium-skinned, dark-skinned, olive-toned

Age: Young adult (20-30), middle-aged (40-50), elderly (60+), teenager

Distinguishing Features: Freckles, wrinkles, laugh lines, dimples


Example:


"A light-skinned young adult woman, approximately 25 years old, with subtle freckles across her nose and cheeks, natural makeup, and a warm smile showing slight dimples"

### 4. Describe Environment and Background

Why: Grounding the scene in a realistic environment enhances overall photorealism.


Elements to Include:


Setting: Indoor/outdoor, specific location type

Background Elements: Furniture, architecture, nature, people

Foreground Elements: Objects, textures, depth cues

Atmosphere: Time of day, weather, mood


Example:


"The scene takes place in a contemporary open-plan kitchen with white marble countertops, stainless steel appliances, and large windows overlooking a garden. Potted herbs sit on the windowsill. The background is slightly blurred, showing a dining area with wooden chairs."

### 5. Use Appropriate Dimensions

Why: Different subjects and compositions work better at specific aspect ratios.


Dimension Guidelines:


Group Scenes: 1280×720 (16:9 landscape) - captures multiple people and environment

Individual Portraits: 720×1280 (9:16 portrait) - focuses on single subject

Product Photography: 1024×1024 (1:1 square) - balanced, social media-friendly

Environmental Shots: 1216×832 (3:2 landscape) - classic photography ratio

### 6. Leverage Seed for Consistency

Why: The seed parameter allows you to recreate exact outputs or explore controlled variations.


How to Use:


Random Generation: Set seed to -1 for completely random results

Reproducibility: Use a specific seed number (e.g., 12345) to recreate the exact same image

Controlled Variation: Keep the same seed, change only one prompt element to see isolated effects


Example Workflow:


Generate image with seed -1, get seed 87654 in result

Love the composition but want different lighting

Regenerate with seed 87654 and updated lighting description

Result maintains same composition with new lighting



## Common Mistakes & Troubleshooting

### Issue 1: Vague or Generic Results

Symptom: Generated images lack specificity, look generic or stock-photo-like


Cause: Prompt is too short or lacks detail


Solution:


Add 3-5 specific descriptive details per element

Include physical characteristics, clothing details, environmental specifics

Use the Prompt Enhancer to expand basic prompts


Example Fix:


❌ Before: "Woman at office"

✅ After: "A professional woman in her mid-30s with shoulder-length dark hair pulled back in a neat ponytail, wearing a charcoal gray blazer over a white blouse, sitting at a modern glass desk in a bright corner office with floor-to-ceiling windows, natural daylight, focused expression while reviewing documents"

### Issue 2: Unrealistic Skin Tones or Faces

Symptom: Faces look artificial, skin tones are off, expressions are unnatural


Cause: Insufficient description of human features or conflicting style directions


Solution:


Specify skin tone explicitly (light-skinned, medium-skinned, dark-skinned)

Describe facial features (eyes, nose, mouth, expression)

Avoid mixing "photorealistic" with "artistic" or "illustrated" style terms

Use natural lighting descriptions


Example Fix:


❌ Before: "Portrait of a person, artistic style"

✅ After: "Photorealistic portrait of a light-skinned man in his 40s with warm brown eyes, slight smile, natural skin texture with subtle laugh lines, soft studio lighting, neutral gray background"

### Issue 3: Poor Multi-Person Compositions

Symptom: Group shots have awkward positioning, people look disconnected, unnatural interactions


Cause: Lack of spatial and relational descriptions


Solution:


Describe each person's position relative to others (foreground, background, left, right)

Specify interactions (looking at each other, conversing, laughing together)

Include environmental context that grounds the group

Describe the overall composition (centered, left-heavy, right-heavy)


Example Fix:


❌ Before: "Four people at a party"

✅ After: "Four friends gathered around a wooden picnic table at an outdoor evening gathering. The woman in the foreground (center-left) faces the camera with a warm smile, while two others sit across from her engaged in conversation. A fourth person stands in the background near the food table. The composition is balanced with the main subject in sharp focus and the background slightly blurred. String lights overhead create warm ambient lighting."

### Issue 4: Inconsistent or Wrong Aspect Ratio

Symptom: Subject is cropped awkwardly, composition feels cramped or too spacious


Cause: Wrong aspect ratio selected for the subject matter


Solution:


Portraits (single person): Use 9:16 (720×1280) or 2:3 (832×1216)

Group shots: Use 16:9 (1280×720) or 3:2 (1216×832)

Product/object: Use 1:1 (1024×1024) or 4:3 (1152×864)

Environmental/landscape: Use 16:9 (1280×720)

### Issue 5: Generation Time Varies

Symptom: Some images generate quickly, others take longer


Cause: Resolution, complexity, and current queue load affect generation time


Solution:


For faster generation: Use lower resolutions (720p instead of 1280p)

For consistent speed: Generate during off-peak hours

For batch work: Submit multiple requests and process results asynchronously



## Advanced Techniques

### 1. Prompt Layering for Complex Scenes

Technique: Build prompts in layers, starting with the most important elements and adding details progressively.


Structure:


Core Subject (who/what is the main focus)

Primary Action/Pose (what they're doing)

Immediate Environment (where they are)

Secondary Elements (supporting details)

Lighting & Atmosphere (mood and quality)

Technical Details (camera angle, composition)


Example:


Layer 1 (Core): "A professional chef in her 30s"

Layer 2 (Action): "carefully plating a gourmet dish"

Layer 3 (Environment): "in a modern restaurant kitchen with stainless steel surfaces"

Layer 4 (Secondary): "sous chefs working in the blurred background, fresh ingredients on the counter"

Layer 5 (Lighting): "bright overhead kitchen lighting with warm accent lights on the plating station"

Layer 6 (Technical): "medium close-up shot from slightly above, focused on her hands and the dish, shallow depth of field"


Final Prompt: "A professional chef in her 30s carefully plating a gourmet dish in a modern restaurant kitchen with stainless steel surfaces. Sous chefs work in the blurred background, fresh ingredients on the counter. Bright overhead kitchen lighting with warm accent lights on the plating station. Medium close-up shot from slightly above, focused on her hands and the dish, shallow depth of field."

### 2. Seed-Based Iteration Workflow

Technique: Use seed control to iterate on successful compositions while changing specific elements.


Workflow:


Generate initial image with seed -1

Identify successful result, note the seed number

Create variations by changing one element at a time while keeping the seed

Compare results to understand which changes work best


Example Iteration:


Base (seed 12345): "Woman at cafe, morning light"

Iteration 1 (seed 12345): "Woman at cafe, golden hour light" → Changes only lighting

Iteration 2 (seed 12345): "Woman at cafe, morning light, wearing red dress" → Changes only clothing

Iteration 3 (seed 12345): "Woman at cafe, morning light, smiling" → Changes only expression

### 3. Prompt Enhancer + Manual Refinement

Technique: Use the built-in Prompt Enhancer as a starting point, then manually refine for specific needs.


Workflow:


Write basic prompt

Click Prompt Enhancer

Review enhanced prompt

Manually adjust specific details (lighting, expressions, positioning)

Generate


Example:


Input: "Family breakfast"

Enhanced: "A family of four enjoying breakfast in a sunny modern kitchen, natural morning light through windows, warm and authentic atmosphere"

Manual Refinement: "A family of four enjoying breakfast in a sunny modern kitchen with white cabinets and marble countertops. The mother, a light-skinned woman in her mid-30s with brown hair, pours orange juice while the father, a dark-skinned man in his 40s, reads the newspaper. Two children, ages 8 and 10, sit at the table eating pancakes. Natural morning light streams through large windows behind them, creating soft shadows. The atmosphere is warm, relaxed, and authentic. Shot from a medium distance, eye-level perspective, capturing the entire scene."

### 4. Multi-Pass Generation for Best Results

Technique: Generate multiple variations (4-8 images) and select the best one, rather than trying to perfect a single prompt.


Why: Wan 2.2 has inherent randomness; generating multiple options increases chances of an exceptional result.


Workflow:


Write a strong, detailed prompt

Generate 4-8 images with seed -1 (random)

Review all results

Select the best 1-2 images

Note their seed numbers for future use or variation


Cost Consideration:


4 generations = $0.10

8 generations = $0.20

Increases success rate significantly for critical projects

### 5. Cross-Model Translation

Technique: Use Wan 2.2 Image as part of a multi-model workflow for enhanced results.


Workflow Options:


Option A: Wan 2.2 → Reve Edit


Generate base image with Wan 2.2 ($0.025)

Refine specific elements with Reve Edit ($0.04)

Total: $0.065 per final image


Option B: Wan 2.2 → Topaz Upscale


Generate image at 1280×720 with Wan 2.2 ($0.025)

Upscale to 4K with Topaz ($0.05-0.10)

Total: $0.075-0.125 per final image


Option C: Wan 2.2 → Wan 2.6 Video


Generate hero frame with Wan 2.2 ($0.025)

Animate with Wan 2.6 image-to-video ($0.15-0.30)

Total: $0.175-0.325 per video clip



## Genre-Specific Examples

### 1. Lifestyle & Stock Photography

Prompt:


A group of four diverse young professionals collaborating in a modern co-working space. In the foreground, a light-skinned woman with long brown hair in a casual blue sweater leans over a laptop, pointing at the screen. To her left, a dark-skinned man in a white button-down shirt nods in agreement. In the background, two others (one Asian woman, one Hispanic man) review documents at a standing desk. The space features exposed brick walls, large windows with natural daylight, indoor plants, and modern furniture. The lighting is bright and natural, creating a productive and collaborative atmosphere. Shot from a medium distance, eye-level perspective, capturing the entire group and environment. Colors are vibrant but natural, emphasizing the modern, professional setting.



Settings:


Dimensions: 1280×720 (16:9 landscape)

Output Format: JPEG

Seed: -1 (random)

### 2. Group Portraits

Prompt:


A multi-generational family portrait in a living room setting. In the center, an elderly couple (both light-skinned, in their 70s) sit on a beige sofa, smiling warmly. The grandmother wears a soft lavender cardigan, the grandfather a gray sweater vest. Standing behind them are their adult children: a middle-aged woman in a burgundy blouse (left) and a middle-aged man in a navy blazer (right). Seated on the floor in front are three grandchildren (ages 5, 8, and 12) in casual colorful clothing, all smiling naturally. The living room has cream-colored walls, family photos on the wall behind them, a wooden coffee table with flowers in the foreground. Soft, even lighting from large windows to the left creates a warm, inviting atmosphere. The composition is balanced and centered, shot from eye-level at a medium distance, capturing everyone clearly with natural expressions.



Settings:


Dimensions: 1216×832 (3:2 landscape)

Output Format: PNG (for highest quality)

Seed: -1 (random)

### 3. Environmental Scenes

Prompt:


A bustling outdoor farmers market on a sunny Saturday morning. In the foreground, a young couple (woman with red hair in a denim jacket, man with short brown hair in a plaid shirt) examines fresh produce at a vegetable stand. The vendor, a middle-aged man in an apron, smiles and hands them a basket of tomatoes. In the middle ground, other shoppers browse colorful flower stalls and artisan bread displays. The background shows white canvas tents, trees, and a clear blue sky. Golden morning sunlight creates long shadows and highlights the vibrant colors of fruits, vegetables, and flowers. The atmosphere is lively, authentic, and community-oriented. Shot from a medium distance, slightly elevated perspective, capturing the depth and activity of the market scene.



Settings:


Dimensions: 1280×720 (16:9 landscape)

Output Format: JPEG

Seed: -1 (random)

### 4. Marketing & Advertising

Prompt:


Professional product photography setup: A light-skinned woman in her 30s with sleek black hair pulled back, wearing a crisp white blouse, holds a modern smartphone at eye level, smiling confidently at the camera. The phone screen displays a colorful app interface (blurred but recognizable). She stands in a minimalist office environment with soft gray walls, a glass desk visible in the background, and a potted succulent plant. The lighting is professional studio-quality: soft key light from the left, subtle fill light from the right, creating even illumination on her face and the product. The background is slightly out of focus, emphasizing the subject and phone. The overall mood is professional, modern, and aspirational. Shot from a medium close-up distance, eye-level perspective, centered composition.



Settings:


Dimensions: 1024×1024 (1:1 square) for social media

Output Format: PNG (for highest quality and potential transparency)

Seed: -1 (random), then select best and note seed for variations

### 5. Concept Visualization

Prompt:


A realistic mockup of a future smart home living room. A diverse family of four (light-skinned mother, dark-skinned father, two mixed-race children) interacts with various smart devices. The mother uses a wall-mounted touchscreen interface to adjust lighting. The father speaks to a voice assistant speaker on the coffee table. One child (age 10) wears AR glasses, gesturing at virtual displays visible only to them. The other child (age 7) plays with a holographic toy. The room features modern minimalist furniture, large windows showing a city skyline at dusk, ambient LED lighting that changes color based on activity. The technology is integrated naturally, not overwhelming the scene. Soft, warm lighting creates a cozy atmosphere despite the futuristic elements. Shot from a wide angle, slightly elevated perspective, capturing the entire room and all family members. The style is photorealistic but aspirational, showing a believable near-future scenario.



Settings:


Dimensions: 1280×720 (16:9 landscape)

Output Format: PNG (for presentation quality)

Seed: -1 (random), generate 4-8 variations for client review



## Integration Workflows

### Workflow 1: Wan 2.2 → Reve Edit → Final Output

Use Case: Generate a base image, then refine specific elements without regenerating the entire scene.


Steps:


Generate Base Image with Wan 2.2


Create detailed prompt for overall scene

Generate at desired resolution

Cost: $0.025


Refine with Reve Edit


Upload Wan 2.2 output to Reve

Use natural language prompts to adjust specific elements:

"Change the background to sunset"

"Add a friend next to the main subject"

"Make the lighting warmer"

Cost: $0.04


Final Output


Total cost: $0.065

Total time: ~8-10 seconds


Example:


Wan 2.2 Prompt: "Woman sitting at cafe, morning light, white dress"

Reve Edit Prompt: "Change the dress to red and add a coffee cup on the table"

Result: Same composition and lighting, but with red dress and coffee cup added

### Workflow 2: Wan 2.2 → Topaz Upscale → High-Res Output

Use Case: Generate images at moderate resolution, then upscale to 4K for print or high-quality digital use.


Steps:


Generate at 1280×720 with Wan 2.2


Faster generation at lower resolution

Cost: $0.025


Upscale with Topaz


4x upscale to 2560×1440 or higher

Preserves photorealistic quality

Cost: $0.05-0.10


Final Output


Total cost: $0.075-0.125

Total time: ~15-20 seconds

Result: 4K photorealistic image suitable for print

### Workflow 3: Wan 2.2 → Wan 2.6 Video → Animated Content

Use Case: Create a photorealistic hero frame, then animate it for video content.


Steps:


Generate Hero Frame with Wan 2.2


Create detailed, photorealistic still image

Ensure composition is motion-ready (subject has space to move)

Cost: $0.025


Animate with Wan 2.6 Image-to-Video


Upload Wan 2.2 output as reference image

Describe desired motion (subtle, natural movements)

Generate 5-10 second video clip

Cost: $0.15-0.30


Final Output


Total cost: $0.175-0.325 per clip

Total time: ~30-60 seconds

Result: Photorealistic animated video


Example:


Wan 2.2 Prompt: "Woman sitting at cafe table, morning light, holding coffee cup, natural smile"

Wan 2.6 Motion Prompt: "She slowly brings the coffee cup to her lips, takes a sip, and sets it back down. Subtle head movement, natural blinking, soft smile throughout. Camera remains static."

Result: 5-second photorealistic video clip of woman drinking coffee

### Workflow 4: Multi-Model Comparison for Best Results

Use Case: Generate the same scene across multiple models, then select the best result.


Steps:


Generate with Wan 2.2 ($0.025)


Photorealistic, detailed human rendering


Generate with Nano Banana Pro ($0.03)


4K resolution, reasoning-guided synthesis


Generate with Seedream 4.5 ($0.04)


Best-in-class text rendering, 4K resolution


Compare Results


Evaluate based on: realism, composition, lighting, subject accuracy

Select best result or combine elements using Reve Edit


Final Output


Total cost: $0.095 for 3 variations

Best result selected based on specific project needs



## Quick Reference

### Prompt Formula Cheat Sheet

Basic: Subject + Scene + Motion

Advanced: Subject (Description) + Scene (Description) + Motion (Description) + Aesthetic Control + Stylization

### Dimension Quick Guide

### Lighting Quick Reference

### Cost Calculator



## Resources

### Official Documentation

WaveSpeed AI Wan 2.2: https://wavespeed.ai/models/wavespeed-ai/wan-2.2/text-to-image-realism

Hugging Face Wan Guide: https://huggingface.co/blog/MonsterMMORPG/how-to-prompt-wan-models-full-tutorial-and-guide

### Community Resources

Wan AI Official Website: https://wan.video/

Reddit r/WanAI: Community discussions and examples

### Related Models

Wan 2.6 Video: Multi-shot cinematic storytelling

Wan 2.2 Image-to-Video: Animate Wan 2.2 outputs

Reve Edit: Refine Wan 2.2 outputs with natural language




Last Updated: February 2026
Version: 1.0
Model Version: Wan 2.2 Text-to-Image Realism


