'use client';

import React from 'react';

/**
 * LiveBackground — Subtle, ambient animated gradient blobs.
 *
 * Uses pure CSS animations for performance. Respects
 * prefers-reduced-motion. Never interferes with interactions.
 */
export default function LiveBackground() {
  return (
    <div className="live-bg" aria-hidden="true">
      <div className="live-bg__blob live-bg__blob--1" />
      <div className="live-bg__blob live-bg__blob--2" />
      <div className="live-bg__blob live-bg__blob--3" />
      <div className="live-bg__blob live-bg__blob--4" />
      <div className="live-bg__blob live-bg__blob--5" />
    </div>
  );
}
