'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { isLowEnd, onReady, prefersReducedMotion } from '@/lib/intro';
import { hero } from '@/content/site';
import AccentText from '@/components/ui/AccentText';

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const lens = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduced = prefersReducedMotion();
      const blur = !reduced && !isLowEnd();
      const lines = gsap.utils.toArray<HTMLElement>('[data-hero-line]');
      const fades = gsap.utils.toArray<HTMLElement>('[data-fade]');

      gsap.set(lines, { yPercent: 105, opacity: 0, filter: blur ? 'blur(12px)' : 'none' });
      gsap.set(fades, { opacity: 0, y: 16 });
      gsap.set(lens.current, { opacity: 0, scale: 0.86 });
      gsap.set('[data-giant]', { opacity: 0 });

      // Built now (inside the scope), played when the preloader wipes away.
      const intro = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
      intro
        .to('[data-giant]', { opacity: 1, duration: 2.4, ease: 'power2.out' }, 0)
        .to(lens.current, { opacity: 1, scale: 1, duration: 2, ease: 'expo.out' }, 0.1)
        // Rack focus: each line rises out of its mask while the blur clears.
        .to(lines, {
          yPercent: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: reduced ? 0.6 : 1.4,
          stagger: 0.12,
          clearProps: 'filter,willChange',
        }, 0.35)
        .to(fades, { opacity: 1, y: 0, duration: 1.2, stagger: 0.08 }, 0.9);

      const off = onReady(() => intro.play());

      if (reduced) return off;

      // Lens: slow idle rotation of the knurled barrel, tilt toward the cursor.
      gsap.to('[data-knurl], [data-scale]', { rotation: 360, duration: 90, ease: 'none', repeat: -1 });
      const rx = gsap.quickTo(lens.current, 'rotationX', { duration: 1.2, ease: 'power3.out' });
      const ry = gsap.quickTo(lens.current, 'rotationY', { duration: 1.2, ease: 'power3.out' });
      const gx = gsap.quickTo('[data-giant]', 'x', { duration: 1.6, ease: 'power3.out' });
      const move = (e: PointerEvent) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        ry(nx * 22);
        rx(-ny * 22);
        gx(nx * -40);
      };
      window.addEventListener('pointermove', move, { passive: true });

      // Scroll-out: object scales down and fades, giant type drifts slower.
      const out = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });
      out.to('[data-lens-wrap]', { scale: 0.6, opacity: 0, yPercent: -10, ease: 'none' }, 0)
        .to('[data-giant]', { yPercent: 30, ease: 'none' }, 0)
        .to('[data-copy]', { yPercent: -40, opacity: 0, ease: 'none' }, 0);

      return () => {
        off();
        window.removeEventListener('pointermove', move);
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} id="top" className="relative flex h-svh min-h-[640px] items-center justify-center overflow-hidden">
      {/* Giant tone-on-tone type behind the object */}
      <div data-giant className="giant-type absolute inset-x-0 top-1/2 -translate-y-1/2 text-center" aria-hidden="true">
        KOR8
      </div>

      <div data-lens-wrap className="absolute inset-0 flex items-center justify-center [perspective:1200px]">
        <HeroLens ref={lens} />
      </div>

      <div data-copy className="relative z-10 px-5 text-center">
        <h1 className="headline text-[clamp(3rem,8.4vw,10rem)]">
          {hero.headline.map((line) => (
            <span key={line} className="split-mask block">
              <span data-hero-line className="block will-change-[transform,filter]">
                <AccentText text={line} />
              </span>
            </span>
          ))}
        </h1>
      </div>

      <div className="absolute inset-x-0 bottom-20 z-10 mx-auto flex max-w-[1440px] items-end justify-between gap-6 px-5 md:bottom-24 md:px-10">
        <p data-fade className="max-w-[16rem] text-sm text-white/70 md:text-base">
          <span className="label mb-3 block">001 / what</span>
          {hero.left}
        </p>
        <a data-fade href="#statement" className="label hidden flex-col items-center gap-3 text-white md:flex">
          Scroll
          <span className="block h-10 w-px origin-top animate-[cue_2.2s_ease-in-out_infinite] bg-white/60" />
        </a>
        <p data-fade className="max-w-[16rem] text-right text-sm text-white/70 md:text-base">
          <span className="label mb-3 block">002 / where</span>
          {hero.right}
        </p>
      </div>

      <style>{`@keyframes cue { 0% { transform: scaleY(0) } 50% { transform: scaleY(1) } 100% { transform: scaleY(1); opacity: 0 } }`}</style>
    </section>
  );
}

