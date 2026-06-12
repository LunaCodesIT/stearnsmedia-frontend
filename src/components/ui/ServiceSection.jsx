import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { gsap } from '@/lib/gsap';
import { MaskLine } from '@/components/ui/MaskLine';

// Reusable service-section layout: eyebrow label + line-mask heading + WP copy
// on one side, 3D model (passed as children) on the other. Pure presentation —
// all data arrives via props from the section's own hook.
export function ServiceSection({
  id,
  label,
  title,
  paragraphs = [],
  loading = false,
  reverse = false,
  heroBackground = false,
  to = '',
  children,
}) {
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

  const titleWords = title.split(' ');
  const splitAt = Math.ceil(titleWords.length / 2);

  return (
    <section
      ref={sectionRef}
      id={id}
      className="relative w-full bg-stearns-dark py-20 lg:py-28 overflow-hidden"
    >
      {heroBackground ? (
        <>
          {/* Same black-to-green wash as the hero */}
          <div className="absolute inset-0 bg-gradient-to-br from-stearns-dark via-[#0f2e1c] to-stearns-dark" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_50%,rgba(28,89,55,0.35),transparent_70%)]" />
        </>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 50% 70% at ${reverse ? '25%' : '75%'} 50%, rgba(28,89,55,0.22), transparent 65%)`,
          }}
        />
      )}

      <div
        className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10 lg:gap-16 items-center ${
          reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'
        }`}
      >
        {/* Copy */}
        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <p className="text-stearns-gold text-xs font-bold tracking-[0.3em] uppercase mb-5">
            {label}
          </p>

          <h2
            className="font-black text-white font-display mb-6"
            style={{ fontSize: 'clamp(2rem,4vw,3.4rem)' }}
          >
            <MaskLine scrollTriggered>{titleWords.slice(0, splitAt).join(' ')}</MaskLine>
            {titleWords.length > splitAt && (
              <MaskLine scrollTriggered delay={0.1} className="text-stearns-green-light">
                {titleWords.slice(splitAt).join(' ')}
              </MaskLine>
            )}
          </h2>

          <div ref={copyRef} className="space-y-4 max-w-xl mx-auto lg:mx-0">
            {loading ? (
              <>
                <div className="h-4 rounded bg-white/10 animate-pulse" />
                <div className="h-4 rounded bg-white/10 animate-pulse w-5/6 mx-auto lg:mx-0" />
                <div className="h-4 rounded bg-white/10 animate-pulse w-2/3 mx-auto lg:mx-0" />
              </>
            ) : (
              paragraphs.map((text) => (
                <p key={text.slice(0, 40)} className="text-white/60 leading-relaxed">
                  {text}
                </p>
              ))
            )}
            {to && (
              <div className="pt-3">
                <Link
                  to={to}
                  className="group inline-flex items-center gap-2 border border-white/25 text-white/80 px-6 py-3 rounded-full font-semibold text-sm hover:border-stearns-green-light hover:text-stearns-green-light transition-all duration-300"
                >
                  Learn More
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Model(s) */}
        <div className="w-full lg:w-1/2">{children}</div>
      </div>
    </section>
  );
}
