import Groq from "groq-sdk";
import { ChatAIService, ChatMessage } from "../interfaces/ChatAIService";

export class GroqService implements ChatAIService {
    private groq: Groq;
    private model: string;

    constructor(apiKey: string, model: string = "llama-3.1-8b-instant") {
        this.groq = new Groq({ apiKey });
        this.model = model;
    }

    async generateContent(prompt: string): Promise<string> {
        console.log("Routing prompt to Groq...");

        const chatCompletion = await this.groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: this.model
        });

        const response = chatCompletion.choices[0]?.message?.content;

        if (!response) {
            throw new Error("Groq returned no answers");
        }

        console.log("Success: Received response from Groq.");
        return response;
    }

    async generateChatResponse(prompt: string, history: ChatMessage[] = []): Promise<string> {
        console.log("Routing chat to Groq with history...");

        const groqMessages = history.map(msg => ({
            role: msg.role === 'model' ? 'assistant' as const : 'user' as const,
            content: msg.text
        }));
        groqMessages.push({ role: 'user' as const, content: prompt });

        const chatCompletion = await this.groq.chat.completions.create({
            messages: groqMessages,
            model: this.model
        });

        const response = chatCompletion.choices[0]?.message?.content;

        if (!response) {
            throw new Error("Groq returned no answers");
        }

        console.log("Success: Received chat response from Groq.");
        return response;
    }
}
