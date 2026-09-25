export interface DocumentProcessor {
    extractText(file: string): Promise<string>;
}
