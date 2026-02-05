import React, { useEffect, useState } from 'react';
import type { Scene } from '../types/schema';
import { getScenes, createScene, updateScene, deleteScene, getAllProjects } from '../services/api';

export const SceneManagerPage: React.FC = () => {
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [projectId, setProjectId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingScene, setEditingScene] = useState<Scene | null>(null);
    const [formData, setFormData] = useState<Partial<Scene>>({});

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
                const fetchedScenes = await getScenes(pid);
                setScenes(fetchedScenes);
            }
        } catch (error) {
            console.error("Failed to load scenes", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (scene?: Scene) => {
        if (scene) {
            setEditingScene(scene);
            setFormData(scene);
        } else {
            setEditingScene(null);
            setFormData({});
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingScene(null);
        setFormData({});
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!projectId) return;
        try {
            if (editingScene) {
                await updateScene(editingScene.id, formData);
            } else {
                await createScene(projectId, formData);
            }
            handleCloseModal();
            loadData();
        } catch (error) {
            console.error("Failed to save scene", error);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this scene?')) {
            await deleteScene(id);
            loadData();
        }
    };

    const handleMove = async (index: number, direction: 'up' | 'down') => {
        if (!scenes || scenes.length < 2) return;

        const newScenes = [...scenes];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newScenes.length) return;

        const temp = newScenes[index];
        newScenes[index] = newScenes[targetIndex];
        newScenes[targetIndex] = temp;

        setScenes(newScenes);

        const sceneA = newScenes[index];
        const sceneB = newScenes[targetIndex];

        await updateScene(sceneA.id, { order_index: index + 1 });
        await updateScene(sceneB.id, { order_index: targetIndex + 1 });

        loadData();
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
        list: {
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '16px',
            maxWidth: '800px',
            margin: '0 auto'
        },
        card: {
            backgroundColor: '#27272a',
            border: '1px solid #3f3f46',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
        },
        controls: {
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '4px'
        },
        controlBtn: {
            backgroundColor: '#18181b',
            border: '1px solid #3f3f46',
            color: '#9ca3af',
            borderRadius: '4px',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '10px'
        },
        indexBadge: {
            width: '40px',
            height: '40px',
            backgroundColor: '#18181b',
            border: '1px solid #3f3f46',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#e5e7eb'
        },
        content: {
            flex: 1
        },
        title: {
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#e5e7eb',
            margin: '0 0 4px 0'
        },
        desc: {
            fontSize: '14px',
            color: '#9ca3af',
            margin: 0
        },
        actions: {
            display: 'flex',
            gap: '8px'
        },
        smallBtn: {
            backgroundColor: '#3f3f46',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '12px',
            cursor: 'pointer'
        },
        deleteBtn: {
            backgroundColor: '#3f3f46',
            color: '#ef4444',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '12px',
            cursor: 'pointer'
        },

        // Consistent Modal Styles
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
        }
    };

    if (loading) return <div style={{ padding: '32px', color: 'white' }}>Loading scenes...</div>;
    if (!projectId) return <div style={{ padding: '32px', color: 'white' }}>No project found. Create a project first.</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.h1}>Scene Manager</h1>
                <button
                    onClick={() => handleOpenModal()}
                    style={styles.addButton}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                >
                    + Add Scene
                </button>
            </div>

            <div style={styles.list}>
                {scenes.map((scene, index) => (
                    <div key={scene.id} style={styles.card}>
                        <div style={styles.controls}>
                            <button
                                onClick={() => handleMove(index, 'up')}
                                disabled={index === 0}
                                style={{ ...styles.controlBtn, opacity: index === 0 ? 0.3 : 1 }}
                            >
                                ▲
                            </button>
                            <button
                                onClick={() => handleMove(index, 'down')}
                                disabled={index === scenes.length - 1}
                                style={{ ...styles.controlBtn, opacity: index === scenes.length - 1 ? 0.3 : 1 }}
                            >
                                ▼
                            </button>
                        </div>
                        <div style={styles.indexBadge}>
                            {index + 1}
                        </div>
                        <div style={styles.content}>
                            <h3 style={styles.title}>{scene.name}</h3>
                            <p style={styles.desc}>{scene.description || 'No description'}</p>
                        </div>
                        <div style={styles.actions}>
                            <button
                                onClick={() => handleOpenModal(scene)}
                                style={styles.smallBtn}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#52525b'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3f3f46'}
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(scene.id)}
                                style={styles.deleteBtn}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#52525b'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3f3f46'}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
                {scenes.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#52525b', border: '1px dashed #3f3f46', borderRadius: '12px' }}>
                        No scenes created yet. Click "Add Scene" to start.
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h2 style={{ ...styles.h1, fontSize: '24px', marginBottom: '24px' }}>
                            {editingScene ? 'Edit Scene' : 'Add Scene'}
                        </h2>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Scene Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name || ''}
                                onChange={handleChange}
                                style={styles.input}
                                placeholder="EXT. DESERT - DAY"
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Description</label>
                            <textarea
                                name="description"
                                value={formData.description || ''}
                                onChange={handleChange}
                                style={styles.textarea}
                                placeholder="Brief summary of what happens..."
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Location/Setting</label>
                            <input
                                type="text"
                                name="location_setting"
                                value={formData.location_setting || ''}
                                onChange={handleChange}
                                style={styles.input}
                                placeholder="e.g., Corporate office interior, modern glass building"
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Time of Day</label>
                            <input
                                type="text"
                                name="time_of_day"
                                value={formData.time_of_day || ''}
                                onChange={handleChange}
                                style={styles.input}
                                placeholder="e.g., Night, 11pm"
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Weather/Atmosphere</label>
                            <input
                                type="text"
                                name="weather_atmosphere"
                                value={formData.weather_atmosphere || ''}
                                onChange={handleChange}
                                style={styles.input}
                                placeholder="e.g., Overcast, raining outside (if applicable)"
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Scene Mood/Tone</label>
                            <input
                                type="text"
                                name="mood_tone"
                                value={formData.mood_tone || ''}
                                onChange={handleChange}
                                style={styles.input}
                                placeholder="e.g., Tense, suspenseful, isolated"
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Lighting Notes</label>
                            <textarea
                                name="lighting_notes"
                                value={formData.lighting_notes || ''}
                                onChange={handleChange}
                                style={styles.textarea}
                                placeholder="e.g., Harsh fluorescent overhead, shadows from blinds"
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Camera Approach</label>
                            <textarea
                                name="camera_approach"
                                value={formData.camera_approach || ''}
                                onChange={handleChange}
                                style={styles.textarea}
                                placeholder="e.g., Handheld, intimate, claustrophobic framing"
                            />
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
