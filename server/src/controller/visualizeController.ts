import { Request, Response, NextFunction } from "express";
import { VisualizeService } from "../services/visualizeService";
import { AppError } from "../errors/app-error";

export class VisualizeController {
    private visualizeService: VisualizeService;

    constructor(visualizeService: VisualizeService) {
        this.visualizeService = visualizeService;
    }

    handleVisualize = async (req: Request, res: Response, next: NextFunction) => {
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
                return next(AppError.badRequest("Document contains no readable text to generate visualization"));
            }

            let visualization;
            try {
                visualization = await this.visualizeService.generate(effectiveText);
            } catch (aiErr: any) {
                console.error("[VISUALIZE] AI Generation Error:", aiErr);
                return next(AppError.aiError(aiErr.message || "Failed to generate visualization"));
            }

            try {
                await this.visualizeService.saveToDB(visualization, user.userId, doc._id.toString());
                console.log(`[VISUALIZE] Visualization saved to MongoDB for document ${doc._id}`);
            } catch (dbError) {
                console.warn("[VISUALIZE] Failed to save visualization to DB (non-fatal):", dbError);
            }

            res.status(200).json({ visualization });
        } catch (error) {
            next(error);
        }
    };

    getVisualization = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = res.locals.user;
            const doc = res.locals.document;

            if (!user || !user.userId) {
                return next(AppError.unauthorized());
            }
            if (!doc) {
                return next(AppError.notFound("Document not found"));
            }

            const visualizationRecord = await this.visualizeService.getVisualizationByDocAndUser(doc._id.toString(), user.userId);
            if (!visualizationRecord) {
                return next(AppError.notFound("Visualization not generated yet"));
            }

            res.status(200).json({
                visualization: {
                    title: visualizationRecord.title,
                    topics: visualizationRecord.topics,
                    connections: visualizationRecord.connections
                }
            });
        } catch (error) {
            next(error);
        }
    };
}
