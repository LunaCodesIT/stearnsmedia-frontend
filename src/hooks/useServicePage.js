import { useCallback, useMemo } from 'react';
import { useWpPageBlocks } from '@/hooks/useWpPageBlocks';
import { getPage } from '@/services/wordpress';
import { SERVICES } from '@/lib/constants';

// Data for one service detail page, looked up by route slug.
export function useServicePage(slug) {
  const service = useMemo(() => SERVICES.find((s) => s.slug === slug) || null, [slug]);
  const fetchPage = useCallback(() => {
    if (!service) return Promise.reject(new Error(`Unknown service: ${slug}`));
    return getPage(service.wpId);
  }, [service, slug]);
  const page = useWpPageBlocks(fetchPage);
  return { service, ...page };
}
