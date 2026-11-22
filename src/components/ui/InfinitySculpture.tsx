export const INFINITY_PATH =
  'M600 300 C600 300 480 80 300 80 C120 80 60 220 60 300 C60 380 120 520 300 520 C480 520 600 300 600 300 ' +
  'C600 300 720 80 900 80 C1080 80 1140 220 1140 300 C1140 380 1080 520 900 520 C720 520 600 300 600 300 Z';

export default function InfinitySculpture() {
  return <div data-infinity-sculpture className="infinity-sculpture" aria-hidden="true">
    <div className="infinity-parallax"><svg viewBox="0 0 1200 600" fill="none">
      <defs><linearGradient id="sculpture-crimson" x1="60" y1="80" x2="1140" y2="520" gradientUnits="userSpaceOnUse">
        <stop stopColor="#28040C" /><stop offset=".35" stopColor="#B50916" /><stop offset=".65" stopColor="#E01835" /><stop offset="1" stopColor="#28040C" />
      </linearGradient></defs>
      <path data-infinity-stroke d={INFINITY_PATH} stroke="url(#sculpture-crimson)" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
      <path data-infinity-stroke d={INFINITY_PATH} stroke="#ef6875" strokeOpacity=".25" strokeWidth="1" />
    </svg></div>
  </div>;
}
