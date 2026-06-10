import { useWpPage } from '@/hooks/useWpPage';
import { getSeoPage } from '@/services/wordpress';

export function useSeo() {
  return useWpPage(getSeoPage);
}
