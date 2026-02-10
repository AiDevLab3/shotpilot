import React, { useEffect, useState } from 'react';
import { getAllProjects, createScene, createShot, createCharacter } from '../services/api';
import { ScriptAnalyzer } from '../components/ScriptAnalyzer';

export const ScriptAnalyzerPage: React.FC = () => {
    const [projectId, setProjectId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<string | null>(null);

    useEffect(() => {
        loadProject();
    }, []);

    const loadProject = async () => {
        try {
            const projects = await getAllProjects();
            if (projects.length > 0) {
                setProjectId(projects[0].id);
            }
        } catch (error) {
            console.error('Failed to load project', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateScenes = async (scenes: Array<{
        name: string;
        description: string;
        location_setting?: string;
        time_of_day?: string;
        mood_tone?: string;
        shots: Array<{
            shot_type: string;
            camera_angle?: string;
            description: string;
        }>;
    }>) => {
        if (!projectId) return;
        setStatus('Creating scenes and shots...');
        try {
            for (const scene of scenes) {
                const { shots, ...sceneData } = scene;
                await createScene(projectId, {
                    ...sceneData,
                    status: 'planning',
                });
                // We need to get the created scene ID. Since createScene doesn't return it,
                // we'll get all scenes and find the latest one.
                const allProjects = await getAllProjects();
                // For now, shots will need to be added from Scene Manager after scenes are created
            }
            setStatus(`Created ${scenes.length} scene(s). Open Scene Manager to add shots.`);
        } catch (error) {
            console.error('Failed to create scenes', error);
            setStatus('Error creating scenes. Check console.');
        }
    };

    const handleCreateCharacters = async (characters: Array<{ name: string; description: string }>) => {
        if (!projectId) return;
        setStatus('Creating characters...');
        try {
            for (const char of characters) {
                await createCharacter(projectId, char);
            }
            setStatus(`Created ${characters.length} character(s).`);
        } catch (error) {
            console.error('Failed to create characters', error);
            setStatus('Error creating characters. Check console.');
        }
    };

    if (loading) return <div style={{ padding: '32px', color: 'white' }}>Loading...</div>;
    if (!projectId) return <div style={{ padding: '32px', color: 'white' }}>No project found. Create a project first.</div>;

    return (
        <div style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
            <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px' }}>
                <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#ffffff', marginBottom: '8px' }}>
                    Script Analyzer
                </h1>
                <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '24px' }}>
                    Paste your script and AI will extract scenes, characters, and shot suggestions.
                </p>

                {status && (
                    <div style={{
                        padding: '12px 16px',
                        marginBottom: '16px',
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#e5e7eb',
                        fontSize: '13px',
                    }}>
                        {status}
                    </div>
                )}

                <ScriptAnalyzer
                    projectId={projectId}
                    onCreateScenes={handleCreateScenes}
                    onCreateCharacters={handleCreateCharacters}
                />
            </div>
        </div>
    );
};
