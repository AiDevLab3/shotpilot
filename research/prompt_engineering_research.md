# Advanced Prompt Engineering Research Notes

## Source: Google Cloud - Ultimate Prompting Guide for Veo 3.1 (October 16, 2025)

### The Five-Part Prompt Formula

A structured prompt yields consistent, high-quality results. Google's recommended formula:

**[Cinematography] + [Subject] + [Action] + [Context] + [Style & Ambiance]**

1.  **Cinematography:** Define the camera work and shot composition
2.  **Subject:** Identify the main character or focal point
3.  **Action:** Describe what the subject is doing
4.  **Context:** Detail the environment and background elements
5.  **Style & Ambiance:** Specify the overall aesthetic, mood, and lighting

**Example Prompt:**
> "Medium shot, a tired corporate worker, rubbing his temples in exhaustion, in front of a bulky 1980s computer in a cluttered office late at night. The scene is lit by the harsh fluorescent overhead lights and the green glow of the monochrome monitor. Retro aesthetic, shot as if on 1980s color film, slightly grainy."

---

### Essential Prompting Techniques

#### 1. The Language of Cinematography

The [Cinematography] element is the most powerful tool for conveying tone and emotion.

**Camera Movement:**
- Dolly shot
- Tracking shot
- Crane shot
- Aerial view
- Slow pan
- POV shot

**Example: Crane Shot**
> "Crane shot starting low on a lone hiker and ascending high above, revealing they are standing on the edge of a colossal, mist-filled canyon at sunrise, epic fantasy style, awe-inspiring, soft morning light."

**Composition:**
- Wide shot
- Close-up
- Extreme close-up
- Low angle
- Two-shot

**Lens & Focus:**
- Shallow depth of field
- Wide-angle lens
- Soft focus
- Macro lens
- Deep focus

**Example: Shallow Depth of Field**
> "Close-up with very shallow depth of field, a young woman's face, looking out a bus window at the passing city lights with her reflection faintly visible on the glass, inside a bus at night during a rainstorm, melancholic mood with cool blue tones, moody, cinematic."

---

#### 2. Directing the Soundstage (Veo 3.1 Specific)

Veo 3.1 can generate a complete soundtrack based on text instructions.

**Dialogue:**
- Use quotation marks for specific speech
- Example: A woman says, "We have to leave now."

**Sound Effects (SFX):**
- Describe sounds with clarity
- Example: SFX: thunder cracks in the distance

**Ambient Noise:**
- Define the background soundscape
- Example: Ambient noise: the quiet hum of a starship bridge

---

#### 3. Mastering Negative Prompts

To refine output, describe what you wish to exclude.

**Best Practice:**
- ✅ Good: "a desolate landscape with no buildings or roads"
- ❌ Avoid: "no man-made structures"

**Principle:** Be descriptive about what you DON'T want, rather than using negative language.

---

#### 4. Prompt Enhancement with Gemini

If you need to add more detail, use Gemini to analyze and enrich a simple prompt with more descriptive and cinematic language.

**Workflow:**
1. Start with simple prompt
2. Feed to Gemini with instruction: "Enhance this prompt with more descriptive and cinematic language"
3. Use enhanced prompt in Veo 3.1

---

### Advanced Creative Workflows

#### Workflow 1: The Dynamic Transition with "First and Last Frame"

This technique allows you to create specific and controlled camera movement or transformation between two distinct points of view.

**Step 1: Create the Starting Frame**
Use Gemini 2.5 Flash Image (Nano Banana) to generate initial shot.

**Example Prompt:**
> "Medium shot of a female pop star singing passionately into a vintage microphone. She is on a dark stage, lit by a single, dramatic spotlight from the front. She has her eyes closed, capturing an emotional moment. Photorealistic, cinematic."

**Step 2: Create the Ending Frame**
Generate a second, complementary image with Gemini 2.5 Flash Image.

**Example Prompt:**
> "POV shot from behind the singer on stage, looking out at a large, cheering crowd. The stage lights are bright, creating lens flare. You can see the back of the singer's head and shoulders in the foreground. The audience is a sea of lights and silhouettes. Energetic atmosphere."

**Step 3: Animate with Veo**
Input both images into Veo using the First and Last Frame feature.

