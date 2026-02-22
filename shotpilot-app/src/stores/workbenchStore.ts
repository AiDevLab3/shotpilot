// ShotPilot v2 — Single store for the core loop
import { create } from 'zustand';
import type { AnalysisResult, AppState, IterationEntry, ModelInfo } from '../types/v2';
import * as api from '../services/v2Api';

interface WorkbenchState {
  // App state
  appState: AppState;
  error: string | null;
  
  // Models
  models: ModelInfo[];
  selectedModelId: string | null;
  
  // Current image
  currentImageUrl: string | null;
  currentImageFile: File | null;
  currentAnalysis: AnalysisResult | null;
  
  // Expert prompt
  expertPrompt: string;
  promptLoading: boolean;
  
  // Strategy
  strategy: 'edit' | 'regenerate';
  
  // Iteration history
  iterations: IterationEntry[];
  
  // Actions
  loadModels: () => Promise<void>;
  uploadAndAnalyze: (file: File) => Promise<void>;
  reAnalyze: (imageUrl: string) => Promise<void>;
  selectModel: (modelId: string) => void;
  setStrategy: (strategy: 'edit' | 'regenerate') => void;
  setPrompt: (prompt: string) => void;
  generateExpertPrompt: () => Promise<void>;
  generate: () => Promise<void>;
  upscale: () => Promise<void>;
  reset: () => void;
  selectIteration: (id: string) => void;
}

export const useWorkbenchStore = create<WorkbenchState>((set, get) => ({
  appState: 'idle',
  error: null,
  models: [],
  selectedModelId: null,
  currentImageUrl: null,
  currentImageFile: null,
  currentAnalysis: null,
  expertPrompt: '',
  promptLoading: false,
  strategy: 'edit',
  iterations: [],

  loadModels: async () => {
    try {
      const models = await api.getActiveModels();
      set({ models });
    } catch (e: any) {
      console.error('[workbench] Failed to load models:', e);
    }
  },

  uploadAndAnalyze: async (file: File) => {
    const id = `iter_${Date.now()}`;
    const localUrl = URL.createObjectURL(file);
    
    set({
      appState: 'analyzing',
      error: null,
      currentImageFile: file,
      currentImageUrl: localUrl,
      currentAnalysis: null,
      expertPrompt: '',
    });

    try {
      const analysis = await api.analyzeImage(file);
      
      const entry: IterationEntry = {
        id,
        imageUrl: localUrl,
        analysis,
        timestamp: Date.now(),
        isOriginal: true,
      };

      set(state => ({
        appState: 'idle',
        currentAnalysis: analysis,
        selectedModelId: analysis.recommendation.modelId,
        strategy: analysis.recommendation.strategy,
        iterations: [...state.iterations, entry],
      }));
    } catch (e: any) {
      set({ appState: 'error', error: e.message || 'Analysis failed' });
    }
  },

  reAnalyze: async (imageUrl: string) => {
    set({ appState: 'analyzing', error: null, currentAnalysis: null, expertPrompt: '' });
    try {
      const analysis = await api.analyzeImageUrl(imageUrl);
      set({
        appState: 'idle',
        currentImageUrl: imageUrl,
        currentAnalysis: analysis,
        selectedModelId: analysis.recommendation.modelId,
        strategy: analysis.recommendation.strategy,
      });
    } catch (e: any) {
      set({ appState: 'error', error: e.message || 'Analysis failed' });
    }
  },

  selectModel: (modelId: string) => set({ selectedModelId: modelId, expertPrompt: '' }),
  setStrategy: (strategy) => set({ strategy, expertPrompt: '' }),
  setPrompt: (prompt) => set({ expertPrompt: prompt }),

  generateExpertPrompt: async () => {
    const { selectedModelId, strategy, currentAnalysis, currentImageUrl } = get();
    if (!selectedModelId || !currentAnalysis) return;

    set({ promptLoading: true });
    try {
      const result = await api.getExpertPrompt({
        modelId: selectedModelId,
        strategy,
        analysisResult: currentAnalysis,
        sourceImageUrl: currentImageUrl || undefined,
      });
      set({ expertPrompt: result.prompt, promptLoading: false });
    } catch (e: any) {
      set({ promptLoading: false, error: e.message });
    }
  },

  generate: async () => {
    const { selectedModelId, expertPrompt, strategy, currentImageUrl } = get();
    if (!selectedModelId || !expertPrompt) return;

    set({ appState: 'generating', error: null });
    try {
      const result = await api.generateImage({
        modelId: selectedModelId,
        prompt: expertPrompt,
        strategy,
        sourceImageUrl: strategy === 'edit' ? (currentImageUrl || undefined) : undefined,
      });

      // Auto-analyze the new result
      set({ appState: 'analyzing' });
      let analysis: AnalysisResult | undefined;
      try {
        analysis = await api.analyzeImageUrl(result.imageUrl);
      } catch {
        // Analysis failure shouldn't block showing the result
      }

      const entry: IterationEntry = {
        id: `iter_${Date.now()}`,
        imageUrl: result.imageUrl,
        analysis,
        generation: result,
        timestamp: Date.now(),
      };

      set(state => ({
        appState: 'idle',
        currentImageUrl: result.imageUrl,
        currentAnalysis: analysis || null,
        selectedModelId: analysis?.recommendation.modelId || state.selectedModelId,
        strategy: analysis?.recommendation.strategy || state.strategy,
        expertPrompt: '',
        iterations: [...state.iterations, entry],
      }));
    } catch (e: any) {
      set({ appState: 'error', error: e.message || 'Generation failed' });
    }
  },

  upscale: async () => {
    const { currentImageUrl } = get();
    if (!currentImageUrl) return;

    set({ appState: 'upscaling', error: null });
    try {
      const result = await api.upscaleImage(currentImageUrl);

      const entry: IterationEntry = {
        id: `iter_${Date.now()}`,
        imageUrl: result.imageUrl,
        timestamp: Date.now(),
      };

      set(state => ({
        appState: 'idle',
        currentImageUrl: result.imageUrl,
        currentAnalysis: null, // Will need re-analysis
        iterations: [...state.iterations, entry],
      }));
    } catch (e: any) {
      set({ appState: 'error', error: e.message || 'Upscale failed' });
    }
  },

  reset: () => set({
    appState: 'idle',
    error: null,
    currentImageUrl: null,
    currentImageFile: null,
    currentAnalysis: null,
    expertPrompt: '',
    selectedModelId: null,
    strategy: 'edit',
    iterations: [],
  }),

  selectIteration: (id: string) => {
    const { iterations } = get();
    const entry = iterations.find(i => i.id === id);
    if (!entry) return;
    set({
      currentImageUrl: entry.imageUrl,
      currentAnalysis: entry.analysis || null,
      expertPrompt: '',
    });
  },
}));
