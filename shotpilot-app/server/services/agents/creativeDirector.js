import { callGemini } from '../ai/shared.js';

/**
 * Available models with their strengths and API availability.
 */
const MODEL_REGISTRY = {
  'nano-banana-pro': {
    name: 'Nano Banana Pro',
    specialistModule: 'nanoBananaPro',
    strengths: ['environments', 'landscapes', 'architectural', 'lighting'],
    weaknesses: ['character faces at close range'],
    hasAPI: true,
    description: 'Fast, high-quality environment and scene generation. Strong lighting control.',
  },
  'gpt-image': {
    name: 'GPT Image (DALL-E)',
    specialistModule: 'gptImage',
    strengths: ['characters', 'objects', 'text rendering', 'instruction following', 'composition'],
    weaknesses: ['photorealism at extreme detail'],
    hasAPI: true,
    description: 'Excellent instruction following, strong character work, reliable composition.',
  },
  'flux-2': {
    name: 'Flux 2',
    specialistModule: 'flux2',
    strengths: ['photorealism', 'textures', 'cinematic lighting', 'environments', 'characters'],
    weaknesses: ['text rendering'],
    hasAPI: true,
    description: 'Top-tier photorealism. Excellent for cinematic stills.',
  },
  'midjourney': {
    name: 'Midjourney',
    specialistModule: 'midjourney',
    strengths: ['artistic quality', 'cinematic mood', 'environments', 'characters', 'composition'],
    weaknesses: ['precise instruction following', 'text rendering'],
    hasAPI: false,
    description: 'Best aesthetic quality. Prompt-only output (use via Discord/web).',
  },
  'higgsfield': {
    name: 'Higgsfield Cinema Studio',
    specialistModule: 'higgsfieldGuide',
    strengths: ['camera motion', 'video generation', 'cinematic movement'],
    weaknesses: ['static images'],
    hasAPI: false,
    description: 'Camera control guidance for video generation. Not an image generator.',
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
