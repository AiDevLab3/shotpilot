import React, { useState } from 'react';
import { QualityBadge } from './QualityBadge';
import { Copy, Check, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface Variant {
    id: number;
    model_name?: string;
    model_used?: string;
    prompt_used?: string;
    generated_prompt?: string;
    quality_tier?: string;
    quality_percentage?: number;
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
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diffSec = Math.floor((now - then) / 1000);

    if (diffSec < 60) return 'just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 30) return `${diffDay}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

export const VariantCard: React.FC<VariantCardProps> = ({ variant, onDelete }) => {
    const [expanded, setExpanded] = useState(false);
    const [copied, setCopied] = useState(false);

    const modelName = variant.model_name || variant.model_used || 'Unknown';
    const prompt = variant.generated_prompt || variant.prompt_used || '';
    const tier = variant.quality_tier || 'draft';
    const preview = prompt.length > 150 ? prompt.slice(0, 150) + '...' : prompt;
    const needsExpand = prompt.length > 150;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(prompt);
        } catch {
            const ta = document.createElement('textarea');
            ta.value = prompt;
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

    return (
        <div style={styles.card}>
            {/* Header row */}
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <span style={{ fontSize: '14px' }}>{getModelIcon(modelName)}</span>
                    <span style={styles.modelName}>{modelName}</span>
                    <QualityBadge tier={tier} />
                </div>
                <span style={styles.time}>{timeAgo(variant.created_at)}</span>
            </div>

            {/* Prompt text */}
            <div style={styles.promptText}>
                {expanded ? prompt : preview}
            </div>

            {needsExpand && (
                <button onClick={() => setExpanded(!expanded)} style={styles.expandBtn}>
                    {expanded ? (
                        <><ChevronUp size={12} /> Show Less</>
                    ) : (
                        <><ChevronDown size={12} /> Show Full Prompt</>
                    )}
                </button>
            )}

            {/* Actions */}
            <div style={styles.actions}>
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
        justifyContent: 'flex-end',
        gap: '12px',
        marginTop: '8px',
        paddingTop: '8px',
        borderTop: '1px solid #27272a',
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
