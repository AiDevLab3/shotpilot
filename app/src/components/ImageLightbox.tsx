import React, { useEffect, useCallback } from 'react';

interface ImageLightboxProps {
    src: string;
    alt?: string;
    onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ src, alt = 'Full size image', onClose }) => {
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 10000,
                backgroundColor: 'rgba(0,0,0,0.9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'zoom-out',
            }}
        >
            <img
                src={src}
                alt={alt}
                style={{
                    maxWidth: '92vw', maxHeight: '92vh',
                    objectFit: 'contain',
                    borderRadius: '4px',
                    boxShadow: '0 0 40px rgba(0,0,0,0.5)',
                }}
            />
        </div>
    );
};
