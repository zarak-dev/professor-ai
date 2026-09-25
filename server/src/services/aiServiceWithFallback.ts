import { ChatAIService, ChatMessage } from "../interfaces/ChatAIService";
import { AppError } from "../errors/app-error";

export class AIServiceWithFallback implements ChatAIService {
    private primary: ChatAIService;
    private fallback: ChatAIService;
    private timeoutMs: number;

    constructor(primary: ChatAIService, fallback: ChatAIService, timeoutMs: number = 30000) {
        this.primary = primary;
        this.fallback = fallback;
        this.timeoutMs = timeoutMs;
    }

    private async callWithTimeout<T>(
        fn: () => Promise<T>,
        providerName: string,
        timeoutMs: number
    ): Promise<T> {
        let timer: NodeJS.Timeout | null = null;
        const timeoutPromise = new Promise<never>((_, reject) => {
            timer = setTimeout(() => {
                reject(new Error(`Timeout: ${providerName} did not respond within ${timeoutMs / 1000}s`));
            }, timeoutMs);
        });

        try {
            const start = Date.now();
            const result = await Promise.race([fn(), timeoutPromise]);
            const elapsed = Date.now() - start;
            console.log(`[AI] Provider: ${providerName} | Latency: ${elapsed}ms | Status: SUCCESS`);
            return result;
        } finally {
            if (timer) clearTimeout(timer);
        }
    }

    async generateContent(prompt: string): Promise<string> {
        const startTotal = Date.now();
        try {
            return await this.callWithTimeout(
                () => this.primary.generateContent(prompt),
                "Aimmyy AI (Primary)",
                this.timeoutMs
            );
        } catch (primaryError: any) {
            console.warn(
                `[AI ENGINE] Aimmyy AI Primary failed (${primaryError.message || "Unknown"}). Routing to Aimmyy AI Fallback...`
            );
            try {
                return await this.callWithTimeout(
                    () => this.fallback.generateContent(prompt),
                    "Aimmyy AI (Fallback)",
                    this.timeoutMs
                );
            } catch (fallbackError: any) {
                const totalElapsed = Date.now() - startTotal;
                console.error(
                    `[AI ERROR] Both Aimmyy AI primary and fallback failed after ${totalElapsed}ms. Error: ${fallbackError.message || "Unknown"}`
                );
                throw AppError.aiError(
                    `Aimmyy AI generation failed. Primary: ${primaryError.message || "failed"}, Fallback: ${fallbackError.message || "failed"}`
                );
            }
        }
    }

    async generateChatResponse(prompt: string, history: ChatMessage[] = []): Promise<string> {
        const startTotal = Date.now();
        try {
            return await this.callWithTimeout(
                () => this.primary.generateChatResponse(prompt, history),
                "Aimmyy AI (Primary)",
                this.timeoutMs
            );
        } catch (primaryError: any) {
            console.warn(
                `[AI ENGINE] Aimmyy AI Primary chat failed (${primaryError.message || "Unknown"}). Routing to Aimmyy AI Fallback...`
            );
            try {
                return await this.callWithTimeout(
                    () => this.fallback.generateChatResponse(prompt, history),
                    "Aimmyy AI (Fallback)",
                    this.timeoutMs
                );
            } catch (fallbackError: any) {
                const totalElapsed = Date.now() - startTotal;
                console.error(
                    `[AI ERROR] Both Aimmyy AI primary and fallback failed for chat after ${totalElapsed}ms. Error: ${fallbackError.message || "Unknown"}`
                );
                throw AppError.aiError(
                    `Aimmyy AI chat failed. Primary: ${primaryError.message || "failed"}, Fallback: ${fallbackError.message || "failed"}`
                );
            }
        }
    }
}
