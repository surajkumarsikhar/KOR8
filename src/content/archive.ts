import { UNIVERSE_FRAMES, COLLAB_HERO } from './cinematic';
export type ArchiveProject = { id: string; title: string; src: string; alt: string; video?: string; note: string };
export const archiveProjects: ArchiveProject[] = [
  ...[...UNIVERSE_FRAMES.filter(frame => frame.src), COLLAB_HERO].map(frame => ({
    id: frame.id, title: frame.kind, src: frame.src!, alt: frame.alt, note: 'Photographic study · Stock placeholder',
  })),
  { id: 'model-film', title: 'Motion study', src: '/images/film/portrait.jpg', alt: 'Portrait poster for the model motion study', video: '/videos/kor8-model.mp4', note: 'Motion study · Preview asset' },
];
// Exact partition of a 6 × 4 rectangle: no holes, including repeat boundaries.
export const archiveTiles = [
  { x: 0, y: 0, w: 2, h: 2, project: 0 },
  { x: 2, y: 0, w: 2, h: 1, project: 1 },
  { x: 4, y: 0, w: 2, h: 2, project: 2 },
  { x: 2, y: 1, w: 1, h: 2, project: 3 },
  { x: 3, y: 1, w: 1, h: 1, project: 4 },
  { x: 0, y: 2, w: 2, h: 2, project: 2 },
  { x: 3, y: 2, w: 3, h: 2, project: 1 },
  { x: 2, y: 3, w: 1, h: 1, project: 0 },
];
