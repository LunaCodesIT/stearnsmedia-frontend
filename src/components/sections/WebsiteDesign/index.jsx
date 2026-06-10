import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useWebsiteDesign } from '@/hooks/useWebsiteDesign';
import { MaskLine } from '@/components/ui/MaskLine';

// This section is where Globe_Digital lands after its scroll journey from the
// Hero (see JourneyCanvas/useGlobeJourney). It renders no canvas of its own —
// the empty anchor div below is purely a layout marker so the journey can
// measure exactly where to land, after which the globe "sticks" here and
// scrolls away with the section like any other content.
export function WebsiteDesign() {
  const { title, paragraphs, loading } = useWebsiteDesign();
  const sectionRef = useRef(null);
  const copyRef = useRef(null);

  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        copyRef.current?.children || [],
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.12,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: copyRef.current, start: 'top 85%', once: true },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [loading]);

  const heading = title || 'Website Design & Development';

  return (
    <section
      ref={sectionRef}
      id="web-design-section"
      className="relative w-full bg-stearns-dark flex flex-col lg:flex-row py-16 lg:py-24 overflow-hidden"
    >
      {/* Same black-to-green wash as the hero */}
      <div className="absolute inset-0 bg-gradient-to-br from-stearns-dark via-[#0f2e1c] to-stearns-dark" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_50%,rgba(28,89,55,0.35),transparent_70%)]" />

      {/* Empty anchor marking where the traveling globe comes to rest */}
      <div
        id="web-design-globe-anchor"
        aria-hidden
        className="relative w-full lg:w-1/2 h-[280px] sm:h-[360px] lg:h-[560px] order-2 lg:order-1 pointer-events-none"
      />

      {/* Text — right on desktop */}
      <div className="relative z-10 w-full lg:w-1/2 flex flex-col items-center lg:items-start justify-center text-center lg:text-left px-4 sm:px-6 lg:px-14 xl:px-20 py-8 lg:py-0 order-1 lg:order-2">
        <p className="text-stearns-gold text-xs font-bold tracking-[0.3em] uppercase mb-5">
          Web Design &amp; Development
        </p>

        <h2 className="font-black text-white font-display mb-6" style={{ fontSize: 'clamp(2.2rem,4.5vw,4rem)' }}>
          <MaskLine scrollTriggered>{heading.split(' ').slice(0, 2).join(' ')}</MaskLine>
          <MaskLine scrollTriggered delay={0.1} className="text-stearns-green-light">
            {heading.split(' ').slice(2).join(' ') || 'that performs.'}
          </MaskLine>
        </h2>

        <div ref={copyRef} className="space-y-4 max-w-md mx-auto lg:mx-0">
          {loading ? (
            <>
              <div className="h-4 rounded bg-white/10 animate-pulse" />
              <div className="h-4 rounded bg-white/10 animate-pulse w-5/6" />
            </>
          ) : (
            paragraphs.map((text) => (
              <p key={text.slice(0, 40)} className="text-white/60 leading-relaxed">
                {text}
              </p>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
