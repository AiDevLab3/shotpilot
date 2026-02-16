# Translation Matrix

Cross-model prompt translation for ShotPilot Lite's supported models. The same visual concept requires different phrasing per model to achieve consistent results.

---

## Model Language Profiles

| Model | Type | Language Style | Key Trait |
|---|---|---|---|
| **Midjourney** | Image | Abstract/mood keywords + parameters (`--s`, `--oref`, `--ar`, `--style raw`) | Style-driven; less precise camera control |
| **Higgsfield Cinema Studio** | Image | Technical camera/lens/film terminology | Cinematography rig language; most precise |
| **GPT Image 1.5** | Image | Natural descriptive language (director-speak) | Conversational; iterative-friendly |
| **Nano Banana Pro** | Image | Physics-based specs (angles, ratios, hex codes) | Most technical precision; realism-optimized |
| **VEO 3.1** | Video | Cinematography-first natural language (5-part formula) | Lead with camera work; strong audio generation |
| **Kling 2.6** | Video | 4-essentials framework (Subject, Motion, Camera, Aesthetic) | Best motion realism; frame-accurate lip-sync |
| **Kling 3.0** | Video | 5-layer structure (Scene, Characters, Action, Camera, Audio) | Multi-shot intelligence; 15s clips; Elements 3.0 |

---

## 1. Lighting Translation

### Golden Hour / Warm Sunset

| Model | Prompt Language |
|---|---|
| **Midjourney** | `golden hour lighting, warm sunset glow --s 250 --style raw` |
| **Higgsfield** | `Camera: ARRI Alexa 35, Lens: Cooke, Time: Late afternoon, golden hour, warm directional sunlight` |
| **GPT Image** | `Shot during golden hour with warm, directional sunlight creating long shadows and a golden glow. Soft, diffused light with rich amber tones.` |
| **Nano Banana** | `Golden hour. Warm directional sunlight from the left at 15-degree angle. Soft ambient fill. Color temperature 3200K. Gentle highlight rolloff.` |
| **VEO 3.1** | `Low-angle shot during golden hour, warm directional sunlight casting long amber shadows across the scene. Natural warm color temperature.` |
| **Kling 2.6** | `Golden hour lighting. Warm sunlight from the left creating long directional shadows. Soft ambient fill. Rich amber tones.` |
| **Kling 3.0** | `[SCENE] Golden hour, warm directional sunlight, long amber shadows, soft atmospheric glow.` |

### Chiaroscuro / High Contrast Dramatic

| Model | Prompt Language |
|---|---|
| **Midjourney** | `chiaroscuro lighting, dramatic shadows, single light source --s 150 --style raw` |
| **Higgsfield** | `Camera: RED V-Raptor, Lens: Zeiss Ultra Prime, Lighting: Single harsh spotlight from above, deep shadows, high contrast` |
| **GPT Image** | `Lit by a single, harsh overhead spotlight, creating deep shadows and high contrast (chiaroscuro). Strong directional light with minimal fill.` |
| **Nano Banana** | `Single point light source 45 degrees above subject. Hard light. Deep cast shadows. High contrast ratio 8:1. Minimal ambient fill.` |
| **VEO 3.1** | `Chiaroscuro lighting, single hard spotlight from above casting deep dramatic shadows. High contrast, minimal fill, noir atmosphere.` |
| **Kling 2.6** | `Single harsh overhead light. Deep dramatic shadows. Chiaroscuro contrast. Dark background. Minimal fill light.` |
| **Kling 3.0** | `[SCENE] Dark interior, single harsh overhead spotlight, chiaroscuro shadows, high contrast noir atmosphere.` |

### Soft Diffused / High-Key

