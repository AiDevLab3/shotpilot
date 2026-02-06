import type { Project, Character, ObjectItem, Scene, Shot, ImageVariant } from '../types/schema';

// Helper for fetch calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`/api${endpoint}`, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    });
    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
};

// Helper for file uploads (multipart/form-data)
const uploadCall = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
    });

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
    // Missing server endpoint, but not used in UI yet
    console.log('Delete project', id);
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

export const createImageVariant = async (shotId: number, imageUrl: string, prompt: string = ''): Promise<void> => {
    // Note: imageUrl here is essentially the 'reference' path from the upload
    // In local version we passed Base64, now we pass the URL path
    await apiCall(`/shots/${shotId}/images`, {
        method: 'POST',
        body: JSON.stringify({
            image_url: imageUrl,
            prompt_used: prompt
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

export const checkShotQuality = async (shotId: number): Promise<any> => {
    return apiCall(`/shots/${shotId}/check-quality`, {
        method: 'POST'
    });
};

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

// Deprecated or Unused in Server Mode
export const saveDB = async () => { };
