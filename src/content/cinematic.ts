/**
 * Central asset map for the cinematic homepage (scenes 03–08).
 *
 * Every frame without `src` renders a clearly labelled placeholder. To use real
 * work, drop the file in /public/images/film/ and set `src`
 * (e.g. '/images/film/universe-01.jpg'). Nothing in this file names a client,
 * award, partnership or finished project: labels describe disciplines only.
 */

export type FrameKind =
  | 'Film still'
  | 'Cinematic portrait'
  | 'Editorial'
  | 'Behind the scenes'
  | 'Campaign still'
  | 'Commercial';

export type FrameAsset = {
  id: string;
  /** Real asset path under /public. Leave undefined to render a placeholder. */
  src?: string;
  placeholder?: boolean;
  alt: string;
  kind: FrameKind;
  /** CSS aspect-ratio, e.g. '3 / 4'. */
  ratio: string;
  /** Placeholder composition: a lit figure, or a wide set/landscape. */
  layout: 'figure' | 'wide';
  /** Placeholder base tone (CSS background). */
  tone: string;
  /** Which side the crimson rim light comes from on the placeholder. */
  rim?: 'left' | 'right';
  /** object-position for real images inside animated masks. */
  position?: string;
};

export const BRAND = {
  wordmark: '/images/wordmark.svg',
  wordmarkOutline: '/images/wordmark-outline.svg',
};

const T = {
  ember: 'radial-gradient(120% 90% at 30% 25%, #2a070d 0%, #0d0d0d 55%, #050505 100%)',
  ash: 'radial-gradient(120% 90% at 70% 30%, #1d1d1d 0%, #0b0b0b 60%, #050505 100%)',
  wine: 'radial-gradient(110% 80% at 50% 20%, #3a0812 0%, #120306 50%, #050505 100%)',
  steel: 'linear-gradient(160deg, #1a1a1a 0%, #0a0a0a 55%, #170408 100%)',
  dusk: 'radial-gradient(130% 90% at 50% 100%, #3d0710 0%, #110205 45%, #050505 85%)',
};

/** Scene 03 — floating frames inside the editing space. */
export const UNIVERSE_FRAMES: (FrameAsset & { discipline: string })[] = [
  { id: 'universe-01', src: '/images/film/portrait.jpg', placeholder: true, alt: 'Portrait of a woman against a cool blue studio background', kind: 'Cinematic portrait', discipline: 'Direction', ratio: '3 / 4', layout: 'figure', tone: T.ember, rim: 'left' },
  { id: 'universe-02', src: '/images/film/cinema.jpg', placeholder: true, alt: 'Vintage film cameras and reels arranged on a shelf', kind: 'Film still', discipline: 'Cinematography', ratio: '16 / 10', layout: 'wide', tone: T.ash },
  { id: 'universe-03', src: '/images/film/editorial.jpg', placeholder: true, alt: 'Fashion portrait of a woman in sunglasses and a burgundy coat', kind: 'Editorial', discipline: 'Photography', ratio: '4 / 5', layout: 'figure', tone: T.wine, rim: 'right' },
  { id: 'universe-04', alt: 'Behind-the-scenes frame of the crew lighting a subject', kind: 'Behind the scenes', discipline: 'Production', ratio: '1 / 1', layout: 'wide', tone: T.steel },
];

/** Scene 05 — the portrait that travels through the typography. */
export const THROUGH_FRAME: FrameAsset = {
  id: 'through-01', src: '/images/film/portrait.jpg', placeholder: true,
  alt: 'Close studio portrait lit in blue',
  kind: 'Cinematic portrait',
  ratio: '3 / 4',
  layout: 'figure',
  tone: T.wine,
  rim: 'right',
};

/** Scene 06 — central production image and supporting stills. */
export const COLLAB_HERO: FrameAsset = {
  id: 'collab-hero', src: '/images/film/production.jpg', placeholder: true,
  alt: 'Hands holding a clapperboard on a production set',
  kind: 'Behind the scenes',
  ratio: '4 / 5',
  layout: 'figure',
  tone: T.dusk,
  rim: 'left',
};

export const COLLAB_FRAMES: FrameAsset[] = [
  { id: 'collab-01', src: '/images/film/editorial.jpg', placeholder: true, alt: 'Campaign still with crimson practical light', kind: 'Campaign still', ratio: '4 / 5', layout: 'figure', tone: T.ember, rim: 'right' },
  { id: 'collab-02', src: '/images/film/cinema.jpg', placeholder: true, alt: 'Monitor frame from a commercial shoot', kind: 'Commercial', ratio: '16 / 10', layout: 'wide', tone: T.ash },
  { id: 'collab-03', alt: 'Close production detail, camera and light', kind: 'Behind the scenes', ratio: '3 / 4', layout: 'wide', tone: T.steel },
];

/** Scene 07 — bright editorial collage. */
export const COLLAGE: (FrameAsset & { caption: string })[] = [
  { id: 'collage-01', src: '/images/film/portrait.jpg', placeholder: true, alt: 'Editorial portrait, tight crop', kind: 'Editorial', caption: 'Fig. 01 — Portrait', ratio: '3 / 4', layout: 'figure', tone: T.wine, rim: 'left' },
  { id: 'collage-02', src: '/images/film/cinema.jpg', placeholder: true, alt: 'Wide campaign frame', kind: 'Campaign still', caption: 'Fig. 02 — Campaign', ratio: '16 / 9', layout: 'wide', tone: T.ash },
  { id: 'collage-03', src: '/images/film/editorial.jpg', placeholder: true, alt: 'Primary editorial frame, full figure', kind: 'Editorial', caption: 'Fig. 03 — Editorial', ratio: '4 / 5', layout: 'figure', tone: T.ember, rim: 'right' },
  { id: 'collage-04', src: '/images/film/production.jpg', placeholder: true, alt: 'Film still, silhouette in haze', kind: 'Film still', caption: 'Fig. 04 — Film still', ratio: '1 / 1', layout: 'figure', tone: T.dusk, rim: 'left' },
  { id: 'collage-05', alt: 'Commercial product frame', kind: 'Commercial', caption: 'Fig. 05 — Commercial', ratio: '3 / 4', layout: 'wide', tone: T.steel },
];