| Model | Prompt Language |
|---|---|
| **Midjourney** | `soft diffused lighting, high-key, bright and airy --s 350 --style raw` |
| **Higgsfield** | `Camera: ARRI Alexa 35, Lens: Cooke, Lighting: Soft, diffused daylight through large windows, high-key setup` |
| **GPT Image** | `Bright, soft, high-key lighting with diffused natural light. Minimal shadows, even illumination, airy and optimistic mood.` |
| **Nano Banana** | `Soft diffused light. Multiple fill sources. Low contrast ratio 2:1. Bright ambient. Gentle shadows. High-key exposure.` |
| **VEO 3.1** | `Bright, soft, diffused natural light through large windows. High-key illumination, minimal shadows, airy and open atmosphere.` |
| **Kling 2.6** | `Soft diffused daylight. High-key brightness. Even illumination. Minimal shadows. Bright, clean aesthetic.` |
| **Kling 3.0** | `[SCENE] Bright interior with soft diffused daylight through large windows, high-key, airy and open.` |

---

## 2. Camera & Lens Translation

### Wide-Angle (24mm)

| Model | Prompt Language |
|---|---|
| **Midjourney** | `shot with 24mm wide-angle lens, expansive landscape --ar 21:9` |
| **Higgsfield** | `Camera: IMAX, Lens: Zeiss Ultra Prime, Focal Length: 24mm, Aperture: f/11` |
| **GPT Image** | `Wide-angle shot using a 24mm lens at f/11 for deep focus. Expansive landscape with horizon in sharp focus.` |
| **Nano Banana** | `24mm focal length. f/11 aperture. Deep depth of field. Horizon to foreground in focus. Wide perspective.` |
| **VEO 3.1** | `Wide establishing shot, 24mm wide-angle lens perspective, deep focus, expansive landscape visible from foreground to horizon.` |
| **Kling 2.6** | `Wide establishing shot. 24mm perspective. Deep focus. Full environment visible. Expansive framing.` |
| **Kling 3.0** | `[CAMERA] Wide establishing shot, 24mm perspective, deep focus, expansive spatial clarity.` |

### Portrait Compression (85mm, Shallow DoF)

| Model | Prompt Language |
|---|---|
| **Midjourney** | `shot with 85mm portrait lens, shallow depth of field, bokeh --s 250 --style raw` |
| **Higgsfield** | `Camera: ARRI Alexa 35, Lens: Cooke, Focal Length: 85mm, Aperture: f/1.4` |
| **GPT Image** | `Portrait shot using an 85mm lens at f/1.4 for very shallow depth of field. Subject in sharp focus, background beautifully blurred with soft bokeh.` |
| **Nano Banana** | `85mm focal length. f/1.4 aperture. Shallow depth of field. Subject sharp, background bokeh. Compression effect.` |
| **VEO 3.1** | `Close-up portrait shot with telephoto compression, shallow depth of field, subject in sharp focus with creamy bokeh background.` |
| **Kling 2.6** | `Medium close-up. Telephoto compression. Shallow depth of field. Subject sharp, background soft bokeh.` |
| **Kling 3.0** | `[CAMERA] Medium close-up, telephoto compression, shallow depth of field, creamy bokeh.` |

---

## Aspect Ratio Quick Reference (All Models)

| Use Case | Ratio | Midjourney | Higgsfield | GPT Image | Nano Banana | VEO / Kling |
|---|---|---|---|---|---|---|
| Cinematic widescreen | 16:9 | `--ar 16:9` | UI dropdown | `1792x1024` | State in prompt | Native support |
| Ultra-widescreen | 21:9 | `--ar 21:9` | UI dropdown | `2016x864` | State in prompt | Not recommended |
| Portrait / vertical | 9:16 | `--ar 9:16` | UI dropdown | `1024x1792` | State in prompt | Native support |
| Standard photo | 4:5 | `--ar 4:5` | UI dropdown | `1024x1280` | State in prompt | Not standard |
| Square (social) | 1:1 | `--ar 1:1` | UI dropdown | `1024x1024` | State in prompt | Crop after |

**Rule:** Always specify aspect ratio explicitly. Never rely on model defaults — they vary per model and produce inconsistent results across a project.

---

## 3. Color Grading Translation

### Teal & Orange Blockbuster

