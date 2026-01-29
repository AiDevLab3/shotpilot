# Character Consistency Research Notes

## Source: Artlist Blog - Consistent Character AI

### Key Techniques for Character Consistency

**1. Build a Detailed Character Bible**
- Document every defining element of the character
- Facial features, age, skin tone
- Hair style and color
- Clothing and accessories
- Posture and body type
- Personality traits, vocal tone, speech quirks
- Use the same language every time you prompt
- Can train a personalized GPT on character profiles to generate consistent prompts
- Reduces "drift" and keeps visuals stable

**2. Use High-Quality Image References**
- Always start with a strong reference image
- Upload a single, high-resolution picture as an anchor point
- Use image-to-video to create motion directly from reference
- Apply image-to-image to adjust angles or poses while keeping the look intact
- Embed consistent visual descriptors into text prompts

**3. Frame-to-Frame Chaining**
- Grab the last frame of each finished segment
- Upload it as the reference for the following prompt
- Creates a seamless look over longer edits
- Critical technique for multi-shot sequences

**4. Build a Feedback Loop**
- Review each clip for mismatched features, wardrobe changes, or voice inconsistencies
- Adjust prompt with specific corrections (e.g., "same hairstyle as previous clip")
- Treat each iteration like a take on a real set
- Tighter review cycle = faster arrival at consistent result

**5. Chain Tools for Better Results**
- Use ChatGPT or character prompt generator to expand character bible
- Enhance visuals with post-processing tools (color grading, focus)
- Feed polished descriptors and references into video generation model
- Creates multi-step quality check

### Case Study: Eden Barel at Artlist (Veo 3 Test)
- Started with clear character profile
- Chained last-frame references
- Adjusted prompts between takes
- Produced short sequence where main character held look across multiple scenes
- Worked even in complex lighting and motion

### Key Insight
"AI tools are only as consistent as the information you feed them. The more precise you are with references, prompts, and reviews, the more your character will feel like the same person from the first frame to the last."

---

## Research Needed:
- Model-specific character consistency features (Veo "Ingredients," Higgsfield Hero Frame, Kling, Runway, Seedance)
- Face-swapping and identity preservation techniques
- Character consistency across different models
- When to use same model vs. switching models mid-project


---

## Source: Google Blog - Veo 3.1 Ingredients to Video (Jan 13, 2026)

### Veo 3.1 "Ingredients to Video" Feature

**What It Is:**
- Capability that lets you create videos based on reference images
- Can use up to 3 reference images as "ingredients"
- Images can be characters, objects, settings, or stylistic references

**Character Consistency Capabilities:**

**1. Identity Consistency**
- "Identity consistency is better than ever with Veo 3.1 Ingredients to Video"
- Keep characters looking the same even as the setting changes
- Makes it easier to tell a full narrative by having the same character appear across multiple scenes

**2. Background and Object Consistency**
- Control the scene by maintaining the integrity of your setting and objects within it
- Can reuse an object, backgrounds, or textures across scenes

**3. Seamless Blending**
- Combine disparate elements (characters, objects, textures, stylized backgrounds) into cohesive clips
- Works even with short prompts

**4. More Expressive and Creative**
- Generates dynamic and engaging videos based on ingredient images
- Richer dialogue and storytelling
- Makes videos feel more alive and expressive

**Pro Tip from Google:**
- Use Nano Banana Pro (Gemini 3 Pro Image) in Gemini app or Flow to create ingredient images
- Then use those images to create stunning videos with Veo 3.1 Ingredients to Video

**Technical Updates (Jan 2026):**
- Native vertical outputs (9:16 aspect ratio) for mobile-first content
- State-of-the-art upscaling to 1080p and 4K resolution
- Available in: Gemini app, YouTube Shorts, YouTube Create app, Flow, Gemini API, Vertex AI, Google Vids

---

## Research Needed (Continued):
- Runway Gen-4 character reference capabilities
- Kling character consistency features
- Seedance character consistency
- Higgsfield Hero Frame for character consistency
- Face-swapping tools and techniques


---

## Source: Runway Help Center - Gen-4 Image References

### Runway Gen-4 References Feature

**What It Is:**
- Allows you to take one or multiple images and create new images using characteristics, styles, characters, or objects from reference images
- Can extract a character from one image and place them in a different scene
- Transform character elements or environments
- Blend visual styles between images
- Combine elements from multiple sources into single new creation

**Character Consistency Capabilities:**

**1. Single Reference Image Power**
- "Gen-4 References excels at generating consistent characters across different lighting conditions, locations, and treatments, all from just a single reference image"
- Quick and versatile method
- Perfect for exploring creative possibilities

**2. Character Image Recommendations (for optimal results)**
- Natural, even lighting
- Moderate quality
- Neutral subject expression
- Provides a "blank canvas" that simplifies transformation
- Note: References can still work well with stylized inputs

