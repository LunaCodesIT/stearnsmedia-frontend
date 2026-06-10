import { useWpPage } from '@/hooks/useWpPage';
import { getAnalyticsPage } from '@/services/wordpress';

export function useAnalytics() {
  return useWpPage(getAnalyticsPage);
}
