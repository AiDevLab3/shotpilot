
**Research Date:** January 26, 2026  
**Purpose:** Document audio generation capabilities, synchronization techniques, and integration workflows for Cine-AI knowledge base

---

## Part 1: ElevenLabs Audio Generation

**Source:** https://elevenlabs.io/docs/overview/capabilities/sound-effects  
**Date:** 2026

### Overview

ElevenLabs provides a comprehensive **text-to-audio API** that generates high-quality sound effects, voice synthesis, and music elements from text descriptions. The system understands both natural language and professional audio terminology, making it accessible to both beginners and professionals.

---

### Core Capabilities

**1. Sound Effects Generation**
- **Text-to-Sound:** Convert text descriptions into high-quality audio effects
- **Duration Control:** 0.1 to 30 seconds per generation
- **Seamless Looping:** Create endless loops for ambient sounds
- **Prompt Influence:** Control how strictly the model follows the prompt (high = literal, low = creative)

**2. Voice Generation**
- **Text-to-Speech (TTS):** Lifelike speech with nuanced intonation, pacing, and emotional awareness
- **Voice Cloning:** Create instant voice clones from a few seconds of sample audio
- **Multi-Language Support:** 70+ languages with native pronunciation
- **5000+ Voices:** Access to extensive voice library

**3. Music Elements**
- **Musical Components:** Generate drum loops, bass lines, melodic samples
- **BPM Control:** Specify tempo for rhythmic elements
- **Key/Scale Support:** Generate music in specific keys and scales

---

### Technical Specifications

| Feature | Specification |
|---------|--------------|
| **Maximum Duration** | 30 seconds per generation |
| **Sample Rate** | 48kHz (WAV) - industry standard for film/TV/video/games |
| **Audio Format** | MP3 (44.1kHz) or WAV (48kHz) |
| **Looping** | Seamless loop creation for sounds >30 seconds |
| **Cost** | 40 credits per second (when duration is specified) |
| **Generations per Request** | 4 variations created each time |

---

### Sound Effect Categories

**1. Simple Effects**
- Single-event sounds
- Clear, concise descriptions work best
- Examples: "Glass shattering on concrete", "Heavy wooden door creaking open", "Thunder rumbling in the distance"

**2. Complex Sequences**
- Multi-part sound effects with temporal progression
- Describe the sequence of events
- Examples: "Footsteps on gravel, then a metallic door opens", "Wind whistling through trees, followed by leaves rustling", "Sword being drawn, then clashing with another blade"

**3. Musical Elements**
- Rhythmic and melodic components
- Specify BPM, key, and style
- Examples: "90s hip-hop drum loop, 90 BPM", "Vintage brass stabs in F minor", "Atmospheric synth pad with subtle modulation"

---

### Audio Terminology for Prompting

**Impact** - Collision or contact sounds between objects, from subtle taps to dramatic crashes

**Whoosh** - Movement through air effects, ranging from fast and ghostly to slow-spinning or rhythmic

**Ambience** - Background environmental sounds that establish atmosphere and space

**One-shot** - Single, non-repeating sound

**Loop** - Repeating audio segment

**Stem** - Isolated audio component

**Braam** - Big, brassy cinematic hit that signals epic or dramatic moments, common in trailers

**Glitch** - Sounds of malfunction, jittering, or erratic movement, useful for transitions and sci-fi

**Drone** - Continuous, textured sound that creates atmosphere and suspense

---

### Prompting Best Practices

**For Best Results:**
1. **Be Specific:** "Heavy wooden door creaking open slowly" > "door sound"
2. **Use Audio Terminology:** Incorporate professional terms (impact, whoosh, ambience, etc.)
3. **Describe Sequences:** For complex sounds, describe the temporal progression
4. **Specify Musical Parameters:** Include BPM, key, and style for musical elements
5. **Adjust Prompt Influence:** High for literal interpretation, low for creative variation

**Example Prompts:**

