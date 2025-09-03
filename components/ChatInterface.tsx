
import React, { useState, useRef, useEffect } from 'react';
import type { Message, ModelInfo } from '../types';
import ChatMessage from './ChatMessage';
import { SendIcon } from './icons';

interface ChatInterfaceProps {
    model: ModelInfo;
    messages: Message[];
    isLoading: boolean;
    onSendMessage: (text: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ model, messages, isLoading, onSendMessage }) => {
    const [inputText, setInputText] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [inputText]);

    const handleSend = () => {
        if (inputText.trim() && !isLoading) {
            onSendMessage(inputText);
            setInputText('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const WelcomeScreen = () => (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-24 h-24 mb-4">{model.avatar}</div>
            <h1 className="text-4xl font-bold text-gray-200">Chat with {model.name}</h1>
            <p className="text-lg text-gray-400 mt-2">{model.description}</p>
        </div>
    );

    return (
        <div className="flex-1 flex flex-col bg-gray-800">
            <main className="flex-1 overflow-y-auto p-6">
                {messages.length === 0 ? (
                    <WelcomeScreen />
                ) : (
                    <div className="max-w-3xl mx-auto">
                        {messages.map((msg, index) => (
                            <ChatMessage key={msg.id} message={msg} modelAvatar={model.avatar} />
                        ))}
                        {isLoading && messages[messages.length - 1]?.sender === 'user' && (
                             <ChatMessage message={{id: 0, text: '', sender: 'ai', model: model.id}} modelAvatar={model.avatar} isLoading={true} />
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </main>
            <footer className="bg-gray-800 border-t border-gray-700 p-4">
                <div className="max-w-3xl mx-auto">
                    <div className="relative flex items-center bg-gray-900 rounded-xl p-2">
                        <textarea
                            ref={textareaRef}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={`Message ${model.name}...`}
                            className="w-full bg-transparent p-2 pr-12 text-gray-100 placeholder-gray-500 focus:outline-none resize-none max-h-40"
                            rows={1}
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !inputText.trim()}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                        >
                            <SendIcon />
                        </button>
                    </div>
                     <p className="text-xs text-gray-500 text-center mt-2">ChatZoo can make mistakes. Consider checking important information.</p>
                </div>
            </footer>
        </div>
    );
};

export default ChatInterface;
