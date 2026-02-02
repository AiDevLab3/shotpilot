# Cine-AI Cinematic Realism Pack v1
**Purpose:** Eliminate the "AI/CGI look," enforce filmic realism, and maintain style/lighting/character continuity across 20+ shots — across multiple models (Higgsfield Cinema Studio v1.5, Nano Banana Pro, OpenAI GPT Image 1.5, Midjourney).

This pack is designed to be **used by a Prompt Compiler** (content intent → realism system → model wrapper) and an **Audit/Fix loop** (evaluate → diagnose → apply prompt delta → regenerate).

---

## REALISM_LOCK_BLOCK (Copy/Paste Macro)

Use this block when you want **cinematic realism without the AI/CGI look**.  
This is the default realism injection for Cine-AI.

**REALISM_LOCK_BLOCK**
- cinematic still frame, raw photographed realism, captured through a physical lens
- natural depth of field, realistic highlight rolloff, subtle filmic grain
- physically plausible lighting and shadows, realistic skin texture (no plastic)
- imperfect real-world entropy: mild wear, micro-scratches, natural variation
- avoid AI sheen, avoid HDR/glow, avoid sterile symmetry

**Universal Negative Pack**
- no CGI, no render, no plastic skin, no waxy texture, no hyper-detailed, no oversharpened, no HDR, no perfect symmetry
- no airbrushed skin, no unnatural bokeh, no glossy surfaces, no fake volumetrics

---

## AI Sheen Symptoms (What to Detect and Remove)

If any of these show up, the image will feel "AI-generated" instead of filmed:

- overly crisp micro-contrast (everything looks etched)
- HDR glow / haloing around edges
- plastic or waxy skin texture
- perfectly clean gradients (no natural noise)
- sterile symmetry and overly perfect composition
- unrealistic bokeh or "fake lens blur"
- volumetrics that look like smoke simulation instead of atmosphere
- lighting that has no motivated source (looks like studio fill everywhere)
- surfaces that are too glossy, too clean, too new

---

## LENS_BLOCK (Copy/Paste Macro)

Pick ONE lens and ONE aperture. Do not stack camera brands.

**Portrait / Character**
- 35mm or 50mm lens, f/4 to f/5.6, natural facial proportions

**Environment / Architecture**
- 24mm to 35mm lens, f/8 to f/11, deeper focus and spatial clarity

**Close Detail / Product Insert**
- 85mm lens, f/2.8 to f/4, controlled background separation

---

## LIGHTING_MOTIVATION_BLOCK (Copy/Paste Macro)

Always specify a motivated light source. Realism fails when lighting has no reason to exist.

- motivated key light source: (window daylight / tungsten practical / neon sign / streetlight / overcast skylight)
- key direction: (camera-left / camera-right / top-down / backlight / side light)
- contrast + falloff: (soft rolloff / hard shadow edge / high contrast noir / gentle fill)
- atmosphere interaction: (subtle haze / dust in air / light fog / none)

---

## DO / DON'T (Cinematic Realism)

| Goal | DO | DON'T |
|---|---|---|
| Real film still | "raw photographed cinematic still" | "hyper detailed 8K masterpiece" |
| Natural skin | "subtle pores, natural texture" | "perfect smooth airbrushed skin" |
| Real lighting | "motivated key from window" | "perfect studio lighting everywhere" |
| Cinematic depth | "natural depth of field" | "everything sharp front to back" |
| Avoid AI sheen | "subtle grain, gentle rolloff" | "HDR glow, oversharpened edges" |

---

## 0) The Hard Truth: "Cinematic realism" is a constraint system
If you want "real," you must constrain:
- **optics** (lens + aperture + focus behavior)
- **lighting motivation** (source + direction + falloff)
- **tone mapping** (soft rolloff, no HDR sheen)
- **texture + entropy** (imperfection, wear, grain)
- **continuity** (canon references, versioning, explicit invariants)

"More detail" often makes it *worse*. Realism comes from physics and hierarchy, not keyword soup.

---

## 1) Cine-AI Global Style System (GSS) for Realism
Cine-AI uses 2 layers:

### Layer A — Realism Pack (global constant)
Always applied when "Cinematic Realism" mode is on.

### Layer B — Project Look (project DNA)
Your creative flavor: noir, warm Kodak, cool digital, etc.
This can vary project-to-project without breaking realism.

**Implementation guidance:**
- Keep Realism Pack stable.
- Change Project Look deliberately and version it (Look v1, v2, etc.).

