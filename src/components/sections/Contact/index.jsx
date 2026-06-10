import { useEffect, useRef } from 'react';
import Cal from '@calcom/embed-react';
import { Loader2, Send } from 'lucide-react';
import { gsap } from '@/lib/gsap';
import { useContactForm } from '@/hooks/useContactForm';
import { MaskLine } from '@/components/ui/MaskLine';
import { CAL_LINK } from '@/lib/constants';

const INPUT_CLASS =
  'w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-stearns-green-light focus:ring-2 focus:ring-stearns-green/30 transition-colors';

export function Contact() {
  const { fields, status, error, handleChange, handleSubmit } = useContactForm();
  const sectionRef = useRef(null);
  const colsRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        colsRef.current?.children || [],
        { y: 36, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: colsRef.current, start: 'top 82%', once: true },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative w-full bg-stearns-dark py-20 lg:py-28 overflow-hidden"
    >
      {/* Same black-to-green wash as the hero */}
      <div className="absolute inset-0 bg-gradient-to-br from-stearns-dark via-[#0f2e1c] to-stearns-dark" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_50%,rgba(28,89,55,0.35),transparent_70%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-stearns-gold text-xs font-bold tracking-[0.3em] uppercase mb-5">
            Contact &amp; Booking
          </p>
          <h2 className="font-black text-white font-display" style={{ fontSize: 'clamp(2.2rem,4.5vw,4rem)' }}>
            <MaskLine scrollTriggered>Let&apos;s grow</MaskLine>
            <MaskLine scrollTriggered delay={0.1} className="text-stearns-green-light">
              your business.
            </MaskLine>
          </h2>
        </div>

        <div ref={colsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Contact form */}
          <form onSubmit={handleSubmit} noValidate className="bg-white/5 rounded-2xl border border-white/10 p-6 sm:p-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Name"
                autoComplete="name"
                value={fields.name}
                onChange={handleChange}
                className={INPUT_CLASS}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                autoComplete="email"
                value={fields.email}
                onChange={handleChange}
                className={INPUT_CLASS}
              />
            </div>
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              autoComplete="tel"
              value={fields.phone}
              onChange={handleChange}
              className={INPUT_CLASS}
            />
            <textarea
              name="message"
              placeholder="Tell us about your project…"
              rows={5}
              value={fields.message}
              onChange={handleChange}
              className={`${INPUT_CLASS} resize-none`}
            />

            {status === 'error' && (
              <p className="text-sm text-red-400" role="alert">{error}</p>
            )}
            {status === 'success' && (
              <p className="text-sm text-stearns-green-light font-medium" role="status">
                Thanks — your message is on its way. We&apos;ll be in touch shortly.
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="group inline-flex items-center gap-2 bg-stearns-green text-white px-7 py-3.5 rounded-full font-bold text-sm hover:shadow-[0_8px_30px_rgba(28,89,55,0.4)] transition-shadow duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === 'submitting' ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Send size={15} />
              )}
              {status === 'submitting' ? 'Sending…' : 'Send Message'}
            </button>
          </form>

          {/*
            Cal.com booking embed.
            NOTE FOR THE CLIENT: "stearnsmedia/discovery-call" is a placeholder
            event slug. The client must create a "discovery-call" event type in
            their own Cal.com account (under the "stearnsmedia" username) and
            connect their calendar before this embed will accept bookings. The
            slug is configurable via VITE_CAL_LINK without touching this file.
          */}
          <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden min-h-[520px]">
            <div className="px-6 sm:px-8 pt-6">
              <h3 className="font-display font-bold text-white text-lg">
                Book a discovery call
              </h3>
              <p className="text-white/55 text-sm mt-1">
                Pick a time that suits you — no commitment.
              </p>
            </div>
            <Cal
              calLink={CAL_LINK}
              style={{ width: '100%', height: '100%', minHeight: '460px' }}
              config={{ layout: 'month_view', theme: 'dark' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
