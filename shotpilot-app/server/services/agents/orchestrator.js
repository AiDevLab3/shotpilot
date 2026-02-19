import { loadStyleProfile } from './styleProfile.js';
import { directShot, MODEL_REGISTRY } from './creativeDirector.js';
import { auditImage, screenReference } from './qualityGate.js';
import { loadProject, getScene } from './projectContext.js';

// Lazy-load specialists to avoid loading all KBs at startup
const specialists = {};
async function getSpecialist(moduleName) {
  if (!specialists[moduleName]) {
    const mod = await import(`./specialists/${moduleName}.js`);
    specialists[moduleName] = mod.generatePrompt;
  }
  return specialists[moduleName];
}

/**
 * Full shot generation pipeline:
 * User request → Creative Director → Model Specialist → prompt output
 */
async function generateShot({ description, modelPreference, projectId, sceneId }) {
  let projectContext = null;
  let styleProfile;

  if (projectId) {
    // Load full project context
    projectContext = loadProject(projectId);
    styleProfile = projectContext.styleProfile;

    // If a scene is specified, load its details
    if (sceneId) {
      const { scene } = getScene(projectId, sceneId);
      projectContext.activeScene = scene;
      // If no user description, build one from the scene
      if (!description) {
        description = `Scene ${scene.number}: ${scene.name}\n${scene.description}`;
      }
    }
  } else {
    styleProfile = loadStyleProfile(projectId);
  }

  // Step 1: Creative Director interprets and selects model
  const cdResult = await directShot(description, styleProfile, modelPreference, projectContext);

  // Step 2: Route to appropriate specialist
  const modelId = cdResult.selected_model;
  const modelInfo = MODEL_REGISTRY[modelId];
  if (!modelInfo) {
    throw new Error(`Unknown model selected by CD: ${modelId}`);
  }

  const specialist = await getSpecialist(modelInfo.specialistModule);
  const specialistResult = await specialist(cdResult.brief, styleProfile, projectContext);

  return {
    creative_direction: {
      selected_model: modelId,
      model_name: modelInfo.name,
      has_api: modelInfo.hasAPI,
      reasoning: cdResult.model_reasoning,
      brief: cdResult.brief,
    },
    specialist_output: specialistResult,
    style_profile: { id: styleProfile.id, name: styleProfile.name },
    ...(projectContext?.activeScene ? { scene: projectContext.activeScene } : {}),
  };
}

/**
 * Convenience: generate a shot for a specific project scene.
 */
async function generateScene({ projectId, sceneId, overrides, modelPreference }) {
  return generateShot({
    description: overrides || null,
    modelPreference,
    projectId: projectId || 'tcpw-dark-knight',
    sceneId,
  });
}

/**
 * Audit a generated image.
 */
async function auditGeneratedImage(imageBase64, shotContext, projectId) {
  const styleProfile = loadStyleProfile(projectId);
  return auditImage(imageBase64, shotContext, styleProfile);
}

/**
 * Pre-screen a reference image.
 */
async function screenReferenceImage(imageBase64) {
  return screenReference(imageBase64);
}

export { generateShot, generateScene, auditGeneratedImage, screenReferenceImage };
