'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Calendar, CheckCircle2 } from 'lucide-react';
import { WorkspaceProvider, useWorkspace } from '@/context/WorkspaceContext';
import { WorkspaceNav } from '@/components/layout/workspace-nav';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { Button } from '@/components/ui/button';

function WorkspaceHeader() {
  const { document, documentId, loading, error, refreshDocument } = useWorkspace();

  if (error) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] pt-20 pb-16 bg-slate-50">
        <div className="max-w-xl mx-auto px-4 pt-10">
          <ErrorState
            title="Document Access Error"
            message={error}
            onRetry={refreshDocument}
          />
          <div className="text-center mt-6">
            <Link href="/documents">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft size={14} />
                <span>Back to My Documents</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="border-b border-slate-200 bg-white pt-18 pb-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <div className="mb-3">
            <Link
              href="/documents"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors group"
            >
              <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>All Documents</span>
            </Link>
          </div>

          {/* Document Header Details */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <FileText size={20} />
              </div>
              <div className="min-w-0">
                {loading ? (
                  <>
                    <Skeleton className="w-56 h-6 rounded-md mb-1.5" />
                    <Skeleton className="w-32 h-4 rounded-md" />
                  </>
                ) : (
                  <>
                    <h1
                      className="text-base sm:text-xl font-semibold text-slate-900 truncate max-w-xl"
                      title={document?.file_name}
                    >
                      {document?.file_name || 'Document Workspace'}
                    </h1>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 font-medium flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-slate-400" />
                        {document?.createdAt
                          ? new Date(document.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : ''}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
                        <CheckCircle2 size={11} className="text-emerald-600" />
                        AI Ready
                      </span>
                    </div>
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
      <div className="min-h-screen flex flex-col bg-slate-50">
        <WorkspaceHeader />
        <WorkspaceContent>{children}</WorkspaceContent>
      </div>
    </WorkspaceProvider>
  );
}
