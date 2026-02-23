import React, { useState } from 'react';
import type { Shot, ImageVariant, Scene } from '../types/schema';
import { Sparkles } from 'lucide-react';

interface StoryboardPanelProps {
  shot: Shot;
  scene: Scene;
  imageVariants: ImageVariant[];
  onPanelClick: (shot: Shot) => void;
  onGenerate: (shot: Shot, type: 'image' | 'video') => void;
  frameAspectRatio: string;
}

export const StoryboardPanel: React.FC<StoryboardPanelProps> = ({ 
  shot, 
  scene, 
  imageVariants, 
  onPanelClick, 
  onGenerate, 
  frameAspectRatio 
}) => {
  const [hover, setHover] = useState(false);
  
  // Get the first (best) image variant with an actual image
  const mainImage = imageVariants.find(v => v.image_url);
  const auditScore = mainImage?.audit_score || shot.readiness_percentage || shot.quality_percentage || 0;
  
  // Determine status icon and color based on audit score and shot status
  const getStatusInfo = () => {
    if (!mainImage) {
      return { icon: '🎬', color: '#6b7280', label: 'Generate' };
    }
    
    if (shot.status === 'complete') {
      return { icon: '✅', color: '#10b981', label: 'Complete' };
    }
    
    if (auditScore >= 80) {
      return { icon: '✅', color: '#10b981', label: 'Good' };
    } else if (auditScore >= 50) {
      return { icon: '🔧', color: '#f59e0b', label: 'Needs Work' };
    } else if (auditScore > 0) {
      return { icon: '⚠️', color: '#ef4444', label: 'Issues' };
    } else {
      return { icon: '🎬', color: '#6b7280', label: 'Generate' };
    }
  };
  
  const statusInfo = getStatusInfo();
  
  // Get score badge color
  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 50) return '#f59e0b'; // yellow  
    return '#ef4444'; // red
  };

  return (
    <div
      style={{
        width: '200px',
        height: '150px',
        backgroundColor: '#18181b',
        border: hover ? '2px solid #3b82f6' : '1px solid #27272a',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: hover ? 'translateY(-2px)' : 'none',
        boxShadow: hover ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
        position: 'relative',
        flexShrink: 0,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onPanelClick(shot)}
    >
      {/* Image or placeholder */}
      <div 
        style={{
          aspectRatio: frameAspectRatio,
          backgroundColor: '#000',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {mainImage ? (
          <img 
            src={mainImage.image_url} 
            alt="" 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover' 
            }} 
          />
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            color: '#6b7280',
          }}>
            <Sparkles size={24} />
            <span style={{ fontSize: '10px', fontWeight: 600 }}>GENERATE</span>
          </div>
        )}
        
        {/* Shot type label overlay */}
        <div style={{
          position: 'absolute',
          top: '4px',
          left: '4px',
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '10px',
          fontWeight: 600,
          textTransform: 'uppercase',
        }}>
          {shot.shot_type}
        </div>
        
        {/* Status indicator */}
        <div style={{
          position: 'absolute',
          top: '4px',
          right: '4px',
          fontSize: '16px',
        }}>
          {statusInfo.icon}
        </div>
        
        {/* Score badge - only show if there's an actual score */}
        {auditScore > 0 && (
          <div style={{
            position: 'absolute',
            bottom: '4px',
            right: '4px',
            backgroundColor: getScoreBadgeColor(auditScore),
            color: 'white',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 'bold',
          }}>
            {auditScore}/10
          </div>
        )}
      </div>
      
      {/* Shot info */}
      <div style={{
        padding: '8px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#f3f4f6',
            marginBottom: '2px',
          }}>
            Shot {shot.shot_number}
          </div>
          <div style={{
            fontSize: '10px',
            color: '#9ca3af',
            lineHeight: '1.2',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {shot.description || 'No description'}
          </div>
        </div>
      </div>
    </div>
  );
};