/**
 * Agent Pipeline API — wraps the /api/agents/* endpoints
 */

const agentCall = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`/api/agents${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    let errMsg = response.statusText;
    try {
      const errBody = await response.json();
      if (errBody.error) errMsg = errBody.error;
    } catch { /* fallback */ }
    throw new Error(errMsg);
  }
  return response.json();
};

// Types
export interface AgentModel {
  id: string;
  name: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  hasAPI: boolean;
}

export interface AgentProject {
  id: string;
  name: string;
  style_profile?: { id: string; name: string };
  scenes?: AgentScene[];
}

export interface AgentScene {
  id: string;
  number: number;
  name: string;
  description?: string;
  location?: string;
  time_of_day?: string;
  mood?: string;
  shots?: AgentSceneShot[];
}

export interface AgentSceneShot {
  id: string;
  description: string;
  shot_type?: string;
  characters?: string[];
  props?: string[];
}

export interface GenerateShotResult {
  brief: any;
  model_selected: string;
  prompt: any;
  quality_gate?: any;
  continuity?: any;
}

// API Functions
export const getAgentModels = async (): Promise<{ models: AgentModel[]; profiles: string[] }> => {
  return agentCall('/models');
};

export const getAgentProjects = async (): Promise<{ projects: AgentProject[] }> => {
  return agentCall('/projects');
};

export const getAgentProject = async (id: string): Promise<AgentProject> => {
  return agentCall(`/projects/${id}`);
};

export const getAgentProjectScenes = async (id: string): Promise<{ project_id: string; scenes: AgentScene[] }> => {
  return agentCall(`/projects/${id}/scenes`);
};

export const generateShot = async (params: {
  description?: string;
  model_preference?: string;
  project_id?: string;
  scene_id?: string;
}): Promise<GenerateShotResult> => {
  return agentCall('/generate-shot', {
    method: 'POST',
    body: JSON.stringify(params),
  });
};

export const generateScene = async (params: {
  project_id?: string;
  scene_id: string;
  model_preference?: string;
  overrides?: any;
}): Promise<any> => {
  return agentCall('/generate-scene', {
    method: 'POST',
    body: JSON.stringify(params),
  });
};

export const auditImage = async (imageBase64: string, shotContext?: string, projectId?: string): Promise<any> => {
  return agentCall('/audit-image', {
    method: 'POST',
    body: JSON.stringify({ image: imageBase64, shot_context: shotContext, project_id: projectId }),
  });
};

export const screenReference = async (imageBase64: string): Promise<any> => {
  return agentCall('/screen-reference', {
    method: 'POST',
    body: JSON.stringify({ image: imageBase64 }),
  });
};

export const checkContinuity = async (params: {
  project_id?: string;
  shot_description: string;
  image?: string;
  character_name?: string;
}): Promise<any> => {
  return agentCall('/check-continuity', {
    method: 'POST',
    body: JSON.stringify(params),
  });
};

// Scene Workshop: CD Suggestions
export interface PlacementSuggestion {
  image_id: number;
  shot_id: number;
  confidence: number;
  reasoning: string;
}

export const suggestPlacements = async (sceneId: number, projectId?: number): Promise<{
  suggestions: PlacementSuggestion[];
  staged_count: number;
  shot_count: number;
  message?: string;
}> => {
  return agentCall('/suggest-placements', {
    method: 'POST',
    body: JSON.stringify({ scene_id: sceneId, project_id: projectId }),
  });
};

// Scene Workshop: Gap Analysis
export interface GapAnalysis {
  coverage_percent: number;
  total_shots: number;
  filled_shots: number;
  empty_shots: number;
  gaps: Array<{
    shot_id: number | null;
    shot_number: string;
    description: string;
    urgency: 'critical' | 'important' | 'nice-to-have';
    recommended_model: string;
    estimated_cost: string;
    reasoning: string;
  }>;
  suggested_new_shots: Array<{
    position: string;
    shot_type: string;
    description: string;
    reasoning: string;
  }>;
  total_estimated_cost: string;
  summary: string;
}

export const getGapAnalysis = async (sceneId: number, projectId?: number): Promise<GapAnalysis> => {
  return agentCall('/gap-analysis', {
    method: 'POST',
    body: JSON.stringify({ scene_id: sceneId, project_id: projectId }),
  });
};
