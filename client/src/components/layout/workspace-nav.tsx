'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, MessageSquare, BrainCircuit, Layers, Network } from 'lucide-react';

interface WorkspaceNavProps {
  documentId: string;
}

export const WorkspaceNav: React.FC<WorkspaceNavProps> = ({ documentId }) => {
  const pathname = usePathname();

  const tabs = [
    {
      name: 'Overview',
      href: `/documents/${documentId}`,
      exact: true,
      icon: FileText,
    },
    {
      name: 'Chat',
      href: `/documents/${documentId}/chat`,
      exact: false,
      icon: MessageSquare,
    },
    {
      name: 'Quiz',
      href: `/documents/${documentId}/quiz`,
      exact: false,
      icon: BrainCircuit,
    },
    {
      name: 'Flashcards',
      href: `/documents/${documentId}/flashcards`,
      exact: false,
      icon: Layers,
    },
    {
      name: 'Visualize',
      href: `/documents/${documentId}/visualize`,
      exact: false,
      icon: Network,
    },
  ];

  return (
    <div className="w-full border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-14 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <nav
          className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1"
          aria-label="Document Workspace Navigation"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.exact
              ? pathname === tab.href
              : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`relative flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap select-none rounded-md ${
                  isActive
                    ? 'text-blue-600 bg-blue-50/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  size={15}
                  className={isActive ? 'text-blue-600' : 'text-slate-400'}
                />
                <span>{tab.name}</span>
                {isActive && (
                  <span
                    className="absolute -bottom-1 left-2 right-2 h-0.5 bg-blue-600 rounded-full"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default WorkspaceNav;
