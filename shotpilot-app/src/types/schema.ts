export interface Project {
    id: number;
    title: string;
    frame_size?: string;
    purpose?: string;
    lighting_directions?: string;
    style_aesthetic?: string;
    storyline_narrative?: string;
    cinematography?: string;
    atmosphere_mood?: string;
    cinematic_references?: string;
    created_at: string;
    updated_at: string;
}

export interface Character {
    id: number;
    project_id: number;
    name: string;
    description?: string;
    personality?: string;
    reference_image_url?: string;
    created_at: string;
}

export interface ObjectItem {
    id: number;
    project_id: number;
    name: string;
    description?: string;
    reference_image_url?: string;
    created_at: string;
}

export interface Scene {
    id: number;
    project_id: number;
    name: string;
    description?: string;
    order_index: number;
    status?: 'planning' | 'in-progress' | 'complete';
    location_setting?: string;
    time_of_day?: string;
    weather_atmosphere?: string;
    mood_tone?: string;
    lighting_notes?: string;
    camera_approach?: string;
    characters_present?: string; // JSON string of character ID array
    created_at: string;
}

export interface Shot {
    id: number;
    scene_id: number;
    shot_number: string;
    shot_type: string;
    shot_type_custom?: string;
    camera_angle?: string;
    camera_angle_custom?: string;
    camera_movement?: string;
    camera_movement_custom?: string;
    desired_duration?: number;
    generation_duration?: number;
    focal_length?: string;
    camera_lens?: string;
    description?: string;
    blocking?: string;
    vfx_notes?: string;
    sfx_notes?: string;
    notes?: string;
    status?: 'planning' | 'in-progress' | 'complete';
    order_index?: number;
    created_at: string;
    readiness_tier: string;
    readiness_percentage: number;
    // Backward compat
    quality_tier: string;
    quality_percentage: number;
}


export interface ImageVariant {
    id: number;
    shot_id: number;
    image_url: string;
    model_used?: string;
    prompt_used?: string;
    generated_prompt?: string;
    user_edited_prompt?: string;
    quality_score?: number;
    status: 'unaudited' | 'needs-refinement' | 'locked-in' | 'draft' | 'generated';
    analysis_notes?: string;
    created_at: string;
    readiness_tier?: string;
    readiness_percentage?: number;
    // Backward compat
    quality_tier?: string;
    quality_percentage?: number;
    assumptions?: string;
    credits_remaining?: number;
    // Holistic Image Audit fields
    audit_score?: number;
    audit_recommendation?: 'LOCK IT IN' | 'REFINE' | 'REGENERATE';
    audit_data?: string; // JSON string of 6-dimension scores
    // Iteration tracking
    iteration_number?: number;
    parent_variant_id?: number;
}

export interface ImageAuditResult {
    overall_score: number;
    recommendation: 'LOCK IT IN' | 'REFINE' | 'REGENERATE';
    dimensions: {
        physics: { score: number; notes: string };
        style_consistency: { score: number; notes: string };
        lighting_atmosphere: { score: number; notes: string };
        clarity: { score: number; notes: string };
        composition: { score: number; notes: string };
        character_identity: { score: number; notes: string };
    };
    issues: string[];
    prompt_adjustments: string[];
    realism_diagnosis?: Array<{
        pattern: 'AI Plastic Look' | 'Flat / Lifeless' | 'CGI / Game Engine Look' | 'Lighting Drift';
        severity: 'severe' | 'moderate';
        details: string;
        fix: string;
    }>;
    summary: string;
}

export interface UserCredits {
    credits: number;
    tier: string;
}

export interface AIModel {
    name: string;
    displayName: string;
    type: 'image' | 'video';
    description?: string;
    capabilities?: string;
}

export interface AestheticSuggestion {
    field: string;
    value: string;
    reasoning: string;
    alternatives?: string[];
}

export interface CharacterSuggestions {
    description: string;
    personality: string;
    referencePrompt: string;
    turnaroundPrompt?: string;
    turnaroundUsesRef?: boolean;
    turnaroundPrompts?: string[]; // legacy — old generations may still have this
    consistencyTips: string[];
    recommendedModel?: string | null;
    recommendedModelReason?: string | null;
}

export interface ShotPlanShot {
    shot_number: string;
    shot_type: string;
    camera_angle?: string;
    camera_movement?: string;
    focal_length?: string;
    description: string;
    blocking?: string;
    purpose: string;
}

export interface ShotPlan {
    shots: ShotPlanShot[];
    sequenceReasoning: string;
}

export interface QualityDialogueResponse {
    response: string;
}

export interface ScriptScene {
    name: string;
    description: string;
    location_setting?: string;
    time_of_day?: string;
    mood_tone?: string;
    suggestedShots: {
        shot_type: string;
        camera_angle?: string;
        description: string;
        purpose: string;
    }[];
}

export interface ScriptAnalysis {
    scenes: ScriptScene[];
    characters: { name: string; description: string }[];
    summary: string;
}

export interface ProjectImage {
    id: number;
    project_id: number;
    image_url: string;
    title?: string;
    notes?: string;
    tags?: string;
    created_at: string;
}

export interface ObjectSuggestions {
    description: string;
    referencePrompt: string;
    turnaroundPrompt?: string;
    turnaroundUsesRef?: boolean;
    turnaroundPrompts?: string[]; // legacy — old generations may still have this
    consistencyTips: string[];
    recommendedModel?: string | null;
    recommendedModelReason?: string | null;
}
