import { useLenis } from '@/hooks/useLenis';
import { Navbar } from '@/components/ui/Navbar';
import { JourneyCanvas } from '@/components/three/JourneyCanvas';
import { Hero } from '@/components/sections/Hero';

export default function App() {
  useLenis();

  return (
    <div className="min-h-screen bg-stearns-light">
      <Navbar />
      <JourneyCanvas />
      <Hero />
    </div>
  );
}
