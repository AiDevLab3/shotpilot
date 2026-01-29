        f.write(image_bytes)

Output Images:

Option 1	Option 2	Option 3	Option 4

	
	
	
4.6 Story-to-Comic Strip

For story-to-comic generation, define the narrative as a sequence of clear visual beats, one per panel. Keep descriptions concrete and action-focused so the model can translate the story into readable, well-paced panels.

prompt = """
Create a short vertical comic-style reel with 4 equal-sized panels.
Panel 1: The owner leaves through the front door. The pet is framed in the window behind them, small against the glass, eyes wide, paws pressed high, the house suddenly quiet.
Panel 2: The door clicks shut. Silence breaks. The pet slowly turns toward the empty house, posture shifting, eyes sharp with possibility.
Panel 3: The house transformed. The pet sprawls across the couch like it owns the place, crumbs nearby, sunlight cutting across the room like a spotlight.
Panel 4: The door opens. The pet is seated perfectly by the entrance, alert and composed, as if nothing happened.
"""

result = client.images.generate(
    model="gpt-image-1.5",
    prompt=prompt
)

save_image(result, "comic_reel.png")

Output Image:

4.7 UI Mockups

UI mockups work best when you describe the product as if it already exists. Focus on layout, hierarchy, spacing, and real interface elements, and avoid concept art language so the result looks like a usable, shipped interface rather than a design sketch.

prompt = """
Create a realistic mobile app UI mockup for a local farmers market. 
Show today’s market with a simple header, a short list of vendors with small photos and categories, a small “Today’s specials” section, and basic information for location and hours. 
Design it to be practical, and easy to use. White background, subtle natural accent colors, clear typography, and minimal decoration. 
It should look like a real, well-designed, beautiful app for a small local market. 
Place the UI mockup in an iPhone frame.
"""

result = client.images.generate(
    model="gpt-image-1.5",
    prompt=prompt
)

save_image(result, "ui_farmers_market.png")

Output Image:

5. Use cases — Edit (text + image → image)
5.1 Style Transfer

Style transfer is useful when you want to keep the visual language of a reference image (palette, texture, brushwork, film grain, etc.) while changing the subject or scene. For best results, describe what must stay consistent (style cues) and what must change (new content), and add hard constraints like background, framing, and “no extra elements” to prevent drift.

prompt = """
Use the same style from the input image and generate a man riding a motorcycle on a white background.
"""

result = client.images.edit(
    model="gpt-image-1.5",
    image=[
        open("../../images/input_images/pixels.png", "rb"),
    ],
    prompt=prompt
)

save_image(result, "motorcycle.png")

Input Image:

Output Image:

5.2 Virtual Clothing Try-On

Virtual try-on is ideal for ecommerce previews where identity preservation is critical. The key is to explicitly lock the person (face, body shape, pose, hair, expression) and allow changes only to garments, then require realistic fit (draping, folds, occlusion) plus consistent lighting/shadows so the outfit looks naturally worn—not pasted on.

prompt = """
Edit the image to dress the woman using the provided clothing images. Do not change her face, facial features, skin tone, body shape, pose, or identity in any way. Preserve her exact likeness, expression, hairstyle, and proportions. Replace only the clothing, fitting the garments naturally to her existing pose and body geometry with realistic fabric behavior. Match lighting, shadows, and color temperature to the original photo so the outfit integrates photorealistically, without looking pasted on. Do not change the background, camera angle, framing, or image quality, and do not add accessories, text, logos, or watermarks.
"""

result = client.images.edit(
    model="gpt-image-1.5",
    image=[
        open("../../images/input_images/woman_in_museum.png", "rb"),
        open("../../images/input_images/tank_top.png", "rb"),
        open("../../images/input_images/jacket.png", "rb"),
        open("../../images/input_images/tank_top.png", "rb"),
        open("../../images/input_images/boots.png", "rb"),
    ],
    prompt=prompt
)

save_image(result, "outfit.png")

Input Images:

Full Body	Item 1

	

Item 2	Item 3

	

Output Image:

5.3 Drawing → Image (Rendering)

Sketch-to-render workflows are great for turning rough drawings into photorealistic concepts while keeping the original intent. Treat the prompt like a spec: preserve layout and perspective, then add realism by specifying plausible materials, lighting, and environment. Include “do not add new elements/text” to avoid creative reinterpretations.

prompt = """
Turn this drawing into a photorealistic image.
Preserve the exact layout, proportions, and perspective.
Choose realistic materials and lighting consistent with the sketch intent.
Do not add new elements or text.
"""

result = client.images.edit(
    model="gpt-image-1.5",
    image=[
        open("../../images/input_images/drawings.png", "rb"),
    ],
    prompt=prompt
)

save_image(result, "realistic_valley.png")

Input Image:

Output Image:

