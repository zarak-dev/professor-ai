import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IAuthService, AuthPayload, AuthResult } from '../interfaces/IAuthService';

export class SupabaseAuthService implements IAuthService {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async register(name: string, email: string, password: string): Promise<AuthResult> {
        const { data, error } = await this.supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name }
            }
        });

        if (error) {
            throw new Error(error.message);
        }

        if (!data.user) {
            throw new Error("Registration failed to return user data.");
        }

        return {
            token: data.session?.access_token,
            user: {
                userId: data.user.id,
                email: data.user.email!,
                name: data.user.user_metadata?.name || 'User'
            }
        };
    }

    async login(email: string, password: string): Promise<AuthResult> {
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            throw new Error(error.message);
        }

        if (!data.user || !data.session) {
            throw new Error("Login failed to generate session. Please ensure your email is verified.");
        }

        return {
            token: data.session.access_token,
            user: {
                userId: data.user.id,
                email: data.user.email!,
                name: data.user.user_metadata?.name || 'User'
            }
        };
    }

    async verifyToken(token: string): Promise<AuthPayload> {
        const { data, error } = await this.supabase.auth.getUser(token);

        if (error || !data.user) {
            throw new Error("Invalid or expired token.");
        }

        return {
            userId: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name || 'User'
        };
    }
}
