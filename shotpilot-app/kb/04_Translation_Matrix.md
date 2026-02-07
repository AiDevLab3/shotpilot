# Translation Matrix

Cross-model prompt translation for ShotPilot Lite's supported models. The same visual concept requires different phrasing per model to achieve consistent results.

---

## Model Language Profiles

| Model | Language Style | Key Trait |
|---|---|---|
| **Midjourney** | Abstract/mood keywords + parameters (`--s`, `--cref`, `--ar`, `--style raw`) | Style-driven; less precise camera control |
| **Higgsfield Cinema Studio** | Technical camera/lens/film terminology | Cinematography rig language; most precise |
| **GPT Image 1.5** | Natural descriptive language (director-speak) | Conversational; iterative-friendly |
| **Nano Banana Pro** | Physics-based specs (angles, ratios, hex codes) | Most technical precision; realism-optimized |

---

## 1. Lighting Translation

### Golden Hour / Warm Sunset

| Model | Prompt Language |
|---|---|
| **Midjourney** | `golden hour lighting, warm sunset glow --s 250 --style raw` |
| **Higgsfield** | `Camera: ARRI Alexa 35, Lens: Cooke, Time: Late afternoon, golden hour, warm directional sunlight` |
| **GPT Image** | `Shot during golden hour with warm, directional sunlight creating long shadows and a golden glow. Soft, diffused light with rich amber tones.` |
| **Nano Banana** | `Golden hour. Warm directional sunlight from the left at 15-degree angle. Soft ambient fill. Color temperature 3200K. Gentle highlight rolloff.` |

### Chiaroscuro / High Contrast Dramatic

| Model | Prompt Language |
|---|---|
| **Midjourney** | `chiaroscuro lighting, dramatic shadows, single light source --s 150 --style raw` |
| **Higgsfield** | `Camera: RED V-Raptor, Lens: Zeiss Ultra Prime, Lighting: Single harsh spotlight from above, deep shadows, high contrast` |
| **GPT Image** | `Lit by a single, harsh overhead spotlight, creating deep shadows and high contrast (chiaroscuro). Strong directional light with minimal fill.` |
| **Nano Banana** | `Single point light source 45 degrees above subject. Hard light. Deep cast shadows. High contrast ratio 8:1. Minimal ambient fill.` |

### Soft Diffused / High-Key

| Model | Prompt Language |
|---|---|
| **Midjourney** | `soft diffused lighting, high-key, bright and airy --s 350 --style raw` |
| **Higgsfield** | `Camera: ARRI Alexa 35, Lens: Cooke, Lighting: Soft, diffused daylight through large windows, high-key setup` |
| **GPT Image** | `Bright, soft, high-key lighting with diffused natural light. Minimal shadows, even illumination, airy and optimistic mood.` |
| **Nano Banana** | `Soft diffused light. Multiple fill sources. Low contrast ratio 2:1. Bright ambient. Gentle shadows. High-key exposure.` |

---

## 2. Camera & Lens Translation

### Wide-Angle (24mm)

| Model | Prompt Language |
|---|---|
| **Midjourney** | `shot with 24mm wide-angle lens, expansive landscape --ar 21:9` |
| **Higgsfield** | `Camera: IMAX, Lens: Zeiss Ultra Prime, Focal Length: 24mm, Aperture: f/11` |
| **GPT Image** | `Wide-angle shot using a 24mm lens at f/11 for deep focus. Expansive landscape with horizon in sharp focus.` |
| **Nano Banana** | `24mm focal length. f/11 aperture. Deep depth of field. Horizon to foreground in focus. Wide perspective.` |

### Portrait Compression (85mm, Shallow DoF)

| Model | Prompt Language |
|---|---|
| **Midjourney** | `shot with 85mm portrait lens, shallow depth of field, bokeh --s 250 --style raw` |
| **Higgsfield** | `Camera: ARRI Alexa 35, Lens: Cooke, Focal Length: 85mm, Aperture: f/1.4` |
| **GPT Image** | `Portrait shot using an 85mm lens at f/1.4 for very shallow depth of field. Subject in sharp focus, background beautifully blurred with soft bokeh.` |
| **Nano Banana** | `85mm focal length. f/1.4 aperture. Shallow depth of field. Subject sharp, background bokeh. Compression effect.` |

---

## 3. Color Grading Translation

### Teal & Orange Blockbuster

