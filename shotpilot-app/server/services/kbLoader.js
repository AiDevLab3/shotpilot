import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODEL_KB_MAP = {
    'midjourney-v7': ['midjourney_v7.md', 'character_consistency.md', 'translation_matrix.md'],
    'runway-gen3': ['runway_gen3.md', 'translation_matrix.md'],
    'kling-1.6': ['kling_1.6.md', 'translation_matrix.md'],
    'kling-1.6-img': ['kling_1.6.md', 'translation_matrix.md'],
    'flux-pro': ['flux_pro.md', 'translation_matrix.md'],
    'ideogram-v2': ['ideogram_v2.md', 'translation_matrix.md'],
    'imagen-3': ['imagen_3.md', 'translation_matrix.md'],
    'veo-2': ['veo_2.md', 'translation_matrix.md'],
    'veo-3.1': ['veo_3.1.md', 'translation_matrix.md'],
    'sora': ['sora.md', 'translation_matrix.md']
};

function loadKBForModel(modelName) {
    // kb is in root/kb, so from server/services we go: ../../kb
    const kbDir = path.join(__dirname, '../../kb');
    const files = MODEL_KB_MAP[modelName] || [];

    if (files.length === 0) {
        throw new Error(`No KB files configured for model: ${modelName}`);
    }

    let combinedKB = '';

    for (const filename of files) {
        const filepath = path.join(kbDir, filename);

        try {
            if (fs.existsSync(filepath)) {
                const content = fs.readFileSync(filepath, 'utf-8');
                combinedKB += `\n\n=== ${filename} ===\n\n${content}`;
            } else {
                console.warn(`KB file not found: ${filename} (skipping)`);
            }
        } catch (error) {
            console.error(`Error loading KB file ${filename}:`, error.message);
            // We don't throw here to allow partial loading if one file fails
        }
    }

    return combinedKB;
}

function getAvailableModels() {
    return [
        { id: 'midjourney-v7', name: 'Midjourney v7', type: 'image' },
        { id: 'runway-gen3', name: 'Runway Gen-3', type: 'video' },
        { id: 'kling-1.6', name: 'Kling 1.6 Video', type: 'video' },
        { id: 'kling-1.6-img', name: 'Kling 1.6 Image', type: 'image' },
        { id: 'flux-pro', name: 'Flux Pro', type: 'image' },
        { id: 'ideogram-v2', name: 'Ideogram v2', type: 'image' },
        { id: 'imagen-3', name: 'Imagen 3', type: 'image' },
        { id: 'veo-2', name: 'Veo 2', type: 'video' },
        { id: 'veo-3.1', name: 'Veo 3.1', type: 'video' },
        { id: 'sora', name: 'Sora', type: 'video' }
    ];
}

export {
    loadKBForModel,
    getAvailableModels
};
