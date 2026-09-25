import { Request, Response, NextFunction } from "express";
import { IAuthService } from "../interfaces/IAuthService";

export class AuthMiddleware {
    private authService: IAuthService;

    constructor(authService: IAuthService) {
        this.authService = authService;
    }

    public handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ error: "No token provided. Access denied." });
            return;
        }

        try {
            const token = authHeader.split(" ")[1];
            
            const decoded = await this.authService.verifyToken(token);
            
            res.locals.user = decoded;
            
            next();
        } catch (error) {
            res.status(401).json({ error: "Invalid or expired token." });
        }
    };

    public optionalHandle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            try {
                const token = authHeader.split(" ")[1];
                const decoded = await this.authService.verifyToken(token);
                res.locals.user = decoded;
            } catch {
                res.locals.user = null;
            }
        } else {
            res.locals.user = null;
        }

        next();
    };
}