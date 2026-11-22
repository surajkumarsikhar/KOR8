'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { FrameAsset } from '@/content/cinematic';
import { cn } from '@/lib/utils';

/**
 * Fills its (relative, sized) parent. Renders the real image when `asset.src`
 * is set, otherwise a tonal, clearly labelled placeholder.
 */
export default function FrameMedia({
  asset,
  sizes,
  className,
}: {
  asset: FrameAsset;
  sizes: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (asset.src && !failed) {
    return (
      <>
      <Image
        src={asset.src}
        alt={asset.placeholder ? `Illustrative stock placeholder: ${asset.alt}` : asset.alt}
        fill
        sizes={sizes}
        className={cn('object-cover', className)}
        style={{ objectPosition: asset.position ?? '50% 50%' }}
        onError={() => setFailed(true)}
      />
      {asset.placeholder && <span className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 font-mono text-[7px] uppercase tracking-widest text-white/80">Stock placeholder · {asset.kind}</span>}
      </>
    );
  }

  const rimLeft = asset.rim !== 'right';

  return (
    <div
      role="img"
      aria-label={`Placeholder: ${asset.alt}`}
      className={cn('absolute inset-0 overflow-hidden', className)}
      style={{ background: asset.tone }}
    >
      {/* Soft key light */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(55% 45% at 50% 35%, rgba(242,240,236,0.09), transparent 70%)' }}
      />

      {asset.layout === 'figure' ? (
        // Lit subject silhouette with a crimson rim
        <div
          className="absolute bottom-0 left-1/2 h-[68%] w-[42%] -translate-x-1/2 rounded-t-[999px]"
          style={{
            background: 'linear-gradient(180deg, #0c0c0c 0%, #050505 70%)',
            boxShadow: `inset ${rimLeft ? '' : '-'}10px 0 22px -12px rgba(224,24,53,0.75)`,
          }}
        />
      ) : (
        // Wide set: horizon and a practical light
        <>
          <div className="absolute inset-x-0 top-[62%] h-px bg-white/10" />
          <div
            className="absolute left-[18%] top-[30%] h-[22%] w-[22%] rounded-full blur-xl"
            style={{ background: 'rgba(224,24,53,0.35)' }}
          />
          <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-black/70 to-transparent" />
        </>
      )}

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(120% 100% at 50% 50%, transparent 55%, rgba(0,0,0,0.65) 100%)' }}
      />

      <span className="absolute bottom-2 left-2 font-mono text-[8px] uppercase tracking-[0.2em] text-white/35">
        Placeholder · {asset.kind}
      </span>
    </div>
  );
}
