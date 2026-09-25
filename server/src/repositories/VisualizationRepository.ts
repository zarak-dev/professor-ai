import VisualizationModel, { IVisualization } from "../models/Visualization"
import { TopicVisualization } from "../services/visualizeService"

export class VisualizationRepository {
    async create(userId: string, documentId: string, data: TopicVisualization): Promise<IVisualization> {
        return await VisualizationModel.findOneAndUpdate(
            { doc_id: documentId },
            {
                user_id: userId,
                doc_id: documentId,
                title: data.title,
                topics: data.topics,
                connections: data.connections || []
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ) as IVisualization
    }

    async findByDocAndUser(documentId: string, userId: string): Promise<IVisualization | null> {
        return await VisualizationModel.findOne({ doc_id: documentId, user_id: userId })
            .sort({ createdAt: -1 })
    }
}
