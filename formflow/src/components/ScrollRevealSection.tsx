'use client';

import React, { useRef, useState, useEffect } from 'react';

interface ScrollRevealSectionProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Full-section 3D scroll reveal wrapper.
 * Applies a perspective tilt + depth shift + opacity
 * as the section enters the viewport from below.
 */
export default function ScrollRevealSection({
  children,
  className = '',
  style = {},
}: ScrollRevealSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        rafRef.current = requestAnimationFrame(() => {
          const el = ref.current;
          if (!el) { ticking = false; return; }

          const rect = el.getBoundingClientRect();
          const wh = window.innerHeight;
          // progress: 0 at bottom of viewport, 1 when fully visible
          const raw = 1 - (rect.top / wh);
          setProgress(Math.max(0, Math.min(1, raw)));
          ticking = false;
        });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Eased progress for smoother animations
  const eased = progress < 0.5
    ? 2 * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 2) / 2;

  const rotateX = (1 - eased) * 6;
  const translateY = (1 - eased) * 40;
  const opacity = 0.2 + eased * 0.8;
  const scale = 0.96 + eased * 0.04;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        perspective: 1400,
        transformStyle: 'preserve-3d',
        transform: `perspective(1400px) rotateX(${rotateX}deg) translateY(${translateY}px) scale(${scale})`,
        opacity,
        transition: 'transform 0.1s linear, opacity 0.1s linear',
        willChange: 'transform, opacity',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
