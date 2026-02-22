import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Upload } from 'lucide-react';
import type { IterationEntry } from '../../types/v2';

interface IterationRailProps {
  iterations: IterationEntry[];
  currentImageUrl: string | null;
  onSelect: (id: string) => void;
}

function getVerdictIcon(verdict?: string) {
  switch (verdict) {
    case 'LOCK_IT_IN': return <CheckCircle size={12} color="#10b981" />;
    case 'REFINE': return <AlertTriangle size={12} color="#f59e0b" />;
    case 'REGENERATE': return <XCircle size={12} color="#ef4444" />;
    default: return null;
  }
}

export const IterationRail: React.FC<IterationRailProps> = ({
  iterations, currentImageUrl, onSelect,
}) => {
  if (iterations.length === 0) return null;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '8px',
      width: '80px', flexShrink: 0,
      overflowY: 'auto', padding: '4px',
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 700, color: '#71717a',
        textTransform: 'uppercase', letterSpacing: '0.05em',
        textAlign: 'center', padding: '4px 0',
      }}>
        History
      </div>
      {iterations.map((entry, i) => {
        const isActive = entry.imageUrl === currentImageUrl;
        return (
          <div
            key={entry.id}
            onClick={() => onSelect(entry.id)}
            style={{
              width: '68px', height: '50px', borderRadius: '6px',
              border: isActive ? '2px solid #8b5cf6' : '1px solid #27272a',
              overflow: 'hidden', cursor: 'pointer',
              position: 'relative', flexShrink: 0,
              opacity: isActive ? 1 : 0.7,
              transition: 'all 0.15s ease',
            }}
          >
            <img
              src={entry.imageUrl}
              alt={`Iteration ${i + 1}`}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
              }}
            />
            {/* Badge */}
            <div style={{
              position: 'absolute', bottom: '2px', right: '2px',
              display: 'flex', alignItems: 'center', gap: '2px',
            }}>
              {entry.isOriginal && (
                <div style={{
                  backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: '3px',
                  padding: '1px 3px', display: 'flex', alignItems: 'center',
                }}>
                  <Upload size={8} color="#a1a1aa" />
                </div>
              )}
              {entry.analysis && (
                <div style={{
                  backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: '3px',
                  padding: '1px 3px', display: 'flex', alignItems: 'center',
                }}>
                  {getVerdictIcon(entry.analysis.verdict)}
                </div>
              )}
            </div>
            {/* Iteration number */}
            <div style={{
              position: 'absolute', top: '2px', left: '2px',
              backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: '3px',
              padding: '0px 4px', fontSize: '9px', color: '#a1a1aa', fontWeight: 700,
            }}>
              {i + 1}
            </div>
          </div>
        );
      })}
    </div>
  );
};
