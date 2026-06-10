import { useEffect, useLayoutEffect, useMemo, useRef, useState, Suspense, Component } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as THREE from 'three';
import { gsap } from '@/lib/gsap';
import { fitModelToSize, isLowEnd } from '@/lib/three-utils';
import { useScrollStore } from '@/stores/scrollStore';
import { useGlobeJourney, JOURNEY_IDS } from '@/hooks/useGlobeJourney';

// ─── Hero "at rest" pose ──────────────────────────────────────────────────────
const START_ROTATION = [0.1, -0.4, 0];
const START_FIT_SIZE = 1.55;

// ─── Website Design "landing" pose — slightly smaller, a visual cue that the
// globe has settled into its showcase spot ────────────────────────────────────
const END_ROTATION = [-0.15, Math.PI * 0.85, 0.08];
const END_FIT_SIZE = 1.35;

const MOBILE_SCALE_FACTOR = 0.5;
const AUTO_ROTATE_SPEED = 0.25; // rad/s — idle spin at rest

// ─── Spiral journey tuning (same idiom as the Comfy Shoes reference) ──────────
const SPIRAL_TURNS = -2.25; // anti-clockwise sweep on the way down
const SPIRAL_RADIUS = 2.4; // world units; 0 at both ends, peaks mid-journey
const SHRINK_AMOUNT = 0.32; // scale dips to ~68% of baseline mid-journey
const FADE_AMOUNT = 0.5; // opacity dips mid-journey (reads as "behind" content)
const SMOOTHING = 0.08; // per-frame lerp toward the scroll-derived target

// ─── Drag-to-rotate ───────────────────────────────────────────────────────────
const DRAG_SENSITIVITY = 0.006;
const DRAG_PITCH_LIMIT = Math.PI / 4;

function smoothEase(t) {
  return t * t * (3 - 2 * t); // smoothstep
}

// Anchors live at this depth from the camera (close to world origin)
const ANCHOR_DEPTH = new THREE.Vector3(2.2, 0.45, 2.65).length();

function screenFractionToWorld(camera, xFraction, yFraction, out) {
  const ndcX = xFraction * 2 - 1;
  const ndcY = -(yFraction * 2 - 1);
  out.set(ndcX, ndcY, 0.5).unproject(camera);
  const dir = out.sub(camera.position).normalize();
  return camera.position.clone().add(dir.multiplyScalar(ANCHOR_DEPTH));
}

// ─── Procedural fallback: a simple wireframe globe ────────────────────────────
function ProceduralGlobe() {
  const groupRef = useRef(null);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * AUTO_ROTATE_SPEED;
  });
  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial color="#1c5937" roughness={0.35} metalness={0.2} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.74, 24, 24]} />
        <meshStandardMaterial color="#b48d1a" wireframe transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