5.4 Product Mockups (transparent background + label integrity)

Product extraction and mockup prep is commonly used for catalogs, marketplaces, and design systems. Success depends on edge quality (clean silhouette, no fringing/halos) and label integrity (text stays sharp and unchanged). If you want realism without re-styling, ask for only light polishing and optionally a subtle contact shadow that respects the alpha.

prompt = """
Extract the product from the input image.
Output: transparent background (RGBA PNG), crisp silhouette, no halos/fringing.
Preserve product geometry and label legibility exactly.
Optional: subtle, realistic contact shadow in the alpha (no hard cut line).
Do not restyle the product; only remove background and lightly polish.
"""

result = client.images.edit(
    model="gpt-image-1.5",
    image=[
        open("../../images/input_images/shampoo.png", "rb"),
    ],
    prompt=prompt
)

save_image(result, "extract_product.png")

Input Image:

Output Image:

5.5 Marketing Creatives with Real Text In-Image

Marketing creatives with real in-image text are great for rapid ad concepting, but typography needs explicit constraints. Put the exact copy in quotes, demand verbatim rendering (no extra characters), and describe placement and font style. If text fidelity is imperfect, keep the prompt strict and iterate—small wording/layout tweaks usually improve legibility.

prompt = """
Create a realistic billboard mockup of the shampoo on a highway scene during sunset.
Billboard text (EXACT, verbatim, no extra characters):
"Fresh and clean"
Typography: bold sans-serif, high contrast, centered, clean kerning.
Ensure text appears once and is perfectly legible.
No watermarks, no logos.
"""

result = client.images.edit(
    model="gpt-image-1.5",
    image=[
        open("../../images/input_images/shampoo.png", "rb"),
    ],
    prompt=prompt
)

save_image(result, "billboard.png")

Input Image:

Output Image:

5.6 Lighting and Weather Transformation

Used to re-stage a photo for different moods, seasons, or time-of-day variants (e.g., sunny → overcast, daytime → dusk, clear → snowy) while keeping the scene composition intact. The key is to change only environmental conditions—lighting direction/quality, shadows, atmosphere, precipitation, and ground wetness—while preserving identity, geometry, camera angle, and object placement so it still reads as the same original photo.

prompt = """
Make it look like a winter evening with snowfall.
"""

result = client.images.edit(
    model="gpt-image-1.5",
    input_fidelity="high", 
    quality="high",
    image=[
        open("../../images/output_images/billboard.png", "rb"),
    ],
    prompt=prompt
)

save_image(result, "billboard_winter.png")

Output Image:

5.7 Object Removal

Person-in-scene compositing is useful for storyboards, campaigns, and “what if” scenarios where facial/identity preservation matters. Anchor realism by specifying a grounded photographic look (natural lighting, believable detail, no cinematic grading), and lock what must not change about the subject. When available, higher input fidelity helps maintain likeness during larger scene edits.

prompt = """
Remove the tree logo from the white t-shirt of the man. Do not change anything else.
"""

prompt = """
Remove the red stripes from the white t-shirt of the man. Do not change anything else.
"""

prompt = """
Change the color of thered hat to light blue as velvet. Do not change anything else.
"""


result = client.images.edit(
    model="gpt-image-1.5",
    input_fidelity="high", 
    quality="high",
    image=[
        open("../../images/output_images/man_with_blue_hat.png", "rb"),
    ],
    prompt=prompt
)

save_image(result, "man_with_no_flower.png")
Original Input	Remove Red Stripes	Change Hat Color

	
	
5.8 Insert the Person Into a Scene

Person-in-scene compositing is useful for storyboards, campaigns, and “what if” scenarios where facial/identity preservation matters. Anchor realism by specifying a grounded photographic look (natural lighting, believable detail, no cinematic grading), and lock what must not change about the subject. When available, higher input fidelity helps maintain likeness during larger scene edits.

prompt = """
Generate a highly realistic action scene where this person is running away from a large, realistic brown bear attacking a campsite. The image should look like a real photograph someone could have taken, not an overly enhanced or cinematic movie-poster image.
She is centered in the image but looking away from the camera, wearing outdoorsy camping attire, with dirt on her face and tears in her clothing. She is clearly afraid but focused on escaping, running away from the bear as it destroys the campsite behind her.
The campsite is in Yosemite National Park, with believable natural details. The time of day is dusk, with natural lighting and realistic colors. Everything should feel grounded, authentic, and unstyled, as if captured in a real moment. Avoid cinematic lighting, dramatic color grading, or stylized composition.
"""

result = client.images.edit(
    model="gpt-image-1.5",
    input_fidelity="high", 
    quality="high",
    image=[
        open("../../images/input_images/woman_in_museum.png", "rb"),
    ],
    prompt=prompt
)

save_image(result, "scene.png")

Output Image:
