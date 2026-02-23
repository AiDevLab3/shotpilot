import React, { useEffect } from 'react';
import { Loader2, AlertCircle, RotateCcw, Upload, Wand2 } from 'lucide-react';
import { useWorkbenchStore } from '../../stores/workbenchStore';
import { DropZone } from './DropZone';
import { GradeCard } from './GradeCard';
import { ModelPicker } from './ModelPicker';
import { PromptEditor } from './PromptEditor';
import { ActionBar } from './ActionBar';
import { IterationRail } from './IterationRail';

const GeneratePanel: React.FC = () => {
  const store = useWorkbenchStore();

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px', gap: '20px',
    }}>
      <Wand2 size={40} color="#8b5cf6" />
      <div style={{ fontSize: '18px', fontWeight: 700, color: '#e4e4e7' }}>
        Describe your shot
      </div>
      <div style={{ fontSize: '13px', color: '#71717a', textAlign: 'center', maxWidth: '400px' }}>
        The Creative Director will interpret your vision, pick the best model, and generate an expert prompt.
      </div>
      <textarea
        value={store.shotDescription}
        onChange={(e) => store.setShotDescription(e.target.value)}
        placeholder="e.g. Wide establishing shot of Houston skyline at dusk, warm amber light, anamorphic lens flare..."
        style={{
          width: '100%', maxWidth: '500px', minHeight: '120px',
          padding: '14px', borderRadius: '12px',
          border: '1px solid #27272a', backgroundColor: '#18181b',
          color: '#e4e4e7', fontSize: '14px', lineHeight: 1.6,
          resize: 'vertical', outline: 'none',
          fontFamily: 'inherit',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = '#8b5cf6'; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = '#27272a'; }}
      />
      <button
        onClick={store.generateFromDescription}
        disabled={!store.shotDescription.trim() || store.appState !== 'idle'}
        style={{
          padding: '12px 32px', borderRadius: '10px', border: 'none',
          backgroundColor: store.shotDescription.trim() ? '#8b5cf6' : '#27272a',
          color: store.shotDescription.trim() ? 'white' : '#52525b',
          fontSize: '14px', fontWeight: 600, cursor: store.shotDescription.trim() ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', gap: '8px',
          transition: 'all 0.15s ease',
        }}
      >
        {store.appState === 'generating' ? (
          <><Loader2 size={16} className="animate-spin" /> Generating...</>
        ) : (
          <><Wand2 size={16} /> Generate</>
        )}
      </button>
    </div>
  );
};

