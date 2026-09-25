export class AIParser {
    parseJson<T>(raw: string, label: string): T {
        let cleaned = raw.trim()

        if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
        }

        try {
            return JSON.parse(cleaned) as T
        } catch {
            console.error(`Failed to parse ${label} JSON from AI:`, raw)
            throw new Error(`AI returned invalid ${label} format. Please try again.`)
        }
    }
}
