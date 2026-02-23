import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, X, MessageCircle } from 'lucide-react';
import { creativeDirectorChat } from '../services/api';
import type { Shot, Scene, Project } from '../types/schema';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ShotChatPanelProps {
  shot: Shot;
  scene: Scene;
  project: Project;
  /** Pre-loaded context to seed the conversation (e.g. suggestion reasoning, cohesion issue) */
  initialContext?: string;
  onClose: () => void;
  /** Called when CD recommends an action the user can execute */
  onAction?: (action: { type: string; shotId: number; model?: string; instruction?: string }) => void;
}

export const ShotChatPanel: React.FC<ShotChatPanelProps> = ({
  shot,
  scene,
  project,
  initialContext,
  onClose,
  onAction,
}) => {
  const buildSystemContext = () => {
    const parts = [
      `You're discussing Shot ${shot.shot_number} in Scene "${scene.name}".`,
      shot.shot_type ? `Shot type: ${shot.shot_type}` : '',
      shot.camera_angle ? `Camera angle: ${shot.camera_angle}` : '',
      shot.description ? `Description: ${shot.description}` : '',
      scene.description ? `Scene description: ${scene.description}` : '',
      scene.location_setting ? `Location: ${scene.location_setting}` : '',
      scene.mood_tone ? `Mood: ${scene.mood_tone}` : '',
      initialContext ? `\nContext for this discussion:\n${initialContext}` : '',
      '\nHelp the filmmaker make a decision about this specific shot. Be concise and actionable.',
    ];
    return parts.filter(Boolean).join('\n');
  };

  const systemMsg: ChatMessage = { role: 'system', content: buildSystemContext() };
  const welcomeMsg: ChatMessage = {
    role: 'assistant',
    content: initialContext
      ? `Let's discuss **Shot ${shot.shot_number}** (${shot.shot_type || 'untyped'}) in **${scene.name}**.\n\n${initialContext}\n\nWhat would you like to do?`
      : `What would you like to discuss about **Shot ${shot.shot_number}** (${shot.shot_type || 'untyped'}) in **${scene.name}**?`,
  };

  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMsg]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  const handleSend = async () => {
    if (!input.trim() || thinking) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setThinking(true);

    try {
      // Build history with system context injected
      const history = [
        { role: 'system', content: systemMsg.content },
        ...newMessages.map(m => ({ role: m.role, content: m.content })),
      ];

      const result = await creativeDirectorChat(
        project.id,
        input,
        history,
        '', // no script needed for shot-level chat
        'shot-discussion',
      );

      const responseText = typeof result.response === 'string'
        ? result.response
        : 'I had trouble formatting my response. Could you rephrase?';

      setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
    } catch (err) {
      console.error('Shot chat error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I hit an error. Try again?' }]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '400px',
      backgroundColor: '#18181b',
      borderLeft: '1px solid #27272a',
      zIndex: 1100,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '-4px 0 24px rgba(0,0,0,0.4)',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #27272a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageCircle size={16} color="#8b5cf6" />
          <div>
            <div style={{ color: '#e5e7eb', fontSize: '13px', fontWeight: 600 }}>
              Shot {shot.shot_number} Discussion
            </div>
            <div style={{ color: '#6b7280', fontSize: '10px' }}>
              {scene.name} • {shot.shot_type || 'Untyped'}
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '4px' }}>
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 16px',
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: '14px' }}>
            <div style={{
              fontSize: '9px',
              fontWeight: 700,
              color: msg.role === 'user' ? '#6b7280' : '#8b5cf6',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '4px',
            }}>
              {msg.role === 'user' ? 'YOU' : 'DIRECTOR'}
            </div>
            <div style={{
              padding: '10px 12px',
              borderRadius: '6px',
              backgroundColor: msg.role === 'user' ? '#27272a' : '#1a1a2e',
              borderLeft: msg.role === 'assistant' ? '2px solid #8b5cf6' : 'none',
              color: '#d1d5db',
              fontSize: '13px',
              lineHeight: '1.5',
            }}>
              {msg.content.split('\n').map((line, j) => (
                <p key={j} style={{ margin: '0 0 4px 0' }}>
                  {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                </p>
              ))}
            </div>
          </div>
        ))}
        {thinking && (
          <div style={{
            padding: '10px 12px',
            borderRadius: '6px',
            backgroundColor: '#1a1a2e',
            borderLeft: '2px solid #8b5cf6',
            color: '#a78bfa',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Thinking...
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div style={{
        display: 'flex',
        gap: '6px',
        padding: '10px 12px',
        borderTop: '1px solid #27272a',
        flexShrink: 0,
        alignItems: 'center',
      }}>
        <input
          type="text"
          placeholder="Ask about this shot..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={thinking}
          style={{
            flex: 1,
            padding: '10px 12px',
            backgroundColor: '#27272a',
            border: '1px solid #3f3f46',
            borderRadius: '8px',
            color: '#e5e7eb',
            fontSize: '13px',
            outline: 'none',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || thinking}
          style={{
            padding: '10px 14px',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: input.trim() && !thinking ? '#8b5cf6' : '#3f3f46',
            color: 'white',
            cursor: input.trim() && !thinking ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
};
