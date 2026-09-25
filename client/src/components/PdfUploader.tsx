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
import { api, getErrorMessage } from '@/lib/api';
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
    if (f.type !== 'application/pdf') return 'Only standard PDF documents are supported.';
    if (f.size > 20 * 1024 * 1024) return 'File size exceeds maximum 20MB limit.';
    return null;
  };

  const uploadFile = useCallback(async (f: File) => {
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

      // Auto-navigate to the new document workspace
      setTimeout(() => {
        router.push(`/documents/${doc._id}`);
      }, 1200);

    } catch (err: unknown) {
      console.error('Upload Error:', err);
      const msg = getErrorMessage(err, 'Failed to upload document. Please try again.');
      setError(msg);
      setState('error');
    }
  }, [isAuthenticated, router]);

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
  }, [uploadFile]);

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
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 select-none bg-white shadow-xs ${
              state === 'dragging'
                ? 'border-blue-600 bg-blue-50/50 scale-[1.01]'
                : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50/60'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <Upload size={22} />
            </div>

            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1">
              {state === 'dragging' ? 'Drop PDF to upload' : 'Click to upload or drag and drop'}
            </h3>

            <p className="text-xs text-slate-500 mb-5 max-w-sm mx-auto">
              PDF documents up to 20MB. Lecture slides, research papers, study notes, or reports.
            </p>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="pointer-events-none"
            >
              <FileText size={14} className="mr-1.5 text-slate-400" />
              Select PDF File
            </Button>
          </motion.div>
        )}

        {state === 'uploading' && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="border border-slate-200 bg-white rounded-xl p-8 sm:p-10 text-center shadow-xs"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <Loader2 size={24} className="animate-spin" />
            </div>

            <h3 className="text-base font-semibold text-slate-900 mb-1">
              Processing Document
            </h3>
            <p className="text-xs text-slate-500 mb-5 flex items-center justify-center gap-1.5">
              <FileText size={13} className="text-slate-400" />
              <span className="font-medium text-slate-700">{file?.name}</span>
            </p>

            <div className="w-full max-w-md mx-auto bg-slate-100 rounded-full h-2 mb-2 overflow-hidden border border-slate-200/60">
              <motion.div
                className="bg-blue-600 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: 'easeOut' }}
              />
            </div>
            <p className="text-xs font-semibold text-slate-600 mb-4">{progress}%</p>

            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
              <Sparkles size={13} className="text-blue-600" />
              <span>Extracting text and generating smart executive summary...</span>
            </div>
          </motion.div>
        )}

        {state === 'success' && createdDocument && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="border border-slate-200 bg-white rounded-xl p-6 sm:p-8 shadow-xs"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Document Ready</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <FileText size={12} className="text-slate-400" />
                    <span>{createdDocument.file_name}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={reset}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>

            {createdDocument.summary && (
              <div className="bg-slate-50 rounded-lg p-4 mb-5 border border-slate-200/80">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-blue-600" /> AI Executive Summary
                </p>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap line-clamp-4">
                  {createdDocument.summary}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <Loader2 size={13} className="animate-spin text-blue-600" />
                <span>Redirecting to workspace...</span>
              </span>

              <Link href={`/documents/${createdDocument._id}`} className="w-full sm:w-auto">
                <Button variant="primary" size="sm" className="w-full sm:w-auto gap-1.5">
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
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="border border-red-200 bg-white rounded-xl p-8 text-center shadow-xs"
          >
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">Upload Failed</h3>
            <p className="text-xs text-slate-600 mb-6 max-w-sm mx-auto leading-relaxed">{error}</p>
            <Button onClick={reset} variant="primary" size="sm">
              Try Again
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
