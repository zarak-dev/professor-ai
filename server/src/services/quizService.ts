import { AIService } from "../interfaces/AIService";
import { AIParser } from "../utils/parseAIJson";
import { QuizRepository } from "../repositories/QuizRepository";

export interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correct: number;
    explanation: string;
}

export class QuizService {
    private aiService: AIService;
    private aiParser: AIParser;
    private quizRepository: QuizRepository;

    constructor(aiService: AIService, aiParser: AIParser, quizRepository: QuizRepository) {
        this.aiService = aiService;
        this.aiParser = aiParser;
        this.quizRepository = quizRepository;
    }

    async createMCQ(text: string): Promise<QuizQuestion[]> {
        const prompt = `You are a quiz generator. Based on the following document text, generate exactly 5 multiple choice questions to test understanding of the content.

Return ONLY a valid JSON array with this exact structure (no markdown, no code fences, just raw JSON):
[
  {
    "id": 1,
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Brief explanation of why this answer is correct."
  }
]

The "correct" field is a 0-based index of the correct option.
Include a mix of conceptual and fact-based questions. Ensure the distractors are plausible.
Make the questions varied in difficulty. Cover different parts of the document.

Document text:
${text.substring(0, 30000)}`

        const aiResponse = await this.aiService.generateContent(prompt)
        const questions = this.aiParser.parseJson<QuizQuestion[]>(aiResponse, "quiz")

        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error("AI generated empty quiz. Please try again.")
        }

        return questions
    }

    async saveToDB(quiz: QuizQuestion[], userId: string, documentId: string): Promise<boolean> {
        try {
            await this.quizRepository.create(userId, documentId, quiz)
            console.log(`QuizService: Saved ${quiz.length} questions to MongoDB.`);
            return true
        } catch (error) {
            console.error("QuizService: Failed to save to DB:", error);
            throw new Error("Failed to save quiz to database")
        }
    }

    async getQuizByDocAndUser(documentId: string, userId: string) {
        return await this.quizRepository.findByDocAndUser(documentId, userId);
    }
}
