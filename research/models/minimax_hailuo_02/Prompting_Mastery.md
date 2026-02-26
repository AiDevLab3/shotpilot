> **⚠️ VERSION NOTE (February 2026):** **Hailuo 2.3** is now available on fal.ai, superseding Hailuo 02.
> New endpoints include:
> - `minimax/hailuo-2.3/pro/image-to-video` (1080p)
> - `minimax/hailuo-2.3/pro/text-to-video` (1080p)
> - `minimax/hailuo-2.3/standard/image-to-video` (768p)
> - `minimax/hailuo-2.3/standard/text-to-video` (768p)
> - `minimax/hailuo-2.3-fast/pro/image-to-video` (1080p, fast)
> - `minimax/hailuo-2.3-fast/standard/image-to-video` (768p, fast)
>
> Hailuo 02 remains available but **Hailuo 2.3 should be preferred for new projects**.
> The prompting patterns in this guide carry over. A dedicated Hailuo 2.3 guide is needed.

# Minimax Hailuo 02 Prompting Mastery Guide

## Executive Summary

**Minimax Hailuo 02** (codename "Kangaroo") represents a breakthrough in creative AI video generation, ranking **#2 globally** on the Artificial Analysis Video Arena. Released on June 18, 2025, Hailuo 02 is the first video model to offer true **director-style camera controls**, enabling creators to specify camera movements, angles, and perspectives with cinematic precision.

Built on the innovative **NCR (Noise-aware Compute Redistribution) architecture**, Hailuo 02 delivers 2.5x improvement in training and inference efficiency compared to its predecessor. With 3x more parameters and training on 4x more data, the model achieves exceptional instruction following and **best-in-class physics mastery**—famously demonstrated in the viral "Cat Olympics" videos.

**Key Positioning:** Hailuo 02 is the **creative and artistic specialist** in the AI video landscape. While models like Veo 3.1 and Sora 2 excel at photorealism and narrative storytelling, Hailuo 02 dominates in stylized content, smooth motion generation, and experimental visuals. At only 30 credits per generation, it's the most cost-effective premium video model, making it ideal for rapid experimentation and social media content.

**Core Strengths:**
- Native 1080p generation (no upscaling)
- Extreme physics mastery (best in class)
- Director-style camera controls (industry first)
- Exceptional motion quality and smoothness
- Outstanding artistic style versatility
- Affordable pricing for experimentation

This guide provides comprehensive strategies for mastering Hailuo 02's unique capabilities, from fundamental prompt structures to advanced cinematic techniques.

---

## Table of Contents

