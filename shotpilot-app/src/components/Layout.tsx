import React, { useState } from 'react';
import { Header } from './shared/Header';
import { ShotboardGrid } from './views/ShotboardGrid';
import { SceneCanvas } from './views/SceneCanvas';
import { Inspector } from './panels/Inspector';
import { FrameVariantsPanel } from './panels/FrameVariantsPanel';
import { ProjectDNAPanel } from './panels/ProjectDNAPanel';

export const Layout: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'shotboard' | 'dna' | 'canvas'>('shotboard');

    // Panel Visibility States (Default: Canvas hidden, Inspector visible)
    const [showCanvas, setShowCanvas] = useState(false);
    const [showInspector, setShowInspector] = useState(true);

    const isMainView = activeTab === 'shotboard' || activeTab === 'canvas';
    const isCanvasMode = activeTab === 'canvas';

    // Canvas Visibility Logic:
    // - In Shotboard mode: controlled by `showCanvas`
    // - In Canvas mode: ALWAYS visible
    const isCanvasVisible = isCanvasMode || showCanvas;

    return (
        <div className="sp-flex sp-flex-col sp-overflow-hidden" style={{ height: '100vh', width: '100vw', background: 'var(--sp-bg-main)', color: 'white' }}>
            <Header activeTab={activeTab} onTabChange={setActiveTab} />

            <main className="sp-flex-1 sp-relative sp-overflow-hidden sp-flex sp-flex-col">
                {isMainView && (
                    <div className="sp-flex sp-flex-col sp-h-full sp-w-full">
                        {/* View Options Toolbar (Only show in Shotboard mode as toggle is relevant there) */}
                        {!isCanvasMode && (
                            <div className="sp-view-toolbar">
                                <span className="sp-text-xs sp-font-bold sp-uppercase sp-tracking-widest sp-text-muted" style={{ marginRight: '0.5rem' }}>View Options</span>
                                <button
                                    onClick={() => setShowCanvas(!showCanvas)}
                                    className={`sp-btn-toggle ${showCanvas ? 'active' : ''}`}
                                >
                                    {showCanvas ? 'Hide Canvas' : 'Show Canvas'}
                                </button>
                                <button
                                    onClick={() => setShowInspector(!showInspector)}
                                    className={`sp-btn-toggle ${showInspector ? 'active' : ''}`}
                                >
                                    {showInspector ? 'Hide Inspector' : 'Show Inspector'}
                                </button>
                            </div>
                        )}
                        {/* In Canvas Mode, maybe show simple header text or nothing? Assuming nothing for max space. */}

                        {/* Flexible Content Area */}
                        <div className="sp-main-layout">
                            {/* LEFT COLUMN: Shotboard Grid */}
                            {/* In Shotboard Mode: Flex Grows (Main Focus) */}
                            {/* In Canvas Mode: Fixed width sidebar (25%) */}
                            <div
                                className={`sp-flex-col sp-overflow-hidden sp-transition-all ${isCanvasMode ? 'sp-border-r' : 'sp-flex-1'}`}
                                style={{
                                    minWidth: 0,
                                    background: 'var(--sp-bg-main)',
                                    width: isCanvasMode ? '25%' : 'auto',
                                    minWidth: isCanvasMode ? '250px' : '0'
                                }}
                            >
                                <ShotboardGrid />
                            </div>

                            {/* MIDDLE COLUMN: Scene Canvas */}
                            {isCanvasVisible && (
                                <div
                                    className={`sp-flex-col sp-overflow-hidden sp-transition-all ${!isCanvasMode ? 'sp-border-l' : ''}`}
                                    style={{
                                        width: isCanvasMode ? 'auto' : '30%',
                                        flex: isCanvasMode ? 1 : 'none',
                                        minWidth: '320px',
                                        background: '#000'
                                    }}
                                >
                                    <SceneCanvas />
                                </div>
                            )}

                            {/* RIGHT COLUMN: Inspector & Variants */}
                            {showInspector && (
                                <div className="sp-flex-col sp-overflow-hidden sp-transition-all sp-border-l" style={{ width: '25%', minWidth: '300px', background: 'var(--sp-bg-panel)' }}>
                                    <div className="sp-h-full" style={{ overflowY: 'auto' }}>
                                        <Inspector />
                                        <FrameVariantsPanel />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'dna' && (
                    <div className="sp-h-full sp-overflow-hidden" style={{ overflowY: 'auto', background: 'var(--sp-bg-main)' }}>
                        <ProjectDNAPanel />
                    </div>
                )}
            </main>
        </div>
    );
};