| Use Case | Prompt |
|----------|--------|
| **Cinematic Impact** | "Deep, resonant braam with metallic overtones, perfect for trailer moment" |
| **Ambient Scene** | "Soft rain on pavement with distant thunder, looping ambience" |
| **Action Sequence** | "Fast whoosh followed by sharp metallic impact, then debris falling" |
| **Musical Element** | "Old-school funky brass stabs from a vinyl sample, stem, 88 bpm in F# minor" |

---

### Workflow Integration

**Step 1: Generate Video**
- Create video using AI video generator (Higgsfield, Veo, Kling, Runway, Seedance)
- Note timing of key events that need sound effects

**Step 2: Identify Audio Needs**
- Dialogue (if not using native audio model)
- Sound effects (Foley, impacts, ambience)
- Music (score, stingers, transitions)

**Step 3: Generate Audio with ElevenLabs**
- Create sound effects using text descriptions
- Generate dialogue using TTS or voice cloning
- Produce musical elements as needed
- Download in WAV format (48kHz) for professional quality

**Step 4: Synchronize & Mix**
- Import video and audio into editing software
- Align sound effects with visual events
- Mix dialogue, SFX, and music
- Export final video with synchronized audio

---

### Use Cases for Cinematic AI Workflow

**1. Silent Video Enhancement**
- Generate video with model that doesn't support native audio
- Add professional sound design with ElevenLabs
- Full creative control over audio mix

**2. Dialogue Replacement**
- Video has native audio but dialogue needs refinement
- Use ElevenLabs voice cloning for consistent character voices
- Replace or enhance existing dialogue

**3. Layered Sound Design**
- Native audio provides base ambience
- Add specific Foley and impact sounds with ElevenLabs
- Create rich, layered soundscape

**4. Music & Score**
- Generate musical elements (drums, bass, melodies)
- Combine multiple generations to create full score
- Sync music to visual beats and transitions

---

## Part 2: Native Audio in AI Video Models

### Overview: The Native Audio Revolution

**Paradigm Shift:** Traditional workflow required separate audio generation and synchronization. **Native audio models** generate video and audio simultaneously, ensuring perfect synchronization and contextual coherence.

---

### Model Comparison: Native Audio Capabilities

| Model | Native Audio | Audio Types | Lip-Sync | Sample Rate | Notes |
|-------|-------------|-------------|----------|-------------|-------|
| **Veo 3.1** | ✅ Yes | Dialogue, ambient, SFX, music | ✅ Yes | TBD | Best-in-class quality |
| **Kling 2.6** | ✅ Yes | Speech, dialogue, narration, singing, rap, ambient, SFX | ✅ Yes | 48kHz | Deep audio-visual alignment |
| **Seedance 1.5 Pro** | ✅ Yes | Native speech, spatial SFX, ambient | ✅ Yes (best) | TBD | Multi-language, best lip-sync |
| **Runway Gen-3** | ✅ Yes (Gen-4+) | Ambient, SFX | ❓ TBD | TBD | Recently added |
| **Higgsfield Cinema Studio v1.5** | ❌ No | N/A | N/A | N/A | Silent video only |

---

### Veo 3.1: Native Audio Generation

**Source:** https://gemini.google/overview/video-generation/, https://www.rundiffusion.com/google-new-veo-3-1-model  
**Date:** January 2026

**Key Features:**
- **Integrated Audio:** Dialogue, ambient sound, and sound effects generated directly within video
- **Synchronized Audio:** Audio automatically syncs to visual content
- **Contextual Coherence:** Audio matches visual context (e.g., footsteps on gravel sound different from footsteps on wood)
- **8-Second Limit:** Audio generation follows video length constraint

**How to Prompt:**
- Include audio descriptions in your text prompt
- Specify dialogue in quotes: "The character says, 'We need to leave now.'"
- Describe ambient sounds: "Ambient: quiet coffee shop with soft jazz in background"
- Mention specific sound effects: "SFX: car engine revving, tires screeching"

**Example Prompt:**
> "Medium shot of detective in rain-soaked alley, shot on ARRI Alexa 35 with Cooke S7/i 50mm lens, T2.8, film noir lighting. The detective says, 'I've been looking for you.' Ambient: heavy rain, distant sirens, water dripping from fire escape. SFX: footsteps splashing in puddles."

---

### Kling 2.6: Audio-Visual Co-Generation

