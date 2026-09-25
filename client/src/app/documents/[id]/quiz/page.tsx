'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import QuizPanel from '@/components/QuizPanel';

export default function DocumentQuizPage() {
  const params = useParams();
  const documentId = (params?.id as string) || '';

  return <QuizPanel documentId={documentId} />;
}
