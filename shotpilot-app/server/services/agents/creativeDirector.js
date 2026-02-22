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

export { directShot, getModelRegistry, MODEL_REGISTRY };
