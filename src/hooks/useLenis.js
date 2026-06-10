import { useEffect } from 'react';
import { initLenis, destroyLenis } from '@/lib/lenis';

export function useLenis() {
  useEffect(() => {
    initLenis();
    return () => destroyLenis();
  }, []);
}
