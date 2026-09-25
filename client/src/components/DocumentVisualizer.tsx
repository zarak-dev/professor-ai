'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Network,
  Eye,
  Zap,
  Loader2,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Link2,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import { VisualizationData } from '@/types';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';

interface DocumentVisualizerProps {
  documentId: string;
}

type VisState = 'intro' | 'loading' | 'display' | 'error';

const importanceColors = {
  high: { bg: 'var(--bg-pink)', tag: 'tag-pink' },
  medium: { bg: 'var(--bg-yellow)', tag: 'tag-yellow' },
  low: { bg: 'var(--bg-purple)', tag: 'tag-purple' },
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
    } catch (err: any) {
      if (err?.response?.status === 404) {
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
    } catch (err: any) {
      console.error('Visualization Generation Error:', err);
      const msg =
        err?.response?.data?.error?.message ||
        err?.message ||
        'Failed to generate visualization. Please try again.';
      setErrorMsg(msg);
      setVisState('error');
    }
  };

  const toggleTopic = (idx: number) => {
    setExpandedTopic(expandedTopic === idx ? null : idx);
  };

  const getTopicIndex = (name: string): number => {
    if (!data) return -1;
    return data.topics.findIndex((t) => t.name.toLowerCase() === name.toLowerCase());
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <AnimatePresence mode="wait">
        {visState === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="bento-card-static !p-8 sm:!p-12 text-center max-w-2xl mx-auto"
          >
            <div className="icon-circle bg-primary/20 !w-16 !h-16 mx-auto mb-6">
              <Network size={28} className="text-foreground" />
            </div>
            <h2 className="text-2xl font-black mb-3">Document Concept Map</h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Transform your document into an interconnected visual knowledge structure with topics, key takeaways, and relationship links.
            </p>
            <div className="flex items-center justify-center gap-3 text-xs mb-8">
              <span className="tag tag-blue">
                <Eye size={10} /> Visual Architecture
              </span>
              <span className="tag tag-mint">
                <Zap size={10} /> AI Synthesis
              </span>
            </div>

            <div className="flex flex-col gap-3 max-w-sm mx-auto">
              {hasExistingViz ? (
                <>
                  <Button
                    onClick={() => setVisState('display')}
                    variant="primary"
                    size="lg"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <span>View Saved Concept Map</span>
                    <ArrowRight size={16} />
                  </Button>
                  <Button
                    onClick={generateVisualization}
                    variant="secondary"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={14} />
                    <span>Regenerate Map</span>
                  </Button>
                </>
              ) : (
                <Button
                  onClick={generateVisualization}
                  variant="primary"
                  size="lg"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} />
                  <span>Generate Concept Map</span>
                  <ArrowRight size={16} />
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {visState === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="bento-card-static !p-8 sm:!p-12 text-center max-w-2xl mx-auto"
          >
            <div className="icon-circle bg-primary/20 !w-16 !h-16 mx-auto mb-6">
              <Loader2 size={30} className="animate-spin text-foreground" />
            </div>
            <h3 className="text-xl font-black mb-2">Mapping Concepts...</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
              AI is identifying central themes, relationships, and supporting facts across your document.
            </p>
            <div className="flex justify-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full bg-primary"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
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
            <div className="bento-card-static !p-5 sm:!p-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="icon-circle bg-primary/20 shrink-0 !w-10 !h-10">
                  <Network size={20} className="text-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-black">{data.title}</h3>
                  <p className="text-xs text-muted-foreground font-medium">
                    {data.topics.length} core topics • {data.connections?.length || 0} relational connections
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={generateVisualization}
                  variant="secondary"
                  size="sm"
                  className="text-xs flex items-center gap-1.5"
                >
                  <RefreshCw size={12} />
                  <span>Regenerate</span>
                </Button>
              </div>
            </div>

            {/* Topics Grid */}
            <div className="mb-6">
              <h4 className="label-text mb-3 flex items-center gap-1.5">
                <BookOpen size={12} /> Core Document Topics (Click to expand key points)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.topics.map((topic, idx) => {
                  const colors = importanceColors[topic.importance] || importanceColors.medium;
                  const isExpanded = expandedTopic === idx;

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bento-card cursor-pointer select-none"
                      style={{ borderLeftWidth: '5px', borderLeftColor: colors.bg }}
                      onClick={() => toggleTopic(idx)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <div
                            className="icon-circle !w-7 !h-7 shrink-0 text-black text-xs font-black"
                            style={{ background: colors.bg }}
                          >
                            {idx + 1}
                          </div>
                          <h5 className="font-black text-sm truncate">{topic.name}</h5>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <span className={`tag ${colors.tag} text-[9px] !px-2 !py-0.5 capitalize`}>
                            {topic.importance}
                          </span>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed mb-2">
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
                            <div className="pt-3 border-t border-border/50 mt-2">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                                Key Takeaways
                              </p>
                              <ul className="space-y-1.5">
                                {topic.keyPoints.map((point, pidx) => (
                                  <li
                                    key={pidx}
                                    className="flex items-start gap-2 text-xs leading-relaxed text-foreground/90"
                                  >
                                    <span
                                      className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                                      style={{ background: colors.bg }}
                                    />
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

            {/* Connections Section */}
            {data.connections && data.connections.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bento-card-static !p-6"
              >
                <h4 className="label-text mb-4 flex items-center gap-1.5">
                  <Link2 size={12} /> Concept Relationships
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.connections.map((conn, idx) => {
                    const isHovered = hoveredConnection === idx;
                    return (
                      <div
                        key={idx}
                        onMouseEnter={() => setHoveredConnection(idx)}
                        onMouseLeave={() => setHoveredConnection(null)}
                        className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col gap-1.5 ${
                          isHovered
                            ? 'border-primary bg-primary/10 shadow-[2px_2px_0px_0px_var(--border-color)]'
                            : 'border-border bg-card'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold gap-2">
                          <span className="truncate text-foreground font-black">{conn.from}</span>
                          <span className="tag tag-mint !text-[9px] shrink-0">
                            {conn.relation}
                          </span>
                          <span className="truncate text-foreground font-black">{conn.to}</span>
                        </div>
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
