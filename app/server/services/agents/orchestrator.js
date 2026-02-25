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

  // Log model and prompt used for tracking (Boss Man's spec)
  console.log(`[orchestrator:generateShot] Model used: ${modelId} (${modelInfo.name})`);
  console.log(`[orchestrator:generateShot] Prompt: ${specialistResult.final_prompt || specialistResult.prompt}`);

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
 * DEPRECATED - Use analyzeAndRecommend + executeImprovement instead
 * Legacy function kept for backward compatibility
 */
async function improveImage({ imageBase64, shotContext, projectId, maxIterations = 3 }) {
  console.warn('[orchestrator:improveImage] DEPRECATED - Use analyzeAndRecommend + executeImprovement for user-in-the-loop workflow');
  
  // For backward compatibility, run a single analyze-execute cycle
  const analysis = await analyzeAndRecommend(imageBase64, shotContext, projectId);
  
  if (analysis.recommendation.verdict === 'approve') {
    return {
      final_image: imageBase64,
      final_score: analysis.audit.overall_score,
      iterations: [],
      strategy_used: { strategy: 'no_action_needed', reasoning: 'Image already approved' },
      audit_trail: [{ iteration: 0, audit: analysis.audit }]
    };
  }
  
  // If improvement recommended, execute one step with the suggested model
  const improvement = await executeImprovement(
    imageBase64,
    analysis.recommendation.cd_recommendation.suggested_model,
    analysis.recommendation.strategy.steps?.[0]?.instruction || 'Improve image quality',
    shotContext,
    projectId
  );
  
  return {
    final_image: improvement.result_image,
    final_score: improvement.after_score,
    iterations: [{
      iteration: 1,
      action: 'improve',
      model: improvement.model_used,
      before_score: improvement.before_score,
      after_score: improvement.after_score,
      issues_fixed: [],
      issues_remaining: improvement.audit.recommendation === 'approve' ? [] : ['needs_review']
    }],
    strategy_used: analysis.recommendation.strategy,
    audit_trail: [
      { iteration: 0, audit: analysis.audit },
      { iteration: 1, audit: improvement.audit }
    ]
  };
}

/**
 * NEW: Analyze image and provide recommendations without executing (user-in-the-loop step 1)
 * @param {string} imageBase64 - Base64 encoded image to analyze
 * @param {string|Object} shotContext - Context about the shot
 * @param {string} [projectId] - Project ID for style profile
 * @returns {Promise<Object>} Analysis and recommendations
 */
async function analyzeAndRecommend(imageBase64, shotContext, projectId) {
  console.log('[orchestrator:analyzeAndRecommend] Starting analysis and recommendation pipeline');
  
  const styleProfile = loadStyleProfile(projectId);
  
  try {
    // Step 1: QG audits the image
    console.log('[orchestrator:analyzeAndRecommend] Quality gate audit');
    const audit = await auditImage(imageBase64, shotContext, styleProfile);
    
    // Step 2: Determine verdict based on QG results (overall_score is 1-10 scale)
    let verdict = 'approve';
    if (audit.overall_score < 8.0 || audit.recommendation !== 'approve') {
      verdict = audit.overall_score < 4.0 ? 'regenerate' : 'improve';
    }
    
    // Step 3: Strategy Picker analyzes issues and recommends improvements
    let strategy = { strategy: 'no_action_needed', reasoning: 'Image already approved' };
    let cdRecommendation = null;
    
    if (verdict !== 'approve') {
      console.log('[orchestrator:analyzeAndRecommend] Getting strategy recommendations');
      strategy = await pickStrategy(audit, 'unknown', shotContext);
      
      // Step 4: CD recommends model based on the issues and strategy
      cdRecommendation = await recommendModelForImprovement(strategy, audit);
    }
    
    // Step 5: Estimate cost (rough calculation)
    const estimatedCost = estimateActionCost(verdict, strategy);
    
    return {
      audit,
      recommendation: {
        verdict,
        cd_recommendation: cdRecommendation,
        strategy,
        estimated_cost: estimatedCost
      }
    };
    
  } catch (error) {
    console.error('[orchestrator:analyzeAndRecommend] Pipeline error:', error);
    throw error;
  }
}

/**
 * NEW: Execute one improvement step chosen by user (user-in-the-loop step 2)
 * @param {string} imageBase64 - Base64 encoded image to improve
 * @param {string} modelId - User-chosen model ID
 * @param {string} [instruction] - Optional custom instruction
 * @param {string|Object} shotContext - Context about the shot
 * @param {string} [projectId] - Project ID for style profile
 * @returns {Promise<Object>} Execution results with new audit
 */
