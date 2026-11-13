'use client';

import { useEffect, useRef } from 'react';
import { formatTimecode } from '@/lib/utils';

/** Seconds of "footage" the full page scroll represents. */
const RUNTIME_S = 150;

/**
 * Viewfinder HUD — locked to three elements: REC dot, running timecode,
 * corner brackets. Phones show only the REC dot. Timecode is written
 * straight to the DOM (no React re-render per scroll frame).
 */
export default function ViewfinderHUD() {
  const tc = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (tc.current) tc.current.textContent = formatTimecode(p * RUNTIME_S);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 text-white">
      {/* REC + timecode — bottom-left, above the rail */}
      <div className="absolute bottom-5 left-5 flex items-center gap-3 font-mono text-[11px] tracking-[0.14em] md:bottom-14 md:left-8">
        <span className="flex items-center gap-2 text-accent">
          <span className="h-2 w-2 animate-[rec_1.6s_steps(1)_infinite] rounded-full bg-accent" />
          REC
        </span>
        <span ref={tc} className="hidden opacity-50 md:inline">
          00:00:00:00
        </span>
      </div>

      {/* Corner brackets */}
      <div className="hidden opacity-30 md:block">
        {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
          <span
            key={c}
            className="absolute h-6 w-6 border-white"
            style={{
              top: c[0] === 't' ? 'var(--hud-inset)' : undefined,
              bottom: c[0] === 'b' ? 'var(--hud-inset)' : undefined,
              left: c[1] === 'l' ? 'var(--hud-inset)' : undefined,
              right: c[1] === 'r' ? 'var(--hud-inset)' : undefined,
              borderTopWidth: c[0] === 't' ? 1 : 0,
              borderBottomWidth: c[0] === 'b' ? 1 : 0,
              borderLeftWidth: c[1] === 'l' ? 1 : 0,
              borderRightWidth: c[1] === 'r' ? 1 : 0,
            }}
          />
        ))}
      </div>

      <style>{`@keyframes rec { 0%,100% { opacity: 1 } 50% { opacity: 0.15 } }`}</style>
    </div>
  );
}
