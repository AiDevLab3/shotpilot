import React, { useEffect, useState } from 'react';
import type { Character } from '../types/schema';
import { getCharacters, createCharacter, updateCharacter, deleteCharacter, getAllProjects, fileToBase64 } from '../services/api';

export const CharacterBiblePage: React.FC = () => {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [projectId, setProjectId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingChar, setEditingChar] = useState<Character | null>(null);
    const [formData, setFormData] = useState<Partial<Character>>({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const projects = await getAllProjects();
            if (projects.length > 0) {
                const pid = projects[0].id;
                setProjectId(pid);
                const chars = await getCharacters(pid);
                setCharacters(chars);
            }
        } catch (error) {
            console.error("Failed to load characters", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (char?: Character) => {
        if (char) {
            setEditingChar(char);
            setFormData(char);
        } else {
            setEditingChar(null);
            setFormData({});
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingChar(null);
        setFormData({});
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                if (file.size > 20 * 1024 * 1024) {
                    alert("File is too large! Please choose an image under 20MB.");
                    return;
                }
                const base64 = await fileToBase64(file);
                setFormData(prev => ({ ...prev, reference_image_url: base64 }));
            } catch (error) {
                console.error("Failed to upload image", error);
                alert("Failed to upload image.");
            }
        }
    };

    const handleRemoveImage = () => {
        setFormData(prev => ({ ...prev, reference_image_url: '' }));
    };

    const handleSave = async () => {
        if (!projectId) return;
        try {
            if (editingChar) {
                await updateCharacter(editingChar.id, formData);
            } else {
                await createCharacter(projectId, formData);
            }
            handleCloseModal();
            loadData();
        } catch (error: any) {
            console.error("Failed to save character", error);
            alert(`Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this character?')) {
            await deleteCharacter(id);
            loadData();
        }
    };

    // Inline Styles
    const styles = {
        container: {
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '32px',
            fontFamily: 'sans-serif',
            color: '#E8E8E8'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px'
        },
        h1: {
            fontSize: '30px',
            fontWeight: 'bold',
            color: '#ffffff',
            margin: 0
        },
        addButton: {
            backgroundColor: '#2563eb',
            color: '#ffffff',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '500',
            cursor: 'pointer',
            fontSize: '14px'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px'
        },
        card: {
            backgroundColor: '#27272a',
            border: '1px solid #3f3f46',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column' as const
        },
        cardImage: {
            aspectRatio: '16/9',
            backgroundColor: '#000',
            position: 'relative' as const,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#52525b',
            overflow: 'hidden'
        },
        cardContent: {
            padding: '16px'
        },
        cardTitle: {
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#e5e7eb',
            marginBottom: '4px',
            margin: 0
        },
        cardDesc: {
            fontSize: '14px',
            color: '#9ca3af',
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const
        },
        modalOverlay: {
            position: 'fixed' as const,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px'
        },
        modalContent: {
            backgroundColor: '#27272a',
            border: '1px solid #3f3f46',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '500px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        },
        formGroup: {
            marginBottom: '16px'
        },
        label: {
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#d1d5db',
            marginBottom: '8px'
        },
        input: {
            width: '100%',
            backgroundColor: '#18181b',
            border: '1px solid #52525b',
            borderRadius: '6px',
            padding: '8px 12px',
            color: '#e5e7eb',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box' as const
        },
        textarea: {
            width: '100%',
            backgroundColor: '#18181b',
            border: '1px solid #52525b',
            borderRadius: '6px',
            padding: '12px',
            color: '#e5e7eb',
            fontSize: '14px',
            outline: 'none',
            resize: 'vertical' as const,
            boxSizing: 'border-box' as const,
            minHeight: '80px',
            fontFamily: 'sans-serif'
        },
        modalActions: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '24px'
        },
        cancelButton: {
            backgroundColor: 'transparent',
            color: '#9ca3af',
            padding: '10px 20px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px'
        },
        saveButton: {
            backgroundColor: '#2563eb',
            color: '#ffffff',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '500',
            cursor: 'pointer',
            fontSize: '14px'
        },
        deleteButton: {
            position: 'absolute' as const,
            top: '8px',
            right: '8px',
            backgroundColor: 'rgba(0,0,0,0.6)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '4px 8px',
            cursor: 'pointer',
            fontSize: '12px'
        },
        editButton: {
            position: 'absolute' as const,
            top: '8px',
            right: '40px',
            backgroundColor: 'rgba(0,0,0,0.6)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '4px 8px',
            cursor: 'pointer',
            fontSize: '12px'
        },
        uploadLabel: {
            display: 'block',
            width: '100%',
            padding: '32px',
            border: '2px dashed #3f3f46',
            borderRadius: '8px',
            textAlign: 'center' as const,
            cursor: 'pointer',
            color: '#9ca3af',
            marginBottom: '8px'
        },
        previewContainer: {
            position: 'relative' as const,
            width: '150px',
            height: '200px',
            margin: '0 auto',
            border: '1px solid #3f3f46',
            borderRadius: '8px',
            overflow: 'hidden'
        },
        previewImage: {
            width: '100%',
            height: '100%',
            objectFit: 'cover' as const
        },
        removeBtn: {
            position: 'absolute' as const,
            top: '4px',
            right: '4px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '14px'
        }
    };

    if (loading) return <div style={{ padding: '32px', color: 'white' }}>Loading characters...</div>;
    if (!projectId) return <div style={{ padding: '32px', color: 'white' }}>No project found. Create a project first.</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.h1}>Character Bible</h1>
                <button
                    onClick={() => handleOpenModal()}
                    style={styles.addButton}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                >
                    + Add Character
                </button>
            </div>

            <div style={styles.grid}>
                {characters.map(char => (
                    <div key={char.id} style={styles.card}>
                        <div style={styles.cardImage}>
                            {char.reference_image_url ? (
                                <img
                                    src={char.reference_image_url}
                                    alt={char.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <span>No Image</span>
                            )}
                            <button onClick={() => handleOpenModal(char)} style={styles.editButton}>Edit</button>
                            <button onClick={() => handleDelete(char.id)} style={styles.deleteButton}>✕</button>
                        </div>
                        <div style={styles.cardContent}>
                            <h3 style={styles.cardTitle}>{char.name}</h3>
                            <p style={styles.cardDesc}>{char.description || 'No description'}</p>
                        </div>
                    </div>
                ))}
            </div>

            {characters.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#52525b', border: '1px dashed #3f3f46', borderRadius: '12px' }}>
                    No characters created yet.
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h2 style={{ ...styles.h1, fontSize: '24px', marginBottom: '24px' }}>
                            {editingChar ? 'Edit Character' : 'Add Character'}
                        </h2>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name || ''}
                                onChange={handleChange}
                                style={styles.input}
                                placeholder="Character Name"
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Description</label>
                            <textarea
                                name="description"
                                value={formData.description || ''}
                                onChange={handleChange}
                                style={styles.textarea}
                                placeholder="Physical description..."
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Personality</label>
                            <textarea
                                name="personality"
                                value={formData.personality || ''}
                                onChange={handleChange}
                                style={styles.textarea}
                                placeholder="Personality traits..."
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Reference Image</label>
                            {formData.reference_image_url ? (
                                <div style={styles.previewContainer}>
                                    <img src={formData.reference_image_url} alt="Preview" style={styles.previewImage} />
                                    <button onClick={handleRemoveImage} style={styles.removeBtn}>✕</button>
                                </div>
                            ) : (
                                <label style={styles.uploadLabel}>
                                    <div>📷 Upload Image (Max 20MB)</div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                            )}
                        </div>

                        <div style={styles.modalActions}>
                            <button
                                onClick={handleCloseModal}
                                style={styles.cancelButton}
                                onMouseOver={(e) => e.currentTarget.style.color = '#ffffff'}
                                onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                style={styles.saveButton}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
