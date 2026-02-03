import React from 'react';
import { useStore } from '../../store';

export const FrameVariantsPanel: React.FC = () => {
    const selectedShotId = useStore((state) => state.ui.selectedShotId);
    const frames = useStore((state) => state.frames);
    const selectedFrameId = useStore((state) => state.ui.selectedFrameId);
    const setUiSelection = useStore((state) => state.setUiSelection);

    // Get frames for selected shot
    const shotFrames = selectedShotId
        ? Object.values(frames).filter(f => f.shotId === selectedShotId)
        : [];

    if (!selectedShotId) return null;

    return (
        <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Frame Variants</h3>
                <span className="text-xs text-gray-500">{shotFrames.length} variants</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {shotFrames.map(frame => (
                    <div
                        key={frame.id}
                        className={`
                            relative group cursor-pointer rounded overflow-hidden border-2 transition-all
                            ${selectedFrameId === frame.id || (!selectedFrameId && frame.id === useStore.getState().shots[selectedShotId].heroFrameId)
                                ? 'border-purple-500 ring-1 ring-purple-500/50'
                                : 'border-gray-800 hover:border-gray-600'
                            }
                        `}
                        onClick={() => setUiSelection(selectedShotId, frame.id)}
                    >
                        <div className="aspect-video bg-gray-900 w-full relative">
                            <img
                                src={frame.asset.url}
                                alt={`Frame ${frame.frameNumber}`}
                                className="w-full h-full object-cover"
                            />
                            {/* Score Overlay */}
                            <div className="absolute top-1 right-1 bg-black/70 backdrop-blur rounded px-1.5 py-0.5 text-xs font-bold text-white">
                                {frame.qualityScores.overallScore}
                            </div>
                        </div>
                        <div className="p-2 bg-gray-800/50">
                            <div className="text-[10px] text-gray-400 truncate">
                                {frame.model}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full mt-4 py-2 border border-dashed border-gray-700 rounded text-gray-500 hover:text-white hover:border-gray-500 hover:bg-gray-800/50 text-xs transition-colors">
                + Generate Variant
            </button>
        </div>
    );
};
