'use client';

import { useRef, useState } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { markReady, prefersReducedMotion } from '@/lib/intro';
import { getLenis } from '@/components/layout/SmoothScroll';
import Wordmark from '@/components/ui/Wordmark';

/**
 * 000 → 100 counter, frame lines drawn around the viewport, wordmark fills,
 * then a clip-path wipe upward reveals the hero. Total ≈ 2s.
 */
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useGSAP(
    () => {
      const el = root.current!;
      const count = el.querySelector<HTMLElement>('[data-count]')!;
      const pct = el.querySelector<HTMLElement>('[data-pct]')!;
      const html = document.documentElement;
      html.style.overflow = 'hidden';
      const lock = requestAnimationFrame(() => getLenis()?.stop());

      const finish = () => {
        html.style.overflow = '';
        getLenis()?.start();
        setDone(true);
      };

      if (prefersReducedMotion()) {
        markReady();
        gsap.to(el, { autoAlpha: 0, duration: 0.4, onComplete: finish });
        return;
      }

      const n = { v: 0 };
      const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
      tl.fromTo('[data-frame]', { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.4 }, 0)
        .to(
          n,
          {
            v: 100,
            duration: 1.4,
            onUpdate: () => {
              const v = Math.round(n.v);
              count.textContent = String(v).padStart(3, '0');
              pct.textContent = `${v}%`;
            },
          },
          0,
        )
        .fromTo('[data-fill]', { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 0.5, ease: 'power3.out' }, 1.2)
        .add(markReady, 1.6)
        .to(el, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'power3.inOut' }, 1.6)
        .add(finish);

      return () => cancelAnimationFrame(lock);
    },
    { scope: root },
  );

  if (done) return null;

  return (
    <div
      ref={root}
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black"
      style={{ clipPath: 'inset(0 0 0 0)' }}
    >
      <svg className="absolute inset-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)] overflow-visible" aria-hidden="true">
        <rect data-frame x="0" y="0" width="100%" height="100%" fill="none" stroke="rgb(255 255 255 / 0.25)" strokeWidth="1" />
      </svg>

      <span data-count className="font-mono text-[18vw] leading-none tracking-tighter text-white tabular-nums md:text-[10vw]">
        000
      </span>

      <div className="relative mt-6 text-5xl md:text-7xl">
        <span className="text-transparent [-webkit-text-stroke:1px_rgb(255_255_255/0.5)]" aria-hidden="true">
          <Wordmark />
        </span>
        <span data-fill className="absolute inset-0" style={{ clipPath: 'inset(100% 0 0 0)' }}>
          <Wordmark />
        </span>
      </div>

      <p className="label absolute bottom-10">
        Loading kor8.in (<span data-pct>0%</span>)
      </p>
    </div>
  );
}
