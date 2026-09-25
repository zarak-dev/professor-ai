'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/lib/api';
import { LogIn, UserPlus, Loader2, AlertCircle, Mail, Lock, User, ArrowRight, GraduationCap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

function SignInForm() {
  const searchParams = useSearchParams();
  const isClaiming = searchParams.get('claim') === 'true';

  const [mode, setMode] = useState<'login' | 'register'>(isClaiming ? 'register' : 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, claimGuestDocument } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        const message = await register(name, email, password);
        if (message) {
          setError(message);
          setLoading(false);
          return;
        }
      } else {
        await login(email, password);
      }

      // Check if there is a pending guest document to claim
      const claimedDocId = await claimGuestDocument();
      if (claimedDocId) {
        router.push(`/documents/${claimedDocId}`);
      } else {
        router.push('/documents');
      }
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Authentication failed. Please verify your credentials.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 pt-16 pb-12 bg-slate-50">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="border border-slate-200 bg-white shadow-sm rounded-xl p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 border border-blue-100">
              <GraduationCap size={20} />
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 mb-1">
              {mode === 'login' ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {mode === 'login'
                ? 'Sign in to access your document workspace'
                : 'Get started with The Professor AI workspace'}
            </p>
          </div>

          {isClaiming && (
            <div className="mb-6 p-3 rounded-lg bg-blue-50 border border-blue-200/80 text-xs text-blue-800 flex items-start gap-2.5">
              <Sparkles size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>Save Your Work:</strong> Register or sign in below to permanently save your guest document, quizzes, and flashcards to your account.
              </span>
            </div>
          )}

          {/* Segmented Mode Selector */}
          <div className="grid grid-cols-2 p-1 rounded-lg bg-slate-100 mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`py-2 text-xs sm:text-sm font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`py-2 text-xs sm:text-sm font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus size={14} />
              <span>Register</span>
            </button>
          </div>

          {/* Error / Feedback Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mb-4 p-3 rounded-lg border text-xs font-medium flex items-center gap-2 ${
                  error.includes('successful')
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <User size={13} className="text-slate-400" /> Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    placeholder="Jane Doe"
                    required={mode === 'register'}
                    id="auth-name-input"
                    autoComplete="name"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Mail size={13} className="text-slate-400" /> Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                placeholder="name@example.com"
                required
                id="auth-email-input"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Lock size={13} className="text-slate-400" /> Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                placeholder={mode === 'register' ? 'Minimum 6 characters' : '••••••••'}
                required
                minLength={mode === 'register' ? 6 : undefined}
                id="auth-password-input"
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              size="lg"
              className="w-full justify-center mt-2"
              id="auth-submit-btn"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight size={15} />
                </>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-slate-50">
          <div className="w-7 h-7 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        </div>
      }
    >
      <SignInForm />
    </React.Suspense>
  );
}
