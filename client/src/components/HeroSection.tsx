'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Upload, Sparkles, MessageSquare, BrainCircuit, FileText } from 'lucide-react';

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function HeroSection() {
  return (
    <section className="wrapper pt-28 pb-6">
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={item} className="bento-card-static !p-5 sm:!p-8 md:!p-12 mb-6">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-5">
                <span className="tag tag-yellow">
                  <Sparkles size={12} />
                  AI-Powered
                </span>
                <span className="tag tag-mint">Document Intelligence</span>
              </div>

              <h1 className="page-title mb-6">
                Turn your PDFs into
                <br />
                <span className="relative inline-block">
                  interactive knowledge
                  <svg className="absolute -bottom-1 left-0 w-full" height="8" viewBox="0 0 300 8" fill="none">
                    <path d="M1 5.5C60 2 120 2 150 4C180 6 240 3 299 5.5" stroke="var(--bg-yellow)" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                </span>
                <span className="animate-blink text-primary ml-1">|</span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed mb-8">
                Upload any PDF, chat with AI about its contents, and generate
                quizzes for self-assessment. The Professor transforms static
                documents into dynamic learning experiences.
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                <Link href="/sign-in" className="btn-primary text-base px-6 py-3 w-full sm:w-auto justify-center">
                  <span>Get Started Free</span>
                  <ArrowRight size={16} />
                </Link>
                <Link href="/sign-in" className="btn-secondary text-base px-6 py-3 w-full sm:w-auto justify-center">
                  <span>Sign In to Documents</span>
                </Link>
              </div>
            </div>

            <div className="w-full lg:w-72 flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <div className="flex-1 bg-primary/20 border-2 border-foreground rounded-2xl p-4 text-center">
                <div className="text-3xl mb-2">🔥</div>
                <p className="text-sm font-bold">Powered by</p>
                <p className="text-xs text-muted-foreground">
                  Google Gemini
                </p>
              </div>
              <div className="flex-1 bg-secondary/30 border-2 border-foreground rounded-2xl p-4 text-center">
                <div className="text-3xl mb-2"></div>
                <p className="text-sm font-bold">Architecture</p>
                <p className="text-xs text-muted-foreground">
                  MVC + OOP Design
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={container}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3"
        >
          {[
            { icon: FileText, label: 'Neural Extraction', value: 'PDF', bg: 'bg-[var(--bg-peach)]' },
            { icon: MessageSquare, label: 'Contextual AI', value: 'Chat', bg: 'bg-[var(--bg-blue)]' },
            { icon: BrainCircuit, label: 'Auto-Generated', value: 'MCQ', bg: 'bg-[var(--bg-mint)]' },
            { icon: Sparkles, label: 'Verified Auth', value: 'Security', bg: 'bg-[var(--bg-purple)]' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              variants={item}
              className="bento-card flex flex-col gap-3 cursor-default"
            >
              <div className={`icon-circle ${stat.bg}`}>
                <stat.icon size={18} />
              </div>
              <div>
                <p className="label-text mb-0.5">{stat.label}</p>
                <p className="text-2xl font-black">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
