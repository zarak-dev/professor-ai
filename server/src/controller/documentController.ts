import { Request, Response, NextFunction } from "express";
import { DocumentRepository } from "../repositories/DocumentRepository";
import QuizModel from "../models/Quiz";
import FlashcardModel from "../models/Flashcard";
import VisualizationModel from "../models/Visualization";
import { AppError } from "../errors/app-error";

export class DocumentController {
    private documentRepository: DocumentRepository;

    constructor(documentRepository: DocumentRepository) {
        this.documentRepository = documentRepository;
    }

    getUserDocuments = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = res.locals.user;
            if (!user || !user.userId) {
                return next(AppError.unauthorized());
            }

            const [documents, quizDocIds, flashcardDocIds, visualizeDocIds] = await Promise.all([
                this.documentRepository.findByUserId(user.userId),
                QuizModel.distinct("doc_id", { user_id: user.userId }),
                FlashcardModel.distinct("doc_id", { user_id: user.userId }),
                VisualizationModel.distinct("doc_id", { user_id: user.userId })
            ]);

            const quizSet = new Set(quizDocIds.map(id => id.toString()));
            const flashcardSet = new Set(flashcardDocIds.map(id => id.toString()));
            const visualizeSet = new Set(visualizeDocIds.map(id => id.toString()));

            const formatted = documents.map(doc => ({
                _id: doc._id,
                file_name: doc.file_name,
                summary: doc.summary,
                status: doc.status,
                createdAt: doc.createdAt,
                hasQuiz: quizSet.has(doc._id.toString()),
                hasFlashcards: flashcardSet.has(doc._id.toString()),
                hasVisualization: visualizeSet.has(doc._id.toString())
            }));

            res.json({ documents: formatted });
        } catch (error) {
            next(error);
        }
    };

    getDocumentById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const doc = res.locals.document;
            if (!doc) {
                return next(AppError.notFound("Document not found"));
            }

            const [hasQuiz, hasFlashcards, hasVisualization] = await Promise.all([
                QuizModel.exists({ doc_id: doc._id }),
                FlashcardModel.exists({ doc_id: doc._id }),
                VisualizationModel.exists({ doc_id: doc._id })
            ]);

            res.json({
                document: {
                    _id: doc._id,
                    file_name: doc.file_name,
                    summary: doc.summary,
                    status: doc.status,
                    createdAt: doc.createdAt,
                    hasQuiz: !!hasQuiz,
                    hasFlashcards: !!hasFlashcards,
                    hasVisualization: !!hasVisualization
                }
            });
        } catch (error) {
            next(error);
        }
    };
}
