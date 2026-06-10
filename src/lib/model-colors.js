import * as THREE from 'three';

// Material restoration for FBX models whose looks were lost at export.
// The source scenes used renderer-specific shaders (Maya aiStandardSurface /
// Blender Cycles nodes) that FBX cannot carry, so those models arrive with
// flat grey diffuse. The original material names survive, so looks are
// reassigned by name. The .glb models (and SEO.fbx, which uses vertex
// colours) have no palette here — they keep their authored colours.
//
// Globe_Digital values come from the original .blend (a holographic earth):
// emissive night-lights continents from the blend's packed earth texture,
// a land/ocean alpha mask, glowing green orbit rings and data cubes, and a
// translucent holo-grid shell.
//
// First matching rule wins. Remove a model's palette entirely if it is ever
// replaced with a properly-coloured export.

const texLoader = new THREE.TextureLoader();
const texCache = {};

function tex(url, colorSpace) {
  if (!texCache[url]) {
    texCache[url] = texLoader.load(url);
    if (colorSpace) texCache[url].colorSpace = colorSpace;
  }
  return texCache[url];
}

const PALETTES = {
  'Globe_Digital.fbx': [
    {
      // inner base sphere — hidden: its brick-displaced geometry bulges
      // through the outer shell at the pole (a grid-patterned "cap"), and with
      // the holo-grid shell hidden it contributes nothing visible anyway
      match: /continents\+holo/i,
      props: { visible: false },
    },
    {
      // outer continents shell — solid dark sphere with emissive night-lights
      // land, like the product render: oceans stay dark-but-visible and a
      // specular highlight defines the silhouette against dark backgrounds
      match: /continents/i,
      props: {
        color: '#071009',
        emissive: '#ffffff',
        emissiveIntensity: 1.0,
        specular: '#41604d',
        shininess: 32,
      },
      textures: { emissiveMap: ['/models/globe-emission.jpg', 'srgb'] },
    },
    {
      // holographic grid shell — hidden: its lat/long geometry piles up at the
      // pole into a bright green cap (in the blend a procedural brick pattern
      // masked most of it, which can't be reproduced without baking)
      match: /holo grid/i,
      props: { visible: false },
    },
    {
      // floating data cubes — bright green emission (0.08, 1.00, 0.09 linear)
      match: /edge wear/i,
      props: { color: '#02140a', emissive: '#4dff52', emissiveIntensity: 1.1 },
    },
    {
      // orbit rings — green emission (0.05, 0.56, 0.05 linear)
      match: /material/i,
      props: { color: '#000000', emissive: '#3dc63d', emissiveIntensity: 1.0 },
    },
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
      const { color, emissive, specular, ...rest } = rule.props;
      if (color && m.color) m.color.set(color);
      if (emissive && m.emissive) m.emissive.set(emissive);
      if (specular && m.specular) m.specular.set(specular);
      Object.assign(m, rest);
      for (const [slot, [url, space]] of Object.entries(rule.textures || {})) {
        m[slot] = tex(url, space === 'srgb' ? THREE.SRGBColorSpace : undefined);
      }
      m.needsUpdate = true;
    }
  });
}
