# Prompting Guide - Text to Image - Quick Reference - Black Forest Labs

**URL:** https://docs.bfl.ai/guides/prompting_summary

---

Skip to main content

🚀 FLUX.2 [klein] — Sub-second generation. Open weights, Apache 2.0, API from $0.014/image. Learn more →

Black Forest Labs home page
Search...
Ctrl K
Ask AI
Help Center
API Status
API Pricing
Get API Key
Documentation
Prompting Guide
API Reference
Release Notes
Documentation
Prompting Guide
BFL Homepage
Help Center
FLUX.2 Prompting
FLUX.2 [pro] & [max]
FLUX.2 [klein]
FLUX.1 Text-to-Image Prompting
Quick Reference
Prompt Builder
Prompting Fundamentals
Prompting Essentials
Advanced Techniques
Negative Prompting
FLUX.1 Kontext Prompting
Image-to-Image
On this page
FLUX Prompt Framework
Use Structured Descriptions
Word Order Matters
Enhancement Layers
Optimal Prompt Length
Avoiding Negative Prompts in FLUX: Positive Alternatives
Quick Templates
Text Integration
Common Use Case Patterns
Character-focused
Context-focused
Style-focused
Technical-focused
Professional Photography Control (Advanced)
Quality Control Checklist
Ready to Start Creating?
Learn More about Prompting
FLUX.1 Text-to-Image Prompting
Prompting Guide - Text to Image - Quick Reference
Copy page

Essential techniques for effective FLUX text-to-image prompting

​
FLUX Prompt Framework
Use this structure for consistent results: Subject + Action + Style + Context
Example: “Red fox sitting in tall grass, wildlife documentary photography, misty dawn”
Subject: The main focus (person, object, character)
Action: What the subject is doing or their pose
Style: Artistic approach, medium, or aesthetic
Context: Setting, lighting, time, mood, or atmospheric conditions

Example of a structured prompt

