import React, { useEffect, useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import type { ObjectItem } from '../types/schema';
import { getObjects, createObject, updateObject, deleteObject, getObjectSuggestions } from '../services/api';
import { ObjectAIAssistant } from '../components/ObjectAIAssistant';
import { useProjectContext } from '../components/ProjectLayout';

export const ObjectBiblePage: React.FC = () => {
    const { projectId, project } = useProjectContext();
    const [objects, setObjects] = useState<ObjectItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingObj, setEditingObj] = useState<ObjectItem | null>(null);
    const [formData, setFormData] = useState<Partial<ObjectItem>>({});
    const [enhancing, setEnhancing] = useState(false);

    // Parse project frame_size (e.g. "16:9 Widescreen") to CSS aspect-ratio (e.g. "16/9")
    const frameAspectRatio = (() => {
        const fs = project?.frame_size;
        if (!fs) return '16/9';
        const match = fs.match(/^([\d.]+):([\d.]+)/);
        return match ? `${match[1]}/${match[2]}` : '16/9';
    })();

    useEffect(() => {
        loadData();
    }, [projectId]);

    const loadData = async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const objs = await getObjects(projectId);
            setObjects(objs);
        } catch (error) {
            console.error("Failed to load objects", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (obj?: ObjectItem) => {
        if (obj) {
            setEditingObj(obj);
            setFormData(obj);
        } else {
            setEditingObj(null);
            setFormData({});
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingObj(null);
        setFormData({});
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!projectId) return;
        try {
            if (editingObj) {
                await updateObject(editingObj.id, formData);
            } else {
                await createObject(projectId, formData);
            }
            handleCloseModal();
            loadData();
        } catch (error: any) {
            console.error("Failed to save object", error);
            alert(`Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleEnhance = async () => {
        if (!projectId || !formData.name) return;
        setEnhancing(true);
        try {
            const result = await getObjectSuggestions(projectId, {
                name: formData.name,
                description: formData.description,
                descriptionOnly: true,
            });
            if (result.description) setFormData(prev => ({ ...prev, description: result.description }));
        } catch (err) {
            console.error('Failed to enhance', err);
        } finally {
            setEnhancing(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this object?')) {
            await deleteObject(id);
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
            alignItems: 'flex-start',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '24px 16px',
            overflowY: 'auto' as const,
        },
        modalContent: {
            backgroundColor: '#27272a',
            border: '1px solid #3f3f46',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '560px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            margin: 'auto 0',
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
    };

    if (loading) return <div style={{ padding: '32px', color: 'white' }}>Loading objects...</div>;
    if (!projectId) return <div style={{ padding: '32px', color: 'white' }}>No project found. Create a project first.</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.h1}>Object Bible</h1>
                <button
                    onClick={() => handleOpenModal()}
                    style={styles.addButton}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                >
                    + Add Object
                </button>
            </div>

            <div style={styles.grid}>
                {objects.map(obj => (
                    <div key={obj.id} style={styles.card}>
                        <div style={{ ...styles.cardImage, aspectRatio: frameAspectRatio }}>
                            {obj.reference_image_url ? (
                                <img
                                    src={obj.reference_image_url}
                                    alt={obj.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <span>No Image</span>
                            )}
                            <button onClick={() => handleOpenModal(obj)} style={styles.editButton}>Edit</button>
                            <button onClick={() => handleDelete(obj.id)} style={styles.deleteButton}>✕</button>
                        </div>
                        <div style={styles.cardContent}>
                            <h3 style={styles.cardTitle}>{obj.name}</h3>
                            <p style={styles.cardDesc}>{obj.description || 'No description'}</p>
                        </div>
                    </div>
                ))}
            </div>

            {objects.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#52525b', border: '1px dashed #3f3f46', borderRadius: '12px' }}>
                    No objects created yet.
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h2 style={{ ...styles.h1, fontSize: '24px', marginBottom: '24px' }}>
                            {editingObj ? 'Edit Object' : 'Add Object'}
                        </h2>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name || ''}
                                onChange={handleChange}
                                style={styles.input}
                                placeholder="Object Name"
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <label style={{ ...styles.label, marginBottom: 0 }}>Description</label>
                                <button
                                    onClick={handleEnhance}
                                    disabled={enhancing || !formData.name}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '4px',
                                        padding: '3px 8px', backgroundColor: 'transparent',
                                        border: '1px solid #8b5cf6', borderRadius: '4px',
                                        color: '#a78bfa', fontSize: '11px', cursor: enhancing || !formData.name ? 'not-allowed' : 'pointer',
                                        opacity: enhancing || !formData.name ? 0.5 : 1,
                                    }}
                                >
                                    {enhancing ? <Loader2 size={11} className="spin" /> : <Sparkles size={11} />}
                                    {enhancing ? 'Enhancing...' : 'Enhance with AI'}
                                </button>
                            </div>
                            <textarea
                                name="description"
                                value={formData.description || ''}
                                onChange={handleChange}
                                style={styles.textarea}
                                placeholder="Object details..."
                            />
                        </div>

                        {/* AI Object Assistant */}
                        {projectId && (
                            <div style={styles.formGroup}>
                                <ObjectAIAssistant
                                    projectId={projectId}
                                    objectId={editingObj?.id}
                                    objectName={formData.name || ''}
                                    currentDescription={formData.description}
                                />
                            </div>
                        )}

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