| Model | Prompt Language |
|---|---|
| **Midjourney** | `teal and orange color grading, cinematic blockbuster look --oref [character_ref_URL]` |
| **Higgsfield** | `Camera: Sony Venice, Film Stock: Digital Cinema with teal shadows and orange highlights` |
| **GPT Image** | `Color graded with teal shadows and warm orange highlights, creating a modern blockbuster cinematic look.` |
| **Nano Banana** | `Color grade: Teal in shadows (#1A535C), warm orange in highlights (#FF6B35). Complementary contrast. Cinematic LUT.` |
| **VEO 3.1** | `Cinematic color grading with teal shadows and warm orange highlights, modern blockbuster look, complementary color contrast.` |
| **Kling 2.6** | `Teal and orange color grading. Cool shadows, warm highlights. Cinematic blockbuster aesthetic. Rich complementary contrast.` |
| **Kling 3.0** | `[SCENE] Teal and orange cinematic color grading, cool shadows with warm amber highlights, blockbuster aesthetic.` |

### Desaturated Gritty Realism

| Model | Prompt Language |
|---|---|
| **Midjourney** | `desaturated, muted colors, gritty realism, film grain --s 200 --style raw` |
| **Higgsfield** | `Camera: Panavision Panaflex, Film Stock: Kodak 5219 pushed 2 stops, desaturated, gritty` |
| **GPT Image** | `Desaturated color palette with muted earth tones, subtle film grain, and a gritty, realistic feel.` |
| **Nano Banana** | `Desaturated (-30% saturation). Muted earth tones. Film grain overlay. Low color contrast. Gritty texture.` |
| **VEO 3.1** | `Desaturated muted color palette, gritty texture, subtle film grain. Muted earth tones, low saturation, documentary realism.` |
| **Kling 2.6** | `Desaturated palette. Muted earth tones. Film grain texture. Low color contrast. Gritty, raw realism.` |
| **Kling 3.0** | `[SCENE] Desaturated muted tones, gritty texture, subtle film grain, raw documentary realism.` |

---

## 4. Atmospheric Effects Translation

### Volumetric Light / God Rays

| Model | Prompt Language |
|---|---|
| **Midjourney** | `volumetric lighting, god rays, light shafts through fog --s 150 --style raw` |
| **Higgsfield** | `Lighting: Volumetric light shafts through atmospheric haze, god rays visible` |
| **GPT Image** | `Volumetric lighting with visible god rays streaming through the atmosphere, creating dramatic light shafts.` |
| **Nano Banana** | `Volumetric scattering. Light shafts at 30-degree angle. Atmospheric haze density 40%. God rays visible.` |
| **VEO 3.1** | `Volumetric god rays streaming through atmospheric haze, dramatic light shafts cutting through fog at a low angle. Dust particles visible in the beams.` |
| **Kling 2.6** | `Volumetric light shafts through haze. God rays at low angle. Atmospheric fog. Dust particles catching light.` |
| **Kling 3.0** | `[SCENE] Atmospheric haze with volumetric god rays, light shafts cutting through fog, dust particles visible in beams.` |

### Rain / Wet Surfaces

| Model | Prompt Language |
|---|---|
| **Midjourney** | `rain-soaked streets, wet reflections, water droplets --s 250 --style raw` |
| **Higgsfield** | `Weather: Heavy rain, wet surfaces with reflections, water droplets on camera lens` |
| **GPT Image** | `Rain-soaked environment with wet surfaces creating reflections. Water droplets visible, slick pavement reflecting neon lights.` |
| **Nano Banana** | `Rain weather condition. Wet surface reflections. Specular highlights on water. Droplets on surfaces. Caustic patterns.` |
| **VEO 3.1** | `Heavy rain falling, wet pavement reflecting ambient light. Water droplets on surfaces, slick roads with specular reflections. Sound of steady rainfall.` |
| **Kling 2.6** | `Rain falling. Wet surfaces reflecting light. Water droplets visible. Slick pavement with specular reflections. Realistic water physics.` |
| **Kling 3.0** | `[SCENE] Heavy rain, wet pavement reflecting neon and ambient light, water droplets on surfaces. [AUDIO] Steady rainfall, puddle splashes.` |

