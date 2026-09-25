export class AppError extends Error {
    public code: string;
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;

        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(message: string, code: string = 'VALIDATION_ERROR'): AppError {
        return new AppError(message, 400, code);
    }

    static unauthorized(message: string = 'Authentication required', code: string = 'AUTHENTICATION_ERROR'): AppError {
        return new AppError(message, 401, code);
    }

    static forbidden(message: string = 'Access denied', code: string = 'AUTHORIZATION_ERROR'): AppError {
        return new AppError(message, 403, code);
    }

    static notFound(message: string = 'Resource not found', code: string = 'NOT_FOUND'): AppError {
        return new AppError(message, 404, code);
    }

    static aiError(message: string = 'AI service temporarily unavailable', code: string = 'AI_ERROR'): AppError {
        return new AppError(message, 502, code);
    }

    static internal(message: string = 'Internal server error', code: string = 'INTERNAL_ERROR'): AppError {
        return new AppError(message, 500, code);
    }
}
