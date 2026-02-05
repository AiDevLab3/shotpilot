import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { ProjectInfoPage } from './pages/ProjectInfoPage';
import { CharacterBiblePage } from './pages/CharacterBiblePage';
import { ObjectBiblePage } from './pages/ObjectBiblePage';

import ShotBoardPage from './pages/ShotBoardPage';
import { getAllProjects, createProject } from './services/api';

// Wrapper to handle initial redirect logic
const IndexRedirect: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const init = async () => {
            console.log("SHOTPILOT: IndexRedirect initializing...");
            try {
                // Ensure DB is ready? initDB is called lazily but good to ensure here?
                // services/database.ts initDB is mostly implicit.
                const projects = await getAllProjects();
                console.log("SHOTPILOT: Projects loaded", projects);
                if (projects.length > 0) {
                    navigate(`/projects/${projects[0].id}`);
                } else {
                    // If no projects, create a default one and redirect
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

const App: React.FC = () => {
    console.log("SHOTPILOT: App mounting");
    return (
        <BrowserRouter>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', backgroundColor: '#18181b', color: '#E8E8E8', overflow: 'hidden' }}>
                <div style={{ flex: '0 0 auto' }}>
                    <Header />
                </div>

                <main style={{ flex: '1 1 auto', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <Routes>
                        <Route path="/" element={<IndexRedirect />} />
                        <Route path="/projects/:id" element={<ProjectInfoPage />} />
                        <Route path="/projects/:id/characters" element={<CharacterBiblePage />} />
                        <Route path="/projects/:id/objects" element={<ObjectBiblePage />} />

                        <Route path="/projects/:id/shotboard" element={<ShotBoardPage />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
};

export default App;
