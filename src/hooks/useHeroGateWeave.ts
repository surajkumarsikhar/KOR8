'use client';

import type { RefObject } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { onReady } from '@/lib/intro';

/** A bounded impulse, not pointer-position parallax. Scroll owns only strength. */
export function useHeroGateWeave(root: RefObject<HTMLElement | null>) {
  useGSAP(() => {
    const el = root.current!;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)', () => {
      const layers = Array.from(el.querySelectorAll<HTMLElement>('[data-weave]')).map(node => ({
        weight: node.dataset.weave === 'grain' ? 1 : node.dataset.weave === 'type' ? 0.35 : 0.28,
        x: gsap.quickSetter(node, 'x', 'px'), y: gsap.quickSetter(node, 'y', 'px'),
        rotation: gsap.quickSetter(node, 'rotation', 'deg'),
      }));
      const impulse = { x: 0, y: 0, rotation: 0 };
      let ready = false;
      const off = onReady(() => { ready = true; });
      const render = () => {
        const strength = Number(gsap.getProperty(el, '--hero-weave-strength'));
        for (const layer of layers) {
          const gain = layer.weight * strength;
          layer.x(impulse.x * gain); layer.y(impulse.y * gain); layer.rotation(impulse.rotation * gain);
        }
      };
      // Exactly one reusable decay tween, regardless of pointer-event frequency.
      const settle = gsap.to(impulse, { x: 0, y: 0, rotation: 0, duration: 0.55,
        ease: 'power2.out', paused: true, onUpdate: render });
      let previous: { x: number; y: number; time: number } | undefined;
      let phase = 0;
      const move = (event: PointerEvent) => {
        if (!ready || event.pointerType !== 'mouse') return;
        const now = event.timeStamp;
        if (!previous || now - previous.time > 180) {
          previous = { x: event.clientX, y: event.clientY, time: now }; return;
        }
        const dt = now - previous.time;
        if (dt < 32) return;
        const speed = Math.hypot(event.clientX - previous.x, event.clientY - previous.y) / dt;
        previous = { x: event.clientX, y: event.clientY, time: now };
        const gain = Math.min(1, speed / 1.5);
        phase += 1.73;
        impulse.x = Math.sin(phase) * 1.5 * gain;
        impulse.y = Math.sin(phase * 1.37 + 0.6) * gain;
        impulse.rotation = Math.sin(phase * 0.79) * 0.12 * gain;
        render(); settle.invalidate().restart();
      };
      const leave = () => { previous = undefined; };
      el.addEventListener('pointermove', move, { passive: true });
      el.addEventListener('pointerleave', leave);
      return () => {
        off(); el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave);
        settle.kill();
        Object.assign(impulse, { x: 0, y: 0, rotation: 0 }); render();
      };
    });
    return () => mm.revert();
  }, { scope: root });
}
