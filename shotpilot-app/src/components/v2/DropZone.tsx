import React, { useCallback, useRef, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface DropZoneProps {
  onFile: (file: File, shotContext?: string, sourceModel?: string, sourcePrompt?: string) => void;
  disabled?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFile, disabled }) => {
  const [dragging, setDragging] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [shotContext, setShotContext] = useState('');
  const [sourceModel, setSourceModel] = useState('');
  const [sourcePrompt, setSourcePrompt] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) onFile(file, shotContext, sourceModel, sourcePrompt);
  }, [onFile, disabled, shotContext, sourceModel, sourcePrompt]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    if (disabled) return;
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) onFile(file, shotContext, sourceModel, sourcePrompt);
        return;
      }
    }
  }, [onFile, disabled, shotContext, sourceModel, sourcePrompt]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onPaste={handlePaste}
        onClick={() => !disabled && inputRef.current?.click()}
        tabIndex={0}
        style={{
          border: `2px dashed ${dragging ? '#8b5cf6' : '#3f3f46'}`,
          borderRadius: '16px',
          padding: '48px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          backgroundColor: dragging ? 'rgba(139, 92, 246, 0.08)' : 'rgba(24, 24, 27, 0.5)',
          transition: 'all 0.2s ease',
          opacity: disabled ? 0.5 : 1,
          minHeight: '240px',
        }}
      >
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          backgroundColor: 'rgba(139, 92, 246, 0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {dragging ? <ImageIcon size={28} color="#8b5cf6" /> : <Upload size={28} color="#8b5cf6" />}
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#e4e4e7' }}>
            {dragging ? 'Drop your image here' : 'Drop, paste, or click to upload'}
          </div>
          <div style={{ fontSize: '13px', color: '#71717a', marginTop: '4px' }}>
            JPG, PNG, WebP — any resolution
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file, shotContext, sourceModel, sourcePrompt);
            e.target.value = '';
          }}
        />
      </div>

      {/* Optional metadata */}
      <div style={{
        border: '1px solid #27272a',
        borderRadius: '8px',
        backgroundColor: 'rgba(24, 24, 27, 0.5)',
      }}>
        <button
          onClick={() => setShowMetadata(!showMetadata)}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: 'none',
            backgroundColor: 'transparent',
            color: '#a1a1aa',
            fontSize: '13px',
            textAlign: 'left',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>Add metadata (optional)</span>
          <span style={{ transform: showMetadata ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            ▼
          </span>
        </button>
        
        {showMetadata && (
          <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#71717a', marginBottom: '4px', display: 'block' }}>
                Shot Context
              </label>
              <input
                type="text"
                value={shotContext}
                onChange={(e) => setShotContext(e.target.value)}
                placeholder="e.g., Hero establishing shot for sci-fi thriller"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #27272a',
                  borderRadius: '6px',
                  backgroundColor: '#0a0a0a',
                  color: '#e4e4e7',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>
            
            <div>
              <label style={{ fontSize: '12px', color: '#71717a', marginBottom: '4px', display: 'block' }}>
                Source Model
              </label>
              <input
                type="text"
                value={sourceModel}
                onChange={(e) => setSourceModel(e.target.value)}
                placeholder="e.g., Midjourney, DALL-E 3, Flux"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #27272a',
                  borderRadius: '6px',
                  backgroundColor: '#0a0a0a',
                  color: '#e4e4e7',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>
            
            <div>
              <label style={{ fontSize: '12px', color: '#71717a', marginBottom: '4px', display: 'block' }}>
                Source Prompt
              </label>
              <textarea
                value={sourcePrompt}
                onChange={(e) => setSourcePrompt(e.target.value)}
                placeholder="The original prompt used to generate this image..."
                style={{
                  width: '100%',
                  height: '60px',
                  padding: '8px 12px',
                  border: '1px solid #27272a',
                  borderRadius: '6px',
                  backgroundColor: '#0a0a0a',
                  color: '#e4e4e7',
                  fontSize: '13px',
                  resize: 'vertical',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
