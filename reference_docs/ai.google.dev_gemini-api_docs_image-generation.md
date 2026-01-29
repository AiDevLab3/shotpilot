Note: If you use the official Google Gen AI SDKs and use the chat feature (or append the full model response object directly to history), thought signatures are handled automatically. You do not need to manually extract or manage them, or change your code.

Here is how thought signatures work:

All inline_data parts with image mimetype which are part of the response should have signature.
If there are some text parts at the beginning (before any image) right after the thoughts, the first text part should also have a signature.
If inline_data parts with image mimetype are part of thoughts, they won't have signatures.

The following code shows an example of where thought signatures are included:

[
  {
    "inline_data": {
      "data": "<base64_image_data_0>",
      "mime_type": "image/png"
    },
    "thought": true // Thoughts don't have signatures
  },
  {
    "inline_data": {
      "data": "<base64_image_data_1>",
      "mime_type": "image/png"
    },
    "thought": true // Thoughts don't have signatures
  },
  {
    "inline_data": {
      "data": "<base64_image_data_2>",
      "mime_type": "image/png"
    },
    "thought": true // Thoughts don't have signatures
  },
  {
    "text": "Here is a step-by-step guide to baking macarons, presented in three separate images.\n\n### Step 1: Piping the Batter\n\nThe first step after making your macaron batter is to pipe it onto a baking sheet. This requires a steady hand to create uniform circles.\n\n",
    "thought_signature": "<Signature_A>" // The first non-thought part always has a signature
  },
  {
    "inline_data": {
      "data": "<base64_image_data_3>",
      "mime_type": "image/png"
    },
    "thought_signature": "<Signature_B>" // All image parts have a signatures
  },
  {
    "text": "\n\n### Step 2: Baking and Developing Feet\n\nOnce piped, the macarons are baked in the oven. A key sign of a successful bake is the development of \"feet\"—the ruffled edge at the base of each macaron shell.\n\n"
    // Follow-up text parts don't have signatures
  },
  {
    "inline_data": {
      "data": "<base64_image_data_4>",
      "mime_type": "image/png"
    },
    "thought_signature": "<Signature_C>" // All image parts have a signatures
  },
  {
    "text": "\n\n### Step 3: Assembling the Macaron\n\nThe final step is to pair the cooled macaron shells by size and sandwich them together with your desired filling, creating the classic macaron dessert.\n\n"
  },
  {
    "inline_data": {
      "data": "<base64_image_data_5>",
      "mime_type": "image/png"
    },
    "thought_signature": "<Signature_D>" // All image parts have a signatures
  }
]

Other image generation modes

Gemini supports other image interaction modes based on prompt structure and context, including:

Text to image(s) and text (interleaved): Outputs images with related text.
Example prompt: "Generate an illustrated recipe for a paella."
Image(s) and text to image(s) and text (interleaved): Uses input images and text to create new related images and text.
Example prompt: (With an image of a furnished room) "What other color sofas would work in my space? can you update the image?"
Generate images in batch

If you need to generate a lot of images, you can use the Batch API. You get higher rate limits in exchange for a turnaround of up to 24 hours.

Check the Batch API image generation documentation and the cookbook for Batch API image examples and code.

Prompting guide and strategies

Mastering image generation starts with one fundamental principle:

Describe the scene, don't just list keywords. The model's core strength is its deep language understanding. A narrative, descriptive paragraph will almost always produce a better, more coherent image than a list of disconnected words.

Prompts for generating images

The following strategies will help you create effective prompts to generate exactly the images you're looking for.

1. Photorealistic scenes

For realistic images, use photography terms. Mention camera angles, lens types, lighting, and fine details to guide the model toward a photorealistic result.

Template
Prompt
Python
Java
JavaScript
Go
REST
A photorealistic [shot type] of [subject], [action or expression], set in
[environment]. The scene is illuminated by [lighting description], creating
a [mood] atmosphere. Captured with a [camera/lens details], emphasizing
[key textures and details]. The image should be in a [aspect ratio] format.

A photorealistic close-up portrait of an elderly Japanese ceramicist...
2. Stylized illustrations & stickers

