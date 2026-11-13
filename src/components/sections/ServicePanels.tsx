'use client';

import { gsap } from '@/lib/gsap';
import type { ServiceKey } from '@/content/site';

/**
 * Media for each service + a paused timeline that plays its signature
 * animation. The Services section drives `progress()` from scroll (scrub)
 * or tweens it to 1 on hover.
 */
export function ServiceMedia({ k }: { k: ServiceKey }) {
  switch (k) {
    case 'brand':
      return (
        <div className="relative flex h-full w-full items-center justify-center">
          {/* Assembles into a K8 monogram: K = three white parts, 8 = two red rings */}
          <svg viewBox="0 0 220 150" className="w-[64%] overflow-visible">
            <rect data-p x="20" y="10" width="24" height="130" fill="#fff" />
            <polygon data-p points="44,78 108,10 140,10 66,88" fill="#fff" />
            <polygon data-p points="58,70 140,140 108,140 44,90" fill="#fff" />
            <circle data-p cx="176" cy="44" r="26" fill="none" stroke="#F00001" strokeWidth="11" />
            <circle data-p cx="176" cy="106" r="32" fill="none" stroke="#F00001" strokeWidth="11" />
            <line data-p x1="0" y1="150" x2="220" y2="150" stroke="rgb(255 255 255 / 0.25)" strokeWidth="1" />
          </svg>
          <span className="label absolute bottom-5 left-5">mark_v03.svg</span>
          <span className="label absolute bottom-5 right-5">grid 8pt</span>
        </div>
      );
    case 'ads':
      return (
        <div className="relative h-full w-full">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              data-p
              className="absolute top-1/2 aspect-[9/16] w-[32%] -translate-y-1/2 overflow-hidden rounded-[14px] border border-white/15 bg-[#0d0d0d]"
              style={{ left: `${12 + i * 26}%` }}
            >
              <div className="absolute inset-0" style={{ background: `linear-gradient(${160 + i * 40}deg, #1d1d1d, #050505 70%)` }} />
              <div className="absolute inset-x-3 bottom-3 space-y-1.5">
                <div className="h-1.5 w-3/4 rounded bg-white/40" />
                <div className="h-1.5 w-1/2 rounded bg-white/20" />
              </div>
              <span className="label absolute left-3 top-3 text-[9px]">ad_0{i + 1}.mp4</span>
              {i === 1 && <span className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-accent" />}
            </div>
          ))}
        </div>
      );
    case 'web':
      return (
        <div className="absolute inset-[10%] overflow-hidden rounded-lg border border-white/15 bg-[#0a0a0a]">
          <div className="flex h-7 items-center gap-1.5 border-b border-white/10 px-3">
            {[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 rounded-full bg-white/20" />)}
            <span className="label ml-3 text-[9px]">kor8.in</span>
          </div>
          <div data-p className="space-y-4 p-5">
            <div className="h-24 rounded bg-gradient-to-br from-white/15 to-white/[0.03]" />
            <div className="h-3 w-2/3 rounded bg-white/50" />
            <div className="h-3 w-1/2 rounded bg-white/25" />
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 6 }, (_, i) => <div key={i} className="aspect-square rounded bg-white/[0.07]" />)}
            </div>
            <div className="h-3 w-3/5 rounded bg-white/25" />
            <div className="h-20 rounded bg-white/[0.06]" />
            <div className="h-9 w-32 rounded-full bg-accent" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }, (_, i) => <div key={i} className="h-16 rounded bg-white/[0.07]" />)}
            </div>
          </div>
        </div>
      );
    case 'seo':
      return (
        <div className="absolute inset-[10%]">
          <svg viewBox="0 0 400 300" className="h-full w-full overflow-visible">
            {[60, 120, 180, 240].map((y) => <line key={y} x1="0" x2="400" y1={y} y2={y} stroke="rgb(255 255 255 / 0.08)" />)}
            <path data-p d="M0,270 C40,262 70,250 100,240 S150,232 180,200 S240,170 260,140 S320,90 340,60 S380,24 400,14" fill="none" stroke="#fff" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <circle data-dot cx="400" cy="14" r="5" fill="#F00001" />
          </svg>
          <div className="absolute left-0 top-0">
            <p className="label">organic sessions</p>
            <p className="font-display text-5xl tabular-nums">+<span data-count>0</span>%</p>
          </div>
        </div>
      );
    case 'production':
      return (
        <div className="relative h-full w-full">
          <div data-p className="absolute inset-[8%] overflow-hidden bg-[radial-gradient(circle_at_40%_40%,#2a2a2a,#050505_70%)]">
            <div className="absolute inset-0 bg-[linear-gradient(transparent_60%,rgb(0_0_0/0.8))]" />
            <span className="label absolute left-4 top-4 flex items-center gap-2 text-white"><span className="h-1.5 w-1.5 rounded-full bg-accent" />REC</span>
            <span className="label absolute bottom-4 right-4">A001_C004 · 00:00:12:08</span>
          </div>
          <svg data-iris viewBox="-50 -50 100 100" className="pointer-events-none absolute inset-[8%] h-[84%] w-[84%]">
            {Array.from({ length: 8 }, (_, i) => (
              <path key={i} d="M0,-70 L60,-34 L18,-6 Z" fill="#111" stroke="rgb(255 255 255 / 0.12)" strokeWidth="0.4" transform={`rotate(${i * 45})`} />
            ))}
          </svg>
        </div>
      );
  }
}

