'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Send, Loader2, Sparkles, Bot } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import { ChatMessage } from '@/types';

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
            text: "Hello! I'm **The Professor**. I've read this entire document and I'm ready to answer any questions, explain difficult concepts, or summarize sections for you!",
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
          text: "Hello! I'm **The Professor**. How can I help you study this document today?",
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
        text: `⚠️ **Error:** ${errorText}`,
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
      <div className="bento-card-static !p-0 flex flex-col flex-1 overflow-hidden shadow-sm">
        {/* Chat header */}
        <div className="flex items-center justify-between px-5 py-3 border-b-2 border-border bg-card/60 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <div className="icon-circle bg-primary/20 !w-8 !h-8">
              <Bot size={18} className="text-foreground" />
            </div>
            <div>
              <span className="font-black text-sm tracking-tight">The Professor AI</span>
              <span className="hidden sm:inline text-xs text-muted-foreground ml-2">
                Document-Aware Tutor
              </span>
            </div>
          </div>
          <span className="tag tag-mint !text-[10px] hidden sm:inline-flex">
            <Sparkles size={10} /> Active Context
          </span>
        </div>

        {/* Messages scroll area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
          tabIndex={0}
          aria-label="Chat Message History"
        >
          {initialLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground gap-2">
              <Loader2 size={20} className="animate-spin text-primary" />
              <span className="text-xs font-bold">Loading conversation...</span>
            </div>
          ) : (
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="icon-circle bg-primary/20 shrink-0 !w-8 !h-8 mt-1">
                    <Bot size={16} />
                  </div>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-primary text-black font-medium border-2 border-border shadow-[2px_2px_0px_0px_var(--border-color)]'
                      : 'bg-card text-foreground border-2 border-border shadow-[2px_2px_0px_0px_var(--border-color)] prose dark:prose-invert max-w-none'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="text-sm">{children}</li>,
                        strong: ({ children }) => <strong className="font-black text-foreground">{children}</strong>,
                        code: ({ children }) => (
                          <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs border border-border">
                            {children}
                          </code>
                        ),
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  )}
                  <span
                    className={`block text-[10px] mt-1.5 select-none ${
                      msg.sender === 'user' ? 'text-black/60 text-right' : 'text-muted-foreground'
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 justify-start"
            >
              <div className="icon-circle bg-primary/20 shrink-0 !w-8 !h-8 mt-1">
                <Bot size={16} />
              </div>
              <div className="bg-card text-foreground rounded-2xl p-4 border-2 border-border flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-primary" />
                <span className="text-xs font-bold text-muted-foreground">The Professor is thinking...</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input box */}
        <div className="p-3 sm:p-4 border-t-2 border-border bg-card/60 backdrop-blur-sm">
          <form onSubmit={sendMessage} className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about this document... (Enter to send, Shift+Enter for newline)"
              className="flex-1 bg-background border-2 border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none min-h-[44px] max-h-[120px]"
              rows={1}
              disabled={loading}
              aria-label="Chat Message Input"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="btn-primary !p-3 !rounded-2xl shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send Message"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
