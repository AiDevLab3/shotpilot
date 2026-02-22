// ShotPilot v3 — User-in-the-loop store
import { create } from 'zustand';
import type { 
  AnalysisResult, 
  AppState, 
  IterationEntry, 
  ModelInfo, 
  GenerateWithAuditResult,
  ExecuteResult 
} from '../types/v2';
import * as api from '../services/v2Api';

interface WorkbenchState {
  // App state
  appState: AppState;
  error: string | null;
  
  // Mode
  mode: 'import' | 'generate';
  shotDescription: string;
  
  // Models
  models: ModelInfo[];
  selectedModelId: string | null;
  
  // Current image
  currentImageUrl: string | null;
  currentImageFile: File | null;
  currentImageBase64: string | null;
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
  setMode: (mode: 'import' | 'generate') => void;
  setShotDescription: (desc: string) => void;
  uploadAndAnalyze: (file: File, shotContext?: string, sourceModel?: string, sourcePrompt?: string) => Promise<void>;
  generateFromDescription: () => Promise<void>;
  reAnalyze: (imageUrl: string) => Promise<void>;
  selectModel: (modelId: string) => void;
  setStrategy: (strategy: 'edit' | 'regenerate') => void;
  setPrompt: (prompt: string) => void;
  generateExpertPrompt: () => Promise<void>;
  executeStep: (modelId: string, instruction?: string) => Promise<void>;
  generate: () => Promise<void>;
  upscale: () => Promise<void>;
  reset: () => void;
  selectIteration: (id: string) => void;
}

