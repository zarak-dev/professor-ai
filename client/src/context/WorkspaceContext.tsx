'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, getErrorMessage } from '@/lib/api';
import { DocumentItem } from '@/types';
import { useAuth } from './AuthContext';

interface WorkspaceContextType {
  document: DocumentItem | null;
  documentId: string;
  loading: boolean;
  error: string | null;
  refreshDocument: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const documentId = (params?.id as string) || '';
  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, loading: authLoading } = useAuth();

  const fetchDocument = useCallback(async () => {
    if (!documentId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/documents/${documentId}`);
      setDocument(res.data.document);
    } catch (err: unknown) {
      console.error('Failed to load document:', err);
      const msg = getErrorMessage(err, 'Document could not be loaded');
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/sign-in');
      } else if (documentId) {
        fetchDocument();
      }
    }
  }, [documentId, isAuthenticated, authLoading, router, fetchDocument]);

  return (
    <WorkspaceContext.Provider
      value={{
        document,
        documentId,
        loading,
        error,
        refreshDocument: fetchDocument,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
