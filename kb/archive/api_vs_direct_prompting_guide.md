# API vs. Direct Prompting: A Developer's Guide to Video Generation Models

**Version:** 1.0  
**Date:** February 1, 2026  
**Author:** Cine-AI Knowledge Base Team

---

## Table of Contents

1. [Executive Summary: What's the Difference?](#executive-summary-whats-the-difference)
2. [The Universal Truth: Prompt Language is the Same](#the-universal-truth-prompt-language-is-the-same)
3. [The Critical Difference: Control Parameters](#the-critical-difference-control-parameters)
4. [Model-Specific Breakdowns](#model-specific-breakdowns)
   - [Google Veo 3.1](#google-veo-31)
   - [Kling AI (2.6, 2.5, O1)](#kling-ai-26-25-o1)
   - [Runway Gen-4.5](#runway-gen-45)
   - [Seedance 1.5 Pro](#seedance-15-pro)
   - [Higgsfield Cinema Studio v1.5](#higgsfield-cinema-studio-v15)
5. [General Patterns: API vs. Direct Interface](#general-patterns-api-vs-direct-interface)
6. [Implications for Cine-AI Knowledge Base](#implications-for-cine-ai-knowledge-base)
7. [Recommendations for Users](#recommendations-for-users)

---

## Executive Summary: What's the Difference?

**Key Insight:** The distinction between API and direct prompting is **NOT about prompt language** (which is identical), but about **how control parameters are specified** (structured vs. UI-based).

- **Prompt Language:** The natural language descriptions of scenes, subjects, and actions are the **same** across both interfaces.
- **Control Parameters:** Features like aspect ratio, resolution, and camera control are specified through **structured parameters** in APIs and **UI elements** (dropdowns, sliders) in direct interfaces.

**Practical Impact:**
- **For Creatives:** The prompting guides in this knowledge base apply to both API and direct interface use cases.
- **For Developers:** Understanding the structured parameter formats is critical for successful API integration.

---

## The Universal Truth: Prompt Language is the Same

Across all major video generation models, the core prompt structure and language are consistent between API and direct interface usage. This means:

- ✅ **Natural language descriptions** work the same way.
- ✅ **Prompt engineering principles** apply equally.
- ✅ **Audio prompting** (where supported) uses the same syntax.

**Conclusion:** You do NOT need to learn different prompting styles for API vs. UI. The creative process of crafting a prompt is identical.

---

## The Critical Difference: Control Parameters

| Feature | API Method | Direct Interface Method |
| :--- | :--- | :--- |
| **Aspect Ratio** | Explicit parameter (e.g., `aspect_ratio="16:9"`) | UI dropdown selection |
| **Resolution** | Explicit parameter (e.g., `resolution="4k"`) | UI dropdown selection |
| **Camera Control** | Structured JSON object with numerical values | Preset selection, sliders, or natural language |
| **Reference Images** | Structured objects with `reference_type` | UI upload feature (e.g., "Ingredients") |
| **Negative Prompts** | Explicit `negative_prompt` parameter | Separate input field |
| **Sound Generation** | Explicit `sound: "on"/"off"` parameter | UI toggle switch |
| **Model Version** | Explicit `model_name` parameter | UI dropdown or automatic selection |

---

## Model-Specific Breakdowns

### Google Veo 3.1

- **API:** Gemini API (`veo-3.1-generate-preview`)
- **Key Difference:** Uses structured `GenerateVideosConfig` object for aspect ratio, resolution, and reference images.
- **Prompt Language:** Identical.

### Kling AI (2.6, 2.5, O1)

- **API:** Kling AI API (`/v1/videos/text2video`)
- **Key Difference:** Highly structured camera control with numerical parameters (-10 to +10) in a JSON object.
- **Prompt Language:** Identical.

### Runway Gen-4.5

- **API:** Limited public access
- **Key Difference (Suspected):** Structured JSON for 6-axis camera control with numerical values.
- **Prompt Language:** Identical.
- **Documentation Gap:** No comprehensive public API documentation.

### Seedance 1.5 Pro

- **API:** Limited public access
- **Key Difference (Suspected):** Structured parameters for audio/lip-sync control.
- **Prompt Language:** Identical.
- **Documentation Gap:** No public API documentation.

### Higgsfield Cinema Studio v1.5

- **Special Case:** Platform aggregator, not a direct model provider.
- **Key Difference:** Abstracts away model-specific API parameters with a unified, preset-based workflow ("Click-to-Video").
- **Implication:** The Higgsfield experience is different from both direct model APIs and UIs.

---

## General Patterns: API vs. Direct Interface

- **Similarities:** Core prompt structure, natural language descriptions, audio prompting syntax.
- **Differences:** Control parameter specification (structured vs. UI), advanced feature syntax, error handling.

---

## Implications for Cine-AI Knowledge Base

1. **Prompting Guides are Universal:** The creative prompting techniques apply to both API and UI.
2. **API Reference Needed:** This guide serves as the primary reference for API-specific parameter differences.
3. **Transparency is Key:** We acknowledge where documentation is unavailable (Runway, Seedance).

---

## Recommendations for Users

### If you're using the UI:

- Follow the prompting guides as written.
- Control parameters are handled through UI elements.

### If you're using the API:

- Follow the same prompting guides for natural language.
- Refer to this guide for control parameter formats.
- Expect structured JSON/parameter formats instead of UI elements.

---

**Version History:**
- v1.0 (February 1, 2026) - Initial guide

**Sources:**
- Google AI for Developers Documentation
- Kling AI API Documentation
- Community best practices and analysis
