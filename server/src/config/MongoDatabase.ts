import mongoose from 'mongoose';
import { IDatabase } from '../interfaces/IDatabase';

export class MongoDatabase implements IDatabase {
    private uri: string;

    constructor(uri: string) {
        this.uri = uri;
    }

    public async connect(): Promise<void> {
        try {
            await mongoose.connect(this.uri);
            console.log(`Successfully connected to MongoDB`);
        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}