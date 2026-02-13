import React, { useEffect, useState } from 'react';
import type { AIModel, Shot, Scene, Project } from '../types/schema';
import { X, Sparkles, Loader2, Copy, Check, Clapperboard, Camera, Info } from 'lucide-react';
import { getAvailableModels, generatePrompt, checkShotReadiness } from '../services/api';
// Assuming api export issues, adapting to imports. 
// If api is a default export object in service, verify. 
// Based on previous file, it was `import { getAvailableModels... } from '../services/api'`.

interface ReadinessScore {
    score: number;
    tier: 'draft' | 'production';
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
    scene: Scene; // Derived from props in parent
    project: Project; // Derived from props in parent
    modelType?: 'image' | 'video';
    onGenerated?: () => void;
    // Legacy props support if needed during refactor, but we prefer the new structure
    shotId?: number;
    shotContext?: any;
    currentCredits?: number;
}

export function GeneratePromptModal({
    isOpen,
    onClose,
    shot,
    scene,

    modelType = 'image',
    onGenerated,
    // Fallbacks
}: GeneratePromptModalProps) {
    const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
    const [model, setModel] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<GenerationResult | null>(null);
    const [copied, setCopied] = useState(false);
    const [readinessScore, setReadinessScore] = useState<ReadinessScore | null>(null);
    const [showReadinessInfo, setShowReadinessInfo] = useState(false);

    // Dynamic UI
    const isVideoMode = modelType === 'video';
    const Icon = isVideoMode ? Clapperboard : Camera;
    const modelLabel = isVideoMode ? 'VIDEO MODEL' : 'STORYBOARD MODEL';

    // Theme Colors
    const theme = isVideoMode ? {
        accent: '#a855f7', // purple-500
        bg: '#581c87', // purple-900
        border: 'rgba(168, 85, 247, 0.3)',
        hover: '#7e22ce', // purple-700
    } : {
        accent: '#14b8a6', // teal-500
        bg: '#0f766e', // teal-700
        border: 'rgba(20, 184, 166, 0.3)',
        hover: '#0d9488', // teal-600
    };

    useEffect(() => {
        if (isOpen) {
            resetState();
            fetchData();
        }
    }, [isOpen, modelType, shot?.id]);

    const resetState = () => {
        setResult(null);
        setError(null);
        setCopied(false);
        setLoading(true);
    };

    const fetchData = async () => {
        try {
            // Models
            const models = await getAvailableModels();
            const filtered = models.filter(m => m.type === modelType);
            setAvailableModels(filtered);

            // Default selection
            if (filtered.length > 0) {
                const defaultName = isVideoMode ? 'veo-3.1' : 'higgsfield';
                const hasDefault = filtered.find(m => m.name === defaultName);
                setModel(hasDefault ? defaultName : filtered[0].name);
            } else {
                setModel('');
            }

            // Prompt Readiness Score
            if (shot?.id) {
                const rs = await checkShotReadiness(shot.id).catch(e => {
                    console.warn('Failed to load readiness score', e);
                    return null;
                });
                if (rs) setReadinessScore(rs);
            }

        } catch (err) {
            console.error('Failed to load modal data:', err);
            setError('Failed to load available models.');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!model) return;
        setGenerating(true);
        setError(null);

        try {
            // Use shot.id from props
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

                {/* Body */}
                <div style={styles.body}>
                    {!result ? (
                        /* Configuration View */
                        <>
                            {/* Context Summary */}
                            <div style={styles.contextBox}>
                                <div style={styles.contextLabel}>CONTEXT</div>
                                <div style={styles.contextRow}>
                                    <span style={{ color: '#6b7280' }}>Shot:</span> <span style={{ color: 'white', fontWeight: 600 }}>{shot.shot_number}</span>
                                </div>
                                <div style={styles.contextRow}>
                                    <span style={{ color: '#6b7280' }}>Scene:</span> <span style={{ color: 'white' }}>{scene?.name || 'Unknown'}</span>
                                </div>
                                {readinessScore && (
                                    <div style={{ marginTop: '8px' }}>
                                        <div style={{ ...styles.contextRow, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ color: '#6b7280' }}>Prompt Readiness:</span>
                                            <span style={{
                                                color: readinessScore.tier === 'production' ? '#10b981' : '#fbbf24',
                                                fontWeight: 700
                                            }}>
                                                {readinessScore.score} / 100 ({readinessScore.tier === 'production' ? 'READY' : 'DRAFT'})
                                            </span>
                                            <button
                                                onClick={() => setShowReadinessInfo(!showReadinessInfo)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: '2px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    color: showReadinessInfo ? '#60a5fa' : '#6b7280',
                                                }}
                                                title="What is this score?"
                                            >
                                                <Info size={14} />
                                            </button>
                                        </div>
                                        {showReadinessInfo && (
                                            <div style={{
                                                marginTop: '8px',
                                                padding: '10px 12px',
                                                backgroundColor: '#1e1e22',
                                                borderRadius: '6px',
                                                border: '1px solid #3f3f46',
                                                fontSize: '11px',
                                                lineHeight: '1.6',
                                                color: '#a1a1aa',
                                            }}>
                                                <div style={{ color: '#d1d5db', fontWeight: 600, marginBottom: '6px' }}>
                                                    Prompt Readiness Score
                                                </div>
                                                <div style={{ marginBottom: '6px' }}>
                                                    Measures how completely this shot is defined for prompt generation. Higher = better prompts.
                                                </div>
                                                <div style={{ marginBottom: '4px', color: '#9ca3af', fontWeight: 600 }}>
                                                    Shot Specifics (80%)
                                                </div>
                                                <div style={{ paddingLeft: '8px', marginBottom: '6px' }}>
                                                    Description (25), Shot Type (20), Camera Angle (15), Camera Movement (10), Focal Length (5), Blocking (5), Lens (5)
                                                </div>
                                                <div style={{ marginBottom: '4px', color: '#9ca3af', fontWeight: 600 }}>
                                                    Scene Context (20%)
                                                </div>
                                                <div style={{ paddingLeft: '8px', marginBottom: '6px' }}>
                                                    Lighting (5), Mood/Tone (5), Style (5), Location (5), Time of Day (5)
                                                </div>
                                                <div style={{ color: '#6b7280', fontStyle: 'italic' }}>
                                                    70+ = Ready for generation &middot; Below 70 = Draft (AI fills gaps)
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

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

                                        {/* Capabilities */}
                                        {model && (
                                            <div style={{
                                                marginTop: '8px',
                                                fontSize: '12px',
                                                color: '#9ca3af',
                                                background: 'rgba(255,255,255,0.03)',
                                                padding: '8px',
                                                borderRadius: '4px'
                                            }}>
                                                💡 {availableModels.find(m => m.name === model)?.capabilities || availableModels.find(m => m.name === model)?.description}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Error */}
                            {error && <div style={styles.error}>{error}</div>}

                            {/* Action Buttons */}
                            <div style={styles.footer}>
                                <button onClick={onClose} style={styles.cancelBtn}>Cancel</button>
                                <button
                                    onClick={handleGenerate}
                                    disabled={loading || generating || !model}
                                    style={{
                                        ...styles.generateBtn,
                                        backgroundColor: loading || generating || !model ? '#4b5563' : theme.bg,
                                        cursor: loading || generating || !model ? 'not-allowed' : 'pointer'
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

const styles: Record<string, React.CSSProperties> = {
    overlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)'
    },
    modal: {
        backgroundColor: '#18181b',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '550px',
        border: '1px solid #27272a',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
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
    },
    contextBox: {
        backgroundColor: '#27272a',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '20px',
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
        overflowY: 'auto'
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
    }
};
