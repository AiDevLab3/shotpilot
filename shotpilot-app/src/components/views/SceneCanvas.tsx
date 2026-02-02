import React from 'react';

export const SceneCanvas: React.FC = () => {
    return (
        <div className="flex flex-col h-full items-center justify-center text-[var(--color-text-muted)] bg-[radial-gradient(circle_at_center,_var(--color-bg-card)_0%,_var(--color-bg-app)_100%)]">
            <div className="w-96 h-64 border-2 border-dashed border-[var(--color-border)] rounded-xl flex items-center justify-center bg-black/20 backdrop-blur-sm">
                <div className="text-center">
                    <h2 className="text-xl font-medium text-[var(--color-text-primary)] mb-2">Scene Canvas</h2>
                    <p className="text-sm max-w-xs mx-auto">
                        Node-based scene organization view coming soon.
                        Will support referencing Frames and Notes in a spatial layout.
                    </p>
                </div>
            </div>
        </div>
    );
};