---

## 2) Cine-AI Realism Pack v1 (Canonical Rules)

### 2.1 Photographic Anchor (always include)
Use phrasing that forces the model into "captured" not "rendered":
- cinematic still / raw photograph
- captured through a physical lens
- natural depth of field
- gentle highlight rolloff (filmic rolloff)
- realistic skin texture (no plastic)

**Avoid:** "hyper detailed," "8K clarity," "perfectly sharp," "ultra crisp."

---

### 2.2 Optics Enforcement (lens + aperture > everything)
**Rule:** Choose ONE lens statement and ONE aperture statement.
Camera body is optional. Don't stack 3 camera brands.

**Quick lens defaults (safe + filmic):**
- Dialogue / portraits: **35mm or 50mm**
- Wider cinematic coverage: **28mm–35mm**
- Tele compression: **85mm** (sparingly; can look "beauty ad" fast)

**Aperture defaults (safe realism):**
- Faces + dialogue: **f/2.8–f/5.6** (avoid wafer-thin DOF unless motivated)
- Environments: **f/8–f/11**
- Documentary grit: **f/4–f/8** with less "beauty blur"

**Focus behavior matters:**
- "natural focus falloff"
- "subtle lens breathing"
- "no over-sharpening"

---

### 2.3 Lighting Motivation (non-negotiable)
Always specify:
1) **Source** (sun through window, practical lamp, overhead fluorescent, streetlight)
2) **Direction** (frame-left 35°, backlight rim, top-down)
3) **Quality** (soft diffused, hard specular)
4) **Contrast ratio** (gentle contrast vs high contrast)
5) **Fill** (minimal fill, bounce fill)

**If lighting isn't motivated, the output looks synthetic.**

---

### 2.4 Filmic Tonality (kill HDR / AI sheen)
Include one of:
- "filmic tone mapping"
- "soft highlight rolloff"
- "natural shadows with detail"
- "no HDR glow"
- "subtle grain"

**Avoid:**
- "cinematic HDR"
- "ultra vibrant"
- "extreme clarity"
These trigger the AI sheen.

---

### 2.5 Atmosphere for depth (optional but powerful)
Use when appropriate:
- subtle haze
- airborne dust motes
- volumetric light beams (subtle)
- humidity / mist

This gives depth cues that read as "real camera."

---

### 2.6 Entropy / Imperfection (the realism secret)
Add controlled realism texture:
- scuffed edges
- imperfect paint
- worn fabric
- fingerprints on glass
- slight sensor noise / grain

**But** don't overdo grime unless the story calls for it.

---

### 2.7 Realism Kill Switches (ban list)
Remove these terms from any realism prompt:
- hyper detailed
- ultra sharp / perfectly sharp
- 8K clarity
- masterpiece / award-winning / epic
- perfect symmetry
- flawless skin / porcelain skin
- CGI / render / unreal engine (unless intentionally stylized)

---

### 2.8 Universal Negative Pack (default)
Use as a baseline negative constraint list:
- CGI, 3D render, plastic skin, doll-like, waxy, oversharpened, overprocessed, HDR, surreal glow
- uncanny valley, deformed anatomy, extra fingers, bad hands, bad teeth
- text artifacts, watermark, logo (unless required), jpeg artifacts, AI noise

Adjust per model's negative syntax.

---

## 3) Prompt Compiler Output Format (Cine-AI standard)
Your compiler should output 4 blocks every time:

### Block 1 — Scene Intent (human)
What is happening (story beat, emotion, blocking).

### Block 2 — Project Look (DNA)
Color grade, vibe, references, "rules of the world."

### Block 3 — Realism Pack Injection (this file)
Optics + lighting motivation + tonality + entropy + negatives.

### Block 4 — Model Wrapper
Translate into the target model's syntax and constraints.

This prevents generic prompts that look identical across models.

---

## 4) Canon "Master Look" Template (Project DNA)
Use this to define your project look (Layer B):

**Project Look Name:**  
**Primary references (2–3):** (films, photographers, still frames)  
**Color palette:** warm/cool, saturation level, shadow tint  
**Contrast style:** low contrast / high contrast noir / gentle rolloff  
**Lighting philosophy:** motivated practicals, window light, etc.  
**Camera language:** handheld vs locked vs dolly, lens range, framing rules  
**Texture rules:** grain level, softness, no oversharpen  
**Forbidden drift:** list 5 things you never want to see

Version this per project: Look v1, v2…

---

