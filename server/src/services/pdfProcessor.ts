import fs from "fs"
import { PDFParse, VerbosityLevel } from "pdf-parse"
import path from "path"
import { DocumentProcessor } from "../interfaces/DocumentProcessor"

export class PDFProcessor implements DocumentProcessor {

    private validateFormat(file: string): boolean {
        const ext = path.extname(file).toLowerCase()
        return ext === '.pdf'
    }

    async extractText(file: string): Promise<string> {
        try {
            if (!this.validateFormat(file)) {
                throw new Error("Invalid file format. Only PDF files are supported.")
            }

            const dataBuffer = await fs.promises.readFile(file)

            const parser = new PDFParse({
                data: new Uint8Array(dataBuffer),
                verbosity: VerbosityLevel.ERRORS
            })

            const result = await parser.getText()

            await parser.destroy()
            
            return result.text
        } catch (error) {
            console.error("Error in PDF service: ", error);
            throw new Error("Failed to extract text from PDF")
        }
    }
}