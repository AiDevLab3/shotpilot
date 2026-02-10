import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send, Loader2, Save, FileText, Lightbulb, Check } from 'lucide-react';
import { getAllProjects, getProject, updateProject, creativeDirectorChat } from '../services/api';
import type { Project } from '../types/schema';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    projectUpdates?: Record<string, string> | null;
    scriptUpdates?: string | null;
}

export const CreativeDirectorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [scriptContent, setScriptContent] = useState('');
    const [mode, setMode] = useState<'initial' | 'script-first' | 'idea-first' | 'refining'>('initial');
    const [savedNotice, setSavedNotice] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadProject();
    }, [id]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isThinking]);

    const loadProject = async () => {
        setLoading(true);
        try {
            let proj: Project | undefined;
            if (id) {
                proj = await getProject(parseInt(id));
            } else {
                const projects = await getAllProjects();
                if (projects.length > 0) proj = projects[0];
            }
            if (proj) {
                setProject(proj);
                // Initial greeting
                setMessages([{
                    role: 'assistant',
                    content: `Welcome to your AI Creative Director workspace for **${proj.title}**!\n\nI can help you develop your project from concept to completion. Do you want to:\n\n- **Paste a script** for me to analyze and extract visual direction from?\n- **Start from an idea** and develop the vision together?\n\nTell me where you're starting from, and I'll guide you through the creative process.`,
                }]);
            }
        } catch (error) {
            console.error('Failed to load project', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (message: string) => {
        if (!message.trim() || isThinking || !project) return;

        const userMsg: Message = { role: 'user', content: message };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInputMessage('');
        setIsThinking(true);

        // Detect mode from first user message
        let currentMode = mode;
        if (mode === 'initial') {
            const lower = message.toLowerCase();
            if (lower.includes('script') || lower.includes('paste') || lower.includes('here is') || lower.includes('int.') || lower.includes('ext.')) {
                currentMode = 'script-first';
                setMode('script-first');
            } else {
                currentMode = 'idea-first';
                setMode('idea-first');
            }
        }

        try {
            const history = newMessages.map(m => ({ role: m.role, content: m.content }));
            const result = await creativeDirectorChat(
                project.id,
                message,
                history,
                scriptContent,
                currentMode,
            );

            // Apply updates
            if (result.projectUpdates) {
                setProject(prev => prev ? { ...prev, ...result.projectUpdates } : prev);
            }
            if (result.scriptUpdates) {
                setScriptContent(result.scriptUpdates);
            }

            setMessages([...newMessages, {
                role: 'assistant',
                content: result.response,
                projectUpdates: result.projectUpdates,
                scriptUpdates: result.scriptUpdates,
            }]);
        } catch (error) {
            console.error('Creative Director error:', error);
            setMessages([...newMessages, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
            }]);
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

    const projectInfoFields = [
        { key: 'frame_size', label: 'Frame Size' },
        { key: 'style_aesthetic', label: 'Style & Aesthetic' },
        { key: 'atmosphere_mood', label: 'Atmosphere & Mood' },
        { key: 'lighting_directions', label: 'Lighting' },
        { key: 'purpose', label: 'Purpose' },
        { key: 'storyline_narrative', label: 'Storyline' },
        { key: 'cinematography', label: 'Cinematography' },
        { key: 'cinematic_references', label: 'References' },
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
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>{mode !== 'initial' ? mode.replace('-', ' ') : 'ready'}</span>
                </div>

                {/* Quick Start Buttons */}
                {mode === 'initial' && (
                    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button
                            onClick={() => handleSendMessage('I have a script I\'d like to analyze. Let me paste it.')}
                            style={styles.quickStartBtn}
                        >
                            <FileText size={14} /> I Have a Script
                        </button>
                        <button
                            onClick={() => handleSendMessage('I just have an idea. Let\'s develop it together from scratch.')}
                            style={styles.quickStartBtn}
                        >
                            <Lightbulb size={14} /> Start from an Idea
                        </button>
                    </div>
                )}

                {/* Messages */}
                <div style={styles.messageList}>
                    {messages.map((msg, i) => (
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
                            <div style={{
                                ...styles.messageBubble,
                                backgroundColor: msg.role === 'user' ? '#27272a' : '#1a1a2e',
                                borderLeft: msg.role === 'assistant' ? '2px solid #8b5cf6' : 'none',
                            }}>
                                {msg.content.split('\n').map((line, j) => (
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
                        </div>
                    ))}
                    {isThinking && (
                        <div style={{ ...styles.messageBubble, backgroundColor: '#1a1a2e', borderLeft: '2px solid #8b5cf6' }}>
                            <Loader2 size={14} className="spin" color="#8b5cf6" style={{ display: 'inline' }} /> Thinking...
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div style={styles.inputArea}>
                    <input
                        type="text"
                        placeholder="Talk to your Creative Director..."
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
            </div>

            {/* RIGHT: Working Area */}
            <div style={styles.workArea}>
                {/* Save Header */}
                <div style={styles.workHeader}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#e5e7eb' }}>Project Workspace</span>
                    <button onClick={handleSaveProject} style={styles.saveBtn}>
                        {savedNotice ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save Project</>}
                    </button>
                </div>

                {/* Script Editor */}
                <div style={styles.section}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={styles.sectionTitle}><FileText size={14} /> Script</span>
                        <span style={{ fontSize: '11px', color: '#6b7280' }}>{scriptContent.length} chars</span>
                    </div>
                    <textarea
                        value={scriptContent}
                        onChange={(e) => setScriptContent(e.target.value)}
                        placeholder="Your script will appear here as you develop it with AI, or paste one to get started..."
                        style={styles.scriptEditor}
                    />
                </div>

                {/* Project Info Grid */}
                <div style={styles.section}>
                    <span style={styles.sectionTitle}>Project Info</span>
                    <div style={styles.infoGrid}>
                        {projectInfoFields.map(({ key, label }) => {
                            const value = (project as any)[key] || '';
                            return (
                                <div key={key} style={styles.infoCard}>
                                    <div style={styles.infoLabel}>{label}</div>
                                    <div style={{ color: value ? '#e5e7eb' : '#52525b', fontSize: '12px', lineHeight: '1.4' }}>
                                        {value || 'Not set'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    page: {
        display: 'grid',
        gridTemplateColumns: '400px 1fr',
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
        padding: '2px 8px',
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        borderRadius: '4px',
        color: '#a78bfa',
        fontSize: '10px',
        fontWeight: 600,
    },
    inputArea: {
        display: 'flex',
        gap: '8px',
        padding: '12px 16px',
        borderTop: '1px solid #27272a',
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
        marginBottom: '16px',
    },
    sectionTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '13px',
        fontWeight: 700,
        color: '#e5e7eb',
        marginBottom: '8px',
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
        resize: 'vertical',
        outline: 'none',
        boxSizing: 'border-box' as const,
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '8px',
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
};
