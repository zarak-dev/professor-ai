import React from 'react';
import Link from 'next/link';
import { FileText, Calendar, ArrowRight, BrainCircuit, Layers, Network, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DocumentItem } from '@/types';

interface DocumentCardProps {
  document: DocumentItem;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
  return (
    <Link href={`/documents/${document._id}`} className="block h-full group select-none">
      <Card interactive className="flex flex-col h-full p-5 justify-between">
        <div>
          {/* Top meta row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-[#F0F5F8] text-[#213448] flex items-center justify-center shrink-0 border border-[#CADDE6] group-hover:bg-[#213448] group-hover:text-white transition-colors">
              <FileText size={18} />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#547792] font-medium shrink-0">
              <Calendar size={12} className="text-[#94B4C1]" />
              <span>
                {new Date(document.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* Document Title */}
          <h3
            className="text-sm font-semibold text-[#213448] mb-2 line-clamp-1 group-hover:text-[#547792] transition-colors leading-snug"
            title={document.file_name}
          >
            {document.file_name}
          </h3>

          {/* Summary / Preview */}
          {document.summary ? (
            <p className="text-xs text-[#547792] line-clamp-3 mb-4 leading-relaxed">
              {document.summary.replace(/^[•*-]\s*/gm, '')}
            </p>
          ) : (
            <p className="text-xs text-[#94B4C1] italic mb-4">
              Document indexed and ready for interactive study.
            </p>
          )}
        </div>

        {/* Footer info & feature pills */}
        <div className="pt-3 border-t border-[#E2DBD0] mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 flex-wrap">
              {document.hasQuiz && (
                <Badge color="mint" className="text-[10px] px-1.5 py-0.5">
                  <BrainCircuit size={10} /> Quiz
                </Badge>
              )}
              {document.hasFlashcards && (
                <Badge color="purple" className="text-[10px] px-1.5 py-0.5">
                  <Layers size={10} /> Cards
                </Badge>
              )}
              {document.hasVisualization && (
                <Badge color="blue" className="text-[10px] px-1.5 py-0.5">
                  <Network size={10} /> Viz
                </Badge>
              )}
              {!document.hasQuiz && !document.hasFlashcards && !document.hasVisualization && (
                <span className="text-[11px] text-[#547792] flex items-center gap-1">
                  <CheckCircle2 size={11} className="text-[#2C665F]" />
                  Ready
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs font-medium text-[#547792] group-hover:text-[#213448] group-hover:translate-x-0.5 transition-all">
              <span>Workspace</span>
              <ArrowRight size={13} />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default DocumentCard;
