import { Phone } from 'lucide-react';
import { LOGO_URL, PHONE_DISPLAY, PHONE_TEL } from '@/lib/constants';

const NAV_LINKS = [
  { label: 'Home', href: '#hero-section' },
  { label: 'Services', href: '#google-ads-section' },
  { label: 'Contact Us', href: '#contact' },
];

export function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/85 backdrop-blur-md border-b border-stearns-green/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="#hero-section" aria-label="Stearns Media — home">
          <img src={LOGO_URL} alt="Stearns Media" className="h-7 w-auto" />
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-stearns-ink/70 hover:text-stearns-green transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href={PHONE_TEL}
          className="inline-flex items-center gap-2 text-sm font-semibold text-stearns-green hover:text-stearns-green-mid transition-colors duration-200"
        >
          <Phone size={15} />
          <span className="hidden sm:inline">{PHONE_DISPLAY}</span>
        </a>
      </div>
    </header>
  );
}