// ─── The traveling globe itself ───────────────────────────────────────────────
function GlobeModel() {
  const fbx = useLoader(FBXLoader, '/models/Globe_Digital.fbx');
  const groupRef = useRef(null); // world-space pivot — driven by the journey
  const innerRef = useRef(null); // pose correction — lerps between end poses
  const spinRef = useRef(null); // continuous idle auto-spin
  const tweenRef = useRef(null);
  const easedSmoothed = useRef(0);
  const liveEndAnchor = useRef(new THREE.Vector3());
  const landingElRef = useRef(null);
  const { width } = useThree((s) => s.size);
  const camera = useThree((s) => s.camera);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const drag = useRef({ active: false, pointerId: -1, lastX: 0, lastY: 0 });
  const dragRotation = useRef({ x: 0, y: 0 });
  const scratch = useRef({ start: new THREE.Vector3(), end: new THREE.Vector3() });

  const mobile = width < 768;
  const startFit = START_FIT_SIZE * (mobile ? MOBILE_SCALE_FACTOR : 1);
  const endFit = END_FIT_SIZE * (mobile ? MOBILE_SCALE_FACTOR : 1);

  const model = useMemo(() => {
    const root = fbx.clone(true);
    const materials = [];
    root.traverse((obj) => {
      if (!obj.isMesh) return;
      obj.castShadow = true;
      obj.receiveShadow = true;
      const original = Array.isArray(obj.material) ? obj.material : [obj.material];
      const cloned = original.filter(Boolean).map((m) => {
        const c = m.clone();
        c.transparent = true;
        materials.push(c);
        return c;
      });
      obj.material = cloned.length > 1 ? cloned : cloned[0];
    });
    return { root, materials };
  }, [fbx]);

  // Fit once to the START size — the journey scales relative to this baseline
  useLayoutEffect(() => {
    fitModelToSize(model.root, startFit);
  }, [model, startFit]);

  // Continuous idle Y-spin — the "resting" liveliness at both ends of the trip
  useLayoutEffect(() => {
    const spin = spinRef.current;
    if (!spin) return;
    spin.rotation.set(0, 0, 0);
    const duration = (Math.PI * 2) / AUTO_ROTATE_SPEED;
    tweenRef.current = gsap.fromTo(
      spin.rotation,
      { y: 0 },
      { y: Math.PI * 2, duration, ease: 'none', repeat: -1 }
    );
    return () => tweenRef.current?.kill();
  }, []);

  // ─── Drag-to-rotate: the canvas is pointer-events:none (so the globe never
  // blocks page content), so listen on window in the capture phase — raycast on
  // press to check the globe was grabbed, then track the drag by hand ──────────
  useEffect(() => {
    const ndc = new THREE.Vector2();
    const hitsGlobe = (e) => {
      const pivot = groupRef.current;
      if (!pivot) return false;
      ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      return raycaster.intersectObject(pivot, true).length > 0;
    };
    const onPointerDown = (e) => {
      if (e.button > 0 || !hitsGlobe(e)) return;
      e.preventDefault();
      e.stopPropagation();
      drag.current = { active: true, pointerId: e.pointerId, lastX: e.clientX, lastY: e.clientY };
    };
    const onPointerMove = (e) => {
      const d = drag.current;
      if (!d.active || e.pointerId !== d.pointerId) return;
      const dx = e.clientX - d.lastX;
      const dy = e.clientY - d.lastY;
      d.lastX = e.clientX;
      d.lastY = e.clientY;
      dragRotation.current.y += dx * DRAG_SENSITIVITY;
      dragRotation.current.x = THREE.MathUtils.clamp(
        dragRotation.current.x + dy * DRAG_SENSITIVITY,
        -DRAG_PITCH_LIMIT,
        DRAG_PITCH_LIMIT
      );
    };
    const onPointerUp = (e) => {
      if (e.pointerId === drag.current.pointerId) drag.current.active = false;
    };
    window.addEventListener('pointerdown', onPointerDown, { capture: true });
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown, { capture: true });
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [camera, raycaster]);

  useFrame(({ clock }) => {
    const pivot = groupRef.current;
    const inner = innerRef.current;
    if (!pivot || !inner) return;

    // Transient store read — no React re-render per frame
    const { journeyProgress, startAnchor, endAnchor, journeyEndScrollY } =
      useScrollStore.getState();

    const target = smoothEase(THREE.MathUtils.clamp(journeyProgress, 0, 1));
    easedSmoothed.current = THREE.MathUtils.lerp(easedSmoothed.current, target, SMOOTHING);
    const eased = easedSmoothed.current;
    const bloom = Math.sin(Math.PI * eased); // 0 at both ends, peaks mid-journey

    const start = screenFractionToWorld(camera, startAnchor.x, startAnchor.y, scratch.current.start);
    let end = screenFractionToWorld(camera, endAnchor.x, endAnchor.y, scratch.current.end);

    // "Stuck" zone: once fully arrived, the globe parks INSIDE the Website
    // Design section and scrolls along WITH it — tracking the live anchor
    // instead of the precomputed landing point.
    if (window.scrollY >= journeyEndScrollY) {
      if (!landingElRef.current) {
        landingElRef.current = document.getElementById(JOURNEY_IDS.landingAnchor);
      }
      const el = landingElRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        end = screenFractionToWorld(
          camera,
          (rect.left + rect.width / 2) / window.innerWidth,
          (rect.top + rect.height / 2) / window.innerHeight,
          liveEndAnchor.current
        );
      }
    }

    // ── World-space position: lerp between anchors + spiral offset ──
    const angle = eased * SPIRAL_TURNS * Math.PI * 2;
    const radius = SPIRAL_RADIUS * bloom;
    pivot.position.set(
      THREE.MathUtils.lerp(start.x, end.x, eased) + Math.cos(angle) * radius,
      THREE.MathUtils.lerp(start.y, end.y, eased)
        + Math.sin(angle) * radius * 0.6
        + Math.sin(clock.getElapsedTime() * 0.55) * 0.06 * (1 - bloom), // idle float at the ends
      THREE.MathUtils.lerp(start.z, end.z, eased) + Math.sin(angle) * radius
    );

    // ── Pose: lerp rotation/fit between resting poses + user drag offset ──
    inner.rotation.set(
      THREE.MathUtils.lerp(START_ROTATION[0], END_ROTATION[0], eased) + dragRotation.current.x,
      THREE.MathUtils.lerp(START_ROTATION[1], END_ROTATION[1], eased) + dragRotation.current.y,
      THREE.MathUtils.lerp(START_ROTATION[2], END_ROTATION[2], eased)
    );
    const fitRatio = THREE.MathUtils.lerp(1, endFit / startFit, eased);
    const shrink = 1 - SHRINK_AMOUNT * bloom;
    inner.scale.setScalar(fitRatio * shrink);

    // Outer yaw — the spiral's own rotation, so the globe visibly tumbles
    pivot.rotation.y = angle * (1 - eased) * 0.5;

    // Pause idle spin mid-journey and while the user drags
    const t = tweenRef.current;
    if (t) { if (bloom > 0.05 || drag.current.active) t.pause(); else t.resume(); }

    // ── Opacity: full at rest, recedes "behind" content mid-journey ──
    const opacity = 1 - FADE_AMOUNT * bloom;
    for (const m of model.materials) m.opacity = opacity;
  });

  return (
    <group ref={groupRef}>
      <group ref={spinRef}>
        <group ref={innerRef}>
          <primitive object={model.root} />
        </group>
      </group>
    </group>
  );
}

