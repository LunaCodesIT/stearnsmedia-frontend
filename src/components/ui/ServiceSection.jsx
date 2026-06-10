import { useEffect, useRef } from 'react';
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
      className="relative w-full bg-stearns-light py-20 lg:py-28 overflow-hidden"
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 50% 70% at ${reverse ? '25%' : '75%'} 50%, rgba(28,89,55,0.06), transparent 65%)`,
        }}
      />

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
            className="font-black text-stearns-ink font-display mb-6"
            style={{ fontSize: 'clamp(2rem,4vw,3.4rem)' }}
          >
            <MaskLine scrollTriggered>{titleWords.slice(0, splitAt).join(' ')}</MaskLine>
            {titleWords.length > splitAt && (
              <MaskLine scrollTriggered delay={0.1} className="text-stearns-green">
                {titleWords.slice(splitAt).join(' ')}
              </MaskLine>
            )}
          </h2>

          <div ref={copyRef} className="space-y-4 max-w-xl mx-auto lg:mx-0">
            {loading ? (
              <>
                <div className="h-4 rounded bg-stearns-ink/5 animate-pulse" />
                <div className="h-4 rounded bg-stearns-ink/5 animate-pulse w-5/6 mx-auto lg:mx-0" />
                <div className="h-4 rounded bg-stearns-ink/5 animate-pulse w-2/3 mx-auto lg:mx-0" />
              </>
            ) : (
              paragraphs.map((text) => (
                <p key={text.slice(0, 40)} className="text-stearns-ink/60 leading-relaxed">
                  {text}
                </p>
              ))
            )}
          </div>
        </div>

        {/* Model(s) */}
        <div className="w-full lg:w-1/2">{children}</div>
      </div>
    </section>
  );
}
