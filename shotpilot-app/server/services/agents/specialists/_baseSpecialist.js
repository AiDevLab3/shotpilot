import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { callGemini } from '../../ai/shared.js';
import { queryKB, queryForModel } from '../../../rag/query-simple.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KB_DIR = path.resolve(__dirname, '../../../../../kb/condensed');

/**
 * Load a KB file from the condensed directory (DEPRECATED - use RAG instead).
 */
function loadKB(filename) {
  console.warn(`[DEPRECATED] loadKB(${filename}) called - consider using RAG queries instead`);
  const filePath = path.join(KB_DIR, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`KB file not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Load the translation matrix using RAG (with fallback to file).
 */
function loadTranslationMatrix() {
  try {
    // Try RAG first
    const ragResults = queryKB('translation matrix cross model', { category: 'translation' }, 10);
    if (ragResults && ragResults.length > 0) {
      console.log(`[rag] Using RAG for translation matrix (retrieved ${ragResults.length} chunks)`);
      return ragResults.map(r => r.text).join('\n\n');
    }
  } catch (error) {
    console.warn('[rag] Translation matrix RAG query failed, falling back to file:', error.message);
  }
  
  // Fallback to file
  return loadKB('04_Translation_Matrix.md');
}

/**
 * Analyze brief content to determine relevant pack categories
 */
function analyzeRelevantPacks(brief) {
  const briefText = JSON.stringify(brief).toLowerCase();
  const relevantPacks = [];
  
  // Character-related keywords
  if (briefText.includes('character') || briefText.includes('person') || briefText.includes('face') || briefText.includes('portrait')) {
    relevantPacks.push('character_consistency');
  }
  
  // Composition-related keywords
  if (briefText.includes('composition') || briefText.includes('framing') || briefText.includes('wide') || briefText.includes('close-up') || briefText.includes('angle')) {
    relevantPacks.push('spatial_composition');
  }
  
  // Motion/video keywords
  if (briefText.includes('movement') || briefText.includes('motion') || briefText.includes('camera') || briefText.includes('pan') || briefText.includes('tilt')) {
    relevantPacks.push('motion_readiness');
  }
  
  // Quality control is always relevant for image/video
  relevantPacks.push('image_quality_control', 'video_quality_control');
  
  return [...new Set(relevantPacks)]; // Remove duplicates
}

/**
 * Assemble RAG results into structured KB context
 */
function assembleKBContext(modelChunks, packChunks, translationMatrix) {
  let context = '';
  
  // Group model chunks by category
  const syntaxChunks = modelChunks.filter(c => c.metadata.category === 'syntax');
  const tipsChunks = modelChunks.filter(c => c.metadata.category === 'tips');
  const failuresChunks = modelChunks.filter(c => c.metadata.category === 'failures');
  const otherChunks = modelChunks.filter(c => !['syntax', 'tips', 'failures'].includes(c.metadata.category));
  
  // Model Syntax & Rules
  if (syntaxChunks.length > 0) {
    context += '=== Model Syntax & Rules ===\n\n';
    context += syntaxChunks.map(c => c.text).join('\n\n') + '\n\n';
  }
  
  // Known Issues & Failures
  if (failuresChunks.length > 0) {
    context += '=== Known Issues & Failures ===\n\n';
    context += failuresChunks.map(c => c.text).join('\n\n') + '\n\n';
  }
  
  // Tips & Best Practices
  if (tipsChunks.length > 0) {
    context += '=== Tips & Best Practices ===\n\n';
    context += tipsChunks.map(c => c.text).join('\n\n') + '\n\n';
  }
  
  // Other model-specific content
  if (otherChunks.length > 0) {
    context += '=== Additional Model Guidelines ===\n\n';
    context += otherChunks.map(c => c.text).join('\n\n') + '\n\n';
  }
  
  // Relevant Packs
  if (packChunks.length > 0) {
    context += '=== Relevant Packs ===\n\n';
    context += packChunks.map(c => c.text).join('\n\n') + '\n\n';
  }
  
  // Translation Matrix
  if (translationMatrix) {
    context += '=== Translation Matrix ===\n\n';
    context += translationMatrix + '\n\n';
  }
  
  return context.trim();
}

/**
 * Create a specialist function using RAG queries.
 */
function createSpecialist({ modelName, kbFile, ragModelId, extraContext = '', promptOnly = false, systemPromptOverride = null }) {
  // For backward compatibility, if ragModelId is not provided, try to use the old loadKB method
  if (!ragModelId) {
    console.warn(`[rag] No ragModelId provided for ${modelName}, falling back to file-based loading`);
    const kb = loadKB(kbFile);
    const translationMatrix = loadTranslationMatrix();

    return async function generatePrompt(brief, styleProfile, projectContext) {
      let projectBlock = '';
      if (projectContext) {
        projectBlock = `
## Project Context
This shot is part of "${projectContext.project?.name || 'a cinematic project'}".

### Characters & Gear
${projectContext.characters || 'N/A'}

### Vehicles
${projectContext.vehicles || 'N/A'}

### Visual Identity Requirements
${projectContext.visualIdentity || 'N/A'}

### Technical Standards
${projectContext.technicalStandards || 'N/A'}

Use these details to ensure accuracy — tactical gear descriptions, vehicle details, Houston landmarks, entropy requirements.
`;
      }
      
      let systemPrompt = systemPromptOverride || `You are the ${modelName} Model Specialist in a cinematic production pipeline.

## CRITICAL RULE
Only recommend techniques, parameters, and syntax that are EXPLICITLY documented in your Knowledge Base below.
If you are unsure whether ${modelName} supports a specific feature, SAY SO — do not guess or hallucinate capabilities.

## Your Knowledge Base — ${modelName}
${kb}

## Translation Matrix (cross-model rules)
${translationMatrix}

${extraContext}
${projectBlock}
## Project Style Profile
${JSON.stringify(styleProfile, null, 2)}

## Your Task
Given the Creative Director's brief, produce an optimized ${modelName} prompt that:
1. Faithfully realizes the shot intent and style profile
2. Uses ONLY syntax and techniques documented in your KB
3. Maximizes the model's documented strengths
4. Avoids the model's documented weaknesses
5. Includes negative prompt if the model supports it

## Output Format
Respond with ONLY valid JSON:
{
  "prompt": "The complete, ready-to-use prompt for ${modelName}",
  "negative_prompt": "Negative prompt if supported, null otherwise",
  "parameters": { "any model-specific parameters from KB" },
  "notes": "Any specialist notes — warnings, limitations, or suggestions",
  "confidence": 0.0-1.0
${promptOnly ? '  ,"usage_note": "This prompt must be used manually (no API integration)"' : ''}
}`;

      // If using systemPromptOverride, we need to inject dynamic values
      if (systemPromptOverride) {
        systemPrompt = systemPromptOverride
          .replace(/\$\{modelName\}/g, modelName)
          .replace(/\$\{kb\}/g, kb)
          .replace(/\$\{translationMatrix\}/g, translationMatrix)
          .replace(/\$\{extraContext\}/g, extraContext)
          .replace(/\$\{projectBlock\}/g, projectBlock)
          .replace(/\$\{styleProfile\}/g, JSON.stringify(styleProfile, null, 2))
          .replace(/\$\{promptOnly\}/g, promptOnly ? '  ,"usage_note": "This prompt must be used manually (no API integration)"' : '');
      }

      const result = await callGemini({
        parts: [{ text: `Creative Director Brief:\n${JSON.stringify(brief, null, 2)}` }],
        systemInstruction: systemPrompt,
        thinkingLevel: 'medium',
        responseMimeType: 'application/json',
        maxOutputTokens: 4096,
      });

      return JSON.parse(result);
    };
  }

  // NEW RAG-BASED PATH
  return async function generatePrompt(brief, styleProfile, projectContext) {
    try {
      // 1. Query model-specific chunks
      const modelChunks = queryForModel(ragModelId, ['syntax', 'tips', 'failures'], 25);
      
      // 2. Query relevant pack chunks based on brief content
      const relevantPackCategories = analyzeRelevantPacks(brief);
      const packChunks = queryKB(
        `${JSON.stringify(brief)} ${JSON.stringify(styleProfile)}`, 
        { category: relevantPackCategories }, 
        15
      );
      
      // 3. Load translation matrix
      const translationMatrix = loadTranslationMatrix();
      
      // 4. Assemble structured KB context
      const kb = assembleKBContext(modelChunks, packChunks, translationMatrix);
      
      const totalTokens = (modelChunks.reduce((sum, c) => sum + (c.metadata.tokens || 0), 0) + 
                          packChunks.reduce((sum, c) => sum + (c.metadata.tokens || 0), 0));
      
      console.log(`[rag] Using RAG for model: ${ragModelId} (retrieved ${modelChunks.length} model chunks + ${packChunks.length} pack chunks, ~${totalTokens} tokens)`);
      
      let projectBlock = '';
      if (projectContext) {
        projectBlock = `
## Project Context
This shot is part of "${projectContext.project?.name || 'a cinematic project'}".

### Characters & Gear
${projectContext.characters || 'N/A'}

### Vehicles
${projectContext.vehicles || 'N/A'}

### Visual Identity Requirements
${projectContext.visualIdentity || 'N/A'}

### Technical Standards
${projectContext.technicalStandards || 'N/A'}

Use these details to ensure accuracy — tactical gear descriptions, vehicle details, Houston landmarks, entropy requirements.
`;
      }

      const systemPrompt = systemPromptOverride || `You are the ${modelName} Model Specialist in a cinematic production pipeline.

## CRITICAL RULE
Only recommend techniques, parameters, and syntax that are EXPLICITLY documented in your Knowledge Base below.
If you are unsure whether ${modelName} supports a specific feature, SAY SO — do not guess or hallucinate capabilities.

## Your Knowledge Base — ${modelName}
${kb}

${extraContext}
${projectBlock}
## Project Style Profile
${JSON.stringify(styleProfile, null, 2)}

## Your Task
Given the Creative Director's brief, produce an optimized ${modelName} prompt that:
1. Faithfully realizes the shot intent and style profile
2. Uses ONLY syntax and techniques documented in your KB
3. Maximizes the model's documented strengths
4. Avoids the model's documented weaknesses
5. Includes negative prompt if the model supports it

## Output Format
Respond with ONLY valid JSON:
{
  "prompt": "The complete, ready-to-use prompt for ${modelName}",
  "negative_prompt": "Negative prompt if supported, null otherwise",
  "parameters": { "any model-specific parameters from KB" },
  "notes": "Any specialist notes — warnings, limitations, or suggestions",
  "confidence": 0.0-1.0
${promptOnly ? '  ,"usage_note": "This prompt must be used manually (no API integration)"' : ''}
}`;

      // If using systemPromptOverride, we need to inject dynamic values
      if (systemPromptOverride) {
        systemPrompt = systemPromptOverride
          .replace(/\$\{modelName\}/g, modelName)
          .replace(/\$\{kb\}/g, kb)
          .replace(/\$\{extraContext\}/g, extraContext)
          .replace(/\$\{projectBlock\}/g, projectBlock)
          .replace(/\$\{styleProfile\}/g, JSON.stringify(styleProfile, null, 2))
          .replace(/\$\{promptOnly\}/g, promptOnly ? '  ,"usage_note": "This prompt must be used manually (no API integration)"' : '');
      }

      const result = await callGemini({
        parts: [{ text: `Creative Director Brief:\n${JSON.stringify(brief, null, 2)}` }],
        systemInstruction: systemPrompt,
        thinkingLevel: 'medium',
        responseMimeType: 'application/json',
        maxOutputTokens: 4096,
      });

      return JSON.parse(result);
    } catch (error) {
      console.error(`[rag] RAG query failed for ${ragModelId}, falling back to file-based KB:`, error.message);
      // Fallback to old method
      const kb = loadKB(kbFile);
      const translationMatrix = loadTranslationMatrix();
      
      let projectBlock = '';
      if (projectContext) {
        projectBlock = `
## Project Context
This shot is part of "${projectContext.project?.name || 'a cinematic project'}".

### Characters & Gear
${projectContext.characters || 'N/A'}

### Vehicles
${projectContext.vehicles || 'N/A'}

### Visual Identity Requirements
${projectContext.visualIdentity || 'N/A'}

### Technical Standards
${projectContext.technicalStandards || 'N/A'}

Use these details to ensure accuracy — tactical gear descriptions, vehicle details, Houston landmarks, entropy requirements.
`;
      }

      let systemPrompt = systemPromptOverride || `You are the ${modelName} Model Specialist in a cinematic production pipeline.

## CRITICAL RULE
Only recommend techniques, parameters, and syntax that are EXPLICITLY documented in your Knowledge Base below.
If you are unsure whether ${modelName} supports a specific feature, SAY SO — do not guess or hallucinate capabilities.

## Your Knowledge Base — ${modelName}
${kb}

## Translation Matrix (cross-model rules)
${translationMatrix}

${extraContext}
${projectBlock}
## Project Style Profile
${JSON.stringify(styleProfile, null, 2)}

## Your Task
Given the Creative Director's brief, produce an optimized ${modelName} prompt that:
1. Faithfully realizes the shot intent and style profile
2. Uses ONLY syntax and techniques documented in your KB
3. Maximizes the model's documented strengths
4. Avoids the model's documented weaknesses
5. Includes negative prompt if the model supports it

## Output Format
Respond with ONLY valid JSON:
{
  "prompt": "The complete, ready-to-use prompt for ${modelName}",
  "negative_prompt": "Negative prompt if supported, null otherwise",
  "parameters": { "any model-specific parameters from KB" },
  "notes": "Any specialist notes — warnings, limitations, or suggestions",
  "confidence": 0.0-1.0
${promptOnly ? '  ,"usage_note": "This prompt must be used manually (no API integration)"' : ''}
}`;

      // If using systemPromptOverride, we need to inject dynamic values
      if (systemPromptOverride) {
        systemPrompt = systemPromptOverride
          .replace(/\$\{modelName\}/g, modelName)
          .replace(/\$\{kb\}/g, kb)
          .replace(/\$\{translationMatrix\}/g, translationMatrix)
          .replace(/\$\{extraContext\}/g, extraContext)
          .replace(/\$\{projectBlock\}/g, projectBlock)
          .replace(/\$\{styleProfile\}/g, JSON.stringify(styleProfile, null, 2))
          .replace(/\$\{promptOnly\}/g, promptOnly ? '  ,"usage_note": "This prompt must be used manually (no API integration)"' : '');
      }

      const result = await callGemini({
        parts: [{ text: `Creative Director Brief:\n${JSON.stringify(brief, null, 2)}` }],
        systemInstruction: systemPrompt,
        thinkingLevel: 'medium',
        responseMimeType: 'application/json',
        maxOutputTokens: 4096,
      });

      return JSON.parse(result);
    }
  };
}

export { loadKB, loadTranslationMatrix, createSpecialist, assembleKBContext, analyzeRelevantPacks };
