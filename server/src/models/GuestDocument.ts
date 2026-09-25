import mongoose, { Schema, Document as MongoDocument } from "mongoose";
import { GUEST_CONFIG } from "../config/guestConfig";

export interface IGuestChatMessage {
    role: 'user' | 'model';
    message: string;
    timestamp: Date;
}

export interface IGuestQuizQuestion {
    id: number;
    question: string;
    options: string[];
    correct: number;
    explanation: string;
}

export interface IGuestFlashcard {
    id: number;
    front: string;
    back: string;
    category: string;
}

export interface IGuestVisualization {
    title: string;
    topics: Array<{
        name: string;
        summary: string;
        keyPoints: string[];
        importance: 'high' | 'medium' | 'low';
    }>;
    connections: Array<{
        from: string;
        to: string;
        relation: string;
    }>;
}

export interface IGuestDocument extends MongoDocument {
    guest_id: string;
    file_name: string;
    file_size: number;
    extracted_text: string;
    summary?: string;
    chat_messages: IGuestChatMessage[];
    quiz?: IGuestQuizQuestion[];
    flashcards?: IGuestFlashcard[];
    visualization?: IGuestVisualization;
    generations_used: number;
    chat_used: number;
    createdAt: Date;
    updatedAt: Date;
}

const GuestDocumentSchema = new Schema<IGuestDocument>({
    guest_id: {
        type: String,
        required: true,
        index: true
    },
    file_name: {
        type: String,
        required: true
    },
    file_size: {
        type: Number,
        required: true
    },
    extracted_text: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        default: ""
    },
    chat_messages: [{
        role: { type: String, enum: ['user', 'model'], required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    }],
    quiz: [{
        id: { type: Number, required: true },
        question: { type: String, required: true },
        options: [{ type: String }],
        correct: { type: Number, required: true },
        explanation: { type: String, required: true }
    }],
    flashcards: [{
        id: { type: Number, required: true },
        front: { type: String, required: true },
        back: { type: String, required: true },
        category: { type: String, required: true }
    }],
    visualization: {
        title: { type: String },
        topics: [{
            name: { type: String, required: true },
            summary: { type: String, required: true },
            keyPoints: [{ type: String }],
            importance: { type: String, enum: ['high', 'medium', 'low'] }
        }],
        connections: [{
            from: { type: String, required: true },
            to: { type: String, required: true },
            relation: { type: String, required: true }
        }]
    },
    generations_used: {
        type: Number,
        default: 0
    },
    chat_used: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
        // MongoDB TTL index: automatically deletes document after session expiry
        expires: GUEST_CONFIG.SESSION_EXPIRY_SECONDS
    }
}, {
    timestamps: true
});

export const GuestDocumentModel = mongoose.model<IGuestDocument>("GuestDocument", GuestDocumentSchema);
