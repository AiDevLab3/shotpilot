# TCPW Dark Knight — Style Reference Guide

## Approved Style References

### Primary: "Exterior Final.png" — Astrodome Exterior (Real Photo)
- **Realism: 10/10** — actual photograph
- **Nolan Match: 8/10** — wet asphalt, sodium vapor, brutalist architecture
- **USE FOR:** Exterior tone, environmental grounding, photographic DNA
- **WHY:** Real photography gives AI the correct noise, highlight rolloff, and color science to emulate

### Secondary: "1.png" — Woman at Glass Door
- **Realism: 7/10** — cinematic, slight AI softness
- **Nolan Match: 9/10** — most "Nolan frame" in the set. Cool steel-blue corporate interior, shallow DOF
- **USE FOR:** Character/interior scenes, blue-teal grade, lighting ratios
- **CAUTION:** Slight AI softness could propagate — pair with Exterior Final for grounding

## Style Ref Combo Strategy
Use **Exterior Final + Woman at Glass Door** together:
- One locks exterior/environmental tone (real, gritty, wide)
- One locks interior/character tone (cool, corporate, cinematic)
- Together they define a photographic envelope that prevents drift into concept art

## Concept/Mood Only (NOT for style ref input)
- **"Wide.png"** — Interior dome/command post. Score: 6/10. Good for production design reference (what to put in scene) but rendering is clearly digital. Keep out of style ref slot.
- **"9.png"** — Dome exterior AI render. Score: 5/10. Overstyled, painterly. Will pull downstream toward concept art look. DROP.

## Rejected References (All Vehicle/Character Refs)
ALL current character and vehicle reference images scored 4-5/10 and were rejected by QG:
- TCPW Truck: 4/10 — garbled text, impossible geometry, synthetic sheen
- Property Manager: 5/10 — waxy skin, hand errors, sterile fabric
- Softwash Flatbed: 4.5/10 — synthetic sheen, garbled text, floating shadows
- TCPW PW Trailer: 4/10 — HDR glow, impossible geometry, waxy textures

### Vehicle Reference Strategy
Current AI models CANNOT generate mechanically coherent industrial equipment at photographic realism levels. Options:
1. **Photobash** — composite real truck/trailer photography with AI-generated scene elements
2. **Real photography** — photograph the actual TCPW vehicles and use those as refs
3. **Silhouette strategy** — keep vehicles in deep shadow/distance where mechanical detail isn't visible
4. **Regenerate with stronger models** — try Flux 2 [max] with explicit anti-CGI prompting

### Character Reference Strategy
Current character refs have waxy skin and anatomy errors. Options:
1. **Stock photography base** — use real stock photos of similar-looking people, modify wardrobe details in prompt
2. **Regenerate with focus on entropy** — wrinkles, pores, asymmetry, imperfect hair
3. **Partial reference** — use refs for wardrobe/pose only, let the model generate its own skin/face
