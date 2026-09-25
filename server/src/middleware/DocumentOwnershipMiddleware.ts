import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { DocumentRepository } from "../repositories/DocumentRepository";
import { AppError } from "../errors/app-error";

export class DocumentOwnershipMiddleware {
    private documentRepository: DocumentRepository;

    constructor(documentRepository: DocumentRepository) {
        this.documentRepository = documentRepository;
    }

    public handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = res.locals.user;
            if (!user || !user.userId) {
                return next(AppError.unauthorized("Authentication required to access documents"));
            }

            const documentId = (req.params.id || req.params.documentId) as string;
            if (!documentId) {
                return next(AppError.badRequest("Document ID parameter is required"));
            }

            if (!mongoose.isValidObjectId(documentId)) {
                return next(AppError.badRequest("Invalid document ID format"));
            }

            const doc = await this.documentRepository.findById(documentId);
            if (!doc) {
                return next(AppError.notFound("Document not found"));
            }

            if (doc.user_id !== user.userId) {
                return next(AppError.forbidden("Access denied: You do not own this document"));
            }

            res.locals.document = doc;
            next();
        } catch (error) {
            next(error);
        }
    };
}
