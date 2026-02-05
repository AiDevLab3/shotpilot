import React, { useEffect, useState } from 'react';
import type { Project } from '../types/schema';
import { updateProject, createProject, getAllProjects } from '../services/api';

export const ProjectInfoPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [projectId, setProjectId] = useState<number | null>(null);
    const [formData, setFormData] = useState<Partial<Project>>({});

    useEffect(() => {
        loadProject();
    }, []);

    const loadProject = async () => {
        setLoading(true);
        try {
            const projects = await getAllProjects();
            if (projects.length > 0) {
                setProjectId(projects[0].id);
                setFormData(projects[0]);
            } else {
                await createProject({ title: 'My New Movie' });
                const newProjects = await getAllProjects();
                if (newProjects.length > 0) {
                    setProjectId(newProjects[0].id);
                    setFormData(newProjects[0]);
                }
            }
        } catch (error) {
            console.error("Failed to load project", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!projectId) return;
        try {
            await updateProject(projectId, formData);
            alert('Project saved successfully!');
            await loadProject();
        } catch (error) {
            console.error("Failed to save project", error);
            alert('Failed to save project.');
        }
    };

    if (loading) return <div style={{ padding: '32px', color: 'white' }}>Loading project...</div>;

    // Inline Styles Definition
    const styles = {
        container: {
            width: '100%',
            margin: '0 auto',
            padding: '32px',
            fontFamily: 'sans-serif',
            color: '#E8E8E8'
        },
        header: {
            marginBottom: '32px'
        },
        h1: {
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#ffffff',
            marginBottom: '8px'
        },
        subtitle: {
            color: '#9ca3af'
        },
        card: {
            backgroundColor: '#27272a',
            border: '1px solid #3f3f46',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '32px',
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '24px'
        },
        row: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px'
        },
        stackedColumn: {
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '16px' // Space between Title and Frame Size
        },
        inputGroup: {
            display: 'flex',
            flexDirection: 'column' as const
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
            height: '40px',
            backgroundColor: '#18181b',
            border: '1px solid #52525b',
            borderRadius: '6px',
            padding: '8px 12px',
            color: '#e5e7eb',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box' as const
        },
        select: {
            width: '100%',
            height: '40px',
            backgroundColor: '#18181b',
            border: '1px solid #52525b',
            borderRadius: '6px',
            padding: '0 12px',
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
            minHeight: '100px',
            fontFamily: 'sans-serif'
        },
        storylineTextarea: {
            minHeight: '142px',
            height: '100%',
            resize: 'none' as const
        },
        storylineWrapper: {
            display: 'flex',
            flexDirection: 'column' as const,
            height: '100%'
        },
        button: {
            backgroundColor: '#2563eb',
            color: '#ffffff',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '500',
            cursor: 'pointer',
            fontSize: '16px'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.h1}>ShotPilot Storyboard</h1>
                <p style={styles.subtitle}>Professional template for AI video creation workflow</p>
            </div>

            <div style={styles.card}>
                {/* Row 1 */}
                <div style={styles.row}>
                    <div style={styles.stackedColumn}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title || ''}
                                onChange={handleChange}
                                placeholder="Enter your video project title"
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Frame Size (Aspect Ratio)</label>
                            <select
                                name="frame_size"
                                value={formData.frame_size || ''}
                                onChange={handleChange}
                                style={styles.select}
                            >
                                <option value="">Select aspect ratio</option>
                                <option value="16:9 Widescreen">16:9 Widescreen</option>
                                <option value="9:16 Portrait">9:16 Portrait</option>
                                <option value="1:1 Square">1:1 Square</option>
                                <option value="4:3 Standard">4:3 Standard</option>
                                <option value="21:9 Ultrawide">21:9 Ultrawide</option>
                            </select>
                        </div>
                    </div>

                    <div style={styles.storylineWrapper}>
                        <label style={styles.label}>Storyline/Narrative</label>
                        <textarea
                            name="storyline_narrative"
                            value={formData.storyline_narrative || ''}
                            onChange={handleChange}
                            placeholder="Outline the main story and plot points"
                            style={{ ...styles.textarea, ...styles.storylineTextarea }}
                        />
                    </div>
                </div>

                {/* Row 2 */}
                <div style={styles.row}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Purpose</label>
                        <textarea
                            name="purpose"
                            value={formData.purpose || ''}
                            onChange={handleChange}
                            placeholder="Describe the purpose and goals"
                            style={styles.textarea}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Cinematography</label>
                        <textarea
                            name="cinematography"
                            value={formData.cinematography || ''}
                            onChange={handleChange}
                            placeholder="Camera angles and movements"
                            style={styles.textarea}
                        />
                    </div>
                </div>

                {/* Row 3 */}
                <div style={styles.row}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Lighting Directions</label>
                        <textarea
                            name="lighting_directions"
                            value={formData.lighting_directions || ''}
                            onChange={handleChange}
                            placeholder="Specify lighting setup and mood"
                            style={styles.textarea}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Atmosphere & Mood</label>
                        <textarea
                            name="atmosphere_mood"
                            value={formData.atmosphere_mood || ''}
                            onChange={handleChange}
                            placeholder="Emotional tone and atmosphere"
                            style={styles.textarea}
                        />
                    </div>
                </div>

                {/* Row 4 */}
                <div style={styles.row}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Style & Aesthetic</label>
                        <textarea
                            name="style_aesthetic"
                            value={formData.style_aesthetic || ''}
                            onChange={handleChange}
                            placeholder="Define visual style and color palette"
                            style={styles.textarea}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Cinematic References</label>
                        <textarea
                            name="cinematic_references"
                            value={formData.cinematic_references || ''}
                            onChange={handleChange}
                            placeholder="Reference films and visual styles"
                            style={styles.textarea}
                        />
                    </div>
                </div>
            </div>

            <button
                onClick={handleSave}
                style={{ ...styles.button, marginTop: '20px' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            >
                Save Changes
            </button>
        </div>
    );
};