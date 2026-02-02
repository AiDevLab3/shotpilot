import React from 'react';
import { useStore } from '../../store';
import { Lock, Image as ImageIcon, AlertCircle } from 'lucide-react';

export const ShotboardGrid: React.FC = () => {
    const shots = useStore((state) => Object.values(state.shots));
    const scenes = useStore((state) => state.scenes);

    // Simple sort by shot number
    const sortedShots = [...shots].sort((a, b) => a.shotNumber.localeCompare(b.shotNumber));

    return (
        <div className="flex flex-col h-full">
            <div className="panel-header glass-panel border-b-0">
                <span>Shotboard</span>
                <span className="ml-auto text-xs opacity-50">{sortedShots.length} Shots</span>
            </div>

            <div className="flex-1 scroll-y p-4">
                <table className="w-full border-collapse text-left text-sm">
                    <thead>
                        <tr className="border-b border-[var(--color-border)] text-[var(--color-text-secondary)]">
                            <th className="p-3 font-medium">Shot #</th>
                            <th className="p-3 font-medium w-32">Thumbnail</th>
                            <th className="p-3 font-medium">Intent / Description</th>
                            <th className="p-3 font-medium">Status</th>
                            <th className="p-3 font-medium text-center">Locks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedShots.map(shot => (
                            <ShotRow key={shot.id} shot={shot} />
                        ))}
                        {sortedShots.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-gray-500">
                                    No shots yet. Add one to begin.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ShotRow: React.FC<{ shot: any }> = ({ shot }) => {
    const isSelected = useStore(state => state.ui.selectedShotId === shot.id);
    const setSelection = useStore(state => state.setUiSelection);

    return (
        <tr
            onClick={() => setSelection(shot.id, null)}
            className={`border-b border-[var(--color-border)] transition-colors cursor-pointer ${isSelected ? 'bg-white/10' : 'hover:bg-white/5'}`}
        >
            <td className="p-3 font-mono text-[var(--color-accent)]">{shot.shotNumber}</td>
            <td className="p-3">
                <div className="w-24 h-14 bg-black/40 rounded border border-[var(--color-border)] flex items-center justify-center text-gray-600">
                    <ImageIcon size={16} />
                </div>
            </td>
            <td className="p-3">
                <div className="font-medium text-[var(--color-text-primary)]">
                    {shot.composition.framing || "Untitled Shot"}
                </div>
                <div className="text-xs text-[var(--color-text-muted)] truncate max-w-md">
                    {shot.cameraRig.lens}, {shot.cameraRig.aperture}
                </div>
            </td>
            <td className="p-3">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Draft
                </span>
            </td>
            <td className="p-3 text-center">
                <div className="flex justify-center gap-1 opacity-50">
                    {shot.locks.compositionLocked && <Lock size={12} />}
                    {/* more lock icons */}
                </div>
            </td>
        </tr>
    );
};
