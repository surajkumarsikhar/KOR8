'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap, Flip, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/intro';
import { work, type Film } from '@/content/site';
import { formatTimecode } from '@/lib/utils';

const TILT = [-4, 3, -2, 5, -3];
const LIFT = [6, -8, 10, -4, 4]; // vh offsets: cards sit at different heights
const PLACEHOLDER_DURATION = 8; // seconds, used until real clips exist

function FilmCard({ film, i, hidden, onOpen }: { film: Film; i: number; hidden: boolean; onOpen: (i: number) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const tc = useRef<HTMLSpanElement>(null);
  const playhead = useRef<HTMLSpanElement>(null);
  const pointer = useRef<string>('mouse');

  // Hover-scrub: mouse x → currentTime (desktop). Needs all-intra encodes.
  const scrub = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const v = video.current;
    const dur = v && Number.isFinite(v.duration) ? v.duration : PLACEHOLDER_DURATION;
    if (v && v.readyState >= 1) v.currentTime = p * dur;
    if (tc.current) tc.current.textContent = formatTimecode(p * dur);
    if (playhead.current) playhead.current.style.transform = `scaleX(${p})`;
  };
  const reset = () => {
    const v = video.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
    if (tc.current) tc.current.textContent = formatTimecode(0);
    if (playhead.current) playhead.current.style.transform = 'scaleX(0)';
  };
  // Mouse click opens the viewer; touch tap toggles the standard loop.
  const click = () => {
    if (pointer.current === 'mouse') return onOpen(i);
    const v = video.current;
    if (!v) return onOpen(i);
    if (v.paused) void v.play();
    else v.pause();
  };

  return (
    <article data-card data-i={i} className="film-frame w-[78vw] shrink-0 md:w-[34vw] md:max-w-[560px]">
      <div
        data-cursor="Play"
        role="button"
        tabIndex={0}
        aria-label={`Play ${film.title}`}
        onPointerDown={(e) => (pointer.current = e.pointerType)}
        onPointerMove={scrub}
        onPointerLeave={reset}
        onClick={click}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onOpen(i))}
        className="group relative aspect-[16/10] overflow-hidden bg-[#111] md:cursor-none"
      >
        <div data-flip-id={hidden ? undefined : `film-${i}`} className="absolute inset-0" style={{ visibility: hidden ? 'hidden' : undefined }}>
          <div data-media className="absolute inset-[-8%]">
            {film.scrubSrc || film.loopSrc ? (
              <video
                ref={video}
                className="h-full w-full object-cover"
                poster={film.poster}
                muted
                playsInline
                loop
                preload="metadata"
              >
                {film.scrubSrc && <source src={film.scrubSrc} media="(hover: hover)" type="video/mp4" />}
                {film.loopSrc && <source src={film.loopSrc} type="video/mp4" />}
              </video>
            ) : (
              <div
                className="h-full w-full"
                style={{ background: `radial-gradient(circle at ${30 + i * 12}% ${40 + (i % 2) * 20}%, #2b2b2b, #070707 65%)` }}
              />
            )}
          </div>
        </div>
        <span className="label absolute left-3 top-3 text-white/70">{String(i + 1).padStart(2, '0')} / {String(work.films.length).padStart(2, '0')}</span>
        <span ref={tc} className="label absolute right-3 top-3 tabular-nums text-white/70">00:00:00:00</span>
        <span ref={playhead} className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent" />
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className="text-lg tracking-tight">{film.title}</h3>
        <p className="label shrink-0">{film.type}, {film.year}</p>
      </div>
    </article>
  );
}

