import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp, Wrench, Lightbulb } from 'lucide-react';
import type { ImageAuditResult } from '../types/schema';

interface ImageAuditReportProps {
    audit: ImageAuditResult;
    compact?: boolean;
}

const DIMENSION_LABELS: Record<string, { label: string; icon: string }> = {
    physics: { label: 'Physics', icon: '🔬' },
    style_consistency: { label: 'Style Consistency', icon: '🎨' },
    lighting_atmosphere: { label: 'Lighting & Atmosphere', icon: '💡' },
    clarity: { label: 'Clarity', icon: '🔍' },
    composition: { label: 'Composition', icon: '📐' },
    character_identity: { label: 'Character Identity', icon: '👤' },
};

const RECOMMENDATION_CONFIG = {
    'LOCK IT IN': { color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)', icon: CheckCircle, label: 'LOCK IT IN' },
    'REFINE': { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)', icon: AlertTriangle, label: 'REFINE' },
    'REGENERATE': { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)', icon: XCircle, label: 'REGENERATE' },
};

function getScoreColor(score: number, max: number): string {
    const pct = score / max;
    if (pct >= 0.85) return '#10b981';
    if (pct >= 0.7) return '#f59e0b';
    return '#ef4444';
}

function ScoreBar({ score, max, label, icon, notes }: { score: number; max: number; label: string; icon: string; notes: string }) {
    const [expanded, setExpanded] = useState(false);
    const color = getScoreColor(score, max);
    const pct = (score / max) * 100;

    return (
        <div style={{ marginBottom: '6px' }}>
            <div
                style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: notes ? 'pointer' : 'default', minWidth: 0 }}
                onClick={() => notes && setExpanded(!expanded)}
            >
                <span style={{ fontSize: '12px', flexShrink: 0 }}>{icon}</span>
                <span style={{ fontSize: '11px', color: '#d1d5db', flexShrink: 0, whiteSpace: 'nowrap' }}>{label}</span>
                <div style={{ flex: 1, minWidth: 0, height: '8px', backgroundColor: '#27272a', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        backgroundColor: color,
                        borderRadius: '4px',
                        transition: 'width 0.5s ease',
                    }} />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color, flexShrink: 0, whiteSpace: 'nowrap' }}>
                    {score}/{max}
                </span>
                {notes && (
                    <span style={{ color: '#6b7280', flexShrink: 0 }}>
                        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </span>
                )}
            </div>
            {expanded && notes && (
                <div style={{
                    marginTop: '4px',
                    marginLeft: '26px',
                    padding: '8px 10px',
                    backgroundColor: '#1a1a1e',
                    borderRadius: '6px',
                    border: '1px solid #27272a',
                    fontSize: '11px',
                    color: '#a1a1aa',
                    lineHeight: '1.5',
                }}>
                    {notes}
                </div>
            )}
        </div>
    );
}

export const ImageAuditReport: React.FC<ImageAuditReportProps> = ({ audit, compact = false }) => {
    const [showDetails, setShowDetails] = useState(!compact);
    const rec = RECOMMENDATION_CONFIG[audit.recommendation] || RECOMMENDATION_CONFIG['REFINE'];
    const RecIcon = rec.icon;

    return (
        <div style={{
            backgroundColor: '#18181b',
            border: `1px solid ${rec.border}`,
            borderRadius: '10px',
            overflow: 'hidden',
        }}>
            {/* Header: Score + Recommendation */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                backgroundColor: rec.bg,
                cursor: compact ? 'pointer' : 'default',
                flexWrap: 'wrap' as const,
                gap: '6px',
            }} onClick={() => compact && setShowDetails(!showDetails)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Shield size={16} color={rec.color} />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#e5e7eb' }}>
                        Audit
                    </span>
                    <span style={{
                        fontSize: '16px',
                        fontWeight: 800,
                        color: rec.color,
                    }}>
                        {audit.overall_score}/100
                    </span>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    backgroundColor: rec.bg,
                    border: `1px solid ${rec.border}`,
                }}>
                    <RecIcon size={12} color={rec.color} />
                    <span style={{ fontSize: '11px', fontWeight: 700, color: rec.color }}>
                        {rec.label}
                    </span>
                </div>
            </div>

            {showDetails && (
                <div style={{ padding: '10px 8px' }}>
                    {/* Summary */}
                    {audit.summary && (
                        <div style={{
                            fontSize: '12px',
                            color: '#a1a1aa',
                            lineHeight: '1.5',
                            marginBottom: '12px',
                            padding: '8px 10px',
                            backgroundColor: '#1f1f23',
                            borderRadius: '6px',
                        }}>
                            {audit.summary}
                        </div>
                    )}

                    {/* 6-Dimension Scores */}
                    <div style={{ marginBottom: '12px' }}>
                        {Object.entries(audit.dimensions).map(([key, dim]) => {
                            const meta = DIMENSION_LABELS[key];
                            if (!meta) return null;
                            return (
                                <ScoreBar
                                    key={key}
                                    score={dim.score}
                                    max={10}
                                    label={meta.label}
                                    icon={meta.icon}
                                    notes={dim.notes}
                                />
                            );
                        })}
                    </div>

                    {/* Issues */}
                    {audit.issues && audit.issues.length > 0 && (
                        <div style={{ marginBottom: '10px' }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                fontSize: '11px', fontWeight: 700, color: '#ef4444',
                                textTransform: 'uppercase', letterSpacing: '0.03em',
                                marginBottom: '6px',
                            }}>
                                <Wrench size={12} /> Issues Found
                            </div>
                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                {audit.issues.map((issue, i) => (
                                    <li key={i} style={{ fontSize: '11px', color: '#d1d5db', lineHeight: '1.6', marginBottom: '2px' }}>
                                        {issue}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Prompt Adjustments */}
                    {audit.prompt_adjustments && audit.prompt_adjustments.length > 0 && (
                        <div>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                fontSize: '11px', fontWeight: 700, color: '#8b5cf6',
                                textTransform: 'uppercase', letterSpacing: '0.03em',
                                marginBottom: '6px',
                            }}>
                                <Lightbulb size={12} /> Suggested Prompt Adjustments
                            </div>
                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                {audit.prompt_adjustments.map((adj, i) => (
                                    <li key={i} style={{ fontSize: '11px', color: '#d1d5db', lineHeight: '1.6', marginBottom: '2px' }}>
                                        {adj}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
