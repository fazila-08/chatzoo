
import React from 'react';
import type { Message } from '../types';
import { UserIcon } from './icons';

interface ChatMessageProps {
    message: Message;
    modelAvatar: React.ReactNode;
    isLoading?: boolean;
}

const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
    </div>
);


const ChatMessage: React.FC<ChatMessageProps> = ({ message, modelAvatar, isLoading }) => {
    const isUser = message.sender === 'user';
    const isSloth = message.model === 'sloth';
    const showCursor = isSloth && message.text.length > 0 && !isLoading;

    return (
        <div className={`flex items-start gap-4 p-5 my-2 rounded-lg ${isUser ? 'bg-gray-800' : 'bg-gray-700/50'}`}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-gray-600">
                {isUser ? <UserIcon /> : modelAvatar}
            </div>
            <div className="flex-1 pt-1 break-words">
                <p className="whitespace-pre-wrap">
                    {message.text}
                    {isLoading && message.text.length === 0 && <TypingIndicator />}
                    {isSloth && isLoading && <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-1" />}
                </p>
            </div>
        </div>
    );
};

export default ChatMessage;
