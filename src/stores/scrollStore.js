import { create } from 'zustand';

// Global scroll state shared between the R3F journey canvas and the sections.
// The journey canvas reads `journeyProgress` inside useFrame via
// useScrollStore.getState() (transient read — no React re-render per frame);
// sections subscribe with selectors where they need it.
export const useScrollStore = create((set) => ({
  // 0 → 1 progress of the globe's scroll journey (Hero → Website Design)
  journeyProgress: 0,
  // Absolute scrollY at which the journey completes (set after layout measure)
  journeyEndScrollY: Infinity,
  // Whether the globe has landed and is "stuck" inside the Website Design section
  globeLanded: false,

  setJourneyProgress: (journeyProgress) => set({ journeyProgress }),
  setJourneyEndScrollY: (journeyEndScrollY) => set({ journeyEndScrollY }),
  setGlobeLanded: (globeLanded) => set({ globeLanded }),
}));
