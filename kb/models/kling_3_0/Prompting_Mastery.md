# Kling 3.0 Prompting Mastery Guide: Multi-Shot Cinematic Video with Native Audio

**Version:** 2.0  
**Date:** February 19, 2026  
**Author:** Cine-AI Knowledge Base Team

---

## Table of Contents

1. [Introduction](#introduction)
2. [Technical Specifications](#technical-specifications)
3. [API Reference — fal.ai](#api-reference--falai)
4. [Generation Modes](#generation-modes)
5. [Core Prompting Framework: The 5-Layer Structure](#core-prompting-framework-the-5-layer-structure)
6. [Multi-Shot Intelligence](#multi-shot-intelligence)
7. [Elements 3.0 — Character & Object Consistency](#elements-30--character--object-consistency)
8. [Native Audio Generation](#native-audio-generation)
9. [Voice Control & Custom Voices](#voice-control--custom-voices)
10. [Camera Movement Mastery](#camera-movement-mastery)
11. [Start/End Frame Control](#startend-frame-control)
12. [Advanced Prompting Techniques](#advanced-prompting-techniques)
13. [Genre-Specific Cinematic Examples](#genre-specific-cinematic-examples)
14. [Best Practices](#best-practices)
15. [Common Mistakes & Troubleshooting](#common-mistakes--troubleshooting)
16. [Failure Modes & Edge Cases](#failure-modes--edge-cases)
17. [Integration Workflows](#integration-workflows)
18. [Kling 3.0 vs Kling 2.6 — Migration Guide](#kling-30-vs-kling-26--migration-guide)
19. [Kling O3 Variant](#kling-o3-variant)
20. [Pricing & Cost Optimization](#pricing--cost-optimization)

---

## Introduction

**Kling 3.0** is the latest generation of Kuaishou's video generation model, available exclusively on fal.ai. It represents a major leap over Kling 2.6 with **multi-shot intelligence** — the ability to generate edited sequences with shot changes, camera cuts, and continuous narrative in a single generation. Combined with Elements 3.0 for character/object consistency and native multilingual audio, Kling 3.0 is purpose-built for cinematic storytelling.

### What Makes Kling 3.0 Unique

- **Multi-Shot Intelligence:** Generate 2–6 shots with cuts, transitions, and scene changes in a single API call using `multi_prompt`
- **Extended Duration:** 3–15 second clips (vs. 5–10s in Kling 2.6), configurable per-second
- **Elements 3.0:** Lock character identity, object appearance, and style across shots using reference images and videos
- **Native Audio with Voice Control:** Generate synchronized dialogue, ambient sound, and music; clone custom voices with `voice_ids`
- **Start + End Frame Control:** Anchor both the opening and closing visual states for precise interpolation
- **Shot Type Intelligence:** Choose between `customize` (manual shot division) and `intelligent` (AI-determined cuts)
- **Improved Visual Quality:** Cinematic visuals with fluid motion, superior to V2.6 in lighting and detail

### When to Use Kling 3.0

**Best For:**
- Multi-shot narrative sequences (dialogue scenes, mini-stories, commercials)
- Character-driven storytelling with consistent identity across cuts
- Projects requiring native audio (dialogue, Foley, ambient, music)
- Cinematic sequences with motivated camera work and editing
- Extended-duration clips (10–15s) with complex narrative arcs
- Productions requiring voice cloning for specific character voices

**Not Ideal For:**
- Simple single-shot clips where Kling 2.6 is faster and cheaper
- Projects requiring resolutions above 1080p (use upscaling pipeline)
- Abstract/experimental visuals without narrative structure
- Extreme slow-motion or time-lapse effects
- On-screen text rendering (add in post-production)

---

## Technical Specifications

### Model Capabilities

| Feature | Specification |
|---------|--------------|
| **Resolution** | 720p–1080p native |
| **Clip Lengths** | 3s, 4s, 5s, 6s, 7s, 8s, 9s, 10s, 11s, 12s, 13s, 14s, 15s |
| **Frame Rate** | 24 FPS / 30 FPS |
| **Aspect Ratios** | 16:9, 9:16, 1:1 |
| **Audio** | Native multilingual (EN, ZH, JA, KO, ES) with code-switching |
| **Voice Control** | Up to 2 custom voice IDs per generation |
| **Lip-Sync** | Frame-accurate native lip-syncing |
| **Input Modes** | Text-to-Video, Image-to-Video (with Elements) |
| **Frame Control** | Start Frame + End Frame |
| **Multi-Shot** | 2–6 shots per generation via `multi_prompt` |
| **Elements** | Elements 3.0 — Identity Lock, Object Lock, Style Lock |
| **Negative Prompt** | Supported (default: "blur, distort, and low quality") |
| **CFG Scale** | Adjustable (default: 0.5) |

### Strengths

✅ **Multi-Shot Intelligence** — Generate edited sequences with natural cuts in one call  
✅ **Extended Duration** — Up to 15 seconds per generation (granular per-second control)  
✅ **Elements 3.0** — Superior identity/object/style locking across shots via reference images + video  
✅ **Voice Cloning** — Custom voices for up to 2 characters per generation  
✅ **Audio-Visual Sync** — Frame-level synchronization of dialogue, Foley, ambient, and music  
✅ **Narrative Coherence** — Maintains story logic, character motivation, and emotional arc across cuts  
✅ **Cinematic Motion** — Improved fluid motion, camera work, and physics over V2.6  
✅ **Flexible Duration** — Per-second duration control (3–15s) for precise timing  

### Limitations

❌ **Render Time** — Significantly slower than Kling 2.6 due to multi-shot complexity  
❌ **Text Rendering** — Struggles with on-screen text and signage (add in post)  
❌ **Complex Hand Interactions** — Typing, playing instruments can be inconsistent  
❌ **Motion Artifacts** — Occasional "sliding" in complex multi-character interactions  
❌ **Prompt Complexity** — Requires strict 5-layer structure for optimal results  
❌ **Cost** — Higher per-second cost than V2.6 ($0.224/s audio off vs $0.07/s)  
❌ **Multi-Shot Transitions** — Limited to cuts; smooth transitions (dissolves, wipes) require post-production  

---

## API Reference — fal.ai

Kling 3.0 is available exclusively on fal.ai with multiple endpoints.

### Endpoints

| Endpoint | Model ID | Description |
|----------|----------|-------------|
| **V3 Pro T2V** | `fal-ai/kling-video/v3/pro/text-to-video` | Text-to-Video (Pro quality) |
| **V3 Pro I2V** | `fal-ai/kling-video/v3/pro/image-to-video` | Image-to-Video with Elements support |
| **O3 Standard I2V** | `fal-ai/kling-video/o3/standard/image-to-video` | O3 variant — start/end frame interpolation |

### Text-to-Video (V3 Pro) — Input Schema

```json
{
  "prompt": "string",              // Text prompt (required if no multi_prompt)
  "duration": "5",                  // 3–15 seconds (string enum)
  "multi_prompt": [                 // Multi-shot array (overrides prompt)
    {
      "prompt": "string",          // Per-shot prompt
      "duration": "5"              // Per-shot duration
    }
  ],
  "generate_audio": true,          // Native audio generation (default: true)
  "voice_ids": ["voice_id_1"],     // Custom voice IDs (max 2)
  "shot_type": "customize",        // "customize" or "intelligent"
  "aspect_ratio": "16:9",          // 16:9, 9:16, 1:1
  "negative_prompt": "blur, distort, and low quality",
  "cfg_scale": 0.5                 // CFG guidance scale (default: 0.5)
}
```

### Image-to-Video (V3 Pro) — Input Schema

```json
{
  "prompt": "string",              // Motion description
  "start_image_url": "string",    // Required: URL of start frame
  "end_image_url": "string",      // Optional: URL of end frame
  "duration": "12",                // 3–15 seconds
  "generate_audio": true,
  "voice_ids": ["voice_id_1"],
  "multi_prompt": null,            // Multi-shot support
  "elements": [                    // Elements 3.0 references
    {
      "frontal_image_url": "string",      // Front-facing ref image
      "reference_image_urls": ["string"],  // Additional ref angles
      "video_url": "string"               // Optional video reference
    }
  ],
  "shot_type": "customize",
  "aspect_ratio": "16:9",
  "negative_prompt": "blur, distort, and low quality",
  "cfg_scale": 0.5
}
```

### O3 Variant — Input Schema

```json
{
  "prompt": "string",
  "image_url": "string",          // Required: start frame URL
  "end_image_url": "string",     // Optional: end frame URL
  "duration": "10",               // 3–15 seconds
  "generate_audio": true,
  "multi_prompt": null,
  "shot_type": "customize"
}
```

### Output Schema

```json
{
  "video": {
    "url": "string",
    "file_size": 8062911,
    "file_name": "output.mp4",
    "content_type": "video/mp4"
  }
}
```

### API Call Example (JavaScript)

```javascript
import { fal } from "@fal-ai/client";

// Simple text-to-video
const result = await fal.subscribe("fal-ai/kling-video/v3/pro/text-to-video", {
  input: {
    prompt: "A detective walks into a rain-soaked alley, pulls up his collar, and looks up at a flickering neon sign. Cinematic noir lighting, slow dolly in.",
    duration: "10",
    generate_audio: true,
    aspect_ratio: "16:9",
    negative_prompt: "blur, distort, low quality, anime, cartoon"
  },
  logs: true,
  onQueueUpdate: (update) => {
    if (update.status === "IN_PROGRESS") {
      update.logs.map((log) => log.message).forEach(console.log);
    }
  },
});
```

### API Call Example (Python)

```python
import fal_client

result = fal_client.subscribe(
    "fal-ai/kling-video/v3/pro/text-to-video",
    arguments={
        "prompt": "A detective walks into a rain-soaked alley...",
        "duration": "10",
        "generate_audio": True,
        "aspect_ratio": "16:9"
    }
)
print(result["video"]["url"])
```

---

## Generation Modes

### 1. Text-to-Video (T2V)

**Best For:** Creating videos entirely from text descriptions.

**Workflow:** Text prompt → Video + Audio generation

**Key Capabilities:**
- Single-shot or multi-shot via `multi_prompt`
- Native audio generation (dialogue, ambient, music, SFX)
- Voice cloning via `voice_ids`
- CFG scale control for prompt adherence vs. creativity balance

**When to Use:** Starting from scratch; full creative control needed; dialogue-heavy scenes

### 2. Image-to-Video (I2V)

**Best For:** Animating a hero frame with precise visual control.

**Workflow:** Upload start image + Motion prompt → Video + Audio generation

**Key Capabilities:**
- Start frame anchoring (visual identity locked from frame 1)
- End frame control (define exact end state)
- Elements 3.0 integration (character/object references)
- Multi-shot support with image anchoring

**When to Use:** When you've generated a perfect hero frame and want to animate it; character consistency is paramount; you need precise control over the opening visual

### 3. O3 Variant — Frame Interpolation

**Best For:** Smooth transitions between two defined visual states.

**Endpoint:** `fal-ai/kling-video/o3/standard/image-to-video`

**Workflow:** Start frame + End frame + Motion guidance prompt → Interpolated video

**Key Capabilities:**
- Start + end frame anchoring
- Text-driven style and scene guidance during interpolation
- Multi-shot support
- Native audio generation
- 3–15 second duration

**When to Use:** When you have both the opening and closing frames and need the model to create a smooth, narrative-driven transition between them. Excellent for before/after reveals, transformation sequences, and precisely controlled character movements.

---

## Core Prompting Framework: The 5-Layer Structure

Kling 3.0 achieves its best results when prompts follow a strict 5-layer structure. Each layer serves a specific purpose in the generation pipeline.

### Layer 1: Scene (The World)

Define the environment, lighting, atmosphere, and time of day. This anchors the model's spatial understanding.

**What to Include:**
- Location specifics (not just "a room" — describe materials, size, decay level)
- Time of day and lighting quality
- Weather and atmospheric effects
- Color palette and mood

**Examples:**
```
❌ "In a city"
✅ "In a rain-soaked Tokyo back alley at 2 AM, neon signs reflecting off puddles, steam rising from a grate, warm sodium vapor streetlights mixing with cold blue neon"
```

```
❌ "In an office"
✅ "In a sparse corner office on the 40th floor, floor-to-ceiling windows showing a gray overcast skyline, a single desk lamp casting warm light on scattered documents, venetian blind shadows striping the wall"
```

### Layer 2: Characters (The Actors)

Define who is in the scene with specific physical attributes, wardrobe, and emotional state.

**What to Include:**
- Physical description (age, build, distinguishing features)
- Wardrobe specifics (not just "suit" — describe fabric, fit, color, era)
- Emotional state and body language
- Relationship to other characters (if applicable)

**Examples:**
```
❌ "A man"
✅ "A weathered fisherman in his 60s, salt-and-pepper beard, sun-cracked skin, wearing a faded navy peacoat over a thick cable-knit sweater, calloused hands gripping a rope"
```

```
❌ "Two people talking"
✅ "A young woman in a crisp black pantsuit (corporate, confident) faces an older man in a rumpled cardigan (academic, defeated), the power dynamic visible in their posture"
```

### Layer 3: Action (The Physics)

Define what happens with specific movement descriptions. Kling 3.0 excels at interpreting physical actions when they include weight, speed, and interaction details.

**What to Include:**
- Specific movements (not "walks" — describe gait, pace, purpose)
- Object interactions with physics cues (weight, friction, momentum)
- Timing and pacing
- Cause-and-effect chains

**Examples:**
```
❌ "She picks up a cup"
✅ "She reaches for the ceramic mug with both hands, lifts it slowly — feeling its warmth — brings it to her lips, pauses, then takes a deliberate sip, steam curling past her eyes"
```

```
❌ "He runs"
✅ "He bursts into a sprint, sneakers slapping wet pavement, jacket flaring behind him, dodging a parked bicycle, arms pumping, breath visible in the cold air"
```

### Layer 4: Camera (The Lens)

Define camera movement, angle, framing, and lens characteristics. Kling 3.0 responds well to professional cinematography terminology.

**What to Include:**
- Camera movement type and speed
- Starting and ending framing
- Lens characteristics (focal length, depth of field)
- Motivation for the camera movement

**Examples:**
```
❌ "Camera moves"
✅ "Slow dolly in from medium shot to close-up on her face, f/1.4 shallow depth of field, background melting into bokeh as we push past the foreground clutter"
```

```
❌ "Wide shot"
✅ "Establishing wide shot on 24mm lens, deep focus, the character small in the lower-third of frame against the vast landscape, crane slowly rising to reveal the horizon"
```

### Layer 5: Audio (The Sound)

Define dialogue, ambient sound, music, and sound effects. Layer them with clear priority.

**What to Include:**
- Dialogue in quotes with emotional direction
- Ambient sound layers (primary + secondary)
- Sound effects timed to actions
- Music mood, tempo, and instrumentation (if applicable)

**Examples:**
```
❌ "With sound"
✅ "Dialogue: She whispers, 'I know what you did' with cold fury. Ambient: Rain hammering on the window, distant thunder. SFX: The sharp clink of her ring tapping the glass. Music: Low, menacing cello drone."
```

### Complete 5-Layer Prompt Example

```
[SCENE] A cramped detective's office at midnight, venetian blinds casting sharp shadows, a single desk lamp illuminating scattered case files, smoke curling from an ashtray, rain streaking the frosted glass door.

[CHARACTER] A hard-boiled detective in his 50s, loosened tie, rolled sleeves revealing a faded tattoo, five o'clock shadow, exhausted but determined eyes behind reading glasses.

[ACTION] He slowly removes his glasses, pinches the bridge of his nose, then slams his palm on the desk — scattering papers — as he stands abruptly, leaning forward on both fists.

[CAMERA] Start on a medium shot at desk level. As he removes his glasses, slow push in. On the desk slam, quick snap zoom to close-up of his face. Shallow depth of field throughout, f/2.0.

[AUDIO] Dialogue: He mutters, "That son of a..." with restrained rage. Ambient: Rain on windows, distant jazz from a radio. SFX: Sharp slap of palm on wood, papers rustling. Music: Low bass clarinet, smoky and tense.
```

---

## Multi-Shot Intelligence

Kling 3.0's flagship feature is multi-shot generation — creating an edited sequence of 2–6 shots in a single API call.

### How Multi-Shot Works

Instead of a single `prompt`, you provide a `multi_prompt` array where each element defines one shot with its own prompt and duration. The model handles continuity, cutting, and narrative flow.

### multi_prompt Schema

```json
{
  "multi_prompt": [
    {
      "prompt": "Shot 1 description using 5-layer structure",
      "duration": "5"
    },
    {
      "prompt": "Shot 2 description",
      "duration": "3"
    },
    {
      "prompt": "Shot 3 description",
      "duration": "4"
    }
  ],
  "shot_type": "customize"
}
```

**Duration Rules:**
- Each shot: 3–15 seconds
- Total duration = sum of all shot durations
- Maximum total: 15 seconds per generation

### Shot Type Modes

| Mode | Description | When to Use |
|------|-------------|-------------|
| `customize` | You define exact shot divisions and durations | Full editorial control; specific timing requirements |
| `intelligent` | AI determines optimal cut points and timing | Quick prototyping; letting the model decide pacing |

### Multi-Shot Prompt Examples

#### Two-Shot Dialogue Exchange

```json
{
  "multi_prompt": [
    {
      "prompt": "[SCENE] Dimly lit bar. [CHARACTER] A woman in a red dress, confident posture. [ACTION] She leans forward and speaks. [CAMERA] Medium close-up, shallow DOF. [AUDIO] She says, 'You have exactly five minutes' with icy calm. Jazz piano in background.",
      "duration": "5"
    },
    {
      "prompt": "[SCENE] Same bar, reverse angle. [CHARACTER] A nervous man in a cheap suit, sweat on his brow. [ACTION] He swallows hard, loosens his tie, starts to respond. [CAMERA] Matching medium close-up, slight handheld shake. [AUDIO] He stammers, 'That's... that's not enough time' with desperation. Same jazz piano continues.",
      "duration": "5"
    }
  ],
  "shot_type": "customize",
  "generate_audio": true
}
```

#### Three-Shot Action Sequence

```json
{
  "multi_prompt": [
    {
      "prompt": "[SCENE] Rooftop at dusk, city skyline. [CHARACTER] Parkour runner in dark athletic wear. [ACTION] Sprints toward roof edge at full speed. [CAMERA] Tracking shot from behind, handheld energy. [AUDIO] Heavy breathing, sneakers on concrete, wind rushing.",
      "duration": "4"
    },
    {
      "prompt": "[SCENE] Gap between buildings, dizzying height. [ACTION] Launches off the edge, body stretched in mid-air leap. [CAMERA] Slow-motion side angle, 120fps feel. [AUDIO] Sound drops to near-silence, just heartbeat and wind.",
      "duration": "4"
    },
    {
      "prompt": "[SCENE] Next rooftop, landing zone. [ACTION] Lands with a roll, springs back to feet, keeps running. [CAMERA] Low angle looking up as subject lands, then whip pan to follow. [AUDIO] Heavy impact, grunt, sneakers scraping, breathing resumes full speed.",
      "duration": "4"
    }
  ],
  "shot_type": "customize"
}
```

### Multi-Shot Continuity Tips

1. **Repeat key visual details across shots** — If a character wears a red dress in Shot 1, mention it in Shot 2
2. **Use "Same location" or "Reverse angle"** — Explicitly tell the model about spatial continuity
3. **Maintain audio continuity** — Reference ongoing ambient sounds across shots ("Same jazz piano continues")
4. **Use consistent lighting language** — If Shot 1 is "warm golden hour," don't describe Shot 2 as "cool blue"
5. **End Shot N where Shot N+1 begins** — Describe the end state of one shot matching the start of the next

### Transition Control

Kling 3.0 handles **hard cuts** between multi-prompt shots. For other transitions:

| Transition | How to Achieve |
|-----------|----------------|
| **Hard Cut** | Default behavior between multi_prompt shots |
| **Match Cut** | End Shot 1 and start Shot 2 with similar composition/movement |
| **Jump Cut** | Same framing, slightly different moment (great for time-skip) |
| **Crossfade/Dissolve** | Not natively supported — add in post-production |
| **Whip Pan Transition** | End Shot 1 with whip pan; start Shot 2 with matching whip pan |

---

## Elements 3.0 — Character & Object Consistency

Elements 3.0 is Kling 3.0's system for maintaining consistent character identity, object appearance, and visual style across shots and generations.

### How Elements Work

Each Element is a reference package containing:
- **Frontal Image URL** — A clear, front-facing reference image of the character/object
- **Reference Image URLs** — Additional angles (side, back, 3/4 view) for better 3D understanding
- **Video URL** — Optional video reference for motion style, expressions, or mannerisms

You can define up to 2 Elements per generation, referenced in your prompt as `@Element1` and `@Element2`.

### Element Schema

```json
{
  "elements": [
    {
      "frontal_image_url": "https://example.com/character_front.png",
      "reference_image_urls": [
        "https://example.com/character_side.png",
        "https://example.com/character_back.png"
      ],
      "video_url": null
    },
    {
      "frontal_image_url": "https://example.com/object_front.png",
      "reference_image_urls": [],
      "video_url": "https://example.com/object_rotation.mp4"
    }
  ]
}
```

### Referencing Elements in Prompts

Use `@Element1` and `@Element2` in your prompt text to tell the model which character/object to use:

```
"@Element1 walks into the room and picks up @Element2 from the table. She examines it carefully, turning it in her hands."
```

### Types of Element Locks

| Lock Type | What It Does | Best Reference |
|-----------|-------------|----------------|
| **Identity Lock** | Keeps face, body, and distinguishing features consistent | Clear frontal photo + 2-3 angle refs |
| **Object Lock** | Keeps props, vehicles, or items identical across shots | Multiple angles of the object |
| **Style Lock** | Maintains color grading, visual treatment, and aesthetic | Style reference image or video with consistent look |

### Element Best Practices

1. **Use high-quality reference images** — 1024px+ resolution, good lighting, neutral background
2. **Provide multiple angles** — Front + side + 3/4 view significantly improves consistency
3. **Match lighting in references** — If your scene is dark/moody, use references with similar lighting
4. **Video references for motion style** — Upload a short clip showing how a character moves/expresses
5. **Keep wardrobe consistent in references** — If you want a character in a specific outfit, show it in all refs
6. **Don't overload references** — 1 frontal + 2-3 reference angles is optimal; more can confuse the model

### Identity Maintenance Across Multi-Shot

When using Elements with multi_prompt, reference the Element in EVERY shot prompt:

```json
{
  "multi_prompt": [
    {
      "prompt": "@Element1 enters the cafe. She's nervous, fidgeting with her bag strap. Medium shot, warm interior lighting.",
      "duration": "5"
    },
    {
      "prompt": "@Element1 sits down at a corner table, removes her jacket. Close-up on her face as she scans the room. Same warm lighting.",
      "duration": "5"
    }
  ],
  "elements": [
    {
      "frontal_image_url": "https://example.com/sarah_front.png",
      "reference_image_urls": ["https://example.com/sarah_side.png"]
    }
  ]
}
```

---

## Native Audio Generation

Kling 3.0 generates synchronized audio by default (`generate_audio: true`). It supports four audio categories with frame-accurate synchronization.

### Audio Types

#### 1. Dialogue
- Frame-accurate lip-sync in Chinese and English natively
- Other languages auto-translated to English
- For English: use lowercase for normal speech; UPPERCASE for acronyms/proper nouns
- Emotional delivery controlled by prompt description

**Syntax:**
```
Character says, "Exact dialogue text" with [emotional descriptor].
```

**Examples:**
```
She whispers, "don't move" with barely contained terror.
He shouts, "the FBI is here!" with panic.
The child giggles, "mommy look at this" with innocent excitement.
```

#### 2. Ambient Sound
Environmental audio matching the visual scene.

**Examples:**
```
Ambient: Busy city intersection — honking, distant sirens, crowd murmur, wind between buildings.
Ambient: Dense rainforest — cicadas, distant bird calls, leaves rustling, dripping water.
Ambient: Empty warehouse — echo, distant dripping, faint industrial hum.
```

#### 3. Sound Effects (Foley)
Action-synchronized sounds with physics accuracy.

**Examples:**
```
SFX: Glass shattering on impact, sharp and bright.
SFX: Heavy oak door creaking open slowly, then thudding shut.
SFX: Leather shoes clicking on marble floor, measured pace.
SFX: Key turning in lock, mechanical click, door handle depressing.
```

#### 4. Music / Underscore
Background music matching mood and genre.

**Examples:**
```
Music: Soft melancholic piano, single notes, minor key, slow tempo.
Music: Driving electronic beat, 128 BPM, synth bass, tension building.
Music: Warm acoustic guitar fingerpicking, folk style, gentle and nostalgic.
```

### Audio Layering Best Practices

Always layer audio elements with clear hierarchy:

```
Primary: Dialogue — "We need to leave. Now." spoken with quiet urgency.
Secondary: Ambient — Rain hammering the windows, thunder in the distance.
Tertiary: SFX — Car keys jangling as she grabs them from the counter.
Underscore: Low, pulsing electronic drone, building tension.
```

**Priority Rule:** When dialogue is present, the model automatically mixes other audio lower. Describe this explicitly if you want specific balance:
```
"Dialogue is clear and forward in the mix. Ambient rain is subtle, at 30% volume. Music is barely audible, felt more than heard."
```

### Audio Across Multi-Shot

Maintain audio continuity across shots by referencing ongoing sounds:

```
Shot 1: "...rain pouring outside, jazz piano from a jukebox."
Shot 2: "Same rain continues. The jazz piano is slightly muffled now, heard through a wall."
Shot 3: "Rain stops. Silence. Then a single piano note."
```

---

## Voice Control & Custom Voices

Kling 3.0 supports custom voice cloning via the `voice_ids` parameter, allowing you to assign specific voices to characters.

### Creating Custom Voices

1. Use the voice creation endpoint: `fal-ai/kling-video/create-voice`
2. Upload a clear audio sample (10–30 seconds recommended)
3. Receive a `voice_id` string

### Using Voice IDs

Reference voices in your prompt using `<<<voice_1>>>` and `<<<voice_2>>>` (maximum 2 per generation):

```json
{
  "prompt": "<<<voice_1>>> says, 'I've been waiting for this moment' with quiet determination. <<<voice_2>>> responds, 'Then let's not waste it' with a confident smile.",
  "voice_ids": ["voice_abc123", "voice_def456"],
  "generate_audio": true
}
```

### Voice Control Tips

- **Clear reference audio** — Record in a quiet environment, consistent tone
- **Match voice to character** — The model uses the voice ID for delivery but relies on your prompt for emotion
- **Language considerations** — English speech works best in lowercase; use CAPS for acronyms (FBI, NASA, CEO)
- **Two-voice limit** — For scenes with 3+ characters, generate in multiple passes

---

## Camera Movement Mastery

Kling 3.0 inherits and extends Kling 2.6's camera vocabulary. Always specify camera movement with **motivation** (why the camera moves) and **emotional intent** (what the audience should feel).

### Camera Movement Vocabulary

#### Dolly Movements
| Movement | Description | Emotional Effect | Prompt Syntax |
|----------|-------------|-----------------|---------------|
| Slow dolly in | Camera glides toward subject | Intimacy, focus, realization | "Slow dolly in to close-up" |
| Fast dolly in | Rapid push toward subject | Urgency, shock, revelation | "Rapid push in to extreme close-up" |
| Dolly out | Camera retreats from subject | Isolation, revelation of context | "Slow pull out to wide shot" |
| Dolly alongside | Camera moves parallel to subject | Immersion, accompaniment | "Dolly alongside at walking pace" |

#### Pan & Tilt
| Movement | Description | Emotional Effect | Prompt Syntax |
|----------|-------------|-----------------|---------------|
| Slow pan | Horizontal sweep | Exploration, gradual reveal | "Slow pan left to right, revealing the cityscape" |
| Whip pan | Ultra-fast horizontal | Surprise, disorientation, energy | "Whip pan to the right" |
| Tilt up | Camera angles upward | Power, aspiration, scale | "Slow tilt up from feet to face" |
| Tilt down | Camera angles downward | Vulnerability, diminishment | "Tilt down from sky to subject" |

#### Tracking Shots
| Movement | Description | Emotional Effect | Prompt Syntax |
|----------|-------------|-----------------|---------------|
| Follow track | Camera follows behind subject | Immersion, journey | "Camera follows from behind at medium distance" |
| Lead track | Camera leads in front of subject | Anticipation, tension | "Camera leads subject, facing them" |
| Side track | Camera moves parallel | Observational, documentary | "Side tracking shot at eye level" |

#### Specialty Movements
| Movement | Description | Emotional Effect | Prompt Syntax |
|----------|-------------|-----------------|---------------|
| Crane up/down | Vertical movement on crane | Scale revelation, epic scope | "Crane up from subject to aerial view" |
| Arc/orbit | Camera circles subject | Examination, revelation, drama | "Slow arc around subject, 180 degrees" |
| Handheld | Organic, unstable movement | Documentary feel, intimacy, tension | "Handheld, slight shake, documentary style" |
| Steadicam | Smooth floating movement | Fluid, dreamlike, following | "Steadicam following through hallway" |

### Lens & Depth of Field

| Lens | Effect | When to Use |
|------|--------|-------------|
| Wide angle (16-24mm) | Expansive, environmental | Establishing shots, environments, epic scale |
| Standard (35-50mm) | Natural perspective | Dialogue, medium shots, neutral feel |
| Telephoto (85-200mm) | Compressed, intimate | Close-ups, portraits, compressed backgrounds |
| Macro | Extreme detail | Product shots, texture, detail inserts |

**Depth of Field:**
```
"f/1.4, razor-thin depth of field, only eyes in focus"
"f/2.8, shallow DOF, subject sharp against creamy bokeh"
"f/8, medium depth, subject and near background sharp"
"f/16, deep focus, everything sharp from foreground to infinity"
```

---

## Start/End Frame Control

### How It Works

- **Start Frame:** Upload an image that becomes the first frame of the video. Locks visual identity, composition, lighting, and style from frame 1.
- **End Frame:** Upload an image that the video interpolates toward. The model creates a smooth narrative path from start to end.

### When to Use Start/End Frames

| Scenario | Start Frame | End Frame |
|----------|-------------|-----------|
| Animate a hero image | ✅ Required | Optional |
| Before/after transformation | ✅ Before state | ✅ After state |
| Precise character movement | ✅ Starting pose | ✅ Ending pose |
| Scene transition | ✅ Scene A | ✅ Scene B |
| Maximum creative freedom | ❌ Use T2V instead | ❌ |

### Start/End Frame Best Practices

1. **Match aspect ratio** — Frame images must match the `aspect_ratio` parameter (16:9, 9:16, 1:1)
2. **Consistent style** — Start and end frames should share similar lighting, color grade, and style
3. **Physically plausible transition** — The model interpolates; extreme differences between frames create artifacts
4. **High resolution inputs** — 1080p+ input images produce better results
5. **Use prompt to guide the middle** — Describe what happens BETWEEN the frames

```json
{
  "prompt": "The woman slowly turns from the window to face the camera. Her expression shifts from contemplation to resolve. Soft afternoon light wraps around her. Slow, deliberate movement.",
  "start_image_url": "https://example.com/woman_at_window.png",
  "end_image_url": "https://example.com/woman_facing_camera.png",
  "duration": "8"
}
```

---

## Advanced Prompting Techniques

### Technique 1: Emotion Interpolation

Describe the emotional arc, not just actions. The model interpolates facial expressions and body language.

```
"Start: She is calm, composed, hands folded. As she reads the letter, her brow furrows, lips tighten. By the end, her eyes are welling with tears, jaw clenched, fighting to maintain composure."
```

### Technique 2: Physics-Aware Action Descriptions

Include weight, friction, momentum, and material interaction for realistic motion.

```
❌ "She throws the ball"
✅ "She winds up with a full-body rotation, plants her back foot, and hurls the heavy medicine ball — her arms following through past her hip, the ball arcing with visible mass, landing with a heavy thud that kicks up dust"
```

### Technique 3: Negative Prompting

Use `negative_prompt` to exclude unwanted elements:

**Default:** `"blur, distort, and low quality"`

**Enhanced for cinematic:**
```
"blur, distort, low quality, anime, cartoon, illustration, deformed hands, extra fingers, watermark, text overlay, stock photo, flat lighting"
```

**For photorealism:**
```
"blur, distort, low quality, CGI look, uncanny valley, plastic skin, over-saturated, HDR look, unnatural colors"
```

### Technique 4: CFG Scale Tuning

The `cfg_scale` parameter (default: 0.5) controls prompt adherence vs. creative freedom:

| CFG Value | Effect | When to Use |
|-----------|--------|-------------|
| 0.1–0.3 | Very creative, loose interpretation | Abstract, artistic, experimental |
| 0.4–0.6 | Balanced (default range) | Most cinematic work |
| 0.7–0.9 | Strict prompt adherence | Technical shots, precise requirements |
| 1.0 | Maximum adherence | Very specific compositions |

### Technique 5: Temporal Pacing Control

Control the pacing within a shot by describing timing explicitly:

```
"For the first 3 seconds: stillness, only subtle breathing. At second 4: sudden movement — she turns sharply. Seconds 5-8: slow-motion as she reaches for the door handle. Final 2 seconds: real-time, door swings open."
```

### Technique 6: Environmental Storytelling

Let the environment carry narrative weight:

```
"The room tells the story: half-packed boxes, a calendar with days crossed off, a single framed photo face-down on the mantle, morning light catching dust motes that drift like memories. She stands in the doorway, coat already on, taking one last look."
```

---

## Genre-Specific Cinematic Examples

### Film Noir

```
[SCENE] A rain-slicked downtown street at 2 AM, art deco buildings, a single streetlight creating a hard pool of light, wet reflections stretching across black asphalt, venetian blind shadows cast from an upstairs window.

[CHARACTER] A femme fatale in a fitted 1940s dress, dark lipstick, cigarette holder, half her face in shadow, eyes catching the light.

[ACTION] She steps out of a doorway into the light, pauses, flicks ash from her cigarette, then walks with deliberate, confident strides into the darkness.

[CAMERA] Start wide on the street. As she steps into the light, slow push in to medium shot. Track alongside as she walks. High contrast, deep blacks, f/2.8.

[AUDIO] Dialogue: She says, "you shouldn't have come" with world-weary detachment. Ambient: Rain on pavement, distant car horn. SFX: Heels clicking on wet stone, cigarette sizzle. Music: Muted trumpet, smoky and melancholic.
```

### Sci-Fi / Cyberpunk

```
[SCENE] A cramped noodle stall in a towering megacity, holographic advertisements reflecting off rain-soaked surfaces, steam rising from cooking pots, exposed wiring and jury-rigged tech everywhere.

[CHARACTER] A young hacker with a shaved head, neural interface port behind her ear, wearing a patched synthetic jacket, neon tattoo glowing on her neck.

[ACTION] She slurps noodles aggressively, then freezes — something in her neural feed. She touches the port behind her ear, eyes unfocusing. She slams down credits and bolts.

[CAMERA] Close-up on noodles being slurped. Rack focus to her face as she freezes. Quick snap zoom on the neural port. Whip pan as she stands and exits frame. Handheld, frenetic energy.

[AUDIO] Ambient: Sizzling wok, crowd murmur, electronic advertisements in Mandarin. SFX: Noodle slurp, electronic chime (neural notification), coins hitting counter, chair scraping. Music: Glitchy electronic ambient, low synth pulse.
```

### Horror

```
[SCENE] An abandoned Victorian nursery, peeling wallpaper with faded roses, a rocking chair moving on its own in the corner, moonlight through a cracked window, dust motes drifting.

[CHARACTER] A woman in her 30s, pale face, dark circles under eyes, wearing a thin nightgown, holding a candle that barely illuminates her face.

[ACTION] She enters slowly, each step creaking. She notices the rocking chair. Her hand trembles, the candle flame guttering. She whispers. The rocking stops.

[CAMERA] Extreme wide shot as she enters, she's small against the room. Slow push in as she approaches the chair. Cut to close-up of her face as the rocking stops. Deep shadows, underlit by candle only.

[AUDIO] Dialogue: She whispers, "is someone there?" with fragile courage. Ambient: Creaking wood, wind through cracks, distant pipes groaning. SFX: Footsteps on old floorboards, rocking chair rhythm... then silence. Music: Single sustained violin harmonic, barely audible.
```

### Commercial / Product

```
[SCENE] Minimalist white studio, soft gradient background, product on a glass pedestal, perfectly controlled three-point lighting with subtle warm key and cool fill.

[CHARACTER] None — product hero shot.

[ACTION] The luxury watch rotates slowly on the pedestal, catching light on its polished surfaces. The crown catches a highlight. The second hand moves precisely.

[CAMERA] Start wide establishing the product in space. Slow arc around the watch, 180 degrees. Push in to extreme close-up on the dial. Macro focus on the crown. f/2.8 throughout.

[AUDIO] No dialogue. Ambient: Silence. SFX: Subtle mechanical tick of the watch, crisp and precise. Music: Minimal piano, two notes, elegant and spacious.
```

### Documentary / Interview

```
[SCENE] A working-class kitchen, cluttered but loved, family photos on the refrigerator, afternoon light through a small window over the sink, well-used wooden table.

[CHARACTER] An elderly grandmother in her 80s, silver hair in a bun, floral apron, warm eyes with deep laugh lines, hands folded on the table.

[ACTION] She speaks directly to camera, gesturing occasionally with weathered hands, eyes occasionally glancing away in memory, then back to camera with a knowing smile.

[CAMERA] Medium close-up, slightly below eye level (respectful). Steady tripod. f/2.8 with kitchen softly out of focus. Natural light only, no hard shadows. Documentary aesthetic.

[AUDIO] Dialogue: She says, "back then we didn't have much, but we had each other, and that was enough" with gentle nostalgia and quiet pride. Ambient: Clock ticking, refrigerator hum. Music: None — let the words carry.
```

---

## Best Practices

### The 10 Commandments of Kling 3.0 Prompting

1. **Always use the 5-layer structure** — Scene, Character, Action, Camera, Audio. Every layer matters.

2. **Be specific, not vague** — "A weathered fisherman in his 60s with a salt-and-pepper beard" not "a man"

3. **Motivate every camera move** — Camera movement serves story. "Dolly in to reveal the trembling in her hands" not "camera moves forward"

4. **Layer audio explicitly** — Separate dialogue, ambient, SFX, and music. Describe each distinctly.

5. **Use Elements for character consistency** — Don't rely on text alone for identity across shots. Upload reference images.

6. **Match multi-shot continuity** — Repeat key visual details, maintain lighting language, reference ongoing audio.

7. **Describe physics, not just actions** — Include weight, momentum, friction, material interaction. "Heavy boots on wet gravel" not "walking."

8. **Control pacing through duration** — Use the 3–15s range precisely. A 5s shot feels different from a 12s shot with the same action.

9. **Use negative prompts** — Customize beyond the default. Add style-specific exclusions.

10. **Iterate and refine** — Kling 3.0 is powerful but benefits from iteration. Adjust CFG, rephrase actions, try different durations.

### Prompt Length Guidelines

| Shot Type | Recommended Length | Notes |
|-----------|-------------------|-------|
| Simple single-shot | 50–100 words | Clear and focused |
| Complex single-shot | 100–200 words | All 5 layers detailed |
| Multi-shot (per shot) | 50–150 words | Concise but complete per shot |
| Total multi-shot prompt | 200–500 words | Across all shots |

---

## Common Mistakes & Troubleshooting

### 12 Common Issues + Fixes

| # | Problem | Cause | Fix |
|---|---------|-------|-----|
| 1 | Identity drift between shots | Insufficient character description or no Elements | Use Elements 3.0 with frontal + reference images; repeat character description in every shot prompt |
| 2 | Dialogue desync / muffled | Emotion specified AFTER dialogue text | Specify emotion BEFORE or alongside dialogue: `says with urgency, "we need to go!"` |
| 3 | "Sliding" feet on ground | Missing ground interaction physics | Specify surface: "heavy boots on wet gravel, each step crunching" |
| 4 | Cuts feel jarring | No continuity cues between shots | Use "Same location," "Reverse angle," maintain lighting + audio consistency |
| 5 | Background goes blurry/noisy | No DOF specification | Explicitly specify: "f/8 deep focus" for sharp backgrounds, "f/1.4 bokeh" for intentional blur |
| 6 | Color shifts between shots | No consistent color language | Add "Color Grade: warm amber tones" or "Teal and orange palette" to EVERY shot |
| 7 | Audio overwhelms dialogue | No audio layering instructions | Explicitly: "Dialogue clear and forward. Ambient at 30%. Music barely audible." |
| 8 | Model hallucinating extra objects | Overcomplicated single prompt | Simplify; split into multiple shots; use negative prompt to exclude unwanted elements |
| 9 | Camera movement feels unmotivated | No narrative purpose described | Add purpose: "Dolly in to reveal the tear on her cheek" not "camera moves in" |
| 10 | Character does wrong action | Ambiguous action description | Be hyper-specific with timing and physics; one clear action per shot |
| 11 | Style inconsistency | No explicit style anchoring | Add style keywords to every prompt: "Cinematic, film grain, teal-orange grade, 2.39:1 aspect" |
| 12 | Generation too slow | Unnecessarily complex multi-shot | Simplify shot count; use `intelligent` shot_type for faster processing |

---

## Failure Modes & Edge Cases

### Known Failure Modes

| Failure | Trigger | Workaround |
|---------|---------|------------|
| **Hand deformation** | Detailed hand interactions (typing, playing piano) | Simplify hand actions; frame hands loosely; use close-ups sparingly |
| **Text rendering** | On-screen text, signs, book pages | Add text in post-production; use negative prompt "text, words, letters" |
| **Mirror/reflection errors** | Mirrors, reflective surfaces | Avoid mirror scenes or accept imperfection; add reflections in post |
| **Multiple people confusion** | 3+ characters in close interaction | Limit to 2 characters per shot; use Elements to lock identities |
| **Extreme perspective distortion** | Very wide angle + close subjects | Use standard focal lengths (35-85mm) for character shots |
| **Audio language mixing** | Multi-language dialogue in one shot | Keep one language per shot; code-switching works for EN↔ZH |
| **Duration overflow** | multi_prompt total > 15s | Keep total ≤ 15s; split into multiple API calls for longer sequences |

---

## Integration Workflows

### Pipeline 1: Hero Frame → Animated Sequence

```
1. Generate hero frame (Nano Banana Pro / Midjourney / Flux 2)
2. Upscale to 4K (Topaz AI)
3. Upload as start_image_url to Kling 3.0 I2V
4. Prompt camera movement + action + audio
5. Generate 10-15s clip
6. Upscale video (Topaz Video AI) if needed
```

### Pipeline 2: Multi-Shot Narrative Assembly

```
1. Write shot list (5-15 shots, 5-15s each)
2. Generate character reference sheets (front/side/3-4 view)
3. Create Elements with reference images
4. Generate shots in batches of 2-3 (multi_prompt)
5. Assembly in NLE (DaVinci Resolve / Premiere)
6. Add transitions, color grade, final audio pass
```

### Pipeline 3: Character Consistency Pipeline

```
1. Generate character sheet (Cinema Studio / Nano Banana Pro)
2. Create Kling Element with frontal + 3 reference angles
3. Generate all shots referencing @Element1
4. Maintain wardrobe, lighting, and style across all prompts
5. Final edit: match grade, smooth cuts
```

### Pipeline 4: Voice-Cloned Dialogue Scene

```
1. Record reference audio for each character voice (10-30s clean)
2. Create voice IDs via fal-ai/kling-video/create-voice
3. Write multi-shot dialogue scene with <<<voice_1>>> and <<<voice_2>>>
4. Generate with voice_ids parameter
5. Polish: trim, add room tone, mix dialogue
```

---

## Kling 3.0 vs Kling 2.6 — Migration Guide

| Feature | Kling 2.6 | Kling 3.0 |
|---------|-----------|-----------|
| **Duration** | 5s or 10s | 3–15s (per-second control) |
| **Multi-Shot** | ❌ Single shot only | ✅ 2–6 shots per generation |
| **Elements** | Basic reference images | Elements 3.0 (frontal + multi-ref + video) |
| **Voice Control** | ❌ | ✅ Up to 2 custom voice IDs |
| **Shot Type** | N/A | `customize` or `intelligent` |
| **End Frame** | ❌ | ✅ I2V and O3 |
| **Render Speed** | Fast | Slower (more complex) |
| **Cost (audio off)** | $0.07/s | $0.224/s |
| **Cost (audio on)** | $0.14/s | $0.336/s |
| **Cost (voice control)** | N/A | $0.392/s |
| **Visual Quality** | Excellent | Superior (improved lighting, detail) |
| **Motion Quality** | Great | Better (fluid, fewer artifacts) |
| **API Provider** | fal.ai + Kling direct | fal.ai exclusive |

### When to Use Which

- **Use Kling 2.6 when:** Budget is tight; single-shot clips; speed matters; simple animation
- **Use Kling 3.0 when:** Multi-shot sequences; character consistency critical; voice cloning needed; maximum quality; extended duration needed

### Prompt Migration Tips

Kling 2.6 prompts work in 3.0 but benefit from the 5-layer structure. Upgrade by:
1. Adding explicit `[SCENE]`, `[CHARACTER]`, `[ACTION]`, `[CAMERA]`, `[AUDIO]` labels
2. Using `multi_prompt` for sequences instead of single long prompts
3. Adding Elements references for character consistency
4. Specifying negative prompts beyond the default

---

## Kling O3 Variant

The Kling O3 family is a comprehensive set of endpoints spanning image generation, video generation, video editing, and reference-based video-to-video. All O3 endpoints are marked as "new" on fal.ai as of February 2026.

### O3 Endpoint Overview

| Endpoint | Type | Description | Cost |
|----------|------|-------------|------|
| `kling-image/o3/text-to-image` | Image | Top-tier text-to-image with flawless consistency | $0.028/img (1K/2K) |
| `kling-image/o3/image-to-image` | Image | Top-tier image-to-image with flawless consistency | $0.028/img (1K/2K) |
| `kling-video/o3/standard/image-to-video` | Video | Start/end frame interpolation (standard) | $0.252/s |
| `kling-video/o3/pro/image-to-video` | Video | Start/end frame interpolation (pro) | $0.336/s |
| `kling-video/o3/standard/text-to-video` | Video | Text-to-video generation (standard) | $0.252/s |
| `kling-video/o3/pro/text-to-video` | Video | Text-to-video generation (pro) | $0.336/s |
| `kling-video/o3/standard/reference-to-video` | Video | Image reference → video with character/object consistency | $0.252/s |
| `kling-video/o3/pro/reference-to-video` | Video | Image reference → video (pro quality) | $0.336/s |
| `kling-video/o3/standard/video-to-video/edit` | Edit | Video editing with @Element references | $0.252/s |
| `kling-video/o3/pro/video-to-video/edit` | Edit | Video editing (pro quality) | $0.336/s |
| `kling-video/o3/standard/video-to-video/reference` | Omni | Reference video → new shots preserving cinematic language | $0.252/s |
| `kling-video/o3/pro/video-to-video/reference` | Omni | Reference V2V (pro quality) | $0.336/s |

### O3 Image Generation

The O3 image endpoints (`kling-image/o3/*`) supersede the previous Kling O1 Image model. They support the same `@Element` and `@Image` reference syntax with improved consistency and quality. Cost doubles for 4K output.

### O3 Video Edit

The O3 Edit endpoints (`kling-video/o3/*/video-to-video/edit`) supersede the Kling O1 Edit model. They accept:
- **Video input** — Source video to edit
- **@Element references** — Character/object identity via frontal + reference images
- **@Image references** — Style and scene references
- **Text prompt** — Describes the desired edit (character swap, style change, lighting, etc.)

Example prompt: `"change the main character to be @Element1, dark lighting and rain, 3d character style"`

### O3 Omni — Reference Video-to-Video

**Kling O3 Omni** is a new capability that generates fresh shots guided by an input reference video. It preserves:
- **Motion patterns** — Movement dynamics from the reference video
- **Camera style** — Angles, tracking, and cinematographic language
- **Scene continuity** — Seamless extension of visual narrative

This is ideal for:
- **Generating B-roll** that matches existing footage style
- **Extending scenes** with new content while preserving the original's cinematic feel
- **Creating variations** of a shot with different subjects but identical camera work
- **Multi-shot continuity** where each new shot inherits the visual language of the previous

Input schema: Video URL (required) + prompt + optional @Element/@Image references.

### O3 vs V3 Pro (Video Generation)

| Feature | V3 Pro | O3 Standard |
|---------|--------|-------------|
| **Input** | Text or Image + optional end frame | Image required + optional end frame |
| **Best For** | Full creative generation | Precise frame-to-frame interpolation |
| **Elements** | ✅ Full support | ✅ Full support |
| **Voice Control** | ✅ | ❌ |
| **Multi-Shot** | ✅ | ✅ |
| **Video Edit** | ❌ | ✅ (via edit endpoint) |
| **Reference V2V (Omni)** | ❌ | ✅ (via reference endpoint) |
| **Use Case** | Narrative scenes, dialogue | Transformations, editing, style transfer |

### When to Use O3

- **Before/after transformations** — Age progression, seasonal change, style transfer
- **Precise motion paths** — When you know exactly where a character starts and ends
- **Morphing effects** — Smooth transitions between two distinct visual states
- **Controlled animation** — When both keyframes are pre-generated and you need reliable interpolation
- **Video editing** — Character swaps, style changes, lighting adjustments on existing footage
- **Cinematic continuity** — Generating new shots that match an existing video's motion and camera language

---

## Pricing & Cost Optimization

### Pricing Breakdown

| Tier | Cost per Second | Example (10s clip) |
|------|----------------|-------------------|
| Audio Off | $0.224/s | $2.24 |
| Audio On | $0.336/s | $3.36 |
| Voice Control + Audio | $0.392/s | $3.92 |

### Cost Optimization Strategies

1. **Prototype with audio off** — Generate visual-only drafts first ($0.224/s), add audio only on final versions
2. **Use shorter durations for tests** — 3s clips for composition/style testing before committing to 15s
3. **Use Kling 2.6 for simple shots** — Single-shot clips without multi-shot needs are 3x cheaper on V2.6
4. **Batch multi-shot efficiently** — Maximize shots per generation to reduce per-shot overhead
5. **Use `intelligent` shot_type for drafts** — Faster processing for initial concepts
6. **External audio for budget work** — Generate silent clips and add audio in post ($0.224/s vs $0.392/s)

---

**Version History:**
- v2.1 (February 19, 2026) — Expanded O3 section: full endpoint table, O3 Image, O3 Edit, O3 Omni (reference V2V) documentation
- v2.0 (February 19, 2026) — Complete rewrite with full API documentation, multi-shot system, Elements 3.0, voice control, O3 variant, genre examples, migration guide
- v1.0 (February 9, 2026) — Initial guide

**Sources:**
- fal.ai Kling V3 Pro Text-to-Video API documentation
- fal.ai Kling V3 Pro Image-to-Video API documentation
- fal.ai Kling O3 Standard/Pro Image-to-Video API documentation
- fal.ai Kling O3 Standard/Pro Video-to-Video Edit API documentation
- fal.ai Kling O3 Omni Reference Video-to-Video API documentation
- fal.ai Kling O3 Image (text-to-image, image-to-image) API documentation
- fal.ai Kling Video Create Voice endpoint
- Kling 2.6 Prompting Mastery Guide (internal reference)
- Community testing and best practices
