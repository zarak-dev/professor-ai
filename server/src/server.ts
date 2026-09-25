import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import compression from 'compression';
import apiRouter from './routes/api';
import { IDatabase } from './interfaces/IDatabase';
import { MongoDatabase } from './config/MongoDatabase';

export class AppServer {
    public app: express.Application;
    private port: string | number;
    private database: IDatabase;

    constructor(database: IDatabase) {
        this.app = express();
        this.port = process.env.PORT || 5000;
        this.database = database;

        this.initializeMiddlewares();
        this.initializeRoutes();
    }

    private initializeMiddlewares(): void {
        const allowedOrigins = ['http://localhost:3000', process.env.CLIENT_URL].filter(Boolean) as string[];
        this.app.use(cors({
            origin: allowedOrigins.length > 0 ? allowedOrigins : 'http://localhost:3000',
            credentials: true
        }));
        this.app.use(compression());
        this.app.use(express.json({ limit: '1mb' }));

        // Request Logger
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            const start = Date.now();
            res.on('finish', () => {
                console.log(`[${req.method}] ${req.path} ${res.statusCode} ${Date.now() - start}ms`);
            });
            next();
        });
    }

    private initializeRoutes(): void {
        this.app.use('/api', apiRouter);

        this.app.get('/', (req, res) => {
            res.send('The Professor API is Live Now');
        });

        // Global Error Handler
        this.app.use((err: any, req: Request, res: Response, next: NextFunction) => {
            console.error(`[ERROR] ${new Date().toISOString()} [${req.method} ${req.path}]:`, err.stack || err.message);
            const statusCode = typeof err.statusCode === 'number' ? err.statusCode : (typeof err.status === 'number' ? err.status : 500);
            const code = (err.code && typeof err.code === 'string' && isNaN(Number(err.code))) ? err.code : (statusCode === 400 ? 'VALIDATION_ERROR' : (statusCode === 401 ? 'AUTHENTICATION_ERROR' : (statusCode === 403 ? 'AUTHORIZATION_ERROR' : (statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR'))));
            
            const message = (statusCode === 500 && !err.isOperational)
                ? 'Internal server error'
                : (err.message || 'An error occurred');

            res.status(statusCode).json({
                error: {
                    code,
                    message
                }
            });
        });
    }

    public async start(): Promise<void> {
        try {
            this.database.connect().catch((err: any) => {
                console.warn(`[WARN] MongoDB connection error: ${err.message}. Configure MONGODB_URI in server/.env if needed.`);
            });

            this.app.listen(this.port, () => {
                console.log(`[READY] The Professor API is live at http://localhost:${this.port}`);
            });
        } catch (err: any) {
            console.error('Failed to start server:', err.message);
            process.exit(1);
        }
    }
}

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/the-professor';
const mongoDb = new MongoDatabase(mongoUri);

const server = new AppServer(mongoDb);
server.start();