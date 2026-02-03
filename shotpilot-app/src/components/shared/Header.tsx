import React from 'react';

interface HeaderProps {
    activeTab: 'shotboard' | 'dna' | 'canvas';
    onTabChange: (tab: 'shotboard' | 'dna' | 'canvas') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
    return (
        <header className="flex items-center justify-between px-3 py-1 bg-gray-950 border-b border-gray-800 h-10 min-h-[2.5rem] z-50 relative">
            <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white text-xs shadow-lg shadow-blue-900/20">
                    SP
                </div>
                <h1 className="text-sm font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    ShotPilot
                </h1>
                <span className="px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[9px] font-bold border border-blue-500/20">
                    MVP
                </span>
            </div>

            <nav className="flex space-x-1 bg-gray-900 p-0.5 rounded-lg border border-gray-800">
                <TabButton
                    label="Shotboard"
                    active={activeTab === 'shotboard'}
                    onClick={() => onTabChange('shotboard')}
                />
                <TabButton
                    label="Scene Canvas"
                    active={activeTab === 'canvas'}
                    onClick={() => onTabChange('canvas')}
                />
                <TabButton
                    label="Project DNA"
                    active={activeTab === 'dna'}
                    onClick={() => onTabChange('dna')}
                />
            </nav>

            <div className="w-32 flex justify-end items-center gap-2">
                <div className="text-right hidden md:block">
                    <div className="text-[10px] font-bold text-gray-300">Caleb</div>
                </div>
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 border border-gray-500/30"></div>
            </div>
        </header>
    );
};

const TabButton: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
    <button
        className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${active
            ? 'bg-gray-800 text-white shadow-sm border border-gray-700'
            : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
            }`}
        onClick={onClick}
    >
        {label}
    </button>
);
