import { useEffect, useMemo, useRef, useState, Suspense, Component } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { gsap } from '@/lib/gsap';
import { isLowEnd } from '@/lib/three-utils';

const ROW_HEIGHT = 0.62; // world units the icon row is scaled to
const GAP = 0.8; // world-unit gap between repeating copies
const SPEED = 0.55; // world units/s — marquee drift speed
const TILT = 0.2; // slight pitch so the icons read as 3D

// Full-width "ticker" of the social icons row: the model repeats end-to-end
// and drifts horizontally forever, wrapping seamlessly.
function MarqueeRow() {
  const gltf = useLoader(GLTFLoader, '/models/SocialMediaIcons.glb');
  const { viewport } = useThree();
  const groupRefs = useRef([]);
  const offset = useRef(0);

  const { template, span } = useMemo(() => {
    const root = gltf.scene.clone(true);
    const box = new THREE.Box3().setFromObject(root);
    root.position.sub(box.getCenter(new THREE.Vector3()));
    const size = box.getSize(new THREE.Vector3());
    const scale = ROW_HEIGHT / Math.max(size.y, 1e-6);
    const wrap = new THREE.Group();
    wrap.add(root);
    wrap.scale.setScalar(scale);
    return { template: wrap, span: size.x * scale + GAP };
  }, [gltf]);

  // Enough copies to cover the visible width while one span scrolls out
  const copies = Math.max(2, Math.ceil(viewport.width / span) + 2);
  const clones = useMemo(
    () => Array.from({ length: copies }, () => template.clone(true)),
    [template, copies]
  );

  useFrame((_, delta) => {
    offset.current = (offset.current + delta * SPEED) % span;
    const totalHalf = (copies * span) / 2;
    groupRefs.current.forEach((g, i) => {
      if (g) g.position.x = i * span - offset.current - totalHalf + span / 2;
    });
  });

  return (
    <group rotation={[TILT, 0, 0]}>
      {clones.map((c, i) => (
        <group key={i} ref={(el) => { groupRefs.current[i] = el; }}>
          <primitive object={c} />
        </group>
      ))}
    </group>
  );
}

// Load failure → a simple row of brand-coloured spheres keeps the strip alive
function FallbackRow() {
  const ref = useRef(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.position.x = ((ref.current.position.x - delta * SPEED) % 1.2 + 1.2) % 1.2 - 0.6;
    }
  });
  const colors = ['#1c5937', '#b48d1a', '#3fae74', '#137547'];
  return (
    <group ref={ref}>
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} position={[(i - 6) * 1.2, 0, 0]}>
          <sphereGeometry args={[0.28, 24, 24]} />
          <meshStandardMaterial color={colors[i % colors.length]} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

class ModelBoundary extends Component {
  state = { crashed: false };
  static getDerivedStateFromError() {
    return { crashed: true };
  }
  componentDidCatch(e) {
    console.warn('[IconMarqueeCanvas] SocialMediaIcons.glb failed, using fallback:', e.message);
  }
  render() {
    return this.state.crashed ? <FallbackRow /> : this.props.children;
  }
}

export function IconMarqueeCanvas({ className = '' }) {
  const wrapRef = useRef(null);
  const [lowEnd] = useState(() => isLowEnd());

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const fade = gsap.fromTo(
      el,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 1.0,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      }
    );
    return () => {
      fade.scrollTrigger?.kill();
      fade.kill();
    };
  }, []);

  return (
    <div ref={wrapRef} className={`opacity-0 pointer-events-none ${className}`} aria-hidden>
      <Canvas
        camera={{ position: [0, 0.12, 3.4], fov: 32 }}
        gl={{ antialias: true, alpha: true }}
        dpr={lowEnd ? [1, 1] : [1, 1.75]}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[2, 6, 5]} intensity={1.7} />
          <pointLight position={[-4, 2, 2]} intensity={0.9} color="#b48d1a" />
          <Environment preset="city" />
          <ModelBoundary>
            <MarqueeRow />
          </ModelBoundary>
        </Suspense>
      </Canvas>
    </div>
  );
}
