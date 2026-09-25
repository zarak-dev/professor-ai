import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#E2DBD0] bg-[#FAF8F5] py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#547792]">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
          <p>© {new Date().getFullYear()} The Professor.</p>
          <span className="hidden sm:inline-block text-[#94B4C1]">•</span>
          <p>A Project by Zarak K.</p>
        </div>

        <div className="flex items-center gap-5">
          <Link
            href="/documents"
            className="hover:text-[#213448] transition-colors"
          >
            Documents
          </Link>
          <Link
            href="/upload"
            className="hover:text-[#213448] transition-colors"
          >
            Upload
          </Link>
          <span className="text-[#94B4C1]">•</span>
          <span className="inline-flex items-center gap-1.5 text-[#547792] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#547792]" />
            Powered by Aimmyy AI
          </span>
        </div>
      </div>
    </footer>
  );
}
