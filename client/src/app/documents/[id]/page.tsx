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
  FileCheck,
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
      description: 'Ask questions, clarify complex concepts, or request deep explanations.',
      href: `/documents/${documentId}/chat`,
      icon: MessageSquareText,
      color: 'mint' as const,
      hasData: false,
      badgeText: 'Interactive Tutor',
    },
    {
      title: 'Practice Quiz',
      description: 'Test your understanding with 5 multiple-choice questions.',
      href: `/documents/${documentId}/quiz`,
      icon: BrainCircuit,
      color: 'pink' as const,
      hasData: document?.hasQuiz,
      badgeText: document?.hasQuiz ? 'Quiz Ready' : 'Generate on Demand',
    },
    {
      title: 'Study Flashcards',
      description: 'Review key terms, definitions, and concepts with 3D flip cards.',
      href: `/documents/${documentId}/flashcards`,
      icon: Layers,
      color: 'purple' as const,
      hasData: document?.hasFlashcards,
      badgeText: document?.hasFlashcards ? 'Cards Ready' : 'Generate on Demand',
    },
    {
      title: 'Concept Visualization',
      description: 'Explore topics, relationships, and conceptual connections in your document.',
      href: `/documents/${documentId}/visualize`,
      icon: Network,
      color: 'blue' as const,
      hasData: document?.hasVisualization,
      badgeText: document?.hasVisualization ? 'Map Ready' : 'Generate on Demand',
    },
  ];

  if (loading) {
    return (
      <main className="py-8">
        <div className="wrapper max-w-5xl">
          <div className="bento-card-static !p-8 mb-8">
            <Skeleton className="w-40 h-6 mb-4" />
            <Skeleton className="w-full h-4 mb-2" />
            <Skeleton className="w-5/6 h-4 mb-2" />
            <Skeleton className="w-4/6 h-4" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bento-card-static !p-6 h-48 flex flex-col justify-between">
                <div>
                  <Skeleton className="w-12 h-12 rounded-full mb-3" />
                  <Skeleton className="w-3/4 h-5 mb-2" />
                  <Skeleton className="w-full h-4" />
                </div>
                <Skeleton className="w-24 h-4" />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="py-8">
      <div className="wrapper max-w-5xl">
        {/* Document Summary Card */}
        <div className="bento-card-static !p-6 sm:!p-8 mb-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="icon-circle bg-primary/20 !w-8 !h-8">
                <Sparkles size={16} className="text-foreground" />
              </div>
              <h2 className="text-lg font-black tracking-tight">AI Executive Summary</h2>
            </div>
            <Badge color="yellow" className="hidden sm:inline-flex">
              <FileCheck size={12} /> Ready for Study
            </Badge>
          </div>

          {document?.summary ? (
            <div className="text-sm sm:text-base leading-relaxed text-foreground/90 whitespace-pre-wrap pl-2 border-l-2 border-primary">
              {document.summary}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No summary available for this document. Explore the study tools below.
            </p>
          )}
        </div>

        {/* Study Tools Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-black mb-1">Study Tools</h2>
          <p className="text-xs text-muted-foreground mb-6">
            Select an interactive mode to study and master this document
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="block group select-none"
                >
                  <Card interactive className="h-full !p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-4">
                        <div className="icon-circle bg-primary/10 group-hover:bg-primary/30 transition-colors">
                          <Icon size={20} className="text-foreground" />
                        </div>
                        <Badge color={action.color} className="!text-[10px]">
                          {action.hasData ? (
                            <CheckCircle2 size={10} className="text-green-600" />
                          ) : (
                            <Clock size={10} />
                          )}
                          <span>{action.badgeText}</span>
                        </Badge>
                      </div>

                      <h3 className="text-lg font-black mb-1.5 group-hover:text-primary transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {action.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-border/30 flex items-center justify-between text-xs font-bold">
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                        Launch Tool
                      </span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
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
