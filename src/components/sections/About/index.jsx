import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { MaskLine } from '@/components/ui/MaskLine';
import { StatCounter } from '@/components/ui/StatCounter';

const STATS = [
  { value: 120, label: 'Happy Clients' },
  { value: 340, label: 'Campaigns Managed' },
  { value: 180, label: 'Websites Built' },
];

export function About() {
  const sectionRef = useRef(null);
  const subRef = useRef(null);
  const statsRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        subRef.current,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: subRef.current, start: 'top 88%', once: true },
        }
      );
      gsap.fromTo(
        statsRef.current?.children || [],
        { y: 32, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: statsRef.current, start: 'top 85%', once: true },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about-section"
      className="relative w-full bg-stearns-green py-20 lg:py-28 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(180,141,26,0.15),transparent_60%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-stearns-gold text-xs font-bold tracking-[0.3em] uppercase mb-5">
          About Stearns Media
        </p>

        <h2 className="font-black text-white font-display mb-6" style={{ fontSize: 'clamp(2.2rem,4.5vw,4rem)' }}>
          <MaskLine scrollTriggered>Growth without</MaskLine>
          <MaskLine scrollTriggered delay={0.1} className="text-stearns-gold">
            borders.
          </MaskLine>
        </h2>

        <p ref={subRef} className="text-white/70 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-16 opacity-0">
          We work with businesses across South Africa, the UK, USA, Australia and Europe.
        </p>

        <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-8 max-w-4xl mx-auto">
          {STATS.map((stat) => (
            <StatCounter
              key={stat.label}
              value={stat.value}
              label={stat.label}
              numberClass="text-white"
              labelClass="text-white/55"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
