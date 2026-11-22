import Hero from '@/components/sections/Hero';
import BreakTheFrameAndUniverse from '@/components/sections/BreakTheFrameAndUniverse';
import VisionAndThroughTheFrame from '@/components/sections/VisionAndThroughTheFrame';
import CollaborationAndWhiteTransition from '@/components/sections/CollaborationAndWhiteTransition';
import BeyondAndCreateClosing from '@/components/sections/BeyondAndCreateClosing';
import Services from '@/components/sections/Services';
import Process from '@/components/sections/Process';
import Contact from '@/components/sections/Contact';
import Footer from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <>
      {/* SCENE 01: INFINITE (Monumental Editorial Hero & Atmospheric Lighting) */}
      <Hero />

      {/* SCENE 02 & 03: BREAK THE FRAME (Diagonal Wipe) → OUR UNIVERSE (Floating Work Gallery) */}
      <BreakTheFrameAndUniverse />

      {/* SCENE 04 & 05: THE VISION (Cinematic Pullback) → THROUGH THE FRAME (Traveling Card) */}
      <VisionAndThroughTheFrame />

      {/* SCENE 06: COLLABORATION → SIGNATURE TRANSITION D (Dark-to-Light Wipe) */}
      <CollaborationAndWhiteTransition />

      {/* SCENE 07 & 08: BEYOND THE FRAME (Editorial Collage) → CREATE WITHOUT LIMITS (Finale) */}
      <BeyondAndCreateClosing />

      {/* Deep-Dive Production Services & Technical Rig */}
      <Services />

      {/* Production Methodology & Craft */}
      <Process />

      {/* Direct Collaboration Terminal */}
      <Contact />

      {/* Archival Cinematic Footer */}
      <Footer />
    </>
  );
}
