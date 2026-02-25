import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project } from '../types/schema';

interface Message {
    role: 'user' | 'assistant' | 'summary';
    content: string;
    projectUpdates?: Record<string, string> | null;
    scriptUpdates?: string | null;
    imageUrl?: string | null;
    imageUrls?: string[] | null;
    createdCharacters?: { id: number; name: string }[] | null;
    createdObjects?: { id: number; name: string }[] | null;
    updatedCharacters?: { id: number; name: string }[] | null;
    updatedObjects?: { id: number; name: string }[] | null;
    createdScenes?: { id: number; name: string; shotCount: number }[] | null;
    keyDecisions?: string[] | null;
}

interface SessionData {
    messages: Message[];
    scriptContent: string;
    mode: 'initial' | 'script-first' | 'idea-first' | 'refining';
    projectSnapshot: Project | null;
    targetModel: string | null;
}

interface CreativeDirectorState {
    // Per-project state keyed by projectId
    sessions: Record<number, SessionData>;

    // Queued message for cross-component "Send to Director" (e.g. from Project Info page)
    queuedMessage: { projectId: number; content: string } | null;

    // Actions
    getSession: (projectId: number) => SessionData;
    setMessages: (projectId: number, messages: Message[]) => void;
    addMessage: (projectId: number, message: Message) => void;
    setScriptContent: (projectId: number, content: string) => void;
    setMode: (projectId: number, mode: 'initial' | 'script-first' | 'idea-first' | 'refining') => void;
    setProjectSnapshot: (projectId: number, project: Project) => void;
    setTargetModel: (projectId: number, model: string | null) => void;
    resetSession: (projectId: number) => void;
    queueMessage: (projectId: number, content: string) => void;
    clearQueuedMessage: () => void;
}

const DEFAULT_SESSION: SessionData = {
    messages: [],
    scriptContent: '',
    mode: 'initial' as const,
    projectSnapshot: null,
    targetModel: null,
};

export type { Message };

export const useCreativeDirectorStore = create<CreativeDirectorState>()(
    persist(
        (set, get) => ({
            sessions: {},
            queuedMessage: null,

            getSession: (projectId: number) => {
                return get().sessions[projectId] || { ...DEFAULT_SESSION };
            },

            setMessages: (projectId, messages) =>
                set((state) => ({
                    sessions: {
                        ...state.sessions,
                        [projectId]: { ...(state.sessions[projectId] || DEFAULT_SESSION), messages },
                    },
                })),

            addMessage: (projectId, message) =>
                set((state) => {
                    const session = state.sessions[projectId] || DEFAULT_SESSION;
                    return {
                        sessions: {
                            ...state.sessions,
                            [projectId]: { ...session, messages: [...session.messages, message] },
                        },
                    };
                }),

            setScriptContent: (projectId, content) =>
                set((state) => ({
                    sessions: {
                        ...state.sessions,
                        [projectId]: { ...(state.sessions[projectId] || DEFAULT_SESSION), scriptContent: content },
                    },
                })),

            setMode: (projectId, mode) =>
                set((state) => ({
                    sessions: {
                        ...state.sessions,
                        [projectId]: { ...(state.sessions[projectId] || DEFAULT_SESSION), mode },
                    },
                })),

            setProjectSnapshot: (projectId, project) =>
                set((state) => ({
                    sessions: {
                        ...state.sessions,
                        [projectId]: { ...(state.sessions[projectId] || DEFAULT_SESSION), projectSnapshot: project },
                    },
                })),

            setTargetModel: (projectId, model) =>
                set((state) => ({
                    sessions: {
                        ...state.sessions,
                        [projectId]: { ...(state.sessions[projectId] || DEFAULT_SESSION), targetModel: model },
                    },
                })),

            resetSession: (projectId) =>
                set((state) => {
                    const existing = state.sessions[projectId];
                    if (!existing) return state;
                    return {
                        sessions: {
                            ...state.sessions,
                            [projectId]: {
                                ...existing,
                                messages: [],
                                mode: 'initial' as const,
                            },
                        },
                    };
                }),

            queueMessage: (projectId, content) =>
                set({ queuedMessage: { projectId, content } }),

            clearQueuedMessage: () =>
                set({ queuedMessage: null }),
        }),
        {
            name: 'shotpilot-creative-director',
            partialize: (state) => ({ sessions: state.sessions }),
        }
    )
);
