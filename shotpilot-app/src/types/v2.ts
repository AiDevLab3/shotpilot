// ShotPilot v2 Types — Simplified core loop

export interface ModelInfo {
  id: string;
  name: string;
  type: 'image' | 'video' | 'utility';
  provider: 'fal' | 'openai' | 'external';
  capabilities: string[];
  strengths: string[];
  weaknesses?: string[];
  bestFor?: string[];
  worstFor?: string[];
  active: boolean;
  description?: string;
  hasAPI?: boolean;
  hasEdit?: boolean;
  hasVariants?: boolean;
  variants?: { id: string; endpoint: string; description: string }[];
}

export interface AnalysisResult {
  verdict: 'LOCK_IT_IN' | 'REFINE' | 'REGENERATE';
  score: number; // 0-100
  diagnosis: string; // Plain English
  issues: string[];
  fixes: string[]; // Actionable fix descriptions
  recommendation: ModelRecommendation;
  styleMatch: number; // 0-10
  realism: number; // 0-10
}

export interface ModelRecommendation {
  modelId: string;
  modelName: string;
  strategy: 'edit' | 'regenerate';
  reasoning: string;
  alternatives: AlternativeModel[];
}

export interface AlternativeModel {
  modelId: string;
  modelName: string;
  strategy: 'edit' | 'regenerate';
  reasoning: string;
}

export interface GenerationRequest {
  modelId: string;
  prompt: string;
  strategy: 'edit' | 'regenerate';
  sourceImageUrl?: string; // For edit strategy
  options?: Record<string, unknown>;
}

export interface GenerationResult {
  imageUrl: string;
  localPath: string;
  modelUsed: string;
  promptUsed: string;
  cost?: number;
  requestId?: string;
}

export interface IterationEntry {
  id: string;
  imageUrl: string;
  analysis?: AnalysisResult;
  generation?: GenerationResult;
  timestamp: number;
  isOriginal?: boolean;
}

export type AppState = 'idle' | 'analyzing' | 'generating' | 'upscaling' | 'error';

// === NEW USER-IN-THE-LOOP TYPES ===

export interface AnalyzeResult {
  audit: {
    realism: { score: number; notes: string };
    style_match: { score: number; notes: string };
    ai_artifacts: { score: number; notes: string };
    overall_score: number;
    recommendation: 'approve' | 'iterate' | 'reject';
    iteration_guidance: string;
  };
  recommendation: {
    verdict: 'approve' | 'improve' | 'regenerate';
    cd_recommendation: {
      suggested_model: string;
      reasoning: string;
      alternative_models: Array<{ id: string; reasoning: string }>;
    };
    strategy: any; // Strategy Picker output
    estimated_cost?: string;
  };
}

export interface ExecuteResult {
  result_image: string; // base64
  model_used: string;
  prompt_used: string;
  before_score: number;
  after_score: number;
  audit: any; // New QG result
  recommendation?: any; // Next step recommendation
}

export interface GenerateWithAuditResult {
  generation: any; // CD + specialist output
  image?: string; // base64 if model has API
  audit?: any; // QG result
  recommendation?: any;
}

export interface ImportResult {
  audit: any; // QG result for imported image
  recommendations?: any; // CD recommendations
}
