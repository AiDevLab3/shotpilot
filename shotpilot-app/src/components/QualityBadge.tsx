import React from 'react';

interface QualityBadgeProps {
    tier: string;
    score?: number;
    onClick?: () => void;
}

export const QualityBadge: React.FC<QualityBadgeProps> = ({ tier, score, onClick }) => {
    const isProduction = tier === 'production';
    const color = isProduction ? '#10b981' : '#fbbf24';
    const label = isProduction ? 'Production' : 'Draft';

    return (
        <span
            onClick={onClick}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 600,
                color,
                backgroundColor: `${color}18`,
                border: `1px solid ${color}30`,
                whiteSpace: 'nowrap',
                cursor: onClick ? 'pointer' : 'default',
            }}
            title={onClick ? 'Click to discuss quality with AI' : undefined}
        >
            <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: color,
            }} />
            {label}{score != null ? ` (${Math.round(score)}%)` : ''}
        </span>
    );
};
