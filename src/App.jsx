import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useLenis } from '@/hooks/useLenis';
import { usePreloadModels } from '@/hooks/usePreloadModels';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/sections/Footer';
import { HomePage } from '@/pages/HomePage';
import { ServicePage } from '@/pages/ServicePage';
import { PackagesPage } from '@/pages/PackagesPage';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  useLenis();
  usePreloadModels();

  return (
    <div className="min-h-screen bg-stearns-dark">
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/packages" element={<PackagesPage />} />
        <Route path="/services/:slug" element={<ServicePage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      <Footer />
    </div>
  );
}
