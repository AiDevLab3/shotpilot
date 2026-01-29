# Prompting Guide: Nano Banana Pro for Cinematic Realism

**By Manus AI** | January 26, 2026

---

## Introduction: The Creative Director's Console

Nano Banana Pro, powered by Google's Gemini 3 Pro, is a "thinking" model that moves beyond simple keyword matching to understand intent, physics, and composition. To harness its full potential for cinematic realism, you must transition from a prompt writer to a Creative Director. This guide provides a framework for using natural language, providing context, and leveraging Nano Banana Pro's advanced features to produce professional-grade visual assets.

## Core Philosophy: Act Like a Creative Director

Nano Banana Pro is not a vending machine for images; it is a creative partner. It responds best to prompts that are structured like a brief to a human artist. This means using full sentences, providing context, and being highly specific and descriptive. The model's ability to "think" allows it to infer details and make logical artistic decisions based on the context you provide.

## The Golden Rules of Prompting

To get the most out of Nano Banana Pro, adhere to these four fundamental principles:

1.  **Edit, Don't Re-roll:** The model excels at conversational edits. If an image is 80% correct, do not start over. Simply ask for the specific change you need (e.g., "*That's great, but change the lighting to sunset and make the text neon blue.*")
2.  **Use Natural Language & Full Sentences:** Avoid "tag soups." Instead, write descriptive sentences as if you were briefing a human artist.
3.  **Be Specific and Descriptive:** Vague prompts yield generic results. Define the subject, setting, lighting, and mood with precision. Describe textures and materials explicitly (e.g., "*matte finish*," "*brushed steel*," "*soft velvet*").
4.  **Provide Context (The "Why"):** Giving the model context helps it make logical artistic decisions. For example, instead of "*a sandwich*," say "*a sandwich for a Brazilian high-end gourmet cookbook*." The model will infer the need for professional plating and lighting.

## The 6-Variable Prompt Framework

This framework ensures that you provide all the necessary information for the model to create a detailed and accurate image.

| Component | Description | Example |
| :--- | :--- | :--- |
| **1. Subject** | Who or what is in the image? Be specific. | `A stoic robot barista with glowing blue optics.` |
| **2. Composition** | How is the shot framed? | `An extreme close-up portrait.` |
| **3. Action** | What is the subject doing? | `Carefully pouring steamed milk into a latte.` |
| **4. Location** | Where does the scene take place? | `Inside a futuristic cafe on a terraformed Mars.` |
| **5. Style** | What is the overall aesthetic? | `A photorealistic image with a cinematic, sci-fi feel.` |
| **6. Camera & Lighting** | How is the scene lit and captured? | `Shot with a shallow depth of field (f/1.8), with dramatic backlighting from the Martian sunrise.` |

## Advanced Techniques for Cinematic Realism

### High Control for Details

Trick the model into a higher level of photorealism by specifying camera gear. Adding phrases like "*Shot on Arri Alexa*" or "*captured with a Cooke anamorphic lens*" forces the model to emulate the specific film grain, color science, and lens characteristics of that equipment.

### Negative Constraints

Define the boundaries of your image by explicitly stating what to exclude. This narrows the model's creative choices and helps avoid common AI artifacts.

*   **Example:** `no watermarks, no extra text, no logos, no plastic-looking skin`

### Character Consistency

Nano Banana Pro can maintain character consistency across multiple images. When using a reference image, explicitly state: "*Keep the person's facial features exactly the same as Image 1.*" You can then describe changes in emotion or pose while preserving the character's identity.

## **Nano Banana Pro: The Gold Standard for Image Editing**

Nano Banana Pro excels at image editing through its advanced understanding of natural language and visual context. It allows for highly precise and nuanced modifications without the need for manual masking or complex tools. The core principle is **semantic editing**, where you describe the desired change, and the model intelligently applies it while preserving the overall integrity of the image.

### **Key Editing Capabilities**

