import React from 'react';
import { useStore } from '../../store';
import { ChevronLeft, ChevronRight, Play, Maximize2 } from 'lucide-react'; // Kept for reference but unused in current text-based UI implementation

export const SceneCanvas: React.FC = () => {
    const selectedShotId = useStore((state) => state.ui.selectedShotId);
    const setUiSelection = useStore((state) => state.setUiSelection);
    const shots = useStore((state) => state.shots);
    const frames = useStore((state) => state.frames);

    // Derived State
    const allShots = React.useMemo(() => {
        return Object.values(shots).sort((a, b) => a.shotNumber.localeCompare(b.shotNumber));
    }, [shots]);

    const currentIndex = allShots.findIndex(s => s.id === selectedShotId);
    const currentShot = allShots[currentIndex];
    const heroFrame = currentShot?.heroFrameId ? frames[currentShot.heroFrameId] : null;

    // Navigation Handlers
    const handlePrev = () => {
        if (currentIndex > 0) {
            setUiSelection(allShots[currentIndex - 1].id);
        }
    };

    const handleNext = () => {
        if (currentIndex < allShots.length - 1) {
            setUiSelection(allShots[currentIndex + 1].id);
        }
    };

    if (!currentShot) {
        return (
            <div className="sp-h-full sp-flex sp-items-center sp-justify-center sp-bg-panel-black sp-text-muted">
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.2 }}>🎬</div>
                    <p>Select a shot to preview</p>
                </div>
            </div>
        );
    }

    return (
        <div className="sp-h-full sp-flex sp-flex-col sp-bg-panel-black sp-relative">
            {/* Main Viewport */}
            <div className="sp-flex-1 sp-relative sp-flex sp-items-center sp-justify-center sp-overflow-hidden">
                {heroFrame?.asset?.url ? (
                    <img
                        src={heroFrame.asset.url}
                        alt={`Shot ${currentShot.shotNumber}`}
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                        }}
                    />
                ) : (
                    <div className="sp-flex sp-flex-col sp-items-center sp-text-muted">
                        <span style={{ fontSize: '2rem', opacity: 0.5 }}>📷</span>
                        <span className="sp-text-xs sp-mt-2">No Frame Generated</span>
                    </div>
                )}

                {/* Overlays */}
                <div className="sp-absolute sp-inset-0 sp-pointer-events-none">
                    {/* Top Left: Shot Info */}
                    <div className="sp-absolute sp-top-4 sp-left-4 sp-z-10">
                        <div className="sp-badge sp-bg-black/50 sp-backdrop-blur sp-border-white/10 sp-text-white sp-font-bold sp-px-3 sp-py-1">
                            SHOT {currentShot.shotNumber}
                        </div>
                    </div>

                    {/* Bottom Left: Metadata */}
                    <div className="sp-absolute sp-bottom-16 sp-left-4 sp-z-10 sp-bg-black/80 sp-backdrop-blur sp-rounded p-3 sp-border sp-border-white/10 sp-max-w-xs">
                        <div className="sp-text-xs sp-text-muted sp-uppercase sp-mb-1">Camera</div>
                        <div className="sp-text-sm sp-text-white sp-capitalize">{currentShot.shotType.replace('_', ' ')}</div>
                        <div className="sp-text-sm sp-text-gray-400 capitalize">{currentShot.cameraMovement.replace('_', ' ')}</div>
                    </div>
                </div>
            </div>

            {/* Playback Controls Bar */}
            <div className="sp-h-14 sp-border-t sp-border-white/10 sp-bg-gray-900 sp-flex sp-items-center sp-justify-between sp-px-4">
                <div className="sp-flex sp-items-center sp-gap-4">
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex <= 0}
                        className="sp-p-2 sp-rounded hover:sp-bg-white/10 disabled:sp-opacity-30 disabled:sp-cursor-not-allowed sp-text-white"
                        title="Previous Shot"
                    >
                        ◀
                    </button>

                    <div className="sp-text-xs sp-text-muted sp-font-mono">
                        {currentIndex + 1} / {allShots.length}
                    </div>

                    <button
                        onClick={handleNext}
                        disabled={currentIndex >= allShots.length - 1}
                        className="sp-p-2 sp-rounded hover:sp-bg-white/10 disabled:sp-opacity-30 disabled:sp-cursor-not-allowed sp-text-white"
                        title="Next Shot"
                    >
                        ▶
                    </button>
                </div>

                <div className="sp-flex sp-items-center sp-gap-2">
                    <span className="sp-text-xs sp-text-muted">
                        V{currentShot.version}
                    </span>
                    {/* Future: Fullscreen button */}
                </div>
            </div>
        </div>
    );
};
