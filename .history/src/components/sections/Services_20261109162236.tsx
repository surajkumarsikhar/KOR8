'use client';

import { useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/intro';
import { services } from '@/content/site';
import { cn, clamp } from '@/lib/utils';
import { ServiceMedia, buildServiceTimeline } from './ServicePanels';

const N = services.length;

/**
 * Option B — pinned hover-list. Scroll (or hover) changes the active
 * service, swaps the media panel and moves the red dot. Each panel plays
 * its signature animation, scrubbed by that service's slice of the pin.
 */
export default function Services() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const tls = useRef<gsap.core.Timeline[]>([]);

  const show = (i: number, playTo?: number) => {
    if (i !== activeRef.current) {
      activeRef.current = i;
      setActive(i);
      gsap.to('[data-panel]', { autoAlpha: (j) => (j === i ? 1 : 0), duration: 0.6, ease: 'power2.inOut', overwrite: true });
      gsap.to('[data-giant-title]', { autoAlpha: (j) => (j === i ? 1 : 0), duration: 0.8, ease: 'power2.inOut', overwrite: true });
      const item = root.current?.querySelectorAll<HTMLElement>('[data-item]')[i];
      if (item) gsap.to('[data-dot-indicator]', { y: item.offsetTop + item.offsetHeight / 2, duration: 0.7, ease: 'power3.out' });
    }
    if (playTo !== undefined) gsap.to(tls.current[i], { progress: playTo, duration: 1.1, ease: 'power2.out', overwrite: true });
  };

  useGSAP(
    () => {
      const panels = gsap.utils.toArray<HTMLElement>('[data-panel]');
      tls.current = panels.map((p, i) => buildServiceTimeline(services[i].key, p));
      gsap.set(panels, { autoAlpha: (i) => (i === 0 ? 1 : 0) });
      gsap.set('[data-giant-title]', { autoAlpha: (i) => (i === 0 ? 1 : 0) });
      const first = root.current!.querySelector<HTMLElement>('[data-item]')!;
      gsap.set('[data-dot-indicator]', { y: first.offsetTop + first.offsetHeight / 2 });

      if (prefersReducedMotion()) {
        tls.current.forEach((t) => t.progress(1));
        return;
      }

      const mm = gsap.matchMedia();
      mm.add('(min-width: 768px)', () => {
        ScrollTrigger.create({
          trigger: root.current,
          start: 'top top',
          end: () => `+=${window.innerHeight * 0.9 * N}`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const f = self.progress * N;
            const i = clamp(0, Math.floor(f), N - 1);
            show(i);
            const local = clamp(0, (f - i) * 1.5, 1);
            const t = tls.current[i];
            if (!gsap.isTweening(t)) t.progress(local);
            // Panels already passed stay complete, upcoming ones reset.
            tls.current.forEach((o, j) => j !== i && !gsap.isTweening(o) && o.progress(j < i ? 1 : 0));
          },
        });
      });
      mm.add('(max-width: 767px)', () => {
        gsap.utils.toArray<HTMLElement>('[data-item]').forEach((el, i) => {
          ScrollTrigger.create({
            trigger: el,
            start: 'top 60%',
            end: 'bottom 60%',
            onToggle: (self) => self.isActive && show(i, 1),
          });
        });
        tls.current[0].progress(1);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const s = services[active];

  return (
    <section ref={root} id="services" className="relative overflow-hidden md:h-svh">
      {/* Giant tone-on-tone chapter titles, cross-faded */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[-4vw] hidden md:block" aria-hidden="true">
        {services.map((sv) => (
          <div key={sv.key} data-giant-title className="giant-type absolute bottom-0 left-1/2 -translate-x-1/2">
            {sv.title}
          </div>
        ))}
      </div>

      <div className="relative mx-auto grid h-full max-w-[1440px] gap-10 px-5 py-24 md:grid-cols-12 md:items-center md:px-10 md:py-0">
        {/* List */}
        <div className="order-2 md:order-1 md:col-span-6">
          <div className="mb-10 flex items-center gap-4">
            <p className="label">[ services ]</p>
            <span className="h-px w-10 bg-accent" />
            <p className="label tabular-nums text-white">{String(active + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}</p>
          </div>
          <ul className="relative pl-8">
            <span data-dot-indicator className="absolute left-0 top-0 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-accent" aria-hidden="true" />
            {services.map((sv, i) => (
              <li
                key={sv.key}
                data-item
                onPointerEnter={() => show(i, 1)}
                className="min-h-[55svh] py-1 md:min-h-0"
              >
                <h3
                  className={cn(
                    'flex items-baseline gap-4 font-display text-[clamp(2.75rem,6.4vw,6.5rem)] leading-[0.95] tracking-[-0.04em] transition-colors duration-500',
                    i === active ? 'text-white' : 'text-white/20 hover:text-white/50',
                  )}
                >
                  <span className="label">{sv.letter}</span>
                  {sv.title}
                </h3>
                {/* Mobile: copy inline under each item */}
                <div className="mt-3 md:hidden">
                  <p className="text-xl">{sv.headline}</p>
                  <p className="mt-2 text-white/60">{sv.line}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Media panel (sticky on mobile) */}
        <div className="sticky top-16 z-10 order-1 md:static md:order-2 md:col-span-6">
          <div className="film-frame relative aspect-[5/4] w-full overflow-hidden md:aspect-[4/5] md:max-h-[64svh]">
            <div className="relative h-full w-full overflow-hidden bg-black">
              {services.map((sv) => (
                <div key={sv.key} data-panel className="absolute inset-0">
                  <ServiceMedia k={sv.key} />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 hidden min-h-[6.5rem] md:block" aria-live="polite">
            <p className="font-display text-3xl tracking-[-0.02em]">{s.headline}</p>
            <p className="mt-2 max-w-md text-white/60">{s.line}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
