import React, { useEffect, useState } from 'react';
import { getRecommendations, updateShot, updateScene } from '../services/api';
import { AlertTriangle, Sparkles, X, Loader2, ChevronDown, Check } from 'lucide-react';

interface MissingField {
    field: string;
    weight: number;
    label: string;
    description: string;
}

interface Recommendation {
    field: string;
    recommendation: string;
    reasoning: string;
    alternatives: string[];
}

interface FieldSelection {
    value: string;
    source: 'recommendation' | 'alternative' | 'custom';
}

interface RecommendationsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    shotId: number;
    sceneId: number;
    qualityScore: number;
    missingFields: MissingField[];
    onSkipGenerate: () => void;
    onSaveAndGenerate: () => void;
}

// Map quality-check field names to the shot column names for PATCH
const SHOT_FIELD_MAP: Record<string, string> = {
    shot_description: 'description',
    shot_type: 'shot_type',
    camera_angle: 'camera_angle',
    camera_movement: 'camera_movement',
    focal_length: 'focal_length',
    blocking: 'blocking',
    camera_lens: 'camera_lens',
};

// Map quality-check field names to the scene column names for PATCH
const SCENE_FIELD_MAP: Record<string, string> = {
    scene_lighting_notes: 'lighting_notes',
    scene_mood_tone: 'mood_tone',
    scene_location_setting: 'location_setting',
    scene_time_of_day: 'time_of_day',
};

