'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { markReady, prefersReducedMotion } from '@/lib/intro';
import { getLenis } from '@/components/layout/SmoothScroll';

const SIZE = 300;

const RINGS = [
  { radius: 20, count: 8 },
  { radius: 35, count: 12 },
  { radius: 50, count: 16 },
  { radius: 65, count: 20 },
  { radius: 80, count: 24 },
];

const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Pulsing dot rings, 000 → 100 counter, wordmark fill,
 * then a clip-path wipe upward reveals the hero.
 */
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progress = useRef(0); // 0 → 1, written by GSAP, read by the canvas loop
  const [done, setDone] = useState(false);

  /* ---------- Dot-ring canvas ---------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.scale(dpr, dpr);

    const cx = SIZE / 2;
    const cy = SIZE / 2;
    const reduced = prefersReducedMotion();

    let raf = 0;
    let last = 0;
    let time = 0;

    const draw = (ts: number) => {
      if (!last) last = ts;
      if (!reduced) time += (ts - last) * 0.001;
      last = ts;

      ctx.clearRect(0, 0, SIZE, SIZE);

      // Center dot
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fill();

      RINGS.forEach((ring, ri) => {
        // Rings appear one by one as loading progresses
        const reveal = reduced ? 1 : smoothstep(ri * 0.15, ri * 0.15 + 0.2, progress.current);
        if (reveal <= 0) return;

        const pulseTime = time * 2 - ri * 0.4;
        const radiusPulse = easeInOutSine((Math.sin(pulseTime) + 1) / 2) * 6 - 3;
        const r = ring.radius + radiusPulse;

        for (let i = 0; i < ring.count; i++) {
          const angle = (i / ring.count) * Math.PI * 2;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;

          const phase = (Math.sin(pulseTime + i * 0.2) + 1) / 2;
          const opacity = (0.3 + easeInOutSine(phase) * 0.7) * reveal;

          // white → #ddd blend on the pulse peak
          const blend = smoothstep(0.2, 0.8, (Math.sin(pulseTime) + 1) / 2);
          const c = Math.round(255 - (255 - 221) * blend);

          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${c},${c},${c},${opacity})`;
          ctx.fill();
        }
      });

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ---------- Timeline ---------- */
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
        gsap.to(el, {
          autoAlpha: 0,
          duration: 0.4,
          onComplete: finish,
        });

        return () => cancelAnimationFrame(lock);
      }

      const n = { v: 0 };

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
      });

      tl.fromTo(
        '[data-frame]',
        { drawSVG: '0%' },
        { drawSVG: '100%', duration: 1.4 },
        0,
      )
        .to(
          n,
          {
            v: 100,
            duration: 1.4,
            onUpdate: () => {
              const v = Math.round(n.v);
              progress.current = n.v / 100;
              count.textContent = String(v).padStart(3, '0');
              pct.textContent = `${v}%`;
            },
          },
          0,
        )
        .fromTo(
          '[data-fill]',
          { clipPath: 'inset(100% 0 0 0)' },
          {
            clipPath: 'inset(0% 0 0 0)',
            duration: 0.5,
            ease: 'power3.out',
          },
          1.2,
        )
        .add(markReady, 1.6)
        .to(
          el,
          {
            clipPath: 'inset(0 0 100% 0)',
            duration: 0.9,
            ease: 'power3.inOut',
          },
          1.6,
        )
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
      {/* Viewport frame */}
      <svg
        className="absolute inset-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)] overflow-visible"
        aria-hidden="true"
      >
        <rect
          data-frame
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="none"
          stroke="rgb(255 255 255 / 0.25)"
          strokeWidth="1"
        />
      </svg>

      {/* Dot rings */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ width: SIZE, height: SIZE }}
        className="max-h-[40vh] max-w-[80vw]"
      />

      {/* Counter */}
      <span
        data-count
        className="mt-2 font-mono text-5xl leading-none tracking-tighter text-white tabular-nums md:text-6xl"
      >
        000
      </span>

      {/* Wordmark: outline → fill */}
      <div className="relative mt-6 aspect-[5/1] w-[min(60vw,500px)] overflow-hidden">
        <img
          src="/images/wordmark-outline.svg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div
          data-fill
          className="absolute inset-0"
          style={{ clipPath: 'inset(100% 0 0 0)' }}
        >
          <img
            src="/images/wordmark.svg"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-center"
          />
        </div>
      </div>

      {/* Loading percentage */}
      <p className="label absolute bottom-10">
        Loading kor8.in (<span data-pct>0%</span>)
      </p>
    </div>
  );
}