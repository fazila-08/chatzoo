
import { useState, useRef, useEffect } from 'react';

type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', content: 'Hello! I\'m ChatZoo. Meow! 😺', role: 'assistant' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockResponses = [
        "Meow meow! 😸",
        "Purrr... interesting! 🐱",
        "Mrow? 🐈",
        "Meow? (I'm just a cat, remember) 😼"
      ];

      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: mockResponses[Math.floor(Math.random() * mockResponses.length)],
        role: 'assistant'
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-100 via-white to-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 to-purple-600 p-5 shadow-md rounded-b-2xl">
        <h1 className="text-2xl font-bold text-center text-white tracking-wide">ChatZoo 🐾</h1>
        <p className="text-sm text-center text-blue-100 mt-1">Your friendly neighborhood chat companion</p>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`
              max-w-[80%] px-4 py-3 rounded-2xl shadow-md transition-all
              ${message.role === 'user' 
                ? 'bg-blue-500 text-white rounded-br-none' 
                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'}
            `}>
              {message.role === 'assistant' && (
                <div className="text-xs text-purple-600 font-medium mb-1">ChatZoo</div>
              )}
              <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
              {message.role === 'user' && (
                <div className="text-right text-xs text-blue-200 mt-1">You</div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 border border-gray-200 rounded-2xl p-3 rounded-bl-none shadow-md max-w-[80%]">
              <div className="text-xs text-purple-500 font-medium mb-2">ChatZoo is typing...</div>
              <div className="flex space-x-1">
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></span>
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-150"></span>
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-300"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <form onSubmit={handleSubmit} className="bg-white p-4 border-t shadow-inner sticky bottom-0">
        <div className="flex items-center gap-3">
          <input
            type="text"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={`flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 ${
                    input.trim() ? 'text-gray-800' : 'text-gray-800'
                    }`}
            placeholder="Type your message..."
            disabled={isLoading}
          />
        
          <button
            type="submit"
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all
              ${isLoading || !input.trim()
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'}
            `}
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="white" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-8.7l-3-3a1 1 0 10-1.4 1.4L10.6 9H7a1 1 0 000 2h3.6l-1.3 1.3a1 1 0 101.4 1.4l3-3a1 1 0 000-1.4z" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}