import Groq from "groq-sdk";
import { ChatAIService, ChatMessage } from "../interfaces/ChatAIService";

export class GroqService implements ChatAIService {
    private groq: Groq;
    private preferredModel: string;
    private static candidateModels: string[] = [
        process.env.GROQ_MODEL || "",
        "openai/gpt-oss-120b",
        "openai/gpt-oss-20b",
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant"
    ].filter(Boolean);

    constructor(apiKey: string, model: string = "openai/gpt-oss-120b") {
        this.groq = new Groq({ apiKey });
        this.preferredModel = process.env.GROQ_MODEL || model;
    }

    private getModelCandidates(): string[] {
        const list = [this.preferredModel, ...GroqService.candidateModels];
        return Array.from(new Set(list));
    }

    async generateContent(prompt: string): Promise<string> {
        console.log("Routing prompt to Groq...");
        const candidates = this.getModelCandidates();
        let lastError: any = null;

        for (const candidate of candidates) {
            try {
                console.log(`[Groq] Attempting generation with model: ${candidate}`);
                const chatCompletion = await this.groq.chat.completions.create({
                    messages: [{ role: "user", content: prompt }],
                    model: candidate
                });

                const response = chatCompletion.choices[0]?.message?.content;
                if (response) {
                    this.preferredModel = candidate;
                    console.log(`Success: Received response from Groq using ${candidate}.`);
                    return response;
                }
            } catch (err: any) {
                console.warn(`[Groq] Model ${candidate} failed: ${err.message}`);
                lastError = err;
            }
        }

        throw lastError || new Error("Groq returned no answers across all available models");
    }

    async generateChatResponse(prompt: string, history: ChatMessage[] = []): Promise<string> {
        console.log("Routing chat to Groq with history...");

        const groqMessages = history.map(msg => ({
            role: msg.role === 'model' ? 'assistant' as const : 'user' as const,
            content: msg.text
        }));
        groqMessages.push({ role: 'user' as const, content: prompt });

        const candidates = this.getModelCandidates();
        let lastError: any = null;

        for (const candidate of candidates) {
            try {
                console.log(`[Groq] Attempting chat with model: ${candidate}`);
                const chatCompletion = await this.groq.chat.completions.create({
                    messages: groqMessages,
                    model: candidate
                });

                const response = chatCompletion.choices[0]?.message?.content;
                if (response) {
                    this.preferredModel = candidate;
                    console.log(`Success: Received chat response from Groq using ${candidate}.`);
                    return response;
                }
            } catch (err: any) {
                console.warn(`[Groq] Chat model ${candidate} failed: ${err.message}`);
                lastError = err;
            }
        }

        throw lastError || new Error("Groq returned no chat answers across all available models");
    }
}
