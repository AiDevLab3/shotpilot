import React, { useState } from 'react';
import { Sparkles, Loader2, Check, Copy } from 'lucide-react';
import type { ObjectSuggestions } from '../types/schema';
import { getObjectSuggestions } from '../services/api';

interface ObjectAIAssistantProps {
    projectId: number;
    objectName: string;
    currentDescription?: string;
    onAcceptDescription: (description: string) => void;
}

export const ObjectAIAssistant: React.FC<ObjectAIAssistantProps> = ({
    projectId,
    objectName,
    currentDescription,
    onAcceptDescription,
}) => {
    const [suggestions, setSuggestions] = useState<ObjectSuggestions | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [descriptionApplied, setDescriptionApplied] = useState(false);
    const [promptCopied, setPromptCopied] = useState(false);

    const nameIsEmpty = !objectName || objectName.trim().length === 0;

    const loadSuggestions = async () => {
        setLoading(true);
        setError(null);
        setDescriptionApplied(false);
        setPromptCopied(false);
        try {
            const result = await getObjectSuggestions(projectId, {
                name: objectName,
                description: currentDescription,
            });
            setSuggestions(result);
            setHasLoaded(true);
        } catch (err: any) {
            setError(err.message || 'Failed to generate suggestions');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptDescription = () => {
        if (suggestions) {
            onAcceptDescription(suggestions.description);
            setDescriptionApplied(true);
        }
    };

    const handleCopyPrompt = async () => {
        if (suggestions) {
            try {
                await navigator.clipboard.writeText(suggestions.referencePrompt);
                setPromptCopied(true);
                setTimeout(() => setPromptCopied(false), 2000);
            } catch {
                // Fallback for environments without clipboard API
                const textarea = document.createElement('textarea');
                textarea.value = suggestions.referencePrompt;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                setPromptCopied(true);
                setTimeout(() => setPromptCopied(false), 2000);
            }
        }
    };

    // Not yet loaded -- show trigger button
    if (!hasLoaded && !loading) {
        return (
            <div style={styles.triggerContainer}>
                <button
                    onClick={loadSuggestions}
                    disabled={nameIsEmpty}
                    style={{
                        ...styles.triggerBtn,
                        opacity: nameIsEmpty ? 0.5 : 1,
                        cursor: nameIsEmpty ? 'not-allowed' : 'pointer',
                    }}
                >
                    <Sparkles size={14} />
                    Generate with AI
                </button>
                <span style={styles.triggerHint}>
                    {nameIsEmpty
                        ? 'Enter a name first'
                        : 'AI will suggest a description, reference prompt, and consistency tips'}
                </span>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <Sparkles size={14} color="#8b5cf6" />
                    <span style={styles.headerTitle}>AI Object Assistant</span>
                </div>
                <button
                    onClick={loadSuggestions}
                    disabled={loading || nameIsEmpty}
                    style={{
                        ...styles.regenerateBtn,
                        opacity: loading || nameIsEmpty ? 0.5 : 1,
                        cursor: loading || nameIsEmpty ? 'not-allowed' : 'pointer',
                    }}
                >
                    <Sparkles size={12} />
                    Regenerate
                </button>
            </div>

            {loading ? (
                <div style={styles.loadingState}>
                    <Loader2 size={18} className="spin" color="#8b5cf6" />
                    <span style={styles.loadingText}>Generating object details...</span>
                </div>
            ) : error ? (
                <div style={styles.errorState}>
                    <p style={styles.errorText}>{error}</p>
                    <button onClick={loadSuggestions} style={styles.retryBtn}>
                        Retry
                    </button>
                </div>
            ) : suggestions ? (
                <div style={styles.resultsContainer}>
                    {/* Description Suggestion */}
                    <div style={{
                        ...styles.suggestionCard,
                        borderLeftColor: descriptionApplied ? '#10b981' : '#8b5cf6',
                    }}>
                        <div style={styles.cardHeader}>
                            <span style={styles.fieldLabel}>Description</span>
                            {descriptionApplied && (
                                <span style={styles.appliedBadge}>
                                    <Check size={11} /> Applied
                                </span>
                            )}
                        </div>
                        <p style={styles.suggestionText}>{suggestions.description}</p>
                        <button
                            onClick={handleAcceptDescription}
                            style={{
                                ...styles.applyBtn,
                                backgroundColor: descriptionApplied ? '#10b981' : '#8b5cf6',
                            }}
                        >
                            {descriptionApplied ? (
                                <><Check size={13} /> Applied</>
                            ) : (
                                'Apply'
                            )}
                        </button>
                    </div>

                    {/* Reference Prompt */}
                    <div style={styles.promptCard}>
                        <div style={styles.cardHeader}>
                            <span style={styles.fieldLabel}>Reference Prompt</span>
                            <button
                                onClick={handleCopyPrompt}
                                style={styles.copyBtn}
                            >
                                {promptCopied ? (
                                    <><Check size={12} color="#10b981" /> Copied</>
                                ) : (
                                    <><Copy size={12} /> Copy</>
                                )}
                            </button>
                        </div>
                        <p style={styles.promptText}>{suggestions.referencePrompt}</p>
                        <span style={styles.promptHint}>
                            Use this prompt to generate a reference image for consistent object depiction
                        </span>
                    </div>

                    {/* Consistency Tips */}
                    {suggestions.consistencyTips && suggestions.consistencyTips.length > 0 && (
                        <div style={styles.tipsCard}>
                            <span style={styles.fieldLabel}>Consistency Tips</span>
                            <ul style={styles.tipsList}>
                                {suggestions.consistencyTips.map((tip, index) => (
                                    <li key={index} style={styles.tipItem}>
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    triggerContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        padding: '16px',
        backgroundColor: '#1f1f23',
        border: '1px dashed #3f3f46',
        borderRadius: '8px',
    },
    triggerBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        backgroundColor: '#8b5cf6',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
    },
    triggerHint: {
        fontSize: '11px',
        color: '#6b7280',
        textAlign: 'center',
    },
    container: {
        backgroundColor: '#18181b',
        border: '1px solid #3f3f46',
        borderRadius: '8px',
        overflow: 'hidden',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 12px',
        borderBottom: '1px solid #3f3f46',
        backgroundColor: '#1f1f23',
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    headerTitle: {
        fontSize: '13px',
        fontWeight: 700,
        color: '#e5e7eb',
    },
    regenerateBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 10px',
        backgroundColor: '#27272a',
        border: '1px solid #3f3f46',
        borderRadius: '5px',
        color: '#a78bfa',
        fontSize: '11px',
        fontWeight: 600,
        cursor: 'pointer',
    },
    loadingState: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '28px 12px',
    },
    loadingText: {
        color: '#9ca3af',
        fontSize: '13px',
    },
    errorState: {
        textAlign: 'center',
        padding: '16px 12px',
    },
    errorText: {
        color: '#ef4444',
        fontSize: '12px',
        margin: '0 0 8px 0',
    },
    retryBtn: {
        padding: '5px 14px',
        borderRadius: '5px',
        border: '1px solid #3f3f46',
        backgroundColor: '#27272a',
        color: '#d1d5db',
        fontSize: '12px',
        cursor: 'pointer',
    },
    resultsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1px',
        backgroundColor: '#27272a',
    },
    suggestionCard: {
        backgroundColor: '#1f1f23',
        padding: '12px',
        borderLeft: '3px solid #8b5cf6',
        transition: 'border-color 0.2s',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '6px',
    },
    fieldLabel: {
        color: '#e5e7eb',
        fontSize: '12px',
        fontWeight: 700,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
    },
    appliedBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        fontSize: '11px',
        color: '#10b981',
        fontWeight: 600,
    },
    suggestionText: {
        color: '#d1d5db',
        fontSize: '13px',
        lineHeight: '1.5',
        margin: '0 0 10px 0',
    },
    applyBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '5px 12px',
        backgroundColor: '#8b5cf6',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        fontSize: '12px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'background-color 0.15s',
    },
    promptCard: {
        backgroundColor: '#1f1f23',
        padding: '12px',
        borderLeft: '3px solid #6d28d9',
    },
    promptText: {
        color: '#c4b5fd',
        fontSize: '12px',
        lineHeight: '1.5',
        margin: '0 0 6px 0',
        fontFamily: 'monospace',
        backgroundColor: '#18181b',
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #3f3f46',
        wordBreak: 'break-word' as const,
    },
    copyBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 8px',
        backgroundColor: 'transparent',
        border: '1px solid #3f3f46',
        borderRadius: '4px',
        color: '#9ca3af',
        fontSize: '11px',
        cursor: 'pointer',
    },
    promptHint: {
        fontSize: '10px',
        color: '#6b7280',
        fontStyle: 'italic',
    },
    tipsCard: {
        backgroundColor: '#1f1f23',
        padding: '12px',
        borderLeft: '3px solid #3f3f46',
    },
    tipsList: {
        margin: '6px 0 0 0',
        padding: '0 0 0 16px',
        listStyle: 'disc',
    },
    tipItem: {
        fontSize: '12px',
        color: '#9ca3af',
        lineHeight: '1.6',
    },
};
