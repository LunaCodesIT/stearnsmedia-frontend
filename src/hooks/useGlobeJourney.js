import { useLayoutEffect } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useScrollStore } from '@/stores/scrollStore';

export const JOURNEY_IDS = {
  heroSection: 'hero-section',
  heroAnchor: 'hero-globe-anchor',
  landingSection: 'web-design-section',
  landingAnchor: 'web-design-globe-anchor',
};

// Drives the globe's Hero → Website Design scroll journey. All DOM measurement
// and ScrollTrigger wiring lives here; results are written to the scroll store,
// which the R3F canvas consumes. Components never touch this logic directly.
export function useGlobeJourney() {
  useLayoutEffect(() => {
    const { setJourneyProgress, setAnchors, setGlobeLanded } = useScrollStore.getState();

    const measure = () => {
      const heroEl = document.getElementById(JOURNEY_IDS.heroAnchor);
      const landingEl = document.getElementById(JOURNEY_IDS.landingAnchor);
      const landingSection = document.getElementById(JOURNEY_IDS.landingSection);
      if (!heroEl) return;

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scrollY = window.scrollY;

      // Start anchor: measured directly — the hero is at rest at the top of the page
      const heroRect = heroEl.getBoundingClientRect();
      const startAnchor = {
        x: (heroRect.left + heroRect.width / 2) / vw,
        y: (heroRect.top + heroRect.height / 2) / vh,
      };

      // Until the landing section exists, the globe simply rests at the hero
      if (!landingEl || !landingSection) {
        setAnchors(startAnchor, startAnchor, Infinity);
        return;
      }

      // End anchor: the landing moment is "landing section vertically centred in
      // the viewport" (matches the ScrollTrigger end: 'center center' below) —
      // derive where the marker will sit on screen at THAT moment from its
      // layout-constant offset from its section's centre.
      const landingRect = landingEl.getBoundingClientRect();
      const sectionRect = landingSection.getBoundingClientRect();
      const sectionAbsTop = sectionRect.top + scrollY;
      const markerOffsetFromSectionCenterY =
        (landingRect.top + landingRect.height / 2) - (sectionRect.top + sectionRect.height / 2);
      const landingY = vh / 2 + markerOffsetFromSectionCenterY;
      const landingX = landingRect.left + landingRect.width / 2;

      // Absolute scrollY at which the journey completes. Past this point the
      // globe is "stuck": it tracks the live anchor instead of the precomputed
      // landing point, so it scrolls away with the section like normal content.
      const journeyEndScrollY = sectionAbsTop + sectionRect.height / 2 - vh / 2;

      setAnchors(startAnchor, { x: landingX / vw, y: landingY / vh }, journeyEndScrollY);
    };

    measure();
    window.addEventListener('resize', measure);

    let trigger = null;
    const ctx = gsap.context(() => {
      const heroSection = document.getElementById(JOURNEY_IDS.heroSection);
      const landingSection = document.getElementById(JOURNEY_IDS.landingSection);
      if (!heroSection || !landingSection) return;
      trigger = ScrollTrigger.create({
        trigger: `#${JOURNEY_IDS.heroSection}`,
        start: 'top top',
        endTrigger: `#${JOURNEY_IDS.landingSection}`,
        end: 'center center',
        scrub: true,
        onRefresh: measure,
        onUpdate: (self) => {
          setJourneyProgress(self.progress);
          setGlobeLanded(window.scrollY >= useScrollStore.getState().journeyEndScrollY);
        },
      });
      // Sync the store to the real progress immediately — after remounting
      // (route changes) or reloading mid-page, stale store values would
      // otherwise place the globe wrongly until the first scroll event.
      setJourneyProgress(trigger.progress);
      setGlobeLanded(window.scrollY >= useScrollStore.getState().journeyEndScrollY);
    });

    return () => {
      window.removeEventListener('resize', measure);
      trigger?.kill();
      ctx.revert();
    };
  }, []);
}
