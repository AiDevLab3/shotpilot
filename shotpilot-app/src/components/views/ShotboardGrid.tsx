import React from 'react';
import { useStore } from '../../store';
import { Shot } from '../../types/schema';

export const ShotboardGrid: React.FC = () => {
    const shots = useStore((state) => Object.values(state.shots));
    const frames = useStore((state) => state.frames);
    const selectedShotId = useStore((state) => state.ui.selectedShotId);
    const setUiSelection = useStore((state) => state.setUiSelection);

    // Sort shots by scene/number (simple sort for now)
    const sortedShots = [...shots].sort((a, b) => a.shotNumber.localeCompare(b.shotNumber));

    const handleShotClick = (shotId: string) => {
        setUiSelection(shotId);
    };

    return (
        <div className="flex-1 bg-gray-950 p-6 overflow-y-auto h-full">
            <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">Shot List ({sortedShots.length})</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {sortedShots.map((shot) => {
                    const heroFrame = shot.heroFrameId ? frames[shot.heroFrameId] : null;
                    const isSelected = selectedShotId === shot.id;

                    return (
                        <div
                            key={shot.id}
                            onClick={() => handleShotClick(shot.id)}
                            className={`
                                relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all
                                ${isSelected
                                    ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-[1.02] z-10'
                                    : 'border-gray-800 hover:border-gray-600 hover:shadow-lg'
                                }
                            `}
                        >
                            <div className="aspect-video bg-gray-900 w-full relative">
                                {heroFrame ? (
                                    <img
                                        src={heroFrame.asset.url}
                                        alt={`Shot ${shot.shotNumber}`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-700">
                                        <span className="text-xs">No Frame</span>
                                    </div>
                                )}

                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-white font-bold text-lg">{shot.shotNumber}</span>
                                        <span className="text-xs text-gray-300 bg-gray-800/80 px-1.5 py-0.5 rounded capitalize">
                                            {shot.shotType.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1 truncate">
                                        {shot.cameraMovement.replace('_', ' ')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {sortedShots.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <p>No shots in this project yet.</p>
                </div>
            )}
        </div>
    );
};
