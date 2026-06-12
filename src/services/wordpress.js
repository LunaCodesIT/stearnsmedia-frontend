// All WordPress REST API calls live here. READ-ONLY — only GET requests are
// ever made against the live site.
import { WP_API_BASE, WP_PAGE_IDS } from '@/lib/constants';

// The WP host rate-limits/tarpits request bursts, so: (1) identical GETs are
// de-duplicated and cached for the session, and (2) at most MAX_CONCURRENT
// requests are in flight at once.
const MAX_CONCURRENT = 3;
const cache = new Map();
let active = 0;
const waiting = [];

async function acquireSlot() {
  if (active >= MAX_CONCURRENT) await new Promise((r) => waiting.push(r));
  active += 1;
}

function releaseSlot() {
  active -= 1;
  waiting.shift()?.();
}

function get(path) {
  if (cache.has(path)) return cache.get(path);
  const request = (async () => {
    await acquireSlot();
    try {
      const res = await fetch(`${WP_API_BASE}${path}`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`WP REST ${res.status} for ${path}`);
      return await res.json();
    } catch (err) {
      cache.delete(path); // a failed fetch may be retried later
      throw err;
    } finally {
      releaseSlot();
    }
  })();
  cache.set(path, request);
  return request;
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
