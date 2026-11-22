'use client';
import { gsap, useGSAP } from '@/lib/gsap';
import { onReady } from '@/lib/intro';
import './site-atmosphere.css';

/** CSS longhands keep atmospheric movement independent of GSAP scroll transforms. */
export default function SiteGateWeave() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)', () => {
      const style = document.documentElement.style;
      const impulse = { x: 0, y: 0, rotation: 0 };
      let ready = false;
      const off = onReady(() => { ready = true; });
      const render = () => {
        style.setProperty('--site-weave-x', `${impulse.x}px`);
        style.setProperty('--site-weave-y', `${impulse.y}px`);
        style.setProperty('--site-weave-r', `${impulse.rotation}deg`);
      };
      const settle = gsap.to(impulse, { x: 0, y: 0, rotation: 0, paused: true, duration: .55, ease: 'power2.out', onUpdate: render });
      let previous: { x: number; y: number; time: number } | undefined;
      let phase = 0;
      const move = (event: PointerEvent) => {
        if (!ready || event.pointerType !== 'mouse' || event.buttons) return;
        const time = event.timeStamp;
        if (!previous || time - previous.time > 180) { previous = { x: event.clientX, y: event.clientY, time }; return; }
        const dt = time - previous.time;
        if (dt < 32) return;
        const gain = Math.min(1, Math.hypot(event.clientX - previous.x, event.clientY - previous.y) / dt / 1.5);
        previous = { x: event.clientX, y: event.clientY, time }; phase += 1.73;
        impulse.x = Math.sin(phase) * 1.5 * gain;
        impulse.y = Math.sin(phase * 1.37 + .6) * gain;
        impulse.rotation = Math.sin(phase * .79) * .12 * gain;
        render(); settle.invalidate().restart();
      };
      document.addEventListener('pointermove', move, { passive: true });
      return () => {
        off(); document.removeEventListener('pointermove', move); settle.kill();
        ['--site-weave-x', '--site-weave-y', '--site-weave-r'].forEach(name => style.removeProperty(name));
      };
    });
    return () => mm.revert();
  }, []);
  return null;
}
