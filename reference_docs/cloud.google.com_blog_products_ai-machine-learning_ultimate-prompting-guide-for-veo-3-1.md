# Ultimate prompting guide for Veo 3.1 | Google Cloud Blog

**URL:** https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1

---

Jump to Content
Cloud
Blog
Solutions & technology
Ecosystem
Developers & Practitioners
Transform with Google Cloud
Contact sales
Get started for free
AI & Machine Learning
The ultimate prompting guide for Veo 3.1
October 16, 2025
Khulan Davaajav

Global AI Content Manager

Hussain Chinoy

Gen AI Technical Solutions Manager

Try Gemini 3

Our most intelligent model is now available on Vertex AI and Gemini Enterprise

Try now

If a picture is worth a thousand words, a video is worth a million. 

We’ve been seeing incredible momentum since the launch of Veo 3.1, our state-of-the-art video generation model. With professional-grade creative controls, multiple aspect ratios, and rich synchronous audio – Veo 3.1 is now stable and generally available for production on Vertex AI.

Check out how some of our customers are using Veo 3.1:

“At Pocket FM, we’ve always believed that great storytelling deserves great visuals. With Veo 3.1, our creators finally have a gen AI tool that matches that ambition. Its lifelike lip-sync and cinematic quality have made it indispensable - over a hundred of our team members use it every week. The impact has been remarkable, driving 30-40% uplifts in user retention and bringing acquisition results at par with live action promos across our flagship shows” – Umesh Bude, CTO, Pocket Entertainment.

"Our expanded strategic partnership with Google Cloud positions WPP as an official launch partner for its new generative AI models. Our creative and technology teams are leveraging this premier access to pioneer new production workflows, pushing creative boundaries for our clients. Features like Veo 3.1's 'first frame, last frame' capability are proving to be transformative, providing our teams with powerful new tools for narrative control and innovation." – Elav Horwitz, Chief Innovation Officer, WPP.

"Google’s Veo 3.1 brings next-level granular video controls and rich audio to QuickFrame AI. Our collaboration makes it possible for any brand to create long form cinematic-quality TV and digital video ads in minutes. By integrating Veo 3.1, QuickFrame and MNTN deliver on our mission to be the great unlock for advertisers, breaking down the creative barriers that have kept so many brands off television until now." - John Matze, VP of QuickFrame.

Ready to start creating with Veo 3.1? Read on to explore our comprehensive prompt guide below:

This guide is a framework for directing Veo 3.1, our latest model that marks a shift from simple generation to creative control. Veo 3.1 builds on Veo 3, with stronger prompt adherence and improved audiovisual quality when turning images into videos. 

What you'll learn in this guide:

Learn Veo 3.1's full range of capabilities on Vertex AI.

Implement a formula to direct scenes with consistent characters and styles.

Direct video and sound using professional cinematic techniques.

Execute complex ideas by combining Veo with Gemini 2.5 Flash Image (Nano Banana) in advanced workflows.

Veo 3.1 model capabilities

First, it’s essential to understand the model's full range of capabilities. Veo 3.1 brings audio to existing capabilities to help you craft the perfect scene. These features are experimental and actively improving, and we’re excited to see what you create as we iterate based on your feedback.

Core generation features:

High-fidelity video: Generate video at 720p or 1080p resolution.

Aspect ratio: 16:9 or 9:16

Variable clip length: Create clips of 4, 6, or 8 seconds.

Rich audio & dialogue: Veo 3.1 excels at generating realistic, synchronized sound, from multi-person conversations to precisely timed sound effects, all guided by the prompt.

Complex scene comprehension: The model has a deeper understanding of narrative structure and cinematic styles, enabling it to better depict character interactions and follow storytelling cues.

Advanced creative controls:

Improved image-to-video: Animate a source image with greater prompt adherence and enhanced audio-visual quality.

Consistent elements with "ingredients to video": Provide reference images of a scene, character, object, or style to maintain a consistent aesthetic across multiple shots. This feature now includes audio generation.

Seamless transitions with "first and last frame": Generate a natural video transition between a provided start image and end image, complete with audio.

Add/remove object: Introduce new objects or remove existing ones from a generated video. Veo preserves the scene's original composition.

Digital watermarking: All generated videos are marked with SynthID to indicate the content is AI-generated.

Note: Add/remove object currently utilizes the Veo 2 model and does not generate  audio. 

A formula for effective prompts

A structured prompt yields consistent, high-quality results. Consider this five-part formula for optimal control.

[Cinematography] + [Subject] + [Action] + [Context] + [Style & Ambiance]

Cinematography: Define the camera work and shot composition.

Subject: Identify the main character or focal point.

Action: Describe what the subject is doing.

Context: Detail the environment and background elements.

Style & ambiance: Specify the overall aesthetic, mood, and lighting.

Example prompt: Medium shot, a tired corporate worker, rubbing his temples in exhaustion, in front of a bulky 1980s computer in a cluttered office late at night. The scene is lit by the harsh fluorescent overhead lights and the green glow of the monochrome monitor. Retro aesthetic, shot as if on 1980s color film, slightly grainy.

Essential prompting techniques

Mastering these core techniques will give you granular control over every aspect of your generation.

The language of cinematography

The [Cinematography] element of your prompt is the most powerful tool for conveying tone and emotion.

Camera movement: Dolly shot, tracking shot, crane shot, aerial view, slow pan, POV shot.

Crane shot example

Prompt: Crane shot starting low on a lone hiker and ascending high above, revealing they are standing on the edge of a colossal, mist-filled canyon at sunrise, epic fantasy style, awe-inspiring, soft morning light.

Composition: Wide shot, close-up, extreme close-up, low angle, two-shot.

