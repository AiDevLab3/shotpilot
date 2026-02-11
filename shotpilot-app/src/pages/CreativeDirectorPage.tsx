import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send, Loader2, Save, FileText, Lightbulb, Check, Upload, Image, RotateCcw, ChevronDown, ChevronUp, X, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllProjects, getProject, updateProject, createProject, deleteProject, creativeDirectorChat, getAvailableModels, createCharacter } from '../services/api';
import { useCreativeDirectorStore } from '../stores/creativeDirectorStore';
import type { Message } from '../stores/creativeDirectorStore';
import type { Project } from '../types/schema';

const MAX_SCRIPT_CHARS = 50000;
const MAX_FILE_SIZE_MB = 2;

const FRAME_SIZE_OPTIONS = [
    '16:9 Widescreen',
    '9:16 Portrait',
    '1:1 Square',
    '4:3 Standard',
    '21:9 Ultrawide',
    '2.39:1 Anamorphic',
    '2.35:1 CinemaScope',
];

export const CreativeDirectorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const projectId = id ? parseInt(id) : 0;
    const navigate = useNavigate();

    // Zustand store for persistence
    const store = useCreativeDirectorStore();
    const session = store.getSession(projectId);

    const [project, setProject] = useState<Project | null>(session.projectSnapshot);
    const [loading, setLoading] = useState(!session.projectSnapshot);
    const [inputMessage, setInputMessage] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [savedNotice, setSavedNotice] = useState(false);
    const [scriptExpanded, setScriptExpanded] = useState(false);
    const [projectInfoExpanded, setProjectInfoExpanded] = useState(true);
    const [editingField, setEditingField] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState(false);
    const [availableModels, setAvailableModels] = useState<any[]>([]);
    const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastSavedRef = useRef<string>('');

    useEffect(() => {
        if (!session.projectSnapshot) loadProject();
        getAvailableModels().then(setAvailableModels).catch(() => {});
    }, [id]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [session.messages, isThinking]);

    // Periodic auto-save every 30s if project changed
    useEffect(() => {
        if (!project) return;
        const interval = setInterval(() => {
            const snapshot = JSON.stringify(project);
            if (snapshot !== lastSavedRef.current) {
                lastSavedRef.current = snapshot;
                updateProject(projectId, project).catch(err =>
                    console.error('Periodic auto-save failed:', err)
                );
            }
        }, 30000);
        return () => clearInterval(interval);
    }, [project, projectId]);

    // Save on page unload
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (project) {
                // Best-effort save via sendBeacon
                const data = JSON.stringify(project);
                navigator.sendBeacon(`/api/projects/${projectId}`, new Blob([data], { type: 'application/json' }));
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [project, projectId]);

    const loadProject = async () => {
        setLoading(true);
        try {
            let proj: Project | undefined;
            if (projectId) {
                proj = await getProject(projectId);
            } else {
                const projects = await getAllProjects();
                if (projects.length > 0) proj = projects[0];
            }
            if (proj) {
                setProject(proj);
                store.setProjectSnapshot(proj.id, proj);
                if (session.messages.length === 0) {
                    store.setMessages(proj.id, [{
                        role: 'assistant',
                        content: `Welcome to your AI Creative Director workspace for **${proj.title}**!\n\nI can see your entire project — characters, objects, scenes, and all visual direction. I'm here to help you develop everything from concept to camera-ready.\n\n**The best workflow:**\n1. Lock your script first (the narrative blueprint)\n2. Build out characters & objects\n3. Define your visual direction\n4. Plan scenes & shots\n\nDo you want to:\n- **Paste or upload a script** for me to analyze?\n- **Start from an idea** and build the vision together?\n\nWhat's your starting point?`,
                    }]);
                }
            }
        } catch (error) {
            console.error('Failed to load project', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (message: string, imageUrl?: string) => {
        if (!message.trim() || isThinking || !project) return;

        // Attach pending image if no explicit imageUrl passed
        const attachedImage = imageUrl || pendingImageUrl || undefined;
        if (pendingImageUrl) setPendingImageUrl(null);

        const userMsg: Message = { role: 'user', content: message, imageUrl: attachedImage };
        const newMessages = [...session.messages, userMsg];
        store.setMessages(projectId, newMessages);
        setInputMessage('');
        setIsThinking(true);

        // Detect mode from first user message
        let currentMode = session.mode;
        if (session.mode === 'initial') {
            const lower = message.toLowerCase();
            if (lower.includes('script') || lower.includes('paste') || lower.includes('here is') || lower.includes('int.') || lower.includes('ext.') || lower.includes('upload')) {
                currentMode = 'script-first';
                store.setMode(projectId, 'script-first');
            } else {
                currentMode = 'idea-first';
                store.setMode(projectId, 'idea-first');
            }
        }

        try {
            const history = newMessages.map(m => ({ role: m.role, content: m.content }));
            const result = await creativeDirectorChat(
                project.id,
                message,
                history,
                session.scriptContent,
                currentMode,
                attachedImage,
                session.targetModel || undefined,
            );

            // Safely apply project updates — only known string fields
            const validFields = ['title', 'purpose', 'style_aesthetic', 'atmosphere_mood',
                'lighting_directions', 'cinematography', 'frame_size', 'cinematic_references',
                'storyline_narrative'];
            if (result.projectUpdates && typeof result.projectUpdates === 'object') {
                const safeUpdates: Record<string, string> = {};
                for (const [key, val] of Object.entries(result.projectUpdates)) {
                    if (validFields.includes(key) && typeof val === 'string' && val.trim()) {
                        safeUpdates[key] = val;
                    }
                }
                if (Object.keys(safeUpdates).length > 0) {
                    const updated = { ...project, ...safeUpdates } as Project;
                    setProject(updated);
                    store.setProjectSnapshot(projectId, updated);
                    // Auto-save to database
                    updateProject(projectId, updated).catch(err =>
                        console.error('Auto-save failed:', err)
                    );
                }
            }
            if (result.scriptUpdates && typeof result.scriptUpdates === 'string') {
                store.setScriptContent(projectId, result.scriptUpdates);
            }

            const responseText = typeof result.response === 'string'
                ? result.response
                : 'I processed your request but had trouble formatting my response. Could you rephrase?';

            store.addMessage(projectId, {
                role: 'assistant',
                content: responseText,
                projectUpdates: result.projectUpdates,
                scriptUpdates: result.scriptUpdates,
                createdCharacters: result.createdCharacters,
            });
        } catch (error) {
            console.error('Creative Director error:', error);
            store.addMessage(projectId, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
            });
        } finally {
            setIsThinking(false);
        }
    };

    const handleSaveProject = async () => {
        if (!project) return;
        try {
            await updateProject(project.id, { ...project });
            setSavedNotice(true);
            setTimeout(() => setSavedNotice(false), 2000);
        } catch (error) {
            console.error('Save error:', error);
        }
    };

    const handleScriptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            alert(`File too large. Maximum ${MAX_FILE_SIZE_MB}MB.`);
            return;
        }

        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!['txt', 'fdx', 'fountain', 'md'].includes(ext || '')) {
            alert('Supported formats: .txt, .fdx, .fountain, .md');
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
            let text = ev.target?.result as string;
            if (text.length > MAX_SCRIPT_CHARS) {
                text = text.substring(0, MAX_SCRIPT_CHARS);
                alert(`Script truncated to ${MAX_SCRIPT_CHARS.toLocaleString()} characters.`);
            }
            store.setScriptContent(projectId, text);
            setScriptExpanded(true);
            handleSendMessage(`I've uploaded my script "${file.name}" (${text.length.toLocaleString()} characters). Please analyze it and extract the key elements — scenes, characters, locations, mood, and visual direction.`);
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file.');
            return;
        }

        if (file.size > 25 * 1024 * 1024) {
            alert('Image too large. Maximum 25MB.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('image', file);
            const response = await fetch('/api/upload', {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });
            if (!response.ok) throw new Error('Upload failed');
            const result = await response.json();
            setPendingImageUrl(result.url);
        } catch (error) {
            console.error('Image upload error:', error);
            alert('Failed to upload image.');
        }
        e.target.value = '';
    };

    const handleFieldEdit = (field: string, value: string) => {
        if (!project) return;
        const updated = { ...project, [field]: value } as Project;
        setProject(updated);
        store.setProjectSnapshot(projectId, updated);
        // Debounced auto-save to database on field edit
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            updateProject(projectId, updated).catch(err =>
                console.error('Auto-save failed:', err)
            );
        }, 800);
    };

    const handleResetChat = () => {
        store.resetSession(projectId);
        loadProject();
    };

    const handleNewProject = async () => {
        try {
            await createProject({ title: 'Untitled Project' });
            const projects = await getAllProjects();
            const newest = projects[0]; // sorted by updated_at DESC
            if (newest) navigate(`/projects/${newest.id}`);
        } catch (error) {
            console.error('Create project error:', error);
        }
    };

    const handleDeleteProject = async () => {
        if (!project) return;
        if (!confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
        try {
            store.resetSession(projectId);
            await deleteProject(project.id);
            const projects = await getAllProjects();
            if (projects.length > 0) {
                navigate(`/projects/${projects[0].id}`);
            } else {
                await createProject({ title: 'Untitled Project' });
                const newProjs = await getAllProjects();
                if (newProjs.length > 0) navigate(`/projects/${newProjs[0].id}`);
            }
        } catch (error) {
            console.error('Delete project error:', error);
        }
    };

    // Project info field definitions with size hints
    const compactFields = [
        { key: 'cinematic_references', label: 'References' },
    ];

    const mediumFields = [
        { key: 'purpose', label: 'Purpose' },
        { key: 'style_aesthetic', label: 'Style & Aesthetic' },
        { key: 'atmosphere_mood', label: 'Atmosphere & Mood' },
        { key: 'lighting_directions', label: 'Lighting' },
        { key: 'cinematography', label: 'Cinematography' },
    ];

    const largeFields = [
        { key: 'storyline_narrative', label: 'Storyline / Narrative' },
    ];

    if (loading) return <div style={{ padding: '32px', color: 'white' }}>Loading Creative Director...</div>;
    if (!project) return <div style={{ padding: '32px', color: 'white' }}>No project found.</div>;

    return (
        <div style={styles.page}>
            {/* LEFT: Conversation Panel */}
            <div style={styles.chatPanel}>
                <div style={styles.chatHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Lightbulb size={18} color="#8b5cf6" />
                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#e5e7eb' }}>AI Creative Director</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <select
                            value={session.targetModel || ''}
                            onChange={(e) => store.setTargetModel(projectId, e.target.value || null)}
                            style={styles.modelSelect}
                            title="Target model for prompt generation"
                        >
                            <option value="">No model</option>
                            {availableModels.map(m => (
                                <option key={m.name} value={m.name}>
                                    {m.displayName} ({m.type})
                                </option>
                            ))}
                        </select>
                        <button onClick={handleResetChat} style={styles.resetBtn} title="Reset conversation">
                            <RotateCcw size={13} />
                        </button>
                    </div>
                </div>

                {/* Quick Start Buttons */}
                {session.mode === 'initial' && (
                    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            style={styles.quickStartBtn}
                        >
                            <Upload size={14} /> Upload Script (.txt, .fdx, .fountain)
                        </button>
                        <button
                            onClick={() => {
                                setScriptExpanded(true);
                                handleSendMessage('I have a script I\'d like to paste. Let me put it in the script editor.');
                            }}
                            style={styles.quickStartBtn}
                        >
                            <FileText size={14} /> Paste a Script
                        </button>
                        <button
                            onClick={() => handleSendMessage('I just have an idea. Let\'s develop the vision together from scratch.')}
                            style={styles.quickStartBtn}
                        >
                            <Lightbulb size={14} /> Start from an Idea
                        </button>
                    </div>
                )}

                {/* Messages */}
                <div style={styles.messageList}>
                    {session.messages.map((msg, i) => (
                        <div key={i} style={styles.messageWrapper}>
                            <div style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                color: msg.role === 'user' ? '#6b7280' : '#8b5cf6',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: '4px',
                            }}>
                                {msg.role === 'user' ? 'YOU' : 'DIRECTOR'}
                            </div>
                            {msg.imageUrl && (
                                <img
                                    src={msg.imageUrl}
                                    alt="Shared reference"
                                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '6px', marginBottom: '8px', objectFit: 'cover' }}
                                />
                            )}
                            <div style={{
                                ...styles.messageBubble,
                                backgroundColor: msg.role === 'user' ? '#27272a' : '#1a1a2e',
                                borderLeft: msg.role === 'assistant' ? '2px solid #8b5cf6' : 'none',
                            }}>
                                {(typeof msg.content === 'string' ? msg.content : String(msg.content || '')).split('\n').map((line, j) => (
                                    <p key={j} style={{ margin: '0 0 4px 0', lineHeight: '1.5' }}>
                                        {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                                    </p>
                                ))}
                            </div>
                            {msg.projectUpdates && (
                                <div style={styles.updateBadge}>
                                    <Check size={11} /> Updated: {Object.keys(msg.projectUpdates).join(', ').replace(/_/g, ' ')}
                                </div>
                            )}
                            {msg.scriptUpdates && (
                                <div style={styles.updateBadge}>
                                    <FileText size={11} /> Script updated
                                </div>
                            )}
                            {msg.createdCharacters && msg.createdCharacters.length > 0 && (
                                <div style={styles.updateBadge}>
                                    <Check size={11} /> Characters added: {msg.createdCharacters.map(c => c.name).join(', ')}
                                </div>
                            )}
                        </div>
                    ))}
                    {isThinking && (
                        <div style={{ ...styles.messageBubble, backgroundColor: '#1a1a2e', borderLeft: '2px solid #8b5cf6' }}>
                            <Loader2 size={14} className="spin" color="#8b5cf6" style={{ display: 'inline' }} /> Thinking...
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Pending image preview */}
                {pendingImageUrl && (
                    <div style={styles.pendingImageBar}>
                        <img src={pendingImageUrl} alt="Attached" style={{ height: '48px', borderRadius: '4px', objectFit: 'cover' }} />
                        <span style={{ fontSize: '11px', color: '#a78bfa' }}>Image attached</span>
                        <button
                            onClick={() => setPendingImageUrl(null)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }}
                            title="Remove image"
                        >
                            <X size={14} color="#6b7280" />
                        </button>
                    </div>
                )}

                {/* Input */}
                <div style={styles.inputArea}>
                    <button
                        onClick={() => imageInputRef.current?.click()}
                        style={styles.iconBtn}
                        title="Share reference image"
                    >
                        <Image size={16} color={pendingImageUrl ? '#8b5cf6' : '#6b7280'} />
                    </button>
                    <input
                        type="text"
                        placeholder={pendingImageUrl ? 'Type a message about this image...' : 'Talk to your Creative Director...'}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
                        disabled={isThinking}
                        style={styles.chatInput}
                    />
                    <button
                        onClick={() => handleSendMessage(inputMessage)}
                        disabled={!inputMessage.trim() || isThinking}
                        style={{
                            ...styles.sendBtn,
                            backgroundColor: inputMessage.trim() && !isThinking ? '#8b5cf6' : '#3f3f46',
                            cursor: inputMessage.trim() && !isThinking ? 'pointer' : 'not-allowed',
                        }}
                    >
                        <Send size={14} />
                    </button>
                </div>

                {/* Hidden file inputs */}
                <input ref={fileInputRef} type="file" accept=".txt,.fdx,.fountain,.md" onChange={handleScriptUpload} style={{ display: 'none' }} />
                <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </div>

            {/* RIGHT: Working Area */}
            <div style={styles.workArea}>
                {/* Save Header */}
                <div style={styles.workHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                        {editingTitle ? (
                            <input
                                autoFocus
                                value={project.title}
                                onChange={(e) => {
                                    const updated = { ...project, title: e.target.value } as Project;
                                    setProject(updated);
                                    store.setProjectSnapshot(projectId, updated);
                                }}
                                onBlur={() => {
                                    setEditingTitle(false);
                                    updateProject(projectId, project).catch(err => console.error('Title save error:', err));
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setEditingTitle(false);
                                        updateProject(projectId, project).catch(err => console.error('Title save error:', err));
                                    }
                                }}
                                style={{ ...styles.fieldInput, fontSize: '15px', fontWeight: 700, flex: 1 }}
                            />
                        ) : (
                            <span
                                style={{ fontSize: '15px', fontWeight: 700, color: '#e5e7eb', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                onClick={() => setEditingTitle(true)}
                                title="Click to rename"
                            >
                                {project.title}
                            </span>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <button onClick={handleNewProject} style={styles.headerIconBtn} title="New project">
                            <Plus size={14} />
                        </button>
                        <button onClick={handleDeleteProject} style={{ ...styles.headerIconBtn, color: '#ef4444' }} title="Delete project">
                            <Trash2 size={14} />
                        </button>
                        <button onClick={handleSaveProject} style={styles.saveBtn} title="Auto-saves on AI updates and field edits. Click to force save.">
                            {savedNotice ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save</>}
                        </button>
                    </div>
                </div>

                {/* Script Section — collapsible */}
                <div style={styles.section}>
                    <button
                        onClick={() => setScriptExpanded(!scriptExpanded)}
                        style={styles.sectionHeader}
                    >
                        <span style={styles.sectionTitle}><FileText size={14} /> Script</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '11px', color: '#6b7280' }}>
                                {session.scriptContent.length.toLocaleString()} / {MAX_SCRIPT_CHARS.toLocaleString()} chars
                            </span>
                            {scriptExpanded ? <ChevronUp size={14} color="#6b7280" /> : <ChevronDown size={14} color="#6b7280" />}
                        </div>
                    </button>
                    {scriptExpanded && (
                        <>
                            <textarea
                                value={session.scriptContent}
                                onChange={(e) => {
                                    if (e.target.value.length <= MAX_SCRIPT_CHARS) {
                                        store.setScriptContent(projectId, e.target.value);
                                    }
                                }}
                                placeholder="Paste your script here, or upload a file using the button in the chat..."
                                style={styles.scriptEditor}
                            />
                            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                                <button onClick={() => fileInputRef.current?.click()} style={styles.smallBtn}>
                                    <Upload size={12} /> Upload File
                                </button>
                                {session.scriptContent.length > 0 && (
                                    <button
                                        onClick={() => handleSendMessage(`I've updated the script (${session.scriptContent.length.toLocaleString()} chars). Please review the changes and let me know what you think.`)}
                                        style={{ ...styles.smallBtn, backgroundColor: '#8b5cf6', color: 'white' }}
                                    >
                                        <Send size={12} /> Send to Director
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Project Info — collapsible, editable */}
                <div style={styles.section}>
                    <button
                        onClick={() => setProjectInfoExpanded(!projectInfoExpanded)}
                        style={styles.sectionHeader}
                    >
                        <span style={styles.sectionTitle}>Project Info</span>
                        {projectInfoExpanded ? <ChevronUp size={14} color="#6b7280" /> : <ChevronDown size={14} color="#6b7280" />}
                    </button>
                    {projectInfoExpanded && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {/* Compact row: frame size dropdown + references */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <div style={styles.infoCard}>
                                    <div style={styles.infoLabel}>Frame Size</div>
                                    <select
                                        value={project.frame_size || ''}
                                        onChange={(e) => handleFieldEdit('frame_size', e.target.value)}
                                        style={{ ...styles.fieldInput, cursor: 'pointer' }}
                                    >
                                        <option value="">Select size</option>
                                        {FRAME_SIZE_OPTIONS.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                                {compactFields.map(({ key, label }) => (
                                    <FieldCard
                                        key={key}
                                        field={key}
                                        label={label}
                                        value={(project as any)[key] || ''}
                                        editing={editingField === key}
                                        onStartEdit={() => setEditingField(key)}
                                        onEndEdit={() => setEditingField(null)}
                                        onChange={(v) => handleFieldEdit(key, v)}
                                        compact
                                    />
                                ))}
                            </div>
                            {/* Medium fields: 2-col grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                {mediumFields.map(({ key, label }) => (
                                    <FieldCard
                                        key={key}
                                        field={key}
                                        label={label}
                                        value={(project as any)[key] || ''}
                                        editing={editingField === key}
                                        onStartEdit={() => setEditingField(key)}
                                        onEndEdit={() => setEditingField(null)}
                                        onChange={(v) => handleFieldEdit(key, v)}
                                    />
                                ))}
                            </div>
                            {/* Large field: full width */}
                            {largeFields.map(({ key, label }) => (
                                <FieldCard
                                    key={key}
                                    field={key}
                                    label={label}
                                    value={(project as any)[key] || ''}
                                    editing={editingField === key}
                                    onStartEdit={() => setEditingField(key)}
                                    onEndEdit={() => setEditingField(null)}
                                    onChange={(v) => handleFieldEdit(key, v)}
                                    large
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Editable field card component
const FieldCard: React.FC<{
    field: string;
    label: string;
    value: string;
    editing: boolean;
    onStartEdit: () => void;
    onEndEdit: () => void;
    onChange: (value: string) => void;
    compact?: boolean;
    large?: boolean;
}> = ({ label, value, editing, onStartEdit, onEndEdit, onChange, compact, large }) => {
    if (editing) {
        return (
            <div style={styles.infoCard}>
                <div style={styles.infoLabel}>{label}</div>
                {compact ? (
                    <input
                        autoFocus
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={onEndEdit}
                        onKeyDown={(e) => e.key === 'Enter' && onEndEdit()}
                        style={styles.fieldInput}
                    />
                ) : (
                    <textarea
                        autoFocus
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={onEndEdit}
                        style={{ ...styles.fieldInput, minHeight: large ? '120px' : '60px', resize: 'vertical' as const }}
                    />
                )}
            </div>
        );
    }

    return (
        <div style={{ ...styles.infoCard, cursor: 'pointer' }} onClick={onStartEdit}>
            <div style={styles.infoLabel}>{label}</div>
            <div style={{
                color: value ? '#e5e7eb' : '#52525b',
                fontSize: '12px',
                lineHeight: '1.4',
                maxHeight: large ? '200px' : compact ? '20px' : '80px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            }}>
                {value || 'Click to edit...'}
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    page: {
        display: 'grid',
        gridTemplateColumns: '420px 1fr',
        gap: '0',
        height: '100%',
        overflow: 'hidden',
    },
    chatPanel: {
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #27272a',
        backgroundColor: '#18181b',
        overflow: 'hidden',
    },
    chatHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid #27272a',
        flexShrink: 0,
    },
    modelSelect: {
        padding: '4px 8px',
        backgroundColor: '#27272a',
        border: '1px solid #3f3f46',
        borderRadius: '4px',
        color: '#a78bfa',
        fontSize: '11px',
        fontWeight: 600,
        cursor: 'pointer',
        outline: 'none',
        maxWidth: '160px',
    },
    resetBtn: {
        padding: '4px',
        background: 'transparent',
        border: '1px solid #3f3f46',
        borderRadius: '4px',
        color: '#6b7280',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
    },
    quickStartBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 16px',
        backgroundColor: '#27272a',
        border: '1px solid #3f3f46',
        borderRadius: '8px',
        color: '#a78bfa',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
    },
    messageList: {
        flex: 1,
        overflowY: 'auto',
        padding: '12px 16px',
    },
    messageWrapper: {
        marginBottom: '16px',
    },
    messageBubble: {
        padding: '10px 12px',
        borderRadius: '6px',
        color: '#d1d5db',
        fontSize: '13px',
    },
    updateBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        marginTop: '4px',
        marginRight: '6px',
        padding: '2px 8px',
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        borderRadius: '4px',
        color: '#a78bfa',
        fontSize: '10px',
        fontWeight: 600,
    },
    pendingImageBar: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        borderTop: '1px solid #27272a',
        backgroundColor: 'rgba(139, 92, 246, 0.08)',
        flexShrink: 0,
    },
    inputArea: {
        display: 'flex',
        gap: '6px',
        padding: '12px 16px',
        borderTop: '1px solid #27272a',
        flexShrink: 0,
        alignItems: 'center',
    },
    iconBtn: {
        padding: '8px',
        background: 'transparent',
        border: '1px solid #3f3f46',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
    },
    chatInput: {
        flex: 1,
        padding: '10px 12px',
        backgroundColor: '#27272a',
        border: '1px solid #3f3f46',
        borderRadius: '8px',
        color: '#e5e7eb',
        fontSize: '13px',
        outline: 'none',
    },
    sendBtn: {
        padding: '10px 14px',
        border: 'none',
        borderRadius: '8px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
    },
    workArea: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        padding: '16px 20px',
        backgroundColor: '#18181b',
    },
    workHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        flexShrink: 0,
    },
    headerIconBtn: {
        padding: '6px',
        background: 'transparent',
        border: '1px solid #3f3f46',
        borderRadius: '4px',
        color: '#6b7280',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
    },
    saveBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        backgroundColor: '#8b5cf6',
        border: 'none',
        borderRadius: '6px',
        color: 'white',
        fontSize: '12px',
        fontWeight: 600,
        cursor: 'pointer',
    },
    section: {
        marginBottom: '12px',
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: '8px 12px',
        backgroundColor: '#1f1f23',
        border: '1px solid #27272a',
        borderRadius: '6px',
        cursor: 'pointer',
        marginBottom: '8px',
    },
    sectionTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '13px',
        fontWeight: 700,
        color: '#e5e7eb',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    },
    scriptEditor: {
        width: '100%',
        minHeight: '200px',
        padding: '12px',
        backgroundColor: '#27272a',
        border: '1px solid #3f3f46',
        borderRadius: '8px',
        color: '#e5e7eb',
        fontSize: '13px',
        fontFamily: 'monospace',
        lineHeight: '1.6',
        resize: 'vertical' as const,
        outline: 'none',
        boxSizing: 'border-box' as const,
    },
    smallBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '6px 12px',
        backgroundColor: '#27272a',
        border: '1px solid #3f3f46',
        borderRadius: '6px',
        color: '#a78bfa',
        fontSize: '11px',
        fontWeight: 600,
        cursor: 'pointer',
    },
    infoCard: {
        padding: '10px',
        backgroundColor: '#27272a',
        borderRadius: '6px',
        border: '1px solid #3f3f46',
    },
    infoLabel: {
        fontSize: '10px',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '4px',
        fontWeight: 700,
    },
    fieldInput: {
        width: '100%',
        padding: '6px 8px',
        backgroundColor: '#18181b',
        border: '1px solid #52525b',
        borderRadius: '4px',
        color: '#e5e7eb',
        fontSize: '12px',
        outline: 'none',
        fontFamily: 'sans-serif',
        boxSizing: 'border-box' as const,
    },
};
