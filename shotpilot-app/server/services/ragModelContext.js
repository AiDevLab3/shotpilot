import { queryForModel, queryKB, getStats } from '../rag/query-simple.js';

/**
 * Build a model registry context string from RAG for injection into analysis prompts
 * Returns a formatted string describing all available models with their actual strengths
 */
export async function getModelRegistryContext() {
  // Query RAG for each Tier 1 model's key characteristics
  const tier1Models = [
    { id: 'flux-2', ragId: 'flux_2', name: 'FLUX.2' },
    { id: 'flux-kontext', ragId: 'flux_kontext', name: 'FLUX.1 Kontext' },
    { id: 'gpt-image-1.5', ragId: 'gpt_image_1_5', name: 'GPT Image 1.5' },
    { id: 'grok-imagine', ragId: 'grok_imagine', name: 'Grok Imagine' },
    { id: 'kling-image-v3', ragId: 'kling_image_v3', name: 'Kling Image V3/O3' },
    { id: 'midjourney', ragId: 'midjourney', name: 'Midjourney V7' },
    { id: 'nano-banana-pro', ragId: 'nano_banana_pro', name: 'Nano Banana Pro' },
    { id: 'reve', ragId: 'reve', name: 'Reve' },
    { id: 'seedream-4.5', ragId: 'seedream_4_5', name: 'Seedream 4.5' },
    { id: 'topaz', ragId: 'topaz', name: 'Topaz AI (utility)' },
  ];

  let context = 'AVAILABLE MODELS (with expert knowledge from knowledge base):\n\n';
  
  for (const model of tier1Models) {
    // Get the model's key characteristics from RAG
    const chunks = queryForModel(model.ragId, ['syntax', 'tips', 'failures'], 3);
    const strengths = chunks.map(c => c.text).join(' ').substring(0, 300);
    
    context += `### ${model.name} (id: ${model.id})\n`;
    context += `${strengths}\n\n`;
  }
  
  return context;
}

/**
 * Build issue-specific model recommendations
 * Given specific image issues, query RAG for which models handle them best
 */
export async function getIssueModelMapping(issues) {
  // Map common issues to RAG queries
  const issueQueries = {
    'waxy skin': 'fix waxy skin texture realistic pores',
    'lighting': 'lighting correction photorealistic',
    'text rendering': 'text typography rendering',
    'composition': 'composition framing',
    'artifacts': 'reduce AI artifacts synthetic look',
    'upscale': 'upscale enhance resolution',
    'character consistency': 'character consistency face preservation',
    'style mismatch': 'style transfer aesthetic',
  };
  
  // For each issue, find which model chunks are most relevant
  const recommendations = {};
  for (const issue of issues) {
    const queryText = issueQueries[issue.toLowerCase()] || issue;
    const results = queryKB(queryText, {}, 5);
    // Group by model, find which model appears most
    const modelCounts = {};
    for (const r of results) {
      const model = r.metadata?.model || 'general';
      if (model !== 'general') {
        modelCounts[model] = (modelCounts[model] || 0) + 1;
      }
    }
    recommendations[issue] = Object.entries(modelCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([model]) => model);
  }
  
  return recommendations;
}