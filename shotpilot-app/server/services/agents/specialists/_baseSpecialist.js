import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { callGemini } from '../../ai/shared.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KB_DIR = path.resolve(__dirname, '../../../../../kb/condensed');

/**
 * Load a KB file from the condensed directory.
 */
function loadKB(filename) {
  const filePath = path.join(KB_DIR, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`KB file not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Load the translation matrix.
 */
function loadTranslationMatrix() {
  return loadKB('04_Translation_Matrix.md');
}

/**
 * Create a specialist function from a KB filename and model name.
 */
function createSpecialist({ modelName, kbFile, extraContext = '', promptOnly = false }) {
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
    const systemPrompt = `You are the ${modelName} Model Specialist in a cinematic production pipeline.

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

export { loadKB, loadTranslationMatrix, createSpecialist };
