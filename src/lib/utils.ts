/**
 * Clamp a number between a minimum and maximum value.
 */
export function clamp(min: number, value: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values.
 */
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

/**
 * Map a value from one numeric range to another.
 */
export function mapRange(
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
  value: number,
): number {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

/**
 * Format a number of seconds as an SMPTE-style timecode string.
 * Uses 24 fps for the frame count.
 *
 * @example formatTimecode(3661.5) → "01:01:01:12"
 */
export function formatTimecode(seconds: number): string {
  const FPS = 24;
  const totalFrames = Math.floor(seconds * FPS);

  const ff = totalFrames % FPS;
  const totalSeconds = Math.floor(totalFrames / FPS);
  const ss = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const mm = totalMinutes % 60;
  const hh = Math.floor(totalMinutes / 60);

  const pad = (n: number, width = 2): string => String(n).padStart(width, '0');

  return `${pad(hh)}:${pad(mm)}:${pad(ss)}:${pad(ff)}`;
}

/**
 * Merge CSS class names, filtering out falsy values.
 * Lightweight alternative to clsx / classnames.
 *
 * @example cn('btn', isActive && 'btn--active', className)
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
