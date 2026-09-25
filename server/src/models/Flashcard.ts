import mongoose, { Schema, Document as MongoDocument } from "mongoose"

export interface IFlashcard extends MongoDocument {
    doc_id: mongoose.Types.ObjectId;
    user_id: string;
    cards: Array<{
        id: number;
        front: string;
        back: string;
        category: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

const FlashcardSchema = new Schema<IFlashcard>({
    doc_id: {
        type: Schema.Types.ObjectId,
        ref: "Document",
        required: true,
        unique: true
    },
    user_id: {
        type: String,
        required: true
    },
    cards: [{
        id: { type: Number, required: true },
        front: { type: String, required: true },
        back: { type: String, required: true },
        category: { type: String, required: true }
    }]
}, {
    timestamps: true
})

FlashcardSchema.index({ doc_id: 1 }, { unique: true });

export default mongoose.model<IFlashcard>("Flashcard", FlashcardSchema)
