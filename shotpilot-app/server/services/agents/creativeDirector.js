import { callGemini } from '../ai/shared.js';

/**
 * Available models with their strengths and API availability.
 */
const MODEL_REGISTRY = {
  'flux-2': {
    name: 'FLUX.2',
    specialistModule: 'flux2',
    strengths: ['photorealism', 'physics-based lighting', 'hex colors', 'multi-reference editing', 'JSON prompts'],
    weaknesses: ['negative prompts not supported'],
    hasAPI: true,
    description: 'Physics-based photorealism. JSON structured prompts, hex color precision, multi-reference up to 8-10 images.',
  },
  'flux-kontext': {
    name: 'FLUX.1 Kontext',
    specialistModule: 'fluxKontext',
    strengths: ['image editing', 'instruction-based editing', 'character consistency', 'precise modifications'],
    weaknesses: ['not for generation from scratch'],
    hasAPI: true,
    description: 'Instruction-based editor. "Change X to Y" commands, guidance scale control, multi-reference endpoints.',
  },
  'gpt-image-1.5': {
    name: 'GPT Image 1.5',
    specialistModule: 'gptImage',
    strengths: ['world knowledge', 'text rendering', 'conversational editing', 'identity preservation', 'instruction following'],
    weaknesses: ['none significant'],
    hasAPI: true,
    description: 'Multimodal LLM with image generation. World knowledge, conversational intelligence, best text rendering.',
  },
  'grok-imagine': {
    name: 'Grok Imagine',
    specialistModule: 'grokImagine',
    strengths: ['dramatic aesthetics', 'visual impact', 'film stock emulation', 'hex color palettes', 'rapid iteration'],
    weaknesses: ['no reference images for generation', 'no character consistency', 'no seed control'],
    hasAPI: true,
    description: 'Aesthetic-first drama. Impact-leading prompts, film stock emulation, 12 aspect ratios, $0.02/image.',
  },
  'kling-image-v3': {
    name: 'Kling Image V3/O3',
    specialistModule: 'klingImageV3',
    strengths: ['Elements face control', 'series generation', 'multi-image reference', '4K resolution (O3)', 'systematic control'],
    weaknesses: ['complex syntax requirements'],
    hasAPI: true,
    description: 'Structure-oriented generation. @Element face control, series mode, O3 supports up to 10 reference images.',
  },
  'midjourney': {
    name: 'Midjourney V7',
    specialistModule: 'midjourney',
    strengths: ['aesthetic excellence', 'photographer approach', 'Omni Reference', 'personalization', 'draft mode'],
    weaknesses: ['prompt-only interface', 'text rendering limitations'],
    hasAPI: false,
    description: 'Aesthetic mastery with photographer\'s eye. V7 features: --oref, personalization, draft mode. Discord/web only.',
  },
  'nano-banana-pro': {
    name: 'Nano Banana Pro (Gemini 3 Pro Image)',
    specialistModule: 'nanoBananaPro',
    strengths: ['thinking model', 'conversational editing', 'up to 14 references', '4K native', 'Google Search grounding'],
    weaknesses: ['none significant'],
    hasAPI: true,
    description: 'Intelligent reasoning model. 6-variable framework, conversational edits, world knowledge integration.',
  },
  'reve': {
    name: 'Reve',
    specialistModule: 'reve',
    strengths: ['surgical editing', 'conversational changes', 'context preservation', '4 variants', 'batch A/B testing'],
    weaknesses: ['requires input image', 'not for generation from scratch'],
    hasAPI: true,
    description: 'Surgical editor with 4 variants. Edit/Remix in standard/fast modes. Natural language change commands.',
  },
  'seedream-4.5': {
    name: 'Seedream 4.5',
    specialistModule: 'seedream',
    strengths: ['SOTA text rendering', 'multi-image consistency', 'brand assets', 'non-Latin scripts', 'design-oriented'],
    weaknesses: ['none significant'],
    hasAPI: true,
    description: 'Design excellence with perfect typography. Multi-image series, brand asset creation, LM Arena #10.',
  },
  'topaz': {
    name: 'Topaz AI (Gigapixel/Photo AI)',
    specialistModule: 'topaz',
    strengths: ['AI image upscaling', 'artifact removal', 'specialized models', 'up to 6x scale', 'Redefine for AI art'],
    weaknesses: ['not a generator', 'post-processing only'],
    hasAPI: true,
    description: 'Post-processing upscaler. Redefine model for AI-generated images, up to 6x scale, denoise/sharpen pipeline.',
  },
};

