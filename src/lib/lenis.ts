import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';

/**
 * Create a Lenis instance and drive it from the GSAP ticker so
 * ScrollTrigger stays in perfect sync. Returns a cleanup function.
 */
export function startLenis(): { lenis: Lenis; stop: () => void } {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return {
    lenis,
    stop: () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    },
  };
}
