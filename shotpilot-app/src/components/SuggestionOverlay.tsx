import React, { useState } from 'react';
import type { PlacementSuggestion } from '../services/agentApi';
import type { Shot, ProjectImage } from '../types/schema';
import { Check, X, MessageCircle, Zap } from 'lucide-react';

interface SuggestionOverlayProps {
  suggestions: PlacementSuggestion[];
  shots: Shot[];
  stagedImages: ProjectImage[];
  onAccept: (suggestion: PlacementSuggestion) => void;
  onReject: (suggestion: PlacementSuggestion) => void;
  onAcceptAll: () => void;
  onDiscussWithCD: () => void;
  onDismiss: () => void;
  loading?: boolean;
}

export const SuggestionOverlay: React.FC<SuggestionOverlayProps> = ({
  suggestions,
  shots,
  stagedImages,
  onAccept,
  onReject,
  onAcceptAll,
  onDiscussWithCD,
  onDismiss,
  loading,
}) => {
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  if (loading) {
    return (
      <div style={{
        marginTop: '12px',
        padding: '16px',
        backgroundColor: 'rgba(139, 92, 246, 0.08)',
        border: '1px solid rgba(139, 92, 246, 0.25)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{
          width: '20px',
          height: '20px',
          border: '2px solid rgba(139, 92, 246, 0.3)',
          borderTop: '2px solid #a78bfa',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <span style={{ color: '#c4b5fd', fontSize: '13px', fontWeight: 500 }}>
          CD is analyzing staged images against planned shots...
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!suggestions.length) return null;

  const activeSuggestions = suggestions.filter(s => !dismissed.has(s.image_id));
  if (!activeSuggestions.length) return null;

  const getImage = (id: number) => stagedImages.find(img => img.id === id);
  const getShot = (id: number) => shots.find(s => s.id === id);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return '#10b981';
    if (confidence >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'Strong match';
    if (confidence >= 60) return 'Good match';
    return 'Possible match';
  };

  return (
    <div style={{
      marginTop: '12px',
      backgroundColor: 'rgba(139, 92, 246, 0.06)',
      border: '1px solid rgba(139, 92, 246, 0.2)',
      borderRadius: '8px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(139, 92, 246, 0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={16} color="#a78bfa" />
          <span style={{ color: '#c4b5fd', fontSize: '13px', fontWeight: 600 }}>
            CD Suggestions ({activeSuggestions.length})
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onAcceptAll}
            style={{
              padding: '4px 12px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '4px',
              color: '#34d399',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Check size={12} /> Accept All
          </button>
          <button
            onClick={onDiscussWithCD}
            style={{
              padding: '4px 12px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '4px',
              color: '#60a5fa',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <MessageCircle size={12} /> Discuss with CD
          </button>
          <button
            onClick={onDismiss}
            style={{
              padding: '4px 8px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              fontSize: '14px',
            }}
            title="Dismiss suggestions"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Suggestion cards */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {activeSuggestions.map((suggestion) => {
          const image = getImage(suggestion.image_id);
          const shot = getShot(suggestion.shot_id);
          if (!image || !shot) return null;

          return (
            <div
              key={`${suggestion.image_id}-${suggestion.shot_id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '6px',
              }}
            >
              {/* Thumbnail */}
              <img
                src={image.image_url}
                alt=""
                style={{
                  width: '48px',
                  height: '48px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                  border: '1px solid #3f3f46',
                }}
              />

              {/* Arrow */}
              <span style={{ color: '#6b7280', fontSize: '16px' }}>→</span>

              {/* Shot info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <span style={{ color: '#f3f4f6', fontSize: '12px', fontWeight: 600 }}>
                    Shot {shot.shot_number}
                  </span>
                  <span style={{
                    color: '#9ca3af',
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    backgroundColor: '#27272a',
                    padding: '1px 6px',
                    borderRadius: '3px',
                  }}>
                    {shot.shot_type}
                  </span>
                </div>
                <div style={{
                  color: '#9ca3af',
                  fontSize: '11px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {suggestion.reasoning}
                </div>
              </div>

              {/* Confidence */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                minWidth: '60px',
              }}>
                <span style={{
                  color: getConfidenceColor(suggestion.confidence),
                  fontSize: '16px',
                  fontWeight: 700,
                }}>
                  {suggestion.confidence}%
                </span>
                <span style={{
                  color: getConfidenceColor(suggestion.confidence),
                  fontSize: '9px',
                  fontWeight: 500,
                  opacity: 0.8,
                }}>
                  {getConfidenceLabel(suggestion.confidence)}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => onAccept(suggestion)}
                  style={{
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '4px',
                    color: '#34d399',
                    cursor: 'pointer',
                  }}
                  title="Accept"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => {
                    onReject(suggestion);
                    setDismissed(prev => new Set(prev).add(suggestion.image_id));
                  }}
                  style={{
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '4px',
                    color: '#f87171',
                    cursor: 'pointer',
                  }}
                  title="Reject"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
