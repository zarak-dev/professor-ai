import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/app-error";

export interface GuestPayload {
    guestId: string;
    isGuest: boolean;
}

export class GuestMiddleware {
    private jwtSecret: string;

    constructor(jwtSecret: string) {
        this.jwtSecret = jwtSecret;
    }

    public handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next(AppError.unauthorized("Guest session token is required"));
        }

        try {
            const token = authHeader.split(" ")[1];
            const decoded = jwt.verify(token, this.jwtSecret) as any;

            if (!decoded || !decoded.isGuest || !decoded.guestId) {
                return next(AppError.unauthorized("Invalid guest session token"));
            }

            res.locals.guest = {
                guestId: decoded.guestId,
                isGuest: true
            } as GuestPayload;

            next();
        } catch (error) {
            return next(AppError.unauthorized("Guest session has expired or is invalid. Please start a new session."));
        }
    };
}
