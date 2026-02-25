import React, { useEffect, useState, useRef } from 'react';
import { Send, Loader2, FileText, Lightbulb, Check, Upload, Image, X, PanelLeftClose, PanelLeftOpen, Sparkles } from 'lucide-react';
import { creativeDirectorChat, getAvailableModels, compactConversation, loadConversation, saveConversationMessage, replaceConversationMessages } from '../services/api';
import { useCreativeDirectorStore } from '../stores/creativeDirectorStore';
import type { Message } from '../stores/creativeDirectorStore';
import type { Project } from '../types/schema';
import { updateProject } from '../services/api';

const COMPACTION_THRESHOLD = 20;
const KEEP_RECENT = 6;
const MAX_FILE_SIZE_MB = 2;
const MAX_SCRIPT_CHARS = 50000;

interface ChatSidebarProps {
    projectId: number;
    project: Project | null;
    onProjectUpdate: (updated: Project) => void;
    collapsed: boolean;
    onToggleCollapse: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
    projectId,
    project,
    onProjectUpdate,
    collapsed,
    onToggleCollapse,
}) => {
    const store = useCreativeDirectorStore();
    const session = store.getSession(projectId);
    const queuedMessage = useCreativeDirectorStore((s) => s.queuedMessage);

    const [inputMessage, setInputMessage] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [availableModels, setAvailableModels] = useState<any[]>([]);
    const [pendingImages, setPendingImages] = useState<string[]>([]);
    const [isCompacting, setIsCompacting] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const compactingRef = useRef(false);
    const serverLoadedRef = useRef(false);

    useEffect(() => {
        getAvailableModels().then(setAvailableModels).catch(() => {});
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [session.messages, isThinking]);

    // Watch for queued messages from other components (e.g. "Send to Director" button)
    useEffect(() => {
        if (queuedMessage && queuedMessage.projectId === projectId && !isThinking) {
            store.clearQueuedMessage();
            handleSendMessage(queuedMessage.content);
        }
    }, [queuedMessage, projectId, isThinking]);

    // Load conversation from server on mount (source of truth)
    useEffect(() => {
        if (!project || serverLoadedRef.current) return;
        serverLoadedRef.current = true;

        loadConversation(projectId).then(data => {
            if (data.exists && data.messages.length > 0) {
                // Server has conversation — use it as source of truth
                store.setMessages(projectId, data.messages);
                if (data.mode) store.setMode(projectId, data.mode as any);
                if (data.scriptContent) store.setScriptContent(projectId, data.scriptContent);
                if (data.targetModel) store.setTargetModel(projectId, data.targetModel);
            } else if (session.messages.length === 0) {
                // No server data and no local data — show welcome message
                const welcomeMsg: Message = {
                    role: 'assistant',
                    content: `Welcome to your AI Creative Director workspace for **${project.title}**!\n\nI can see your entire project — characters, objects, scenes, and all visual direction. I'm here to help you develop everything from concept to camera-ready.\n\n**The best workflow:**\n1. Lock your script first (the narrative blueprint)\n2. Build out characters & objects\n3. Define your visual direction\n4. Plan scenes & shots\n\nDo you want to:\n- **Paste or upload a script** for me to analyze?\n- **Start from an idea** and build the vision together?\n\nWhat's your starting point?`,
                };
                store.setMessages(projectId, [welcomeMsg]);
                // Save welcome message to server
                saveConversationMessage(projectId, welcomeMsg, { mode: 'initial' }).catch(() => {});
            }
        }).catch(err => {
            console.warn('[ChatSidebar] Server conversation load failed, using local:', err.message);
            // Fall back to local state — if empty, show welcome
            if (project && session.messages.length === 0) {
                store.setMessages(projectId, [{
                    role: 'assistant',
                    content: `Welcome to your AI Creative Director workspace for **${project.title}**!\n\nI can see your entire project — characters, objects, scenes, and all visual direction. I'm here to help you develop everything from concept to camera-ready.\n\n**The best workflow:**\n1. Lock your script first (the narrative blueprint)\n2. Build out characters & objects\n3. Define your visual direction\n4. Plan scenes & shots\n\nDo you want to:\n- **Paste or upload a script** for me to analyze?\n- **Start from an idea** and build the vision together?\n\nWhat's your starting point?`,
                }]);
            }
        });
    }, [project?.id]);

    const handleSendMessage = async (message: string, imageUrl?: string) => {
        if (!message.trim() || isThinking || !project) return;

        const attachedImages = imageUrl ? [imageUrl] : (pendingImages.length > 0 ? [...pendingImages] : undefined);
        if (pendingImages.length > 0) setPendingImages([]);

        const userMsg: Message = {
            role: 'user',
            content: message,
            imageUrl: attachedImages?.[0] || undefined,
            imageUrls: attachedImages && attachedImages.length > 0 ? attachedImages : undefined,
        };
        const newMessages = [...session.messages, userMsg];
        store.setMessages(projectId, newMessages);
        setInputMessage('');
        setIsThinking(true);

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
                attachedImages,
                session.targetModel || undefined,
            );

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
                    onProjectUpdate(updated);
                    store.setProjectSnapshot(projectId, updated);
                    updateProject(projectId, updated).catch(err =>
                        console.error('Auto-save failed:', err)
                    );
                }
            }
            if (result.scriptUpdates && typeof result.scriptUpdates === 'string') {
                const existing = session.scriptContent;
                if (existing && result.scriptUpdates.length < existing.length * 0.5) {
                    console.warn('Script update rejected — returned fragment shorter than 50% of existing script');
                } else {
                    store.setScriptContent(projectId, result.scriptUpdates);
                }
            }

            const responseText = typeof result.response === 'string'
                ? result.response
                : 'I processed your request but had trouble formatting my response. Could you rephrase?';

            const assistantMsg: Message = {
                role: 'assistant',
                content: responseText,
                projectUpdates: result.projectUpdates,
                scriptUpdates: result.scriptUpdates,
                ...(result as any).createdCharacters && { createdCharacters: (result as any).createdCharacters },
                ...(result as any).createdObjects && { createdObjects: (result as any).createdObjects },
                ...(result as any).updatedCharacters && { updatedCharacters: (result as any).updatedCharacters },
                ...(result as any).updatedObjects && { updatedObjects: (result as any).updatedObjects },
                ...(result as any).createdScenes && { createdScenes: (result as any).createdScenes },
            } as any;
            store.addMessage(projectId, assistantMsg);

            // Notify entity pages to refresh their grids
            const r = result as any;
            if (r.createdObjects?.length || r.updatedObjects?.length) {
                window.dispatchEvent(new CustomEvent('objectsChanged'));
            }
            if (r.createdCharacters?.length || r.updatedCharacters?.length) {
                window.dispatchEvent(new CustomEvent('charactersChanged'));
            }
            if (r.createdScenes?.length) {
                window.dispatchEvent(new CustomEvent('scenesChanged'));
            }

            // Persist both messages to server (fire-and-forget)
            const sessionState = { mode: currentMode, scriptContent: session.scriptContent, targetModel: session.targetModel };
            saveConversationMessage(projectId, userMsg, sessionState).catch(e =>
                console.warn('[ChatSidebar] Failed to save user message:', e.message)
            );
            saveConversationMessage(projectId, assistantMsg, sessionState).catch(e =>
                console.warn('[ChatSidebar] Failed to save assistant message:', e.message)
            );

            setTimeout(() => maybeCompact(), 500);
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

    const maybeCompact = async () => {
        const currentMessages = store.getSession(projectId).messages;
        if (currentMessages.length < COMPACTION_THRESHOLD || compactingRef.current || !project) return;

        compactingRef.current = true;
        setIsCompacting(true);

        try {
            const toSummarize = currentMessages.slice(0, currentMessages.length - KEEP_RECENT);
            const toKeep = currentMessages.slice(currentMessages.length - KEEP_RECENT);

            const digest = await compactConversation(
                project.id,
                toSummarize.map(m => ({ role: m.role === 'summary' ? 'assistant' : m.role, content: m.content })),
                session.scriptContent,
            );

            const parts: string[] = [];
            parts.push(digest.summary);
            if (digest.styleDirection) parts.push(`**Visual Direction:** ${digest.styleDirection}`);
            if (digest.characterNotes) parts.push(`**Characters:** ${digest.characterNotes}`);
            if (digest.sceneNotes) parts.push(`**Scenes:** ${digest.sceneNotes}`);
            if (digest.openQuestions) parts.push(`**Open Questions:** ${digest.openQuestions}`);

            const summaryMsg: Message = {
                role: 'summary',
                content: parts.join('\n\n'),
                keyDecisions: digest.keyDecisions,
            };

            const compactedMessages = [summaryMsg, ...toKeep];
            store.setMessages(projectId, compactedMessages);

            // Sync compacted messages to server
            replaceConversationMessages(projectId, compactedMessages, {
                mode: session.mode,
                scriptContent: session.scriptContent,
                targetModel: session.targetModel,
            }).catch(e => console.warn('[ChatSidebar] Failed to sync compaction:', e.message));
        } catch (err) {
            console.error('Compaction failed (non-critical):', err);
        } finally {
            compactingRef.current = false;
            setIsCompacting(false);
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
            handleSendMessage(`I've uploaded my script "${file.name}" (${text.length.toLocaleString()} characters). Please analyze it and extract the key elements — scenes, characters, locations, mood, and visual direction.`);
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const validFiles: File[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file.type.startsWith('image/')) continue;
            if (file.size > 25 * 1024 * 1024) {
                alert(`"${file.name}" is too large. Maximum 25MB per image.`);
                continue;
            }
            validFiles.push(file);
        }

        if (validFiles.length === 0) {
            alert('No valid image files selected.');
            e.target.value = '';
            return;
        }

        const maxTotal = 10;
        const remaining = maxTotal - pendingImages.length;
        if (validFiles.length > remaining) {
            alert(`Maximum ${maxTotal} images per message. ${remaining} more allowed.`);
            validFiles.splice(remaining);
        }

        const uploadedUrls: string[] = [];
        for (const file of validFiles) {
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
                uploadedUrls.push(result.url);
            } catch (error) {
                console.error(`Image upload error for ${file.name}:`, error);
            }
        }

        if (uploadedUrls.length > 0) {
            setPendingImages(prev => [...prev, ...uploadedUrls]);
        }
        e.target.value = '';
    };

    // Collapsed state — just show toggle button
    if (collapsed) {
        return (
            <div style={styles.collapsedBar}>
                <button onClick={onToggleCollapse} style={styles.collapseBtn} title="Open AI Chat">
                    <PanelLeftOpen size={18} color="#8b5cf6" />
                </button>
            </div>
        );
    }

    return (
        <div style={styles.chatPanel}>
            {/* Header */}
            <div style={styles.chatHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Lightbulb size={18} color="#8b5cf6" />
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#e5e7eb' }}>AI Creative Director</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                    <button onClick={onToggleCollapse} style={styles.collapseBtn} title="Collapse chat">
                        <PanelLeftClose size={16} color="#6b7280" />
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
                        {msg.role === 'summary' ? (
                            <div style={{
                                backgroundColor: '#1a1a2e',
                                border: '1px solid #2d2b55',
                                borderRadius: '8px',
                                padding: '12px',
                                marginBottom: '4px',
                            }}>
                                <div style={{
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    color: '#6366f1',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    marginBottom: '8px',
                                }}>
                                    Context Digest (earlier conversation compacted)
                                </div>
                                {msg.content.split('\n').map((line, j) => (
                                    <p key={j} style={{ margin: '0 0 4px 0', lineHeight: '1.5', color: '#a5a3c9', fontSize: '12px' }}>
                                        {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                                    </p>
                                ))}
                                {msg.keyDecisions && msg.keyDecisions.length > 0 && (
                                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #2d2b55' }}>
                                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#6366f1', marginBottom: '4px' }}>KEY DECISIONS</div>
                                        {msg.keyDecisions.map((d, k) => (
                                            <div key={k} style={{ fontSize: '11px', color: '#a5a3c9', paddingLeft: '8px', marginBottom: '2px' }}>
                                                - {d}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                        <>
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
                        {(msg.imageUrls || (msg.imageUrl ? [msg.imageUrl] : [])).length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                                {(msg.imageUrls || (msg.imageUrl ? [msg.imageUrl] : [])).map((url, imgIdx) => (
                                    <img
                                        key={imgIdx}
                                        src={url}
                                        alt={`Reference ${imgIdx + 1}`}
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                        style={{
                                            maxWidth: (msg.imageUrls?.length || 1) > 1 ? 'calc(50% - 2px)' : '100%',
                                            maxHeight: '200px',
                                            borderRadius: '6px',
                                            objectFit: 'cover',
                                        }}
                                    />
                                ))}
                            </div>
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
                        {msg.createdObjects && msg.createdObjects.length > 0 && (
                            <div style={styles.updateBadge}>
                                <Check size={11} /> Objects added: {msg.createdObjects.map(o => o.name).join(', ')}
                            </div>
                        )}
                        {msg.updatedCharacters && msg.updatedCharacters.length > 0 && (
                            <div style={{ ...styles.updateBadge, borderColor: '#8b5cf6' }}>
                                <Sparkles size={11} /> Characters enhanced: {msg.updatedCharacters.map(c => c.name).join(', ')}
                            </div>
                        )}
                        {msg.updatedObjects && msg.updatedObjects.length > 0 && (
                            <div style={{ ...styles.updateBadge, borderColor: '#8b5cf6' }}>
                                <Sparkles size={11} /> Objects enhanced: {msg.updatedObjects.map(o => o.name).join(', ')}
                            </div>
                        )}
                        {msg.createdScenes && msg.createdScenes.length > 0 && (
                            <div style={styles.updateBadge}>
                                <Check size={11} /> Scenes created: {msg.createdScenes.map(s => `${s.name}${s.shotCount ? ` (${s.shotCount} shots)` : ''}`).join(', ')}
                            </div>
                        )}
                        </>
                        )}
                    </div>
                ))}
                {isThinking && (
                    <div style={{ ...styles.messageBubble, backgroundColor: '#1a1a2e', borderLeft: '2px solid #8b5cf6' }}>
                        <Loader2 size={14} className="spin" color="#8b5cf6" style={{ display: 'inline' }} /> Thinking...
                    </div>
                )}
                {isCompacting && (
                    <div style={{ padding: '6px 12px', fontSize: '11px', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Loader2 size={12} className="spin" color="#6366f1" style={{ display: 'inline' }} /> Compacting conversation history...
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Pending image preview */}
            {pendingImages.length > 0 && (
                <div style={styles.pendingImageBar}>
                    {pendingImages.map((url, idx) => (
                        <div key={idx} style={{ position: 'relative', display: 'inline-block' }}>
                            <img src={url} alt={`Attached ${idx + 1}`} style={{ height: '48px', borderRadius: '4px', objectFit: 'cover' }} />
                            <button
                                onClick={() => setPendingImages(prev => prev.filter((_, j) => j !== idx))}
                                style={{
                                    position: 'absolute', top: '-4px', right: '-4px',
                                    background: '#27272a', border: '1px solid #3f3f46', borderRadius: '50%',
                                    cursor: 'pointer', padding: '1px', display: 'flex', width: '16px', height: '16px',
                                    alignItems: 'center', justifyContent: 'center',
                                }}
                                title="Remove image"
                            >
                                <X size={10} color="#a1a1aa" />
                            </button>
                        </div>
                    ))}
                    <span style={{ fontSize: '11px', color: '#a78bfa', alignSelf: 'center' }}>
                        {pendingImages.length} image{pendingImages.length !== 1 ? 's' : ''} attached
                    </span>
                </div>
            )}

            {/* Input */}
            <div style={styles.inputArea}>
                <button
                    onClick={() => imageInputRef.current?.click()}
                    style={styles.iconBtn}
                    title="Share reference image"
                >
                    <Image size={16} color={pendingImages.length > 0 ? '#8b5cf6' : '#6b7280'} />
                </button>
                <input
                    type="text"
                    placeholder={pendingImages.length > 0 ? `Type a message about ${pendingImages.length > 1 ? 'these images' : 'this image'}...` : 'Talk to your Creative Director...'}
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
            <input ref={imageInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    chatPanel: {
        display: 'flex',
        flexDirection: 'column',
        width: '380px',
        minWidth: '380px',
        borderRight: '1px solid #27272a',
        backgroundColor: '#18181b',
        overflow: 'hidden',
    },
    collapsedBar: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '44px',
        minWidth: '44px',
        borderRight: '1px solid #27272a',
        backgroundColor: '#18181b',
        paddingTop: '12px',
    },
    collapseBtn: {
        padding: '6px',
        background: 'transparent',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
    },
    chatHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 12px',
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
        maxWidth: '140px',
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
        padding: '12px 12px',
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
        padding: '8px 12px',
        borderTop: '1px solid #27272a',
        backgroundColor: 'rgba(139, 92, 246, 0.08)',
        flexShrink: 0,
        flexWrap: 'wrap' as const,
        overflowX: 'auto',
    },
    inputArea: {
        display: 'flex',
        gap: '6px',
        padding: '10px 12px',
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
};
