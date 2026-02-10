import React, { useEffect, useState, useCallback } from 'react';
import { Sparkles, Loader2, Check, Plus, X, Film } from 'lucide-react';
import type { ShotPlan, ShotPlanShot } from '../types/schema';
import { getShotPlan } from '../services/api';

interface ShotPlanningPanelProps {
    isOpen: boolean;
    onClose: () => void;
    sceneId: number;
    sceneName: string;
    onCreateShots: (shots: Array<{
        shot_number: string;
        shot_type: string;
        camera_angle?: string;
        camera_movement?: string;
        focal_length?: string;
        description: string;
        blocking?: string;
    }>) => void;
}

export const ShotPlanningPanel: React.FC<ShotPlanningPanelProps> = ({
    isOpen,
    onClose,
    sceneId,
    sceneName,
    onCreateShots,
}) => {
    const [shotPlan, setShotPlan] = useState<ShotPlan | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

    const loadShotPlan = useCallback(async () => {
        setLoading(true);
        setError(null);
        setShotPlan(null);
        setSelectedIndices(new Set());
        try {
            const plan = await getShotPlan(sceneId);
            setShotPlan(plan);
            // Select all shots by default
            if (plan.shots && plan.shots.length > 0) {
                setSelectedIndices(new Set(plan.shots.map((_, i) => i)));
            }
        } catch (err: any) {
            setError(err.message || 'Failed to generate shot plan');
        } finally {
            setLoading(false);
        }
    }, [sceneId]);

    useEffect(() => {
        if (isOpen) {
            loadShotPlan();
        }
    }, [isOpen, loadShotPlan]);

    const toggleSelection = (index: number) => {
        setSelectedIndices(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    const handleCreateShots = () => {
        if (!shotPlan || selectedIndices.size === 0) return;

        const selected = shotPlan.shots
            .filter((_, i) => selectedIndices.has(i))
            .map((shot) => ({
                shot_number: shot.shot_number,
                shot_type: shot.shot_type,
                camera_angle: shot.camera_angle,
                camera_movement: shot.camera_movement,
                focal_length: shot.focal_length,
                description: shot.description,
                blocking: shot.blocking,
            }));

        onCreateShots(selected);
        onClose();
    };

    if (!isOpen) return null;

    const totalShots = shotPlan?.shots?.length ?? 0;
    const selectedCount = selectedIndices.size;

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.headerLeft}>
                        <Film size={20} color="#8b5cf6" />
                        <div>
                            <h2 style={styles.title}>Shot Planning</h2>
                            <p style={styles.subtitle}>AI-powered shot sequence for "{sceneName}"</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={styles.closeBtn}>
                        <X size={18} />
                    </button>
                </div>

                <div style={styles.divider} />

                {/* Body */}
                <div style={styles.body}>
                    {loading ? (
                        <div style={styles.loadingState}>
                            <Loader2 size={24} className="spin" color="#8b5cf6" />
                            <span style={styles.loadingText}>
                                Planning shot sequence for {sceneName}...
                            </span>
                        </div>
                    ) : error ? (
                        <div style={styles.errorState}>
                            <p style={styles.errorText}>{error}</p>
                            <button onClick={loadShotPlan} style={styles.retryBtn}>
                                <Sparkles size={14} />
                                Retry
                            </button>
                        </div>
                    ) : shotPlan && shotPlan.shots && shotPlan.shots.length > 0 ? (
                        <>
                            {/* Sequence Reasoning */}
                            {shotPlan.sequenceReasoning && (
                                <div style={styles.reasoningBlock}>
                                    <Sparkles size={14} color="#8b5cf6" style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <p style={styles.reasoningText}>{shotPlan.sequenceReasoning}</p>
                                </div>
                            )}

                            {/* Shot Cards */}
                            <div style={styles.shotList}>
                                {shotPlan.shots.map((shot, index) => {
                                    const isSelected = selectedIndices.has(index);

                                    return (
                                        <div
                                            key={index}
                                            style={{
                                                ...styles.shotCard,
                                                borderColor: isSelected ? '#8b5cf655' : '#3f3f46',
                                            }}
                                        >
                                            {/* Card Header Row */}
                                            <div style={styles.shotCardHeader}>
                                                <div style={styles.shotCardHeaderLeft}>
                                                    <button
                                                        onClick={() => toggleSelection(index)}
                                                        style={{
                                                            ...styles.checkbox,
                                                            backgroundColor: isSelected ? '#8b5cf6' : 'transparent',
                                                            borderColor: isSelected ? '#8b5cf6' : '#6b7280',
                                                        }}
                                                    >
                                                        {isSelected && <Check size={12} color="white" />}
                                                    </button>
                                                    <span style={styles.shotNumber}>
                                                        Shot {shot.shot_number}
                                                    </span>
                                                    <span style={styles.shotTypeBadge}>
                                                        {shot.shot_type}
                                                    </span>
                                                </div>
                                                {shot.purpose && (
                                                    <span style={styles.purposeBadge}>
                                                        {shot.purpose}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Technical Details */}
                                            <div style={styles.techDetails}>
                                                {shot.camera_angle && (
                                                    <span style={styles.techTag}>
                                                        Angle: {shot.camera_angle}
                                                    </span>
                                                )}
                                                {shot.camera_movement && (
                                                    <span style={styles.techTag}>
                                                        Movement: {shot.camera_movement}
                                                    </span>
                                                )}
                                                {shot.focal_length && (
                                                    <span style={styles.techTag}>
                                                        Focal: {shot.focal_length}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Description */}
                                            {shot.description && (
                                                <p style={styles.shotDescription}>{shot.description}</p>
                                            )}

                                            {/* Blocking */}
                                            {shot.blocking && (
                                                <div style={styles.blockingRow}>
                                                    <span style={styles.blockingLabel}>Blocking:</span>
                                                    <span style={styles.blockingValue}>{shot.blocking}</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : shotPlan && (!shotPlan.shots || shotPlan.shots.length === 0) ? (
                        <div style={styles.emptyState}>
                            <Film size={32} color="#6b7280" />
                            <p style={styles.emptyText}>No additional shots suggested</p>
                        </div>
                    ) : null}
                </div>

                <div style={styles.divider} />

                {/* Footer */}
                <div style={styles.footer}>
                    {totalShots > 0 && (
                        <span style={styles.selectionCount}>
                            {selectedCount} of {totalShots} shots selected
                        </span>
                    )}
                    <button onClick={onClose} style={styles.cancelBtn}>
                        Cancel
                    </button>
                    {totalShots > 0 && (
                        <button
                            onClick={handleCreateShots}
                            disabled={selectedCount === 0 || loading}
                            style={{
                                ...styles.createBtn,
                                opacity: (selectedCount === 0 || loading) ? 0.5 : 1,
                                cursor: (selectedCount === 0 || loading) ? 'not-allowed' : 'pointer',
                            }}
                        >
                            <Plus size={14} />
                            Create Selected Shots
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
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
        maxWidth: '700px',
        border: '1px solid #3f3f46',
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
    headerLeft: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
    },
    title: {
        color: 'white',
        fontSize: '18px',
        fontWeight: 700,
        margin: 0,
    },
    subtitle: {
        color: '#9ca3af',
        fontSize: '13px',
        marginTop: '4px',
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
        flexShrink: 0,
    },
    divider: {
        height: '1px',
        backgroundColor: '#3f3f46',
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
        padding: '48px 0',
    },
    loadingText: {
        color: '#9ca3af',
        fontSize: '14px',
    },
    errorState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        padding: '32px 0',
    },
    errorText: {
        color: '#ef4444',
        fontSize: '14px',
        margin: 0,
    },
    retryBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        borderRadius: '6px',
        border: '1px solid #3f3f46',
        backgroundColor: '#27272a',
        color: '#d1d5db',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
    },
    reasoningBlock: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        backgroundColor: '#1f1f23',
        border: '1px solid #3f3f46',
        borderRadius: '8px',
        padding: '14px 16px',
        marginBottom: '20px',
    },
    reasoningText: {
        color: '#9ca3af',
        fontSize: '13px',
        fontStyle: 'italic',
        lineHeight: '1.6',
        margin: 0,
    },
    shotList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    shotCard: {
        backgroundColor: '#1f1f23',
        border: '1px solid #3f3f46',
        borderRadius: '8px',
        padding: '16px',
        transition: 'border-color 0.2s',
    },
    shotCardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
    },
    shotCardHeaderLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    checkbox: {
        width: '20px',
        height: '20px',
        borderRadius: '4px',
        border: '2px solid #6b7280',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: 0,
        flexShrink: 0,
        transition: 'all 0.15s',
    },
    shotNumber: {
        color: '#e5e7eb',
        fontSize: '14px',
        fontWeight: 700,
    },
    shotTypeBadge: {
        backgroundColor: '#27272a',
        color: '#c4b5fd',
        fontSize: '11px',
        fontWeight: 600,
        padding: '3px 8px',
        borderRadius: '4px',
        border: '1px solid #3f3f46',
    },
    purposeBadge: {
        backgroundColor: '#1e1b4b',
        color: '#a78bfa',
        fontSize: '11px',
        fontWeight: 600,
        padding: '3px 10px',
        borderRadius: '10px',
        border: '1px solid #4c1d95',
    },
    techDetails: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        marginBottom: '10px',
    },
    techTag: {
        backgroundColor: '#27272a',
        color: '#9ca3af',
        fontSize: '11px',
        padding: '3px 8px',
        borderRadius: '4px',
        border: '1px solid #3f3f46',
    },
    shotDescription: {
        color: '#d1d5db',
        fontSize: '13px',
        lineHeight: '1.6',
        margin: '0 0 8px 0',
    },
    blockingRow: {
        display: 'flex',
        gap: '6px',
        alignItems: 'flex-start',
    },
    blockingLabel: {
        color: '#6b7280',
        fontSize: '12px',
        fontWeight: 600,
        flexShrink: 0,
    },
    blockingValue: {
        color: '#9ca3af',
        fontSize: '12px',
        lineHeight: '1.5',
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        padding: '48px 0',
    },
    emptyText: {
        color: '#6b7280',
        fontSize: '14px',
        margin: 0,
    },
    footer: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 24px',
    },
    selectionCount: {
        fontSize: '12px',
        color: '#9ca3af',
        marginRight: 'auto',
    },
    cancelBtn: {
        background: 'transparent',
        color: '#9ca3af',
        border: '1px solid #3f3f46',
        borderRadius: '6px',
        padding: '10px 16px',
        fontSize: '13px',
        cursor: 'pointer',
    },
    createBtn: {
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