**Source:** https://higgsfield.ai/kling-2.6-audio  
**Date:** December 2025

**Key Features:**
- **48kHz Audio:** Professional-grade audio quality
- **Flawless Lip-Sync:** Native mouth movement synchronization with dialogue
- **Deep Audio-Visual Alignment:** Sound rhythms match visual motion
- **Comprehensive Sound Types:** Speech, dialogue, narration, singing, rap, ambient, SFX, mixed effects

**Audio-Visual Co-Generation Philosophy:**
Unlike traditional tools that generate silent video and require separate audio addition, Kling 2.6 generates both visual frames and audio track simultaneously. This ensures:
- Perfect synchronization between motion and sound
- Contextually appropriate audio (e.g., spatial sound that follows subject movement)
- No post-production audio work required

**How to Prompt:**
- Use natural language to describe both visual action and auditory landscape
- Include dialogue, ambient sounds, and specific sound effects in single prompt
- Model interprets intent and delivers synchronized audio-visual output

**Example Prompt:**
> "Close-up of woman speaking directly to camera, professional lighting, modern office background. She says, 'This product will change your life.' Ambient: quiet office with subtle keyboard typing. Her voice is confident and clear."

**Best For:**
- Marketing and commercial video production
- Action scenes with dynamic motion and spatial audio
- Hyper-realistic generations with complex lighting and sound
- Any project requiring flawless lip-sync

---

### Seedance 1.5 Pro: Best-in-Class Lip-Sync

**Source:** https://higgsfield.ai/blog/Seedance-1.5-Pro-on-Higgsfield-A-Practical-Creator-Guide  
**Date:** December 2025

**Key Features:**
- **Best Lip-Sync Quality:** Industry-leading dialogue synchronization
- **Multi-Language Support:** English, Spanish, Mandarin, regional dialects
- **Phoneme-Specific Reshaping:** Lip movements adapt to each language's unique phonemes
- **Spatial Audio:** Sound effects coordinated with visuals
- **Native Speech Generation:** Dialogue generated with emotional delivery

**Audio Capabilities:**
1. **Speech Generation** - Multi-language dialogue with perfect lip-sync
2. **Sound Effects** - Spatial SFX coordinated with visuals
3. **Ambient Audio** - Room tone, environmental sounds
4. **Emotional Delivery** - Voice inflection matches character emotion

**How to Prompt:**
- Include dialogue in quotes within prompt
- Specify sound effects: "SFX: footsteps on gravel, distant thunder"
- Describe ambient soundscape: "Ambient: quiet coffee shop with soft jazz"
- Indicate emotional tone: "Character speaks with urgency and fear"

**Example Prompt:**
> "Medium close-up of confident creator speaking to camera, natural skin texture, subtle micro-expressions. The creator says, 'Welcome to my channel, today we're exploring AI filmmaking.' Ambient: clean room tone with subtle background music. Voice is warm and engaging."

**Best For:**
- Dialogue-driven scenes
- Talking-head UGC and product demos
- Multi-language content
- Any project where lip-sync quality is critical

---

### Runway Gen-3/Gen-4: Native Audio (Recent Addition)

**Source:** https://techcrunch.com/2025/12/11/runway-releases-its-first-world-model-adds-native-audio-to-latest-video-model/  
**Date:** December 2025

**Key Features:**
- **Native Audio Added:** Recent update adds audio generation to video
- **Ambient & SFX Focus:** Primarily environmental sounds and effects
- **Synchronized Output:** Audio matches visual context

**Note:** Native audio is a recent addition to Runway. Specific capabilities, prompting techniques, and audio quality require further research and community testing.

---

## Part 3: Audio Workflow Decision Tree

### When to Use Native Audio vs. ElevenLabs

**Use Native Audio (Veo 3.1, Kling 2.6, Seedance 1.5 Pro) When:**
✅ You need perfect lip-sync for dialogue
✅ You want automatic audio-visual synchronization
✅ You prefer streamlined, one-step workflow
✅ Your scene requires contextually coherent audio
✅ You're creating talking-head or dialogue-driven content

