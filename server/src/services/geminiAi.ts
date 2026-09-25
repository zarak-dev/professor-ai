import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatAIService, ChatMessage } from "../interfaces/ChatAIService";

export class GeminiService implements ChatAIService {
    private apiKey: string;
    private model: string;
    private gemini: GoogleGenerativeAI;

    constructor(apiKey: string, model: string = "gemini-1.5-flash") {
        this.apiKey = apiKey;
        this.model = model;
        this.gemini = new GoogleGenerativeAI(this.apiKey);
    }

    async generateContent(prompt: string): Promise<string> {
        console.log("Routing prompt to Gemini...");
        const model = this.gemini.getGenerativeModel({ model: this.model });
        const result = await model.generateContent(prompt);

        const response = result.response;

        if (!response || !response.candidates || response.candidates.length === 0) {
            throw new Error("Gemini returned no answers");
        }

        console.log("Success: Received response from Gemini.");
        return response.text();
    }

    async generateChatResponse(prompt: string, history: ChatMessage[] = []): Promise<string> {
        console.log("Routing chat to Gemini with", history.length, "history messages...");
        const model = this.gemini.getGenerativeModel({ model: this.model });

        const geminiHistory = history.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        }));

        const chat = model.startChat({ history: geminiHistory });
        const result = await chat.sendMessage(prompt);

        const response = result.response;

        if (!response || !response.candidates || response.candidates.length === 0) {
            throw new Error("Gemini returned no answers");
        }

        console.log("Success: Received chat response from Gemini.");
        return response.text();
    }
}
