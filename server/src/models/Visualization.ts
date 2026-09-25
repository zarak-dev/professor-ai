import mongoose, { Schema, Document as MongoDocument } from "mongoose"

export interface IVisualization extends MongoDocument {
    doc_id: mongoose.Types.ObjectId;
    user_id: string;
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
    createdAt: Date;
}

const VisualizationSchema = new Schema<IVisualization>({
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
    title: {
        type: String,
        required: true
    },
    topics: [{
        name: { type: String, required: true },
        summary: { type: String, required: true },
        keyPoints: [{ type: String }],
        importance: { type: String, enum: ['high', 'medium', 'low'], required: true }
    }],
    connections: [{
        from: { type: String, required: true },
        to: { type: String, required: true },
        relation: { type: String, required: true }
    }]
}, {
    timestamps: true
})

VisualizationSchema.index({ doc_id: 1 }, { unique: true });

export default mongoose.model<IVisualization>("Visualization", VisualizationSchema)
