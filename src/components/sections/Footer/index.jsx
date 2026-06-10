import { Phone } from 'lucide-react';
import { LOGO_URL, PHONE_DISPLAY, PHONE_TEL } from '@/lib/constants';

const FOOTER_LINKS = [
  { label: 'Home', href: '#hero-section' },
  { label: 'Services', href: '#google-ads-section' },
  { label: 'Contact Us', href: '#contact' },
];

export function Footer() {
  return (
    <footer className="relative w-full bg-stearns-ink text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo — served from the live site's media library */}
          <a href="#hero-section" aria-label="Stearns Media — back to top">
            <img
              src={LOGO_URL}
              alt="Stearns Media"
              className="h-8 w-auto brightness-0 invert"
            />
          </a>

          <nav className="flex items-center gap-8">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-white/60 hover:text-white transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <a
            href={PHONE_TEL}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-stearns-gold transition-colors duration-200"
          >
            <Phone size={15} />
            {PHONE_DISPLAY}
          </a>
        </div>

        <div className="mt-10 pt-8 border-t border-white/10 text-center">
          <p className="text-white/40 text-xs tracking-wide">
            © 2026 Stearns Media
          </p>
        </div>
      </div>
    </footer>
  );
}
