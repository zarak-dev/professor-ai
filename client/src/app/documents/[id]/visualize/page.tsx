'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import DocumentVisualizer from '@/components/DocumentVisualizer';

export default function DocumentVisualizePage() {
  const params = useParams();
  const documentId = (params?.id as string) || '';

  return <DocumentVisualizer documentId={documentId} />;
}