**Example Prompt:**
> "The camera performs a smooth 180-degree arc shot, starting with the front-facing view of the singer and circling around her to seamlessly end on the POV shot from behind her on stage. The singer sings 'when you look me in the eyes, I can see a million stars.'"

---

#### Workflow 2: Building a Dialogue Scene with "Ingredients to Video"

This workflow is ideal for creating a multi-shot scene with consistent characters engaged in conversation, leveraging Veo 3.1's ability to craft dialogue.

**Step 1: Generate Your "Ingredients"**
Create reference images using Gemini 2.5 Flash Image for your characters and the setting.

**Step 2: Compose the Scene**
Use the Ingredients to Video feature with the relevant reference images.

**Example Prompt (Shot 1):**
> "Using the provided images for the detective, the woman, and the office setting, create a medium shot of the detective behind his desk. He looks up at the woman and says in a weary voice, 'Of all the offices in this town, you had to walk into mine.'"

**Example Prompt (Shot 2):**
> "Using the provided images for the detective, the woman, and the office setting, create a shot focusing on the woman. A slight, mysterious smile plays on her lips as she replies, 'You were highly recommended.'"

---

#### Workflow 3: Timestamp Prompting

This workflow allows you to direct a complete, multi-shot sequence with precise cinematic pacing, all within a single generation.

By assigning actions to timed segments, you can efficiently create a full scene with multiple distinct shots, saving time and ensuring visual consistency.

**Example Prompt:**

> [00:00-00:02] Medium shot from behind a young female explorer with a leather satchel and messy brown hair in a ponytail, as she pushes aside a large jungle vine to reveal a hidden path.
>
> [00:02-00:04] Reverse shot of the explorer's freckled face, her expression filled with awe as she gazes upon ancient, moss-covered ruins in the background. SFX: The rustle of dense leaves, distant exotic bird calls.
>
> [00:04-00:06] Tracking shot following the explorer as she steps into the clearing and runs her hand over the intricate carvings on a crumbling stone wall. Emotion: Wonder and reverence.
>
> [00:06-00:08] Wide, high-angle crane shot, revealing the lone explorer standing small in the center of the vast, forgotten temple complex, half-swallowed by the jungle. SFX: A swelling, gentle orchestral score begins to play.

---

## Research Needed:
- Runway Gen-4.5 prompting guide
- Kling AI advanced prompting techniques
- Seedance prompting best practices
- General prompt engineering principles (beyond model-specific)
- Common prompting mistakes and how to avoid them
- Prompt iteration strategies
- Using LLMs to generate better prompts


---

## Source: Runway - Gen-4 Video Prompting Guide

### Core Philosophy: The Power of Simplicity

**Key Principle:** The Gen-4 model thrives on prompt simplicity.

Rather than starting with an overly complex prompt, begin your session with a simple prompt, and iterate by adding more details as needed.

---

### Prompting for Iteration

**Recommended Workflow:**

1. Begin with a foundational prompt that captures only the most essential motion to the scene
2. Once your basic motion works well, try adding different prompt elements to further refine the output:
   - Subject motion
   - Camera motion
   - Scene motion
   - Style descriptors
3. Add one new element at a time to identify which additions improve your video

**Example Prompt (All Ingredients):**
> "A handheld camera tracks the mechanical bull as it runs across the desert. The movement disturbs dust that trails behind the mechanical creature. Cinematic live-action."

---

### Best Practices

#### 1. Use Positive Phrasing Only

Gen-4 is designed to interpret prompts that describe what **should happen** in your video, not what should be avoided. Negative phrasing is not supported and may produce unpredictable or even opposite results.

**Examples:**
- ❌ Bad: "No camera movement. The camera doesn't move. NO MOVEMENT"
- ✅ Good: "Locked camera. The camera remains still."

---

#### 2. Use Direct, Simple, and Easily Understood Prompts

Avoid using overly conceptual language and phrasing when a simplistic description would efficiently convey the scene.

Abstract concepts force the model to interpret your intention, often resulting in random or unexpected movements. Always translate conceptual ideas into clear, specific physical actions the model can understand.

