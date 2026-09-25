'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Network,
  Eye,
  Zap,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Link2,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import { VisualizationData } from '@/types';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { Badge } from '@/components/ui/badge';

interface DocumentVisualizerProps {
  documentId: string;
}

type VisState = 'intro' | 'loading' | 'display' | 'error';

const importanceTokens = {
  high: {
    border: 'border-l-blue-600',
    badgeColor: 'blue' as const,
  },
  medium: {
    border: 'border-l-slate-400',
    badgeColor: 'slate' as const,
  },
  low: {
    border: 'border-l-slate-300',
    badgeColor: 'slate' as const,
  },
};

export default function DocumentVisualizer({ documentId }: DocumentVisualizerProps) {
  const [visState, setVisState] = useState<VisState>('loading');
  const [data, setData] = useState<VisualizationData | null>(null);
  const [expandedTopic, setExpandedTopic] = useState<number | null>(null);
  const [hasExistingViz, setHasExistingViz] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [hoveredConnection, setHoveredConnection] = useState<number | null>(null);

  const loadExistingVisualization = useCallback(async () => {
    if (!documentId) return;
    setVisState('loading');
    setErrorMsg('');
    try {
      const res = await api.get(`/documents/${documentId}/visualize`);
      const existingViz = res.data.visualization;
      if (existingViz && existingViz.title && Array.isArray(existingViz.topics)) {
        setData(existingViz);
        setHasExistingViz(true);
        setVisState('display');
      } else {
        setHasExistingViz(false);
        setVisState('intro');
      }
    } catch (err: unknown) {
      if ((err as { response?: { status?: number } })?.response?.status === 404) {
        setHasExistingViz(false);
        setVisState('intro');
      } else {
        console.warn('Failed to load existing visualization:', err);
        setHasExistingViz(false);
        setVisState('intro');
      }
    }
  }, [documentId]);

  useEffect(() => {
    loadExistingVisualization();
  }, [loadExistingVisualization]);

  const generateVisualization = async () => {
    if (!documentId) return;

    setVisState('loading');
    setErrorMsg('');

    try {
      const res = await api.post(`/documents/${documentId}/visualize`);
      const viz = res.data.visualization;
      if (viz && viz.title && Array.isArray(viz.topics)) {
        setData(viz);
        setHasExistingViz(true);
        setVisState('display');
      } else {
        throw new Error('Invalid visualization response from AI');
      }
    } catch (err: unknown) {
      console.error('Visualization Generation Error:', err);
      const msg = getErrorMessage(err, 'Failed to generate concept map. Please try again.');
      setErrorMsg(msg);
      setVisState('error');
    }
  };

  const toggleTopic = (idx: number) => {
    setExpandedTopic(expandedTopic === idx ? null : idx);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <AnimatePresence mode="wait">
        {visState === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="border border-slate-200 bg-white rounded-xl p-8 sm:p-10 text-center max-w-2xl mx-auto shadow-xs"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <Network size={24} />
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 mb-2">
              Document Concept Map
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mb-6 max-w-md mx-auto leading-relaxed">
              Explore an interconnected knowledge map identifying core themes, takeaways, and relational links across your document.
            </p>

            <div className="flex items-center justify-center gap-2 text-xs mb-8">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
                <Eye size={11} className="text-blue-600" /> Topic Architecture
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
                <Zap size={11} className="text-emerald-600" /> Relational Connections
              </span>
            </div>

            <div className="flex flex-col gap-2.5 max-w-sm mx-auto">
              {hasExistingViz ? (
                <>
                  <Button
                    onClick={() => setVisState('display')}
                    variant="primary"
                    size="md"
                    className="w-full justify-center gap-2"
                  >
                    <span>View Saved Concept Map</span>
                    <ArrowRight size={15} />
                  </Button>
                  <Button
                    onClick={generateVisualization}
                    variant="outline"
                    size="sm"
                    className="w-full justify-center gap-2"
                  >
                    <RefreshCw size={13} />
                    <span>Regenerate Map</span>
                  </Button>
                </>
              ) : (
                <Button
                  onClick={generateVisualization}
                  variant="primary"
                  size="md"
                  className="w-full justify-center gap-2"
                >
                  <Sparkles size={15} />
                  <span>Generate Concept Map</span>
                  <ArrowRight size={15} />
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {visState === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="border border-slate-200 bg-white rounded-xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xs"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <Loader2 size={24} className="animate-spin" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              Constructing Knowledge Hierarchy...
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
              Identifying primary topics, sub-themes, and semantic links from the text.
            </p>
            <div className="flex justify-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-blue-600"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {visState === 'display' && data && (
          <motion.div
            key="display"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header info */}
            <div className="border border-slate-200 bg-white rounded-xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <Network size={18} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900">{data.title}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {data.topics.length} core topics • {data.connections?.length || 0} relational connections
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={generateVisualization}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                >
                  <RefreshCw size={12} />
                  <span>Regenerate</span>
                </Button>
              </div>
            </div>

            {/* Core Topics Grid */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={14} className="text-slate-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Core Topics (Click to expand takeaways)
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {data.topics.map((topic, idx) => {
                  const token = importanceTokens[topic.importance] || importanceTokens.medium;
                  const isExpanded = expandedTopic === idx;

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className={`border border-slate-200 bg-white rounded-xl p-4 cursor-pointer select-none hover:border-slate-300 hover:shadow-xs transition-all border-l-4 ${token.border}`}
                      onClick={() => toggleTopic(idx)}
                    >
                      <div className="flex items-start justify-between mb-1.5">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="w-5 h-5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 border border-slate-200/60">
                            {idx + 1}
                          </span>
                          <h5 className="font-semibold text-xs sm:text-sm text-slate-900 truncate">
                            {topic.name}
                          </h5>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <Badge color={token.badgeColor} className="text-[10px] capitalize">
                            {topic.importance}
                          </Badge>
                          {isExpanded ? (
                            <ChevronUp size={14} className="text-slate-400" />
                          ) : (
                            <ChevronDown size={14} className="text-slate-400" />
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed mb-1">
                        {topic.summary}
                      </p>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-3 border-t border-slate-100 mt-2">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                                Key Takeaways
                              </p>
                              <ul className="space-y-1.5">
                                {topic.keyPoints.map((point, pidx) => (
                                  <li
                                    key={pidx}
                                    className="flex items-start gap-2 text-xs leading-relaxed text-slate-700"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-blue-600" />
                                    <span>{point}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Concept Relationships Section */}
            {data.connections && data.connections.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="border border-slate-200 bg-white rounded-xl p-5 sm:p-6 shadow-xs"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Link2 size={14} className="text-slate-400" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Concept Relationships
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {data.connections.map((conn, idx) => {
                    const isHovered = hoveredConnection === idx;
                    return (
                      <div
                        key={idx}
                        onMouseEnter={() => setHoveredConnection(idx)}
                        onMouseLeave={() => setHoveredConnection(null)}
                        className={`p-3 rounded-lg border transition-all flex items-center justify-between text-xs ${
                          isHovered
                            ? 'border-blue-300 bg-blue-50/40 shadow-xs'
                            : 'border-slate-200 bg-slate-50/50'
                        }`}
                      >
                        <span className="font-semibold text-slate-900 truncate max-w-[38%]">
                          {conn.from}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200/80 shrink-0">
                          {conn.relation}
                        </span>
                        <span className="font-semibold text-slate-900 truncate max-w-[38%] text-right">
                          {conn.to}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {visState === 'error' && (
          <ErrorState
            title="Concept Map Generation Error"
            message={errorMsg}
            onRetry={generateVisualization}
            className="max-w-md mx-auto"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
