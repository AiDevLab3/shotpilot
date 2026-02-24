import type { Project, Character, ObjectItem, Scene, Shot, ImageVariant, AestheticSuggestion, CharacterSuggestions, ShotPlan, QualityDialogueResponse, ScriptAnalysis, ObjectSuggestions, ImageAuditResult, ProjectImage } from '../types/schema';

// v3: Module-level fingerprint to verify this version loaded in browser
console.log('[API v3] api.ts loaded — has 401 interceptor + eager login');

// Auto-login: transparently authenticate on 401.
// Also runs eagerly at import time so session is ready before first API call.
let _loginPromise: Promise<boolean> | null = null;

const autoLogin = (): Promise<boolean> => {
    if (_loginPromise) return _loginPromise;
    console.log('[API v3] autoLogin called, fetching /api/auth/login...');
    _loginPromise = fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@shotpilot.com', password: 'testpassword123' }),
    })
    .then(r => {
        console.log('[API v3] Auto-login response:', r.status);
        return r.ok;
    })
    .catch(() => false)
    .finally(() => { _loginPromise = null; });
    return _loginPromise;
};

// Eager login: fire immediately when this module loads, before any component mounts
autoLogin();

// Helper for fetch calls — retries once on 401 after auto-login
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const doFetch = () => fetch(`/api${endpoint}`, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    });

    let response = await doFetch();

    // If 401, auto-login and retry once
    if (response.status === 401) {
        console.log('[API v3] Got 401 on', endpoint, '— auto-logging in...');
        const ok = await autoLogin();
        if (ok) {
            console.log('[API v3] Retrying', endpoint, 'after login...');
            response = await doFetch();
        }
    }

    if (!response.ok) {
        // Try to extract the server's actual error message
        let errMsg = response.statusText;
        try {
            const errBody = await response.json();
            if (errBody.error) errMsg = errBody.error;
        } catch { /* use statusText fallback */ }
        throw new Error(errMsg);
    }
    return response.json();
};

// Helper for file uploads (multipart/form-data) — retries once on 401 after auto-login
const uploadCall = async (file: File) => {
    const doUpload = () => {
        const formData = new FormData();
        formData.append('image', file);
        return fetch('/api/upload', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });
    };

    let response = await doUpload();

    // If 401, auto-login and retry once (matching apiCall behavior)
    if (response.status === 401) {
        console.log('[API v3] Got 401 on upload — auto-logging in...');
        const ok = await autoLogin();
        if (ok) {
            console.log('[API v3] Retrying upload after login...');
            response = await doUpload();
        }
    }

    if (!response.ok) {
        throw new Error('Upload failed');
    }

    const result = await response.json();
    return result.url; // Relative URL returned by server
};

// Remove fileToBase64 as we now use server uploads
export const fileToBase64 = async (file: File): Promise<string> => {
    // Keep the function signature for existing UI calls, 
    // but internally upload to server and return the URL
    return uploadCall(file);
};

// PROJECTS
export const getAllProjects = async (): Promise<Project[]> => {
    return apiCall('/projects');
};

export const getProject = async (id: number): Promise<Project | undefined> => {
    // We don't have a single GET, so filter from all for now or add endpoint
    // Adding endpoint on server would be better, but for speed:
    const projects = await getAllProjects();
    return projects.find(p => p.id === id);
};

export const createProject = async (data: Partial<Project>): Promise<void> => {
    await apiCall('/projects', {
        method: 'POST',
        body: JSON.stringify(data)
    });
};

