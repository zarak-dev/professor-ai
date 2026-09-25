'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles, MessageSquare, BrainCircuit, FileText, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function HeroSection() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-12">
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16"
      >
        {/* Pill Badge */}
        <motion.div variants={item} className="mb-6 flex items-center justify-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#F0F5F8] text-[#213448] border border-[#CADDE6]">
            <Sparkles size={12} className="text-[#547792]" />
            Powered by Aimmyy AI
          </span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          variants={item}
          className="text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-[#213448] leading-[1.15] mb-6"
        >
          Transform complex documents into{' '}
          <span className="text-[#547792]">actionable knowledge</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={item}
          className="text-base sm:text-lg text-[#547792] max-w-2xl leading-relaxed mb-8"
        >
          Upload research papers, lecture notes, and technical textbooks.
          Interact via grounded conversational AI, test retention with auto-generated
          quizzes, and master concepts with structured flashcards.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={item}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto"
        >
          <Link href="/upload" className="w-full sm:w-auto">
            <Button size="lg" variant="primary" className="w-full sm:w-auto gap-2 shadow-xs">
              <span>Try as Guest</span>
              <ArrowRight size={16} />
            </Button>
          </Link>
          <Link href="/sign-in" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              <span>Sign In</span>
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Feature Value Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          {
            icon: FileText,
            title: 'Neural Extraction',
            description: 'Extracts formatted text and key entities from multi-page PDFs with zero data leakage.',
          },
          {
            icon: MessageSquare,
            title: 'Document-Grounded Chat',
            description: 'Answers strictly grounded in your document context to eliminate AI hallucinations.',
          },
          {
            icon: BrainCircuit,
            title: 'Assessment Engine',
            description: 'Generates targeted multiple-choice questions with conceptual answer explanations.',
          },
          {
            icon: Network,
            title: 'Knowledge Mapping',
            description: 'Maps relationships between key themes and topics for visual comprehension.',
          },
        ].map((feature) => (
          <motion.div
            key={feature.title}
            variants={item}
            className="p-5 rounded-xl border border-[#E2DBD0] bg-white shadow-xs hover:border-[#94B4C1] hover:shadow-sm transition-all"
          >
            <div className="w-9 h-9 rounded-lg bg-[#F0F5F8] text-[#213448] flex items-center justify-center mb-3.5 border border-[#CADDE6]">
              <feature.icon size={18} />
            </div>
            <h3 className="text-sm font-semibold text-[#213448] mb-1">
              {feature.title}
            </h3>
            <p className="text-xs text-[#547792] leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
