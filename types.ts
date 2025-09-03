
export type ModelType = 'cat' | 'goldfish' | 'sloth';

export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  model?: ModelType;
}

export interface ModelInfo {
  id: ModelType;
  name: string;
  description: string;
  avatar: React.ReactNode;
}
