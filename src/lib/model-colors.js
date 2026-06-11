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

// opts: 'srgb' marks colour data; 'noflip' for GLB-loaded meshes whose UVs
// follow the glTF convention (flipY=false), unlike FBX (flipY=true default)
function tex(url, ...opts) {
  if (!texCache[url]) {
    const t = texLoader.load(url);
    if (opts.includes('srgb')) t.colorSpace = THREE.SRGBColorSpace;
    if (opts.includes('noflip')) t.flipY = false;
    texCache[url] = t;
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
  // The original V-Ray material is black diffuse + a four-colour reflection
  // map (from the cgtrader texture pack) — applied here as the base colour map
  'Google_Ads.glb': [
    {
      match: /.*/,
      props: { color: '#ffffff', roughness: 0.35, metalness: 0.05 },
      textures: { map: ['/models/google-ads-color.jpg', 'srgb', 'noflip'] },
    },
  ],
  'Graphics_Tablet.glb': [
    { match: /rubber/i, props: { color: '#1a1a1a' } },
    { match: /phong1\b/i, props: { color: '#d9ded9' } }, // screen face
    { match: /phong7/i, props: { color: '#1c5937' } }, // brand-green accent
    { match: /lambert/i, props: { color: '#404040' } },
    { match: /.*/, props: { color: '#2e2e2e' } }, // graphite body
  ],
  'Graphics_Card_Design.glb': [
    { match: /plastic whit/i, props: { color: '#f2f2f2' } }, // card stock
    { match: /ribbon/i, props: { color: '#b48d1a' } }, // gold ribbon
    { match: /.*/, props: { color: '#1c5937' } }, // printed faces — brand green
  ],
  // A 3D Google search page. The FBX's vertex colours flattened to white in
  // the Blender FBX→GLB conversion, but the logo is split into per-colour
  // materials, so the official Google colours are assigned by name.
  'SEO.glb': [
    { match: /google_red/i, props: { color: '#ea4335' } },
    { match: /google_yellow/i, props: { color: '#fbbc05' } },
    { match: /google_blue/i, props: { color: '#4285f4' } },
    { match: /aistandardsurface7/i, props: { color: '#34a853' } }, // logo green
    { match: /aistandardsurface8/i, props: { color: '#ffffff' } }, // page board
    { match: /button_color/i, props: { color: '#dfe1e5' } },
    { match: /textcolor/i, props: { color: '#5f6368' } },
    { match: /lambert/i, props: { color: '#5f6368' } }, // magnifier
    { match: /aiambientocclusion/i, props: { color: '#f1f3f4' } },
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
      for (const [slot, [url, ...opts]] of Object.entries(rule.textures || {})) {
        m[slot] = tex(url, ...opts);
      }
      m.needsUpdate = true;
    }
  });
}
