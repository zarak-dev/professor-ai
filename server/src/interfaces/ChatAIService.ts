import { AIService } from "./AIService"

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export interface ChatAIService extends AIService {
    generateChatResponse(prompt: string, history: ChatMessage[]): Promise<string>;
}