## 5) Character Realism + Consistency (SoulID integration)
You said you have an established character with a reference sheet. Good — that becomes canon.

### 5.1 Define invariants (must not change)
- facial structure (jawline, nose shape, eye spacing)
- hair style + hairline
- skin tone and texture level
- signature wardrobe elements (if any)

### 5.2 Allowable variance
- expression range
- lighting changes (within motivated sources)
- wardrobe swaps (if you explicitly define wardrobe packs)

### 5.3 Reference strategy (across models)
- Always attach the same "Character Master Sheet" as a reference input where supported.
- Use a short textual "SoulID anchor" in prompts:
  - "same character identity as reference, same facial geometry, same hairstyle, no morphing"

### 5.4 Character drift prevention (practical rules)
- Don't request "perfect beauty," "flawless," "model face." That causes drift.
- Keep lens/aperture stable for dialogue sequences.
- Keep lighting direction stable within a scene.
- Avoid changing too many variables at once (location + lighting + wardrobe + lens all together).

---

## 6) Composition + Anatomy (realism enforcement)
### 6.1 Composition rules that read "cinematic"
- one primary subject hierarchy
- controlled negative space
- avoid "everything centered, everything sharp"
- motivated camera height and distance (eye-level for dialogue unless story calls for otherwise)

### 6.2 Anatomy realism rules
- specify hands only when needed (hands are failure magnets)
- avoid "extreme wide closeups" on faces unless you're intentionally stylizing
- prefer natural poses with story motivation ("weight shifted," "shoulders relaxed")

---

## 7) Motion-Readiness (still → video success)
Most video failures happen because the hero frame isn't motion-ready.

### Motion readiness checklist (must pass before video)
**Framing**
- subject has breathing room (no tight crop on moving limbs)
- background isn't hyper-busy (shimmer risk)
- silhouette reads clearly

**Lighting**
- stable lighting scheme (no mixed contradictory light)
- avoid tiny specular highlights everywhere

**Texture**
- avoid micro-patterns and moiré (fine stripes, tight grids)

**Depth**
- clear separation between foreground/mid/background

### Camera move compatibility
Choose one dominant move per shot:
- static
- slow dolly-in/out
- slow pan
- handheld (subtle)

Don't request "cinematic camera movement" as a generic phrase — it drifts into shaky/unstable.

---

## 8) Quality Control (Audit → Fix loop)
Your QC tool should score 4 realism-critical dimensions first:

1) **AI sheen score** (HDR, plastic, oversharp, glow)
2) **Lighting motivation + continuity** (source/direction/falloff stable?)
3) **Character identity lock** (match reference? drift?)
4) **Cinematic hierarchy** (composition clarity + depth cues)

### Fix output must be "prompt delta," not commentary
Bad: "Lighting is inconsistent."
Good:
- Add: "single motivated key light from frame-left at 35°, minimal fill"
- Remove: "neon ambient glow"
- Lock lens: "50mm, f/4, natural DOF"
- Add negative: "no HDR, no oversharpen"

### 3-tier recommendation
- **LOCK IT IN (95–100)** proceed
- **REFINE (70–94)** apply delta and regenerate
- **REGENERATE (0–69)** reset scene variables and try again

---

## 9) Troubleshooting (fast diagnosis)
### Problem: "Too clean / AI plastic look"
**Likely causes**
- "hyper detailed," "8K," "perfect skin," "ultra sharp"
- no entropy/imperfection
- fake lighting

**Fix**
- remove the killer terms
- add filmic tonality + grain
- specify motivated lighting + falloff
- add entropy detail (subtle)

---

### Problem: "Flat / lifeless"
**Likely causes**
- no directional light
- no contrast ratio
- no atmosphere depth cues

**Fix**
- specify key light direction
- add negative space and subject separation
- add subtle haze/dust (if appropriate)

---

### Problem: "Looks like CGI / game engine"
**Likely causes**
- glossy highlights + perfect edges
- too much microcontrast
- "render-like" background sharpness

**Fix**
- soften tonality, add rolloff
- reduce global sharpness
- specify lens imperfections subtly
- enforce photographic anchor language

---

### Problem: "Lighting drifts shot-to-shot"
**Likely causes**
- you didn't lock light direction and source across shots

**Fix**
- add a scene-level lighting lock:
  - source, direction, quality, contrast ratio
- treat lighting as canon within a scene

---

## 10) Model Wrappers (how to translate realism per model)

