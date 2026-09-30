'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FormSchema } from '@/lib/types';
import {
  Sparkles,
  Send,
  X,
  Minimize2,
  Maximize2,
  Bot,
  User,
  Wand2,
  Check,
  RefreshCw,
  Zap,
} from 'lucide-react';

interface AiFormAssistantProps {
  currentSchema: FormSchema;
  onApplySchema: (newSchema: FormSchema) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  schemaPreview?: FormSchema;
  timestamp: string;
}

export default function AiFormAssistant({
  currentSchema,
  onApplySchema,
  isOpen,
  onClose,
}: AiFormAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: '👋 Hi! I am your AI Form Builder Assistant. Tell me what kind of form you want to create or edit (e.g. "Build a Job Application form" or "Add a 5-star rating question").',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onClose}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          padding: '12px 22px',
          borderRadius: 99,
          background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
          color: '#FFFFFF',
          fontWeight: 800,
          fontSize: 14,
          border: '1.5px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '0 12px 35px rgba(139, 92, 246, 0.6), 0 0 24px rgba(139, 92, 246, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <Sparkles size={18} color="#FDE047" />
        <span>✨ Open AI Form Assistant</span>
      </button>
    );
  }

  const handleSendPrompt = async (promptText?: string) => {
    const textToSend = promptText || inputPrompt.trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!promptText) setInputPrompt('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/generate-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          currentSchema,
        }),
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const aiMsg: ChatMessage = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: data.replyMessage || 'Form updated successfully!',
        schemaPreview: data.schema,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Automatically update the live form schema!
      if (data.schema) {
        onApplySchema(data.schema);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'ai',
          text: '❌ Sorry, I encountered an issue: ' + (err.message || 'Failed to process request.'),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    '🚀 Job Application Form',
    '⭐ Customer Feedback Survey',
    '📅 Event Registration',
    '🎨 Dark Cyberpunk Theme',
    '📎 File Upload Question',
  ];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1000,
        width: isMinimized ? 300 : 380,
        maxHeight: isMinimized ? 56 : 580,
        height: isMinimized ? 56 : '75vh',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(139, 92, 246, 0.4)',
        borderRadius: 20,
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(139, 92, 246, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        color: '#FFFFFF',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 18px',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(124, 58, 237, 0.15) 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(139, 92, 246, 0.6)',
            }}
          >
            <Sparkles size={16} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 6 }}>
              AI Form Assistant
              <span style={{ fontSize: 10, background: 'rgba(139, 92, 246, 0.3)', border: '1px solid rgba(139, 92, 246, 0.5)', padding: '1px 6px', borderRadius: 99, color: '#C084FC' }}>
                LIVE
              </span>
            </div>
            {!isMinimized && (
              <div style={{ fontSize: 11, color: '#94A3B8' }}>
                Prompt to build & customize forms
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            style={{ background: 'none', border: 'none', color: '#94A3B8', padding: 4, cursor: 'pointer' }}
            title={isMinimized ? 'Expand Chat' : 'Minimize Chat'}
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94A3B8', padding: 4, cursor: 'pointer' }}
            title="Close Assistant"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Body / Chat Feed */}
      {!isMinimized && (
        <>
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: 10,
                  flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: msg.sender === 'user' ? '#1E293B' : 'rgba(139, 92, 246, 0.25)',
                    border: msg.sender === 'user' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(139, 92, 246, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {msg.sender === 'user' ? <User size={14} color="#94A3B8" /> : <Bot size={15} color="#C084FC" />}
                </div>

                <div style={{ maxWidth: '82%' }}>
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: 14,
                      fontSize: 13,
                      lineHeight: 1.5,
                      background: msg.sender === 'user' ? 'linear-gradient(135deg, #8B5CF6, #7C3AED)' : '#0F172A',
                      color: '#FFFFFF',
                      border: msg.sender === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: msg.sender === 'user' ? '0 4px 12px rgba(139, 92, 246, 0.3)' : '0 2px 8px rgba(0,0,0,0.4)',
                    }}
                  >
                    {msg.text}

                    {/* AI Schema Applied Pill */}
                    {msg.schemaPreview && (
                      <div
                        style={{
                          marginTop: 10,
                          padding: '8px 12px',
                          background: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid rgba(16, 185, 129, 0.4)',
                          borderRadius: 8,
                          fontSize: 12,
                          color: '#6EE7B7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 8,
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                          <Check size={14} /> Live Form Updated ({msg.schemaPreview.fields.length} questions)
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: 10, color: '#64748B', marginTop: 4, textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(139, 92, 246, 0.25)', border: '1px solid rgba(139, 92, 246, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wand2 size={15} color="#C084FC" className="animate-spin" />
                </div>
                <div style={{ padding: '8px 14px', background: '#0F172A', borderRadius: 12, fontSize: 12, color: '#C084FC', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <RefreshCw size={13} className="animate-spin" /> AI is crafting your form...
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompt Pills */}
          <div
            style={{
              padding: '8px 14px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              gap: 6,
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              background: '#0B0F19',
            }}
          >
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendPrompt(prompt)}
                disabled={loading}
                style={{
                  padding: '4px 10px',
                  borderRadius: 99,
                  background: 'rgba(139, 92, 246, 0.15)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  color: '#C084FC',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt();
            }}
            style={{
              padding: 12,
              background: '#0F172A',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Prompt AI to add fields, survey, rating..."
              disabled={loading}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: 10,
                border: '1.5px solid rgba(139, 92, 246, 0.35)',
                background: '#05070D',
                color: '#FFFFFF',
                fontSize: 13,
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={loading || !inputPrompt.trim()}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                border: 'none',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: loading || !inputPrompt.trim() ? 'not-allowed' : 'pointer',
                opacity: loading || !inputPrompt.trim() ? 0.5 : 1,
                boxShadow: '0 2px 8px rgba(139, 92, 246, 0.4)',
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
