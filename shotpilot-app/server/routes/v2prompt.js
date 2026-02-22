/**
 * Prompt Generation Route — POST /api/v2/prompt
 * Generates expert prompt for a specific model based on analysis
 */
import { Router } from 'express';
import { getModelById } from '../services/modelRegistry.js';
import { readKBFile } from '../services/kbLoader.js';
import { callGemini } from '../services/ai/shared.js';

const router = Router();

router.post('/api/v2/prompt', async (req, res) => {
  try {
    const { modelId, strategy, analysisResult, sourceImageUrl, userNotes } = req.body;

    if (!modelId) return res.status(400).json({ error: 'modelId required' });
    if (!analysisResult) return res.status(400).json({ error: 'analysisResult required' });

    const model = getModelById(modelId);
    if (!model) return res.status(400).json({ error: `Unknown model: ${modelId}` });

    // Load KB guide for this model
    let kbContent = '';
    try {
      // Try to find the main prompting guide in the model's KB dir
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      const kbRoot = path.join(__dirname, '../../kb');
      const modelDir = path.join(kbRoot, model.kbPath);
      
      if (fs.existsSync(modelDir)) {
        const files = fs.readdirSync(modelDir).filter(f => f.endsWith('.md'));
        // Load up to 3 files, preferring ones with "mastery", "guide", or "prompting" in name
        const prioritized = files.sort((a, b) => {
          const aScore = /mastery|guide|prompting/i.test(a) ? 0 : 1;
          const bScore = /mastery|guide|prompting/i.test(b) ? 0 : 1;
          return aScore - bScore;
        });
        for (const file of prioritized.slice(0, 2)) {
          const content = fs.readFileSync(path.join(modelDir, file), 'utf-8');
          kbContent += `\n--- ${file} ---\n${content.slice(0, 8000)}\n`;
        }
      }
    } catch (e) {
      console.warn(`[v2prompt] Could not load KB for ${modelId}:`, e.message);
    }

    const systemPrompt = `You are an expert AI filmmaker and prompt engineer specializing in ${model.name}. 
You have deep knowledge of this specific model's syntax, strengths, quirks, and optimal prompting patterns.

Your task: Generate a precise, production-ready prompt for ${model.name} to ${strategy === 'edit' ? 'edit/improve' : 'regenerate'} an image.

CONTEXT:
- Current image verdict: ${analysisResult.verdict} (score: ${analysisResult.score}/100)
- Issues found: ${(analysisResult.issues || []).join('; ')}
- Diagnosis: ${analysisResult.diagnosis || 'N/A'}
- Suggested fixes: ${(analysisResult.fixes || []).join('; ')}
- Strategy: ${strategy} (${strategy === 'edit' ? 'use original as reference, fix issues' : 'generate from scratch with corrected parameters'})
${userNotes ? `- User notes: ${userNotes}` : ''}

${kbContent ? `MODEL-SPECIFIC KNOWLEDGE BASE:\n${kbContent}` : ''}

RULES:
1. Follow the model's exact syntax from the KB
2. Address EVERY issue listed in the diagnosis
3. Include realism-preserving language: film grain, natural skin texture, motivated lighting
4. Avoid AI kill-words: "hyper detailed", "8K", "perfect", "flawless"
5. For edit strategy: include instructions for what to preserve vs what to change
6. Be specific about lighting direction, lens characteristics, and atmosphere
7. Output ONLY the prompt text — no explanation, no markdown, no headers

Generate the prompt now.`;

    const result = await callGemini(systemPrompt, 'Generate the expert prompt.');

    // Extract just the prompt text
    let prompt = result.trim();
    // Remove any markdown code fences if present
    prompt = prompt.replace(/^```[\s\S]*?\n/, '').replace(/\n```$/, '').trim();

    const syntaxNotes = model.active
      ? `This prompt is optimized for ${model.name} via ${model.provider === 'fal' ? 'fal.ai' : 'OpenAI'} API.`
      : `${model.name} is external-only. Copy this prompt and use it in the ${model.name} interface.`;

    res.json({ prompt, modelSyntaxNotes: syntaxNotes });
  } catch (error) {
    console.error('[v2prompt] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
