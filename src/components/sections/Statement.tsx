'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/intro';
import { statement } from '@/content/site';

const KEY_WORDS = new Set(['one', 'roof,']);

/** Pinned paragraph; words light up one by one as the visitor scrolls. */
export default function Statement() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const words = gsap.utils.toArray<HTMLElement>('[data-word]');
      gsap.set(words, { opacity: 0.14 });
      gsap.to(words, {
        opacity: 1,
        ease: 'none',
        stagger: 0.1,
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${window.innerHeight * 1.6}`,
          scrub: true,
          pin: true,
          invalidateOnRefresh: true,
        },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="statement" className="relative flex min-h-svh items-center px-5 md:px-10">
      <div className="mx-auto max-w-[1180px]">
        <p className="label mb-10">[ manifesto ] · 01 / 01</p>
        <p className="font-display text-[clamp(1.9rem,4.6vw,4.6rem)] leading-[1.08] tracking-[-0.025em]">
          {statement.split(' ').map((w, i) => (
            <span key={i} data-word className={KEY_WORDS.has(w) ? 'text-accent' : undefined}>
              {w}{' '}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}

