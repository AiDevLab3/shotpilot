import React from 'react';
import { Wand2, Loader2, Copy, Check } from 'lucide-react';

interface PromptEditorProps {
  prompt: string;
  loading: boolean;
  onGenerate: () => void;
  onChange: (prompt: string) => void;
  disabled?: boolean;
  modelName?: string;
}

export const PromptEditor: React.FC<PromptEditorProps> = ({
  prompt, loading, onGenerate, onChange, disabled, modelName,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      borderRadius: '12px', border: '1px solid #27272a',
      backgroundColor: 'rgba(24, 24, 27, 0.8)', overflow: 'hidden',
    }}>
      {/* Header with generate button */}
      <div style={{
        padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px',
        borderBottom: '1px solid #27272a',
      }}>
        <Wand2 size={14} color="#8b5cf6" />
        <span style={{ fontSize: '13px', color: '#a1a1aa', flex: 1 }}>
          Expert Prompt {modelName && <span style={{ color: '#71717a' }}>for {modelName}</span>}
        </span>
        {prompt && (
          <button
            onClick={handleCopy}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: copied ? '#10b981' : '#71717a', padding: '4px',
              display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px',
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
        <button
          onClick={onGenerate}
          disabled={disabled || loading}
          style={{
            padding: '6px 14px', borderRadius: '6px', border: 'none',
            backgroundColor: loading || disabled ? '#27272a' : '#8b5cf6',
            color: loading || disabled ? '#71717a' : 'white',
            fontSize: '12px', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
          {loading ? 'Generating...' : prompt ? 'Regenerate' : 'Generate Prompt'}
        </button>
      </div>

      {/* Textarea */}
      <textarea
        value={prompt}
        onChange={(e) => onChange(e.target.value)}
        placeholder={loading ? 'Generating expert prompt...' : 'Click "Generate Prompt" to get a model-specific prompt, or write your own...'}
        style={{
          width: '100%', minHeight: '120px', padding: '12px 16px',
          backgroundColor: 'transparent', color: '#d4d4d8',
          border: 'none', outline: 'none', resize: 'vertical',
          fontFamily: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, monospace',
          fontSize: '13px', lineHeight: 1.6,
        }}
      />
    </div>
  );
};
