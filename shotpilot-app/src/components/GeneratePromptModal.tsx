import React, { useEffect, useState, useCallback } from 'react';
import type { AIModel, Shot, Scene, Project } from '../types/schema';
import { X, Sparkles, Loader2, Copy, Check, Clapperboard, Camera, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { getAvailableModels, generatePrompt, checkShotReadiness, updateShot, updateScene, updateProject } from '../services/api';

interface MissingField {
    field: string;
    weight: number;
    label: string;
    description: string;
    source: 'shot' | 'scene' | 'project';
}

interface ReadinessData {
    score: number;
    percentage: number;
    tier: 'draft' | 'production';
    allMissing: MissingField[];
}

interface GenerationResult {
    prompt: string;
    assumptions: string;
    modelName: string;
    qualityTier: string;
    creditsRemaining: number;
}

interface GeneratePromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    shot: Shot;
    scene: Scene;
    project: Project;
    modelType?: 'image' | 'video';
    onGenerated?: () => void;
    shotId?: number;
    shotContext?: any;
    currentCredits?: number;
}

// Maps qualityCheck field names → actual API field names
const FIELD_TO_API: Record<string, string> = {
    shot_description: 'description',
    shot_type: 'shot_type',
    camera_angle: 'camera_angle',
    camera_movement: 'camera_movement',
    focal_length: 'focal_length',
    blocking: 'blocking',
    camera_lens: 'camera_lens',
    scene_lighting_notes: 'lighting_notes',
    scene_mood_tone: 'mood_tone',
    style_aesthetic: 'style_aesthetic',
    scene_location_setting: 'location_setting',
    scene_time_of_day: 'time_of_day',
};

// Determine save target from field name (no backend dependency)
function getFieldSource(field: string): 'shot' | 'scene' | 'project' {
    if (field.startsWith('scene_')) return 'scene';
    if (field === 'style_aesthetic') return 'project';
    return 'shot';
}

// Dropdown options for fields that have preset choices
const DROPDOWN_OPTIONS: Record<string, string[]> = {
    shot_type: ['Wide', 'Medium', 'Close-up', 'Extreme Close-up'],
    camera_angle: ['Eye Level', 'Low Angle', 'High Angle', "Bird's Eye", 'Dutch Angle', "Worm's Eye", 'Over the Shoulder'],
    camera_movement: ['Static', 'Pan', 'Tilt', 'Dolly', 'Handheld'],
};

