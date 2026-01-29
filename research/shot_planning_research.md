# Shot Planning & Production Workflow Research Notes

## Source: VP-Land - Step-by-Step: The State of AI Filmmaking Workflows (July 22, 2025)

### The Standard AI Filmmaking Workflow

The typical AI filmmaking workflow follows a logical progression from ideation to final video output:

1. **Story development and shot design**
2. **Visual style and character consistency**
3. **Generate initial frames**
4. **Transform frames into moving images**

Despite rapid tool evolution, the fundamental workflow remains stable and adaptable across tools and needs.

**Key Insight:** Many creators use this variation: **text prompts → images → videos**. This approach allows filmmakers to create compelling visuals without cameras or physical resources.

---

### Phase 1: Story and Shot Design

**The Starting Point:**
- Every film begins with a solid story
- Once narrative is clear, shot design becomes next focus
- AI language models (LLMs) assist by brainstorming shot ideas

**Tools for Shot Design:**
- Google Gemini 2.5
- Claude
- ChatGPT

**Example Workflow:**
1. Define narrative (e.g., character chased through mine tunnel on mine cart)
2. Use LLM to define what shots are needed
3. LLM generates detailed prompts for image generation

---

### Phase 2: Establishing Consistent Visual Style

**Why It Matters:**
Maintaining consistent style across shots is crucial to avoid jarring visual shifts.

**Strategies for Style Consistency:**

1. **Descriptive Text Prompts:** Use detailed language to specify desired style
2. **LoRA Models:** Train lightweight models on set of images representing your style (e.g., cyberpunk cityscape)
3. **Midjourney SREFs:** Utilize style reference codes to recall specific visual aesthetics
4. **Reference Images:** Tools like Runway References and Flux Kontext apply aesthetic of existing image to new content using style transfer

**Ethical Consideration:**
Create original styles by generating images specifically for training, rather than borrowing copyrighted movie imagery.

**Style Transfer Technique:**
Familiar from projects replicating styles like Miyazaki's Spirited Away, applies consistent filters to maintain unified look.

---

### Phase 3: Character Consistency and Development

**Challenge:**
Characters must appear consistent across shots, especially when faces and performances are central.

**Approaches:**

1. **Descriptive Text Prompts:** For generic characters, detailed prompts can suffice
2. **LoRA Models:** Train character-specific LoRA models to maintain facial and physical consistency
3. **Character Sheets:** Create pose sheets with front, side, and expression views to guide generation across angles
4. **Photo Inputs:** Some tools like Runway can recreate character from single photo

**Workflow:**
1. Train LoRA model first to establish character's base look
2. Create pose sheet that guides character's appearance in different positions and angles
3. This layered approach helps AI maintain character's identity through various shots

**Warning: The Uncanny Valley Effect**
Slight imperfections in faces can break audience immersion. Creators must invest time ensuring natural and believable character appearances.

---

### Phase 4: Incorporating Locations and Scenes

**Scene Consistency Challenge:**
Spatial consistency in AI-generated images remains a frontier challenge.

**Effective Method:**
- Use 3D environments (like Unreal Engine rooms) to generate 360-degree panoramas
- Apply style transfer to maintain consistent backgrounds
- Works well for conversations or multi-angle shots

**Tools Offering Solutions:**
- Flux Kontext
- ChatGPT (for understanding scene context)

**3D-Informed Approach:**
Using 3D models to inform AI generation shortcuts many issues, maintaining believable cinematic world.

---

### Phase 5: Generating First Frames (Text-to-Image)

**Process:**
With story, style, and characters locked down, move to generating first frames for each shot.

**Workflow:**
Blend text-to-image generation with reference images and LoRA models for control.

**Key Tools:**
- Midjourney
- Runway
- Ideogram
- Flux Kontext
- Google's Imagin

**LLM Role:**
Help refine and structure detailed prompts, often producing more effective inputs than creators might devise alone.

**VLM Role:**
Visual language models add flexibility by converting images back into text prompts for iteration.

**Hybrid Workflow:**
Combine 3D tools like Blender or Unreal Engine with AI style transfer:
1. Block out scenes in 3D
2. Generate consistent base images
3. Example: Pose Metahumans in Unreal and capture stills as references for AI generation

---

### Phase 6: Refining Images with Inpainting and Compositing

**Inpainting:**
- Modify specific areas without regenerating entire image
- Example: Changing coffee cup to chalice by painting over object and prompting AI to replace it

**Tools:**
- Photoshop with Adobe Firefly (commonly used)
- Blends traditional and AI tools effectively

**Multi-Character Compositing:**
For scenes with multiple characters, composite separate character images in Photoshop before final video generation. Offers better consistency than generating complex multi-character images directly in AI tools.

---

### Phase 7: From Images to Video

**Process:**
After establishing first frames, move to video generation.

**Image-to-Video Workflow:**
- Most AI tools support this
- Initial frame guides video output
- Some tools accept multiple frames (first, middle, last) for improved control

