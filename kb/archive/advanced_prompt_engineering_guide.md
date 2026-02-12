# Advanced Prompt Engineering Guide

**A Comprehensive Guide to Mastering AI Video Generation Prompts**

**Author:** Manus AI
**Version:** 1.0
**Date:** January 26, 2026

---

## Introduction

Welcome to the art and science of prompt engineering for AI video generation. This guide provides a comprehensive framework for crafting effective prompts that will unlock the full creative potential of AI video models. We'll explore universal principles, model-specific techniques, and advanced workflows to help you translate your vision into stunning cinematic reality.

Whether you're a beginner or an experienced AI artist, this guide will equip you with the knowledge and tools to master the language of AI video generation.

---

## Chapter 1: The Universal Prompting Formula

While each model has its nuances, a universal formula provides a solid foundation for any prompt. This five-part structure, inspired by Google's best practices for Veo 3.1, is a powerful starting point for any AI video generation task [1].

**[Cinematography] + [Subject] + [Action] + [Context] + [Style & Ambiance]**

| Component | Description | Examples |
| :--- | :--- | :--- |
| **Cinematography** | Define camera work and shot composition | `Dolly shot`, `wide angle`, `shallow depth of field` |
| **Subject** | Identify the main character or focal point | `A lone astronaut`, `a classic red convertible` |
| **Action** | Describe what the subject is doing | `gazes out at the Earth`, `speeds down a coastal highway` |
| **Context** | Detail the environment and background | `in a sterile white spaceship`, `at sunset` |
| **Style & Ambiance** | Specify the aesthetic, mood, and lighting | `cinematic, photorealistic`, `warm, golden hour light` |

**Example Prompt:**
> "A low-angle shot of a majestic lion, roaring powerfully, on a rocky outcrop overlooking the savanna at sunset. The scene is bathed in the warm, golden light of the setting sun, creating long shadows. Epic, cinematic, and awe-inspiring."

---

## Chapter 2: Model-Specific Prompting Techniques

### 2.1 Google Veo 3.1: The Structured Storyteller

Veo 3.1 excels with detailed, structured prompts. The five-part formula is your best friend here.

**Key Techniques:**

*   **The Language of Cinematography:** Be specific with camera movements (`dolly`, `crane`, `tracking`), composition (`wide`, `close-up`), and lens/focus (`shallow depth of field`, `macro`).
*   **Directing the Soundstage:** Use quotation marks for dialogue (`A man says, "It's now or never."`) and `SFX:` for sound effects (`SFX: a distant explosion`).
*   **Mastering Negative Prompts:** Describe what you want to *see*, not what you want to *avoid*. For example, instead of "no people," use "an empty, deserted street."
*   **Prompt Enhancement with Gemini:** Use an LLM like Gemini to enrich simple prompts with more descriptive and cinematic language.

### 2.2 Runway Gen-4.5: The Power of Simplicity

Runway's Gen-4.5 model thrives on simplicity and iteration [2].

**Core Philosophy:** Start simple, then iterate.

**Best Practices:**

*   **Positive Phrasing Only:** Describe what *should* happen, not what shouldn't. Use "locked camera" instead of "no camera movement."
*   **Direct & Simple Language:** Avoid abstract concepts. Use "the man waves" instead of "the man joyfully acknowledges his friend's presence."
*   **Focus on Motion:** The input image defines the scene; the prompt defines the motion. Don't re-describe the image in the prompt.
*   **Avoid Conversational Prompts:** Get straight to the point. No "please" or "can you."
*   **Avoid Overly Complex Prompts:** One scene, one action per generation.

**Prompt Elements:**

*   **Subject Motion:** Use general terms like "the subject" or pronouns. For multiple subjects, use positional language ("the subject on the left...").
*   **Scene Motion:** Insinuate motion with adjectives ("a dusty desert") or describe it directly ("dust trails behind the car").
*   **Camera Motion:** Use filmic terms like `locked`, `handheld`, `dolly`, `pan`.
*   **Style Descriptors:** Add terms like `live action`, `smooth animation`, `stop motion`.

### 2.3 Kling: The Physics-Aware Animator

*(Research for this section is ongoing. This guide will be updated with Kling-specific prompting techniques.)*

### 2.4 Seedance 1.5 Pro: The Lip-Sync Master

*(Research for this section is ongoing. This guide will be updated with Seedance-specific prompting techniques.)*

---

## Chapter 3: Advanced Creative Workflows

### 3.1 The Dynamic Transition with "First and Last Frame" (Veo 3.1)

Create controlled camera movements and transformations between two distinct points of view.

1.  **Create Starting Frame:** Generate your initial shot with an image model.
2.  **Create Ending Frame:** Generate your final shot.
3.  **Animate with Veo:** Use the First and Last Frame feature, and describe the transition in the prompt.

### 3.2 Building a Dialogue Scene with "Ingredients to Video" (Veo 3.1)

Create multi-shot scenes with consistent characters and dialogue.

1.  **Generate "Ingredients":** Create reference images for your characters and setting.
2.  **Compose the Scene:** Use the Ingredients to Video feature with your reference images and a prompt describing the action and dialogue for each shot.

### 3.3 Timestamp Prompting (Veo 3.1)

Direct a complete, multi-shot sequence in a single generation.

**Example:**
> [00:00-00:02] A wide shot of a spaceship landing in a crater.
> [00:02-00:04] A medium shot of the ship's ramp lowering.
> [00:04-00:06] A close-up of an astronaut's boot stepping onto the dusty surface.

---

## Chapter 4: The Art of Iteration & Refinement

Your first prompt is rarely your last. The best results come from a process of iteration and refinement.

**The Iterative Loop:**

1.  **Generate:** Start with a simple, foundational prompt.
2.  **Analyze:** What worked? What didn't? Is the motion correct? Is the style consistent?
3.  **Refine:** Add one new element at a time. Isolate variables to understand their impact.
4.  **Repeat:** Continue this process until you achieve your desired result.

**Using LLMs for Prompt Generation:**

If you're stuck, use an LLM to help you brainstorm and generate more descriptive prompts. Provide the LLM with your core idea and ask it to generate a list of cinematic prompts.

---

## Conclusion

Mastering prompt engineering is an ongoing journey, not a destination. As AI video models continue to evolve, so too will the art of prompting. By understanding the fundamental principles, model-specific techniques, and advanced workflows outlined in this guide, you'll be well-equipped to stay at the forefront of this exciting new wave of filmmaking.

---

## References

[1] [Google Cloud: Ultimate prompting guide for Veo 3.1](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1)
[2] [Runway: Gen-4 Video Prompting Guide](https://help.runwayml.com/hc/en-us/articles/39789879462419-Gen-4-Video-Prompting-Guide)
