import React, { useCallback, useRef, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface DropZoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFile, disabled }) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) onFile(file);
  }, [onFile, disabled]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    if (disabled) return;
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) onFile(file);
        return;
      }
    }
  }, [onFile, disabled]);

  return (
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
          if (file) onFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
};
