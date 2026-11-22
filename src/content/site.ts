/**
 * All site copy (Draft 1). Projects and stats move to Sanity later;
 * the shapes below mirror the planned schema.
 */

export const site = {
  name: 'KOR8',
  url: 'https://kor8.in',
  email: 'hello@kor8.in',
  phone: '+91 00000 00000', // TODO: real number
  instagram: 'https://www.instagram.com/kor8.in', // TODO: confirm handle
  city: 'Bhubaneswar, Odisha',
};

export const nav = [
  { label: 'Work', href: '/#universe' },
  { label: 'Services', href: '/studio#services' },
  { label: 'Process', href: '/studio#process' },
  { label: 'Contact', href: '/studio#contact' },
];

export const hero = {
  // The accent word (rendered in italic serif) is wrapped in *asterisks*.
  headline: ["We build brands", "people can't", "*scroll* past."],
  left: 'Creative ads, brand identity, websites and SEO.',
  right: 'A production house in Bhubaneswar.',
};

export const statement =
  "We're a creative agency and production house. We plan, shoot, design and build everything under one roof, so your brand looks and sounds the same everywhere it appears.";

export type ServiceKey = 'brand' | 'ads' | 'web' | 'seo' | 'production';

export const services: { key: ServiceKey; letter: string; title: string; headline: string; line: string }[] = [
  { key: 'brand', letter: 'A.', title: 'Brand', headline: 'Identity with a point of view.', line: 'Strategy, naming, logos and visual systems that make you recognizable at a glance.' },
  { key: 'ads', letter: 'B.', title: 'Ads', headline: 'Ads that earn the pause.', line: 'Concepts, scripts and campaigns planned for the platforms where your audience actually is.' },
  { key: 'web', letter: 'C.', title: 'Web', headline: 'Websites that feel like products.', line: 'Fast, animated, built to convert, and designed to be found.' },
  { key: 'seo', letter: 'D.', title: 'SEO', headline: 'Be the answer.', line: 'Technical SEO, content and tracking that turn search into steady growth.' },
  { key: 'production', letter: 'E.', title: 'Production', headline: 'Shot, edited, finished.', line: 'Films, product shoots and motion graphics, all produced by our own team.' },
];

export type Film = {
  title: string;
  type: string;
  year: string;
  /** Desktop hover-scrub encode (all-intra / every-frame keyframes). */
  scrubSrc?: string;
  /** Standard encode for tap-to-play on touch. */
  loopSrc?: string;
  poster?: string;
};

export const work: { client: string; films: Film[] } = {
  client: '[Client]',
  films: [
    { title: '[Film title 01]', type: 'Brand film', year: '2025' },
    { title: '[Film title 02]', type: 'Product film', year: '2025' },
    { title: '[Film title 03]', type: 'Social ad', year: '2025' },
    { title: '[Film title 04]', type: 'Launch film', year: '2026' },
    { title: '[Film title 05]', type: 'Behind the scenes', year: '2026' },
  ],
};

export const process = [
  { title: 'Discover', line: 'We learn your business, your audience and your goals.' },
  { title: 'Design', line: 'Strategy and concepts become a clear creative direction.' },
  { title: 'Produce', line: 'Our team shoots, designs and builds in-house.' },
  { title: 'Grow', line: 'We launch, measure and keep improving.' },
];

/** Real figures only — placeholders until confirmed with the client. */
export const trust = {
  quote: '[Client quote, if they agree to share one.]',
  attribution: '[Name], [Client]',
  stats: [
    { value: 5, suffix: '', label: 'Films delivered' },
    { value: 1, suffix: '', label: 'Client trusted us' },
    { value: 100, suffix: '%', label: 'Produced in-house' },
  ],
};

export const contact = {
  headline: ["Let's make something", '*worth* watching.'],
  sub: 'Tell us about your project. We reply within one working day.',
  needs: ['Brand', 'Ads', 'Website', 'SEO', 'Production'],
  budgets: ['Under ₹1L', '₹1–3L', '₹3–10L', '₹10L+'],
};

