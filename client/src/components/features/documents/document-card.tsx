import React from 'react';
import Link from 'next/link';
import { FileText, Calendar, ArrowRight, BrainCircuit, Layers, Network } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DocumentItem } from '@/types';

interface DocumentCardProps {
  document: DocumentItem;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
  return (
    <Link href={`/documents/${document._id}`} className="block h-full group select-none">
      <Card interactive className="flex flex-col h-full !p-6 justify-between">
        <div>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="icon-circle bg-primary/20 !w-11 !h-11 shrink-0">
              <FileText size={22} className="text-foreground" />
            </div>
            <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5 shrink-0 bg-muted px-2.5 py-1 rounded-full border border-border">
              <Calendar size={12} />
              {new Date(document.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>

          <h3
            className="text-lg font-black mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-snug"
            title={document.file_name}
          >
            {document.file_name}
          </h3>

          {document.summary ? (
            <p className="text-xs text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
              {document.summary.replace(/^[•*-]\s*/gm, '')}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground italic mb-4">
              Click to open document workspace and start learning.
            </p>
          )}
        </div>

        <div className="pt-4 border-t border-border/40 mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 flex-wrap">
              {document.hasQuiz && (
                <Badge color="pink" className="!text-[10px] !px-2 !py-0.5">
                  <BrainCircuit size={10} /> Quiz
                </Badge>
              )}
              {document.hasFlashcards && (
                <Badge color="purple" className="!text-[10px] !px-2 !py-0.5">
                  <Layers size={10} /> Cards
                </Badge>
              )}
              {document.hasVisualization && (
                <Badge color="blue" className="!text-[10px] !px-2 !py-0.5">
                  <Network size={10} /> Viz
                </Badge>
              )}
              {!document.hasQuiz && !document.hasFlashcards && !document.hasVisualization && (
                <span className="text-[11px] text-muted-foreground font-medium">Ready to explore</span>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs font-bold group-hover:translate-x-1 transition-transform">
              <span>Open</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default DocumentCard;
