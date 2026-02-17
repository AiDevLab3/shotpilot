import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, Check, Copy, ChevronDown, Send, MessageCircle, RotateCw, HelpCircle } from 'lucide-react';
import type { ObjectSuggestions, AIModel } from '../types/schema';
import { getObjectSuggestions, getAvailableModels, refineContent } from '../services/api';

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
    const [chatOpen, setChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
    const [refining, setRefining] = useState(false);
    const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [turnaroundCopied, setTurnaroundCopied] = useState<number | null>(null);
    const [workflowExpanded, setWorkflowExpanded] = useState(false);
    const [showEnhancePrompt, setShowEnhancePrompt] = useState(false);
    const [enhanceMode, setEnhanceMode] = useState<'idle' | 'enhanced' | 'skipped'>('idle');
    const [isEnhancing, setIsEnhancing] = useState(false);

    const nameIsEmpty = !objectName || objectName.trim().length === 0;
    const descriptionIsBasic = !currentDescription || currentDescription.trim().length < 100;

    useEffect(() => {
        getAvailableModels()
            .then((models) => {
                const imageModels = models.filter((m: AIModel) => m.type === 'image');
                setAvailableModels(imageModels);
            })
            .catch(() => {});
    }, []);

    const handleGenerateClick = () => {
        if (descriptionIsBasic && enhanceMode === 'idle') {
            setShowEnhancePrompt(true);
            return;
        }
        loadFullSuggestions();
    };

    const loadEnhanceOnly = async () => {
        setShowEnhancePrompt(false);
        setLoading(true);
        setIsEnhancing(true);
        setError(null);
        try {
            const result = await getObjectSuggestions(projectId, {
                name: objectName,
                description: currentDescription,
                descriptionOnly: true,
            });
            if (result.description) {
                onAcceptDescription(result.description);
            }
            setEnhanceMode('enhanced');
            setHasLoaded(false);
        } catch (err: any) {
            setError(err.message || 'Failed to enhance description');
        } finally {
            setLoading(false);
            setIsEnhancing(false);
        }
    };

    const handleSkipEnhance = () => {
        setShowEnhancePrompt(false);
        setEnhanceMode('skipped');
        loadFullSuggestions();
    };

    const loadFullSuggestions = async (modelOverride?: string) => {
        setLoading(true);
        setError(null);
        setDescriptionApplied(false);
        setPromptCopied(false);
        const model = modelOverride !== undefined ? modelOverride : selectedModel;
        try {
            const result = await getObjectSuggestions(projectId, {
                name: objectName,
                description: currentDescription,
                targetModel: model || undefined,
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

    const handleCopyTurnaround = async (prompt: string, index: number) => {
        try {
            await navigator.clipboard.writeText(prompt);
        } catch {
            const textarea = document.createElement('textarea');
            textarea.value = prompt;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
        setTurnaroundCopied(index);
        setTimeout(() => setTurnaroundCopied(null), 2000);
    };

    const handleRefine = async (msg?: string) => {
        const text = msg || chatInput.trim();
        if (!text || refining || !suggestions) return;
        setChatInput('');
        setRefining(true);
        const newHistory = [...chatHistory, { role: 'user', content: text }];
        setChatHistory(newHistory);
        try {
            const result = await refineContent(projectId, 'object', suggestions, text, newHistory);
            if (result.contentUpdate) {
                setSuggestions(prev => prev ? { ...prev, ...result.contentUpdate } : prev);
                setDescriptionApplied(false);
            }
            setChatHistory([...newHistory, { role: 'assistant', content: result.response }]);
        } catch (err: any) {
            setChatHistory([...newHistory, { role: 'assistant', content: 'Sorry, something went wrong. Try again.' }]);
        } finally {
            setRefining(false);
        }
    };

    const quickActions = [
        'More worn and weathered',
        'Pristine and brand new',
        'Make it larger',
        'Make it smaller',
        'Change the material',
        'Regenerate completely',
    ];

    // Not yet loaded -- show trigger button
    if (!hasLoaded && !loading) {
        return (
            <div style={styles.triggerContainer}>
                {availableModels.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <label style={{ fontSize: '11px', color: '#9ca3af' }}>Target Model:</label>
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            style={styles.modelSelect}
                        >
                            <option value="">Auto (let AI decide)</option>
                            {availableModels.map((m) => (
                                <option key={m.name} value={m.name}>{m.displayName || m.name}</option>
                            ))}
                        </select>
                    </div>
                )}
                <button
                    onClick={() => handleGenerateClick()}
                    disabled={nameIsEmpty || showEnhancePrompt}
                    style={{
                        ...styles.triggerBtn,
                        opacity: nameIsEmpty || showEnhancePrompt ? 0.5 : 1,
                        cursor: nameIsEmpty || showEnhancePrompt ? 'not-allowed' : 'pointer',
                    }}
                >
                    <Sparkles size={14} />
                    {enhanceMode === 'enhanced' ? 'Generate Prompts' : 'Generate Prompt'}
                </button>
                <span style={styles.triggerHint}>
                    {nameIsEmpty
                        ? 'Enter a name first'
                        : enhanceMode === 'enhanced'
                        ? 'Description enhanced — review it above, then generate prompts'
                        : 'AI will suggest a description, reference prompt, and consistency tips'}
                </span>

                {/* Enhance prompt dialog */}
                {showEnhancePrompt && (
                    <div style={{
                        marginTop: '8px',
                        padding: '12px',
                        backgroundColor: '#1a1a2e',
                        border: '1px solid #f59e0b',
                        borderRadius: '6px',
                        width: '100%',
                    }}>
                        <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#fbbf24', fontWeight: 600 }}>
                            Add more detail for better results
                        </p>
                        <p style={{ margin: '0 0 12px 0', fontSize: '11px', color: '#d1d5db', lineHeight: '1.5' }}>
                            The more specific your description is — and the more it aligns with your project's visual direction — the more accurate your prompts will be. Want AI to help flesh this out? You can review and edit before generating.
                        </p>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                                onClick={loadEnhanceOnly}
                                style={{
                                    padding: '6px 14px',
                                    backgroundColor: '#f59e0b',
                                    color: '#18181b',
                                    border: 'none',
                                    borderRadius: '5px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Enhance First
                            </button>
                            <button
                                onClick={handleSkipEnhance}
                                style={{
                                    padding: '6px 14px',
                                    backgroundColor: '#27272a',
                                    color: '#9ca3af',
                                    border: '1px solid #3f3f46',
                                    borderRadius: '5px',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                }}
                            >
                                Skip, Use As-Is
                            </button>
                        </div>
                    </div>
                )}
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
                    onClick={() => loadFullSuggestions()}
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

            {/* Model selector row */}
            {availableModels.length > 0 && (
                <div style={{ padding: '8px 12px', borderBottom: '1px solid #3f3f46', backgroundColor: '#1a1a1e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <label style={{ fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap' }}>Target Model:</label>
                    <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        style={styles.modelSelect}
                    >
                        <option value="">Auto (let AI decide)</option>
                        {availableModels.map((m) => (
                            <option key={m.name} value={m.name}>{m.displayName || m.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {loading ? (
                <div style={styles.loadingState}>
                    <Loader2 size={18} className="spin" color="#8b5cf6" />
                    <span style={styles.loadingText}>
                        {isEnhancing ? 'Enhancing description...' : 'Generating object details...'}
                    </span>
                </div>
            ) : error ? (
                <div style={styles.errorState}>
                    <p style={styles.errorText}>{error}</p>
                    <button onClick={() => handleGenerateClick()} style={styles.retryBtn}>
                        Retry
                    </button>
                </div>
            ) : suggestions ? (
                <div style={styles.resultsContainer}>
                    {/* Recommended Model — show at top when present */}
                    {!selectedModel && suggestions.recommendedModel && (
                        <div style={{ backgroundColor: '#1a2a2a', padding: '12px', borderLeft: '3px solid #06b6d4' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>Prompts formatted for:</span>
                                    <span style={{ fontSize: '13px', color: '#22d3ee', fontWeight: 700 }}>
                                        {availableModels.find(m => m.name === suggestions.recommendedModel)?.displayName || suggestions.recommendedModel}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setSelectedModel(suggestions.recommendedModel!)}
                                    style={{ padding: '4px 12px', backgroundColor: '#164e63', border: '1px solid #0e7490', borderRadius: '4px', color: '#22d3ee', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Lock this model
                                </button>
                            </div>
                            {suggestions.recommendedModelReason && (
                                <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#94a3b8', lineHeight: '1.4' }}>
                                    {suggestions.recommendedModelReason}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Workflow Guide — collapsible */}
                    <div style={{ backgroundColor: '#1f1f23', borderLeft: '3px solid #3b82f6' }}>
                        <button
                            onClick={() => setWorkflowExpanded(prev => !prev)}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 12px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
                        >
                            <span style={{ fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px', color: '#93c5fd' }}>
                                <HelpCircle size={13} /> How to use these results
                            </span>
                            <ChevronDown size={14} style={{ transform: workflowExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                        </button>
                        {workflowExpanded && (
                            <ol style={{ margin: '0', padding: '0 12px 12px 28px', fontSize: '12px', color: '#d1d5db', lineHeight: '1.8' }}>
                                {enhanceMode !== 'enhanced' && (
                                    <li><strong>Apply</strong> the Description below to fill in your object details</li>
                                )}
                                <li><strong>Copy</strong> the Reference Image Prompt and paste it into your AI image tool to create a master reference photo</li>
                                <li><strong>Upload</strong> that generated image to the "Reference Image" section below this assistant</li>
                                <li><strong>Copy</strong> the 3 Turnaround Shot prompts to create front, side, and detail views for consistency</li>
                                <li>When creating shots in Scene Manager, your uploaded reference image will automatically be included for consistency</li>
                            </ol>
                        )}
                    </div>

                    {/* Description Suggestion — hidden if user already enhanced */}
                    {enhanceMode !== 'enhanced' && (
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
                    )}

                    {/* Reference Prompt */}
                    <div style={styles.promptCard}>
                        <div style={styles.cardHeader}>
                            <div>
                                <span style={styles.fieldLabel}>Reference Image Prompt</span>
                                <span style={{ fontSize: '10px', color: '#a78bfa', marginLeft: '6px', fontWeight: 400 }}>Step 1</span>
                            </div>
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
                            Copy this prompt into {selectedModel ? (availableModels.find(m => m.name === selectedModel)?.displayName || selectedModel) : 'your AI image tool'} to generate a master reference image, then upload the result below
                        </span>
                    </div>

                    {/* Turnaround Prompts */}
                    {suggestions.turnaroundPrompts && suggestions.turnaroundPrompts.length > 0 && (
                        <div style={{ backgroundColor: '#1f1f23', padding: '12px', borderLeft: '3px solid #f59e0b' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                <RotateCw size={13} color="#f59e0b" />
                                <span style={styles.fieldLabel}>Turnaround Shots</span>
                                <span style={{ fontSize: '10px', color: '#fbbf24', fontWeight: 400 }}>Step 2</span>
                            </div>
                            <span style={{ fontSize: '10px', color: '#6b7280', fontStyle: 'italic', display: 'block', marginBottom: '8px' }}>
                                After creating your reference image, use these prompts to generate multi-angle views for object consistency across shots
                            </span>
                            {suggestions.turnaroundPrompts.map((prompt, index) => (
                                <div key={index} style={{ marginBottom: index < suggestions.turnaroundPrompts!.length - 1 ? '6px' : '0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 600 }}>
                                            {index === 0 ? 'Front 3/4 View' : index === 1 ? 'Side Profile' : index === 2 ? 'Detail Close-up' : `Angle ${index + 1}`}
                                        </span>
                                        <button
                                            onClick={() => handleCopyTurnaround(prompt, index)}
                                            style={styles.copyBtn}
                                        >
                                            {turnaroundCopied === index ? (
                                                <><Check size={12} color="#10b981" /> Copied</>
                                            ) : (
                                                <><Copy size={12} /> Copy</>
                                            )}
                                        </button>
                                    </div>
                                    <p style={{ ...styles.promptText, margin: '0', fontSize: '11px' }}>{prompt}</p>
                                </div>
                            ))}
                        </div>
                    )}

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

                    {/* Conversational Refinement */}
                    <div style={{ backgroundColor: '#1f1f23', borderLeft: '3px solid #6d28d9', padding: '10px 12px' }}>
                        <button
                            onClick={() => setChatOpen(prev => !prev)}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
                        >
                            <span style={{ fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <MessageCircle size={13} /> Refine with AI
                            </span>
                            <ChevronDown size={14} style={{ transform: chatOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                        </button>
                        {chatOpen && (
                            <div style={{ marginTop: '10px' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                                    {quickActions.map((action, i) => (
                                        <button key={i} onClick={() => handleRefine(action)} disabled={refining}
                                            style={{ padding: '3px 8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', borderRadius: '4px', color: '#a78bfa', fontSize: '10px', cursor: refining ? 'not-allowed' : 'pointer', opacity: refining ? 0.5 : 1 }}>
                                            {action}
                                        </button>
                                    ))}
                                </div>
                                {chatHistory.length > 0 && (
                                    <div style={{ maxHeight: '150px', overflowY: 'auto', marginBottom: '8px', padding: '6px', backgroundColor: '#18181b', borderRadius: '4px' }}>
                                        {chatHistory.map((msg, i) => (
                                            <div key={i} style={{ padding: '4px 8px', marginBottom: '4px', borderRadius: '4px', backgroundColor: msg.role === 'user' ? '#27272a' : '#1a2a2a', color: msg.role === 'user' ? '#d1d5db' : '#a7f3d0', fontSize: '11px', lineHeight: '1.4', marginLeft: msg.role === 'user' ? '20%' : '0', marginRight: msg.role === 'user' ? '0' : '20%' }}>
                                                {msg.content}
                                            </div>
                                        ))}
                                        {refining && <div style={{ padding: '4px 8px', color: '#a78bfa', fontSize: '11px' }}><Loader2 size={11} className="spin" style={{ display: 'inline' }} /> Refining...</div>}
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <input type="text" placeholder="e.g. Make it more worn, change color..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleRefine()} disabled={refining}
                                        style={{ flex: 1, padding: '6px 8px', backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '4px', color: '#e5e7eb', fontSize: '12px', outline: 'none' }} />
                                    <button onClick={() => handleRefine()} disabled={!chatInput.trim() || refining}
                                        style={{ padding: '6px 10px', backgroundColor: chatInput.trim() && !refining ? '#8b5cf6' : '#3f3f46', border: 'none', borderRadius: '4px', color: 'white', cursor: chatInput.trim() && !refining ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center' }}>
                                        <Send size={12} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
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
    modelSelect: {
        padding: '4px 8px',
        backgroundColor: '#18181b',
        border: '1px solid #3f3f46',
        borderRadius: '4px',
        color: '#e5e7eb',
        fontSize: '11px',
        outline: 'none',
        flex: 1,
        maxWidth: '200px',
    },
};
