import React from 'react';
import { useStore } from '../../store';
import { CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import { Frame } from '../../types/schema';

export const FrameVariantsPanel: React.FC<{ shotId: string }> = ({ shotId }) => {
    const shot = useStore(state => state.shots[shotId]);
    const frames = useStore(state => Object.values(state.frames).filter(f => f.shotId === shotId).sort((a, b) => a.generationAttemptNumber - b.generationAttemptNumber));
    const selectedFrameId = useStore(state => state.ui.selectedFrameId);
    const setSelection = useStore(state => state.setUiSelection);

    const handleSelect = (frame: Frame) => {
        setSelection(shotId, frame.id);
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--color-text-secondary)]">Frame Variants ({frames.length})</h3>
                <button className="text-xs px-2 py-1 bg-[var(--color-accent)] text-black font-semibold rounded hover:bg-[var(--color-accent-hover)] transition-colors">
                    + Generate
                </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
                {frames.map(frame => (
                    <div
                        key={frame.id}
                        onClick={() => handleSelect(frame)}
                        className={clsx(
                            "relative aspect-video rounded-md overflow-hidden border cursor-pointer group",
                            selectedFrameId === frame.id
                                ? "border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]"
                                : "border-[var(--color-border)] hover:border-[var(--color-text-muted)]"
                        )}
                    >
                        {frame.asset?.url ? (
                            <img src={frame.asset.url} alt={`Frame ${frame.frameNumber}`} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-black/50 flex items-center justify-center text-xs text-gray-600">
                                {frame.status}
                            </div>
                        )}

                        {/* Status Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6 flex justify-between items-end">
                            <span className="text-[10px] text-white font-mono">#{frame.frameNumber}</span>
                            {frame.status === 'completed' && <CheckCircle size={12} className="text-green-500" />}
                        </div>
                    </div>
                ))}
            </div>

            {selectedFrameId && (
                <FrameDetails frameId={selectedFrameId} />
            )}
        </div>
    );
};

const FrameDetails: React.FC<{ frameId: string }> = ({ frameId }) => {
    const frame = useStore(state => state.frames[frameId]);
    const updateFrame = useStore(state => state.updateFrame);
    const [isAuditing, setIsAuditing] = React.useState(false);

    if (!frame) return null;

    const handleRunAudit = async () => {
        setIsAuditing(true);
        // Importing here assuming services created
        const { AuditService } = await import('../../services/AuditService');
        const result = await AuditService.runAudit(frame);

        // Map the service result to the schema format
        updateFrame(frame.id, {
            auditResult: {
                tier: result.tier,
                findings: result.findings,
                fixDelta: result.fixDelta
            },
            qualityScores: result.scores
        });
        setIsAuditing(false);
    };

    return (
        <div className="mt-4 p-3 bg-black/20 rounded border border-[var(--color-border)] flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--color-text-primary)]">Selected Frame Details</span>
                <span className={clsx(
                    "text-[10px] px-1.5 py-0.5 rounded font-bold uppercase",
                    frame.auditResult?.tier === 'LOCK IT IN' ? "bg-green-500/20 text-green-400" :
                        frame.auditResult?.tier === 'REFINE' ? "bg-yellow-500/20 text-yellow-400" :
                            frame.auditResult?.tier === 'REGENERATE' ? "bg-red-500/20 text-red-400" :
                                "bg-gray-500/20 text-gray-400"
                )}>
                    {frame.auditResult?.tier || 'NO AUDIT'}
                </span>
            </div>

            <div className="text-xs text-[var(--color-text-muted)] font-mono break-all line-clamp-3 bg-black/20 p-2 rounded">
                {frame.compiledPrompt || "No prompt compiled yet."}
            </div>

            {frame.auditResult && (
                <div className="text-xs space-y-1">
                    <div className="font-semibold text-[var(--color-text-secondary)]">Findings:</div>
                    <ul className="list-disc pl-4 text-[var(--color-text-muted)]">
                        {frame.auditResult.findings.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                </div>
            )}

            <div className="grid grid-cols-2 gap-2 mt-1">
                <ScoreTile label="Realism (Sheen)" value={frame.qualityScores?.aiSheenScore} inverse />
                <ScoreTile label="Continuity" value={frame.qualityScores?.characterIdentityLock} />
            </div>

            <button
                onClick={handleRunAudit}
                disabled={isAuditing}
                className="w-full py-1.5 bg-white/5 hover:bg-white/10 border border-[var(--color-border)] rounded text-xs font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
                {isAuditing ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                {isAuditing ? "Auditing..." : "Run Quality Audit"}
            </button>
        </div>
    );
};

const ScoreTile: React.FC<{ label: string; value?: number; inverse?: boolean }> = ({ label, value, inverse }) => {
    if (value === undefined) return null;
    const isGood = inverse ? value < 30 : value > 70;
    const color = isGood ? 'text-green-400' : 'text-yellow-400';
    return (
        <div className="flex flex-col bg-white/5 p-1.5 rounded">
            <span className="text-[10px] text-[var(--color-text-muted)]">{label}</span>
            <span className={`text-xs font-bold ${color}`}>{value}</span>
        </div>
    );
}
