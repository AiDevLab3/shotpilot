import { create } from 'zustand';
import type { ProjectDNA, Scene, Shot, Frame, SoulID, EntityID, PromptHistory } from '../types/schema';

interface AppState {
    projects: Record<string, ProjectDNA>;
    scenes: Record<string, Scene>;
    shots: Record<string, Shot>;
    frames: Record<string, Frame>;
    soulIds: Record<string, SoulID>;
    entityIds: Record<string, EntityID>;
    promptHistories: Record<string, PromptHistory>;

    // UI State
    ui: {
        selectedShotId: string | null;
        selectedFrameId: string | null; // Selected within the Frame Variants panel
    };
    setUiSelection: (shotId: string | null, frameId?: string | null) => void;

    // Actions
    addProject: (project: ProjectDNA) => void;
    updateProject: (id: string, updates: Partial<ProjectDNA>) => void;

    addScene: (scene: Scene) => void;
    updateScene: (id: string, updates: Partial<Scene>) => void;

    addShot: (shot: Shot) => void;
    updateShot: (id: string, updates: Partial<Shot>) => void;

    addFrame: (frame: Frame) => void;
    updateFrame: (id: string, updates: Partial<Frame>) => void;

    addSoulId: (soulId: SoulID) => void;
    updateSoulId: (id: string, updates: Partial<SoulID>) => void;

    addEntityId: (entityId: EntityID) => void;
    updateEntityId: (id: string, updates: Partial<EntityID>) => void;

    addPromptHistory: (history: PromptHistory) => void;
}

export const useStore = create<AppState>((set) => ({
    projects: {},
    scenes: {},
    shots: {},
    frames: {},
    soulIds: {},
    entityIds: {},
    promptHistories: {},
    ui: { selectedShotId: null, selectedFrameId: null },

    setUiSelection: (shotId, frameId) => set((state) => ({
        ui: {
            selectedShotId: shotId,
            selectedFrameId: frameId === undefined ? state.ui.selectedFrameId : frameId
        }
    })),

    addProject: (project) => set((state) => ({ projects: { ...state.projects, [project.id]: project } })),
    updateProject: (id, updates) => set((state) => ({
        projects: { ...state.projects, [id]: { ...state.projects[id], ...updates } }
    })),

    addScene: (scene) => set((state) => ({ scenes: { ...state.scenes, [scene.id]: scene } })),
    updateScene: (id, updates) => set((state) => ({
        scenes: { ...state.scenes, [id]: { ...state.scenes[id], ...updates } }
    })),

    addShot: (shot) => set((state) => ({ shots: { ...state.shots, [shot.id]: shot } })),
    updateShot: (id, updates) => set((state) => ({
        shots: { ...state.shots, [id]: { ...state.shots[id], ...updates } }
    })),

    addFrame: (frame) => set((state) => ({ frames: { ...state.frames, [frame.id]: frame } })),
    updateFrame: (id, updates) => set((state) => ({
        frames: { ...state.frames, [id]: { ...state.frames[id], ...updates } }
    })),

    addSoulId: (soulId) => set((state) => ({ soulIds: { ...state.soulIds, [soulId.id]: soulId } })),
    updateSoulId: (id, updates) => set((state) => ({
        soulIds: { ...state.soulIds, [id]: { ...state.soulIds[id], ...updates } }
    })),

    addEntityId: (entityId) => set((state) => ({ entityIds: { ...state.entityIds, [entityId.id]: entityId } })),
    updateEntityId: (id, updates) => set((state) => ({
        entityIds: { ...state.entityIds, [id]: { ...state.entityIds[id], ...updates } }
    })),

    addPromptHistory: (history) => set((state) => ({
        promptHistories: { ...state.promptHistories, [history.id]: history }
    })),
}));
