import type { Metadata } from 'next';
import PdfUploader from '@/components/PdfUploader';

export const metadata: Metadata = {
  title: 'Upload Document | The Professor',
  description: 'Upload PDF documents for AI-powered extraction, analysis, and interactive tutoring.',
};

export default function UploadPage() {
  return (
    <main className="min-h-[calc(100vh-3.5rem)] pt-20 pb-16 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            Document Ingestion
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 mb-2">
            Upload Document
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Upload a PDF document to generate an AI executive summary, interactive chat tutor, quiz questions, and concept visualizer.
          </p>
        </div>
        <PdfUploader />
      </div>
    </main>
  );
}
