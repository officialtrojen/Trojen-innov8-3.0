'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface Scroll3DCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Depth multiplier for scroll-driven Z translation (default 40) */
  depth?: number;
  /** Stagger delay in ms for entrance animation (default 0) */
  delay?: number;
}

export default function Scroll3DCard({
  children,
  className = '',
  style = {},
  depth = 40,
  delay = 0,
}: Scroll3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mouseRX, setMouseRX] = useState(0);
  const [mouseRY, setMouseRY] = useState(0);
  const [mouseScale, setMouseScale] = useState(1);
  const [scrollProgress, setScrollProgress] = useState(0); // 0 = above viewport, 1 = centered
  const [isInView, setIsInView] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const rafRef = useRef<number>(0);

  // Compute scroll-based progress for this card
  const updateScrollProgress = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const windowH = window.innerHeight;

    // progress: 0 when card bottom enters viewport, 1 when card center is at viewport center
    const cardCenter = rect.top + rect.height / 2;
    const raw = 1 - (cardCenter - windowH * 0.5) / (windowH * 0.6);
    const clamped = Math.max(0, Math.min(1, raw));
    setScrollProgress(clamped);
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    // IntersectionObserver for in-view detection
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setIsInView(visible);
        if (visible && !hasEntered) {
          setTimeout(() => setHasEntered(true), delay);
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
    );
    observer.observe(card);

    // Scroll handler with rAF throttle
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        rafRef.current = requestAnimationFrame(() => {
          updateScrollProgress();
          ticking = false;
        });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateScrollProgress(); // Initial

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [updateScrollProgress, delay, hasEntered]);

  // Mouse tilt handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    setMouseRY(((x - centerX) / centerX) * 10);
    setMouseRX(((centerY - y) / centerY) * 10);
    setMouseScale(1.02);
  };

  const handleMouseLeave = () => {
    setMouseRX(0);
    setMouseRY(0);
    setMouseScale(1);
  };

  // Scroll-driven 3D values
  const scrollRotateX = (1 - scrollProgress) * 12;       // tilts back when far, flattens on approach
  const scrollTranslateZ = (1 - scrollProgress) * -depth; // pushes back in Z, comes forward on scroll
  const scrollTranslateY = hasEntered ? 0 : 30;           // entrance slide-up
  const glowOpacity = scrollProgress * 0.5;                // glow intensifies as card scrolls into center

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`scroll-3d-card ${className}`}
      style={{
        perspective: 1200,
        transformStyle: 'preserve-3d',
        transition: hasEntered
          ? 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease'
          : `transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, opacity 0.8s ease ${delay}ms`,
        transform: [
          `perspective(1200px)`,
          `rotateX(${scrollRotateX + mouseRX}deg)`,
          `rotateY(${mouseRY}deg)`,
          `translateZ(${scrollTranslateZ}px)`,
          `translateY(${scrollTranslateY}px)`,
          `scale(${mouseScale})`,
        ].join(' '),
        opacity: hasEntered ? (isInView ? 1 : 0.15) : 0,
        willChange: 'transform, opacity',
        position: 'relative',
        ...style,
      }}
    >
      {/* Scroll-reactive glow border overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: -1,
          borderRadius: 'inherit',
          pointerEvents: 'none',
          background: `linear-gradient(135deg, rgba(99, 102, 241, ${glowOpacity}), rgba(139, 92, 246, ${glowOpacity * 0.6}), transparent 60%)`,
          opacity: isInView ? 1 : 0,
          transition: 'opacity 0.4s ease',
          zIndex: 0,
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          padding: 1,
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
