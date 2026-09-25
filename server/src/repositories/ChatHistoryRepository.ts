import ChatHistory, { IChatHistory } from "../models/ChatHistory"

export class ChatHistoryRepository {
    async create(messages: Partial<IChatHistory>[]): Promise<IChatHistory[]> {
        return await ChatHistory.insertMany(messages) as unknown as IChatHistory[]
    }

    async findByDocId(userId: string, documentId: string): Promise<IChatHistory[]> {
        return await ChatHistory.find({
            user_id: userId,
            doc_id: documentId
        }).sort({ createdAt: 1 })
    }
}
