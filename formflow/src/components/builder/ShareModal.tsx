'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  QrCode as QrIcon,
  Globe,
  Share2,
  Mail,
  MessageCircle,
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  formTitle: string;
  publicSlug: string;
  formId?: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  formTitle,
  publicSlug,
  formId,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [showQr, setShowQr] = useState(false);

  // Compute public submission URL
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      // Primary public link is /f/{slug}
      const url = publicSlug ? `${origin}/f/${publicSlug}` : formId ? `${origin}/form/${formId}` : `${origin}`;
      setShareUrl(url);

      if (url) {
        QRCode.toDataURL(url, {
          width: 220,
          margin: 1.5,
          color: {
            dark: '#2A2E33',
            light: '#FCFBF7',
          },
        })
          .then((dataUri) => setQrCodeData(dataUri))
          .catch(() => {});
      }
    }
  }, [publicSlug, formId, isOpen]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      // Fallback
      const input = document.getElementById('share-url-input') as HTMLInputElement;
      if (input) {
        input.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    }
  };

  const handleOpenForm = () => {
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(`Please fill out this form: ${formTitle}`);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(42, 46, 51, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FCFBF7',
          border: '1.5px solid rgba(122, 139, 153, 0.3)',
          borderRadius: 20,
          boxShadow: '0 24px 64px rgba(42, 46, 51, 0.2), 0 4px 16px rgba(42, 46, 51, 0.08)',
          width: '100%',
          maxWidth: 540,
          overflow: 'hidden',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '24px 28px 18px',
            borderBottom: '1px solid #F2EFE9',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            background: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: '#F2EFE9',
                border: '1px solid rgba(122, 139, 153, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2A2E33',
                flexShrink: 0,
              }}
            >
              <Globe size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#2A2E33', letterSpacing: '-0.01em' }}>
                  Form Published & Live!
                </h3>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#065F46',
                    padding: '2px 8px',
                    borderRadius: 999,
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
                  Public
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#7A8B99' }}>
                Anyone with this link can submit responses. No account required.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 6,
              cursor: 'pointer',
              color: '#7A8B99',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s ease',
            }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px 28px' }}>
          {/* Form Title & Status summary */}
          <div
            style={{
              background: '#F2EFE9',
              borderRadius: 12,
              padding: '12px 16px',
              marginBottom: 20,
              border: '1px solid rgba(122, 139, 153, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ minWidth: 0, flex: 1, paddingRight: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#7A8B99', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Active Form
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#2A2E33', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {formTitle || 'Untitled Form'}
              </div>
            </div>
            <button
              onClick={handleOpenForm}
              className="btn btn-sm"
              style={{
                background: '#FFFFFF',
                color: '#2A2E33',
                border: '1px solid #D8D2C7',
                fontSize: 12,
                fontWeight: 600,
                padding: '6px 12px',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              Test Form <ExternalLink size={13} />
            </button>
          </div>

          {/* Shareable Link Box */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#2A2E33', marginBottom: 8 }}>
              Public Share URL
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                id="share-url-input"
                type="text"
                readOnly
                value={shareUrl}
                style={{
                  flex: 1,
                  background: '#FFFFFF',
                  border: '1.5px solid #D8D2C7',
                  borderRadius: 10,
                  padding: '10px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#2A2E33',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleCopy}
                style={{
                  background: copied ? '#10B981' : '#2A2E33',
                  color: '#FCFBF7',
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px 18px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(42, 46, 51, 0.15)',
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
            {copied && (
              <div style={{ fontSize: 12, color: '#059669', fontWeight: 600, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Check size={14} /> Link copied to clipboard! You can paste and send it to anyone now.
              </div>
            )}
          </div>

          {/* QR Code Collapsible View */}
          <div style={{ marginBottom: 20 }}>
            <button
              onClick={() => setShowQr(!showQr)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '4px 0',
                fontSize: 13,
                fontWeight: 600,
                color: '#7A8B99',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <QrIcon size={15} />
              {showQr ? 'Hide QR Code' : 'Show Shareable QR Code'}
            </button>

            {showQr && qrCodeData && (
              <div
                style={{
                  marginTop: 12,
                  padding: 18,
                  background: '#FFFFFF',
                  borderRadius: 14,
                  border: '1px solid #D8D2C7',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  animation: 'fadeIn 0.2s ease',
                }}
              >
                <img
                  src={qrCodeData}
                  alt="Form QR Code"
                  style={{ width: 170, height: 170, borderRadius: 8, display: 'block' }}
                />
                <div style={{ fontSize: 12, color: '#7A8B99', marginTop: 8 }}>
                  Scan with any phone camera to instantly open and submit this form
                </div>
              </div>
            )}
          </div>

          {/* Quick Share Buttons */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#7A8B99', marginBottom: 10 }}>
              Quick Share Via
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a
                href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  borderRadius: 10,
                  background: '#FFFFFF',
                  border: '1px solid #D8D2C7',
                  color: '#2A2E33',
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'border-color 0.15s ease',
                }}
              >
                <MessageCircle size={15} style={{ color: '#25D366' }} /> WhatsApp
              </a>

              <a
                href={`mailto:?subject=${encodedTitle}&body=Please%20fill%20out%20this%20form:%20${encodedUrl}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  borderRadius: 10,
                  background: '#FFFFFF',
                  border: '1px solid #D8D2C7',
                  color: '#2A2E33',
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'border-color 0.15s ease',
                }}
              >
                <Mail size={15} style={{ color: '#2A2E33' }} /> Email
              </a>

              <a
                href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  borderRadius: 10,
                  background: '#FFFFFF',
                  border: '1px solid #D8D2C7',
                  color: '#2A2E33',
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'border-color 0.15s ease',
                }}
              >
                <Share2 size={15} style={{ color: '#1DA1F2' }} /> Twitter / X
              </a>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '16px 28px',
            background: '#F2EFE9',
            borderTop: '1px solid rgba(122, 139, 153, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{
              background: '#FFFFFF',
              color: '#2A2E33',
              border: '1px solid #D8D2C7',
              borderRadius: 8,
              padding: '8px 20px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
