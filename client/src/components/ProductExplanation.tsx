'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  MessageSquare,
  CheckCircle2,
  Layers,
  Network,
  ShieldCheck,
} from 'lucide-react';

const capabilities = [
  {
    icon: FileText,
    title: 'Executive PDF Summarization',
    description:
      'Upload complex academic papers, textbooks, or technical memos. The system extracts core arguments and synthesizes an executive summary in seconds.',
  },
  {
    icon: MessageSquare,
    title: 'Document-Grounded Chat',
    description:
      'Converse directly with your document. Answers cite and reason strictly over the uploaded content, preventing hallucinations and ensuring factual accuracy.',
  },
  {
    icon: CheckCircle2,
    title: 'Adaptive Assessment & Quizzes',
    description:
      'Transform reading material into interactive multiple-choice tests with detailed answer explanations to evaluate your comprehension.',
  },
  {
    icon: Layers,
    title: 'Active Recall Flashcards',
    description:
      'Auto-generate focused review cards for key vocabulary, principles, formulas, and definitions designed for high-yield retention.',
  },
  {
    icon: Network,
    title: 'Visual Concept Mapping',
    description:
      'Explore themes, topics, and cross-disciplinary connections rendered as an intuitive relational concept map.',
  },
  {
    icon: ShieldCheck,
    title: 'Isolated & Secure Processing',
    description:
      'Your materials are strictly isolated. Guest sessions automatically expire after 2 hours, and registered accounts benefit from user-scoped database isolation.',
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

export default function ProductExplanation() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-[#E2DBD0]">
      <div className="max-w-3xl mb-12">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#547792] mb-1.5">
          Overview
        </p>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#213448] mb-3">
          What is The Professor?
        </h2>
        <p className="text-sm text-[#547792] leading-relaxed">
          The Professor is an AI-powered document intelligence workspace. When you upload a PDF or study document,
          The Professor instantly converts passive reading material into an active, interactive workspace — allowing you
          to chat with the text, test your recall, study flashcards, and visualize concept relationships.
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {capabilities.map((cap) => {
          const Icon = cap.icon;
          return (
            <motion.div
              key={cap.title}
              variants={item}
              className="p-5 rounded-xl border border-[#E2DBD0] bg-white shadow-xs hover:border-[#94B4C1] hover:shadow-sm transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-[#F0F5F8] text-[#213448] flex items-center justify-center mb-3.5 border border-[#CADDE6]">
                <Icon size={18} />
              </div>
              <h3 className="text-sm font-semibold text-[#213448] mb-1.5">
                {cap.title}
              </h3>
              <p className="text-xs text-[#547792] leading-relaxed">
                {cap.description}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
