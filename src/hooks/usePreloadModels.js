import { useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { withMeshopt } from '@/lib/three-utils';

const MODEL_URLS = [
  '/models/Globe_Digital.fbx',
  '/models/Google_Ads.glb',
  '/models/Google_Analytics.glb',
  '/models/SEO.glb',
  '/models/Graphic_Design_Brush.glb',
  '/models/Graphics_Laptop.glb',
  '/models/Facebook_Logo.glb',
  '/models/Instagram_Logo.glb',
  '/models/Pinterest_Logo.glb',
  '/models/TikTok_Logo.glb',
  '/models/Twitter_Logo.glb',
  '/models/Whatsapp_Logo.glb',
];

// Warm the loader cache for every model once the page has settled — the whole
// set is <1MB compressed, so by the time a section scrolls into view its
// model is already parsed and appears instantly.
export function usePreloadModels() {
  useEffect(() => {
    const idle =
      typeof requestIdleCallback === 'function'
        ? requestIdleCallback
        : (fn) => setTimeout(fn, 1500);
    const handle = idle(() => {
      for (const url of MODEL_URLS) {
        if (url.endsWith('.glb')) useLoader.preload(GLTFLoader, url, withMeshopt);
        else useLoader.preload(FBXLoader, url);
      }
    });
    return () => {
      if (typeof cancelIdleCallback === 'function') cancelIdleCallback(handle);
      else clearTimeout(handle);
    };
  }, []);
}