async function executeImprovement(imageBase64, modelId, instruction, shotContext, projectId) {
  console.log(`[orchestrator:executeImprovement] Executing improvement with model: ${modelId}`);
  
  const styleProfile = loadStyleProfile(projectId);
  
  try {
    // Step 1: Get initial audit for before score
    const beforeAudit = await auditImage(imageBase64, shotContext, styleProfile);
    const beforeScore = beforeAudit.overall_score;
    
    // Step 2: Get model info and specialist
    const modelInfo = MODEL_REGISTRY[modelId];
    if (!modelInfo) {
      throw new Error(`Unknown model: ${modelId}`);
    }
    
    let resultImage = imageBase64;
    let promptUsed = instruction || 'Improve image quality';
    
    // Step 3: If model has specialist, get proper prompt
    if (modelInfo.specialistModule) {
      console.log('[orchestrator:executeImprovement] Getting specialist prompt');
      const specialist = await getSpecialist(modelInfo.specialistModule);
      const specialistResult = await specialist(instruction || shotContext, styleProfile);
      promptUsed = specialistResult.final_prompt || specialistResult.prompt;
    }
    
    // Step 4: Execute the generation/edit based on model capabilities
    if (modelInfo.hasAPI) {
      console.log(`[orchestrator:executeImprovement] Generating with ${modelInfo.name}`);
      
      if (modelId === 'gpt-image-1.5') {
        const editResult = await generateGptImage({
          prompt: promptUsed,
          useReference: true,
          editPrompt: promptUsed,
          numImages: 1,
          meta: { source: 'execute-improvement', model: modelId }
        });
        if (editResult.images && editResult.images[0]) {
          resultImage = await fileToBase64(editResult.images[0].localPath);
        }
      } else if (modelId === 'nano-banana-pro') {
        const tempImagePath = await saveBase64ToFile(imageBase64, 'execute-improvement-input');
        const editResult = await editNanoBanana({
          prompt: promptUsed,
          imagePath: tempImagePath,
          numImages: 1,
          meta: { source: 'execute-improvement', model: modelId }
        });
        if (editResult.images && editResult.images[0]) {
          resultImage = await fileToBase64(editResult.images[0].localPath);
        }
        // Clean up temp file
        try {
          fs.unlinkSync(path.join(process.cwd(), tempImagePath));
        } catch (e) {
          console.warn('[orchestrator:executeImprovement] Failed to clean up temp file:', e.message);
        }
      } else {
        // Standard generation API
        const genResult = await generateImage({
          model: modelId,
          prompt: promptUsed,
          meta: { source: 'execute-improvement', model: modelId }
        });
        if (genResult.images && genResult.images[0]) {
          resultImage = genResult.images[0].base64 || await fileToBase64(genResult.images[0].localPath);
        }
      }
    } else {
      console.log(`[orchestrator:executeImprovement] Model ${modelId} has no API - returning prompt only`);
      // For models without API, we can't actually generate, just return the improved prompt
    }
    
    // Step 5: QG audit the result
    const afterAudit = await auditImage(resultImage, shotContext, styleProfile);
    const afterScore = afterAudit.overall_score;
    
    // Step 6: Generate next recommendation
    let nextRecommendation = null;
    if (afterScore < 85 || afterAudit.recommendation !== 'approve') {
      const nextStrategy = await pickStrategy(afterAudit, modelId, shotContext);
      const nextCdRec = await recommendModelForImprovement(nextStrategy, afterAudit);
      nextRecommendation = {
        verdict: afterScore < 60 ? 'regenerate' : 'improve',
        cd_recommendation: nextCdRec,
        strategy: nextStrategy,
        estimated_cost: estimateActionCost(afterScore < 60 ? 'regenerate' : 'improve', nextStrategy)
      };
    }
    
    console.log(`[orchestrator:executeImprovement] Improvement complete: ${beforeScore} → ${afterScore}`);
    
    return {
      result_image: resultImage,
      model_used: modelId,
      prompt_used: promptUsed,
      before_score: beforeScore,
      after_score: afterScore,
      audit: afterAudit,
      recommendation: nextRecommendation
    };
    
  } catch (error) {
    console.error('[orchestrator:executeImprovement] Pipeline error:', error);
    throw error;
  }
}

/**
 * Helper: Recommend model for improvement based on strategy and audit
 */
