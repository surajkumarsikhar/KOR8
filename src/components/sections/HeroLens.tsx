'use client';

import { forwardRef } from 'react';

/**
 * Placeholder hero object: a cinema lens built from CSS layers.
 * It doubles as the low-end / reduced-motion fallback.
 * TODO: when the GLB (< 2 MB) arrives, lazy-load a Three.js canvas here
 * (dynamic import, after first paint) and keep this as the fallback.
 */
const HeroLens = forwardRef<HTMLDivElement>(function HeroLens(_, ref) {
  return (
    <div ref={ref} className="relative aspect-square w-[min(68vw,520px)] [transform-style:preserve-3d]" aria-hidden="true">
      {/* Outer barrel with knurled grip */}
      <div
        data-knurl
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'repeating-conic-gradient(from 0deg, #1c1c1c 0deg 2deg, #0b0b0b 2deg 4deg)',
          boxShadow: '0 40px 120px -20px rgb(0 0 0 / 0.9), inset 0 0 0 1px rgb(255 255 255 / 0.08)',
        }}
      />
      {/* Focus ring with distance scale */}
      <div className="absolute inset-[7%] rounded-full bg-[#0d0d0d] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.1)]">
        <svg data-scale viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
          <defs>
            <path id="lens-ring" d="M50,50 m-43,0 a43,43 0 1,1 86,0 a43,43 0 1,1 -86,0" />
          </defs>
          <text fill="rgb(255 255 255 / 0.45)" fontSize="3.2" fontFamily="var(--font-mono)" letterSpacing="0.6">
            <textPath href="#lens-ring">
              ∞ · 10 · 5 · 3 · 2 · 1.5 · 1.2 · 1 · 0.8 · 0.6 m · KOR8 CINE 50mm T1.5 ·
            </textPath>
          </text>
        </svg>
      </div>
      {/* Front element housing */}
      <div className="absolute inset-[18%] rounded-full bg-gradient-to-b from-[#222] to-[#050505] shadow-[inset_0_2px_0_rgb(255_255_255/0.08)]" />
      {/* Glass */}
      <div
        className="absolute inset-[23%] overflow-hidden rounded-full"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, #050505 0 28%, #0b0d14 46%, #12131c 62%, #050505 74%)',
          boxShadow: 'inset 0 0 60px rgb(0 0 0 / 0.95), inset 0 0 0 1px rgb(255 255 255 / 0.06)',
        }}
      >
        {/* Coatings: violet/green flare + a single red reflection (the accent) */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_25%,rgb(140_120_255/0.25),transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_75%,rgb(80_255_190/0.10),transparent_40%)]" />
        <div className="absolute left-[58%] top-[30%] h-[9%] w-[9%] rounded-full bg-accent/80 blur-[6px]" />
        <div className="absolute left-[28%] top-[22%] h-[18%] w-[30%] -rotate-[30deg] rounded-full bg-white/15 blur-md" />
      </div>
    </div>
  );
});

export default HeroLens;

