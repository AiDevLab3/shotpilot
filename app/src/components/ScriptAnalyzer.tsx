import React, { useState, useCallback, useMemo } from 'react';
import { FileText, Loader2, Check, Plus, ChevronDown, ChevronRight, Users, Film } from 'lucide-react';
import { analyzeScriptText } from '../services/api';
import type { ScriptAnalysis } from '../types/schema';

interface ScriptAnalyzerProps {
    projectId: number;
    onCreateScenes: (scenes: Array<{
        name: string;
        description: string;
        location_setting?: string;
        time_of_day?: string;
        mood_tone?: string;
        shots: Array<{
            shot_type: string;
            camera_angle?: string;
            description: string;
        }>;
    }>) => void;
    onCreateCharacters: (characters: Array<{ name: string; description: string }>) => void;
}

export const ScriptAnalyzer: React.FC<ScriptAnalyzerProps> = ({
    projectId,
    onCreateScenes,
    onCreateCharacters,
}) => {
    const [scriptText, setScriptText] = useState('');
    const [analysis, setAnalysis] = useState<ScriptAnalysis | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedScenes, setSelectedScenes] = useState<Set<number>>(new Set());
    const [expandedScenes, setExpandedScenes] = useState<Set<number>>(new Set());
    const [charactersCreated, setCharactersCreated] = useState(false);
    const [scenesCreated, setScenesCreated] = useState(false);

    const handleAnalyze = useCallback(async () => {
        if (!scriptText.trim()) return;
        setLoading(true);
        setError(null);
        setAnalysis(null);
        setCharactersCreated(false);
        setScenesCreated(false);
        try {
            const result = await analyzeScriptText(projectId, scriptText);
            setAnalysis(result);
            // Select all scenes by default
            const allIndices = new Set<number>(result.scenes.map((_, i) => i));
            setSelectedScenes(allIndices);
            // Expand the first scene by default
            if (result.scenes.length > 0) {
                setExpandedScenes(new Set([0]));
            }
        } catch (err: any) {
            setError(err.message || 'Failed to analyze script. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [projectId, scriptText]);

    const handleStartOver = useCallback(() => {
        setScriptText('');
        setAnalysis(null);
        setError(null);
        setSelectedScenes(new Set());
        setExpandedScenes(new Set());
        setCharactersCreated(false);
        setScenesCreated(false);
    }, []);

    const toggleSceneSelection = useCallback((index: number) => {
        setSelectedScenes(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    }, []);

    const toggleSelectAll = useCallback(() => {
        if (!analysis) return;
        setSelectedScenes(prev => {
            if (prev.size === analysis.scenes.length) {
                return new Set();
            }
            return new Set(analysis.scenes.map((_, i) => i));
        });
    }, [analysis]);

    const toggleSceneExpand = useCallback((index: number) => {
        setExpandedScenes(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    }, []);

    const handleCreateCharacters = useCallback(() => {
        if (!analysis) return;
        onCreateCharacters(analysis.characters);
        setCharactersCreated(true);
    }, [analysis, onCreateCharacters]);

    const handleCreateScenes = useCallback(() => {
        if (!analysis) return;
        const selected = analysis.scenes
            .filter((_, i) => selectedScenes.has(i))
            .map(scene => ({
                name: scene.name,
                description: scene.description,
                location_setting: scene.location_setting,
                time_of_day: scene.time_of_day,
                mood_tone: scene.mood_tone,
                shots: scene.suggestedShots.map(shot => ({
                    shot_type: shot.shot_type,
                    camera_angle: shot.camera_angle,
                    description: shot.description,
                })),
            }));
        onCreateScenes(selected);
        setScenesCreated(true);
    }, [analysis, selectedScenes, onCreateScenes]);

    const selectedCount = useMemo(() => selectedScenes.size, [selectedScenes]);

    // ---------- Input Area ----------
    if (!analysis && !loading && !error) {
        return (
            <div style={styles.container}>
                <div style={styles.headerSection}>
                    <div style={styles.headerRow}>
                        <FileText size={24} color="#8b5cf6" />
                        <h2 style={styles.heading}>Script Analyzer</h2>
                    </div>
                    <p style={styles.subheading}>
                        Paste your screenplay text below. AI will extract scenes, shots, and characters automatically.
                    </p>
                </div>

                <div style={styles.inputSection}>
                    <textarea
                        value={scriptText}
                        onChange={e => setScriptText(e.target.value)}
                        placeholder="Paste your script here... (supports plain text screenplay format)"
                        style={styles.textarea}
                        spellCheck={false}
                    />
                    <div style={styles.inputFooter}>
                        <span style={styles.charCount}>
                            {scriptText.length.toLocaleString()} characters
                        </span>
                        <button
                            onClick={handleAnalyze}
                            disabled={!scriptText.trim()}
                            style={{
                                ...styles.analyzeBtn,
                                opacity: scriptText.trim() ? 1 : 0.5,
                                cursor: scriptText.trim() ? 'pointer' : 'not-allowed',
                            }}
                        >
                            <FileText size={16} />
                            Analyze Script
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ---------- Loading State ----------
    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.headerSection}>
                    <div style={styles.headerRow}>
                        <FileText size={24} color="#8b5cf6" />
                        <h2 style={styles.heading}>Script Analyzer</h2>
                    </div>
                </div>
                <div style={styles.loadingContainer}>
                    <Loader2 size={32} color="#8b5cf6" style={styles.spinner} />
                    <p style={styles.loadingText}>Analyzing script...</p>
                    <p style={styles.loadingSubtext}>This may take 10-20 seconds</p>
                </div>
            </div>
        );
    }

    // ---------- Error State ----------
    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.headerSection}>
                    <div style={styles.headerRow}>
                        <FileText size={24} color="#8b5cf6" />
                        <h2 style={styles.heading}>Script Analyzer</h2>
                    </div>
                </div>
                <div style={styles.errorContainer}>
                    <p style={styles.errorText}>{error}</p>
                    <div style={styles.errorActions}>
                        <button onClick={handleAnalyze} style={styles.retryBtn}>
                            Retry Analysis
                        </button>
                        <button onClick={handleStartOver} style={styles.startOverBtnSecondary}>
                            Start Over
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ---------- Results View ----------
    if (!analysis) return null;

    const allSelected = selectedCount === analysis.scenes.length;

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.headerSection}>
                <div style={styles.headerRowSpaced}>
                    <div style={styles.headerRow}>
                        <FileText size={24} color="#8b5cf6" />
                        <h2 style={styles.heading}>Script Analysis Results</h2>
                    </div>
                    <button onClick={handleStartOver} style={styles.startOverBtn}>
                        Start Over
                    </button>
                </div>
            </div>

            {/* Summary */}
            <div style={styles.summarySection}>
                <h3 style={styles.sectionTitle}>Summary</h3>
                <p style={styles.summaryText}>{analysis.summary}</p>
                <div style={styles.statsRow}>
                    <span style={styles.statBadge}>
                        <Film size={14} />
                        {analysis.scenes.length} scene{analysis.scenes.length !== 1 ? 's' : ''}
                    </span>
                    <span style={styles.statBadge}>
                        <Users size={14} />
                        {analysis.characters.length} character{analysis.characters.length !== 1 ? 's' : ''}
                    </span>
                    <span style={styles.statBadge}>
                        {analysis.scenes.reduce((sum, s) => sum + s.suggestedShots.length, 0)} suggested shots
                    </span>
                </div>
            </div>

            {/* Characters Section */}
            {analysis.characters.length > 0 && (
                <div style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <div style={styles.sectionHeaderLeft}>
                            <Users size={18} color="#8b5cf6" />
                            <h3 style={styles.sectionTitle}>Characters Found</h3>
                            <span style={styles.countBadge}>{analysis.characters.length}</span>
                        </div>
                        <button
                            onClick={handleCreateCharacters}
                            disabled={charactersCreated}
                            style={{
                                ...styles.createBtn,
                                backgroundColor: charactersCreated ? '#065f46' : '#8b5cf6',
                                cursor: charactersCreated ? 'default' : 'pointer',
                                opacity: charactersCreated ? 0.8 : 1,
                            }}
                        >
                            {charactersCreated ? (
                                <>
                                    <Check size={14} />
                                    Characters Created
                                </>
                            ) : (
                                <>
                                    <Plus size={14} />
                                    Create All Characters
                                </>
                            )}
                        </button>
                    </div>
                    <div style={styles.characterList}>
                        {analysis.characters.map((char, i) => (
                            <div key={i} style={styles.characterCard}>
                                <span style={styles.characterName}>{char.name}</span>
                                <span style={styles.characterDesc}>{char.description}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Scenes Section */}
            {analysis.scenes.length > 0 && (
                <div style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <div style={styles.sectionHeaderLeft}>
                            <Film size={18} color="#8b5cf6" />
                            <h3 style={styles.sectionTitle}>Scenes Found</h3>
                            <span style={styles.countBadge}>{analysis.scenes.length}</span>
                        </div>
                        <button onClick={toggleSelectAll} style={styles.selectAllBtn}>
                            {allSelected ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>

                    <div style={styles.sceneList}>
                        {analysis.scenes.map((scene, index) => {
                            const isSelected = selectedScenes.has(index);
                            const isExpanded = expandedScenes.has(index);

                            return (
                                <div
                                    key={index}
                                    style={{
                                        ...styles.sceneCard,
                                        borderColor: isSelected ? '#8b5cf655' : '#3f3f46',
                                    }}
                                >
                                    <div style={styles.sceneCardHeader}>
                                        <div style={styles.sceneCardLeft}>
                                            {/* Checkbox */}
                                            <div
                                                onClick={() => toggleSceneSelection(index)}
                                                style={{
                                                    ...styles.checkbox,
                                                    backgroundColor: isSelected ? '#8b5cf6' : 'transparent',
                                                    borderColor: isSelected ? '#8b5cf6' : '#52525b',
                                                }}
                                            >
                                                {isSelected && <Check size={12} color="#fff" />}
                                            </div>
                                            {/* Expand toggle */}
                                            <div
                                                onClick={() => toggleSceneExpand(index)}
                                                style={styles.expandToggle}
                                            >
                                                {isExpanded
                                                    ? <ChevronDown size={16} color="#9ca3af" />
                                                    : <ChevronRight size={16} color="#9ca3af" />
                                                }
                                            </div>
                                            <div style={styles.sceneInfo}>
                                                <span style={styles.sceneName}>{scene.name}</span>
                                                <span style={styles.sceneDesc}>{scene.description}</span>
                                            </div>
                                        </div>
                                        <span style={styles.shotCountBadge}>
                                            {scene.suggestedShots.length} shot{scene.suggestedShots.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    {/* Scene metadata tags */}
                                    {(scene.location_setting || scene.time_of_day || scene.mood_tone) && (
                                        <div style={styles.sceneTags}>
                                            {scene.location_setting && (
                                                <span style={styles.tag}>
                                                    {scene.location_setting}
                                                </span>
                                            )}
                                            {scene.time_of_day && (
                                                <span style={styles.tag}>
                                                    {scene.time_of_day}
                                                </span>
                                            )}
                                            {scene.mood_tone && (
                                                <span style={styles.tagMood}>
                                                    {scene.mood_tone}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Expanded shots list */}
                                    {isExpanded && scene.suggestedShots.length > 0 && (
                                        <div style={styles.shotsContainer}>
                                            <div style={styles.shotsHeader}>
                                                Suggested Shots
                                            </div>
                                            {scene.suggestedShots.map((shot, sIndex) => (
                                                <div key={sIndex} style={styles.shotRow}>
                                                    <div style={styles.shotNumber}>
                                                        {sIndex + 1}
                                                    </div>
                                                    <div style={styles.shotDetails}>
                                                        <div style={styles.shotTopRow}>
                                                            <span style={styles.shotType}>
                                                                {shot.shot_type}
                                                            </span>
                                                            {shot.camera_angle && (
                                                                <span style={styles.shotAngle}>
                                                                    {shot.camera_angle}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span style={styles.shotDesc}>
                                                            {shot.description}
                                                        </span>
                                                        {shot.purpose && (
                                                            <span style={styles.shotPurpose}>
                                                                Purpose: {shot.purpose}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Footer actions */}
            <div style={styles.footer}>
                <div style={styles.footerInfo}>
                    {selectedCount} of {analysis.scenes.length} scene{analysis.scenes.length !== 1 ? 's' : ''} selected
                </div>
                <button
                    onClick={handleCreateScenes}
                    disabled={selectedCount === 0 || scenesCreated}
                    style={{
                        ...styles.createScenesBtn,
                        opacity: (selectedCount === 0 || scenesCreated) ? 0.5 : 1,
                        cursor: (selectedCount === 0 || scenesCreated) ? 'not-allowed' : 'pointer',
                        backgroundColor: scenesCreated ? '#065f46' : '#8b5cf6',
                    }}
                >
                    {scenesCreated ? (
                        <>
                            <Check size={16} />
                            Scenes & Shots Created
                        </>
                    ) : (
                        <>
                            <Plus size={16} />
                            Create Selected Scenes & Shots
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

// ---------- Inline Styles ----------

const styles: Record<string, React.CSSProperties> = {
    container: {
        backgroundColor: '#18181b',
        borderRadius: '12px',
        border: '1px solid #3f3f46',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
    },

    // Header
    headerSection: {
        padding: '24px 24px 16px 24px',
        borderBottom: '1px solid #3f3f46',
        backgroundColor: '#1f1f23',
    },
    headerRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    headerRowSpaced: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    heading: {
        margin: 0,
        fontSize: '20px',
        fontWeight: 700,
        color: '#e5e7eb',
    },
    subheading: {
        margin: '8px 0 0 0',
        fontSize: '14px',
        color: '#9ca3af',
        lineHeight: '1.5',
    },

    // Input area
    inputSection: {
        padding: '24px',
    },
    textarea: {
        width: '100%',
        minHeight: '300px',
        padding: '16px',
        backgroundColor: '#27272a',
        border: '1px solid #3f3f46',
        borderRadius: '8px',
        color: '#e5e7eb',
        fontSize: '14px',
        fontFamily: "'Courier New', Courier, monospace",
        lineHeight: '1.6',
        resize: 'vertical' as const,
        outline: 'none',
        boxSizing: 'border-box' as const,
    },
    inputFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '12px',
    },
    charCount: {
        fontSize: '13px',
        color: '#6b7280',
    },
    analyzeBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 24px',
        backgroundColor: '#8b5cf6',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 600,
    },

    // Loading
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 24px',
        gap: '12px',
    },
    spinner: {
        animation: 'spin 1s linear infinite',
    },
    loadingText: {
        margin: 0,
        fontSize: '16px',
        fontWeight: 600,
        color: '#e5e7eb',
    },
    loadingSubtext: {
        margin: 0,
        fontSize: '13px',
        color: '#6b7280',
    },

    // Error
    errorContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '48px 24px',
        gap: '16px',
    },
    errorText: {
        margin: 0,
        fontSize: '14px',
        color: '#ef4444',
        textAlign: 'center',
    },
    errorActions: {
        display: 'flex',
        gap: '12px',
    },
    retryBtn: {
        padding: '8px 20px',
        backgroundColor: '#8b5cf6',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
    },
    startOverBtnSecondary: {
        padding: '8px 20px',
        backgroundColor: '#27272a',
        color: '#d1d5db',
        border: '1px solid #3f3f46',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: 500,
        cursor: 'pointer',
    },

    // Start Over button (results view)
    startOverBtn: {
        padding: '8px 16px',
        backgroundColor: '#27272a',
        color: '#d1d5db',
        border: '1px solid #3f3f46',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: 500,
        cursor: 'pointer',
    },

    // Summary
    summarySection: {
        padding: '20px 24px',
        borderBottom: '1px solid #3f3f46',
        backgroundColor: '#1f1f23',
    },
    summaryText: {
        margin: '8px 0 12px 0',
        fontSize: '14px',
        color: '#d1d5db',
        lineHeight: '1.6',
    },
    statsRow: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap' as const,
    },
    statBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        backgroundColor: '#27272a',
        border: '1px solid #3f3f46',
        borderRadius: '20px',
        fontSize: '12px',
        color: '#9ca3af',
        fontWeight: 500,
    },

    // Sections (Characters, Scenes)
    section: {
        borderBottom: '1px solid #3f3f46',
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        backgroundColor: '#1f1f23',
        borderBottom: '1px solid #3f3f46',
    },
    sectionHeaderLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    sectionTitle: {
        margin: 0,
        fontSize: '15px',
        fontWeight: 700,
        color: '#e5e7eb',
    },
    countBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '22px',
        height: '22px',
        padding: '0 6px',
        backgroundColor: '#3f3f46',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 600,
        color: '#d1d5db',
    },
    createBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: 600,
    },

    // Character list
    characterList: {
        padding: '16px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    characterCard: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        padding: '12px 16px',
        backgroundColor: '#27272a',
        borderRadius: '8px',
        border: '1px solid #3f3f46',
    },
    characterName: {
        fontSize: '14px',
        fontWeight: 600,
        color: '#e5e7eb',
    },
    characterDesc: {
        fontSize: '13px',
        color: '#9ca3af',
        lineHeight: '1.4',
    },

    // Select All button
    selectAllBtn: {
        padding: '6px 14px',
        backgroundColor: '#27272a',
        color: '#d1d5db',
        border: '1px solid #3f3f46',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 500,
        cursor: 'pointer',
    },

    // Scene list
    sceneList: {
        padding: '16px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    sceneCard: {
        backgroundColor: '#27272a',
        borderRadius: '8px',
        border: '1px solid #3f3f46',
        overflow: 'hidden',
        transition: 'border-color 0.15s',
    },
    sceneCardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '14px 16px',
        gap: '12px',
    },
    sceneCardLeft: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        flex: 1,
        minWidth: 0,
    },
    checkbox: {
        width: '20px',
        height: '20px',
        minWidth: '20px',
        borderRadius: '4px',
        border: '2px solid #52525b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        marginTop: '2px',
        transition: 'all 0.15s',
    },
    expandToggle: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: '2px',
        marginTop: '1px',
        flexShrink: 0,
    },
    sceneInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        minWidth: 0,
        flex: 1,
    },
    sceneName: {
        fontSize: '14px',
        fontWeight: 600,
        color: '#e5e7eb',
    },
    sceneDesc: {
        fontSize: '13px',
        color: '#9ca3af',
        lineHeight: '1.4',
    },
    shotCountBadge: {
        flexShrink: 0,
        padding: '4px 10px',
        backgroundColor: '#3f3f46',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 500,
        color: '#d1d5db',
        whiteSpace: 'nowrap' as const,
        marginTop: '2px',
    },

    // Scene metadata tags
    sceneTags: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap' as const,
        padding: '0 16px 12px 62px',
    },
    tag: {
        display: 'inline-block',
        padding: '3px 10px',
        backgroundColor: '#1f1f23',
        border: '1px solid #3f3f46',
        borderRadius: '4px',
        fontSize: '11px',
        color: '#9ca3af',
    },
    tagMood: {
        display: 'inline-block',
        padding: '3px 10px',
        backgroundColor: '#1f1f23',
        border: '1px solid #8b5cf633',
        borderRadius: '4px',
        fontSize: '11px',
        color: '#c4b5fd',
        fontStyle: 'italic',
    },

    // Shots (expanded)
    shotsContainer: {
        margin: '0 16px 14px 62px',
        backgroundColor: '#1f1f23',
        borderRadius: '8px',
        border: '1px solid #3f3f46',
        overflow: 'hidden',
    },
    shotsHeader: {
        padding: '8px 14px',
        fontSize: '12px',
        fontWeight: 600,
        color: '#6b7280',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        borderBottom: '1px solid #3f3f46',
        backgroundColor: '#18181b',
    },
    shotRow: {
        display: 'flex',
        gap: '12px',
        padding: '10px 14px',
        borderBottom: '1px solid #3f3f4633',
    },
    shotNumber: {
        width: '24px',
        height: '24px',
        minWidth: '24px',
        borderRadius: '50%',
        backgroundColor: '#3f3f46',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '11px',
        fontWeight: 700,
        color: '#d1d5db',
        marginTop: '1px',
    },
    shotDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        flex: 1,
        minWidth: 0,
    },
    shotTopRow: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        flexWrap: 'wrap' as const,
    },
    shotType: {
        fontSize: '12px',
        fontWeight: 600,
        color: '#c4b5fd',
        padding: '2px 8px',
        backgroundColor: '#8b5cf620',
        borderRadius: '4px',
    },
    shotAngle: {
        fontSize: '12px',
        color: '#9ca3af',
        padding: '2px 8px',
        backgroundColor: '#3f3f4680',
        borderRadius: '4px',
    },
    shotDesc: {
        fontSize: '13px',
        color: '#d1d5db',
        lineHeight: '1.4',
    },
    shotPurpose: {
        fontSize: '12px',
        color: '#6b7280',
        fontStyle: 'italic',
    },

    // Footer
    footer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        backgroundColor: '#1f1f23',
        borderTop: '1px solid #3f3f46',
    },
    footerInfo: {
        fontSize: '13px',
        color: '#9ca3af',
    },
    createScenesBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 24px',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 600,
    },
};

// Inject keyframes for spinner animation
if (typeof document !== 'undefined') {
    const styleId = 'script-analyzer-keyframes';
    if (!document.getElementById(styleId)) {
        const styleEl = document.createElement('style');
        styleEl.id = styleId;
        styleEl.textContent = `
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(styleEl);
    }
}
