'use client';
import type { RefObject } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { onReady } from '@/lib/intro';

export function useHeroParallax(root: RefObject<HTMLElement | null>) {
  useGSAP(() => {
    const node = root.current!;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)', () => {
      const position = { x: 0, y: 0 };
      const render = () => {
        node.style.setProperty('--pointer-x', String(position.x));
        node.style.setProperty('--pointer-y', String(position.y));
      };
      const x = gsap.quickTo(position, 'x', { duration: .65, ease: 'power3.out', onUpdate: render });
      const y = gsap.quickTo(position, 'y', { duration: .65, ease: 'power3.out', onUpdate: render });
      let ready = false;
      const off = onReady(() => { ready = true; });
      const move = (event: PointerEvent) => {
        if (!ready || event.pointerType !== 'mouse') return;
        x(gsap.utils.clamp(-1, 1, event.clientX / innerWidth * 2 - 1));
        y(gsap.utils.clamp(-1, 1, event.clientY / innerHeight * 2 - 1));
      };
      const leave = () => { x(0); y(0); };
      node.addEventListener('pointermove', move, { passive: true });
      node.addEventListener('pointerleave', leave);
      return () => {
        off(); node.removeEventListener('pointermove', move); node.removeEventListener('pointerleave', leave);
        x.tween.kill(); y.tween.kill();
        node.style.removeProperty('--pointer-x'); node.style.removeProperty('--pointer-y');
      };
    });
    return () => mm.revert();
  }, { scope: root });
}
