import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KB_ROOT = path.join(__dirname, '../../kb');

// Lite v1.0: 6 curated models (4 image + 2 video)
// Maps model ID → KB directory, condensed stub filename, display info
const LITE_MODELS = {
    'higgsfield': {
        dir: 'higgsfield_cinema_studio_v1_5',
        stub: '02_Model_Higgsfield_Cinema_Studio.md',
        name: 'Higgsfield Cinema Studio V1.5',
        type: 'image',
    },
    'midjourney': {
        dir: 'midjourney',
        stub: '02_Model_Midjourney.md',
        name: 'Midjourney',
        type: 'image',
    },
    'nano-banana': {
        dir: 'nano_banana_pro',
        stub: '02_Model_Nano_Banana_Pro.md',
        name: 'Nano Banana Pro',
        type: 'image',
    },
    'gpt-image': {
        dir: 'gpt_image_1_5',
        stub: '02_Model_GPT_Image.md',
        name: 'GPT Image 1.5',
        type: 'image',
    },
    'veo-3.1': {
        dir: 'veo_3_1',
        stub: '02_Model_VEO_31.md',
        name: 'VEO 3.1',
        type: 'video',
    },
    'kling-2.6': {
        dir: 'kling_2_6',
        stub: '02_Model_Kling_26.md',
        name: 'Kling 2.6',
        type: 'video',
    },
};

// Supplementary packs (real content in packs/ directory)
const PACK_FILES = {
    character_consistency: 'packs/Cine-AI_Character_Consistency_Pack_v1.md',
    quality_control:       'packs/Cine-AI_Quality_Control_Pack_v1.md',
    motion_readiness:      'packs/Cine-AI_Motion_Readiness_Pack_v1.md',
};

// KB file cache (avoids re-reading files on every request)
const kbCache = new Map();

function readKBFile(relativePath) {
    if (kbCache.has(relativePath)) {
        return kbCache.get(relativePath);
    }

    const filepath = path.join(KB_ROOT, relativePath);
    try {
        if (fs.existsSync(filepath)) {
            const content = fs.readFileSync(filepath, 'utf-8');
            // Skip placeholder stubs (contain only "Placeholder content.")
            if (content.trim() && !content.includes('Placeholder content.')) {
                kbCache.set(relativePath, content);
                return content;
            }
        }
    } catch (error) {
        console.warn(`KB read error: ${relativePath} - ${error.message}`);
    }
    kbCache.set(relativePath, null);
    return null;
}

function loadKBForModel(modelName) {
    const model = LITE_MODELS[modelName];

    if (!model) {
        throw new Error(`Unknown model: ${modelName}. Available models: ${Object.keys(LITE_MODELS).join(', ')}`);
    }

    let combinedKB = '';

    // 1. Load core realism principles
    const corePrinciples = readKBFile('01_Core_Realism_Principles.md');
    if (corePrinciples) {
        combinedKB += `\n\n=== Core Realism Principles ===\n\n${corePrinciples}`;
    }

    // 2. Load model-specific content
    //    Prefer condensed stub if populated, otherwise use full Prompting Mastery guide
    const stubContent = readKBFile(model.stub);
    const fullGuide = readKBFile(`models/${model.dir}/Prompting_Mastery.md`);

    if (stubContent) {
        combinedKB += `\n\n=== ${model.name} Instructions ===\n\n${stubContent}`;
    } else if (fullGuide) {
        combinedKB += `\n\n=== ${model.name} Prompting Guide ===\n\n${fullGuide}`;
    } else {
        console.warn(`No KB content found for ${modelName} (checked stub + full guide)`);
    }

    // 3. Load supplementary packs based on model type
    //    Image models: character consistency + quality control
    //    Video models: motion readiness + character consistency + quality control
    const packKeys = model.type === 'video'
        ? ['motion_readiness', 'character_consistency', 'quality_control']
        : ['character_consistency', 'quality_control'];

    for (const key of packKeys) {
        const packContent = readKBFile(PACK_FILES[key]);
        if (packContent) {
            combinedKB += `\n\n=== ${key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} ===\n\n${packContent}`;
        }
    }

    // 4. Load translation matrix
    const translationMatrix = readKBFile('04_Translation_Matrix.md');
    if (translationMatrix) {
        combinedKB += `\n\n=== Translation Matrix ===\n\n${translationMatrix}`;
    }

    if (!combinedKB.trim()) {
        throw new Error(`No KB content could be loaded for model: ${modelName}`);
    }

    return combinedKB;
}

function getAvailableModels() {
    return Object.entries(LITE_MODELS).map(([id, info]) => ({
        id,
        name: info.name,
        type: info.type,
    }));
}

export {
    loadKBForModel,
    getAvailableModels
};
