'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { gsap, useGSAP } from '@/lib/gsap';
import { getLenis } from './SmoothScroll';
import Wordmark from '@/components/ui/Wordmark';
import { COLLAB_HERO, THROUGH_FRAME, UNIVERSE_FRAMES } from '@/content/cinematic';

const stills = [UNIVERSE_FRAMES[1], UNIVERSE_FRAMES[2], COLLAB_HERO, THROUGH_FRAME, UNIVERSE_FRAMES[1]];

const ITEMS = [
  { label: 'WORK', href: '/#universe' },
  { label: 'SERVICES', href: '/studio#services' },
  { label: 'PROCESS', href: '/studio#process' },
  { label: 'ABOUT', href: '/#vision' },
  { label: 'CONTACT', href: '/#contact' },
];

export default function Navigation() {
  const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const localHref = (href: string) => href.startsWith(pathname + '#') ? href.slice(pathname.length) : href;

  useGSAP(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    timeline.current = gsap.timeline({ paused: true })
      .set(dialog.current, { visibility: 'visible' })
      .fromTo(dialog.current, { clipPath: 'inset(49.8% 0 49.8% 0)' }, { clipPath: 'inset(0% 0 0% 0)', duration: reduce ? 0 : 0.65, ease: 'power3.inOut' })
      .fromTo('[data-menu-screen]', { clipPath: 'inset(48% 0)', scale: 1.08 }, { clipPath: 'inset(0% 0)', scale: 1, duration: reduce ? 0 : 0.85 }, reduce ? 0 : 0.18)
      .fromTo('[data-menu-line]', { yPercent: 110 }, { yPercent: 0, stagger: reduce ? 0 : 0.065, duration: reduce ? 0 : 0.7 }, reduce ? 0 : 0.2)
      .fromTo('[data-menu-light]', { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 0.8 }, 0)
      .fromTo('[data-menu-detail]', { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 0.4 }, reduce ? 0 : 0.65);
    return () => { timeline.current = null; };
  }, { scope: root });

  useEffect(() => {
    const el = dialog.current!;
    el.inert = !open;
    if (!open) {
      if (!timeline.current?.duration()) el.style.visibility = 'hidden';
      timeline.current?.eventCallback('onReverseComplete', () => { el.style.visibility = 'hidden'; }).reverse();
      return;
    }
    el.style.visibility = 'visible';
    timeline.current?.play();
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = 'hidden';
    getLenis()?.stop();
    const main = document.getElementById('main-content');
    if (main) main.inert = true;
    close.current?.focus({ preventScroll: true });
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setOpen(false); }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(el.querySelectorAll<HTMLElement>('a[href], button'));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => {
      document.removeEventListener('keydown', keydown);
      html.style.overflow = previousOverflow;
      if (main) main.inert = false;
      getLenis()?.start();
      toggle.current?.focus({ preventScroll: true });
    };
  }, [open]);

  return <div ref={root}>
    <header className="cinema-nav">
      <a href={pathname === '/' ? '#top' : '/'} aria-label="KOR8, home"><Wordmark /></a>
      <span className="nav-caption">INDEPENDENT CREATIVE PRODUCTION</span>
      <div className="nav-actions"><a href="/studio#contact" className="nav-project">START A PROJECT ↗</a><button ref={toggle} type="button" aria-expanded={open} aria-controls="cinema-menu" onClick={() => setOpen(true)}>MENU <span aria-hidden="true">＋</span></button></div>
    </header>
    <div ref={dialog} id="cinema-menu" role="dialog" aria-modal="true" aria-label="Navigation" aria-hidden={!open} className="cinema-menu">
      <div data-menu-light className="menu-light" />
      <div className="menu-top"><a href="/" onClick={() => setOpen(false)} aria-label="KOR8, home"><Wordmark /></a><button ref={close} type="button" onClick={() => setOpen(false)}>CLOSE <span aria-hidden="true">×</span></button></div>
      <div data-menu-screen className="menu-screen" aria-hidden="true">
        {stills.map((asset, i) => <div key={ITEMS[i].label} className="menu-still" data-active={active === i}
          style={{ backgroundImage: asset.src ? `url(${asset.src})` : asset.tone }} />)}
      </div>
      <nav aria-label="Main navigation"><ul>{ITEMS.map((item, i) => <li key={item.label}>
        <a data-menu-line data-current={active === i} onPointerEnter={() => setActive(i)} onFocus={() => setActive(i)}
          href={localHref(item.href)} onClick={() => { getLenis()?.start(); setOpen(false); }}>
          <span>0{i + 1}</span>{item.label}
        </a>
      </li>)}</ul></nav>
      <div data-menu-detail className="menu-bottom"><p>BHUBANESWAR, INDIA<br />CREATIVITY WITHOUT BOUNDARIES.</p><a href="/studio#contact" onClick={() => setOpen(false)} className="project-link">START A PROJECT ↗</a></div>
    </div>
  </div>;
}
