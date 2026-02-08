import { readKBFile } from './kbLoader.js';
import { analyzeQuality } from './geminiService.js';

/**
 * Fast local completeness check (no API call).
 * Used for quick scoring before deciding whether to show recommendations.
 */
function calculateCompleteness(project, scene, shot) {
    const weights = {
        shot_description: 10,
        shot_type: 10,
        camera_angle: 10,
        camera_movement: 7,
        scene_lighting_notes: 7,
        scene_mood_tone: 7,
        style_aesthetic: 5,
        focal_length: 5,
        scene_location_setting: 5,
        scene_time_of_day: 3,
        blocking: 3,
        camera_lens: 3
    };

    let score = 0;
    let maxScore = 0;
    let missing = [];

    const fieldMap = {
        shot_description: shot?.description,
        shot_type: shot?.shot_type,
        camera_angle: shot?.camera_angle,
        camera_movement: shot?.camera_movement,
        scene_lighting_notes: scene?.lighting_notes,
        scene_mood_tone: scene?.mood_tone,
        style_aesthetic: project?.style_aesthetic,
        focal_length: shot?.focal_length,
        scene_location_setting: scene?.location_setting,
        scene_time_of_day: scene?.time_of_day,
        blocking: shot?.blocking,
        camera_lens: shot?.camera_lens
    };

    for (const [field, weight] of Object.entries(weights)) {
        maxScore += weight;
        const value = fieldMap[field];

        if (value && value.trim() !== '') {
            score += weight;
        } else if (weight >= 7) {
            missing.push({
                field,
                weight,
                label: getFieldLabel(field),
                description: getFieldDescription(field)
            });
        }
    }

    const percentage = Math.round((score / maxScore) * 100);

    return {
        score,
        maxScore,
        percentage,
        tier: percentage >= 70 ? 'production' : 'draft',
        missingCritical: missing.filter(f => f.weight === 10),
        missingImportant: missing.filter(f => f.weight === 7),
        needsGuidance: percentage < 70,
        allMissing: missing
    };
}

/**
 * FIX 2: KB-guided quality check using Gemini + Knowledge Base.
 * Loads KB files based on project context and returns expert analysis.
 */
async function checkQualityWithKB(context) {
    const { project, scene, shot, characters, objects } = context;

    // Load KB files for quality analysis (condensed, optimized versions)
    const kbFiles = [
        '01_Core_Realism_Principles.md',
        '03_Pack_Quality_Control.md',
        '03_Pack_Spatial_Composition.md',
    ];

    // Add Character Pack if characters exist
    const hasCharacters = characters && characters.length > 0;
    if (hasCharacters) {
        kbFiles.push('03_Pack_Character_Consistency.md');
    }

    // Add model-specific file if preferred model is known
    if (shot?.preferred_model) {
        const modelStubs = {
            'higgsfield': '02_Model_Higgsfield_Cinema_Studio.md',
            'midjourney': '02_Model_Midjourney.md',
            'nano-banana': '02_Model_Nano_Banana_Pro.md',
            'gpt-image': '02_Model_GPT_Image.md',
            'veo-3.1': '02_Model_VEO_31.md',
            'kling-2.6': '02_Model_Kling_26.md',
        };
        const stub = modelStubs[shot.preferred_model];
        if (stub) {
            kbFiles.push(stub);
        }
    }

    // Load and combine KB content
    const kbContent = kbFiles
        .map(f => readKBFile(f))
        .filter(Boolean)
        .join('\n\n---\n\n');

    if (!kbContent.trim()) {
        // Fallback to basic check if no KB content available
        console.warn('[qualityCheck] No KB content available, falling back to basic check');
        return calculateCompleteness(project, scene, shot);
    }

    try {
        const analysis = await analyzeQuality({
            context: { project, scene, shot, characters, objects },
            kbContent,
            thinkingLevel: 'high',
        });

        return {
            percentage: analysis.completeness,
            tier: analysis.tier,
            missingFields: analysis.missingFields || [],
            expertRecommendations: (analysis.missingFields || []).map(f => ({
                field: f.field,
                label: f.label,
                recommendation: f.recommendation,
                reasoning: f.reasoning,
                alternatives: f.alternatives || [],
            })),
            // Also include basic check fields for backward compatibility
            needsGuidance: analysis.tier === 'draft',
            allMissing: (analysis.missingFields || []).map(f => ({
                field: f.field,
                weight: 7,
                label: f.label,
                description: f.reasoning,
            })),
        };
    } catch (error) {
        console.error('[qualityCheck] KB-guided check failed, falling back to basic:', error.message);
        // Fallback to basic check on Gemini error
        return calculateCompleteness(project, scene, shot);
    }
}

function getFieldLabel(field) {
    const labels = {
        shot_description: 'Shot Description',
        shot_type: 'Shot Type',
        camera_angle: 'Camera Angle',
        camera_movement: 'Camera Movement',
        scene_lighting_notes: 'Scene Lighting',
        scene_mood_tone: 'Scene Mood/Tone',
        style_aesthetic: 'Project Style',
        focal_length: 'Focal Length',
        scene_location_setting: 'Scene Location',
        scene_time_of_day: 'Time of Day',
        blocking: 'Blocking/Staging',
        camera_lens: 'Camera/Lens'
    };
    return labels[field] || field;
}

function getFieldDescription(field) {
    const descriptions = {
        camera_angle: 'Defines the viewer\'s perspective and emotional relationship to the subject',
        camera_movement: 'Adds energy, tension, or stillness to the shot',
        scene_lighting_notes: 'Sets mood and atmosphere - lighting is 50% of cinematography',
        focal_length: 'Affects field of view and perspective distortion',
        scene_mood_tone: 'The emotional feeling that guides all creative decisions',
        camera_lens: 'Specific lens characteristics affect image quality and aesthetic',
        blocking: 'How subjects move through the space - choreography of the shot'
    };
    return descriptions[field] || '';
}

export {
    calculateCompleteness,
    checkQualityWithKB
};