**3. Single Reference Prompts**
- Uses text prompts to describe desired changes while preserving character's identity
- Format: `@reference_name` + descriptive prompt
- Example: `@bryan wearing a denim shirt...`
- Tip: Describe shoes or pants to consistently achieve full-body shots

**4. Multi-Reference Prompts**
- Use multiple reference images for precise control over specific elements
- Produces more predictable results
- Ideal when you have a clear vision difficult to describe with text alone
- Format: `@character_reference` in `@scene_reference`
- Tip: When using image that already contains a subject, cover existing face with black box before uploading to prevent confusion

**5. Reference Management**
- Tag references to save them for future use
- Can use up to 3 references for a single generation
- References can be characters, scenes, objects, or styles

---

## Research Needed (Continued):
- Kling character consistency features and face model training
- Seedance character consistency
- Higgsfield Hero Frame for character consistency
- Face-swapping tools (Midjourney, InsightFace, etc.)
- Cross-model character consistency strategies


---

## Source: Heather Cooper Substack - Kling AI Custom Models

### Kling AI Custom Face Model Feature

**What It Is:**
- Train a model on your face to generate videos in any setting
- Upload videos of yourself or someone else to train the AI
- Teaches AI all about how they look, talk, and express

**Training Requirements:**

**1. Video Requirements**
- Need to upload 10-30 videos
- Each video should be 10-15 seconds long
- Only 1 clearly visible face per video
- Different poses, angles, and backgrounds required
- Training time: approximately 90 minutes

**2. Generation Process**
- Enter a prompt
- Select your custom model as a face reference
- Model generates video with consistent character in any setting

**Key Advantage:**
- Industry-leading innovation for consistent facial features across all AI-generated videos
- Allows for character consistency across different settings, lighting, and scenarios

---

## Research Needed (Continued):
- Kling O1 "All-in-One Reference" feature for video consistency
- Seedance character consistency approaches
- Higgsfield Hero Frame for character consistency
- Face-swapping tools and techniques
- Cross-model character consistency strategies


---

## Source: Kling O1 Element Library Release Notes

### Kling O1 Element Library Feature

**What It Is:**
- Powerful asset repository designed for ultra-consistent results and easy access
- Upload multi-angle reference images and AI will remember your characters, items, and scenes
- Create once, use consistently across all generations
- "Kling O1 can remember your characters, props, and scenes like a human director"

**Key Capabilities:**

**1. Multi-Reference Support**
- Video generation: supports up to 7 reference characters/elements
- Image generation: supports up to 10 reference elements
- Can freely combine multiple elements or mix elements with reference images
- Model independently locks and maintains features of each character or prop

**2. Element Composition**
- Each element must contain at least 2 reference images (1 main + 1 additional)
- Can include up to 4 reference images (1 main + 3 supplementary)
- Main reference image serves as primary source (recommend front-facing image)

**3. Element Types Supported**
- Characters (modern, historical, fantasy, anime, CG-rendered)
- Animals (realistic, anime, CG-rendered)
- Props (everyday, rideable, game-related)
- Costumes & Accessories
- Scenes (indoor, outdoor, virtual, realistic)
- Special Effects (atmospheric, particles, magic)
- Others

**4. AI-Assisted Creation**
- AI Multi-Shot: automatically generate additional views from single main reference image
- AI Auto-Description: extract key features automatically
- Just upload one main reference image and provide a name to quickly create element

**5. One-Click Reuse**
- Both Kling O1 Video and Image models support generation using elements
- Characters' appearance and style remain consistent throughout
- Works for single frames or continuous sequences

**6. Commercial Applications**
- Not limited to human characters
- Can combine products, models, and scenes
- Same product maintains consistent appearance across different styles, backgrounds, lighting
- Perfect for still-life, model showcase, cinematic shots, creative advertisements

**7. Official Element Library**
- Curated and maintained by Kling platform
- Free from commercial copyright concerns
- Can use directly or as references for inspiration

**Usage in Prompts:**
- Format: `[@element_name]` in prompt
- Example: "Close-up of the film effect, fashionable [@Mcinally], neon cyber light..."
- Can combine multiple elements: "[@Banana Cat] strolls through Tokyo, encounters [@Korean Girl]..."

**Key Advantage:**
- Solves AI video's biggest problem: character consistency across shots
- Industry-level feature consistency across different shots, no matter how dramatically scene changes
- Each "main element" maintains features independently in complex group scenes

---

## Summary: Model-Specific Character Consistency Features

**Veo 3.1:**
- "Ingredients to Video" - up to 3 reference images
- Best for: identity consistency across setting changes, seamless blending

**Runway Gen-4:**
- References system - up to 3 references per generation
- Format: `@reference_name` in prompts
- Best for: single reference image transformations, multi-reference precision control

