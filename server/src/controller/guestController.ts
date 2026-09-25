import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import fs from "fs";
import { GUEST_CONFIG } from "../config/guestConfig";
import { GuestDocumentModel } from "../models/GuestDocument";
import { AppError } from "../errors/app-error";
import { ChatAIService, ChatMessage } from "../interfaces/ChatAIService";
import { DocumentProcessor } from "../interfaces/DocumentProcessor";
import { AIParser } from "../utils/parseAIJson";
import { DocumentRepository } from "../repositories/DocumentRepository";
import { QuizRepository } from "../repositories/QuizRepository";
import { FlashcardRepository } from "../repositories/FlashcardRepository";
import { VisualizationRepository } from "../repositories/VisualizationRepository";
import { ChatHistoryRepository } from "../repositories/ChatHistoryRepository";

export class GuestController {
    private aiService: ChatAIService;
    private documentProcessor: DocumentProcessor;
    private aiParser: AIParser;
    private jwtSecret: string;
    private documentRepository: DocumentRepository;
    private quizRepository: QuizRepository;
    private flashcardRepository: FlashcardRepository;
    private visualizationRepository: VisualizationRepository;
    private chatHistoryRepository: ChatHistoryRepository;

    constructor(
        aiService: ChatAIService,
        documentProcessor: DocumentProcessor,
        aiParser: AIParser,
        jwtSecret: string,
        documentRepository: DocumentRepository,
        quizRepository: QuizRepository,
        flashcardRepository: FlashcardRepository,
        visualizationRepository: VisualizationRepository,
        chatHistoryRepository: ChatHistoryRepository
    ) {
        this.aiService = aiService;
        this.documentProcessor = documentProcessor;
        this.aiParser = aiParser;
        this.jwtSecret = jwtSecret;
        this.documentRepository = documentRepository;
        this.quizRepository = quizRepository;
        this.flashcardRepository = flashcardRepository;
        this.visualizationRepository = visualizationRepository;
        this.chatHistoryRepository = chatHistoryRepository;
    }

    /**
     * Issues a cryptographically signed, short-lived guest session token.
     */
    createSession = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const guestId = 'gst_' + crypto.randomBytes(12).toString('hex');
            const token = jwt.sign(
                { guestId, isGuest: true },
                this.jwtSecret,
                { expiresIn: `${GUEST_CONFIG.SESSION_EXPIRY_SECONDS}s` }
            );

