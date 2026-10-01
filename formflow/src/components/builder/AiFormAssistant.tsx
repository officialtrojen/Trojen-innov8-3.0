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
  RotateCcw,
  Globe,
} from 'lucide-react';

interface AiFormAssistantProps {
  currentSchema: FormSchema;
  onApplySchema: (newSchema: FormSchema) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  onToggle?: () => void;
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
  onOpen,
  onToggle,
}: AiFormAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'ai',
      text: '👋 Hi! Describe the form you want to create (e.g., "Create a math test for class 10 with 10 questions" or "Create a hackathon registration form with name, phone, college, and address"). Gemini will dynamically generate the complete form structure for you.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  useEffect(() => {
    try {
      localStorage.removeItem('formflow_ai_chat_messages');
    } catch {
      // Ignore quota error
    }
  }, []);

  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const handleClearChat = () => {
    const freshWelcome: ChatMessage[] = [
      {
        id: 'welcome_' + Date.now(),
        sender: 'ai',
        text: '👋 Chat cleared! Enter what form you want to create.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    setMessages(freshWelcome);
    try {
      localStorage.removeItem('formflow_ai_chat_messages');
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => {
          if (onOpen) onOpen();
          else if (onToggle) onToggle();
          else onClose();
        }}
        style={{
          position: 'fixed',
          bottom: 24,
          left: 24,
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

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (!promptText) setInputPrompt('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/generate-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          currentSchema,
          chatHistory: updatedMessages,
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

      // Automatically update the live form schema
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

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
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
                GEMINI
              </span>
            </div>
            {!isMinimized && (
              <div style={{ fontSize: 11, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span style={{ color: '#6EE7B7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Globe size={11} /> Dynamic Gemini Engine
                </span>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={handleClearChat}
            style={{ background: 'none', border: 'none', color: '#94A3B8', padding: 4, cursor: 'pointer' }}
            title="Clear Chat History"
          >
            <RotateCcw size={15} />
          </button>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(139, 92, 246, 0.4)', borderRadius: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#C084FC', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Wand2 size={15} color="#C084FC" className="animate-spin" /> Gemini AI Form Engine Processing...
                </div>
                <div style={{ fontSize: 11, color: '#94A3B8', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6EE7B7' }}>
                    <RefreshCw size={12} className="animate-spin" /> Interpreting user intent & form requirements...
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#38BDF8' }}>
                    <Globe size={12} /> Grounding web search for current domain details...
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#F472B6' }}>
                    <Zap size={12} /> Structuring fields, choices, and options...
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Single General-Purpose Input Bar */}
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
              placeholder="Describe the form you want to create..."
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
                padding: '0 14px',
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                border: 'none',
                color: 'white',
                fontWeight: 700,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: loading || !inputPrompt.trim() ? 'not-allowed' : 'pointer',
                opacity: loading || !inputPrompt.trim() ? 0.5 : 1,
                boxShadow: '0 2px 8px rgba(139, 92, 246, 0.4)',
              }}
            >
              <span>Generate</span>
              <Send size={14} />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
