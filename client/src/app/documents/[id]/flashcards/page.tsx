'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import FlashcardPanel from '@/components/FlashcardPanel';

export default function DocumentFlashcardsPage() {
  const params = useParams();
  const documentId = (params?.id as string) || '';

  return <FlashcardPanel documentId={documentId} />;
}
