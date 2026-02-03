import React from 'react';
import { useStore } from '../../store';

export const ProjectDNAPanel: React.FC = () => {
    const projects = useStore(state => Object.values(state.projects));
    const project = projects[0]; // Assuming single project for MVP

    if (!project) {
        return (
            <div className="p-8 text-center text-gray-500">
                No Project DNA found.
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <header className="mb-10 text-center">
                <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                    {project.name}
                </h2>
                <div className="text-gray-400 flex items-center justify-center gap-4 text-sm uppercase tracking-widest">
                    <span>{project.lookName}</span>
                    <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                    <span>{project.lightingPhilosophy}</span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Visual Identity */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        Visual Identity
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <div className="text-sm text-gray-500 mb-1">References</div>
                            <div className="flex flex-wrap gap-2">
                                {project.primaryReferences.map(ref => (
                                    <span key={ref} className="px-2 py-1 bg-gray-800 rounded text-sm text-gray-200">{ref}</span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 mb-1">Color Palette</div>
                            <div className="grid grid-cols-3 gap-2 text-sm text-gray-300">
                                <div className="bg-gray-800 p-2 rounded text-center">
                                    <span className="block text-xs text-gray-500">Temp</span>
                                    {project.colorPalette.temperature}
                                </div>
                                <div className="bg-gray-800 p-2 rounded text-center">
                                    <span className="block text-xs text-gray-500">Saturation</span>
                                    {project.colorPalette.saturation}
                                </div>
                                <div className="bg-gray-800 p-2 rounded text-center">
                                    <span className="block text-xs text-gray-500">Shadows</span>
                                    {project.colorPalette.shadowTint}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Camera Language */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        Camera Language
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <div className="text-sm text-gray-500 mb-1">Primary Movement</div>
                            <div className="text-gray-200 capitalize">{project.cameraLanguage.movement}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 mb-1">Focal Lengths</div>
                            <div className="text-gray-200">{project.cameraLanguage.lensRange}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 mb-1">Framing Rules</div>
                            <div className="flex flex-wrap gap-2">
                                {project.cameraLanguage.framingRules.map(rule => (
                                    <span key={rule} className="px-2 py-1 bg-gray-800 rounded text-sm text-gray-200">{rule}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
