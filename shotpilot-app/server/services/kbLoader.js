import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KB_ROOT = path.join(__dirname, '../../kb');

// Each model: dir name in kb/models/, display name, type (image/video)
const MODEL_REGISTRY = {
    'midjourney':           { dir: 'midjourney',                    name: 'Midjourney',                 type: 'image' },
    'flux-2':               { dir: 'flux_2',                        name: 'Flux 2',                     type: 'image' },
    'gpt-image':            { dir: 'gpt_image_1_5',                 name: 'GPT Image 1.5',              type: 'image' },
    'grok-imagine':         { dir: 'grok_imagine',                  name: 'Grok Imagine',               type: 'image' },
    'seedream-4.5':         { dir: 'seedream_4_5',                  name: 'Seedream 4.5',               type: 'image' },
    'nano-banana-pro':      { dir: 'nano_banana_pro',               name: 'Nano Banana Pro',            type: 'image' },
    'reve':                 { dir: 'reve',                          name: 'Reve',                       type: 'image' },
    'wan-2.2-image':        { dir: 'wan_2_2_image',                 name: 'Wan 2.2 Image',              type: 'image' },
    'z-image':              { dir: 'z_image',                       name: 'Z Image',                    type: 'image' },
    'kling-o1-image':       { dir: 'kling_o1_image',                name: 'Kling O1 Image',             type: 'image' },
    'topaz':                { dir: 'topaz',                         name: 'Topaz (Upscaler)',           type: 'image' },
    'kling-2.6':            { dir: 'kling_2_6',                     name: 'Kling 2.6',                  type: 'video' },
    'kling-avatars':        { dir: 'kling_avatars_2_0',             name: 'Kling Avatars 2.0',          type: 'video' },
    'kling-motion':         { dir: 'kling_motion_control',          name: 'Kling Motion Control',       type: 'video' },
    'kling-o1-edit':        { dir: 'kling_o1_edit',                 name: 'Kling O1 Edit',              type: 'video' },
    'runway-gen4.5':        { dir: 'runway_gen4_5',                 name: 'Runway Gen-4.5',             type: 'video' },
    'veo-3.1':              { dir: 'veo_3_1',                       name: 'Veo 3.1',                    type: 'video' },
    'sora-2':               { dir: 'sora_2',                        name: 'Sora 2',                     type: 'video' },
    'higgsfield':           { dir: 'higgsfield_cinema_studio_v1_5', name: 'Higgsfield Cinema Studio',   type: 'video' },
    'higgsfield-dop':       { dir: 'higgsfield_dop',                name: 'Higgsfield DOP',             type: 'video' },
    'minimax-hailuo':       { dir: 'minimax_hailuo_02',             name: 'MiniMax Hailuo 02',          type: 'video' },
    'seedance':             { dir: 'seedance_1_5_pro',              name: 'Seedance 1.5 Pro',           type: 'video' },
    'wan-2.6':              { dir: 'wan_2_6',                       name: 'Wan 2.6',                    type: 'video' },
};

// Supplementary packs loaded based on model type
const PACK_FILES = {
    image: [
        'packs/Cine-AI_Character_Consistency_Pack_v1.md',
        'packs/Cine-AI_Quality_Control_Pack_v1.md',
    ],
    video: [
        'packs/Cine-AI_Motion_Readiness_Pack_v1.md',
        'packs/Cine-AI_Character_Consistency_Pack_v1.md',
        'packs/Cine-AI_Quality_Control_Pack_v1.md',
    ],
};

function readKBFile(relativePath) {
    const filepath = path.join(KB_ROOT, relativePath);
    try {
        if (fs.existsSync(filepath)) {
            return fs.readFileSync(filepath, 'utf-8');
        }
    } catch (error) {
        console.warn(`KB read error: ${relativePath} - ${error.message}`);
    }
    return null;
}

function loadKBForModel(modelName) {
    const model = MODEL_REGISTRY[modelName];

    if (!model) {
        throw new Error(`Unknown model: ${modelName}. Available: ${Object.keys(MODEL_REGISTRY).join(', ')}`);
    }

    let combinedKB = '';

    // 1. Load model-specific Prompting Mastery guide
    const modelKB = readKBFile(`models/${model.dir}/Prompting_Mastery.md`);
    if (modelKB) {
        combinedKB += `\n\n=== ${model.name} Prompting Guide ===\n\n${modelKB}`;
    } else {
        console.warn(`KB file missing for model: ${modelName} (models/${model.dir}/Prompting_Mastery.md)`);
    }

    // 2. Load supplementary packs based on model type
    const packs = PACK_FILES[model.type] || [];
    for (const packFile of packs) {
        const packContent = readKBFile(packFile);
        if (packContent) {
            combinedKB += `\n\n=== ${path.basename(packFile, '.md')} ===\n\n${packContent}`;
        }
    }

    if (!combinedKB.trim()) {
        throw new Error(`No KB content could be loaded for model: ${modelName}`);
    }

    return combinedKB;
}

function getAvailableModels() {
    return Object.entries(MODEL_REGISTRY).map(([id, info]) => ({
        id,
        name: info.name,
        type: info.type,
    }));
}

export {
    loadKBForModel,
    getAvailableModels
};
