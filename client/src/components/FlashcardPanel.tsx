'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import { api } from '@/lib/api';
import { Flashcard } from '@/types';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';

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
    } catch (err: any) {
      if (err?.response?.status === 404) {
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
  }, [flashState, currentIdx, cards.length]);

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
    } catch (err: any) {
      console.error('Flashcard Generation Error:', err);
      const msg =
        err?.response?.data?.error?.message ||
        err?.message ||
        'Failed to generate flashcards. Please try again.';
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

  const nextCard = () => {
    if (currentIdx < cards.length - 1) {
      setCurrentIdx((i) => i + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentIdx > 0) {
      setCurrentIdx((i) => i - 1);
      setIsFlipped(false);
    }
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

  const categoryColors: Record<string, string> = {};
  const colorPool = ['tag-yellow', 'tag-mint', 'tag-pink', 'tag-purple', 'tag-peach', 'tag-blue'];
  cards.forEach((c) => {
    if (!categoryColors[c.category]) {
      categoryColors[c.category] = colorPool[Object.keys(categoryColors).length % colorPool.length];
    }
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <AnimatePresence mode="wait">
        {flashState === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="bento-card-static !p-8 sm:!p-12 text-center"
          >
            <div className="icon-circle bg-primary/20 !w-16 !h-16 mx-auto mb-6">
              <Layers size={28} className="text-foreground" />
            </div>
            <h2 className="text-2xl font-black mb-3">Document Study Flashcards</h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Master core terminology, definitions, and concepts with 3D interactive flashcards.
            </p>
            <div className="flex items-center justify-center gap-3 text-xs mb-8">
              <span className="tag tag-purple">
                <Layers size={10} /> 10 Flashcards
              </span>
              <span className="tag tag-mint">
                <CheckCircle size={10} /> Active Recall
              </span>
            </div>

            <div className="flex flex-col gap-3 max-w-sm mx-auto">
              {hasExistingCards ? (
                <>
                  <Button
                    onClick={startStudying}
                    variant="primary"
                    size="lg"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <span>Study Saved Cards ({cards.length})</span>
                    <ArrowRight size={16} />
                  </Button>
                  <Button
                    onClick={generateFlashcards}
                    variant="secondary"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={14} />
                    <span>Regenerate New Cards</span>
                  </Button>
                </>
              ) : (
                <Button
                  onClick={generateFlashcards}
                  variant="primary"
                  size="lg"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} />
                  <span>Generate Flashcards</span>
                  <ArrowRight size={16} />
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {flashState === 'loading' && (
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
            <h3 className="text-xl font-black mb-2">Crafting Flashcards...</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Extracting core definitions and key learning points from your document.
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
            <div className="flex items-center justify-between mb-3">
              <span className="label-text">
                Card {currentIdx + 1} of {cards.length}
              </span>
              <div className="flex items-center gap-2">
                <span className="tag tag-mint text-[10px]">
                  <CheckCircle size={10} /> {mastered.size} mastered
                </span>
                <span className="tag tag-pink text-[10px]">
                  <RefreshCw size={10} /> {reviewing.size} review
                </span>
              </div>
            </div>

            <div className="w-full bg-muted rounded-full h-2 mb-5 border border-border overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                animate={{ width: `${progressPct}%` }}
                transition={{ ease: 'easeOut', duration: 0.3 }}
              />
            </div>

            {/* 3D Flip Card */}
            <div
              className="perspective-[1200px] mb-5 cursor-pointer select-none"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <motion.div
                className="relative w-full"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front Side */}
                <div
                  className="bento-card-static !p-8 sm:!p-12 min-h-[280px] flex flex-col items-center justify-center text-center border-2 border-border shadow-[4px_4px_0px_0px_var(--border-color)]"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <span className={`tag ${categoryColors[card.category] || 'tag-purple'} text-[10px] mb-6`}>
                    {card.category}
                  </span>
                  <p className="text-xl sm:text-2xl font-black leading-relaxed max-w-md">{card.front}</p>
                  <p className="text-xs text-muted-foreground mt-6 flex items-center gap-1.5 font-bold">
                    <MousePointerClick size={14} /> Tap or press Space to flip
                  </p>
                </div>

                {/* Back Side */}
                <div
                  className="bento-card-static !p-8 sm:!p-12 min-h-[280px] flex flex-col items-center justify-center text-center absolute inset-0 border-2 border-border shadow-[4px_4px_0px_0px_var(--border-color)] bg-[var(--bg-mint)] text-black"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <span className="tag text-[10px] mb-6 bg-card text-foreground">
                    {card.category}
                  </span>
                  <p className="text-base sm:text-lg font-bold leading-relaxed max-w-md text-black">{card.back}</p>
                  <p className="text-xs text-black/60 mt-6 font-bold">
                    Mark your mastery below
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Answer buttons shown after flip */}
            <AnimatePresence>
              {isFlipped && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="grid grid-cols-2 gap-3 mb-5"
                >
                  <Button
                    onClick={markMastered}
                    variant="secondary"
                    className="!bg-[var(--bg-mint)] text-black justify-center text-sm py-3"
                  >
                    <CheckCircle size={16} />
                    <span>Got it! (Mastered)</span>
                  </Button>
                  <Button
                    onClick={markReview}
                    variant="secondary"
                    className="!bg-[var(--bg-pink)] text-black justify-center text-sm py-3"
                  >
                    <RefreshCw size={16} />
                    <span>Needs Review</span>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation controls */}
            <div className="flex items-center justify-between">
              <Button
                onClick={prevCard}
                disabled={currentIdx === 0}
                variant="secondary"
                size="sm"
                className="disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={14} />
                <span>Previous</span>
              </Button>

              <div className="flex items-center gap-2">
                <button
                  onClick={shuffleCards}
                  className="p-2.5 rounded-xl border-2 border-border bg-card hover:bg-muted transition-all"
                  title="Shuffle deck"
                  aria-label="Shuffle deck"
                >
                  <Shuffle size={14} />
                </button>
              </div>

              <Button
                onClick={nextCard}
                disabled={currentIdx === cards.length - 1}
                variant="secondary"
                size="sm"
                className="disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ArrowRight size={14} />
              </Button>
            </div>
          </motion.div>
        )}

        {flashState === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bento-card-static !p-8 sm:!p-12 text-center"
          >
            <div className="text-5xl mb-4 select-none">🎉</div>
            <h2 className="text-2xl font-black mb-2">Deck Completed!</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Great study session! Here is your retention breakdown:
            </p>

            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
              <div className="bento-card-static !p-4 !bg-[var(--bg-mint)]/30 border-green-600/30">
                <span className="text-2xl font-black text-green-700 dark:text-green-400">{mastered.size}</span>
                <p className="text-xs font-bold text-muted-foreground mt-1">Mastered</p>
              </div>
              <div className="bento-card-static !p-4 !bg-[var(--bg-pink)]/30 border-red-600/30">
                <span className="text-2xl font-black text-red-700 dark:text-red-400">{reviewing.size}</span>
                <p className="text-xs font-bold text-muted-foreground mt-1">Needs Review</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
              <Button onClick={startStudying} variant="primary" className="flex-1 flex items-center justify-center gap-2">
                <RotateCcw size={16} />
                <span>Review Again</span>
              </Button>
              <Button onClick={generateFlashcards} variant="secondary" className="flex-1 flex items-center justify-center gap-2">
                <RefreshCw size={14} />
                <span>New Flashcards</span>
              </Button>
            </div>
          </motion.div>
        )}

        {flashState === 'error' && (
          <ErrorState
            title="Flashcard Generation Error"
            message={errorMsg}
            onRetry={generateFlashcards}
            className="max-w-md mx-auto"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
