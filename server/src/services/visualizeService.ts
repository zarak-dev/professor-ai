import { AIService } from "../interfaces/AIService";
import { AIParser } from "../utils/parseAIJson";
import { VisualizationRepository } from "../repositories/VisualizationRepository";

export interface TopicVisualization {
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
}

export class VisualizeService {
    private aiService: AIService;
    private aiParser: AIParser;
    private visualizationRepository: VisualizationRepository;

    constructor(aiService: AIService, aiParser: AIParser, visualizationRepository: VisualizationRepository) {
        this.aiService = aiService;
        this.aiParser = aiParser;
        this.visualizationRepository = visualizationRepository;
    }

    async saveToDB(visualization: TopicVisualization, userId: string, documentId: string): Promise<boolean> {
        try {
            await this.visualizationRepository.create(userId, documentId, visualization);
            return true;
        } catch (error) {
            console.error("VisualizeService: Failed to save to DB:", error);
            return false;
        }
    }

    async getVisualizationByDocAndUser(documentId: string, userId: string) {
        return await this.visualizationRepository.findByDocAndUser(documentId, userId);
    }

    async generate(text: string): Promise<TopicVisualization> {
        const prompt = `You are a document analyzer. Analyze the following document text and generate a structured topic breakdown for visualization.

Return ONLY a valid JSON object with this exact structure (no markdown, no code fences, just raw JSON):
{
  "title": "Main document title or subject",
  "topics": [
    {
      "name": "Topic Name",
      "summary": "2-3 sentence summary of this topic",
      "keyPoints": ["key point 1", "key point 2", "key point 3"],
      "importance": "high"
    }
  ],
  "connections": [
    {
      "from": "Topic A name",
      "to": "Topic B name",
      "relation": "short description of how they relate"
    }
  ]
}

Rules:
- Generate 4-8 topics that cover the main themes of the document
- Each topic must have 2-4 key points
- importance must be one of: "high", "medium", "low"
- Generate 3-6 connections showing relationships between topics
- The "from" and "to" fields must exactly match topic names
- Keep summaries concise but informative

Document text:
${text.substring(0, 30000)}`

        const aiResponse = await this.aiService.generateContent(prompt)
        const visualization = this.aiParser.parseJson<TopicVisualization>(aiResponse, "visualization")

        if (!visualization.title || !Array.isArray(visualization.topics) || visualization.topics.length === 0) {
            throw new Error("AI generated incomplete visualization. Please try again.")
        }

        return visualization
    }
}
