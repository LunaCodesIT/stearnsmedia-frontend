import { useEffect, useRef } from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { gsap } from '@/lib/gsap';
import { MaskLine } from '@/components/ui/MaskLine';

export function Hero() {
  const sectionRef = useRef(null);
  const labelRef = useRef(null);
  const subRef = useRef(null);
  const ctaRef = useRef(null);
  const arrowRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        labelRef.current,
        { y: 18, opacity: 0, letterSpacing: '0.5em' },
        { y: 0, opacity: 1, letterSpacing: '0.3em', duration: 1.1, ease: 'power3.out', delay: 0.15 }
      );
      gsap.fromTo(
        [subRef.current, ctaRef.current],
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power2.out', stagger: 0.15, delay: 0.95 }
      );
      gsap.fromTo(
        arrowRef.current,
        { y: -10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'back.out(2)', delay: 1.4 }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero-section"
      className="relative w-full h-dvh min-h-[560px] bg-stearns-dark overflow-hidden flex items-center"
    >
      {/* Black-to-green gradient — same idiom as the reference hero */}
      <div className="absolute inset-0 bg-gradient-to-br from-stearns-dark via-[#0f2e1c] to-stearns-dark" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_50%,rgba(28,89,55,0.35),transparent_70%)]" />

      {/*
        Empty anchor marking where the 3D globe rests at the start of its
        scroll-driven journey (see JourneyCanvas) — kept purely so the journey
        can measure exactly where to start from.
      */}
      <div
        id="hero-globe-anchor"
        aria-hidden
        className="absolute inset-0 md:left-[42%] top-auto md:top-0 h-1/2 md:h-full pointer-events-none z-10"
      />

      {/* Text block — left side / top half on mobile */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pointer-events-none pb-[50%] md:pb-0 pt-16">
        <div className="max-w-xl mx-auto md:mx-0 text-center md:text-left">
          <p
            ref={labelRef}
            className="text-stearns-gold text-xs font-bold tracking-[0.3em] uppercase mb-6 opacity-0"
          >
            Digital Growth Partner
          </p>

          <h1 className="mb-7 font-black text-white font-display">
            <MaskLine delay={0.3} className="text-[clamp(2.8rem,7vw,5.2rem)]">
              Smarter Marketing.
            </MaskLine>
            <MaskLine delay={0.44} className="text-[clamp(2.8rem,7vw,5.2rem)] text-stearns-green-light">
              Better Results.
            </MaskLine>
          </h1>

          <p
            ref={subRef}
            className="text-white/65 text-base sm:text-lg leading-relaxed mb-9 opacity-0 max-w-md mx-auto md:mx-0"
          >
            Full-service digital growth partner — SEO, Ads, Social, Web &amp; More.
          </p>

          <div
            ref={ctaRef}
            className="flex flex-wrap items-center justify-center md:justify-start gap-4 opacity-0 pointer-events-auto"
          >
            <a
              href="#contact"
              className="group inline-flex items-center gap-2 bg-stearns-green text-white px-7 py-3.5 rounded-full font-bold text-sm hover:shadow-[0_8px_30px_rgba(28,89,55,0.4)] transition-shadow duration-300"
            >
              Get a Quote
              <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-stearns-green transition-all duration-300">
                <ArrowRight size={14} />
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Scroll prompt */}
      <button
        ref={arrowRef}
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        aria-label="Scroll down"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-white/35 hover:text-stearns-green-light transition-colors duration-300 opacity-0"
      >
        <span className="text-[10px] tracking-[0.25em] uppercase font-medium">Scroll</span>
        <ArrowDown size={18} className="animate-bounce" />
      </button>
    </section>
  );
}
