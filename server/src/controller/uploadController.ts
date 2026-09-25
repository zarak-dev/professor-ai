import { Request, Response, NextFunction } from "express";
import { AIService } from "../interfaces/AIService";
import { DocumentProcessor } from "../interfaces/DocumentProcessor";
import { DocumentRepository } from "../repositories/DocumentRepository";
import { AppError } from "../errors/app-error";
import fs from "fs";

export class UploadController {
    private aiService: AIService;
    private documentProcessor: DocumentProcessor;
    private documentRepository: DocumentRepository;

    constructor(
        aiService: AIService,
        documentProcessor: DocumentProcessor,
        documentRepository: DocumentRepository
    ) {
        this.aiService = aiService;
        this.documentProcessor = documentProcessor;
        this.documentRepository = documentRepository;
    }

    handleUpload = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = res.locals.user;
            if (!user || !user.userId) {
                return next(AppError.unauthorized("Authentication required to upload documents"));
            }

            if (!req.file) {
                return next(AppError.badRequest("No PDF file provided", "FILE_TYPE_ERROR"));
            }

            console.log(`[UPLOAD] Processing file: ${req.file.originalname} for user: ${user.userId}`);

            let pdfText = "";
            try {
                pdfText = await this.documentProcessor.extractText(req.file.path);
            } catch (extractErr: any) {
                console.error("[UPLOAD] Failed to extract text from PDF:", extractErr.message);
                return next(AppError.badRequest("Failed to extract text from the PDF file. Please ensure it is not corrupted or password-protected.", "FILE_TYPE_ERROR"));
            }

            if (!pdfText || pdfText.trim().length === 0) {
                return next(AppError.badRequest("The uploaded PDF contains no readable text.", "VALIDATION_ERROR"));
            }

            let summary = "";
            try {
                const summaryPrompt = `Here is the text from a document. Summarize it in 3-5 concise bullet points covering the core concepts:\n\n${pdfText.substring(0, 30000)}`;
                summary = await this.aiService.generateContent(summaryPrompt);
            } catch (summaryErr: any) {
                console.warn("[UPLOAD] AI summary generation failed (proceeding without summary):", summaryErr.message);
                summary = "Summary could not be automatically generated. You can explore the document using the features below.";
            }

            // Clean up the uploaded temp file
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            // Persist document to MongoDB
            const doc = await this.documentRepository.create({
                user_id: user.userId,
                file_name: req.file.originalname,
                extracted_text: pdfText,
                summary: summary,
                status: 'ready'
            });

            console.log(`[UPLOAD] Document created with ID: ${doc._id}`);

            res.status(201).json({
                document: {
                    _id: doc._id,
                    file_name: doc.file_name,
                    summary: doc.summary,
                    status: doc.status,
                    createdAt: doc.createdAt
                }
            });
        } catch (error: any) {
            if (req.file && fs.existsSync(req.file.path)) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch {}
            }
            next(error);
        }
    };
}
