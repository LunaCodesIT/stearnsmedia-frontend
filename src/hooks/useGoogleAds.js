import { useWpPage } from '@/hooks/useWpPage';
import { getGoogleAdsPage } from '@/services/wordpress';

export function useGoogleAds() {
  return useWpPage(getGoogleAdsPage);
}
