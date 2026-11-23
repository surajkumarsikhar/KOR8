import CinematicTeaser from '../components/CinematicTeaser';
const organization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://kor8.in/#organization',
  name: 'KOR8',
  url: 'https://kor8.in/',
  logo: 'https://kor8.in/icon-512.png',
  email: 'business@kor8.in',
  description: 'Independent creative production studio working across film, photography, brand campaigns and creative direction.',
};
export default function Page() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, '\\u003c') }} /><CinematicTeaser /></>;
}
