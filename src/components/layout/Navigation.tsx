'use client';

import { useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { nav } from '@/content/site';
import { cn } from '@/lib/utils';
import Wordmark from '@/components/ui/Wordmark';
import MagneticButton from '@/components/ui/MagneticButton';

export default function Navigation() {
  const bar = useRef<HTMLElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const [glass, setGlass] = useState(false);
  const [open, setOpen] = useState(false);

  // Hide on scroll down, reveal on scroll up; glass panel after the hero.
  useGSAP(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const y = self.scroll();
        setGlass(y > window.innerHeight * 0.85);
        const hide = self.direction === 1 && y > 120;
        gsap.to(bar.current, { yPercent: hide ? -110 : 0, duration: 0.5, ease: 'power3.out', overwrite: true });
      },
    });
    return () => st.kill();
  });

  // Mobile overlay: staggered line reveals.
  useGSAP(
    () => {
      if (!overlay.current) return;
      const lines = overlay.current.querySelectorAll('[data-menu-line]');
      if (open) {
        gsap.set(overlay.current, { autoAlpha: 1 });
        gsap.fromTo(lines, { yPercent: 110 }, { yPercent: 0, duration: 0.8, stagger: 0.07, ease: 'power3.out' });
      } else {
        gsap.to(overlay.current, { autoAlpha: 0, duration: 0.3 });
      }
    },
    { dependencies: [open] },
  );

  return (
    <>
      <header
        ref={bar}
        className={cn(
          'fixed inset-x-0 top-0 z-[55] transition-[background-color,backdrop-filter,border-color] duration-500',
          glass ? 'border-b border-white/10 bg-black/55 backdrop-blur-xl' : 'border-b border-transparent',
        )}
      >
        <nav aria-label="Primary" className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 md:h-20 md:px-10">
          <a href="#top" className="text-2xl md:text-[28px]" aria-label="KOR8, back to top">
            <Wordmark />
          </a>

          <ul className="hidden items-center gap-10 md:flex">
            {nav.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="group relative text-sm text-white/70 transition-colors hover:text-white">
                  <span className="roll">
                    <span>{l.label}</span>
                    <span aria-hidden="true">{l.label}</span>
                  </span>
                  <span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-accent transition-transform duration-500 ease-out-expo group-hover:origin-left group-hover:scale-x-100" />
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden md:block">
            <MagneticButton href="#contact" cursor="Let's talk">
              <span className="roll">
                <span>Start a project</span>
                <span aria-hidden="true">Start a project</span>
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
            </MagneticButton>
          </div>

          <button
            type="button"
            className="label relative z-10 text-white md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? '[ close ]' : '[ menu ]'}
          </button>
        </nav>
      </header>

      <div
        id="mobile-menu"
        ref={overlay}
        className="invisible fixed inset-0 z-[54] flex flex-col justify-end bg-black px-5 pb-24 opacity-0 md:hidden"
      >
        <ul className="space-y-2">
          {[...nav, { label: 'Start a project', href: '#contact' }].map((l, i) => (
            <li key={l.href + i} className="overflow-hidden">
              <a data-menu-line href={l.href} onClick={() => setOpen(false)} className="headline block text-[15vw]">
                <span className="label mr-3 align-top">{String(i + 1).padStart(2, '0')}</span>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

