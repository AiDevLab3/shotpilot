import { create } from 'zustand';
import type { Project } from '../types/schema';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    projectUpdates?: Record<string, string> | null;
    scriptUpdates?: string | null;
    imageUrl?: string | null;
}

interface CreativeDirectorState {
    // Per-project state keyed by projectId
    sessions: Record<number, {
        messages: Message[];
        scriptContent: string;
        mode: 'initial' | 'script-first' | 'idea-first' | 'refining';
        projectSnapshot: Project | null;
    }>;

    // Actions
    getSession: (projectId: number) => {
        messages: Message[];
        scriptContent: string;
        mode: 'initial' | 'script-first' | 'idea-first' | 'refining';
        projectSnapshot: Project | null;
    };
    setMessages: (projectId: number, messages: Message[]) => void;
    addMessage: (projectId: number, message: Message) => void;
    setScriptContent: (projectId: number, content: string) => void;
    setMode: (projectId: number, mode: 'initial' | 'script-first' | 'idea-first' | 'refining') => void;
    setProjectSnapshot: (projectId: number, project: Project) => void;
    resetSession: (projectId: number) => void;
}

const DEFAULT_SESSION = {
    messages: [],
    scriptContent: '',
    mode: 'initial' as const,
    projectSnapshot: null,
};

export type { Message };

export const useCreativeDirectorStore = create<CreativeDirectorState>((set, get) => ({
    sessions: {},

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

    resetSession: (projectId) =>
        set((state) => {
            const newSessions = { ...state.sessions };
            delete newSessions[projectId];
            return { sessions: newSessions };
        }),
}));
