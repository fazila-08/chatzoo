
import { useState, useEffect } from 'react';

type Model = 'cat' | 'goldfish' | 'sloth';

export default function ModelSelector({ 
  activeModel, 
  onChange 
}: { 
  activeModel: Model;
  onChange: (model: Model) => void;
}) {
  const models = [
    { id: 'cat', name: 'Cat Mode', emoji: '😺' },
    { id: 'goldfish', name: 'Goldfish Memory', emoji: '🐠' },
    { id: 'sloth', name: 'Sloth Mode', emoji: '🦥' }
  ];

  return (
    <div className="flex space-x-2">
      {models.map((model) => (
        <button
          key={model.id}
          onClick={() => onChange(model.id as Model)}
          className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 ${
            activeModel === model.id
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          <span>{model.emoji}</span>
          <span>{model.name}</span>
        </button>
      ))}
    </div>
  );
}