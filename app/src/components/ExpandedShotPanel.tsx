import React, { useState } from 'react';
import type { Shot, ImageVariant, ImageAuditResult } from '../types/schema';
import { X, Sparkles, Image as ImageIcon, Video, ArrowUp } from 'lucide-react';

interface ExpandedShotPanelProps {
  shot: Shot;
  imageVariants: ImageVariant[];
  onClose: () => void;
  onGenerate: (shot: Shot, type: 'image' | 'video') => void;
  onAnalyze?: (imageVariant: ImageVariant) => void;
  onImprove?: (imageVariant: ImageVariant) => void;
  onUpscale?: (imageVariant: ImageVariant) => void;
  onDiscuss?: (shot: Shot) => void;
}

export const ExpandedShotPanel: React.FC<ExpandedShotPanelProps> = ({
  shot,
  imageVariants,
  onClose,
  onGenerate,
  onAnalyze,
  onImprove,
  onUpscale,
  onDiscuss,
}) => {
  const [selectedVariantIndex] = useState(0);
  
  const mainImage = imageVariants.find(v => v.image_url);
  const selectedVariant = mainImage || imageVariants[selectedVariantIndex];
  
  // Parse audit data if available
  const getAuditData = (variant?: ImageVariant): ImageAuditResult | null => {
    if (!variant?.audit_data) return null;
    try {
      return JSON.parse(variant.audit_data);
    } catch {
      return null;
    }
  };

  const auditData = getAuditData(selectedVariant);
  const auditScore = selectedVariant?.audit_score || shot.readiness_percentage || shot.quality_percentage || 0;

  const renderWithMentions = (text: string): React.ReactNode => {
    if (!text) return text;
    const parts = text.split(/(@"[^"]+"|@[\w'-]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {

        const isChar = true; // Simplified for now
        return (
          <span key={i} style={{
            background: isChar ? 'rgba(59,130,246,0.15)' : 'rgba(234,179,8,0.15)',
            color: isChar ? '#60a5fa' : '#fbbf24',
            padding: '1px 4px',
            borderRadius: '3px',
            fontWeight: 500,
            fontSize: '11px',
          }}>
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div style={{
      marginTop: '16px',
      backgroundColor: '#151a21',
      border: '1px solid #1e2530',
      borderRadius: '8px',
      padding: '20px',
      position: 'relative',
    }}>
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'none',
          border: 'none',
          color: '#9ca3af',
          cursor: 'pointer',
          padding: '4px',
        }}
      >
        <X size={20} />
      </button>

      {/* Title */}
      <h3 style={{
        margin: '0 0 20px 0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#f3f4f6',
      }}>
        Shot {shot.shot_number}: {shot.shot_type} — {renderWithMentions(shot.description || 'No description')}
      </h3>

      <div style={{
        display: 'flex',
        gap: '20px',
        alignItems: 'flex-start',
      }}>
        {/* Image */}
        <div style={{
          width: '300px',
          flexShrink: 0,
        }}>
          {selectedVariant?.image_url ? (
            <img
              src={selectedVariant.image_url}
              alt=""
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '8px',
                backgroundColor: '#000',
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              aspectRatio: '16/9',
              backgroundColor: '#27272a',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              color: '#6b7280',
            }}>
              <Sparkles size={32} />
              <span style={{ fontSize: '14px', fontWeight: '600' }}>No Image</span>
              <p style={{ 
                fontSize: '12px', 
                textAlign: 'center', 
                margin: 0, 
                padding: '0 20px',
                lineHeight: '1.4',
              }}>
                {shot.description || 'Generate an image to visualize this shot'}
              </p>
            </div>
          )}
        </div>

        {/* Analysis and Actions */}
        <div style={{
          flex: 1,
          minWidth: 0,
        }}>
          {selectedVariant?.image_url && auditData ? (
            /* Show audit results */
            <div>
              <h4 style={{
                margin: '0 0 12px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: '#f3f4f6',
              }}>
                Analysis Results
              </h4>
              
              {/* Overall Score */}
              <div style={{
                padding: '12px',
                backgroundColor: '#1e2530',
                borderRadius: '6px',
                marginBottom: '16px',
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: auditScore >= 80 ? '#10b981' : auditScore >= 50 ? '#f59e0b' : '#ef4444',
                  marginBottom: '4px',
                }}>
                  {auditScore}/10
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#9ca3af',
                  marginBottom: '8px',
                }}>
                  Overall Score
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#e5e7eb',
                }}>
                  Recommendation: <strong>{auditData.recommendation}</strong>
                </div>
              </div>

              {/* Dimension Scores */}
              {auditData.dimensions && (
                <div style={{ marginBottom: '16px' }}>
                  <h5 style={{
                    margin: '0 0 8px 0',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#f3f4f6',
                  }}>
                    Detailed Scores
                  </h5>
                  {Object.entries(auditData.dimensions).map(([key, data]) => (
                    <div key={key} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '4px 0',
                      fontSize: '12px',
                    }}>
                      <span style={{ color: '#9ca3af', textTransform: 'capitalize' }}>
                        {key.replace(/_/g, ' ')}:
                      </span>
                      <span style={{ color: '#e5e7eb', fontWeight: '600' }}>
                        {data.score}/10
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Issues */}
              {auditData.issues && auditData.issues.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h5 style={{
                    margin: '0 0 8px 0',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#f3f4f6',
                  }}>
                    Issues Found
                  </h5>
                  <ul style={{
                    margin: 0,
                    paddingLeft: '16px',
                    fontSize: '12px',
                    color: '#e5e7eb',
                  }}>
                    {auditData.issues.slice(0, 3).map((issue, i) => (
                      <li key={i} style={{ marginBottom: '4px' }}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Summary */}
              {auditData.summary && (
                <div style={{ marginBottom: '16px' }}>
                  <h5 style={{
                    margin: '0 0 8px 0',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#f3f4f6',
                  }}>
                    Summary
                  </h5>
                  <p style={{
                    margin: 0,
                    fontSize: '12px',
                    color: '#9ca3af',
                    lineHeight: '1.4',
                  }}>
                    {auditData.summary}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}>
                {onImprove && (
                  <button
                    onClick={() => onImprove(selectedVariant)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'rgba(251, 191, 36, 0.1)',
                      border: '1px solid rgba(251, 191, 36, 0.3)',
                      borderRadius: '6px',
                      color: '#fbbf24',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    🔧 Improve
                  </button>
                )}
                
                <button
                  onClick={() => onGenerate(shot, 'image')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '6px',
                    color: '#a78bfa',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <ImageIcon size={16} /> Regenerate
                </button>

                {onUpscale && (
                  <button
                    onClick={() => onUpscale(selectedVariant)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      borderRadius: '6px',
                      color: '#22c55e',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <ArrowUp size={16} /> Upscale
                  </button>
                )}
                {onDiscuss && (
                  <button
                    onClick={() => onDiscuss(shot)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '6px',
                      color: '#a78bfa',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    💬 Discuss with CD
                  </button>
                )}
              </div>
            </div>
          ) : selectedVariant?.image_url && !auditData ? (
            /* Image exists but no audit data */
            <div>
              <h4 style={{
                margin: '0 0 12px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: '#f3f4f6',
              }}>
                Image Actions
              </h4>
              
              <p style={{
                fontSize: '12px',
                color: '#9ca3af',
                marginBottom: '16px',
              }}>
                This image hasn't been analyzed yet. Analyze it to get quality scores and improvement suggestions.
              </p>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}>
                {onAnalyze && (
                  <button
                    onClick={() => onAnalyze(selectedVariant)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '6px',
                      color: '#60a5fa',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    🔍 Analyze Image
                  </button>
                )}
                
                <button
                  onClick={() => onGenerate(shot, 'image')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '6px',
                    color: '#a78bfa',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <ImageIcon size={16} /> Regenerate
                </button>
              </div>
            </div>
          ) : (
            /* No image - show generate options */
            <div>
              <h4 style={{
                margin: '0 0 12px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: '#f3f4f6',
              }}>
                Generate Content
              </h4>
              
              <div style={{
                padding: '12px',
                backgroundColor: '#1e2530',
                borderRadius: '6px',
                marginBottom: '16px',
              }}>
                <h5 style={{
                  margin: '0 0 8px 0',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#f3f4f6',
                }}>
                  Shot Description
                </h5>
                <p style={{
                  margin: 0,
                  fontSize: '12px',
                  color: '#9ca3af',
                  lineHeight: '1.4',
                }}>
                  {renderWithMentions(shot.description || 'No description available')}
                </p>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}>
                <button
                  onClick={() => onGenerate(shot, 'image')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'rgba(20, 184, 166, 0.1)',
                    border: '1px solid rgba(20, 184, 166, 0.3)',
                    borderRadius: '6px',
                    color: '#2dd4bf',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Sparkles size={16} /> Generate Image
                </button>
                
                <button
                  onClick={() => onGenerate(shot, 'video')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'rgba(168, 85, 247, 0.1)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    borderRadius: '6px',
                    color: '#a78bfa',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Video size={16} /> Generate Video
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};