​
Use Structured Descriptions
Use natural language for relationships and descriptions, but direct specifications for technical and atmospheric elements.
“Human explorer in futuristic gear walking through cyberpunk forest, dramatic atmospheric lighting, sci-fi fantasy art style, cinematic composition”
“An astronaut with a silver spacesuit floating outside the International Space Station, cinematic photography with dramatic lighting, peaceful and awe-inspiring”
“Retro game style detective in old school suit, upper body shot, colorful, futuristic design with vibrant glow”
​
Word Order Matters
Front-load your most important elements. FLUX pays more attention to what comes first.
Priority order: Main subject → Key action → Critical style → Essential context → Secondary details
​
Enhancement Layers
Build beyond the basic framework with these optional layers:
Foundation: Subject + Action + Style + Context
+ Visual Layer: Specific lighting, color palette, composition details
+ Technical Layer: Camera settings, lens specs, quality markers
+ Atmospheric Layer: Mood, emotional tone, narrative elements
Example progression:
Foundation: “An astronaut floating outside the space station, cinematic photography”
Enhanced: “An astronaut with silver spacesuit floating gracefully outside the International Space Station, cinematic photography with dramatic lighting, bathed in golden sunlight, deep blue Earth tones, shallow depth of field, 85mm lens, conveying wonder and achievement”
​
Optimal Prompt Length
Short (10-30 words): Quick concepts and style exploration
Medium (30-80 words): Usually ideal for most projects
Long (80+ words): Complex scenes requiring detailed specifications
​
Avoiding Negative Prompts in FLUX: Positive Alternatives
Instead of “no crowds,” write “peaceful solitude” Instead of “without glasses,” write “clear, unobstructed eyes”
Ask: “If this thing wasn’t there, what would I see instead?”
​
Quick Templates
Portrait: [Subject description], [pose/expression], [style], [lighting], [background]
Product: [Product details], [placement], [lighting setup], [style], [mood]
Landscape: [Location/setting], [time/weather], [camera angle], [style], [atmosphere]
Architecture: [Building/space], [perspective], [lighting], [style], [mood]
​
Text Integration
FLUX can generate readable text in images when you describe it clearly. Here’s how to get good text results:
Use quotation marks: “The text ‘OPEN’ appears in red neon letters above the door”
Specify placement: Where the text appears in relation to other elements
Describe style: “elegant serif typography” or “bold industrial lettering”
​
Common Use Case Patterns
Different types of images work better with different prompt structures. Put the most important elements first based on what you want to emphasize:
​
Character-focused
For portraits, character art: Start with detailed character description and then add the rest of the prompt.
Detailed character → Action → Style → Context
Building progression:
Foundation: “Elderly wizard with long white beard and piercing blue eyes”
+ Action: “Elderly wizard with long white beard and piercing blue eyes, casting a spell”
+ Style: “Elderly wizard with long white beard and piercing blue eyes, casting a spell, fantasy art style”
+ Context: “Elderly wizard with long white beard and piercing blue eyes, casting a spell, fantasy art style, in a magical forest clearing”
​
Context-focused
For landscapes, architectural shots: Lead with the setting and then add the rest of the prompt.
Setting → Atmospheric conditions → Style → Technical specs
Building progression:
Foundation: “Ancient Greek temple ruins”
+ Atmosphere: “Ancient Greek temple ruins at sunset, golden hour lighting”
+ Style: “Ancient Greek temple ruins at sunset, golden hour lighting, cinematic photography style”
+ Details: “Ancient Greek temple ruins at sunset, golden hour lighting, cinematic photography style, with scattered marble columns”
​
Style-focused
For artistic interpretations: Begin with the art style or reference and then add the rest of the prompt.
Artistic reference → Subject → Context → Technical execution
Building progression:
Foundation: “Van Gogh painting style with swirling brushstrokes”
+ Subject: “Van Gogh painting style with swirling brushstrokes, depicting a modern city street”
+ Context: “Van Gogh painting style with swirling brushstrokes, depicting a modern city street, vibrant blues and yellows”
+ Technical: “Van Gogh painting style with swirling brushstrokes, depicting a modern city street, vibrant blues and yellows, impressionist technique”
​
Technical-focused
For professional photography: Start with the subject and then add the rest of the prompt, finishing with camera settings.
Subject → Background → Lighting → Lens/settings
Building progression:
Foundation: “Professional headshot of a business executive”
+ Background: “Professional headshot of a business executive, clean white background”
+ Lighting: “Professional headshot of a business executive, clean white background, studio lighting”
+ Technical: “Professional headshot of a business executive, clean white background, studio lighting, 85mm lens, f/1.4, shallow depth of field”
​
Professional Photography Control (Advanced)
Background blur vs. sharpness (f-numbers): Usually called “aperture”, the f-number controls how blurry vs. sharp your background is. Small numbers (f/1.4) blur the background; big numbers (f/8) keep everything sharp.
Scene width & zoom (mm numbers): Usually called “focal length”, the mm number controls how much of the scene you see and how “zoomed in” it looks. Small numbers (24mm) show wide scenes; big numbers (85mm) zoom in closer.
Lighting: Allow you to control the lighting style in the image. For instance, "Rembrandt lighting" for dramatic portraits, "golden hour" for warm atmosphere
Example: “Professional headshot, 85mm lens, f/2.8, Rembrandt lighting, corporate setting”
​
Quality Control Checklist
Does your prompt include the core framework elements?
Are your most important elements mentioned first?
Have you replaced vague terms with specific descriptors?
Are you describing what you want to see, not what you want to avoid?
Do all elements work together toward a unified vision?
​
Ready to Start Creating?
Test in the Playground
Try these prompting techniques instantly with our FLUX models without writing code
Generate Images with API
Start generating images with the Playground or make your first API call.
​
Learn More about Prompting
Fundamentals Guide
Understand the core framework with detailed explanations and examples
Enhancement Techniques
For more complex techniques, explore Advanced Techniques for layered compositions, style fusion, and cinematic approaches.
Advanced Methods
Explore advanced techniques for layered compositions, style fusion, and cinematic techniques
Working Without Negatives
Learn how to work without negatives for precise control

Was this page helpful?

Yes
No
FLUX.2 [klein]
Prompt Builder
Ctrl+I
Black Forest Labs home page

Legal

Impressum
Developer Terms of Service
Flux API Service Terms
Terms of Use
Responsible AI Development Policy
Usage Policy
Intellectual Property Policy
Privacy Policy

Company

Careers
Help Center
Contact
x
github
linkedin
Powered by