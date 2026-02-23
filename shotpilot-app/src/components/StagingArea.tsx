import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, X } from 'lucide-react';

interface ProjectImage {
  id: number;
  project_id: number;
  image_url: string;
  title?: string;
  notes?: string;
  tags?: string;
  scene_id?: string;
  style_score?: number;
  realism_score?: number;
  pipeline_score?: number;
  status?: string;
  analysis_json?: string;
  created_at: string;
}

interface StagingAreaProps {
  sceneId: number;
  stagedImages: ProjectImage[];
  onImageClick?: (image: ProjectImage) => void;
  onRemoveImage?: (image: ProjectImage) => void;
}

export const StagingArea: React.FC<StagingAreaProps> = ({ 
  sceneId, 
  stagedImages, 
  onImageClick,
  onRemoveImage,
}) => {
  const [isExpanded, setIsExpanded] = useState(stagedImages.length > 0);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  
  useEffect(() => {
    if (stagedImages.length > 0) {
      setIsExpanded(true);
    }
  }, [stagedImages.length]);

  if (stagedImages.length === 0) {
    return null;
  }

  const isAnalyzed = (image: ProjectImage) => {
    if (image.analysis_json) {
      try {
        const a = JSON.parse(image.analysis_json);
        return !!(a.overall_score || a.summary || a.detected_shot_type);
      } catch {}
    }
    return !!(image.style_score || image.realism_score || image.pipeline_score);
  };

  const getAnalysisScore = (image: ProjectImage) => {
    if (image.analysis_json) {
      try {
        const analysis = JSON.parse(image.analysis_json);
        if (analysis.overall_score) return analysis.overall_score;
      } catch {}
    }
    return image.style_score || image.realism_score || image.pipeline_score;
  };

  const getScoreBadgeColor = (score?: number) => {
    if (!score) return null;
    if (score >= 8) return '#10b981';
    if (score >= 6) return '#f59e0b';
    return '#ef4444';
  };

  const analyzedCount = stagedImages.filter(isAnalyzed).length;
  const unanalyzedCount = stagedImages.length - analyzedCount;

  return (
    <div style={{
      marginTop: '16px',
      backgroundColor: '#151a21',
      border: '1px solid #1e2530',
      borderRadius: '8px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
          cursor: 'pointer',
          backgroundColor: '#1e2530',
          gap: '8px',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? <ChevronDown size={16} color="#9ca3af" /> : <ChevronRight size={16} color="#9ca3af" />}
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#e5e7eb' }}>
          📦 Staged Images ({stagedImages.length})
        </span>
        {/* Analysis status summary */}
        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
          {analyzedCount > 0 && (
            <span style={{
              fontSize: '11px',
              color: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontWeight: 500,
            }}>
              ✅ {analyzedCount} analyzed
            </span>
          )}
          {unanalyzedCount > 0 && (
            <span style={{
              fontSize: '11px',
              color: '#f59e0b',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontWeight: 500,
            }}>
              ⚠️ {unanalyzedCount} not analyzed
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div style={{
          padding: '16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
          gap: '12px',
        }}>
          {stagedImages.map((image) => {
            const analyzed = isAnalyzed(image);
            const score = getAnalysisScore(image);
            const scoreBadgeColor = getScoreBadgeColor(score);
            const isHovered = hoveredId === image.id;
            
            return (
              <div
                key={image.id}
                style={{
                  width: '80px',
                  height: '80px',
                  position: 'relative',
                  backgroundColor: '#27272a',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  cursor: onImageClick ? 'pointer' : 'default',
                  border: `1px solid ${analyzed ? '#3f3f46' : 'rgba(245, 158, 11, 0.4)'}`,
                  transition: 'transform 0.2s ease',
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                }}
                onClick={() => onImageClick?.(image)}
                onMouseEnter={() => setHoveredId(image.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <img
                  src={image.image_url}
                  alt={image.title || 'Staged image'}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                
                {/* Analysis status badge (top-left) */}
                <div style={{
                  position: 'absolute',
                  top: '2px',
                  left: '2px',
                  fontSize: '10px',
                  backgroundColor: analyzed ? 'rgba(16, 185, 129, 0.85)' : 'rgba(245, 158, 11, 0.85)',
                  color: 'white',
                  borderRadius: '3px',
                  padding: '0px 3px',
                  fontWeight: 700,
                  lineHeight: '16px',
                }}>
                  {analyzed ? '✓' : '?'}
                </div>
                
                {/* Score badge (bottom-right) */}
                {score && scoreBadgeColor && (
                  <div style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    backgroundColor: scoreBadgeColor,
                    color: 'white',
                    padding: '1px 4px',
                    borderRadius: '3px',
                    fontSize: '8px',
                    fontWeight: 'bold',
                  }}>
                    {Math.round(score)}
                  </div>
                )}
                
                {/* Hover: Remove button */}
                {isHovered && onRemoveImage && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveImage(image);
                    }}
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      width: '18px',
                      height: '18px',
                      backgroundColor: 'rgba(239, 68, 68, 0.9)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.9)'; }}
                    title="Remove from staging"
                  >
                    <X size={10} color="white" strokeWidth={3} />
                  </div>
                )}

                {/* Hover: dim overlay for non-analyzed */}
                {isHovered && !analyzed && (
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '2px',
                    backgroundColor: 'rgba(245, 158, 11, 0.85)',
                    textAlign: 'center',
                    fontSize: '8px',
                    fontWeight: 600,
                    color: 'white',
                  }}>
                    Not analyzed
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Helper to check if any staged images are unanalyzed
export function getUnanalyzedImages(images: ProjectImage[]): ProjectImage[] {
  return images.filter(img => {
    if (img.analysis_json) {
      try {
        const a = JSON.parse(img.analysis_json);
        return !(a.overall_score || a.summary || a.detected_shot_type);
      } catch {}
    }
    return !(img.style_score || img.realism_score || img.pipeline_score);
  });
}
