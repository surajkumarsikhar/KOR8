'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { onReady } from '@/lib/intro';

/**
 * SCENE 01 — INFINITE  +  SCENE 02 — BREAK THE FRAME (Transition A)
 *
 * The stage is sticky for the section's extra height. One scrubbed timeline
 * expands INFINITE past the viewport, raises crimson along the lower edge and
 * slides a diagonal black/burgundy panel up over everything. When the panel
 * fully covers the stage the section ends, and <Film> (pulled up underneath
 * with a -100svh margin) is revealed with an identical #050505 frame — so
 * there's no seam, jump or dead scroll.
 *
 * Animated-property ownership (no two timelines share a property on one node):
 *  intro    → [data-light-intro] opacity, [data-title] yPercent, [data-sheen] bg-pos, [data-detail] opacity/y
 *  breathing→ [data-ambient] scale/opacity
 *  pointer  → [data-rig] x/y, [data-hotspot] x/y
 *  scroll   → [data-group] opacity/y, [data-title-scale] scale, [data-glow-scroll] scale,
 *             [data-edge] opacity, [data-panel] yPercent/visibility
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: '(prefers-reduced-motion: no-preference)',
          fine: '(hover: hover) and (pointer: fine)',
          mobile: '(max-width: 767px)',
        },
        (ctx) => {
          const { motion, fine, mobile } = ctx.conditions as Record<string, boolean>;
          if (!motion) return; // Reduced motion: static, fully readable composition.

          const title = q('[data-title]');
          const sheen = q('[data-sheen]');
          const detail = (k: string) => q(`[data-detail="${k}"]`);

          // ── Initial states ──
          gsap.set(title, { yPercent: 112 });
          gsap.set(q('[data-light-intro]'), { autoAlpha: 0 });
          gsap.set(q('[data-detail]'), { autoAlpha: 0, y: 14 });
          gsap.set(sheen, { backgroundPosition: '160% 0%' });

          // ── Opening choreography (after the preloader) ──
          const intro = gsap.timeline({ paused: true });
          const enter = { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out' };
          intro
            .to(q('[data-light-intro]'), { autoAlpha: 1, duration: 2.8, ease: 'power2.out' }, 0)
            .to(title, { yPercent: 0, duration: 1.9, ease: 'expo.out' }, 0.5)
            .to(sheen, { backgroundPosition: '-60% 0%', duration: 1.7, ease: 'power2.inOut' }, 1.15)
            // asymmetric peripheral timing
            .to(detail('tl'), enter, 1.25)
            .to(detail('br'), enter, 1.45)
            .to(detail('tr'), enter, 1.75)
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

          // ── Studio-light pointer response (fine pointers only) ──
          let onMove: ((e: PointerEvent) => void) | undefined;
          if (fine) {
            const rig = q('[data-rig]')[0];
            const hot = q('[data-hotspot]')[0];
            const cfg = { duration: 2.4, ease: 'power3.out' };
            const rx = gsap.quickTo(rig, 'x', cfg);
            const ry = gsap.quickTo(rig, 'y', cfg);
            const hx = gsap.quickTo(hot, 'x', { ...cfg, duration: 3 });
            const hy = gsap.quickTo(hot, 'y', { ...cfg, duration: 3 });
            onMove = (e) => {
              const nx = e.clientX / window.innerWidth - 0.5;
              const ny = e.clientY / window.innerHeight - 0.5;
              // Falloff (rig) moves a little; the hot core moves a little more.
              rx(nx * window.innerWidth * 0.05);
              ry(ny * window.innerHeight * 0.04);
              hx(nx * window.innerWidth * 0.03);
              hy(ny * window.innerHeight * 0.025);
            };
            el.addEventListener('pointermove', onMove);
          }

          // ── Transition A: one scrubbed timeline ──
          gsap.set(q('[data-panel]'), { autoAlpha: 1 });
          gsap
            .timeline({
              defaults: { ease: 'none' },
              scrollTrigger: {
                trigger: el,
                start: 'top top',
                end: 'bottom bottom',
                scrub: mobile ? 0.6 : 1,
                invalidateOnRefresh: true,
              },
            })
            .to(q('[data-group="up"]'), { y: -70, autoAlpha: 0, duration: 0.22 }, 0)
            .to(q('[data-group="down"]'), { y: 70, autoAlpha: 0, duration: 0.22 }, 0)
            .to(q('[data-title-scale]'), { scale: mobile ? 2.4 : 3.6, duration: 0.78, ease: 'power1.in' }, 0)
            .to(q('[data-glow-scroll]'), { scale: 1.4, duration: 0.6 }, 0.05)
            .fromTo(q('[data-edge]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45 }, 0.08)
            // Panel is 130% tall: 78% ≈ just below the frame, -24% = diagonal fully above it.
            .fromTo(q('[data-panel]'), { yPercent: 78 }, { yPercent: -24, duration: 0.72, ease: 'power1.inOut' }, 0.28);

          return () => {
            off();
            if (onMove) el.removeEventListener('pointermove', onMove);
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
      className="relative z-[1] h-[260svh] bg-[#050505] text-[#F2F0EC] max-md:h-[190svh] motion-reduce:h-svh"
    >
      <div className="sticky top-0 isolate h-svh overflow-hidden bg-[#050505]">
        {/* ── Light rig ── */}
        <div data-light-intro aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
          <div data-rig className="absolute inset-0 will-change-transform">
            <div data-glow-scroll className="absolute inset-0 origin-[15%_60%]">
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

        {/* ── Composition ── */}
        <div className="relative z-10 flex h-full flex-col justify-between px-5 pb-8 pt-24 sm:px-8 md:px-12 md:pb-10 md:pt-28 lg:px-20">
          <div className="flex items-start justify-between gap-6">
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
            <div data-group="up" className="max-md:hidden">
              <p
                data-detail="tr"
                className="text-right font-mono text-[10px] uppercase leading-[2] tracking-[0.18em] text-[#898486]"
              >
                Ideas beyond convention.
                <br />
                Stories beyond time.
              </p>
            </div>
          </div>

          {/* Monumental word: scaler (scroll) › mask (clip) › title (intro) */}
          <div data-title-scale className="relative flex justify-center will-change-transform">
            <div className="overflow-hidden pb-[0.04em]">
              <h1
                data-title
                className="relative block whitespace-nowrap text-center font-monument text-[19vw] uppercase leading-[0.86] tracking-[-0.035em] text-[#F2F0EC]"
              >
                Infinite
                <span
                  data-sheen
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 text-transparent [-webkit-background-clip:text] [background-clip:text]"
                  style={{
                    backgroundImage:
                      'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.95) 50%, transparent 60%)',
                    backgroundSize: '250% 100%',
                    backgroundPosition: '160% 0%',
                  }}
                >
                  Infinite
                </span>
              </h1>
            </div>
          </div>

          <div>
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

        {/* ── Transition A: the diagonal panel (130% tall, slides up) ── */}
        <div
          data-panel
          aria-hidden="true"
          className="pointer-events-none invisible absolute inset-x-0 top-0 z-30 h-[130%] will-change-transform"
        >
          <div className="absolute inset-0 md:[filter:drop-shadow(0_-10px_40px_rgba(224,24,53,0.35))]">
            {/* crimson sliver on the leading edge */}
            <div
              className="absolute inset-0 bg-[#E01835]"
              style={{ clipPath: 'polygon(0% 21.4%, 100% -0.6%, 100% 100%, 0% 100%)' }}
            />
            <div
              className="absolute inset-0"
              style={{
                clipPath: 'polygon(0% 22%, 100% 0%, 100% 100%, 0% 100%)',
                background: 'linear-gradient(180deg, #1c0409 0%, #0d0205 16%, #050505 38%)',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
