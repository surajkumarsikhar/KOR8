'use client';

import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { onReady } from '@/lib/intro';
import { scrollToAnchor } from '@/components/layout/SmoothScroll';
import Hero from './Hero';
import SharedBrandMark from '@/components/ui/SharedBrandMark';
import ArchiveScene from './ArchiveScene';
import VisionAndThroughTheFrame from './VisionAndThroughTheFrame';
import CollaborationAndWhiteTransition from './CollaborationAndWhiteTransition';
import BeyondAndCreateClosing from './BeyondAndCreateClosing';

/**
 * One clock owns every scene handoff. CSS sticky supplies the pin: no spacer
 * insertion or reparenting of React nodes. Children only animate intro layers.
 * All timeline positions are film-time units, independent of viewport height.
 */
export default function CinematicExperience() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {

    const el = root.current!;
    const q = gsap.utils.selector(el);
    const mm = gsap.matchMedia();
    mm.add({ motion: '(prefers-reduced-motion: no-preference)', mobile: '(max-width: 767px)' }, (context) => {
      if (!context.conditions?.motion) {
        // In the static layout, suppress global grain only while the hero is visible.
        const observer = new IntersectionObserver(([entry]) => {
          el.toggleAttribute('data-hero-atmosphere', entry.isIntersecting);
        });
        observer.observe(q('[data-scene="hero"]')[0]);
        return () => { observer.disconnect(); el.removeAttribute('data-hero-atmosphere'); };
      }
      const mobile = context.conditions.mobile;
      el.dataset.animated = 'true';
      const scene = (name: string) => q(`[data-scene="${name}"]`);
      gsap.set([scene('universe'), scene('vision'), scene('collaboration'), scene('beyond'), scene('closing')].flat(), { autoAlpha: 0 });
      const hero = scene('hero')[0] as HTMLElement;
      const fullBoundary = () => `${hero.clientHeight + hero.clientWidth * Math.tan(Math.PI / 18) + 2}px`;
      const source = q('[data-brand-source]')[0] as HTMLElement;
      const destination = q('[data-brand-destination]')[0] as HTMLElement;
      const brandTarget = () => {
        const a = source.getBoundingClientRect(), b = destination.getBoundingClientRect();
        return { x: b.left - a.left, y: b.top - a.top, scale: b.width / a.width };
      };
      gsap.set(q('[data-shared-brand]'), { transformOrigin: '0 0' });
      gsap.set(scene('beyond'), { clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)' });
      gsap.set(scene('closing'), { clipPath: 'inset(38% 33% 28% 35%)' });
      gsap.set(q('[data-travel-frame]'), { y: () => innerHeight * 1.3, xPercent: mobile ? -4 : -12, rotation: -5, scale: 0.9 });
      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          id: 'kor8-film', trigger: el, start: 'top top', end: 'bottom bottom',
          scrub: mobile ? 0.35 : 0.65, invalidateOnRefresh: true,
        },
      });
      timeline.addLabel('top', 0)
        .to(scene('hero'), { '--hero-weave-strength': 0, duration: 0.9 }, 0.2)
        .to(scene('hero'), { '--hero-parallax-strength': 0, duration: 0.8 }, 0.4)
        .to(q('[data-hero-grain]'), { opacity: 0, duration: 0.9 }, 0.55)
        .to(q('[data-group]'), { autoAlpha: 0, xPercent: (i) => i % 2 ? 12 : -12, duration: 0.55 }, 0.2)
        .to(q('[data-title-scale]'), { scale: 0.92, duration: 0.7 }, 0.55)
        .to(q('[data-edge]'), { autoAlpha: 0.65, duration: 0.7 }, 0.65)
        .set(scene('universe'), { autoAlpha: 1 }, 0.95)
        .fromTo(hero, { '--hero-wipe-y': fullBoundary }, { '--hero-wipe-y': '-2px', duration: 1.5 }, 0.95)
        .fromTo(q('[data-archive-word]'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.3 }, 2.05)
        .to(q('[data-shared-brand]'), { x: () => brandTarget().x, y: () => brandTarget().y, scale: () => brandTarget().scale,
          duration: 0.5, ease: 'power2.inOut' }, 2.45)
        .set(scene('hero'), { autoAlpha: 0 }, 2.85)
        .addLabel('universe', 2.95)
        // B: The quote appears behind the departing images, before they leave.
        .to(scene('vision'), { autoAlpha: 1, duration: 0.65 }, 3.45)
        .to(q('[data-archive-handoff]'), { clipPath: 'inset(0% 0% 100% 0%)', duration: 2.1 }, 3.1)
        .to(q('[data-shared-brand]'), { autoAlpha: 0, duration: 0.3 }, 3.1)
        .set(scene('universe'), { autoAlpha: 0 }, 5.2)
        .fromTo(q('[data-vision-type]'), { scale: mobile ? 1.45 : 1.85, color: '#242023' }, { scale: 1, color: '#F2F0EC', duration: 1.65 }, 3.65)
        .fromTo(q('[data-vision-type] em'), { color: '#242023' }, { color: '#E01835', duration: 0.8 }, 4.5)
        .fromTo(q('[data-vision-detail]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.65 }, 4.7)
        .addLabel('vision', 5.35)
        // C: A portrait physically traverses the still-readable statement.
        .to(q('[data-travel-frame]'), { y: () => innerHeight * 0.02, xPercent: 0, rotation: -1, scale: 1.04, duration: 1.35, ease: 'power1.out' }, 5.7)
        .to(q('[data-travel-frame]'), { y: () => -innerHeight * 1.25, xPercent: mobile ? 4 : 13, rotation: 3, scale: 0.95, duration: 1.45, ease: 'power1.in' }, 7.05)
        .to(q('.vision-composition, .vision-scene .scene-meta'), { clipPath: 'inset(0 0 100% 0)', opacity: 0, duration: 0.55 }, 7.5)
        .fromTo(q('.collaboration-scene h2, .collab-notes, .collaboration-scene .scene-meta'), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.65 }, 8.25)
        .addLabel('frame', 7)
        .to(scene('collaboration'), { autoAlpha: 1, duration: 0.75 }, 8)
        .to(scene('vision'), { autoAlpha: 0, duration: 0.6 }, 8.2)
        .fromTo(q('[data-collab-main]'), { yPercent: 20, rotation: -3 }, { yPercent: -8, rotation: 1, duration: 2.5 }, 8)
        .fromTo(q('[data-collab-side]'), { yPercent: 45 }, { yPercent: -30, xPercent: (i) => i ? 10 : -10, stagger: 0.15, duration: 2.4 }, 8)
        .fromTo(q('.collab-backtype'), { xPercent: 5 }, { xPercent: -12, duration: 2.6 }, 8)
        .addLabel('collaboration', 9)
        // D: The white scene itself is the incoming geometric surface.
        .set(scene('beyond'), { autoAlpha: 1 }, 10)
        .to(scene('beyond'), { clipPath: 'polygon(0 -30%, 100% 0%, 100% 100%, 0 100%)', duration: 1.5, ease: 'power1.inOut' }, 10)
        .set(scene('collaboration'), { autoAlpha: 0 }, 11.5)
        .fromTo(q('[data-collage-frame]'), { yPercent: (i) => [35, 10, 55, 30][i], rotation: (i) => i % 2 ? 3 : -4 },
          { yPercent: (i) => [-45, -20, -70, -45][i], xPercent: (i) => i % 2 ? 12 : -10, rotation: (i) => i % 2 ? -2 : 3, duration: 1.8 }, 10.6)
        .fromTo(q('.beyond-title'), { yPercent: 10 }, { yPercent: -8, duration: 2.4 }, 10.8)
        .addLabel('beyond', 11.65)
        .to(q('[data-collage-frame]'), { yPercent: (i) => [-95, -65, -25, 25][i], xPercent: (i) => i % 2 ? 25 : -20, duration: 1.3, ease: 'power1.inOut' }, 12.45)
        .to(q('.beyond-title, .beyond-scene .scene-meta, .beyond-scene .scene-footnote'), { opacity: 0, duration: 0.55 }, 12.55)
        .set(scene('closing'), { autoAlpha: 1 }, 12.7)
        .to(scene('closing'), { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power2.inOut' }, 12.7)
        .fromTo(q('.closing-content'), { y: 45, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9 }, 12.95)
        .set(scene('beyond'), { autoAlpha: 0 }, 14)
        .addLabel('contact', 14.1)
        .to({}, { duration: 0.4 }, 14);

      let cancelled = false;
      const refresh = () => { if (!cancelled) ScrollTrigger.refresh(); };
      let anchorFrame = 0;
      const off = onReady(() => {
        refresh();
        // Resolve incoming archive links only after this scene's clock exists.
        anchorFrame = requestAnimationFrame(() => {
          if (!cancelled && location.hash.slice(1) in timeline.labels) scrollToAnchor(location.hash, true);
        });
      });
      document.fonts.ready.then(refresh);
      const imgs = Array.from(el.querySelectorAll('img'));
      imgs.forEach(img => img.addEventListener('load', refresh, { once: true }));
      // Hidden scene links cannot be reached by tabbing through the film.
      const syncAccessibility = () => {
        const t = timeline.time();
        el.toggleAttribute('data-hero-atmosphere', t < 2.6);
        const hud = document.querySelector<HTMLElement>('[data-film-hud]');
        if (hud) { hud.style.opacity = t > 2.5 && t < 4.5 ? '0.25' : '0.55'; hud.textContent = ['INFINITE', 'ARCHIVE', 'VISION', 'THROUGH THE FRAME', 'COLLABORATION', 'BEYOND', 'CREATE'][t < 2.6 ? 0 : t < 4.5 ? 1 : t < 5.7 ? 2 : t < 8.5 ? 3 : t < 11.1 ? 4 : t < 13.7 ? 5 : 6]; }
        const active = t < 1.9 ? 'hero' : t < 4.5 ? 'universe' : t < 8.5 ? 'vision' : t < 11.1 ? 'collaboration' : t < 13.7 ? 'beyond' : 'closing';
        el.querySelectorAll<HTMLElement>('[data-scene]').forEach(node => {
          node.inert = node.dataset.scene !== active;
        });
      };
      timeline.eventCallback('onUpdate', syncAccessibility);
      syncAccessibility();
      return () => {
        cancelled = true;
        cancelAnimationFrame(anchorFrame);
        off();
        imgs.forEach(img => img.removeEventListener('load', refresh));
        delete el.dataset.animated;
        el.removeAttribute('data-hero-atmosphere');
        el.querySelectorAll<HTMLElement>('[data-scene]').forEach(node => { node.inert = false; });
      };
    });
    return () => mm.revert();
  }, { scope: root });

  return <div ref={root} className="cinematic-film" data-hero-atmosphere="">
    <div className="film-stage">
      <Hero />
      <SharedBrandMark />
      <ArchiveScene />
      <VisionAndThroughTheFrame />
      <CollaborationAndWhiteTransition />
      <BeyondAndCreateClosing />
    </div>
  </div>;
}










