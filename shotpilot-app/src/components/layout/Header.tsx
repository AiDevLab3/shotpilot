import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { getAllProjects } from '../../services/api';
import { CreditBadge } from '../CreditBadge';
import type { Project } from '../../types/schema';

export const Header: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [currentProject, setCurrentProject] = useState<Project | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Attempt to extract project ID from URL if present
    // Route pattern: /projects/:id/...
    const match = location.pathname.match(/\/projects\/(\d+)/);
    const projectIdFromUrl = match ? parseInt(match[1]) : null;

    useEffect(() => {
        loadProjects();
    }, [projectIdFromUrl]);

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

    const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newId = parseInt(e.target.value);
        const project = projects.find(p => p.id === newId);
        if (project) {
            setCurrentProject(project);
            // Navigate to the same page but for the new project, or default to info
            // Simple approach: Go to Project Info for the new project
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
                    <div style={styles.projectMeta}>
                        <span style={styles.projectLabel}>Current Project</span>
                        <select
                            style={styles.projectSelect}
                            value={pid}
                            onChange={handleProjectChange}
                        >
                            {projects.map(p => (
                                <option key={p.id} value={p.id} style={styles.projectOption}>
                                    {p.title}
                                </option>
                            ))}
                        </select>
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
                    to={`/projects/${pid}/images`}
                    style={({ isActive }) => ({
                        ...styles.navLink,
                        ...(isActive ? styles.activeNavLink : {})
                    })}
                >
                    Image Library
                </NavLink>
            </nav>
        </header>
    );
};
