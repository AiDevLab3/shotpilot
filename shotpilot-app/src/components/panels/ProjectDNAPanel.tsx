import React from 'react';
import { useStore } from '../../store';
import { Settings, Droplet, Camera, Zap } from 'lucide-react';

export const ProjectDNAPanel: React.FC = () => {
    // Assuming single project for MVP, get the first one
    const project = useStore(state => Object.values(state.projects)[0]);

    if (!project) {
        return <div className="p-8 text-center text-[var(--color-text-muted)]">No Project Found.</div>;
    }

    return (
        <div className="flex flex-col h-full bg-[var(--color-bg-app)]">
            <div className="panel-header glass-panel">
                <span>Project DNA: {project.name}</span>
                <span className="ml-auto text-xs px-2 py-1 bg-white/10 rounded">{project.version}</span>
            </div>

            <div className="p-8 max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Visual Identity */}
                <Section title="Visual Identity" icon={<Droplet />}>
                    <div className="bg-[var(--color-bg-card)] p-4 rounded-lg border border-[var(--color-border)]">
                        <div className="text-xl font-bold text-[var(--color-accent)] mb-2">{project.lookName}</div>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-4">{project.lightingPhilosophy}</p>

                        <div className="grid grid-cols-3 gap-2 text-xs">
                            <Tag label="Temp" value={project.colorPalette.temperature} />
                            <Tag label="Sat" value={project.colorPalette.saturation} />
                            <Tag label="Contrast" value={project.contrastStyle} />
                        </div>
                    </div>
                </Section>

                {/* Camera Language */}
                <Section title="Camera Language" icon={<Camera />}>
                    <div className="bg-[var(--color-bg-card)] p-4 rounded-lg border border-[var(--color-border)] flex flex-col gap-3">
                        <Field label="Movement" value={project.cameraLanguage.movement} />
                        <Field label="Lens Range" value={project.cameraLanguage.lensRange} />
                        <Field label="Grain" value={project.textureRules.grainLevel} />
                    </div>
                </Section>

                {/* Realism Settings */}
                <Section title="Realism Engine" icon={<Zap />}>
                    <div className="bg-[var(--color-bg-card)] p-4 rounded-lg border border-[var(--color-border)]">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Pack Version</span>
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                                {project.realismPackVersion}
                            </span>
                        </div>
                        <div className="text-xs text-[var(--color-text-muted)]">
                            Forbidden Drift: {project.forbiddenDrift.join(", ")}
                        </div>
                    </div>
                </Section>

                {/* Canon Anchors */}
                <Section title="Canon Anchors" icon={<Settings />}>
                    <div className="grid grid-cols-3 gap-4">
                        <AnchorSlot label="Style" id={project.canonStyleFrameId} />
                        <AnchorSlot label="Character" id={project.canonCharacterFrameId} />
                        <AnchorSlot label="Lighting" id={project.canonLightingFrameId} />
                    </div>
                </Section>
            </div>
        </div>
    );
};

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="flex flex-col gap-3">
        <h3 className="flex items-center gap-2 text-lg font-medium text-[var(--color-text-primary)]">
            {React.cloneElement(icon as React.ReactElement, { size: 20, className: "text-[var(--color-accent)]" })}
            {title}
        </h3>
        {children}
    </div>
);

const Tag: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex flex-col bg-black/20 p-2 rounded text-center">
        <span className="text-[10px] uppercase text-[var(--color-text-muted)]">{label}</span>
        <span className="font-medium capitalize">{value}</span>
    </div>
);

const Field: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex justify-between text-sm">
        <span className="text-[var(--color-text-secondary)]">{label}</span>
        <span className="text-[var(--color-text-primary)] font-medium capitalize">{value}</span>
    </div>
);

const AnchorSlot: React.FC<{ label: string; id: string | null }> = ({ label, id }) => (
    <div className="aspect-[2/3] bg-black/40 rounded border border-[var(--color-border)] border-dashed flex flex-col items-center justify-center gap-2 hover:bg-white/5 cursor-pointer transition-colors">
        {id ? (
            <div className="w-full h-full bg-cover bg-center rounded-sm" style={{ backgroundImage: `url(...)` }} />
        ) : (
            <>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[var(--color-text-muted)]">+</div>
                <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
            </>
        )}
    </div>
);
