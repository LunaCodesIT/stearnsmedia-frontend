import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

// Debounced ScrollTrigger.refresh — called whenever async content (WP copy)
// changes layout heights, so scroll-driven measurements (e.g. the globe
// journey anchors) are re-taken instead of going stale.
let refreshTimer;
export function refreshScrollTriggersSoon() {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 150);
}
