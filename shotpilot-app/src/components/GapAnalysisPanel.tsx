import React from 'react';
import type { GapAnalysis } from '../services/agentApi';
import { AlertTriangle, CheckCircle, Plus, X } from 'lucide-react';

interface GapAnalysisPanelProps {
  analysis: GapAnalysis;
  onClose: () => void;
  onGenerateShot?: (shotId: number | null, modelId: string) => void;
  onAddShot?: (shot: { shot_type: string; description: string; position: string }) => void;
}

export const GapAnalysisPanel: React.FC<GapAnalysisPanelProps> = ({
  analysis,
  onClose,
  onGenerateShot,
  onAddShot,
}) => {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return '#ef4444';
      case 'important': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical': return '🔴';
      case 'important': return '🟡';
      default: return '⚪';
    }
  };

  const coverageColor = analysis.coverage_percent >= 80 ? '#10b981' :
    analysis.coverage_percent >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{
      marginTop: '16px',
      backgroundColor: '#151a21',
      border: '1px solid #1e2530',
      borderRadius: '8px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#1e2530',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>📊</span>
          <span style={{ color: '#e5e7eb', fontSize: '14px', fontWeight: 600 }}>Gap Analysis</span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#6b7280',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          <X size={16} />
        </button>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Coverage bar */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: '#9ca3af', fontSize: '12px' }}>Scene Coverage</span>
            <span style={{ color: coverageColor, fontSize: '12px', fontWeight: 600 }}>
              {analysis.coverage_percent}% ({analysis.filled_shots}/{analysis.total_shots} shots)
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '6px',
            backgroundColor: '#374151',
            borderRadius: '3px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${analysis.coverage_percent}%`,
              height: '100%',
              backgroundColor: coverageColor,
              borderRadius: '3px',
              transition: 'width 300ms ease',
            }} />
          </div>
        </div>

        {/* Summary */}
        <div style={{
          padding: '10px 12px',
          backgroundColor: '#18181b',
          borderRadius: '6px',
          marginBottom: '16px',
          color: '#d1d5db',
          fontSize: '12px',
          lineHeight: '1.5',
        }}>
          {analysis.summary}
        </div>

        {/* Gaps */}
        {analysis.gaps.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ color: '#e5e7eb', fontSize: '12px', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Empty Shots ({analysis.gaps.length})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {analysis.gaps.map((gap, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '6px',
                  borderLeft: `3px solid ${getUrgencyColor(gap.urgency)}`,
                }}>
                  <span style={{ fontSize: '12px' }}>{getUrgencyIcon(gap.urgency)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <span style={{ color: '#f3f4f6', fontSize: '11px', fontWeight: 600 }}>
                        Shot {gap.shot_number}
                      </span>
                      <span style={{ color: '#6b7280', fontSize: '10px' }}>
                        {gap.recommended_model} • {gap.estimated_cost}
                      </span>
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '10px' }}>{gap.description}</div>
                  </div>
                  {gap.shot_id && onGenerateShot && (
                    <button
                      onClick={() => onGenerateShot(gap.shot_id, gap.recommended_model)}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: 'rgba(59, 130, 246, 0.15)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '4px',
                        color: '#60a5fa',
                        fontSize: '10px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Generate
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested new shots */}
        {analysis.suggested_new_shots.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ color: '#e5e7eb', fontSize: '12px', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Suggested New Shots
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {analysis.suggested_new_shots.map((shot, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  backgroundColor: '#18181b',
                  border: '1px dashed #3f3f46',
                  borderRadius: '6px',
                }}>
                  <Plus size={14} color="#a78bfa" />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <span style={{ color: '#c4b5fd', fontSize: '11px', fontWeight: 600 }}>
                        {shot.shot_type}
                      </span>
                      <span style={{ color: '#6b7280', fontSize: '10px' }}>
                        {shot.position}
                      </span>
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '10px' }}>{shot.description}</div>
                    <div style={{ color: '#6b7280', fontSize: '9px', marginTop: '2px', fontStyle: 'italic' }}>{shot.reasoning}</div>
                  </div>
                  {onAddShot && (
                    <button
                      onClick={() => onAddShot({ shot_type: shot.shot_type, description: shot.description, position: shot.position })}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: 'rgba(139, 92, 246, 0.15)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '4px',
                        color: '#a78bfa',
                        fontSize: '10px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Add Shot
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Total cost */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 12px',
          backgroundColor: '#18181b',
          borderRadius: '6px',
          borderTop: '1px solid #27272a',
        }}>
          <span style={{ color: '#9ca3af', fontSize: '12px' }}>Est. cost to fill all gaps:</span>
          <span style={{ color: '#fbbf24', fontSize: '14px', fontWeight: 700 }}>{analysis.total_estimated_cost}</span>
        </div>
      </div>
    </div>
  );
};
