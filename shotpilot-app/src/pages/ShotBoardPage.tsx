import React, { useEffect, useState, useRef } from 'react';
import type { Project, Scene, Shot, ImageVariant } from '../types/schema';
import { getScenes, getShots, createShot, updateShot, deleteShot, updateScene, createScene, deleteScene, getAllProjects, updateProject, fileToBase64, createImageVariant, getImageVariants, deleteImageVariant, getUserCredits } from '../services/api';
import { GripVertical, Plus, Image as ImageIcon, Check, Video, Edit2, Trash2, ChevronDown, ChevronRight, FileText, Clock, Maximize2, Minimize2, Sparkles, Settings } from 'lucide-react';
import { GeneratePromptButton } from '../components/GeneratePromptButton';
import { GeneratePromptModal } from '../components/GeneratePromptModal';
import { RecommendationsDialog } from '../components/RecommendationsDialog';
import { VariantList } from '../components/VariantList';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { QualityBadge } from '../components/QualityBadge';

// Specialized Dropdown Option Component
const DropdownOption = ({
    label,
    onClick,
    isSelected,
    icon
}: {
    label: string,
    onClick: () => void,
    isSelected: boolean,
    icon: React.ReactNode
}) => {
    const [hover, setHover] = useState(false);
    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                width: '100%',
                padding: '10px 12px',
                background: isSelected ? 'rgba(59, 130, 246, 0.1)' : (hover ? '#374151' : 'transparent'),
                border: 'none',
                color: '#e5e7eb',
                fontSize: '13px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'background 150ms ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: isSelected ? '600' : '400',
            }}
        >
            {icon}
            {label}
        </button>
    );
};

