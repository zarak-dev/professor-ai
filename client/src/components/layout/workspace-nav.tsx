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
    <div className="w-full border-b border-[#E2DBD0] bg-[#FAF8F5]/95 backdrop-blur-md sticky top-14 z-30">
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
                    ? 'text-[#213448] bg-[#EAE0CF]/50 font-semibold'
                    : 'text-[#547792] hover:text-[#213448] hover:bg-[#F4EFE6]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  size={15}
                  className={isActive ? 'text-[#213448]' : 'text-[#94B4C1]'}
                />
                <span>{tab.name}</span>
                {isActive && (
                  <span
                    className="absolute -bottom-1 left-2 right-2 h-0.5 bg-[#213448] rounded-full"
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
