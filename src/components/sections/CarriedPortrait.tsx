'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { heroPortraits } from '@/content/heroPortraits';
import { ScrollTrigger } from '@/lib/gsap';

let selected: typeof heroPortraits[number] | undefined;

export default function CarriedPortrait() {
  const [portrait, setPortrait] = useState<typeof selected>();
  useEffect(() => {
    const available = heroPortraits.filter(item => item.src);
    selected ??= available[Math.floor(Math.random() * available.length)];
    setPortrait(selected);
  }, []);
  return <figure data-carried-portrait className="carried-portrait">
    <div data-portrait-parallax className="portrait-parallax"><div className="portrait-crop" style={{ transform: `translateY(${portrait?.offsetY ?? 0}%) scale(${portrait?.scale ?? 1.06})` }}>
      {portrait && <Image src={portrait.src} alt={portrait.alt} fill sizes="(max-width: 767px) 100vw, 48vw" loading="eager" onLoad={() => ScrollTrigger.refresh()} style={{ objectPosition: portrait.position }} />}
    </div></div>
  </figure>;
}
