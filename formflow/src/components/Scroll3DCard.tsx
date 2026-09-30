'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Scroll3DCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function Scroll3DCard({ children, className = '', style = {} }: Scroll3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [scale, setScale] = useState(1);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    // IntersectionObserver to activate 3D entry animation on scroll into view
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    observer.observe(card);

    // Scroll tilt effect based on element position relative to viewport center
    const handleScroll = () => {
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const cardCenterY = rect.top + rect.height / 2;
      const offsetFromCenter = (cardCenterY - windowHeight / 2) / (windowHeight / 2);

      // Subtle tilt based on scroll position in viewport
      if (rect.top < windowHeight && rect.bottom > 0) {
        setRotateX(offsetFromCenter * -6); // max 6 deg tilt
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rY = ((x - centerX) / centerX) * 12; // max 12 deg
    const rX = ((centerY - y) / centerY) * 12;

    setRotateX(rX);
    setRotateY(rY);
    setScale(1.02);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setScale(1);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease, filter 0.6s ease',
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale}) translateY(${isInView ? 0 : 30}px)`,
        opacity: isInView ? 1 : 0.4,
        willChange: 'transform, opacity',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
