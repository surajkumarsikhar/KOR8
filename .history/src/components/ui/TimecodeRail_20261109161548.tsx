'use client';

import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';

const MAJORS = 48;
const STEP_PX = 140;

function label(i: number) {
  const s = i * 10;
  return `00:${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

/**
 * Timecode ruler fixed along the bottom of the viewport. Its offset is
 * scrubbed by total page progress, so it moves slower than the content and
 * scroll progress literally reads as timecode.
 */
export default function TimecodeRail() {
  const track = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = track.current;
    if (!el) return;
    gsap.to(el, {
      x: () => -(el.scrollWidth - window.innerWidth),
      ease: 'none',
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });
    return () => ScrollTrigger.refresh();
  });

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 hidden h-9 overflow-hidden opacity-40 mix-blend-difference md:block"
    >
      <div ref={track} className="flex h-full w-max items-end pb-2">
        {Array.from({ length: MAJORS }, (_, i) => (
          <div key={i} className="relative shrink-0" style={{ width: STEP_PX }}>
            <span className="absolute -top-3.5 left-1 font-mono text-[9px] tracking-wider text-white/70">
              {label(i)}
            </span>
            <div className="flex h-2.5 items-end justify-between">
              {Array.from({ length: 10 }, (_, j) => (
                <span key={j} className="w-px bg-white" style={{ height: j === 0 ? 10 : j === 5 ? 6 : 3 }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
