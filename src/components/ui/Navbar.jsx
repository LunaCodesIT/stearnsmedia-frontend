import { Link } from 'react-router-dom';
import { Phone } from 'lucide-react';
import { useScrolled } from '@/hooks/useScrolled';
import { LOGO_URL, PHONE_DISPLAY, PHONE_TEL } from '@/lib/constants';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Packages', to: '/packages' },
  { label: 'Contact Us', to: '/#contact' },
];

export function Navbar() {
  const scrolled = useScrolled();

  return (
    // Transparent over the hero gradient at the top of the page; turns into a
    // dark translucent blurred bar once the user scrolls.
    <header
      className={`fixed top-0 inset-x-0 z-50 border-b transition-colors duration-300 ${
        scrolled
          ? 'bg-stearns-dark/80 backdrop-blur-md border-white/10'
          : 'bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" aria-label="Stearns Media — home">
          <img src={LOGO_URL} alt="Stearns Media" className="h-7 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-sm font-medium text-white/70 hover:text-stearns-green-light transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <a
          href={PHONE_TEL}
          className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-stearns-gold transition-colors duration-200"
        >
          <Phone size={15} />
          <span className="hidden sm:inline">{PHONE_DISPLAY}</span>
        </a>
      </div>
    </header>
  );
}
