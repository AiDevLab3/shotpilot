import React from 'react';
import { Pencil, RefreshCw, ArrowUpCircle, Loader2 } from 'lucide-react';
import type { AppState } from '../../types/v2';

interface ActionBarProps {
  strategy: 'edit' | 'regenerate';
  onStrategyChange: (s: 'edit' | 'regenerate') => void;
  onGenerate: () => void;
  onExecuteStep?: (modelId: string, instruction?: string) => void;
  onUpscale: () => void;
  appState: AppState;
  canGenerate: boolean;
  canUpscale: boolean;
  hasActiveModel: boolean;
  selectedModelId?: string | null;
  expertPrompt?: string;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  strategy, onStrategyChange, onGenerate, onExecuteStep, onUpscale,
  appState, canGenerate, canUpscale, hasActiveModel,
  selectedModelId, expertPrompt,
}) => {
  const isWorking = appState === 'generating' || appState === 'upscaling' || appState === 'analyzing';

  return (
    <div style={{
      display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap',
    }}>
      {/* Strategy toggle */}
      <div style={{
        display: 'flex', borderRadius: '8px', overflow: 'hidden',
        border: '1px solid #27272a',
      }}>
        <button
          onClick={() => onStrategyChange('edit')}
          style={{
            padding: '8px 16px', border: 'none', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            backgroundColor: strategy === 'edit' ? 'rgba(139, 92, 246, 0.2)' : '#18181b',
            color: strategy === 'edit' ? '#a78bfa' : '#71717a',
          }}
        >
          <Pencil size={14} /> Edit Original
        </button>
        <button
          onClick={() => onStrategyChange('regenerate')}
          style={{
            padding: '8px 16px', border: 'none', borderLeft: '1px solid #27272a',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
            backgroundColor: strategy === 'regenerate' ? 'rgba(139, 92, 246, 0.2)' : '#18181b',
            color: strategy === 'regenerate' ? '#a78bfa' : '#71717a',
          }}
        >
          <RefreshCw size={14} /> Regenerate
        </button>
      </div>

      <div style={{ flex: 1 }} />

      {/* Upscale */}
      <button
        onClick={onUpscale}
        disabled={!canUpscale || isWorking}
        style={{
          padding: '10px 20px', borderRadius: '8px', border: '1px solid #27272a',
          backgroundColor: '#18181b', color: canUpscale && !isWorking ? '#e4e4e7' : '#52525b',
          fontSize: '13px', fontWeight: 600, cursor: canUpscale && !isWorking ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}
      >
        {appState === 'upscaling' ? <Loader2 size={14} className="animate-spin" /> : <ArrowUpCircle size={14} />}
        Topaz Upscale
      </button>

      {/* Main generate button */}
      <button
        onClick={() => {
          if (onExecuteStep && selectedModelId && expertPrompt) {
            // Use new user-in-the-loop executeStep function
            onExecuteStep(selectedModelId, expertPrompt);
          } else {
            // Fall back to legacy generate function
            onGenerate();
          }
        }}
        disabled={!canGenerate || isWorking || !hasActiveModel}
        style={{
          padding: '10px 28px', borderRadius: '8px', border: 'none',
          backgroundColor: canGenerate && !isWorking && hasActiveModel ? '#8b5cf6' : '#27272a',
          color: canGenerate && !isWorking && hasActiveModel ? 'white' : '#52525b',
          fontSize: '14px', fontWeight: 700, cursor: canGenerate && !isWorking && hasActiveModel ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: canGenerate && !isWorking ? '0 0 20px rgba(139, 92, 246, 0.3)' : 'none',
        }}
      >
        {appState === 'generating' ? (
          <><Loader2 size={16} className="animate-spin" /> Generating...</>
        ) : (
          <>{strategy === 'edit' ? <Pencil size={16} /> : <RefreshCw size={16} />} {strategy === 'edit' ? 'Execute Step' : 'Regenerate'}</>
        )}
      </button>
    </div>
  );
};
