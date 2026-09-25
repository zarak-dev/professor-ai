'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Calendar, Sparkles } from 'lucide-react';
import { WorkspaceProvider, useWorkspace } from '@/context/WorkspaceContext';
import { WorkspaceNav } from '@/components/layout/workspace-nav';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';

function WorkspaceHeader() {
  const { document, documentId, loading, error, refreshDocument } = useWorkspace();

  if (error) {
    return (
      <div className="container-page">
        <div className="wrapper max-w-xl mx-auto pt-10">
          <ErrorState
            title="Document Access Error"
            message={error}
            onRetry={refreshDocument}
          />
          <div className="text-center mt-6">
            <Link href="/documents" className="btn-secondary text-sm inline-flex items-center gap-2">
              <ArrowLeft size={16} />
              <span>Back to My Documents</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="border-b-2 border-border bg-card/40 backdrop-blur-sm pt-20 pb-4">
        <div className="wrapper">
          <div className="mb-3">
            <Link
              href="/documents"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              <span>All Documents</span>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="icon-circle bg-primary/20 shrink-0 !w-12 !h-12">
                <FileText size={22} className="text-foreground" />
              </div>
              <div>
                {loading ? (
                  <>
                    <Skeleton className="w-56 h-6 rounded-md mb-1.5" />
                    <Skeleton className="w-32 h-4 rounded-md" />
                  </>
                ) : (
                  <>
                    <h1 className="text-xl sm:text-2xl font-black truncate max-w-xl" title={document?.file_name}>
                      {document?.file_name || 'Document'}
                    </h1>
                    <p className="text-xs text-muted-foreground flex items-center gap-2 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {document?.createdAt
                          ? new Date(document.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : ''}
                      </span>
                      <span>•</span>
                      <span className="text-primary font-bold inline-flex items-center gap-1">
                        <Sparkles size={11} /> AI Ready
                      </span>
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <WorkspaceNav documentId={documentId} />
    </>
  );
}

function WorkspaceContent({ children }: { children: React.ReactNode }) {
  const { error } = useWorkspace();
  if (error) {
    return null;
  }
  return <div className="flex-1">{children}</div>;
}

export default function DocumentWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <WorkspaceHeader />
        <WorkspaceContent>{children}</WorkspaceContent>
      </div>
    </WorkspaceProvider>
  );
}
