import React from 'react';
import { useStore } from '../../store';
import { Film, User, Sun, Sliders, ChevronRight } from 'lucide-react';
import { FrameVariantsPanel } from './FrameVariantsPanel';

export const Inspector: React.FC = () => {
    const selectedShotId = useStore(state => state.ui.selectedShotId);
    const shot = useStore(state => selectedShotId ? state.shots[selectedShotId] : null);

    if (!shot) {
        return (
            <div className="p-8 text-center text-[var(--color-text-muted)] flex flex-col items-center justify-center h-full">
                <Film size={48} className="mb-4 opacity-20" />
                <p>Select a shot to view details</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[var(--color-bg-panel)]">
            <div className="panel-header glass-panel border-b border-[var(--color-border)]">
                Inspector
            </div>

            <div className="flex-1 scroll-y flex flex-col gap-6 p-4">
                {/* Shot Header */}
                <div className="flex items-start gap-3">
                    <div className="w-16 h-12 bg-black/40 rounded border border-[var(--color-border)] flex items-center justify-center text-xs opacity-50">
                        THUMB
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Shot {shot.shotNumber}</h2>
                        <div className="text-sm text-[var(--color-accent)]">{shot.shotType.replace('_', ' ')}</div>
                    </div>
                </div>

                {/* Section: Camera & Composition */}
                <InspectorSection title="Camera" icon={<Sliders size={16} />}>
                    <Field label="Lens" value={shot.cameraRig.lens} />
                    <Field label="Aperture" value={shot.cameraRig.aperture} />
                    <Field label="Focus" value={shot.cameraRig.focusBehavior} />
                    <Field label="Movement" value={shot.cameraMovement} />
                </InspectorSection>

                {/* Section: Lighting (Scene Level or Shot Override) */}
                <InspectorSection title="Lighting" icon={<Sun size={16} />}>
                    <p className="text-sm text-[var(--color-text-muted)] italic">
                        Inherits from Scene {shot.sceneId ? "(Scene Lock)" : "(None)"}
                    </p>
                </InspectorSection>

                {/* Section: Frame Variants */}
                <div className="mt-4 border-t border-[var(--color-border)] pt-4">
                    <FrameVariantsPanel shotId={shot.id} />
                </div>
            </div>
        </div>
    );
};

const InspectorSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
            {icon}
            {title}
        </div>
        <div className="grid grid-cols-1 gap-2 pl-6">
            {children}
        </div>
    </div>
);

const Field: React.FC<{ label: string; value: string | undefined }> = ({ label, value }) => (
    <div className="flex justify-between items-center text-sm py-1 border-b border-[var(--color-border)]/50 last:border-0 border-dashed">
        <span className="text-[var(--color-text-muted)]">{label}</span>
        <span className="text-[var(--color-text-primary)]">{value || '-'}</span>
    </div>
);
