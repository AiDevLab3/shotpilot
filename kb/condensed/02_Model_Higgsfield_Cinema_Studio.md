# Higgsfield Cinema Studio v1.5 - AI Prompt Generation Guide

> Last Updated: 2026-02-08 | Source: higgsfield_cinema_studio_image_guide.md

**Model:** Higgsfield Cinema Studio | **Type:** IMAGE generation with virtual camera rig | **Version:** 1.5

---

## Core Philosophy

**"Direct like a cinematographer"** - Build a virtual camera rig, then direct the shot. Instead of describing what you want, you assemble a professional camera package with real optical physics simulation.

This gives you:
- True optical simulation from real camera sensors and lenses
- Physics-based rendering (focal length, aperture, depth of field)
- Legendary lens characteristics (Cooke, Zeiss, Panavision bokeh/flare)
- Integrated professional upscaling (Topaz, Topaz Generative)
- Preset management for saving/reusing camera setups

---

## Camera Bodies (Sensor Profiles)

| Camera Body | Characteristics | Best For |
|-------------|-----------------|----------|
| **ARRI Alexa 35** | Clean modern punch, film-like color science, industry standard | Professional cinematic, high-end commercials, narrative |
| **RED V-Raptor** | High resolution, sharp digital clarity, vibrant colors | Action, high-detail product shots, modern aesthetics |
| **Sony Venice** | Full-frame, 15+ stops dynamic range, exceptional low-light | Low-light cinematography, high-contrast, documentary |
| **IMAX Film** | Large-format aesthetic, immersive scope, epic scale | Landscapes, establishing shots, grand vistas |
| **Panavision Panaflex** | Organic film soul, classic Hollywood, warm tones | Period pieces, classic Hollywood, nostalgic |
| **Panavision Millennium DXL2** | Modern digital cinema, Panavision color science | High-end commercial, luxury brand imagery |
| **Arriflex 16SR** | 16mm film aesthetic, grain structure, intimate feel | Indie films, documentaries, intimate character work |
| **VHS Profile** | Low-fidelity, analog warmth, retro vibes | 80s/90s aesthetics, music videos, experimental |

**Default recommendation:** ARRI Alexa 35 for most versatile professional look.

---

## Lens Families (Optical Character)

| Lens Family | Character | Signature Look | Best For |
|-------------|-----------|----------------|----------|
| **ARRI Signature Prime** | Razor-sharp, clinical precision | Clean bokeh, minimal aberrations | Commercials, product, modern narratives |
| **Cooke S4** | "The Cooke Look" - soft, flattering | Creamy bokeh, warm skin tones | Portraits, beauty, romantic scenes |
| **Zeiss Ultra Prime** | Sharp, high contrast, clinical | Crisp edges, neutral color | Sci-fi, architecture, technical |
| **Panavision C-Series** | Organic, classic Hollywood | Smooth bokeh, vintage warmth | Period pieces, classic aesthetics |
| **Canon K-35** | Vintage character, soft flares | Dreamy quality, gentle contrast | Music videos, fashion, dreamy |
| **Hawk V-Lite (Anamorphic)** | Horizontal blue flares, oval bokeh | Classic anamorphic widescreen | Epic landscapes, sci-fi, cinematic |
| **Lensbaby** | Swirly bokeh, dreamlike distortion | Creative distortion patterns | Artistic portraits, experimental |
| **Laowa Macro** | Extreme close-up, high magnification | Intricate detail, shallow DOF | Product, nature macros, texture |
| **Petzval** | Vintage swirly bokeh | Distinctive swirl effect | Artistic portraits, creative |
| **Soviet Vintage** | Gritty character, unique flaws | Organic imperfections, grit | Period pieces, gritty, indie |
| **JDC Xtal Xpress** | Experimental, unique rendering | Distinctive optical signature | Experimental, music videos, avant-garde |

**Quick picks:** ARRI Signature Prime = max sharpness, Cooke S4 = flattering portraits, Hawk V-Lite = epic anamorphic.

---

## Focal Length Guide

| Focal Length | Effect | Best For |
|-------------|--------|----------|
| **12mm-24mm (Wide)** | Expansive FOV, dramatic perspective distortion | Landscapes, architecture, immersive environments |
| **28mm-35mm (Moderate Wide)** | Natural with slight expansion | Environmental portraits, street, documentary |
| **50mm (Normal)** | Human eye perspective | General photography, balanced compositions |
| **85mm-105mm (Portrait)** | Flattering compression, shallow DOF | Portraits, close-ups, subject isolation |
| **135mm+ (Telephoto)** | Strong background compression | Tight portraits, detail shots, compressed BG |

**Quick picks:** 35mm = balanced cinematic, 85mm = portraits, 24mm = epic wide shots.

---

## Aperture Guide

