import React, { useState } from 'react';
import { Header } from './shared/Header';
import { ShotboardGrid } from './views/ShotboardGrid';
import { Inspector } from './panels/Inspector';
import { FrameVariantsPanel } from './panels/FrameVariantsPanel';
import { ProjectDNAPanel } from './panels/ProjectDNAPanel';

export const Layout: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'shotboard' | 'dna' | 'canvas'>('shotboard');

    return (
        <div className="flex flex-col h-screen w-screen bg-gray-950 text-white overflow-hidden">
            <Header activeTab={activeTab} onTabChange={setActiveTab} />

            <main className="flex-1 overflow-hidden relative">
                {activeTab === 'shotboard' && (
                    <div className="grid grid-cols-12 h-full">
                        {/* Left Column: Shotboard Grid */}
                        <div className="col-span-5 h-full border-r border-gray-800 overflow-hidden flex flex-col">
                            <ShotboardGrid />
                        </div>

                        {/* Middle Column: Scene Canvas Placeholder */}
                        <div className="col-span-4 h-full bg-black flex flex-col items-center justify-center border-r border-gray-800 relative">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black opacity-50"></div>
                            <div className="z-10 text-center">
                                <h3 className="text-gray-500 font-medium mb-2">Scene Canvas</h3>
                                <p className="text-xs text-gray-700 max-w-xs mx-auto">
                                    Visualize spatial relationships and blocking here.
                                </p>
                            </div>
                        </div>

                        {/* Right Column: Inspector & Variants */}
                        <div className="col-span-3 h-full bg-gray-900 overflow-y-auto border-l border-gray-800 p-4">
                            <Inspector />
                            <FrameVariantsPanel />
                        </div>
                    </div>
                )}

                {activeTab === 'dna' && (
                    <div className="h-full overflow-y-auto bg-gray-950">
                        <ProjectDNAPanel />
                    </div>
                )}

                {activeTab === 'canvas' && (
                    <div className="h-full flex items-center justify-center bg-gray-900">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-700 mb-2">Scene Canvas Full View</h2>
                            <p className="text-gray-500">Coming soon in Phase 2</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
