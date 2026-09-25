'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FileText, Inbox, Sparkles, Plus } from 'lucide-react';
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
      <main className="container-page flex items-center justify-center">
        <EmptyState
          icon={<Inbox size={32} className="text-muted-foreground" />}
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
    <main className="container-page">
      <div className="wrapper">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="label-text mb-2 text-primary flex items-center gap-1.5">
              <Sparkles size={14} /> Document Library
            </p>
            <h1 className="page-title">My Documents</h1>
          </div>
          <Link href="/upload">
            <Button variant="primary" className="!text-sm flex items-center gap-2">
              <Plus size={16} />
              <span>Upload Document</span>
            </Button>
          </Link>
        </div>

        {error ? (
          <ErrorState
            title="Could not load documents"
            message={error}
            onRetry={fetchDocuments}
            className="max-w-md mx-auto my-12"
          />
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bento-card-static !p-6 flex flex-col h-60 justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <Skeleton className="w-24 h-5 rounded-full" />
                  </div>
                  <Skeleton className="w-3/4 h-6 rounded-md mb-3" />
                  <Skeleton className="w-full h-4 rounded-md mb-2" />
                  <Skeleton className="w-2/3 h-4 rounded-md" />
                </div>
                <div className="pt-4 border-t border-border/20 flex justify-between items-center">
                  <Skeleton className="w-20 h-4 rounded-full" />
                  <Skeleton className="w-14 h-4 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <DocumentCard key={doc._id} document={doc} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<FileText size={32} className="text-muted-foreground" />}
            title="No Documents Uploaded Yet"
            description="Upload your lecture notes, textbook chapters, or study guides to unlock interactive AI tutoring."
            actionText="Upload Your First Document"
            actionHref="/upload"
            className="max-w-xl mx-auto my-8 !py-16"
          />
        )}
      </div>
    </main>
  );
}