export function GeneratePromptModal({
    isOpen,
    onClose,
    shot,
    scene,
    project,
    modelType = 'image',
    onGenerated,
}: GeneratePromptModalProps) {
    const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
    const [model, setModel] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<GenerationResult | null>(null);
    const [copied, setCopied] = useState(false);
    const [readiness, setReadiness] = useState<ReadinessData | null>(null);
    const [showGaps, setShowGaps] = useState(false);
    const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
    const [savingField, setSavingField] = useState<string | null>(null);
    const [savedFields, setSavedFields] = useState<Set<string>>(new Set());

    // Cost estimates per image by model
    const MODEL_COSTS: Record<string, { cost: string; note?: string }> = {
        'flux-2': { cost: '$0.03' },
        'gpt-image-1.5': { cost: '$0.05' },
        'grok-imagine': { cost: '$0.02', note: 'cheapest — great for iteration' },
        'kling-image-v3': { cost: '$0.04' },
        'nano-banana-pro': { cost: '$0.04' },
        'seedream-4.5': { cost: '$0.03' },
        'flux-kontext': { cost: '$0.03' },
        'reve': { cost: '$0.03', note: 'edit only — needs input image' },
        'topaz': { cost: '$0.02', note: 'upscale only' },
        'midjourney': { cost: 'N/A', note: 'prompt-only — use in Discord/web' },
    };

    const isVideoMode = modelType === 'video';
    const Icon = isVideoMode ? Clapperboard : Camera;
    const modelLabel = isVideoMode ? 'VIDEO MODEL' : 'STORYBOARD MODEL';

    const theme = isVideoMode ? {
        accent: '#a855f7',
        bg: '#581c87',
        border: 'rgba(168, 85, 247, 0.3)',
    } : {
        accent: '#14b8a6',
        bg: '#0f766e',
        border: 'rgba(20, 184, 166, 0.3)',
    };

    useEffect(() => {
        if (isOpen) {
            setResult(null);
            setError(null);
            setCopied(false);
            setLoading(true);
            setShowGaps(false);
            setFieldValues({});
            setSavedFields(new Set());
            fetchData();
        }
    }, [isOpen, modelType, shot?.id]);

    const fetchData = async () => {
        try {
            const models = await getAvailableModels();
            const filtered = models.filter((m: AIModel) => m.type === modelType);
            setAvailableModels(filtered);

            if (filtered.length > 0) {
                const defaultName = isVideoMode ? 'veo-3.1' : 'higgsfield';
                const hasDefault = filtered.find((m: AIModel) => m.name === defaultName);
                setModel(hasDefault ? defaultName : filtered[0].name);
            } else {
                setModel('');
            }

            if (shot?.id) {
                const rs = await checkShotReadiness(shot.id).catch(() => null);
                if (rs) setReadiness(rs);
            }
        } catch (err) {
            console.error('Failed to load modal data:', err);
            setError('Failed to load available models.');
        } finally {
            setLoading(false);
        }
    };

    // Fast refresh — uses basic local check only (no slow Gemini call)
    const refreshReadiness = useCallback(async () => {
        if (!shot?.id) return;
        const rs = await checkShotReadiness(shot.id, false).catch(() => null);
        if (rs) setReadiness(rs);
    }, [shot?.id]);

    const handleSaveField = async (field: string, value: string) => {
        if (!value.trim()) return;
        const apiField = FIELD_TO_API[field];
        if (!apiField) return;

        setSavingField(field);
        try {
            const source = getFieldSource(field);

            if (source === 'shot') {
                await updateShot(shot.id, { [apiField]: value } as any);
            } else if (source === 'scene' && scene?.id) {
                await updateScene(scene.id, { [apiField]: value } as any);
            } else if (source === 'project' && project?.id) {
                await updateProject(project.id, { [apiField]: value } as any);
            }

            // Brief "saved" flash before hiding the field
            setSavedFields(prev => new Set(prev).add(field));
            // Instant score refresh (basic check, no Gemini delay)
            await refreshReadiness();
        } catch (err) {
            console.error('Failed to save field:', field, err);
        } finally {
            setSavingField(null);
        }
    };

    const handleGenerate = async () => {
        if (!model) return;
        setGenerating(true);
        setError(null);
        try {
            const res = await generatePrompt(shot.id, model);
            const modelObj = availableModels.find(m => m.name === model);
            setResult({
                prompt: res.generated_prompt || '',
                assumptions: res.assumptions || '',
                modelName: modelObj?.displayName || model,
                qualityTier: res.quality_tier || 'draft',
                creditsRemaining: res.credits_remaining || 0,
            });
            if (onGenerated) onGenerated();
        } catch (err: any) {
            console.error('Generation Error:', err);
            setError(err.message || 'Failed to generate prompt');
        } finally {
            setGenerating(false);
        }
    };

    const handleCopy = () => {
        if (result?.prompt) {
            navigator.clipboard.writeText(result.prompt);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!isOpen) return null;

    const missingFields = readiness?.allMissing?.filter((f: MissingField) => !savedFields.has(f.field)) || [];
    const score = readiness?.score ?? readiness?.percentage ?? 0;
    const tier = readiness?.tier || 'draft';
    const scoreColor = tier === 'production' ? '#10b981' : '#fbbf24';
    const hasMissing = missingFields.length > 0;

    // Split missing fields into shot vs context (client-side detection)
    const missingShotFields = missingFields.filter((f: MissingField) => getFieldSource(f.field) === 'shot');
    const missingContextFields = missingFields.filter((f: MissingField) => getFieldSource(f.field) !== 'shot');

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                {/* Header */}
                <div style={styles.header}>
                    <h3 style={styles.title}>
                        <Icon size={20} color={theme.accent} />
                        {isVideoMode ? 'Generate Video Prompt' : 'Generate Image Prompt'}
                    </h3>
                    <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>
                </div>

                <div style={styles.divider} />

                <div style={styles.body}>
                    {!result ? (
                        <>
                            {/* Context */}
                            <div style={styles.contextBox}>
                                <div style={styles.contextLabel}>CONTEXT</div>
                                <div style={styles.contextRow}>
                                    <span style={{ color: '#6b7280' }}>Shot:</span>{' '}
                                    <span style={{ color: 'white', fontWeight: 600 }}>{shot.shot_number}</span>
                                </div>
                                <div style={styles.contextRow}>
                                    <span style={{ color: '#6b7280' }}>Scene:</span>{' '}
                                    <span style={{ color: 'white' }}>{scene?.name || 'Unknown'}</span>
                                </div>

                                {/* Readiness Score */}
                                {readiness && (
                                    <div style={{ marginTop: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                            <span style={{ color: '#6b7280', fontSize: '13px' }}>Prompt Readiness</span>
                                            <span style={{ color: scoreColor, fontWeight: 700, fontSize: '13px' }}>
                                                {score} / 100
                                            </span>
                                        </div>
                                        {/* Progress bar */}
                                        <div style={{
                                            height: '6px',
                                            backgroundColor: '#3f3f46',
                                            borderRadius: '3px',
                                            overflow: 'hidden',
                                        }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${score}%`,
                                                backgroundColor: scoreColor,
                                                borderRadius: '3px',
                                                transition: 'width 0.4s ease',
                                            }} />
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                                            {tier === 'production'
                                                ? 'Ready for generation'
                                                : `${missingFields.length} field${missingFields.length !== 1 ? 's' : ''} can improve your prompt`
                                            }
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Fill gaps section */}
                            {hasMissing && (
                                <div style={{
                                    marginBottom: '16px',
                                    border: '1px solid #3f3f46',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                }}>
                                    <button
                                        onClick={() => setShowGaps(!showGaps)}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '10px 12px',
                                            backgroundColor: '#1e1e22',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#fbbf24',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                        }}
                                    >
                                        <span>Fill gaps to improve score ({missingFields.length} remaining)</span>
                                        {showGaps ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                    </button>

                                    {showGaps && (
                                        <div style={{
                                            padding: '12px',
                                            backgroundColor: '#18181b',
                                            maxHeight: '280px',
                                            overflowY: 'auto',
                                        }}>
                                            {/* Shot fields */}
                                            {missingShotFields.length > 0 && (
                                                <>
                                                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                                                        Shot Fields
                                                    </div>
                                                    {missingShotFields.map(f => (
                                                        <FieldEditor
                                                            key={f.field}
                                                            field={f}
                                                            value={fieldValues[f.field] || ''}
                                                            onChange={(v) => setFieldValues(prev => ({ ...prev, [f.field]: v }))}
                                                            onSave={(v) => handleSaveField(f.field, v)}
                                                            saving={savingField === f.field}
                                                        />
                                                    ))}
                                                </>
                                            )}

                                            {/* Context fields */}
                                            {missingContextFields.length > 0 && (
                                                <>
                                                    <div style={{
                                                        fontSize: '10px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em',
                                                        marginBottom: '8px', marginTop: missingShotFields.length > 0 ? '12px' : '0',
                                                    }}>
                                                        Scene / Project
                                                    </div>
                                                    {missingContextFields.map(f => (
                                                        <FieldEditor
                                                            key={f.field}
                                                            field={f}
                                                            value={fieldValues[f.field] || ''}
                                                            onChange={(v) => setFieldValues(prev => ({ ...prev, [f.field]: v }))}
                                                            onSave={(v) => handleSaveField(f.field, v)}
                                                            saving={savingField === f.field}
                                                        />
                                                    ))}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Model Selection */}
                            <div style={styles.formGroup}>
                                <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Icon size={14} color={theme.accent} />
                                    <span style={{ color: theme.accent }}>{modelLabel}</span>
                                </label>

                                {loading ? (
                                    <div style={{ color: '#6b7280', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Loader2 size={16} className="spin" /> Loading models...
                                    </div>
                                ) : (
                                    <>
                                        <select
                                            value={model}
                                            onChange={(e) => setModel(e.target.value)}
                                            style={{ ...styles.select, borderColor: theme.border }}
                                        >
                                            {availableModels.map(m => (
                                                <option key={m.name} value={m.name}>{m.displayName}</option>
                                            ))}
                                        </select>

                                        {model && (
                                            <div style={{
                                                marginTop: '8px',
                                                fontSize: '12px',
                                                color: '#9ca3af',
                                                background: 'rgba(255,255,255,0.03)',
                                                padding: '8px',
                                                borderRadius: '4px',
                                            }}>
                                                {availableModels.find(m => m.name === model)?.capabilities || availableModels.find(m => m.name === model)?.description}
                                            </div>
                                        )}

                                        {/* Cost estimate */}
                                        {model && MODEL_COSTS[model] && (
                                            <div style={{
                                                marginTop: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '8px 12px',
                                                backgroundColor: 'rgba(251, 191, 36, 0.08)',
                                                border: '1px solid rgba(251, 191, 36, 0.2)',
                                                borderRadius: '6px',
                                            }}>
                                                <span style={{ fontSize: '14px' }}>💰</span>
                                                <span style={{ color: '#fbbf24', fontSize: '13px', fontWeight: 600 }}>
                                                    {MODEL_COSTS[model].cost}/image
                                                </span>
                                                {MODEL_COSTS[model].note && (
                                                    <span style={{ color: '#9ca3af', fontSize: '11px' }}>
                                                        — {MODEL_COSTS[model].note}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {error && <div style={styles.error}>{error}</div>}

                            <div style={styles.footer}>
                                <button onClick={onClose} style={styles.cancelBtn}>Cancel</button>
                                <button
                                    onClick={handleGenerate}
                                    disabled={loading || generating || !model}
                                    style={{
                                        ...styles.generateBtn,
                                        backgroundColor: loading || generating || !model ? '#4b5563' : theme.bg,
                                        cursor: loading || generating || !model ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    {generating ? (
                                        <><Loader2 size={16} className="spin" /> Generating...</>
                                    ) : (
                                        <><Sparkles size={16} /> Generate Prompt</>
                                    )}
                                </button>
                            </div>
                        </>
                    ) : (
                        /* Result View */
                        <>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Generated Prompt</label>
                                <div style={styles.promptBox}>
                                    {result.prompt}
                                </div>
                                <button onClick={handleCopy} style={{ ...styles.copyBtn, color: copied ? '#10b981' : '#9ca3af', borderColor: copied ? '#10b981' : '#3f3f46' }}>
                                    {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy to Clipboard</>}
                                </button>
                            </div>

                            {result.assumptions && (
                                <div style={styles.assumptions}>
                                    <strong>Assumptions:</strong><br />
                                    {result.assumptions}
                                </div>
                            )}

                            <div style={styles.footer}>
                                <button onClick={onClose} style={{ ...styles.generateBtn, backgroundColor: '#2563eb' }}>Done</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// Inline field editor component
function FieldEditor({ field, value, onChange, onSave, saving }: {
    field: MissingField;
    value: string;
    onChange: (v: string) => void;
    onSave: (v: string) => void;
    saving: boolean;
}) {
    const [saved, setSaved] = useState(false);
    const options = DROPDOWN_OPTIONS[field.field];
    const isDropdown = !!options;

    const handleSave = (v: string) => {
        if (!v.trim()) return;
        setSaved(true);
        onSave(v);
    };

    const handleDropdownChange = (v: string) => {
        onChange(v);
        if (v) handleSave(v);
    };

    // Show "Saved!" confirmation state
    if (saved) {
        return (
            <div style={{
                marginBottom: '10px',
                padding: '8px 12px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                color: '#10b981',
                fontWeight: 600,
            }}>
                <Check size={14} /> {field.label} saved (+{field.weight}pts)
            </div>
        );
    }

    return (
        <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '12px', color: '#d1d5db', fontWeight: 600 }}>
                    {field.label}
                    <span style={{ color: '#6b7280', fontWeight: 400, fontSize: '10px', marginLeft: '6px' }}>+{field.weight}pts</span>
                </label>
                {saving && <Loader2 size={12} className="spin" style={{ color: '#6b7280' }} />}
            </div>
            {isDropdown ? (
                <select
                    value={value}
                    onChange={(e) => handleDropdownChange(e.target.value)}
                    style={{
                        width: '100%',
                        backgroundColor: '#09090b',
                        border: '1px solid #3f3f46',
                        padding: '7px 8px',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '13px',
                        outline: 'none',
                    }}
                >
                    <option value="">-- {field.description || 'Select'} --</option>
                    {options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
            ) : (
                <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={field.description || `Enter ${field.label.toLowerCase()}`}
                        onKeyDown={(e) => { if (e.key === 'Enter' && value.trim()) handleSave(value); }}
                        style={{
                            flex: 1,
                            backgroundColor: '#09090b',
                            border: '1px solid #3f3f46',
                            padding: '7px 8px',
                            color: 'white',
                            borderRadius: '4px',
                            fontSize: '13px',
                            outline: 'none',
                        }}
                    />
                    <button
                        onClick={() => handleSave(value)}
                        disabled={!value.trim() || saving}
                        style={{
                            backgroundColor: value.trim() ? '#0f766e' : '#3f3f46',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '0 10px',
                            cursor: value.trim() ? 'pointer' : 'default',
                            display: 'flex',
                            alignItems: 'center',
                            color: 'white',
                        }}
                        title="Save"
                    >
                        <Save size={14} />
                    </button>
                </div>
            )}
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    overlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
    },
    modal: {
        backgroundColor: '#18181b',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '550px',
        maxHeight: '90vh',
        border: '1px solid #27272a',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        backgroundColor: '#18181b',
    },
    title: {
        color: 'white',
        fontSize: '16px',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        margin: 0,
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: '#6b7280',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
    },
    divider: {
        height: '1px',
        backgroundColor: '#27272a',
    },
    body: {
        padding: '20px',
        overflowY: 'auto',
        flex: 1,
    },
    contextBox: {
        backgroundColor: '#27272a',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '16px',
    },
    contextLabel: {
        color: '#9ca3af',
        fontSize: '10px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '8px',
    },
    contextRow: {
        fontSize: '13px',
        marginBottom: '4px',
    },
    formGroup: {
        marginBottom: '20px',
    },
    label: {
        color: '#d1d5db',
        display: 'block',
        marginBottom: '8px',
        fontSize: '12px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    },
    select: {
        width: '100%',
        backgroundColor: '#09090b',
        border: '1px solid #3f3f46',
        padding: '10px',
        color: 'white',
        borderRadius: '6px',
        fontSize: '14px',
        outline: 'none',
    },
    error: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        color: '#ef4444',
        padding: '10px',
        borderRadius: '6px',
        fontSize: '13px',
        marginBottom: '16px',
    },
    footer: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        marginTop: '10px',
    },
    cancelBtn: {
        background: 'transparent',
        color: '#9ca3af',
        border: 'none',
        cursor: 'pointer',
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: 500,
    },
    generateBtn: {
        color: 'white',
        padding: '8px 20px',
        borderRadius: '6px',
        border: 'none',
        fontSize: '14px',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'background 0.2s',
    },
    promptBox: {
        backgroundColor: '#09090b',
        border: '1px solid #27272a',
        borderRadius: '8px',
        padding: '12px',
        color: '#e4e4e7',
        fontSize: '14px',
        lineHeight: '1.6',
        whiteSpace: 'pre-wrap',
        maxHeight: '200px',
        overflowY: 'auto',
    },
    copyBtn: {
        marginTop: '8px',
        background: 'transparent',
        border: '1px solid #3f3f46',
        borderRadius: '6px',
        padding: '6px 12px',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        cursor: 'pointer',
    },
    assumptions: {
        backgroundColor: '#27272a',
        padding: '12px',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#a1a1aa',
        marginBottom: '16px',
    },
};
