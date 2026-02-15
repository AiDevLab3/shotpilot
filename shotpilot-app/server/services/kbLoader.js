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
        stub: 'models/midjourney/Prompting_Mastery.md',
        name: 'Midjourney',
        type: 'image',
        description: 'Artistic & stylized imagery with V7 personalization, character consistency & draft mode',
        capabilities: 'Best for: Concept art, stylized aesthetics, photorealistic stills, character/object consistency via --oref (Omni Reference)'
    },
    'kling-2.6': {
        stub: '02_Model_Kling_26.md',
        name: 'Kling 2.6',
        type: 'video',
        description: 'Fast iteration & consistency',
        capabilities: 'Best for: Quick drafts, scene consistency, reliable output'
    },
    'gpt-image': {
        stub: 'models/gpt_image_1_5/Prompting_Mastery.md',
        name: 'GPT Image 1.5',
        type: 'image',
        description: 'Natively multimodal LLM with photorealism, multi-image editing & text rendering',
        capabilities: 'Best for: Photorealistic stills, image editing/iteration, multi-image compositing, text rendering, character consistency'
    },
    'kling-3.0': {
        stub: 'models/kling-3.0.md',
        name: 'Kling 3.0',
        type: 'video',
        description: 'Multi-shot intelligence & 15s duration',
        capabilities: 'Best for: Multi-character dialogue, complete narrative arcs, character-driven stories with Elements 3.0'
    },
    'nano-banana-pro': {
        stub: 'models/nano_banana_pro/Prompting_Mastery.md',
        name: 'Nano Banana Pro',
        type: 'image',
        description: 'Thinking model with conversational editing, 4K output & reference image support',
        capabilities: 'Best for: Natural language editing, 4K asset production, text rendering (100+ languages), character consistency (up to 14 reference images), physics-aware composition'
    }
};

// Supplementary packs (condensed, optimized versions)
const PACK_FILES = {
    character_consistency: '03_Pack_Character_Consistency.md',
    image_quality_control: '03_Pack_Image_Quality_Control.md',
    video_quality_control: '03_Pack_Video_Quality_Control.md',
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
        ? ['motion_readiness', 'character_consistency', 'video_quality_control', 'spatial_composition']
        : ['character_consistency', 'image_quality_control', 'spatial_composition'];

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
