import glyphs from '@/content/glyphs.json';

export type MorphWord = keyof typeof glyphs;

/** Static React-owned contours. The parent GSAP context interpolates d attributes. */
export default function MorphType({ word, className = '' }: { word: MorphWord; className?: string }) {
  return <svg className={className} viewBox="0 0 9500 1700" role="img" aria-label={word}>
    {glyphs[word].map((d, i) => <path key={i} d={d} data-glyph={i} />)}
  </svg>;
}
