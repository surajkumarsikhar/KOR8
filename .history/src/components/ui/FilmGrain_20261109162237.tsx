'use client';

import { useEffect } from 'react';

interface FilmGrainProps {
  /** 0.04–0.06 per the plan. */
  opacity?: number;
}

const TILE = 192;

/**
 * Generates one tileable noise texture, publishes it as the CSS variable
 * `--grain` (reused inside giant headline letters), and renders a fixed
 * overlay that shifts the tile in 10 steps/s via CSS — no per-frame JS.
 */
export default function FilmGrain({ opacity = 0.05 }: FilmGrainProps) {
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = TILE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = ctx.createImageData(TILE, TILE);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);

    document.documentElement.style.setProperty('--grain', `url(${canvas.toDataURL('image/png')})`);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] overflow-hidden mix-blend-overlay"
      style={{ opacity: opacity * 2.5 }}
    >
      <div className="grain-layer" />
    </div>
  );
}
