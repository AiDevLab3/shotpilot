
**URL:** https://skywork.ai/blog/how-to-fix-soft-faces-hands-eyes-nano-banana-guide/

---

Skip to content
AI MODELS
AGENT GUIDE
TOP10 ARTICLE SEP
SKYPAGE
SLIDE
GET 500 FREE CREDITS OF SKYWORK
Why Do My Faces Look Off in Nano Banana? Fix Softness, Hands, and Eyes
Leave a Comment / agent / By andywang
 
 
 
Table of contents
5‑Minute Prep Checklist
Rapid Diagnosis: What’s Going Wrong?
Core Workflow (Step-by-Step)
Step A — Generate a clean base (2–5 minutes)
Step B — Lock identity and composition (1–2 minutes)
Step C — Fix eyes with micro-edits (2–4 minutes)
Step D — Fix hands in two passes (3–7 minutes)
Step E — Global polish (optional, 1–3 minutes)
Prompt Mini‑Library (Copy/Paste)
Verification Checklists (Quick Scans)
Troubleshooting: If X, Try Y
Three Mini Walk‑Throughs (Realistic Scenarios)
Optional Post‑Processing (When You Need Print‑Level Detail)
Practical Notes and Ethics
FAQ
December 2025
November 2025
October 2025
September 2025
August 2025
July 2025

If you’re getting soft faces, smudgy eyes, or weird hands from “Nano Banana,” here’s the fix-first guide you need. In creator communities, “Nano Banana” is a nickname for Google’s Gemini 2.5 Flash Image. You’ll see that term used alongside the official name in support threads and tutorials, so we’ll use both for clarity. Gemini’s own posts describe conversational image generation and editing for the app and API, with a focus on controllability and likeness during edits, as explained in Google’s 2025 editing update for the Gemini app and its model announcements for Gemini 2.5 Flash Image previews (Google’s 2025 Gemini app editing update and Gemini 2.5 Flash preview).

What you’ll achieve in 30–60 minutes:

Diagnose why faces/eyes/hands look off
Apply targeted fixes (prompting, composition, micro-edits)
Verify improvements with quick checklists

Important constraints to know before you start:

Region-level edits in the Gemini app are conversational; Google’s Help Center says you can upload an image and “ask Gemini to make edits,” but it doesn’t document manual brush/mask tools. If your interface doesn’t expose masks, use tightly scoped, region-specific instructions (Gemini Apps Help: generate and edit images).
Outputs include invisible SynthID watermarking across Gemini image generation/editing, described by Google and DeepMind for responsible disclosure (DeepMind’s SynthID explainer and Google’s 2025 Gemini app editing update).
Exact pixel-dimension controls and deterministic “seed” parameters are not documented for Gemini 2.5 Flash Image as of writing. Vertex docs list file-size limits and formats; Imagen (a different model) documents a seed, which Gemini Flash Image does not. Plan for some variability (Gemini 2.5 Flash model page on Vertex AI and Imagen seed parameter docs).

From experience: The fastest wins come from good composition, gentle micro-edits to eyes/hands, and branching from a clean base instead of long edit chains.

5‑Minute Prep Checklist

Do these upfront to avoid chasing problems later.

Start at a portrait-friendly distance, not an extreme closeup. Use camera language like “50mm portrait distance” to reduce distortion and DOF blur.
Keep the first prompt simple: subject, lighting, pose. Don’t over-specify the hands or micro-details yet.
Favor neutral, directional light (soft key light) and ask for natural catchlights in the eyes.
Minimize occlusion: if hands must be visible, begin with one relaxed, open hand rather than complex gestures.
Save each good version. If the identity or skin texture looks right, save it and branch future edits from that frame.

Verification (30 seconds): After the first render, zoom to 100%. If the eyes are the sharpest area and you can count five distinct fingers on any visible hand, you’re on a stable base.

Rapid Diagnosis: What’s Going Wrong?

Use this quick decision tree to choose your fix.

