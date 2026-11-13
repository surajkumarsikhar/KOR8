'use client';

import { useRef, type ReactNode } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { cn } from '@/lib/utils';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  href?: string;
  type?: 'button' | 'submit';
  onClick?: () => void;
  strength?: number;
  cursor?: string;
  disabled?: boolean;
}

/** Button/link that drifts toward the cursor. Inert on touch devices. */
export default function MagneticButton({
  children,
  className,
  href,
  type = 'button',
  onClick,
  strength = 0.3,
  cursor,
  disabled,
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
      const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });

      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      };
      const leave = () => {
        xTo(0);
        yTo(0);
      };
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerleave', leave);
      return () => {
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerleave', leave);
      };
    },
    { dependencies: [strength] },
  );

  const classes = cn(
    'inline-flex items-center justify-center gap-3 rounded-full border border-white/20 px-6 py-3 text-sm tracking-tight transition-colors duration-300 hover:border-accent hover:bg-accent',
    className,
  );

  if (href) {
    return (
      <a ref={ref} href={href} onClick={onClick} className={classes} data-cursor={cursor}>
        {children}
      </a>
    );
  }
  return (
    <button ref={ref} type={type} onClick={onClick} className={classes} data-cursor={cursor} disabled={disabled}>
      {children}
    </button>
  );
}
