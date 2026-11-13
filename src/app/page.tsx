import Hero from '@/components/sections/Hero';
import Statement from '@/components/sections/Statement';
import Services from '@/components/sections/Services';
import Work from '@/components/sections/Work';
import Process from '@/components/sections/Process';
import Trust from '@/components/sections/Trust';
import Contact from '@/components/sections/Contact';
import Footer from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Statement />
      <Services />
      <Work />
      <Process />
      <Trust />
      <Contact />
      <Footer />
    </>
  );
}
