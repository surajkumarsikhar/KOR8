export interface CinematicProject {
  id: string;
  number: string;
  title: string;
  category: string;
  year: string;
  discipline: string;
  aspect: string;
  accentQuote?: string;
  palette: [string, string];
  lensDetails: string;
}

export const CINEMATIC_PROJECTS: CinematicProject[] = [
  {
    id: 'chronicles-of-light',
    number: '01',
    title: 'CHRONICLES OF LIGHT',
    category: 'Brand Film & Identity',
    year: '2026',
    discipline: 'Direction / Anamorphic Cinematography',
    aspect: 'aspect-[3/4]',
    accentQuote: 'Sculpted in shadows, defined by brilliance.',
    palette: ['#1c0407', '#080808'],
    lensDetails: '35mm Panavision T1.4 · 2.39:1',
  },
  {
    id: 'synthetic-horizons',
    number: '02',
    title: 'SYNTHETIC HORIZONS',
    category: 'Digital Experience & CGI',
    year: '2025',
    discipline: 'Spatial Design / Motion System',
    aspect: 'aspect-[16/10]',
    accentQuote: 'Where code collapses into visceral emotion.',
    palette: ['#0d0d0d', '#20050a'],
    lensDetails: 'Virtual Rig · Raymarched Photons',
  },
  {
    id: 'monolith-movement',
    number: '03',
    title: 'MONOLITH & MOTION',
    category: 'Editorial Campaign',
    year: '2026',
    discipline: 'Creative Direction / Haute Couture Still',
    aspect: 'aspect-[4/5]',
    accentQuote: 'The human silhouette against brutalist silence.',
    palette: ['#161616', '#090909'],
    lensDetails: 'Medium Format 80mm · Natural Falloff',
  },
  {
    id: 'infinite-pulse',
    number: '04',
    title: 'INFINITE PULSE',
    category: 'Sound Architecture & Film',
    year: '2026',
    discipline: 'Documentary Short / Sound Sculpture',
    aspect: 'aspect-[1/1]',
    accentQuote: 'Frequencies that linger in memory.',
    palette: ['#28040c', '#080808'],
    lensDetails: 'Custom Optics · Micro-prism Flare',
  },
];

export const COLLABORATION_DISCIPLINES = [
  {
    code: 'DIR_01',
    title: 'DIRECTING & CINEMATOGRAPHY',
    desc: 'Narrative commercials, high-fashion films, and brand manifestos captured with optical rigor.',
  },
  {
    code: 'DES_02',
    title: 'SPATIAL & INTERACTIVE DESIGN',
    desc: 'Fluid scroll environments, WebGL experiences, and brand platforms engineered to feel alive.',
  },
  {
    code: 'ART_03',
    title: 'CREATIVE DIRECTION & EDITORIAL',
    desc: 'End-to-end visual strategy, bespoke typography, and unforgettable still campaigns.',
  },
  {
    code: 'AUD_04',
    title: 'SOUND ARCHITECTURE & FINISHING',
    desc: 'Sonic branding, spatial soundscapes, color grading, and archival analog mastering.',
  },
];

export const EDITORIAL_COLLAGE_ITEMS = [
  {
    id: 'ed-1',
    aspect: 'aspect-[3/4]',
    title: 'PARADIGM SHIFT',
    meta: 'FIG. 08 / FRAME RESONANCE',
    caption: 'Dynamic tension between void and mass.',
    gradient: 'radial-gradient(ellipse at 40% 30%, #3b060d, #0d0d0d 75%)',
  },
  {
    id: 'ed-2',
    aspect: 'aspect-[16/9]',
    title: 'ATMOSPHERE & SHADOW',
    meta: 'PLATE 02 / HIGH VOLTAGE',
    caption: 'High-contrast studio illumination under controlled haze.',
    gradient: 'linear-gradient(135deg, #1c1c1c 0%, #0a0a0a 60%, #4a0812 100%)',
  },
  {
    id: 'ed-3',
    aspect: 'aspect-[4/5]',
    title: 'THE SACRED VOID',
    meta: 'PLATE 05 / NEGATIVE FIELD',
    caption: 'Editorial minimalism stripped of ornament.',
    gradient: 'radial-gradient(circle at 65% 50%, #200408 0%, #080808 80%)',
  },
  {
    id: 'ed-4',
    aspect: 'aspect-[1/1]',
    title: 'KINETIC CHOREOGRAPHY',
    meta: 'FIG. 11 / TEMPORAL TRACE',
    caption: 'Continuous camera motion preserving human grace.',
    gradient: 'linear-gradient(190deg, #181818 0%, #0a0a0a 100%)',
  },
  {
    id: 'ed-5',
    aspect: 'aspect-[3/4]',
    title: 'OPTICAL DISTORTION',
    meta: 'PLATE 07 / PRISM ANOMALY',
    caption: 'Anamorphic streaks and controlled edge aberrations.',
    gradient: 'radial-gradient(ellipse at 50% 60%, #600814 0%, #120306 45%, #050505 85%)',
  },
];
