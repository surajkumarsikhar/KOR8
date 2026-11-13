'use client';

import { useEffect, useState } from 'react';

/**
 * Returns `true` when the user has enabled "prefers-reduced-motion: reduce"
 * in their OS / browser settings. Listens for live changes.
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Set initial value
    setPrefersReducedMotion(mql.matches);

    const handleChange = (event: MediaQueryListEvent): void => {
      setPrefersReducedMotion(event.matches);
    };

    mql.addEventListener('change', handleChange);

    return () => {
      mql.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}
