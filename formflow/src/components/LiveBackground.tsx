'use client';

import React, { useEffect, useRef } from 'react';

/**
 * LiveBackground — Exact same animated starfield canvas as the landing page.
 * Deep space #020306 bg with multi-depth twinkling stars + mouse parallax.
 */
export default function LiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Generate stars identical to landing page
    const STAR_COUNT = 280;
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 1.4 + 0.2,
      alpha: Math.random() * 0.6 + 0.2,
      z: Math.random() * 2.5 + 0.5,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinkleOffset: Math.random() * Math.PI * 2,
    }));

    let mouseX = 0;
    let mouseY = 0;
    let animationId: number;
    let frame = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      mouseY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('resize', handleResize);

    const render = () => {
      frame++;
      const { width, height } = canvas;
      ctx.fillStyle = '#020306';
      ctx.fillRect(0, 0, width, height);

      stars.forEach((star) => {
        const brightness = star.alpha + Math.sin(frame * star.twinkleSpeed + star.twinkleOffset) * 0.25;
        const clamped = Math.max(0.1, Math.min(1, brightness));
        const shiftX = mouseX * (star.z * 5);
        const shiftY = mouseY * (star.z * 5);

        ctx.beginPath();
        ctx.arc(star.x + shiftX, star.y + shiftY, star.radius, 0, Math.PI * 2);
        ctx.fillStyle =
          star.z > 2.5
            ? `rgba(224, 242, 254, ${clamped})`
            : star.z > 1.5
            ? `rgba(203, 213, 225, ${clamped * 0.8})`
            : `rgba(148, 163, 184, ${clamped * 0.5})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        background: '#020306',
      }}
    />
  );
}