export default function Work() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const flipState = useRef<Flip.FlipState | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add('(min-width: 768px)', () => {
        const track = root.current!.querySelector<HTMLElement>('[data-track]')!;
        const dist = () => track.scrollWidth - window.innerWidth;

        const h = gsap.to(track, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => `+=${dist()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        // Giant WORK moves slower than the cards.
        gsap.to('[data-giant]', {
          xPercent: -25,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${dist()}`, scrub: 1 },
        });

        // Cards straighten, scale up and brighten as they reach centre.
        gsap.utils.toArray<HTMLElement>('[data-card]').forEach((card) => {
          const i = Number(card.dataset.i) % 5;
          const tl = gsap.timeline({
            scrollTrigger: { trigger: card, containerAnimation: h, start: 'left right', end: 'right left', scrub: true },
            defaults: { ease: 'power1.inOut' },
          });
          tl.fromTo(card, { rotation: TILT[i], y: () => (LIFT[i] * window.innerHeight) / 100, scale: 0.9, filter: 'brightness(0.55)' },
            { rotation: 0, y: 0, scale: 1, filter: 'brightness(1)', duration: 1 })
            .to(card, { rotation: -TILT[i], y: () => (-LIFT[i] * window.innerHeight) / 100, scale: 0.9, filter: 'brightness(0.55)', duration: 1 })
            .fromTo(card.querySelector('[data-media]'), { xPercent: 6 }, { xPercent: -6, duration: 2, ease: 'none' }, 0);
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // Flip: card media → fullscreen viewer (only one element owns each flip id at a time).
  const flipId = useRef<string>('');
  const openFilm = (i: number) => {
    flipId.current = `film-${i}`;
    flipState.current = Flip.getState(`[data-flip-id="${flipId.current}"]`);
    setOpen(i);
  };
  const closeFilm = () => {
    if (open === null) return;
    flipId.current = `film-${open}`;
    flipState.current = Flip.getState(`[data-flip-id="${flipId.current}"]`);
    setOpen(null);
  };

  useLayoutEffect(() => {
    if (!flipState.current) return;
    Flip.from(flipState.current, {
      targets: `[data-flip-id="${flipId.current}"]`,
      duration: 0.9,
      ease: 'power3.inOut',
      absolute: true,
    });
    flipState.current = null;
    if (open !== null) {
      gsap.fromTo('[data-viewer-ui]', { opacity: 0 }, { opacity: 1, delay: 0.5, duration: 0.4 });
    }
  }, [open]);

  useLayoutEffect(() => {
    if (open === null) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && closeFilm();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  });

  const film = open !== null ? work.films[open] : null;

  return (
    <section ref={root} id="work" className="relative overflow-hidden md:h-svh">
      <div data-giant className="giant-type absolute left-0 top-1/2 -translate-y-1/2 pl-[4vw]" aria-hidden="true">
        WORK WORK
      </div>

      <div className="relative flex h-full flex-col justify-center py-24 md:py-0">
        <header className="px-5 md:absolute md:left-10 md:top-28 md:px-0">
          <p className="label mb-4">[ work ] · 03</p>
          <h2 className="headline text-[clamp(2.5rem,5vw,5rem)]">Selected work</h2>
          <p className="mt-3 text-white/60">Films made for {work.client}.</p>
        </header>

        <div data-track className="mt-12 flex w-max flex-col gap-16 px-5 md:mt-16 md:flex-row md:items-center md:gap-[8vw] md:pl-[45vw] md:pr-[20vw]">
          {work.films.map((f, i) => (
            <FilmCard key={f.title} film={f} i={i} hidden={open === i} onOpen={openFilm} />
          ))}
        </div>
      </div>

      {film &&
        createPortal(
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 p-4 md:p-12" role="dialog" aria-modal="true" aria-label={film.title}>
            <div data-flip-id={`film-${open}`} className="relative aspect-video w-full max-w-[1400px] overflow-hidden bg-[#111]">
              {film.loopSrc ? (
                <video className="h-full w-full object-cover" src={film.loopSrc} poster={film.poster} autoPlay controls playsInline />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_40%_40%,#2b2b2b,#070707_65%)]">
                  <p className="label">Film coming soon</p>
                </div>
              )}
            </div>
            <div data-viewer-ui className="absolute inset-x-4 top-4 flex items-center justify-between md:inset-x-12 md:top-6">
              <p className="label text-white">{film.title} · {film.type}, {film.year}</p>
              <button type="button" onClick={closeFilm} className="label text-white hover:text-accent" autoFocus>
                [ close ]
              </button>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}