export const RecommendationsDialog: React.FC<RecommendationsDialogProps> = ({
    isOpen,
    onClose,
    shotId,
    sceneId,
    qualityScore,
    missingFields,
    onSkipGenerate,
    onSaveAndGenerate,
}) => {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [selections, setSelections] = useState<Record<string, FieldSelection>>({});
    const [expandedAlts, setExpandedAlts] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (isOpen && missingFields.length > 0) {
            loadRecommendations();
        }
    }, [isOpen, shotId]);

    // Handle click outside to close dropdowns
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Element;
            // If click is not inside a dropdown wrapper, close all dropdowns
            if (!target.closest('[data-dropdown-wrapper]')) {
                setExpandedAlts({});
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const loadRecommendations = async () => {
        setLoading(true);
        setError(null);
        try {
            const recs = await getRecommendations(shotId, missingFields);
            setRecommendations(Array.isArray(recs) ? recs : []);
        } catch (err: any) {
            setError(err.message || 'Failed to load recommendations');
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = (field: string, value: string) => {
        setSelections(prev => ({ ...prev, [field]: { value, source: 'recommendation' } }));
    };

    const handleSelectAlternative = (field: string, value: string) => {
        setSelections(prev => ({ ...prev, [field]: { value, source: 'alternative' } }));
        setExpandedAlts(prev => ({ ...prev, [field]: false }));
    };

    const handleCustom = (field: string, value: string) => {
        setSelections(prev => ({ ...prev, [field]: { value, source: 'custom' } }));
    };

    const handleSaveAndGenerate = async () => {
        setSaving(true);
        try {
            // Build update payloads from selections
            const shotUpdate: Record<string, string> = {};
            const sceneUpdate: Record<string, string> = {};

            for (const [field, sel] of Object.entries(selections)) {
                if (sel.value.trim()) {
                    const shotCol = SHOT_FIELD_MAP[field];
                    const sceneCol = SCENE_FIELD_MAP[field];
                    if (shotCol) {
                        shotUpdate[shotCol] = sel.value;
                    } else if (sceneCol) {
                        sceneUpdate[sceneCol] = sel.value;
                    }
                }
            }

            if (Object.keys(shotUpdate).length > 0) {
                await updateShot(shotId, shotUpdate);
            }
            if (Object.keys(sceneUpdate).length > 0 && sceneId) {
                await updateScene(sceneId, sceneUpdate);
            }

            onSaveAndGenerate();
        } catch (err: any) {
            setError(err.message || 'Failed to save fields');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    const acceptedCount = Object.values(selections).filter(s => s.value.trim()).length;

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <h2 style={styles.title}>
                            <AlertTriangle size={20} color="#fbbf24" /> Missing Context Detected
                        </h2>
                        <p style={styles.subtitle}>
                            Your shot is <strong style={{ color: '#fbbf24' }}>{Math.round(qualityScore)}% complete</strong>. AI can help fill in the gaps.
                        </p>
                    </div>
                    <button onClick={onClose} style={styles.closeBtn}><X size={18} /></button>
                </div>

                <div style={styles.divider} />

                {/* Body */}
                <div style={styles.body}>
                    {loading ? (
                        <div style={styles.loadingState}>
                            <Loader2 size={24} className="spin" color="#8b5cf6" />
                            <span style={{ color: '#9ca3af', fontSize: '14px' }}>Getting AI recommendations...</span>
                        </div>
                    ) : error && recommendations.length === 0 ? (
                        <div style={styles.errorState}>
                            <p style={{ color: '#ef4444', marginBottom: '12px' }}>{error}</p>
                            <p style={{ color: '#9ca3af', fontSize: '13px' }}>You can skip and generate anyway, or close and try again.</p>
                        </div>
                    ) : (
                        <div style={styles.recList}>
                            {recommendations.map((rec) => {
                                const sel = selections[rec.field];
                                const isAccepted = !!sel;
                                const isAltOpen = expandedAlts[rec.field] || false;
                                const fieldInfo = missingFields.find(f => f.field === rec.field);

                                return (
                                    <div key={rec.field} style={{
                                        ...styles.recCard,
                                        borderColor: isAccepted ? '#10b98155' : '#27272a',
                                    }}>
                                        <div style={styles.recHeader}>
                                            <span style={styles.fieldLabel}>
                                                {fieldInfo?.label || rec.field.replace(/_/g, ' ')}
                                            </span>
                                            {isAccepted && (
                                                <span style={styles.acceptedBadge}>
                                                    <Check size={12} /> Accepted
                                                </span>
                                            )}
                                        </div>

                                        {/* Recommendation */}
                                        <div style={styles.recValue}>
                                            <Sparkles size={14} color="#8b5cf6" />
                                            <span>Recommended: <strong style={{ color: '#e5e7eb' }}>{rec.recommendation}</strong></span>
                                        </div>

                                        <div style={styles.reasoning}>"{rec.reasoning}"</div>

                                        {/* Action row */}
                                        <div style={styles.actionRow}>
                                            <button
                                                onClick={() => handleAccept(rec.field, rec.recommendation)}
                                                style={{
                                                    ...styles.acceptBtn,
                                                    backgroundColor: sel?.source === 'recommendation' ? '#10b981' : '#27272a',
                                                    color: sel?.source === 'recommendation' ? 'white' : '#d1d5db',
                                                }}
                                            >
                                                {sel?.source === 'recommendation' ? <><Check size={14} /> Accepted</> : 'Accept'}
                                            </button>

                                            {rec.alternatives && rec.alternatives.length > 0 && (
                                                <div style={{ position: 'relative' }} data-dropdown-wrapper="true">
                                                    <button
                                                        onClick={() => setExpandedAlts(prev => ({ ...prev, [rec.field]: !isAltOpen }))}
                                                        style={styles.altBtn}
                                                    >
                                                        Alternative <ChevronDown size={12} />
                                                    </button>
                                                    {isAltOpen && (
                                                        <div style={styles.altDropdown}>
                                                            {rec.alternatives.map((alt, i) => (
                                                                <button
                                                                    key={i}
                                                                    onClick={() => handleSelectAlternative(rec.field, alt)}
                                                                    style={styles.altOption}
                                                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#374151'; }}
                                                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                                                >
                                                                    {alt}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Custom value input */}
                                        <input
                                            placeholder="Or type a custom value..."
                                            value={sel?.source === 'custom' ? sel.value : ''}
                                            onChange={e => handleCustom(rec.field, e.target.value)}
                                            onFocus={() => {
                                                // Clear non-custom selection when user starts typing
                                                if (sel && sel.source !== 'custom') {
                                                    setSelections(prev => ({ ...prev, [rec.field]: { value: '', source: 'custom' } }));
                                                }
                                            }}
                                            style={styles.customInput}
                                        />

                                        {/* Show current selection if alt was chosen */}
                                        {sel?.source === 'alternative' && (
                                            <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
                                                Selected: {sel.value}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div style={styles.divider} />

                {/* Footer */}
                <div style={styles.footer}>
                    {acceptedCount > 0 && (
                        <span style={{ fontSize: '12px', color: '#9ca3af', marginRight: 'auto' }}>
                            {acceptedCount} field{acceptedCount !== 1 ? 's' : ''} selected
                        </span>
                    )}
                    <button
                        onClick={onSkipGenerate}
                        style={styles.skipBtn}
                    >
                        Skip & Generate Anyway
                    </button>
                    <button
                        onClick={handleSaveAndGenerate}
                        disabled={saving || loading}
                        style={{
                            ...styles.saveBtn,
                            opacity: (saving || loading) ? 0.6 : 1,
                            cursor: (saving || loading) ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {saving ? (
                            <><Loader2 size={14} className="spin" /> Saving...</>
                        ) : (
                            <><Sparkles size={14} /> Save & Generate</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    overlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modal: {
        backgroundColor: '#18181b',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '640px',
        border: '1px solid #27272a',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '20px 24px',
    },
    title: {
        color: 'white',
        fontSize: '18px',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        margin: 0,
    },
    subtitle: {
        color: '#9ca3af',
        fontSize: '14px',
        marginTop: '6px',
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: '#6b7280',
        cursor: 'pointer',
        padding: '4px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
    },
    divider: {
        height: '1px',
        backgroundColor: '#27272a',
    },
    body: {
        padding: '20px 24px',
        overflowY: 'auto',
        flex: 1,
    },
    loadingState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        padding: '40px 0',
    },
    errorState: {
        textAlign: 'center',
        padding: '24px 0',
    },
    recList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    recCard: {
        backgroundColor: '#1f1f23',
        border: '1px solid #27272a',
        borderRadius: '8px',
        padding: '16px',
        transition: 'border-color 0.2s',
    },
    recHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
    },
    fieldLabel: {
        color: '#e5e7eb',
        fontSize: '14px',
        fontWeight: 700,
        textTransform: 'capitalize' as const,
    },
    acceptedBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '11px',
        color: '#10b981',
        fontWeight: 600,
    },
    recValue: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '6px',
        fontSize: '13px',
        color: '#d1d5db',
        marginBottom: '6px',
        lineHeight: '1.5',
    },
    reasoning: {
        fontSize: '12px',
        color: '#6b7280',
        fontStyle: 'italic',
        marginBottom: '12px',
        lineHeight: '1.5',
    },
    actionRow: {
        display: 'flex',
        gap: '8px',
        marginBottom: '8px',
    },
    acceptBtn: {
        padding: '6px 14px',
        borderRadius: '6px',
        border: '1px solid #3f3f46',
        fontSize: '12px',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        transition: 'all 0.15s',
    },
    altBtn: {
        padding: '6px 14px',
        borderRadius: '6px',
        border: '1px solid #3f3f46',
        backgroundColor: '#27272a',
        color: '#d1d5db',
        fontSize: '12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    },
    altDropdown: {
        position: 'absolute',
        top: 'calc(100% + 4px)',
        left: 0,
        background: '#1f2937',
        border: '1px solid #374151',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        zIndex: 100,
        minWidth: '180px',
        overflow: 'hidden',
    },
    altOption: {
        width: '100%',
        padding: '8px 12px',
        background: 'transparent',
        border: 'none',
        color: '#e5e7eb',
        fontSize: '13px',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'background 0.1s',
    },
    customInput: {
        width: '100%',
        backgroundColor: '#27272a',
        border: '1px solid #3f3f46',
        padding: '8px 10px',
        color: 'white',
        borderRadius: '6px',
        fontSize: '13px',
    },
    footer: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 24px',
    },
    skipBtn: {
        background: 'transparent',
        color: '#9ca3af',
        border: '1px solid #3f3f46',
        borderRadius: '6px',
        padding: '10px 16px',
        fontSize: '13px',
        cursor: 'pointer',
    },
    saveBtn: {
        backgroundColor: '#8b5cf6',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '6px',
        border: 'none',
        fontSize: '13px',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
};
