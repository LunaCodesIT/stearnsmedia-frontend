import { useWpPage } from '@/hooks/useWpPage';
import { getGraphicDesignPage } from '@/services/wordpress';

export function useGraphicDesign() {
  return useWpPage(getGraphicDesignPage);
}
