import { readKBFile } from './kbLoader.js';
import { analyzeReadiness } from './geminiService.js';

/**
 * Fast local completeness check (no API call).
 * Scores how completely a shot's fields are defined for prompt generation.
 * This is "Prompt Readiness" — NOT image quality analysis.
 */
function calculateCompleteness(project, scene, shot) {
    // 1. Definition: Shot Specifics (80% of score)
    // These define "The Shot" itself. Without these, it's just a scene description.
    const shotWeights = {
        shot_description: 25, // Core visual
        shot_type: 20,        // Critical framing
        camera_angle: 15,     // Critical perspective
        camera_movement: 10,  // Motion
        focal_length: 5,      // Technical detail
        blocking: 5,          // Action
        camera_lens: 5        // Equipment
        // Total: 85 points available
    };

    // 2. Context: Scene/Project (20% of score)
    // These are important but shouldn't pass a shot on their own.
    const contextWeights = {
        scene_lighting_notes: 5,
        scene_mood_tone: 5,
        style_aesthetic: 5,
        scene_location_setting: 5,
        scene_time_of_day: 5
        // Total: 25 points available
    };

    let shotScore = 0;
    let shotMax = 0;
    let contextScore = 0;
    let contextMax = 0;
    let missing = [];

    const fieldMap = {
        shot_description: shot?.description,
        shot_type: shot?.shot_type,
        camera_angle: shot?.camera_angle,
        camera_movement: shot?.camera_movement,
        focal_length: shot?.focal_length,
        blocking: shot?.blocking,
        camera_lens: shot?.camera_lens,

        scene_lighting_notes: scene?.lighting_notes,
        scene_mood_tone: scene?.mood_tone,
        style_aesthetic: project?.style_aesthetic,
        scene_location_setting: scene?.location_setting,
        scene_time_of_day: scene?.time_of_day,
    };

    // Calculate Shot Score
    for (const [field, weight] of Object.entries(shotWeights)) {
        shotMax += weight;
        const value = fieldMap[field];
        if (value && value.trim() !== '') {
            shotScore += weight;
        } else if (weight >= 10) {
            // Track missing critical/important fields
            missing.push({
                field,
                weight,
                label: getFieldLabel(field),
                description: getFieldDescription(field)
            });
        }
    }

    // Calculate Context Score
    for (const [field, weight] of Object.entries(contextWeights)) {
        contextMax += weight;
        const value = fieldMap[field];
        if (value && value.trim() !== '') {
            contextScore += weight;
        } else {
            // Context usually missing at scene/project level, but track if needed
            if (weight >= 5) {
                missing.push({
                    field,
                    weight,
                    label: getFieldLabel(field),
                    description: getFieldDescription(field)
                });
            }
        }
    }

    // Normalizing logic:
    // Shot fields are the primary driver. 
    // If NO shot fields are present, score should be near 0 even if context is full.

    // Calculate raw percentages
    const shotPercent = shotMax > 0 ? (shotScore / shotMax) : 0;
    const contextPercent = contextMax > 0 ? (contextScore / contextMax) : 0;

    // Final Weighted Score:
    // 80% Shot Specifics + 20% Context
    // Example: Empty shot (0%) + Full Context (100%) = 0 + 20 = 20% Total.
    const finalPercentage = Math.round((shotPercent * 80) + (contextPercent * 20));

    return {
        score: finalPercentage, // Use percentage as the score for consistency
        maxScore: 100,
        percentage: finalPercentage,
        tier: finalPercentage >= 70 ? 'production' : 'draft',
        missingCritical: missing.filter(f => f.weight >= 20),
        missingImportant: missing.filter(f => f.weight >= 10 && f.weight < 20),
        needsGuidance: finalPercentage < 70,
        allMissing: missing
    };
}

/**
 * KB-guided prompt readiness check using Gemini + Knowledge Base.
 * Loads KB files based on project context and returns expert analysis
 * of how well-defined the shot is for prompt generation.
 */
async function checkReadinessWithKB(context) {
    const { project, scene, shot, characters, objects } = context;

    // Load KB files for quality analysis (condensed, optimized versions)
    const kbFiles = [
        '01_Core_Realism_Principles.md',
        '03_Pack_Image_Quality_Control.md',
        '03_Pack_Spatial_Composition.md',
    ];

    // Add Character Pack if characters exist
    const hasCharacters = characters && characters.length > 0;
    if (hasCharacters) {
        kbFiles.push('03_Pack_Character_Consistency.md');
    }

    // Add model-specific file if preferred model is known
    // Uses the same stub paths as LITE_MODELS in kbLoader.js for consistency
    if (shot?.preferred_model) {
        const modelStubs = {
            'higgsfield': '02_Model_Higgsfield_Cinema_Studio.md',
            'midjourney': 'models/midjourney/Prompting_Mastery.md',
            'nano-banana-pro': 'models/nano_banana_pro/Prompting_Mastery.md',
            'gpt-image': 'models/gpt_image_1_5/Prompting_Mastery.md',
            'veo-3.1': '02_Model_VEO_31.md',
            'kling-2.6': '02_Model_Kling_26.md',
            'kling-3.0': 'models/kling-3.0.md',
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
        console.warn('[readinessCheck] No KB content available, falling back to basic check');
        return calculateCompleteness(project, scene, shot);
    }

    try {
        const analysis = await analyzeReadiness({
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
    checkReadinessWithKB
};
