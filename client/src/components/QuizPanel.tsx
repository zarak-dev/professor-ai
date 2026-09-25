'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  RotateCcw,
  Trophy,
  Target,
  Zap,
  Loader2,
  Sparkles,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import { QuizQuestion } from '@/types';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';

interface QuizPanelProps {
  documentId: string;
}

type QuizState = 'intro' | 'loading' | 'playing' | 'result' | 'error';

export default function QuizPanel({ documentId }: QuizPanelProps) {
  const [quizState, setQuizState] = useState<QuizState>('loading');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [hasExistingQuiz, setHasExistingQuiz] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadExistingQuiz = useCallback(async () => {
    if (!documentId) return;
    setQuizState('loading');
    setErrorMsg('');
    try {
      const res = await api.get(`/documents/${documentId}/quiz`);
      const existing = res.data.questions;
      if (Array.isArray(existing) && existing.length > 0) {
        setQuestions(existing.map((q: QuizQuestion, i: number) => ({ ...q, id: i + 1 })));
        setHasExistingQuiz(true);
        setQuizState('intro');
      } else {
        setHasExistingQuiz(false);
        setQuizState('intro');
      }
    } catch (err: unknown) {
      if ((err as { response?: { status?: number } })?.response?.status === 404) {
        setHasExistingQuiz(false);
        setQuizState('intro');
      } else {
        console.warn('Failed to load existing quiz:', err);
        setHasExistingQuiz(false);
        setQuizState('intro');
      }
    }
  }, [documentId]);

  useEffect(() => {
    loadExistingQuiz();
  }, [loadExistingQuiz]);

  const generateQuiz = async () => {
    if (!documentId) return;

    setQuizState('loading');
    setErrorMsg('');

    try {
      const res = await api.post(`/documents/${documentId}/quiz`);
      const generated = res.data.questions;
      if (Array.isArray(generated) && generated.length > 0) {
        setQuestions(generated.map((q: QuizQuestion, i: number) => ({ ...q, id: i + 1 })));
        setHasExistingQuiz(true);
        setCurrentQ(0);
        setSelected(null);
        setAnswered(false);
        setScore(0);
        setQuizState('playing');
      } else {
        throw new Error('No questions returned by the AI');
      }
    } catch (err: unknown) {
      console.error('Quiz Generation Error:', err);
      const msg = getErrorMessage(err, 'Failed to generate assessment. Please try again.');
      setErrorMsg(msg);
      setQuizState('error');
    }
  };

  const startQuiz = () => {
    setCurrentQ(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setQuizState('playing');
  };

  const question = questions[currentQ];
  const totalQ = questions.length;
  const progressPct = useMemo(
    () => (totalQ > 0 ? ((currentQ + (answered ? 1 : 0)) / totalQ) * 100 : 0),
    [currentQ, answered, totalQ]
  );

  const handleSelect = (idx: number) => {
    if (answered || !question) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === question.correct) setScore((s) => s + 1);
  };

  const nextQuestion = () => {
    if (currentQ < totalQ - 1) {
      setCurrentQ((q) => q + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setQuizState('result');
    }
  };

  const restart = () => {
    setCurrentQ(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setQuizState('playing');
  };

  const getScoreSummary = () => {
    const pct = totalQ > 0 ? Math.round((score / totalQ) * 100) : 0;
    if (pct === 100) return { title: 'Perfect Mastery', text: 'You answered all questions correctly.' };
    if (pct >= 80) return { title: 'Strong Comprehension', text: 'Great performance. You demonstrated clear understanding of the material.' };
    if (pct >= 60) return { title: 'Moderate Understanding', text: 'Good effort. Reviewing key sections of the document is recommended.' };
    return { title: 'Review Recommended', text: 'We recommend reviewing the document summary and key concepts before retesting.' };
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <AnimatePresence mode="wait">
        {quizState === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="border border-slate-200 bg-white rounded-xl p-8 sm:p-10 text-center shadow-xs"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <Target size={24} />
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 mb-2">
              Document Knowledge Assessment
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mb-6 max-w-md mx-auto leading-relaxed">
              Evaluate your comprehension with AI-generated multiple-choice questions grounded strictly in this document.
            </p>

            <div className="flex items-center justify-center gap-2 text-xs mb-8">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
                <Zap size={11} className="text-blue-600" /> 5 Questions
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
                <CheckCircle2 size={11} className="text-emerald-600" /> Instant Feedback
              </span>
            </div>

            <div className="flex flex-col gap-2.5 max-w-sm mx-auto">
              {hasExistingQuiz ? (
                <>
                  <Button
                    onClick={startQuiz}
                    variant="primary"
                    size="md"
                    className="w-full justify-center gap-2"
                  >
                    <span>Start Saved Assessment</span>
                    <ArrowRight size={15} />
                  </Button>
                  <Button
                    onClick={generateQuiz}
                    variant="outline"
                    size="sm"
                    className="w-full justify-center gap-2"
                  >
                    <RefreshCw size={13} />
                    <span>Regenerate Questions</span>
                  </Button>
                </>
              ) : (
                <Button
                  onClick={generateQuiz}
                  variant="primary"
                  size="md"
                  className="w-full justify-center gap-2"
                >
                  <Sparkles size={15} />
                  <span>Generate Assessment</span>
                  <ArrowRight size={15} />
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {quizState === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="border border-slate-200 bg-white rounded-xl p-8 sm:p-12 text-center shadow-xs"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <Loader2 size={24} className="animate-spin" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              Synthesizing Assessment Questions...
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              The AI is analyzing central themes and creating targeted evaluation questions.
            </p>
          </motion.div>
        )}

        {quizState === 'playing' && question && (
          <motion.div
            key={`q-${currentQ}`}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            className="border border-slate-200 bg-white rounded-xl p-6 sm:p-8 shadow-xs"
          >
            {/* Header / Progress bar */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Question {currentQ + 1} of {totalQ}
              </span>
              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
                Score: {score}
              </span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-1.5 mb-6 overflow-hidden border border-slate-200/50">
              <motion.div
                className="h-full bg-blue-600 rounded-full"
                animate={{ width: `${progressPct}%` }}
                transition={{ ease: 'easeOut', duration: 0.25 }}
              />
            </div>

            {/* Question Text */}
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-5 leading-snug">
              {question.question}
            </h3>

            {/* Answer Options */}
            <div className="space-y-2.5 mb-6">
              {question.options.map((opt, idx) => {
                let optionStyle =
                  'border border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50/80 cursor-pointer';

                let letterStyle = 'bg-slate-100 text-slate-600 border border-slate-200';

                if (answered) {
                  if (idx === question.correct) {
                    optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-medium cursor-default';
                    letterStyle = 'bg-emerald-600 text-white border-emerald-600';
                  } else if (idx === selected && idx !== question.correct) {
                    optionStyle = 'border-red-400 bg-red-50 text-red-950 font-medium cursor-default';
                    letterStyle = 'bg-red-600 text-white border-red-600';
                  } else {
                    optionStyle = 'border-slate-200 bg-white opacity-40 cursor-default';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={answered}
                    className={`w-full text-left px-3.5 py-3 rounded-lg text-xs sm:text-sm font-normal transition-all flex items-center gap-3 ${optionStyle}`}
                  >
                    <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${letterStyle}`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 leading-relaxed">{opt}</span>
                    {answered && idx === question.correct && (
                      <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                    )}
                    {answered && idx === selected && idx !== question.correct && (
                      <XCircle size={16} className="text-red-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation and Next Button */}
            <AnimatePresence>
              {answered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div
                    className={`p-4 rounded-lg mb-5 border text-xs sm:text-sm leading-relaxed ${
                      selected === question.correct
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <p className="font-semibold mb-1 flex items-center gap-1.5">
                      {selected === question.correct ? (
                        <>
                          <CheckCircle size={14} className="text-emerald-600" /> Correct
                        </>
                      ) : (
                        <>
                          <XCircle size={14} className="text-red-600" /> Incorrect
                        </>
                      )}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {question.explanation}
                    </p>
                  </div>

                  <Button
                    onClick={nextQuestion}
                    variant="primary"
                    size="md"
                    className="w-full justify-center gap-2"
                  >
                    <span>{currentQ < totalQ - 1 ? 'Next Question' : 'View Results'}</span>
                    <ArrowRight size={14} />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {quizState === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="border border-slate-200 bg-white rounded-xl p-8 sm:p-10 text-center shadow-xs"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <Trophy size={28} />
            </div>

            <h3 className="text-xl font-semibold tracking-tight text-slate-900 mb-1">
              {getScoreSummary().title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-6 max-w-sm mx-auto leading-relaxed">
              {getScoreSummary().text}
            </p>

            <div className="inline-flex items-center gap-2 px-6 py-3 bg-slate-50 rounded-xl border border-slate-200/80 mb-8">
              <span className="text-2xl font-bold text-slate-900">{score}</span>
              <span className="text-slate-400">/</span>
              <span className="text-slate-500 font-medium">{totalQ}</span>
              <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                {totalQ > 0 ? Math.round((score / totalQ) * 100) : 0}%
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 justify-center max-w-sm mx-auto">
              <Button onClick={restart} variant="primary" size="md" className="flex-1 justify-center gap-2">
                <RotateCcw size={14} />
                <span>Retake Quiz</span>
              </Button>
              <Button onClick={generateQuiz} variant="outline" size="md" className="flex-1 justify-center gap-2">
                <RefreshCw size={14} />
                <span>New Questions</span>
              </Button>
            </div>
          </motion.div>
        )}

        {quizState === 'error' && (
          <div className="max-w-md mx-auto">
            <ErrorState
              title={errorMsg.toLowerCase().includes('guest') || errorMsg.toLowerCase().includes('limit') ? "Guest Limit Reached" : "Assessment Generation Error"}
              message={errorMsg}
              onRetry={generateQuiz}
            />
            {(errorMsg.toLowerCase().includes('guest') || errorMsg.toLowerCase().includes('limit')) && (
              <div className="mt-4 text-center">
                <Link href="/sign-in?claim=true">
                  <Button variant="primary" size="sm" className="gap-1.5 shadow-xs">
                    <span>Create Free Account to Continue</span>
                    <ArrowRight size={14} />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
