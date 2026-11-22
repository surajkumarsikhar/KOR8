
'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { onReady, prefersReducedMotion } from '@/lib/intro';

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const primaryGlow = useRef<HTMLDivElement>(null);
  const ambientGlow = useRef<HTMLDivElement>(null);
  const lightBeam = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      const reduced = prefersReducedMotion();
      const q = gsap.utils.selector(el);

      const title = heading.current;
      const glow = primaryGlow.current;
      const ambient = ambientGlow.current;
      const beam = lightBeam.current;

      if (!title || !glow || !ambient || !beam) return;

      const details = q('[data-detail]');
      const topDetails = q('[data-detail-top]');
      const bottomDetails = q('[data-detail-bottom]');

      if (reduced) {
        gsap.set(
          [title, glow, ambient, beam, ...details],
          { clearProps: 'all' }
        );
        return;
      }

      // 1. Initial states
      gsap.set(title, {
        yPercent: 115,
        opacity: 0,
      });

      gsap.set(details, {
        opacity: 0,
        y: 24,
      });

      gsap.set(glow, {
        opacity: 0,
        scale: 0.8,
      });

      gsap.set(ambient, {
        opacity: 0.3,
      });

      gsap.set(beam, {
        opacity: 0,
        rotation: -12,
      });

      // 2. Cinematic opening
      const intro = gsap.timeline({
        paused: true,
        defaults: {
          ease: 'power3.out',
        },
      });

      intro
        .to(
          glow,
          {
            opacity: 1,
            scale: 1,
            duration: 2.4,
            ease: 'power2.out',
          },
          0
        )
        .to(
          beam,
          {
            opacity: 0.5,
            rotation: -5,
            duration: 2.2,
          },
          0.2
        )
        .to(
          title,
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.65,
            ease: 'power4.out',
          },
          0.35
        )
        .to(
          details,
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.1,
          },
          0.95
        );

      // 3. Living light animation
      const breathing = gsap.timeline({
        paused: true,
        repeat: -1,
        yoyo: true,
      });

      breathing
        .to(glow, {
          filter: 'brightness(1.4)',
          duration: 5,
          ease: 'sine.inOut',
        }, 0)
        .to(ambient, {
          xPercent: 12,
          yPercent: -6,
          scale: 1.2,
          opacity: 0.65,
          duration: 8,
          ease: 'sine.inOut',
        }, 0)
        .to(beam, {
          rotation: 3,
          duration: 9,
          ease: 'sine.inOut',
        }, 0);

      const off = onReady(() => {
        intro.play(0);
        breathing.play();
      });

      // 4. Mouse-reactive illumination
      const moveX = gsap.quickTo(glow, 'x', {
        duration: 1.8,
        ease: 'power3.out',
      });

      const moveY = gsap.quickTo(glow, 'y', {
        duration: 1.8,
        ease: 'power3.out',
      });

      const handlePointer = (event: PointerEvent) => {
        if (event.pointerType === 'touch') return;

        const rect = el.getBoundingClientRect();

        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / window.innerHeight;

        moveX((x - 0.5) * 100);
        moveY((y - 0.5) * 65);
      };

      el.addEventListener('pointermove', handlePointer);

      // 5. Scroll-controlled transformation
      const scroll = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.3,
          invalidateOnRefresh: true,
        },
      });

      scroll
        // Supporting content disappears first
        .to(topDetails, {
          y: -65,
          opacity: 0,
          ease: 'none',
          stagger: 0.04,
          duration: 0.35,
        }, 0)

        .to(bottomDetails, {
          y: 65,
          opacity: 0,
          ease: 'none',
          duration: 0.35,
        }, 0)

        // Word expands beyond the viewport
        .to(title, {
          scale: 1.75,
          yPercent: -8,
          letterSpacing: '0.015em',
          ease: 'none',
          duration: 1,
        }, 0.1)

        // Light spreads across the canvas
        .to(glow, {
          scale: 1.65,
          opacity: 0.85,
          ease: 'none',
          duration: 0.8,
        }, 0.1)

        .to(ambient, {
          scale: 1.7,
          opacity: 0.8,
          ease: 'none',
          duration: 0.8,
        }, 0.1)

        .to(beam, {
          opacity: 0.85,
          rotation: 12,
          ease: 'none',
          duration: 0.7,
        }, 0.2)

        // Dissolve to black at the end
        .to(title, {
          opacity: 0,
          filter: 'blur(10px)',
          ease: 'none',
          duration: 0.3,
        }, 0.7)

        .to([glow, ambient, beam], {
          opacity: 0,
          ease: 'none',
          duration: 0.3,
        }, 0.7);

      return () => {
        off();
        el.removeEventListener('pointermove', handlePointer);
        intro.kill();
        breathing.kill();
        scroll.kill();
      };
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="top"
      className="relative h-[190svh] bg-[#050505] text-[#F2F0EC] max-md:h-[155svh]"
    >
      {/* Sticky cinematic stage */}
      <div
        ref={stage}
        className="sticky top-0 isolate flex h-svh flex-col overflow-hidden bg-[#050505]"
      >
        {/* Primary crimson lumen */}
        <div
          ref={primaryGlow}
          aria-hidden="true"
          className="pointer-events-none absolute -left-[25%] top-[-15%] z-0 h-[130%] w-[110%] will-change-transform"
          style={{
            background: `
              radial-gradient(
                ellipse at 32% 52%,
                rgba(190, 0, 35, 0.5) 0%,
                rgba(115, 0, 27, 0.28) 23%,
                rgba(48, 0, 15, 0.12) 48%,
                transparent 72%
              )
            `,
          }}
        />

        {/* Secondary crimson atmosphere */}
        <div
          ref={ambientGlow}
          aria-hidden="true"
          className="pointer-events-none absolute -left-[18%] top-[8%] z-0 h-[90%] w-[75%] rounded-full opacity-30 blur-[90px] will-change-transform"
          style={{
            background:
              'radial-gradient(ellipse, rgba(180,0,35,0.35), rgba(80,0,25,0.12) 45%, transparent 72%)',
          }}
        />

        {/* Diagonal volumetric light */}
        <div
          ref={lightBeam}
          aria-hidden="true"
          className="pointer-events-none absolute -left-[20%] top-[-30%] z-0 h-[150%] w-[55%] origin-top-left rotate-[-12deg] opacity-0 blur-[55px]"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(215,20,50,0.1) 45%, transparent)',
          }}
        />

        {/* Cinematic edge darkening */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background: `
              radial-gradient(
                ellipse at 50% 48%,
                transparent 20%,
                rgba(0,0,0,0.25) 65%,
                rgba(0,0,0,0.75) 110%
              )
            `,
          }}
        />

        {/* Subtle vertical guides */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-[7%] z-[2] hidden w-px bg-white/[0.025] lg:block"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-[7%] z-[2] hidden w-px bg-white/[0.025] lg:block"
        />

        {/* Main composition */}
        <div
          data-copy
          className="relative z-10 mx-auto flex w-full max-w-[1800px] flex-1 flex-col justify-center px-5 pb-24 pt-24 sm:px-8 md:px-12 lg:px-20"
        >
          {/* Upper editorial text */}
          <div className="mb-6 flex items-end justify-between gap-6 md:mb-4">
            <div data-detail data-detail-top>
              <span className="mb-3 block text-[9px] font-semibold uppercase tracking-[0.26em] text-[#F01C40] md:text-[10px]">
                01 / The Philosophy
              </span>

              <p className="text-xs text-white/55 md:text-sm">
                Creativity without boundaries.
              </p>
            </div>

            <p
              data-detail
              data-detail-top
              className="hidden text-right text-[10px] uppercase leading-[2] tracking-[0.16em] text-white/40 sm:block"
            >
              Ideas beyond convention.
              <br />
              Stories beyond time.
            </p>
          </div>

          {/* Monumental typography */}
          <div className="relative w-full overflow-hidden py-4 md:py-6">
            <h1
              ref={heading}
              className="relative block w-full whitespace-nowrap text-center text-[12.7vw] font-black leading-[0.92] tracking-[-0.09em] text-[#F4F1ED] will-change-transform"
            >
              INFINITE
            </h1>
          </div>

          {/* Bottom editorial text */}
          <div className="mt-7 flex items-start justify-between gap-5 md:mt-5">
            <p
              data-detail
              data-detail-bottom
              className="text-[9px] uppercase leading-[2.1] tracking-[0.16em] text-white/45 md:text-xs"
            >
              Creative Direction
              <br />
              Visual Storytelling
              <br />
              Digital Experiences
            </p>

            <div
              data-detail
              data-detail-bottom
              className="max-w-[170px] text-right md:max-w-[260px]"
            >
              <p className="text-xs leading-[1.9] text-white/65 md:text-sm">
                We don't just create.
                <br />
                We redefine what's possible.
              </p>

              <a
                href="#work"
                className="group mt-5 inline-flex items-center gap-3 border-b border-white/30 pb-2 text-xs text-white transition-colors hover:border-[#F01C40]"
              >
                Explore Our Work
                <span className="text-[#F01C40] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                  ↗
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer metadata */}
        <div
          data-detail
          data-detail-bottom
          className="absolute bottom-8 left-5 right-5 z-20 flex items-center justify-between gap-4 sm:left-8 sm:right-8 md:bottom-10 md:left-12 md:right-12 lg:left-20 lg:right-20"
        >
          <span className="text-[9px] uppercase tracking-[0.16em] text-white/40">
            KOR8 © 2026
          </span>

          <div className="flex items-center gap-3">
            <span className="text-[9px] uppercase tracking-[0.16em] text-white/50">
              Scroll to Explore
            </span>
            <span className="text-[#F01C40]">↓</span>
          </div>
        </div>
      </div>
    </section>
  );
}