export function buildServiceTimeline(k: ServiceKey, el: HTMLElement): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  const parts = el.querySelectorAll<HTMLElement>('[data-p]');

  switch (k) {
    case 'brand':
      // Logo parts assemble from scattered shapes.
      tl.from(parts, {
        x: (i) => [-120, 90, -70, 110, 80, 0][i],
        y: (i) => [-70, 90, 80, -90, 70, 0][i],
        rotation: (i) => [-60, 80, -45, 30, -90, 0][i],
        scale: (i) => (i === 5 ? 1 : 0.5),
        opacity: (i) => (i === 5 ? 1 : 0),
        transformOrigin: '50% 50%',
        stagger: 0.06,
        ease: 'power3.out',
      });
      break;
    case 'ads':
      // Vertical frames slide in as a parallax stack.
      tl.from(parts, { yPercent: (i) => 140 + i * 50, rotation: (i) => [-8, 0, 8][i], opacity: 0, stagger: 0.12, ease: 'power2.out' })
        .to(parts, { y: (i) => [-14, 22, -6][i], rotation: (i) => [-4, 0, 4][i], ease: 'power1.inOut' });
      break;
    case 'web':
      // Browser pins; its own content scrolls inside the frame.
      tl.to(parts, { yPercent: -48, ease: 'power1.inOut' });
      break;
    case 'seo': {
      // Line chart draws upward while the counter ticks.
      const count = el.querySelector<HTMLElement>('[data-count]')!;
      const n = { v: 0 };
      tl.fromTo(parts, { drawSVG: '0%' }, { drawSVG: '100%', ease: 'power1.inOut' }, 0)
        .to(n, { v: 240, onUpdate: () => (count.textContent = String(Math.round(n.v))), ease: 'power1.inOut' }, 0)
        .from(el.querySelector('[data-dot]'), { scale: 0, transformOrigin: 'center', duration: 0.2 }, 0.85);
      break;
    }
    case 'production':
      // Aperture iris opens and reveals the frame.
      tl.fromTo(parts, { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)', ease: 'power2.inOut' }, 0)
        .to(el.querySelector('[data-iris]'), { rotation: 70, scale: 2.4, opacity: 0, transformOrigin: '50% 50%', ease: 'power2.inOut' }, 0);
      break;
  }
  return tl;
}

