import { Request, Response, NextFunction } from "express";
import { FlashcardService } from "../services/flashcardService";
import { AppError } from "../errors/app-error";

export class FlashcardController {
    private flashcardService: FlashcardService;

    constructor(flashcardService: FlashcardService) {
        this.flashcardService = flashcardService;
    }

    handleFlashcardGeneration = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = res.locals.user;
            const doc = res.locals.document;

            if (!user || !user.userId) {
                return next(AppError.unauthorized());
            }
            if (!doc) {
                return next(AppError.notFound("Document not found"));
            }

            const effectiveText = doc.extracted_text;
            if (!effectiveText || effectiveText.trim().length === 0) {
                return next(AppError.badRequest("Document contains no readable text to generate flashcards"));
            }

            let flashcards;
            try {
                flashcards = await this.flashcardService.generate(effectiveText);
            } catch (aiErr: any) {
                console.error("[FLASHCARDS] AI Generation Error:", aiErr);
                return next(AppError.aiError(aiErr.message || "Failed to generate flashcards"));
            }

            try {
                await this.flashcardService.saveToDB(flashcards, user.userId, doc._id.toString());
                console.log(`[FLASHCARDS] Flashcards saved to MongoDB for document ${doc._id}`);
            } catch (dbError) {
                console.warn("[FLASHCARDS] Failed to save flashcards to DB (non-fatal):", dbError);
            }

            res.status(200).json({ flashcards });
        } catch (error) {
            next(error);
        }
    };

    getFlashcards = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = res.locals.user;
            const doc = res.locals.document;

            if (!user || !user.userId) {
                return next(AppError.unauthorized());
            }
            if (!doc) {
                return next(AppError.notFound("Document not found"));
            }

            const flashcardsRecord = await this.flashcardService.getFlashcardsByDocAndUser(doc._id.toString(), user.userId);
            if (!flashcardsRecord) {
                return next(AppError.notFound("Flashcards not generated yet"));
            }

            res.status(200).json({ flashcards: flashcardsRecord.cards });
        } catch (error) {
            next(error);
        }
    };
}
