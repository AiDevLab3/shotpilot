import React, { useEffect, useState } from 'react';
import { getUserCredits } from '../services/api';

export const CreditBadge: React.FC = () => {
    const [credits, setCredits] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    const loadCredits = async () => {
        try {
            const data = await getUserCredits();
            setCredits(data.credits ?? data.balance ?? 0);
        } catch {
            setCredits(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCredits();

        const handleCreditUpdate = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (typeof detail?.credits === 'number') {
                setCredits(detail.credits);
            } else {
                loadCredits();
            }
        };

        window.addEventListener('creditUpdate', handleCreditUpdate);
        return () => window.removeEventListener('creditUpdate', handleCreditUpdate);
    }, []);

    if (loading) return null;
    if (credits === null) return null;

    const color = credits > 50 ? '#10b981' : credits >= 10 ? '#fbbf24' : '#ef4444';

    const styles = {
        badge: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '9999px',
            border: `1px solid ${color}33`,
            backgroundColor: `${color}15`,
            fontSize: '13px',
            fontWeight: 600 as const,
            color,
            whiteSpace: 'nowrap' as const,
        },
        dot: {
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: color,
        },
    };

    return (
        <div style={styles.badge}>
            <span style={styles.dot} />
            {credits} Credit{credits !== 1 ? 's' : ''}
        </div>
    );
};