---

## 5. Character/Identity Consistency Translation

Each model uses a different mechanism to maintain character identity across shots. Using the wrong approach for a given model will produce inconsistent results.

| Model | Mechanism | Prompt Language |
|---|---|---|
| **Midjourney** | `--oref` (Omni Reference) | `--oref [ref_image_URL] --ow 100` — upload master character reference; `--ow` controls reference weight (0-100). For style locking: `--sref [style_URL] --sw 100`. |
| **Higgsfield** | Hero Frame Lock | Create a "Hero Frame" with precise camera/lens/lighting specs. Lock optical parameters and use as reference for subsequent shots. All shots inherit the Hero Frame's rig setup. |
| **GPT Image** | Reference Image + Constraints | Upload reference image alongside prompt. Add explicit constraints: `Match the character's face, hair, and build exactly from the reference image. Same wardrobe.` |
| **Nano Banana** | Multi-Reference Identity Lock | Upload up to 14 reference images (6 high-fidelity). `Match identity from reference images. Preserve facial structure, skin tone, hair color and style. Same wardrobe and accessories.` |
| **VEO 3.1** | Ingredients to Video | Upload up to 3 reference images (character, object, style). Prompt: `Using the provided images for [character name]...` Best for identity consistency across setting changes. |
| **Kling 2.6** | Multi-Reference Fusion + Start/End Frames | Combine: Character Photo (identity) + Location Ref + Style Sample + Motion Clip. Pattern: `[Character from Ref A] walks through [Location from Ref B] in the style of [Ref C].` Use start/end frames to anchor identity. |
| **Kling 3.0** | Elements 3.0 (Identity, Object, Style) | Create an "Element" from 2-4 multi-angle reference images. Identity Lock keeps faces consistent across shots. Upload Element, then prompt normally — Kling 3.0 auto-applies. Best face consistency of all video models. |

### Cross-Model Character Consistency Workflow
1. Generate a **master reference image** (front-facing, neutral lighting, clean background) — Higgsfield or Nano Banana produce the most controllable refs
2. Create **multi-angle ref sheets** (front / 3/4 / side / back) for video models that support them (Kling 3.0 Elements, Nano Banana multi-ref)
3. Use the **same master ref** across all models — translate via each model's identity mechanism above
4. Lock wardrobe, lighting, and color grade descriptions in every prompt to prevent drift

---

## 6. Usage Guidelines

### When to Use Each Model

| Model | Best For | Strength | Limitation |
|---|---|---|---|
| **Midjourney** | Look development, moodboards, hero concepts, style exploration | Strong artistic interpretation with `--sref` style locking | Less precise technical camera control |
| **Higgsfield Cinema Studio** | Hero frames, shot grids, technical precision | Exact camera/lens/aperture/focus control | Requires cinematography terminology knowledge |
| **GPT Image 1.5** | Iterative editing, natural-language direction, compositing | Conversational refinement, concise deltas | May drift over many iterations without constraints |
| **Nano Banana Pro** | Professional realism, character consistency, physics-based control | Highest precision (angles, ratios, hex codes) | Requires most technical knowledge |
| **VEO 3.1** | Cinematography-first video, dialogue scenes, atmospheric shots | Best audio generation; Ingredients for consistency; natural camera language | Ingredients limited to 3 refs; no fine motion control |
| **Kling 2.6** | Motion-heavy video, action sequences, lip-sync dialogue | Best-in-class motion realism; frame-accurate lip-sync; multi-reference fusion | No native 15s clips; identity can drift at extreme angles |
| **Kling 3.0** | Multi-shot narrative video, character-driven scenes, 15s clips | Elements 3.0 identity lock; multi-shot intelligence; 15s native duration | Occasional "sliding" feet in complex multi-character scenes |

---

## 7. Translation Workflow (6 Steps)

1. **Define the Master Look** - Set project-level style DNA (color palette, contrast style, lighting philosophy, texture rules)
2. **Identify the target model** for the current shot
3. **Translate the Master Look** into model-specific language using the tables above
4. **Generate the shot** with the translated prompt
5. **If switching models** - Use the output as a reference image and re-translate the prompt to the new model's language
6. **Maintain consistency** - Always reference back to the Master Look definition; do not let model-specific drift accumulate

