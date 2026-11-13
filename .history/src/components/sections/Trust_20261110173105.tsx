'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/intro';
import { trust, work } from '@/content/site';
import Reveal from '@/components/ui/Reveal';

/** Odometer digits: each digit column rolls to its final value. */
function Odometer({ value, suffix }: { value: number; suffix: string }) {
  const digits = String(value).split('');
  return (
    <span className="inline-flex items-baseline font-display text-[clamp(4rem,10vw,9rem)] leading-none tracking-[-0.04em] tabular-nums" aria-label={`${value}${suffix}`}>
      {digits.map((d, i) => (
        <span key={i} aria-hidden="true" className="relative inline-block h-[1em] overflow-hidden">
          <span data-roll data-to={d} className="flex flex-col">
            {Array.from({ length: 10 }, (_, n) => (
              <span key={n} className="h-[1em]">{n}</span>
            ))}
          </span>
        </span>
      ))}
      {suffix && <span aria-hidden="true" className="text-accent">{suffix}</span>}
    </span>
  );
}

/** Numbers and trust — real figures only; one featured client. */
export default function Trust() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const rolls = gsap.utils.toArray<HTMLElement>('[data-roll]');
      const to = (el: HTMLElement) => -Number(el.dataset.to) * 10;
      if (prefersReducedMotion()) {
        rolls.forEach((r) => gsap.set(r, { yPercent: to(r) }));
        return;
      }
      gsap.to(rolls, {
        yPercent: (_, el) => to(el as HTMLElement),
        duration: 2,
        ease: 'power3.inOut',
        stagger: 0.12,
        scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative px-5 py-[20vh] md:px-10">
      <div className="mx-auto max-w-[1280px]">
        <p className="label mb-12">[ trust ] · {work.client}</p>

        <figure className="max-w-4xl">
          <Reveal as="blockquote" className="font-display text-[clamp(1.75rem,3.6vw,3.25rem)] leading-[1.1] tracking-[-0.03em]">
            “{trust.quote}”
          </Reveal>
          <figcaption className="label mt-6">— {trust.attribution}</figcaption>
        </figure>

        <dl className="mt-24 grid gap-14 border-t border-white/10 pt-12 md:grid-cols-3">
          {trust.stats.map((s, i) => (
            <div key={s.label}>
              <dt className="label mb-6">{String(i + 1).padStart(3, '0')} · {s.label}</dt>
              <dd>
                <Odometer value={s.value} suffix={s.suffix} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

