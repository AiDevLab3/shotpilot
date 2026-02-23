import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

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
}

export const StagingArea: React.FC<StagingAreaProps> = ({ 
  sceneId, 
  stagedImages, 
  onImageClick 
}) => {
  const [isExpanded, setIsExpanded] = useState(stagedImages.length > 0);
  
  // Auto-expand when images are present
  useEffect(() => {
    if (stagedImages.length > 0) {
      setIsExpanded(true);
    }
  }, [stagedImages.length]);

  if (stagedImages.length === 0) {
    return null;
  }

  const getScoreBadgeColor = (score?: number) => {
    if (!score) return null;
    if (score >= 8) return '#10b981'; // green
    if (score >= 6) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getAnalysisScore = (image: ProjectImage) => {
    // Try to get overall score from analysis_json
    if (image.analysis_json) {
      try {
        const analysis = JSON.parse(image.analysis_json);
        if (analysis.overall_score) return analysis.overall_score;
      } catch (e) {
        // Ignore parsing errors
      }
    }
    // Fall back to individual scores
    return image.style_score || image.realism_score || image.pipeline_score;
  };

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
        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <span style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#e5e7eb',
        }}>
          📦 Staged Images ({stagedImages.length})
        </span>
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
            const score = getAnalysisScore(image);
            const scoreBadgeColor = getScoreBadgeColor(score);
            
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
                  border: '1px solid #3f3f46',
                  transition: 'transform 0.2s ease',
                }}
                onClick={() => onImageClick?.(image)}
                onMouseEnter={(e) => {
                  if (onImageClick) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (onImageClick) {
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                <img
                  src={image.image_url}
                  alt={image.title || 'Staged image'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                
                {/* Score badge */}
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
                
                {/* Status indicator */}
                {image.status === 'approved' && (
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: '2px',
                    fontSize: '12px',
                  }}>
                    ✅
                  </div>
                )}
                {image.status === 'needs_work' && (
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: '2px',
                    fontSize: '12px',
                  }}>
                    🔧
                  </div>
                )}
                {image.status === 'rejected' && (
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: '2px',
                    fontSize: '12px',
                  }}>
                    ⚠️
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