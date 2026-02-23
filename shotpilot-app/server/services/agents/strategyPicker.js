import { callGemini } from '../ai/shared.js';
import { MODEL_REGISTRY } from './creativeDirector.js';
import { queryForModel, queryKB } from '../../rag/query-simple.js';

/**
 * Strategy Picker - The brain of "Improve This"
 * Analyzes QG audit results and picks the optimal improvement strategy
 */

function buildStrategySystemPrompt() {
  const modelCapabilities = Object.entries(MODEL_REGISTRY).map(([id, model]) => {
    return `### ${model.name} (${id})
**Strengths:** ${model.strengths.join(', ')}
**Weaknesses:** ${model.weaknesses.join(', ')}
**Has API:** ${model.hasAPI}
**Type:** ${model.hasAPI ? 'Available for automated use' : 'Manual/Discord only'}
**Best for:** ${model.description}`;
  }).join('\n\n');

  return `You are the Strategy Picker AI for ShotPilot's "Improve This" system.

## Your Role
Analyze Quality Gate audit results and determine the optimal improvement strategy. You have deep knowledge of each model's editing capabilities and know which tools can fix specific problems.

## Available Models & Their Capabilities
${modelCapabilities}

## Strategy Logic (Your Expert Knowledge)

### Issue-to-Solution Mapping:
- **Waxy/plastic skin** → Edit with GPT Image 1.5 (conversational edit: "make skin texture more realistic with visible pores") or Nano Banana Pro (edit mode)
- **Flat lighting** → Re-generate with same model but adjusted prompt (lighting-specific revision) 
- **Composition issues** → Re-generate (can't fix composition in editing)
- **Text rendering problems** → Re-generate with Seedream 4.5 (best text model)
- **Low resolution / soft details** → Topaz upscale (Redefine model for AI-generated images)
- **Color grading off** → Edit with Reve (color/grade changes) or Flux Kontext
- **AI artifacts** → Edit with GPT Image 1.5 (targeted cleanup) or re-generate
- **Character inconsistency** → Re-generate with model that has reference support (Kling O3, Nano, Midjourney --oref)
- **Style mismatch** → Reve Remix (style transformation)
- **Multiple issues** → Chain: fix content issues first, then upscale last

### Strategy Types:
- **edit**: Use editing models to fix specific issues without changing core composition
- **regenerate**: Start over with better prompting/model selection
- **upscale**: Use Topaz to enhance resolution/details
- **chain**: Multiple steps in sequence (fix content first, enhance last)

### Decision Rules:
1. If overall_score >= 85 and recommendation === 'approve' → return "no_action_needed"
2. Prioritize models with APIs (hasAPI: true) for automation
3. For multiple issues, chain operations: content fixes → upscaling last
4. Consider the current model - if it was wrong choice, regenerate with better model
5. Estimate realistic score improvements (don't overestimate)

## Output Format
Return ONLY valid JSON matching this exact structure:
{
  "strategy": "edit" | "regenerate" | "upscale" | "chain" | "no_action_needed",
  "reasoning": "Brief explanation of why this approach was chosen",
  "steps": [
    {
      "action": "edit" | "regenerate" | "upscale" | "remix",
      "model": "model-id from registry",
      "instruction": "Specific instruction for the model/specialist",
      "target_issues": ["issue1", "issue2"],
      "estimated_improvement": "Expected score delta (+10, +5, etc)"
    }
  ],
  "expected_final_score": 85,
  "max_iterations": 2,
  "confidence": "high" | "medium" | "low"
}

If no action is needed, return:
{
  "strategy": "no_action_needed",
  "reasoning": "Image already meets quality threshold",
  "steps": [],
  "expected_final_score": 88,
  "max_iterations": 0,
  "confidence": "high"
}`;
}

/**
 * Analyze QG audit results and determine optimal improvement strategy
 * @param {Object} auditResult - Quality Gate audit results
 * @param {string} currentModel - The model that generated the current image
 * @param {Object} shotContext - Context about the shot/scene
 * @returns {Promise<Object>} Strategy plan
 */
