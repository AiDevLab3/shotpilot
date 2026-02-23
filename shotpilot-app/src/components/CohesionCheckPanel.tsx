import React from 'react';
import type { CohesionCheck } from '../services/agentApi';
import type { Shot } from '../types/schema';
import { X } from 'lucide-react';

interface CohesionCheckPanelProps {
  check: CohesionCheck;
  shots: Shot[];
  onClose: () => void;
  onFixShot?: (shotId: number, action: string, model: string | null, instruction: string) => void;
}

export const CohesionCheckPanel: React.FC<CohesionCheckPanelProps> = ({
  check,
  shots,
  onClose,
  onFixShot,
}) => {
  const getShotNumber = (id: number) => {
    const shot = shots.find(s => s.id === id);
    return shot ? shot.shot_number : '?';
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical': return { icon: '🔴', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.25)' };
      case 'warning': return { icon: '🟡', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.25)' };
      default: return { icon: '🔵', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.25)' };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lighting': return '💡';
      case 'color': return '🎨';
      case 'character': return '👤';
      case 'style': return '🖌️';
      case 'composition': return '📐';
      case 'mood': return '🎭';
      default: return '📋';
    }
  };

  const getActionStyle = (action: string) => {
    switch (action) {
      case 'regenerate': return { color: '#ef4444', label: 'Regenerate' };
      case 'edit': return { color: '#f59e0b', label: 'Edit' };
      case 'color-grade': return { color: '#a78bfa', label: 'Color Grade' };
      case 'keep': return { color: '#10b981', label: 'Keep ✓' };
      default: return { color: '#6b7280', label: action };
    }
  };

  const scoreColor = check.cohesion_score >= 80 ? '#10b981' :
    check.cohesion_score >= 60 ? '#f59e0b' : '#ef4444';

  const criticalCount = check.issues.filter(i => i.severity === 'critical').length;
  const warningCount = check.issues.filter(i => i.severity === 'warning').length;
  const infoCount = check.issues.filter(i => i.severity === 'info').length;

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
          <span style={{ fontSize: '16px' }}>🔍</span>
          <span style={{ color: '#e5e7eb', fontSize: '14px', fontWeight: 600 }}>Cohesion Check</span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '4px' }}>
          <X size={16} />
        </button>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Score + summary */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '16px',
        }}>
          {/* Score circle */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            border: `3px solid ${scoreColor}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ color: scoreColor, fontSize: '20px', fontWeight: 700, lineHeight: 1 }}>
              {check.cohesion_score}
            </span>
            <span style={{ color: scoreColor, fontSize: '8px', fontWeight: 500, opacity: 0.8 }}>
              / 100
            </span>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{
              color: '#d1d5db',
              fontSize: '12px',
              lineHeight: '1.5',
              marginBottom: '6px',
            }}>
              {check.summary}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {criticalCount > 0 && (
                <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: 600 }}>
                  🔴 {criticalCount} critical
                </span>
              )}
              {warningCount > 0 && (
                <span style={{ color: '#f59e0b', fontSize: '11px', fontWeight: 600 }}>
                  🟡 {warningCount} warning{warningCount > 1 ? 's' : ''}
                </span>
              )}
              {infoCount > 0 && (
                <span style={{ color: '#3b82f6', fontSize: '11px', fontWeight: 600 }}>
                  🔵 {infoCount} info
                </span>
              )}
              {check.issues.length === 0 && (
                <span style={{ color: '#10b981', fontSize: '11px', fontWeight: 600 }}>
                  ✅ No issues found
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Issues */}
        {check.issues.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ color: '#e5e7eb', fontSize: '12px', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Issues
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {check.issues.map((issue, i) => {
                const sev = getSeverityStyle(issue.severity);
                return (
                  <div key={i} style={{
                    padding: '10px 12px',
                    backgroundColor: sev.bg,
                    border: `1px solid ${sev.border}`,
                    borderRadius: '6px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px' }}>{sev.icon}</span>
                      <span style={{ fontSize: '12px' }}>{getCategoryIcon(issue.category)}</span>
                      <span style={{ color: sev.color, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
                        {issue.category}
                      </span>
                      <span style={{ color: '#6b7280', fontSize: '10px' }}>
                        Shot {issue.between_shots.map(id => getShotNumber(id)).join(' ↔ ')}
                      </span>
                    </div>
                    <div style={{ color: '#d1d5db', fontSize: '11px', marginBottom: '4px' }}>
                      {issue.description}
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '10px', fontStyle: 'italic' }}>
                      💡 {issue.fix_suggestion}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {check.recommendations.length > 0 && (
          <div>
            <h4 style={{ color: '#e5e7eb', fontSize: '12px', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Per-Shot Recommendations
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {check.recommendations.map((rec, i) => {
                const actionStyle = getActionStyle(rec.action);
                return (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '6px',
                  }}>
                    <span style={{ color: '#f3f4f6', fontSize: '11px', fontWeight: 600, minWidth: '50px' }}>
                      Shot {getShotNumber(rec.shot_id)}
                    </span>
                    <span style={{
                      color: actionStyle.color,
                      fontSize: '10px',
                      fontWeight: 600,
                      backgroundColor: `${actionStyle.color}15`,
                      padding: '2px 8px',
                      borderRadius: '3px',
                      minWidth: '70px',
                      textAlign: 'center',
                    }}>
                      {actionStyle.label}
                    </span>
                    <span style={{ color: '#9ca3af', fontSize: '10px', flex: 1 }}>
                      {rec.instruction}
                    </span>
                    {rec.model && (
                      <span style={{ color: '#6b7280', fontSize: '9px', backgroundColor: '#27272a', padding: '2px 6px', borderRadius: '3px' }}>
                        {rec.model}
                      </span>
                    )}
                    {rec.action !== 'keep' && onFixShot && (
                      <button
                        onClick={() => onFixShot(rec.shot_id, rec.action, rec.model, rec.instruction)}
                        style={{
                          padding: '3px 8px',
                          backgroundColor: 'rgba(59, 130, 246, 0.15)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '4px',
                          color: '#60a5fa',
                          fontSize: '9px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Fix
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