function getModelRegistry() {
  return MODEL_REGISTRY;
}

/**
 * Creative Director Agent — interprets user intent, selects model, creates structured brief.
 * When projectContext is provided, the CD has full awareness of the project's scenes, characters, and world.
 */
async function directShot(shotDescription, styleProfile, modelPreference, projectContext) {
  const modelList = Object.entries(MODEL_REGISTRY)
    .map(([id, m]) => `- ${id}: ${m.description} | Strengths: ${m.strengths.join(', ')} | API: ${m.hasAPI}`)
    .join('\n');

  // Build project context block if available
  let projectBlock = '';
  if (projectContext) {
    const sceneList = (projectContext.scenes || []).map(s =>
      `  Scene ${s.number}: ${s.name} — ${s.description.split('\n')[0]}`
    ).join('\n');

    projectBlock = `
## Project: ${projectContext.project?.name || 'Unknown'}

### Visual Identity
${projectContext.visualIdentity || ''}

### Characters
${projectContext.characters || ''}

### Vehicles
${projectContext.vehicles || ''}

### Technical Standards
${projectContext.technicalStandards || ''}

### All Scenes
${sceneList}

### Active Scene Details
${projectContext.activeScene ? JSON.stringify(projectContext.activeScene, null, 2) : 'No specific scene selected — use the full project context.'}

When a scene is active, use ALL its details (lens, lighting, description, characters) as the foundation.
The user's description adds to or overrides scene defaults.
If no user description is given but a scene is active, generate based entirely on the scene breakdown.
`;
  }

  const systemPrompt = `You are the Creative Director for a cinematic production pipeline.

## Your Role
Interpret the user's shot description, select the optimal AI model, and produce a structured brief for the Model Specialist.
${projectBlock}
## Project Style Profile
${JSON.stringify(styleProfile, null, 2)}

## Available Models
${modelList}

## Model Selection Logic
- For environments, landscapes, establishing shots → prefer flux-2 or nano-banana-pro
- For character-focused shots → prefer gpt-image or flux-2
- For maximum aesthetic/mood → prefer midjourney (note: prompt-only, no API)
- For video/camera motion guidance → prefer higgsfield
- If user specifies a model preference, respect it unless there's a strong reason not to
- Consider API availability — models with hasAPI:true can be called programmatically

## Output Format
Respond with ONLY valid JSON:
{
  "selected_model": "model-id",
  "model_reasoning": "Why this model was chosen",
  "brief": {
    "shot_intent": "What we're creating and why",
    "subject": "Primary subject description",
    "environment": "Setting/background description",
    "lighting": "Lighting direction based on style profile",
    "color_grade": "Color/grade direction based on style profile",
    "composition": "Framing and composition notes",
    "mood": "Emotional tone",
    "technical": {
      "aspect_ratio": "from style profile",
      "realism_target": "from style profile",
      "video_ready": true/false
    },
    "critical_requirements": ["must-have elements"],
    "avoid": ["things to avoid per style profile"]
  }
}`;

  const userPrompt = modelPreference
    ? `Shot description: ${shotDescription}\n\nUser requests model: ${modelPreference}`
    : `Shot description: ${shotDescription}`;

  const result = await callGemini({
    parts: [{ text: userPrompt }],
    systemInstruction: systemPrompt,
    thinkingLevel: 'medium',
    responseMimeType: 'application/json',
    maxOutputTokens: 4096,
  });

  return JSON.parse(result);
}

/**
 * Suggest placements — CD analyzes staged images against planned shots and suggests matches.
 * Returns an array of { imageId, shotId, confidence, reasoning }.
 */
