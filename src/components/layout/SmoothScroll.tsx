'use client';

import { useEffect } from 'react';
import type Lenis from 'lenis';
import { startLenis } from '@/lib/lenis';
import { prefersReducedMotion } from '@/lib/intro';

let instance: Lenis | null = null;
export const getLenis = () => instance;

/** Mounts Lenis once for the whole app and handles in-page anchor links. */
export default function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const { lenis, stop } = startLenis();
    instance = lenis;

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href')!;
      if (id.length < 2) return;
      const target = document.querySelector<HTMLElement>(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { duration: 1.6 });
      history.replaceState(null, '', id);
    };
    document.addEventListener('click', onClick);

    return () => {
      document.removeEventListener('click', onClick);
      stop();
      instance = null;
    };
  }, []);

  return null;
}

