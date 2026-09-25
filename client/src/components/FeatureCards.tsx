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
import { Badge } from '@/components/ui/badge';

const features = [
  {
    icon: FileText,
    title: 'High-Fidelity PDF Processing',
    description:
      'Extract text, headers, and key semantic sections from multi-page PDFs using resilient backend parsing pipeline.',
    tag: 'Extraction',
    tagColor: 'blue' as const,
    href: '/upload',
  },
  {
    icon: MessageSquareText,
    title: 'Context-Aware AI Dialogue',
    description:
      "Interactive conversational tutor powered by Aimmyy AI with resilient multi-tier intelligence, referencing specific sections of your document.",
    tag: 'AI Tutor',
    tagColor: 'mint' as const,
    href: '/documents',
  },
  {
    icon: BrainCircuit,
    title: 'Adaptive Assessment & Flashcards',
    description:
      'Automated multiple-choice questions and spaced-repetition flashcards generated on-demand to test mastery.',
    tag: 'Evaluation',
    tagColor: 'purple' as const,
    href: '/documents',
  },
  {
    icon: ShieldCheck,
    title: 'Private & Secure Storage',
    description:
      'User-isolated documents and role-protected sessions ensuring research and proprietary study materials remain strictly private.',
    tag: 'Security',
    tagColor: 'slate' as const,
    href: '/documents',
  },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function FeatureCards() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 border-t border-slate-200/80">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            Capabilities
          </p>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
            A complete intelligence suite for your documents
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm">
          Built for students, researchers, and technical professionals working with complex texts.
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <motion.div key={feature.title} variants={item}>
              <Link
                href={feature.href}
                className="group block p-6 rounded-xl border border-slate-200/90 bg-white shadow-xs hover:border-slate-300 hover:shadow-sm transition-all h-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200/60 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <Icon size={18} />
                  </div>
                  <Badge color={feature.tagColor}>
                    {feature.tag}
                  </Badge>
                </div>

                <h3 className="text-base font-semibold text-slate-900 mb-2 flex items-center justify-between">
                  <span>{feature.title}</span>
                  <ArrowUpRight
                    size={16}
                    className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                  />
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
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
