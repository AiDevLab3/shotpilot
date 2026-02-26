# Spatial Mastery & Anatomy Rescue Guide

**A comprehensive guide to solving left/right confusion and repairing anatomical errors in AI-generated images.**

---

## Part 1: Spatial Mastery - The "Left/Right" Problem

### The Core Challenge: AI Spatial Dyslexia

AI models, including sophisticated ones like GPT-4o and Gemini, have a fundamental limitation in understanding spatial directions like "left" and "right." This is not a simple prompting error; it is a deep-seated architectural issue stemming from several root causes:

1.  **Skewed Training Data:** An estimated 90% of the human population is right-handed. As a result, AI training datasets are overwhelmingly saturated with images of right-handed actions. The model learns a powerful statistical association: "holding an object" or "writing" defaults to the right hand.

2.  **Symmetry Ambiguity:** Left and right hands are nearly perfect mirror images. Without strong, unambiguous visual differentiators, the model struggles to distinguish between them. This is why even explicit prompts like "left hand" often fail—the model lacks the visual cues to understand the difference.

3.  **Reference Image Dominance:** As confirmed in community discussions, providing a style or character reference image makes the problem worse. The model prioritizes matching the reference over obeying spatial instructions in the prompt.

### The Solution: From Direction to Description

Since direct commands fail, the solution is to **stop using directional terms** and instead **describe the scene in terms of relative spatial relationships.**

| Instead of... | Use... |
| :--- | :--- |
| "holding the purse in her **left** hand" | "holding the purse in the hand **closest to the window**" |
| "character facing **screen right**" | "character in profile, with their **left shoulder nearest the camera**" |
| "move the object from the **right** hand to the **left** hand" | "the hand **without the object** is now holding it" |

**The Golden Rule:** Describe the scene as if you were explaining it to someone who doesn't know their left from their right. Use landmarks, relative positions, and clear descriptions of what is visible.

### The "Directional Rosetta Stone"

| Model | Best Practice |
| :--- | :--- |
| **GPT Image 1.5** | Describe relative positions. Avoid reference images if directional accuracy is critical. |
| **Higgsfield** | Use camera-centric terms: "camera left," "camera right." |
| **Midjourney** | Use `--sref` with a correctly-posed image. The visual reference is stronger than text. |
| **Nano Banana Pro** | Use conversational editing: "The hand on the right side of the image should be holding the object." |


## Part 2: Anatomy Rescue - The Surgical In-Painting Workflow

Even with perfect prompts, AI will still generate anatomical errors, especially with hands. The most reliable solution is not to re-roll, but to perform surgical in-painting, primarily in Nano Banana Pro.

### The "Branching" Strategy: Avoid Chained Edits

Never perform a series of edits on the same image. Each iteration can introduce subtle quality degradation. The professional workflow is to "branch":

1.  **Generate a "Clean Base" Image:** Get the overall composition, lighting, and character right.
2.  **Save the Clean Base:** This is your master file.
3.  **Branch for Each Fix:** For every correction (eyes, hands, etc.), start a new edit from the **Clean Base**, not the previously edited version.

### The Two-Pass Hand Repair Workflow

This is the most effective method for fixing hands without corrupting the rest of the image.

**Pass 1: Fix the Structure**

1.  **Isolate the Problem:** In Nano Banana Pro, select only the malformed hand.
2.  **Prompt for Structure:** Use a simple, direct prompt focused only on anatomy. Do not include any style or detail words.
    *   **Prompt:** "*A human hand with five distinct fingers. Correct thumb orientation. Natural knuckle spacing.*"
3.  **Generate:** This pass should fix the core anatomical issues (e.g., removing a sixth finger).

**Pass 2: Add Surface Detail**

1.  **Isolate the Repaired Hand:** Select the newly-structured hand.
2.  **Prompt for Detail:** Now, add the texture and lighting cues to match the rest of the image.
    *   **Prompt:** "*Realistic skin texture with subtle creases and pores. Natural, clean fingernails. Match the soft, warm lighting from the rest of the image.*"
3.  **Generate:** This pass integrates the corrected hand seamlessly into the scene.

### The Micro-Edit Philosophy

- **Target, Don't Re-Roll:** Always target the specific problem area. Never regenerate the entire image to fix a small detail.
- **One Fix Per Edit:** Don't try to fix the eyes and the hands in the same edit. Address each issue in a separate "branch."
- **Prevention is Key:** The need for repair can be minimized by using good preventative prompts:
    - **Negative Prompts:** `deformed hands, extra fingers, fused fingers, blurry hands, missing thumbs, warped joints`
    - **Anatomy Cues:** `five fingers on each hand, thumb visible, index finger and middle finger separated`
    - **Composition:** Avoid complex hand poses or props that occlude the fingers.

By combining descriptive spatial prompting with a disciplined, surgical in-painting workflow, you can reliably overcome the most common and frustrating limitations of AI image generation.
