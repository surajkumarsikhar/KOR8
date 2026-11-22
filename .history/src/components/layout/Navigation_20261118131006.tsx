'use client';

import { useRef, useState, useEffect } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import Wordmark from '@/components/ui/Wordmark';
import MagneticButton from '@/components/ui/MagneticButton';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'WORK', href: '#universe', num: '01' },
  { label: 'SERVICES', href: '#services', num: '02' },
  { label: 'PROCESS', href: '#process', num: '03' },
  { label: 'ABOUT', href: '#vision', num: '04' },
  { label: 'CONTACT', href: '#contact', num: '05' },
];

export default function Navigation() {
  const bar = useRef<HTMLElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [glass, setGlass] = useState(false);
  const [open, setOpen] = useState(false);

  // Hide on scroll down, reveal on scroll up; glass panel after hero
  useGSAP(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const y = self.scroll();
        setGlass(y > window.innerHeight * 0.85);
        const hide = self.direction === 1 && y > 150 && !open;
        gsap.to(bar.current, {
          yPercent: hide ? -110 : 0,
          duration: 0.5,
          ease: 'power3.out',
          overwrite: true,
        });
      },
    });
    return () => st.kill();
  });

  // Immersive Fullscreen Navigation Overlay Choreography
  useGSAP(
    () => {
      const el = overlay.current;
      const glow = glowRef.current;
      if (!el) return;

      const lines = el.querySelectorAll('[data-nav-line]');
      const details = el.querySelectorAll('[data-nav-detail]');

      if (open) {
        document.body.style.overflow = 'hidden';

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        // 1. Fullscreen dark surface reveals through clip-path mask
        tl.set(el, { autoAlpha: 1 })
          .fromTo(
            el,
            { clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)' },
            { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', duration: 0.8, ease: 'power4.inOut' }
          )
          // 2. Atmospheric crimson lighting fades into view
          .fromTo(
            glow,
            { opacity: 0, scale: 0.8 },
            { opacity: 0.7, scale: 1.2, duration: 1.2 },
            '-=0.4'
          )
          // 3. Large navigation links appear through staggered vertical masks
          .fromTo(
            lines,
            { yPercent: 120, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.08 },
            '-=0.7'
          )
          // 4. Supporting editorial metadata enters
          .fromTo(
            details,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, stagger: 0.1, duration: 0.7 },
            '-=0.5'
          );
      } else {
        document.body.style.overflow = '';
        gsap.to(el, {
          clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
          duration: 0.6,
          ease: 'power3.inOut',
          onComplete: () => {
            gsap.set(el, { autoAlpha: 0 });
          },
        });
      }
    },
    { dependencies: [open] }
  );

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <>
      <header
        ref={bar}
        className={cn(
          'fixed inset-x-0 top-0 z-[60] transition-[background-color,backdrop-filter,border-color] duration-500',
          glass
            ? 'border-b border-white/10 bg-black/60 backdrop-blur-xl'
            : 'border-b border-transparent'
        )}
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex h-16 max-w-[1700px] items-center justify-between px-6 md:h-20 md:px-12"
        >
          {/* KOR8 Brand Wordmark */}
          <a
            href="#top"
            className="text-2xl md:text-[28px] focus-visible:outline-none"
            aria-label="KOR8, return to top"
            onClick={() => setOpen(false)}
          >
            <Wordmark />
          </a>

          {/* Desktop Direct Nav */}
          <ul className="hidden items-center gap-10 lg:flex">
            {NAV_ITEMS.slice(0, 4).map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="group relative font-mono text-xs uppercase tracking-[0.2em] text-white/70 transition-colors hover:text-white"
                >
                  <span className="roll">
                    <span>{l.label}</span>
                    <span aria-hidden="true" className="text-[#E01835]">
                      {l.label}
                    </span>
                  </span>
                  <span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-[#E01835] transition-transform duration-500 ease-out-expo group-hover:origin-left group-hover:scale-x-100" />
                </a>
              </li>
            ))}
          </ul>

          {/* Header Action Trigger & Fullscreen Menu Toggle */}
          <div className="flex items-center gap-6">
            <div className="hidden sm:block">
              <MagneticButton href="#contact" cursor="Let's talk">
                <span className="roll font-mono text-xs uppercase tracking-wider">
                  <span>Start a project</span>
                  <span aria-hidden="true" className="text-[#E01835]">
                    Start a project
                  </span>
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#E01835]" aria-hidden="true" />
              </MagneticButton>
            </div>

            {/* Menu Toggle Button */}
            <button
              type="button"
              className="group relative z-[70] flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-white focus-visible:outline-none"
              aria-expanded={open}
              aria-controls="fullscreen-cinematic-menu"
              onClick={() => setOpen((o) => !o)}
            >
              <span className="text-[#E01835] group-hover:scale-125 transition-transform">
                {open ? '✕' : '☰'}
              </span>
              <span>{open ? 'CLOSE' : 'MENU'}</span>
            </button>
          </div>
        </nav>
      </header>

      {/* ─── IMMERSIVE FULLSCREEN NAVIGATION OVERLAY ─── */}
      <div
        id="fullscreen-cinematic-menu"
        ref={overlay}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
        className="invisible fixed inset-0 z-[65] flex flex-col justify-between overflow-hidden bg-[#050505] p-6 md:p-14 text-[#F2F0EC] opacity-0"
        style={{
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
        }}
      >
        {/* Atmospheric Crimson Glow in Menu */}
        <div
          ref={glowRef}
          aria-hidden="true"
          className="pointer-events-none absolute -left-[10%] top-[20%] h-[75vh] w-[75vh] rounded-full blur-[170px] opacity-0"
          style={{
            background: 'radial-gradient(circle, #E01835 0%, #B50916 40%, transparent 80%)',
          }}
        />

        {/* Top Bar inside Overlay */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <span className="font-display text-2xl font-bold tracking-tight text-white">
              KOR∞
            </span>
            <span className="text-white/20">|</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#E01835]">
              INFINITE NAVIGATION
            </span>
          </div>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
            PRESS ESC TO RETURN
          </span>
        </div>

        {/* Center: Oversized Navigation Links */}
        <div className="relative z-10 my-auto flex flex-col justify-center max-w-[1400px]">
          <nav aria-label="Fullscreen Navigation Links">
            <ul className="space-y-1 md:space-y-3">
              {NAV_ITEMS.map((item) => (
                <li key={item.href} className="overflow-hidden">
                  <a
                    data-nav-line
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="group inline-flex items-baseline gap-4 md:gap-8 font-display text-[clamp(2.8rem,8.5vw,7.8rem)] font-black uppercase tracking-[-0.04em] leading-[0.95] text-white transition-colors hover:text-[#E01835]"
                  >
                    <span className="font-mono text-xs md:text-sm tracking-widest text-[#E01835] group-hover:translate-x-2 transition-transform">
                      {item.num}
                    </span>
                    <span className="relative">
                      {item.label}
                      <span className="absolute bottom-1 left-0 h-1 w-0 bg-[#E01835] transition-all duration-500 group-hover:w-full" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom Editorial Metadata & Prominent CTA */}
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-t border-white/10 pt-6">
          <div data-nav-detail className="space-y-1">
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
              KOR8 CREATIVE PRODUCTION HOUSE
            </p>
            <p className="font-mono text-xs text-[#898486]">
              Bhubaneswar, Odisha · Global Commissioning
            </p>
          </div>

          <div data-nav-detail>
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-3 rounded-xs border border-white/20 bg-white/5 px-6 py-3 font-mono text-xs uppercase tracking-widest text-white transition-all hover:border-[#E01835] hover:bg-[#E01835]/20"
            >
              <span>START A PROJECT</span>
              <span className="text-[#E01835]">↗</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
