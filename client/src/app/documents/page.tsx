'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FileText, Inbox, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api, getErrorMessage } from '@/lib/api';
import { DocumentItem } from '@/types';
import { DocumentCard } from '@/components/features/documents/document-card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Button } from '@/components/ui/button';

export default function DocumentsDashboard() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, loading: authLoading } = useAuth();

  const fetchDocuments = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.get('/documents');
      setDocuments(res.data.documents || []);
    } catch (err: unknown) {
      console.error('Failed to fetch documents:', err);
      setError(getErrorMessage(err, 'Failed to load your documents'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchDocuments();
      } else {
        setLoading(false);
      }
    }
  }, [isAuthenticated, authLoading, fetchDocuments]);

  if (!isAuthenticated && !authLoading) {
    return (
      <main className="min-h-[calc(100vh-3.5rem)] pt-20 pb-16 flex items-center justify-center px-4 bg-slate-50">
        <EmptyState
          icon={<Inbox size={26} className="text-slate-500" />}
          title="Sign in to view your documents"
          description="Access your personalized AI tutor, study materials, quizzes, and flashcards."
          actionText="Sign In"
          actionHref="/sign-in"
          className="max-w-md w-full"
        />
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-3.5rem)] pt-20 pb-16 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Documents
              </h1>
              {!loading && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                  {documents.length}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage, review, and study your uploaded PDF documents.
            </p>
          </div>

          <Link href="/upload">
            <Button variant="primary" size="md" className="gap-1.5 shadow-xs">
              <Plus size={15} />
              <span>Upload Document</span>
            </Button>
          </Link>
        </div>

        {/* Content Area */}
        {error ? (
          <ErrorState
            title="Could not load documents"
            message={error}
            onRetry={fetchDocuments}
            className="max-w-md mx-auto my-12"
          />
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="border border-slate-200 bg-white rounded-xl p-5 flex flex-col h-52 justify-between shadow-xs"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Skeleton className="w-9 h-9 rounded-lg" />
                    <Skeleton className="w-20 h-4 rounded-md" />
                  </div>
                  <Skeleton className="w-3/4 h-5 rounded-md mb-2.5" />
                  <Skeleton className="w-full h-3.5 rounded-md mb-1.5" />
                  <Skeleton className="w-2/3 h-3.5 rounded-md" />
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                  <Skeleton className="w-16 h-4 rounded-md" />
                  <Skeleton className="w-14 h-4 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {documents.map((doc) => (
              <DocumentCard key={doc._id} document={doc} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<FileText size={26} className="text-slate-500" />}
            title="No documents uploaded yet"
            description="Upload research papers, lecture notes, or textbooks to unlock conversational AI tutoring and automated quizzes."
            actionText="Upload Your First Document"
            actionHref="/upload"
            className="max-w-lg mx-auto my-8 py-16 bg-white"
          />
        )}
      </div>
    </main>
  );
}
