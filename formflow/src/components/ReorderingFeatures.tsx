'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, type Transition } from 'framer-motion';
import {
  Layers,
  Cpu,
  Share2,
  Radio,
  CheckCircle2,
} from 'lucide-react';

interface FeatureItem {
  id: string;
  badge: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  tag: string;
  accent: string;
}

const initialFeatures: FeatureItem[] = [
  {
    id: 'feature-builder',
    badge: 'CANVAS ENGINE',
    title: 'Visual Drag & Drop Builder',
    description:
      'Assemble responsive multi-step and classic forms with 10+ field types, custom fonts, typography palettes, and instant live canvas preview.',
    icon: Layers,
    tag: '10+ Field Types • Live Canvas',
    accent: '#38BDF8',
  },
  {
    id: 'feature-logic',
    badge: 'AUTONOMOUS LOGIC',
    title: 'Smart Conditional Branching',
    description:
      'Design adaptive user journeys with skip logic, dynamic field show/hide rules, and automated question pathways without writing any code.',
    icon: Cpu,
    tag: 'Zero-Code Skip Rules',
    accent: '#C084FC',
  },
  {
    id: 'feature-distribution',
    badge: 'GLOBAL DISTRIBUTION',
    title: 'Instant URL & QR Code Sharing',
    description:
      'Publish to an immutable shareable link in 1-click. Generate custom QR codes and embed widgets ready for global response collection.',
    icon: Share2,
    tag: '1-Click Live • QR Generation',
    accent: '#34D399',
  },
  {
    id: 'feature-analytics',
    badge: 'REAL-TIME TELEMETRY',
    title: 'Live Telemetry & Response Feeds',
    description:
      'Monitor real-time submission activity, completion rates, drop-off analytics, and export clean data directly into Excel or CSV with one click.',
    icon: Radio,
    tag: 'Sub-20ms Latency • XLSX Export',
    accent: '#FBBF24',
  },
];

/**
 * 4 scroll-driven permutations: as user scrolls down,
 * each feature rotates cleanly to the front position.
 */
const SCROLL_STAGES: string[][] = [
  ['feature-builder', 'feature-logic', 'feature-distribution', 'feature-analytics'],
  ['feature-logic', 'feature-distribution', 'feature-analytics', 'feature-builder'],
  ['feature-distribution', 'feature-analytics', 'feature-builder', 'feature-logic'],
  ['feature-analytics', 'feature-builder', 'feature-logic', 'feature-distribution'],
];

/**
 * Spring physics transition as specified in motion reordering pattern
 */
const spring: Transition = {
  type: 'spring',
  damping: 20,
  stiffness: 300,
};

export default function ReorderingFeatures() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<number>(0);

  const featureMap = new Map(initialFeatures.map((f) => [f.id, f]));

  // Track window scroll position relative to this container
  useEffect(() => {
    let ticking = false;
    let lastStage = -1;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight || 800;

            // Progress as section travels across viewport
            const startScroll = windowHeight * 0.85;
            const endScroll = windowHeight * 0.15;
            const progress = (startScroll - rect.top) / (startScroll - endScroll);
            const clamped = Math.max(0, Math.min(0.999, progress));
            const newStage = Math.floor(clamped * 4);

            if (newStage !== lastStage) {
              lastStage = newStage;
              setStage(newStage);
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentOrder = SCROLL_STAGES[stage] || SCROLL_STAGES[0];

  return (
    <div ref={containerRef} style={{ width: '100%', margin: '0 auto' }}>
      {/* Section Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h2
          style={{
            fontSize: 'clamp(2rem, 3.8vw, 3rem)',
            fontWeight: 800,
            color: '#FFFFFF',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          Engineered for speed, intelligence, and scale.
        </h2>
      </div>

      {/* 4 Clean Formal Feature Boxes with Framer Motion Spring Layout Reordering */}
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: '0 auto',
          position: 'relative',
          display: 'flex',
          flexWrap: 'wrap',
          flexDirection: 'row',
          gap: 20,
          justifyContent: 'center',
          alignItems: 'stretch',
          maxWidth: 1280,
          width: '100%',
        }}
      >
        {currentOrder.map((featureId, index) => {
          const item = featureMap.get(featureId);
          if (!item) return null;
          const Icon = item.icon;
          const isLead = index === 0;

          return (
            <motion.li
              key={item.id}
              layout
              transition={spring}
              style={{
                flex: '1 1 calc(25% - 20px)',
                minWidth: 260,
                maxWidth: 320,
                background: 'rgba(15, 23, 42, 0.6)',
                border: isLead
                  ? '1px solid rgba(255, 255, 255, 0.2)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 16,
                padding: '28px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                boxShadow: isLead
                  ? '0 16px 36px rgba(0, 0, 0, 0.6)'
                  : '0 8px 24px rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(16px)',
                transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
              }}
              whileHover={{
                y: -4,
                borderColor: 'rgba(255, 255, 255, 0.25)',
                boxShadow: '0 16px 36px rgba(0, 0, 0, 0.65)',
              }}
            >
              {/* Top Row: Icon + Position Index Badge */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: item.accent,
                    }}
                  >
                    <Icon size={22} />
                  </div>

                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#94A3B8',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      padding: '3px 8px',
                      borderRadius: 6,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    0{index + 1}
                  </span>
                </div>

                {/* Badge Category */}
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: item.accent,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    marginBottom: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      backgroundColor: item.accent,
                    }}
                  />
                  {item.badge}
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: '#FFFFFF',
                    margin: '0 0 10px',
                    lineHeight: 1.3,
                  }}
                >
                  {item.title}
                </h3>

                {/* Description */}
                <p
                  style={{
                    fontSize: 13.5,
                    color: '#94A3B8',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {item.description}
                </p>
              </div>

              {/* Bottom Feature Tag */}
              <div
                style={{
                  marginTop: 24,
                  paddingTop: 16,
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: '#CBD5E1',
                    fontWeight: 500,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <CheckCircle2 size={13} style={{ color: item.accent }} />
                  {item.tag}
                </span>

                <span
                  style={{
                    fontSize: 10,
                    color: isLead ? '#CBD5E1' : '#64748B',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  {isLead ? 'Priority' : 'Active'}
                </span>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
