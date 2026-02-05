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
    status: 'pending' | 'draft' | 'generated' | 'completed' | 'failed';
    analysis_notes?: string;
    created_at: string;
    quality_tier?: string;
    quality_percentage?: number;
    assumptions?: string;
    credits_remaining?: number;
}

export interface UserCredits {
    credits: number;
    tier: string;
}

export interface AIModel {
    id: string;
    name: string;
    type: 'image' | 'video';
}
