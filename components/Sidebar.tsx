
import React from 'react';
import type { ModelInfo, ModelType } from '../types';
import { LogoIcon } from './icons';

interface SidebarProps {
    models: ModelInfo[];
    selectedModel: ModelType;
    onSelectModel: (modelId: ModelType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ models, selectedModel, onSelectModel }) => {
    return (
        <div className="w-64 bg-gray-900 p-4 flex flex-col h-full shrink-0">
            <div className="flex items-center mb-8">
                <LogoIcon />
                <h1 className="text-2xl font-bold ml-2 text-white">ChatZoo</h1>
            </div>
            <h2 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Models</h2>
            <ul>
                {models.map((model) => (
                    <li key={model.id} className="mb-2">
                        <button
                            onClick={() => onSelectModel(model.id)}
                            className={`w-full text-left p-3 rounded-lg flex items-center transition-colors duration-200 ${
                                selectedModel === model.id
                                    ? 'bg-gray-700 text-white'
                                    : 'text-gray-300 hover:bg-gray-800'
                            }`}
                        >
                            <div className="w-8 h-8 mr-3">{model.avatar}</div>
                            <div>
                                <div className="font-semibold">{model.name}</div>
                                <div className="text-xs text-gray-400">{model.description}</div>
                            </div>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;
