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
    calculateCompleteness
};
