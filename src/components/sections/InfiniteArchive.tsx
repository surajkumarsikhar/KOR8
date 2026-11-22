'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { archiveProjects, archiveTiles, type ArchiveProject } from '@/content/archive';
import './archive.css';
import { scrollToAnchor } from '@/components/layout/SmoothScroll';

type Selection = { project: ArchiveProject; bounds: DOMRect; opener: HTMLButtonElement };
const copies = Array.from({ length: 9 }, (_, i) => ({ x: i % 3, y: Math.floor(i / 3) }));
const wrap = (n: number, size: number) => ((n % size) + size) % size;

function ProjectViewer({ selection, close }: { selection: Selection; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const { project, bounds } = selection;
  useGSAP(() => {
    const node = dialog.current!;
    node.showModal();
    const target = card.current!.getBoundingClientRect();
    const play = () => { void video.current?.play().catch(() => { /* Native controls remain available. */ }); };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set('[data-archive-flip]', { rotationY: 180 }); play();
    } else {
      gsap.timeline()
        .fromTo(card.current, { x: bounds.left - target.left, y: bounds.top - target.top,
          scaleX: bounds.width / target.width, scaleY: bounds.height / target.height },
        { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.65, ease: 'power3.inOut' })
        .to('[data-archive-flip]', { rotationY: 180, duration: 0.85, ease: 'power2.inOut' }, 0.5)
        .call(play);
    }
    return () => { node.close(); selection.opener.focus({ preventScroll: true }); };
  }, { scope: dialog });
  return <dialog ref={dialog} className="archive-dialog" aria-labelledby="archive-project-title"
    onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === event.currentTarget) close(); }}>
    <button className="archive-close" autoFocus onClick={close}>Close project</button>
    <div ref={card} className="archive-presentation"><div data-archive-flip className="archive-flip">
      <div className="archive-face archive-front" aria-hidden="true"><img src={project.src} alt="" /></div>
      <div className="archive-face archive-back">
        {project.video ? <video ref={video} src={project.video} poster={project.src} muted playsInline loop controls preload="metadata" /> : <img src={project.src} alt={project.alt} />}
        <div className="archive-project-copy"><p>{project.note}</p><h2 id="archive-project-title">{project.title}</h2></div>
      </div>
    </div></div>
  </dialog>;
}

