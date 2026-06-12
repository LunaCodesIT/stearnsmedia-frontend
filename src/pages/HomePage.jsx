import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

export function HomePage() {
  const { hash } = useLocation();
  useDocumentMeta(
    'Stearns Media — Smarter Marketing. Better Results.',
    'Full-service digital growth partner — SEO, Google Ads, Social Media, Web Design & More.'
  );

  // Support /#contact style links arriving from other routes
  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => {
      document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
    }, 350);
    return () => clearTimeout(t);
  }, [hash]);

  return (
    <>
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
    </>
  );
}
