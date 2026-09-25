import { Router } from "express"
import dotenv from "dotenv"
import { MulterConfig } from "../config/multer"

import { AIParser } from "../utils/parseAIJson"
import { ChatHistoryRepository } from "../repositories/ChatHistoryRepository"
import { DocumentRepository } from "../repositories/DocumentRepository"
import { QuizRepository } from "../repositories/QuizRepository"
import { FlashcardRepository } from "../repositories/FlashcardRepository"
import { VisualizationRepository } from "../repositories/VisualizationRepository"

import { GeminiService } from "../services/geminiAi"
import { GroqService } from "../services/groqAi"
import { AIServiceWithFallback } from "../services/aiServiceWithFallback"
import { PDFProcessor } from "../services/pdfProcessor"
import { QuizService } from "../services/quizService"
import { FlashcardService } from "../services/flashcardService"
import { VisualizeService } from "../services/visualizeService"
import { LocalAuthService } from "../services/localAuthService"

import { ChatController } from "../controller/chatController"
import { UploadController } from "../controller/uploadController"
import { QuizController } from "../controller/quizController"
import { FlashcardController } from "../controller/flashcardController"
import { VisualizeController } from "../controller/visualizeController"
import { AuthController } from "../controller/authController"
import { DocumentController } from "../controller/documentController"
import { GuestController } from "../controller/guestController"

import { AuthMiddleware } from "../middleware/AuthMiddleware"
import { DocumentOwnershipMiddleware } from "../middleware/DocumentOwnershipMiddleware"
import { GuestMiddleware } from "../middleware/GuestMiddleware"

dotenv.config()

const geminiKey = process.env.GEMINI_API_KEY?.trim() || 'placeholder_gemini_key'
if (!process.env.GEMINI_API_KEY) {
    console.warn("[WARN] GEMINI_API_KEY is not set in server/.env. AI calls will require a valid key.")
}

const groqKey = process.env.GROQ_API_KEY?.trim() || 'placeholder_groq_key'
if (!process.env.GROQ_API_KEY) {
    console.warn("[WARN] GROQ_API_KEY is not set in server/.env. Fallback AI calls will require a valid key.")
}

const geminiService = new GeminiService(geminiKey)
const groqService = new GroqService(groqKey)
const aiService = new AIServiceWithFallback(geminiService, groqService)

const pdfProcessor = new PDFProcessor()
const aiParser = new AIParser()
const multerConfig = new MulterConfig()
const upload = multerConfig.uploader

const chatHistoryRepository = new ChatHistoryRepository()
const documentRepository = new DocumentRepository()
const quizRepository = new QuizRepository()
const flashcardRepository = new FlashcardRepository()
const visualizationRepository = new VisualizationRepository()

const jwtSecret = process.env.JWT_SECRET || 'the-professor-local-secret-2026'
const authService = new LocalAuthService(jwtSecret)
const authMiddleware = new AuthMiddleware(authService)
const ownershipMiddleware = new DocumentOwnershipMiddleware(documentRepository)

console.log("[AUTH] Local MongoDB Auth Service initialized (JWT + bcrypt, no Supabase required).")

const quizService = new QuizService(aiService, aiParser, quizRepository)
const flashcardService = new FlashcardService(aiService, aiParser, flashcardRepository)
const visualizeService = new VisualizeService(aiService, aiParser, visualizationRepository)

const chatController = new ChatController(aiService, chatHistoryRepository)
const uploadController = new UploadController(aiService, pdfProcessor, documentRepository)
const quizController = new QuizController(quizService)
const flashcardController = new FlashcardController(flashcardService)
const visualizeController = new VisualizeController(visualizeService)
const authController = new AuthController(authService)
const documentController = new DocumentController(documentRepository)

const guestMiddleware = new GuestMiddleware(jwtSecret)
const guestController = new GuestController(
    aiService,
    pdfProcessor,
    aiParser,
    jwtSecret,
    documentRepository,
    quizRepository,
    flashcardRepository,
    visualizationRepository,
    chatHistoryRepository
)

const router = Router()

// Authentication Endpoints
router.post('/auth/register', authController.register)
router.post('/auth/login', authController.login)
router.get('/auth/me', authMiddleware.handle, authController.getMe)

// Authenticated Document Endpoints
router.get('/documents', authMiddleware.handle, documentController.getUserDocuments)
router.post('/documents', authMiddleware.handle, upload.single('file'), uploadController.handleUpload)
router.get('/documents/:id', authMiddleware.handle, ownershipMiddleware.handle, documentController.getDocumentById)

// Authenticated Feature Endpoints
router.get('/documents/:id/chat', authMiddleware.handle, ownershipMiddleware.handle, chatController.getChatHistory)
router.post('/documents/:id/chat', authMiddleware.handle, ownershipMiddleware.handle, chatController.handleChat)

router.get('/documents/:id/quiz', authMiddleware.handle, ownershipMiddleware.handle, quizController.getQuiz)
router.post('/documents/:id/quiz', authMiddleware.handle, ownershipMiddleware.handle, quizController.handleQuizGeneration)

router.get('/documents/:id/flashcards', authMiddleware.handle, ownershipMiddleware.handle, flashcardController.getFlashcards)
router.post('/documents/:id/flashcards', authMiddleware.handle, ownershipMiddleware.handle, flashcardController.handleFlashcardGeneration)

router.get('/documents/:id/visualize', authMiddleware.handle, ownershipMiddleware.handle, visualizeController.getVisualization)
router.post('/documents/:id/visualize', authMiddleware.handle, ownershipMiddleware.handle, visualizeController.handleVisualize)

// Guest Mode Endpoints
router.post('/guest/session', guestController.createSession)
router.post('/guest/documents', guestMiddleware.handle, upload.single('file'), guestController.handleUpload)
router.get('/guest/documents/:id', guestMiddleware.handle, guestController.getDocumentById)
router.get('/guest/documents/:id/chat', guestMiddleware.handle, guestController.getChatHistory)
router.post('/guest/documents/:id/chat', guestMiddleware.handle, guestController.handleChat)
router.get('/guest/documents/:id/quiz', guestMiddleware.handle, guestController.getQuiz)
router.post('/guest/documents/:id/quiz', guestMiddleware.handle, guestController.handleQuiz)
router.get('/guest/documents/:id/flashcards', guestMiddleware.handle, guestController.getFlashcards)
router.post('/guest/documents/:id/flashcards', guestMiddleware.handle, guestController.handleFlashcards)
router.get('/guest/documents/:id/visualize', guestMiddleware.handle, guestController.getVisualize)
router.post('/guest/documents/:id/visualize', guestMiddleware.handle, guestController.handleVisualize)

// Guest Document Claim (Safe migration to authenticated account)
router.post('/guest/claim', authMiddleware.handle, guestController.claimGuestDocument)

export default router