export default function InfiniteArchive({ embedded = false }: { embedded?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const wall = useRef<HTMLDivElement>(null);
  const movement = useRef({ x: 0, y: 0, width: 1, height: 1 });
  const drag = useRef<{ id: number; x: number; y: number; distance: number } | null>(null);
  const suppressClick = useRef(false);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [exploring, setExploring] = useState(false);
  useEffect(() => {
    if (!embedded) return;
    const scene = root.current!.closest<HTMLElement>('[data-scene]')!;
    const observer = new MutationObserver(() => {
      if (scene.inert) { setExploring(false); setSelection(null); }
    });
    observer.observe(scene, { attributes: true, attributeFilter: ['inert'] });
    return () => observer.disconnect();
  }, [embedded]);
  const paint = () => {
    const m = movement.current;
    m.x = wrap(m.x, m.width); m.y = wrap(m.y, m.height);
    // One integer-pixel transform for the entire wall; whole repeats overscan
    // both axes. Modulo is safe even for arbitrarily large wheel deltas.
    wall.current!.style.transform = `translate3d(${Math.round(m.x) - m.width}px,${Math.round(m.y) - m.height}px,0)`;
  };
  const move = (x: number, y: number) => { movement.current.x += x; movement.current.y += y; paint(); };
  useEffect(() => {
    const node = root.current!;
    const resize = () => {
      const col = Math.max(100, Math.ceil((node.clientWidth + 24) / 6));
      const row = Math.max(120, Math.ceil((node.clientHeight + 24) / 4));
      movement.current.width = col * 6; movement.current.height = row * 4;
      node.style.setProperty('--archive-col', `${col}px`); node.style.setProperty('--archive-row', `${row}px`); paint();
    };
    const observer = new ResizeObserver(resize); observer.observe(node); resize();
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      if (selection) { event.preventDefault(); return; }
      if (embedded && !exploring) return;
      event.preventDefault();
      const factor = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? node.clientHeight : 1;
      move(-(event.shiftKey ? event.deltaY : event.deltaX) * factor, -(event.shiftKey ? 0 : event.deltaY) * factor);
    };
    node.addEventListener('wheel', wheel, { passive: false });
    return () => { observer.disconnect(); node.removeEventListener('wheel', wheel); };
  }, [embedded, exploring, selection]);
  const continueTo = (id: string) => {
    setExploring(false); setSelection(null); scrollToAnchor(id);
  };
  return <section ref={root} className={`infinite-archive${embedded ? ' archive-embedded' : ''}`} data-exploring={exploring || undefined} data-lenis-prevent={(!embedded || exploring || selection) ? '' : undefined} aria-label="Infinite photographic archive"
    onKeyDown={event => {
      if (event.key === 'Enter' || event.key === ' ') suppressClick.current = false;
      const delta: Record<string, [number, number]> = { ArrowLeft: [120, 0], ArrowRight: [-120, 0], ArrowUp: [0, 120], ArrowDown: [0, -120] };
      if (delta[event.key] && !selection) { event.preventDefault(); move(...delta[event.key]); }
    }}
    onPointerDown={event => {
      if (selection || (embedded && !exploring) || event.button !== 0 || (event.target as HTMLElement).closest('a, .archive-controls')) return;
      drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, distance: 0 }; suppressClick.current = false;
    }}
    onPointerMove={event => {
      const d = drag.current; if (!d || d.id !== event.pointerId) return;
      const x = event.clientX - d.x, y = event.clientY - d.y;
      d.distance += Math.abs(x) + Math.abs(y);
      if (d.distance > 6) { root.current!.setPointerCapture(event.pointerId); suppressClick.current = true; move(x, y); }
      d.x = event.clientX; d.y = event.clientY;
    }}
    onPointerUp={event => {
      const d = drag.current;
      drag.current = null;
      // Touch browsers may suppress the synthetic click immediately after a drag.
      // Activate an intentional tap directly and ignore its later compatibility click.
      if (event.pointerType === 'touch' && d && d.distance <= 6) {
        const tile = (event.target as HTMLElement).closest<HTMLButtonElement>('.archive-tile');
        tile?.click(); suppressClick.current = true;
      }
    }} onPointerCancel={() => { drag.current = null; }}>
    <div ref={wall} className="archive-wall">
      {copies.map((copy, copyIndex) => <div key={copyIndex} className="archive-repeat" style={{ left: `${copy.x * 100}%`, top: `${copy.y * 100}%` }}>
        {archiveTiles.map((tile, index) => {
          const project = archiveProjects[tile.project];
          return <button key={index} type="button" className="archive-tile" tabIndex={copyIndex === 4 ? 0 : -1}
            aria-label={`Open ${project.title}${project.video ? ', video' : ''}`} data-project={project.id}
            style={{ left: `calc(var(--archive-col) * ${tile.x})`, top: `calc(var(--archive-row) * ${tile.y})`, width: `calc(var(--archive-col) * ${tile.w} + 1px)`, height: `calc(var(--archive-row) * ${tile.h} + 1px)` }}
            onFocus={event => {
              if (!event.currentTarget.matches(':focus-visible')) return;
              const r = event.currentTarget.getBoundingClientRect(); move(innerWidth / 2 - r.left - r.width / 2, innerHeight / 2 - r.top - r.height / 2);
              // Keep the actual keyboard-focused copy visible across a wrap.
              const after = event.currentTarget.getBoundingClientRect();
              const matrix = new DOMMatrix(wall.current!.style.transform);
              const x = matrix.m41 - (after.left + after.width / 2 > innerWidth ? movement.current.width : 0);
              const y = matrix.m42 - (after.top + after.height / 2 > innerHeight ? movement.current.height : 0);
              wall.current!.style.transform = `translate3d(${x}px,${y}px,0)`;
            }}
            onClick={event => {
              if (suppressClick.current) { suppressClick.current = false; return; }
              setSelection({ project, bounds: event.currentTarget.getBoundingClientRect(), opener: event.currentTarget });
            }}><img src={project.src} alt="" draggable={false} /></button>;
        })}
      </div>)}
    </div>
    <div className="archive-atmosphere" aria-hidden="true" />
    <header className="archive-heading"><p>KOR8 / Selected studies</p>{embedded ? <h2>Infinite archive</h2> : <h1>Infinite archive</h1>}</header>
    <footer className="archive-controls">
      {embedded ? <><button onClick={() => continueTo('top')}>Back to hero</button>
        <button aria-pressed={exploring} onClick={() => { if (!exploring) scrollToAnchor('universe', true); setExploring(!exploring); }}>{exploring ? 'Finish exploring' : 'Explore wall'}</button>
        <button onClick={() => continueTo('vision')}>Continue story</button></>
        : <a href="/#universe">Back to the story</a>}
      <span>{embedded && !exploring ? 'Scroll to continue · Select to open' : 'Drag or scroll to explore · Select to open'}</span>
    </footer>
    {selection && <ProjectViewer selection={selection} close={() => setSelection(null)} />}
  </section>;
}