### 10.1 Higgsfield Cinema Studio v1.5 (image)
**Best use**
- camera/lens/aperture/focus precision
- shot exploration grids
- "hero frame first" workflow

**Wrapper principles**
- Keep optical metadata explicit (lens, aperture, focus)
- Keep lighting motivated and specific
- Don't overload with long adjective chains

**Higgsfield prompt skeleton**
1) Scene intent (1–2 lines)
2) Camera rig (lens + aperture + focus + camera height)
3) Composition (framing + blocking)
4) Lighting (source + direction + quality + contrast)
5) Filmic tonality + texture (rolloff + grain + entropy)
6) Negatives (anti-AI sheen pack)

---

### 10.2 Nano Banana Pro (image)
**Best use**
- high-quality image edits
- iterative refinements
- controlled transformations

**Wrapper principles**
- Use a structured framework (variables)
- Use negatives aggressively when realism is the goal
- For edits: "preserve identity" + "do not change X" lists

**Nano Banana skeleton**
- Core concept + realism anchor
- Subject + invariants ("do not change")
- Environment + mood
- Lighting motivation block
- Optical block (lens/aperture)
- Negative pack

---

### 10.3 OpenAI GPT Image 1.5 (image)
**Best use**
- clear natural language direction
- iterative refinement with concise deltas

**Wrapper principles**
- Speak like a director + cinematographer
- Keep it concrete: lighting + lens + "captured photograph"
- Use a compact negative list

**GPT Image skeleton**
- "Cinematic still photograph of…"
- "Shot on X lens at f/Y…"
- "Lighting: …"
- "Tone: filmic rolloff, subtle grain…"
- "Avoid: …"

---

### 10.4 Midjourney (image)
**Best use**
- look development, moodboards, hero concepts
- stylization control (but be careful — it can drift)

**Wrapper principles**
- Keep technical metadata lighter
- Emphasize lighting + tonality + "photographed"
- Use parameters to stabilize style (when applicable)

**MJ skeleton**
- Subject + environment
- Lighting + color grade
- "cinematic still photograph"
- negatives (avoid CGI, plastic, oversharp)
- MJ params (style/seed/etc.) per your MJ guide strategy

---

## 11) Canon Master Prompt Template (Realism)
Use this when you need a single prompt that compiles well.

### 11.1 Master Template
**(1) Core concept & realism anchor**
- "Cinematic still photograph, raw realistic capture…"

**(2) Setting & environment**
- time of day, location, weather, practical details

**(3) Subject**
- identity anchors + action + emotion

**(4) Wardrobe & textures**
- fabric realism + wear level

**(5) Camera rig**
- lens + aperture + focus behavior

**(6) Composition & framing**
- shot type, camera height, blocking, negative space

**(7) Lighting & color**
- motivated source + direction + quality + contrast + color temperature

**(8) Filmic tonality**
- highlight rolloff + grain + avoid HDR sheen

**(9) Negative prompts**
- universal negative pack (tailored per model)

---

## 12) Examples (Good vs Bad)

### Example: Dialogue close-up (GOOD)
- Cinematic still photograph of [Character] in a dim diner booth, shoulders relaxed, eyes reflecting a practical lamp.
- 50mm lens, f/4, natural depth of field, subtle lens breathing.
- Lighting: single warm practical lamp frame-right as key, minimal fill, soft falloff into shadows.
- Filmic tonality, soft highlight rolloff, subtle grain, realistic skin texture, slight imperfections.
- Avoid: CGI, plastic skin, oversharpen, HDR glow.

### Example: Dialogue close-up (BAD)
- "Ultra detailed, 8K, hyper sharp, masterpiece, perfect skin, cinematic HDR, unreal engine"
(Almost guaranteed to look synthetic.)

---

## 13) Operational Rules (how to use this pack in production)
### Rule 1: Lock fewer variables, iterate faster
When refining:
- change ONE variable at a time (lighting OR lens OR composition)

### Rule 2: Promote canon references
At minimum:
- Character Master Sheet = canon
- Style reference frame = canon
- Scene lighting definition = canon

### Rule 3: Use versioning
- Shot 003 v1, v2, v3…
- Look v1, v2…

---

## 14) Appendix: "Studio Realism Cheatsheet" (Condensed)
- Realism = physics + hierarchy, not keyword density
- Lens + aperture are your biggest realism levers
- Motivated lighting is the #1 realism driver
- Kill HDR sheen and oversharpening
- Add controlled entropy (wear, scuffs, grain)
- Avoid "perfect beauty" unless the story calls for ad-grade polish
