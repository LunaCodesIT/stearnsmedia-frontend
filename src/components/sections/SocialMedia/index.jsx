import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useSocialMedia } from '@/hooks/useSocialMedia';
import { MaskLine } from '@/components/ui/MaskLine';
import { IconMarqueeCanvas } from '@/components/three/IconMarqueeCanvas';

// Centred copy with the social-icon 3D marquee running full-width along the
// bottom of the section, ticker-style.
export function SocialMedia() {
  const { title, paragraphs, loading } = useSocialMedia();
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

  const heading = title || 'Social Media';
  const words = heading.split(' ');
  const splitAt = Math.ceil(words.length / 2);

  return (
    <section
      ref={sectionRef}
      id="social-media-section"
      className="relative w-full bg-stearns-dark pt-20 lg:pt-28"
    >
      {/* Same black-to-green wash as the hero */}
      <div className="absolute inset-0 bg-gradient-to-br from-stearns-dark via-[#0f2e1c] to-stearns-dark" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_50%,rgba(28,89,55,0.35),transparent_70%)]" />

      {/* Copy — centred */}
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-stearns-gold text-xs font-bold tracking-[0.3em] uppercase mb-5">
          Social Media Marketing
        </p>

        <h2
          className="font-black text-white font-display mb-6"
          style={{ fontSize: 'clamp(2rem,4vw,3.4rem)' }}
        >
          <MaskLine scrollTriggered>{words.slice(0, splitAt).join(' ')}</MaskLine>
          {words.length > splitAt && (
            <MaskLine scrollTriggered delay={0.1} className="text-stearns-green-light">
              {words.slice(splitAt).join(' ')}
            </MaskLine>
          )}
        </h2>

        <div ref={copyRef} className="space-y-4 max-w-xl mx-auto">
          {loading ? (
            <>
              <div className="h-4 rounded bg-white/10 animate-pulse" />
              <div className="h-4 rounded bg-white/10 animate-pulse w-5/6 mx-auto" />
              <div className="h-4 rounded bg-white/10 animate-pulse w-2/3 mx-auto" />
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

      {/* Icon marquee — straddles the boundary with the next section,
          acting as a separator strip (translated down by half its height) */}
      <div className="relative z-20 translate-y-1/2 mt-4 lg:mt-6">
        <IconMarqueeCanvas className="w-full h-[140px] sm:h-[180px] lg:h-[220px]" />
      </div>
    </section>
  );
}
