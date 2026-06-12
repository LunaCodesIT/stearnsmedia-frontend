import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { usePackages } from '@/hooks/usePackages';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { MaskLine } from '@/components/ui/MaskLine';

export function PackagesPage() {
  const { intro, services, loading } = usePackages();
  useDocumentMeta(
    'Packages | Stearns Media',
    'Digital marketing packages from Stearns Media — Google Ads, SEO, Social Media, Web Design, Graphic Design, and Analytics.'
  );

  return (
    <main className="relative">
      {/* Hero */}
      <section className="relative pt-32 pb-14 lg:pt-40 lg:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-stearns-dark via-[#0f2e1c] to-stearns-dark" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(28,89,55,0.35),transparent_70%)]" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-stearns-gold text-xs font-bold tracking-[0.3em] uppercase mb-5">
            Packages
          </p>
          <h1 className="font-black text-white font-display mb-6" style={{ fontSize: 'clamp(2.4rem,5vw,4.2rem)' }}>
            <MaskLine>Plans built for</MaskLine>
            <MaskLine delay={0.12} className="text-stearns-green-light">
              every stage of growth.
            </MaskLine>
          </h1>
          {intro && <p className="text-white/60 leading-relaxed max-w-2xl mx-auto">{intro}</p>}
        </div>
      </section>

      {/* Per-service package cards */}
      <section className="relative bg-stearns-dark pt-10 sm:pt-12 lg:pt-16 pb-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
          {loading &&
            Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-7 space-y-3">
                <div className="h-5 w-1/2 rounded bg-white/10 animate-pulse" />
                <div className="h-4 rounded bg-white/10 animate-pulse" />
                <div className="h-4 rounded bg-white/10 animate-pulse w-5/6" />
              </div>
            ))}

          {services.map((service) => (
            <article
              key={service.slug}
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-7 flex flex-col hover:border-stearns-green-light/50 transition-colors duration-300"
            >
              <h2 className="font-display font-bold text-white text-xl mb-5">{service.name}</h2>
              <div className="flex-1 divide-y divide-white/8">
                {service.packages.map((pkg) => (
                  <div
                    key={pkg.name}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2.5"
                  >
                    <span className="text-white/75 text-sm">{pkg.name}</span>
                    <span
                      className={`text-sm font-semibold text-right ${
                        pkg.price === 'Quote on request' ? 'text-white/40' : 'text-stearns-green-light'
                      }`}
                    >
                      {pkg.price}
                    </span>
                  </div>
                ))}
                {service.fallback && (
                  <p className="text-white/55 text-sm leading-relaxed py-2.5">{service.fallback}</p>
                )}
              </div>
              <Link
                to={`/services/${service.slug}`}
                className="mt-6 inline-flex items-center gap-2 text-stearns-green-light font-semibold text-sm hover:gap-3 transition-all duration-200"
              >
                View {service.name} details
                <ArrowRight size={15} />
              </Link>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 text-center">
          <Link
            to="/#contact"
            className="group inline-flex items-center gap-2 bg-stearns-green text-white px-8 py-4 rounded-full font-bold text-sm hover:shadow-[0_8px_30px_rgba(28,89,55,0.4)] transition-shadow duration-300"
          >
            Get a Custom Quote
            <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-stearns-green transition-all duration-300">
              <ArrowRight size={14} />
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
