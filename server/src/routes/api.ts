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
import { SupabaseAuthService } from "../services/supabaseAuthService"

import { ChatController } from "../controller/chatController"
import { UploadController } from "../controller/uploadController"
import { QuizController } from "../controller/quizController"
import { FlashcardController } from "../controller/flashcardController"
import { VisualizeController } from "../controller/visualizeController"
import { AuthController } from "../controller/authController"
import { DocumentController } from "../controller/documentController"

import { AuthMiddleware } from "../middleware/AuthMiddleware"
import { DocumentOwnershipMiddleware } from "../middleware/DocumentOwnershipMiddleware"

dotenv.config()

const geminiKey = process.env.GEMINI_API_KEY?.trim()
if (!geminiKey) throw new Error("ERROR: GEMINI API KEY is missing in .env file")

const groqKey = process.env.GROQ_API_KEY?.trim()
if (!groqKey) throw new Error("ERROR: GROQ API KEY is missing in .env file")

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

const supabaseUrl = process.env.SUPABASE_URL?.trim()
if (!supabaseUrl) throw new Error("ERROR: SUPABASE_URL is missing in .env file")

const supabaseKey = process.env.SUPABASE_KEY?.trim()
if (!supabaseKey) throw new Error("ERROR: SUPABASE_KEY is missing in .env file")

const authService = new SupabaseAuthService(supabaseUrl, supabaseKey)
const authMiddleware = new AuthMiddleware(authService)
const ownershipMiddleware = new DocumentOwnershipMiddleware(documentRepository)

console.log("Supabase Auth Service integrated successfully.");

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

const router = Router()

// Authentication Endpoints
router.post('/auth/register', authController.register)
router.post('/auth/login', authController.login)
router.get('/auth/me', authMiddleware.handle, authController.getMe)

// Document Endpoints
router.get('/documents', authMiddleware.handle, documentController.getUserDocuments)
router.post('/documents', authMiddleware.handle, upload.single('file'), uploadController.handleUpload)
router.get('/documents/:id', authMiddleware.handle, ownershipMiddleware.handle, documentController.getDocumentById)

// Document-Scoped Feature Endpoints
router.get('/documents/:id/chat', authMiddleware.handle, ownershipMiddleware.handle, chatController.getChatHistory)
router.post('/documents/:id/chat', authMiddleware.handle, ownershipMiddleware.handle, chatController.handleChat)

router.get('/documents/:id/quiz', authMiddleware.handle, ownershipMiddleware.handle, quizController.getQuiz)
router.post('/documents/:id/quiz', authMiddleware.handle, ownershipMiddleware.handle, quizController.handleQuizGeneration)

router.get('/documents/:id/flashcards', authMiddleware.handle, ownershipMiddleware.handle, flashcardController.getFlashcards)
router.post('/documents/:id/flashcards', authMiddleware.handle, ownershipMiddleware.handle, flashcardController.handleFlashcardGeneration)

router.get('/documents/:id/visualize', authMiddleware.handle, ownershipMiddleware.handle, visualizeController.getVisualization)
router.post('/documents/:id/visualize', authMiddleware.handle, ownershipMiddleware.handle, visualizeController.handleVisualize)

export default router
