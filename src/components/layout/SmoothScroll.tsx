'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type Lenis from 'lenis';
import { startLenis } from '@/lib/lenis';
import { ScrollTrigger } from '@/lib/gsap';
import { onReady } from '@/lib/intro';

let instance: Lenis | null = null;
export const getLenis = () => instance;

export function scrollToAnchor(id: string, immediate = false) {
  const target = document.getElementById(id.replace(/^#/, ''));
  if (!target) return;
  const film = ScrollTrigger.getById('kor8-film');
  const label = id.replace(/^#/, '');
  const destination = film?.animation && label in (film.animation as gsap.core.Timeline).labels
    ? film.labelToScroll(label)
    : target.getBoundingClientRect().top + window.scrollY;
  if (instance) instance.scrollTo(destination, { immediate, duration: 1.4, force: true });
  else window.scrollTo({ top: destination, behavior: 'instant' });
}

/** Exactly one Lenis instance, driven by the existing GSAP ticker. */
export default function SmoothScroll() {
  const pathname = usePathname();
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    let dispose: (() => void) | undefined;
    const configure = () => {
      dispose?.();
      instance = null;
      if (!media.matches) {
        const { lenis, stop } = startLenis();
        instance = lenis;
        dispose = stop;
      } else dispose = undefined;
    };
    configure();
    media.addEventListener('change', configure);
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const a = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      const id = a?.getAttribute('href');
      if (!id || id.length < 2 || !document.getElementById(id.slice(1))) return;
      event.preventDefault();
      scrollToAnchor(id);
      history.replaceState(null, '', id);
      if (id === '#main-content') document.getElementById('main-content')?.focus({ preventScroll: true });
    };
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('click', onClick);
      media.removeEventListener('change', configure);
      dispose?.();
      instance = null;
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    const off = onReady(() => {
      raf = requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        if (location.hash) scrollToAnchor(location.hash, true);
      });
    });
    return () => { off(); cancelAnimationFrame(raf); };
  }, [pathname]);
  return null;
}
