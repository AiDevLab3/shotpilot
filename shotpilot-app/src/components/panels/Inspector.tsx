import React from 'react';
import { useStore } from '../../store';

export const Inspector: React.FC = () => {
    const selectedShotId = useStore((state) => state.ui.selectedShotId);
    const shots = useStore((state) => state.shots);
    const scenes = useStore((state) => state.scenes);

    const shot = selectedShotId ? shots[selectedShotId] : null;
    const scene = shot ? scenes[shot.sceneId] : null;

    if (!shot) {
        return (
            <div className="p-6 text-gray-500 text-center text-sm">
                Select a shot to view details.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-white">Shot {shot.shotNumber}</h2>
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">
                        v{shot.version}
                    </span>
                </div>
                {scene && (
                    <div className="text-sm text-gray-400 truncate">
                        <span className="text-gray-500">Scene {scene.sceneNumber}:</span> {scene.name}
                    </div>
                )}
            </div>

            {/* Camera Rig Section */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Camera Rig</h3>
                <div className="grid grid-cols-2 gap-3 bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Lens</div>
                        <div className="text-sm text-gray-200">{shot.cameraRig.lens}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Aperture</div>
                        <div className="text-sm text-gray-200">{shot.cameraRig.aperture}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Height</div>
                        <div className="text-sm text-gray-200 capitalize">{shot.cameraRig.cameraHeight}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Focus</div>
                        <div className="text-sm text-gray-200">{shot.cameraRig.focusBehavior}</div>
                    </div>
                </div>
            </div>

            {/* Composition Section */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Composition</h3>
                <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800 space-y-3">
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Shot Type</div>
                        <div className="text-sm text-gray-200 capitalize">{shot.shotType.replace('_', ' ')}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Movement</div>
                        <div className="text-sm text-gray-200 capitalize">{shot.cameraMovement.replace('_', ' ')}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Blocking</div>
                        <div className="text-sm text-gray-200">{shot.composition.blocking}</div>
                    </div>
                </div>
            </div>

            {/* Locks Section */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Continuity Locks</h3>
                <div className="flex flex-wrap gap-2">
                    {Object.entries(shot.locks).map(([key, isLocked]) => (
                        <div
                            key={key}
                            className={`px-2 py-1 rounded text-xs border ${isLocked
                                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                                    : 'bg-gray-800 border-gray-700 text-gray-500'
                                }`}
                        >
                            {key.replace('Locked', '')}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
