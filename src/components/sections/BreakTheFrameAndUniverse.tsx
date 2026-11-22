import FrameMedia from '@/components/ui/FrameMedia';
import { UNIVERSE_FRAMES } from '@/content/cinematic';
import Link from 'next/link';

export default function BreakTheFrameAndUniverse() {
  return (
    <section id="universe" data-scene="universe" className="film-scene universe-scene" aria-labelledby="universe-title">
      <div aria-hidden="true" className="universe-backdrop" /><div className="scene-meta"><span>03 / OUR UNIVERSE</span><span>EXPLORATIONS IN IMAGE & EMOTION</span></div>
      <h2 id="universe-title" className="universe-type">UNIVERSE</h2>
      <div data-portrait-destination className="portrait-destination" aria-hidden="true" /><div className="universe-frames">
        {UNIVERSE_FRAMES.slice(1, 3).map((asset, i) => (
          <figure key={asset.id} data-universe-frame className={`universe-frame frame-${i + 1}`}>
            <span className="frame-number" aria-hidden="true">0{i + 1}</span>
            <div className="frame-image" style={{ aspectRatio: asset.ratio }}><FrameMedia asset={asset} sizes="(max-width: 767px) 55vw, 30vw" /></div>
            <figcaption><span>{asset.discipline}</span><span>STUDY / 0{i + 1}</span></figcaption>
          </figure>
        ))}
      </div>
      <p className="scene-footnote">A visual moodboard. Placeholder imagery, not commissioned work. <Link className="archive-entry pointer-events-auto mt-3 block w-fit underline underline-offset-4" href="/archive">Explore the infinite archive</Link></p>
    </section>
  );
}



