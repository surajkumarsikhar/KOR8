'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { gsap, useGSAP } from '@/lib/gsap';
import { markReady, prefersReducedMotion } from '@/lib/intro';
import { getLenis } from '@/components/layout/SmoothScroll';
import type { GimbalControls } from '@/components/ui/GimbalCamera';

// Module scope on purpose: dynamic() inside a component remounts every render.
const GimbalCamera = dynamic(() => import('@/components/ui/GimbalCamera'), {
  ssr: false,
  loading: () => null,
});

type Phase = 'intro' | 'ready' | 'shot';

/**
 * 1. Macro on the mirror lens, frame lines draw.
 * 2. The view pulls back (≈2.5s) to reveal the gimbal; the wordmark prints.
 * 3. The lens follows the cursor. "click to shoot" waits under the wordmark.
 * 4. Click → flash → 000 → 100 loader → clip-path wipe lands on the home page.
 */
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const [showGimbal, setShowGimbal] = useState(true);

  const phase = useRef<Phase>('intro');
  const ctl = useRef<GimbalControls>({ zoom: 1, follow: false, flash: 0 });
  const sceneReady = useRef(false); // gimbal shaders compiled
  const startIntro = useRef<(() => void) | null>(null);

  const { contextSafe } = useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const html = document.documentElement;

      html.style.overflow = 'hidden';
      const lock = requestAnimationFrame(() => getLenis()?.stop());

      const finish = () => {
        html.style.overflow = '';
        getLenis()?.start();
        setDone(true);
      };

      if (prefersReducedMotion()) {
        phase.current = 'shot';
        markReady();
        gsap.to(el, { autoAlpha: 0, duration: 0.4, onComplete: finish });
        return () => cancelAnimationFrame(lock);
      }

      // Start state
      phase.current = 'intro';
      ctl.current.zoom = 1;
      ctl.current.follow = false;
      ctl.current.flash = 0;

      gsap.set(q('[data-count],[data-loading],[data-flash]'), { autoAlpha: 0 });
      gsap.set(q('[data-cta]'), { autoAlpha: 0, y: 10 });
      gsap.set(q('[data-outline]'), { clipPath: 'inset(0 100% 0 0)' });
      gsap.set(q('[data-fill]'), { clipPath: 'inset(100% 0 0 0)' });

      // Intro, held until the 3D scene is compiled so the pull-away never hitches
      const intro = gsap.timeline({
        paused: true,
        defaults: { ease: 'power2.inOut' },
      });

      intro
        .fromTo(
          q('[data-frame]'),
          { drawSVG: '0%' },
          { drawSVG: '100%', duration: 1.8 },
          0,
        )
        // hold on the lens, then pull away
        .to(ctl.current, { zoom: 0, duration: 2.2, ease: 'power3.inOut' }, 0.5)
        .add(() => {
          ctl.current.follow = true;
        }, 2.4)
        // wordmark prints left to right, then fills
        .to(
          q('[data-outline]'),
          { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'power1.inOut' },
          2.5,
        )
        .to(
          q('[data-fill]'),
          { clipPath: 'inset(0% 0 0 0)', duration: 0.5, ease: 'power3.out' },
          3.1,
        )
        .to(
          q('[data-cta]'),
          { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' },
          3.4,
        )
        .add(() => {
          phase.current = 'ready';
          el.style.cursor = 'pointer';
          el.querySelector<HTMLElement>('[data-cta]')?.focus({ preventScroll: true });
        }, 3.5);

      let started = false;
      const play = () => {
        if (started) return;
        started = true;
        intro.play(0);
      };
      startIntro.current = play;
      if (sceneReady.current) play();
      const fallback = window.setTimeout(play, 3000); // never hang on a slow chunk

      return () => {
        cancelAnimationFrame(lock);
        window.clearTimeout(fallback);
        startIntro.current = null;
      };
    },
    { scope: root },
  );

  const onGimbalReady = () => {
    sceneReady.current = true;
    startIntro.current?.();
  };

  const shoot = contextSafe(() => {
    if (phase.current !== 'ready') return;
    phase.current = 'shot';

    const el = root.current!;
    el.style.cursor = '';
    const q = gsap.utils.selector(el);
    const html = document.documentElement;
    const count = el.querySelector<HTMLElement>('[data-count]')!;
    const pct = el.querySelector<HTMLElement>('[data-pct]')!;
    const column = el.querySelector<HTMLElement>('[data-column]')!;

    // Re-centre the type column while the screen is white
    const r = column.getBoundingClientRect();
    const dy = window.innerHeight / 2 - (r.top + r.height / 2);

    const finish = () => {
      html.style.overflow = '';
      getLenis()?.start();
      setDone(true);
    };

    const n = { v: 0 };

    gsap
      .timeline({ defaults: { ease: 'power2.inOut' } })
      // flash
      .to(q('[data-flash]'), { autoAlpha: 1, duration: 0.07, ease: 'none' }, 0)
      .to(ctl.current, { flash: 1, duration: 0.07, ease: 'none' }, 0)
      // swap scenes under the white
      .set(q('[data-gimbal],[data-cta]'), { autoAlpha: 0 }, 0.07)
      .set(q('[data-count],[data-loading]'), { autoAlpha: 1 }, 0.07)
      .set(column, { y: dy }, 0.07)
      .add(() => setShowGimbal(false), 0.08)
      .to(q('[data-flash]'), { autoAlpha: 0, duration: 0.7, ease: 'power2.out' }, 0.1)
      .to(ctl.current, { flash: 0, duration: 0.6, ease: 'power2.out' }, 0.1)
      // loader
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
        0.15,
      )
      // land on the home page
      .add(markReady, 1.7)
      .to(
        el,
        { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'power3.inOut' },
        1.7,
      )
      .add(finish);
  });

  if (done) return null;

  return (
    <div
      ref={root}
      onClick={shoot}
      className="fixed inset-0 z-[100] bg-black select-none"
      style={{ clipPath: 'inset(0 0 0 0)' }}
    >
      {/* Gimbal camera */}
      {showGimbal && (
        <div data-gimbal className="pointer-events-none absolute inset-0">
          <GimbalCamera controls={ctl} onReady={onGimbalReady} />
        </div>
      )}

      {/* Fades the handle so the type reads cleanly */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black via-black/80 to-transparent"
      />

      {/* Viewport frame */}
      <svg
        className="pointer-events-none absolute inset-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)] overflow-visible"
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

      {/* Counter (after the shot), wordmark, and the click prompt */}
      <div
        data-column
        className="pointer-events-none absolute inset-x-0 bottom-[9vh] flex flex-col items-center"
      >
        <span
          data-count
          aria-hidden="true"
          className="block font-mono text-[15vw] leading-none tracking-tighter text-white tabular-nums md:text-[8vw]"
        >
          000
        </span>

        {/* Wordmark: prints, then fills */}
        <div className="relative mt-6 w-[min(60vw,500px)]">
          <img
            data-outline
            src="/images/wordmark-outline.svg"
            alt=""
            aria-hidden="true"
            className="block h-auto max-h-[25vh] w-full object-contain"
          />
          <div data-fill className="absolute inset-0">
            <img
              src="/images/wordmark.svg"
              alt=""
              aria-hidden="true"
              className="block h-auto max-h-[25vh] w-full object-contain"
            />
          </div>
        </div>

        {/* One slot: "click to shoot" now, loading text after the shot */}
        <div className="relative mt-6 h-6 w-full">
          <button
            type="button"
            data-cta
            className="label pointer-events-auto absolute inset-0 flex items-center justify-center gap-3 whitespace-nowrap"
          >
            <span
              aria-hidden="true"
              className="size-2 animate-pulse rounded-full bg-[#ff3b1f]"
            />
            click to shoot
          </button>
          <p
            data-loading
            aria-hidden="true"
            className="label absolute inset-0 flex items-center justify-center"
          >
            Loading kor8.in (<span data-pct>0%</span>)
          </p>
        </div>
      </div>

      {/* Flash */}
      <div
        data-flash
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 bg-white"
      />
    </div>
  );
}