import React, { useState } from 'react';
import { Sparkles, Loader2, Check, ChevronDown, RefreshCw } from 'lucide-react';
import type { AestheticSuggestion } from '../types/schema';
import { getAestheticSuggestions } from '../services/api';

interface AestheticSuggestionsPanelProps {
    projectId: number;
    onAccept: (field: string, value: string) => void;
}

// Maps API field names to user-friendly labels
const FIELD_LABELS: Record<string, string> = {
    frame_size: 'Frame Size (Aspect Ratio)',
    style_aesthetic: 'Style & Aesthetic',
    atmosphere_mood: 'Atmosphere & Mood',
    lighting_directions: 'Lighting Directions',
    purpose: 'Purpose',
    storyline_narrative: 'Storyline / Narrative',
    cinematography: 'Cinematography',
    cinematic_references: 'Cinematic References',
};

export const AestheticSuggestionsPanel: React.FC<AestheticSuggestionsPanelProps> = ({
    projectId,
    onAccept,
}) => {
    const [suggestions, setSuggestions] = useState<AestheticSuggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [accepted, setAccepted] = useState<Record<string, string>>({});
    const [expandedAlts, setExpandedAlts] = useState<Record<string, boolean>>({});
    const [hasLoaded, setHasLoaded] = useState(false);

    const loadSuggestions = async () => {
        setLoading(true);
        setError(null);
        setAccepted({});
        setExpandedAlts({});
        try {
            const result = await getAestheticSuggestions(projectId);
            setSuggestions(Array.isArray(result) ? result : []);
            setHasLoaded(true);
        } catch (err: any) {
            setError(err.message || 'Failed to load suggestions');
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = (field: string, value: string) => {
        setAccepted(prev => ({ ...prev, [field]: value }));
        setExpandedAlts(prev => ({ ...prev, [field]: false }));
        onAccept(field, value);
    };

    // Not yet loaded — show trigger button
    if (!hasLoaded && !loading) {
        return (
            <div style={styles.triggerContainer}>
                <button onClick={loadSuggestions} style={styles.triggerBtn}>
                    <Sparkles size={16} />
                    Get AI Aesthetic Suggestions
                </button>
                <span style={styles.triggerHint}>
                    AI will analyze your project and suggest visual style, mood, lighting, and references
                </span>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <Sparkles size={16} color="#8b5cf6" />
                    <span style={styles.headerTitle}>AI Aesthetic Suggestions</span>
                </div>
                <button
                    onClick={loadSuggestions}
                    disabled={loading}
                    style={styles.refreshBtn}
                    title="Refresh suggestions"
                >
                    <RefreshCw size={14} className={loading ? 'spin' : ''} />
                </button>
            </div>

            {loading ? (
                <div style={styles.loadingState}>
                    <Loader2 size={20} className="spin" color="#8b5cf6" />
                    <span style={styles.loadingText}>Analyzing your project...</span>
                </div>
            ) : error ? (
                <div style={styles.errorState}>
                    <p style={styles.errorText}>{error}</p>
                    <button onClick={loadSuggestions} style={styles.retryBtn}>Retry</button>
                </div>
            ) : suggestions.length === 0 ? (
                <div style={styles.emptyState}>
                    All aesthetic fields are already filled in.
                </div>
            ) : (
                <div style={styles.suggestionList}>
                    {suggestions.map((sug) => {
                        const isAccepted = accepted[sug.field] !== undefined;
                        const isAltOpen = expandedAlts[sug.field] || false;

                        return (
                            <div
                                key={sug.field}
                                style={{
                                    ...styles.card,
                                    borderColor: isAccepted ? '#10b98155' : '#3f3f46',
                                }}
                            >
                                <div style={styles.cardHeader}>
                                    <span style={styles.fieldLabel}>
                                        {FIELD_LABELS[sug.field] || sug.field}
                                    </span>
                                    {isAccepted && (
                                        <span style={styles.acceptedBadge}>
                                            <Check size={12} /> Applied
                                        </span>
                                    )}
                                </div>

                                <div style={styles.valueRow}>
                                    <span style={styles.valueText}>{sug.value}</span>
                                </div>

                                <div style={styles.reasoning}>{sug.reasoning}</div>

                                <div style={styles.actionRow}>
                                    <button
                                        onClick={() => handleAccept(sug.field, sug.value)}
                                        style={{
                                            ...styles.acceptBtn,
                                            backgroundColor: isAccepted && accepted[sug.field] === sug.value ? '#10b981' : '#27272a',
                                            color: isAccepted && accepted[sug.field] === sug.value ? 'white' : '#d1d5db',
                                        }}
                                    >
                                        {isAccepted && accepted[sug.field] === sug.value
                                            ? <><Check size={14} /> Applied</>
                                            : 'Accept'}
                                    </button>

                                    {sug.alternatives && sug.alternatives.length > 0 && (
                                        <div style={{ position: 'relative' as const }}>
                                            <button
                                                onClick={() => setExpandedAlts(prev => ({ ...prev, [sug.field]: !isAltOpen }))}
                                                style={styles.altBtn}
                                            >
                                                Alternatives <ChevronDown size={12} />
                                            </button>
                                            {isAltOpen && (
                                                <div style={styles.altDropdown}>
                                                    {sug.alternatives.map((alt, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => handleAccept(sug.field, alt)}
                                                            style={styles.altOption}
                                                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#374151'; }}
                                                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                                                        >
                                                            {alt}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    triggerContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        padding: '24px',
        backgroundColor: '#1f1f23',
        border: '1px dashed #3f3f46',
        borderRadius: '12px',
    },
    triggerBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        backgroundColor: '#8b5cf6',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
    },
    triggerHint: {
        fontSize: '12px',
        color: '#6b7280',
        textAlign: 'center',
    },
    container: {
        backgroundColor: '#1f1f23',
        border: '1px solid #3f3f46',
        borderRadius: '12px',
        overflow: 'hidden',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 16px',
        borderBottom: '1px solid #3f3f46',
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    headerTitle: {
        fontSize: '14px',
        fontWeight: 700,
        color: '#e5e7eb',
    },
    refreshBtn: {
        background: 'none',
        border: 'none',
        color: '#6b7280',
        cursor: 'pointer',
        padding: '4px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
    },
    loadingState: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '32px 16px',
    },
    loadingText: {
        color: '#9ca3af',
        fontSize: '13px',
    },
    errorState: {
        textAlign: 'center',
        padding: '20px 16px',
    },
    errorText: {
        color: '#ef4444',
        fontSize: '13px',
        marginBottom: '8px',
    },
    retryBtn: {
        padding: '6px 14px',
        borderRadius: '6px',
        border: '1px solid #3f3f46',
        backgroundColor: '#27272a',
        color: '#d1d5db',
        fontSize: '12px',
        cursor: 'pointer',
    },
    emptyState: {
        padding: '20px 16px',
        color: '#6b7280',
        fontSize: '13px',
        textAlign: 'center',
    },
    suggestionList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1px',
        backgroundColor: '#3f3f46',
    },
    card: {
        backgroundColor: '#1f1f23',
        padding: '16px',
        borderLeft: '3px solid #3f3f46',
        transition: 'border-color 0.2s',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
    },
    fieldLabel: {
        color: '#e5e7eb',
        fontSize: '13px',
        fontWeight: 700,
    },
    acceptedBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '11px',
        color: '#10b981',
        fontWeight: 600,
    },
    valueRow: {
        marginBottom: '6px',
    },
    valueText: {
        color: '#c4b5fd',
        fontSize: '14px',
        fontWeight: 600,
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
        minWidth: '200px',
        overflow: 'hidden',
    },
    altOption: {
        width: '100%',
        padding: '8px 12px',
        background: 'transparent',
        border: 'none',
        color: '#e5e7eb',
        fontSize: '13px',
        textAlign: 'left' as const,
        cursor: 'pointer',
        transition: 'background 0.1s',
    },
};
