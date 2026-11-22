import FrameMedia from '@/components/ui/FrameMedia';
import Wordmark from '@/components/ui/Wordmark';
import { COLLAGE } from '@/content/cinematic';
import { site } from '@/content/site';

export default function BeyondAndCreateClosing() {
  return <>
    <section data-scene="beyond" className="film-scene beyond-scene" aria-labelledby="beyond-title">
      <div className="scene-meta"><span>07 / BEYOND THE FRAME</span><span>KOR8 — AN OPEN PERSPECTIVE</span></div>
      {COLLAGE.slice(0, 4).map((asset, i) => <figure key={asset.id} data-collage-frame className={`collage-frame collage-${i}`}><div className="frame-image" style={{ aspectRatio: asset.ratio }}><FrameMedia asset={asset} sizes="(max-width: 767px) 50vw, 28vw" /></div><figcaption>{asset.caption}</figcaption></figure>)}
      <div className="beyond-title"><h2 id="beyond-title">BEYOND<br /><span>THE FRAME.</span></h2><p>EVERY IDEA DESERVES<br />A WORLD OF ITS OWN.</p></div>
      <p className="scene-footnote">NO FIXED FORM. NO FINAL FRONTIER.</p>
    </section>
    <section id="contact" data-scene="closing" className="film-scene closing-scene" aria-labelledby="closing-title">
      <div className="scene-meta"><span>08 / CREATE WITHOUT LIMITS</span><Wordmark /></div>
      <div className="closing-content"><h2 id="closing-title">LET&apos;S MAKE<br />SOMETHING<br /><em>INFINITE.</em></h2>
        <div className="closing-bottom"><p>HAVE AN IDEA WORTH BRINGING TO LIFE?<br />LET&apos;S CREATE SOMETHING THAT LASTS.</p><a className="project-link" href="/studio#contact">START A PROJECT <span>↗</span></a></div>
      </div>
      <div className="closing-footer"><span>© 2026 KOR8 · {site.city}</span><a href={`mailto:${site.email}`}>{site.email}</a><a href={site.instagram} target="_blank" rel="noopener noreferrer">INSTAGRAM ↗</a></div>
    </section>
  </>;
}

