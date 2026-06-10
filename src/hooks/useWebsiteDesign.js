import { useWpPage } from '@/hooks/useWpPage';
import { getWebsiteDesignPage } from '@/services/wordpress';

export function useWebsiteDesign() {
  return useWpPage(getWebsiteDesignPage);
}
