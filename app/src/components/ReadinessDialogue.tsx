import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Loader2, X, Sparkles } from 'lucide-react';
import { sendReadinessDialogue } from '../services/api';
import type { QualityDialogueResponse } from '../types/schema';

interface ReadinessDialogueProps {
    isOpen: boolean;
    onClose: () => void;
    shotId: number;
    readinessScore: number;
}

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

const WELCOME_MESSAGE =
    'I can help explain prompt readiness recommendations, discuss trade-offs, and suggest alternatives for your shot fields. What would you like to know?';

const QUICK_QUESTIONS = [
    'Why is my readiness score low?',
    "What's the most impactful field to fill?",
    'Explain camera angle options',
];

export const ReadinessDialogue: React.FC<ReadinessDialogueProps> = ({
    isOpen,
    onClose,
    shotId,
    readinessScore,
}) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const chatBodyRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages, loading]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSend = async (text?: string) => {
        const message = (text ?? inputValue).trim();
        if (!message || loading) return;

        const userMessage: ChatMessage = { role: 'user', content: message };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInputValue('');
        setLoading(true);

        try {
            const historyForApi = updatedMessages.slice(-10);
            const data: QualityDialogueResponse = await sendReadinessDialogue(
                shotId,
                message,
                historyForApi,
            );

            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: data.response,
            };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (err: any) {
            const errorMessage: ChatMessage = {
                role: 'assistant',
                content: `Sorry, I encountered an error: ${err.message || 'Unknown error'}. Please try again.`,
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleQuickQuestion = (question: string) => {
        handleSend(question);
    };

    if (!isOpen) return null;

    const conversationEmpty = messages.length === 0;
    const canSend = inputValue.trim().length > 0 && !loading;

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.headerLeft}>
                        <MessageCircle size={20} color="#8b5cf6" />
                        <h2 style={styles.title}>Prompt Readiness</h2>
                        <span style={styles.scoreBadge}>
                            {Math.round(readinessScore)}%
                        </span>
                    </div>
                    <button onClick={onClose} style={styles.closeBtn}>
                        <X size={18} />
                    </button>
                </div>

                <div style={styles.divider} />

                {/* Chat body */}
                <div style={styles.chatBody} ref={chatBodyRef}>
                    <div style={styles.assistantRow}>
                        <div style={styles.avatarAi}>
                            <Sparkles size={14} color="#8b5cf6" />
                        </div>
                        <div style={styles.assistantBubble}>
                            {WELCOME_MESSAGE}
                        </div>
                    </div>

                    {messages.map((msg, idx) =>
                        msg.role === 'user' ? (
                            <div key={idx} style={styles.userRow}>
                                <div style={styles.userBubble}>{msg.content}</div>
                            </div>
                        ) : (
                            <div key={idx} style={styles.assistantRow}>
                                <div style={styles.avatarAi}>
                                    <Sparkles size={14} color="#8b5cf6" />
                                </div>
                                <div style={styles.assistantBubble}>
                                    {msg.content}
                                </div>
                            </div>
                        ),
                    )}

                    {loading && (
                        <div style={styles.assistantRow}>
                            <div style={styles.avatarAi}>
                                <Sparkles size={14} color="#8b5cf6" />
                            </div>
                            <div style={styles.typingBubble}>
                                <Loader2
                                    size={16}
                                    color="#8b5cf6"
                                    className="spin"
                                />
                                <span style={styles.typingText}>
                                    Thinking...
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div style={styles.divider} />

                {conversationEmpty && (
                    <div style={styles.quickQuestionsRow}>
                        {QUICK_QUESTIONS.map((q, idx) => (
                            <button
                                key={idx}
                                style={styles.quickChip}
                                onClick={() => handleQuickQuestion(q)}
                                onMouseEnter={e => {
                                    e.currentTarget.style.backgroundColor = '#3f3f46';
                                    e.currentTarget.style.borderColor = '#8b5cf6';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.backgroundColor = '#27272a';
                                    e.currentTarget.style.borderColor = '#3f3f46';
                                }}
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                )}

                <div style={styles.inputArea}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about readiness, trade-offs, alternatives..."
                        style={styles.textInput}
                        disabled={loading}
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={!canSend}
                        style={{
                            ...styles.sendBtn,
                            opacity: canSend ? 1 : 0.4,
                            cursor: canSend ? 'pointer' : 'not-allowed',
                        }}
                    >
                        {loading ? (
                            <Loader2 size={16} className="spin" />
                        ) : (
                            <Send size={16} />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Backward compat
export const QualityDialogue = ReadinessDialogue;

const styles: Record<string, React.CSSProperties> = {
    overlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    modal: {
        backgroundColor: '#18181b', borderRadius: '12px', width: '100%', maxWidth: '560px',
        border: '1px solid #3f3f46', maxHeight: '85vh', display: 'flex', flexDirection: 'column',
    },
    header: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px',
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
    title: { color: '#e5e7eb', fontSize: '16px', fontWeight: 700, margin: 0 },
    scoreBadge: {
        backgroundColor: '#27272a', color: '#8b5cf6', fontSize: '12px', fontWeight: 700,
        padding: '3px 8px', borderRadius: '9999px', border: '1px solid #3f3f46',
    },
    closeBtn: {
        background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer',
        padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center', flexShrink: 0,
    },
    divider: { height: '1px', backgroundColor: '#3f3f46', flexShrink: 0 },
    chatBody: {
        flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex',
        flexDirection: 'column', gap: '14px', minHeight: '200px', maxHeight: '400px',
    },
    userRow: { display: 'flex', justifyContent: 'flex-end' },
    assistantRow: { display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '10px' },
    avatarAi: {
        width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#27272a',
        border: '1px solid #3f3f46', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, marginTop: '2px',
    },
    userBubble: {
        backgroundColor: 'rgba(37, 99, 235, 0.125)', border: '1px solid rgba(37, 99, 235, 0.25)',
        borderRadius: '12px 12px 4px 12px', padding: '10px 14px', color: '#e5e7eb',
        fontSize: '13px', lineHeight: '1.55', maxWidth: '80%', wordBreak: 'break-word' as const,
    },
    assistantBubble: {
        backgroundColor: '#1f1f23', border: '1px solid #3f3f46',
        borderRadius: '12px 12px 12px 4px', padding: '10px 14px', color: '#e5e7eb',
        fontSize: '13px', lineHeight: '1.55', maxWidth: '80%',
        wordBreak: 'break-word' as const, whiteSpace: 'pre-wrap' as const,
    },
    typingBubble: {
        backgroundColor: '#1f1f23', border: '1px solid #3f3f46',
        borderRadius: '12px 12px 12px 4px', padding: '10px 14px',
        display: 'flex', alignItems: 'center', gap: '8px',
    },
    typingText: { color: '#6b7280', fontSize: '13px', fontStyle: 'italic' },
    quickQuestionsRow: {
        display: 'flex', flexWrap: 'wrap' as const, gap: '8px', padding: '12px 20px 4px',
    },
    quickChip: {
        backgroundColor: '#27272a', border: '1px solid #3f3f46', borderRadius: '9999px',
        padding: '6px 14px', color: '#e5e7eb', fontSize: '12px', cursor: 'pointer',
        transition: 'background-color 0.15s, border-color 0.15s', whiteSpace: 'nowrap' as const,
    },
    inputArea: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px 16px' },
    textInput: {
        flex: 1, backgroundColor: '#27272a', border: '1px solid #3f3f46', borderRadius: '8px',
        padding: '10px 14px', color: '#e5e7eb', fontSize: '13px', outline: 'none',
    },
    sendBtn: {
        width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#8b5cf6',
        border: 'none', color: 'white', display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0, transition: 'opacity 0.15s',
    },
};
