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
