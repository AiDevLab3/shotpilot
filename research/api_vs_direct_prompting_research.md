# API vs Direct Prompting Research

**Research Date:** January 26, 2026  
**Purpose:** Document differences between API and direct interface prompting for video generation models

---

## Key Finding: Limited Public Documentation

**Critical Observation:** Most video generation model documentation does NOT clearly distinguish between API and direct interface prompting differences. This is a significant gap in publicly available information.

---

## Google Veo 3.1

**Sources:**
- https://ai.google.dev/gemini-api/docs/video
- https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1

### API Access Method

**Platform:** Gemini API (Google AI for Developers)  
**Model Name:** `veo-3.1-generate-preview`

### API-Specific Parameters

The Veo 3.1 API uses **structured parameters** rather than natural language prompts for certain features:

**Core API Parameters:**

```python
operation = client.models.generate_videos(
    model="veo-3.1-generate-preview",
    prompt="[Natural language prompt]",
    config=types.GenerateVideosConfig(
        aspect_ratio="16:9" or "9:16",  # Structured parameter
        resolution="720p" or "1080p" or "4k",  # Structured parameter
        reference_images=[...],  # Structured list
    ),
)
```

### Reference Images: API vs Direct Interface

**API Method:**
```python
dress_reference = types.VideoGenerationReferenceImage(
    image=dress_image,
    reference_type="asset"  # Structured type specification
)

config=types.GenerateVideosConfig(
    reference_images=[dress_reference, glasses_reference, woman_reference],
)
```

**Direct Interface Method (Google AI Studio/Flow):**
- Called "Ingredients to Video"
- Upload images through UI
- No explicit `reference_type` parameter visible to user

### Key Differences

| Feature | API | Direct Interface |
|---------|-----|------------------|
| **Aspect Ratio** | Explicit parameter: `aspect_ratio="9:16"` | UI dropdown selection |
| **Resolution** | Explicit parameter: `resolution="4k"` | UI dropdown selection |
| **Reference Images** | Structured objects with `reference_type` | UI upload called "Ingredients" |
| **Prompt Structure** | Same natural language | Same natural language |
| **Audio Prompting** | Included in main prompt string | Included in main prompt string |

**IMPORTANT:** The core prompt structure (natural language) appears to be **identical** between API and direct interface. The differences are in **how control parameters are specified**, not in the prompt language itself.

---

## Kling AI (2.6, 2.5, O1)

**Source:** https://app.klingai.com/global/dev/document-api/

### API Access Method

**Platform:** Kling AI API  
**Endpoint:** `/v1/videos/text2video`  
**Model Names:** `kling-v1`, `kling-v1-6`, `kling-v2-master`, `kling-v2-1-master`, `kling-v2-5-turbo`, `kling-v2-6`

### API-Specific Parameters

**Core API Parameters:**

```json
{
  "model_name": "kling-v2-6",
  "prompt": "[Natural language prompt]",
  "negative_prompt": "[Negative prompt]",
  "sound": "on" or "off",
  "cfg_scale": 0.5,  // Flexibility parameter (0-1)
  "mode": "std" or "pro",
  "camera_control": {
    "type": "simple" or "down_back" or "forward_up" or "right_turn_forward" or "left_turn_forward",
    "config": {
      "horizontal": -10 to 10,
      "vertical": -10 to 10,
      "pan": -10 to 10,
      "tilt": -10 to 10,
      "roll": -10 to 10,
      "zoom": -10 to 10
    }
  },
  "aspect_ratio": "16:9" or "9:16" or "1:1",
  "duration": "5" or "10"
}
```

### Camera Control: API vs Direct Interface

**API Method:**
- **Structured JSON object** with numerical values
- Explicit `camera_control.type` specification
- Numerical config values (-10 to +10)

**Direct Interface Method (Kling AI Web/App):**
- **Preset selection** from predefined camera movements
- Natural language camera descriptions in prompt
- Potentially simplified controls

### Key Differences

| Feature | API | Direct Interface |
|---------|-----|------------------|
| **Camera Control** | Structured JSON with numerical values | Preset selection + natural language |
| **Negative Prompt** | Explicit `negative_prompt` parameter | Separate input field (if available) |
| **Sound Generation** | Explicit `sound: "on"/"off"` parameter | Toggle switch in UI |
| **CFG Scale** | Numerical parameter `cfg_scale: 0.5` | Slider or hidden parameter |
| **Mode Selection** | `mode: "std"/"pro"` | UI toggle |
| **Model Version** | Explicit `model_name` parameter | Dropdown or automatic |

