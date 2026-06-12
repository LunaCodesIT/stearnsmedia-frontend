// ─── WordPress (READ-ONLY — the live site is never modified) ──────────────────
// Requests go through a same-origin proxy (/wp-api → stearnsmedia.com/wp-json)
// because the live site sends no CORS headers: Vite's dev proxy locally, a
// vercel.json rewrite in production.
export const WP_API_BASE = import.meta.env.VITE_WP_API_BASE || '/wp-api/wp/v2';

// Page IDs noted from https://stearnsmedia.com/wp-json/wp/v2/pages
export const WP_PAGE_IDS = {
  home: 5083,
  services: 5098,
  googleAds: 4899,
  seo: 5128,
  socialMedia: 5225,
  graphicDesign: 5220,
  websiteDesign: 5160,
  analytics: 5260,
  contact: 5279,
};

// ─── Service registry ──────────────────────────────────────────────────────────
// Drives the per-service routes (/services/:slug), the Packages page, and the
// service-page 3D models. `model` mirrors each homepage section's setup;
// 'cluster' and 'design-duo' are special compositions.
// Website Design's pricing and detail content live on its two WP child pages
export const WEBSITE_DESIGN_CHILD_IDS = [5155, 5201]; // Business Websites, eCommerce Website

// `tagline` mirrors the one-liners on the WP Services overview page — used as
// a fallback when a service's own page can't be fetched.
export const SERVICES = [
  {
    slug: 'google-ads',
    name: 'Google Ads',
    wpId: 4899,
    tagline: 'High-intent advertising across Search, Display, YouTube and Shopping to drive leads and sales.',
    model: { src: '/models/Google_Ads.glb' },
  },
  {
    slug: 'social-media',
    name: 'Social Media',
    wpId: 5225,
    tagline: 'Strategic content and paid campaigns that grow your brand and generate leads.',
    model: 'cluster',
  },
  {
    slug: 'graphic-design',
    name: 'Graphic Design',
    wpId: 5220,
    tagline: 'Professional visuals and branding that elevate your business and make a lasting impression.',
    model: 'design-duo',
  },
  {
    slug: 'website-design',
    name: 'Website Design & Development',
    wpId: 5160,
    tagline: 'Conversion-focused websites designed to turn visitors into customers.',
    model: { src: '/models/Globe_Digital.fbx', fit: 1.5 },
  },
  {
    slug: 'seo',
    name: 'SEO',
    wpId: 5128,
    tagline: 'Improve your rankings, increase organic traffic, and generate long-term growth.',
    model: { src: '/models/SEO.glb', fit: 1.7, rotation: [0.08, -0.4, 0] },
  },
  {
    slug: 'analytics-conversion-tracking',
    name: 'Analytics & Conversion Tracking',
    wpId: 5260,
    tagline: 'Track performance and optimise for maximum ROI.',
    model: { src: '/models/Google_Analytics.glb', rotation: [0.1, 0.3, 0] },
  },
];

// ─── Brand ─────────────────────────────────────────────────────────────────────
export const LOGO_URL =
  'https://stearnsmedia.com/wp-content/uploads/2026/04/Untitled-design-6.png';
export const PHONE_DISPLAY = '078 137 7784';
export const PHONE_TEL = 'tel:0781377784';

// ─── Contact form delivery ─────────────────────────────────────────────────────
// FormSubmit (https://formsubmit.co) — POSTs are emailed to this address.
// NOTE: the first submission triggers an activation email to the target inbox;
// the client must click that link once before deliveries start.
export const FORMSUBMIT_TARGET =
  import.meta.env.VITE_FORMSUBMIT_TARGET || 'info@stearnsmedia.com';

// HubSpot CRM Forms Submission API (optional — skipped when not configured).
export const HUBSPOT_PORTAL_ID = import.meta.env.VITE_HUBSPOT_PORTAL_ID || '';
export const HUBSPOT_FORM_GUID = import.meta.env.VITE_HUBSPOT_FORM_GUID || '';

// ─── Cal.com booking (optional) ────────────────────────────────────────────────
// Empty by default: the Contact section renders the custom BookingWidget
// (SAST slots converted to the visitor's timezone). Once the client creates an
// event type in their Cal.com account and connects their calendar, set
// VITE_CAL_LINK (e.g. "stearnsmedia/discovery-call") to swap in the Cal embed.
export const CAL_LINK = import.meta.env.VITE_CAL_LINK || '';
