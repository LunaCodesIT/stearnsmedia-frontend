// Colour remaps for FBX models whose materials lost their colours at export.
// The source scenes used renderer-specific shaders (Maya aiStandardSurface /
// Blender node materials) that FBX cannot carry, so those models arrive with
// flat grey diffuse. The original material names survive, though, so colours
// are reassigned by name. The .glb models (and SEO.fbx, which uses vertex
// colours) have no palette here — they keep their authored colours.
//
// First matching rule wins. Remove a model's palette entirely if it is ever
// replaced with a properly-coloured export.

const PALETTES = {
  'Globe_Digital.fbx': [
    { match: /continents\+holo/i, props: { color: '#f1f5f2' } }, // inner base sphere
    { match: /continents/i, props: { color: '#1c5937' } }, // landmasses — brand green
    { match: /holo grid/i, props: { color: '#137547', transparent: true, opacity: 0.55 } },
    { match: /edge wear/i, props: { color: '#b48d1a' } }, // floating cubes — gold accent
    { match: /material/i, props: { color: '#9aa39e' } }, // orbit rings
  ],
  // Single mesh + single material, so the tri-colour Google Ads logo can only
  // be one solid colour without a re-export — Google blue reads best.
  'Google_Ads.fbx': [{ match: /.*/, props: { color: '#4285f4' } }],
  'Graphics_Tablet.fbx': [
    { match: /rubber/i, props: { color: '#1a1a1a' } },
    { match: /phong1\b/i, props: { color: '#d9ded9' } }, // screen face
    { match: /phong7/i, props: { color: '#1c5937' } }, // brand-green accent
    { match: /lambert/i, props: { color: '#404040' } },
    { match: /.*/, props: { color: '#2e2e2e' } }, // graphite body
  ],
  'Graphics_Card_Design.fbx': [
    { match: /plastic whit/i, props: { color: '#f2f2f2' } }, // card stock
    { match: /ribbon/i, props: { color: '#b48d1a' } }, // gold ribbon
    { match: /.*/, props: { color: '#1c5937' } }, // printed faces — brand green
  ],
};

export function applyModelColors(root, src) {
  const palette = PALETTES[src.split('/').pop()];
  if (!palette) return;
  root.traverse((obj) => {
    if (!obj.isMesh) return;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const m of mats) {
      if (!m) continue;
      const rule = palette.find((r) => r.match.test(m.name || ''));
      if (!rule) continue;
      const { color, ...rest } = rule.props;
      if (color && m.color) m.color.set(color);
      Object.assign(m, rest);
      m.needsUpdate = true;
    }
  });
}
