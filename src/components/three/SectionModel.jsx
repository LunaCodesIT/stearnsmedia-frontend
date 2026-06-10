import { useEffect, useLayoutEffect, useMemo, useRef, useState, Suspense, Component } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Environment, PresentationControls } from '@react-three/drei';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { fitModelToSize, isLowEnd } from '@/lib/three-utils';

const IDLE_SPIN_SPEED = 0.3; // rad/s

function SpinningModel({ object, fit, rotation, entranceProgress }) {
  const spinRef = useRef(null);
  const scaleRef = useRef(null);

  useLayoutEffect(() => {
    fitModelToSize(object, fit);
  }, [object, fit]);

  useFrame((_, delta) => {
    if (spinRef.current) spinRef.current.rotation.y += delta * IDLE_SPIN_SPEED;
    if (scaleRef.current) {
      // Entrance: scale + rise driven by the section's ScrollTrigger tween
      const p = entranceProgress.current;
      const eased = 1 - Math.pow(1 - p, 3); // cubic out
      scaleRef.current.scale.setScalar(0.55 + 0.45 * eased);
      scaleRef.current.position.y = -0.6 * (1 - eased);
    }
  });

  return (
    <group ref={scaleRef}>
      <group rotation={rotation}>
        <group ref={spinRef}>
          <primitive object={object} />
        </group>
      </group>
    </group>
  );
}

function FBXModel(props) {
  const fbx = useLoader(FBXLoader, props.src);
  const object = useMemo(() => fbx.clone(true), [fbx]);
  return <SpinningModel {...props} object={object} />;
}

function GLBModel(props) {
  const gltf = useLoader(GLTFLoader, props.src);
  const object = useMemo(() => gltf.scene.clone(true), [gltf]);
  return <SpinningModel {...props} object={object} />;
}

// Load failure → simple branded placeholder so the section still reads fine
function FallbackShape() {
  const ref = useRef(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * IDLE_SPIN_SPEED;
  });
  return (
    <group ref={ref}>
      <mesh>
        <icosahedronGeometry args={[0.65, 1]} />
        <meshStandardMaterial color="#1c5937" roughness={0.4} metalness={0.15} flatShading />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.69, 1]} />
        <meshStandardMaterial color="#b48d1a" wireframe transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

class ModelBoundary extends Component {
  state = { crashed: false };
  static getDerivedStateFromError() {
    return { crashed: true };
  }
  componentDidCatch(e) {
    console.warn(`[SectionModel] ${this.props.src} failed to load, using fallback:`, e.message);
  }
  render() {
    return this.state.crashed ? <FallbackShape /> : this.props.children;
  }
}

// Inline per-section 3D viewer: loads .fbx or .glb (picked by extension), fits
// and idle-rotates the model, and plays a ScrollTrigger entrance (scale + rise)
// as the section scrolls into view. Failures fall back to a branded shape.
export function SectionModel({ src, fit = 1.5, rotation = [0.1, -0.3, 0], className = '' }) {
  const wrapRef = useRef(null);
  const entranceProgress = useRef(0);
  const [lowEnd] = useState(() => isLowEnd());

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const tween = gsap.fromTo(
      entranceProgress,
      { current: 0 },
      {
        current: 1,
        duration: 1.4,
        ease: 'none', // easing applied per-frame in SpinningModel
        scrollTrigger: { trigger: el, start: 'top 80%', once: true },
      }
    );
    // Fade/rise the canvas wrapper itself alongside the model entrance
    const fade = gsap.fromTo(
      el,
      { opacity: 0, y: 36 },
      {
        opacity: 1,
        y: 0,
        duration: 1.0,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 80%', once: true },
      }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      fade.scrollTrigger?.kill();
      fade.kill();
    };
  }, []);

  const Model = src.toLowerCase().endsWith('.glb') ? GLBModel : FBXModel;

  return (
    <div ref={wrapRef} className={`opacity-0 ${className}`} aria-hidden>
      <Canvas
        camera={{ position: [2.2, 0.45, 2.65], fov: 32 }}
        gl={{ antialias: true, alpha: true }}
        dpr={lowEnd ? [1, 1] : [1, 1.75]}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.65} />
          <directionalLight position={[2, 8, 5]} intensity={1.9} />
          <pointLight position={[4, 1, 2]} intensity={1.4} color="#1c5937" />
          <pointLight position={[-4, 3, 1]} intensity={1.0} color="#b48d1a" />
          <Environment preset="city" />
          <PresentationControls
            global={false}
            cursor
            snap
            speed={1.2}
            polar={[-Math.PI / 5, Math.PI / 5]}
          >
            <ModelBoundary src={src}>
              <Model src={src} fit={fit} rotation={rotation} entranceProgress={entranceProgress} />
            </ModelBoundary>
          </PresentationControls>
        </Suspense>
      </Canvas>
    </div>
  );
}
