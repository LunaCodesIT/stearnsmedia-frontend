// ─── WordPress (READ-ONLY — the live site is never modified) ──────────────────
export const WP_API_BASE =
  import.meta.env.VITE_WP_API_BASE || 'https://stearnsmedia.com/wp-json/wp/v2';

// Page IDs noted from https://stearnsmedia.com/wp-json/wp/v2/pages
export const WP_PAGE_IDS = {
  home: 5083,
  googleAds: 4899,
  seo: 5128,
  socialMedia: 5225,
  graphicDesign: 5220,
  websiteDesign: 5160,
  analytics: 5260,
  contact: 5279,
};

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

// ─── Cal.com booking ───────────────────────────────────────────────────────────
// The client must create this event type in their Cal.com account and connect
// their calendar before the embed will accept bookings.
export const CAL_LINK = import.meta.env.VITE_CAL_LINK || 'stearnsmedia/discovery-call';
