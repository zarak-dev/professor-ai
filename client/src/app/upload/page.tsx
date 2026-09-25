import type { Metadata } from 'next';
import PdfUploader from '@/components/PdfUploader';

export const metadata: Metadata = {
  title: 'Upload PDF | The Professor',
  description: 'Upload your PDF documents for AI-powered analysis and summarization.',
};

export default function UploadPage() {
  return (
    <main className="container-page">
      <div className="wrapper">
        <div className="text-center mb-8">
          <p className="label-text mb-2">✦ Document Upload</p>
          <h1 className="page-title mb-3">Upload Your Document</h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-lg mx-auto">
            Drop any PDF and let The Professor analyze it with AI
          </p>
        </div>
        <PdfUploader />
      </div>
    </main>
  );
}
