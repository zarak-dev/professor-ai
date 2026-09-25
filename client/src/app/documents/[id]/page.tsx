'use client';

import React from 'react';
import Link from 'next/link';
import {
  MessageSquareText,
  BrainCircuit,
  Layers,
  Network,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function DocumentOverviewPage() {
  const { document, documentId, loading } = useWorkspace();

  const quickActions = [
    {
      title: 'Chat with Document',
      description: 'Ask questions, clarify difficult concepts, or request deep contextual explanations.',
      href: `/documents/${documentId}/chat`,
      icon: MessageSquareText,
      color: 'blue' as const,
      hasData: true,
      badgeText: 'Interactive Tutor',
    },
    {
      title: 'Practice Quiz',
      description: 'Test your retention and understanding with 5 automated multiple-choice questions.',
      href: `/documents/${documentId}/quiz`,
      icon: BrainCircuit,
      color: 'mint' as const,
      hasData: document?.hasQuiz,
      badgeText: document?.hasQuiz ? 'Quiz Ready' : 'Generate on Demand',
    },
    {
      title: 'Study Flashcards',
      description: 'Review key terms, definitions, and concepts with active-recall flip cards.',
      href: `/documents/${documentId}/flashcards`,
      icon: Layers,
      color: 'purple' as const,
      hasData: document?.hasFlashcards,
      badgeText: document?.hasFlashcards ? 'Cards Ready' : 'Generate on Demand',
    },
    {
      title: 'Concept Visualization',
      description: 'Explore topics, relationships, and conceptual connections across the document.',
      href: `/documents/${documentId}/visualize`,
      icon: Network,
      color: 'peach' as const,
      hasData: document?.hasVisualization,
      badgeText: document?.hasVisualization ? 'Map Ready' : 'Generate on Demand',
    },
  ];

  if (loading) {
    return (
      <main className="py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="border border-slate-200 bg-white rounded-xl p-6 sm:p-7 mb-8 shadow-xs">
            <Skeleton className="w-40 h-5 mb-4" />
            <Skeleton className="w-full h-4 mb-2" />
            <Skeleton className="w-5/6 h-4 mb-2" />
            <Skeleton className="w-4/6 h-4" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border border-slate-200 bg-white rounded-xl p-5 h-44 flex flex-col justify-between shadow-xs">
                <div>
                  <Skeleton className="w-9 h-9 rounded-lg mb-3" />
                  <Skeleton className="w-3/4 h-5 mb-2" />
                  <Skeleton className="w-full h-3.5" />
                </div>
                <Skeleton className="w-20 h-4" />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Document Executive Summary Card */}
        <div className="border border-slate-200 bg-white rounded-xl p-6 sm:p-7 mb-8 shadow-xs">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Sparkles size={16} />
              </div>
              <h2 className="text-base font-semibold text-slate-900 tracking-tight">
                AI Executive Summary
              </h2>
            </div>
            <Badge color="mint" className="hidden sm:inline-flex">
              <CheckCircle2 size={11} className="text-emerald-600" />
              <span>Ready for Study</span>
            </Badge>
          </div>

          {document?.summary ? (
            <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap pl-3.5 border-l-2 border-blue-600">
              {document.summary}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">
              No summary available for this document. Explore the study tools below to begin.
            </p>
          )}
        </div>

        {/* Study Tools Grid */}
        <div>
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">Study Tools</h2>
            <p className="text-xs text-slate-500">
              Choose an interactive mode to study and retain concepts from this document
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="block group select-none"
                >
                  <Card interactive className="h-full p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200/60 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          <Icon size={18} />
                        </div>
                        <Badge color={action.color} className="text-[10px]">
                          {action.hasData ? (
                            <CheckCircle2 size={10} className="text-emerald-600" />
                          ) : (
                            <Clock size={10} />
                          )}
                          <span>{action.badgeText}</span>
                        </Badge>
                      </div>

                      <h3 className="text-sm font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {action.description}
                      </p>
                    </div>

                    <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-500 group-hover:text-slate-900 transition-colors">
                        Launch Tool
                      </span>
                      <ArrowRight size={13} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
