import { Request, Response } from "express"
import { IAuthService } from "../interfaces/IAuthService"

export class AuthController {
    private authService: IAuthService;

    constructor(authService: IAuthService) {
        this.authService = authService;
    }

    register = async (req: Request, res: Response) => {
        try {
            const { name, email, password } = req.body

            if (!name || !email || !password) {
                res.status(400).json({ error: "Name, email, and password are required" })
                return
            }

            if (password.length < 6) {
                res.status(400).json({ error: "Password must be at least 6 characters" })
                return
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
            res.status(400).json({ error: error.message || "Registration failed" })
        }
    }

    login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body

            if (!email || !password) {
                res.status(400).json({ error: "Email and password are required" })
                return
            }

            const result = await this.authService.login(email, password)

            res.status(200).json(result)

        } catch (error: any) {
            console.error("Login Error:", error.message)
            res.status(401).json({ error: error.message || "Login failed" })
        }
    }

    getMe = async (req: Request, res: Response) => {
        try {
            const user = res.locals.user;
            if (!user) {
                res.status(401).json({ error: "Not authenticated" })
                return
            }

            res.json({ user })

        } catch (error: any) {
            res.status(500).json({ error: "Failed to get user info" })
        }
    }
}
