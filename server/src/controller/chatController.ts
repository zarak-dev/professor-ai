import { Request, Response, NextFunction } from "express";
import { ChatAIService, ChatMessage } from "../interfaces/ChatAIService";
import { ChatHistoryRepository } from "../repositories/ChatHistoryRepository";
import { AppError } from "../errors/app-error";

export class ChatController {
    private aiService: ChatAIService;
    private chatHistoryRepository: ChatHistoryRepository;

    constructor(aiService: ChatAIService, chatHistoryRepository: ChatHistoryRepository) {
        this.aiService = aiService;
        this.chatHistoryRepository = chatHistoryRepository;
    }

    handleChat = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = res.locals.user;
            const doc = res.locals.document;

            if (!user || !user.userId) {
                return next(AppError.unauthorized());
            }
            if (!doc) {
                return next(AppError.notFound("Document not found"));
            }

            const rawText = req.body.prompt || req.body.message;
            if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
                return next(AppError.badRequest("Message is required", "VALIDATION_ERROR"));
            }
            const prompt = rawText.trim();

            // Load existing chat history from MongoDB
            const pastMessages = await this.chatHistoryRepository.findByDocId(user.userId, doc._id.toString());

            const chatHistory: ChatMessage[] = [];

            // Add system document context
            if (doc.extracted_text && doc.extracted_text.trim().length > 0) {
                chatHistory.push({
                    role: 'user',
                    text: `You are "The Professor", an expert AI tutor. The user has uploaded the following document. Answer their questions accurately based on this document context. If a question is not answered by or related to the document, answer politely while noting the limitation.\n\nDOCUMENT CONTEXT:\n${doc.extracted_text.substring(0, 30000)}`
                });
                chatHistory.push({
                    role: 'model',
                    text: 'I have read and understood the document. I am ready to answer your questions about it.'
                });
            }

            // Include past messages (last 10 messages for context)
            const recentPast = pastMessages.slice(-10);
            for (const msg of recentPast) {
                chatHistory.push({
                    role: msg.role === 'model' ? 'model' : 'user',
                    text: msg.message
                });
            }

            let response = "";
            try {
                response = await this.aiService.generateChatResponse(prompt.trim(), chatHistory);
            } catch (aiErr: any) {
                console.error("[CHAT] AI response error:", aiErr);
                return next(AppError.aiError(aiErr.message || "Failed to generate chat response"));
            }

            try {
                await this.chatHistoryRepository.create([
                    {
                        user_id: user.userId,
                        doc_id: doc._id,
                        role: 'user',
                        message: prompt.trim()
                    },
                    {
                        user_id: user.userId,
                        doc_id: doc._id,
                        role: 'model',
                        message: response
                    }
                ]);
            } catch (dbErr) {
                console.warn("[CHAT] Failed to persist messages to DB (non-fatal):", dbErr);
            }

            res.status(200).json({ response });
        } catch (error) {
            next(error);
        }
    };

    getChatHistory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = res.locals.user;
            const doc = res.locals.document;

            if (!user || !user.userId) {
                return next(AppError.unauthorized());
            }
            if (!doc) {
                return next(AppError.notFound("Document not found"));
            }

            const messages = await this.chatHistoryRepository.findByDocId(user.userId, doc._id.toString());

            const formatted = messages.map(m => ({
                _id: m._id,
                role: m.role,
                message: m.message,
                timestamp: (m as any).createdAt || (m as any).timestamp || new Date()
            }));

            res.json({ messages: formatted });
        } catch (error) {
            next(error);
        }
    };
}