**Examples:**
- ❌ Bad: "The subject embodies the essence of joyful greeting, manifesting an acknowledgment of presence in a welcoming manner that conveys inner happiness."
- ✅ Good: "The woman smiles and waves."

---

#### 3. Focus on Describing the Motion, Rather than the Input Image

Both text and image inputs are considered part of your prompt. Reiterating elements that exist within the image in high detail can lead to reduced motion or unexpected results in the output.

**Examples:**
- ❌ Bad: "The tall man with black hair wearing a blue business suit and red tie reaches out his hand for a handshake"
- ✅ Good: "The man extends his arm to shake hands, then nods politely."

**Key Insight:** The input image establishes the visual starting point by conveying key visual information about subjects, composition, colors, lighting, and style—allowing you to focus on describing the desired motion.

---

#### 4. Avoid Conversational or Command-Based Prompts

While external LLMs thrive on natural conversation, Runway's models are designed to thrive on visual detail. Conversational elements like greetings or explanations waste valuable prompt space.

Command-based prompts that request changes often lack the descriptions needed to convey how an element should behave in the output.

**Examples:**
- ❌ Bad: "Can you please add my dog to the image?"
- ✅ Good: "A dog excitedly runs into the scene from off-camera"

---

#### 5. Avoid Overly Complex Prompts

Gen-4 generates videos in 5 and 10 second clips, so it can be helpful to consider each generation as a single scene.

Attempting to dictate each second of the video with multiple scene changes, subject actions, or style shifts may provide unintended results as the model attempts to reconcile too many disparate elements or contradictory instructions.

**Examples:**
- ❌ Bad: "A cat transforms into a dragon while jumping through a forest that changes seasons with each leap. The camera spins 360 degrees and zooms underwater where the dragon becomes a submarine in a neon cityscape."
- ✅ Good: "A cat transforms into a dragon while running through a forest."

---

### Prompt Elements

#### 1. Subject Motion

Subject motion describes how characters or objects should behave or move. May include physical movement, expressions, gestures, and more.

**Best Practice:** Refer to characters or objects with general terms like "the subject" or simple pronouns.

**Examples:**
- "The subject turns slowly"
- "She raises her hand"

**For Multiple Subjects:**
- Use clear positional language: "The subject on the left walks forward. The subject on the right remains still."
- Or simple descriptive identifiers: "The woman nods. The man waves."

---

#### 2. Scene Motion

Scene motion describes how the environment of a video should behave or react to motion. Scene motion may be based on subject motion or occur independently.

**Two Approaches:**

1. **Insinuated Motion:** "The subject runs across the dusty desert"
2. **Described Motion:** "The subject runs across the desert. Dust trails behind them as they move"

**Key Insight:** Insinuating motion with adjectives can lead to more natural results, while directly describing the motion can lead to emphasis of the element.

---

#### 3. Camera Motion

Camera motion describes how the camera should move through the scene in your input image.

**Can Prompt For:**
- Movement style (locked, handheld, dolly, pan, and more)
- Tracking subjects or moving independently through environments
- Shifts in focus

**Filmic Motion Terms:**
- Locked camera
- Handheld camera
- Dolly shot
- Pan
- Tracking shot
- Focus shift

---

#### 4. Style Descriptors

Style descriptors indicate broad or general motion elements.

**Examples:**
- Motion speed
- General movement style (live action, smooth animation, stop motion)
- Aesthetic style

**Usage:** Can be appended to prompts while refining results or included within the main body of the prompt.

---

### Example Prompts

**Example 1:**
> "The woman inspects her reflection in the mirror. The surface of the mirror bubbles with large, organically-shaped translucent bubbles in varying sizes. Locked camera."

**Example 2:**
> "The pile of rocks transforms into a humanoid made out of rugged volcanic rocks. The rock humanoid walks around the scene."

**Example 3:**
> "The handheld camera tracks the mouse as it scurries away."

**Example 4:**
> "The Brooklyn bridge gets on fire and collapses."

---

## Research Needed (Continued):
- Kling AI advanced prompting techniques (5 expert skills)
- Seedance prompting best practices
- General prompt engineering principles (beyond model-specific)
- Common prompting mistakes and how to avoid them
- Prompt iteration strategies
- Using LLMs to generate better prompts
