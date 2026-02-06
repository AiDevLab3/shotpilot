import React, { useState } from 'react';
import { checkShotQuality } from '../services/api';
import { Wand2, Loader2 } from 'lucide-react';

interface QualityResult {
    score: number;
    tier: string;
    missing_fields?: string[];
    [key: string]: any;
}

interface GeneratePromptButtonProps {
    shotId: number;
    onQualityCheck: (result: QualityResult) => void;
}

export const GeneratePromptButton: React.FC<GeneratePromptButtonProps> = ({ shotId, onQualityCheck }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hover, setHover] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await checkShotQuality(shotId);
            onQualityCheck(result);
        } catch (err: any) {
            setError(err.message || 'Quality check failed');
        } finally {
            setLoading(false);
        }
    };

    const baseStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        width: '100%',
        padding: '8px 12px',
        borderRadius: '6px',
        border: 'none',
        fontSize: '13px',
        fontWeight: 600,
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: loading ? '#4b5563' : hover ? '#7c3aed' : '#8b5cf6',
        color: 'white',
        opacity: loading ? 0.8 : 1,
    };

    return (
        <div style={{ marginTop: '12px' }}>
            <button
                style={baseStyle}
                onClick={handleClick}
                disabled={loading}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                {loading ? (
                    <><Loader2 size={14} className="spin" /> Checking Quality...</>
                ) : (
                    <><Wand2 size={14} /> Generate Prompt</>
                )}
            </button>
            {error && (
                <div style={{
                    marginTop: '6px',
                    fontSize: '11px',
                    color: '#ef4444',
                    textAlign: 'center',
                }}>
                    {error}
                </div>
            )}
        </div>
    );
};