**CRITICAL DIFFERENCE:** Kling's API uses **highly structured camera control** with numerical parameters, while the direct interface may use more intuitive presets and natural language descriptions.

---

## Runway Gen-3

**Source:** Limited public API documentation available

### Known Information

**Platform:** Runway API (limited public access)  
**Camera Control:** 6-axis system with numerical values (-10 to +10)

### Suspected Differences

Based on industry patterns and limited information:

**API Method:**
- Likely uses structured JSON for camera control
- Numerical values for each axis

**Direct Interface Method:**
- Slider-based UI for camera control
- Visual representation of camera movements

**Documentation Gap:** Runway has not published comprehensive API documentation publicly, making it difficult to confirm exact differences.

---

## Seedance 1.5 Pro

**Source:** Limited public API documentation available

### Known Information

**Platform:** ByteDance/Seedance API (limited public access)  
**Specialization:** Lip-sync and dialogue

### Suspected Differences

**API Method:**
- Likely includes structured parameters for audio/lip-sync control
- Possible language specification parameter

**Direct Interface Method:**
- UI-based audio upload and dialogue input
- Language selection dropdown

**Documentation Gap:** Seedance API documentation is not publicly available, making it impossible to confirm exact differences.

---

## Higgsfield Cinema Studio v1.5

**Source:** Higgsfield platform (aggregator)

### Special Case: Platform Aggregator

Higgsfield is unique because it's a **platform aggregator** that provides access to multiple models (including Veo 3.1, Kling, Sora 2, etc.) through a unified interface.

### Higgsfield's Approach

**Platform Strategy:**
- Provides **preset-based workflow** ("Click-to-Video")
- Abstracts away model-specific API parameters
- Offers simplified UI for all aggregated models

**Implication:** When using models through Higgsfield, the prompting experience is **different from both API and direct model interfaces** because Higgsfield adds its own abstraction layer.

---

## General Patterns: API vs Direct Interface

### Similarities (Across All Models)

✅ **Core prompt structure is identical**
- Natural language descriptions work the same way
- Prompt engineering principles apply equally
- Audio prompting (where supported) uses same syntax

### Differences (Across All Models)

❌ **Control parameters are structured differently**
- **API:** Explicit parameters with specific data types (strings, numbers, objects)
- **Direct Interface:** UI elements (dropdowns, sliders, toggles, upload buttons)

❌ **Advanced features may have different syntax**
- **API:** Structured objects (e.g., `reference_images` array)
- **Direct Interface:** Simplified UI metaphors (e.g., "Ingredients")

❌ **Error handling and validation**
- **API:** Returns error codes and messages
- **Direct Interface:** Visual feedback and user-friendly warnings

---

## Implications for Cine-AI Knowledge Base

### Critical Updates Needed:

1. **Clarify that prompt LANGUAGE is the same** - Users don't need to learn different prompting styles for API vs UI
2. **Document control parameter differences** - Users need to know how to translate UI actions to API calls
3. **Note documentation gaps** - Be transparent about what's unknown (Runway, Seedance)
4. **Explain Higgsfield's unique position** - As an aggregator, it has its own abstraction layer

### What Users Need to Know:

**For Prompt Engineering:**
- ✅ The prompting guides apply to BOTH API and direct interface
- ✅ Natural language descriptions work identically
- ✅ Audio prompting syntax is the same

**For Technical Integration:**
- ⚠️ Control parameters (aspect ratio, resolution, camera control) use structured formats in APIs
- ⚠️ Reference images/ingredients require different syntax in API vs UI
- ⚠️ Some features may only be available through one interface or the other

---

## Recommendations

### For Knowledge Base Documentation:

1. **Focus on prompt language first** - This is universal
2. **Add API parameter reference sections** - For developers who need technical details
3. **Create translation tables** - UI action → API parameter mappings
4. **Be transparent about gaps** - Note where documentation is unavailable

### For Users:

**If you're using the UI:**
- Follow the prompting guides as written
- Control parameters are handled through UI elements

**If you're using the API:**
- Follow the same prompting guides for natural language
- Refer to API parameter documentation for control features
- Expect structured JSON/parameter formats instead of UI elements

---

## Conclusion

**Key Insight:** The distinction between API and direct prompting is **NOT about prompt language** (which is identical), but about **how control parameters are specified** (structured vs. UI-based).

**Documentation Challenge:** Most providers don't clearly document this distinction, leading to confusion. The Cine-AI knowledge base should address this gap explicitly.

**Practical Impact:** For most users focused on creative prompting, the difference is minimal. For developers building integrations, understanding the structured parameter formats is critical.