            res.status(201).json({
                token,
                guestId,
                limits: GUEST_CONFIG,
                expiresIn: GUEST_CONFIG.SESSION_EXPIRY_SECONDS
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Uploads and parses a temporary guest document.
     */
    handleUpload = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const guest = res.locals.guest;
            if (!guest || !guest.guestId) {
                return next(AppError.unauthorized("Guest session required"));
            }

            if (!req.file) {
                return next(AppError.badRequest("No file uploaded"));
            }

            // Enforce file size limit for guests (5MB)
            if (req.file.size > GUEST_CONFIG.MAX_FILE_SIZE_BYTES) {
                return next(AppError.badRequest(
                    `Guest uploads are limited to ${GUEST_CONFIG.MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB. Sign up for full 20MB file support.`,
                    "GUEST_LIMIT_REACHED"
                ));
            }

            // Enforce single document limit for guest sessions
            const existingCount = await GuestDocumentModel.countDocuments({ guest_id: guest.guestId });
            if (existingCount >= GUEST_CONFIG.MAX_DOCUMENTS) {
                return next(AppError.forbidden(
                    `Guest mode allows ${GUEST_CONFIG.MAX_DOCUMENTS} active document. Create an account to upload unlimited documents.`,
                    "GUEST_LIMIT_REACHED"
                ));
            }

            console.log(`[GUEST] Processing file: ${req.file.originalname} for guest: ${guest.guestId}`);

            const extractedText = await this.documentProcessor.extractText(req.file.path);
            if (!extractedText || extractedText.trim().length === 0) {
                return next(AppError.badRequest("The uploaded PDF contains no readable text."));
            }

            let summary = "";
            try {
                const summaryPrompt = `Generate a comprehensive, executive summary of the following document.
Highlight the primary thesis, key findings, and core themes.

DOCUMENT CONTENT:
${extractedText.substring(0, 15000)}

EXECUTIVE SUMMARY:`;
                summary = await this.aiService.generateContent(summaryPrompt);
            } catch (aiErr: any) {
                console.warn("[GUEST UPLOAD] AI summary generation failed (proceeding without summary):", aiErr.message);
            }

            // Clean up the uploaded temp file
            if (fs.existsSync(req.file.path)) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch (cleanupErr) {
                    console.warn("[GUEST] Could not remove temp file:", cleanupErr);
                }
            }

            const guestDoc = await GuestDocumentModel.create({
                guest_id: guest.guestId,
                file_name: req.file.originalname,
                file_size: req.file.size,
                extracted_text: extractedText,
                summary,
                chat_messages: [],
                generations_used: 0,
                chat_used: 0
            });

            console.log(`[GUEST UPLOAD] Document created with ID: ${guestDoc._id}`);

            res.status(201).json({
                document: {
                    _id: guestDoc._id,
                    file_name: guestDoc.file_name,
                    summary: guestDoc.summary,
                    file_size: guestDoc.file_size,
                    createdAt: guestDoc.createdAt,
                    isGuest: true
                },
                limits: GUEST_CONFIG,
                usage: {
                    chatUsed: 0,
                    generationsUsed: 0
                }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Retrieves guest document details with usage metrics.
     */
    getDocumentById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const guest = res.locals.guest;
            const documentId = req.params.id;

            const doc = await GuestDocumentModel.findOne({ _id: documentId, guest_id: guest.guestId });
            if (!doc) {
                return next(AppError.notFound("Guest document not found or expired"));
            }

            res.status(200).json({
                document: {
                    _id: doc._id,
                    file_name: doc.file_name,
                    summary: doc.summary,
                    file_size: doc.file_size,
                    createdAt: doc.createdAt,
                    isGuest: true
                },
                limits: GUEST_CONFIG,
                usage: {
                    chatUsed: doc.chat_used,
                    generationsUsed: doc.generations_used
                }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Retrieves chat history for a guest document.
     */
    getChatHistory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const guest = res.locals.guest;
            const documentId = req.params.id;

            const doc = await GuestDocumentModel.findOne({ _id: documentId, guest_id: guest.guestId });
            if (!doc) {
                return next(AppError.notFound("Guest document not found"));
            }

            const messages = (doc.chat_messages || []).map((m: any, index: number) => ({
                _id: `${doc._id}_${index}`,
                role: m.role,
                message: m.message,
                timestamp: m.timestamp
            }));

            res.status(200).json({
                messages,
                usage: {
                    chatUsed: doc.chat_used,
                    maxChat: GUEST_CONFIG.MAX_CHAT_MESSAGES
                }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Answers questions in a guest chat with limit enforcement.
     */
    handleChat = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const guest = res.locals.guest;
            const documentId = req.params.id;

            const doc = await GuestDocumentModel.findOne({ _id: documentId, guest_id: guest.guestId });
            if (!doc) {
                return next(AppError.notFound("Guest document not found"));
            }

            // Check guest chat limit
            if (doc.chat_used >= GUEST_CONFIG.MAX_CHAT_MESSAGES) {
                return next(AppError.forbidden(
                    `You've reached the guest limit of ${GUEST_CONFIG.MAX_CHAT_MESSAGES} questions. Create a free account to continue asking questions.`,
                    "GUEST_LIMIT_REACHED"
                ));
            }

            const rawText = req.body.prompt || req.body.message;
            if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
                return next(AppError.badRequest("Message is required", "VALIDATION_ERROR"));
            }
            const prompt = rawText.trim();

            const chatHistory: ChatMessage[] = [];
            if (doc.extracted_text) {
                chatHistory.push({
                    role: 'user',
                    text: `You are "The Professor", an expert AI tutor. Answer questions accurately based on this document context.\n\nDOCUMENT CONTEXT:\n${doc.extracted_text.substring(0, 25000)}`
                });
                chatHistory.push({
                    role: 'model',
                    text: 'I have read and understood the document. I am ready to answer your questions about it.'
                });
            }

            const recent = doc.chat_messages.slice(-6);
            for (const msg of recent) {
                chatHistory.push({
                    role: msg.role === 'model' ? 'model' : 'user',
                    text: msg.message
                });
            }

            const response = await this.aiService.generateChatResponse(prompt, chatHistory);

            doc.chat_messages.push(
                { role: 'user', message: prompt, timestamp: new Date() },
                { role: 'model', message: response, timestamp: new Date() }
            );
            doc.chat_used += 1;
            await doc.save();

            res.status(200).json({
                response,
                usage: {
                    chatUsed: doc.chat_used,
                    maxChat: GUEST_CONFIG.MAX_CHAT_MESSAGES
                }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Gets or generates quiz for guest document.
     */
    getQuiz = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const guest = res.locals.guest;
            const doc = await GuestDocumentModel.findOne({ _id: req.params.id, guest_id: guest.guestId });
            if (!doc) return next(AppError.notFound("Document not found"));

            if (!doc.quiz || doc.quiz.length === 0) {
                return next(AppError.notFound("Quiz not generated yet"));
            }

            res.status(200).json({ questions: doc.quiz });
        } catch (error) {
            next(error);
        }
    };

    handleQuiz = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const guest = res.locals.guest;
            const doc = await GuestDocumentModel.findOne({ _id: req.params.id, guest_id: guest.guestId });
            if (!doc) return next(AppError.notFound("Document not found"));

            if (doc.quiz && doc.quiz.length > 0) {
                return res.status(200).json({ questions: doc.quiz });
            }

            if (doc.generations_used >= GUEST_CONFIG.MAX_AI_GENERATIONS) {
                return next(AppError.forbidden(
                    `You've reached the guest limit of ${GUEST_CONFIG.MAX_AI_GENERATIONS} AI generations. Create a free account for unlimited generations.`,
                    "GUEST_LIMIT_REACHED"
                ));
            }

            const prompt = `Based on the following document text, generate a 5-question multiple choice quiz to test understanding.
Format your output as a valid JSON array of objects with fields:
id (number), question (string), options (array of 4 strings), correct (0-based index of correct option), explanation (string).

DOCUMENT TEXT:
${doc.extracted_text.substring(0, 20000)}

JSON RESPONSE:`;

            const rawAi = await this.aiService.generateContent(prompt);
            const questions = this.aiParser.parseJson<any[]>(rawAi, "quiz");

            doc.quiz = questions;
            doc.generations_used += 1;
            await doc.save();

            res.status(200).json({
                questions: doc.quiz,
                usage: {
                    generationsUsed: doc.generations_used,
                    maxGenerations: GUEST_CONFIG.MAX_AI_GENERATIONS
                }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Gets or generates flashcards for guest document.
     */
    getFlashcards = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const guest = res.locals.guest;
            const doc = await GuestDocumentModel.findOne({ _id: req.params.id, guest_id: guest.guestId });
            if (!doc) return next(AppError.notFound("Document not found"));

            if (!doc.flashcards || doc.flashcards.length === 0) {
                return next(AppError.notFound("Flashcards not generated yet"));
            }

            res.status(200).json({ flashcards: doc.flashcards });
        } catch (error) {
            next(error);
        }
    };

    handleFlashcards = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const guest = res.locals.guest;
            const doc = await GuestDocumentModel.findOne({ _id: req.params.id, guest_id: guest.guestId });
            if (!doc) return next(AppError.notFound("Document not found"));

            if (doc.flashcards && doc.flashcards.length > 0) {
                return res.status(200).json({ flashcards: doc.flashcards });
            }

            if (doc.generations_used >= GUEST_CONFIG.MAX_AI_GENERATIONS) {
                return next(AppError.forbidden(
                    `You've reached the guest limit of ${GUEST_CONFIG.MAX_AI_GENERATIONS} AI generations. Create a free account for unlimited generations.`,
                    "GUEST_LIMIT_REACHED"
                ));
            }

            const prompt = `Based on the following document text, generate 6 concise study flashcards for key terms, definitions, and concepts.
Format your output as a valid JSON array of objects with fields:
id (number), front (question/term), back (answer/definition), category (string).

DOCUMENT TEXT:
${doc.extracted_text.substring(0, 20000)}

JSON RESPONSE:`;

            const rawAi = await this.aiService.generateContent(prompt);
            const cards = this.aiParser.parseJson<any[]>(rawAi, "flashcards");

            doc.flashcards = cards;
            doc.generations_used += 1;
            await doc.save();

            res.status(200).json({
                flashcards: doc.flashcards,
                usage: {
                    generationsUsed: doc.generations_used,
                    maxGenerations: GUEST_CONFIG.MAX_AI_GENERATIONS
                }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Gets or generates concept map visualization for guest document.
     */
    getVisualize = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const guest = res.locals.guest;
            const doc = await GuestDocumentModel.findOne({ _id: req.params.id, guest_id: guest.guestId });
            if (!doc) return next(AppError.notFound("Document not found"));

            if (!doc.visualization) {
                return next(AppError.notFound("Visualization not generated yet"));
            }

            res.status(200).json({ visualization: doc.visualization });
        } catch (error) {
            next(error);
        }
    };

    handleVisualize = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const guest = res.locals.guest;
            const doc = await GuestDocumentModel.findOne({ _id: req.params.id, guest_id: guest.guestId });
            if (!doc) return next(AppError.notFound("Document not found"));

            if (doc.visualization && doc.visualization.topics?.length > 0) {
                return res.status(200).json({ visualization: doc.visualization });
            }

            if (doc.generations_used >= GUEST_CONFIG.MAX_AI_GENERATIONS) {
                return next(AppError.forbidden(
                    `You've reached the guest limit of ${GUEST_CONFIG.MAX_AI_GENERATIONS} AI generations. Create a free account for unlimited generations.`,
                    "GUEST_LIMIT_REACHED"
                ));
            }

            const prompt = `Based on the following document text, create a structured concept map.
Output valid JSON with:
{
  "title": "Document Concept Map",
  "topics": [
    { "name": "Topic Name", "summary": "Short summary", "keyPoints": ["point 1", "point 2"], "importance": "high"|"medium"|"low" }
  ],
  "connections": [
    { "from": "Topic Name", "to": "Other Topic Name", "relation": "relationship explanation" }
  ]
}

DOCUMENT TEXT:
${doc.extracted_text.substring(0, 20000)}

JSON RESPONSE:`;

            const rawAi = await this.aiService.generateContent(prompt);
            const visualization = this.aiParser.parseJson<any>(rawAi, "visualization");

            doc.visualization = visualization;
            doc.generations_used += 1;
            await doc.save();

            res.status(200).json({
                visualization: doc.visualization,
                usage: {
                    generationsUsed: doc.generations_used,
                    maxGenerations: GUEST_CONFIG.MAX_AI_GENERATIONS
                }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Safely migrates a guest's temporary document into their newly authenticated account.
     * Protected by authMiddleware (requires verified authenticated user).
     */
    claimGuestDocument = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = res.locals.user;
            if (!user || !user.userId) {
                return next(AppError.unauthorized("Authentication required to claim documents"));
            }

            const { guestToken } = req.body;
            if (!guestToken || typeof guestToken !== 'string') {
                return next(AppError.badRequest("Guest token is required to claim documents"));
            }

            let guestDecoded: any;
            try {
                guestDecoded = jwt.verify(guestToken, this.jwtSecret);
            } catch {
                return next(AppError.badRequest("Invalid or expired guest token. Cannot claim document."));
            }

            if (!guestDecoded || !guestDecoded.isGuest || !guestDecoded.guestId) {
                return next(AppError.badRequest("Provided token is not a valid guest session token"));
            }

            // Find guest document
            const guestDoc = await GuestDocumentModel.findOne({ guest_id: guestDecoded.guestId });
            if (!guestDoc) {
                return res.status(200).json({
                    success: false,
                    message: "No active guest document found to claim."
                });
            }

            console.log(`[CLAIM] Migrating guest document "${guestDoc.file_name}" from guest ${guestDecoded.guestId} to user ${user.userId}`);

            // 1. Create persistent Document owned by authenticated user
            const permanentDoc = await this.documentRepository.create({
                file_name: guestDoc.file_name,
                user_id: user.userId,
                summary: guestDoc.summary,
                extracted_text: guestDoc.extracted_text,
                status: 'ready'
            });

            const permanentDocId = permanentDoc._id.toString();

            // 2. Migrate quiz if generated
            if (guestDoc.quiz && guestDoc.quiz.length > 0) {
                try {
                    await this.quizRepository.create(user.userId, permanentDocId, guestDoc.quiz as any);
                } catch (e) {
                    console.warn("[CLAIM] Quiz migration error (non-fatal):", e);
                }
            }

            // 3. Migrate flashcards if generated
            if (guestDoc.flashcards && guestDoc.flashcards.length > 0) {
                try {
                    await this.flashcardRepository.create(user.userId, permanentDocId, guestDoc.flashcards as any);
                } catch (e) {
                    console.warn("[CLAIM] Flashcard migration error (non-fatal):", e);
                }
            }

            // 4. Migrate visualization if generated
            if (guestDoc.visualization && guestDoc.visualization.topics?.length > 0) {
                try {
                    await this.visualizationRepository.create(user.userId, permanentDocId, guestDoc.visualization as any);
                } catch (e) {
                    console.warn("[CLAIM] Visualization migration error (non-fatal):", e);
                }
            }

            // 5. Migrate chat messages if any
            if (guestDoc.chat_messages && guestDoc.chat_messages.length > 0) {
                try {
                    const persistentMessages = guestDoc.chat_messages.map(m => ({
                        user_id: user.userId,
                        doc_id: permanentDoc._id,
                        role: m.role,
                        message: m.message
                    }));
                    await this.chatHistoryRepository.create(persistentMessages);
                } catch (e) {
                    console.warn("[CLAIM] Chat messages migration error (non-fatal):", e);
                }
            }

            // 6. Delete temporary guest document
            await GuestDocumentModel.deleteOne({ _id: guestDoc._id });

            console.log(`[CLAIM SUCCESS] Document migrated to ${permanentDocId}`);

            res.status(200).json({
                success: true,
                documentId: permanentDocId,
                message: "Document successfully saved to your permanent account."
            });
        } catch (error) {
            next(error);
        }
    };
}
