import { cn } from '@/lib/utils';

/**
 * KOR8 wordmark. "KOR" white (Monk), "8" red (Herculanum).
 * TODO: replace with the outlined SVG once the logo artwork is delivered,
 * so Herculanum is never loaded as a web font.
 */
export default function Wordmark({ className }: { className?: string }) {
  return (
    <span role="img" aria-label="KOR8" className={cn('inline-flex items-baseline font-display leading-none tracking-[-0.04em]', className)}>
      <span aria-hidden="true">KOR</span>
      <span aria-hidden="true" className="font-[family-name:var(--font-serif-face)] text-accent">
        8
      </span>
    </span>
  );
}
