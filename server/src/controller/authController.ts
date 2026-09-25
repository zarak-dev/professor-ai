import { Request, Response, NextFunction } from "express"
import { IAuthService } from "../interfaces/IAuthService"
import { AppError } from "../errors/app-error"

export class AuthController {
    private authService: IAuthService;

    constructor(authService: IAuthService) {
        this.authService = authService;
    }

    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, email, password } = req.body

            if (!name || !email || !password) {
                return next(AppError.badRequest("Name, email, and password are required", "VALIDATION_ERROR"))
            }

            if (password.length < 6) {
                return next(AppError.badRequest("Password must be at least 6 characters", "VALIDATION_ERROR"))
            }

            const result = await this.authService.register(name, email, password)
            
            if (!result.token) {
                res.status(201).json({
                    ...result,
                    message: "Registration successful! Please check your email to verify your account before logging in."
                })
                return
            }

            res.status(201).json(result)

        } catch (error: any) {
            console.error("Registration Error:", error.message)
            next(AppError.badRequest(error.message || "Registration failed", "AUTH_ERROR"))
        }
    }

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body

            if (!email || !password) {
                return next(AppError.badRequest("Email and password are required", "VALIDATION_ERROR"))
            }

            const result = await this.authService.login(email, password)

            res.status(200).json(result)

        } catch (error: any) {
            console.error("Login Error:", error.message)
            next(AppError.unauthorized(error.message || "Login failed", "AUTHENTICATION_ERROR"))
        }
    }

    getMe = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = res.locals.user;
            if (!user) {
                return next(AppError.unauthorized("Not authenticated"))
            }

            res.json({ user })

        } catch (error: any) {
            next(error)
        }
    }
}
