import React, { useEffect, useState } from 'react';
import { getAvailableModels, generatePrompt } from '../services/api';
import type { AIModel } from '../types/schema';
import { Wand2, X, Sparkles, Loader2, Copy, Check } from 'lucide-react';

interface ShotContext {
    shotNumber: string;
    sceneName: string;
    shotType: string;
    shotDescription: string;
    qualityTier: string;
    qualityScore?: number;
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
    shotId: number;
    shotContext: ShotContext;
    currentCredits: number;
    onGenerated?: () => void;
}

export const GeneratePromptModal: React.FC<GeneratePromptModalProps> = ({
    isOpen,
    onClose,
    shotId,
    shotContext,
    currentCredits,
    onGenerated,
}) => {
    const [models, setModels] = useState<AIModel[]>([]);
    const [selectedModel, setSelectedModel] = useState('');
    const [loadingModels, setLoadingModels] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<GenerationResult | null>(null);
    const [copied, setCopied] = useState(false);
    const [didGenerate, setDidGenerate] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setResult(null);
            setError(null);
            setCopied(false);
            setDidGenerate(false);
            loadModels();
        }
    }, [isOpen]);

    const loadModels = async () => {
        setLoadingModels(true);
        try {
            console.log('[MODAL] Fetching models...');
            const fetched = await getAvailableModels();
            console.log('[MODAL] Models data:', fetched);
            setModels(fetched);
            if (fetched.length > 0) setSelectedModel(fetched[0].id);
        } catch (err) {
            console.error('[MODAL] Failed to load models:', err);
            setError('Failed to load models');
        } finally {
            setLoadingModels(false);
        }
    };

    const handleGenerate = async () => {
        if (!selectedModel || currentCredits < 1) return;
        setGenerating(true);
        setError(null);
        try {
            const res = await generatePrompt(shotId, selectedModel);
            const modelObj = models.find(m => m.id === selectedModel);
            setResult({
                prompt: res.generated_prompt || res.prompt_used || '',
                assumptions: res.assumptions || '',
                modelName: modelObj?.name || selectedModel,
                qualityTier: res.quality_tier || shotContext.qualityTier,
                creditsRemaining: res.credits_remaining ?? (currentCredits - 1),
            });
            setDidGenerate(true);

            // Notify header CreditBadge
            window.dispatchEvent(new CustomEvent('creditUpdate', {
                detail: { credits: res.credits_remaining ?? (currentCredits - 1) }
            }));

            // Notify VariantList to refresh
            window.dispatchEvent(new CustomEvent('variantCreated', {
                detail: { shotId }
            }));
        } catch (err: any) {
            const msg = err.message || '';
            if (msg.includes('403') || msg.toLowerCase().includes('forbidden')) {
                setError('Insufficient credits to generate a prompt.');
            } else if (msg.includes('500') || msg.toLowerCase().includes('internal')) {
                setError('Generation failed. Your credit has been refunded.');
            } else {
                setError('Connection lost. Please retry.');
            }
        } finally {
            setGenerating(false);
        }
    };

    const handleCopy = async () => {
        if (!result) return;
        try {
            await navigator.clipboard.writeText(result.prompt);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = result.prompt;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleClose = () => {
        if (didGenerate && onGenerated) {
            onGenerated();
        }
        onClose();
    };

    if (!isOpen) return null;

    const imageModels = models.filter(m => m.type === 'image');
    const videoModels = models.filter(m => m.type === 'video');

    const tierColor = shotContext.qualityTier === 'production' ? '#10b981' : '#fbbf24';
    const tierLabel = shotContext.qualityTier === 'production' ? 'Production' : 'Draft';

    return (
        <div style={styles.overlay} onClick={handleClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={styles.header}>
                    <h2 style={styles.title}>
                        {result ? (
                            <><Check size={20} color="#10b981" /> Prompt Generated!</>
                        ) : (
                            <><Wand2 size={20} color="#8b5cf6" /> Generate Prompt</>
                        )}
                    </h2>
                    <button onClick={handleClose} style={styles.closeBtn}>
                        <X size={18} />
                    </button>
                </div>

                <div style={styles.divider} />

                {!result ? (
                    /* --- Pre-generation view --- */
                    <div style={styles.body}>
                        {/* Shot context */}
                        <div style={styles.contextBox}>
                            <div style={styles.contextLabel}>Shot Context:</div>
                            <div style={styles.contextRow}>
                                <span style={{ color: '#e5e7eb', fontWeight: 600 }}>
                                    Shot #{shotContext.shotNumber}: {shotContext.shotType}
                                </span>
                            </div>
                            {shotContext.sceneName && (
                                <div style={styles.contextRow}>
                                    <span style={{ color: '#9ca3af' }}>Scene: </span>
                                    <span style={{ color: '#d1d5db' }}>{shotContext.sceneName}</span>
                                </div>
                            )}
                            {shotContext.shotDescription && (
                                <div style={styles.contextRow}>
                                    <span style={{ color: '#9ca3af' }}>Description: </span>
                                    <span style={{ color: '#d1d5db' }}>{shotContext.shotDescription}</span>
                                </div>
                            )}
                            <div style={styles.contextRow}>
                                <span style={{ color: '#9ca3af' }}>Quality: </span>
                                <span style={{
                                    color: tierColor,
                                    fontWeight: 600,
                                }}>
                                    {tierLabel}
                                    {shotContext.qualityScore != null && ` (${Math.round(shotContext.qualityScore)}%)`}
                                </span>
                            </div>
                        </div>

                        {/* Model selector */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Select Model</label>
                            {loadingModels ? (
                                <div style={{ ...styles.select, display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280' }}>
                                    <Loader2 size={14} className="spin" /> Loading models...
                                </div>
                            ) : (
                                <select
                                    value={selectedModel}
                                    onChange={e => setSelectedModel(e.target.value)}
                                    style={styles.select}
                                >
                                    {imageModels.length > 0 && (
                                        <optgroup label="Image Models">
                                            {imageModels.map(m => (
                                                <option key={m.id} value={m.id}>{m.name}</option>
                                            ))}
                                        </optgroup>
                                    )}
                                    {videoModels.length > 0 && (
                                        <optgroup label="Video Models">
                                            {videoModels.map(m => (
                                                <option key={m.id} value={m.id}>{m.name}</option>
                                            ))}
                                        </optgroup>
                                    )}
                                </select>
                            )}
                        </div>

                        {/* Credit info */}
                        <div style={styles.creditInfo}>
                            <div style={styles.creditRow}>
                                <span style={{ color: '#9ca3af' }}>Credit Balance:</span>
                                <span style={{ color: currentCredits > 50 ? '#10b981' : currentCredits >= 10 ? '#fbbf24' : '#ef4444', fontWeight: 600 }}>
                                    {currentCredits} Credits
                                </span>
                            </div>
                            <div style={styles.creditRow}>
                                <span style={{ color: '#9ca3af' }}>Generation Cost:</span>
                                <span style={{ color: '#d1d5db' }}>1 Credit</span>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div style={styles.error}>{error}</div>
                        )}

                        {/* Footer buttons */}
                        <div style={styles.footer}>
                            <button onClick={handleClose} style={styles.cancelBtn}>
                                Cancel
                            </button>
                            <button
                                onClick={handleGenerate}
                                disabled={generating || currentCredits < 1 || loadingModels}
                                style={{
                                    ...styles.generateBtn,
                                    opacity: (generating || currentCredits < 1 || loadingModels) ? 0.6 : 1,
                                    cursor: (generating || currentCredits < 1 || loadingModels) ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {generating ? (
                                    <><Loader2 size={16} className="spin" /> Generating...</>
                                ) : (
                                    <><Sparkles size={16} /> Generate (1 Credit)</>
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    /* --- Post-generation success view --- */
                    <div style={styles.body}>
                        {/* Model + quality */}
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', fontSize: '14px' }}>
                            <div>
                                <span style={{ color: '#9ca3af' }}>Model: </span>
                                <span style={{ color: '#e5e7eb', fontWeight: 600 }}>{result.modelName}</span>
                            </div>
                            <div>
                                <span style={{ color: '#9ca3af' }}>Quality: </span>
                                <span style={{ color: result.qualityTier === 'production' ? '#10b981' : '#fbbf24', fontWeight: 600 }}>
                                    {result.qualityTier === 'production' ? 'Production' : 'Draft'}
                                </span>
                            </div>
                        </div>

                        {/* Generated prompt */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={styles.label}>Generated Prompt:</label>
                            <div style={styles.promptBox}>
                                {result.prompt}
                            </div>
                            <button
                                onClick={handleCopy}
                                style={{
                                    ...styles.copyBtn,
                                    color: copied ? '#10b981' : '#9ca3af',
                                    borderColor: copied ? '#10b981' : '#3f3f46',
                                }}
                            >
                                {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy to Clipboard</>}
                            </button>
                        </div>

                        {/* Assumptions */}
                        {result.assumptions && (
                            <div style={styles.assumptions}>
                                <div style={{ fontWeight: 600, color: '#d1d5db', marginBottom: '4px', fontSize: '13px' }}>
                                    AI Assumptions:
                                </div>
                                <div style={{ whiteSpace: 'pre-wrap' }}>{result.assumptions}</div>
                            </div>
                        )}

                        {/* Credits remaining */}
                        <div style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '20px' }}>
                            Credits Remaining: <span style={{ color: '#e5e7eb', fontWeight: 600 }}>{result.creditsRemaining}</span>
                        </div>

                        {/* Close button */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={handleClose} style={styles.doneBtn}>Close</button>
                        </div>
                    </div>
                )}
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
        maxWidth: '600px',
        border: '1px solid #27272a',
        maxHeight: '90vh',
        overflow: 'auto',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    closeBtn: {
        background: 'none',
        border: 'none',
        color: '#6b7280',
        cursor: 'pointer',
        padding: '4px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
    },
    divider: {
        height: '1px',
        backgroundColor: '#27272a',
    },
    body: {
        padding: '20px 24px',
    },
    contextBox: {
        backgroundColor: '#27272a',
        borderRadius: '8px',
        padding: '14px 16px',
        marginBottom: '20px',
        fontSize: '13px',
    },
    contextLabel: {
        color: '#9ca3af',
        fontSize: '11px',
        fontWeight: 700,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        marginBottom: '8px',
    },
    contextRow: {
        marginBottom: '4px',
        lineHeight: '1.5',
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
        textTransform: 'uppercase' as const,
        letterSpacing: '0.03em',
    },
    select: {
        width: '100%',
        backgroundColor: '#27272a',
        border: '1px solid #3f3f46',
        padding: '10px 12px',
        color: 'white',
        borderRadius: '6px',
        fontSize: '14px',
    },
    creditInfo: {
        backgroundColor: '#1f1f23',
        border: '1px solid #27272a',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '20px',
    },
    creditRow: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '14px',
        padding: '2px 0',
    },
    error: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '6px',
        padding: '10px 14px',
        color: '#ef4444',
        fontSize: '13px',
        marginBottom: '16px',
    },
    footer: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        marginTop: '4px',
    },
    cancelBtn: {
        background: 'transparent',
        color: '#9ca3af',
        border: 'none',
        cursor: 'pointer',
        padding: '10px 16px',
        fontSize: '14px',
    },
    generateBtn: {
        backgroundColor: '#8b5cf6',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '6px',
        border: 'none',
        fontSize: '14px',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    promptBox: {
        backgroundColor: '#0f172a',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #1e293b',
        color: '#e2e8f0',
        fontSize: '14px',
        whiteSpace: 'pre-wrap' as const,
        lineHeight: '1.6',
        maxHeight: '250px',
        overflowY: 'auto' as const,
    },
    copyBtn: {
        marginTop: '8px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: 'transparent',
        border: '1px solid #3f3f46',
        borderRadius: '6px',
        padding: '6px 12px',
        fontSize: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    assumptions: {
        backgroundColor: '#1f1f23',
        border: '1px solid #27272a',
        borderRadius: '6px',
        padding: '12px 14px',
        marginBottom: '16px',
        fontSize: '12px',
        color: '#94a3b8',
        fontStyle: 'italic',
    },
    doneBtn: {
        backgroundColor: '#2563eb',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 600,
    },
};
