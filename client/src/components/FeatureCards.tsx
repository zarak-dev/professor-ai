'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FileText,
  MessageSquareText,
  BrainCircuit,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Neural PDF Extraction',
    description:
      'High-fidelity text extraction from complex multi-page documents using specialized backend parsing.',
    tag: 'Extraction',
    tagColor: 'tag-peach',
    bg: 'bg-[var(--bg-peach)]',
    href: '/upload',
  },
  {
    icon: MessageSquareText,
    title: 'Contextual AI Chat',
    description:
      "Real-time dialogue powered by Gemini AI with Groq fallback, grounded specifically in your document's context.",
    tag: 'AI Chat',
    tagColor: 'tag-blue',
    bg: 'bg-[var(--bg-blue)]',
    href: '/documents',
  },
  {
    icon: BrainCircuit,
    title: 'Auto Quiz Generation',
    description:
      'Intelligent analysis of document segments to generate interactive MCQs and flip-card decks.',
    tag: 'Quiz',
    tagColor: 'tag-mint',
    bg: 'bg-[var(--bg-mint)]',
    href: '/documents',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Authentication',
    description:
      'Document-level ownership and role-isolated persistence ensuring private study materials.',
    tag: 'Security',
    tagColor: 'tag-purple',
    bg: 'bg-[var(--bg-purple)]',
    href: '/documents',
  },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function FeatureCards() {
  return (
    <section className="wrapper py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6"
      >
        <div>
          <p className="label-text mb-2">✦ Capabilities</p>
          <h2 className="section-title">What The Professor does</h2>
        </div>
        <p className="text-sm text-muted-foreground max-w-sm">
          A complete AI toolkit for transforming how you interact with academic
          and technical documents.
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              variants={item}
            >
              <Link href={feature.href} className="block bento-card group h-full">
          
                <div className="flex items-center justify-between mb-4">
                  <div className={`icon-circle ${feature.bg}`}>
                    <Icon size={18} />
                  </div>
                  <span className={`tag ${feature.tagColor}`}>
                    {feature.tag}
                  </span>
                </div>

                <h3 className="text-lg font-black mb-2 flex items-center gap-2">
                  {feature.title}
                  <ArrowUpRight
                    size={16}
                    className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                  />
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
