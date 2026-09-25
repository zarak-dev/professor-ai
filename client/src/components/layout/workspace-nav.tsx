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
      tagColor: 'tag-yellow',
    },
    {
      name: 'Chat',
      href: `/documents/${documentId}/chat`,
      exact: false,
      icon: MessageSquare,
      tagColor: 'tag-mint',
    },
    {
      name: 'Quiz',
      href: `/documents/${documentId}/quiz`,
      exact: false,
      icon: BrainCircuit,
      tagColor: 'tag-pink',
    },
    {
      name: 'Flashcards',
      href: `/documents/${documentId}/flashcards`,
      exact: false,
      icon: Layers,
      tagColor: 'tag-purple',
    },
    {
      name: 'Visualize',
      href: `/documents/${documentId}/visualize`,
      exact: false,
      icon: Network,
      tagColor: 'tag-blue',
    },
  ];

  return (
    <div className="w-full border-b-2 border-border bg-card/60 backdrop-blur-md sticky top-16 z-30">
      <div className="wrapper py-2">
        <nav
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1"
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
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap border-2 select-none ${
                  isActive
                    ? 'bg-foreground text-background border-foreground shadow-[2px_2px_0px_0px_var(--primary)]'
                    : 'bg-background hover:bg-muted text-foreground border-border hover:-translate-y-0.5'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={16} className={isActive ? 'text-primary' : 'text-muted-foreground'} />
                <span>{tab.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default WorkspaceNav;
