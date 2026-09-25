import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { IAuthService, AuthPayload, AuthResult } from '../interfaces/IAuthService';
import { UserModel } from '../models/User';

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

export class LocalAuthService implements IAuthService {
  private jwtSecret: string;
  private fallbackFilePath: string;

  constructor(jwtSecret?: string) {
    this.jwtSecret = jwtSecret || process.env.JWT_SECRET || 'the-professor-local-secret-2026';
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch {
        // ignore
      }
    }
    this.fallbackFilePath = path.join(dataDir, 'users.json');
  }

  private isMongoConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }

  private readFallbackUsers(): StoredUser[] {
    try {
      if (fs.existsSync(this.fallbackFilePath)) {
        const raw = fs.readFileSync(this.fallbackFilePath, 'utf8');
        return JSON.parse(raw);
      }
    } catch {
      // fallback to empty
    }
    return [];
  }

  private writeFallbackUsers(users: StoredUser[]): void {
    try {
      fs.writeFileSync(this.fallbackFilePath, JSON.stringify(users, null, 2), 'utf8');
    } catch (err) {
      console.warn('[AUTH] Could not write fallback users file:', err);
    }
  }

  async register(name: string, email: string, password: string): Promise<AuthResult> {
    const normalizedEmail = email.toLowerCase().trim();
    const hashedPassword = await bcrypt.hash(password, 10);

    let userId: string;
    let userName = name.trim();

    if (this.isMongoConnected()) {
      // Use MongoDB
      const existing = await UserModel.findOne({ email: normalizedEmail });
      if (existing) {
        throw new Error('An account with this email already exists.');
      }

      const user = await UserModel.create({
        name: userName,
        email: normalizedEmail,
        password: hashedPassword,
      });

      userId = user._id.toString();
    } else {
      // Use local file-based fallback store when MongoDB is not running locally
      console.log('[AUTH] MongoDB disconnected. Registering user via local fallback store.');
      const users = this.readFallbackUsers();
      if (users.some((u) => u.email === normalizedEmail)) {
        throw new Error('An account with this email already exists.');
      }

      userId = 'usr_' + crypto.randomBytes(8).toString('hex');
      users.push({
        id: userId,
        name: userName,
        email: normalizedEmail,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
      });
      this.writeFallbackUsers(users);
    }

    const payload: AuthPayload = {
      userId,
      email: normalizedEmail,
      name: userName,
    };

    const token = jwt.sign(payload, this.jwtSecret, { expiresIn: '7d' });

    return {
      token,
      user: payload,
    };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const normalizedEmail = email.toLowerCase().trim();

    let userId: string;
    let userName: string;
    let storedHash: string;

    if (this.isMongoConnected()) {
      let user = await UserModel.findOne({ email: normalizedEmail });
      if (!user) {
        // Check fallback users file in case user registered before MongoDB Atlas was connected
        const fallbackUsers = this.readFallbackUsers();
        const fallbackUser = fallbackUsers.find((u) => u.email === normalizedEmail);
        if (fallbackUser) {
          try {
            await UserModel.create({
              name: fallbackUser.name,
              email: fallbackUser.email,
              password: fallbackUser.password,
            });
          } catch {
            // ignore duplicate
          }
          userId = fallbackUser.id;
          userName = fallbackUser.name;
          storedHash = fallbackUser.password;
        } else {
          throw new Error('Invalid email or password.');
        }
      } else {
        userId = user._id.toString();
        userName = user.name;
        storedHash = user.password;
      }
    } else {
      console.log('[AUTH] MongoDB disconnected. Authenticating user via local fallback store.');
      const users = this.readFallbackUsers();
      const user = users.find((u) => u.email === normalizedEmail);
      if (!user) {
        throw new Error('Invalid email or password.');
      }
      userId = user.id;
      userName = user.name;
      storedHash = user.password;
    }

    const isMatch = await bcrypt.compare(password, storedHash);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    const payload: AuthPayload = {
      userId,
      email: normalizedEmail,
      name: userName,
    };

    const token = jwt.sign(payload, this.jwtSecret, { expiresIn: '7d' });

    return {
      token,
      user: payload,
    };
  }

  async verifyToken(token: string): Promise<AuthPayload> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as AuthPayload;
      if (!decoded || !decoded.userId) {
        throw new Error('Invalid token payload.');
      }
      return {
        userId: decoded.userId,
        email: decoded.email,
        name: decoded.name || 'User',
      };
    } catch {
      throw new Error('Invalid or expired authentication token.');
    }
  }
}
