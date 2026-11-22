'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { onReady } from '@/lib/intro';
import GrainOverlay from '@/components/ui/GrainOverlay';
import { useHeroGateWeave } from '@/hooks/useHeroGateWeave';
import { useHeroParallax } from '@/hooks/useHeroParallax';
import InfinitySculpture from '@/components/ui/InfinitySculpture';
import CarriedPortrait from './CarriedPortrait';
import './hero-atmosphere.css';
import './hero-depth.css';

/** Intro and isolated gate weave; CinematicExperience owns scroll transforms. */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  useHeroGateWeave(root);
  useHeroParallax(root);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: '(prefers-reduced-motion: no-preference)',
          mobile: '(max-width: 767px)',
        },
        (ctx) => {
          const { motion } = ctx.conditions as Record<string, boolean>;
          if (!motion) return; // Reduced motion: static, fully readable composition.

          const core = q('[data-in]');
          const wings = q('[data-wing]');
          const detail = (k: string) => q(`[data-detail="${k}"]`);

          // ── Initial states ──
          gsap.set([ ...core, ...wings ], { opacity: 0 });
          gsap.set(q('[data-light-intro]'), { autoAlpha: 0 });
          gsap.set(q('[data-detail]'), { autoAlpha: 0, y: 14 });
          gsap.set(q('[data-infinity-stroke]'), { drawSVG: '0%' });

          // ── Opening choreography (after the preloader) ──
          const intro = gsap.timeline({ paused: true });
          const enter = { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out' };
          intro
            .to(q('[data-light-intro]'), { autoAlpha: 1, duration: 2.8, ease: 'power2.out' }, 0)
            .to(core, { opacity: 1, duration: 0.8 }, 0.25)
            .to(wings, { opacity: 1, duration: 1.1, stagger: 0.12 }, 1.05)
            .to(q('[data-infinity-stroke]'), { drawSVG: '100%', duration: 2.1, ease: 'power2.inOut' }, 0.5)
            // asymmetric peripheral timing
            .to(detail('tl'), enter, 1.25)
            .to(detail('br'), enter, 1.45)
            .to(detail('bl'), enter, 1.95)
            .to(detail('foot'), enter, 2.25);

          const breathing = gsap.timeline({ paused: true, repeat: -1, yoyo: true });
          breathing.fromTo(
            q('[data-ambient]'),
            { scale: 1, opacity: 0.55 },
            { scale: 1.12, opacity: 0.9, duration: 6, ease: 'sine.inOut' },
          );

          const off = onReady(() => {
            intro.play(0);
            breathing.play();
          });

          return () => {
            off();
          };
        },
      );

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="top"
      aria-label="KOR8 — Infinite"
      data-scene="hero" className="film-scene hero-scene text-[#F2F0EC]"
    >
      <div className="hero-layers relative isolate h-full overflow-hidden">
        <div data-hero-mask className="hero-clipped hero-background">
        {/* ── Light rig ── */}
        <div data-light-intro aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
          <div data-rig data-weave="atmosphere" className="absolute inset-0 will-change-transform">
            <div data-glow-scroll className="light-parallax absolute inset-0 origin-[15%_60%]">
              <div
                data-ambient
                className="absolute -left-[30%] top-[2%] h-[100%] w-[85%] rounded-full opacity-60 blur-[100px] will-change-transform max-md:blur-[60px]"
                style={{
                  background:
                    'radial-gradient(closest-side, rgba(181,9,22,0.6), rgba(40,4,12,0.35) 55%, transparent)',
                }}
              />
              <div
                data-hotspot
                className="absolute -left-[12%] top-[22%] h-[60%] w-[46%] rounded-full blur-[70px] will-change-transform max-md:blur-[40px]"
                style={{
                  background:
                    'radial-gradient(closest-side, rgba(224,24,53,0.45), rgba(181,9,22,0.16) 55%, transparent)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Crimson rising along the lower edge during the break */}
        <div
          data-edge
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[55%] opacity-0"
          style={{
            background:
              'radial-gradient(120% 90% at 50% 100%, rgba(181,9,22,0.55), rgba(40,4,12,0.35) 45%, transparent 75%)',
          }}
        />

        {/* Vignette */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[2]"
          style={{
            background:
              'radial-gradient(ellipse at 50% 48%, transparent 25%, rgba(0,0,0,0.3) 68%, rgba(0,0,0,0.8) 110%)',
          }}
        />

        <GrainOverlay background />
        </div>
        <InfinitySculpture />
        <div data-hero-mask className="hero-clipped hero-foreground">
        {/* ── Composition ── */}
        <div className="relative flex h-full flex-col justify-between px-5 pb-8 pt-24 sm:px-8 md:px-12 md:pb-10 md:pt-28 lg:px-20">
          <div className="hero-editorial z-[20] flex items-start justify-between gap-6">
            <div data-group="up">
              <div data-detail="tl">
                <span className="mb-3 block font-mono text-[10px] uppercase tracking-[0.26em] text-[#E01835]">
                  01 / The Philosophy
                </span>
                <p className="font-editorial text-lg italic text-[#F2F0EC]/70 md:text-2xl">
                  Creativity without boundaries.
                </p>
              </div>
            </div>
          </div>

          {/* Monumental word: scaler (scroll) › mask (clip) › title (intro) */}
          <div data-exposure aria-hidden="true" className="hero-exposure" />
          <div data-title-scale className="relative z-10 flex justify-center will-change-transform">
            <div className="type-parallax">
            <div data-weave="type" className="overflow-hidden pb-[0.04em]">
              <h1
                aria-label="Infinite"
                data-title
                className="relative block whitespace-nowrap text-center font-monument text-[19vw] uppercase leading-[0.86] tracking-[-0.035em] text-[#F2F0EC]"
              >
                <span data-wing>INF</span><span data-in className="text-[#e01835]">IN</span><span data-wing>ITE</span>
              </h1>
            </div>
            </div>
          </div>

          <GrainOverlay />
          <CarriedPortrait />
          <div className="hero-bottom relative z-[20] mt-auto">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div data-group="down">
                <p
                  data-detail="bl"
                  className="font-mono text-[10px] uppercase leading-[2.1] tracking-[0.18em] text-[#898486]"
                >
                  Creative Direction
                  <br />
                  Visual Storytelling
                  <br />
                  Digital Experiences
                </p>
              </div>
              <div data-group="down" className="md:text-right">
                <div data-detail="br">
                  <p className="text-sm leading-[1.8] text-[#F2F0EC]/75 md:text-base">
                    We don&apos;t just create.
                    <br />
                    We redefine what&apos;s possible.
                  </p>
                  <a
                    href="#universe"
                    className="group mt-4 inline-flex items-center gap-3 border-b border-white/25 pb-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#F2F0EC] transition-colors hover:border-[#E01835]"
                  >
                    Explore our work
                    <span
                      aria-hidden="true"
                      className="text-[#E01835] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    >
                      ↗
                    </span>
                  </a>
                </div>
              </div>
            </div>
            <div data-group="down" className="mt-6">
              <div
                data-detail="foot"
                className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-white/40"
              >
                <span>KOR8 © 2026</span>
                <span>
                  Scroll to explore <span className="text-[#E01835]">↓</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}



