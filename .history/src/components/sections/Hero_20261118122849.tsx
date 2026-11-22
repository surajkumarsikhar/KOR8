
'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { onReady, prefersReducedMotion } from '@/lib/intro';
import { hero } from '@/content/site';
import AccentText from '@/components/ui/AccentText';

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const videoWrap = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduced = prefersReducedMotion();

      const lines = gsap.utils.toArray<HTMLElement>(
        '[data-hero-line]',
      );

      const fades = gsap.utils.toArray<HTMLElement>(
        '[data-fade]',
      );

      gsap.set(lines, {
        yPercent: 110,
        opacity: 0,
      });

      gsap.set(fades, {
        opacity: 0,
        y: 20,
      });

      gsap.set(videoWrap.current, {
        opacity: 0,
        scale: 0.94,
        x: 30,
      });

      // Intro animation
      const intro = gsap.timeline({
        paused: true,
        defaults: { ease: 'power3.out' },
      });

      intro
        .to(videoWrap.current, {
          opacity: 1,
          scale: 1,
          x: 0,
          duration: 1.8,
          ease: 'expo.out',
        }, 0)
        .to(lines, {
          yPercent: 0,
          opacity: 1,
          duration: reduced ? 0.5 : 1.2,
          stagger: 0.12,
        }, 0.25)
        .to(fades, {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.12,
        }, 0.8);

      const off = onReady(() => intro.play());

      if (reduced) return off;

      // Scroll animation
      const scroll = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });

      scroll
        .to(videoWrap.current, {
          scale: 0.85,
          yPercent: -12,
          opacity: 0.25,
          ease: 'none',
        }, 0)
        .to('[data-copy]', {
          y: -70,
          opacity: 0,
          ease: 'none',
        }, 0);

      return () => {
        off();
      };
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="top"
      className="relative isolate flex h-svh min-h-[640px] items-center overflow-hidden bg-[#050505]"
    >
      {/* Crimson light leak from left */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-0 w-[65%]"
        style={{
          background:
            'radial-gradient(ellipse at 0% 48%, rgba(160, 0, 15, 0.25) 0%, rgba(110, 0, 10, 0.12) 28%, transparent 72%)',
        }}
      />

      {/* Subtle secondary light */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-1/2 z-0 h-[500px] w-[400px] -translate-y-1/2 rounded-full bg-red-900/10 blur-[130px]"
      />

      {/* Main hero content */}
      <div className="relative z-10 mx-auto grid w-full max-w-[1600px] grid-cols-1 items-center gap-8 px-6 py-24 md:grid-cols-[0.9fr_1.1fr] md:gap-4 md:px-12 lg:px-20">

        {/* LEFT: Typography */}
        <div
          data-copy
          className="relative z-20 flex flex-col items-start"
        >
          <p
            data-fade
            className="label mb-8 text-white/45"
          >
            INDEPENDENT CREATIVE PRODUCTION HOUSE
          </p>

          <h1 className="headline max-w-[750px] text-left text-[clamp(3.5rem,7vw,7.5rem)] leading-[0.95]">
            {hero.headline.map((line) => (
              <span
                key={line}
                className="split-mask block overflow-hidden"
              >
                <span
                  data-hero-line
                  className="block will-change-transform"
                >
                  <span data-hero-line className="block will-change-transform">
                    <em className="accent-italic">
                      {line.replace(/\*/g, '')}
                    </em>
                  </span>
                </span>
              </span>
            ))}
          </h1>

          <p
            data-fade
            className="mt-8 max-w-[360px] text-sm leading-relaxed text-white/55 md:text-base"
          >
            {hero.left}
          </p>

          <a
            data-fade
            href="#work"
            className="group mt-10 inline-flex items-center gap-4 text-sm text-white"
          >
            <span className="border-b border-white/40 pb-2 transition-colors group-hover:border-red-500">
              Explore our work
            </span>

            <span className="text-red-500 transition-transform group-hover:translate-x-2">
              ↗
            </span>
          </a>
        </div>

        {/* RIGHT: Cinematic model video */}
        <div
          ref={videoWrap}
          className="relative flex h-[48vh] min-h-[320px] items-center justify-center md:h-[75vh] md:min-h-[500px]"
        >
          <div
            className="h-full w-full"
            style={{
              background:
                'radial-gradient(circle at 70% 40%, #dc2626 0%, #7f1d1d 35%, #000 80%)',
              maskImage:
                'linear-gradient(to right, transparent 0%, black 16%, black 100%)',
              WebkitMaskImage:
                'linear-gradient(to right, transparent 0%, black 16%, black 100%)',
            }}
          />
        </div>
      </div>

      {/* Minimal scroll indicator */}
      <div
        data-fade
        className="absolute bottom-8 left-6 z-20 flex items-center gap-3 md:left-12"
      >
        <span className="h-px w-10 bg-red-600" />
        <span className="label text-white/40">
          SCROLL TO EXPLORE
        </span>
      </div>
    </section>
  );
}
