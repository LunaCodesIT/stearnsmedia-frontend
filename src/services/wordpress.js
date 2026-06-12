// All WordPress REST API calls live here. READ-ONLY — only GET requests are
// ever made against the live site.
import { WP_API_BASE, WP_PAGE_IDS } from '@/lib/constants';

async function get(path) {
  const res = await fetch(`${WP_API_BASE}${path}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`WP REST ${res.status} for ${path}`);
  return res.json();
}

// Fetch a single page by ID (title + rendered content + excerpt).
export function getPage(id) {
  return get(`/pages/${id}?_fields=id,slug,title,content,excerpt`);
}

export const getServicesOverviewPage = () => getPage(WP_PAGE_IDS.services);
export const getGoogleAdsPage = () => getPage(WP_PAGE_IDS.googleAds);
export const getSeoPage = () => getPage(WP_PAGE_IDS.seo);
export const getSocialMediaPage = () => getPage(WP_PAGE_IDS.socialMedia);
export const getGraphicDesignPage = () => getPage(WP_PAGE_IDS.graphicDesign);
export const getWebsiteDesignPage = () => getPage(WP_PAGE_IDS.websiteDesign);
export const getAnalyticsPage = () => getPage(WP_PAGE_IDS.analytics);
