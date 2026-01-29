# Gen-4 Video Prompting Guide – Runway

**URL:** https://help.runwayml.com/hc/en-us/articles/39789879462419-Gen-4-Video-Prompting-Guide

---

Skip to main content
Go to Runway Get Help
Search
Runway  Creating with Runway  Getting Started  Prompting Guides & Examples
Gen-4 Video Prompting Guide


Table of Contents
Prompting Basics
Prompt Elements
Examples
Introduction

Gen-4 enables fast, controllable, and flexible video generation that can seamlessly sit beside live action, animated and VFX content. Gen-4 creates videos in 5 or 10 second durations based on an input image and text prompt you provide.

This article covers different example structures, keywords, and prompting tips to help you get started with Gen-4. For information about Gen-4 pricing, output details, and using the UI, please see the Creating with Gen-4 documentation.

Article highlights
Don't underestimate the power of simplicity in your text prompt
Use a high-quality input image, free of visual artifacts, for best results
Use the text prompt to focus on describing motion
Use positive phrasing and avoid negative prompts
Refer to subjects in general terms, like "the subject"
Related Articles
Creating with Gen-4 Video
Creating with Aleph
Prompting Basics

This section covers our recommended approach to prompting, but experimenting with prompt variations and patterns will allow you to discover what works best for your inputs and desired outcome.

Prompting for Iteration

The Gen-4 model thrives on prompt simplicity. Rather than starting with an overly complex prompt, we recommend beginning your session with a simple prompt, and iterating by adding more details as needed.

Begin with a foundational prompt that captures only the most essential motion to the scene. Once your basic motion works well, try adding different prompt elements to further refine the output:

Subject motion 
Camera motion  
Scene motion 
Style descriptors

Adding one new element at a time will help you identify which additions improve your video, understand how different elements interact, and more effectively troubleshoot unexpected results.

Below is an example prompt that conveys all ingredients:

Prompt	Input image	Output
a handheld camera tracks the mechanical bull as it runs across the desert. the movement disturbs dust that trails behind the mechanical creature. cinematic live-action.		

See the Prompt Elements section for more example prompts and their respective outputs.

 

Best Practices

While there's no right or wrong way to write a prompt, following these best practices will help you achieve the results you envision. Click each recommendation for more context and examples:

Use positive phrasing only
Use direct, simple, and easily understood prompts
Focus on describing the motion, rather than the input image
Avoid conversational or command-based prompts
Avoid overly complex prompts

 

Image prompts

In Generative Video models, the text prompt plays a crucial role in guiding the generative process in tandem with your image prompt, or input image. The qualities of your input will play a key role in the final output.

The input image establishes the visual starting point of the entire generative process by conveying key visual information about subjects, composition, colors, lighting, and style— allowing you to focus on describing the desired motion.

 

Prompt Elements
Subject Motion

Subject motion describes how characters or objects should behave or move. Subject motion may include physical movement, expressions, gestures, and more.

When describing subject motion, refer to characters or objects with general terms like "the subject" or simple pronouns. For example: "The subject turns slowly" or "She raises her hand." This helps the model focus on creating smooth motion rather than reinterpreting subject details already present in your image.

For Multiple Subjects

When your image contains multiple subjects needing different movements:

Use clear positional language: "The subject on the left walks forward. The subject on the right remains still."
Or simple descriptive identifiers: "The woman nods. The man waves."

This approach allows you to direct specific motion for each subject without confusing the model about which element should perform which action.

Scene Motion

Scene motion describes how the environment of a video should behave or react to motion. Scene motion may be based on subject motion or occur independently.

There are two different approaches for prompting for scene motion:

Insinuated motion: "The subject runs across the dusty desert"
Described motion: "The subject runs across the desert. Dust trails behind them as they move"

Insinuating motion with adjectives can lead to more natural results, while directly describing the motion can lead to emphasis of the element. If insinuated scene motion doesn't provide the desired results, try insinuating motion multiple times or adding simple description to further emphasize the movement.

Camera Motion

Camera motion describes how the camera should move through the scene in your input image. Camera motion can be prompted for movement style (locked, handheld, dolly, pan, and more), tracking subjects or moving independently through environments, shifts in focus, and more.

For examples of filmic motion terms, our Creating with Camera Control documentation is a good starting point. This Gen-3 article lists different terminology you can explore adding to your creations.

Style Descriptors

Style descriptors indicate broad or general motion elements. In example, you might use a style descriptor to convey motion speed, general movement style (live action, smooth animation, stop motion), or aesthetic style.

Style descriptors can be appended to prompts while refining results or included within the main body of the prompt.


Examples
Prompt	Input image	Output
the woman inspects her reflection in the mirror. the surface of the mirror bubbles with large, organically-shaped translucent bubbles in varying sizes. locked camera 		
the pile of rocks transforms into a humanoid made out of rugged volcanic rocks. the rock humanoid walks around the scene.		
the handheld camera tracks the mouse as it scurries away.		
The Brooklyn bridge gets on fire and collapses
		

 

 

Product
Our Tools
API
Aleph
Gen-4
Game Worlds
Act-Two
General World Models
Use Cases
Ways to Use Runway
Initiatives
Studio
AI Film Festival
FOOM!
Gen:48
Academy
Telescope Magazine
Creative Partners Program
The Hundred Film Fund
Blog
Our Research
Careers
About Us
Customer Stories
News
Store
Talent Network
Get Started
For Enterprises
For Educators
Login
Pricing
Help Center
Data Security
Changelog
Connect
Press
Partnerships
Brand Guidelines
Instagram
Youtube
Discord
© 2025 RUNWAY AI, INC / TERMS OF USE / PRIVACY POLICY / CODE OF CONDUCT / SYSTEM STATUS