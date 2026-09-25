'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  RotateCcw,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Shuffle,
  CheckCircle,
  RefreshCw,
  Loader2,
  MousePointerClick,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import { Flashcard } from '@/types';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { Badge } from '@/components/ui/badge';

interface FlashcardPanelProps {
  documentId: string;
}

type FlashState = 'intro' | 'loading' | 'playing' | 'result' | 'error';

export default function FlashcardPanel({ documentId }: FlashcardPanelProps) {
  const [flashState, setFlashState] = useState<FlashState>('loading');
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mastered, setMastered] = useState<Set<number>>(new Set());
  const [reviewing, setReviewing] = useState<Set<number>>(new Set());
  const [hasExistingCards, setHasExistingCards] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadExistingFlashcards = useCallback(async () => {
    if (!documentId) return;
    setFlashState('loading');
    setErrorMsg('');
    try {
      const res = await api.get(`/documents/${documentId}/flashcards`);
      const existing = res.data.flashcards;
      if (Array.isArray(existing) && existing.length > 0) {
        setCards(existing.map((c: Flashcard, i: number) => ({ ...c, id: i + 1 })));
        setHasExistingCards(true);
        setFlashState('intro');
      } else {
        setHasExistingCards(false);
        setFlashState('intro');
      }
    } catch (err: unknown) {
      if ((err as { response?: { status?: number } })?.response?.status === 404) {
        setHasExistingCards(false);
        setFlashState('intro');
      } else {
        console.warn('Failed to load existing flashcards:', err);
        setHasExistingCards(false);
        setFlashState('intro');
      }
    }
  }, [documentId]);

  useEffect(() => {
    loadExistingFlashcards();
  }, [loadExistingFlashcards]);

  const nextCard = useCallback(() => {
    if (currentIdx < cards.length - 1) {
      setCurrentIdx((i) => i + 1);
      setIsFlipped(false);
    }
  }, [currentIdx, cards.length]);

  const prevCard = useCallback(() => {
    if (currentIdx > 0) {
      setCurrentIdx((i) => i - 1);
      setIsFlipped(false);
    }
  }, [currentIdx]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (flashState !== 'playing') return;
      if (e.key === 'ArrowLeft') prevCard();
      if (e.key === 'ArrowRight') nextCard();
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((f) => !f);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flashState, nextCard, prevCard]);

  const generateFlashcards = async () => {
    if (!documentId) return;

    setFlashState('loading');
    setErrorMsg('');

    try {
      const res = await api.post(`/documents/${documentId}/flashcards`);
      const generated = res.data.flashcards;
      if (Array.isArray(generated) && generated.length > 0) {
        setCards(generated.map((c: Flashcard, i: number) => ({ ...c, id: i + 1 })));
        setHasExistingCards(true);
        setCurrentIdx(0);
        setIsFlipped(false);
        setMastered(new Set());
        setReviewing(new Set());
        setFlashState('playing');
      } else {
        throw new Error('No flashcards returned by the AI');
      }
    } catch (err: unknown) {
      console.error('Flashcard Generation Error:', err);
      const msg = getErrorMessage(err, 'Failed to generate flashcards. Please try again.');
      setErrorMsg(msg);
      setFlashState('error');
    }
  };

  const startStudying = () => {
    setCurrentIdx(0);
    setIsFlipped(false);
    setMastered(new Set());
    setReviewing(new Set());
    setFlashState('playing');
  };

  const markMastered = () => {
    setMastered((prev) => new Set(prev).add(currentIdx));
    setReviewing((prev) => {
      const next = new Set(prev);
      next.delete(currentIdx);
      return next;
    });
    if (currentIdx < cards.length - 1) {
      nextCard();
    } else {
      setFlashState('result');
    }
  };

  const markReview = () => {
    setReviewing((prev) => new Set(prev).add(currentIdx));
    setMastered((prev) => {
      const next = new Set(prev);
      next.delete(currentIdx);
      return next;
    });
    if (currentIdx < cards.length - 1) {
      nextCard();
    } else {
      setFlashState('result');
    }
  };

  const shuffleCards = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIdx(0);
    setIsFlipped(false);
  };

  const card = cards[currentIdx];
  const progressPct = cards.length > 0 ? ((currentIdx + 1) / cards.length) * 100 : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <AnimatePresence mode="wait">
        {flashState === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="border border-slate-200 bg-white rounded-xl p-8 sm:p-10 text-center shadow-xs"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <Layers size={24} />
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 mb-2">
              Document Study Flashcards
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mb-6 max-w-md mx-auto leading-relaxed">
              Master core terminology, definitions, and concepts with 3D interactive flashcards.
            </p>

            <div className="flex items-center justify-center gap-2 text-xs mb-8">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
                <Layers size={11} className="text-blue-600" /> 10 Flashcards
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
                <CheckCircle2 size={11} className="text-emerald-600" /> Active Recall
              </span>
            </div>

            <div className="flex flex-col gap-2.5 max-w-sm mx-auto">
              {hasExistingCards ? (
                <>
                  <Button
                    onClick={startStudying}
                    variant="primary"
                    size="md"
                    className="w-full justify-center gap-2"
                  >
                    <span>Study Deck ({cards.length} cards)</span>
                    <ArrowRight size={15} />
                  </Button>
                  <Button
                    onClick={generateFlashcards}
                    variant="outline"
                    size="sm"
                    className="w-full justify-center gap-2"
                  >
                    <RefreshCw size={13} />
                    <span>Regenerate Cards</span>
                  </Button>
                </>
              ) : (
                <Button
                  onClick={generateFlashcards}
                  variant="primary"
                  size="md"
                  className="w-full justify-center gap-2"
                >
                  <Sparkles size={15} />
                  <span>Generate Flashcards</span>
                  <ArrowRight size={15} />
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {flashState === 'loading' && (
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
              Extracting Core Concepts...
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Formulating spaced-repetition prompt and answer pairs from the document.
            </p>
          </motion.div>
        )}

        {flashState === 'playing' && card && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header progress */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#547792]">
                Card {currentIdx + 1} of {cards.length}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-[#2C665F] bg-[#ECF5F3] px-2 py-0.5 rounded border border-[#CADDE6]">
                  {mastered.size} mastered
                </span>
                <span className="text-[11px] font-medium text-[#7A5726] bg-[#FAF3E6] px-2 py-0.5 rounded border border-[#EAE0CF]">
                  {reviewing.size} review
                </span>
              </div>
            </div>

            <div className="w-full bg-[#F4EFE6] rounded-full h-1.5 mb-5 overflow-hidden border border-[#E2DBD0]">
              <motion.div
                className="h-full bg-[#213448] rounded-full"
                animate={{ width: `${progressPct}%` }}
                transition={{ ease: 'easeOut', duration: 0.25 }}
              />
            </div>

            {/* 3D Flip Card Container */}
            <div
              className="perspective-[1200px] mb-5 cursor-pointer select-none"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <motion.div
                className="relative w-full"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front Side */}
                <div
                  className="border border-[#E2DBD0] bg-white rounded-xl p-8 sm:p-12 min-h-[280px] flex flex-col items-center justify-center text-center shadow-xs hover:border-[#94B4C1] transition-colors"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <Badge color="blue" className="mb-6">
                    {card.category}
                  </Badge>
                  <p className="text-lg sm:text-2xl font-semibold text-[#213448] leading-relaxed max-w-md">
                    {card.front}
                  </p>
                  <p className="text-xs text-[#94B4C1] mt-6 flex items-center gap-1.5 font-medium">
                    <MousePointerClick size={13} /> Click or press Space to flip
                  </p>
                </div>

                {/* Back Side */}
                <div
                  className="border border-[#CADDE6] bg-[#FAF8F5] text-[#213448] rounded-xl p-8 sm:p-12 min-h-[280px] flex flex-col items-center justify-center text-center shadow-xs absolute inset-0"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <Badge color="slate" className="mb-6">
                    {card.category}
                  </Badge>
                  <p className="text-sm sm:text-base text-[#213448] leading-relaxed max-w-md">
                    {card.back}
                  </p>
                  <p className="text-xs text-[#94B4C1] mt-6 font-medium">
                    Assess your mastery below
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Answer Assessment Buttons (shown after flip) */}
            <AnimatePresence>
              {isFlipped && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="grid grid-cols-2 gap-3 mb-5"
                >
                  <Button
                    onClick={markMastered}
                    variant="success"
                    size="md"
                    className="justify-center gap-2"
                  >
                    <CheckCircle size={15} />
                    <span>Mastered</span>
                  </Button>
                  <Button
                    onClick={markReview}
                    variant="outline"
                    size="md"
                    className="justify-center gap-2"
                  >
                    <RefreshCw size={14} />
                    <span>Needs Review</span>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between">
              <Button
                onClick={prevCard}
                disabled={currentIdx === 0}
                variant="outline"
                size="sm"
                className="gap-1.5"
              >
                <ArrowLeft size={13} />
                <span>Previous</span>
              </Button>

              <button
                onClick={shuffleCards}
                className="p-2 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
                title="Shuffle deck"
                aria-label="Shuffle deck"
              >
                <Shuffle size={14} />
              </button>

              <Button
                onClick={nextCard}
                disabled={currentIdx === cards.length - 1}
                variant="outline"
                size="sm"
                className="gap-1.5"
              >
                <span>Next</span>
                <ArrowRight size={13} />
              </Button>
            </div>
          </motion.div>
        )}

        {flashState === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="border border-slate-200 bg-white rounded-xl p-8 sm:p-10 text-center shadow-xs"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <CheckCircle2 size={28} />
            </div>

            <h2 className="text-xl font-semibold tracking-tight text-slate-900 mb-1">
              Deck Completed
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              Review session summary:
            </p>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-8">
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-2xl font-bold text-emerald-700">{mastered.size}</span>
                <p className="text-xs font-medium text-emerald-800 mt-1">Mastered</p>
              </div>
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-center">
                <span className="text-2xl font-bold text-amber-700">{reviewing.size}</span>
                <p className="text-xs font-medium text-amber-800 mt-1">Needs Review</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 justify-center max-w-sm mx-auto">
              <Button onClick={startStudying} variant="primary" size="md" className="flex-1 justify-center gap-2">
                <RotateCcw size={14} />
                <span>Review Again</span>
              </Button>
              <Button onClick={generateFlashcards} variant="outline" size="md" className="flex-1 justify-center gap-2">
                <RefreshCw size={14} />
                <span>New Flashcards</span>
              </Button>
            </div>
          </motion.div>
        )}

        {flashState === 'error' && (
          <div className="max-w-md mx-auto">
            <ErrorState
              title={errorMsg.toLowerCase().includes('guest') || errorMsg.toLowerCase().includes('limit') ? "Guest Limit Reached" : "Flashcard Generation Error"}
              message={errorMsg}
              onRetry={generateFlashcards}
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
