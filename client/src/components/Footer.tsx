import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200/80 bg-white py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>
          © {new Date().getFullYear()} The Professor. All rights reserved.
        </p>

        <div className="flex items-center gap-6">
          <Link
            href="/documents"
            className="hover:text-slate-900 transition-colors"
          >
            Documents
          </Link>
          <Link
            href="/upload"
            className="hover:text-slate-900 transition-colors"
          >
            Upload
          </Link>
          <span className="text-slate-300">•</span>
          <span className="text-slate-400">
            Powered by Gemini AI
          </span>
        </div>
      </div>
    </footer>
  );
}