**Popular Video Generation Tools:**
- Chinese models like Hailuo
- ComfyUI models like Alibaba Wan 2.1 and Seedance

**Rendering Times:**
Comparable to traditional CG render timelines. 30-second 720p clips take about 1 hour on high-end GPUs.

**Camera Movement Control:**
- Evolving feature
- Some older models support mapping camera moves
- Newer versions may lack these features temporarily
- Resolve ambiguity by providing clear prompts and camera directions

---

### Phase 8: Addressing Challenges in AI Video Generation

**Two Significant Hurdles:**

1. **Consistent Character Performance**
2. **Syncing Lip Movements with Dialogue**

**Tools Offering Solutions:**
- Hedra
- HeyGen
- Runway Act-One

**Current Limitation:**
While AI excels at one-shot action sequences, sustained consistency over feature-length film with dialogue remains complex.

**Hybrid Solution:**
Combine real human performances filmed on green screens with AI-generated backgrounds or facial composites.

---

### Phase 9: Hybrid Workflows (Combining AI and Traditional Filmmaking)

**Approach:**
Integrating real actors with AI-generated environments or characters preserves authentic performances and direction.

**Techniques:**

1. Film actors on green screens with simple 3D backgrounds
2. Separately process backgrounds and relight with tools like Babel
3. Match-move cameras to align real and AI-generated footage

**Advantage:**
Helps overcome current AI limitations in faces and speech, especially for complex narratives requiring nuanced human expression.

---

### Phase 10: Video-to-Video Models and New Creative Directions

**Game-Changer:**
Luma AI's restyle video feature marks shift toward video-to-video workflows.

**Workflow:**
1. Shoot simple object-blocking videos (even with toys or household items)
2. Transform them into rich, cinematic sequences by restyling
3. Iterate through video generation to refine quality

**Example:**
John Fingers' demos: turning everyday footage into scenes like astronauts in space or stormy ships.

**Advantage:**
- Reduces dependence on traditional multi-step image generation
- Camera movements can be sourced from real-world footage, Blender, or Unreal Engine

---

### The Future of AI Filmmaking Workflows

**Current State:**
AI-generated filmmaking tools are already usable and affordable, but control and consistency challenges persist.

**Pace of Development:**
Rapid. Once video-to-video capabilities mature further, many current workflow complexities may simplify significantly.

**Reflection:**
In just two years, AI filmmaking has evolved from abstract style transfers to near-commercial-quality video generation.

**Best Practice for Now:**
Creators benefit from mix of AI tools and traditional techniques, adapting workflows as new models and features emerge.

---

## Research Needed:
- Storyboarding tools specifically designed for AI video (Katalist, Storyboarder.ai, Higgsfield)
- Shot length planning strategies (working within 5-10 second constraints)
- Coverage strategy (master, medium, close-up) for AI workflows
- Budget/credit estimation across models
- Timeline planning for AI video projects
- Breaking down scripts into AI-friendly shots
- Transition planning between shots


---

## Source: Medium - Simulation Production Method by Ayça Turan (Jan 1, 2025)

### The Simulation Production Method

**What It Is:**
A structured approach to AI Filmmaking that treats the creative process like building a simulated world. It's not a technical AI workflow — **it's a mindset**.

**Core Philosophy:**
- Creating intentionally, not randomly
- Experimenting boldly
- Rekindling the art of storytelling using modern tools and timeless human creativity
- Starting with what YOU want to watch
- Refining iteratively
- Telling stories that matter

---

### Core Principles

**1. Consistency:**
Maintain a unified visual language across all scenes by setting clear parameters for framing, tone, and lighting. A consistent lighting setup ensures every scene feels like it belongs to the same world.

**2. Iteration:**
Be comfortable with a loop of testing, reviewing, and improving outputs. Adjust details such as character's expression, lighting, or pose, and repeat until it feels right. **Creativity is not a straight line, it's a cycle of discovery.**

---

### The 6-Step Simulation Production Method

#### Step 1: Define the Creative Vision

**Start Analog:** Pen and paper, no technology.

**Key Questions:**
- What is the story I want to tell, and why does it matter?
- What emotions do I want to evoke?
- Who is my audience, and how will this story resonate with them?
- Is it futuristic, historical, or otherworldly?
- Does it feel hopeful, mysterious, or intense?

**Purpose:**
Ground your creative vision and establish the "why" behind your story. This foundational clarity will guide the rest of your filmmaking process.

**AI Advantage:**
AI filmmaking opens up creative possibilities that were once out of reach. Example: Shooting a film in a supermarket is traditionally costly and logistically challenging. With AI, you can explore such scenes without those limitations.

---

#### Step 2: Build the Visual Framework

**Two Key Components:**

**1. The Preset (Visual Baseline)**
Establishes the foundational look and feel of your film. Defines elements like lighting, framing, and background to maintain visual consistency across all scenes.

