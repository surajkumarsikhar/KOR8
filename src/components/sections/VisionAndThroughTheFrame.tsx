import FrameMedia from '@/components/ui/FrameMedia';
import { THROUGH_FRAME } from '@/content/cinematic';

export default function VisionAndThroughTheFrame() {
  return (
    <section id="vision" data-scene="vision" className="film-scene vision-scene" aria-labelledby="vision-title">
      <div className="scene-meta"><span>04 / THE VISION</span><span>FEELING IS EVERYTHING.</span></div>
      <div className="vision-composition">
        <h2 id="vision-title" data-vision-type>WE DON&apos;T JUST<br />CAPTURE MOMENTS.<br /><span>WE CREATE WHAT<br />THEY MAKE YOU <em>FEEL.</em></span></h2>
        <p data-vision-detail>Light. Timing. Instinct.<br />The things you see. The things that stay.</p>
      </div>
      <figure data-travel-frame className="travel-frame">
        <div className="frame-image"><FrameMedia asset={THROUGH_FRAME} sizes="(max-width: 767px) 70vw, 34vw" /></div>
        <figcaption><span>05 / THROUGH THE FRAME</span><span>A different perspective.</span></figcaption>
      </figure>
    </section>
  );
}

