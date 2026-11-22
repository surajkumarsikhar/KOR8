import FrameMedia from '@/components/ui/FrameMedia';
import { COLLAB_HERO, COLLAB_FRAMES } from '@/content/cinematic';

export default function CollaborationAndWhiteTransition() {
  return (
    <section data-scene="collaboration" className="film-scene collaboration-scene" aria-labelledby="collaboration-title">
      <div className="scene-meta"><span>06 / COLLABORATION</span><span>MANY PERSPECTIVES. ONE VISION.</span></div>
      <div className="collab-backtype" aria-hidden="true">COLLABORATION</div>
      <figure data-collab-main className="collab-main"><FrameMedia asset={COLLAB_HERO} sizes="(max-width: 767px) 78vw, 48vw" /></figure>
      {COLLAB_FRAMES.slice(0, 2).map((asset, i) => <figure key={asset.id} data-collab-side className={`collab-side collab-side-${i}`}><FrameMedia asset={asset} sizes="25vw" /></figure>)}
      <h2 id="collaboration-title">GREAT STORIES<br />ARE NEVER<br /><span>CREATED ALONE.</span></h2>
      <div className="collab-notes"><span>DIRECTION / PRODUCTION / POST</span><p>From the first conversation to the final cut.<br />A shared ambition. A world of possibilities.</p><a href="/studio#process">Explore our process ↗</a></div>
    </section>
  );
}

