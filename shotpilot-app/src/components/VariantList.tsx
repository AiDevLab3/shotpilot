import React, { useEffect, useState } from 'react';
import { getVariants, deleteVariant } from '../services/api';
import { VariantCard } from './VariantCard';
import { Loader2 } from 'lucide-react';
import type { ImageVariant } from '../types/schema';

interface VariantListProps {
    shotId: number;
}

export const VariantList: React.FC<VariantListProps> = ({ shotId }) => {
    const [variants, setVariants] = useState<ImageVariant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const loadVariants = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('[VARIANT-LIST] Fetching variants for shot:', shotId);
            const data = await getVariants(shotId);
            console.log('[VARIANT-LIST] Raw data:', data);
            if (!Array.isArray(data)) {
                setVariants([]);
                return;
            }
            // Filter to only show variants with generated prompts
            const generated = data.filter(v => v && (v.generated_prompt || v.model_used || (v as any).model_name));
            console.log('[VARIANT-LIST] Filtered generated:', generated.length);
            // Sort: Image models first, then Video models, then by date (newest first)
            const imageModels = ['midjourney', 'higgsfield', 'higgsfield-cinema-studio', 'gpt-image', 'nano-banana-pro', 'dall-e-3'];

            generated.sort((a, b) => {
                const aName = (a as any).model_name || a.model_used || '';
                const bName = (b as any).model_name || b.model_used || '';

                const aIsImage = imageModels.some(m => aName.toLowerCase().includes(m));
                const bIsImage = imageModels.some(m => bName.toLowerCase().includes(m));

                // Primary Sort: Image vs Video
                if (aIsImage && !bIsImage) return -1;
                if (!aIsImage && bIsImage) return 1;

                // Secondary Sort: Date (Newest first)
                const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
                const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
                return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
            });
            setVariants(generated);
        } catch (err: any) {
            console.error('[VARIANT-LIST] Failed to load variants:', err);
            setError(err.message || 'Failed to load variants');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVariants();

        const handleVariantCreated = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (!detail || detail.shotId === shotId) {
                loadVariants();
            }
        };

        window.addEventListener('variantCreated', handleVariantCreated);
        return () => window.removeEventListener('variantCreated', handleVariantCreated);
    }, [shotId]);

    const handleDelete = async (id: number) => {
        try {
            await deleteVariant(id);
            setVariants(prev => prev.filter(v => v.id !== id));
        } catch (err: any) {
            alert(`Delete failed: ${err.message}`);
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>
                    <Loader2 size={14} className="spin" color="#6b7280" />
                    <span>Loading variants...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.error}>
                    <span>{error}</span>
                    <button onClick={loadVariants} style={styles.retryBtn}>Retry</button>
                </div>
            </div>
        );
    }

    if (variants.length === 0) {
        return (
            <div style={styles.container}>
                <div style={styles.empty}>
                    <div style={{ color: '#6b7280', fontSize: '12px' }}>No prompts generated yet</div>
                    <div style={{ color: '#52525b', fontSize: '11px', marginTop: '2px' }}>
                        Click "Generate Prompt" to create your first AI-optimized prompt.
                    </div>
                </div>
            </div>
        );
    }

    // List Render
    return (
        <div style={styles.container}>
            <div
                style={{ ...styles.header, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span>{isExpanded ? '▼' : '▶'}</span> GENERATED PROMPTS ({variants.length})
            </div>
            {isExpanded && (
                <div style={styles.list}>
                    {variants.map(v => (
                        <VariantCard
                            key={v.id}
                            variant={{
                                id: v.id,
                                model_name: (v as any).model_name || v.model_used,
                                prompt_used: v.prompt_used,
                                generated_prompt: v.generated_prompt,
                                quality_tier: v.quality_tier,
                                quality_percentage: v.quality_percentage,
                                created_at: v.created_at,
                            }}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: {
        marginTop: '12px',
    },
    header: {
        fontSize: '11px',
        fontWeight: 700,
        color: '#9ca3af',
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
        marginBottom: '8px',
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    loading: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '11px',
        color: '#6b7280',
        padding: '8px 0',
    },
    error: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '11px',
        color: '#ef4444',
        padding: '8px 0',
    },
    retryBtn: {
        background: 'none',
        border: '1px solid #3f3f46',
        borderRadius: '4px',
        color: '#9ca3af',
        fontSize: '11px',
        padding: '2px 8px',
        cursor: 'pointer',
    },
    empty: {
        padding: '12px',
        backgroundColor: '#1f1f23',
        borderRadius: '6px',
        border: '1px dashed #27272a',
        textAlign: 'center',
    },
};
