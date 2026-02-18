import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2, Check, Copy, ChevronDown, Send, MessageCircle, RotateCw, HelpCircle, Upload, X, Clock, Image as ImageIcon, Search, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { CharacterSuggestions, AIModel } from '../types/schema';
import { getCharacterSuggestions, getAvailableModels, refineContent, getLatestGeneration, saveGeneration, getGenerations, getEntityImages, saveEntityImage, deleteEntityImage, fileToBase64, analyzeEntityImage, generateTurnaroundPrompt, updateEntityImagePrompt } from '../services/api';
import { useCreativeDirectorStore } from '../stores/creativeDirectorStore';
import { ImageLightbox } from './ImageLightbox';

interface CharacterAIAssistantProps {
    projectId: number;
    characterId?: number;
    characterName: string;
    currentDescription?: string;
    currentPersonality?: string;
}

export const CharacterAIAssistant: React.FC<CharacterAIAssistantProps> = ({
    projectId,
    characterId,
    characterName,
    currentDescription,
    currentPersonality,
}) => {
    const [suggestions, setSuggestions] = useState<CharacterSuggestions | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [promptCopied, setPromptCopied] = useState(false);
    const [tipsExpanded, setTipsExpanded] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
    const [refining, setRefining] = useState(false);
    const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>('');
    const directorModel = useCreativeDirectorStore(s => s.sessions[projectId]?.targetModel || '');
    const [turnaroundCopied, setTurnaroundCopied] = useState<boolean>(false);
    const [workflowExpanded, setWorkflowExpanded] = useState(false);
    const [refSectionExpanded, setRefSectionExpanded] = useState(false);

    // Separate turnaround state — independent from main suggestions
    const [turnaroundData, setTurnaroundData] = useState<{ turnaroundPrompt: string; turnaroundUsesRef: boolean } | null>(null);
    const [turnaroundLoading, setTurnaroundLoading] = useState(false);
    const [turnaroundError, setTurnaroundError] = useState<string | null>(null);

    // Prompt editing for user-provided reference images
    const [editingRefPrompt, setEditingRefPrompt] = useState(false);
    const [refPromptDraft, setRefPromptDraft] = useState('');
    const [savingRefPrompt, setSavingRefPrompt] = useState(false);

    // Generation history + entity images
    const [generationHistory, setGenerationHistory] = useState<any[]>([]);
    const [activeGenerationId, setActiveGenerationId] = useState<number | null>(null);
    const [entityImages, setEntityImages] = useState<Record<string, any>>({});
    const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
    const [analyzingSlot, setAnalyzingSlot] = useState<string | null>(null);
    const [analysisResults, setAnalysisResults] = useState<Record<string, any>>({});
    const [analysisExpanded, setAnalysisExpanded] = useState<Record<string, boolean>>({});
    const [revisedPromptCopied, setRevisedPromptCopied] = useState<string | null>(null);
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
    const [iterationHistory, setIterationHistory] = useState<Array<{ version: number; score: number }>>([]);
    const nameIsEmpty = !characterName || characterName.trim().length === 0;

    // Load available models
    useEffect(() => {
        getAvailableModels()
            .then((models) => {
                const imageModels = models.filter((m: AIModel) => m.type === 'image');
                setAvailableModels(imageModels);
            })
            .catch(() => {});
    }, []);

    // Load previous generation + entity images when editing an existing character
    useEffect(() => {
        if (!characterId) return;
        // Load latest generation
        getLatestGeneration('character', characterId).then((gen) => {
            if (gen && gen.suggestions_json) {
                try {
                    const parsed = JSON.parse(gen.suggestions_json);
                    setSuggestions(parsed);
                    setHasLoaded(true);
                    setActiveGenerationId(gen.id);
                    if (gen.model) setSelectedModel(gen.model);
                } catch { /* ignore parse errors */ }
            }
        }).catch(() => {});
        // Load generation history
        getGenerations('character', characterId).then(setGenerationHistory).catch(() => {});
        // Load entity images
        loadEntityImages();
    }, [characterId]);

    const loadEntityImages = async () => {
        if (!characterId) return;
        try {
            const images = await getEntityImages('character', characterId);
            const map: Record<string, any> = {};
            const analyses: Record<string, any> = {};
            images.forEach((img: any) => {
                map[img.image_type] = img;
                if (img.analysis_json) {
                    try { analyses[img.image_type] = JSON.parse(img.analysis_json); } catch { /* ignore */ }
                }
            });
            setEntityImages(map);
            setAnalysisResults(prev => ({ ...prev, ...analyses }));
        } catch { /* ignore */ }
    };

    const handleImageUpload = async (slot: string, label: string, prompt: string, sourceRef?: string) => {
        if (!characterId) return;
        const refKey = sourceRef || slot;
        const input = fileInputRefs.current[refKey];
        if (!input?.files?.[0]) return;
        const file = input.files[0];
        if (file.size > 20 * 1024 * 1024) {
            alert('File is too large! Please choose an image under 20MB.');
            return;
        }
        setUploadingSlot(refKey);
        try {
            const base64 = await fileToBase64(file);
            await saveEntityImage('character', characterId, slot, base64, label, prompt);
            await loadEntityImages();
        } catch (err) {
            console.error('Failed to upload image', err);
        } finally {
            setUploadingSlot(null);
            if (input) input.value = '';
        }
    };

    const handleRemoveImage = async (slot: string) => {
        const img = entityImages[slot];
        if (!img) return;
        try {
            await deleteEntityImage(img.id);
            setAnalysisResults(prev => { const next = { ...prev }; delete next[slot]; return next; });
            setAnalysisExpanded(prev => { const next = { ...prev }; delete next[slot]; return next; });
            await loadEntityImages();
        } catch (err) {
            console.error('Failed to remove image', err);
        }
    };

    const handleAnalyzeImage = async (slot: string) => {
        const img = entityImages[slot];
        if (!img) return;
        setAnalyzingSlot(slot);
        try {
            // Model resolution chain: local selector → Director's model → let backend decide
            const resolvedModel = selectedModel || directorModel || undefined;
            const result = await analyzeEntityImage(img.id, resolvedModel, iterationHistory.length > 0 ? iterationHistory : undefined);
            setAnalysisResults(prev => ({ ...prev, [slot]: result }));
            setAnalysisExpanded(prev => ({ ...prev, [slot]: true }));
        } catch (err: any) {
            console.error('Failed to analyze image', err);
            setAnalysisResults(prev => ({ ...prev, [slot]: { error: err.message || 'Analysis failed' } }));
            setAnalysisExpanded(prev => ({ ...prev, [slot]: true }));
        } finally {
            setAnalyzingSlot(null);
        }
    };

    const handleCopyRevisedPrompt = async (slot: string, prompt: string) => {
        try {
            await navigator.clipboard.writeText(prompt);
        } catch {
            const textarea = document.createElement('textarea');
            textarea.value = prompt;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
        setRevisedPromptCopied(slot);
        setTimeout(() => setRevisedPromptCopied(null), 2000);
    };

    const handleRevisionUpload = async (slot: string) => {
        const input = fileInputRefs.current[`${slot}-revision`];
        if (!input?.files?.[0] || !characterId) return;
        const file = input.files[0];
        if (file.size > 20 * 1024 * 1024) {
            alert('File is too large! Please choose an image under 20MB.');
            return;
        }

        const currentAnalysis = analysisResults[slot];
        const currentScore = currentAnalysis?.overall_score ?? currentAnalysis?.match_score ?? 0;

        // Record V1 on first revision
        setIterationHistory(prev => {
            if (prev.length === 0 && currentScore > 0) {
                return [{ version: 1, score: currentScore }];
            }
            return prev;
        });

        setUploadingSlot(`${slot}-revision`);
        setAnalysisResults(prev => { const next = { ...prev }; delete next[slot]; return next; });

        try {
            const base64 = await fileToBase64(file);
            const revisedPrompt = currentAnalysis?.revised_prompt || '';
            await saveEntityImage('character', characterId, slot, base64, 'Reference (revised)', revisedPrompt);
            await loadEntityImages();

            // Auto-analyze the new image
            setUploadingSlot(null);
            setAnalyzingSlot(slot);
            const images = await getEntityImages('character', characterId);
            const newImg = images.find((img: any) => img.image_type === slot);
            if (newImg) {
                const resolvedModel = selectedModel || directorModel || undefined;
                const historySnapshot = [...iterationHistory];
                if (historySnapshot.length === 0 && currentScore > 0) {
                    historySnapshot.push({ version: 1, score: currentScore });
                }
                const result = await analyzeEntityImage(newImg.id, resolvedModel, historySnapshot.length > 0 ? historySnapshot : undefined);
                setAnalysisResults(prev => ({ ...prev, [slot]: result }));
                setAnalysisExpanded(prev => ({ ...prev, [slot]: true }));

                const newScore = result?.overall_score ?? result?.match_score ?? 0;
                if (newScore > 0) {
                    setIterationHistory(prev => [...prev, { version: prev.length + 1, score: newScore }]);
                }
            }
        } catch (err) {
            console.error('Failed to upload revision', err);
        } finally {
            setUploadingSlot(null);
            setAnalyzingSlot(null);
            if (input) input.value = '';
        }
    };

    const handleSaveRefPrompt = async () => {
        const img = entityImages['reference'];
        if (!img) return;
        setSavingRefPrompt(true);
        try {
            await updateEntityImagePrompt(img.id, refPromptDraft);
            await loadEntityImages();
            setEditingRefPrompt(false);
        } catch (err) {
            console.error('Failed to save prompt', err);
        } finally {
            setSavingRefPrompt(false);
        }
    };

    const loadHistoryGeneration = (gen: any) => {
        try {
            const parsed = JSON.parse(gen.suggestions_json);
            setSuggestions(parsed);
            setHasLoaded(true);
            setActiveGenerationId(gen.id);
        } catch { /* ignore */ }
    };

    const loadFullSuggestions = async (modelOverride?: string) => {
        setLoading(true);
        setError(null);
        setPromptCopied(false);
        setTipsExpanded(false);
        const model = modelOverride !== undefined ? modelOverride : selectedModel;
        try {
            const result = await getCharacterSuggestions(projectId, {
                name: characterName,
                description: currentDescription,
                personality: currentPersonality,
                targetModel: model || undefined,
            });
            setSuggestions(result);
            setHasLoaded(true);
            // Persist generation if we have a character ID
            if (characterId) {
                try {
                    const saved = await saveGeneration('character', characterId, model || result.recommendedModel || null, result);
                    setActiveGenerationId(saved.id);
                    // Refresh history
                    getGenerations('character', characterId).then(setGenerationHistory).catch(() => {});
                } catch { /* non-critical — don't block the UI */ }
            }
        } catch (err: any) {
            setError(err.message || 'Failed to generate suggestions');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyPrompt = async () => {
        if (suggestions) {
            try {
                await navigator.clipboard.writeText(suggestions.referencePrompt);
                setPromptCopied(true);
                setTimeout(() => setPromptCopied(false), 2000);
            } catch {
                // Fallback for environments without clipboard API
                const textarea = document.createElement('textarea');
                textarea.value = suggestions.referencePrompt;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                setPromptCopied(true);
                setTimeout(() => setPromptCopied(false), 2000);
            }
        }
    };

    const handleCopyTurnaround = async (prompt: string) => {
        try {
            await navigator.clipboard.writeText(prompt);
        } catch {
            const textarea = document.createElement('textarea');
            textarea.value = prompt;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
        setTurnaroundCopied(true);
        setTimeout(() => setTurnaroundCopied(false), 2000);
    };

    const handleGenerateTurnaround = async () => {
        if (!characterId || turnaroundLoading) return;
        setTurnaroundLoading(true);
        setTurnaroundError(null);
        try {
            const result = await generateTurnaroundPrompt('character', characterId, selectedModel || undefined);
            setTurnaroundData(result);
        } catch (err: any) {
            setTurnaroundError(err.message || 'Failed to generate turnaround prompt');
        } finally {
            setTurnaroundLoading(false);
        }
    };

    const handleRefine = async (msg?: string) => {
        const text = msg || chatInput.trim();
        if (!text || refining || !suggestions) return;
        setChatInput('');
        setRefining(true);
        const newHistory = [...chatHistory, { role: 'user', content: text }];
        setChatHistory(newHistory);
        try {
            const result = await refineContent(projectId, 'character', suggestions, text, newHistory);
            if (result.contentUpdate) {
                setSuggestions(prev => prev ? { ...prev, ...result.contentUpdate } : prev);
            }
            setChatHistory([...newHistory, { role: 'assistant', content: result.response }]);
        } catch (err: any) {
            setChatHistory([...newHistory, { role: 'assistant', content: 'Sorry, something went wrong. Try again.' }]);
        } finally {
            setRefining(false);
        }
    };

    const renderAnalysisResults = (slot: string) => {
        const analysis = analysisResults[slot];
        if (!analysis) return null;
        const isExpanded = analysisExpanded[slot];

        if (analysis.error) {
            return (
                <div style={{ marginTop: '4px', padding: '6px 8px', backgroundColor: '#2a1a1a', border: '1px solid #7f1d1d', borderRadius: '4px', fontSize: '10px', color: '#fca5a5' }}>
                    Analysis failed: {analysis.error}
                </div>
            );
        }

        const overallScore = analysis.overall_score ?? analysis.match_score ?? 0;
        const verdictColor = analysis.verdict === 'STRONG MATCH' ? '#10b981' : analysis.verdict === 'NEEDS TWEAKS' ? '#f59e0b' : '#ef4444';
        const VerdictIcon = analysis.verdict === 'STRONG MATCH' ? CheckCircle2 : AlertTriangle;

        const dimensionLabels: Record<string, string> = {
            physics: 'Physics',
            style_consistency: 'Style',
            lighting_atmosphere: 'Lighting',
            clarity: 'Clarity',
            composition: 'Composition',
            character_identity: 'Identity',
            object_accuracy: 'Accuracy',
        };
        const scoreColor = (s: number) => s >= 8 ? '#10b981' : s >= 6 ? '#f59e0b' : '#ef4444';

        return (
            <div style={{ marginTop: '6px', backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '6px', overflow: 'hidden' }}>
                <button
                    onClick={() => setAnalysisExpanded(prev => ({ ...prev, [slot]: !prev[slot] }))}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '6px 8px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <VerdictIcon size={12} color={verdictColor} />
                        <span style={{ fontSize: '11px', fontWeight: 600, color: verdictColor }}>{analysis.verdict}</span>
                        <span style={{ fontSize: '10px', color: '#6b7280' }}>Score: {overallScore}/100</span>
                    </div>
                    <ChevronDown size={12} style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </button>
                {isExpanded && (
                    <div style={{ padding: '8px', borderTop: '1px solid #27272a' }}>
                        {analysis.summary && (
                            <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#d1d5db', lineHeight: '1.5' }}>{analysis.summary}</p>
                        )}
                        {/* Stagnation alert — model switch recommendation */}
                        {analysis.stagnation_alert && (
                            <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
                                    <AlertTriangle size={13} color="#ef4444" />
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Plateau Detected</span>
                                </div>
                                <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#fca5a5', lineHeight: '1.5' }}>
                                    {analysis.stagnation_alert.diagnosis}
                                </p>
                                {analysis.stagnation_alert.recommended_model && (
                                    <div style={{ padding: '8px', backgroundColor: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.2)', borderRadius: '4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#22d3ee', textTransform: 'uppercase' }}>
                                                Try {analysis.stagnation_alert.recommended_model}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    const modelMatch = availableModels.find(m =>
                                                        m.name.toLowerCase().includes(analysis.stagnation_alert.recommended_model.toLowerCase()) ||
                                                        analysis.stagnation_alert.recommended_model.toLowerCase().includes(m.name.toLowerCase())
                                                    );
                                                    if (modelMatch) setSelectedModel(modelMatch.name);
                                                }}
                                                style={{ padding: '3px 10px', backgroundColor: '#164e63', border: '1px solid #0e7490', borderRadius: '4px', color: '#22d3ee', fontSize: '10px', fontWeight: 600, cursor: 'pointer' }}
                                            >
                                                Switch Model
                                            </button>
                                        </div>
                                        <p style={{ margin: '0 0 6px 0', fontSize: '10px', color: '#a5b4fc', lineHeight: '1.4' }}>
                                            {analysis.stagnation_alert.recommended_model_reason}
                                        </p>
                                        {analysis.stagnation_alert.revised_prompt_for_recommended && (
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                                                    <span style={{ fontSize: '9px', color: '#6b7280', fontWeight: 600 }}>Prompt for {analysis.stagnation_alert.recommended_model}:</span>
                                                    <button
                                                        onClick={() => handleCopyRevisedPrompt(`${slot}-alt`, analysis.stagnation_alert.revised_prompt_for_recommended)}
                                                        style={styles.copyBtn}
                                                    >
                                                        {revisedPromptCopied === `${slot}-alt` ? (
                                                            <><Check size={10} color="#10b981" /> Copied</>
                                                        ) : (
                                                            <><Copy size={10} /> Copy</>
                                                        )}
                                                    </button>
                                                </div>
                                                <p style={{ ...styles.promptText, margin: 0, fontSize: '10px', lineHeight: '1.5' }}>
                                                    {analysis.stagnation_alert.revised_prompt_for_recommended}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        {/* Dimension scores */}
                        {analysis.dimensions && (
                            <div style={{ marginBottom: '8px' }}>
                                <span style={{ fontSize: '10px', fontWeight: 600, color: '#60a5fa', textTransform: 'uppercase' }}>Quality dimensions</span>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px', marginTop: '4px' }}>
                                    {Object.entries(analysis.dimensions).map(([key, dim]: [string, any]) => (
                                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span style={{ fontSize: '9px', color: '#9ca3af', width: '58px', flexShrink: 0 }}>{dimensionLabels[key] || key}</span>
                                            <div style={{ flex: 1, height: '4px', backgroundColor: '#27272a', borderRadius: '2px', overflow: 'hidden' }}>
                                                <div style={{ width: `${(dim.score / 10) * 100}%`, height: '100%', backgroundColor: scoreColor(dim.score), borderRadius: '2px', transition: 'width 0.3s' }} />
                                            </div>
                                            <span style={{ fontSize: '9px', color: scoreColor(dim.score), fontWeight: 600, width: '18px', textAlign: 'right' }}>{dim.score}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Realism diagnosis */}
                        {analysis.realism_diagnosis && analysis.realism_diagnosis.length > 0 && (
                            <div style={{ marginBottom: '8px' }}>
                                <span style={{ fontSize: '10px', fontWeight: 600, color: '#f87171', textTransform: 'uppercase' }}>Realism diagnosis</span>
                                {analysis.realism_diagnosis.map((diag: any, i: number) => (
                                    <div key={i} style={{ marginTop: '4px', padding: '5px 7px', backgroundColor: diag.severity === 'severe' ? '#2a1a1a' : '#1e1e22', border: `1px solid ${diag.severity === 'severe' ? '#7f1d1d' : '#44403c'}`, borderRadius: '4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                                            <AlertTriangle size={10} color={diag.severity === 'severe' ? '#ef4444' : '#f59e0b'} />
                                            <span style={{ fontSize: '10px', fontWeight: 600, color: diag.severity === 'severe' ? '#fca5a5' : '#fde68a' }}>{diag.pattern}</span>
                                            <span style={{ fontSize: '9px', color: '#6b7280' }}>({diag.severity})</span>
                                        </div>
                                        <p style={{ margin: '0 0 2px 0', fontSize: '9px', color: '#d1d5db', lineHeight: '1.4' }}>{diag.details}</p>
                                        {diag.fix && <p style={{ margin: 0, fontSize: '9px', color: '#a78bfa', lineHeight: '1.4' }}>Fix: {diag.fix}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                        {analysis.what_works && analysis.what_works.length > 0 && (
                            <div style={{ marginBottom: '8px' }}>
                                <span style={{ fontSize: '10px', fontWeight: 600, color: '#10b981', textTransform: 'uppercase' }}>What works</span>
                                <ul style={{ margin: '2px 0 0 0', padding: '0 0 0 14px', listStyle: 'disc' }}>
                                    {analysis.what_works.map((item: string, i: number) => (
                                        <li key={i} style={{ fontSize: '10px', color: '#a7f3d0', lineHeight: '1.5' }}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {analysis.issues && analysis.issues.length > 0 && (
                            <div style={{ marginBottom: '8px' }}>
                                <span style={{ fontSize: '10px', fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase' }}>Issues found</span>
                                <ul style={{ margin: '2px 0 0 0', padding: '0 0 0 14px', listStyle: 'disc' }}>
                                    {analysis.issues.map((issue: any, i: number) => (
                                        <li key={i} style={{ fontSize: '10px', color: issue.severity === 'major' ? '#fca5a5' : issue.severity === 'moderate' ? '#fde68a' : '#d1d5db', lineHeight: '1.5' }}>
                                            <span style={{ fontWeight: 600 }}>[{issue.severity}]</span> {issue.detail}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {analysis.prompt_adjustments && analysis.prompt_adjustments.length > 0 && (
                            <div style={{ marginBottom: '8px' }}>
                                <span style={{ fontSize: '10px', fontWeight: 600, color: '#a78bfa', textTransform: 'uppercase' }}>Prompt fixes</span>
                                <ul style={{ margin: '2px 0 0 0', padding: '0 0 0 14px', listStyle: 'disc' }}>
                                    {analysis.prompt_adjustments.map((adj: string, i: number) => (
                                        <li key={i} style={{ fontSize: '10px', color: '#c4b5fd', lineHeight: '1.5' }}>{adj}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {analysis.revised_prompt && (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#22d3ee', textTransform: 'uppercase' }}>
                                        Revised prompt{analysis.target_model ? ` for ${analysis.target_model}` : ''}
                                    </span>
                                    <button
                                        onClick={() => handleCopyRevisedPrompt(slot, analysis.revised_prompt)}
                                        style={styles.copyBtn}
                                    >
                                        {revisedPromptCopied === slot ? (
                                            <><Check size={10} color="#10b981" /> Copied</>
                                        ) : (
                                            <><Copy size={10} /> Copy</>
                                        )}
                                    </button>
                                </div>
                                {analysis.reference_strategy && (
                                    <div style={{
                                        padding: '6px 8px', marginBottom: '6px', borderRadius: '4px',
                                        backgroundColor: analysis.reference_strategy.action === 'use_reference'
                                            ? 'rgba(96,165,250,0.08)' : analysis.reference_strategy.action === 'fresh_start'
                                                ? 'rgba(139,92,246,0.08)' : 'rgba(245,158,11,0.08)',
                                        border: `1px solid ${analysis.reference_strategy.action === 'use_reference'
                                            ? 'rgba(96,165,250,0.2)' : analysis.reference_strategy.action === 'fresh_start'
                                                ? 'rgba(139,92,246,0.2)' : 'rgba(245,158,11,0.2)'}`,
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                                            <ImageIcon size={10} style={{
                                                color: analysis.reference_strategy.action === 'use_reference' ? '#60a5fa'
                                                    : analysis.reference_strategy.action === 'fresh_start' ? '#8b5cf6' : '#f59e0b'
                                            }} />
                                            <span style={{
                                                fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em',
                                                color: analysis.reference_strategy.action === 'use_reference' ? '#60a5fa'
                                                    : analysis.reference_strategy.action === 'fresh_start' ? '#8b5cf6' : '#f59e0b'
                                            }}>
                                                {analysis.reference_strategy.action === 'use_reference' ? 'Attach this image as reference'
                                                    : analysis.reference_strategy.action === 'fresh_start' ? 'Start fresh — no reference needed'
                                                        : 'Reference optional'}
                                            </span>
                                        </div>
                                        <span style={{ fontSize: '10px', color: '#a1a1aa', lineHeight: '1.4' }}>{analysis.reference_strategy.reason}</span>
                                    </div>
                                )}
                                <p style={{ ...styles.promptText, margin: 0, fontSize: '10px', lineHeight: '1.5' }}>{analysis.revised_prompt}</p>

                                {/* Iteration roadmap — next steps + upload revised version */}
                                <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#111113', borderRadius: '6px', border: '1px solid #27272a' }}>
                                    {iterationHistory.length > 0 && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '9px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Progress:</span>
                                            {iterationHistory.map((iter, i) => (
                                                <React.Fragment key={i}>
                                                    {i > 0 && <span style={{ color: '#3f3f46', fontSize: '10px' }}>→</span>}
                                                    <span style={{
                                                        fontSize: '10px', fontWeight: 700, padding: '1px 5px', borderRadius: '3px',
                                                        backgroundColor: iter.score >= 75 ? 'rgba(16,185,129,0.1)' : iter.score >= 50 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                                                        color: iter.score >= 75 ? '#10b981' : iter.score >= 50 ? '#f59e0b' : '#ef4444',
                                                    }}>V{iter.version}: {iter.score}</span>
                                                </React.Fragment>
                                            ))}
                                            <span style={{ color: '#3f3f46', fontSize: '10px' }}>→</span>
                                            <span style={{ fontSize: '9px', color: '#22d3ee', fontWeight: 600 }}>Next ↓</span>
                                        </div>
                                    )}
                                    <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '8px', lineHeight: '1.6' }}>
                                        <span style={{ color: '#9ca3af', fontWeight: 600 }}>1.</span> Copy the revised prompt above{' '}
                                        <span style={{ color: '#9ca3af', fontWeight: 600 }}>2.</span> Generate in {selectedModel ? (availableModels.find(m => m.name === selectedModel)?.displayName || selectedModel) : 'your AI tool'}
                                        {analysis.reference_strategy?.action === 'use_reference' && ' (attach current image as ref)'}{' '}
                                        <span style={{ color: '#9ca3af', fontWeight: 600 }}>3.</span> Upload below
                                    </div>
                                    <label style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                        padding: '8px 12px', backgroundColor: '#1a2a2a', border: '2px dashed #2dd4bf',
                                        borderRadius: '6px', color: '#2dd4bf', fontSize: '11px', fontWeight: 600,
                                        cursor: uploadingSlot === `${slot}-revision` || analyzingSlot === slot ? 'wait' : 'pointer',
                                        opacity: uploadingSlot === `${slot}-revision` || analyzingSlot === slot ? 0.6 : 1,
                                        transition: 'all 0.2s',
                                    }}>
                                        {uploadingSlot === `${slot}-revision` ? (
                                            <><Loader2 size={13} className="spin" /> Uploading...</>
                                        ) : analyzingSlot === slot ? (
                                            <><Loader2 size={13} className="spin" /> Analyzing new version...</>
                                        ) : (
                                            <><Upload size={13} /> Upload revised image</>
                                        )}
                                        <input
                                            type="file" accept="image/*"
                                            ref={el => { fileInputRefs.current[`${slot}-revision`] = el; }}
                                            onChange={() => handleRevisionUpload(slot)}
                                            style={{ display: 'none' }}
                                            disabled={!!uploadingSlot || !!analyzingSlot}
                                        />
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const quickActions = [
        'Make younger (early 30s)',
        'Make older (late 50s)',
        'More intimidating appearance',
        'Softer, more approachable look',
        'Change wardrobe to formal attire',
        'Regenerate completely',
    ];

    // Not yet loaded -- show dual-path trigger: Upload Image or Generate Prompt
    if (!hasLoaded && !loading) {
        const hasRefImage = entityImages['reference'];

        return (
            <div style={styles.triggerContainer}>
                {/* Target Model selector — applies to analysis and generation */}
                {availableModels.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', width: '100%' }}>
                        <label style={{ fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap' }}>Target Model:</label>
                        <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} style={{ ...styles.modelSelect, flex: 1 }}>
                            <option value="">Auto (let AI decide)</option>
                            {availableModels.map((m) => (
                                <option key={m.name} value={m.name}>{m.displayName || m.name}</option>
                            ))}
                        </select>
                    </div>
                )}
                {!hasRefImage ? (
                    <>
                        {/* Path A: Upload existing image */}
                        {characterId ? (
                            <div style={{ width: '100%', marginBottom: '10px' }}>
                                <label style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    padding: '12px 16px', backgroundColor: '#1a2a2a', border: '2px dashed #2dd4bf',
                                    borderRadius: '8px', color: '#2dd4bf', fontSize: '13px', fontWeight: 600,
                                    cursor: uploadingSlot === 'initial-upload' ? 'wait' : 'pointer', transition: 'all 0.2s',
                                }}>
                                    {uploadingSlot === 'initial-upload' ? (
                                        <><Loader2 size={16} className="spin" /> Uploading...</>
                                    ) : (
                                        <><Upload size={16} /> I have a reference image</>
                                    )}
                                    <input
                                        type="file" accept="image/*"
                                        ref={el => { fileInputRefs.current['initial-upload'] = el; }}
                                        onChange={() => handleImageUpload('reference', 'Reference Image (user-provided)', '', 'initial-upload')}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                                <span style={{ fontSize: '10px', color: '#6b7280', textAlign: 'center', display: 'block', marginTop: '4px' }}>
                                    Upload an image you've already generated or sourced
                                </span>
                            </div>
                        ) : (
                            <div style={{ width: '100%', marginBottom: '10px', padding: '10px 16px', backgroundColor: '#1a1a1e', border: '1px dashed #3f3f46', borderRadius: '8px', textAlign: 'center' }}>
                                <span style={{ fontSize: '11px', color: '#6b7280' }}>
                                    Save the character first to upload a reference image
                                </span>
                            </div>
                        )}

                        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div style={{ flex: 1, height: '1px', backgroundColor: '#3f3f46' }} />
                            <span style={{ fontSize: '11px', color: '#6b7280' }}>or</span>
                            <div style={{ flex: 1, height: '1px', backgroundColor: '#3f3f46' }} />
                        </div>

                        {/* Path B: Generate AI prompt */}
                        <button
                            onClick={() => loadFullSuggestions()}
                            disabled={nameIsEmpty}
                            style={{ ...styles.triggerBtn, opacity: nameIsEmpty ? 0.5 : 1, cursor: nameIsEmpty ? 'not-allowed' : 'pointer' }}
                        >
                            <Sparkles size={14} />
                            Generate Prompt
                        </button>
                        <span style={styles.triggerHint}>
                            {nameIsEmpty ? 'Enter a name first' : 'AI will generate a reference image prompt based on your description'}
                        </span>
                    </>
                ) : (
                    /* Reference image already uploaded — show it with tools */
                    <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                            <div style={styles.uploadPreview}>
                                <img src={hasRefImage.image_url} alt="Reference" style={{ ...styles.uploadImg, cursor: 'zoom-in' }} onClick={() => setLightboxSrc(hasRefImage.image_url)} />
                                <button onClick={() => handleRemoveImage('reference')} style={styles.uploadRemoveBtn}><X size={10} /></button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#2dd4bf' }}>Reference image uploaded</span>
                                <button
                                    onClick={() => handleAnalyzeImage('reference')}
                                    disabled={analyzingSlot === 'reference'}
                                    style={{ ...styles.analyzeBtn, opacity: analyzingSlot === 'reference' ? 0.5 : 1, cursor: analyzingSlot === 'reference' ? 'not-allowed' : 'pointer' }}
                                >
                                    {analyzingSlot === 'reference' ? (
                                        <><Loader2 size={11} className="spin" /> Analyzing...</>
                                    ) : analysisResults['reference'] && !analysisResults['reference'].error ? (
                                        <><Search size={11} /> Re-analyze</>
                                    ) : (
                                        <><Search size={11} /> Analyze Quality</>
                                    )}
                                </button>
                                {!hasRefImage.prompt && !analysisResults['reference'] && (
                                    <span style={{ fontSize: '9px', color: '#6b7280', lineHeight: '1.3' }}>
                                        Add your prompt first for best results, or analyze without it — AI will reverse-engineer one
                                    </span>
                                )}
                                <button
                                    onClick={() => { setRefPromptDraft(hasRefImage.prompt || ''); setEditingRefPrompt(prev => !prev); }}
                                    style={{ ...styles.copyBtn, fontSize: '10px', padding: '3px 8px', color: hasRefImage.prompt ? '#10b981' : '#f59e0b' }}
                                >
                                    {hasRefImage.prompt ? '\u2713 Prompt stored' : 'Add prompt used'}
                                </button>
                            </div>
                        </div>

                        {/* Prompt input field */}
                        {editingRefPrompt && (
                            <div style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#18181b', borderRadius: '6px', border: '1px solid #3f3f46' }}>
                                <label style={{ fontSize: '10px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>
                                    Paste the prompt you used to create this image — helps with iteration and turnarounds
                                </label>
                                <textarea
                                    value={refPromptDraft}
                                    onChange={(e) => setRefPromptDraft(e.target.value)}
                                    placeholder="e.g. Cinematic still frame, front portrait of a detective..."
                                    rows={3}
                                    style={{ width: '100%', padding: '6px 8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', borderRadius: '4px', color: '#e5e7eb', fontSize: '11px', fontFamily: 'monospace', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                                />
                                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                                    <button onClick={handleSaveRefPrompt} disabled={savingRefPrompt}
                                        style={{ ...styles.triggerBtn, fontSize: '10px', padding: '4px 10px', backgroundColor: '#059669' }}>
                                        {savingRefPrompt ? <Loader2 size={10} className="spin" /> : <Check size={10} />} Save
                                    </button>
                                    <button onClick={() => setEditingRefPrompt(false)}
                                        style={{ ...styles.copyBtn, fontSize: '10px', padding: '4px 10px' }}>Cancel</button>
                                </div>
                            </div>
                        )}

                        {/* Analysis results */}
                        {renderAnalysisResults('reference')}

                        {/* Divider + Generate Prompt option */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '12px 0 8px' }}>
                            <div style={{ flex: 1, height: '1px', backgroundColor: '#3f3f46' }} />
                            <span style={{ fontSize: '10px', color: '#6b7280' }}>or start fresh</span>
                            <div style={{ flex: 1, height: '1px', backgroundColor: '#3f3f46' }} />
                        </div>

                        <button
                            onClick={() => loadFullSuggestions()}
                            disabled={nameIsEmpty}
                            style={{ ...styles.triggerBtn, opacity: nameIsEmpty ? 0.5 : 1, cursor: nameIsEmpty ? 'not-allowed' : 'pointer' }}
                        >
                            <Sparkles size={14} />
                            Generate AI Prompt & Turnaround
                        </button>
                        <span style={styles.triggerHint}>
                            Generate a new prompt from your description + multi-angle turnarounds
                        </span>
                    </div>
                )}
                {lightboxSrc && <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <Sparkles size={14} color="#8b5cf6" />
                    <span style={styles.headerTitle}>AI Character Assistant</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {generationHistory.length > 1 && (
                        <select
                            value={activeGenerationId || ''}
                            onChange={(e) => {
                                const gen = generationHistory.find(g => g.id === Number(e.target.value));
                                if (gen) loadHistoryGeneration(gen);
                            }}
                            style={{ ...styles.modelSelect, maxWidth: '140px', fontSize: '10px' }}
                            title="Generation history"
                        >
                            {generationHistory.map((gen, i) => (
                                <option key={gen.id} value={gen.id}>
                                    {i === 0 ? 'Latest' : `v${generationHistory.length - i}`} — {new Date(gen.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </option>
                            ))}
                        </select>
                    )}
                    <button
                        onClick={() => loadFullSuggestions()}
                        disabled={loading || nameIsEmpty}
                        style={{
                            ...styles.regenerateBtn,
                            opacity: loading || nameIsEmpty ? 0.5 : 1,
                            cursor: loading || nameIsEmpty ? 'not-allowed' : 'pointer',
                        }}
                    >
                        <Sparkles size={12} />
                        Regenerate
                    </button>
                </div>
            </div>

            {/* Model selector row */}
            {availableModels.length > 0 && (
                <div style={{ padding: '8px 12px', borderBottom: '1px solid #3f3f46', backgroundColor: '#1a1a1e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <label style={{ fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap' }}>Target Model:</label>
                    <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        style={styles.modelSelect}
                    >
                        <option value="">Auto (let AI decide)</option>
                        {availableModels.map((m) => (
                            <option key={m.name} value={m.name}>{m.displayName || m.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {loading ? (
                <div style={styles.loadingState}>
                    <Loader2 size={18} className="spin" color="#8b5cf6" />
                    <span style={styles.loadingText}>
                        Generating character bible...
                    </span>
                </div>
            ) : error ? (
                <div style={styles.errorState}>
                    <p style={styles.errorText}>{error}</p>
                    <button onClick={() => loadFullSuggestions()} style={styles.retryBtn}>
                        Retry
                    </button>
                </div>
            ) : suggestions ? (
                <div style={styles.resultsContainer}>
                    {/* Recommended Model — show at top when present */}
                    {!selectedModel && suggestions.recommendedModel && (
                        <div style={{ backgroundColor: '#1a2a2a', padding: '12px', borderLeft: '3px solid #06b6d4' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>Prompts formatted for:</span>
                                    <span style={{ fontSize: '13px', color: '#22d3ee', fontWeight: 700 }}>
                                        {availableModels.find(m => m.name === suggestions.recommendedModel)?.displayName || suggestions.recommendedModel}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setSelectedModel(suggestions.recommendedModel!)}
                                    style={{ padding: '4px 12px', backgroundColor: '#164e63', border: '1px solid #0e7490', borderRadius: '4px', color: '#22d3ee', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Lock this model
                                </button>
                            </div>
                            {suggestions.recommendedModelReason && (
                                <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#94a3b8', lineHeight: '1.4' }}>
                                    {suggestions.recommendedModelReason}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Workflow Guide — collapsible */}
                    <div style={{ backgroundColor: '#1f1f23', borderLeft: '3px solid #3b82f6' }}>
                        <button
                            onClick={() => setWorkflowExpanded(prev => !prev)}
                            style={{ ...styles.tipsToggle, gap: '6px' }}
                        >
                            <span style={{ ...styles.tipsToggleText, display: 'flex', alignItems: 'center', gap: '5px', color: '#93c5fd' }}>
                                <HelpCircle size={13} /> How to use these results
                            </span>
                            <ChevronDown size={14} style={{ transform: workflowExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                        </button>
                        {workflowExpanded && (
                            <ol style={{ margin: '0', padding: '0 12px 12px 28px', fontSize: '12px', color: '#d1d5db', lineHeight: '1.8' }}>
                                <li><strong>Generate</strong> a turnaround prompt, then copy it into your AI image tool</li>
                                <li><strong>Upload</strong> the resulting turnaround sheet — this gives you multi-angle consistency</li>
                                <li>Optionally, expand the reference section below to generate a single hero shot</li>
                                <li>When creating shots in Scene Manager, your uploaded images will automatically be included for consistency</li>
                            </ol>
                        )}
                    </div>

                    {/* Turnaround Sheet — primary output */}
                    {characterId && (
                        <div style={{ backgroundColor: '#1f1f23', padding: '12px', borderLeft: '3px solid #f59e0b' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                <RotateCw size={13} color="#f59e0b" />
                                <span style={styles.fieldLabel}>Character Turnaround Sheet</span>
                            </div>
                            <span style={{ fontSize: '10px', color: '#6b7280', fontStyle: 'italic', display: 'block', marginBottom: '8px' }}>
                                Generate a single image showing your character from 4 angles (front, 3/4, side, back) for consistency across shots
                            </span>

                            {!turnaroundData && !turnaroundLoading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                    <button
                                        onClick={handleGenerateTurnaround}
                                        style={{ ...styles.triggerBtn, backgroundColor: '#d97706', fontSize: '12px', padding: '6px 14px' }}
                                    >
                                        <RotateCw size={13} />
                                        Generate Turnaround Prompt
                                    </button>
                                    {turnaroundError && (
                                        <span style={{ fontSize: '10px', color: '#ef4444' }}>{turnaroundError}</span>
                                    )}
                                </div>
                            ) : turnaroundLoading ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}>
                                    <Loader2 size={16} className="spin" color="#f59e0b" />
                                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>Generating turnaround prompt...</span>
                                </div>
                            ) : turnaroundData ? (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px', gap: '6px' }}>
                                        <button
                                            onClick={handleGenerateTurnaround}
                                            style={{ ...styles.copyBtn, color: '#fbbf24', borderColor: '#713f12' }}
                                        >
                                            <RotateCw size={11} /> Regenerate
                                        </button>
                                        <button
                                            onClick={() => handleCopyTurnaround(turnaroundData.turnaroundPrompt)}
                                            style={styles.copyBtn}
                                        >
                                            {turnaroundCopied ? (
                                                <><Check size={12} color="#10b981" /> Copied</>
                                            ) : (
                                                <><Copy size={12} /> Copy</>
                                            )}
                                        </button>
                                    </div>
                                    <p style={{ ...styles.promptText, margin: '0', fontSize: '11px' }}>{turnaroundData.turnaroundPrompt}</p>
                                    <span style={styles.promptHint}>
                                        {turnaroundData.turnaroundUsesRef
                                            ? `Copy this prompt and attach your reference image into ${selectedModel ? (availableModels.find(m => m.name === selectedModel)?.displayName || selectedModel) : 'your AI image tool'}, then upload the result below`
                                            : `Copy this prompt into ${selectedModel ? (availableModels.find(m => m.name === selectedModel)?.displayName || selectedModel) : 'your AI image tool'} (no reference image needed — full description included), then upload the result below`
                                        }
                                    </span>
                                    {/* Turnaround image upload slot */}
                                    {(() => {
                                        const slotKey = 'turnaround';
                                        return (
                                            <div style={{ ...styles.uploadSlot, marginTop: '6px' }}>
                                                {entityImages[slotKey] ? (
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                                            <div style={styles.uploadPreview}>
                                                                <img src={entityImages[slotKey].image_url} alt="Turnaround Sheet" style={{ ...styles.uploadImg, cursor: 'zoom-in' }} onClick={() => setLightboxSrc(entityImages[slotKey].image_url)} />
                                                                <button onClick={() => handleRemoveImage(slotKey)} style={styles.uploadRemoveBtn}><X size={10} /></button>
                                                            </div>
                                                            <button
                                                                onClick={() => handleAnalyzeImage(slotKey)}
                                                                disabled={analyzingSlot === slotKey}
                                                                style={{
                                                                    ...styles.analyzeBtn,
                                                                    opacity: analyzingSlot === slotKey ? 0.5 : 1,
                                                                    cursor: analyzingSlot === slotKey ? 'not-allowed' : 'pointer',
                                                                }}
                                                            >
                                                                {analyzingSlot === slotKey ? (
                                                                    <><Loader2 size={11} className="spin" /> Analyzing...</>
                                                                ) : analysisResults[slotKey] && !analysisResults[slotKey].error ? (
                                                                    <><Search size={11} /> Re-analyze</>
                                                                ) : (
                                                                    <><Search size={11} /> Analyze</>
                                                                )}
                                                            </button>
                                                        </div>
                                                        {renderAnalysisResults(slotKey)}
                                                    </div>
                                                ) : (
                                                    <label style={styles.uploadSlotLabel}>
                                                        {uploadingSlot === slotKey ? (
                                                            <Loader2 size={14} className="spin" color="#f59e0b" />
                                                        ) : (
                                                            <><Upload size={12} /> Upload turnaround sheet</>
                                                        )}
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            ref={el => { fileInputRefs.current[slotKey] = el; }}
                                                            onChange={() => handleImageUpload(slotKey, 'Turnaround Sheet', turnaroundData.turnaroundPrompt)}
                                                            style={{ display: 'none' }}
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </>
                            ) : null}
                        </div>
                    )}

                    {/* Optional: Single Reference Image — collapsible */}
                    <div style={{ backgroundColor: '#1f1f23', borderLeft: '3px solid #6b7280' }}>
                        <button
                            onClick={() => setRefSectionExpanded(prev => !prev)}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 12px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
                        >
                            <span style={{ fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <ImageIcon size={13} /> Optional: Single Reference Shot
                                {entityImages['reference'] && <span style={{ fontSize: '9px', color: '#10b981', marginLeft: '4px' }}>uploaded</span>}
                            </span>
                            <ChevronDown size={14} style={{ transform: refSectionExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                        </button>
                        {refSectionExpanded && (
                            <div style={{ padding: '0 12px 12px' }}>
                                <span style={{ fontSize: '10px', color: '#6b7280', fontStyle: 'italic', display: 'block', marginBottom: '8px' }}>
                                    A single hero shot of your character — useful for quick visual checks or as an attachment when generating turnarounds
                                </span>
                                <div style={styles.cardHeader}>
                                    <span style={styles.fieldLabel}>Reference Image Prompt</span>
                                    <button onClick={handleCopyPrompt} style={styles.copyBtn}>
                                        {promptCopied ? (
                                            <><Check size={12} color="#10b981" /> Copied</>
                                        ) : (
                                            <><Copy size={12} /> Copy</>
                                        )}
                                    </button>
                                </div>
                                <p style={styles.promptText}>{suggestions.referencePrompt}</p>
                                <span style={styles.promptHint}>
                                    Copy this prompt into {selectedModel ? (availableModels.find(m => m.name === selectedModel)?.displayName || selectedModel) : 'your AI image tool'} to generate a reference image
                                </span>
                                {/* Reference image upload slot */}
                                {characterId && (
                                    <div style={styles.uploadSlot}>
                                        {entityImages['reference'] ? (
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                                    <div style={styles.uploadPreview}>
                                                        <img src={entityImages['reference'].image_url} alt="Reference" style={{ ...styles.uploadImg, cursor: 'zoom-in' }} onClick={() => setLightboxSrc(entityImages['reference'].image_url)} />
                                                        <button onClick={() => handleRemoveImage('reference')} style={styles.uploadRemoveBtn}><X size={10} /></button>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <button
                                                            onClick={() => handleAnalyzeImage('reference')}
                                                            disabled={analyzingSlot === 'reference'}
                                                            style={{
                                                                ...styles.analyzeBtn,
                                                                opacity: analyzingSlot === 'reference' ? 0.5 : 1,
                                                                cursor: analyzingSlot === 'reference' ? 'not-allowed' : 'pointer',
                                                            }}
                                                        >
                                                            {analyzingSlot === 'reference' ? (
                                                                <><Loader2 size={11} className="spin" /> Analyzing...</>
                                                            ) : analysisResults['reference'] && !analysisResults['reference'].error ? (
                                                                <><Search size={11} /> Re-analyze</>
                                                            ) : (
                                                                <><Search size={11} /> Analyze</>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setRefPromptDraft(entityImages['reference'].prompt || '');
                                                                setEditingRefPrompt(prev => !prev);
                                                            }}
                                                            style={{ ...styles.copyBtn, fontSize: '9px', padding: '2px 6px', color: entityImages['reference'].prompt ? '#10b981' : '#f59e0b' }}
                                                        >
                                                            {entityImages['reference'].prompt ? 'Prompt stored' : 'Add prompt used'}
                                                        </button>
                                                    </div>
                                                </div>
                                                {editingRefPrompt && (
                                                    <div style={{ marginTop: '6px', padding: '8px', backgroundColor: '#18181b', borderRadius: '6px', border: '1px solid #3f3f46' }}>
                                                        <label style={{ fontSize: '10px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>
                                                            Paste the prompt you used to create this image (optional — helps turnaround accuracy)
                                                        </label>
                                                        <textarea
                                                            value={refPromptDraft}
                                                            onChange={(e) => setRefPromptDraft(e.target.value)}
                                                            placeholder="e.g. Cinematic still frame, front portrait of a detective..."
                                                            rows={3}
                                                            style={{
                                                                width: '100%',
                                                                padding: '6px 8px',
                                                                backgroundColor: '#27272a',
                                                                border: '1px solid #3f3f46',
                                                                borderRadius: '4px',
                                                                color: '#e5e7eb',
                                                                fontSize: '11px',
                                                                fontFamily: 'monospace',
                                                                resize: 'vertical',
                                                                outline: 'none',
                                                                boxSizing: 'border-box',
                                                            }}
                                                        />
                                                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                                                            <button
                                                                onClick={handleSaveRefPrompt}
                                                                disabled={savingRefPrompt}
                                                                style={{ ...styles.triggerBtn, fontSize: '10px', padding: '4px 10px', backgroundColor: '#059669' }}
                                                            >
                                                                {savingRefPrompt ? <Loader2 size={10} className="spin" /> : <Check size={10} />}
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingRefPrompt(false)}
                                                                style={{ ...styles.copyBtn, fontSize: '10px', padding: '4px 10px' }}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                                {renderAnalysisResults('reference')}
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                <label style={styles.uploadSlotLabel}>
                                                    {uploadingSlot === 'reference' ? (
                                                        <Loader2 size={14} className="spin" color="#8b5cf6" />
                                                    ) : (
                                                        <><Upload size={12} /> Upload generated image</>
                                                    )}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        ref={el => { fileInputRefs.current['reference'] = el; }}
                                                        onChange={() => handleImageUpload('reference', 'Reference Image', suggestions?.referencePrompt || '')}
                                                        style={{ display: 'none' }}
                                                    />
                                                </label>
                                                <label style={{ ...styles.uploadSlotLabel, borderColor: '#4b5563' }}>
                                                    {uploadingSlot === 'reference-own' ? (
                                                        <Loader2 size={14} className="spin" color="#6b7280" />
                                                    ) : (
                                                        <><ImageIcon size={12} /> Upload your own image</>
                                                    )}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        ref={el => { fileInputRefs.current['reference-own'] = el; }}
                                                        onChange={() => handleImageUpload('reference', 'Reference Image (user-provided)', '', 'reference-own')}
                                                        style={{ display: 'none' }}
                                                    />
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Consistency Tips */}
                    {suggestions.consistencyTips && suggestions.consistencyTips.length > 0 && (
                        <div style={styles.tipsContainer}>
                            <button
                                onClick={() => setTipsExpanded(prev => !prev)}
                                style={styles.tipsToggle}
                            >
                                <span style={styles.tipsToggleText}>
                                    Consistency Tips ({suggestions.consistencyTips.length})
                                </span>
                                <ChevronDown
                                    size={14}
                                    style={{
                                        transform: tipsExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.2s',
                                    }}
                                />
                            </button>
                            {tipsExpanded && (
                                <ul style={styles.tipsList}>
                                    {suggestions.consistencyTips.map((tip, index) => (
                                        <li key={index} style={styles.tipItem}>
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    {/* Conversational Refinement */}
                    <div style={{ backgroundColor: '#1f1f23', borderLeft: '3px solid #6d28d9', padding: '10px 12px' }}>
                        <button
                            onClick={() => setChatOpen(prev => !prev)}
                            style={{ ...styles.tipsToggle, padding: '0' }}
                        >
                            <span style={{ ...styles.tipsToggleText, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <MessageCircle size={13} /> Refine with AI
                            </span>
                            <ChevronDown size={14} style={{ transform: chatOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                        </button>
                        {chatOpen && (
                            <div style={{ marginTop: '10px' }}>
                                {/* Quick Actions */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                                    {quickActions.map((action, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleRefine(action)}
                                            disabled={refining}
                                            style={{
                                                padding: '3px 8px',
                                                backgroundColor: '#27272a',
                                                border: '1px solid #3f3f46',
                                                borderRadius: '4px',
                                                color: '#a78bfa',
                                                fontSize: '10px',
                                                cursor: refining ? 'not-allowed' : 'pointer',
                                                opacity: refining ? 0.5 : 1,
                                            }}
                                        >
                                            {action}
                                        </button>
                                    ))}
                                </div>
                                {/* Chat History */}
                                {chatHistory.length > 0 && (
                                    <div style={{ maxHeight: '150px', overflowY: 'auto', marginBottom: '8px', padding: '6px', backgroundColor: '#18181b', borderRadius: '4px' }}>
                                        {chatHistory.map((msg, i) => (
                                            <div key={i} style={{
                                                padding: '4px 8px',
                                                marginBottom: '4px',
                                                borderRadius: '4px',
                                                backgroundColor: msg.role === 'user' ? '#27272a' : '#1a2a2a',
                                                color: msg.role === 'user' ? '#d1d5db' : '#a7f3d0',
                                                fontSize: '11px',
                                                lineHeight: '1.4',
                                                marginLeft: msg.role === 'user' ? '20%' : '0',
                                                marginRight: msg.role === 'user' ? '0' : '20%',
                                            }}>
                                                {msg.content}
                                            </div>
                                        ))}
                                        {refining && (
                                            <div style={{ padding: '4px 8px', color: '#a78bfa', fontSize: '11px' }}>
                                                <Loader2 size={11} className="spin" style={{ display: 'inline' }} /> Refining...
                                            </div>
                                        )}
                                    </div>
                                )}
                                {/* Chat Input */}
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <input
                                        type="text"
                                        placeholder="e.g. Make hair longer, add a scar..."
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                                        disabled={refining}
                                        style={{
                                            flex: 1,
                                            padding: '6px 8px',
                                            backgroundColor: '#18181b',
                                            border: '1px solid #3f3f46',
                                            borderRadius: '4px',
                                            color: '#e5e7eb',
                                            fontSize: '12px',
                                            outline: 'none',
                                        }}
                                    />
                                    <button
                                        onClick={() => handleRefine()}
                                        disabled={!chatInput.trim() || refining}
                                        style={{
                                            padding: '6px 10px',
                                            backgroundColor: chatInput.trim() && !refining ? '#8b5cf6' : '#3f3f46',
                                            border: 'none',
                                            borderRadius: '4px',
                                            color: 'white',
                                            cursor: chatInput.trim() && !refining ? 'pointer' : 'not-allowed',
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Send size={12} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : null}
            {lightboxSrc && <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    triggerContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        padding: '16px',
        backgroundColor: '#1f1f23',
        border: '1px dashed #3f3f46',
        borderRadius: '8px',
    },
    triggerBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        backgroundColor: '#8b5cf6',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
    },
    triggerHint: {
        fontSize: '11px',
        color: '#6b7280',
        textAlign: 'center',
    },
    container: {
        backgroundColor: '#18181b',
        border: '1px solid #3f3f46',
        borderRadius: '8px',
        overflow: 'hidden',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 12px',
        borderBottom: '1px solid #3f3f46',
        backgroundColor: '#1f1f23',
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    headerTitle: {
        fontSize: '13px',
        fontWeight: 700,
        color: '#e5e7eb',
    },
    regenerateBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 10px',
        backgroundColor: '#27272a',
        border: '1px solid #3f3f46',
        borderRadius: '5px',
        color: '#a78bfa',
        fontSize: '11px',
        fontWeight: 600,
        cursor: 'pointer',
    },
    loadingState: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '28px 12px',
    },
    loadingText: {
        color: '#9ca3af',
        fontSize: '13px',
    },
    errorState: {
        textAlign: 'center',
        padding: '16px 12px',
    },
    errorText: {
        color: '#ef4444',
        fontSize: '12px',
        margin: '0 0 8px 0',
    },
    retryBtn: {
        padding: '5px 14px',
        borderRadius: '5px',
        border: '1px solid #3f3f46',
        backgroundColor: '#27272a',
        color: '#d1d5db',
        fontSize: '12px',
        cursor: 'pointer',
    },
    resultsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1px',
        backgroundColor: '#27272a',
    },
    suggestionCard: {
        backgroundColor: '#1f1f23',
        padding: '12px',
        borderLeft: '3px solid #8b5cf6',
        transition: 'border-color 0.2s',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '6px',
    },
    fieldLabel: {
        color: '#e5e7eb',
        fontSize: '12px',
        fontWeight: 700,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
    },
    appliedBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        fontSize: '11px',
        color: '#10b981',
        fontWeight: 600,
    },
    suggestionText: {
        color: '#d1d5db',
        fontSize: '13px',
        lineHeight: '1.5',
        margin: '0 0 10px 0',
    },
    applyBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '5px 12px',
        backgroundColor: '#8b5cf6',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        fontSize: '12px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'background-color 0.15s',
    },
    promptCard: {
        backgroundColor: '#1f1f23',
        padding: '12px',
        borderLeft: '3px solid #6d28d9',
    },
    promptText: {
        color: '#c4b5fd',
        fontSize: '12px',
        lineHeight: '1.5',
        margin: '0 0 6px 0',
        fontFamily: 'monospace',
        backgroundColor: '#18181b',
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #3f3f46',
        wordBreak: 'break-word' as const,
    },
    copyBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 8px',
        backgroundColor: 'transparent',
        border: '1px solid #3f3f46',
        borderRadius: '4px',
        color: '#9ca3af',
        fontSize: '11px',
        cursor: 'pointer',
    },
    promptHint: {
        fontSize: '10px',
        color: '#6b7280',
        fontStyle: 'italic',
    },
    tipsContainer: {
        backgroundColor: '#1f1f23',
        borderLeft: '3px solid #3f3f46',
    },
    tipsToggle: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '10px 12px',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: '#9ca3af',
    },
    tipsToggleText: {
        fontSize: '12px',
        fontWeight: 600,
    },
    tipsList: {
        margin: '0',
        padding: '0 12px 10px 28px',
        listStyle: 'disc',
    },
    tipItem: {
        fontSize: '12px',
        color: '#9ca3af',
        lineHeight: '1.6',
    },
    modelSelect: {
        padding: '4px 8px',
        backgroundColor: '#18181b',
        border: '1px solid #3f3f46',
        borderRadius: '4px',
        color: '#e5e7eb',
        fontSize: '11px',
        outline: 'none',
        flex: 1,
        maxWidth: '200px',
    },
    uploadSlot: {
        marginTop: '6px',
    },
    uploadSlotLabel: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 10px',
        border: '1px dashed #3f3f46',
        borderRadius: '4px',
        color: '#6b7280',
        fontSize: '10px',
        cursor: 'pointer',
    },
    uploadPreview: {
        position: 'relative' as const,
        display: 'inline-block',
        width: '80px',
        height: '80px',
        borderRadius: '4px',
        overflow: 'hidden',
        border: '1px solid #3f3f46',
    },
    uploadImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover' as const,
    },
    uploadRemoveBtn: {
        position: 'absolute' as const,
        top: '2px',
        right: '2px',
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: 'white',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: 0,
    },
    analyzeBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 8px',
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '4px',
        color: '#93c5fd',
        fontSize: '10px',
        fontWeight: 600,
        cursor: 'pointer',
        whiteSpace: 'nowrap' as const,
    },
};