export async function pickStrategy(auditResult, currentModel, shotContext) {
  console.log('[strategyPicker] Analyzing audit results for improvement strategy');

  // Enrich with RAG context about the current model and potential fix approaches
  let ragContext = '';
  try {
    // Get model-specific knowledge for the current model
    const modelRAGId = currentModel?.replace(/-/g, '_');
    if (modelRAGId) {
      const modelChunks = queryForModel(modelRAGId, ['editing', 'quality', 'limitations'], 5);
      if (modelChunks.length > 0) {
        ragContext += `\n## RAG: Current Model Knowledge (${currentModel})\n${modelChunks.map(c => c.text).join('\n')}\n`;
      }
    }

    // Get general improvement technique knowledge
    const issueTypes = [];
    if (auditResult.ai_artifacts?.score < 7) issueTypes.push('artifact removal');
    if (auditResult.realism?.score < 7) issueTypes.push('realism improvement skin texture');
    if (auditResult.style_match?.score < 7) issueTypes.push('style matching color grading');
    
    if (issueTypes.length > 0) {
      const techniqueChunks = queryKB(issueTypes.join(' '), { category: ['editing', 'quality', 'pack'] }, 5);
      if (techniqueChunks.length > 0) {
        ragContext += `\n## RAG: Improvement Techniques\n${techniqueChunks.map(c => c.text).join('\n')}\n`;
      }
    }
    
    if (ragContext) console.log('[strategyPicker] RAG context enriched with model + technique knowledge');
  } catch (err) {
    console.warn('[strategyPicker] RAG enrichment failed (non-critical):', err.message);
  }

  const prompt = `## Current Quality Gate Audit Results
${JSON.stringify(auditResult, null, 2)}

## Current Model Used
${currentModel} (${MODEL_REGISTRY[currentModel]?.name || 'Unknown'})

## Shot Context
${typeof shotContext === 'string' ? shotContext : JSON.stringify(shotContext, null, 2)}

Analyze these results and determine the optimal improvement strategy. Focus on the specific issues identified and recommend the most effective approach to fix them.
${ragContext}`;

  const result = await callGemini({
    parts: [{ text: prompt }],
    systemInstruction: buildStrategySystemPrompt(),
    thinkingLevel: 'medium',
    responseMimeType: 'application/json',
    maxOutputTokens: 2048,
  });

  let strategy;
  try {
    strategy = JSON.parse(result);
  } catch (error) {
    console.error('[strategyPicker] Failed to parse strategy JSON:', error);
    // Fallback strategy
    strategy = {
      strategy: 'edit',
      reasoning: 'Failed to parse AI response, using fallback edit strategy',
      steps: [{
        action: 'edit',
        model: 'gpt-image-1.5',
        instruction: 'Improve overall image quality and realism',
        target_issues: ['general_improvement'],
        estimated_improvement: '+10'
      }],
      expected_final_score: Math.min(auditResult.overall_score + 10, 100),
      max_iterations: 2,
      confidence: 'low'
    };
  }

  // Validate strategy has required fields
  if (!strategy.strategy || !Array.isArray(strategy.steps)) {
    console.error('[strategyPicker] Invalid strategy format, using fallback');
    strategy = {
      strategy: 'edit',
      reasoning: 'Invalid AI response format, using fallback',
      steps: [{
        action: 'edit',
        model: 'gpt-image-1.5',
        instruction: 'Improve overall image quality and realism',
        target_issues: ['general_improvement'],
        estimated_improvement: '+10'
      }],
      expected_final_score: Math.min(auditResult.overall_score + 10, 100),
      max_iterations: 2,
      confidence: 'low'
    };
  }

  console.log(`[strategyPicker] Strategy: ${strategy.strategy}, Expected improvement: ${auditResult.overall_score} → ${strategy.expected_final_score}`);
  
  return strategy;
}