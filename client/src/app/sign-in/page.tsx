'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LogIn, UserPlus, Loader2, AlertCircle, Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function SignInPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
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
      router.push('/');
    } catch (err: any) {
      console.error("Auth Error details:", err?.response?.data || err);
      const msg =
        err?.response?.data?.error || err?.message || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 pt-24 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bento-card-static !p-8">
          <div className="text-center mb-8">
            <div className="mx-auto icon-circle !w-16 !h-16 bg-primary/20 mb-4">
              {mode === 'login' ? <LogIn size={24} /> : <UserPlus size={24} />}
            </div>
            <h1 className="text-2xl font-black mb-1">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === 'login'
                ? 'Sign in to access your documents'
                : 'Join The Professor to start learning'}
            </p>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 border-foreground transition-all ${
                mode === 'login'
                  ? 'bg-primary shadow-[2px_2px_0px_0px_var(--foreground)]'
                  : 'bg-card hover:bg-primary/20'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 border-foreground transition-all ${
                mode === 'register'
                  ? 'bg-primary shadow-[2px_2px_0px_0px_var(--foreground)]'
                  : 'bg-card hover:bg-primary/20'
              }`}
            >
              Register
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mb-4 p-3 rounded-xl border-2 border-foreground flex items-center gap-2 text-sm font-bold ${
                  error.includes('successful') 
                    ? 'bg-primary' 
                    : 'bg-[var(--bg-pink)]'
                }`}
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="label-text mb-1.5 flex items-center gap-1.5">
                    <User size={12} /> Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-foreground bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="Your name"
                    required={mode === 'register'}
                    id="auth-name-input"
                    autoComplete="name"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="label-text mb-1.5 flex items-center gap-1.5">
                <Mail size={12} /> Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-foreground bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                placeholder="you@example.com"
                required
                id="auth-email-input"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label-text mb-1.5 flex items-center gap-1.5">
                <Lock size={12} /> Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-foreground bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                placeholder={mode === 'register' ? 'Min 6 characters' : '••••••••'}
                required
                minLength={mode === 'register' ? 6 : undefined}
                id="auth-password-input"
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center !py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
              id="auth-submit-btn"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}
