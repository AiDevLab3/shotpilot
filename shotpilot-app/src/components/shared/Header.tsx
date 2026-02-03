import React from 'react';

interface HeaderProps {
    activeTab: 'shotboard' | 'dna' | 'canvas';
    onTabChange: (tab: 'shotboard' | 'dna' | 'canvas') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
    return (
        <header className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800 h-14">
            <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    ShotPilot MVP
                </h1>
            </div>

            <nav className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
                <button
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'shotboard'
                            ? 'bg-gray-700 text-white shadow-sm'
                            : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                        }`}
                    onClick={() => onTabChange('shotboard')}
                >
                    Shotboard
                </button>
                <button
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'dna'
                            ? 'bg-gray-700 text-white shadow-sm'
                            : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                        }`}
                    onClick={() => onTabChange('dna')}
                >
                    Project DNA
                </button>
                <button
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'canvas'
                            ? 'bg-gray-700 text-white shadow-sm'
                            : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                        }`}
                    onClick={() => onTabChange('canvas')}
                >
                    Scene Canvas
                </button>
            </nav>

            <div className="w-32 flex justify-end">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 opacity-50"></div>
            </div>
        </header>
    );
};
