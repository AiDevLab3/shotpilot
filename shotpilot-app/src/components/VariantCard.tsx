import React, { useState, useRef, useEffect } from 'react';
import { ReadinessBadge } from './ReadinessBadge';
import { ImageAuditReport } from './ImageAuditReport';
import { uploadVariantImage, auditVariantImage, getVariantAudit, refineVariantPrompt } from '../services/api';
import { Copy, Check, Trash2, ChevronDown, ChevronUp, Upload, Shield, Loader2, Wand2, ImageIcon, Type } from 'lucide-react';
import type { ImageAuditResult } from '../types/schema';

interface Variant {
    id: number;
    model_name?: string;
    model_used?: string;
    prompt_used?: string;
    generated_prompt?: string;
    user_edited_prompt?: string;
    quality_tier?: string;
    quality_percentage?: number;
    image_url?: string;
    audit_score?: number;
    audit_recommendation?: string;
    audit_data?: string;
    created_at: string;
}

interface VariantCardProps {
    variant: Variant;
    onDelete: (id: number) => void;
}

const MODEL_ICONS: Record<string, string> = {
    midjourney: '\uD83C\uDFA8',
    higgsfield: '\uD83D\uDCF7',
    'nano_banana_pro': '\uD83C\uDF4C',
    'gpt_image': '\uD83E\uDDE0',
    veo: '\uD83C\uDFAC',
    kling: '\uD83C\uDF1F',
};

function getModelIcon(name: string): string {
    const lower = name.toLowerCase().replace(/[\s.-]+/g, '_');
    for (const [key, icon] of Object.entries(MODEL_ICONS)) {
        if (lower.includes(key)) return icon;
    }
    return '\u2728';
}

function timeAgo(dateStr: string): string {
    if (!dateStr) return '';
    try {
        const now = Date.now();
        const then = new Date(dateStr).getTime();
        if (isNaN(then)) return '';
        const diffSec = Math.floor((now - then) / 1000);
        if (diffSec < 60) return 'just now';
        const diffMin = Math.floor(diffSec / 60);
        if (diffMin < 60) return `${diffMin}m ago`;
        const diffHr = Math.floor(diffMin / 60);
        if (diffHr < 24) return `${diffHr}h ago`;
        const diffDay = Math.floor(diffHr / 24);
        if (diffDay < 30) return `${diffDay}d ago`;
        return new Date(dateStr).toLocaleDateString();
    } catch {
        return '';
    }
}

