import React, { useEffect, useState, createContext, useContext } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { getProject, updateProject } from '../services/api';
import { useCreativeDirectorStore } from '../stores/creativeDirectorStore';
import { ChatSidebar } from './ChatSidebar';
import type { Project } from '../types/schema';

interface ProjectContextValue {
    project: Project | null;
    projectId: number;
    setProject: (p: Project) => void;
    refreshProject: () => Promise<void>;
    loading: boolean;
}

const ProjectContext = createContext<ProjectContextValue>({
    project: null,
    projectId: 0,
    setProject: () => {},
    refreshProject: async () => {},
    loading: true,
});

export const useProjectContext = () => useContext(ProjectContext);

export const ProjectLayout: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const projectId = id ? parseInt(id) : 0;
    const store = useCreativeDirectorStore();
    const session = store.getSession(projectId);

    const [project, setProjectState] = useState<Project | null>(session.projectSnapshot);
    const [loading, setLoading] = useState(!session.projectSnapshot);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const setProject = (p: Project) => {
        setProjectState(p);
        store.setProjectSnapshot(p.id, p);
    };

    const refreshProject = async () => {
        try {
            const proj = await getProject(projectId);
            if (proj) setProject(proj);
        } catch (err) {
            console.error('Failed to refresh project:', err);
        }
    };

    useEffect(() => {
        const load = async () => {
            if (session.projectSnapshot) {
                setProjectState(session.projectSnapshot);
                setLoading(false);
                // Refresh from server in background
                refreshProject();
                return;
            }
            setLoading(true);
            try {
                const proj = await getProject(projectId);
                if (proj) setProject(proj);
            } catch (err) {
                console.error('Failed to load project:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [projectId]);

    // Periodic auto-save every 30s
    useEffect(() => {
        if (!project) return;
        let lastSaved = JSON.stringify(project);
        const interval = setInterval(() => {
            const current = JSON.stringify(project);
            if (current !== lastSaved) {
                lastSaved = current;
                updateProject(projectId, project).catch(err =>
                    console.error('Periodic auto-save failed:', err)
                );
            }
        }, 30000);
        return () => clearInterval(interval);
    }, [project, projectId]);

    // Save on page unload
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (project) {
                const data = JSON.stringify(project);
                navigator.sendBeacon(`/api/projects/${projectId}`, new Blob([data], { type: 'application/json' }));
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [project, projectId]);

    if (loading && !project) {
        return <div style={{ padding: '32px', color: 'white' }}>Loading project...</div>;
    }

    return (
        <ProjectContext.Provider value={{ project, projectId, setProject, refreshProject, loading }}>
            <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
                <ChatSidebar
                    projectId={projectId}
                    project={project}
                    onProjectUpdate={setProject}
                    collapsed={sidebarCollapsed}
                    onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                />
                <div style={{ flex: 1, overflow: 'auto', backgroundColor: '#18181b' }}>
                    <Outlet />
                </div>
            </div>
        </ProjectContext.Provider>
    );
};
