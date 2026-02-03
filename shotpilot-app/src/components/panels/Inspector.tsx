import React, { useMemo } from 'react';
import { useStore } from '../../store';
import { PromptCompiler } from '../../services/PromptCompiler';

export const Inspector: React.FC = () => {
    const selectedShotId = useStore((state) => state.ui.selectedShotId);
    const selectedFrameId = useStore((state) => state.ui.selectedFrameId);

    // Fetch full context for compilation
    const shots = useStore((state) => state.shots);
    const scenes = useStore((state) => state.scenes);
    const projects = useStore((state) => state.projects);
    const frames = useStore((state) => state.frames);
    const soulIds = useStore((state) => state.soulIds);
    const entityIds = useStore((state) => state.entityIds);

    const shot = selectedShotId ? shots[selectedShotId] : null;
    const scene = shot ? scenes[shot.sceneId] : null;
    const project = scene ? projects[scene.projectId] : null;

    // Determine the active frame for inspection (selected one or hero)
    const activeFrameId = selectedFrameId || shot?.heroFrameId;
    const frame = activeFrameId ? frames[activeFrameId] : null;

    const frameCount = shot ? Object.values(frames).filter(f => f.shotId === shot.id).length : 0;

    // Compile Prompt if we have context
    const compiledPrompt = useMemo(() => {
        if (!frame || !shot || !scene || !project) return null;
        return PromptCompiler.compile(frame, shot, scene, project, soulIds, entityIds);
    }, [frame, shot, scene, project, soulIds, entityIds]);

    if (!shot) {
        return (
            <div className="sp-p-6" style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--sp-text-muted)' }}>
                Select a shot to view details.
            </div>
        );
    }

    return (
        <div className="sp-flex sp-flex-col" style={{ gap: '1.5rem', padding: '1rem' }}>
            {/* Header */}
            <div>
                <div className="sp-flex" style={{ justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                    <h2 className="sp-text-xl sp-font-bold" style={{ color: '#fff' }}>Shot {shot.shotNumber}</h2>
                    <div className="sp-flex" style={{ gap: '0.5rem' }}>
                        <span className="sp-badge" style={{ color: '#a78bfa', backgroundColor: 'rgba(139, 92, 246, 0.1)', borderColor: 'rgba(139, 92, 246, 0.2)' }}>
                            {frameCount} Frames
                        </span>
                        <span className="sp-badge">
                            v{shot.version}
                        </span>
                    </div>
                </div>
                {scene && (
                    <div className="sp-text-sm sp-text-muted" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <span style={{ color: '#6b7280' }}>Scene {scene.sceneNumber}:</span> {scene.name}
                    </div>
                )}
            </div>

            {/* Prompt Inspector Section (New!) */}
            {compiledPrompt && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <h3 className="sp-text-xs sp-font-bold" style={{ color: 'var(--sp-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Processed Prompt
                    </h3>
                    <div style={{ backgroundColor: '#111827', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--sp-border)' }}>
                        {/* Nano Banana Pro Formatted View */}
                        <div className="sp-flex sp-flex-col" style={{ gap: '0.5rem', fontSize: '0.75rem', color: '#d1d5db', marginBottom: '1rem', fontFamily: 'monospace' }}>
                            <div>
                                <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>SUBJECT:</span> {compiledPrompt.intentBlock}
                            </div>
                            <div>
                                <span style={{ color: '#f472b6', fontWeight: 'bold' }}>STYLE:</span> {compiledPrompt.projectLookBlock}
                            </div>
                            <div>
                                <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>RULES:</span> {project?.realismPackVersion} (Active)
                            </div>
                        </div>

                        {/* Full Prompt Preview */}
                        <div className="sp-relative">
                            <label className="sp-text-xs sp-text-muted" style={{ display: 'block', marginBottom: '0.25rem' }}>Final Output Payload</label>
                            <textarea
                                readOnly
                                value={compiledPrompt.fullPrompt}
                                style={{
                                    width: '100%',
                                    height: '6rem',
                                    backgroundColor: '#000',
                                    border: '1px solid #374151',
                                    borderRadius: '0.25rem',
                                    padding: '0.5rem',
                                    fontSize: '0.75rem',
                                    fontFamily: 'monospace',
                                    color: '#9ca3af',
                                    resize: 'vertical'
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Audit Report Section (New!) */}
            {frame?.auditResult && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <h3 className="sp-text-xs sp-font-bold" style={{ color: 'var(--sp-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Audit Report
                    </h3>
                    <div style={{ backgroundColor: '#111827', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--sp-border)' }}>
                        {/* Tier Badge */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <span className="sp-text-xs sp-text-muted">Result Tier</span>
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                backgroundColor: frame.auditResult.tier === 'LOCK IT IN' ? 'rgba(34, 197, 94, 0.2)' :
                                    frame.auditResult.tier === 'REFINE' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                color: frame.auditResult.tier === 'LOCK IT IN' ? '#4ade80' :
                                    frame.auditResult.tier === 'REFINE' ? '#facc15' : '#f87171',
                                border: `1px solid ${frame.auditResult.tier === 'LOCK IT IN' ? 'rgba(34, 197, 94, 0.4)' :
                                    frame.auditResult.tier === 'REFINE' ? 'rgba(234, 179, 8, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
                            }}>
                                {frame.auditResult.tier}
                            </span>
                        </div>

                        {/* Quality Scores */}
                        <div className="sp-space-y-2" style={{ marginBottom: '1rem' }}>
                            {Object.entries(frame.qualityScores).map(([key, score]) => (
                                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                                    <div style={{ width: '40%', color: '#9ca3af', textTransform: 'capitalize' }}>
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </div>
                                    <div style={{ flex: 1, height: '0.25rem', backgroundColor: '#374151', borderRadius: '9999px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${score}%`,
                                            height: '100%',
                                            backgroundColor: score > 80 ? '#4ade80' : score > 50 ? '#facc15' : '#f87171'
                                        }} />
                                    </div>
                                    <div style={{ width: '2rem', textAlign: 'right', color: '#d1d5db' }}>{score}</div>
                                </div>
                            ))}
                        </div>

                        {/* Findings */}
                        {frame.auditResult.findings.length > 0 && (
                            <div>
                                <div className="sp-text-xs sp-text-muted" style={{ marginBottom: '0.5rem' }}>Automated Findings</div>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.75rem', color: '#d1d5db' }}>
                                    {frame.auditResult.findings.map((finding, i) => (
                                        <li key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                            <span style={{ color: '#6b7280' }}>•</span>
                                            {finding}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Camera Rig Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h3 className="sp-text-xs sp-font-bold" style={{ color: 'var(--sp-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Camera Rig</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', backgroundColor: 'rgba(17, 24, 39, 0.5)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--sp-border)' }}>
                    <div>
                        <div className="sp-text-xs sp-text-muted" style={{ marginBottom: '0.25rem' }}>Lens</div>
                        <div className="sp-text-sm" style={{ color: '#e5e7eb' }}>{shot.cameraRig.lens}</div>
                    </div>
                    <div>
                        <div className="sp-text-xs sp-text-muted" style={{ marginBottom: '0.25rem' }}>Aperture</div>
                        <div className="sp-text-sm" style={{ color: '#e5e7eb' }}>{shot.cameraRig.aperture}</div>
                    </div>
                    <div>
                        <div className="sp-text-xs sp-text-muted" style={{ marginBottom: '0.25rem' }}>Height</div>
                        <div className="sp-text-sm" style={{ color: '#e5e7eb', textTransform: 'capitalize' }}>{shot.cameraRig.cameraHeight}</div>
                    </div>
                    <div>
                        <div className="sp-text-xs sp-text-muted" style={{ marginBottom: '0.25rem' }}>Focus</div>
                        <div className="sp-text-sm" style={{ color: '#e5e7eb' }}>{shot.cameraRig.focusBehavior}</div>
                    </div>
                </div>
            </div>

            {/* Composition Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h3 className="sp-text-xs sp-font-bold" style={{ color: 'var(--sp-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Composition</h3>
                <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.5)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--sp-border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                        <div className="sp-text-xs sp-text-muted" style={{ marginBottom: '0.25rem' }}>Shot Type</div>
                        <div className="sp-text-sm" style={{ color: '#e5e7eb', textTransform: 'capitalize' }}>{shot.shotType.replace('_', ' ')}</div>
                    </div>
                    <div>
                        <div className="sp-text-xs sp-text-muted" style={{ marginBottom: '0.25rem' }}>Movement</div>
                        <div className="sp-text-sm" style={{ color: '#e5e7eb', textTransform: 'capitalize' }}>{shot.cameraMovement.replace('_', ' ')}</div>
                    </div>
                    <div>
                        <div className="sp-text-xs sp-text-muted" style={{ marginBottom: '0.25rem' }}>Blocking</div>
                        <div className="sp-text-sm" style={{ color: '#e5e7eb' }}>{shot.composition.blocking}</div>
                    </div>
                </div>
            </div>

            {/* Locks Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h3 className="sp-text-xs sp-font-bold" style={{ color: 'var(--sp-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Continuity Locks</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {Object.entries(shot.locks).map(([key, isLocked]) => (
                        <div
                            key={key}
                            className="sp-text-xs sp-border"
                            style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.25rem',
                                backgroundColor: isLocked ? 'rgba(34, 197, 94, 0.1)' : '#1f2937',
                                borderColor: isLocked ? 'rgba(34, 197, 94, 0.3)' : '#374151',
                                color: isLocked ? '#4ade80' : '#6b7280',
                                borderStyle: 'solid',
                                borderWidth: '1px'
                            }}
                        >
                            {key.replace('Locked', '')}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
