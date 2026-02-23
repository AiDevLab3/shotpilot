import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, ExternalLink, Film, Image as ImageIcon, Wrench, Pencil } from 'lucide-react';
import type { ModelInfo, ModelRecommendation } from '../../types/v2';

interface ModelPickerProps {
  models: ModelInfo[];
  selectedModelId: string | null;
  recommendation: ModelRecommendation | null;
  onSelect: (modelId: string) => void;
}

function ModelTag({ label, color }: { label: string; color?: string }) {
  return (
    <span style={{
      fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
      backgroundColor: color ? `${color}20` : 'rgba(139, 92, 246, 0.15)',
      color: color || '#a78bfa',
      textTransform: 'uppercase', fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}

function CapabilityDots({ capabilities }: { capabilities: string[] }) {
  const capColors: Record<string, string> = {
    generate: '#10b981', edit: '#f59e0b', 'img2img': '#3b82f6',
    inpaint: '#8b5cf6', upscale: '#ec4899', 'character-consistency': '#06b6d4',
    'style-transfer': '#f97316', 'image-to-video': '#6366f1', 'text-to-video': '#14b8a6',
    text: '#84cc16',
  };
  return (
    <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
      {capabilities.slice(0, 5).map(cap => (
        <span key={cap} style={{
          fontSize: '8px', padding: '1px 4px', borderRadius: '3px',
          backgroundColor: `${capColors[cap] || '#71717a'}20`,
          color: capColors[cap] || '#71717a', fontWeight: 600,
        }}>{cap}</span>
      ))}
    </div>
  );
}

export const ModelPicker: React.FC<ModelPickerProps> = ({
  models, selectedModelId, recommendation, onSelect,
}) => {
  const [expanded, setExpanded] = useState(false);

  const recommendedId = recommendation?.modelId;
  const altIds = new Set(recommendation?.alternatives.map(a => a.modelId) || []);
  const selectedModel = models.find(m => m.id === selectedModelId);
  const isRecommended = selectedModelId === recommendedId;

  // Categorize models
  const generatorModels = models.filter(m => m.type === 'image' && m.active && !m.hasEdit);
  const editModels = models.filter(m => m.type === 'image' && m.active && m.hasEdit);
  const utilityModels = models.filter(m => m.type === 'utility' && m.active);
  const externalModels = models.filter(m => !m.active);
  
  // For "regenerate" verdict: primary = best generator, also show editors
  // For "improve" verdict: primary = best editor, also show generators
  const isRegenerate = recommendation?.strategy === 'regenerate';

  return (
    <div style={{
      borderRadius: '12px', border: '1px solid #27272a',
      backgroundColor: 'rgba(24, 24, 27, 0.8)', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px',
        cursor: 'pointer', borderBottom: expanded ? '1px solid #27272a' : 'none',
      }} onClick={() => setExpanded(!expanded)}>
        <Sparkles size={16} color="#8b5cf6" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', color: '#a1a1aa' }}>Model</div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#e4e4e7', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {selectedModel?.name || 'Choose a model'}
            {isRecommended && <ModelTag label="Recommended" />}
            {selectedModel && !selectedModel.active && <ModelTag label="Prompt Only" color="#71717a" />}
            {selectedModel?.type === 'utility' && <ModelTag label="Utility" color="#84cc16" />}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#52525b', fontSize: '11px' }}>
          {models.filter(m => m.active).length} models
        </div>
        {expanded ? <ChevronUp size={18} color="#71717a" /> : <ChevronDown size={18} color="#71717a" />}
      </div>

      {/* Recommendation reasoning (when collapsed) */}
      {recommendation && !expanded && (
        <div style={{
          padding: '8px 16px 12px', fontSize: '12px', color: '#a1a1aa', lineHeight: 1.5,
        }}>
          {recommendation.reasoning}
        </div>
      )}

      {/* Expanded model list */}
      {expanded && (
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <div style={{ padding: '8px 12px' }}>
            
            {/* Primary Recommendation */}
            {recommendedId && models.find(m => m.id === recommendedId) && (
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase', padding: '4px 4px 8px', letterSpacing: '0.05em' }}>
                  ⭐ {isRegenerate ? 'Recommended for Regeneration' : 'Recommended'}
                </div>
                {renderModelRow(models.find(m => m.id === recommendedId)!, selectedModelId, recommendation?.reasoning || '', onSelect, setExpanded)}
              </div>
            )}

            {/* Alternatives */}
            {recommendation && recommendation.alternatives.length > 0 && (
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', padding: '8px 4px 8px', letterSpacing: '0.05em' }}>
                  Also Consider
                </div>
                {recommendation.alternatives.map(alt => {
                  const model = models.find(m => m.id === alt.modelId);
                  if (!model) return null;
                  return renderModelRow(model, selectedModelId, alt.reasoning, onSelect, setExpanded);
                })}
              </div>
            )}

            {/* Edit Models section (when regenerate is recommended, show editors as option) */}
            {isRegenerate && editModels.length > 0 && (
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', padding: '8px 4px 8px', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Pencil size={10} /> Or Edit Instead
                </div>
                {editModels
                  .filter(m => m.id !== recommendedId && !altIds.has(m.id))
                  .map(model => renderModelRow(model, selectedModelId, '', onSelect, setExpanded))
                }
              </div>
            )}

            {/* Generator Models section (when edit is recommended, show generators as option) */}
            {!isRegenerate && generatorModels.length > 0 && (
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', padding: '8px 4px 8px', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ImageIcon size={10} /> Or Regenerate
                </div>
                {generatorModels
                  .filter(m => m.id !== recommendedId && !altIds.has(m.id))
                  .map(model => renderModelRow(model, selectedModelId, '', onSelect, setExpanded))
                }
              </div>
            )}

            {/* All Image Models */}
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', padding: '8px 4px 8px', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ImageIcon size={10} /> All Image Models
              </div>
              {models
                .filter(m => m.type === 'image' && m.active && m.id !== recommendedId && !altIds.has(m.id))
                .filter(m => isRegenerate ? !editModels.includes(m) : !generatorModels.includes(m))
                .map(model => renderModelRow(model, selectedModelId, '', onSelect, setExpanded))
              }
            </div>

            {/* Post-Processing / Utility */}
            {utilityModels.length > 0 && (
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#84cc16', textTransform: 'uppercase', padding: '8px 4px 8px', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Wrench size={10} /> Post-Processing
                </div>
                {utilityModels
                  .filter(m => m.id !== recommendedId && !altIds.has(m.id))
                  .map(model => renderModelRow(model, selectedModelId, model.type === 'utility' ? 'Use after editing/regeneration for final upscale' : '', onSelect, setExpanded))
                }
              </div>
            )}

            {/* External / Prompt Only */}
            {externalModels.length > 0 && (
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', padding: '8px 4px 8px', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ExternalLink size={10} /> Prompt Only ({externalModels.length})
                </div>
                {externalModels.map(model => renderModelRow(model, selectedModelId, model.description || '', onSelect, setExpanded))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function renderModelRow(
  model: ModelInfo,
  selectedModelId: string | null,
  reasoning: string,
  onSelect: (id: string) => void,
  setExpanded: (v: boolean) => void,
) {
  const isSelected = model.id === selectedModelId;
  return (
    <div
      key={model.id}
      onClick={() => { onSelect(model.id); setExpanded(false); }}
      style={{
        padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
        backgroundColor: isSelected ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
        border: isSelected ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent',
        marginBottom: '4px', transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => { if (!isSelected) (e.currentTarget.style.backgroundColor = 'rgba(63, 63, 70, 0.5)'); }}
      onMouseLeave={(e) => { if (!isSelected) (e.currentTarget.style.backgroundColor = 'transparent'); }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#e4e4e7' }}>{model.name}</span>
        {!model.active && <ModelTag label="External" color="#71717a" />}
        {model.type === 'video' && <ModelTag label="Video" color="#6366f1" />}
        {model.type === 'utility' && <ModelTag label="Utility" color="#84cc16" />}
        {model.hasEdit && <ModelTag label="Edit" color="#f59e0b" />}
      </div>
      {/* Capabilities */}
      <div style={{ marginTop: '4px' }}>
        <CapabilityDots capabilities={model.capabilities} />
      </div>
      {/* Strengths */}
      <div style={{ marginTop: '4px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {(model.strengths || []).slice(0, 4).map(s => (
          <span key={s} style={{
            fontSize: '9px', padding: '1px 5px', borderRadius: '3px',
            backgroundColor: 'rgba(63, 63, 70, 0.8)', color: '#a1a1aa',
          }}>{s}</span>
        ))}
      </div>
      {reasoning && (
        <div style={{ fontSize: '11px', color: '#71717a', marginTop: '4px', lineHeight: 1.4 }}>
          {reasoning}
        </div>
      )}
    </div>
  );
}