**Use ElevenLabs When:**
✅ Your video model doesn't support native audio (Higgsfield Cinema Studio v1.5)
✅ You need precise control over individual sound elements
✅ You want to layer multiple audio tracks
✅ You're creating complex sound design with specific SFX
✅ You need voice cloning for character consistency
✅ You want to generate music and score elements

**Hybrid Approach (Best of Both Worlds):**
1. Generate video with native audio for base dialogue and ambience
2. Add specific Foley, impacts, and music with ElevenLabs
3. Mix all elements in post-production for rich, layered soundscape

---

## Part 4: Audio Prompting Techniques

### Universal Audio Prompting Principles

**1. Describe Audio Explicitly**
- Don't assume the model will infer audio from visuals alone
- Explicitly state dialogue, sound effects, and ambient sounds

**2. Use Quotes for Dialogue**
- Format: "Character says, 'Exact dialogue here.'"
- Helps model distinguish dialogue from other audio elements

**3. Specify Audio Types**
- **Dialogue:** Character speech
- **Ambient:** Background environmental sounds
- **SFX:** Specific sound effects
- **Music:** Musical elements (if supported)

**4. Describe Spatial Relationships**
- "Distant thunder" vs. "Close thunder crack"
- "Footsteps approaching from left" vs. "Footsteps receding into distance"

**5. Indicate Emotional Tone**
- "Voice is urgent and fearful"
- "Dialogue is calm and reassuring"
- "Ambient sounds are tense and foreboding"

---

### Model-Specific Prompting

**Veo 3.1 Prompting:**
```
[Visual description], [camera specs], [lighting].
[Character] says, "[Dialogue]."
Ambient: [environmental sounds].
SFX: [specific sound effects].
```

**Kling 2.6 Prompting:**
```
[Composition], [character], [action].
[Character] says, "[Dialogue]."
[Ambient and SFX description integrated naturally].
```

**Seedance 1.5 Pro Prompting:**
```
[Composition], [character], [camera movement].
[Character] says, "[Dialogue]."
Ambient: [room tone and environmental sounds].
Voice is [emotional tone].
```

**ElevenLabs Prompting:**
```
[Specific sound description with audio terminology]
[Duration, BPM, key if applicable]
```

---

### Example Prompts with Audio

**Example 1: Dialogue Scene (Veo 3.1)**
> "Medium two-shot of detective and suspect in interrogation room, shot on Sony Venice with Zeiss Supreme Prime 50mm, T2.0, harsh overhead lighting creating deep shadows. Detective says, 'Where were you on the night of the 15th?' Suspect nervously replies, 'I was home alone.' Ambient: fluorescent light hum, distant police radio chatter. SFX: detective tapping pen on table."

**Example 2: Action Scene (Kling 2.6)**
> "Wide shot of cyberpunk street chase, neon reflections on wet pavement, camera tracking runner from behind. Runner's footsteps splash through puddles as they sprint. Ambient: heavy rain, distant sirens, electronic billboards humming. SFX: rapid footsteps, breathing heavily, car horn blaring."

**Example 3: Talking-Head UGC (Seedance 1.5 Pro)**
> "Medium close-up, eye level, soft background bokeh, clean indoor lighting. Confident creator, natural skin texture, subtle micro-expressions, relaxed posture. Creator says, 'Today I'm going to show you how to create stunning AI videos in minutes.' Ambient: clean room tone, soft background music. Voice is warm, engaging, and enthusiastic."

---

## Part 5: Audio Synchronization & Post-Production

### When Post-Production is Needed

**Native Audio Models:**
- Minimal post-production required
- May need volume balancing
- Can add music or additional SFX layers

**Silent Video Models + ElevenLabs:**
- Full audio synchronization required
- Mix dialogue, SFX, and music
- Color grade and finalize

---

### Post-Production Workflow

**Step 1: Import Assets**
- Import video file
- Import all audio files (dialogue, SFX, music)

**Step 2: Synchronize Audio**
- Align dialogue with character mouth movements
- Place sound effects at precise visual events
- Sync music to visual beats and transitions

**Step 3: Mix Audio**
(Content truncated due to size limit. Use line ranges to read remaining content)