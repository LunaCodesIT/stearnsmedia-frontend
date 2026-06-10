import { create } from 'zustand';

// Global scroll state shared between the R3F journey canvas and the sections.
// The journey canvas reads this inside useFrame via useScrollStore.getState()
// (transient read — no React re-render per frame); sections subscribe with
// selectors where they need it.
export const useScrollStore = create((set) => ({
  // 0 → 1 progress of the globe's scroll journey (Hero → Website Design)
  journeyProgress: 0,
  // Screen-fraction anchors ({ x, y } in 0..1 viewport space) measured from the
  // DOM by useGlobeJourney — the canvas unprojects them into world space.
  startAnchor: { x: 0.7, y: 0.5 },
  endAnchor: { x: 0.27, y: 0.5 },
  // Absolute scrollY at which the journey completes (set after layout measure)
  journeyEndScrollY: Infinity,
  // Whether the globe has landed and is "stuck" inside the Website Design section
  globeLanded: false,

  setJourneyProgress: (journeyProgress) => set({ journeyProgress }),
  setAnchors: (startAnchor, endAnchor, journeyEndScrollY) =>
    set({ startAnchor, endAnchor, journeyEndScrollY }),
  setGlobeLanded: (globeLanded) => set({ globeLanded }),
}));
