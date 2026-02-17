import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2, Check, Copy, ChevronDown, Send, MessageCircle, RotateCw, HelpCircle, Upload, X, Clock, Image as ImageIcon, Search, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { CharacterSuggestions, AIModel } from '../types/schema';
import { getCharacterSuggestions, getAvailableModels, refineContent, getLatestGeneration, saveGeneration, getGenerations, getEntityImages, saveEntityImage, deleteEntityImage, fileToBase64, analyzeEntityImage } from '../services/api';

interface CharacterAIAssistantProps {
    projectId: number;
    characterId?: number;
    characterName: string;
    currentDescription?: string;
    currentPersonality?: string;
    onAcceptDescription: (description: string) => void;
    onAcceptPersonality: (personality: string) => void;
}

export const CharacterAIAssistant: React.FC<CharacterAIAssistantProps> = ({
    projectId,
    characterId,
    characterName,
    currentDescription,
    currentPersonality,
    onAcceptDescription,
    onAcceptPersonality,
}) => {
    const [suggestions, setSuggestions] = useState<CharacterSuggestions | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [descriptionApplied, setDescriptionApplied] = useState(false);
    const [personalityApplied, setPersonalityApplied] = useState(false);
    const [promptCopied, setPromptCopied] = useState(false);
    const [tipsExpanded, setTipsExpanded] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
    const [refining, setRefining] = useState(false);
    const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [turnaroundCopied, setTurnaroundCopied] = useState<number | null>(null);
    const [workflowExpanded, setWorkflowExpanded] = useState(false);
    const [showEnhancePrompt, setShowEnhancePrompt] = useState(false);
    const [enhanceMode, setEnhanceMode] = useState<'idle' | 'enhanced' | 'skipped'>('idle');
    const [isEnhancing, setIsEnhancing] = useState(false);

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

    const nameIsEmpty = !characterName || characterName.trim().length === 0;
    const descriptionsAreBasic = (!currentDescription || currentDescription.trim().length < 100)
        && (!currentPersonality || currentPersonality.trim().length < 50);

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

    const handleImageUpload = async (slot: string, label: string, prompt: string) => {
        if (!characterId) return;
        const input = fileInputRefs.current[slot];
        if (!input?.files?.[0]) return;
        const file = input.files[0];
        if (file.size > 20 * 1024 * 1024) {
            alert('File is too large! Please choose an image under 20MB.');
            return;
        }
        setUploadingSlot(slot);
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
            const result = await analyzeEntityImage(img.id);
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

    const loadHistoryGeneration = (gen: any) => {
        try {
            const parsed = JSON.parse(gen.suggestions_json);
            setSuggestions(parsed);
            setHasLoaded(true);
            setActiveGenerationId(gen.id);
            setDescriptionApplied(false);
            setPersonalityApplied(false);
        } catch { /* ignore */ }
    };

    const handleGenerateClick = () => {
        // If descriptions are basic and user hasn't already enhanced or skipped, prompt them
        if (descriptionsAreBasic && enhanceMode === 'idle') {
            setShowEnhancePrompt(true);
            return;
        }
        loadFullSuggestions();
    };

    const loadEnhanceOnly = async () => {
        setShowEnhancePrompt(false);
        setLoading(true);
        setIsEnhancing(true);
        setError(null);
        try {
            const result = await getCharacterSuggestions(projectId, {
                name: characterName,
                description: currentDescription,
                personality: currentPersonality,
                descriptionOnly: true,
            });
            // Auto-apply enhanced descriptions to the form
            if (result.description) {
                onAcceptDescription(result.description);
            }
            if (result.personality) {
                onAcceptPersonality(result.personality);
            }
            setEnhanceMode('enhanced');
            setHasLoaded(false); // Stay on trigger view so user can review and then generate prompts
        } catch (err: any) {
            setError(err.message || 'Failed to enhance descriptions');
        } finally {
            setLoading(false);
            setIsEnhancing(false);
        }
    };

    const handleSkipEnhance = () => {
        setShowEnhancePrompt(false);
        setEnhanceMode('skipped');
        loadFullSuggestions();
    };

    const loadFullSuggestions = async (modelOverride?: string) => {
        setLoading(true);
        setError(null);
        setDescriptionApplied(false);
        setPersonalityApplied(false);
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

    const handleAcceptDescription = () => {
        if (suggestions) {
            onAcceptDescription(suggestions.description);
            setDescriptionApplied(true);
        }
    };

    const handleAcceptPersonality = () => {
        if (suggestions) {
            onAcceptPersonality(suggestions.personality);
            setPersonalityApplied(true);
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

    const handleCopyTurnaround = async (prompt: string, index: number) => {
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
        setTurnaroundCopied(index);
        setTimeout(() => setTurnaroundCopied(null), 2000);
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
                setDescriptionApplied(false);
                setPersonalityApplied(false);
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

        const verdictColor = analysis.verdict === 'STRONG MATCH' ? '#10b981' : analysis.verdict === 'NEEDS TWEAKS' ? '#f59e0b' : '#ef4444';
        const VerdictIcon = analysis.verdict === 'STRONG MATCH' ? CheckCircle2 : AlertTriangle;

        return (
            <div style={{ marginTop: '6px', backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '6px', overflow: 'hidden' }}>
                <button
                    onClick={() => setAnalysisExpanded(prev => ({ ...prev, [slot]: !prev[slot] }))}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '6px 8px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <VerdictIcon size={12} color={verdictColor} />
                        <span style={{ fontSize: '11px', fontWeight: 600, color: verdictColor }}>{analysis.verdict}</span>
                        <span style={{ fontSize: '10px', color: '#6b7280' }}>Score: {analysis.match_score}/100</span>
                    </div>
                    <ChevronDown size={12} style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </button>
                {isExpanded && (
                    <div style={{ padding: '8px', borderTop: '1px solid #27272a' }}>
                        {analysis.summary && (
                            <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#d1d5db', lineHeight: '1.5' }}>{analysis.summary}</p>
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
                                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#22d3ee', textTransform: 'uppercase' }}>Revised prompt</span>
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
                                <p style={{ ...styles.promptText, margin: 0, fontSize: '10px', lineHeight: '1.5' }}>{analysis.revised_prompt}</p>
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

    // Not yet loaded -- show trigger button
    if (!hasLoaded && !loading) {
        return (
            <div style={styles.triggerContainer}>
                {availableModels.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <label style={{ fontSize: '11px', color: '#9ca3af' }}>Target Model:</label>
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
                <button
                    onClick={() => handleGenerateClick()}
                    disabled={nameIsEmpty || showEnhancePrompt}
                    style={{
                        ...styles.triggerBtn,
                        opacity: nameIsEmpty || showEnhancePrompt ? 0.5 : 1,
                        cursor: nameIsEmpty || showEnhancePrompt ? 'not-allowed' : 'pointer',
                    }}
                >
                    <Sparkles size={14} />
                    {enhanceMode === 'enhanced' ? 'Generate Prompts' : 'Generate Prompt'}
                </button>
                <span style={styles.triggerHint}>
                    {nameIsEmpty
                        ? 'Enter a name first'
                        : enhanceMode === 'enhanced'
                        ? 'Descriptions enhanced — review them above, then generate prompts'
                        : 'AI will suggest description, personality, and a reference image prompt'}
                </span>

                {/* Enhance prompt dialog */}
                {showEnhancePrompt && (
                    <div style={{
                        marginTop: '8px',
                        padding: '12px',
                        backgroundColor: '#1a1a2e',
                        border: '1px solid #f59e0b',
                        borderRadius: '6px',
                        width: '100%',
                    }}>
                        <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#fbbf24', fontWeight: 600 }}>
                            Add more detail for better results
                        </p>
                        <p style={{ margin: '0 0 12px 0', fontSize: '11px', color: '#d1d5db', lineHeight: '1.5' }}>
                            The more specific your description and personality are — and the more they align with your project's visual direction — the more accurate your prompts will be. Want AI to help flesh these out? You can review and edit before generating.
                        </p>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                                onClick={loadEnhanceOnly}
                                style={{
                                    padding: '6px 14px',
                                    backgroundColor: '#f59e0b',
                                    color: '#18181b',
                                    border: 'none',
                                    borderRadius: '5px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Enhance First
                            </button>
                            <button
                                onClick={handleSkipEnhance}
                                style={{
                                    padding: '6px 14px',
                                    backgroundColor: '#27272a',
                                    color: '#9ca3af',
                                    border: '1px solid #3f3f46',
                                    borderRadius: '5px',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                }}
                            >
                                Skip, Use As-Is
                            </button>
                        </div>
                    </div>
                )}
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
                        {isEnhancing ? 'Enhancing descriptions...' : 'Generating character bible...'}
                    </span>
                </div>
            ) : error ? (
                <div style={styles.errorState}>
                    <p style={styles.errorText}>{error}</p>
                    <button onClick={() => handleGenerateClick()} style={styles.retryBtn}>
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
                                {enhanceMode !== 'enhanced' && (
                                    <li><strong>Apply</strong> the Description and Personality below to fill in your character fields</li>
                                )}
                                <li><strong>Copy</strong> each prompt and paste it into your AI image tool (e.g. Midjourney) to generate an image</li>
                                <li><strong>Upload</strong> the generated images using the upload button below each prompt</li>
                                <li>When creating shots in Scene Manager, your uploaded reference images will automatically be included for consistency</li>
                            </ol>
                        )}
                    </div>

                    {/* Description & Personality Suggestions — hidden if user already enhanced */}
                    {enhanceMode !== 'enhanced' && (
                        <>
                            <div style={{
                                ...styles.suggestionCard,
                                borderLeftColor: descriptionApplied ? '#10b981' : '#8b5cf6',
                            }}>
                                <div style={styles.cardHeader}>
                                    <span style={styles.fieldLabel}>Description</span>
                                    {descriptionApplied && (
                                        <span style={styles.appliedBadge}>
                                            <Check size={11} /> Applied
                                        </span>
                                    )}
                                </div>
                                <p style={styles.suggestionText}>{suggestions.description}</p>
                                <button
                                    onClick={handleAcceptDescription}
                                    style={{
                                        ...styles.applyBtn,
                                        backgroundColor: descriptionApplied ? '#10b981' : '#8b5cf6',
                                    }}
                                >
                                    {descriptionApplied ? (
                                        <><Check size={13} /> Applied</>
                                    ) : (
                                        'Apply'
                                    )}
                                </button>
                            </div>

                            <div style={{
                                ...styles.suggestionCard,
                                borderLeftColor: personalityApplied ? '#10b981' : '#8b5cf6',
                            }}>
                                <div style={styles.cardHeader}>
                                    <span style={styles.fieldLabel}>Personality</span>
                                    {personalityApplied && (
                                        <span style={styles.appliedBadge}>
                                            <Check size={11} /> Applied
                                        </span>
                                    )}
                                </div>
                                <p style={styles.suggestionText}>{suggestions.personality}</p>
                                <button
                                    onClick={handleAcceptPersonality}
                                    style={{
                                        ...styles.applyBtn,
                                        backgroundColor: personalityApplied ? '#10b981' : '#8b5cf6',
                                    }}
                                >
                                    {personalityApplied ? (
                                        <><Check size={13} /> Applied</>
                                    ) : (
                                        'Apply'
                                    )}
                                </button>
                            </div>
                        </>
                    )}

                    {/* Reference Prompt */}
                    <div style={styles.promptCard}>
                        <div style={styles.cardHeader}>
                            <div>
                                <span style={styles.fieldLabel}>Reference Image Prompt</span>
                                <span style={{ fontSize: '10px', color: '#a78bfa', marginLeft: '6px', fontWeight: 400 }}>Step 1</span>
                            </div>
                            <button
                                onClick={handleCopyPrompt}
                                style={styles.copyBtn}
                            >
                                {promptCopied ? (
                                    <><Check size={12} color="#10b981" /> Copied</>
                                ) : (
                                    <><Copy size={12} /> Copy</>
                                )}
                            </button>
                        </div>
                        <p style={styles.promptText}>{suggestions.referencePrompt}</p>
                        <span style={styles.promptHint}>
                            Copy this prompt into {selectedModel ? (availableModels.find(m => m.name === selectedModel)?.displayName || selectedModel) : 'your AI image tool'} to generate a master reference image, then upload the result below
                        </span>
                        {/* Reference image upload slot */}
                        {characterId && (
                            <div style={styles.uploadSlot}>
                                {entityImages['reference'] ? (
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                            <div style={styles.uploadPreview}>
                                                <img src={entityImages['reference'].image_url} alt="Reference" style={styles.uploadImg} />
                                                <button onClick={() => handleRemoveImage('reference')} style={styles.uploadRemoveBtn}><X size={10} /></button>
                                            </div>
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
                                        </div>
                                        {renderAnalysisResults('reference')}
                                    </div>
                                ) : (
                                    <label style={styles.uploadSlotLabel}>
                                        {uploadingSlot === 'reference' ? (
                                            <Loader2 size={14} className="spin" color="#8b5cf6" />
                                        ) : (
                                            <><Upload size={12} /> Upload reference image</>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            ref={el => { fileInputRefs.current['reference'] = el; }}
                                            onChange={() => handleImageUpload('reference', 'Reference Image', suggestions?.referencePrompt || '')}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Turnaround Prompts */}
                    {suggestions.turnaroundPrompts && suggestions.turnaroundPrompts.length > 0 && (
                        <div style={{ backgroundColor: '#1f1f23', padding: '12px', borderLeft: '3px solid #f59e0b' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                <RotateCw size={13} color="#f59e0b" />
                                <span style={styles.fieldLabel}>Turnaround Shots</span>
                                <span style={{ fontSize: '10px', color: '#fbbf24', fontWeight: 400 }}>Step 2</span>
                            </div>
                            <span style={{ fontSize: '10px', color: '#6b7280', fontStyle: 'italic', display: 'block', marginBottom: '8px' }}>
                                After creating your reference image, use these prompts to generate multi-angle views for character consistency across shots
                            </span>
                            {suggestions.turnaroundPrompts.map((prompt, index) => {
                                const turnaroundLabel = index === 0 ? 'Front Portrait' : index === 1 ? '3/4 Profile' : index === 2 ? 'Full Body' : `Angle ${index + 1}`;
                                const slotKey = `turnaround_${index}`;
                                return (
                                    <div key={index} style={{ marginBottom: index < suggestions.turnaroundPrompts!.length - 1 ? '10px' : '0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 600 }}>
                                                {turnaroundLabel}
                                            </span>
                                            <button
                                                onClick={() => handleCopyTurnaround(prompt, index)}
                                                style={styles.copyBtn}
                                            >
                                                {turnaroundCopied === index ? (
                                                    <><Check size={12} color="#10b981" /> Copied</>
                                                ) : (
                                                    <><Copy size={12} /> Copy</>
                                                )}
                                            </button>
                                        </div>
                                        <p style={{ ...styles.promptText, margin: '0', fontSize: '11px' }}>{prompt}</p>
                                        {/* Turnaround image upload slot */}
                                        {characterId && (
                                            <div style={{ ...styles.uploadSlot, marginTop: '4px' }}>
                                                {entityImages[slotKey] ? (
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                                            <div style={styles.uploadPreview}>
                                                                <img src={entityImages[slotKey].image_url} alt={turnaroundLabel} style={styles.uploadImg} />
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
                                                            <><Upload size={12} /> Upload {turnaroundLabel.toLowerCase()}</>
                                                        )}
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            ref={el => { fileInputRefs.current[slotKey] = el; }}
                                                            onChange={() => handleImageUpload(slotKey, turnaroundLabel, prompt)}
                                                            style={{ display: 'none' }}
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

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
