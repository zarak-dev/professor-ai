export interface AIService {
    generateContent(prompt: string): Promise<string>;
}