| Aperture | Depth of Field | Best For |
|----------|---------------|----------|
| **f/1.4-f/2.0** | Very shallow, strong subject isolation | Portraits, low-light, cinematic bokeh |
| **f/2.8-f/4.0** | Moderate, balanced sharpness | General cinematography, balanced shots |
| **f/5.6-f/8.0** | Deep, more in focus | Landscapes, group shots, architecture |
| **f/11-f/16** | Maximum depth, everything sharp | Wide landscapes, maximum sharpness |

**Rule:** f/1.4-f/2.8 for cinematic shallow DOF. f/5.6-f/8 for landscapes. Do NOT combine f/1.4 with "everything in focus."

---

## Prompt Structure

With rig built, describe scene using this order:

```
[Subject] + [Action/Pose] + [Environment/Setting] + [Lighting] + [Mood/Atmosphere] + [Technical Details]
```

### Lighting in Prompts (Critical)
- **Quality:** soft, hard, diffused, directional
- **Direction:** front, side, back, top, bottom
- **Color temperature:** warm (golden hour), cool (blue hour), neutral (overcast)
- **Contrast:** high (dramatic shadows), low (soft, even)
- **Atmosphere:** fog, smoke, rain, dust, haze

### Composition Language
- Rule of thirds: "subject positioned in the left third of the frame"
- Leading lines: "road draws the eye toward the horizon"
- Framing: "foreground elements frame the subject"
- Negative space: "allow breathing room in composition"
- Depth layers: foreground, midground, background separation

---

## Recommended Rig Builds

| Style | Camera | Lens | Focal Length | Aperture |
|-------|--------|------|-------------|----------|
| **Portrait** | Sony Venice | Cooke S4 | 85mm | f/1.4 |
| **Landscape** | IMAX Film | Hawk V-Lite | 24mm | f/8 |
| **Film Noir** | Panavision Panaflex | Canon K-35 | 35mm | f/5.6 |
| **High-End Commercial** | ARRI Alexa 35 | ARRI Signature Prime | 50mm | f/2.8 |
| **Indie/Gritty** | Arriflex 16SR | Soviet Vintage | 35mm | f/4 |
| **Fashion/Beauty** | Sony Venice | Cooke S4 | 105mm | f/2.0 |

---

## Upscaling Workflow

### Topaz Standard (Faithful Enhancement)
- **Use for:** General enhancement, preserving original look
- **Scale:** 2x, 4x, 8x, 16x
- **Recommended:** Standard preset, Sharpness 60-70, Denoise 30-40, Face Enhancement 75%
- **Presets:** Standard (most cases), High Fidelity v2 (high-res source), Text Refine (text in image)

### Topaz Generative (Creative Enhancement)
- **Use for:** Maximum sharpness, creative reinterpretation, low-res source enhancement
- **Creativity:** 1-3 for faithful upscale, 5-7 for creative reinterpretation
- **Texture:** 1 at low creativity, 3 at high creativity
- **Prompt:** Descriptive (NOT instructional) - describe the scene, not "make it better"
- **Face Enhancement:** Strength 70-85%

### Quick Upscale Settings

| Workflow | Model | Scale | Key Settings |
|----------|-------|-------|-------------|
| **Standard** | Topaz | 4x | Standard preset, Sharpness 65, Denoise 35, Face 75% |
| **Creative** | Topaz Generative | 4x | Creativity 3, Texture 2, Face 80% |
| **Extreme (8K-16K)** | Topaz 4x then Topaz Generative 4x | 4x+4x | Two passes; second pass Creativity 1-2, Texture 2 |

**Rule:** For extreme upscaling (8x+), always do two passes rather than one large jump.

---

## Image-to-Video Handoff

1. **Generate hero frame** in Image Mode with full rig settings
2. **Lock the aesthetic** (lighting, composition, character, mood)
3. **Switch to Video Mode** - use "Use as ref for video"
4. **Add camera movements** (pan, dolly, zoom, crane) while preserving hero look
5. **Generate video** with consistency inherited from hero frame

---

## Preset Management

- **Save presets** for camera+lens+focal+aperture combinations
- **Name clearly:** e.g., "Alexa 35 + Cooke S4 Portrait"
- **Lock preset** when generating multiple images for same project
- **Vary only the prompt** while keeping rig consistent for cohesive visual library
- **Use identical Topaz settings** across all images in a batch

---

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| **No depth of field** | Aperture too narrow (f/8+) | Use wider aperture (f/1.4-f/2.8) |
| **Subject not isolated** | Focal length too wide | Use telephoto (85mm+) for compression |
| **Image too soft/blurry** | Wrong lens or upscale settings | Use sharper lens (ARRI Signature, Zeiss Ultra); adjust sharpness |
| **Lighting doesn't match prompt** | Prompt lacks lighting detail | Add direction, quality, color temperature to prompt |
| **Color science feels off** | Wrong camera for content type | Match camera to content (see Rig Builds table) |
| **Upscale artifacts** | Sharpness or Creativity too high | Reduce Sharpness to 60-70; Creativity to 1-3 |
