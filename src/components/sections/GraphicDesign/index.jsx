import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useGraphicDesign } from '@/hooks/useGraphicDesign';
import { MaskLine } from '@/components/ui/MaskLine';
import { SectionModel } from '@/components/three/SectionModel';

// Custom three-column layout (desktop): Graphics_Tablet | copy | Graphics_Card.
// On mobile the copy leads and the two models sit side by side beneath it.
export function GraphicDesign() {
  const { title, paragraphs, loading } = useGraphicDesign();
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

  const heading = title || 'Graphic Design';
  const words = heading.split(' ');
  const splitAt = Math.ceil(words.length / 2);

  return (
    <section
      ref={sectionRef}
      id="graphic-design-section"
      className="relative w-full bg-stearns-dark py-20 lg:py-28 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_70%_at_50%_50%,rgba(28,89,55,0.18),transparent_70%)]" />

      <div className="relative max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-2 lg:grid-cols-[1fr_1.3fr_1fr] gap-x-10 gap-y-14 lg:gap-x-16 items-center">
        {/* Laptop — left of the copy on desktop */}
        <div className="order-2 lg:order-1">
          <SectionModel
            src="/models/Graphics_Laptop.glb"
            fit={1.3}
            rotation={[0.15, -0.35, 0]}
            yOffset={-0.12}
            className="h-[220px] sm:h-[280px] lg:h-[420px]"
          />
        </div>

        {/* Copy — centre column */}
        <div className="order-1 lg:order-2 col-span-2 lg:col-span-1 text-center">
          <p className="text-stearns-gold text-xs font-bold tracking-[0.3em] uppercase mb-5">
            Creative Studio
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

          <div ref={copyRef} className="space-y-4 max-w-lg mx-auto">
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

        {/* Paint brush — right of the copy on desktop */}
        <div className="order-3">
          <SectionModel
            src="/models/Graphic_Design_Brush.glb"
            fit={1.5}
            rotation={[0.1, 0.4, 0]}
            className="h-[220px] sm:h-[280px] lg:h-[420px]"
          />
        </div>
      </div>
    </section>
  );
}