export const updateProject = async (id: number, data: Partial<Project>): Promise<void> => {
    await apiCall(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
};

export const deleteProject = async (id: number): Promise<void> => {
    await apiCall(`/projects/${id}`, { method: 'DELETE' });
};

// CHARACTERS
export const getCharacters = async (projectId: number): Promise<Character[]> => {
    return apiCall(`/projects/${projectId}/characters`);
};

export const createCharacter = async (projectId: number, data: Partial<Character>): Promise<void> => {
    await apiCall(`/projects/${projectId}/characters`, {
        method: 'POST',
        body: JSON.stringify(data)
    });
};

export const updateCharacter = async (id: number, data: Partial<Character>): Promise<void> => {
    await apiCall(`/characters/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
};

export const deleteCharacter = async (id: number): Promise<void> => {
    await apiCall(`/characters/${id}`, { method: 'DELETE' });
};

// OBJECTS
export const getObjects = async (projectId: number): Promise<ObjectItem[]> => {
    return apiCall(`/projects/${projectId}/objects`);
};

export const createObject = async (projectId: number, data: Partial<ObjectItem>): Promise<void> => {
    await apiCall(`/projects/${projectId}/objects`, {
        method: 'POST',
        body: JSON.stringify(data)
    });
};

export const updateObject = async (id: number, data: Partial<ObjectItem>): Promise<void> => {
    await apiCall(`/objects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
};

export const deleteObject = async (id: number): Promise<void> => {
    await apiCall(`/objects/${id}`, { method: 'DELETE' });
};

// SCENES
export const getScenes = async (projectId: number): Promise<Scene[]> => {
    return apiCall(`/projects/${projectId}/scenes`);
};

export const createScene = async (projectId: number, data: Partial<Scene>): Promise<void> => {
    await apiCall(`/projects/${projectId}/scenes`, {
        method: 'POST',
        body: JSON.stringify(data)
    });
};

export const updateScene = async (id: number, data: Partial<Scene>): Promise<void> => {
    await apiCall(`/scenes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
};

export const deleteScene = async (id: number): Promise<void> => {
    await apiCall(`/scenes/${id}`, { method: 'DELETE' });
};

export const getStagedImages = async (sceneId: number): Promise<ProjectImage[]> => {
    return apiCall(`/scenes/${sceneId}/staged-images`);
};

// SHOTS
export const getShots = async (sceneId: number): Promise<Shot[]> => {
    return apiCall(`/scenes/${sceneId}/shots`);
};

export const createShot = async (sceneId: number, data: Partial<Shot>): Promise<void> => {
    await apiCall(`/scenes/${sceneId}/shots`, {
        method: 'POST',
        body: JSON.stringify(data)
    });
};

export const updateShot = async (id: number, data: Partial<Shot>): Promise<void> => {
    await apiCall(`/shots/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
};

export const deleteShot = async (id: number): Promise<void> => {
    await apiCall(`/shots/${id}`, { method: 'DELETE' });
};

// IMAGE VARIANTS
export const getImageVariants = async (shotId: number): Promise<ImageVariant[]> => {
    return apiCall(`/shots/${shotId}/images`);
};

export const createImageVariant = async (shotId: number, imageUrl: string, prompt: string = '', options?: { audit_score?: number }): Promise<void> => {
    await apiCall(`/shots/${shotId}/images`, {
        method: 'POST',
        body: JSON.stringify({
            image_url: imageUrl,
            prompt_used: prompt,
            ...(options?.audit_score !== undefined && { audit_score: options.audit_score }),
        })
    });
};

export const deleteImageVariant = async (id: number): Promise<void> => {
    await apiCall(`/images/${id}`, { method: 'DELETE' });
};


// AI & PROMPTS
export const getAvailableModels = async (): Promise<any[]> => {
    return apiCall('/models');
};

export const getUserCredits = async (): Promise<any> => {
    return apiCall('/user/credits');
};

export const generatePrompt = async (shotId: number, modelName: string): Promise<ImageVariant> => {
    return apiCall(`/shots/${shotId}/generate-prompt`, {
        method: 'POST',
        body: JSON.stringify({ modelName })
    });
};

export const checkShotReadiness = async (shotId: number, useKB = true): Promise<any> => {
    return apiCall(`/shots/${shotId}/check-readiness`, {
        method: 'POST',
        body: JSON.stringify({ useKB }),
    });
};

// Backward compat alias
export const checkShotQuality = checkShotReadiness;

export const getRecommendations = async (shotId: number, missingFields: any[]): Promise<any[]> => {
    return apiCall(`/shots/${shotId}/get-recommendations`, {
        method: 'POST',
        body: JSON.stringify({ missingFields })
    });
};

// VARIANTS (generated prompts)
export const getVariants = async (shotId: number): Promise<ImageVariant[]> => {
    return apiCall(`/shots/${shotId}/variants`);
};

export const deleteVariant = async (id: number): Promise<void> => {
    await apiCall(`/variants/${id}`, { method: 'DELETE' });
};

export const updateVariant = async (id: number, data: Partial<ImageVariant>): Promise<ImageVariant> => {
    return apiCall(`/variants/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
};

// AESTHETIC SUGGESTIONS
export const getAestheticSuggestions = async (projectId: number): Promise<AestheticSuggestion[]> => {
    const res = await apiCall(`/projects/${projectId}/aesthetic-suggestions`, {
        method: 'POST',
    });
    return res.suggestions || res;
};

// Phase 3.2: Character AI assistant
export const getCharacterSuggestions = async (projectId: number, character: { name?: string; description?: string; personality?: string; targetModel?: string; descriptionOnly?: boolean }): Promise<CharacterSuggestions> => {
    const res = await apiCall(`/projects/${projectId}/character-suggestions`, {
        method: 'POST',
        body: JSON.stringify(character),
    });
    return res;
};

// Phase 3.3: Scene shot planning
export const getShotPlan = async (sceneId: number, mode: 'full' | 'add' = 'full'): Promise<ShotPlan> => {
    const res = await apiCall(`/scenes/${sceneId}/shot-plan`, {
        method: 'POST',
        body: JSON.stringify({ mode }),
    });
    return res;
};

// Phase 3.4: Prompt readiness dialogue
export const sendReadinessDialogue = async (shotId: number, message: string, history: { role: string; content: string }[]): Promise<QualityDialogueResponse> => {
    const res = await apiCall(`/shots/${shotId}/readiness-dialogue`, {
        method: 'POST',
        body: JSON.stringify({ message, history }),
    });
    return res;
};

// Backward compat alias
export const sendQualityDialogue = sendReadinessDialogue;

// Phase 3.5: Script analysis
export const analyzeScriptText = async (projectId: number, scriptText: string): Promise<ScriptAnalysis> => {
    const res = await apiCall(`/projects/${projectId}/analyze-script`, {
        method: 'POST',
        body: JSON.stringify({ scriptText }),
    });
    return res;
};

// Phase 3.6: Object AI assistant
export const getObjectSuggestions = async (projectId: number, object: { name?: string; description?: string; targetModel?: string; descriptionOnly?: boolean }): Promise<ObjectSuggestions> => {
    const res = await apiCall(`/projects/${projectId}/object-suggestions`, {
        method: 'POST',
        body: JSON.stringify(object),
    });
    return res;
};

// Phase 3.7: Usage stats
export const getUsageStats = async (): Promise<any> => {
    return apiCall('/usage/stats');
};

// Content refinement (conversational)
export const refineContent = async (
    projectId: number,
    type: 'character' | 'object',
    currentContent: any,
    message: string,
    history: { role: string; content: string }[]
): Promise<{ response: string; contentUpdate: any }> => {
    return apiCall(`/projects/${projectId}/refine-content`, {
        method: 'POST',
        body: JSON.stringify({ type, currentContent, message, history }),
    });
};

// Creative Director
export const creativeDirectorChat = async (
    projectId: number,
    message: string,
    history: { role: string; content: string }[],
    scriptContent: string,
    mode: string,
    imageUrls?: string[],
    targetModel?: string,
): Promise<{ response: string; projectUpdates: any; scriptUpdates: string | null }> => {
    return apiCall(`/projects/${projectId}/creative-director`, {
        method: 'POST',
        body: JSON.stringify({ message, history, scriptContent, mode, imageUrls, targetModel }),
    });
};

// Conversation compaction
export const compactConversation = async (
    projectId: number,
    messages: { role: string; content: string }[],
    scriptContent: string,
): Promise<{
    summary: string;
    keyDecisions: string[];
    characterNotes: string | null;
    sceneNotes: string | null;
    styleDirection: string | null;
    openQuestions: string | null;
}> => {
    return apiCall(`/projects/${projectId}/compact-conversation`, {
        method: 'POST',
        body: JSON.stringify({ messages, scriptContent }),
    });
};

// ============================================================
// CONVERSATION PERSISTENCE
// ============================================================

export const loadConversation = async (projectId: number): Promise<{
    exists: boolean;
    messages: any[];
    mode: string;
    scriptContent: string;
    targetModel: string | null;
}> => {
    return apiCall(`/projects/${projectId}/conversation`);
};

export const saveConversationMessage = async (
    projectId: number,
    message: { role: string; content: string; [key: string]: any },
    sessionState: { mode?: string; scriptContent?: string; targetModel?: string | null }
): Promise<{ id: number; saved: boolean }> => {
    const { role, content, ...metadata } = message;
    return apiCall(`/projects/${projectId}/conversation/messages`, {
        method: 'POST',
        body: JSON.stringify({
            role,
            content,
            metadata: Object.keys(metadata).length > 0 ? metadata : null,
            ...sessionState,
        }),
    });
};

export const replaceConversationMessages = async (
    projectId: number,
    messages: any[],
    sessionState: { mode?: string; scriptContent?: string; targetModel?: string | null }
): Promise<{ replaced: boolean; count: number }> => {
    return apiCall(`/projects/${projectId}/conversation/messages`, {
        method: 'PUT',
        body: JSON.stringify({ messages, ...sessionState }),
    });
};

export const clearConversation = async (projectId: number): Promise<{ cleared: boolean }> => {
    return apiCall(`/projects/${projectId}/conversation`, { method: 'DELETE' });
};

// ============================================================
// HOLISTIC IMAGE AUDIT — Real image quality analysis
// ============================================================

// Upload image to a variant
export const uploadVariantImage = async (variantId: number, file: File): Promise<{ image_url: string; variant_id: number }> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`/api/variants/${variantId}/upload-image`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Upload failed: ${response.status}`);
    }

    return response.json();
};

// Run holistic image audit on a variant's uploaded image
export const auditVariantImage = async (variantId: number): Promise<ImageAuditResult> => {
    return apiCall(`/variants/${variantId}/audit`, {
        method: 'POST',
    });
};

// Get stored audit results for a variant
export const getVariantAudit = async (variantId: number): Promise<ImageAuditResult & { audited: boolean }> => {
    return apiCall(`/variants/${variantId}/audit`);
};

// AI-powered prompt refinement based on audit results
export const refineVariantPrompt = async (variantId: number): Promise<{
    refined_prompt: string;
    reference_strategy: { action: string; title: string; reason: string };
    variant: any;
}> => {
    return apiCall(`/variants/${variantId}/refine-prompt`, {
        method: 'POST',
    });
};

// Lock a variant as approved/final
export const lockVariant = async (variantId: number): Promise<any> => {
    return apiCall(`/variants/${variantId}/lock`, { method: 'POST' });
};

// Unlock a variant to continue iterating
export const unlockVariant = async (variantId: number): Promise<any> => {
    return apiCall(`/variants/${variantId}/unlock`, { method: 'POST' });
};

// Audit a standalone image (for character/object references)
export const auditStandaloneImage = async (file: File, projectId?: number, contextType?: string): Promise<ImageAuditResult> => {
    const formData = new FormData();
    formData.append('image', file);
    if (projectId) formData.append('projectId', projectId.toString());
    if (contextType) formData.append('context_type', contextType);

    const response = await fetch(`/api/audit-image`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Audit failed: ${response.status}`);
    }

    return response.json();
};

// PROJECT IMAGES (Alt Images Library)
export const getProjectImages = async (projectId: number): Promise<ProjectImage[]> => {
    return apiCall(`/projects/${projectId}/images`);
};

export const createProjectImage = async (projectId: number, data: { image_url: string; title?: string; notes?: string; tags?: string }): Promise<ProjectImage> => {
    return apiCall(`/projects/${projectId}/images`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const updateProjectImage = async (id: number, data: { title?: string; notes?: string; tags?: string; scene_id?: string | null }): Promise<ProjectImage> => {
    return apiCall(`/assets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
};

export const reorderShots = async (sceneId: number, shotIds: number[]): Promise<Shot[]> => {
    return apiCall(`/scenes/${sceneId}/shots/reorder`, {
        method: 'PUT',
        body: JSON.stringify({ shot_ids: shotIds }),
    });
};

export const removeImageFromShot = async (shotId: number, variantId: number): Promise<void> => {
    await apiCall(`/shots/${shotId}/images/${variantId}`, { method: 'DELETE' });
};

export const deleteProjectImage = async (id: number): Promise<void> => {
    await apiCall(`/project-images/${id}`, { method: 'DELETE' });
};

// ── AI Generation History ──────────────────────────────────────

export const getGenerations = async (entityType: string, entityId: number): Promise<any[]> => {
    return apiCall(`/generations/${entityType}/${entityId}`);
};

export const getLatestGeneration = async (entityType: string, entityId: number): Promise<any | null> => {
    return apiCall(`/generations/${entityType}/${entityId}/latest`);
};

export const saveGeneration = async (entityType: string, entityId: number, model: string | null, suggestions: any): Promise<{ id: number }> => {
    return apiCall('/generations', {
        method: 'POST',
        body: JSON.stringify({ entity_type: entityType, entity_id: entityId, model, suggestions }),
    });
};

// ── Entity Reference Images ────────────────────────────────────

export const getEntityImages = async (entityType: string, entityId: number): Promise<any[]> => {
    return apiCall(`/entity-images/${entityType}/${entityId}`);
};

export const saveEntityImage = async (entityType: string, entityId: number, imageType: string, imageUrl: string, label?: string, prompt?: string): Promise<{ id: number }> => {
    return apiCall('/entity-images', {
        method: 'POST',
        body: JSON.stringify({ entity_type: entityType, entity_id: entityId, image_type: imageType, image_url: imageUrl, label, prompt }),
    });
};

export const deleteEntityImage = async (id: number): Promise<void> => {
    await apiCall(`/entity-images/${id}`, { method: 'DELETE' });
};

export const updateEntityImagePrompt = async (id: number, prompt: string): Promise<{ success: boolean }> => {
    return apiCall(`/entity-images/${id}/prompt`, {
        method: 'PATCH',
        body: JSON.stringify({ prompt }),
    });
};

export const analyzeEntityImage = async (imageId: number, targetModel?: string, iterationHistory?: Array<{ version: number; score: number }>): Promise<any> => {
    return apiCall(`/entity-images/${imageId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetModel, iterationHistory }),
    });
};

export const getEntityImageAnalysis = async (imageId: number): Promise<any> => {
    return apiCall(`/entity-images/${imageId}/analysis`);
};

// Generate turnaround prompt (separate from main suggestions — uses stored reference prompt)
export const generateTurnaroundPrompt = async (
    entityType: string,
    entityId: number,
    targetModel?: string,
): Promise<{ turnaroundPrompt: string; turnaroundUsesRef: boolean }> => {
    return apiCall(`/turnaround-prompt/${entityType}/${entityId}`, {
        method: 'POST',
        body: JSON.stringify({ targetModel }),
    });
};

// Deprecated or Unused in Server Mode
export const saveDB = async () => { };