1. [Technical Architecture](#technical-architecture)
2. [Technical Specifications](#technical-specifications)
3. [The Director Control Toolkit](#the-director-control-toolkit)
4. [Prompt Structure Framework](#prompt-structure-framework)
5. [Motion Keywords: Hailuo's Superpower](#motion-keywords-hailuos-superpower)
6. [Artistic Style Mastery](#artistic-style-mastery)
7. [Camera Movement Techniques](#camera-movement-techniques)
8. [Multi-Modal Prompting](#multi-modal-prompting)
9. [Negative Prompting](#negative-prompting)
10. [Use Case Strategies](#use-case-strategies)
11. [Prompt Optimization](#prompt-optimization)
12. [Common Pitfalls and Solutions](#common-pitfalls-and-solutions)
13. [Competitive Positioning](#competitive-positioning)
14. [Production Workflow](#production-workflow)

---

## Technical Architecture

### NCR Architecture (Noise-aware Compute Redistribution)

Hailuo 02's breakthrough performance stems from its NCR architecture, a novel approach to AI video generation that optimizes computational resource allocation.

**Key Innovations:**

**2.5x Efficiency Improvement:** NCR dynamically redistributes computational resources based on noise levels in different regions of the video frame. Areas with high detail or complex motion receive more processing power, while static or simple regions use minimal resources. This enables faster generation without quality compromise.

**Noise-Aware Processing:** Traditional video models apply uniform processing across all frame regions. NCR analyzes noise patterns to identify which areas require intensive computation (e.g., complex physics simulations, intricate textures) and which can be processed efficiently (e.g., uniform backgrounds, static elements).

**Practical Implications:**

- **Faster Generation:** Despite 3x more parameters than Hailuo 01, generation times remain competitive due to NCR efficiency
- **Quality Consistency:** Computational resources concentrated where needed most, ensuring consistent quality across frame
- **Physics Mastery:** Extra computational capacity enables best-in-class physics simulation

### Model Scale

**3x Parameter Increase:** Hailuo 02 features 3x more parameters than its predecessor, enabling:
- More nuanced understanding of complex prompts
- Better instruction following
- Improved physics simulation
- Enhanced artistic style rendering

**4x Training Data:** Trained on 4x more data than Hailuo 01, resulting in:
- Broader style vocabulary
- Better generalization to diverse prompts
- Improved handling of edge cases
- More reliable output quality

### Physics Simulation Engine

Hailuo 02's physics engine is its crown jewel, earning "best in class" recognition for handling complex scenarios:

**Fluid Dynamics:** Water, smoke, fog, and other fluids behave with realistic physics
**Rigid Body Physics:** Objects maintain proper weight, momentum, and collision behavior
**Soft Body Physics:** Cloth, hair, and organic materials deform naturally
**Particle Systems:** Rain, snow, sparks, and other particles follow realistic trajectories

**Famous Example:** The viral "Cat Olympics" videos showcased Hailuo 02's ability to simulate complex gymnastics movements with accurate physics—a feat no other model could replicate at the time.

---

## Technical Specifications

### Output Specifications

**Resolution Options:**
- **1080p (1920×1080):** Native full HD, no upscaling, 6-second maximum duration
- **768p:** Lower resolution option, supports 6 or 10-second duration

**Duration:**
- **1080p:** 6 seconds maximum
- **768p:** 6 or 10 seconds

**Frame Rate:** Standard 24 FPS (assumed, not explicitly documented)

**Format:** MP4 (H.264 codec, standard)

### Generation Cost

**30 Credits per Generation:** Most affordable premium video model
- Sora 2: 50 credits
- Veo 3.1: 160 credits
- Hailuo 02: 30 credits (5.3x cheaper than Veo 3.1)

**Free Tier:** 1,000 credits upon sign-up (allows 20-30 trial clips)
**Watermark:** Free tier includes watermark; premium tiers offer watermark-free

### Performance

**Advertised Generation Time:** ~2 minutes for 5-second clip
**Real-World Generation Time:** Up to 20 minutes depending on system load and complexity
**Note:** Rendering time is slower than competitors but justified by quality output

---

## The Director Control Toolkit

Hailuo 02's revolutionary feature is its **Director Control Toolkit**—the first AI video model to offer usable camera directives. This enables creators to specify camera movements, angles, and perspectives with cinematic precision.

### Camera Movement Keywords

**Lateral Movement:**
- **"walk-right":** Camera moves right alongside subject
- **"walk-left":** Camera moves left alongside subject
- **"pan-right":** Camera rotates right on fixed axis
- **"pan-left":** Camera rotates left on fixed axis

**Vertical Movement:**
- **"pan-up":** Camera tilts up
- **"pan-down":** Camera tilts down
- **"crane-up":** Camera rises vertically
- **"crane-down":** Camera descends vertically

**Depth Movement:**
- **"dolly-in":** Camera moves toward subject
- **"dolly-out":** Camera moves away from subject
- **"zoom-in":** Lens zooms in (no camera movement)
- **"zoom-out":** Lens zooms out (no camera movement)

**Static:**
- **"static shot":** Camera remains completely fixed

**Complex Movements:**
- **"dolly zoom":** Simultaneous dolly and zoom in opposite directions (vertigo effect)
- **"orbit":** Camera circles around subject
- **"tracking shot":** Camera follows subject smoothly

### Perspective Keywords

**Angle:**
- **"bird's eye view":** Overhead perspective looking down
- **"worm's eye view":** Ground-level perspective looking up
- **"eye level":** Camera at subject's eye height
- **"low angle":** Camera below subject looking up
- **"high angle":** Camera above subject looking down
- **"Dutch angle":** Tilted camera creating diagonal horizon

**Framing:**
- **"close-up":** Tight framing on subject (face, object detail)
- **"medium shot":** Subject from waist up
- **"wide shot":** Subject in full environment context
- **"extreme close-up":** Macro detail (eyes, texture)
- **"establishing shot":** Wide view setting scene context

**Specialty:**
- **"POV shot":** First-person perspective
- **"over-the-shoulder":** View from behind one subject toward another
- **"two-shot":** Framing two subjects

### Scene Anchoring

**Unique Feature:** Hailuo 02 maintains relative screen positions of objects and subjects, aiding narrative continuity.

**Practical Application:**
- Subject positioned left-of-frame remains left throughout motion
- Background elements maintain spatial relationships
- Enables consistent framing across multi-shot sequences

**Example:**
```
Character positioned on right third of frame, walking left, camera pans left to follow, character maintains right-third position throughout
```

### Best Practices for Director Controls

**1. Specify Camera Movement Explicitly**

Don't rely on model to infer camera movement—state it clearly.

❌ Vague: "Person walking through city"
✅ Clear: "Person walking through city, camera tracking shot from side, moving at same speed as subject"

**2. Combine Movement with Perspective**

Layer camera movement with angle/framing for cinematic results.

```
Low angle dolly-in toward character, starting wide shot ending close-up, dramatic perspective
```

**3. Match Movement to Content**

Camera movement should enhance content, not distract.

- **Static shot:** For formal, observational content
- **Slow pan:** For revealing landscapes or environments
- **Tracking shot:** For following action or characters
- **Dolly-in:** For building emotional intensity

**4. Avoid Excessive Complexity**

Complex multi-axis camera movements may confuse model.

❌ Complex: "Camera dollies in while panning right and tilting up simultaneously"
✅ Simple: "Camera dollies in slowly toward subject, maintaining eye level"

---

## Prompt Structure Framework

Hailuo 02 responds best to structured prompts that follow a consistent formula. Two primary frameworks exist: **Basic Formula** for general use and **Creative Template** for artistic content.

### Basic Formula

```
[Camera Movements] + [Character Description] + [Action] + [Scene Description] + [Lighting/Mood] + [Style]
```

**Component Breakdown:**

**1. Camera Movements:**
- Specify camera motion and perspective
- Use Director Control keywords
- Example: "Slow dolly-in, low angle"

**2. Character Description:**
- Physical appearance
- Clothing and accessories
- Distinctive features
- Example: "Young woman with long flowing hair, wearing white dress"

**3. Action:**
- What the subject is doing
- Motion descriptors
- Emotional state
- Example: "walking gracefully through field, smiling softly"

**4. Scene Description:**
- Environment and setting
- Background elements
- Atmospheric conditions
- Example: "sunlit meadow with wildflowers, mountains in distance"

**5. Lighting/Mood:**
- Light source and quality
- Color temperature
- Emotional tone
- Example: "golden hour lighting, warm and peaceful atmosphere"

**6. Style:**
- Artistic style or aesthetic
- Visual references
- Technical quality
- Example: "cinematic, 1080p, film grain"

**Complete Example:**
```
Slow dolly-in, eye level, young woman with long flowing hair wearing white dress, walking gracefully through field smiling softly, sunlit meadow with wildflowers and mountains in distance, golden hour lighting warm and peaceful atmosphere, cinematic 1080p film grain
```

### Creative Template

For artistic and stylized content, use the Creative Template:

```
[Artistic style] [subject] [dynamic action], [mood/atmosphere], [motion keywords], [visual effects]
```

**Component Breakdown:**

**1. Artistic Style:**
- Specify visual aesthetic upfront
- Example: "Watercolor style," "Anime style," "Cyberpunk aesthetic"

**2. Subject:**
- What or who is the focus
- Example: "butterfly," "character with flowing hair," "liquid gold"

**3. Dynamic Action:**
- Motion and transformation
- Example: "emerging from cocoon," "running through cherry blossoms," "swirling in zero gravity"

**4. Mood/Atmosphere:**
- Emotional tone
- Example: "magical transformation," "emotional scene," "mesmerizing movement"

**5. Motion Keywords:**
- Hailuo's superpower (see next section)
- Example: "smooth flowing motion," "graceful movement," "dynamic action"

**6. Visual Effects:**
- Special effects and enhancements
- Example: "soft pastel colors," "ethereal glow," "petals swirling"

**Complete Example:**
```
Watercolor style butterfly emerging from cocoon, petals floating around, magical transformation, soft pastel colors, ethereal glow, smooth flowing motion
```

### Choosing the Right Framework

**Use Basic Formula When:**
- Creating realistic or semi-realistic content
- Precise camera control is priority
- Character/scene consistency is critical
- Professional/commercial content

**Use Creative Template When:**
- Creating artistic or stylized content
- Experimentation and creativity are priority
- Motion quality is more important than realism
- Social media or artistic projects

---

## Motion Keywords: Hailuo's Superpower

Motion keywords are Hailuo 02's defining feature. The model's physics engine and motion generation capabilities are best-in-class, but only when properly directed through motion keywords.

**Critical Principle:** Always include motion keywords in Hailuo 02 prompts. Omitting them wastes the model's greatest strength.

### Core Motion Keywords

| Keyword | Effect | Use Case |
|---------|--------|----------|
| **"Smooth flowing motion"** | Fluid, continuous movement without stuttering | Water, fabric, hair, organic motion |
| **"Graceful movement"** | Elegant, refined motion with poise | Dance, fashion, character animation |
| **"Dynamic action"** | Energetic, impactful motion with force | Sports, action scenes, dramatic moments |
| **"Subtle animation"** | Gentle, minimal movement | Breathing, ambient motion, backgrounds |
| **"Rhythmic motion"** | Repeating, patterned movement | Music visuals, mechanical motion, waves |

### Speed Modifiers

Combine core keywords with speed modifiers for precise control:

**Slow Motion:**
- "Slow graceful movement"
- "Gentle flowing motion"
- "Subtle slow animation"

**Normal Speed:**
- "Natural movement"
- "Realistic motion"
- "Organic action"

**Fast Motion:**
- "Rapid dynamic action"
- "Quick energetic movement"
- "Fast-paced motion"

**Time-Lapse:**
- "Time-lapse transformation"
- "Accelerated motion"
- "Compressed time"

### Motion Quality Descriptors

Enhance motion keywords with quality descriptors:

**Smoothness:**
- "Buttery smooth motion"
- "Seamless flowing movement"
- "Silky animation"

**Weight:**
- "Weighted movement" (heavy, grounded)
- "Weightless motion" (floating, ethereal)
- "Momentum-driven action" (realistic physics)

**Fluidity:**
- "Liquid-like motion"
- "Flowing organic movement"
- "Continuous seamless action"

### Motion Direction

Specify motion direction for clarity:

**Linear:**
- "Forward motion"
- "Backward movement"
- "Lateral sliding"

**Rotational:**
- "Spinning motion"
- "Rotating action"
- "Twirling movement"

**Complex:**
- "Spiraling motion"
- "Undulating movement"
- "Swirling action"

### Example Prompts with Motion Keywords

**Fashion/Beauty:**
```
Trendy fashion model walking in slow motion, wind blowing through hair, golden hour lighting, fashion editorial style, confident stride, smooth graceful movement
```

**Abstract/Creative:**
```
Liquid gold flowing and swirling in zero gravity, forming abstract shapes, mesmerizing movement, luxury aesthetic, smooth continuous motion, weightless fluid dynamics
```

**Character Animation:**
```
Anime style character with flowing hair running through cherry blossom rain, petals swirling, emotional scene, studio ghibli inspired, dynamic movement, graceful running motion
```

**Nature:**
```
Butterfly landing on flower, delicate wings fluttering, gentle breeze, soft natural lighting, subtle animation, graceful movement, smooth transition
```

### Motion Keyword Strategy

**1. Always Include Motion Keywords**

Every Hailuo 02 prompt should include at least one motion keyword.

❌ Without: "Person walking through park"
✅ With: "Person walking through park, smooth graceful movement, natural gait"

**2. Match Motion to Content**

Choose motion keywords that fit the content's nature.

- **Organic subjects** (people, animals, plants): "Graceful movement," "Smooth flowing motion"
- **Mechanical subjects** (robots, vehicles): "Rhythmic motion," "Dynamic action"
- **Abstract subjects** (liquids, particles): "Smooth flowing motion," "Swirling action"

**3. Layer Multiple Keywords**

Combine keywords for nuanced control.

```
Smooth flowing motion with subtle animation, graceful and weightless
```

**4. Reinforce Throughout Prompt**

Mention motion multiple times if critical.

```
Dancer performing ballet, graceful movement, smooth flowing motion, elegant and refined, continuous seamless action
```

---

## Artistic Style Mastery

Hailuo 02 excels at artistic and stylized content, outperforming competitors in creative versatility. The model supports a wide range of artistic styles with high fidelity.

### Style Categories

#### 1. Anime and Animation

**Keywords:**
- "Anime style"
- "Cartoon"
- "Animated"
- "Studio Ghibli inspired"
- "Pixar-style"
- "Disney-style"
- "2D animation"
- "Hand-drawn aesthetic"

**Best Practices:**
- Specify anime sub-style (Ghibli, Makoto Shinkai, shonen, shoujo)
- Mention color vibrancy ("vibrant colors," "saturated palette")
- Include stylistic elements ("cel-shaded," "line art," "soft gradients")

**Example:**
```
Anime style character with flowing hair running through cherry blossom rain, petals swirling, emotional scene, studio ghibli inspired, vibrant colors, soft gradients, dynamic movement
```

#### 2. Artistic Mediums

**Keywords:**
- "Watercolor style"
- "Oil painting"
- "Impressionist"
- "Charcoal sketch"
- "Pastel drawing"
- "Digital painting"
- "Ink wash"

**Best Practices:**
- Mention medium-specific characteristics (brush strokes, texture, blending)
- Specify color palette appropriate to medium
- Include artistic techniques (wet-on-wet, impasto, cross-hatching)

**Example:**
```
Watercolor style butterfly emerging from cocoon, petals floating around, magical transformation, soft pastel colors, ethereal glow, smooth flowing motion, wet-on-wet blending, paper texture
```

#### 3. Dreamy and Fantasy

**Keywords:**
- "Ethereal"
- "Magical"
- "Fantasy"
- "Dreamlike"
- "Surreal"
- "Mystical"
- "Otherworldly"

**Best Practices:**
- Combine with lighting effects (glowing, shimmering, luminescent)
- Include atmospheric elements (mist, sparkles, light rays)
- Use soft, diffused aesthetics

**Example:**
```
Ethereal fairy dancing in moonlit forest, magical sparkles floating around, dreamlike atmosphere, soft glowing light, mystical mood, smooth graceful movement, luminescent wings
```

#### 4. Modern and Contemporary

**Keywords:**
- "Minimalist"
- "Contemporary"
- "Sleek"
- "Modern"
- "Clean aesthetic"
- "Geometric"
- "Abstract"

**Best Practices:**
- Emphasize simplicity and clean lines
- Use limited color palettes
- Focus on composition and negative space

**Example:**
```
Minimalist geometric shapes floating in white space, clean aesthetic, modern design, smooth flowing motion, simple color palette, abstract composition
```

#### 5. Vintage and Retro

**Keywords:**
- "Retro"
- "Nostalgic"
- "Classic"
- "Vintage film"
- "1980s aesthetic"
- "VHS style"
- "Film grain"

**Best Practices:**
- Specify era (1950s, 1980s, 1990s)
- Mention period-appropriate elements (film grain, color grading, aspect ratio)
- Include nostalgic references

**Example:**
```
Retro 1980s neon cityscape, nostalgic atmosphere, vintage film grain, classic synthwave aesthetic, vibrant neon colors, smooth camera pan
```

#### 6. Cyberpunk and Sci-Fi

**Keywords:**
- "Cyberpunk aesthetic"
- "Sci-fi"
- "Futuristic"
- "Neon-lit"
- "Dystopian"
- "High-tech"
- "Blade Runner inspired"

**Best Practices:**
- Emphasize neon lighting and rain (cyberpunk staples)
- Include urban environments
- Use high contrast and saturated colors

**Example:**
```
Cyberpunk street level, neon signs reflecting on wet pavement, heavy rain, futuristic cityscape, dystopian atmosphere, vibrant neon colors, smooth camera tracking shot
```

### Color Palette Control

Hailuo 02 responds well to color palette specifications:

**Monochromatic:**
```
Monochromatic blue palette, various shades of blue, unified color theme
```

**Complementary:**
```
Orange and teal color grading, cinematic complementary colors
```

**Warm:**
```
Warm color palette, oranges yellows reds, cozy atmosphere
```

**Cool:**
```
Cool color palette, blues cyans purples, serene mood
```

**Vibrant:**
```
Bright vibrant colors, saturated palette, energetic mood
```

**Muted:**
```
Muted desaturated colors, soft palette, calm atmosphere
```

### Visual Effects

Enhance artistic styles with visual effects:

**Lighting Effects:**
- "Lens flare"
- "God rays"
- "Volumetric lighting"
- "Rim lighting"
- "Backlighting"

**Motion Effects:**
- "Slow motion"
- "Time-lapse"
- "Speed ramping"
- "Motion blur"
- "Freeze frame"

**Stylistic Effects:**
- "Film grain"
- "Chromatic aberration"
- "Vignette"
- "Bokeh"
- "Glitch effect"

**Particle Effects:**
- "Sparkles"
- "Embers"
- "Dust particles"
- "Light particles"
- "Floating petals"

### Style Consistency Tips

**1. Specify Style Early**

Place style keywords at beginning of prompt for emphasis.

✅ "Watercolor style butterfly emerging from cocoon..."

**2. Reinforce Style Throughout**

Mention style-related elements multiple times.

```
Watercolor style butterfly, soft pastel colors, wet-on-wet blending, paper texture, artistic watercolor aesthetic
```

**3. Use Reference Images**

Upload reference images to guide style (see Multi-Modal Prompting section).

**4. Avoid Style Conflicts**

Don't mix incompatible styles.

❌ "Photorealistic watercolor style" (contradictory)
✅ "Watercolor style with artistic interpretation" (coherent)

---

## Camera Movement Techniques

Hailuo 02's Director Control Toolkit enables cinematic camera movements. Understanding when and how to use each movement type is essential for professional results.

### Static Shot

**Description:** Camera remains completely fixed.

**Use Cases:**
- Formal content (interviews, presentations)
- Observational documentary style
- Emphasizing subject motion against stable frame
- Minimalist aesthetic

**Keywords:** "static shot," "fixed camera," "tripod-mounted"

**Example:**
```
Static shot, tripod-mounted, medium shot of craftsman carving wood, subject in center frame, workshop background, natural lighting
```

**Tips:**
- Specify "static shot" explicitly to prevent default camera motion
- Use for content where subject motion is primary focus
- Effective for showcasing intricate actions or details

### Pan (Horizontal Rotation)

**Description:** Camera rotates horizontally on fixed axis.

**Use Cases:**
- Revealing landscapes or environments
- Following subjects moving laterally
- Establishing spatial relationships
- Panoramic views

**Keywords:** "pan-right," "pan-left," "slow pan," "camera pans"

**Example:**
```
Camera pans right slowly, revealing mountain range, starting with single peak ending with full panorama, golden hour lighting, smooth motion
```

**Tips:**
- Specify speed ("slow pan," "quick pan")
- Indicate start and end points for clarity
- Use for horizontal reveals or following lateral motion

### Tilt (Vertical Rotation)

**Description:** Camera rotates vertically on fixed axis.

**Use Cases:**
- Revealing height (tilting up tall building)
- Emphasizing scale
- Dramatic character reveals
- Vertical environment exploration

**Keywords:** "tilt-up," "tilt-down," "pan-up," "pan-down"

**Example:**
```
Camera tilts up from character's feet to face, low angle perspective, dramatic reveal, character looking down at camera, backlit silhouette
```

**Tips:**
- Combine with angle (low angle tilt-up for dramatic effect)
- Use for vertical reveals or emphasizing height
- Effective for establishing scale

### Dolly (Linear Movement)

**Description:** Camera moves toward (dolly-in) or away (dolly-out) from subject.

**Use Cases:**
- Building emotional intensity (dolly-in)
- Revealing context (dolly-out)
- Creating intimacy or distance
- Smooth approach or departure

**Keywords:** "dolly-in," "dolly-out," "slow dolly," "camera moves toward"

**Example:**
```
Slow dolly-in toward character's face, starting medium shot ending extreme close-up, shallow depth of field, background gradually blurring, building emotional intensity
```

**Tips:**
- Creates parallax (foreground and background move at different rates)
- Different from zoom (dolly changes perspective, zoom doesn't)
- Use for emotional emphasis or context revelation

### Tracking/Trucking (Lateral Movement)

**Description:** Camera moves laterally parallel to subject.

**Use Cases:**
- Following walking characters
- Revealing environment alongside subject
- Dynamic action scenes
- Maintaining consistent framing while moving

**Keywords:** "tracking shot," "camera tracks," "walk-right," "walk-left"

**Example:**
```
Tracking shot following runner from side, camera moving at same speed as subject, runner in center frame, background motion blur, urban environment, smooth steadicam movement
```

**Tips:**
- Specify camera speed relative to subject ("same speed," "faster," "slower")
- Indicate framing consistency ("subject remains center frame")
- Use for following action or revealing environments

### Crane/Boom (Vertical Movement)

**Description:** Camera moves vertically up or down.

**Use Cases:**
- Establishing shots (rising to reveal environment)
- Dramatic emphasis (descending to subject)
- Transitioning between scales
- Revealing spatial relationships

**Keywords:** "crane-up," "crane-down," "camera rises," "camera descends"

**Example:**
```
Crane shot rising from ground level to aerial view, starting with close-up of character ending with wide shot of entire city, smooth ascending motion, revealing scale
```

**Tips:**
- Effective for scale transitions
- Use for dramatic reveals
- Combine with tilt for complex motion

### Orbit/Arc

**Description:** Camera circles around subject while maintaining focus.

**Use Cases:**
- Product showcases
- 360° view of subject
- Dynamic character introductions
- Revealing all angles

**Keywords:** "orbit," "camera circles," "360-degree rotation," "arc around"

**Example:**
```
Camera orbits clockwise around sculpture, completing 180-degree arc, sculpture remains in center frame, lighting revealing different angles, smooth circular motion
```

**Tips:**
- Specify arc length (90°, 180°, 360°)
- Indicate direction (clockwise, counter-clockwise)
- Maintain subject in center frame for stability

### Dolly Zoom (Vertigo Effect)

**Description:** Simultaneous dolly and zoom in opposite directions.

**Use Cases:**
- Psychological tension
- Disorientation
- Dramatic realization moments
- Hitchcock-style suspense

**Keywords:** "dolly zoom," "vertigo effect," "dolly-in zoom-out"

**Example:**
```
Dolly zoom effect, camera dollying back while zooming in, subject remains same size, background perspective compressing dramatically, vertigo effect, psychological tension
```

**Tips:**
- Complex technique, may not always execute perfectly
- Use sparingly for maximum impact
- Effective for dramatic moments

### Combining Movements

Advanced prompts can combine multiple camera movements:

**Example 1: Dolly + Pan**
```
Camera dollies in while panning right, revealing subject from side angle, smooth combined motion
```

**Example 2: Crane + Tilt**
```
Camera cranes up while tilting down to maintain subject in frame, rising perspective, smooth vertical motion
```

**Caution:** Complex multi-axis movements may confuse model. Start simple and add complexity gradually.

---

## Multi-Modal Prompting

Hailuo 02 supports **multi-modal input**, combining text prompts with reference images for enhanced control and consistency.

### How Multi-Modal Works

**Text + Image Input:**
- Upload reference image
- Provide text prompt describing desired motion/changes
- Model uses image as visual guide while following text instructions

**Benefits:**
- **Style Consistency:** Reference image locks in visual style
- **Character Consistency:** Same character across multiple generations
- **Scene Consistency:** Maintain environment across clips
- **Reduced Misinterpretation:** Visual reference eliminates ambiguity

### Reference Image Types

#### 1. Style Reference

**Purpose:** Guide overall visual aesthetic.

**Use Case:** You want a specific artistic style but can't describe it precisely in text.

**Example:**
- Upload: Impressionist painting
- Prompt: "Create video of person walking through garden, use reference image style"
- Result: Video with impressionist aesthetic

#### 2. Character Reference

**Purpose:** Maintain consistent character appearance.

**Use Case:** Multiple clips featuring same character.

**Example:**
- Upload: Portrait of character
- Prompt: "Character walking through city, same appearance as reference"
- Result: Character matches reference image

#### 3. Scene Reference

**Purpose:** Use specific environment or background.

**Use Case:** Animate scene while maintaining environment.

**Example:**
- Upload: Photo of busy New York street
- Prompt: "Create video of bustling city at night, neon lights reflecting on wet streets, use reference image as background"
- Result: Video with reference environment

#### 4. Composition Reference

**Purpose:** Guide framing and layout.

**Use Case:** Match specific composition or framing.

**Example:**
- Upload: Image with desired composition
- Prompt: "Recreate this composition with different subject, maintain framing and layout"
- Result: Video matching reference composition

### Multi-Modal Prompt Structure

```
[Text Prompt] + "use reference image as [style/character/scene/composition]"
```

**Example 1: Style Reference**
```
Watercolor animation of butterfly in garden, smooth flowing motion, use reference image style
```

**Example 2: Character Reference**
```
Character running through forest, dynamic action, graceful movement, same character as reference image
```

**Example 3: Scene Reference**
```
Cyberpunk street at night, neon reflections, heavy rain, camera pan right, use reference image as background environment
```

### Best Practices

**1. High-Quality Reference Images**

Reference image quality directly affects output quality.

✅ **Good References:**
- High resolution (1080p or higher)
- Clear, well-lit
- Minimal compression artifacts
- Clean composition

❌ **Bad References:**
- Low resolution
- Blurry or out-of-focus
- Heavy compression
- Cluttered composition

**2. Match Reference to Intent**

Choose reference images that align with desired output.

- **Style reference:** Use exemplar of target style
- **Character reference:** Use clear, well-lit portrait
- **Scene reference:** Use environment shot from desired angle

**3. Clear Reference Instructions**

Explicitly state how reference should be used.

❌ Vague: "Use reference image"
✅ Clear: "Use reference image as character appearance guide, maintain same clothing and hairstyle"

**4. Balance Text and Image**

Text prompt should complement, not contradict, reference image.

❌ Conflict: Reference shows daytime scene, prompt says "night scene"
✅ Harmony: Reference shows daytime scene, prompt says "maintain daytime lighting from reference"

### Advanced Multi-Modal Techniques

**Technique 1: Style Transfer**

Transfer style from reference to new content.

```
Reference: Van Gogh painting
Prompt: "Create video of modern city street in style of reference image, swirling brushstrokes, vibrant colors, impressionist aesthetic"
```

**Technique 2: Character Consistency Across Scenes**

Use same character reference for multiple clips.

```
Clip 1: Character walking (Reference: Character portrait)
Clip 2: Character sitting (Reference: Same character portrait)
Clip 3: Character running (Reference: Same character portrait)
Result: Consistent character across all clips
```

**Technique 3: Environment Consistency**

Maintain environment across multiple shots.

```
Reference: Cyberpunk street environment
Shot 1: Wide shot of street, camera pan right
Shot 2: Close-up of neon sign on same street
Shot 3: Character walking through same street
Result: Consistent environment across shots
```

---

## Negative Prompting

**Negative prompting** allows you to explicitly exclude unwanted elements from generated videos, ensuring cleaner, more controlled outputs.

### How Negative Prompting Works

Traditional prompts describe what you **want**. Negative prompts describe what you **don't want**.

**Syntax:**
```
[Positive Prompt] + "negative: [unwanted elements]"
```

or

```
[Positive Prompt] + "Don't add [unwanted elements]"
```

### Common Negative Prompts

#### Visual Artifacts

**Problem:** AI-generated videos sometimes include visual artifacts, noise, or distortions.

**Solution:**
```
negative: no grainy textures, no visual artifacts, no compression artifacts, no noise
```

or

```
Don't add grainy textures or visual artifacts, clean smooth output
```

#### Motion Artifacts

**Problem:** Unwanted motion blur, stuttering, or jittery movement.

**Solution:**
```
negative: no motion blur, no stuttering, no jittery movement
```

or

```
Don't add motion blur to the actions, smooth continuous motion only
```

#### Unwanted Elements

**Problem:** Model adds elements not requested in prompt.

**Solution:**
```
negative: no text, no watermarks, no people in background, no additional objects
```

or

```
Don't add people in background, keep environment clean and minimal
```

#### Style Conflicts

**Problem:** Model applies unwanted artistic styles or effects.

**Solution:**
```
negative: no cartoon style, no anime aesthetic, photorealistic only
```

or

```
Don't add stylization, maintain photorealistic rendering
```

### Negative Prompting Strategy

**1. Identify Common Problems**

After generating several videos, identify recurring issues.

**Example:** If model consistently adds motion blur when you want sharp motion, add:
```
negative: no motion blur, sharp clear motion
```

**2. Be Specific**

Vague negative prompts are ineffective.

❌ Vague: "negative: bad quality"
✅ Specific: "negative: no grainy textures, no compression artifacts, no visual noise"

**3. Don't Overuse**

Excessive negative prompts can confuse model.

❌ Too Many: "negative: no blur, no grain, no artifacts, no distortion, no noise, no compression, no..."
✅ Focused: "negative: no grainy textures, no motion blur"

**4. Combine with Positive Reinforcement**

Pair negative prompts with positive descriptions of desired qualities.

```
Smooth clean motion, sharp details, high quality rendering, negative: no motion blur, no grainy textures
```

### Example Prompts with Negative Prompting

**Example 1: Clean Product Video**
```
Luxury watch rotating on display, studio lighting, smooth rotation, sharp details, negative: no motion blur, no background distractions, no text
```

**Example 2: Stylized Character**
```
Anime style character running, vibrant colors, dynamic action, smooth flowing motion, negative: no photorealistic elements, no 3D rendering, pure 2D animation style
```

**Example 3: Nature Documentary**
```
Bird flying through forest, natural lighting, smooth flight motion, realistic feathers, negative: no artificial elements, no human structures, pristine natural environment
```

---

## Use Case Strategies

Hailuo 02 excels in specific use cases. Understanding optimal applications ensures maximum value.

### 1. Social Media Content

**Why Hailuo 02 Excels:**
- Short duration (6-10s) perfect for social platforms
- Affordable cost enables high-volume creation
- Stylized aesthetic stands out in feeds
- Smooth motion catches attention

**Platform-Specific Strategies:**

**Instagram Reels:**
```
Trendy fashion model walking in slow motion, wind blowing through hair, golden hour lighting, fashion editorial style, confident stride, smooth graceful movement, vertical 9:16 format
```

**TikTok:**
```
Anime style character dancing, vibrant colors, energetic motion, trendy aesthetic, dynamic action, smooth flowing movement, vertical format
```

**YouTube Shorts:**
```
Quick product showcase, rotating 360 degrees, studio lighting, smooth rotation, clean background, dynamic presentation
```

**Tips:**
- Use vertical format (9:16) for mobile-first platforms
- Emphasize motion and visual interest (social feeds are fast-paced)
- Keep content punchy and attention-grabbing
- Leverage affordable cost for A/B testing

### 2. Music Video Previsualization

**Why Hailuo 02 Excels:**
- Artistic styles match music video aesthetics
- Smooth motion syncs well with music
- Affordable for pre-production testing
- Quick iteration for concept development

**Strategy:**
```
Abstract visual matching song mood, rhythmic motion synced to beat, artistic style [genre-appropriate], vibrant colors, smooth flowing motion, music visualizer aesthetic
```

**Example: Electronic Music**
```
Abstract geometric shapes pulsing to beat, neon colors, cyberpunk aesthetic, rhythmic motion, smooth transitions, electronic music visualizer
```

**Example: Indie Folk**
```
Watercolor style nature scenes, gentle flowing motion, warm earth tones, organic movement, peaceful atmosphere, folk music aesthetic
```

**Tips:**
- Match visual style to music genre
- Use rhythmic motion keywords for beat sync
- Create multiple variations for different song sections
- Use as storyboard for full production

### 3. Concept Art and Storyboarding

**Why Hailuo 02 Excels:**
- Quick concept visualization
- Affordable for exploration
- Cinematic camera controls for shot planning
- Artistic flexibility

**Strategy:**
```
[Scene description], [camera movement], [lighting/mood], cinematic style, storyboard quality
```

**Example:**
```
Hero character entering dark cave, slow dolly-in, low angle, dramatic lighting from torch, tense atmosphere, cinematic storyboard, concept art quality
```

**Tips:**
- Use Director Control Toolkit for precise shot planning
- Generate multiple angles of same scene
- Test camera movements before full production
- Share with team for feedback and iteration

### 4. Brand and Marketing Content

**Why Hailuo 02 Excels:**
- Professional quality at low cost
- Consistent style for brand identity
- Quick turnaround for campaigns
- Versatile for different product types

**Strategy:**
```
[Product] in [environment], [camera movement], [brand aesthetic], [key features highlighted], smooth motion, professional quality
```

**Example: Luxury Product**
```
Luxury perfume bottle rotating on marble surface, slow orbit, soft studio lighting, elegant aesthetic, gold accents, smooth rotation, premium quality
```

**Example: Tech Product**
```
Smartphone floating in minimalist space, clean background, slow rotation, modern aesthetic, sleek design, smooth motion, tech product showcase
```

**Tips:**
- Maintain brand visual identity through style keywords
- Highlight key product features
- Use reference images for brand consistency
- Create variations for A/B testing

### 5. Artistic and Experimental Projects

**Why Hailuo 02 Excels:**
- Unmatched artistic style versatility
- Encourages experimentation (low cost)
- Smooth motion for abstract visuals
- Creative freedom

**Strategy:**
```
[Abstract concept], [artistic style], [experimental technique], [mood], smooth flowing motion, artistic expression
```

**Example:**
```
Liquid colors mixing in zero gravity, abstract expressionist style, experimental visual, mesmerizing movement, vibrant palette, smooth flowing motion, artistic exploration
```

**Tips:**
- Push creative boundaries (Hailuo 02's strength)
- Experiment with unusual style combinations
- Leverage low cost for wild experimentation
- Don't worry about "realism"—embrace stylization

### 6. Gaming Assets and Virtual Environments

**Why Hailuo 02 Excels:**
- Creates animated environments
- Stylized aesthetics match game art
- Physics simulation for realistic effects
- Quick asset generation

**Strategy:**
```
[Environment description], [atmospheric effects], [camera movement], game asset quality, [art style matching game]
```

**Example: Fantasy Game**
```
Magical forest environment, glowing mushrooms, floating particles, camera pan through trees, fantasy game aesthetic, stylized art, smooth motion
```

**Example: Cyberpunk Game**
```
Neon-lit alley, rain effects, holographic advertisements, camera tracking shot, cyberpunk game environment, futuristic aesthetic, atmospheric
```

**Tips:**
- Match art style to game aesthetic
- Focus on environmental atmosphere
- Use for background loops or cutscenes
- Generate multiple variations for diversity

---

## Prompt Optimization

Optimizing prompts maximizes Hailuo 02's capabilities and ensures consistent, high-quality results.

### Optimization Principle 1: Clarity and Simplicity

**Rule:** Clear, simple prompts produce better results than complex, convoluted ones.

**Why:** Model can focus on core elements without getting confused by excessive detail.

**Bad Example:**
```
A video of a beach with waves and sand and maybe some birds flying and a sunset happening and possibly a person walking but not too close and...
```

**Good Example:**
```
Serene sunset beach scene, gentle waves, soft orange and pink sky, camera slowly pans right, peaceful atmosphere, smooth motion
```

**Tips:**
- One main subject per prompt
- Clear, concise descriptions
- Avoid run-on sentences
- Focus on essential elements

### Optimization Principle 2: Structured Organization

**Rule:** Follow consistent prompt structure (Basic Formula or Creative Template).

**Why:** Structured prompts are easier for model to parse and interpret.

**Bad Example:**
```
Walking person in city with camera moving and lights at night and smooth motion
```

**Good Example (Basic Formula):**
```
Camera tracking shot, person walking through city, neon lights at night, smooth motion, cinematic style
```

**Tips:**
- Use established frameworks (Basic Formula, Creative Template)
- Group related elements together
- Maintain logical flow (camera → subject → action → scene → mood → style)

### Optimization Principle 3: Specificity Without Overload

**Rule:** Be specific about key elements, but don't overload with unnecessary details.

**Why:** Specificity guides model, but too many details cause confusion.

**Bad Example (Too Vague):**
```
A person walking
```

**Bad Example (Too Specific):**
```
A 32-year-old woman with exactly 18-inch long auburn hair with subtle caramel highlights wearing a navy blue cotton t-shirt size medium with a small logo on the left chest pocket and dark wash denim jeans size 8 with a 2-inch inseam and...
```

**Good Example (Balanced):**
```
Young woman with long flowing hair wearing casual outfit, walking through park, natural lighting, relaxed mood, smooth motion
```

**Tips:**
- Specify key visual elements (hair length, clothing style, environment)
- Omit irrelevant minutiae (exact measurements, brand names)
- Focus on visually significant details

### Optimization Principle 4: Motion Keyword Priority

**Rule:** Always include motion keywords (Hailuo's superpower).

**Why:** Motion keywords unlock Hailuo 02's best-in-class motion generation.

**Bad Example:**
```
Butterfly flying through garden
```

**Good Example:**
```
Butterfly flying through garden, graceful movement, smooth flowing motion, delicate wing flutter
```

**Tips:**
- At least one motion keyword per prompt
- Match motion keyword to content type
- Layer multiple motion keywords for nuanced control

### Optimization Principle 5: Camera Control Clarity

**Rule:** Explicitly specify camera movement and perspective.

**Why:** Hailuo 02's Director Control Toolkit requires clear instructions.

**Bad Example:**
```
Person walking through city
```

**Good Example:**
```
Tracking shot following person through city, camera at eye level, smooth motion
```

**Tips:**
- Use Director Control keywords (tracking shot, dolly-in, pan-right)
- Specify camera angle (eye level, low angle, bird's eye)
- Indicate camera speed (slow, steady, quick)

### Optimization Principle 6: Consistency Reinforcement

**Rule:** Reinforce key elements multiple times if consistency is critical.

**Why:** Repetition emphasizes importance to model.

**Example:**
```
Anime style character, vibrant anime colors, 2D animation aesthetic, studio ghibli inspired, pure anime style throughout
```

**Tips:**
- Repeat style keywords for style consistency
- Repeat character descriptors for character consistency
- Repeat motion keywords for motion consistency

### Optimization Principle 7: Reference Image Integration

**Rule:** Use reference images for complex styles or characters.

**Why:** Visual references eliminate ambiguity.

**Example:**
```
Character walking through forest, same character as reference image, maintain appearance and clothing, smooth motion
```

**Tips:**
- Upload high-quality reference images
- Explicitly state how reference should be used
- Combine reference with text for best results

### Optimization Checklist

Before generating, verify prompt includes:

✅ **Camera movement/perspective** (Director Control keywords)
✅ **Motion keywords** (smooth flowing motion, graceful movement, etc.)
✅ **Subject description** (who/what is the focus)
✅ **Action/motion** (what is happening)
✅ **Scene/environment** (where is it happening)
✅ **Lighting/mood** (atmosphere and tone)
✅ **Style** (artistic aesthetic)
✅ **Clarity** (clear, concise, organized)

---

## Common Pitfalls and Solutions

### Pitfall 1: Ignoring Motion Keywords

**Problem:** Omitting motion keywords wastes Hailuo 02's greatest strength.

**Example:**
❌ "Butterfly flying through garden"

**Solution:** Always include motion keywords.

✅ "Butterfly flying through garden, graceful movement, smooth flowing motion, delicate wing flutter"

### Pitfall 2: Expecting Photorealism

**Problem:** Hailuo 02 is optimized for artistic/stylized content, not photorealism.

**Expectation:** Photorealistic human portrait
**Reality:** Stylized, artistic interpretation

**Solution:** Use Hailuo 02 for creative/artistic content. For photorealism, use Veo 3.1 or Sora 2.

### Pitfall 3: Overly Complex Prompts

**Problem:** Excessive detail confuses model.

**Example:**
❌ "Person walking through city while juggling while it's raining while cars drive by while birds fly overhead while..."

**Solution:** Focus on 1-2 primary elements.

✅ "Person walking through rainy city, neon reflections on wet pavement, smooth motion, cinematic style"

### Pitfall 4: Vague Camera Instructions

**Problem:** Model defaults to unpredictable camera movement.

**Example:**
❌ "Person walking"

**Solution:** Explicitly specify camera movement.

✅ "Tracking shot following person, camera at eye level, smooth motion"

### Pitfall 5: Neglecting Style Specification

**Problem:** Model chooses arbitrary style.

**Example:**
❌ "Character running through forest"

**Solution:** Specify desired style.

✅ "Anime style character running through forest, Studio Ghibli inspired, vibrant colors"

### Pitfall 6: Inconsistent Style Keywords

**Problem:** Mixing incompatible styles.

**Example:**
❌ "Photorealistic watercolor anime style"

**Solution:** Choose one coherent style.

✅ "Watercolor style animation, artistic interpretation, soft colors"

### Pitfall 7: Expecting Long Videos

**Problem:** Hailuo 02 is limited to 6-10 seconds.

**Expectation:** 30-second clip
**Reality:** 6-10 seconds maximum

**Solution:** Generate multiple clips and edit together in post-production.

### Pitfall 8: Ignoring Multi-Modal Capabilities

**Problem:** Struggling to describe complex styles in text.

**Solution:** Use reference images for complex styles or characters.

✅ "Character animation in style of reference image, smooth motion"

### Pitfall 9: Neglecting Negative Prompts

**Problem:** Unwanted elements appear in output.

**Solution:** Use negative prompts to exclude unwanted elements.

✅ "Smooth motion, clean output, negative: no motion blur, no grainy textures"

### Pitfall 10: Unrealistic Rendering Time Expectations

**Problem:** Expecting 2-minute generation time (advertised).

**Reality:** Real-world generation often takes up to 20 minutes.

**Solution:** Plan accordingly, use generation time for other tasks.

---

## Competitive Positioning

Understanding Hailuo 02's position relative to competitors helps you choose the right tool for each project.

### Hailuo 02 vs. Competitors

| Model | Rank | Strength | Weakness | Cost | Duration | Best For |
|-------|------|----------|----------|------|----------|----------|
| Seedance 1.0 | #1 | Long-form stability | Less creative | Higher | Longer | Long-form narrative |
| **Hailuo 02** | #2 | Creative/artistic | Not photorealistic | 30 credits | 6-10s | Stylized short-form |
| Google Veo 3 | #3 | Photorealism | Less artistic freedom | 160 credits | 8s | Photorealistic scenes |
| Sora 2 | - | Cinematic narrative | Expensive | 50 credits | 20s | Cinematic storytelling |

### Detailed Comparisons

#### Hailuo 02 vs. Veo 3.1

**Choose Hailuo 02 When:**
- Creating artistic/stylized content
- Budget is limited (5.3x cheaper)
- Smooth motion is priority
- Experimenting with creative concepts

**Choose Veo 3.1 When:**
- Photorealism is required
- Budget allows premium pricing
- Longer duration needed (8s vs. 6s)
- Professional commercial content

#### Hailuo 02 vs. Sora 2

**Choose Hailuo 02 When:**
- Creating short-form social content
- Artistic style is desired
- Cost efficiency is priority (1.7x cheaper)
- Rapid iteration needed

**Choose Sora 2 When:**
- Longer duration needed (20s vs. 6-10s)
- Cinematic narrative is priority
- Photorealism with artistic flexibility
- Budget allows

#### Hailuo 02 vs. Seedance 1.0

**Choose Hailuo 02 When:**
- Creative/artistic content
- Smooth motion is critical
- Shorter clips are sufficient
- Camera control is needed

**Choose Seedance 1.0 When:**
- Long-form content needed
- Stability over creativity
- Narrative consistency is critical
- Longer duration required

### Hailuo 02's Unique Advantages

**1. Director Control Toolkit**
- Only model with usable camera directives
- Enables cinematic control
- Industry-first feature

**2. Cost Efficiency**
- Most affordable premium model (30 credits)
- Enables high-volume experimentation
- Best value for social media content

**3. Motion Quality**
- Best-in-class smooth motion
- Physics mastery
- Ideal for motion-focused content

**4. Artistic Versatility**
- Widest range of artistic styles
- Excels at stylized content
- Creative freedom

### When to Use Hailuo 02

**Ideal Scenarios:**
✅ Social media content (Instagram, TikTok, YouTube Shorts)
✅ Music video previsualization
✅ Artistic/experimental projects
✅ Concept art and storyboarding
✅ Brand content with stylized aesthetic
✅ Gaming assets and virtual environments
✅ Motion-focused content
✅ Budget-conscious projects
✅ Rapid iteration and experimentation

**Not Ideal Scenarios:**
❌ Photorealistic commercial content (use Veo 3.1)
❌ Long-form narrative (use Sora 2 or Seedance 1.0)
❌ Ultra-realistic human portraits (use Veo 3.1)
❌ Professional film production (use Sora 2)

---

## Production Workflow

### Step-by-Step Production Process

#### Phase 1: Concept and Planning

**Step 1: Define Objective**
- What is the video's purpose?
- Who is the target audience?
- What platform will it be published on?
- What emotion or message should it convey?

**Step 2: Choose Style**
- Artistic style (anime, watercolor, cyberpunk, etc.)
- Color palette
- Mood and atmosphere

**Step 3: Plan Motion**
- What should move?
- How should it move (smooth, dynamic, graceful)?
- Camera movement needed?

**Step 4: Gather References (if using multi-modal)**
- Collect style references
- Gather character references
- Find environment references

#### Phase 2: Prompt Crafting

**Step 5: Select Framework**
- Basic Formula (for realistic/cinematic content)
- Creative Template (for artistic/stylized content)

**Step 6: Build Prompt**
- Camera movement/perspective
- Motion keywords
- Subject description
- Action/motion
- Scene/environment
- Lighting/mood
- Style

**Step 7: Add Negative Prompts (if needed)**
- Identify unwanted elements
- Add negative prompt specifications

**Step 8: Review Against Checklist**
- Verify all essential elements included
- Check for clarity and organization
- Ensure motion keywords present

#### Phase 3: Generation

**Step 9: Select Platform**
- Flux-AI.io
- ImagineArt
- Vibess
- API access

**Step 10: Configure Settings**
- Resolution (1080p or 768p)
- Duration (6s or 10s if 768p)
- Upload reference image (if multi-modal)

**Step 11: Generate**
- Submit prompt
- Wait for generation (up to 20 minutes)
- Preview output

**Step 12: Evaluate**
- Does it match intent?
- Is motion quality satisfactory?
- Is style accurate?
- Are there unwanted elements?

#### Phase 4: Iteration

**Step 13: Identify Issues**
- Motion problems
- Style inconsistencies
- Unwanted elements
- Camera movement issues

**Step 14: Adjust Prompt**
- Refine motion keywords
- Clarify camera instructions
- Add negative prompts
- Adjust style specifications

**Step 15: Regenerate**
- Submit revised prompt
- Compare to previous generation
- Iterate until satisfactory

#### Phase 5: Post-Production

**Step 16: Edit Clips (if multiple)**
- Import clips into editing software
- Arrange in sequence
- Trim and adjust timing

**Step 17: Add Audio (if needed)**
- Add music or sound effects
- Sync audio to video
- Mix audio levels

**Step 18: Color Grade (if needed)**
- Adjust color balance
- Apply cinematic color grading
- Ensure consistency across clips

**Step 19: Final Export**
- Export at desired resolution
- Optimize for target platform
- Add captions or text (if needed)

#### Phase 6: Deployment

**Step 20: Publish**
- Upload to target platform
- Add titles, descriptions, tags
- Optimize for discoverability

### Platform-Specific Workflows

#### Flux-AI.io

1. Visit Flux-AI.io
2. Navigate to AI Video Generator
3. Select Hailuo 02
4. Input prompt
5. Configure settings (resolution, duration)
6. Upload reference image (optional)
7. Generate
8. Download (watermark-free with premium)

#### ImagineArt

1. Visit ImagineArt
2. Navigate to Video Generator
3. Select Hailuo AI
4. Input prompt
5. Upload reference image (optional)
6. Generate
7. Download

#### Vibess

1. Visit Vibess
2. Navigate to Video section
3. Select Hailuo 02
4. Input prompt
5. Configure settings
6. Generate
7. Download

### Batch Production Workflow

For high-volume content creation:

**Step 1: Template Creation**
- Create prompt templates for common use cases
- Establish style guidelines
- Define motion keyword standards

**Step 2: Batch Prompt Generation**
- Generate multiple prompts from templates
- Vary key elements (subject, action, scene)
- Maintain consistent style

**Step 3: Parallel Generation**
- Submit multiple prompts simultaneously (if platform allows)
- Queue generations
- Monitor progress

**Step 4: Batch Review**
- Review all outputs
- Identify successful patterns
- Note common issues

**Step 5: Batch Post-Production**
- Import all clips
- Apply consistent color grading
- Add audio to all clips
- Export in batch

---

## Conclusion

Minimax Hailuo 02 represents a breakthrough in creative AI video generation, offering unparalleled artistic versatility, smooth motion generation, and industry-first director-style camera controls. Ranking #2 globally and powered by the innovative NCR architecture, Hailuo 02 is the ideal tool for creators focused on stylized, artistic, and motion-driven content.

**Key Takeaways:**

1. **Hailuo 02 is the creative specialist**—not for photorealism, but unmatched in artistic styles
2. **Motion keywords are essential**—always include them to unlock best-in-class motion generation
3. **Director Control Toolkit is unique**—leverage camera directives for cinematic control
4. **Cost efficiency enables experimentation**—at 30 credits, rapid iteration is affordable
5. **Multi-modal input enhances control**—use reference images for style and character consistency
6. **Short-form focus**—ideal for social media, not long-form narrative
7. **Physics mastery**—best in class for complex motion and physics simulation

**Next Steps:**

- Test Hailuo 02 with the example prompts in this guide
- Experiment with motion keywords to find your style
- Explore Director Control Toolkit for cinematic shots
- Use multi-modal prompting for consistency
- Build prompt templates for your common use cases
- Iterate rapidly leveraging affordable pricing

Hailuo 02 rewards creativity and experimentation. With the techniques in this guide, you're equipped to create stunning, motion-driven, artistic video content that stands out in the AI video landscape.

---

*Guide Version: 1.0*
*Last Updated: February 2026*
*Model Version: Hailuo 02 (Kangaroo)*