| Model | Prompt Language |
|---|---|
| **Midjourney** | `teal and orange color grading, cinematic blockbuster look --cref [character_ref_URL]` |
| **Higgsfield** | `Camera: Sony Venice, Film Stock: Digital Cinema with teal shadows and orange highlights` |
| **GPT Image** | `Color graded with teal shadows and warm orange highlights, creating a modern blockbuster cinematic look.` |
| **Nano Banana** | `Color grade: Teal in shadows (#1A535C), warm orange in highlights (#FF6B35). Complementary contrast. Cinematic LUT.` |

### Desaturated Gritty Realism

| Model | Prompt Language |
|---|---|
| **Midjourney** | `desaturated, muted colors, gritty realism, film grain --s 200 --style raw` |
| **Higgsfield** | `Camera: Panavision Panaflex, Film Stock: Kodak 5219 pushed 2 stops, desaturated, gritty` |
| **GPT Image** | `Desaturated color palette with muted earth tones, subtle film grain, and a gritty, realistic feel.` |
| **Nano Banana** | `Desaturated (-30% saturation). Muted earth tones. Film grain overlay. Low color contrast. Gritty texture.` |

---

## 4. Atmospheric Effects Translation

### Volumetric Light / God Rays

| Model | Prompt Language |
|---|---|
| **Midjourney** | `volumetric lighting, god rays, light shafts through fog --s 150 --style raw` |
| **Higgsfield** | `Lighting: Volumetric light shafts through atmospheric haze, god rays visible` |
| **GPT Image** | `Volumetric lighting with visible god rays streaming through the atmosphere, creating dramatic light shafts.` |
| **Nano Banana** | `Volumetric scattering. Light shafts at 30-degree angle. Atmospheric haze density 40%. God rays visible.` |

### Rain / Wet Surfaces

| Model | Prompt Language |
|---|---|
| **Midjourney** | `rain-soaked streets, wet reflections, water droplets --s 250 --style raw` |
| **Higgsfield** | `Weather: Heavy rain, wet surfaces with reflections, water droplets on camera lens` |
| **GPT Image** | `Rain-soaked environment with wet surfaces creating reflections. Water droplets visible, slick pavement reflecting neon lights.` |
| **Nano Banana** | `Rain weather condition. Wet surface reflections. Specular highlights on water. Droplets on surfaces. Caustic patterns.` |

---

## 5. Usage Guidelines

### When to Use Each Model

| Model | Best For | Strength | Limitation |
|---|---|---|---|
| **Midjourney** | Look development, moodboards, hero concepts, style exploration | Strong artistic interpretation with `--sref` style locking | Less precise technical camera control |
| **Higgsfield Cinema Studio** | Hero frames, shot grids, technical precision | Exact camera/lens/aperture/focus control | Requires cinematography terminology knowledge |
| **GPT Image 1.5** | Iterative editing, natural-language direction, compositing | Conversational refinement, concise deltas | May drift over many iterations without constraints |
| **Nano Banana Pro** | Professional realism, character consistency, physics-based control | Highest precision (angles, ratios, hex codes) | Requires most technical knowledge |

---

## 6. Translation Workflow (6 Steps)

1. **Define the Master Look** - Set project-level style DNA (color palette, contrast style, lighting philosophy, texture rules)
2. **Identify the target model** for the current shot
3. **Translate the Master Look** into model-specific language using the tables above
4. **Generate the shot** with the translated prompt
5. **If switching models** - Use the output as a reference image and re-translate the prompt to the new model's language
6. **Maintain consistency** - Always reference back to the Master Look definition; do not let model-specific drift accumulate

---

## Key Translation Patterns

| Concept Domain | Midjourney | Higgsfield | GPT Image | Nano Banana |
|---|---|---|---|---|
| **Lighting** | Mood keywords + `--s` | Camera body + lighting rig setup | Descriptive photography language | Physics: angles, ratios, color temp |
| **Camera/Lens** | Focal length + `--ar` | Full rig: body + lens + focal + aperture | Photography language with specs | Technical specs + depth of field |
| **Color** | Style keywords + `--style raw` | Camera + film stock | Descriptive color language | Hex codes + percentage adjustments |
| **Atmosphere** | Effect keywords | Weather + atmospheric description | Natural language effects | Physics: density, scattering, caustics |
| **Style Lock** | `--cref [character_ref_URL]` + `--sw` | "Hero Frame" lock | Reference image + explicit constraints | Reference matching + technical specs |

---

## Video Models Note

**VEO 3.1** and **Kling 2.6** are video generation models. They use natural descriptive language similar to GPT Image style -- speak like a director describing the shot in plain English. Specify camera movement (static, slow dolly, slow pan, subtle handheld) as a single dominant move per shot. Do not use generic "cinematic camera movement." Translate lighting/color/atmosphere concepts using the GPT Image column as a starting point, then add motion-specific instructions.
