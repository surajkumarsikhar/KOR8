'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/intro';
import { process } from '@/content/site';
import { cn } from '@/lib/utils';
import Reveal from '@/components/ui/Reveal';

/** Fractions along the path where each step sits (matches the curve). */
const AT = [0.08, 0.36, 0.63, 0.9];
const PATH =
  'M500,0 C500,120 160,160 160,300 S500,520 820,600 S840,900 500,1000 S140,1180 180,1320 S520,1520 820,1600 S700,1880 500,2000';

/** A long curved path draws as you scroll; a red dot rides it and lights each step. */
export default function Process() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const steps = gsap.utils.toArray<HTMLElement>('[data-step]');
      if (prefersReducedMotion()) {
        gsap.set(steps, { opacity: 1 });
        return;
      }
      gsap.set(steps, { opacity: 0.12, y: 30 });
      const lit = steps.map(() => false);

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '[data-path-wrap]',
          start: 'top 60%',
          end: 'bottom 60%',
          scrub: 0.8,
          onUpdate: (self) => {
            AT.forEach((a, i) => {
              const on = self.progress >= a - 0.05;
              if (on !== lit[i]) {
                lit[i] = on;
                gsap.to(steps[i], { opacity: on ? 1 : 0.12, y: on ? 0 : 30, duration: 1, ease: 'power3.out', overwrite: true });
              }
            });
          },
        },
      });
      tl.fromTo('[data-path]', { drawSVG: '0%' }, { drawSVG: '100%' }, 0).to(
        '[data-runner]',
        { motionPath: { path: '[data-path]', align: '[data-path]', alignOrigin: [0.5, 0.5] } },
        0,
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} id="process" className="relative px-5 py-[20vh] md:px-10">
      <div className="mx-auto max-w-[1280px]">
        <p className="label mb-4">[ process ] · 04</p>
        <Reveal className="headline max-w-[12ch] text-[clamp(2.5rem,6vw,6rem)]">How we work.</Reveal>

        <div data-path-wrap className="relative mt-16 h-[1700px] max-h-[220svh]">
          <svg viewBox="0 0 1000 2000" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
            <path d={PATH} fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <path data-path d={PATH} fill="none" stroke="#fff" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          </svg>
          <div data-runner className="absolute left-0 top-0 h-3.5 w-3.5 rounded-full bg-accent shadow-[0_0_24px_6px_rgb(240_0_1/0.55)]" aria-hidden="true" />

          <ol>
            {process.map((s, i) => (
              <li
                key={s.title}
                data-step
                className={cn('absolute w-[min(78%,420px)]', i % 2 === 0 ? 'right-0 md:right-[4%]' : 'left-0 md:left-[4%]')}
                style={{ top: `${AT[i] * 100}%` }}
              >
                <p className="label mb-3 tabular-nums">{String(i + 1).padStart(2, '0')} / {String(process.length).padStart(2, '0')}</p>
                <h3 className="font-display text-[clamp(2.25rem,4.5vw,4rem)] leading-none tracking-[-0.03em]">{s.title}.</h3>
                <p className="mt-3 text-white/60">{s.line}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