To create stickers, icons, or assets, be explicit about the style and request a transparent background.

Template
Prompt
Python
Java
JavaScript
Go
REST
A [style] sticker of a [subject], featuring [key characteristics] and a
[color palette]. The design should have [line style] and [shading style].
The background must be transparent.

A kawaii-style sticker of a happy red panda...
3. Accurate text in images

Gemini excels at rendering text. Be clear about the text, the font style (descriptively), and the overall design. Use Gemini 3 Pro Image Preview for professional asset production.

Template
Prompt
Python
Java
JavaScript
Go
REST
Create a [image type] for [brand/concept] with the text "[text to render]"
in a [font style]. The design should be [style description], with a
[color scheme].

Create a modern, minimalist logo for a coffee shop called 'The Daily Grind'...
4. Product mockups & commercial photography

Perfect for creating clean, professional product shots for ecommerce, advertising, or branding.

Template
Prompt
Python
Java
JavaScript
Go
REST
A high-resolution, studio-lit product photograph of a [product description]
on a [background surface/description]. The lighting is a [lighting setup,
e.g., three-point softbox setup] to [lighting purpose]. The camera angle is
a [angle type] to showcase [specific feature]. Ultra-realistic, with sharp
focus on [key detail]. [Aspect ratio].

A high-resolution, studio-lit product photograph of a minimalist ceramic coffee mug...
5. Minimalist & negative space design

Excellent for creating backgrounds for websites, presentations, or marketing materials where text will be overlaid.

Template
Prompt
Python
Java
JavaScript
Go
REST
A minimalist composition featuring a single [subject] positioned in the
[bottom-right/top-left/etc.] of the frame. The background is a vast, empty
[color] canvas, creating significant negative space. Soft, subtle lighting.
[Aspect ratio].

A minimalist composition featuring a single, delicate red maple leaf...
6. Sequential art (Comic panel / Storyboard)

Builds on character consistency and scene description to create panels for visual storytelling. For accuracy with text and storytelling ability, these prompts work best with Gemini 3 Pro Image Preview.

Template
Prompt
Python
Java
JavaScript
Go
REST
Make a 3 panel comic in a [style]. Put the character in a [type of scene].


Input

	

Output



Input image
	
Make a 3 panel comic in a gritty, noir art style...
7. Grounding with Google Search

Use Google Search to generate images based on recent or real-time information. This is useful for news, weather, and other time-sensitive topics.

Prompt
Python
Java
JavaScript
Go
REST
Make a simple but stylish graphic of last night's Arsenal game in the Champion's League

AI-generated graphic of an Arsenal football score
Prompts for editing images

These examples show how to provide images alongside your text prompts for editing, composition, and style transfer.

1. Adding and removing elements

Provide an image and describe your change. The model will match the original image's style, lighting, and perspective.

Template
Prompt
Python
Java
JavaScript
Go
REST
Using the provided image of [subject], please [add/remove/modify] [element]
to/from the scene. Ensure the change is [description of how the change should
integrate].


Input

	

Output



A photorealistic picture of a fluffy ginger cat...
	
Using the provided image of my cat, please add a small, knitted wizard hat...
2. Inpainting (Semantic masking)

Conversationally define a "mask" to edit a specific part of an image while leaving the rest untouched.

Template
Prompt
Python
Java
JavaScript
Go
REST
Using the provided image, change only the [specific element] to [new
element/description]. Keep everything else in the image exactly the same,
preserving the original style, lighting, and composition.


Input

	

Output



A wide shot of a modern, well-lit living room...
	
Using the provided image of a living room, change only the blue sofa to be a vintage, brown leather chesterfield sofa...
3. Style transfer

Provide an image and ask the model to recreate its content in a different artistic style.

Template
Prompt
Python
Java
JavaScript
Go
REST
Transform the provided photograph of [subject] into the artistic style of [artist/art style]. Preserve the original composition but render it with [description of stylistic elements].


Input

	

Output



A photorealistic, high-resolution photograph of a busy city street...
	
Transform the provided photograph of a modern city street at night...
4. Advanced composition: Combining multiple images

Provide multiple images as context to create a new, composite scene. This is perfect for product mockups or creative collages.

Template