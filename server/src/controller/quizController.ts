import { Request, Response, NextFunction } from "express";
import { QuizService } from "../services/quizService";
import { AppError } from "../errors/app-error";

export class QuizController {
    private quizService: QuizService;

    constructor(quizService: QuizService) {
        this.quizService = quizService;
    }

    handleQuizGeneration = async (req: Request, res: Response, next: NextFunction) => {
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
                return next(AppError.badRequest("Document contains no readable text to generate a quiz"));
            }

            let questions;
            try {
                questions = await this.quizService.createMCQ(effectiveText);
            } catch (aiErr: any) {
                console.error("[QUIZ] AI Generation Error:", aiErr);
                return next(AppError.aiError(aiErr.message || "Failed to generate quiz"));
            }

            try {
                await this.quizService.saveToDB(questions, user.userId, doc._id.toString());
                console.log(`[QUIZ] Quiz saved to MongoDB for document ${doc._id}`);
            } catch (dbError) {
                console.warn("[QUIZ] Failed to save quiz to DB (non-fatal):", dbError);
            }

            res.status(200).json({ questions });
        } catch (error) {
            next(error);
        }
    };

    getQuiz = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = res.locals.user;
            const doc = res.locals.document;

            if (!user || !user.userId) {
                return next(AppError.unauthorized());
            }
            if (!doc) {
                return next(AppError.notFound("Document not found"));
            }

            const quiz = await this.quizService.getQuizByDocAndUser(doc._id.toString(), user.userId);
            if (!quiz) {
                return next(AppError.notFound("Quiz not generated yet"));
            }

            res.status(200).json({ questions: quiz.questions });
        } catch (error) {
            next(error);
        }
    };
}