// ─── R3F error boundary: FBX load failure → procedural fallback ───────────────
class ModelBoundary extends Component {
  state = { crashed: false };
  static getDerivedStateFromError() {
    return { crashed: true };
  }
  componentDidCatch(e) {
    console.warn('[JourneyCanvas] Globe_Digital.fbx failed, using procedural fallback:', e.message);
  }
  render() {
    return this.state.crashed ? this.props.fallback : this.props.children;
  }
}

function JourneyScene() {
  useGlobeJourney();
  return (
    <ModelBoundary fallback={<ProceduralGlobe />}>
      <GlobeModel />
    </ModelBoundary>
  );
}

export function JourneyCanvas() {
  const [lowEnd] = useState(() => isLowEnd());

  return (
    <div className="fixed inset-0 z-[6] pointer-events-none pe-none-deep" aria-hidden>
      <Canvas
        camera={{ position: [2.2, 0.45, 2.65], fov: 32 }}
        gl={{ antialias: true, alpha: true }}
        dpr={lowEnd ? [1, 1] : [1, 1.75]}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.65} />
          <directionalLight position={[2, 8, 5]} intensity={1.9} castShadow />
          <pointLight position={[4, 1, 2]} intensity={1.6} color="#1c5937" />
          <pointLight position={[-4, 3, 1]} intensity={1.1} color="#b48d1a" />
          <Environment preset="city" />
          <JourneyScene />
        </Suspense>
      </Canvas>
    </div>
  );
}
