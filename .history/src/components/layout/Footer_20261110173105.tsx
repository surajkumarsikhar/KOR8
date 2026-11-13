'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { nav, site } from '@/content/site';
import Wordmark from '@/components/ui/Wordmark';

export default function Footer() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from('[data-rise]', {
        yPercent: 60,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom bottom', scrub: true },
      });
    },
    { scope: root },
  );

  const year = 2026;

  return (
    <footer ref={root} className="relative overflow-hidden border-t border-white/10 px-5 pb-28 pt-24 md:px-10 md:pb-36">
      <div className="mx-auto grid max-w-[1280px] gap-12 md:grid-cols-3">
        <div>
          <p className="label mb-5">[ contact ]</p>
          <a href={`mailto:${site.email}`} className="block text-lg hover:text-accent">{site.email}</a>
          <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="mt-1 block text-white/60 hover:text-white">{site.phone}</a>
        </div>
        <div>
          <p className="label mb-5">[ menu ]</p>
          <ul className="space-y-1">
            {nav.map((l) => (
              <li key={l.href}><a href={l.href} className="text-white/70 hover:text-white">{l.label}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="label mb-5">[ social ]</p>
          <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white">Instagram ↗</a>
        </div>
      </div>

      <div data-rise className="mt-24 select-none text-center text-[27vw] leading-[0.78]" aria-hidden="true">
        <Wordmark />
      </div>

      <div className="mx-auto mt-10 flex max-w-[1280px] flex-col justify-between gap-2 md:flex-row">
        <p className="label">{site.city}</p>
        <p className="label">© {year} KOR8. All rights reserved.</p>
      </div>
    </footer>
  );
}

