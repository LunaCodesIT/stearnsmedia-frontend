import { useWpPage } from '@/hooks/useWpPage';
import { getGraphicDesignPage } from '@/services/wordpress';

export function useGraphicDesign() {
  // Two paragraphs only — the copy sits in a centre column between two models
  return useWpPage(getGraphicDesignPage, { paragraphCount: 2 });
}