1.  **Object Removal:**
    *   **Technique:** Use the verb "remove" and explicitly name the element. Ensure the element is clearly recognizable.
    *   **Best Practice:** Always add a phrase like "*Keep everything else in the image exactly the same, preserving the original style, lighting, and composition*" to prevent unintended changes.
    *   **Example:** `Using this image, remove the stone bust from the foreground to create a clean, unobstructed view of the model and the garden. Keep everything else in the image exactly the same, preserving the original style, lighting, and composition.`

2.  **Object Addition:**
    *   **Technique:** Define the new object and its precise placement. Describe how it should interact with the existing environment.
    *   **Best Practice:** Specify that the new object should match the lighting and perspective of the original image for seamless integration.
    *   **Example:** `Using this image, add a regal Doberman Pinscher sitting obediently on the gravel path to the far left of the image. Ensure the new object matches the lighting and perspective of the original image.`

3.  **Object Replacement:**
    *   **Technique:** A single-step combination of removal and addition. Instruct the model to change only the specific element.
    *   **Best Practice:** Emphasize that the rest of the image (lighting, style, surrounding details) should remain unchanged.
    *   **Example:** `Using this image, replace the stone bench with a sculptural, liquid-mercury-like flowing metal wave. Keep everything else in the image exactly the same, preserving the original style, lighting, and composition.`

4.  **Style Transfer:**
    *   **Technique:** Provide an image and request its recreation in a different artistic style.
    *   **Best Practice:** Explicitly state that the composition and object positions must remain identical to the original.
    *   **Example:** `Change this image to a sleek, minimalist futurism style with all organic textures replaced by smooth white polymer and chrome, using cool, sterile laboratory-white lighting. Ensure the composition and the position of all objects remain exactly the same as the original.`

### **Achieving Character Consistency in Edits**

Maintaining a consistent character across multiple images is one of Nano Banana Pro's standout features. The most reliable method is the **360-Degree Character Sheet**:

1.  **Generate Reference Sheet:** Create 2-3 images of your character from multiple angles (front, side, back) within a single frame or as separate generations. This provides the model with a complete visual understanding of the character's features and clothing.
2.  **Use References for New Scenes:** Use these generated character sheet images as references when placing the character in diverse situations. By pointing the model back to your original sheet, you ensure proportions and details remain stable.

### **Advanced Editing Tips & Best Practices**

*   **Aspect Ratio for Realism:** When editing a model/person into a new context, ensure the reference image's aspect ratio is similar to the desired output. For a cinematic look, use reference images with a wider aspect ratio.
*   **Combat Quality Degradation:** Iterative edits can lead to quality loss (JPEG artifacts, distorted faces). To mitigate this:
    *   **Start each edit from the original image**, not a previous generation.
    *   **Avoid long iteration chains.**
    *   **Re-upload images as PNG**, not JPEG, to preserve quality.
    *   **Make small, incremental edits.**
*   **Studio-Quality Control:** Leverage Nano Banana Pro's ability to directly influence lighting, camera angle, focus, and color grading for professional-grade results.
*   **Blend Multiple Images:** Combine up to 14 reference images (6 with high fidelity for objects, 5 for human character consistency) to create complex compositions.
*   **Real-World Knowledge (Grounding):** Utilize Google Search integration to generate images based on real-time data, ensuring factual accuracy for elements like weather maps or stock charts.

## Example Cinematic Prompt

```
A cinematic, photorealistic wide shot of a futuristic sports car speeding through a rainy Tokyo street at night. The car, a sleek, low-profile vehicle with a brushed steel finish, is the central focus. The neon signs of the surrounding buildings reflect brilliantly off the wet pavement and the car's metallic chassis. The scene is captured as if shot on an ARRI Alexa 35 with a 35mm lens, creating a clean, film-like look. The lighting is high-contrast, with the bright neon lights cutting through the deep shadows of the alleyways. The image should have a cool, cyberpunk color palette and a sense of high-octane energy. --ar 21:9
```

By providing this level of detail and context, you can move beyond simple image generation and begin to direct Nano Banana Pro like a true creative partner, producing results that are not only realistic but also rich with narrative and emotion.
