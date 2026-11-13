'use client';

import { useRef, type ReactNode } from 'react';
import { gsap, SplitText, useGSAP } from '@/lib/gsap';
import { isLowEnd, prefersReducedMotion } from '@/lib/intro';

type Tag = 'h2' | 'h3' | 'p' | 'blockquote';

/**
 * Headline reveal used across sections: SplitText lines rise out of masks
 * while a rack-focus blur clears. Re-splits on resize (autoSplit).
 */
export default function Reveal({
  as: Component = 'h2',
  className,
  children,
  delay = 0,
  start = 'top 82%',
}: {
  as?: Tag;
  className?: string;
  children: ReactNode;
  delay?: number;
  start?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!ref.current || prefersReducedMotion()) return;
      const blur = !isLowEnd();
      const split = SplitText.create(ref.current, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 110,
            opacity: 0,
            filter: blur ? 'blur(10px)' : 'none',
            duration: 1.3,
            stagger: 0.1,
            ease: 'power3.out',
            delay,
            clearProps: 'filter',
            scrollTrigger: { trigger: ref.current, start, once: true },
          }),
      });
      return () => split.revert();
    },
    { scope: ref },
  );

  return (
    <Component ref={ref as never} className={className}>
      {children}
    </Component>
  );
}