**Kling AI:**
- Custom Face Model - train on 10-30 videos (10-15 sec each), 90 min training
- Kling O1 Element Library - up to 7 elements in video, 10 in image
- Format: `[@element_name]` in prompts
- Best for: ultra-consistent characters across unlimited shots, multi-character scenes

**Seedance:**
- Research needed

**Higgsfield:**
- Hero Frame First workflow (Cinema Studio v1.5)
- Research needed on specific character consistency features

---

## Research Needed (Final):
- Seedance character consistency approaches
- Higgsfield Hero Frame detailed workflow
- Face-swapping tools and techniques (InsightFace, Midjourney consistency, etc.)
- Cross-model character consistency strategies
- When to use same model vs. switching models mid-project


---

## Source: ByteDance Seed - Seedance 1.5 Pro Official Release

### Seedance 1.5 Pro Character Consistency

**What It Is:**
- Next-generation audio-visual generation model with joint audio-visual generation
- Focuses on audio-visual synergy, visual impact, and narrative coherence
- Best-in-class lip-sync and multi-language support

**Character Consistency Capabilities:**

**1. Style Consistency in Image-to-Video**
- "Especially in image-to-video tasks, the model demonstrates robust style consistency"
- "Effectively maintaining stable character features during multi-shot transitions and complex movements"
- Improves coherence from raw footage to final production

**2. Reference Images Support (Seedance 1.0 Lite)**
- Supports 1-4 reference images to guide video generation
- Can set characters, avatars, clothing, environments, or multi-character interactions
- Build AI video scenes piece by piece

**3. Character Consistency Across Shots**
- "The model maintains character consistency—clothing, faces, and style stay the same across different scenes"
- Makes it possible to tell complete stories with the same character
- Maintains consistency during complex movements and multi-shot transitions

**4. Semantic Understanding for Narrative**
- Enhanced semantic understanding achieves precise analysis of narrative contexts
- Significantly improves overall narrative coordination of audio-visual segments
- Can construct narrative sequence of multiple camera shots based on single prompt

**5. Emotional Consistency**
- Refined ability to capture subtle emotions in close-up shots
- Can sustain emotional buildup through delicate facial expressions
- Precisely portrays character's emotional journey with natural transitions

**Key Strengths:**
- Best-in-class lip-sync accuracy (alignment of lip movements, intonation, performance rhythm)
- Multi-language and dialect support (Chinese, English, Japanese, Korean, Spanish, Indonesian, Sichuanese, Cantonese)
- Facial expressions align with dialect's unique prosody
- Strong audio-visual synchronization

**Limitations:**
- Character consistency rated 7.5/10 in community tests (vs. Kling 2.6 at 7.5/10)
- Identity consistency: morphs less frequently than earlier versions but not perfect
- Less robust than Kling O1 Element Library for multi-character scenes

**Best Use Cases:**
- Dialogue-heavy scenes requiring lip-sync
- Multi-language content
- Emotional close-ups with subtle expressions
- Narrative sequences with audio-visual synergy
- Short dramas and entertainment content

---

## Complete Model Comparison: Character Consistency Features

| Model | Character Consistency Method | Max References | Key Strengths | Best For |
|-------|------------------------------|----------------|---------------|----------|
| **Veo 3.1** | Ingredients to Video | 3 images | Identity consistency across settings, seamless blending | Setting changes, creative blending |
| **Runway Gen-4** | References (`@name`) | 3 refs | Single-image transformations, multi-reference precision | Lighting/location changes, style blending |
| **Kling AI** | Custom Face Model + Element Library | 7 elements (video), 10 (image) | Ultra-consistent multi-character scenes, industry-leading | Complex scenes, multi-character interactions |
| **Seedance 1.5 Pro** | Reference Images (1-4) | 4 images | Best lip-sync, emotional consistency, multi-language | Dialogue scenes, emotional close-ups |
| **Higgsfield** | Hero Frame First (Cinema Studio) | Platform aggregator | Access to all models above | Model switching, comprehensive workflows |

---

## Final Research Needed:
- Higgsfield Hero Frame detailed workflow and best practices
- Face-swapping tools (InsightFace, Midjourney, Fooocus, etc.)
- Cross-model character consistency strategies
- When to use same model vs. switching models mid-project
- Character consistency troubleshooting and common issues


---

## Source: Higgsfield Blog - Cinema Studio Guide

### Higgsfield Cinema Studio "Hero Frame First" Workflow

**What It Is:**
- Professional environment designed to replace random AI generation with deterministic control
- "Hero Frame First" philosophy: perfect your still image before you animate
- Simulates a physical film studio with control over optics, physics, and motion

**Hero Frame Workflow for Character Consistency:**

**Phase 1: Build the Rig & Shoot Your Image (Create Hero Frame)**

1. **Select Your Gear:**
   - Camera: Choose sensor profile (VHS, Film, Digital Cinema)
(Content truncated due to size limit. Use line ranges to read remaining content)