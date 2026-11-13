'use client';

/**
 * Tiny intro signal: the preloader calls `markReady()` when its wipe starts;
 * sections call `onReady(cb)` to start their entrance animations.
 */
const EVENT = 'kor8:ready';

export function markReady() {
  document.documentElement.dataset.ready = 'true';
  window.dispatchEvent(new Event(EVENT));
}

export function onReady(cb: () => void): () => void {
  if (document.documentElement.dataset.ready === 'true') {
    cb();
    return () => {};
  }
  window.addEventListener(EVENT, cb, { once: true });
  return () => window.removeEventListener(EVENT, cb);
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Low-end heuristic for dropping blur / WebGL. */
export function isLowEnd() {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) || (navigator.hardwareConcurrency ?? 8) <= 4;
}

