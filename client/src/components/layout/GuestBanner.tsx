'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Clock, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GuestBannerProps {
  documentId: string;
}

export function GuestBanner({ documentId }: GuestBannerProps) {
  return (
    <div className="bg-gradient-to-r from-[#EAE0CF]/40 via-[#94B4C1]/20 to-[#FAF8F5] border-b border-[#E2DBD0] px-4 py-2.5">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#213448]">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EAE0CF] text-[#213448] font-semibold border border-[#D8CBB7] shrink-0">
            <Clock size={11} className="text-[#547792]" />
            Guest Mode
          </span>
          <span className="text-[#547792] font-medium">
            Your document and AI generations are temporary (2hr session). Sign up to keep your work permanently.
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href={`/sign-in?claim=true&docId=${documentId}`}>
            <Button size="sm" variant="primary" className="h-7 text-xs px-3 gap-1.5 shadow-xs">
              <Sparkles size={12} />
              <span>Save Document</span>
              <ArrowRight size={12} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function GuestLimitModal({
  isOpen,
  title,
  message,
  onClose,
}: {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#213448]/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-[#E2DBD0] max-w-md w-full p-6 text-center animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-full bg-[#F0F5F8] text-[#213448] mx-auto flex items-center justify-center mb-4 border border-[#CADDE6]">
          <ShieldAlert size={22} className="text-[#547792]" />
        </div>
        <h3 className="text-lg font-semibold text-[#213448] mb-2">{title}</h3>
        <p className="text-xs sm:text-sm text-[#547792] mb-6 leading-relaxed">{message}</p>
        <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
          <Link href="/sign-in?claim=true" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full gap-2">
              <span>Create Free Account</span>
              <ArrowRight size={15} />
            </Button>
          </Link>
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