**Example Preset: "Dutch Town"**
"Traditional brick houses with gabled rooftops, cobblestone streets, and orderly rows of trees. Medium-wide framing captures architectural charm and quiet streets. Lighting is natural, diffused by an overcast sky."

**2. The Seed Prompt (Storytelling Layer)**
Layers storytelling elements onto the preset. Describes specific actions or moments within a scene, adding depth and narrative focus.

**Example Seed Prompt:**
"A young woman stands near a lamppost in the cobblestone square, wearing a long coat and holding a letter. Her expression is thoughtful as she gazes toward a distant shop window."

**How They Work Together:**
- Preset ensures tone and consistency
- Seed prompt drives the story forward
- Together they function like storyboarding — showing what is happening in each scene
- Enables visually cohesive and narratively compelling film

---

#### Step 3: Sketch the Narrative

**Purpose:**
Exploring your story visually and testing ideas with low-resolution outputs.

**Process:**
1. Divide narrative into segments (beginning, middle, end)
2. Identify key moments that define story's flow and emotional impact
3. Focus on discovering potential ideas — don't worry about perfection yet
4. Experiment with elements: costumes, props, lighting, poses
5. This is a creative playground where unexpected visuals can inspire new directions

**Workflow:**
- Work iteratively: generate, review, adjust, repeat
- Save promising outputs for refinement
- Visualize how scenes connect by sketching or jotting down transitions
- Keep it simple — overall tone and composition come first; details can follow

---

#### Step 4: Curate the Scenes

**Purpose:**
Focus and refine. Select the best outputs, blend or remix scenes, and ensure visuals align seamlessly with your story.

**Process:**
1. Review outputs to identify what works (compelling lighting, strong character expressions, consistent tones)
2. Identify what needs improvement (awkward framing, visual mismatches)
3. Notice gaps in narrative or missing transitions that need to be generated
4. Work iteratively, addressing one aspect at a time

**Key Insight:**
This is the **convergence phase** — shift from expanding possibilities to narrowing focus on what best serves your story. Decision fatigue can set in, so take frequent breaks to maintain clarity.

---

#### Step 5: Build Your Narrative (Visuals and Sound)

**Purpose:**
Where your story truly comes to life, combining visuals and sound to create cohesive and emotionally engaging narrative.

**Visual Sequencing:**
1. Sequence refined visuals in logical order
2. Focus on emotional flow — each scene transitions naturally to evoke intended feelings
3. Use linking visuals or animations (subtle camera movements, intermediate frames) to smooth transitions

**Sound Design (Critical!):**
- Give sound design the same attention as visuals
- Use it to enhance mood, evoke emotion, and add clarity to story
- Example: Gentle waves and soft wind enrich beach scene; low, ominous tones heighten tension in confrontation
- Layering sounds thoughtfully creates immersive experience

**Tools:**
- Learn sound editing basics with Audacity
- Explore sound archives like Freesound
- Experiment with AI tools like Udio, Suno, ElevenLabs

**Pro Tip:**
Treat sound design as a character in your film. Is she bold and commanding, subtle and mysterious, or warm and inviting? Let her personality shape the emotional core of your story.

---

#### Step 6: The Film Premiere

**Purpose:**
Share your work and gather feedback.

**Key Mindset:**
- It's not about the final film; it's about practice, bonding, and growth
- Start a storytelling circle — collaborate with friends by creating episodes together
- Think of yourself as the first viewer: What would you love to watch?

---

### Important Considerations

**Sound Design = Half of the Film's Experience**

A common pitfall in AI filmmaking is underestimating the power of sound design. The right music, ambient sounds, and even silence can elevate your visuals, immersing the audience and amplifying emotion.

**Be Conscious of Your Footprint**

Every generation uses computational energy. Not every story needs to be created with AI, and not every frame requires highest resolution.

**Best Practices:**
- Consider stock footage from sources like Pexels to complement your scenes
- Start with low-resolution tests (e.g., 480p) to explore ideas
- Reserve higher resolutions (e.g., 1080p) for finalized visuals that will truly matter in narrative

---

## Research Needed (Continued):
- AI storyboarding tools (Katalist, Storyboarder.ai, Higgsfield, LTX Studio, Adobe Firefly)
- Shot length planning strategies (working within 5-10 second constraints)
- Coverage strategy (master, medium, close-up) for AI workflows
- Budget/credit estimation across models
- Timeline planning for AI video projects
- Breaking down scripts into AI-friendly shots
- Transition planning between shots
- Model selection for specific shot types


---

## Source: Katalist.ai - AI Storyboard Generator

### Katalist: AI-Powered Storyboarding Platform

**What It Is:**
An innovative platform that leverages Storyboard AI and AI storytelling to help users create storyboards quickly and efficiently. The translation layer between your ideas and generative AI technology.

**Key Value Proposition:**
(Content truncated due to size limit. Use line ranges to read remaining content)