async function suggestPlacements(shots, stagedImages, sceneContext, projectContext) {
  if (!shots.length || !stagedImages.length) return [];

  const shotDescriptions = shots.map(s =>
    `Shot ${s.shot_number} (ID ${s.id}): ${s.shot_type || 'Unknown type'}${s.camera_angle ? ', ' + s.camera_angle : ''}${s.description ? ' — ' + s.description : ''}`
  ).join('\n');

  const imageDescriptions = stagedImages.map(img => {
    let desc = `Image ID ${img.id}`;
    if (img.title) desc += `: ${img.title}`;
    if (img.analysis_json) {
      try {
        const a = JSON.parse(img.analysis_json);
        if (a.summary) desc += ` — ${a.summary}`;
        if (a.detected_shot_type) desc += ` [detected: ${a.detected_shot_type}]`;
        if (a.detected_mood) desc += ` [mood: ${a.detected_mood}]`;
      } catch {}
    }
    if (img.tags) desc += ` [tags: ${img.tags}]`;
    return desc;
  }).join('\n');

  const systemPrompt = `You are the Creative Director for a cinematic production pipeline.

You're looking at a scene's planned shots and a set of staged images that haven't been assigned to shots yet.
Analyze each staged image and determine which planned shot it best matches.

## Scene Context
${sceneContext || 'No additional scene context.'}

## Planned Shots
${shotDescriptions}

## Staged Images
${imageDescriptions}

## Rules
- Only suggest a match if you're reasonably confident (>50%)
- An image can only match ONE shot
- A shot can only receive ONE image suggestion
- If an image doesn't match any shot well, skip it
- Confidence is 0-100 (100 = perfect match)
- Consider shot type, composition, mood, subject matter, camera angle

## Output
Return ONLY valid JSON array:
[
  {
    "image_id": <number>,
    "shot_id": <number>,
    "confidence": <0-100>,
    "reasoning": "<one sentence why this matches>"
  }
]

If no matches are found, return an empty array [].`;

  const result = await callGemini({
    parts: [{ text: 'Analyze the staged images and suggest placements for the planned shots.' }],
    systemInstruction: systemPrompt,
    thinkingLevel: 'medium',
    responseMimeType: 'application/json',
    maxOutputTokens: 4096,
  });

  return JSON.parse(result);
}

/**
 * Gap Analysis — CD compares planned shots vs filled shots, identifies what's missing.
 */
async function analyzeGaps(shots, shotImages, sceneContext, projectContext) {
  const shotDetails = shots.map(s => {
    const images = shotImages[s.id] || [];
    const hasImage = images.some(v => v.image_url);
    return `Shot ${s.shot_number} (ID ${s.id}): ${s.shot_type || 'Unknown'}${s.description ? ' — ' + s.description : ''} | ${hasImage ? 'HAS IMAGE ✅' : 'EMPTY ❌'}`;
  }).join('\n');

  const systemPrompt = `You are the Creative Director for a cinematic production pipeline.

Analyze this scene's shot plan and identify gaps — missing shots, empty slots, and opportunities to strengthen the sequence.

## Scene Context
${sceneContext || 'No additional scene context.'}

## Current Shot Plan
${shotDetails}

## Your Analysis Should Include
1. Which empty shots need images most urgently (story flow)
2. Are there gaps in the sequence? (e.g., need a bridging shot between 2 and 3)
3. For each empty/missing shot, recommend which model to use and estimate cost
4. Overall coverage assessment (what % of the scene is visually complete)

## Cost Estimates (per image)
- flux-2: ~$0.03
- gpt-image-1.5: ~$0.05
- grok-imagine: ~$0.02
- kling-image-v3: ~$0.04
- nano-banana-pro: ~$0.04
- seedream-4.5: ~$0.03

## Output
Return ONLY valid JSON:
{
  "coverage_percent": <number>,
  "total_shots": <number>,
  "filled_shots": <number>,
  "empty_shots": <number>,
  "gaps": [
    {
      "shot_id": <number or null if suggesting a new shot>,
      "shot_number": "<string>",
      "description": "<what's needed>",
      "urgency": "critical" | "important" | "nice-to-have",
      "recommended_model": "<model-id>",
      "estimated_cost": "<e.g. $0.03>",
      "reasoning": "<why this matters for the scene>"
    }
  ],
  "suggested_new_shots": [
    {
      "position": "<after shot X>",
      "shot_type": "<type>",
      "description": "<what this bridging/establishing shot would be>",
      "reasoning": "<why the scene needs this>"
    }
  ],
  "total_estimated_cost": "<total to fill all gaps>",
  "summary": "<1-2 sentence overview>"
}`;

  const result = await callGemini({
    parts: [{ text: 'Perform a gap analysis on this scene.' }],
    systemInstruction: systemPrompt,
    thinkingLevel: 'medium',
    responseMimeType: 'application/json',
    maxOutputTokens: 4096,
  });

  return JSON.parse(result);
}

