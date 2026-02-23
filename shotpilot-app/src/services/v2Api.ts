// ShotPilot v2 API Client — Clean, minimal with user-in-the-loop support
import type { 
  AnalysisResult, 
  GenerationResult, 
  ModelInfo, 
  AnalyzeResult, 
  ExecuteResult, 
  GenerateWithAuditResult, 
  ImportResult 
} from '../types/v2';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(endpoint, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    let msg = res.statusText;
    try { const body = await res.json(); if (body.error) msg = body.error; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

// Convert AnalyzeResult to AnalysisResult for backward compatibility
function adaptAnalyzeResult(result: AnalyzeResult): AnalysisResult {
  const audit = result.audit;
  const rec = result.recommendation;
  
  // Map verdict
  const verdictMap: Record<string, 'LOCK_IT_IN' | 'REFINE' | 'REGENERATE'> = {
    'approve': 'LOCK_IT_IN',
    'improve': 'REFINE', 
    'regenerate': 'REGENERATE',
  };
  const verdict = verdictMap[rec.verdict] || 'REFINE';
  
  // Map score: audit.overall_score is 1-10, we need 0-100
  const score = Math.round((audit.overall_score || 5) * 10);
  
  // Build issues from audit notes
  const issues: string[] = [];
  if (audit.realism?.notes) issues.push(audit.realism.notes);
  if (audit.style_match?.notes) issues.push(audit.style_match.notes);
  if (audit.ai_artifacts?.notes && audit.ai_artifacts.score < 8) issues.push(audit.ai_artifacts.notes);
  
  // Determine strategy from verdict
  const strategy: 'edit' | 'regenerate' = verdict === 'REGENERATE' ? 'regenerate' : 'edit';
  
  // Get the primary recommended model — skip utility models (Topaz) as primary
  let primaryModelId = rec.cd_recommendation?.suggested_model || '';
  const utilityIds = ['topaz'];
  
  // If primary is a utility and we have strategy steps, use the first non-utility step's model
  if (utilityIds.includes(primaryModelId) && rec.strategy?.steps?.length > 0) {
    const firstNonUtility = rec.strategy.steps.find((s: any) => !utilityIds.includes(s.model));
    if (firstNonUtility) primaryModelId = firstNonUtility.model;
  }
  
  // Build alternatives — include Topaz as alternative for post-processing, not primary
  const alts = (rec.cd_recommendation?.alternative_models || []).map((alt: any) => ({
    modelId: alt.id,
    modelName: alt.id,
    strategy,
    reasoning: alt.reasoning,
  }));
  
  // If strategy has a Topaz upscale step, add it as an alternative
  const topazStep = rec.strategy?.steps?.find((s: any) => s.model === 'topaz');
  if (topazStep && !alts.find((a: any) => a.modelId === 'topaz')) {
    alts.push({
      modelId: 'topaz',
      modelName: 'Topaz AI',
      strategy: 'edit' as const,
      reasoning: 'Post-processing: ' + (topazStep.instruction || 'Upscale after editing/regeneration'),
    });
  }

  return {
    verdict,
    score,
    diagnosis: audit.iteration_guidance || 'Analysis complete.',
    issues,
    fixes: rec.strategy?.steps?.map((s: any) => s.instruction) || [],
    recommendation: {
      modelId: primaryModelId,
      modelName: primaryModelId,
      strategy,
      reasoning: rec.cd_recommendation?.reasoning || '',
      alternatives: alts,
    },
    styleMatch: audit.style_match?.score || 5,
    realism: audit.realism?.score || 5,
  };
}

// === NEW USER-IN-THE-LOOP AGENT ENDPOINTS ===

// Analyze image — returns audit + CD recommendations (no execution)
export async function analyzeImage(file: File, shotContext?: string, projectId?: string): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append('image', file);
  if (shotContext) formData.append('shot_context', shotContext);
  if (projectId) formData.append('project_id', projectId);
  
  try {
    const raw = await request<AnalyzeResult>('/api/agents/analyze', { method: 'POST', body: formData });
    return adaptAnalyzeResult(raw);
  } catch {
    // Fall back to legacy endpoint
    return request('/api/analyze', { method: 'POST', body: formData });
  }
}

// Also support base64 analysis
export async function analyzeImageBase64(imageBase64: string, shotContext?: string, projectId?: string): Promise<AnalysisResult> {
  try {
    const raw = await request<AnalyzeResult>('/api/agents/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageBase64, shot_context: shotContext, project_id: projectId }),
    });
    return adaptAnalyzeResult(raw);
  } catch {
    // Fall back to legacy
    return request('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl: `data:image/jpeg;base64,${imageBase64}` }),
    });
  }
}

