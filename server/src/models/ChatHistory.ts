import mongoose, { Schema, Document as MongoDocument } from "mongoose"

export interface IChatHistory extends MongoDocument {
    doc_id: mongoose.Types.ObjectId;
    user_id: string;
    role: 'user' | 'model';
    message: string;
    createdAt: Date;
    updatedAt: Date;
}

const ChatHistorySchema = new Schema<IChatHistory>({
    doc_id: {
        type: Schema.Types.ObjectId,
        ref: "Document",
        required: true
    },
    user_id: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'model'],
        required: true
    },
    message: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

ChatHistorySchema.index({ user_id: 1, doc_id: 1, createdAt: 1 });

export default mongoose.model<IChatHistory>("ChatHistory", ChatHistorySchema)
