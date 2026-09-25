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
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FileText size={18} />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium shrink-0">
              <Calendar size={12} />
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
            className="text-sm font-semibold text-slate-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors leading-snug"
            title={document.file_name}
          >
            {document.file_name}
          </h3>

          {/* Summary / Preview */}
          {document.summary ? (
            <p className="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed">
              {document.summary.replace(/^[•*-]\s*/gm, '')}
            </p>
          ) : (
            <p className="text-xs text-slate-400 italic mb-4">
              Document indexed and ready for interactive study.
            </p>
          )}
        </div>

        {/* Footer info & feature pills */}
        <div className="pt-3 border-t border-slate-100 mt-auto">
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
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <CheckCircle2 size={11} className="text-emerald-500" />
                  Ready
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs font-medium text-slate-600 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all">
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
