import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, ExternalLink, Film, Image as ImageIcon, Wrench } from 'lucide-react';
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
    'background-removal': '#84cc16',
  };
  return (
    <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
      {capabilities.slice(0, 4).map(cap => (
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
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'utility'>('image');

  const recommendedId = recommendation?.modelId;
  const altIds = new Set(recommendation?.alternatives.map(a => a.modelId) || []);

  const filteredModels = models.filter(m => {
    if (filterType === 'all') return true;
    return m.type === filterType;
  });

  const activeModels = filteredModels.filter(m => m.active);
  const externalModels = filteredModels.filter(m => !m.active);
  const selectedModel = models.find(m => m.id === selectedModelId);
  const isRecommended = selectedModelId === recommendedId;

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
            {selectedModel?.type === 'video' && <ModelTag label="Video" color="#6366f1" />}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#52525b', fontSize: '11px' }}>
          {activeModels.length} models
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
        <div>
          {/* Type filter tabs */}
          <div style={{
            display: 'flex', gap: '0', borderBottom: '1px solid #27272a',
          }}>
            {(['image', 'video', 'utility', 'all'] as const).map(type => (
              <button key={type} onClick={() => setFilterType(type)} style={{
                flex: 1, padding: '8px', border: 'none', fontSize: '11px', fontWeight: 600,
                cursor: 'pointer', textTransform: 'capitalize',
                backgroundColor: filterType === type ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                color: filterType === type ? '#a78bfa' : '#71717a',
                borderBottom: filterType === type ? '2px solid #8b5cf6' : '2px solid transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
              }}>
                {type === 'image' && <ImageIcon size={12} />}
                {type === 'video' && <Film size={12} />}
                {type === 'utility' && <Wrench size={12} />}
                {type}
              </button>
            ))}
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '8px 12px' }}>
            {/* Recommended */}
            {recommendedId && filteredModels.some(m => m.id === recommendedId) && (
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase', padding: '4px 4px 8px', letterSpacing: '0.05em' }}>
                  ⭐ Recommended
                </div>
                {renderModelRow(models.find(m => m.id === recommendedId)!, selectedModelId, recommendation?.reasoning || '', onSelect, setExpanded)}
              </div>
            )}

            {/* Alternatives */}
            {recommendation && recommendation.alternatives.length > 0 && (
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', padding: '8px 4px 8px', letterSpacing: '0.05em' }}>
                  Alternatives
                </div>
                {recommendation.alternatives.map(alt => {
                  const model = models.find(m => m.id === alt.modelId);
                  if (!model || !filteredModels.includes(model)) return null;
                  return renderModelRow(model, selectedModelId, alt.reasoning, onSelect, setExpanded);
                })}
              </div>
            )}

            {/* All models */}
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', padding: '8px 4px 8px', letterSpacing: '0.05em' }}>
                All {filterType !== 'all' ? filterType : ''} Models {filterType !== 'all' ? `(${activeModels.length})` : `(${filteredModels.length})`}
              </div>
              {activeModels
                .filter(m => m.id !== recommendedId && !altIds.has(m.id))
                .map(model => renderModelRow(model, selectedModelId, '', onSelect, setExpanded))
              }
            </div>

            {/* External models */}
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
