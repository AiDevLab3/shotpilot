# Video Generation Pipeline — Architecture Spec

> **Status**: Designed, not yet implemented. KB content and model research complete. Agent architecture and Production State protocol defined.

## Motion Agent (Lead Editor)

### Domain
Temporal Stability & Video Generation

### Responsibility
Expert in video model syntax (Veo 3.1, Sora 2, Kling O1 Edit, Wan 2.6, etc.). Ensures 24fps motion cadence and physics-based camera moves. Receives optical metadata from the DP/Creative Director to maintain temporal consistency.

### Core Functions

**Image-to-Video Workflow**
Uses the locked Hero Frame (approved image from the image pipeline) as the primary visual anchor for video generation.

**Camera Move Design**
Specifies Dolly, Pan, Tilt, or Static camera moves with precise parameters — speed, duration, easing, and model-specific syntax.

**Temporal Consistency**
Ensures character identity and optical specs remain consistent across all frames. Prevents the identity drift that plagues current AI video tools.

**Physics-Based Motion**
Applies realistic motion blur, parallax, and depth-of-field changes that match the optical specs established in the image pipeline.

### Knowledge Base Access
- All 11 video model prompting mastery guides (already written)
- Camera movement and cinematography guides
- Temporal consistency techniques
- Image-to-video workflow documentation

### Output Format

**Video Clip**: 6-10 second video using Hero Frame as ingredient

**Motion Spec Sheet**:
- Camera Move: Dolly In | Speed: Slow | Duration: 8s | Model: Veo 3.1
- Temporal Audit: Documents character identity consistency across frames

## Production State Protocol

All agents (image and video) share a Production State file that contains:

| Section | Source | Contents |
|---------|--------|----------|
| **DNA Header** | Project settings | Project name, character SoulID reference, lens spec, lighting key |
| **Optical Specs** | Creative Director / DP | Focal length, aperture, distance, sensor size |
| **Audit Reports** | Quality Gate | Comprehensive analysis from holistic image auditor |
| **Strike Logs** | Orchestrator | Tracks attempts, corrections, and model pivot decisions |
| **Motion Metadata** | Motion Agent | Camera moves, duration, temporal consistency notes |

This shared context enables seamless collaboration without redundant communication. The video pipeline inherits everything the image pipeline established — style DNA, character bibles, optical specs, quality standards — so the Motion Agent starts with full context rather than generating blind.

## Collaboration Protocol

**Motion Agent ↔ Creative Director**: Receives optical metadata (focal length, aperture, distance) to ensure camera moves are physically accurate.

**Motion Agent ↔ Orchestrator**: Reports temporal consistency issues or character identity drift. Orchestrator decides whether to re-generate the Hero Frame or adjust video parameters.

## Supported Video Models (KB Complete)

| Model | Type | Strengths |
|-------|------|-----------|
| Veo 3.1 | Generator | Cinematic quality, long-form coherence |
| Sora 2 | Generator | Complex scene understanding, physics simulation |
| Kling O1 Edit | Editor | Frame-accurate editing, motion transfer |
| Wan 2.6 | Generator | Fast generation, style consistency |
| + 7 additional models | Various | Documented in KB with prompting mastery guides |

## Integration with Image Pipeline

The video pipeline is designed as an extension, not a replacement:

1. Image pipeline produces approved Hero Frame with full audit data
2. Production State file carries all context forward
3. Motion Agent receives Hero Frame + context, designs camera move
4. Video model generates clip anchored to the Hero Frame
5. Quality Gate evaluates temporal consistency (new dimension)
6. User reviews and approves (same user-in-the-loop philosophy)

No new concepts — same architecture, extended to the time dimension.
