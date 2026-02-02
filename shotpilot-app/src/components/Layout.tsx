import React, { useState } from 'react';
import { LayoutGrid, Map, Settings2, Clapperboard } from 'lucide-react';
import clsx from 'clsx';
import { ProjectDNAPanel } from './panels/ProjectDNAPanel';
import { ShotboardGrid } from './views/ShotboardGrid';
import { SceneCanvas } from './views/SceneCanvas';
import { Inspector } from './panels/Inspector';

type ViewMode = 'shotboard' | 'canvas' | 'dna';

export const Layout: React.FC = () => {
    const [viewMode, setViewMode] = useState<ViewMode>('shotboard');

    return (
        <div className="app-layout">
            {/* Nav Rail */}
            <nav className="nav-rail">
                <div className="p-2 text-amber-500">
                    <Clapperboard size={28} color="var(--color-accent)" />
                </div>

                <NavButton
                    active={viewMode === 'shotboard'}
                    onClick={() => setViewMode('shotboard')}
                    icon={<LayoutGrid size={24} />}
                    label="Shotboard"
                />
                <NavButton
                    active={viewMode === 'canvas'}
                    onClick={() => setViewMode('canvas')}
                    icon={<Map size={24} />}
                    label="Canvas"
                />
                <NavButton
                    active={viewMode === 'dna'}
                    onClick={() => setViewMode('dna')}
                    icon={<Settings2 size={24} />}
                    label="Project DNA"
                />
            </nav>

            {/* Secondary Sidebar (Context/Navigation) */}
            <aside className="secondary-sidebar">
                <div className="panel-header">Context</div>
                <div className="p-4 text-sm text-gray-500">
                    {/* Placeholder for Scene list / Filters */}
                    Project Navigation
                    <br /><br />
                    Scene 1: The Diner
                    <br />
                    Scene 2: Exterior Rain
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content relative">
                {viewMode === 'shotboard' && <ShotboardGrid />}
                {viewMode === 'canvas' && <SceneCanvas />}
                {viewMode === 'dna' && <ProjectDNAPanel />}
            </main>

            {/* Inspector (Right Sidebar) */}
            <aside className="inspector-panel">
                <Inspector />
            </aside>
        </div>
    );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={clsx(
            "p-3 rounded-lg transition-colors flex flex-col items-center gap-1 w-full",
            active ? "text-[#f59e0b] bg-[#f59e0b]/10" : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
        )}
        title={label}
    >
        {icon}
    </button>
);
