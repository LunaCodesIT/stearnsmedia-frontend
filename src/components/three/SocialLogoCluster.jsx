import { useEffect, useMemo, useRef, useState, Suspense, Component } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from '@/lib/gsap';
import { fitModelToSize, isLowEnd } from '@/lib/three-utils';
import { applyModelColors } from '@/lib/model-colors';

// Floating cluster of social logos. Each logo gets its own animation
// personality so the group never moves in lockstep:
//   sway — yaw oscillation (amplitude/speed/phase vary per logo)
//   rock — z-axis rocking with a slight yaw drift
// All of them bob vertically on different phases/speeds.
const LOGOS = [
  { src: '/models/Twitter_Logo.glb', pos: [0, -0.06, 0.15], size: 0.68, anim: 'sway', phase: 2.2, speed: 0.65, bob: 0.9 },
  { src: '/models/Facebook_Logo.glb', pos: [-0.8, 0.48, 0], size: 0.55, anim: 'sway', phase: 0.0, speed: 0.45, bob: 0.7 },
  { src: '/models/Instagram_Logo.glb', pos: [0.7, 0.53, -0.1], size: 0.6, anim: 'sway', phase: 1.3, speed: 0.4, amp: 0.5, bob: 1.1 },
  { src: '/models/Pinterest_Logo.glb', pos: [0, 0.64, -0.05], size: 0.48, anim: 'sway', phase: 4.1, speed: 0.8, bob: 1.3 },
  { src: '/models/Whatsapp_Logo.glb', pos: [-0.8, -0.5, 0], size: 0.55, anim: 'rock', phase: 0.7, speed: 0.7, bob: 0.8 },
  { src: '/models/TikTok_Logo.glb', pos: [0.74, -0.48, 0.05], size: 0.55, anim: 'sway', phase: 3.1, speed: -0.55, amp: 0.45, bob: 1.0 },
];

const SWAY_AMP = 0.35;
const ROCK_AMP = 0.16;
const BOB_AMP = 0.05;

function LogoCluster({ entranceProgress }) {
  const gltfs = useLoader(GLTFLoader, LOGOS.map((l) => l.src));
  const refs = useRef([]);

  const models = useMemo(
    () =>
      gltfs.map((gltf, i) => {
        const root = gltf.scene.clone(true);
        applyModelColors(root, LOGOS[i].src);
        fitModelToSize(root, LOGOS[i].size);
        return root;
      }),
    [gltfs]
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    LOGOS.forEach((cfg, i) => {
      const g = refs.current[i];
      if (!g) return;

      // Staggered entrance: each logo pops in slightly after the previous
      const p = Math.min(Math.max(entranceProgress.current * 1.7 - i * 0.12, 0), 1);
      const eased = 1 - Math.pow(1 - p, 3);
      g.scale.setScalar(Math.max(eased, 1e-4));

      g.position.set(
        cfg.pos[0],
        cfg.pos[1] + Math.sin(t * cfg.bob + cfg.phase) * BOB_AMP - 0.5 * (1 - eased),
        cfg.pos[2]
      );

      if (cfg.anim === 'rock') {
        g.rotation.set(0.08, Math.sin(t * 0.3 + cfg.phase) * 0.15, Math.sin(t * cfg.speed + cfg.phase) * ROCK_AMP);
      } else {
        g.rotation.set(0.08, Math.sin(t * cfg.speed + cfg.phase) * (cfg.amp || SWAY_AMP), 0);
      }
    });
  });

  return (
    <group>
      {models.map((m, i) => (
        <group key={LOGOS[i].src} ref={(el) => { refs.current[i] = el; }}>
          <primitive object={m} />
        </group>
      ))}
    </group>
  );
}

// Load failure → brand-coloured spheres in the same constellation
function FallbackCluster() {
  const colors = ['#1da1f2', '#1877f2', '#d6249f', '#e60023', '#25d366', '#101010'];
  return (
    <group>
      {LOGOS.map((cfg, i) => (
        <mesh key={cfg.src} position={cfg.pos}>
          <sphereGeometry args={[cfg.size / 2, 24, 24]} />
          <meshStandardMaterial color={colors[i]} roughness={0.35} />
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
    console.warn('[SocialLogoCluster] logo failed to load, using fallback:', e.message);
  }
  render() {
    return this.state.crashed ? <FallbackCluster /> : this.props.children;
  }
}

export function SocialLogoCluster({ className = '' }) {
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
        duration: 1.6,
        ease: 'none', // easing applied per-logo in LogoCluster
        scrollTrigger: { trigger: el, start: 'top 80%', once: true },
      }
    );
    const fade = gsap.fromTo(
      el,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.7,
        ease: 'power2.out',
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

  return (
    <div ref={wrapRef} className={`opacity-0 ${className}`} aria-hidden>
      <Canvas
        camera={{ position: [0, 0.1, 3.3], fov: 32 }}
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
            <LogoCluster entranceProgress={entranceProgress} />
          </ModelBoundary>
        </Suspense>
      </Canvas>
    </div>
  );
}
