import React from 'react';
import { useStore } from '../../store';


export const ShotboardGrid: React.FC = () => {
    const shotsDict = useStore((state) => state.shots);
    const shots = Object.values(shotsDict);
    const frames = useStore((state) => state.frames);
    const selectedShotId = useStore((state) => state.ui.selectedShotId);
    const setUiSelection = useStore((state) => state.setUiSelection);

    // Sort shots by scene/number (simple sort for now)
    const sortedShots = [...shots].sort((a, b) => a.shotNumber.localeCompare(b.shotNumber));

    // Auto-select first shot if none selected
    React.useEffect(() => {
        if (!selectedShotId && sortedShots.length > 0) {
            setUiSelection(sortedShots[0].id);
        }
    }, [selectedShotId, sortedShots, setUiSelection]);

    const handleShotClick = (shotId: string) => {
        setUiSelection(shotId);
    };

    return (
        <div className="sp-flex-1 sp-panel-dark sp-p-4 sp-overflow-hidden" style={{ overflowY: 'auto', height: '100%' }}>
            <h2 className="sp-text-xs sp-font-bold sp-uppercase sp-tracking-widest sp-text-muted" style={{ marginBottom: '1rem' }}>Shot List ({sortedShots.length})</h2>

            <div className="sp-shot-grid">
                {sortedShots.map((shot) => {
                    const heroFrame = shot.heroFrameId ? frames[shot.heroFrameId] : null;
                    const isSelected = selectedShotId === shot.id;

                    return (
                        <div
                            key={shot.id}
                            onClick={() => handleShotClick(shot.id)}
                            className={`shot-card ${isSelected ? 'selected' : ''}`}
                            style={{ padding: 0, overflow: 'hidden', borderWidth: 2 }}
                        >
                            <div className="sp-aspect-video">
                                {heroFrame ? (
                                    <img
                                        src={heroFrame.asset.url}
                                        alt={`Shot ${shot.shotNumber}`}
                                        className="sp-cover"
                                    />
                                ) : (
                                    <div className="sp-flex" style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#374151' }}>
                                        <span className="sp-text-xs">No Frame</span>
                                    </div>
                                )}

                                <div className="sp-overlay-gradient">
                                    <div className="sp-flex" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span className="sp-card-title">{shot.shotNumber}</span>
                                        <span className="sp-text-xs" style={{ color: '#d1d5db', backgroundColor: 'rgba(31, 41, 55, 0.8)', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', textTransform: 'capitalize' }}>
                                            {shot.shotType.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="sp-text-xs sp-text-muted" style={{ marginTop: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {shot.cameraMovement.replace('_', ' ')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {sortedShots.length === 0 && (
                <div className="sp-flex sp-flex-col" style={{ alignItems: 'center', justifyContent: 'center', height: '16rem', color: '#6b7280' }}>
                    <p>No shots in this project yet.</p>
                </div>
            )}
        </div>
    );
};