export const VariantCard: React.FC<VariantCardProps> = ({ variant, onDelete }) => {
    const [expanded, setExpanded] = useState(false);
    const [copied, setCopied] = useState(false);
    const [imageUrl, setImageUrl] = useState(variant.image_url || '');
    const [uploading, setUploading] = useState(false);
    const [auditing, setAuditing] = useState(false);
    const [auditResult, setAuditResult] = useState<ImageAuditResult | null>(null);
    const [showAudit, setShowAudit] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refining, setRefining] = useState(false);
    const [refinedPrompt, setRefinedPrompt] = useState(variant.user_edited_prompt || '');
    const [referenceStrategy, setReferenceStrategy] = useState<{ action: string; title: string; reason: string } | null>(null);
    const [showOriginal, setShowOriginal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const modelName = variant.model_name || variant.model_used || 'Unknown';
    const originalPrompt = variant.generated_prompt || variant.prompt_used || '';
    const hasRefinedPrompt = !!refinedPrompt;
    const activePrompt = hasRefinedPrompt ? refinedPrompt : originalPrompt;
    const tier = variant.quality_tier || 'draft';
    const preview = activePrompt.length > 150 ? activePrompt.slice(0, 150) + '...' : activePrompt;
    const needsExpand = activePrompt.length > 150;

    const handleRefinePrompt = async () => {
        setRefining(true);
        setError(null);
        try {
            const result = await refineVariantPrompt(variant.id);
            setRefinedPrompt(result.refined_prompt);
            setReferenceStrategy(result.reference_strategy);
        } catch (err: any) {
            setError(err.message || 'Refinement failed');
        } finally {
            setRefining(false);
        }
    };

    // Load existing audit data on mount
    useEffect(() => {
        if (variant.audit_data) {
            try {
                setAuditResult(JSON.parse(variant.audit_data));
            } catch { /* ignore */ }
        } else if (variant.image_url) {
            // Check if there's stored audit data on the server
            getVariantAudit(variant.id).then(data => {
                if (data.audited) {
                    setAuditResult(data as ImageAuditResult);
                }
            }).catch(() => { /* no audit yet */ });
        }
    }, [variant.id]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(activePrompt);
        } catch {
            const ta = document.createElement('textarea');
            ta.value = activePrompt;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDelete = () => {
        if (confirm('Delete this variant?')) {
            onDelete(variant.id);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 20 * 1024 * 1024) {
            setError('Image must be under 20MB');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const result = await uploadVariantImage(variant.id, file);
            setImageUrl(result.image_url);
            // Auto-clear any old audit since image changed
            setAuditResult(null);
        } catch (err: any) {
            setError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleRunAudit = async () => {
        if (!imageUrl) {
            setError('Upload an image first');
            return;
        }

        setAuditing(true);
        setError(null);

        try {
            const result = await auditVariantImage(variant.id);
            setAuditResult(result);
            setShowAudit(true);
        } catch (err: any) {
            setError(err.message || 'Audit failed');
        } finally {
            setAuditing(false);
        }
    };

    return (
        <div style={styles.card}>
            {/* Header row */}
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <span style={{ fontSize: '14px' }}>{getModelIcon(modelName)}</span>
                    <span style={styles.modelName}>{modelName}</span>
                    <ReadinessBadge tier={tier} />
                    {auditResult && (
                        <span
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600,
                                cursor: 'pointer',
                                color: auditResult.recommendation === 'LOCK IT IN' ? '#10b981'
                                    : auditResult.recommendation === 'REFINE' ? '#f59e0b' : '#ef4444',
                                backgroundColor: auditResult.recommendation === 'LOCK IT IN' ? 'rgba(16,185,129,0.12)'
                                    : auditResult.recommendation === 'REFINE' ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
                                border: `1px solid ${auditResult.recommendation === 'LOCK IT IN' ? 'rgba(16,185,129,0.3)'
                                    : auditResult.recommendation === 'REFINE' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`,
                            }}
                            onClick={() => setShowAudit(!showAudit)}
                            title="Click to view full audit report"
                        >
                            <Shield size={10} />
                            {auditResult.overall_score}/100
                        </span>
                    )}
                </div>
                <span style={styles.time}>{timeAgo(variant.created_at)}</span>
            </div>

            {/* Uploaded Image Preview */}
            {imageUrl && (
                <div style={{
                    marginBottom: '8px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    border: '1px solid #27272a',
                    position: 'relative',
                }}>
                    <img
                        src={imageUrl}
                        alt="Generated result"
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                </div>
            )}

            {/* Audit Report (expandable) */}
            {showAudit && auditResult && (
                <div style={{ marginBottom: '8px' }}>
                    <ImageAuditReport audit={auditResult} />
                </div>
            )}

            {/* Refined Prompt (shown first when available) */}
            {hasRefinedPrompt && (
                <div style={{ marginBottom: '8px' }}>
                    <div style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.04em',
                        color: '#8b5cf6',
                        marginBottom: '4px',
                    }}>
                        Revised Prompt
                    </div>
                    <div style={styles.promptText}>
                        {expanded ? refinedPrompt : (refinedPrompt.length > 150 ? refinedPrompt.slice(0, 150) + '...' : refinedPrompt)}
                    </div>
                    {refinedPrompt.length > 150 && (
                        <button onClick={() => setExpanded(!expanded)} style={styles.expandBtn}>
                            {expanded ? (
                                <><ChevronUp size={12} /> Show Less</>
                            ) : (
                                <><ChevronDown size={12} /> Show Full Prompt</>
                            )}
                        </button>
                    )}
                </div>
            )}

            {/* Reference Strategy Guidance */}
            {referenceStrategy && (
                <div style={{
                    marginBottom: '8px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    backgroundColor: referenceStrategy.action === 'use_reference'
                        ? 'rgba(96, 165, 250, 0.08)'
                        : referenceStrategy.action === 'ref_optional'
                            ? 'rgba(245, 158, 11, 0.08)'
                            : 'rgba(139, 92, 246, 0.08)',
                    border: `1px solid ${referenceStrategy.action === 'use_reference'
                        ? 'rgba(96, 165, 250, 0.2)'
                        : referenceStrategy.action === 'ref_optional'
                            ? 'rgba(245, 158, 11, 0.2)'
                            : 'rgba(139, 92, 246, 0.2)'}`,
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '4px',
                    }}>
                        {referenceStrategy.action === 'use_reference'
                            ? <ImageIcon size={12} style={{ color: '#60a5fa' }} />
                            : <Type size={12} style={{ color: referenceStrategy.action === 'ref_optional' ? '#f59e0b' : '#8b5cf6' }} />
                        }
                        <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: referenceStrategy.action === 'use_reference' ? '#60a5fa'
                                : referenceStrategy.action === 'ref_optional' ? '#f59e0b' : '#8b5cf6',
                            textTransform: 'uppercase' as const,
                            letterSpacing: '0.03em',
                        }}>
                            {referenceStrategy.title}
                        </span>
                    </div>
                    <div style={{
                        fontSize: '11px',
                        color: '#a1a1aa',
                        lineHeight: '1.5',
                    }}>
                        {referenceStrategy.reason}
                    </div>
                </div>
            )}

            {/* Original Prompt */}
            <div>
                {hasRefinedPrompt ? (
                    <button
                        onClick={() => setShowOriginal(!showOriginal)}
                        style={{
                            ...styles.expandBtn,
                            color: '#6b7280',
                            marginTop: '0',
                            marginBottom: showOriginal ? '4px' : '0',
                        }}
                    >
                        {showOriginal ? <><ChevronUp size={12} /> Hide Original</> : <><ChevronDown size={12} /> Show Original Prompt</>}
                    </button>
                ) : (
                    <div style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.04em',
                        color: '#6b7280',
                        marginBottom: '4px',
                    }}>
                        Original Prompt
                    </div>
                )}
                {(showOriginal || !hasRefinedPrompt) && (
                    <>
                        <div style={styles.promptText}>
                            {!hasRefinedPrompt && !expanded ? preview : originalPrompt}
                        </div>
                        {!hasRefinedPrompt && needsExpand && (
                            <button onClick={() => setExpanded(!expanded)} style={styles.expandBtn}>
                                {expanded ? (
                                    <><ChevronUp size={12} /> Show Less</>
                                ) : (
                                    <><ChevronDown size={12} /> Show Full Prompt</>
                                )}
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Error */}
            {error && (
                <div style={{
                    marginTop: '6px', padding: '6px 8px', borderRadius: '4px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                    fontSize: '11px', color: '#ef4444',
                }}>
                    {error}
                </div>
            )}

            {/* Actions — now includes Upload + Audit */}
            <div style={styles.actions}>
                {/* Upload Image */}
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    style={{ ...styles.actionBtn, color: uploading ? '#6b7280' : '#60a5fa' }}
                    title="Upload generated image for audit"
                >
                    {uploading ? <><Loader2 size={12} className="spin" /> Uploading...</> : <><Upload size={12} /> {imageUrl ? 'Replace' : 'Upload'} Image</>}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                />

                {/* Run Audit */}
                {imageUrl && (
                    <button
                        onClick={handleRunAudit}
                        disabled={auditing}
                        style={{ ...styles.actionBtn, color: auditing ? '#6b7280' : '#8b5cf6' }}
                        title="Run 6-dimension holistic image audit"
                    >
                        {auditing ? <><Loader2 size={12} className="spin" /> Auditing...</> : <><Shield size={12} /> Audit</>}
                    </button>
                )}

                {/* AI Refine Prompt — only after audit with REFINE/REGENERATE recommendation */}
                {auditResult && auditResult.recommendation !== 'LOCK IT IN' && (
                    <button
                        onClick={handleRefinePrompt}
                        disabled={refining}
                        style={{ ...styles.actionBtn, color: refining ? '#6b7280' : '#f59e0b' }}
                        title="AI generates a corrected prompt based on audit feedback"
                    >
                        {refining ? <><Loader2 size={12} className="spin" /> Refining...</> : <><Wand2 size={12} /> {hasRefinedPrompt ? 'Re-Refine' : 'Refine'} Prompt</>}
                    </button>
                )}

                <div style={{ flex: 1 }} />

                <button onClick={handleCopy} style={{
                    ...styles.actionBtn,
                    color: copied ? '#10b981' : '#9ca3af',
                }}>
                    {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                </button>
                <button onClick={handleDelete} style={{ ...styles.actionBtn, color: '#ef4444' }}>
                    <Trash2 size={12} /> Delete
                </button>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    card: {
        backgroundColor: '#1f1f23',
        border: '1px solid #27272a',
        borderRadius: '8px',
        padding: '12px 14px',
        overflow: 'hidden' as const,
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap' as const,
    },
    modelName: {
        fontSize: '13px',
        fontWeight: 600,
        color: '#e5e7eb',
    },
    time: {
        fontSize: '11px',
        color: '#6b7280',
    },
    promptText: {
        fontSize: '12px',
        color: '#d1d5db',
        lineHeight: '1.5',
        whiteSpace: 'pre-wrap' as const,
        wordBreak: 'break-word' as const,
    },
    expandBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        background: 'none',
        border: 'none',
        color: '#8b5cf6',
        fontSize: '11px',
        cursor: 'pointer',
        padding: '4px 0',
        marginTop: '4px',
    },
    actions: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginTop: '8px',
        paddingTop: '8px',
        borderTop: '1px solid #27272a',
        flexWrap: 'wrap' as const,
    },
    actionBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        background: 'none',
        border: 'none',
        fontSize: '11px',
        cursor: 'pointer',
        padding: '2px 0',
    },
};
