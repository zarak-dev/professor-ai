import QuizModel, { IQuiz } from "../models/Quiz"
import { QuizQuestion } from "../services/quizService"

export class QuizRepository {
    async create(userId: string, documentId: string, questions: QuizQuestion[]): Promise<IQuiz> {
        return await QuizModel.findOneAndUpdate(
            { doc_id: documentId },
            { user_id: userId, doc_id: documentId, questions: questions },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ) as IQuiz
    }

    async findByDocAndUser(documentId: string, userId: string): Promise<IQuiz | null> {
        return await QuizModel.findOne({ doc_id: documentId, user_id: userId })
            .sort({ createdAt: -1 })
    }
}
