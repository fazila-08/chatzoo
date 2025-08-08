// components/Message.tsx
import { Messages } from '@/types'; 

const modelIcons = {
  cat: '😺',
  goldfish: '🐠',
  sloth: '🦥',
  default: '🤖'
};

export default function Message({ message }: { message: Messages }) {
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-3/4 rounded-lg p-3 ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
        <div className="flex items-center space-x-2 mb-1">
          {message.role === 'assistant' && (
            <span className="text-lg">
              {modelIcons[message.model as keyof typeof modelIcons] || modelIcons.default}
            </span>
          )}
          <span className="font-semibold">
            {message.role === 'user' ? 'You' : 
             message.model === 'cat' ? 'CatGPT' :
             message.model === 'goldfish' ? 'GoldfishGPT' : 'SlothGPT'}
          </span>
        </div>
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}