
'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { onReady, prefersReducedMotion } from '@/lib/intro';

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const glow = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduced = prefersReducedMotion();

      const heading = gsap.utils.toArray<HTMLElement>(
        '[data-hero-heading]'
      );

      const fades = gsap.utils.toArray<HTMLElement>(
        '[data-fade]'
      );

      if (reduced) {
        return;
      }

      // Initial state
      gsap.set(heading, {
        yPercent: 110,
        opacity: 0,
      });

      gsap.set(fades, {
        opacity: 0,
        y: 20,
      });

      gsap.set(glow.current, {
        opacity: 0,
        scale: 0.9,
      });

      // Intro animation
      const intro = gsap.timeline({
        paused: true,
        defaults: { ease: 'power3.out' },
      });

      intro
        .to(glow.current, {
          opacity: 1,
          scale: 1,
          duration: 2,
          ease: 'power2.out',
        }, 0)
        .to(heading, {
          yPercent: 0,
          opacity: 1,
          duration: 1.6,
          ease: 'power4.out',
        }, 0.2)
        .to(fades, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
        }, 0.75);

      const off = onReady(() => {
        intro.play();
      });

      // Subtle ambient glow animation
      const ambient = gsap.to(glow.current, {
        xPercent: 6,
        yPercent: -3,
        scale: 1.1,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        paused: true,
      });

      const offAmbient = onReady(() => {
        ambient.play();
      });

      // Scroll-driven transition
      const scroll = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });

      scroll
        .to(heading, {
          scale: 1.16,
          yPercent: -20,
          opacity: 0,
          ease: 'none',
        }, 0)
        .to('[data-copy]', {
          y: -60,
          opacity: 0,
          ease: 'none',
        }, 0)
        .to(glow.current, {
          opacity: 0.15,
          ease: 'none',
        }, 0);

      return () => {
        off();
        offAmbient();
        intro.kill();
        ambient.kill();
        scroll.kill();
      };
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="top"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[#050505] text-[#F2F0EC]"
    >
      {/* Animated crimson background */}
      <div
        ref={glow}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(
              ellipse 65% 80% at 4% 50%,
              rgba(175, 5, 29, 0.44) 0%,
              rgba(110, 4, 22, 0.23) 28%,
              rgba(40, 3, 12, 0.08) 60%,
              transparent 85%
            )
          `,
          transformOrigin: 'left center',
        }}
      />

      {/* Dark vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(5,5,5,0.16) 55%, #050505 100%)',
        }}
      />

      {/* Hero body */}
      <div
        data-copy
        className="relative z-10 mx-auto flex w-full max-w-[1800px] flex-1 flex-col justify-center px-5 pb-24 pt-28 sm:px-8 md:px-12 lg:px-20"
      >
        {/* Top supporting text */}
        <div className="mb-8 flex items-end justify-between gap-6 md:mb-4">
          <div data-fade>
            <span className="mb-3 block text-[10px] font-medium uppercase tracking-[0.25em] text-[#E01835]">
              01 / The Philosophy
            </span>

            <p className="text-xs text-white/55 md:text-sm">
              Creativity without boundaries.
            </p>
          </div>

          <p
            data-fade
            className="hidden text-right text-[10px] uppercase leading-[1.9] tracking-[0.17em] text-white/45 sm:block"
          >
            Ideas beyond convention.
            <br />
            Stories beyond time.
          </p>
        </div>

        {/* Main word */}
        <div className="relative w-full overflow-hidden py-3 md:py-5">
          <h1
            data-hero-heading
            className="relative block w-full whitespace-nowrap text-center text-[clamp(3.25rem,13vw,16rem)] font-black leading-[0.95] tracking-[-0.095em] text-[#F2F0EC] will-change-transform"
          >
            INFINITE
          </h1>
        </div>

        {/* Bottom supporting text */}
        <div className="mt-8 flex items-start justify-between gap-6 md:mt-5">
          <div data-fade>
            <p className="text-[10px] uppercase leading-[2] tracking-[0.17em] text-white/45 md:text-xs">
              Creative Direction
              <br />
              Visual Storytelling
              <br />
              Digital Experiences
            </p>
          </div>

          <div data-fade className="max-w-[180px] text-right md:max-w-[260px]">
            <p className="text-xs leading-[1.8] text-white/65 md:text-sm">
              We don't just create.
              <br />
              We redefine what's possible.
            </p>

            <a
              href="#work"
              className="mt-5 inline-flex items-center gap-3 border-b border-white/30 pb-2 text-xs text-white transition-colors hover:border-[#E01835]"
            >
              Explore Our Work
              <span className="text-[#E01835]">↗</span>
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        data-fade
        className="absolute bottom-7 left-5 right-5 z-20 flex items-center justify-between gap-4 sm:left-8 sm:right-8 md:bottom-10 md:left-12 md:right-12 lg:left-20 lg:right-20"
      >
        <span className="text-[9px] uppercase tracking-[0.17em] text-white/40">
          KOR8 © 2026
        </span>

        <div className="flex items-center gap-3">
          <span className="text-[9px] uppercase tracking-[0.17em] text-white/50">
            Scroll to Explore
          </span>

          <span className="text-[#E01835]">↓</span>
        </div>
      </div>
    </section>
  );
}