export const useWorkbenchStore = create<WorkbenchState>((set, get) => ({
  appState: 'idle',
  error: null,
  mode: 'import',
  shotDescription: '',
  models: [],
  selectedModelId: null,
  currentImageUrl: null,
  currentImageFile: null,
  currentImageBase64: null,
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

  setMode: (mode) => set({ mode }),
  setShotDescription: (desc) => set({ shotDescription: desc }),

  uploadAndAnalyze: async (file: File, shotContext?: string, _sourceModel?: string, _sourcePrompt?: string) => {
    const id = `iter_${Date.now()}`;
    const localUrl = URL.createObjectURL(file);
    
    // Convert file to base64 for storage
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
    const imageBase64 = base64.split(',')[1]; // Remove data URL prefix
    
    set({
      appState: 'analyzing',
      error: null,
      currentImageFile: file,
      currentImageUrl: localUrl,
      currentImageBase64: imageBase64,
      currentAnalysis: null,
      expertPrompt: '',
    });

    try {
      // Try new agent API first (returns legacy AnalysisResult format)
      let analysis: AnalysisResult;
      try {
        analysis = await api.analyzeImage(file, shotContext);
      } catch (agentError) {
        // Fall back to legacy API
        console.warn('Agent API failed, falling back to legacy:', agentError);
        analysis = await api.analyzeImageLegacy(file);
      }
      
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

  generateFromDescription: async () => {
    const { shotDescription } = get();
    if (!shotDescription.trim()) return;

    set({ appState: 'generating', error: null, currentAnalysis: null, expertPrompt: '' });

    try {
      const result: GenerateWithAuditResult = await api.generateWithAudit({
        description: shotDescription,
      });

      // If we got an image back, display it
      let imageUrl: string | null = null;
      if (result.image) {
        imageUrl = `data:image/jpeg;base64,${result.image}`;
      }

      // Build analysis from audit if available
      let analysis: AnalysisResult | null = null;
      if (result.audit) {
        // The audit comes in raw QG format — adapt it
        const score = Math.round((result.audit.overall_score || 5) * 10);
        const verdictMap: Record<string, 'LOCK_IT_IN' | 'REFINE' | 'REGENERATE'> = {
          'approve': 'LOCK_IT_IN', 'iterate': 'REFINE', 'reject': 'REGENERATE',
        };
        analysis = {
          verdict: verdictMap[result.audit.recommendation] || 'REFINE',
          score,
          diagnosis: result.audit.iteration_guidance || 'Generation complete.',
          issues: [],
          fixes: [],
          recommendation: {
            modelId: result.generation?.creative_direction?.selected_model || '',
            modelName: result.generation?.creative_direction?.model_name || '',
            strategy: 'edit',
            reasoning: result.generation?.creative_direction?.reasoning || '',
            alternatives: [],
          },
          styleMatch: result.audit.style_match?.score || 5,
          realism: result.audit.realism?.score || 5,
        };
      }

      const entry: IterationEntry = {
        id: `iter_${Date.now()}`,
        imageUrl: imageUrl || '',
        analysis: analysis || undefined,
        timestamp: Date.now(),
        isOriginal: true,
      };

      set(state => ({
        appState: 'idle',
        currentImageUrl: imageUrl,
        currentAnalysis: analysis,
        selectedModelId: result.generation?.creative_direction?.selected_model || null,
        iterations: [...state.iterations, entry],
      }));
    } catch (e: any) {
      set({ appState: 'error', error: e.message || 'Generation failed' });
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

  executeStep: async (modelId: string, instruction?: string) => {
    const { currentImageUrl, currentImageBase64 } = get();
    if (!currentImageUrl) return;

    set({ appState: 'generating', error: null });

    try {
      // Convert image URL to base64 if we don't already have it
      let imageBase64 = currentImageBase64;
      if (!imageBase64) {
        // If it's a blob URL, we need to fetch it
        if (currentImageUrl.startsWith('blob:')) {
          const response = await fetch(currentImageUrl);
          const blob = await response.blob();
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          imageBase64 = base64.split(',')[1]; // Remove data URL prefix
        } else if (currentImageUrl.startsWith('data:')) {
          imageBase64 = currentImageUrl.split(',')[1]; // Remove data URL prefix
        } else {
          throw new Error('Cannot convert image to base64 for processing');
        }
      }

      const result: ExecuteResult = await api.executeImprovement({
        imageBase64,
        modelId,
        instruction,
      });

      // Convert result image to display URL
      const resultImageUrl = `data:image/jpeg;base64,${result.result_image}`;

      // Create analysis from audit result
      let analysis: AnalysisResult | null = null;
      if (result.audit) {
        const score = Math.round((result.audit.overall_score || 5) * 10);
        const verdictMap: Record<string, 'LOCK_IT_IN' | 'REFINE' | 'REGENERATE'> = {
          'approve': 'LOCK_IT_IN', 'iterate': 'REFINE', 'reject': 'REGENERATE',
        };
        analysis = {
          verdict: verdictMap[result.audit.recommendation] || 'REFINE',
          score,
          diagnosis: result.audit.iteration_guidance || 'Step executed successfully.',
          issues: [],
          fixes: [],
          recommendation: {
            modelId: result.recommendation?.cd_recommendation?.suggested_model || modelId,
            modelName: result.model_used,
            strategy: 'edit',
            reasoning: result.recommendation?.cd_recommendation?.reasoning || 'Continue iterating',
            alternatives: result.recommendation?.cd_recommendation?.alternative_models || [],
          },
          styleMatch: result.audit.style_match?.score || 5,
          realism: result.audit.realism?.score || 5,
        };
      }

      const entry: IterationEntry = {
        id: `iter_${Date.now()}`,
        imageUrl: resultImageUrl,
        analysis: analysis || undefined,
        timestamp: Date.now(),
      };

      set(state => ({
        appState: 'idle',
        currentImageUrl: resultImageUrl,
        currentImageBase64: result.result_image,
        currentAnalysis: analysis,
        selectedModelId: result.recommendation?.cd_recommendation?.suggested_model || modelId,
        strategy: 'edit',
        expertPrompt: '', // Clear prompt after execution
        iterations: [...state.iterations, entry],
      }));
    } catch (e: any) {
      set({ appState: 'error', error: e.message || 'Step execution failed' });
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
        currentAnalysis: null,
        iterations: [...state.iterations, entry],
      }));
    } catch (e: any) {
      set({ appState: 'error', error: e.message || 'Upscale failed' });
    }
  },

  reset: () => set({
    appState: 'idle',
    error: null,
    mode: 'import',
    shotDescription: '',
    currentImageUrl: null,
    currentImageFile: null,
    currentImageBase64: null,
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
