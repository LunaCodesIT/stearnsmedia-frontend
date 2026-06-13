import * as THREE from 'three';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

// The GLBs are Meshopt-compressed (glTF-Transform); GLTFLoader needs the
// decoder registered. Pass to useLoader as the third argument.
export function withMeshopt(loader) {
  loader.setMeshoptDecoder(MeshoptDecoder);
}

// Kick off the Meshopt WASM compile immediately (it's a one-time ~tens-of-ms
// cost). Called at app start so the decoder is ready before any model loads —
// otherwise the first GLB blocks on WASM init, which read as "slow to appear".
export function warmMeshoptDecoder() {
  return MeshoptDecoder.ready;
}

// Reset → centre → scale-to-fit → re-centre. Mutates `model` in place so its
// bounding box is centred on the origin and its largest dimension equals `targetSize`.
export function fitModelToSize(model, targetSize) {
  model.scale.setScalar(1);
  model.rotation.set(0, 0, 0);
  model.position.set(0, 0, 0);
  model.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(model);
  model.position.sub(box.getCenter(new THREE.Vector3()));
  model.updateMatrixWorld(true);

  const size = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
  model.scale.setScalar(targetSize / Math.max(size.x, size.y, size.z, 1e-6));
  model.updateMatrixWorld(true);

  model.position.sub(new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3()));
}

export function isMobile() {
  return typeof window !== 'undefined' && window.innerWidth < 768;
}

export function isLowEnd() {
  return typeof navigator !== 'undefined' && navigator.hardwareConcurrency < 4;
}
