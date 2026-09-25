import mongoose, { Schema, Document as MongoDocument } from "mongoose"

export interface IQuiz extends MongoDocument {
    doc_id: mongoose.Types.ObjectId;
    user_id: string;
    questions: Array<{
        id: number;
        question: string;
        options: string[];
        correct: number;
        explanation: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

const QuizSchema = new Schema<IQuiz>({
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
    questions: [{
        id: { type: Number, required: true },
        question: { type: String, required: true },
        options: [{ type: String }],
        correct: { type: Number, required: true },
        explanation: { type: String, required: true }
    }]
}, {
    timestamps: true
})

QuizSchema.index({ doc_id: 1 }, { unique: true });

export default mongoose.model<IQuiz>("Quiz", QuizSchema)
