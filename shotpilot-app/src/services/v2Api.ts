// ShotPilot v2 API Client — Clean, minimal
import type { AnalysisResult, GenerationResult, ModelInfo } from '../types/v2';

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

// Models
export async function getModels(): Promise<ModelInfo[]> {
  return request('/api/v2/models');
}

export async function getActiveModels(): Promise<ModelInfo[]> {
  return request('/api/v2/models?active=true');
}

// Analyze — upload image, get grade + recommendation
export async function analyzeImage(file: File, projectId?: number): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append('image', file);
  if (projectId) formData.append('projectId', String(projectId));
  
  return request('/api/analyze', {
    method: 'POST',
    body: formData,
    // Don't set Content-Type — browser sets multipart boundary automatically
  });
}

// Analyze from URL (for re-analyzing generated images)
export async function analyzeImageUrl(imageUrl: string, projectId?: number): Promise<AnalysisResult> {
  return request('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl, projectId }),
  });
}

// Generate — create or edit image
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
  return request('/api/v2/prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
}

// Upscale via Topaz
export async function upscaleImage(imageUrl: string): Promise<{ imageUrl: string; localPath: string }> {
  return request('/api/upscale', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl }),
  });
}
