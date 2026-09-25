'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import { api } from '@/lib/api';
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
    } catch (err: any) {
      // 404 is expected when quiz has not been generated yet
      if (err?.response?.status === 404) {
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
    } catch (err: any) {
      console.error('Quiz Generation Error:', err);
      const msg =
        err?.response?.data?.error?.message ||
        err?.message ||
        'Failed to generate quiz. Please try again.';
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

  const getScoreMessage = () => {
    const pct = totalQ > 0 ? (score / totalQ) * 100 : 0;
    if (pct === 100) return { emoji: '🏆', text: 'Perfect Score! Outstanding mastery!' };
    if (pct >= 80) return { emoji: '🎉', text: 'Great job! Strong understanding of the document.' };
    if (pct >= 60) return { emoji: '👍', text: 'Good effort! Review the notes to improve.' };
    return { emoji: '📚', text: 'Keep studying the document and try again!' };
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <AnimatePresence mode="wait">
        {quizState === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="bento-card-static !p-8 sm:!p-12 text-center"
          >
            <div className="icon-circle bg-primary/20 !w-16 !h-16 mx-auto mb-6">
              <Target size={28} className="text-foreground" />
            </div>
            <h2 className="text-2xl font-black mb-3">Document Knowledge Quiz</h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Test your retention and understanding with AI-generated questions grounded directly in this document.
            </p>
            <div className="flex items-center justify-center gap-3 text-xs mb-8">
              <span className="tag tag-mint">
                <Zap size={10} /> 5 Questions
              </span>
              <span className="tag tag-yellow">
                <Trophy size={10} /> Multiple Choice
              </span>
            </div>

            <div className="flex flex-col gap-3 max-w-sm mx-auto">
              {hasExistingQuiz ? (
                <>
                  <Button
                    onClick={startQuiz}
                    variant="primary"
                    size="lg"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <span>Start Saved Quiz</span>
                    <ArrowRight size={16} />
                  </Button>
                  <Button
                    onClick={generateQuiz}
                    variant="secondary"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={14} />
                    <span>Regenerate New Questions</span>
                  </Button>
                </>
              ) : (
                <Button
                  onClick={generateQuiz}
                  variant="primary"
                  size="lg"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} />
                  <span>Generate Quiz</span>
                  <ArrowRight size={16} />
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {quizState === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="bento-card-static !p-8 sm:!p-12 text-center"
          >
            <div className="icon-circle bg-primary/20 !w-16 !h-16 mx-auto mb-6">
              <Loader2 size={30} className="animate-spin text-foreground" />
            </div>
            <h3 className="text-xl font-black mb-2">Generating Questions...</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              The Professor is analyzing key concepts and formulating multiple-choice challenges.
            </p>
          </motion.div>
        )}

        {quizState === 'playing' && question && (
          <motion.div
            key={`q-${currentQ}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="bento-card-static !p-6 sm:!p-8"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="label-text">
                Question {currentQ + 1} of {totalQ}
              </span>
              <span className="tag tag-yellow text-[11px]">
                Score: {score}
              </span>
            </div>

            <div className="w-full bg-muted rounded-full h-2 mb-6 border border-border overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                animate={{ width: `${progressPct}%` }}
                transition={{ ease: 'easeOut', duration: 0.3 }}
              />
            </div>

            <h3 className="text-base sm:text-lg font-black mb-6 leading-relaxed">
              {question.question}
            </h3>

            <div className="space-y-3 mb-6">
              {question.options.map((opt, idx) => {
                let cls =
                  'border-2 border-border bg-card hover:bg-muted/80 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--border-color)] cursor-pointer';

                if (answered) {
                  if (idx === question.correct) {
                    cls = 'border-2 border-border bg-[var(--bg-mint)] cursor-default';
                  } else if (idx === selected && idx !== question.correct) {
                    cls = 'border-2 border-border bg-[var(--bg-pink)] cursor-default';
                  } else {
                    cls = 'border-2 border-border bg-card opacity-40 cursor-default';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={answered}
                    className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold transition-all flex items-center gap-3 ${cls}`}
                  >
                    <span className="w-7 h-7 rounded-lg border-2 border-border bg-background flex items-center justify-center text-xs font-black shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {answered && idx === question.correct && (
                      <CheckCircle size={18} className="text-green-800 shrink-0" />
                    )}
                    {answered && idx === selected && idx !== question.correct && (
                      <XCircle size={18} className="text-red-700 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            <AnimatePresence>
              {answered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div
                    className={`bento-card-static !p-4 mb-5 text-sm ${
                      selected === question.correct
                        ? '!bg-[var(--bg-mint)]/30 border-green-600/30'
                        : '!bg-[var(--bg-peach)]/50 border-orange-500/30'
                    }`}
                  >
                    <p className="font-black mb-1">
                      {selected === question.correct ? '✅ Correct!' : '❌ Incorrect'}
                    </p>
                    <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
                      {question.explanation}
                    </p>
                  </div>

                  <Button
                    onClick={nextQuestion}
                    variant="primary"
                    className="w-full justify-center flex items-center gap-2"
                  >
                    <span>{currentQ < totalQ - 1 ? 'Next Question' : 'View Final Results'}</span>
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bento-card-static !p-8 sm:!p-12 text-center"
          >
            <div className="text-5xl mb-4 select-none">{getScoreMessage().emoji}</div>
            <h3 className="text-2xl font-black mb-2">Quiz Complete!</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {getScoreMessage().text}
            </p>

            <div className="inline-flex items-center gap-2 text-4xl font-black mb-8 p-4 bg-muted/60 rounded-2xl border-2 border-border">
              <span className="text-primary">{score}</span>
              <span className="text-muted-foreground/40">/</span>
              <span className="text-muted-foreground">{totalQ}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
              <Button onClick={restart} variant="primary" className="flex-1 flex items-center justify-center gap-2">
                <RotateCcw size={16} />
                <span>Retake Quiz</span>
              </Button>
              <Button onClick={generateQuiz} variant="secondary" className="flex-1 flex items-center justify-center gap-2">
                <RefreshCw size={14} />
                <span>New Questions</span>
              </Button>
            </div>
          </motion.div>
        )}

        {quizState === 'error' && (
          <ErrorState
            title="Quiz Generation Error"
            message={errorMsg}
            onRetry={generateQuiz}
            className="max-w-md mx-auto"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
