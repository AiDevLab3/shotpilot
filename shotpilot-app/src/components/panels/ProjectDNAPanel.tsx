import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';
import type { ProjectDNA } from '../../types/schema';

export const ProjectDNAPanel: React.FC = () => {
    const projectsDict = useStore(state => state.projects);
    const updateProject = useStore(state => state.updateProject);
    const projects = Object.values(projectsDict);
    const project = projects[0]; // Assuming single project for MVP

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<ProjectDNA | null>(null);

    // Sync form data when project loads or edit mode opens
    useEffect(() => {
        if (project && !formData) {
            setFormData(project);
        }
    }, [project, formData]);

    if (!project || !formData) {
        return (
            <div className="sp-p-8 sp-text-center sp-text-gray-500">
                No Project DNA found.
            </div>
        );
    }

    const handleSave = () => {
        if (formData) {
            updateProject(project.id, formData);
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setFormData(project);
        setIsEditing(false);
    };

    const handleChange = (field: keyof ProjectDNA, value: any) => {
        setFormData(prev => prev ? { ...prev, [field]: value } : null);
    };

    const handlePaletteChange = (field: keyof ProjectDNA['colorPalette'], value: string) => {
        setFormData(prev => prev ? {
            ...prev,
            colorPalette: { ...prev.colorPalette, [field]: value }
        } : null);
    };

    const handleCameraChange = (field: keyof ProjectDNA['cameraLanguage'], value: any) => {
        setFormData(prev => prev ? {
            ...prev,
            cameraLanguage: { ...prev.cameraLanguage, [field]: value }
        } : null);
    };

    return (
        <div className="sp-p-8 sp-max-w-4xl sp-mx-auto">
            <header className="sp-mb-10 sp-text-center sp-relative">
                {/* Edit Controls */}
                <div className="sp-absolute sp-right-0 sp-top-0 sp-flex sp-gap-2">
                    {isEditing ? (
                        <>
                            <button onClick={handleCancel} className="sp-btn-secondary sp-text-xs">
                                Cancel
                            </button>
                            <button onClick={handleSave} className="sp-btn-primary sp-text-xs">
                                Save DNA
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="sp-btn-secondary sp-text-xs">
                            Edit DNA
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="sp-input sp-text-3xl sp-font-bold sp-text-center sp-bg-transparent sp-border-b sp-border-gray-700 sp-w-full sp-mb-2"
                        placeholder="Project Name"
                    />
                ) : (
                    <h2 className="sp-text-4xl sp-font-bold sp-bg-clip-text sp-text-transparent sp-bg-gradient-to-r sp-from-blue-400 sp-to-purple-400 sp-mb-2">
                        {project.name}
                    </h2>
                )}

                <div className="sp-text-gray-400 sp-flex sp-items-center sp-justify-center sp-gap-4 sp-text-sm sp-uppercase sp-tracking-widest sp-mt-2">
                    {isEditing ? (
                        <>
                            <input
                                type="text"
                                value={formData.lookName}
                                onChange={(e) => handleChange('lookName', e.target.value)}
                                className="sp-input sp-text-xs sp-text-center sp-p-1"
                                placeholder="Look Name"
                            />
                            <span className="sp-w-1 sp-h-1 sp-bg-gray-600 sp-rounded-full"></span>
                            <input
                                type="text"
                                value={formData.lightingPhilosophy}
                                onChange={(e) => handleChange('lightingPhilosophy', e.target.value)}
                                className="sp-input sp-text-xs sp-text-center sp-p-1"
                                placeholder="Lighting Philosophy"
                            />
                        </>
                    ) : (
                        <>
                            <span>{project.lookName}</span>
                            <span className="sp-w-1 sp-h-1 sp-bg-gray-600 sp-rounded-full"></span>
                            <span>{project.lightingPhilosophy}</span>
                        </>
                    )}
                </div>
            </header>

            <div className="sp-grid sp-grid-cols-1 md:sp-grid-cols-2 sp-gap-8">
                {/* Visual Identity */}
                <div className="sp-bg-gray-900 sp-border sp-border-gray-800 sp-rounded-xl sp-p-6">
                    <h3 className="sp-text-lg sp-font-bold sp-text-white sp-mb-4 sp-flex sp-items-center sp-gap-2">
                        <span className="sp-w-2 sp-h-2 sp-rounded-full sp-bg-blue-500"></span>
                        Visual Identity
                    </h3>
                    <div className="sp-space-y-4">
                        <div>
                            <div className="sp-text-sm sp-text-gray-500 sp-mb-1">References</div>
                            {isEditing ? (
                                <textarea
                                    value={formData.primaryReferences.join('\n')}
                                    onChange={(e) => handleChange('primaryReferences', e.target.value.split('\n'))}
                                    className="sp-input sp-w-full sp-text-sm"
                                    rows={3}
                                    placeholder="One reference per line"
                                />
                            ) : (
                                <div className="sp-flex sp-flex-wrap sp-gap-2">
                                    {project.primaryReferences.map(ref => (
                                        <span key={ref} className="sp-px-2 sp-py-1 sp-bg-gray-800 sp-rounded sp-text-sm sp-text-gray-200">{ref}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="sp-text-sm sp-text-gray-500 sp-mb-1">Color Palette</div>
                            <div className="sp-grid sp-grid-cols-3 sp-gap-2 sp-text-sm sp-text-gray-300">
                                <div className="sp-bg-gray-800 sp-p-2 sp-rounded sp-text-center">
                                    <span className="sp-block sp-text-xs sp-text-gray-500">Temp</span>
                                    {isEditing ? (
                                        <select
                                            value={formData.colorPalette.temperature}
                                            onChange={(e) => handlePaletteChange('temperature', e.target.value)}
                                            className="sp-input sp-w-full sp-text-xs sp-p-1 sp-mt-1"
                                        >
                                            <option value="warm">Warm</option>
                                            <option value="cool">Cool</option>
                                            <option value="neutral">Neutral</option>
                                        </select>
                                    ) : (
                                        project.colorPalette.temperature
                                    )}
                                </div>
                                <div className="sp-bg-gray-800 sp-p-2 sp-rounded sp-text-center">
                                    <span className="sp-block sp-text-xs sp-text-gray-500">Saturation</span>
                                    {isEditing ? (
                                        <select
                                            value={formData.colorPalette.saturation}
                                            onChange={(e) => handlePaletteChange('saturation', e.target.value)}
                                            className="sp-input sp-w-full sp-text-xs sp-p-1 sp-mt-1"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    ) : (
                                        project.colorPalette.saturation
                                    )}
                                </div>
                                <div className="sp-bg-gray-800 sp-p-2 sp-rounded sp-text-center">
                                    <span className="sp-block sp-text-xs sp-text-gray-500">Shadows</span>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.colorPalette.shadowTint}
                                            onChange={(e) => handlePaletteChange('shadowTint', e.target.value)}
                                            className="sp-input sp-w-full sp-text-xs sp-p-1 sp-mt-1"
                                        />
                                    ) : (
                                        project.colorPalette.shadowTint
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Camera Language */}
                <div className="sp-bg-gray-900 sp-border sp-border-gray-800 sp-rounded-xl sp-p-6">
                    <h3 className="sp-text-lg sp-font-bold sp-text-white sp-mb-4 sp-flex sp-items-center sp-gap-2">
                        <span className="sp-w-2 sp-h-2 sp-rounded-full sp-bg-purple-500"></span>
                        Camera Language
                    </h3>
                    <div className="sp-space-y-4">
                        <div>
                            <div className="sp-text-sm sp-text-gray-500 sp-mb-1">Primary Movement</div>
                            {isEditing ? (
                                <select
                                    value={formData.cameraLanguage.movement}
                                    onChange={(e) => handleCameraChange('movement', e.target.value)}
                                    className="sp-input sp-w-full sp-text-sm"
                                >
                                    <option value="handheld">Handheld</option>
                                    <option value="locked">Locked</option>
                                    <option value="dolly">Dolly</option>
                                    <option value="hybrid">Hybrid</option>
                                </select>
                            ) : (
                                <div className="sp-text-gray-200 sp-capitalize">{project.cameraLanguage.movement}</div>
                            )}
                        </div>
                        <div>
                            <div className="sp-text-sm sp-text-gray-500 sp-mb-1">Focal Lengths</div>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.cameraLanguage.lensRange}
                                    onChange={(e) => handleCameraChange('lensRange', e.target.value)}
                                    className="sp-input sp-w-full sp-text-sm"
                                />
                            ) : (
                                <div className="sp-text-gray-200">{project.cameraLanguage.lensRange}</div>
                            )}
                        </div>
                        <div>
                            <div className="sp-text-sm sp-text-gray-500 sp-mb-1">Framing Rules</div>
                            {isEditing ? (
                                <textarea
                                    value={formData.cameraLanguage.framingRules.join('\n')}
                                    onChange={(e) => handleCameraChange('framingRules', e.target.value.split('\n'))}
                                    className="sp-input sp-w-full sp-text-sm"
                                    rows={3}
                                    placeholder="One rule per line"
                                />
                            ) : (
                                <div className="sp-flex sp-flex-wrap sp-gap-2">
                                    {project.cameraLanguage.framingRules.map(rule => (
                                        <span key={rule} className="sp-px-2 sp-py-1 sp-bg-gray-800 sp-rounded sp-text-sm sp-text-gray-200">{rule}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
