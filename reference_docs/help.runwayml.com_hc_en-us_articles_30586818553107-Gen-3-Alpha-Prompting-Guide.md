# Gen-3 Alpha Prompting Guide – Runway

**URL:** https://help.runwayml.com/hc/en-us/articles/30586818553107-Gen-3-Alpha-Prompting-Guide

---

Skip to main content
Go to Runway Get Help
Search
Runway  Creating with Runway  Getting Started  Prompting Guides & Examples
Gen-3 Alpha Prompting Guide


Table of Contents
Prompting Basics
Prompt Keywords

Gen-3 Alpha can bring your artistic vision to life for a wide variety of use cases. Creating a strong prompt that conveys the scene is the key to generating video aligned with your concept.

This article covers different example structures, keywords and prompting tips to help you get started with Gen-3 Alpha. These are just examples – don’t be afraid to experiment when bringing your ideas to life.

 

Gen-4 is now available to all users with a subscription. Review our Gen-4 Prompting Guide for more details.

 

Article Highlights
Avoid negative phrasing, such as the camera doesn't move, in your text prompts
Use a simple and direct prompt that describes the desired movement when using an input image
You do not need to describe your input image in a text prompt
Related Links
Creating with Text/Image to Video

 

Prompting Basics
All prompts should be direct and easily understood, not conceptual

When crafting a prompt, it can be helpful to pretend that you're describing a scene to a new collaborator who is unfamiliar with your previous work and preferred aesthetic. This new collaborator will be responsible for filming the scene that you're describing, so ensure that important elements are conveyed with clarity.

Avoid using overly conceptual language and phrasing when a simplistic description would efficiently convey the scene. 

❌ a man hacking into the mainframe.
✅ a man vigorously typing on the keyboard.

 

Prompts should be descriptive, not conversational or command-based

While external LLMs thrive on natural conversation, Gen-3 Alpha is designed to thrive on visual detail. Including conversational additions to your prompt will not bring value to your results, and could even negatively impact your results in certain cases.

❌ can you please make me a video about two friends eating a birthday cake?
✅ two friends eat birthday cake. 

Using a command-based prompt may have a similar negative effect, as it may not include sufficient details to create the desired scene:

❌ add a dog to the image
✅ a dog playfully runs across the field from out of frame

 

Prompts should use positive phrasing

Negative prompts, or prompts that describe what shouldn't happen, are not supported in Gen-3 Alpha. Including a negative prompt may result in the opposite happening.

❌ no clouds in the sky. no subject motion.
✅ a clear blue sky. subtle and minimal subject motion.

 

Text-only Prompting

Text-only prompts are most effective when they follow a clear structure that divides details about the scene, subject and camera movement into separate sections.

Using the following structure should help provide consistent results while you’re familiarizing yourself with Gen-3 Alpha:

[camera movement]: [establishing scene]. [additional details].

Using this structure, your prompt for a woman standing in a tropical rainforest might look like this:

Low angle static shot: The camera is angled up at a woman wearing all orange as she stands in a tropical rainforest with colorful flora. The dramatic sky is overcast and gray.

Repeating or reinforcing key ideas in different sections of your prompt can help increase adherence in the output. For example, you might note that the camera quickly flies through the scenes in a hyperspeed shot.

Try to keep your prompt focused on what should be in the scene. For example, you would prompt for a clear sky rather than a sky with no clouds.

 

Image + Text Prompting

When using input images, use a simple and direct text prompt that describes the movement you'd like in the output. You do not need to describe the contents of the image.

In example, you might try the following prompt if using an input image that features a character:

Subject cheerfully poses, her hands forming a peace sign.

Using a text prompt that significantly differs from the input image may lead to unexpected results. Keep in mind that complex scene transitions may require multiple iterations to achieve the desired output.

 

Sample Prompts
Seamless Transitions

Continuous hyperspeed FPV footage: The camera seamlessly flies through a glacial canyon to a dreamy cloudscape.

 

Camera Movement

A glowing ocean at night time with bioluminescent creatures under water. The camera starts with a macro close-up of a glowing jellyfish and then expands to reveal the entire ocean lit up with various glowing colors under a starry sky. Camera Movement: Begin with a macro shot of the jellyfish, then gently pull back and up to showcase the glowing ocean.

 

Text Title Cards

A title screen with dynamic movement. The scene starts at a colorful paint-covered wall. Suddenly, black paint pours on the wall to form the word "Runway". The dripping paint is detailed and textured, centered, superb cinematic lighting.

 

Prompt Keywords

Keywords can be beneficial to achieve specific styles in your output. Ensuring that keywords are cohesive with your overall prompt will make them more apparent in your output.

In example, including keywords about skin texture wouldn't be beneficial to a wide angle shot where the camera is not closely focused on a face. A wide angle shot might instead benefit from additional details about the environment.

While keeping this cohesiveness in mind, below are different keywords you can experiment with while drafting your prompts.

 

Camera Styles

Different camera styles can be achieved through Text to Video prompts, but we recommend using Camera Control when using an input image.

Keyword	Output
Low angle	
High angle	
Overhead	
FPV	
Hand held	
Wide angle	
Close up	
Macro cinematography	
Over the shoulder	
Tracking	
Establishing wide	
50mm lens	
SnorriCam	
Realistic documentary	
Camcorder	

 

Lighting Styles
Keyword	Output
Diffused lighting	
Silhouette	
Lens flare	
Back lit	
Side lit	
[color] gel lighting	
Venetian lighting	

 

Movement Speeds
Keyword	Output
Dynamic motion	
Slow motion	
Fast motion	
Timelapse	

 

Movement Types
Keyword	Output
Grows	
Emerges	
Explodes	
Ascends	
Undulates	
Warps	
Transforms	
Ripples	
Shatters	
Unfolds	
Vortex	

 

Style and Aesthetic
Keyword	Output
Moody	
Cinematic	
Iridescent	
Home video VHS	
Glitchcore	

 

Text Styles
Keyword	Output
Bold	
Graffiti	
Neon	
Varsity	
Embroidery	

 

Bracket Placeholders

For creating custom presets that are easy to reuse, you can also put part of your prompt in brackets to 1-click replace the text. For example:

The camera seamlessly flies through a [subject location]

When saved as a preset, this allows you to 1-click replace the bracket area and start typing your text whenever you reuse it. 

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