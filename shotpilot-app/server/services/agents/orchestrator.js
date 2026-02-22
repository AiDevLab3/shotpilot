import { loadStyleProfile } from './styleProfile.js';
import { directShot, MODEL_REGISTRY } from './creativeDirector.js';
import { auditImage, screenReference } from './qualityGate.js';
import { loadProject, getScene } from './projectContext.js';
import { pickStrategy } from './strategyPicker.js';
import { generateImage, generateGptImage, editNanoBanana, upscaleTopaz } from '../generation.js';
import path from 'path';
import fs from 'fs';

// Lazy-load specialists to avoid loading all KBs at startup
const specialists = {};
async function getSpecialist(moduleName) {
  if (!specialists[moduleName]) {
    const mod = await import(`./specialists/${moduleName}.js`);
    specialists[moduleName] = mod.generatePrompt;
  }
  return specialists[moduleName];
}

// Helper function to save base64 image to file for functions that need file paths
async function saveBase64ToFile(base64Data, prefix = 'temp') {
  const uploadsDir = path.join(process.cwd(), 'uploads', 'images');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Remove data URL prefix if present
  const base64String = base64Data.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64String, 'base64');
  
  const filename = `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
  const filepath = path.join(uploadsDir, filename);
  
  fs.writeFileSync(filepath, buffer);
  
  // Return relative path from project root
  return `uploads/images/${filename}`;
}

// Helper function to convert file path back to base64
async function fileToBase64(filepath) {
  const fullPath = path.isAbsolute(filepath) ? filepath : path.join(process.cwd(), filepath);
  const buffer = fs.readFileSync(fullPath);
  return buffer.toString('base64');
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

/**
 * Improve an existing image using the "Improve This" one-button flow
 * @param {Object} params
 * @param {string} params.imageBase64 - Base64 encoded image to improve
 * @param {Object|string} params.shotContext - Context about the shot
 * @param {string} [params.projectId] - Project ID for style profile
 * @param {number} [params.maxIterations=3] - Maximum improvement iterations
 * @returns {Promise<Object>} Improvement results with audit trail
 */
async function improveImage({ imageBase64, shotContext, projectId, maxIterations = 3 }) {
  console.log('[orchestrator:improveImage] Starting image improvement pipeline');
  
  const styleProfile = loadStyleProfile(projectId);
  const iterations = [];
  const auditTrail = [];
  let currentImage = imageBase64;
  let currentScore = 0;
  
  try {
    // Step 1: Initial QG audit
    console.log('[orchestrator:improveImage] Initial quality gate audit');
    const initialAudit = await auditImage(currentImage, shotContext, styleProfile);
    auditTrail.push({ iteration: 0, audit: initialAudit });
    currentScore = initialAudit.overall_score;
    
    console.log(`[orchestrator:improveImage] Initial score: ${currentScore}`);
    
    // Step 2: Check if already approved
    if (currentScore >= 85 && initialAudit.recommendation === 'approve') {
      console.log('[orchestrator:improveImage] Image already meets quality threshold');
      return {
        final_image: currentImage,
        final_score: currentScore,
        iterations: [],
        strategy_used: { strategy: 'no_action_needed', reasoning: 'Image already approved' },
        audit_trail: auditTrail
      };
    }
    
    let iteration = 0;
    while (iteration < maxIterations && currentScore < 85) {
      iteration++;
      console.log(`[orchestrator:improveImage] Starting iteration ${iteration}`);
      
      // Step 3: Strategy Picker determines action plan
      const strategy = await pickStrategy(
        auditTrail[auditTrail.length - 1].audit, 
        'unknown', // TODO: Track current model
        shotContext
      );
      
      if (strategy.strategy === 'no_action_needed') {
        console.log('[orchestrator:improveImage] Strategy picker says no action needed');
        break;
      }
      
      // Step 4: Execute strategy
      let iterationResult = null;
      const beforeScore = currentScore;
      
      for (const step of strategy.steps) {
        console.log(`[orchestrator:improveImage] Executing step: ${step.action} with ${step.model}`);
        
        try {
          switch (step.action) {
            case 'edit':
              if (step.model === 'gpt-image-1.5') {
                // GPT Image expects different parameters - it can work with base64 in prompt
                const editResult = await generateGptImage({
                  prompt: step.instruction,
                  useReference: true,
                  editPrompt: step.instruction,
                  numImages: 1,
                  meta: { source: 'improve-this', iteration, step: step.action }
                });
                if (editResult.images && editResult.images[0]) {
                  currentImage = await fileToBase64(editResult.images[0].localPath);
                }
              } else if (step.model === 'nano-banana-pro') {
                // Nano expects a file path
                const tempImagePath = await saveBase64ToFile(currentImage, 'nano-edit-input');
                const editResult = await editNanoBanana({
                  prompt: step.instruction,
                  imagePath: tempImagePath,
                  numImages: 1,
                  meta: { source: 'improve-this', iteration, step: step.action }
                });
                if (editResult.images && editResult.images[0]) {
                  currentImage = await fileToBase64(editResult.images[0].localPath);
                }
                // Clean up temp file
                try {
                  fs.unlinkSync(path.join(process.cwd(), tempImagePath));
                } catch (e) {
                  console.warn('[orchestrator:improveImage] Failed to clean up temp file:', e.message);
                }
              } else {
                console.warn(`[orchestrator:improveImage] Edit model ${step.model} not implemented yet`);
              }
              break;
              
            case 'upscale':
              if (step.model === 'topaz') {
                // Topaz expects file path
                const tempImagePath = await saveBase64ToFile(currentImage, 'topaz-input');
                const upscaleResult = await upscaleTopaz({
                  imagePath: tempImagePath,
                  model: 'redefine', // Best for AI-generated images
                  meta: { source: 'improve-this', iteration, step: step.action }
                });
                if (upscaleResult.images && upscaleResult.images[0]) {
                  currentImage = await fileToBase64(upscaleResult.images[0].localPath);
                }
                // Clean up temp file
                try {
                  fs.unlinkSync(path.join(process.cwd(), tempImagePath));
                } catch (e) {
                  console.warn('[orchestrator:improveImage] Failed to clean up temp file:', e.message);
                }
              }
              break;
              
            case 'regenerate':
              // For regeneration, we'd need to go through the full CD→Specialist→Generate pipeline
              console.log('[orchestrator:improveImage] Regeneration strategy would restart generation with improved prompts');
              // This would require calling generateShot with modified parameters
              // For now, we'll skip this complex case
              break;
              
            default:
              console.warn(`[orchestrator:improveImage] Unknown action: ${step.action}`);
          }
        } catch (error) {
          console.error(`[orchestrator:improveImage] Step failed:`, error);
          // Continue with next step or break
        }
      }
      
      // Step 5: Re-audit the result
      const postAudit = await auditImage(currentImage, shotContext, styleProfile);
      auditTrail.push({ iteration, audit: postAudit });
      const afterScore = postAudit.overall_score;
      currentScore = afterScore;
      
      iterationResult = {
        iteration,
        action: strategy.steps[0]?.action || 'unknown',
        model: strategy.steps[0]?.model || 'unknown',
        before_score: beforeScore,
        after_score: afterScore,
        issues_fixed: strategy.steps[0]?.target_issues || [],
        issues_remaining: postAudit.recommendation === 'approve' ? [] : ['needs_review']
      };
      
      iterations.push(iterationResult);
      
      console.log(`[orchestrator:improveImage] Iteration ${iteration} complete: ${beforeScore} → ${afterScore}`);
      
      // Early stopping if score isn't improving
      if (afterScore <= beforeScore) {
        console.log('[orchestrator:improveImage] Score not improving, stopping iterations');
        break;
      }
    }
    
    return {
      final_image: currentImage,
      final_score: currentScore,
      iterations,
      strategy_used: iterations.length > 0 ? { strategy: 'chain', reasoning: 'Multi-step improvement' } : { strategy: 'no_action_needed' },
      audit_trail: auditTrail
    };
    
  } catch (error) {
    console.error('[orchestrator:improveImage] Pipeline error:', error);
    throw error;
  }
}

/**
 * Generate-and-Iterate Pipeline: Full generation with QG feedback loop
 * @param {Object} params
 * @param {string} params.description - Shot description
 * @param {string} [params.modelPreference] - Preferred model
 * @param {string} [params.projectId] - Project ID
 * @param {string} [params.sceneId] - Scene ID
 * @param {number} [params.maxIterations=3] - Maximum iterations
 * @returns {Promise<Object>} Generation results with iteration history
 */
async function generateAndIterate({ description, modelPreference, projectId, sceneId, maxIterations = 3 }) {
  console.log('[orchestrator:generateAndIterate] Starting generate-and-iterate pipeline');
  
  const iterations = [];
  const auditTrail = [];
  let currentGeneration = null;
  let currentScore = 0;
  
  try {
    let iteration = 0;
    while (iteration < maxIterations) {
      iteration++;
      console.log(`[orchestrator:generateAndIterate] Iteration ${iteration}`);
      
      // Step 1: Generate shot (or regenerate with feedback)
      let generationParams = { description, modelPreference, projectId, sceneId };
      
      // If this is a feedback iteration, modify the description based on QG guidance
      if (iteration > 1 && auditTrail.length > 0) {
        const lastAudit = auditTrail[auditTrail.length - 1].audit;
        if (lastAudit.iteration_guidance) {
          generationParams.description = `${description}\n\nIMPROVEMENT GUIDANCE: ${lastAudit.iteration_guidance}`;
          console.log('[orchestrator:generateAndIterate] Using QG feedback for prompt revision');
        }
      }
      
      const shotResult = await generateShot(generationParams);
      
      // Step 2: If model has API, actually generate the image
      let generatedImage = null;
      const modelInfo = MODEL_REGISTRY[shotResult.creative_direction.selected_model];
      
      if (modelInfo?.hasAPI) {
        console.log(`[orchestrator:generateAndIterate] Generating image with ${modelInfo.name}`);
        const imageResult = await generateImage({
          model: shotResult.creative_direction.selected_model,
          prompt: shotResult.specialist_output.final_prompt || shotResult.specialist_output.prompt,
          meta: { source: 'generate-and-iterate', iteration }
        });
        
        if (imageResult.images && imageResult.images[0]) {
          generatedImage = imageResult.images[0].base64 || imageResult.images[0].url;
        }
      } else {
        console.log('[orchestrator:generateAndIterate] Model has no API, returning prompt only');
        break; // Can't iterate without generated image
      }
      
      if (!generatedImage) {
        console.warn('[orchestrator:generateAndIterate] No image generated, stopping iteration');
        break;
      }
      
      currentGeneration = shotResult;
      currentGeneration.generated_image = generatedImage;
      
      // Step 3: QG audit
      const styleProfile = loadStyleProfile(projectId);
      const audit = await auditImage(generatedImage, description, styleProfile);
      auditTrail.push({ iteration, audit });
      currentScore = audit.overall_score;
      
      const iterationResult = {
        iteration,
        action: 'generate',
        model: shotResult.creative_direction.selected_model,
        score: currentScore,
        recommendation: audit.recommendation,
        issues: audit.iteration_guidance || 'No specific issues identified'
      };
      
      iterations.push(iterationResult);
      
      console.log(`[orchestrator:generateAndIterate] Iteration ${iteration} score: ${currentScore} (${audit.recommendation})`);
      
      // Step 4: Check if approved
      if (currentScore >= 85 && audit.recommendation === 'approve') {
        console.log('[orchestrator:generateAndIterate] Image approved, stopping iteration');
        break;
      }
    }
    
    return {
      final_generation: currentGeneration,
      final_score: currentScore,
      iterations,
      audit_trail: auditTrail,
      total_iterations: iterations.length
    };
    
  } catch (error) {
    console.error('[orchestrator:generateAndIterate] Pipeline error:', error);
    throw error;
  }
}

export { generateShot, generateScene, auditGeneratedImage, screenReferenceImage, improveImage, generateAndIterate };
