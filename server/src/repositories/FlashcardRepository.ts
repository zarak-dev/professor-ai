import FlashcardModel, { IFlashcard } from "../models/Flashcard"
import { Flashcard } from "../services/flashcardService"

export class FlashcardRepository {
    async create(userId: string, documentId: string, cards: Flashcard[]): Promise<IFlashcard> {
        return await FlashcardModel.findOneAndUpdate(
            { doc_id: documentId },
            { user_id: userId, doc_id: documentId, cards: cards },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ) as IFlashcard
    }

    async findByDocAndUser(documentId: string, userId: string): Promise<IFlashcard | null> {
        return await FlashcardModel.findOne({ doc_id: documentId, user_id: userId })
            .sort({ createdAt: -1 })
    }
}
