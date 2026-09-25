'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Send, Loader2, Sparkles, Bot, CheckCircle2 } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import { ChatMessage } from '@/types';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatInterfaceProps {
  documentId: string;
}

export default function ChatInterface({ documentId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const fetchHistory = useCallback(async () => {
    if (!documentId) return;
    setInitialLoading(true);
    try {
      const res = await api.get(`/documents/${documentId}/chat`);
      if (res.data.messages && res.data.messages.length > 0) {
        const formattedMessages: Message[] = res.data.messages.map((m: ChatMessage, idx: number) => ({
          id: m._id || `msg-${idx}`,
          text: m.message,
          sender: m.role === 'model' ? 'ai' : 'user',
          timestamp: new Date(m.timestamp || m.createdAt || Date.now()),
        }));
        setMessages(formattedMessages);
      } else {
        setMessages([
          {
            id: 'welcome',
            text: "Hello! I am **The Professor**. I have indexed this entire document and am ready to answer your questions, explain complex sections, or summarize key arguments.",
            sender: 'ai',
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err: unknown) {
      console.error('Failed to load chat history:', err);
      setMessages([
        {
          id: 'welcome',
          text: "Hello! I am **The Professor**. How can I help you study this document today?",
          sender: 'ai',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setInitialLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const userMsg: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post(`/documents/${documentId}/chat`, {
        prompt: userText,
      });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: res.data.response,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      console.error('Chat error:', err);
      const errorText = getErrorMessage(err, 'Sorry, I could not process your message right now. Please try again.');
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: `**Error:** ${errorText}`,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto px-2 sm:px-4 py-4">
      <div className="border border-slate-200 bg-white rounded-xl shadow-xs flex flex-col flex-1 overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Bot size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-slate-900">The Professor</span>
                <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60 hidden sm:inline-block">
                  Document Tutor
                </span>
              </div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
            <CheckCircle2 size={11} className="text-emerald-600" />
            Context Active
          </span>
        </div>

        {/* Messages Scroll View */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50"
          tabIndex={0}
          aria-label="Chat Message History"
        >
          {initialLoading ? (
            <div className="flex items-center justify-center h-full text-slate-400 gap-2">
              <Loader2 size={18} className="animate-spin text-blue-600" />
              <span className="text-xs font-medium">Loading conversation history...</span>
            </div>
          ) : (
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 mt-0.5">
                    <Bot size={14} />
                  </div>
                )}
                <div
                  className={`rounded-xl px-4 py-3 text-sm leading-relaxed max-w-[85%] sm:max-w-[78%] ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200/90 shadow-xs'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <div className="prose prose-sm max-w-none text-slate-800">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0 text-sm leading-relaxed">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1 text-sm">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1 text-sm">{children}</ol>,
                          li: ({ children }) => <li className="text-sm">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
                          code: ({ children }) => (
                            <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono text-xs border border-slate-200">
                              {children}
                            </code>
                          ),
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  )}
                  <span
                    className={`block text-[10px] mt-1 select-none ${
                      msg.sender === 'user' ? 'text-blue-100/80 text-right' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))
          )}

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 justify-start"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 mt-0.5">
                <Bot size={14} />
              </div>
              <div className="bg-white text-slate-700 rounded-xl px-4 py-3 border border-slate-200/90 shadow-xs flex items-center gap-2">
                <Loader2 size={15} className="animate-spin text-blue-600" />
                <span className="text-xs font-medium text-slate-500">The Professor is thinking...</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Composer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">
          <form onSubmit={sendMessage} className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about this document..."
              className="flex-1 bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none min-h-[44px] max-h-[120px] transition-all"
              rows={1}
              disabled={loading}
              aria-label="Chat Message Input"
            />
            <Button
              type="submit"
              disabled={!input.trim() || loading}
              variant="primary"
              size="icon"
              className="shrink-0 h-11 w-11 rounded-lg"
              aria-label="Send Message"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </Button>
          </form>
          <div className="hidden sm:flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
            <span>Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] text-slate-600">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] text-slate-600">Shift + Enter</kbd> for newline</span>
            <span className="flex items-center gap-1">
              <Sparkles size={11} className="text-blue-500" /> Grounded in document text
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