const ShotBoardPage: React.FC = () => {
    const [projectId, setProjectId] = useState<number | null>(null);
    const [project, setProject] = useState<Project | null>(null);
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [shotsByScene, setShotsByScene] = useState<Record<number, Shot[]>>({});
    const [shotImages, setShotImages] = useState<Record<number, ImageVariant[]>>({});
    const [loading, setLoading] = useState(true);
    const [expandedScenes, setExpandedScenes] = useState<number[]>([]);
    const [statusFilter, setStatusFilter] = useState<'all' | 'planning' | 'in-progress' | 'complete'>('all');

    // UI State
    const [focusedSceneIndex, setFocusedSceneIndex] = useState(0);
    const sceneRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // AI & Credits State
    const [userCredits, setUserCredits] = useState<number>(0);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [generateModalShot, setGenerateModalShot] = useState<Shot | null>(null);
    const [generateModalSceneId, setGenerateModalSceneId] = useState<number | null>(null);
    const [qualityContext, setQualityContext] = useState<{ tier: string; score: number }>({ tier: 'draft', score: 0 });

    // Recommendations Dialog State
    const [isRecsDialogOpen, setIsRecsDialogOpen] = useState(false);
    const [recsMissingFields, setRecsMissingFields] = useState<any[]>([]);


    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalSceneId, setModalSceneId] = useState<number | null>(null);
    const [editingShot, setEditingShot] = useState<Shot | null>(null);
    const [insertAfterShot, setInsertAfterShot] = useState<Shot | null>(null);
    const [formData, setFormData] = useState<Partial<Shot>>({});

    // Scene Modal State
    const [isSceneModalOpen, setIsSceneModalOpen] = useState(false);
    const [editingScene, setEditingScene] = useState<Scene | null>(null);
    const [sceneFormData, setSceneFormData] = useState<Partial<Scene>>({});

    // Project Modal State
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [projectFormData, setProjectFormData] = useState<Partial<Project>>({});

    // Smart Suggestions
    const [suggestedScene, setSuggestedScene] = useState<Scene | null>(null);
    const [showSuggestion, setShowSuggestion] = useState(false);

    // Initial Load
    useEffect(() => {
        loadData();
    }, []);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdownId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const projects = await getAllProjects();
            if (projects.length > 0) {
                const pid = projects[0].id;
                setProjectId(pid);
                setProject(projects[0]);

                const fetchedScenes = await getScenes(pid);
                setScenes(fetchedScenes);

                // Load shots for ALL scenes to populate counts and ready the view
                const allShotsMap: Record<number, Shot[]> = {};
                const allImagesMap: Record<number, ImageVariant[]> = {};

                await Promise.all(fetchedScenes.map(async (scene) => {
                    try {
                        const sShots = await getShots(scene.id);
                        // Normalize status
                        const normalizedShots = sShots.map(s => ({ ...s, status: s.status || 'planning' }));
                        allShotsMap[scene.id] = normalizedShots;

                        for (const shot of sShots) {
                            const variants = await getImageVariants(shot.id);
                            allImagesMap[shot.id] = variants;
                        }
                    } catch (e) {
                        console.error(`Error loading shots for scene ${scene.id}`, e);
                        allShotsMap[scene.id] = [];
                    }
                }));

                setShotsByScene(allShotsMap);
                setShotImages(allImagesMap);

                // Auto-expand first scene
                if (fetchedScenes.length > 0) {
                    setExpandedScenes([fetchedScenes[0].id]);
                }

                // Load Credits
                try {
                    const credits = await getUserCredits();
                    setUserCredits(credits.credits);
                } catch (e) {
                    console.error("Failed to load credits", e);
                }
            }
        } catch (error) {
            console.error("Failed to load project/scenes", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleScene = (sceneId: number) => {
        setExpandedScenes(prev =>
            prev.includes(sceneId)
                ? prev.filter(id => id !== sceneId)
                : [...prev, sceneId]
        );
    };

    const expandAll = () => setExpandedScenes(scenes.map(s => s.id));
    const collapseAll = () => setExpandedScenes([]);

    const refreshSceneShots = async (sceneId: number) => {
        try {
            const fetchedShots = await getShots(sceneId);
            // Normalize status
            const normalizedShots = fetchedShots.map(s => ({ ...s, status: s.status || 'planning' }));
            setShotsByScene(prev => ({ ...prev, [sceneId]: normalizedShots }));

            // Refresh images too
            const newImages: Record<number, ImageVariant[]> = {};
            for (const shot of fetchedShots) {
                const variants = await getImageVariants(shot.id);
                newImages[shot.id] = variants;
            }
            setShotImages(prev => ({ ...prev, ...newImages }));
        } catch (error) {
            console.error("Failed to refresh scene shots", error);
        }
    };

    // Modal Handlers
    const handleOpenModal = (sceneId: number, shot?: Shot, insertRefShot?: Shot) => {
        setModalSceneId(sceneId);
        setInsertAfterShot(insertRefShot || null);

        if (shot) {
            setEditingShot(shot);
            setFormData(shot);
        } else {
            setEditingShot(null);

            // Auto number logic
            let nextNum = "1";
            if (insertRefShot) {
                const lastNum = insertRefShot.shot_number;
                const num = parseInt(lastNum);
                if (!isNaN(num)) {
                    nextNum = (num + 1).toString();
                } else {
                    nextNum = lastNum + "A";
                }
            } else {
                const existingCount = shotsByScene[sceneId]?.length || 0;
                nextNum = (existingCount + 1).toString();
            }

            setFormData({
                shot_number: nextNum,
                shot_type: 'Wide',
                camera_movement: 'Static',
                desired_duration: 5,
                generation_duration: 8
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingShot(null);
        setModalSceneId(null);
        setFormData({});
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!modalSceneId) return;
        try {
            if (editingShot) {
                await updateShot(editingShot.id, formData);
            } else {
                const payload: any = { ...formData };
                if (insertAfterShot && insertAfterShot.order_index !== undefined) {
                    payload.insertAfterOrderIndex = insertAfterShot.order_index;
                }
                await createShot(modalSceneId, payload);
            }
            handleCloseModal();
            refreshSceneShots(modalSceneId);
            checkSceneCompletion(modalSceneId);
        } catch (error: any) {
            console.error("Failed to save shot", error);
            alert(`Failed to save: ${error instanceof Error ? error.message : 'Unknown error'} `);
        }
    };

    const handleDelete = async (shotId: number, sceneId: number) => {
        if (confirm('Delete this shot?')) {
            await deleteShot(shotId);
            refreshSceneShots(sceneId);
        }
    };

    const handleFileUpload = async (shotId: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                if (file.size > 20 * 1024 * 1024) {
                    alert("File is too large! Please choose an image under 20MB.");
                    return;
                }
                const base64 = await fileToBase64(file);
                await createImageVariant(shotId, base64, 'Manual Upload');

                const variants = await getImageVariants(shotId);
                setShotImages(prev => ({ ...prev, [shotId]: variants }));
            } catch (error: any) {
                console.error("Failed to upload image", error);
                alert(`Failed to upload: ${error instanceof Error ? error.message : 'Unknown error'} `);
            }
        }
    };

    const handleDeleteImage = async (imageId: number, shotId: number) => {
        if (confirm("Delete this image?")) {
            await deleteImageVariant(imageId);
            const variants = await getImageVariants(shotId);
            setShotImages(prev => ({ ...prev, [shotId]: variants }));
        }
    };

    const getFilteredShots = (sceneShots: Shot[]) => {
        if (statusFilter === 'all') return sceneShots;
        return sceneShots.filter(s => s.status === statusFilter);
    };

    const filteredScenes = statusFilter === 'all'
        ? scenes
        : scenes.filter(scene => {
            const shots = shotsByScene[scene.id] || [];
            return shots.some(s => s.status === statusFilter);
        });

    const checkSceneCompletion = (sceneId: number) => {
        const scene = scenes.find(s => s.id === sceneId);
        if (!scene || scene.status === 'complete') return;

        const shots = shotsByScene[sceneId] || [];
        if (shots.length > 0 && shots.every(s => s.status === 'complete')) {
            setSuggestedScene(scene);
            setShowSuggestion(true);
        }
    };

    const acceptSuggestion = async () => {
        if (!suggestedScene) return;
        try {
            await updateScene(suggestedScene.id, { status: 'complete' });
            setScenes(prev => prev.map(s => s.id === suggestedScene.id ? { ...s, status: 'complete' } : s));
            setShowSuggestion(false);
            setSuggestedScene(null);
        } catch (error) {
            console.error("Failed to accept suggestion", error);
        }
    };

    const dismissSuggestion = () => {
        setShowSuggestion(false);
        setSuggestedScene(null);
    };

    const handleOpenSceneModal = (scene: Scene | null, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setEditingScene(scene);
        if (scene) {
            setSceneFormData(scene);
        } else {
            const nextIndex = scenes.length > 0 ? Math.max(...scenes.map(s => s.order_index)) + 1 : 1;
            setSceneFormData({
                name: `Scene ${nextIndex} `,
                order_index: nextIndex,
                status: 'planning',
                description: ''
            });
        }
        setIsSceneModalOpen(true);
    };

    const handleCloseSceneModal = () => {
        setIsSceneModalOpen(false);
        setEditingScene(null);
        setSceneFormData({});
    };

    const handleSceneFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSceneFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveScene = async () => {
        try {
            if (editingScene) {
                await updateScene(editingScene.id, sceneFormData);
                setScenes(prev => prev.map(s => s.id === editingScene.id ? { ...s, ...sceneFormData } : s));
            } else if (projectId) {
                await createScene(projectId, sceneFormData);
                loadData();
            }
            handleCloseSceneModal();
        } catch (error) {
            console.error("Failed to save scene", error);
        }
    };

    const handleOpenProjectModal = () => {
        if (project) {
            setProjectFormData({ style_aesthetic: project.style_aesthetic || '' });
        }
        setIsProjectModalOpen(true);
    };

    const handleCloseProjectModal = () => {
        setIsProjectModalOpen(false);
        setProjectFormData({});
    };

    const handleProjectFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProjectFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProject = async () => {
        if (!projectId) return;
        try {
            await updateProject(projectId, projectFormData);
            setProject(prev => prev ? { ...prev, ...projectFormData } : prev);
            handleCloseProjectModal();
        } catch (error) {
            console.error("Failed to save project", error);
        }
    };

    const handleDeleteScene = async (sceneId: number) => {
        if (confirm('Delete this scene and all its shots?')) {
            try {
                await deleteScene(sceneId);
                setScenes(prev => prev.filter(s => s.id !== sceneId));
            } catch (err) { console.error(err); }
        }
    };

    const handleQualityCheck = (shot: Shot, sceneId: number, result: any) => {
        const score = result.percentage ?? result.score ?? 0;
        const tier = result.tier || 'draft';
        setQualityContext({ tier, score });
        setGenerateModalShot(shot);
        setGenerateModalSceneId(sceneId);

        if (tier === 'production') {
            setIsGenerateModalOpen(true);
        } else {
            // Draft tier — show recommendations dialog
            setRecsMissingFields(result.allMissing || []);
            setIsRecsDialogOpen(true);
        }
    };

    const handleRecsClose = () => {
        setIsRecsDialogOpen(false);
    };

    const handleRecsSkipGenerate = () => {
        setIsRecsDialogOpen(false);
        setIsGenerateModalOpen(true);
    };

    const handleRecsSaveAndGenerate = async () => {
        setIsRecsDialogOpen(false);
        // Refresh the shot data in local state after fields were saved
        if (generateModalSceneId) {
            await refreshSceneShots(generateModalSceneId);
        }
        setIsGenerateModalOpen(true);
    };

    const handleGenerateModalClose = () => {
        setIsGenerateModalOpen(false);
        setGenerateModalShot(null);
        setGenerateModalSceneId(null);
    };

    const handleVariantGenerated = async () => {
        if (generateModalShot && generateModalSceneId) {
            const variants = await getImageVariants(generateModalShot.id);
            setShotImages(prev => ({ ...prev, [generateModalShot.id]: variants }));
        }
        try {
            const credits = await getUserCredits();
            setUserCredits(credits.credits);
        } catch { /* CreditBadge event handles this too */ }
    };

    const styles = {
        container: { display: 'flex', flexDirection: 'column' as const, height: '100%', backgroundColor: '#0A0E14', color: '#E8E8E8', fontFamily: 'sans-serif', overflow: 'hidden' },
        actionBar: { padding: '16px 32px', backgroundColor: '#0A0E14', borderBottom: '1px solid #1E2530', display: 'flex', justifyContent: 'flex-end', gap: '12px' },
        actionButton: { backgroundColor: '#1E2530', color: '#9ca3af', border: '1px solid #27272a', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' },
        scrollArea: { flex: 1, overflowY: 'auto' as const, padding: '24px 32px' },
        sceneAccordion: { marginBottom: '16px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #1E2530', backgroundColor: '#151A21', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' },
        sceneAccordionFocused: { border: '1px solid #3B82F6', boxShadow: '0 0 0 1px #3B82F6' },
        sceneHeader: { display: 'flex', alignItems: 'center', padding: '12px 16px', cursor: 'pointer', transition: 'all 200ms ease', height: '48px', backgroundColor: 'transparent', borderLeft: '4px solid transparent' },
        sceneHeaderHighlight: { backgroundColor: '#1E2530' },
        sceneHeaderExpanded: { borderLeft: '4px solid #3B82F6', backgroundColor: '#1E2530' },
        sceneNumber: { backgroundColor: '#27272a', color: '#d1d5db', borderRadius: '4px', padding: '2px 8px', fontSize: '12px', fontWeight: 'bold' },
        sceneName: { fontSize: '16px', fontWeight: '600', color: '#f3f4f6' },
        shotCount: { fontSize: '12px', color: '#6b7280', marginLeft: 'auto' },
        contentArea: { padding: '16px', backgroundColor: '#0A0E14', borderTop: '1px solid #1E2530', transition: 'height 0.3s ease' },
        grid: { display: 'flex', flexWrap: 'wrap' as const, gap: '16px', marginBottom: '24px', alignItems: 'center' },
        card: { backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' as const, width: '280px', flexShrink: 0 },
        cardHeader: { padding: '12px 16px', backgroundColor: '#27272a', borderBottom: '1px solid #18181b', display: 'flex', justifyContent: 'space-between' },
        cardBody: { padding: '16px' },
        shotBadge: { backgroundColor: '#3f3f46', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
        shotType: { color: '#60a5fa', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' as const },
        cardImage: { aspectRatio: '16/9', backgroundColor: '#000', position: 'relative' as const, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '12px', borderRadius: '6px', overflow: 'hidden' },
        cardActions: { padding: '12px 16px', borderTop: '1px solid #27272a', display: 'flex', justifyContent: 'flex-end', gap: '8px' },
        modalOverlay: { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
        modal: { backgroundColor: '#18181b', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '500px', border: '1px solid #27272a', maxHeight: '85vh', overflowY: 'auto' as const },
        formGroup: { marginBottom: '16px' },
        input: { width: '100%', backgroundColor: '#27272a', border: '1px solid #3f3f46', padding: '8px', color: 'white', borderRadius: '6px' },
        select: { width: '100%', backgroundColor: '#27272a', border: '1px solid #3f3f46', padding: '8px', color: 'white', borderRadius: '6px' },
        inlineAddBtn: { minWidth: '40px', alignSelf: 'stretch', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px dashed #3f3f46', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#9ca3af', transition: 'all 0.2s' },
        chevron: { color: '#9ca3af', width: '20px', height: '20px' }
    };

    if (loading) return <div style={{ padding: '32px', color: 'white' }}>Loading Shot Board...</div>;
    if (!projectId) return <div style={{ padding: '32px', color: 'white' }}>No project found. Create a project first.</div>;

    return (
        <ErrorBoundary onReset={loadData}>
            <div style={styles.container}>
                <div style={styles.actionBar}>
                    <button
                        style={{ ...styles.actionButton, backgroundColor: '#2563eb', color: 'white', border: 'none' }}
                        onClick={() => handleOpenSceneModal(null)}
                    >
                        <Plus size={16} /> Add Scene
                    </button>
                    <button
                        style={styles.actionButton}
                        onClick={handleOpenProjectModal}
                    >
                        <Settings size={16} /> Project Settings
                    </button>
                    <div style={{ flex: 1 }}></div>
                    <button style={styles.actionButton} onClick={expandAll}>
                        <Maximize2 size={16} /> Expand All
                    </button>
                    <button style={styles.actionButton} onClick={collapseAll}>
                        <Minimize2 size={16} /> Collapse All
                    </button>
                    <div style={{ ...styles.actionButton, color: '#fbbf24', border: '1px solid #f59e0b' }}>
                        <Sparkles size={16} /> {userCredits} Credits
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 32px 16px', borderBottom: '1px solid #1E2530' }}>
                    <label style={{ fontSize: '14px', color: '#e5e7eb', fontWeight: '500' }}>Show:</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        style={{ height: '36px', padding: '0 12px', background: '#27272a', border: '1px solid #52525b', borderRadius: '4px', color: '#e5e7eb', fontSize: '14px', cursor: 'pointer' }}
                    >
                        <option value="all">All</option>
                        <option value="planning">Planning</option>
                        <option value="in-progress">In Progress</option>
                        <option value="complete">Complete</option>
                    </select>
                </div>

                <div style={styles.scrollArea}>
                    {filteredScenes.map((scene, index) => {
                        const isExpanded = expandedScenes.includes(scene.id);
                        const isFocused = focusedSceneIndex === index;
                        const sceneShots = shotsByScene[scene.id] || [];

                        const totalShots = sceneShots.length;
                        const completedShots = sceneShots.filter(s => s.status === 'complete').length;
                        const progressPct = totalShots > 0 ? (completedShots / totalShots) * 100 : 0;

                        return (
                            <div key={scene.id}
                                style={{
                                    ...styles.sceneAccordion,
                                    ...(isFocused ? styles.sceneAccordionFocused : {})
                                }}
                                ref={el => { sceneRefs.current[index] = el; }}
                                tabIndex={-1}
                            >
                                <div
                                    style={{
                                        ...styles.sceneHeader,
                                        ...((isFocused || isExpanded) ? styles.sceneHeaderHighlight : {}),
                                        ...(isExpanded ? styles.sceneHeaderExpanded : {}),
                                        flexDirection: 'column',
                                        alignItems: 'stretch',
                                        gap: '0',
                                        padding: '0'
                                    }}
                                    onClick={() => {
                                        setFocusedSceneIndex(index);
                                        toggleScene(scene.id);
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: '12px' }}>
                                        {isExpanded ? <ChevronDown style={styles.chevron} /> : <ChevronRight style={styles.chevron} />}
                                        <span style={styles.sceneNumber}>{scene.order_index}.</span>
                                        <span style={styles.sceneName}>{scene.name}</span>

                                        <div style={{ position: 'relative' }} ref={activeDropdownId === `scene-${scene.id}` ? dropdownRef : null}>
                                            <button
                                                className={`status-badge status-${scene.status || 'planning'}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveDropdownId(activeDropdownId === `scene-${scene.id}` ? null : `scene-${scene.id}`);
                                                }}
                                                title="Click to toggle status"
                                            >
                                                {scene.status === 'planning' ? '📝 Planning' : scene.status === 'in-progress' ? '🎬 In Progress' : '✅ Complete'}
                                                <span style={{ fontSize: '10px', opacity: 0.8, marginLeft: '2px' }}>▼</span>
                                            </button>

                                            {activeDropdownId === `scene-${scene.id}` && (
                                                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, background: '#1f2937', border: '1px solid #374151', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 100, minWidth: '140px', overflow: 'hidden' }}>
                                                    <DropdownOption label="Planning" isSelected={scene.status === 'planning'} onClick={async () => { setActiveDropdownId(null); await updateScene(scene.id, { status: 'planning' }); setScenes(prev => prev.map(s => s.id === scene.id ? { ...s, status: 'planning' } : s)); }} icon={<FileText size={14} />} />
                                                    <DropdownOption label="In Progress" isSelected={scene.status === 'in-progress'} onClick={async () => { setActiveDropdownId(null); await updateScene(scene.id, { status: 'in-progress' }); setScenes(prev => prev.map(s => s.id === scene.id ? { ...s, status: 'in-progress' } : s)); }} icon={<Clock size={14} />} />
                                                    <DropdownOption label="Complete" isSelected={scene.status === 'complete'} onClick={async () => {
                                                        setActiveDropdownId(null);
                                                        await updateScene(scene.id, { status: 'complete' });

                                                        // Sync: Mark all shots complete
                                                        const sShots = shotsByScene[scene.id] || [];
                                                        const updatedShots = sShots.map(s => ({ ...s, status: 'complete' as const }));
                                                        setShotsByScene(prev => ({ ...prev, [scene.id]: updatedShots }));
                                                        sShots.forEach(s => updateShot(s.id, { status: 'complete' }).catch(e => console.error(e)));

                                                        setScenes(prev => prev.map(s => s.id === scene.id ? { ...s, status: 'complete' } : s));
                                                    }} icon={<Check size={14} />} />
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={styles.shotCount}>{sceneShots.length} shots</span>
                                            <button onClick={(e) => handleOpenSceneModal(scene, e)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px' }} title="Edit Scene"><Edit2 size={14} /></button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteScene(scene.id); }} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px' }} title="Delete Scene"><Trash2 size={14} /></button>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div style={{ padding: '0 16px 8px', background: 'transparent' }}>
                                            <div style={{ width: '100%', height: '4px', background: '#374151', borderRadius: '2px', overflow: 'hidden', marginBottom: '4px' }}>
                                                <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)', transition: 'width 300ms ease' }}></div>
                                            </div>
                                            <div style={{ fontSize: '10px', color: '#9ca3af', textAlign: 'right' }}>{completedShots}/{totalShots} complete</div>
                                        </div>
                                    )}
                                </div>

                                {isExpanded && (
                                    <div style={styles.contentArea}>
                                        <div style={styles.grid}>
                                            {sceneShots.length === 0 && (
                                                <button onClick={() => handleOpenModal(scene.id)} style={{ ...styles.card, border: '2px dashed #4b5563', background: 'rgba(55, 65, 81, 0.3)', justifyContent: 'center', alignItems: 'center', minHeight: '120px', color: '#9ca3af', cursor: 'pointer', flexDirection: 'column', gap: '12px', transition: 'all 0.2s ease', width: '100%', gridColumn: '1 / -1' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#60a5fa'; e.currentTarget.style.color = '#60a5fa'; e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#4b5563'; e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'rgba(55, 65, 81, 0.3)'; }}>
                                                    <Plus size={32} />
                                                    <span style={{ fontSize: '14px', fontWeight: '500' }}>Add First Shot</span>
                                                </button>
                                            )}
                                            {getFilteredShots(sceneShots).map((shot) => {
                                                const allVariants = shotImages[shot.id] || [];
                                                // Only show actual uploaded images (not generated prompts which have no image_url)
                                                const imageVariants = allVariants.filter(v => v.image_url);
                                                const mainImage = imageVariants[0];
                                                const imageUrl = mainImage?.image_url || null;
                                                const currentStatus = shot.status || 'planning';
                                                const isDropdownOpen = activeDropdownId === `shot-${shot.id}`;

                                                const handleShotStatusChange = async (s: Shot, newStatus: Shot['status']) => {
                                                    setActiveDropdownId(null);
                                                    if (s.status === newStatus) return;
                                                    try {
                                                        const updatedShot = { ...s, status: newStatus };
                                                        const updatedShots = sceneShots.map(shot => shot.id === s.id ? updatedShot : shot);
                                                        setShotsByScene(prev => ({ ...prev, [scene.id]: updatedShots }));
                                                        await updateShot(s.id, { status: newStatus });
                                                        checkSceneCompletion(scene.id);

                                                        // Sync: Downgrade scene if shot is not complete
                                                        if ((newStatus === 'planning' || newStatus === 'in-progress') && scene.status === 'complete') {
                                                            await updateScene(scene.id, { status: 'in-progress' });
                                                            setScenes(prev => prev.map(sc => sc.id === scene.id ? { ...sc, status: 'in-progress' } : sc));
                                                        }
                                                    } catch (err) {
                                                        console.error("Failed to update status", err);
                                                        refreshSceneShots(scene.id);
                                                    }
                                                };

                                                // Custom Insert Button Style
                                                const insertBtnStyle: React.CSSProperties = {
                                                    width: '32px',
                                                    height: '32px', // Equal to width
                                                    alignSelf: 'center', // Center vertically
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    backgroundColor: '#18181b', // Darker background for contrast
                                                    border: '1px solid #3f3f46', // Visible border by default
                                                    color: '#9ca3af',
                                                    transition: 'all 0.2s ease',
                                                    opacity: 1, // Full opacity
                                                    margin: '0 4px'
                                                };

                                                return (
                                                    <React.Fragment key={shot.id}>
                                                        <ErrorBoundary>
                                                            <div style={styles.card}>
                                                                {/* Card Content ... (omitted for brevity, relying on replace to keep existing) */}
                                                                {/* Actually I need to reproduce the whole card without copying it, I will target the Return block. */}
                                                                <div style={styles.cardHeader}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                        <span style={styles.shotBadge}>Shot {shot.shot_number}</span>
                                                                        <QualityBadge tier={shot.quality_tier} score={shot.quality_percentage} />
                                                                    </div>
                                                                    <div style={{ position: 'relative' }} ref={isDropdownOpen ? dropdownRef : null}>
                                                                        <button
                                                                            className={`status-badge status-${currentStatus}`}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setActiveDropdownId(isDropdownOpen ? null : `shot-${shot.id}`);
                                                                            }}
                                                                            title="Click to toggle status"
                                                                        >
                                                                            {currentStatus === 'planning' ? '📝 Planning' : currentStatus === 'in-progress' ? '🎬 In Progress' : '✅ Complete'}
                                                                            <span style={{ fontSize: '10px', opacity: 0.8, marginLeft: '2px' }}>▼</span>
                                                                        </button>

                                                                        {isDropdownOpen && (
                                                                            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: '0', background: '#1f2937', border: '1px solid #374151', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 100, minWidth: '140px', overflow: 'hidden' }}>
                                                                                <DropdownOption label="Planning" isSelected={currentStatus === 'planning'} onClick={() => handleShotStatusChange(shot, 'planning')} icon={<FileText size={14} />} />
                                                                                <DropdownOption label="In Progress" isSelected={currentStatus === 'in-progress'} onClick={() => handleShotStatusChange(shot, 'in-progress')} icon={<Clock size={14} />} />
                                                                                <DropdownOption label="Complete" isSelected={currentStatus === 'complete'} onClick={() => handleShotStatusChange(shot, 'complete')} icon={<Check size={14} />} />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div style={styles.cardBody}>
                                                                    <div style={styles.cardImage}>
                                                                        {mainImage ? (
                                                                            <>
                                                                                <img src={imageUrl || ''} alt="" style={{ width: '100%', height: 'auto' }} />
                                                                                <button onClick={() => handleDeleteImage(mainImage.id, shot.id)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', padding: '4px', borderRadius: '4px', color: 'white', border: 'none', cursor: 'pointer' }}>
                                                                                    <Trash2 size={12} />
                                                                                </button>
                                                                            </>
                                                                        ) : (
                                                                            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#6b7280' }}>
                                                                                <ImageIcon size={24} />
                                                                                <span style={{ fontSize: '10px' }}>Upload</span>
                                                                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(shot.id, e)} />
                                                                            </label>
                                                                        )}
                                                                    </div>
                                                                    <div style={{ marginTop: '12px' }}>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                                            <span style={styles.shotType}>{shot.shot_type}</span>
                                                                            <span style={{ fontSize: '10px', color: '#9ca3af' }}>{shot.camera_movement}</span>
                                                                        </div>
                                                                        <div style={{ fontSize: '12px', color: '#e5e7eb', lineHeight: '1.4' }}>{shot.description || 'No description'}</div>
                                                                    </div>
                                                                    <VariantList shotId={shot.id} />
                                                                    <GeneratePromptButton
                                                                        shotId={shot.id}
                                                                        onQualityCheck={(result) => handleQualityCheck(shot, scene.id, result)}
                                                                    />
                                                                </div>
                                                                <div style={styles.cardActions}>
                                                                    <button onClick={() => handleOpenModal(scene.id, shot)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><Edit2 size={14} /></button>
                                                                    <button onClick={() => handleDelete(shot.id, scene.id)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                                                </div>
                                                            </div>

                                                            {/* Insert Button */}
                                                            <button
                                                                onClick={() => handleOpenModal(scene.id, undefined, shot)}
                                                                style={insertBtnStyle}
                                                                title="Insert Shot Here"
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.backgroundColor = '#27272a'; // Lighter on hover
                                                                    e.currentTarget.style.borderColor = '#60a5fa'; // Blue border
                                                                    e.currentTarget.style.color = '#60a5fa';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.backgroundColor = '#18181b';
                                                                    e.currentTarget.style.borderColor = '#3f3f46';
                                                                    e.currentTarget.style.color = '#9ca3af';
                                                                }}
                                                            >
                                                                <Plus size={20} />
                                                            </button>
                                                        </ErrorBoundary>
                                                    </React.Fragment>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {isModalOpen && (
                    <div style={styles.modalOverlay}>
                        <div style={styles.modal}>
                            <h2 style={{ color: 'white', marginBottom: '20px' }}>{editingShot ? `Edit Shot ${editingShot.shot_number}` : 'New Shot'}</h2>
                            <div style={styles.formGroup}>
                                <label style={{ color: '#d1d5db', display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>SHOT NUMBER</label>
                                <input name="shot_number" value={formData.shot_number || ''} onChange={handleChange} style={styles.input} />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={{ color: '#d1d5db', display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>SHOT TYPE</label>
                                <select name="shot_type" value={formData.shot_type || 'Wide'} onChange={handleChange} style={styles.select}>
                                    <option>Wide</option>
                                    <option>Medium</option>
                                    <option>Close-up</option>
                                    <option>Extreme Close-up</option>
                                </select>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={{ color: '#d1d5db', display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>MOVEMENT</label>
                                <select name="camera_movement" value={formData.camera_movement || 'Static'} onChange={handleChange} style={styles.select}>
                                    <option>Static</option>
                                    <option>Pan</option>
                                    <option>Tilt</option>
                                    <option>Dolly</option>
                                    <option>Handheld</option>
                                </select>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={{ color: '#d1d5db', display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>CAMERA ANGLE</label>
                                <select name="camera_angle" value={formData.camera_angle || ''} onChange={handleChange} style={styles.select}>
                                    <option value="">-- Select --</option>
                                    <option>Eye Level</option>
                                    <option>Low Angle</option>
                                    <option>High Angle</option>
                                    <option>Bird's Eye</option>
                                    <option>Dutch Angle</option>
                                    <option>Worm's Eye</option>
                                    <option>Over the Shoulder</option>
                                </select>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={{ color: '#d1d5db', display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>FOCAL LENGTH</label>
                                <input name="focal_length" placeholder="e.g. 50mm, 85mm, 24-70mm" value={formData.focal_length || ''} onChange={handleChange} style={styles.input} />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={{ color: '#d1d5db', display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>CAMERA LENS</label>
                                <input name="camera_lens" placeholder="e.g. ARRI Signature Prime, Cooke S4/i" value={formData.camera_lens || ''} onChange={handleChange} style={styles.input} />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={{ color: '#d1d5db', display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>DESCRIPTION</label>
                                <textarea name="description" placeholder="Action and details..." value={formData.description || ''} onChange={handleChange} style={{ ...styles.input, height: '80px', fontFamily: 'inherit' }} />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={{ color: '#d1d5db', display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>BLOCKING</label>
                                <textarea name="blocking" placeholder="Actor/subject positioning and movement..." value={formData.blocking || ''} onChange={handleChange} style={{ ...styles.input, height: '60px', fontFamily: 'inherit' }} />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={{ color: '#d1d5db', display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>VFX NOTES</label>
                                <textarea name="vfx_notes" placeholder="Green screen, CGI elements..." value={formData.vfx_notes || ''} onChange={handleChange} style={{ ...styles.input, height: '40px', fontFamily: 'inherit' }} />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={{ color: '#d1d5db', display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>SFX NOTES</label>
                                <textarea name="sfx_notes" placeholder="Footsteps, ambience..." value={formData.sfx_notes || ''} onChange={handleChange} style={{ ...styles.input, height: '40px', fontFamily: 'inherit' }} />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={{ color: '#d1d5db', display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>GENERAL NOTES</label>
                                <textarea name="notes" placeholder="Additional instructions..." value={formData.notes || ''} onChange={handleChange} style={{ ...styles.input, height: '40px', fontFamily: 'inherit' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                                <button onClick={handleCloseModal} style={{ background: 'transparent', color: '#9ca3af', border: 'none', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleSave} style={{ backgroundColor: '#2563eb', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Save</button>
                            </div>
                        </div>
                    </div>
                )}

                {isSceneModalOpen && (
                    <div style={styles.modalOverlay}>
                        <div style={styles.modal}>
                            <h2 style={{ color: 'white', marginBottom: '20px' }}>{editingScene ? 'Edit Scene' : 'Add New Scene'}</h2>
                            <div style={styles.formGroup}>
                                <label style={{ color: '#d1d5db', display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>SCENE NAME</label>
                                <input name="name" value={sceneFormData.name || ''} onChange={handleSceneFormChange} style={styles.input} />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={{ color: '#d1d5db', display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>STATUS</label>
                                <select name="status" value={sceneFormData.status || 'planning'} onChange={handleSceneFormChange} style={styles.select}>
                                    <option value="planning">📝 Planning</option>
                                    <option value="in-progress">🎬 In Progress</option>
                                    <option value="complete">✅ Complete</option>
                                </select>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={{ color: '#d1d5db', display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>DESCRIPTION</label>
                                <textarea name="description" value={sceneFormData.description || ''} onChange={handleSceneFormChange} style={{ ...styles.input, height: '100px', fontFamily: 'inherit' }} />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={{ color: '#d1d5db', display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>LOCATION / SETTING</label>
                                <input name="location_setting" placeholder="e.g. Downtown alley at night, sunlit kitchen interior" value={sceneFormData.location_setting || ''} onChange={handleSceneFormChange} style={styles.input} />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={{ color: '#d1d5db', display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>TIME OF DAY</label>
                                <select name="time_of_day" value={sceneFormData.time_of_day || ''} onChange={handleSceneFormChange} style={styles.select}>
                                    <option value="">-- Select --</option>
                                    <option>Dawn</option>
                                    <option>Morning</option>
                                    <option>Midday</option>
                                    <option>Afternoon</option>
                                    <option>Golden Hour</option>
                                    <option>Dusk / Twilight</option>
                                    <option>Night</option>
                                </select>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={{ color: '#d1d5db', display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>MOOD / TONE</label>
                                <input name="mood_tone" placeholder="e.g. Tense and suspenseful, warm and nostalgic" value={sceneFormData.mood_tone || ''} onChange={handleSceneFormChange} style={styles.input} />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={{ color: '#d1d5db', display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>LIGHTING NOTES</label>
                                <textarea name="lighting_notes" placeholder="e.g. Key light from window camera left, practical table lamp fill" value={sceneFormData.lighting_notes || ''} onChange={handleSceneFormChange} style={{ ...styles.input, height: '60px', fontFamily: 'inherit' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                                <button onClick={handleCloseSceneModal} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #3f3f46', background: 'transparent', color: '#9ca3af', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleSaveScene} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer' }}>Save</button>
                            </div>
                        </div>
                    </div>
                )}

                {isProjectModalOpen && (
                    <div style={styles.modalOverlay}>
                        <div style={styles.modal}>
                            <h2 style={{ color: 'white', marginBottom: '20px' }}>Project Settings</h2>
                            <div style={styles.formGroup}>
                                <label style={{ color: '#d1d5db', display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>STYLE / AESTHETIC</label>
                                <textarea name="style_aesthetic" placeholder="e.g. Gritty neo-noir, warm golden tones, film grain..." value={projectFormData.style_aesthetic || ''} onChange={handleProjectFormChange} style={{ ...styles.input, height: '100px', fontFamily: 'inherit' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                                <button onClick={handleCloseProjectModal} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #3f3f46', background: 'transparent', color: '#9ca3af', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleSaveProject} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer' }}>Save</button>
                            </div>
                        </div>
                    </div>
                )}

                {showSuggestion && suggestedScene && (
                    <div style={{ position: 'fixed', top: '20px', right: '20px', maxWidth: '400px', background: '#1f2937', border: '1px solid #3b82f6', borderRadius: '8px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 2000, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <span style={{ fontSize: '20px' }}>💡</span>
                            <div style={{ flex: '1' }}>
                                <strong style={{ color: '#e5e7eb', fontSize: '14px' }}>All shots complete!</strong>
                                <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>Mark "{suggestedScene.name}" as complete?</p>
                            </div>
                            <button onClick={dismissSuggestion} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '16px' }}>✕</button>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={acceptSuggestion} style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>Yes</button>
                            <button onClick={dismissSuggestion} style={{ padding: '8px 16px', background: '#374151', color: '#e5e7eb', border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>Not Yet</button>
                        </div>
                    </div>
                )}

                {generateModalShot && (
                    <RecommendationsDialog
                        isOpen={isRecsDialogOpen}
                        onClose={handleRecsClose}
                        shotId={generateModalShot.id}
                        sceneId={generateModalSceneId!}
                        qualityScore={qualityContext.score}
                        missingFields={recsMissingFields}
                        onSkipGenerate={handleRecsSkipGenerate}
                        onSaveAndGenerate={handleRecsSaveAndGenerate}
                    />
                )}

                {generateModalShot && (
                    <GeneratePromptModal
                        isOpen={isGenerateModalOpen}
                        onClose={handleGenerateModalClose}
                        shotId={generateModalShot.id}
                        shotContext={{
                            shotNumber: generateModalShot.shot_number,
                            sceneName: scenes.find(s => s.id === generateModalSceneId)?.name || '',
                            shotType: generateModalShot.shot_type || '',
                            shotDescription: generateModalShot.description || '',
                            qualityTier: qualityContext.tier,
                            qualityScore: qualityContext.score,
                        }}
                        currentCredits={userCredits}
                        onGenerated={handleVariantGenerated}
                    />
                )}
            </div>
        </ErrorBoundary>
    );
};

export default ShotBoardPage;