If the face looks soft or “plasticky”: Re-compose to portrait distance; add lighting that reveals skin texture; consider a gentle upscale after generation.
If the eyes look smudgy or misaligned: Target the eye region with a very specific instruction; add “sharp iris, natural catchlights, symmetrical pupils.”
If the hands are malformed or have extra fingers: Change the pose to one visible, relaxed hand; eliminate occlusion; repair in two passes (shape, then detail).
If likeness drifts after many edits: Branch from your last clean save; reduce the number of sequential edits; re-upload the clean image as your reference and apply minimal changes per step. Google highlights likeness-preserving improvements in 2025 updates, but long edit chains can still drift (Google’s 2025 Gemini app editing update).

Why these work: Eyes and hands are small, high-frequency features. Composition, lighting, and minimal occlusion give the model the best signal. Photography guidance consistently places eye sharpness at the top priority for portraits, and catchlights help the eyes read as lively and real (see Digital Photography School’s portrait sharpness and catchlight guidance: sharp portraits checklist and how to create catch lights).

Core Workflow (Step-by-Step)

Follow A → E. After each step, run the quick verification.

Step A — Generate a clean base (2–5 minutes)

What to do:

Prompt for a mid-shot portrait with soft, directional light and portrait-distance lens language.
Keep styling concise; avoid cramming hand specifics or complex accessories.

Copy/paste starter prompt:

Clean portrait, soft key light with natural catchlights, portrait distance (50mm/85mm look), neutral background, realistic skin texture, relaxed expression, minimal jewelry, no heavy stylization.


Verify:

Zoom to 100%. Are the eyes the sharpest part of the face? Are skin pores/micro-texture visible (not overly plastic)? If hands are visible, can you count five fingers on any shown hand without ambiguity?

From experience: If the base looks “almost right,” don’t chase perfection here. Lock it, then micro-fix.

Step B — Lock identity and composition (1–2 minutes)

What to do:

Save the base image as your “clean” reference. If your interface supports referencing a prior image during edits, use it to preserve likeness.
Avoid long edit chains. Instead, branch: for each major change, start from the clean reference rather than the already-edited version. Google’s materials emphasize conversational editing and identity consistency, but branching remains the safest way to prevent drift (Vertex AI: image editing overview).

Verify:

After any edit, compare to the clean base. If identity shifts, revert and try a smaller, more specific instruction.
Step C — Fix eyes with micro-edits (2–4 minutes)

What to do:

Target only the eye region with a narrow instruction. If your UI supports masks, select a tight area including eyelids and iris; feather slightly. If not, literally say you’re editing only the eyes.
Keep changes subtle. Prioritize sharp iris, natural catchlights, symmetrical pupils, correct eyelid contour, and neutral sclera tone.

Eye-fix prompt snippets:

Tighten only the eyes: sharp iris detail, natural catchlights in the upper iris, symmetrical pupils, realistic eyelid contour, neutral sclera tone; avoid over-sharpening.

Enhance just the right eye and left eye—keep identity: crisp iris texture, tiny specular catchlights consistent with key light, no glassy or plastic look.


Verify:

Are both pupils the same size and centered appropriately? Do catchlights match your key light direction? Is the eye closest to camera the sharpest? Photography guides recommend prioritizing eye sharpness in portraits (see Digital Photography School’s sharp portraits checklist).

From experience: If eyes look “too perfect,” back off—reduce clarity language and re-ask for “natural micro skin texture around eyelids.”

Step D — Fix hands in two passes (3–7 minutes)

What to do:

First, change the pose or composition if hands are partially hidden. Aim for one visible, relaxed open hand—thumb orientation should be unmistakable.
Then run two micro-edits:
Shape pass: Ask for five distinct fingers, correct thumb position, natural knuckle spacing; avoid detail words.
Detail pass: Add skin creases, nail shape, subtle veins; keep it realistic, not plastic.

Hand-fix prompt snippets:

Adjust only the visible hand for correct structure: five distinct fingers, clear thumb orientation, natural knuckle spacing and finger lengths; no occlusion, no extra fingers.

Now refine only the hand’s surface details: subtle skin creases, natural nail shape, gentle shading; maintain realism and match existing lighting.


Verify:
