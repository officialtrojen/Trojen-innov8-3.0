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

    // Use IntersectionObserver only (no scroll event listeners for card positioning)
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(card);

    return () => {
      observer.disconnect();
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

    const rY = ((x - centerX) / centerX) * 8; // Max 8 deg for smooth movement
    const rX = ((centerY - y) / centerY) * 8;

    setRotateX(rX);
    setRotateY(rY);
    setScale(1.015);
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
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease',
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale}) translate3d(0, ${isInView ? 0 : 20}px, 0)`,
        opacity: isInView ? 1 : 0.3,
        willChange: 'transform, opacity',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
