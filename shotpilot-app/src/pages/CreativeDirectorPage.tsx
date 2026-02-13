import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, FileText, Check, Upload, Send, ChevronDown, ChevronUp, Plus, Trash2, FolderPlus } from 'lucide-react';
import { getAllProjects, updateProject, createProject, deleteProject } from '../services/api';
import { useCreativeDirectorStore } from '../stores/creativeDirectorStore';
import { useProjectContext } from '../components/ProjectLayout';
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
    const { project, projectId, setProject } = useProjectContext();
    const navigate = useNavigate();
    const store = useCreativeDirectorStore();
    const session = store.getSession(projectId);

    const [savedNotice, setSavedNotice] = useState(false);
    const [scriptExpanded, setScriptExpanded] = useState(true);
    const [projectInfoExpanded, setProjectInfoExpanded] = useState(true);
    const [editingField, setEditingField] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    const handleFieldEdit = (field: string, value: string) => {
        if (!project) return;
        const updated = { ...project, [field]: value } as Project;
        setProject(updated);
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            updateProject(projectId, updated).catch(err =>
                console.error('Auto-save failed:', err)
            );
        }, 800);
    };

    const handleNewProject = async () => {
        try {
            await createProject({ title: 'Untitled Project' });
            const projects = await getAllProjects();
            const newest = projects[0];
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
            // Queue message to the AI sidebar
            store.queueMessage(projectId, `I've uploaded my script "${file.name}" (${text.length.toLocaleString()} characters). Please analyze it and extract the key elements — scenes, characters, locations, mood, and visual direction.`);
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const compactFields = [
        { key: 'cinematic_references', label: 'References', placeholder: 'e.g. Blade Runner 2049, Wes Anderson, Roger Deakins' },
    ];

    const mediumFields = [
        { key: 'purpose', label: 'Purpose', placeholder: 'e.g. Short film, music video, commercial, proof of concept...' },
        { key: 'style_aesthetic', label: 'Style & Aesthetic', placeholder: 'e.g. Gritty neo-noir, warm golden tones, film grain...' },
        { key: 'atmosphere_mood', label: 'Atmosphere & Mood', placeholder: 'e.g. Tense and claustrophobic, dreamlike and ethereal...' },
        { key: 'lighting_directions', label: 'Lighting', placeholder: 'e.g. Natural light, high contrast, neon-lit night scenes...' },
        { key: 'cinematography', label: 'Cinematography', placeholder: 'e.g. Handheld, slow tracking shots, shallow depth of field...' },
    ];

    const largeFields = [
        { key: 'storyline_narrative', label: 'Storyline / Narrative', placeholder: 'Describe your story, themes, and narrative arc...' },
    ];

    // Auto-create project if none exists
    const [creating, setCreating] = useState(false);

    const handleCreateFirstProject = async (title?: string) => {
        setCreating(true);
        try {
            await createProject({ title: title || 'Untitled Project' });
            const projects = await getAllProjects();
            if (projects.length > 0) {
                navigate(`/projects/${projects[0].id}`);
            }
        } catch (error) {
            console.error('Create project error:', error);
        } finally {
            setCreating(false);
        }
    };

    if (!project) {
        return (
            <div style={styles.workArea}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '20px', padding: '40px' }}>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#e5e7eb' }}>Welcome to ShotPilot</div>
                    <div style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', maxWidth: '400px' }}>
                        Create a project to start collaborating with your AI Creative Director on scripts, visual direction, and shot planning.
                    </div>
                    <NewProjectForm onSubmit={handleCreateFirstProject} creating={creating} />
                </div>
            </div>
        );
    }

    return (
        <div style={styles.workArea}>
            {/* Header */}
            <div style={styles.workHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                    {editingTitle ? (
                        <input
                            autoFocus
                            value={project.title}
                            onChange={(e) => {
                                const updated = { ...project, title: e.target.value } as Project;
                                setProject(updated);
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

            {/* Script Section */}
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
                            placeholder="Paste your script here, or upload a file..."
                            style={styles.scriptEditor}
                        />
                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                            <button onClick={() => fileInputRef.current?.click()} style={styles.smallBtn}>
                                <Upload size={12} /> Upload File
                            </button>
                            {session.scriptContent.length > 0 && (
                                <button
                                    onClick={() => store.queueMessage(projectId, `I've updated the script (${session.scriptContent.length.toLocaleString()} chars). Please review the changes and let me know what you think.`)}
                                    style={{ ...styles.smallBtn, backgroundColor: '#8b5cf6', color: 'white' }}
                                >
                                    <Send size={12} /> Send to Director
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Project Info */}
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
                            {compactFields.map(({ key, label, placeholder }) => (
                                <FieldCard
                                    key={key}
                                    field={key}
                                    label={label}
                                    value={(project as any)[key] || ''}
                                    placeholder={placeholder}
                                    editing={editingField === key}
                                    onStartEdit={() => setEditingField(key)}
                                    onEndEdit={() => setEditingField(null)}
                                    onChange={(v) => handleFieldEdit(key, v)}
                                    compact
                                />
                            ))}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            {mediumFields.map(({ key, label, placeholder }) => (
                                <FieldCard
                                    key={key}
                                    field={key}
                                    label={label}
                                    value={(project as any)[key] || ''}
                                    placeholder={placeholder}
                                    editing={editingField === key}
                                    onStartEdit={() => setEditingField(key)}
                                    onEndEdit={() => setEditingField(null)}
                                    onChange={(v) => handleFieldEdit(key, v)}
                                />
                            ))}
                        </div>
                        {largeFields.map(({ key, label, placeholder }) => (
                            <FieldCard
                                key={key}
                                field={key}
                                label={label}
                                value={(project as any)[key] || ''}
                                placeholder={placeholder}
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

            {/* Create New Project */}
            <div style={{ ...styles.section, marginTop: '8px', paddingTop: '12px', borderTop: '1px solid #27272a' }}>
                <NewProjectForm onSubmit={async (title) => {
                    try {
                        await createProject({ title: title || 'Untitled Project' });
                        const projects = await getAllProjects();
                        const newest = projects[0];
                        if (newest) navigate(`/projects/${newest.id}`);
                    } catch (error) {
                        console.error('Create project error:', error);
                    }
                }} creating={false} />
            </div>

            {/* Hidden file input */}
            <input ref={fileInputRef} type="file" accept=".txt,.fdx,.fountain,.md" onChange={handleScriptUpload} style={{ display: 'none' }} />
        </div>
    );
};

// New project creation form
const NewProjectForm: React.FC<{
    onSubmit: (title: string) => Promise<void>;
    creating: boolean;
}> = ({ onSubmit, creating }) => {
    const [title, setTitle] = useState('');

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '500px' }}>
            <FolderPlus size={16} color="#8b5cf6" style={{ flexShrink: 0 }} />
            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !creating) onSubmit(title);
                }}
                placeholder="New project name..."
                style={{
                    flex: 1,
                    padding: '8px 12px',
                    backgroundColor: '#27272a',
                    border: '1px solid #3f3f46',
                    borderRadius: '6px',
                    color: '#e5e7eb',
                    fontSize: '13px',
                    outline: 'none',
                }}
            />
            <button
                onClick={() => onSubmit(title)}
                disabled={creating}
                style={{
                    padding: '8px 16px',
                    backgroundColor: '#8b5cf6',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: creating ? 'not-allowed' : 'pointer',
                    opacity: creating ? 0.6 : 1,
                    whiteSpace: 'nowrap',
                }}
            >
                {creating ? 'Creating...' : 'Create Project'}
            </button>
        </div>
    );
};

// Editable field card component
const FieldCard: React.FC<{
    field: string;
    label: string;
    value: string;
    placeholder?: string;
    editing: boolean;
    onStartEdit: () => void;
    onEndEdit: () => void;
    onChange: (value: string) => void;
    compact?: boolean;
    large?: boolean;
}> = ({ label, value, placeholder, editing, onStartEdit, onEndEdit, onChange, compact, large }) => {
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
                        placeholder={placeholder}
                        style={styles.fieldInput}
                    />
                ) : (
                    <textarea
                        autoFocus
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={onEndEdit}
                        placeholder={placeholder}
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
                fontStyle: value ? 'normal' : 'italic',
                maxHeight: large ? '200px' : compact ? '20px' : '80px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            }}>
                {value || placeholder || 'Click to edit...'}
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    workArea: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        padding: '16px 20px',
        height: '100%',
        boxSizing: 'border-box',
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
