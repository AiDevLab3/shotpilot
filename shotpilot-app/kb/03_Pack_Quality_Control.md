# Quality Control Pack

## Purpose
Identify, troubleshoot, and fix common issues in AI-generated video to achieve professional production quality.

## Common AI Video Artifacts

| Artifact | Description | Common Causes |
|---|---|---|
| **Flickering** | Rapid inconsistent changes in light, color, or texture | Conflicting style prompts, unstable models |
| **Morphing** | Unintended transformations of objects or characters | Vague prompts, long generation times |
| **Jitter** | Shaky or unstable camera movement | Overly complex motion prompts |
| **Inconsistent Style** | Abrupt changes in visual style or aesthetic | Lack of strong visual bible or preset |
| **Poor Lip-Sync** | Dialogue does not match mouth movements | Models with weak audio-visual correlation |
| **Uncanny Valley** | Characters look almost human but not quite | Imperfect facial generation, lack of micro-expressions |

## Iterative Refinement Loop

1. **Isolate** - Identify the specific artifact or issue
2. **Simplify** - Remove all but the most essential prompt elements
3. **Adjust One Variable** - Change one element (camera motion, subject action, etc.) and regenerate
4. **Compare** - Analyze new output to see if the change improved or worsened the issue
5. **Repeat** - Continue until cause is isolated and resolved

## Model-Specific Troubleshooting

| Model | Issue Type | Fix |
|---|---|---|
| **VEO 3.1** | Character consistency problems | Use "Ingredients to Video" with high-quality reference images |
| **Runway Gen-4.5** | Unwanted/chaotic motion | Simplify prompt; describe only the desired motion |
| **Kling 2.6** | Physics-related issues | Rephrase prompt to be more explicit about desired physical interactions |
| **Seedance 1.5 Pro** | Lip-sync issues | Ensure dialogue is clear and concise in prompt |

## Post-Production Fixes

| Problem | Fix |
|---|---|
| Flickering | De-flicker plugin in editing software |
| Jitter | Warp stabilizer effect to smooth shaky footage |
| Inconsistent Style | Color grading across shots for unified look |

## Quality Control Checklist

### Visuals
- [ ] Style consistent across all shots
- [ ] No distracting artifacts (flickering, morphing, jitter)
- [ ] Character consistency maintained
- [ ] Lighting consistent and motivated
- [ ] Color grading effective

### Audio
- [ ] Dialogue clear and intelligible
- [ ] Lip-sync accurate
- [ ] Sound effects effective and well-timed
- [ ] Music appropriate for tone and mood
- [ ] Overall audio mix balanced

### Narrative
- [ ] Clear and compelling story
- [ ] Effective pacing
- [ ] Smooth and logical transitions
- [ ] Desired emotions evoked
