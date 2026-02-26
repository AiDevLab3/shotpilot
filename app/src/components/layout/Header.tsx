import React, { useEffect, useState, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { getAllProjects, createProject } from '../../services/api';
import { CreditBadge } from '../CreditBadge';
import type { Project } from '../../types/schema';

export const Header: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [currentProject, setCurrentProject] = useState<Project | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [creating, setCreating] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Attempt to extract project ID from URL if present
    // Route pattern: /projects/:id/...
    const match = location.pathname.match(/\/projects\/(\d+)/);
    const projectIdFromUrl = match ? parseInt(match[1]) : null;

    useEffect(() => {
        loadProjects();
    }, [projectIdFromUrl]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadProjects = async () => {
        try {
            const projs = await getAllProjects();
            setProjects(projs);

            if (projectIdFromUrl) {
                const current = projs.find(p => p.id === projectIdFromUrl);
                if (current) setCurrentProject(current);
            } else if (projs.length > 0 && !currentProject) {
                // Default to first if none selected and not in URL
                setCurrentProject(projs[0]);
            }
        } catch (err) {
            console.error('Header: failed to load projects', err);
        }
    };

    const handleProjectSelect = (project: Project) => {
        setCurrentProject(project);
        setDropdownOpen(false);
        navigate(`/projects/${project.id}`);
    };

    const handleCreateProject = async () => {
        if (creating) return;
        setCreating(true);
        try {
            await createProject({ title: newProjectName || 'Untitled Project' });
            setNewProjectName('');
            const projs = await getAllProjects();
            setProjects(projs);
            const newest = projs[projs.length - 1];
            if (newest) {
                setCurrentProject(newest);
                setDropdownOpen(false);
                navigate(`/projects/${newest.id}`);
            }
        } catch (err) {
            console.error('Failed to create project:', err);
        } finally {
            setCreating(false);
        }
    };

    const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newId = parseInt(e.target.value);
        const project = projects.find(p => p.id === newId);
        if (project) {
            setCurrentProject(project);
            navigate(`/projects/${newId}`);
        }
    };

    // Use projectIdFromUrl as fallback even before projects load
    const pid = currentProject?.id || projectIdFromUrl || (projects.length > 0 ? projects[0].id : 0);

    const styles = {
        header: {
            backgroundColor: '#151A21',
            borderBottom: '1px solid #1E2530',
            fontFamily: 'sans-serif'
        },
        topBar: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 24px'
        },
        brandSection: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
        },
        logo: {
            width: '32px',
            height: '32px',
            backgroundColor: '#2563eb', // Fallback if gradient fails, or use CSS gradient
            background: 'linear-gradient(135deg, #2563eb, #9333ea)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: 'white',
            fontSize: '12px'
        },
        projectMeta: {
            display: 'flex',
            flexDirection: 'column' as const
        },
        projectLabel: {
            fontSize: '10px',
            color: '#8A8A8A',
            fontWeight: 'bold',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em'
        },
        projectSelect: {
            backgroundColor: 'transparent',
            color: '#E8E8E8',
            fontSize: '14px',
            fontWeight: 'bold',
            border: 'none',
            outline: 'none',
            cursor: 'pointer',
            padding: 0,
            margin: 0
        },
        projectOption: {
            backgroundColor: '#151A21',
            color: '#E8E8E8'
        },
        nav: {
            display: 'flex',
            padding: '0 24px',
            gap: '24px' // Spacing between tabs
        },
        navLink: {
            padding: '12px 0', // Vertical padding, horizontal handled by gap
            fontSize: '14px',
            fontWeight: '500',
            textDecoration: 'none',
            borderBottom: '2px solid transparent',
            color: '#8A8A8A',
            transition: 'color 0.2s, border-color 0.2s',
            cursor: 'pointer'
        },
        activeNavLink: {
            color: '#2563eb',
            borderBottom: '2px solid #2563eb'
        }
    };

    return (
        <header style={styles.header}>
            <div style={styles.topBar}>
                <div style={styles.brandSection}>
                    <div style={styles.logo}>SP</div>
                    <div style={{ ...styles.projectMeta, position: 'relative' }} ref={dropdownRef}>
                        <span style={styles.projectLabel}>Current Project</span>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            style={{
                                ...styles.projectSelect,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'none',
                            }}
                        >
                            {currentProject?.title || 'Select Project'}
                            <span style={{ fontSize: '10px', color: '#6b7280' }}>▼</span>
                        </button>
                        {dropdownOpen && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                marginTop: '4px',
                                backgroundColor: '#1e1e24',
                                border: '1px solid #3f3f46',
                                borderRadius: '8px',
                                minWidth: '280px',
                                zIndex: 1000,
                                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                                overflow: 'hidden',
                            }}>
                                {/* Project list */}
                                <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                                    {projects.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => handleProjectSelect(p)}
                                            style={{
                                                display: 'block',
                                                width: '100%',
                                                padding: '10px 14px',
                                                backgroundColor: p.id === pid ? '#2d2d3a' : 'transparent',
                                                border: 'none',
                                                color: p.id === pid ? '#8b5cf6' : '#e5e7eb',
                                                fontSize: '13px',
                                                fontWeight: p.id === pid ? 600 : 400,
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                            }}
                                            onMouseEnter={e => { if (p.id !== pid) (e.target as HTMLElement).style.backgroundColor = '#27272a'; }}
                                            onMouseLeave={e => { if (p.id !== pid) (e.target as HTMLElement).style.backgroundColor = 'transparent'; }}
                                        >
                                            {p.title}
                                        </button>
                                    ))}
                                </div>
                                {/* Divider + Create new */}
                                <div style={{ borderTop: '1px solid #3f3f46', padding: '8px' }}>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <input
                                            value={newProjectName}
                                            onChange={e => setNewProjectName(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') handleCreateProject(); }}
                                            placeholder="New project..."
                                            style={{
                                                flex: 1,
                                                padding: '6px 10px',
                                                backgroundColor: '#27272a',
                                                border: '1px solid #3f3f46',
                                                borderRadius: '5px',
                                                color: '#e5e7eb',
                                                fontSize: '12px',
                                                outline: 'none',
                                            }}
                                            autoFocus
                                        />
                                        <button
                                            onClick={handleCreateProject}
                                            disabled={creating}
                                            style={{
                                                padding: '6px 12px',
                                                backgroundColor: '#8b5cf6',
                                                border: 'none',
                                                borderRadius: '5px',
                                                color: 'white',
                                                fontSize: '11px',
                                                fontWeight: 600,
                                                cursor: creating ? 'not-allowed' : 'pointer',
                                                opacity: creating ? 0.6 : 1,
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {creating ? '...' : '+ Create'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <CreditBadge />
                    <div style={{ fontSize: '12px', color: '#52525b', fontStyle: 'italic' }}>
                        ShotPilot MVP
                    </div>
                </div>
            </div>

            <nav style={styles.nav}>
                <NavLink
                    to={`/projects/${pid}`}
                    end
                    style={({ isActive }) => ({
                        ...styles.navLink,
                        ...(isActive ? { color: '#8b5cf6', borderBottom: '2px solid #8b5cf6' } : {})
                    })}
                >
                    Creative Director
                </NavLink>
                <NavLink
                    to={`/projects/${pid}/characters`}
                    style={({ isActive }) => ({
                        ...styles.navLink,
                        ...(isActive ? styles.activeNavLink : {})
                    })}
                >
                    Characters
                </NavLink>
                <NavLink
                    to={`/projects/${pid}/objects`}
                    style={({ isActive }) => ({
                        ...styles.navLink,
                        ...(isActive ? styles.activeNavLink : {})
                    })}
                >
                    Objects
                </NavLink>
                <NavLink
                    to={`/projects/${pid}/scenes`}
                    style={({ isActive }) => ({
                        ...styles.navLink,
                        ...(isActive ? styles.activeNavLink : {})
                    })}
                >
                    Scene Manager
                </NavLink>
                <NavLink
                    to={`/projects/${pid}/assets`}
                    style={({ isActive }) => ({
                        ...styles.navLink,
                        ...(isActive ? { color: '#8b5cf6', borderBottom: '2px solid #8b5cf6' } : {})
                    })}
                >
                    📦 Asset Manager
                </NavLink>
                {/* Image Library removed — Asset Manager supersedes it */}
                <NavLink
                    to={`/projects/${pid}/agents`}
                    style={({ isActive }) => ({
                        ...styles.navLink,
                        ...(isActive ? { color: '#8b5cf6', borderBottom: '2px solid #8b5cf6' } : {})
                    })}
                >
                    ⚡ Agent Studio
                </NavLink>
            </nav>
        </header>
    );
};