export const Workbench: React.FC = () => {
  const store = useWorkbenchStore();

  useEffect(() => {
    store.loadModels();
  }, []);

  const selectedModel = store.models.find(m => m.id === store.selectedModelId);
  const hasPrompt = store.expertPrompt.trim().length > 0;
  const canGenerate = hasPrompt && !!store.selectedModelId;
  const canUpscale = !!store.currentImageUrl && store.appState === 'idle';
  const hasActiveModel = selectedModel?.hasAPI ?? (selectedModel as any)?.active ?? false;

  return (
    <div style={{
      display: 'flex', height: '100%', width: '100%',
      backgroundColor: '#09090b', color: '#e4e4e7',
    }}>
      {/* Iteration rail (left) */}
      <IterationRail
        iterations={store.iterations}
        currentImageUrl={store.currentImageUrl}
        onSelect={store.selectIteration}
      />

      {/* Main content */}
      <div style={{
        flex: 1, display: 'flex', overflow: 'hidden',
        padding: '16px', gap: '16px',
      }}>
        {/* Left: Image viewer */}
        <div style={{
          flex: '1 1 50%', display: 'flex', flexDirection: 'column',
          gap: '12px', minWidth: 0,
        }}>
          {!store.currentImageUrl ? (
            <>
              {/* Mode tabs */}
              <div style={{
                display: 'flex', gap: '0', borderRadius: '10px',
                border: '1px solid #27272a', overflow: 'hidden',
              }}>
                <button
                  onClick={() => store.setMode('import')}
                  style={{
                    flex: 1, padding: '10px', border: 'none', fontSize: '13px', fontWeight: 600,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    backgroundColor: store.mode === 'import' ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                    color: store.mode === 'import' ? '#a78bfa' : '#71717a',
                    borderBottom: store.mode === 'import' ? '2px solid #8b5cf6' : '2px solid transparent',
                  }}
                >
                  <Upload size={14} /> Import
                </button>
                <button
                  onClick={() => store.setMode('generate')}
                  style={{
                    flex: 1, padding: '10px', border: 'none', fontSize: '13px', fontWeight: 600,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    backgroundColor: store.mode === 'generate' ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                    color: store.mode === 'generate' ? '#a78bfa' : '#71717a',
                    borderBottom: store.mode === 'generate' ? '2px solid #8b5cf6' : '2px solid transparent',
                  }}
                >
                  <Wand2 size={14} /> Generate
                </button>
              </div>

              {store.mode === 'import' ? (
                <DropZone
                  onFile={store.uploadAndAnalyze}
                  disabled={store.appState !== 'idle'}
                />
              ) : (
                <GeneratePanel />
              )}
            </>
          ) : (
            <>
              {/* Image display */}
              <div style={{
                flex: 1, borderRadius: '12px', overflow: 'hidden',
                border: '1px solid #27272a', position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: '#0a0a0a', minHeight: 0,
              }}>
                <img
                  src={store.currentImageUrl}
                  alt="Current"
                  style={{
                    maxWidth: '100%', maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                />
                {/* Loading overlay */}
                {(store.appState === 'analyzing' || store.appState === 'generating' || store.appState === 'upscaling') && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: '12px',
                  }}>
                    <Loader2 size={32} color="#8b5cf6" className="animate-spin" />
                    <span style={{ fontSize: '14px', color: '#a1a1aa' }}>
                      {store.appState === 'analyzing' && 'Analyzing image...'}
                      {store.appState === 'generating' && 'Generating...'}
                      {store.appState === 'upscaling' && 'Upscaling with Topaz...'}
                    </span>
                  </div>
                )}
              </div>

              {/* New image button */}
              <button
                onClick={store.reset}
                style={{
                  padding: '8px 16px', borderRadius: '8px',
                  border: '1px solid #27272a', backgroundColor: 'transparent',
                  color: '#71717a', fontSize: '12px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  alignSelf: 'flex-start',
                }}
              >
                <RotateCcw size={12} /> Start Over
              </button>
            </>
          )}
        </div>

        {/* Right: Controls panel */}
        <div style={{
          flex: '1 1 50%', display: 'flex', flexDirection: 'column',
          gap: '12px', minWidth: 0, minHeight: 0, overflowY: 'auto',
          paddingRight: '4px',
        }}>
          {/* Error banner */}
          {store.error && (
            <div style={{
              padding: '12px 16px', borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '13px', color: '#fca5a5',
            }}>
              <AlertCircle size={16} />
              {store.error}
            </div>
          )}

          {/* Grade card */}
          {store.currentAnalysis && (
            <GradeCard analysis={store.currentAnalysis} />
          )}

          {/* Model picker + prompt editor + action bar */}
          {store.currentAnalysis && store.currentAnalysis.verdict !== 'LOCK_IT_IN' && (
            <>
              <ModelPicker
                models={store.models}
                selectedModelId={store.selectedModelId}
                recommendation={store.currentAnalysis.recommendation}
                onSelect={store.selectModel}
              />

              <PromptEditor
                prompt={store.expertPrompt}
                loading={store.promptLoading}
                onGenerate={store.generateExpertPrompt}
                onChange={store.setPrompt}
                disabled={!store.selectedModelId}
                modelName={selectedModel?.name}
              />

              <ActionBar
                strategy={store.strategy}
                onStrategyChange={store.setStrategy}
                onGenerate={store.generate}
                onExecuteStep={store.executeStep}
                onUpscale={store.upscale}
                appState={store.appState}
                canGenerate={canGenerate}
                canUpscale={canUpscale}
                hasActiveModel={hasActiveModel}
                selectedModelId={store.selectedModelId}
                expertPrompt={store.expertPrompt}
              />
            </>
          )}

          {/* Lock It In state */}
          {store.currentAnalysis?.verdict === 'LOCK_IT_IN' && (
            <div style={{
              padding: '20px', borderRadius: '12px', textAlign: 'center',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎬</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#10b981' }}>Production Ready</div>
              <div style={{ fontSize: '13px', color: '#a1a1aa', marginTop: '4px' }}>
                This image is approved. You can still upscale with Topaz for maximum resolution.
              </div>
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button
                  onClick={store.upscale}
                  disabled={store.appState !== 'idle'}
                  style={{
                    padding: '10px 20px', borderRadius: '8px', border: 'none',
                    backgroundColor: '#10b981', color: 'white',
                    fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Topaz Upscale
                </button>
                <button
                  onClick={store.reset}
                  style={{
                    padding: '10px 20px', borderRadius: '8px',
                    border: '1px solid #27272a', backgroundColor: 'transparent',
                    color: '#a1a1aa', fontSize: '13px', cursor: 'pointer',
                  }}
                >
                  New Image
                </button>
              </div>
            </div>
          )}

          {/* Empty state instructions */}
          {!store.currentImageUrl && store.appState === 'idle' && (
            <div style={{
              padding: '24px', borderRadius: '12px',
              backgroundColor: 'rgba(24, 24, 27, 0.5)',
              border: '1px solid #27272a',
            }}>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#e4e4e7', marginBottom: '12px' }}>
                How it works
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { num: '1', text: 'Import an image or describe a shot to generate one' },
                  { num: '2', text: 'AI audits it for style match and realism' },
                  { num: '3', text: 'CD recommends improvements — you pick the model' },
                  { num: '4', text: 'Specialist writes an expert prompt, you approve and execute' },
                  { num: '5', text: 'Iterate until you\'re happy — you\'re in control' },
                ].map(step => (
                  <div key={step.num} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                      backgroundColor: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6',
                      fontSize: '12px', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{step.num}</div>
                    <span style={{ fontSize: '13px', color: '#a1a1aa', lineHeight: 1.5 }}>{step.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
