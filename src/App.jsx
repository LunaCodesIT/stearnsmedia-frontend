import { useLenis } from '@/hooks/useLenis';
import { Navbar } from '@/components/ui/Navbar';
import { JourneyCanvas } from '@/components/three/JourneyCanvas';
import { Hero } from '@/components/sections/Hero';
import { GoogleAds } from '@/components/sections/GoogleAds';
import { SocialMedia } from '@/components/sections/SocialMedia';
import { GraphicDesign } from '@/components/sections/GraphicDesign';
import { WebsiteDesign } from '@/components/sections/WebsiteDesign';
import { Seo } from '@/components/sections/Seo';
import { Analytics } from '@/components/sections/Analytics';
import { About } from '@/components/sections/About';
import { Contact } from '@/components/sections/Contact';
import { Footer } from '@/components/sections/Footer';

export default function App() {
  useLenis();

  return (
    <div className="min-h-screen bg-stearns-dark">
      <Navbar />
      <JourneyCanvas />
      <Hero />
      <GoogleAds />
      <SocialMedia />
      <GraphicDesign />
      <WebsiteDesign />
      <Seo />
      <Analytics />
      <About />
      <Contact />
      <Footer />
    </div>
  );
}
