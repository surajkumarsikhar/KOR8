'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { gsap, useGSAP } from '@/lib/gsap';
import { markReady, prefersReducedMotion } from '@/lib/intro';
import { getLenis } from './SmoothScroll';
import { BRAND } from '@/content/cinematic';
import type { GimbalControls } from '@/components/ui/GimbalCamera';

const GimbalCamera = dynamic(() => import('@/components/ui/GimbalCamera'), { ssr: false });
type Phase = 'intro' | 'ready' | 'shot';

export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const opening = useRef<gsap.core.Timeline | null>(null);
  const phase = useRef<Phase>('intro');
  const controls = useRef<GimbalControls>({ zoom: 1, follow: false, flash: 0, sweep: 0 });
  const sceneReady = useRef(false);
  const startIntro = useRef<(() => void) | null>(null);

  const finish = () => {
    document.documentElement.style.overflow = '';
    getLenis()?.start();
    try { sessionStorage.setItem('kor8:intro-seen', '1'); } catch {}
    setDone(true);
    document.getElementById('main-content')?.focus({ preventScroll: true });
  };

  const { contextSafe } = useGSAP(() => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = 'hidden';
    const lock = requestAnimationFrame(() => {
      // A cached intro may finish before this frame runs; never re-lock it.
      if (phase.current !== 'shot') getLenis()?.stop();
    });

    let seen = false;
    try { seen = sessionStorage.getItem('kor8:intro-seen') === '1'; } catch {}
    if (prefersReducedMotion() || seen) {
      phase.current = 'shot';
      markReady();
      gsap.to(el, { opacity: 0, duration: 0.15, onComplete: finish });
      return () => {
        cancelAnimationFrame(lock);
        html.style.overflow = previousOverflow;
        getLenis()?.start();
      };
    }

    phase.current = 'intro';
    Object.assign(controls.current, { zoom: 1, follow: false, flash: 0, sweep: 0 });
    gsap.set(q('[data-flash], [data-aperture]'), { autoAlpha: 0 });
    gsap.set(q('[data-cta]'), { autoAlpha: 0, y: 8 });
    gsap.set(q('[data-outline]'), { clipPath: 'inset(0 100% 0 0)' });
    gsap.set(q('[data-fill]'), { clipPath: 'inset(100% 0 0 0)' });
    const intro = gsap.timeline({ paused: true });
    opening.current = intro;
    intro
      .to(controls.current, { sweep: 1, duration: 1.6, ease: 'sine.inOut' }, 0)
      .to(controls.current, { zoom: 0, duration: 3.1, ease: 'power3.inOut' }, 1.1)
      .fromTo(q('[data-frame]'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.7 }, 2.9)
      .to(q('[data-outline]'), { clipPath: 'inset(0 0% 0 0)', duration: 0.9 }, 3.6)
      .to(q('[data-fill]'), { clipPath: 'inset(0% 0 0 0)', duration: 0.65 }, 4.05)
      .to(q('[data-cta]'), { autoAlpha: 1, y: 0, duration: 0.6 }, 4.5)
      .add(() => {
        controls.current.follow = true;
        phase.current = 'ready';
        q('[data-cta]')[0]?.focus({ preventScroll: true });
      }, 5.1);

    let started = false;
    const play = () => {
      if (started || phase.current === 'shot') return;
      started = true;
      intro.play(0);
    };
    startIntro.current = play;
    if (sceneReady.current) play();
    const fallback = window.setTimeout(play, 3000);
    return () => {
      cancelAnimationFrame(lock);
      clearTimeout(fallback);
      startIntro.current = null;
      html.style.overflow = previousOverflow;
      getLenis()?.start();
    };
  }, { scope: root });

  const shoot = contextSafe(() => {
    if (phase.current !== 'ready') return;
    phase.current = 'shot';
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const heading = document.querySelector('[data-title]')?.getBoundingClientRect();
    const center = heading ? heading.top + heading.height / 2 : innerHeight / 2;
    el.style.setProperty('--slit-center', center + 'px');
    gsap.set(q('[data-flash]'), { transformOrigin: '50% ' + center + 'px' });

    opening.current = gsap.timeline()
      .to(controls.current, { flash: 1, duration: 0.06 }, 0)
      .to(q('[data-flash]'), { autoAlpha: 1, duration: 0.06 }, 0.04)
      .set(q('[data-intro-scene]'), { autoAlpha: 0 }, 0.12)
      .set(q('[data-skip]'), { autoAlpha: 0 }, 0.12)
      .set(q('[data-aperture]'), { autoAlpha: 1 }, 0.12)
      .set(el, { backgroundColor: 'transparent' }, 0.12)
      // Start the actual hero beneath the opaque flash, keeping its layout fixed.
      .add(markReady, 0.12)
      .to(controls.current, { flash: 0, duration: 0.12 }, 0.12)
      .to(q('[data-flash]'), { scaleY: 0.006, duration: 0.65, ease: 'power3.inOut' }, 0.18)
      .to(q('[data-flash]'), { autoAlpha: 0, duration: 0.16 }, 0.83)
      // The black covers expose a real, transparent opening onto the homepage.
      .to(q('[data-aperture="top"]'), { yPercent: -100, duration: 1.5, ease: 'power3.inOut' }, 1.35)
      .to(q('[data-aperture="bottom"]'), { yPercent: 100, duration: 1.5, ease: 'power3.inOut' }, 1.35)
      .add(finish, 2.85);
  });

  const skip = contextSafe(() => {
    opening.current?.kill();
    startIntro.current = null;
    phase.current = 'shot';
    markReady();
    gsap.to(root.current, { autoAlpha: 0, duration: 0.2, onComplete: finish });
  });

  if (done) return null;
  return (
    <div ref={root} className="fixed inset-0 z-[100] overflow-hidden bg-black select-none" aria-label="KOR8 introduction">
      <button data-skip type="button" onClick={skip} className="absolute right-8 top-8 z-20 px-3 py-3 font-mono text-[10px] tracking-widest text-white/60">SKIP INTRO ↗</button>
      <div data-intro-scene className="absolute inset-0">
        <div className="pointer-events-none absolute inset-0">
          <GimbalCamera controls={controls} onReady={() => {
            sceneReady.current = true;
            startIntro.current?.();
          }} />
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-black via-black/70 to-transparent" />
        <svg className="pointer-events-none absolute inset-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)] overflow-visible" aria-hidden="true">
          <rect data-frame width="100%" height="100%" fill="none" stroke="rgb(242 240 236 / 0.3)" strokeWidth="1" />
        </svg>
        <div className="absolute inset-x-0 bottom-[9vh] flex flex-col items-center">
          <div className="relative w-[min(60vw,420px)]">
            <img data-outline src={BRAND.wordmarkOutline} alt="KOR8" className="block h-auto w-full" />
            <div data-fill className="absolute inset-0"><img src={BRAND.wordmark} alt="" className="block h-auto w-full" /></div>
          </div>
          <button data-cta type="button" onClick={shoot} className="invisible mt-6 flex min-h-11 items-center gap-3 px-4 font-mono text-[10px] tracking-[0.2em] text-[#f2f0ec]">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-[#e01835]" />
            CLICK TO BEGIN THE STORY
          </button>
        </div>
      </div>
      <div data-aperture="top" aria-hidden="true" className="pointer-events-none invisible absolute inset-x-0 top-0 bg-black" style={{ height: 'calc(var(--slit-center, 50vh) - 3px)' }} />
      <div data-aperture="bottom" aria-hidden="true" className="pointer-events-none invisible absolute inset-x-0 bottom-0 bg-black" style={{ height: 'calc(100% - var(--slit-center, 50vh) - 3px)' }} />
      <div data-flash aria-hidden="true" className="pointer-events-none invisible absolute inset-0 bg-white" />
    </div>
  );
}

