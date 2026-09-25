'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ChatInterface from '@/components/ChatInterface';

export default function DocumentChatPage() {
  const params = useParams();
  const documentId = (params?.id as string) || '';

  return <ChatInterface documentId={documentId} />;
}
