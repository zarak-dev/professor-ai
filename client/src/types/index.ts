export interface User {
  userId: string;
  email: string;
  name?: string;
}

export interface DocumentItem {
  _id: string;
  file_name: string;
  summary: string;
  status: 'processing' | 'ready' | 'failed';
  createdAt: string;
  hasQuiz?: boolean;
  hasFlashcards?: boolean;
  hasVisualization?: boolean;
}

export interface ChatMessage {
  _id?: string;
  role: 'user' | 'model';
  message: string;
  timestamp?: string;
  createdAt?: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface Flashcard {
  id: number;
  front: string;
  back: string;
  category: string;
}

export interface TopicNode {
  name: string;
  summary: string;
  keyPoints: string[];
  importance: 'high' | 'medium' | 'low';
}

export interface TopicConnection {
  from: string;
  to: string;
  relation: string;
}

export interface VisualizationData {
  title: string;
  topics: TopicNode[];
  connections: TopicConnection[];
}

export interface ApiResponseError {
  error: {
    code: string;
    message: string;
  };
}
