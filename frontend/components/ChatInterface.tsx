import React, { useState, useRef, useEffect } from 'react';

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

export default function ChatInterface() {
  const [currentModel, setCurrentModel] = useState<Model>('cat');
  const [histories, setHistories] = useState<Record<Model, Message[]>>({
    cat: [],
    goldfish: [],
    sloth: []
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = histories[currentModel];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentModel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user'
    };

    const updatedHistory = [...messages, userMessage];
    setHistories(prev => ({ ...prev, [currentModel]: updatedHistory }));
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      const assistantResponses = {
        cat: ["Meow! 😺", "Purr... meow!", "Mrrrr... 🐱", "Hiss! ...just kidding 🐾"],
        goldfish: ["What were we talking about again?", "Blub blub... I forgot 🐟", "Did you just say something?", "Oh shiny! ✨"],
        sloth: ["Hmmm... slooowly thinking... 🦥", "I... need... a... nap...", "That... was... a... message... right?", "Give... me... a... minute... zzz..."]
      };

      const reply = assistantResponses[currentModel][Math.floor(Math.random() * assistantResponses[currentModel].length)];

      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: reply,
        role: 'assistant'
      };

      setHistories(prev => ({
        ...prev,
        [currentModel]: [...prev[currentModel], assistantMessage]
      }));

      setIsLoading(false);
    }, currentModel === 'sloth' ? 1500 : 800);
  };

  const getModelColor = (model: Model) => {
    const m = models.find(m => m.id === model);
    return m?.color ?? 'rgba(255, 255, 255, 0.1)';
  };

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
          >
            {model.icon} {model.name}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="inline-block p-3 rounded-lg max-w-[75%] whitespace-pre-wrap"
              style={{
                background: message.role === 'user' ? 'var(--primary)' : getModelColor(currentModel),
                color: 'var(--light)',
                borderBottomRightRadius: message.role === 'user' ? '5px' : '',
                borderBottomLeftRadius: message.role === 'assistant' ? '5px' : '',
                opacity: message.role === 'assistant' ? 0.95 : 1
              }}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t"
        style={{ background: 'rgba(40, 40, 60, 0.9)', borderTop: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 rounded-l-full text-sm placeholder-gray-400 focus:outline-none"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: 'var(--light)',
              border: 'none'
            }}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-r-full font-semibold"
            style={{
              background: isLoading || !input.trim() ? 'gray' : 'var(--primary)',
              color: 'white',
              cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer'
            }}
            disabled={isLoading || !input.trim()}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
