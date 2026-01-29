# The Global Style System: A Framework for Cinematic Coherence

## 1. Introduction

The Global Style System (GSS) is a framework for defining, maintaining, and translating a project's unique visual signature across multiple scenes, settings, and AI image generation models. It is designed to be used by an AI agent acting as a "Chief Cinematographer," ensuring that every image produced for a project feels like it belongs to the same cinematic world.

## 2. The Core Components of a Visual Signature

A project's "Master Look" is defined by five core components. These components are the fundamental building blocks of your visual style and must be defined at the beginning of every project.

| Component | Description | Examples |
|---|---|---|
| **Color Palette & Grading** | The specific color theory of your project. | Teal & Orange, Desaturated Gritty, High-Contrast Noir, Vibrant Technicolor |
| **Lighting Style** | The quality and direction of light that defines the mood. | High-Key (soft, bright), Low-Key (dark, moody), Hard Light (sharp shadows), Soft Light (diffused) |
| **Camera & Lens Language** | The "feel" of the camera and lens. | Digital & Sharp (Sony Venice), Filmic & Soft (ARRI Alexa + Cooke), Anamorphic (Hawk V-lite) |
| **Film Stock & Grain** | The texture and grain of the image. | Clean Digital, Kodak Portra 400, Cinestill 800T, VHS |
| **Atmospheric Elements** | Consistent use of environmental effects. | Persistent Fog, Light Haze, Rain-Slicked Surfaces, Lens Flares |

## 3. The "Master Look" Definition File

To use the GSS, you must first create a `master_look.md` file for your project. This file serves as the single source of truth for your project's visual style. An AI agent will refer to this file for every image it generates.

**Example `master_look.md`:**

```markdown
# Master Look Definition: "Cyberpunk Noir"

- **Color Palette & Grading:** High-contrast with electric blue, magenta, and acid green highlights against deep, inky shadows. Teal in the shadows, orange in the highlights.
- **Lighting Style:** Low-key, high-contrast. Chaotic neon lights from street-level signs, creating wet reflections. Frequent use of anamorphic lens flares.
- **Camera & Lens Language:** RED V-Raptor for hyper-real digital sharpness, combined with Hawk V-lite anamorphic lenses for stretched bokeh and horizontal flares.
- **Film Stock & Grain:** Clean digital with no film grain, but with subtle chroma noise and analog-style color bleeding to simulate a slightly degraded digital sensor.
- **Atmospheric Elements:** Persistent light rain, creating rain-soaked, reflective streets. Haze and steam rising from street vents.
```

## 4. The GSS Workflow: A Step-by-Step Guide

### Step 1: Define the Master Look
Create the `master_look.md` file and define the five core components for your project.

### Step 2: Create the "Key Style Reference Image"
Generate a single image that perfectly embodies the Master Look. This image will be your primary visual anchor and will be used as a style reference (`--sref` in Midjourney, reference image in other models) for all subsequent generations.

**Prompt to create the Key Style Reference Image (using the "Cyberpunk Noir" example):**

> "A cinematic still from a cyberpunk noir film. A rain-soaked alleyway at night, lit by chaotic neon signs in electric blue and magenta. The ground is wet and reflective. The atmosphere is hazy with steam rising from a vent. Shot on a RED V-Raptor with a Hawk V-lite anamorphic lens. High-contrast with deep shadows and vibrant highlights. Teal and orange color grading. Subtle chroma noise and color bleeding." 

### Step 3: Translate the Master Look for Each Model
Using the **Rosetta Stone mapping document**, the AI agent will translate the Master Look into model-specific prompts. This is the crucial translation layer.

### Step 4: Generate Scenes with Consistency
When generating new scenes, the AI agent will always use:
1.  The **Key Style Reference Image** as a visual anchor.
2.  The **translated prompt** for the specific model being used.
3.  **Explicit instructions** to maintain consistency.

## 5. Maintaining Consistency Across Scenes

This is where the GSS shines. To maintain the Master Look across different settings (e.g., day vs. night, inside vs. outside), the AI agent must adapt the prompt while preserving the core components.

**Example: Applying "Cyberpunk Noir" to a daytime interior scene:**

-   **Original Master Look:** Low-key, neon-lit, rainy night.
-   **New Scene:** A corporate office during the day.

**How the AI Agent Adapts the Prompt:**

-   **Color Palette:** The teal/orange grading is *still applied*, but to a different lighting setup.
-   **Lighting Style:** Instead of neon, the light source is now large windows with blinds, creating harsh shafts of light (a daytime version of high-contrast).
-   **Camera & Lens:** The RED V-Raptor and Hawk V-lite are *kept the same* to maintain the same lens feel.
-   **Atmospheric Elements:** The rain is outside the window, and the haze is now a light office dust visible in the light shafts.

**Adapted Prompt (for GPT Image 1.5):**

> "Using the Key Style Reference Image, create a cinematic still of a corporate office in a cyberpunk noir film. The scene is lit by harsh daylight streaming through large window blinds, creating dramatic light shafts. The atmosphere is hazy with dust motes visible in the light. Color graded with teal shadows and warm orange highlights. Shot on a RED V-Raptor with a Hawk V-lite anamorphic lens. Keep the same high-contrast, gritty feel as the reference image."

## 6. Workflow for AI Agents (The "Chief Cinematographer" Logic)

1.  **Ingest `master_look.md`:** Read and understand the five core components of the project's visual style.
2.  **Generate/Load Key Style Reference Image:** Create or be provided with the primary visual anchor.
3.  **Receive Scene Request:** User requests a new scene (e.g., "a character walks into a bar").
4.  **Select Best Model:** Based on the scene requirements (e.g., character focus, action, landscape), choose the optimal model (Midjourney, Higgsfield, etc.).
5.  **Translate Prompt:** Using the Rosetta Stone, translate the `master_look.md` definitions and the specific scene request into the chosen model's language.
6.  **Construct Final Prompt:** Combine the translated prompt with the Key Style Reference Image.
7.  **Generate Image.**
8.  **Verify Consistency:** (Future capability) Analyze the generated image to ensure it adheres to the Master Look. If not, adjust the prompt and regenerate.

By following this system, an AI agent can move from being a simple image generator to a true **Chief Cinematographer**, ensuring that every frame of your project is visually coherent and stylistically unified.