async function recommendModelForImprovement(strategy, audit) {
  const { directShot } = await import('./creativeDirector.js');
  
  // Create a brief description of what needs to be fixed
  const issues = audit.feedback_summary || 'General quality improvements needed';
  const fixDescription = `Fix these issues: ${issues}`;
  
  // Use Creative Director to recommend model (simplified call)
  try {
    const cdResult = await directShot(fixDescription, null, null, null);
    
    // Never recommend a utility model (Topaz) as primary for generate/edit
    const utilityIds = ['topaz'];
    let suggestedModel = cdResult.selected_model;
    let reasoning = cdResult.model_reasoning || `Recommended for ${strategy.strategy} action`;
    
    if (utilityIds.includes(suggestedModel)) {
      // Pick from strategy steps instead, or fall back to best generator
      if (strategy.steps?.length > 0) {
        const firstNonUtility = strategy.steps.find(s => !utilityIds.includes(s.model));
        if (firstNonUtility) suggestedModel = firstNonUtility.model;
      }
      // Still utility? Default to flux-2
      if (utilityIds.includes(suggestedModel)) suggestedModel = 'flux-2';
      
      // Update reasoning to match the new model selection
      const modelInfo = MODEL_REGISTRY[suggestedModel];
      if (modelInfo) {
        reasoning = `${modelInfo.name} selected for ${strategy.strategy} - ${modelInfo.strengths.join(', ')}`;
      }
    }
    
    // Get alternative models — image models for editing, exclude utilities from alternatives
    const alternativeModels = Object.entries(MODEL_REGISTRY)
      .filter(([id, model]) => model.hasAPI && id !== suggestedModel && !utilityIds.includes(id))
      .slice(0, 2)
      .map(([id, model]) => ({
        id,
        reasoning: `${model.name} - ${model.strengths.join(', ')}`
      }));
    
    return {
      suggested_model: suggestedModel,
      reasoning: reasoning,
      alternative_models: alternativeModels
    };
  } catch (error) {
    console.warn('[orchestrator:recommendModelForImprovement] CD error, using fallback:', error.message);
    
    // Fallback to sensible defaults based on strategy
    const fallbackModel = strategy.strategy === 'upscale' ? 'topaz' : 
                         strategy.strategy === 'edit' ? 'nano-banana-pro' : 'midjourney-6';
    
    return {
      suggested_model: fallbackModel,
      reasoning: 'Fallback recommendation based on improvement strategy',
      alternative_models: [
        { id: 'flux-pro', reasoning: 'High-quality generation alternative' },
        { id: 'dalle-3-hd', reasoning: 'Reliable editing and refinement' }
      ]
    };
  }
}

/**
 * Helper: Estimate rough cost for an action
 */
function estimateActionCost(verdict, strategy) {
  const baseCosts = {
    approve: '$0',
    improve: '$0.20-0.50',
    regenerate: '$0.30-0.80'
  };
  
  const multiplier = strategy?.steps?.length > 1 ? ' (multi-step)' : '';
  return baseCosts[verdict] + multiplier;
}

/**
 * NEW: Generate image once and audit it, return result + recommendation (no auto-loop)
 * @param {Object} params
 * @param {string} params.description - Shot description
 * @param {string} [params.modelPreference] - Preferred model
 * @param {string} [params.projectId] - Project ID
 * @param {string} [params.sceneId] - Scene ID
 * @returns {Promise<Object>} Generation result with audit and recommendations
 */
async function generateWithAudit({ description, modelPreference, projectId, sceneId }) {
  console.log('[orchestrator:generateWithAudit] Starting single generation with audit');
  
  try {
    // Step 1: Generate shot using existing pipeline
    const shotResult = await generateShot({ description, modelPreference, projectId, sceneId });
    
    // Step 2: If model has API, actually generate the image
    let generatedImage = null;
    const modelInfo = MODEL_REGISTRY[shotResult.creative_direction.selected_model];
    const modelUsed = shotResult.creative_direction.selected_model;
    const promptUsed = shotResult.specialist_output.final_prompt || shotResult.specialist_output.prompt;
    
    if (modelInfo?.hasAPI) {
      console.log(`[orchestrator:generateWithAudit] Generating image with ${modelInfo.name}`);
      const imageResult = await generateImage({
        model: modelUsed,
        prompt: promptUsed,
        meta: { source: 'generate-with-audit' }
      });
      
      if (imageResult.images && imageResult.images[0]) {
        generatedImage = imageResult.images[0].base64 || await fileToBase64(imageResult.images[0].localPath);
      }
    } else {
      console.log('[orchestrator:generateWithAudit] Model has no API, returning prompt only');
      return {
        generation: shotResult,
        model_used: modelUsed,
        prompt_used: promptUsed,
        generated_image: null,
        audit: null,
        recommendation: {
          verdict: 'manual_generation_required',
          message: `Use the generated prompt with ${modelInfo.name} manually`
        }
      };
    }
    
    if (!generatedImage) {
      throw new Error('Image generation failed');
    }
    
    // Step 3: QG audit the generated image
    const styleProfile = loadStyleProfile(projectId);
    const audit = await auditImage(generatedImage, description, styleProfile);
    
    // Step 4: Generate recommendation for next steps
    let recommendation = null;
    if (audit.overall_score < 85 || audit.recommendation !== 'approve') {
      const strategy = await pickStrategy(audit, modelUsed, description);
      const cdRecommendation = await recommendModelForImprovement(strategy, audit);
      
      recommendation = {
        verdict: audit.overall_score < 60 ? 'regenerate' : 'improve',
        cd_recommendation: cdRecommendation,
        strategy,
        estimated_cost: estimateActionCost(audit.overall_score < 60 ? 'regenerate' : 'improve', strategy)
      };
    } else {
      recommendation = {
        verdict: 'approve',
        message: 'Image meets quality standards'
      };
    }
    
    console.log(`[orchestrator:generateWithAudit] Generation complete, score: ${audit.overall_score} (${audit.recommendation})`);
    
    return {
      generation: shotResult,
      model_used: modelUsed,
      prompt_used: promptUsed,
      generated_image: generatedImage,
      audit,
      recommendation
    };
    
  } catch (error) {
    console.error('[orchestrator:generateWithAudit] Pipeline error:', error);
    throw error;
  }
}

