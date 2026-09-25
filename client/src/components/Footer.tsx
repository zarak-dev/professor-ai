import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="wrapper py-8">
      <div className="bento-card-static !p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs font-bold text-muted-foreground">
          © {new Date().getFullYear()} The Professor · Original AI Tutor 
        </p>

        <div className="flex flex-wrap gap-2">
          {[
            { label: 'My Documents', href: '/documents' },
            { label: 'Upload PDF', href: '/upload' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="tag tag-purple hover:tag-yellow transition-all hover:-translate-y-0.5"
            >
              {link.label}
            </Link>
          ))}
          <span className="tag tag-mint">Next.js</span>
          <span className="tag tag-peach">Gemini AI</span>
          <span className="tag tag-blue">MongoDB</span>
        </div>
      </div>
    </footer>
  );
}
