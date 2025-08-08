import { useState, useRef, useEffect } from 'react';

type Messages = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  model?: 'cat' | 'goldfish' | 'sloth';
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Messages[]>([
    { 
      id: '1', 
      content: 'Hello! I\'m ChatZoo. Select a mode below to start chatting!', 
      role: 'assistant',
      model: 'cat'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeModel, setActiveModel] = useState<'cat' | 'goldfish' | 'sloth'>('cat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const modelInfo = {
    cat: {
      name: 'Cat Mode',
      emoji: '😺',
      description: 'Replies in meows with cat emojis',
      prompt: "User: Hello\nCat: Meow! 😺"
    },
    goldfish: {
      name: 'Goldfish Memory',
      emoji: '🐠',
      description: 'Forgets everything after 2 messages',
      prompt: "User: What's my name?\nGoldfish: I forget... 🐠"
    },
    sloth: {
      name: 'Sloth Mode',
      emoji: '🦥',
      description: 'Types slowly with random delays',
      prompt: "User: How are you?\nSloth: I... a... m... f... i... n... e... 🦥"
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Messages = {
      id: Date.now().toString(),
      content: input,
      role: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          model: activeModel
        })
      });

      if (!response.ok || !response.body) throw new Error("Failed to connect.");

      if (activeModel === 'sloth') {
        await handleStreamResponse(response);
      } else {
        const data = await response.json();

        const assistantMessage: Messages = {
          id: Date.now().toString(),
          content: data.response,
          role: 'assistant',
          model: activeModel
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Chat error:", error);

      const errorMessage: Messages = {
        id: Date.now().toString(),
        content: 'Sorry, I had trouble responding. Try again?',
        role: 'assistant',
        model: activeModel
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStreamResponse = async (response: Response) => {
    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let assistantMessageId = Date.now().toString();
    let fullResponse = '';

    setMessages(prev => [...prev, {
      id: assistantMessageId,
      content: '',
      role: 'assistant',
      model: 'sloth'
    }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      fullResponse += chunk;

      setMessages(prev => prev.map(msg =>
        msg.id === assistantMessageId
          ? { ...msg, content: fullResponse }
          : msg
      ));

      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

      if (Math.random() > 0.7) {
        await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-100 via-white to-gray-50">
      <header className="bg-gradient-to-r from-blue-500 to-purple-600 p-5 shadow-md rounded-b-2xl">
        <h1 className="text-2xl font-bold text-center text-white tracking-wide">ChatZoo 🐾</h1>
        <p className="text-sm text-center text-blue-100 mt-1">Your friendly neighborhood chat companion</p>

        {/* Model Selection */}
        <div className="mt-4 flex justify-center gap-2">
          {(['cat', 'goldfish', 'sloth'] as const).map(model => (
            <button
              key={model}
              onClick={() => setActiveModel(model)}
              className={`px-3 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                activeModel === model
                  ? 'bg-white text-purple-600 shadow-md'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <span>{modelInfo[model].emoji}</span>
              <span>{modelInfo[model].name}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Model Info Banner */}
      <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 text-center text-xs text-blue-600">
        <span className="font-medium">{modelInfo[activeModel].name}</span>: {modelInfo[activeModel].description}
      </div>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`
              max-w-[80%] px-4 py-3 rounded-2xl shadow-md transition-all relative
              ${message.role === 'user' 
                ? 'bg-blue-500 text-white rounded-br-none' 
                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'}
            `}>
              {message.role === 'assistant' && (
                <div className="flex items-center gap-1 text-xs font-medium mb-1">
                  <span className="text-purple-600">ChatZoo</span>
                  {message.model && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                      {modelInfo[message.model].emoji} {modelInfo[message.model].name}
                    </span>
                  )}
                </div>
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
              <div className="flex items-center gap-2 text-xs font-medium mb-2">
                <span className="text-purple-500">ChatZoo is typing...</span>
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  {modelInfo[activeModel].emoji} {modelInfo[activeModel].name}
                </span>
              </div>
              <div className="flex space-x-1">
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '300ms' }}></span>
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
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 placeholder-gray-400"
            placeholder={`Message ChatZoo in ${modelInfo[activeModel].name}...`}
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