import React, { useState, useRef, useEffect, useCallback } from 'react';

type Role = 'user' | 'assistant';
type Model = 'cat' | 'goldfish' | 'sloth';

type Message = {
  id: string;
  content: string;
  role: Role;
};

const models: { id: Model; name: string; icon: string; color: string }[] = [
  { id: 'cat', name: 'Cat', icon: '🐱', color: 'var(--cat)' },
  { id: 'goldfish', name: 'Goldfish', icon: '🐟', color: 'var(--fish)' },
  { id: 'sloth', name: 'Sloth', icon: '🦥', color: 'var(--sloth)' }
];

function generateId(role: Role) {
  return `${role}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

export default function ChatInterface() {
  const [currentModel, setCurrentModel] = useState<Model>('cat');
  const [histories, setHistories] = useState<Record<Model, Message[]>>({
    cat: [],
    goldfish: [],
    sloth: []
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const messages = histories[currentModel];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentModel]);

  // Focus input on mount and after sending
  useEffect(() => {
    inputRef.current?.focus();
  }, [currentModel, isLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (controllerRef.current) controllerRef.current.abort();
    };
  }, []);

  const getModelColor = (model: Model) => {
    const m = models.find(m => m.id === model);
    return m?.color ?? 'rgba(255, 255, 255, 0.1)';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Cancel any ongoing request
    if (controllerRef.current) controllerRef.current.abort();

    const userMessage: Message = {
      id: generateId('user'),
      content: input,
      role: 'user'
    };

    setHistories(prev => ({
      ...prev,
      [currentModel]: [...prev[currentModel], userMessage]
    }));
    setInput('');
    setIsLoading(true);
    setError(null);

    // Create assistant message placeholder
    const assistantMessageId = generateId('assistant');
    const assistantMessage: Message = {
      id: assistantMessageId,
      content: '',
      role: 'assistant'
    };

    setHistories(prev => ({
      ...prev,
      [currentModel]: [...prev[currentModel], assistantMessage]
    }));

    try {
      const controller = new AbortController();
      controllerRef.current = controller;

      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          model: currentModel
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      if (currentModel === 'sloth') {
        // Streaming for sloth
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response stream');
        const decoder = new TextDecoder();
        let assistantContent = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          assistantContent += chunk;
          setHistories(prev => ({
            ...prev,
            [currentModel]: prev[currentModel].map(msg =>
              msg.id === assistantMessageId
                ? { ...msg, content: assistantContent }
                : msg
            )
          }));
          // Simulate sloth typing
          await new Promise(resolve => setTimeout(resolve, 80));
        }
      } else {
        // Non-streaming
        const data = await response.json();
        setHistories(prev => ({
          ...prev,
          [currentModel]: prev[currentModel].map(msg =>
            msg.id === assistantMessageId
              ? { ...msg, content: data.response }
              : msg
          )
        }));
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Request aborted
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
        setHistories(prev => ({
          ...prev,
          [currentModel]: prev[currentModel].map(msg =>
            msg.id === assistantMessageId
              ? { ...msg, content: "I'm having trouble thinking right now... try again?" }
              : msg
          )
        }));
      }
    } finally {
      setIsLoading(false);
      controllerRef.current = null;
    }
  };

  const clearHistory = useCallback(() => {
    if (window.confirm('Clear chat history for this model?')) {
      setHistories(prev => ({
        ...prev,
        [currentModel]: []
      }));
    }
  }, [currentModel]);

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--dark)', color: 'var(--light)' }}>
      {/* Header */}
      <header className="p-5 text-center">
        <h1 className="text-2xl font-bold tracking-wide" style={{
          background: 'linear-gradient(90deg, var(--cat), var(--fish), var(--sloth))',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          textShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          ChatZoo 🐾
        </h1>
        <p className="text-sm mt-1 opacity-80">Switch between 3 AI personalities</p>
      </header>

      {/* Model Tabs */}
      <div className="flex justify-center gap-4 mb-4 flex-wrap px-4">
        {models.map(model => (
          <button
            key={model.id}
            onClick={() => setCurrentModel(model.id)}
            className={`px-4 py-2 rounded-full font-semibold border transition-all ${
              currentModel === model.id
                ? 'scale-105 shadow-lg'
                : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              borderColor: model.color,
              color: model.color
            }}
            aria-label={`Switch to ${model.name}`}
            disabled={isLoading}
          >
            {model.icon} {model.name}
          </button>
        ))}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 px-4 py-2 text-red-200 text-sm text-center mb-2">
          <span>⚠️ {error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-2 hover:text-white"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 opacity-60">
            <div className="text-6xl mb-4">{models.find((m: typeof models[number]) => m.id === currentModel)?.icon}</div>
            <p>Start chatting with {models.find((m: typeof models[number]) => m.id === currentModel)?.name}!</p>
          </div>
        ) : (
          messages.map((message: Message, idx: number) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
          className="inline-block p-3 rounded-lg max-w-[75%] whitespace-pre-wrap"
          style={{
            background: message.role === 'user' ? 'var(--primary)' : getModelColor(currentModel),
            color: 'var(--light)',
            borderBottomRightRadius: message.role === 'user' ? '5px' : '',
            borderBottomLeftRadius: message.role === 'assistant' ? '5px' : '',
            opacity: message.role === 'assistant' ? 0.95 : 1
          } as React.CSSProperties}
              >
          {message.content}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t"
        style={{ background: 'rgba(40, 40, 60, 0.9)', borderTop: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="flex items-center gap-2">
          {/* Clear history button */}
          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearHistory}
              className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
              title="Clear chat history"
              aria-label="Clear chat history"
              disabled={isLoading}
            >
              🗑️
            </button>
          )}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 rounded-l-full text-sm placeholder-gray-400 focus:outline-none"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: 'var(--light)',
              border: 'none'
            }}
            placeholder={`Message ${models.find(m => m.id === currentModel)?.name}...`}
            disabled={isLoading}
            maxLength={500}
            aria-label={`Message ${models.find(m => m.id === currentModel)?.name}`}
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-r-full font-semibold flex items-center justify-center"
            style={{
              background: isLoading || !input.trim() ? 'gray' : 'var(--primary)',
              color: 'white',
              cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
              minWidth: '80px'
            }}
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {currentModel === 'sloth' ? 'Zzz...' : '...'}
              </div>
            ) : 'Send'}
          </button>
        </div>
        {/* Character count */}
        <div className="text-xs text-right mt-1 opacity-50">
          {input.length}/500
        </div>
      </form>
    </div>
  );
}