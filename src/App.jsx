import { useLenis } from '@/hooks/useLenis';
import { Navbar } from '@/components/ui/Navbar';
import { JourneyCanvas } from '@/components/three/JourneyCanvas';
import { Hero } from '@/components/sections/Hero';
import { GoogleAds } from '@/components/sections/GoogleAds';
import { SocialMedia } from '@/components/sections/SocialMedia';

export default function App() {
  useLenis();

  return (
    <div className="min-h-screen bg-stearns-light">
      <Navbar />
      <JourneyCanvas />
      <Hero />
      <GoogleAds />
      <SocialMedia />
    </div>
  );
}
