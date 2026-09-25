export interface AuthPayload {
    userId: string;
    email: string;
    name: string;
}

export interface AuthResult {
    token?: string;
    user: AuthPayload;
}

export interface IAuthService {
    register(name: string, email: string, password: string): Promise<AuthResult>;
    login(email: string, password: string): Promise<AuthResult>;
    verifyToken(token: string): Promise<AuthPayload>;
}