// Execute one improvement step (user chose the model)
export async function executeImprovement(params: {
  imageBase64: string;
  modelId: string;
  instruction?: string;
  shotContext?: string;
  projectId?: string;
}): Promise<ExecuteResult> {
  return request('/api/agents/execute-improvement', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: params.imageBase64,
      model_id: params.modelId,
      instruction: params.instruction,
      shot_context: params.shotContext,
      project_id: params.projectId,
    }),
  });
}

// Generate with CD collaboration + audit
export async function generateWithAudit(params: {
  description: string;
  modelPreference?: string;
  projectId?: string;
  sceneId?: string;
}): Promise<GenerateWithAuditResult> {
  return request('/api/agents/generate-with-audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description: params.description,
      model_preference: params.modelPreference,
      project_id: params.projectId,
      scene_id: params.sceneId,
    }),
  });
}

// Import image with metadata
export async function importImage(params: {
  imageBase64: string;
  sourceModel?: string;
  sourcePrompt?: string;
  shotContext?: string;
}): Promise<ImportResult> {
  return request('/api/agents/import-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: params.imageBase64,
      source_model: params.sourceModel,
      source_prompt: params.sourcePrompt,
      shot_context: params.shotContext,
    }),
  });
}

// Get models from agent registry
export async function getModels(): Promise<ModelInfo[]> {
  const result = await request<{ models: any[] }>('/api/agents/models');
  return result.models;
}

// === LEGACY ENDPOINTS (for backward compatibility) ===

export async function getActiveModels(): Promise<ModelInfo[]> {
  try {
    // Try new endpoint first
    return await getModels();
  } catch {
    // Fall back to old endpoint
    return request('/api/v2/models?active=true');
  }
}

// Analyze — upload image, get grade + recommendation (LEGACY)
export async function analyzeImageLegacy(file: File, projectId?: number): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append('image', file);
  if (projectId) formData.append('projectId', String(projectId));
  
  return request('/api/analyze', {
    method: 'POST',
    body: formData,
    // Don't set Content-Type — browser sets multipart boundary automatically
  });
}

// Analyze from URL (for re-analyzing generated images) (LEGACY)
export async function analyzeImageUrl(imageUrl: string, projectId?: number): Promise<AnalysisResult> {
  return request('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl, projectId }),
  });
}

// Generate — create or edit image (LEGACY)
export async function generateImage(params: {
  modelId: string;
  prompt: string;
  strategy: 'edit' | 'regenerate';
  sourceImageUrl?: string;
  options?: Record<string, unknown>;
}): Promise<GenerationResult> {
  return request('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
}

// Generate expert prompt for a model
export async function getExpertPrompt(params: {
  modelId: string;
  strategy: 'edit' | 'regenerate';
  analysisResult: AnalysisResult;
  sourceImageUrl?: string;
  userNotes?: string;
}): Promise<{ prompt: string; modelSyntaxNotes: string }> {
  try {
    // Use new agents endpoint
    const result = await request<{ prompt: string; notes: string }>('/api/agents/generate-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model_id: params.modelId,
        shot_context: `${params.analysisResult.diagnosis || ''} ${params.userNotes || ''}`.trim(),
        analysis: params.analysisResult,
        strategy: params.strategy,
      }),
    });
    
    return {
      prompt: result.prompt,
      modelSyntaxNotes: result.notes,
    };
  } catch (error) {
    // Fallback to legacy endpoint
    console.warn('[getExpertPrompt] New endpoint failed, falling back to legacy:', error);
    return request('/api/v2/prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
  }
}

// Upscale via Topaz
export async function upscaleImage(imageUrl: string): Promise<{ imageUrl: string; localPath: string }> {
  return request('/api/upscale', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl }),
  });
}