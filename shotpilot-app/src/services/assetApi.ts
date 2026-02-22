/**
 * Asset Manager API
 */

const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  if (!response.ok) {
    let errMsg = response.statusText;
    try { const b = await response.json(); if (b.error) errMsg = b.error; } catch {}
    throw new Error(errMsg);
  }
  return response.json();
};

export interface Asset {
  id: number;
  project_id: number;
  image_url: string;
  title: string | null;
  notes: string | null;
  tags: string | null;
  asset_type: string | null;      // real_ref, ai_generated, style_ref, unclassified
  subject_category: string | null; // hero, property_manager, vehicle, environment, dome, etc.
  scene_id: string | null;
  style_score: number | null;
  realism_score: number | null;
  pipeline_score: number | null;
  status: string | null;           // unreviewed, approved, needs_work, rejected
  analysis_json: string | null;
  refinement_notes: string | null;
  source_model: string | null;
  source_prompt: string | null;
  parent_asset_id: number | null;
  iteration: number | null;
  refinement_json: string | null;
  created_at: string;
}

export interface AssetAnalysis {
  asset_type: string;
  subject_category: string;
  realism_score: number;
  style_score: number;
  pipeline_score: number;
  status_recommendation: string;
  technical_breakdown: {
    strengths: string[];
    issues: string[];
    lighting_analysis: string;
    composition_analysis: string;
    texture_analysis: string;
  };
  refinement_advice: string;
  scene_suggestions: string[];
  summary: string;
}

export const deleteAsset = async (id: number): Promise<{ deleted: boolean; id: number }> => {
  return apiCall(`/assets/${id}`, { method: 'DELETE' });
};

export const getProjectAssets = async (projectId: number): Promise<Asset[]> => {
  return apiCall(`/projects/${projectId}/assets`);
};

export const updateAsset = async (id: number, data: Partial<Asset>): Promise<Asset> => {
  return apiCall(`/assets/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
};

export const analyzeAsset = async (id: number): Promise<{ analysis: AssetAnalysis; asset: Asset }> => {
  return apiCall(`/assets/${id}/analyze`, { method: 'POST' });
};

export const analyzeAllAssets = async (projectId: number): Promise<{ queued: number; message: string }> => {
  return apiCall(`/projects/${projectId}/analyze-all`, { method: 'POST' });
};

export interface RefinementPlan {
  reverse_engineered_prompt: string;
  estimated_source_model: string;
  reference_strategy: {
    use_as_reference: boolean;
    reasoning: string;
    risk_if_used_as_ref: string;
    risk_if_not_used_as_ref: string;
  };
  recommended_model: string;
  model_reasoning: string;
  refined_prompt: string;
  prompt_notes: string;
  generation_settings: {
    guidance_scale?: number;
    steps?: number;
    aspect_ratio?: string;
    other_settings?: string;
  };
  expected_improvement: string;
  iteration_tips: string;
}

export const getRefinementPlan = async (id: number, sourceInfo?: { 
  source_model?: string; 
  source_prompt?: string; 
  reference_images?: Array<{asset_id: number, role: string, image_url: string}> 
}): Promise<{ plan: RefinementPlan; asset: Asset }> => {
  return apiCall(`/assets/${id}/refinement-plan`, { method: 'POST', body: JSON.stringify(sourceInfo || {}) });
};

export const setAssetSource = async (id: number, source_model: string, source_prompt: string): Promise<Asset> => {
  return apiCall(`/assets/${id}/source`, { method: 'POST', body: JSON.stringify({ source_model, source_prompt }) });
};

export const iterateAsset = async (id: number, data: { image_url: string; title?: string; source_model?: string; source_prompt?: string }): Promise<Asset> => {
  return apiCall(`/assets/${id}/iterate`, { method: 'POST', body: JSON.stringify(data) });
};

export const getAssetIterations = async (id: number): Promise<Asset[]> => {
  return apiCall(`/assets/${id}/iterations`);
};

export interface GenerateResult {
  generated: Asset[];
  requestId?: string;
  useReference: boolean;
  prompt: string;
  model: string;
  apiAvailable?: boolean;
  parameters?: any;
  message?: string;
}

export interface FilmStock {
  id: string;
  name: string;
  inject: string;
}

export interface PipelineResult {
  step1_generate: Asset | { error: string; prompt?: string; parameters?: any } | null;
  step2_refine: Asset | { error: string } | null;
  step3_upscale: Asset | { error: string } | null;
  iterations: Asset[];
  completed_steps: number;
  prompt: string;
  model: string;
  pipeline_id: string;
  error?: string;
}

export interface TransformPromptResult {
  transformed_prompt: string;
  negative_prompt: string;
  parameters: any;
  notes: string;
}

export interface ReferenceImage {
  assetId: number;
  imageUrl: string;
  title: string;
  role: string;
}

export const generateFromPlan = async (id: number, options?: {
  model?: string;
  film_stock?: string;
  realism_lock?: boolean;
  num_images?: number;
  image_size?: string;
  num_steps?: number;
  guidance_scale?: number;
  prompt_override?: string;
  reference_images?: Array<{image_url: string, role: string}>;
}): Promise<GenerateResult> => {
  return apiCall(`/assets/${id}/generate`, { method: 'POST', body: JSON.stringify(options || {}) });
};

export const getFilmStocks = async (): Promise<FilmStock[]> => {
  return apiCall('/presets/film-stocks');
};

export const transformPrompt = async (id: number, data: {
  prompt: string;
  target_model: string;
  source_model?: string;
  reference_images?: Array<{image_url: string, role: string}>;
}): Promise<TransformPromptResult> => {
  return apiCall(`/assets/${id}/transform-prompt`, { method: 'POST', body: JSON.stringify(data) });
};

export const runPipeline = async (id: number, options: {
  prompt: string;
  model?: string;
  use_reference?: boolean;
  num_images?: number;
  film_stock?: string;
  realism_lock?: boolean;
  refine_model?: string;
  refine_prompt?: string;
  upscale?: boolean;
  image_size?: string;
  reference_images?: Array<{image_url: string, role: string}>;
}): Promise<PipelineResult> => {
  return apiCall(`/assets/${id}/pipeline`, { method: 'POST', body: JSON.stringify(options) });
};