---

## Key Translation Patterns

| Concept Domain | Midjourney | Higgsfield | GPT Image | Nano Banana | VEO 3.1 | Kling 2.6 | Kling 3.0 |
|---|---|---|---|---|---|---|---|
| **Lighting** | Mood keywords + `--s` | Camera body + lighting rig | Descriptive photography | Physics: angles, ratios, K | Director-speak + atmosphere | 4-essentials: Aesthetic field | `[SCENE]` layer |
| **Camera/Lens** | Focal length + `--ar` | Full rig: body + lens + f-stop | Photography + specs | Technical specs + DoF | Lead with camera move + lens feel | Subject + Camera fields | `[CAMERA]` layer |
| **Color** | Style keywords + `--style raw` | Camera + film stock | Descriptive color | Hex codes + % adjustments | Natural color description | Aesthetic field | `[SCENE]` layer |
| **Atmosphere** | Effect keywords | Weather + atmospheric desc | Natural language effects | Physics: density, scattering | Atmosphere in scene description | Aesthetic field | `[SCENE]` layer |
| **Identity Lock** | `--oref` + `--ow` | Hero Frame lock | Ref image + constraints | Multi-ref (up to 14) | Ingredients (up to 3 refs) | Multi-ref fusion + start/end frames | Elements 3.0 Identity |
| **Style Lock** | `--sref` + `--sw` | Film stock + grade presets | "Match the look of [ref]" | "Match tone, palette, contrast" | Ingredients style ref | Style Sample ref | Elements 3.0 Style |
| **Motion** | N/A (still image) | N/A (still image) | N/A (still image) | N/A (still image) | Single dominant camera move | Subject Motion + Camera Move | `[ACTION]` + `[CAMERA]` layers |

---

## Video Motion Translation

Video models require motion-specific prompting that image models do not. Always specify ONE dominant camera movement per shot — never use generic "cinematic camera movement."

| Motion Type | VEO 3.1 | Kling 2.6 | Kling 3.0 |
|---|---|---|---|
| **Static / Locked** | `Static locked-off shot, no camera movement.` | `Static camera. No movement. Locked framing.` | `[CAMERA] Static locked-off shot, no movement.` |
| **Slow Dolly In** | `Slow dolly in toward the subject, gradual push from medium to close-up.` | `Slow forward dolly. Gradual push toward subject. Smooth motion.` | `[CAMERA] Slow dolly in from medium shot to close-up, smooth and deliberate.` |
| **Slow Pan** | `Slow horizontal pan left to right, revealing the environment.` | `Slow pan left to right. Reveal environment. Steady horizontal motion.` | `[CAMERA] Slow pan left to right, revealing environment gradually.` |
| **Tracking / Follow** | `Camera tracks alongside the subject, matching walking pace, handheld feel.` | `Tracking shot following subject. Match pace. Slight handheld sway.` | `[CAMERA] Tracking alongside subject, matching walking pace, subtle handheld.` |
| **Crane / Jib Up** | `Crane shot rising from ground level up to a high angle, revealing the scene below.` | `Crane up from ground level. Rising reveal. Smooth vertical motion.` | `[CAMERA] Crane rising from low angle to high overhead, smooth vertical reveal.` |

### Video Motion Rules
- **One move per shot.** Combining moves (dolly + pan + crane) produces confused motion.
- **Specify speed.** "Slow," "gradual," "subtle" — never just "move."
- **Ground physics.** For walking/running, specify surface interaction: "heavy footsteps on gravel," "sneakers on wet pavement."
- **Lip-sync (Kling 2.6/3.0).** Syntax: `[Character] says, "[exact words]" with [emotion/delivery].` Kling generates matching mouth movement.
- **Audio (VEO 3.1 / Kling 3.0).** Include ambient sound: `Sound of steady rainfall and distant thunder.` VEO 3.1 has strongest audio generation.
