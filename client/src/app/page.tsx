'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import HeroSection from '@/components/HeroSection';
import ProductExplanation from '@/components/ProductExplanation';
import HowItWorks from '@/components/HowItWorks';
import FeatureCards from '@/components/FeatureCards';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/documents');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-7 h-7 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-[calc(100vh-3.5rem)] pt-14">
      <HeroSection />
      <ProductExplanation />
      <HowItWorks />
      <FeatureCards />
    </main>
  );
}