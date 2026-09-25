'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { DocumentItem } from '@/types';
import { Button } from '@/components/ui/button';

type UploadState = 'idle' | 'dragging' | 'uploading' | 'success' | 'error';

export default function PdfUploader() {
  const router = useRouter();
  const [state, setState] = useState<UploadState>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [createdDocument, setCreatedDocument] = useState<DocumentItem | null>(null);
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated } = useAuth();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState('dragging');
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState('idle');
  }, []);

  const validateFile = (f: File): string | null => {
    if (f.type !== 'application/pdf') return 'Only PDF files are accepted.';
    if (f.size > 20 * 1024 * 1024) return 'File must be smaller than 20MB.';
    return null;
  };

  const uploadFile = async (f: File) => {
    if (!isAuthenticated) {
      router.push('/sign-in');
      return;
    }

    setState('uploading');
    setProgress(0);
    setFile(f);
    setError('');
    setCreatedDocument(null);

    const formData = new FormData();
    formData.append('file', f);

    try {
      const res = await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
        },
      });

      const doc = res.data.document;
      setCreatedDocument(doc);
      setState('success');

      // Auto-navigate to the new document workspace after 1 second
      setTimeout(() => {
        router.push(`/documents/${doc._id}`);
      }, 1200);

    } catch (err: any) {
      console.error('Upload Error:', err);
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Upload failed. Please try again.';
      setError(msg);
      setState('error');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (!f) return;
    const validationError = validateFile(f);
    if (validationError) {
      setError(validationError);
      setState('error');
      return;
    }
    uploadFile(f);
  }, [isAuthenticated]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const validationError = validateFile(f);
    if (validationError) {
      setError(validationError);
      setState('error');
      return;
    }
    uploadFile(f);
  };

  const reset = () => {
    setState('idle');
    setFile(null);
    setCreatedDocument(null);
    setError('');
    setProgress(0);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleChange}
        id="pdf-input"
      />

      <AnimatePresence mode="wait">
        {(state === 'idle' || state === 'dragging') && (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-3 border-dashed rounded-3xl p-8 sm:p-14 text-center cursor-pointer transition-all duration-200 select-none ${
              state === 'dragging'
                ? 'border-primary bg-primary/10 scale-[1.01]'
                : 'border-border bg-card/60 hover:bg-card hover:border-foreground'
            }`}
          >
            <div className="mx-auto icon-circle !w-16 !h-16 bg-primary/20 mb-6 group-hover:scale-110 transition-transform">
              <Upload size={28} className="text-foreground" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black mb-2">
              {state === 'dragging' ? 'Drop your PDF here' : 'Drop your PDF here, or browse'}
            </h3>

            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Upload textbook chapters, research papers, study notes, or slides (up to 20MB).
            </p>

            <span className="btn-primary pointer-events-none inline-flex items-center gap-2">
              <FileText size={16} />
              Choose PDF File
            </span>
          </motion.div>
        )}

        {state === 'uploading' && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="bento-card-static !p-8 sm:!p-12 text-center"
          >
            <div className="mx-auto icon-circle !w-16 !h-16 bg-primary/20 mb-6">
              <Loader2 size={30} className="animate-spin text-foreground" />
            </div>

            <h3 className="text-xl font-black mb-1">Processing Document</h3>
            <p className="text-sm text-muted-foreground mb-6 flex items-center justify-center gap-1.5">
              <FileText size={14} />
              {file?.name}
            </p>

            <div className="w-full bg-muted rounded-full h-3 mb-2 overflow-hidden border border-border">
              <motion.div
                className="bg-primary h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: 'easeOut' as const }}
              />
            </div>
            <p className="text-xs font-bold text-muted-foreground">{progress}%</p>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Sparkles size={13} className="text-primary" />
              Extracting text and generating smart summary...
            </div>
          </motion.div>
        )}

        {state === 'success' && createdDocument && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="bento-card-static !p-6 sm:!p-8"
          >
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="icon-circle bg-[var(--bg-mint)]">
                  <CheckCircle size={20} className="text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-black">Document Ready!</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <FileText size={12} />
                    {createdDocument.file_name}
                  </p>
                </div>
              </div>
              <button
                onClick={reset}
                className="p-2 rounded-xl border-2 border-border bg-card hover:bg-muted transition-all"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>

            {createdDocument.summary && (
              <div className="bento-card-static !bg-muted/40 !p-4 mb-5 border-border/60">
                <p className="label-text mb-2 flex items-center gap-1.5">
                  <Sparkles size={11} className="text-primary" /> AI Summary Preview
                </p>
                <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                  {createdDocument.summary}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Loader2 size={12} className="animate-spin" /> Redirecting to workspace...
              </span>

              <Link href={`/documents/${createdDocument._id}`} className="w-full sm:w-auto">
                <Button variant="primary" className="w-full sm:w-auto text-xs flex items-center gap-2">
                  <span>Open Workspace Now</span>
                  <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {state === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="bento-card-static !p-8 sm:!p-10 text-center"
          >
            <div className="mx-auto icon-circle !w-14 !h-14 bg-[var(--bg-pink)] mb-5">
              <AlertCircle size={24} className="text-red-700" />
            </div>
            <h3 className="text-xl font-black mb-2">Upload Failed</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">{error}</p>
            <Button onClick={reset} variant="primary">
              Try Again
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
