import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KB_ROOT = path.join(__dirname, '../../kb');

// Lite v1.0: 6 curated models (4 image + 2 video)
const LITE_MODELS = {
    'higgsfield': {
        stub: '02_Model_Higgsfield_Cinema_Studio.md',
        name: 'Higgsfield Cinema Studio',
        type: 'image',
        description: 'Photorealistic humans & natural lighting',
        capabilities: 'Best for: Character close-ups, realistic portraits, natural expressions'
    },
    'veo-3.1': {
        stub: '02_Model_VEO_31.md',
        name: 'VEO 3.1',
        type: 'video',
        description: 'Advanced cinematography & camera movement',
        capabilities: 'Best for: Complex camera work, dynamic scenes, professional cinematography'
    },
    'midjourney': {
        stub: '02_Model_Midjourney.md',
        name: 'Midjourney',
        type: 'image',
        description: 'Artistic & stylized imagery',
        capabilities: 'Best for: Concept art, stylized aesthetics, creative interpretations'
    },
    'kling-2.6': {
        stub: '02_Model_Kling_26.md',
        name: 'Kling 2.6',
        type: 'video',
        description: 'Fast iteration & consistency',
        capabilities: 'Best for: Quick drafts, scene consistency, reliable output'
    },
    'gpt-image': {
        stub: '02_Model_GPT_Image.md',
        name: 'GPT Image (DALL-E 3)',
        type: 'image',
        description: 'Text interpretation & creative concepts',
        capabilities: 'Best for: Abstract ideas, text-heavy prompts, conceptual imagery'
    },
    'nano-banana-pro': { // Updated key to match
        stub: '02_Model_Nano_Banana_Pro.md',
        name: 'Nano Banana Pro',
        type: 'image',
        description: 'Natural language image editing & generation',
        capabilities: 'Best for: Image iteration, natural language edits, style refinement'
    }
};

// Supplementary packs (condensed, optimized versions)
const PACK_FILES = {
    character_consistency: '03_Pack_Character_Consistency.md',
    quality_control: '03_Pack_Quality_Control.md',
    motion_readiness: '03_Pack_Motion_Readiness.md',
    spatial_composition: '03_Pack_Spatial_Composition.md',
};

// KB file cache with TTL (re-reads files if modified on disk)
const kbCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function readKBFile(relativePath) {
    const cached = kbCache.get(relativePath);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.content;
    }

    const filepath = path.join(KB_ROOT, relativePath);
    try {
        if (fs.existsSync(filepath)) {
            const content = fs.readFileSync(filepath, 'utf-8');
            // Skip placeholder stubs (contain only "Placeholder content.")
            if (content.trim() && !content.includes('Placeholder content.')) {
                kbCache.set(relativePath, { content, timestamp: Date.now() });
                return content;
            }
        }
    } catch (error) {
        console.warn(`KB read error: ${relativePath} - ${error.message}`);
    }
    kbCache.set(relativePath, { content: null, timestamp: Date.now() });
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

    // 2. Load model-specific condensed guide
    const stubContent = readKBFile(model.stub);
    if (stubContent) {
        combinedKB += `\n\n=== ${model.name} Instructions ===\n\n${stubContent}`;
    } else {
        console.warn(`No KB content found for ${modelName}`);
    }

    // 3. Load supplementary packs based on model type
    //    Image models: character consistency + quality control
    //    Video models: motion readiness + character consistency + quality control
    const packKeys = model.type === 'video'
        ? ['motion_readiness', 'character_consistency', 'quality_control', 'spatial_composition']
        : ['character_consistency', 'quality_control', 'spatial_composition'];

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
        name: id, // Frontend uses 'name' as the ID key based on user request example
        displayName: info.name,
        type: info.type,
        description: info.description,
        capabilities: info.capabilities
    }));
}

export {
    loadKBForModel,
    getAvailableModels,
    readKBFile
};