/**
 * DEPRECATED - Use generateWithAudit instead
 * Legacy function kept for backward compatibility
 */
async function generateAndIterate({ description, modelPreference, projectId, sceneId, maxIterations = 3 }) {
  console.warn('[orchestrator:generateAndIterate] DEPRECATED - Use generateWithAudit for user-in-the-loop workflow');
  
  // For backward compatibility, generate once and audit
  const result = await generateWithAudit({ description, modelPreference, projectId, sceneId });
  
  // Format in old structure
  return {
    final_generation: {
      ...result.generation,
      generated_image: result.generated_image
    },
    final_score: result.audit?.overall_score || 0,
    iterations: [{
      iteration: 1,
      action: 'generate',
      model: result.model_used,
      score: result.audit?.overall_score || 0,
      recommendation: result.audit?.recommendation || 'unknown',
      issues: result.audit?.feedback_summary || 'No audit available'
    }],
    audit_trail: result.audit ? [{ iteration: 1, audit: result.audit }] : [],
    total_iterations: 1
  };
}

/**
 * NEW: Import an image and log its metadata (user-in-the-loop step 1)
 * @param {Object} params
 * @param {string} params.imageBase64 - Base64 encoded image to import
 * @param {string} [params.sourceModel] - Model that generated this image
 * @param {string} [params.sourcePrompt] - Prompt used to generate this image
 * @param {string|Object} [params.shotContext] - Context about the shot
 * @param {string} [params.projectId] - Project ID for style profile
 * @returns {Promise<Object>} Import result with audit and recommendations
 */
async function importImage({ imageBase64, sourceModel, sourcePrompt, shotContext, projectId }) {
  console.log('[orchestrator:importImage] Importing image with metadata tracking');
  
  try {
    // Log metadata for tracking (Boss Man's spec)
    if (sourceModel) {
      console.log(`[orchestrator:importImage] Source model: ${sourceModel}`);
    }
    if (sourcePrompt) {
      console.log(`[orchestrator:importImage] Source prompt: ${sourcePrompt}`);
    }
    
    // Save image to file system for future reference
    const savedPath = await saveBase64ToFile(imageBase64, 'imported');
    console.log(`[orchestrator:importImage] Saved imported image to: ${savedPath}`);
    
    // Run QG audit on imported image
    const styleProfile = loadStyleProfile(projectId);
    const audit = await auditImage(imageBase64, shotContext || 'Imported image', styleProfile);
    
    // Generate recommendations for next steps
    let recommendation = null;
    if (audit.overall_score < 85 || audit.recommendation !== 'approve') {
      const strategy = await pickStrategy(audit, sourceModel || 'unknown', shotContext || 'Imported image');
      const cdRecommendation = await recommendModelForImprovement(strategy, audit);
      
      recommendation = {
        verdict: audit.overall_score < 60 ? 'regenerate' : 'improve',
        cd_recommendation: cdRecommendation,
        strategy,
        estimated_cost: estimateActionCost(audit.overall_score < 60 ? 'regenerate' : 'improve', strategy)
      };
    } else {
      recommendation = {
        verdict: 'approve',
        message: 'Imported image meets quality standards'
      };
    }
    
    console.log(`[orchestrator:importImage] Import complete, score: ${audit.overall_score} (${audit.recommendation})`);
    
    return {
      imported_image: imageBase64,
      source_metadata: {
        model: sourceModel || 'unknown',
        prompt: sourcePrompt || 'unknown',
        imported_at: new Date().toISOString(),
        saved_path: savedPath
      },
      audit,
      recommendation
    };
    
  } catch (error) {
    console.error('[orchestrator:importImage] Import error:', error);
    throw error;
  }
}

export { 
  generateShot, 
  generateScene, 
  auditGeneratedImage, 
  screenReferenceImage, 
  improveImage, 
  generateAndIterate,
  // New user-in-the-loop functions
  analyzeAndRecommend,
  executeImprovement,
  generateWithAudit,
  importImage
};
