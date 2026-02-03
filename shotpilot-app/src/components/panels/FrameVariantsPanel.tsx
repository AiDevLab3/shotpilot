import React from 'react';
import { useStore } from '../../store';
import { PromptCompiler } from '../../services/PromptCompiler';
import { AuditService } from '../../services/AuditService';

export const FrameVariantsPanel: React.FC = () => {
    const selectedShotId = useStore((state) => state.ui.selectedShotId);
    const frames = useStore((state) => state.frames);
    const selectedFrameId = useStore((state) => state.ui.selectedFrameId);
    const setUiSelection = useStore((state) => state.setUiSelection);

    // Fetch context for generation
    const shots = useStore((state) => state.shots);
    const scenes = useStore((state) => state.scenes);
    const projects = useStore((state) => state.projects);
    const soulIds = useStore((state) => state.soulIds);
    const entityIds = useStore((state) => state.entityIds);

    // Get frames for selected shot
    const shotFrames = selectedShotId
        ? Object.values(frames).filter(f => f.shotId === selectedShotId)
        : [];

    if (!selectedShotId) return null;

    const handleGenerateVariant = async () => {
        const shot = shots[selectedShotId];
        const scene = scenes[shot.sceneId];
        const project = projects[scene.projectId];

        if (!shot || !scene || !project) return;

        // Create new frame ID
        const newFrameId = crypto.randomUUID();

        // Create base frame object
        const newFramePartial = {
            id: newFrameId,
            shotId: selectedShotId,
            frameNumber: shotFrames.length + 1,
            version: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            model: "nano_banana_pro",
            generationType: "image",
            generationAttemptNumber: shotFrames.length + 1,
            promptId: "new-prompt",
            compiledPrompt: "",
            negativePrompt: "",
            qualityScores: { aiSheenScore: 0, lightingContinuity: 0, characterIdentityLock: 0, cinematicHierarchy: 0, overallScore: 0 },
            status: "generating",
            modelParameters: {},
            generationTime: 0,
            asset: { url: "", operationType: "generate" as const, editSourceFrameId: null }
        };

        // Compile Prompt
        const promptBundle = PromptCompiler.compile(
            newFramePartial as any, // Cast as full frame for compiler (id, model required)
            shot,
            scene,
            project,
            soulIds,
            entityIds
        );

        // Final Initial Frame Object
        const newFrame = {
            ...newFramePartial,
            compiledPrompt: promptBundle.fullPrompt,
            negativePrompt: promptBundle.negativePrompt,
        };

        // Add to store (Generating state)
        useStore.getState().addFrame(newFrame as any);
        setUiSelection(selectedShotId, newFrame.id);

        // --- AUDIT LOOP ---
        try {
            // Run Audit (Simulates generation delay + checking)
            const auditResult = await AuditService.runAudit(newFrame as any);

            // Determine status based on tier
            let status = "completed";
            if (auditResult.tier === "LOCK IT IN") status = "approved";
            if (auditResult.tier === "REFINE") status = "needs_refinement";
            if (auditResult.tier === "REGENERATE") status = "rejected";

            // Update Frame with results
            useStore.getState().updateFrame(newFrame.id, {
                status: status as any,
                qualityScores: auditResult.scores,
                auditResult: auditResult,
                // Assign a mock asset URL if success (otherwise it stays blank/generating)
                asset: {
                    ...newFrame.asset,
                    url: `https://placehold.co/1920x1080/1a1a1a/FFF?text=Shot+${shot.shotNumber}+Frame+${newFrame.frameNumber}`
                }
            });

        } catch (error) {
            console.error("Audit failed:", error);
            useStore.getState().updateFrame(newFrame.id, { status: "rejected" as any });
        }
    };

    return (
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #1f2937', paddingLeft: '1rem', paddingRight: '1rem', paddingBottom: '1rem' }}>
            <div className="sp-flex" style={{ justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                <h3 className="sp-text-xs sp-font-bold sp-text-muted sp-uppercase sp-tracking-widest">Frame Variants</h3>
                <span className="sp-text-xs sp-text-muted">{shotFrames.length} variants</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {shotFrames.map(frame => (
                    <div
                        key={frame.id}
                        className="shot-card"
                        style={{
                            padding: 0, overflow: 'hidden', borderWidth: 2,
                            borderColor: selectedFrameId === frame.id ? '#a78bfa' : undefined
                        }}
                        onClick={() => setUiSelection(selectedShotId, frame.id)}
                    >
                        <div className="sp-aspect-video">
                            {frame.asset?.url ? (
                                <img
                                    src={frame.asset.url}
                                    alt={`Frame ${frame.frameNumber}`}
                                    className="sp-cover"
                                />
                            ) : (
                                <div className="sp-flex" style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111827' }}>
                                    <span className="sp-text-xs sp-text-muted">Generating...</span>
                                </div>
                            )}
                            {/* Score Overlay */}
                            {frame.qualityScores && (
                                <div className="sp-absolute" style={{ top: '0.25rem', right: '0.25rem', backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: '0.25rem', padding: '0.125rem 0.375rem', fontSize: '0.75rem', color: 'white', fontWeight: 'bold' }}>
                                    {frame.qualityScores.overallScore}
                                </div>
                            )}
                        </div>
                        <div style={{ padding: '0.5rem', backgroundColor: 'rgba(31, 41, 55, 0.5)' }}>
                            <div className="sp-text-xs sp-text-muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.625rem' }}>
                                {frame.model}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={handleGenerateVariant}
                className="sp-btn-dashed"
            >
                + Generate Variant
            </button>
        </div>
    );
};
