import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface MentionEntity {
    id: number;
    name: string;
    type: 'character' | 'object';
    description?: string;
}

interface MentionTextareaProps {
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    style?: React.CSSProperties;
    entities: MentionEntity[];
}

/**
 * Textarea with @mention autocomplete for characters and objects.
 * When the user types @, a dropdown appears with matching entities.
 * Selecting an entity inserts @Name (or @"Name With Spaces") into the text.
 */
export const MentionTextarea: React.FC<MentionTextareaProps> = ({
    name,
    value,
    onChange,
    placeholder,
    style,
    entities,
}) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [filter, setFilter] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [mentionStart, setMentionStart] = useState<number | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter entities based on current typed text after @
    const filtered = entities.filter(e =>
        e.name.toLowerCase().includes(filter.toLowerCase())
    );

    // Reset selection when filter changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [filter]);

    const insertMention = useCallback((entity: MentionEntity) => {
        if (mentionStart === null) return;

        const before = value.substring(0, mentionStart);
        const after = value.substring(textareaRef.current?.selectionStart ?? value.length);

        // Use @"Name" for names with spaces, @Name for single words
        const mentionText = entity.name.includes(' ')
            ? `@"${entity.name}"`
            : `@${entity.name}`;

        const newValue = before + mentionText + ' ' + after;

        // Create a synthetic change event
        const syntheticEvent = {
            target: { name, value: newValue },
        } as React.ChangeEvent<HTMLTextAreaElement>;

        onChange(syntheticEvent);
        setShowDropdown(false);
        setMentionStart(null);
        setFilter('');

        // Re-focus and set cursor position after the mention
        setTimeout(() => {
            if (textareaRef.current) {
                const cursorPos = before.length + mentionText.length + 1;
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(cursorPos, cursorPos);
            }
        }, 0);
    }, [mentionStart, value, name, onChange]);

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e);

        const cursorPos = e.target.selectionStart;
        const text = e.target.value;

        // Find the @ character before the cursor
        const textBeforeCursor = text.substring(0, cursorPos);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');

        if (lastAtIndex >= 0) {
            // Check that @ is at start of text or preceded by whitespace/newline
            const charBefore = lastAtIndex > 0 ? text[lastAtIndex - 1] : ' ';
            if (charBefore === ' ' || charBefore === '\n' || charBefore === '\t' || lastAtIndex === 0) {
                const typed = textBeforeCursor.substring(lastAtIndex + 1);
                // Only show if they haven't typed a space yet (still building the mention)
                if (!typed.includes(' ') || typed.startsWith('"')) {
                    setMentionStart(lastAtIndex);
                    setFilter(typed.replace(/^"/, ''));
                    setShowDropdown(true);
                    return;
                }
            }
        }

        setShowDropdown(false);
        setMentionStart(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!showDropdown || filtered.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            insertMention(filtered[selectedIndex]);
        } else if (e.key === 'Escape') {
            setShowDropdown(false);
        }
    };

    // Scroll selected item into view
    useEffect(() => {
        if (dropdownRef.current) {
            const item = dropdownRef.current.children[selectedIndex] as HTMLElement;
            if (item) item.scrollIntoView({ block: 'nearest' });
        }
    }, [selectedIndex]);

    return (
        <div style={{ position: 'relative' }}>
            <textarea
                ref={textareaRef}
                name={name}
                value={value}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                    // Delay to allow click on dropdown
                    setTimeout(() => setShowDropdown(false), 200);
                }}
                placeholder={placeholder}
                style={style}
            />
            {showDropdown && filtered.length > 0 && (
                <div
                    ref={dropdownRef}
                    style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: 0,
                        right: 0,
                        maxHeight: '180px',
                        overflowY: 'auto',
                        background: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '6px',
                        marginBottom: '4px',
                        zIndex: 1000,
                        boxShadow: '0 -4px 16px rgba(0,0,0,0.4)',
                    }}
                >
                    {filtered.map((entity, i) => (
                        <div
                            key={`${entity.type}-${entity.id}`}
                            onMouseDown={(e) => {
                                e.preventDefault(); // prevent textarea blur
                                insertMention(entity);
                            }}
                            style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                background: i === selectedIndex ? '#374151' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                borderBottom: i < filtered.length - 1 ? '1px solid #2d3748' : 'none',
                            }}
                        >
                            <span style={{
                                fontSize: '10px',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                fontWeight: 600,
                                background: entity.type === 'character' ? 'rgba(59,130,246,0.2)' : 'rgba(234,179,8,0.2)',
                                color: entity.type === 'character' ? '#60a5fa' : '#fbbf24',
                            }}>
                                {entity.type === 'character' ? 'CHAR' : 'OBJ'}
                            </span>
                            <span style={{ color: '#e5e7eb', fontSize: '13px', fontWeight: 500 }}>
                                {entity.name}
                            </span>
                            {entity.description && (
                                <span style={{ color: '#6b7280', fontSize: '11px', marginLeft: 'auto', maxWidth: '50%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {entity.description}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
