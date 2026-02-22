import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Zap } from 'lucide-react';
import type { AnalysisResult } from '../../types/v2';

interface GradeCardProps {
  analysis: AnalysisResult;
}

const VERDICT_CONFIG = {
  LOCK_IT_IN: {
    color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)',
    icon: CheckCircle, label: '🔒 Lock It In', subtitle: 'Production ready',
  },
  REFINE: {
    color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)',
    icon: AlertTriangle, label: '🔧 Refine', subtitle: 'Good foundation — needs targeted fixes',
  },
  REGENERATE: {
    color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)',
    icon: XCircle, label: '🔄 Regenerate', subtitle: 'Fundamental issues — start fresh',
  },
};

function ScorePill({ label, score }: { label: string; score: number }) {
  const color = score >= 8 ? '#10b981' : score >= 6 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '6px 12px', borderRadius: '8px',
      backgroundColor: 'rgba(39, 39, 42, 0.8)',
    }}>
      <span style={{ fontSize: '12px', color: '#a1a1aa' }}>{label}</span>
      <span style={{ fontSize: '16px', fontWeight: 700, color }}>{score.toFixed(1)}</span>
      <span style={{ fontSize: '11px', color: '#71717a' }}>/10</span>
    </div>
  );
}

export const GradeCard: React.FC<GradeCardProps> = ({ analysis }) => {
  const config = VERDICT_CONFIG[analysis.verdict];
  const Icon = config.icon;

  return (
    <div style={{
      borderRadius: '12px',
      border: `1px solid ${config.border}`,
      backgroundColor: config.bg,
      padding: '20px',
    }}>
      {/* Verdict header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <Icon size={24} color={config.color} />
        <div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: config.color }}>{config.label}</div>
          <div style={{ fontSize: '12px', color: '#a1a1aa' }}>{config.subtitle}</div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: config.color }}>{analysis.score}</div>
          <div style={{ fontSize: '11px', color: '#71717a' }}>/100</div>
        </div>
      </div>

      {/* Score pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <ScorePill label="Style Match" score={analysis.styleMatch} />
        <ScorePill label="Realism" score={analysis.realism} />
      </div>

      {/* Diagnosis */}
      <div style={{
        fontSize: '14px', color: '#d4d4d8', lineHeight: 1.6,
        padding: '12px', borderRadius: '8px',
        backgroundColor: 'rgba(0,0,0,0.2)',
        marginBottom: analysis.issues.length > 0 ? '12px' : 0,
      }}>
        {analysis.diagnosis}
      </div>

      {/* Issues */}
      {analysis.issues.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {analysis.issues.map((issue, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: '8px',
              fontSize: '13px', color: '#a1a1aa',
            }}>
              <Zap size={14} color={config.color} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{issue}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
