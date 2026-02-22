import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, ExternalLink } from 'lucide-react';
import type { ModelInfo, ModelRecommendation } from '../../types/v2';

interface ModelPickerProps {
  models: ModelInfo[];
  selectedModelId: string | null;
  recommendation: ModelRecommendation | null;
  onSelect: (modelId: string) => void;
}

function ModelTag({ label }: { label: string }) {
  return (
    <span style={{
      fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
      backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa',
      textTransform: 'uppercase', fontWeight: 600,
    }}>
      {label}
    </span>
  );
}

export const ModelPicker: React.FC<ModelPickerProps> = ({
  models, selectedModelId, recommendation, onSelect,
}) => {
  const [expanded, setExpanded] = useState(false);

  // Split into recommended + others
  const recommendedId = recommendation?.modelId;
  const altIds = new Set(recommendation?.alternatives.map(a => a.modelId) || []);
  
  const imageModels = models.filter(m => m.type === 'image');
  const activeModels = imageModels.filter(m => m.active);
  const externalModels = imageModels.filter(m => !m.active);

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
            {selectedModel && !selectedModel.active && <ModelTag label="Prompt Only" />}
          </div>
        </div>
        {expanded ? <ChevronUp size={18} color="#71717a" /> : <ChevronDown size={18} color="#71717a" />}
      </div>

      {/* Recommendation reasoning */}
      {recommendation && !expanded && (
        <div style={{
          padding: '8px 16px 12px', fontSize: '12px', color: '#a1a1aa',
          lineHeight: 1.5,
        }}>
          {recommendation.reasoning}
        </div>
      )}

      {/* Expanded model list */}
      {expanded && (
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {/* Recommended */}
          {recommendedId && (
            <div style={{ padding: '8px 12px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase', padding: '4px 4px 8px', letterSpacing: '0.05em' }}>
                ⭐ Recommended
              </div>
              {renderModelRow(models.find(m => m.id === recommendedId)!, recommendedId, selectedModelId, recommendation.reasoning, onSelect, setExpanded)}
            </div>
          )}
          
          {/* Alternatives */}
          {recommendation && recommendation.alternatives.length > 0 && (
            <div style={{ padding: '8px 12px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', padding: '4px 4px 8px', letterSpacing: '0.05em' }}>
                Alternatives
              </div>
              {recommendation.alternatives.map(alt => {
                const model = models.find(m => m.id === alt.modelId);
                if (!model) return null;
                return renderModelRow(model, recommendedId, selectedModelId, alt.reasoning, onSelect, setExpanded);
              })}
            </div>
          )}

          {/* All active models */}
          <div style={{ padding: '8px 12px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', padding: '4px 4px 8px', letterSpacing: '0.05em' }}>
              All Models (API)
            </div>
            {activeModels.filter(m => m.id !== recommendedId && !altIds.has(m.id)).map(model => (
              renderModelRow(model, recommendedId, selectedModelId, model.description || '', onSelect, setExpanded)
            ))}
          </div>

          {/* External models */}
          {externalModels.length > 0 && (
            <div style={{ padding: '8px 12px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', padding: '4px 4px 8px', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ExternalLink size={10} /> Prompt Only (use on their platform)
              </div>
              {externalModels.map(model => (
                renderModelRow(model, recommendedId, selectedModelId, model.description || '', onSelect, setExpanded)
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function renderModelRow(
  model: ModelInfo,
  recommendedId: string | null | undefined,
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
        marginBottom: '4px',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => { if (!isSelected) (e.currentTarget.style.backgroundColor = 'rgba(63, 63, 70, 0.5)'); }}
      onMouseLeave={(e) => { if (!isSelected) (e.currentTarget.style.backgroundColor = 'transparent'); }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#e4e4e7' }}>{model.name}</span>
        {!model.active && <ModelTag label="External" />}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {model.strengths.slice(0, 3).map(s => (
            <span key={s} style={{
              fontSize: '9px', padding: '1px 5px', borderRadius: '3px',
              backgroundColor: 'rgba(63, 63, 70, 0.8)', color: '#a1a1aa',
            }}>{s}</span>
          ))}
        </div>
      </div>
      {reasoning && (
        <div style={{ fontSize: '11px', color: '#71717a', marginTop: '4px', lineHeight: 1.4 }}>
          {reasoning}
        </div>
      )}
    </div>
  );
}
