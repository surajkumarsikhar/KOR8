'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);
const EMAIL = "mailto:business@kor8.in?subject=Let's%20Create%20Something";

export default function CinematicTeaser() {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef(1);
  const lastExposure = useRef(-Infinity);
  const progress = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState(1);
  const [chapter, setChapter] = useState('AWAKENING');

  useEffect(() => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const noise = ctx.createImageData(128, 128);
    for (let i = 0; i < noise.data.length; i += 4) {
      const n = Math.floor(Math.random() * 255);
      noise.data[i] = noise.data[i + 1] = noise.data[i + 2] = n; noise.data[i + 3] = 255;
    }
    ctx.putImageData(noise, 0, 0);
    root.current?.style.setProperty('--film-noise', `url(${canvas.toDataURL()})`);
  }, []);

  const { contextSafe } = useGSAP(() => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const mm = gsap.matchMedia();
    mm.add({ motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 1024px)', fine: '(hover: hover) and (pointer: fine)' }, context => {
      const { motion, desktop, fine } = context.conditions!;
      if (!motion) return;
      const intro = gsap.timeline({ defaults: { ease: 'power2.out' } });
      intro.fromTo(q('[data-brand-intro]'), { opacity: .04, filter: 'brightness(.25)' }, { opacity: 1, filter: 'brightness(1)', duration: 1.4 })
        .fromTo(q('[data-opening-line]'), { yPercent: 8, opacity: .7 }, { yPercent: 0, opacity: 1, stagger: .13, duration: .85 }, 0)
        .fromTo(q('.hero-notes'), { opacity: 0 }, { opacity: 1, duration: .6 }, 1.1);

      let offPointer = () => {};
      if (fine) {
        const light = { x: .35, y: -.2 };
        const weave = { x: 0, y: 0, r: 0 };
        const paintLight = () => {
          el.style.setProperty('--light-x', `${50 + light.x * 38}%`);
          el.style.setProperty('--light-y', `${50 + light.y * 32}%`);
          el.style.setProperty('--pointer-x', String(light.x)); el.style.setProperty('--pointer-y', String(light.y));
        };
        const x = gsap.quickTo(light, 'x', { duration: .85, ease: 'power3.out', onUpdate: paintLight });
        const y = gsap.quickTo(light, 'y', { duration: .85, ease: 'power3.out', onUpdate: paintLight });
        const paintWeave = () => {
          el.style.setProperty('--weave-x', `${weave.x}px`); el.style.setProperty('--weave-y', `${weave.y}px`); el.style.setProperty('--weave-r', `${weave.r}deg`);
        };
        const settle = gsap.to(weave, { x: 0, y: 0, r: 0, duration: .5, paused: true, ease: 'power2.out', onUpdate: paintWeave });
        let previous: { x: number; y: number; time: number } | undefined;
        let phase = 0;
        const move = (event: PointerEvent) => {
          if (event.pointerType !== 'mouse') return;
          x(gsap.utils.clamp(-1, 1, event.clientX / innerWidth * 2 - 1));
          y(gsap.utils.clamp(-1, 1, event.clientY / innerHeight * 2 - 1));
          const dt = previous ? event.timeStamp - previous.time : Infinity;
          if (previous && dt >= 35 && dt < 200) {
            const gain = Math.min(1, Math.hypot(event.clientX - previous.x, event.clientY - previous.y) / dt / 2);
            phase += 1.73; weave.x = Math.sin(phase) * .9 * gain; weave.y = Math.cos(phase * 1.3) * .6 * gain; weave.r = Math.sin(phase * .7) * .035 * gain;
            paintWeave(); settle.invalidate().restart();
          }
          if (dt >= 35) previous = { x: event.clientX, y: event.clientY, time: event.timeStamp };
        };
        const leave = () => { x(0); y(0); previous = undefined; };
        el.addEventListener('pointermove', move, { passive: true }); el.addEventListener('pointerleave', leave);
        offPointer = () => {
          el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave);
          x.tween.kill(); y.tween.kill(); settle.kill();
          ['--light-x', '--light-y', '--pointer-x', '--pointer-y', '--weave-x', '--weave-y', '--weave-r'].forEach(name => el.style.removeProperty(name));
        };
      }

      if (desktop) {
        const bridge = q('[data-brand-bridge]')[0] as HTMLElement;
        const scenes = Array.from(el.querySelectorAll<HTMLElement>('[data-scene]'));
        const film = q('[data-scene="film"]'), photo = q('[data-scene="photography"]'), direction = q('[data-scene="direction"]'), invitation = q('[data-scene="invitation"]');
        const closed = 'polygon(0 120%,100% 100%,100% 100%,0 100%)';
        const open = 'polygon(0 0%,100% -20%,100% 100%,0 100%)';
        gsap.set([film, photo, direction, invitation].flat(), { autoAlpha: 0 });
        gsap.set([film, photo, direction].flat(), { clipPath: closed });
        const timeline = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
          id: 'teaser-film', trigger: q('[data-story]')[0], start: 'top top', end: 'bottom bottom', scrub: .45, invalidateOnRefresh: true,
        } });
        timeline.to(q('[data-hero-copy], .hero-notes'), { opacity: 0, y: -25, duration: .75 }, .65)
          .to(bridge, { x: () => innerWidth * .5 - bridge.offsetLeft - bridge.offsetWidth / 2,
            y: () => innerHeight * .5 - bridge.offsetTop - bridge.offsetHeight / 2, scale: 2.6, duration: 1.5 }, .8)
          .to(q('[data-portal-photo]'), { opacity: 1, duration: .65 }, .95)
          .fromTo(q('.portal-note'), { opacity: 0 }, { opacity: 1, duration: .35 }, 1.35)
          .to(q('.portal-note'), { opacity: 0, duration: .3 }, 2.05)
          .set(film, { autoAlpha: 1 }, 2)
          .to(film, { clipPath: open, duration: .85 }, 2)
          .fromTo(q('[data-scene="film"] h2'), { yPercent: 110 }, { yPercent: 0, duration: .55 }, 2.55)
          .set(q('[data-scene="hero"]'), { autoAlpha: 0 }, 2.9)
          .to(q('[data-scene="film"] .media-depth'), { scale: 1.045, duration: 1.9 }, 2.5)
          .set(photo, { autoAlpha: 1 }, 4)
          .to(photo, { clipPath: open, duration: .85 }, 4)
          .fromTo(q('[data-scene="photography"] h2'), { yPercent: 110 }, { yPercent: 0, duration: .55 }, 4.5)
          .to(q('[data-scene="photography"] .media-depth'), { yPercent: -3, duration: 1.8 }, 4.4)
          .set(direction, { autoAlpha: 1 }, 6)
          .to(direction, { clipPath: open, duration: .85 }, 6)
          .fromTo(q('[data-scene="direction"] h2'), { yPercent: 110 }, { yPercent: 0, duration: .55 }, 6.5)
          .to(q('[data-scene="direction"] .media-depth'), { scale: 1.035, duration: 1.6 }, 6.5)
          .to(invitation, { autoAlpha: 1, duration: 1 }, 8)
          .fromTo(q('.invitation-content'), { y: 35, opacity: 0 }, { y: 0, opacity: 1, duration: .7 }, 8.25)
          .fromTo(q('.invitation-symbol'), { scale: 1.12 }, { scale: 1, duration: .9 }, 8.1)
          .addLabel('invitation', 9)
          .to({}, { duration: 1 }, 9);
        let current = '';
        const sync = () => {
          const t = timeline.time();
          const active = t < 2.75 ? 'hero' : t < 4.75 ? 'film' : t < 6.75 ? 'photography' : t < 8.65 ? 'direction' : 'invitation';
          scenes.forEach(scene => { scene.inert = scene.dataset.scene !== active; });
          if (current !== active) { current = active; setChapter(active === 'hero' ? 'AWAKENING' : active.toUpperCase()); }
          if (progress.current) progress.current.style.transform = `scaleX(${timeline.progress()})`;
        };
        el.classList.add('cinema-ready');
        timeline.eventCallback('onUpdate', sync); sync();
      } else {
        gsap.to(q('[data-portal-photo]'), { opacity: 1, ease: 'none', scrollTrigger: { trigger: q('.hero')[0], start: 'top top', end: 'bottom 65%', scrub: .25 } });
        q('.fragment').forEach((scene: HTMLElement) => {
          gsap.fromTo(scene.querySelector('.fragment-media'), { clipPath: 'polygon(0 18%,100% 0,100% 100%,0 100%)' },
            { clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%)', ease: 'none', scrollTrigger: { trigger: scene, start: 'top 90%', end: 'top 25%', scrub: .25 } });
          gsap.fromTo(scene.querySelector('h2'), { y: 24, opacity: .2 }, { y: 0, opacity: 1, scrollTrigger: { trigger: scene, start: 'top 65%', end: 'top 20%', scrub: .25 } });
        });
      }
      let alive = true;
      document.fonts.ready.then(() => { if (alive) ScrollTrigger.refresh(); });
      const images = Array.from(el.querySelectorAll('img'));
      const refresh = () => ScrollTrigger.refresh();
      images.forEach(img => img.addEventListener('load', refresh));
      return () => {
        alive = false; el.classList.remove('cinema-ready'); offPointer(); images.forEach(img => img.removeEventListener('load', refresh));
        el.querySelectorAll<HTMLElement>('[data-scene]').forEach(scene => { scene.inert = false; });
      };
    });
    return () => mm.revert();
  }, { scope: root });

  const expose = contextSafe(() => {
    const now = performance.now(); if (now - lastExposure.current < 1400) return;
    lastExposure.current = now; counter.current += 1; setFrame(counter.current);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.timeline().to('[data-exposure]', { opacity: .14, duration: .09, ease: 'power1.out' })
      .to('[data-exposure]', { opacity: 0, duration: .5, ease: 'power2.out' });
  });
  const skipToInvitation = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const trigger = ScrollTrigger.getById('teaser-film');
    if (!trigger) return;
    event.preventDefault();
    window.scrollTo({ top: trigger.labelToScroll('invitation'), behavior: 'instant' });
    trigger.animation?.progress(.9); ScrollTrigger.update();
    const node = document.getElementById('invitation'); if (node) { node.inert = false; node.focus({ preventScroll: true }); }
  };

  return <div ref={root} className="teaser" data-chapter={chapter}>
    <a href="#invitation" className="skip-link" onClick={skipToInvitation}>Skip to invitation</a>
    <header className="site-header"><a href="#" className="wordmark" aria-label="KOR8 home"><img src="/images/wordmark.svg" width="150" height="36" alt="KOR8" /></a><span className="header-studio">INDEPENDENT CREATIVE PRODUCTION</span><a className="header-contact" href={EMAIL}>START A PROJECT <span aria-hidden="true">+</span></a></header>
    <main data-story className="story">
      <div className="stage">
        <section className="scene hero" data-scene="hero" aria-labelledby="opening-title">
          <div className="studio-shadow" aria-hidden="true" /><div className="studio-light" aria-hidden="true" />
          <div data-hero-copy className="hero-copy"><p className="eyebrow">NOT YET IN FRAME / KOR8</p><h1 id="opening-title" aria-label="The Next Frame Is Infinite."><span className="line-mask"><span data-opening-line>THE NEXT</span></span><span className="line-mask"><span data-opening-line>FRAME IS</span></span><span className="line-mask"><span data-opening-line>INFINITE<span className="crimson">.</span></span></span></h1></div>
          <div data-brand-bridge className="brand-bridge"><div data-brand-intro className="brand-intro"><div className="brand-depth"><div className="brand-mask"><div className="brand-metal" /><img decoding="async" data-portal-photo className="portal-photo" src="/images/film.webp" width="1440" height="960" alt="" /><div className="brand-sheen" /></div></div></div></div>
          <p className="portal-note">INDEPENDENT CREATIVE PRODUCTION.</p>
          <div className="hero-notes"><p>Film, photography<br />and creative direction.</p><p id="capture-hint" className="capture-hint"><span className="desktop-hint">MOVE TO LIGHT / CLICK TO EXPOSE</span><span className="touch-hint">TAP TO EXPOSE A FRAME</span></p><span className="scroll-cue" aria-hidden="true">SCROLL TO EXPLORE <span>↓</span></span></div>
          <button className="exposure-target" aria-label="Capture a frame" aria-describedby="capture-hint" onClick={expose}><span className="focus-corners" aria-hidden="true" /></button>
          <div data-exposure className="exposure-wash" aria-hidden="true" />
          <p className="frame-counter" aria-live="polite">FRAME {String(frame).padStart(3, '0')}<span className="sr-only">{frame > 1 ? ' captured' : ''}</span></p>
        </section>
        <section id="film" className="scene fragment film" data-scene="film" aria-labelledby="film-title"><div className="fragment-media"><div className="media-depth"><img src="/images/film.webp" width="1440" height="960" alt="A clapperboard held against an open sky, an illustrative production study" loading="lazy" decoding="async" /></div></div><div className="image-shade" /><p className="scene-index">01 / THE MOVING IMAGE</p><div className="fragment-title"><div className="line-mask"><h2 id="film-title">FILM.</h2></div><p>Film production for brands and independent projects.</p></div><p className="study-note">ILLUSTRATIVE STUDY / NOT CLIENT WORK</p></section>
        <section className="scene fragment photography" data-scene="photography" aria-labelledby="photo-title"><div className="fragment-media"><div className="media-depth"><img src="/images/portrait.webp" width="960" height="1200" alt="Crimson-lit editorial portrait, a studio visual study" loading="lazy" decoding="async" /></div></div><div className="image-shade" /><p className="scene-index">02 / THE STILL IMAGE</p><div className="fragment-title"><div className="line-mask"><h2 id="photo-title">PHOTOGRAPHY.</h2></div><p>Photography for brand campaigns and editorial stories.</p></div><p className="study-note">VISUAL STUDY / NOT CLIENT WORK</p></section>
        <section className="scene fragment direction" data-scene="direction" aria-labelledby="direction-title"><div className="fragment-media"><div className="media-depth"><img src="/images/direction.webp" width="960" height="1200" alt="Editorial portrait with sculptural crimson light, a visual direction study" loading="lazy" decoding="async" /></div></div><div className="image-shade" /><p className="scene-index">03 / THE POINT OF VIEW</p><div className="fragment-title"><div className="line-mask"><h2 id="direction-title">CREATIVE<br />DIRECTION.</h2></div><p>Creative direction for brand campaigns and visual storytelling.</p></div><p className="study-note">VISUAL STUDY / NOT CLIENT WORK</p></section>
        <section id="invitation" tabIndex={-1} className="scene invitation" data-scene="invitation" aria-labelledby="invitation-title"><div className="invitation-content"><img className="invitation-symbol" src="/images/brand-symbol.svg" width="95" height="63" alt="" /><p className="eyebrow">THE SITE IS COMING.</p><h2 id="invitation-title">THE WORK<br />STARTS NOW.</h2><p className="invitation-description">KOR8 is an independent creative production studio. Tell us what you have in mind.</p><a className="project-cta" href={EMAIL}>START A PROJECT <span aria-hidden="true">+</span></a></div><footer className="invitation-footer"><a href="mailto:business@kor8.in">business@kor8.in</a><span>KOR8 / INDEPENDENT BY DESIGN</span></footer></section>
      </div>
    </main>
    <div className="film-grain" aria-hidden="true" /><div className="viewfinder" aria-hidden="true" />
    <div className="playhead" aria-hidden="true"><span>REC</span><span>{chapter}</span><div className="progress-track"><div ref={progress} /></div></div>
    <noscript><style>{'.story{height:auto!important}.stage{position:relative!important;height:auto!important}.scene{position:relative!important;min-height:100svh;opacity:1!important;visibility:visible!important}'}</style></noscript>
  </div>;
}
