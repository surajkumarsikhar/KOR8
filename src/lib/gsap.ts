'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { Flip } from 'gsap/Flip';
import { useGSAP } from '@gsap/react';

// GSAP (3.13+) ships all plugins free for commercial use.
gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, MotionPathPlugin, Flip, useGSAP);

gsap.defaults({ ease: 'power3.out', duration: 1 });

/** Motion tokens from the plan (§4). */
export const EASE = {
  enter: 'power3.out',
  transition: 'power2.inOut',
  scrub: 'none',
} as const;

export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin, MotionPathPlugin, Flip, useGSAP };
