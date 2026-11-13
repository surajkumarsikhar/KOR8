'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';

/**
 * Contextual cursor pill. Any element with `data-cursor="Play"` (or any label)
 * shows the red pill while hovered. Disabled on touch / coarse pointers.
 */
export default function CursorPill() {
  const pillRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState('');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  }, []);

  useEffect(() => {
    if (!enabled || !pillRef.current) return;
    const pill = pillRef.current;
    const xTo = gsap.quickTo(pill, 'x', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(pill, 'y', { duration: 0.5, ease: 'power3.out' });

    const onMove = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-cursor]');
      setLabel(target?.dataset.cursor ?? '');
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [enabled]);

  if (!enabled) return null;
  const visible = label !== '';

  return (
    <div
      ref={pillRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[70]"
    >
      <div
        className="-translate-x-1/2 -translate-y-1/2 rounded-full bg-accent px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-[opacity,scale] duration-500 ease-out-expo"
        style={{ opacity: visible ? 1 : 0, scale: visible ? '1' : '0.4' }}
      >
        {label || '\u00a0'}
      </div>
    </div>
  );
}
