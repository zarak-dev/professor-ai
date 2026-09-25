'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Cpu, Compass, BookmarkCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const steps = [
  {
    step: '01',
    icon: Upload,
    title: 'Upload',
    description:
      'Upload your PDF research paper, lecture slides, or study notes. Guests can start instantly with files up to 5MB, while authenticated accounts support up to 20MB.',
  },
  {
    step: '02',
    icon: Cpu,
    title: 'Understand',
    description:
      'The Professor extracts clean text, identifies core themes, and generates an executive summary to establish an interactive workspace.',
  },
  {
    step: '03',
    icon: Compass,
    title: 'Explore',
    description:
      'Ask questions in document-grounded chat, test mastery with auto-generated quizzes, practice with flashcards, and navigate visual concept maps.',
  },
  {
    step: '04',
    icon: BookmarkCheck,
    title: 'Save',
    description:
      'Create a free account at any time to preserve your documents, quiz scores, flashcards, and chat history permanently across sessions and devices.',
  },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-slate-200/80">
      <div className="max-w-3xl mb-12">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1.5">
          Workflow
        </p>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 mb-3">
          How The Professor Works
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          From static PDF to interactive study workspace in four straightforward steps.
          Start as a guest to experience the engine firsthand, then save your progress whenever you choose.
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.step}
              variants={item}
              className="relative p-6 rounded-xl border border-slate-200/90 bg-white shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                    <Icon size={18} />
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-400">
                    {s.step}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {s.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Guest Exploration Callout */}
      <div className="mt-10 p-6 rounded-xl border border-blue-200/70 bg-gradient-to-r from-blue-50/50 via-slate-50/50 to-indigo-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-1">
            Experience the workspace right now
          </h4>
          <p className="text-xs text-slate-600">
            No signup required to explore. Upload a PDF, ask questions, and test your retention as a guest.
          </p>
        </div>
        <Link href="/upload" className="shrink-0">
          <Button size="sm" variant="primary" className="gap-1.5 text-xs shadow-xs">
            <span>Try as Guest</span>
            <ArrowRight size={13} />
          </Button>
        </Link>
      </div>
    </section>
  );
}