Lens & focus: Shallow depth of field, wide-angle lens, soft focus, macro lens, deep focus.

Shallow depth of field example

Prompt: Close-up with very shallow depth of field, a young woman's face, looking out a bus window at the passing city lights with her reflection faintly visible on the glass, inside a bus at night during a rainstorm, melancholic mood with cool blue tones, moody, cinematic.

Directing the soundstage 

Veo 3.1 can generate a complete soundtrack based on your text instructions.

Dialogue: Use quotation marks for specific speech (e.g., A woman says, "We have to leave now.").

Sound effects (SFX): Describe sounds with clarity (e.g., SFX: thunder cracks in the distance).

Ambient noise: Define the background soundscape (e.g., Ambient noise: the quiet hum of a starship bridge).

Mastering negative prompts

To refine your output, describe what you wish to exclude. For example, specify "a desolate landscape with no buildings or roads" instead of "no man-made structures".

Prompt enhancement with Gemini

If you need to add more detail, use Gemini to analyze and enrich a simple prompt with more descriptive and cinematic language. 

Advanced creative workflows

While a single, detailed prompt is powerful, a multi-step workflow offers unparalleled control by breaking down the creative process into manageable stages. The following workflows demonstrate how to combine Veo 3.1's new capabilities with Gemini 2.5 Flash Image (Nano Banana) to execute complex visions.

Workflow 1: The dynamic transition with "first and last frame" 

This technique allows you to create a specific and controlled camera movement or transformation between two distinct points of view.

Step 1: Create the starting frame: Use Gemini 2.5 Flash Image to generate your initial shot. 

Gemini 2.5 Flash Image prompt:

“Medium shot of a female pop star singing passionately into a vintage microphone. She is on a dark stage, lit by a single, dramatic spotlight from the front. She has her eyes closed, capturing an emotional moment. Photorealistic, cinematic.”

Step 2: Create the ending frame: Generate a second, complementary image with Gemini 2.5 Flash Image, such as a different POV angle. 

Gemini 2.5 Flash Image prompt:

“POV shot from behind the singer on stage, looking out at a large, cheering crowd. The stage lights are bright, creating lens flare. You can see the back of the singer's head and shoulders in the foreground. The audience is a sea of lights and silhouettes. Energetic atmosphere.”

Step 3: Animate with Veo. Input both images into Veo using the First and Last Frame feature. In your prompt, describe the transition and the audio you want. 

Veo 3.1 prompt: “The camera performs a smooth 180-degree arc shot, starting with the front-facing view of the singer and circling around her to seamlessly end on the POV shot from behind her on stage. The singer sings “when you look me in the eyes, I can see a million stars.”

Workflow 2: Building a dialogue scene with "ingredients to video" 

This workflow is ideal for creating a multi-shot scene with consistent characters engaged in conversation, leveraging Veo 3.1's ability to craft a dialogue.

Step 1: Generate your "ingredients": Create reference images using Gemini 2.5 Flash Image for your characters and the setting.

Step 2: Compose the scene: Use the Ingredients to Video feature with the relevant reference images. 

Prompt “Using the provided images for the detective, the woman, and the office setting, create a medium shot of the detective behind his desk. He looks up at the woman and says in a weary voice, "Of all the offices in this town, you had to walk into mine."

Prompt: “Using the provided images for the detective, the woman, and the office setting, create a shot focusing on the woman. A slight, mysterious smile plays on her lips as she replies, "You were highly recommended."

Workflow 3: Timestamp prompting

This workflow allows you to direct a complete, multi-shot sequence with precise cinematic pacing, all within a single generation. By assigning actions to timed segments, you can efficiently create a full scene with multiple distinct shots, saving time and ensuring visual consistency.

Prompt example:

[00:00-00:02] Medium shot from behind a young female explorer with a leather satchel and messy brown hair in a ponytail, as she pushes aside a large jungle vine to reveal a hidden path.

[00:02-00:04] Reverse shot of the explorer's freckled face, her expression filled with awe as she gazes upon ancient, moss-covered ruins in the background. SFX: The rustle of dense leaves, distant exotic bird calls.

[00:04-00:06] Tracking shot following the explorer as she steps into the clearing and runs her hand over the intricate carvings on a crumbling stone wall. Emotion: Wonder and reverence.

[00:06-00:08] Wide, high-angle crane shot, revealing the lone explorer standing small in the center of the vast, forgotten temple complex, half-swallowed by the jungle. SFX: A swelling, gentle orchestral score begins to play.

Start creating with Veo 3.1 in Vertex AI

You now have the framework to direct Veo with precision. The best way to master these techniques is to apply them for real-world use cases.

For developers and enterprise users, the improved Veo 3.1 model is available in preview on Vertex AI via the API. This allows you to experiment with these advanced prompting workflows and build powerful, controlled video generation capabilities directly into your own applications.

Thanks to Anish Nangia, Sabareesh Chinta, and Wafae Bakkali for their contributions to prompting guidance for customers.

Posted in
AI & Machine Learning
Related articles
Data Analytics
BigQuery AI supports Gemini 3.0, simplified embedding generation and new similarity function

By Tianxiang Gao • 5-minute read

Management Tools
Monitoring Google ADK agentic applications with Datadog LLM Observability

By Abhi Das • 4-minute read

Databases
How Fastweb + Vodafone reimagined data workflows with Spanner & BigQuery

By Vincenzo Forciniti • 5-minute read

Compute
Scaling WideEP Mixture-of-Experts inference with Google Cloud A4X (GB200) and NVIDIA Dynamo

By Sean Horgan • 9-minute read

Footer Links
Follow us
Google Cloud
Google Cloud Products
Privacy
Terms
Help
Language
‪English‬
‪Deutsch‬
‪Français‬
‪한국어‬
‪日本語‬