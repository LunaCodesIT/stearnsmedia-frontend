import { useWpPage } from '@/hooks/useWpPage';
import { getSocialMediaPage } from '@/services/wordpress';

export function useSocialMedia() {
  return useWpPage(getSocialMediaPage);
}
