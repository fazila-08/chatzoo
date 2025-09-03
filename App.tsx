
import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import { getAiResponse, streamAiResponse } from './services/geminiService';
import type { ModelType, Message } from './types';
import { MODELS } from './constants';

const App: React.FC = () => {
    const [selectedModel, setSelectedModel] = useState<ModelType>('cat');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentChatId, setCurrentChatId] = useState<number>(Date.now());

    const handleSelectModel = (modelId: ModelType) => {
        setSelectedModel(modelId);
        setMessages([]);
        setCurrentChatId(Date.now());
    };

    const handleSendMessage = useCallback(async (text: string) => {
        const userMessage: Message = { id: Date.now(), text, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        if (selectedModel === 'sloth') {
            const aiMessageId = Date.now() + 1;
            setMessages(prev => [...prev, { id: aiMessageId, text: '', sender: 'ai', model: selectedModel }]);
            
            const streamHandler = (chunk: string) => {
                const chars = chunk.split('');
                let charIndex = 0;
                const intervalId = setInterval(() => {
                    if(charIndex < chars.length) {
                        setMessages(prev => prev.map(msg => 
                            msg.id === aiMessageId ? { ...msg, text: msg.text + chars[charIndex] } : msg
                        ));
                        charIndex++;
                    } else {
                        clearInterval(intervalId);
                    }
                }, 50);
            };

            await streamAiResponse(text, selectedModel, streamHandler);
            setIsLoading(false);

        } else {
            const responseText = await getAiResponse(text, selectedModel);
            const aiMessage: Message = { id: Date.now() + 1, text: responseText, sender: 'ai', model: selectedModel };
            setMessages(prev => [...prev, aiMessage]);
            setIsLoading(false);
        }
    }, [selectedModel]);
    
    // Effect to clear messages on model change to avoid stale state issues.
    useEffect(() => {
        setMessages([]);
    }, [currentChatId]);


    return (
        <div className="flex h-screen font-sans">
            <Sidebar
                models={MODELS}
                selectedModel={selectedModel}
                onSelectModel={handleSelectModel}
            />
            <ChatInterface
                key={currentChatId}
                model={MODELS.find(m => m.id === selectedModel)!}
                messages={messages}
                isLoading={isLoading}
                onSendMessage={handleSendMessage}
            />
        </div>
    );
};

export default App;
