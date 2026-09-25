import { Request, Response } from "express"
import { ChatHistoryRepository } from "../repositories/ChatHistoryRepository"
import { DocumentRepository } from "../repositories/DocumentRepository"

export class HistoryController {
    private chatHistoryRepository: ChatHistoryRepository;
    private documentRepository: DocumentRepository;

    constructor(chatHistoryRepository: ChatHistoryRepository, documentRepository: DocumentRepository) {
        this.chatHistoryRepository = chatHistoryRepository;
        this.documentRepository = documentRepository;
    }

    getChatHistory = async (req: Request, res: Response) => {
        try {
            const user = res.locals.user;
            if (!user || !user.userId) {
                res.status(401).json({ error: "Authentication required" })
                return
            }

            const { documentId } = req.params

            const messages = await this.chatHistoryRepository.findByDocId(user.userId, documentId as string)

            res.json({ messages })

        } catch (error: any) {
            console.error("Get Chat History Error:", error)
            res.status(500).json({ error: "Failed to fetch chat history" })
        }
    }

    getUserDocuments = async (req: Request, res: Response) => {
        try {
            const user = res.locals.user;
            if (!user || !user.userId) {
                res.status(401).json({ error: "Authentication required" })
                return
            }

            const documents = await this.documentRepository.findByUserId(user.userId)

            res.json({ documents })

        } catch (error: any) {
            console.error("Get Documents Error:", error)
            res.status(500).json({ error: "Failed to fetch documents" })
        }
    }
}
