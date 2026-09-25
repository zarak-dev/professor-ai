import mongoose, { Schema, Document as MongoDocument } from "mongoose"

export interface IDocument extends MongoDocument {
    user_id: string;
    file_name: string;
    extracted_text: string;
    summary: string;
    status: 'processing' | 'ready' | 'failed';
    createdAt: Date;
    updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>({
    user_id: {
        type: String,
        required: true,
        index: true
    },
    file_name: {
        type: String,
        required: true,
        trim: true
    },
    extracted_text: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ['processing', 'ready', 'failed'],
        default: 'processing'
    }
}, {
    timestamps: true
})

DocumentSchema.index({ user_id: 1, createdAt: -1 });

export default mongoose.model<IDocument>("Document", DocumentSchema)