/**
 * Cohesion Check — CD evaluates all filled shots as a sequence for visual continuity.
 * Checks lighting, color grading, character appearance, and overall flow.
 */
async function checkCohesion(shots, shotImages, sceneContext) {
  // Only evaluate shots that have images
  const filledShots = shots.filter(s => {
    const images = shotImages[s.id] || [];
    return images.some(v => v.image_url);
  });

  if (filledShots.length < 2) {
    return {
      cohesion_score: filledShots.length === 1 ? 100 : 0,
      issues: [],
      summary: filledShots.length === 0
        ? 'No shots have images yet. Generate or assign images first.'
        : 'Only one shot has an image — need at least two to check continuity.',
      recommendations: [],
    };
  }

  const shotDescriptions = filledShots.map(s => {
    const images = shotImages[s.id] || [];
    const mainImage = images.find(v => v.image_url);
    return `Shot ${s.shot_number} (ID ${s.id}): ${s.shot_type || 'Unknown'}${s.camera_angle ? ', ' + s.camera_angle : ''}${s.description ? ' — ' + s.description : ''} | Image: ${mainImage?.image_url || 'none'}${mainImage?.prompt_used ? ' | Prompt: ' + mainImage.prompt_used : ''}`;
  }).join('\n');

  const systemPrompt = `You are the Creative Director for a cinematic production pipeline performing a COHESION CHECK.

Evaluate the filled shots in sequence as if they will be cut together in the final film. Look for visual continuity issues.

## Scene Context
${sceneContext || 'No additional scene context.'}

## Filled Shots (in sequence order)
${shotDescriptions}

## What to Evaluate
1. **Lighting continuity** — Do adjacent shots have consistent light direction, intensity, color temperature?
2. **Color grading** — Is the palette consistent? Does one shot feel warm while the next feels cold?
3. **Character appearance** — If a character appears in multiple shots, do they look consistent?
4. **Style consistency** — Same visual style across shots? (e.g., one photorealistic, one painterly)
5. **Compositional flow** — Do the shots cut well together? Eye-line matches, screen direction
6. **Mood consistency** — Does the emotional tone hold across the sequence?

## Severity Levels
- "critical" — Will break immersion (e.g., day/night mismatch between adjacent shots)
- "warning" — Noticeable but manageable (e.g., slight color temperature shift)
- "info" — Minor suggestion for polish

## Output
Return ONLY valid JSON:
{
  "cohesion_score": <0-100>,
  "issues": [
    {
      "severity": "critical" | "warning" | "info",
      "category": "lighting" | "color" | "character" | "style" | "composition" | "mood",
      "between_shots": [<shot_id_1>, <shot_id_2>],
      "description": "<what's wrong>",
      "fix_suggestion": "<how to fix it>"
    }
  ],
  "recommendations": [
    {
      "shot_id": <number>,
      "action": "regenerate" | "edit" | "color-grade" | "keep",
      "model": "<recommended model-id or null>",
      "instruction": "<what to change>"
    }
  ],
  "summary": "<2-3 sentence overview of cohesion quality>"
}`;

  const result = await callGemini({
    parts: [{ text: 'Perform a cohesion check on the filled shots in this scene.' }],
    systemInstruction: systemPrompt,
    thinkingLevel: 'medium',
    responseMimeType: 'application/json',
    maxOutputTokens: 4096,
  });

  return JSON.parse(result);
}

export { directShot, getModelRegistry, MODEL_REGISTRY, suggestPlacements, analyzeGaps, checkCohesion };
