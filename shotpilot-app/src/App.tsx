import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { ProjectLayout } from './components/ProjectLayout';
import { CharacterBiblePage } from './pages/CharacterBiblePage';
import { ObjectBiblePage } from './pages/ObjectBiblePage';
import ShotBoardPage from './pages/ShotBoardPage';
import { CreativeDirectorPage } from './pages/CreativeDirectorPage';
import { getAllProjects, createProject } from './services/api';

// Error boundary: catches render crashes and shows a recovery UI
// instead of a blank dark screen
class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error: Error | null }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('[ErrorBoundary] Caught:', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    height: '100vh', width: '100vw', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    backgroundColor: '#18181b', color: '#ef4444',
                    flexDirection: 'column', gap: '16px', padding: '24px',
                }}>
                    <div style={{ fontSize: '20px', fontWeight: 700 }}>Something went wrong</div>
                    <div style={{ color: '#9ca3af', fontSize: '14px', maxWidth: '500px', textAlign: 'center' }}>
                        {this.state.error?.message || 'An unexpected error occurred'}
                    </div>
                    <button
                        onClick={() => {
                            this.setState({ hasError: false, error: null });
                            window.location.reload();
                        }}
                        style={{
                            marginTop: '8px', padding: '10px 24px',
                            backgroundColor: '#8b5cf6', color: 'white',
                            border: 'none', borderRadius: '8px',
                            cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                        }}
                    >
                        Reload App
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

// Auto-login: MVP has no login page, so authenticate on mount
// Uses a module-level flag to prevent React.StrictMode double-mount from
// firing two login requests (which creates two sessions, invalidating the first).
let loginInProgress = false;

// Wrapper to handle initial redirect logic
const IndexRedirect: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const init = async () => {
            console.log("SHOTPILOT: IndexRedirect initializing...");
            try {
                const projects = await getAllProjects();
                console.log("SHOTPILOT: Projects loaded", projects);
                if (projects.length > 0) {
                    navigate(`/projects/${projects[0].id}`);
                } else {
                    console.log("SHOTPILOT: Creating default project...");
                    await createProject({ title: 'Untitled Project' });
                    const newProjs = await getAllProjects();
                    if (newProjs.length > 0) {
                        navigate(`/projects/${newProjs[0].id}`);
                    }
                }
            } catch (err) {
                console.error("SHOTPILOT: Error in IndexRedirect", err);
            }
        };
        init();
    }, [navigate]);

    return <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A0E14', color: 'white' }}>Loading ShotPilot...</div>;
};

// Auto-login logic inlined directly in App to avoid custom hook resolution issues
const App: React.FC = () => {
    const [isReady, setIsReady] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        if (loginInProgress) {
            console.log('[AUTO-LOGIN] Already in progress, skipping duplicate mount');
            return;
        }
        loginInProgress = true;

        console.log('[AUTO-LOGIN] Starting login...');

        fetch('/api/auth/login', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@shotpilot.com',
                password: 'testpassword123'
            })
        })
        .then(response => {
            console.log('[AUTO-LOGIN] Response status:', response.status);
            if (!response.ok) {
                throw new Error(`Login failed: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('[AUTO-LOGIN] Login SUCCESS:', data);
            setIsAuthenticated(true);
        })
        .catch(error => {
            console.error('[AUTO-LOGIN] Login FAILED:', error);
            setIsAuthenticated(false);
        })
        .finally(() => {
            console.log('[AUTO-LOGIN] Setting isReady = true');
            setIsReady(true);
            loginInProgress = false;
        });
    }, []);

    if (!isReady) {
        return (
            <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A0E14', color: 'white' }}>
                Loading ShotPilot...
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A0E14', color: '#ef4444', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '18px', fontWeight: 600 }}>Authentication Failed</div>
                <div style={{ color: '#9ca3af', fontSize: '14px' }}>Could not log in as test@shotpilot.com. Check the server console.</div>
                <button
                    onClick={() => window.location.reload()}
                    style={{ marginTop: '8px', padding: '8px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <BrowserRouter>
                <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', backgroundColor: '#18181b', color: '#E8E8E8', overflow: 'hidden' }}>
                    <div style={{ flex: '0 0 auto' }}>
                        <Header />
                    </div>

                    <main style={{ flex: '1 1 auto', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <Routes>
                            <Route path="/" element={<IndexRedirect />} />
                            <Route path="/projects/:id" element={<ProjectLayout />}>
                                <Route index element={<CreativeDirectorPage />} />
                                <Route path="characters" element={<CharacterBiblePage />} />
                                <Route path="objects" element={<ObjectBiblePage />} />
                                <Route path="scenes" element={<ShotBoardPage />} />
                            </Route>
                        </Routes>
                    </main>
                </div>
            </BrowserRouter>
        </ErrorBoundary>
    );
};

export default App;
