# Stearns Media — Frontend

Single-page marketing site for [stearnsmedia.com](https://stearnsmedia.com), built with React 18 + Vite, React Three Fiber, GSAP ScrollTrigger, Lenis smooth scroll, Zustand, and Tailwind CSS v4. Content is pulled read-only from the existing WordPress site's REST API; the WordPress site itself is never modified.

The signature interaction: a 3D globe (`Globe_Digital.fbx`) rests in the hero, then travels down the page in a scroll-scrubbed spiral and lands inside the Website Design section, where it scrolls away with the content.

## Local setup

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve the production build locally
```

No `.env` is required for local development — every variable has a working default (see below).

## Environment variables

Copy `.env.example` to `.env` and adjust as needed:

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_WP_API_BASE` | `/wp-api/wp/v2` | WP REST base. Goes through a same-origin proxy because the live site sends no CORS headers. |
| `VITE_FORMSUBMIT_TARGET` | `info@stearnsmedia.com` | Email address FormSubmit delivers contact-form messages to. |
| `VITE_HUBSPOT_PORTAL_ID` | _(empty)_ | Optional HubSpot CRM lead capture. Skipped when empty. |
| `VITE_HUBSPOT_FORM_GUID` | _(empty)_ | HubSpot form GUID, paired with the portal ID. |
| `VITE_CAL_LINK` | _(empty)_ | Optional Cal.com event link. Empty = built-in booking widget. |

### Booking: built-in widget vs Cal.com

By default the Contact section renders a **built-in booking widget**: it shows 30-minute discovery-call slots from SAST (Africa/Johannesburg) business hours (09:00–17:00, Mon–Fri), **converted to the visitor's auto-detected timezone** (changeable via a dropdown; slots that land on a different calendar day for the visitor are flagged "+1 day"). Requests are emailed via FormSubmit and pushed to HubSpot when configured. Business hours live in `src/hooks/useBookingForm.js`.

To switch to Cal.com instead: the client creates an event type in their Cal.com account (e.g. **discovery-call**), connects their calendar, and sets `VITE_CAL_LINK=stearnsmedia/discovery-call` in the Vercel project's environment variables — the embed (with Cal's own native timezone handling and live availability) replaces the widget on the next deploy, no code change needed.

### Contact form delivery (FormSubmit + HubSpot)

The live WordPress site does **not** run Contact Form 7 (its form is WPForms Lite, which has no public submission API), so the form posts to [FormSubmit](https://formsubmit.co) instead:

1. Delivery address is `VITE_FORMSUBMIT_TARGET`.
2. **The first submission triggers an activation email to that inbox — the client must click the link once.** Until then, submissions are not delivered.
3. If HubSpot env vars are set, each lead is also pushed to HubSpot CRM via the public Forms Submission API (best effort — a HubSpot failure never fails the user's submission).

### WordPress proxy

The WP REST API at stearnsmedia.com sends no `Access-Control-Allow-Origin` header and intermittently 404s the pretty `/wp-json/` route, so all requests go to `/wp-api/...` on this site's own origin and are rewritten server-side to `https://stearnsmedia.com/index.php?rest_route=/...`:

- **dev**: `server.proxy` in `vite.config.js`
- **production**: the first rewrite in `vercel.json`

Page IDs used by each section live in `src/lib/constants.js` (`WP_PAGE_IDS`).

## Deployment (Vercel)

Standard Vite static deployment — `vercel` CLI or Git integration, no special build settings. `vercel.json` provides:

1. the `/wp-api/*` → WordPress REST rewrite (required for content to load), and
2. an SPA fallback rewrite to `index.html`.

Set the environment variables from `.env.example` in the Vercel dashboard for anything that differs from the defaults.

## Architecture

Strict separation of concerns — each layer is independently replaceable, and no section's files are touched by changes to another section:

```
src/
├── components/        # JSX, props, and UI logic ONLY — no API calls, no business logic
│   ├── sections/      # One subfolder per page section (Hero, GoogleAds, …, Footer)
│   ├── ui/            # Reusable primitives (Navbar, MaskLine, ServiceSection, StatCounter)
│   └── three/         # R3F canvases (JourneyCanvas overlay, SectionModel inline viewer)
├── hooks/             # ALL data fetching, state, and business logic
│   ├── use<Section>.js        # each section's WP data (wraps useWpPage)
│   ├── useWpPage.js           # shared fetch + Elementor-HTML-to-clean-copy transform
│   ├── useGlobeJourney.js     # scroll journey measurement + ScrollTrigger wiring
│   ├── useContactForm.js      # form state, validation, submission lifecycle
│   ├── useCounterAnimation.js # animated stat counters
│   └── useLenis.js            # smooth-scroll bootstrap
├── services/          # ALL network calls, as plain async functions
│   ├── wordpress.js           # WP REST GETs (read-only)
│   └── contactFormService.js  # FormSubmit + HubSpot POSTs
├── stores/            # Global Zustand state
│   └── scrollStore.js         # journey progress + anchors, consumed by the canvas
├── lib/               # GSAP/Lenis setup, constants, three.js utilities
└── assets/            # Static assets
```

Rules of thumb for future work:

- A component never calls `fetch` or imports from `services/` — it gets data from a hook.
- A hook never renders anything — it returns clean values.
- A service never knows about React — plain async functions.
- Per-frame scroll state flows through `scrollStore`; the R3F canvas reads it transiently (`useScrollStore.getState()` inside `useFrame`) so nothing re-renders per frame.

## 3D models

Models live in `public/models/`. `.glb` is preferred where both formats existed (`SocialMediaIcons`, `Google_Analytics`); the rest are `.fbx`. Every loader is wrapped in an error boundary that falls back to a branded procedural shape, so a failed model never breaks a section.
