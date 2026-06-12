import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { useServicePage } from '@/hooks/useServicePage';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { MaskLine } from '@/components/ui/MaskLine';
import { SectionModel } from '@/components/three/SectionModel';
import { SocialLogoCluster } from '@/components/three/SocialLogoCluster';

function ServiceModel({ service }) {
  if (service.model === 'cluster') {
    return <SocialLogoCluster className="h-[280px] sm:h-[340px] lg:h-[440px]" />;
  }
  if (service.model === 'design-duo') {
    return (
      <div className="relative h-[280px] sm:h-[340px] lg:h-[440px]">
        <SectionModel
          src="/models/Graphic_Design_Brush.glb"
          fit={1.9}
          rotation={[0.1, 0.45, 0]}
          yOffset={-0.06}
          className="absolute inset-0"
        />
        <SectionModel
          src="/models/Graphics_Laptop.glb"
          fit={1.4}
          rotation={[0.12, 0.25, 0]}
          className="absolute inset-0 z-10"
        />
      </div>
    );
  }
  return (
    <SectionModel
      src={service.model.src}
      fit={service.model.fit}
      rotation={service.model.rotation}
      yOffset={service.model.yOffset}
      className="h-[280px] sm:h-[340px] lg:h-[440px]"
    />
  );
}

export function ServicePage() {
  const { slug } = useParams();
  const { service, title, blocks, loading, error } = useServicePage(slug);

  const firstParagraph = blocks.find((b) => b.type === 'p')?.text || '';
  useDocumentMeta(
    service ? `${service.name} | Stearns Media` : 'Stearns Media',
    firstParagraph.slice(0, 155)
  );

  if (!service) return <Navigate to="/" replace />;

  const heading = title || service.name;
  const words = heading.split(' ');
  const splitAt = Math.ceil(words.length / 2);

  return (
    <main className="relative">
      {/* Hero — same black-to-green wash as the homepage */}
      <section className="relative pt-32 pb-12 lg:pt-40 lg:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-stearns-dark via-[#0f2e1c] to-stearns-dark" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(28,89,55,0.35),transparent_70%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-10">
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <p className="text-stearns-gold text-xs font-bold tracking-[0.3em] uppercase mb-5">
              Our Services
            </p>
            <h1 className="font-black text-white font-display" style={{ fontSize: 'clamp(2.4rem,5vw,4.2rem)' }}>
              <MaskLine>{words.slice(0, splitAt).join(' ')}</MaskLine>
              {words.length > splitAt && (
                <MaskLine delay={0.12} className="text-stearns-green-light">
                  {words.slice(splitAt).join(' ')}
                </MaskLine>
              )}
            </h1>
          </div>
          <div className="w-full lg:w-1/2">
            <ServiceModel service={service} />
          </div>
        </div>
      </section>

      {/* Content from the WP service page */}
      <section className="relative bg-stearns-dark pb-20 lg:pb-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading && (
            <div className="space-y-4 pt-6">
              <div className="h-4 rounded bg-white/10 animate-pulse" />
              <div className="h-4 rounded bg-white/10 animate-pulse w-5/6" />
              <div className="h-4 rounded bg-white/10 animate-pulse w-2/3" />
            </div>
          )}
          {error && (
            <p className="text-white/50 pt-6">
              This page&apos;s content is temporarily unavailable — please{' '}
              <Link to="/#contact" className="text-stearns-green-light underline">get in touch</Link>.
            </p>
          )}

          {blocks.map((block, i) => {
            if (block.type === 'heading') {
              return (
                <h2 key={i} className="font-display font-bold text-white text-xl sm:text-2xl mt-10 mb-4">
                  {block.text}
                </h2>
              );
            }
            if (block.type === 'list') {
              return (
                <ul key={i} className="my-5 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-2">
                  {block.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-white/65">
                      <Check size={16} className="text-stearns-green-light mt-1 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              );
            }
            if (block.type === 'price') {
              return (
                <p key={i} className="mt-5 flex items-baseline gap-3">
                  <span className="text-stearns-green-light font-display font-bold text-2xl">
                    R{block.current}
                  </span>
                  <span className="text-white/35 line-through text-sm">R{block.original}</span>
                </p>
              );
            }
            if (block.type === 'table') {
              return (
                <div
                  key={i}
                  className="wp-table my-8 overflow-x-auto"
                  // TablePress markup from the WP REST API (sanitised: scripts stripped)
                  dangerouslySetInnerHTML={{ __html: block.html }}
                />
              );
            }
            return (
              <p key={i} className="text-white/60 leading-relaxed mt-4">
                {block.text}
              </p>
            );
          })}

          {/* CTA */}
          <div className="mt-14 flex flex-wrap items-center gap-5">
            <Link
              to="/#contact"
              className="group inline-flex items-center gap-2 bg-stearns-green text-white px-7 py-3.5 rounded-full font-bold text-sm hover:shadow-[0_8px_30px_rgba(28,89,55,0.4)] transition-shadow duration-300"
            >
              Get a Quote
              <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-stearns-green transition-all duration-300">
                <ArrowRight size={14} />
              </span>
            </Link>
            <Link
              to="/packages"
              className="inline-flex items-center gap-2 border border-white/25 text-white/80 px-7 py-3.5 rounded-full font-semibold text-sm hover:border-stearns-green-light hover:text-stearns-green-light transition-all duration-300"
            >
              View All Packages
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
