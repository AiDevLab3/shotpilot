# Higgsfield DoP — Cinematic Camera Preset System

> Last Updated: 2026-02-19 | Source: higgsfield_dop/Prompting_Mastery.md

## Model Type
- **IMAGE-TO-VIDEO** — Camera movement only (no subject animation)
- 50+ hand-tuned cinematic camera presets — select and generate, no prompt engineering
- VFX-grade movements: Bullet Time, Robo Arm, Snorricam, FPV Drone
- 3D scene understanding from 2D images (parallax, depth, perspective)

## Technical Specs

| Feature | Value |
|---------|-------|
| Input | Single static image |
| Output | 5-second video clip |
| Resolution | 720p |
| Frame Rate | 24 FPS |
| Audio | ❌ None |
| Camera Control | 50+ presets (no text prompting needed) |
| Custom Camera | ❌ Not supported |
| API | Higgsfield AI |

## Strengths & Limitations

**Strengths:**
- Reliable, deterministic results — same input + preset = same output
- VFX-grade movements (Bullet Time, Robo Arm) — cost thousands in real production
- 3D scene understanding from 2D input
- Zero prompt engineering — just select a preset
- Fast generation for rapid iteration
- Works with any image: AI-generated, photographs, illustrations

**Limitations:**
- Image-to-video only (no T2V)
- No custom camera paths (presets only)
- 5-second maximum
- No audio
- Camera moves, subject doesn't (unless parallax-implied)
- 720p resolution (upscale required)
- Edge artifacts with aggressive movements on complex scenes

## Complete Preset Library (50+)

### Basic: Static, Pan Left/Right, Tilt Up/Down

### Dolly: Dolly In/Out/Left/Right, Super Dolly In/Out, Double Dolly

### Zoom: Zoom In/Out, Crash Zoom In/Out, Rapid Zoom In/Out, Dolly Zoom In/Out, YoYo Zoom, Eating Zoom, Mouth In

### Crane: Crane Up/Down, Crane Over The Head, Jib Up/Down

### Arc/Orbit: Arc Left/Right, 360 Orbit, Lazy Susan

### VFX: Bullet Time, Robo Arm, Snorricam, FPV Drone, Flying Cam Transition, Handheld, Dutch Angle, Wiggle, Hero Cam

### Vehicle: Car Grip, Car Chasing, Road Rush, Buckle Up, Object POV

### Effects: Fisheye, Low Shutter, Focus Change, Hyperlapse, Timelapse (Human/Landscape/Glam), Whip Pan

## Narrative Intent Framework

Choose presets by what you want the audience to FEEL:

| Intent | Goal | Best Presets |
|--------|------|-------------|
| **REVEAL** | Show something new, awe | Crane Up, Dolly Out, Pan, Focus Change |
| **FOCUS** | Draw attention, intimacy | Dolly In, Zoom In, Crash Zoom, Arc |
| **DISORIENT** | Tension, unease | Snorricam, Dutch Angle, Dolly Zoom, Fisheye |
| **ENERGIZE** | Excitement, power | FPV Drone, Robo Arm, Hero Cam, Bullet Time, Whip Pan |
| **OBSERVE** | Authenticity, neutrality | Static, Handheld, Slow Pan, Jib |

## Genre Selection Matrix

### Film/Narrative
| Scene Type | Preset |
|-----------|--------|
| Character intro | Hero Cam |
| Revelation | Crane Up |
| Tension | Dolly In, Dolly Zoom In |
| Disorientation | Snorricam, Dutch Angle |
| Action climax | Bullet Time |
| Contemplation | Static |

### Product/Commercial
| Content | Preset |
|---------|--------|
| Product reveal | Robo Arm, 360 Orbit |
| Luxury items | Arc Right, Lazy Susan |
| Food | Eating Zoom, Dolly In |
| Vehicle | Car Grip, Road Rush |
| Tech | Robo Arm |

### Social Media
| Platform | Preset |
|---------|--------|
| TikTok/Reels | Wiggle, YoYo Zoom |
| Instagram Stories | Dolly In, Crash Zoom |
| YouTube | Hero Cam, Super Dolly In |
| E-commerce | Lazy Susan, 360 Orbit |

## Image Preparation Best Practices

**Resolution:** 1080p minimum, 2K-4K recommended

**For Dolly/Push:** Ensure depth layers (FG/MG/BG), center subject, avoid edge clutter

**For Orbit/Arc:** Isolate subject, provide 3D cues (shadows, perspective), avoid flat compositions

**For Pan/Tilt:** Wide compositions, horizontal content for pans, vertical for tilts

**For VFX (Bullet Time etc.):** Strong subject isolation, dynamic poses, high contrast

## Advanced Sequencing

Create complex sequences by editing multiple 5s clips:

### Same Image, Multiple Presets
```
Clip 1: Crane Up (establish) → Clip 2: Dolly In (focus) → 
Clip 3: Arc Right (examine) → Clip 4: Crash Zoom (emphasis)
```

### Contrast Cutting
Alternate calm (Dolly In, Pan) with aggressive (Crash Zoom, Whip Pan) for tension.

### Music Video Rhythm
Verse: Dolly In, Static, Pan (breathing room)  
Chorus: Hero Cam, Bullet Time, FPV Drone (energy)  
Bridge: Dolly Zoom, Snorricam (disorientation)

## vs. Other Camera Control

| Feature | DoP | Runway Director Mode | Kling 3.0 |
|---------|-----|---------------------|-----------|
| Method | 50+ presets | 6-axis numerical | Text prompt |
| Precision | ★★★★★ | ★★★★★ | ★★★ |
| Consistency | ★★★★★ | ★★★★ | ★★★ |
| Flexibility | ★★ (presets only) | ★★★★★ | ★★★★ |
| VFX Movements | ★★★★★ | ★★ | ★ |
| Subject Animation | ❌ | ✅ | ✅ |
| Audio | ❌ | ❌ | ✅ |
| Max Duration | 5s | 10s | 15s |

**Use DoP when:** Need specific preset, VFX movements, deterministic output, no prompting skills  
**Use others when:** Need custom paths, subject animation, audio, longer clips

## 8 Common Issues + Fixes

| Problem | Fix |
|---------|-----|
| Flat 3D effect | Use images with clear FG/BG separation and shadows |
| Edge artifacts | Use subtler presets; crop edges in post |
| Wrong preset for subject | Use Genre Selection Matrix |
| Movement feels unmotivated | Use Narrative Intent Framework |
| Low resolution | Always upscale output (Topaz Video AI) |
| Subject warps | Ensure clear subject-background separation |
| VFX presets look off | Use high-res, high-contrast images with clear isolation |
| Clips disjointed when edited | Plan preset sequence before generating |

## Integration Workflows

### Hero Frame → DoP → Final
Generate frame → Upscale → Apply preset → Upscale video → Add audio

### Product Video
Multi-angle product images → Different presets per angle (Robo Arm, Arc, Dolly, Orbit) → Edit together

### DoP + Kling Hybrid
DoP for establishing camera move → Use last frame as Kling 3.0 start_image → Kling adds character animation + audio
