import { useEffect, useState } from 'react';
import { fixBrandName } from '@/hooks/useWpPage';
import { getPage, getServicesOverviewPage } from '@/services/wordpress';
import { SERVICES } from '@/lib/constants';

const PACKAGE_HINT = /package|once-off|monthly|per month|setup|consult/i;

function paragraphsFrom(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return [...doc.querySelectorAll('p')]
    .map((p) => fixBrandName(p.textContent.replace(/\s+/g, ' ').trim()))
    .filter((t) => t.length > 40);
}

// Aggregates the Packages page: an intro from the WP Services overview page,
// plus each service's package-describing copy from its own WP page.
export function usePackages() {
  const [state, setState] = useState({ intro: '', services: [], loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    // allSettled + per-service tagline fallback: the WP host rate-limits
    // bursts, so a failed fetch must never blank the whole page
    Promise.allSettled([getServicesOverviewPage(), ...SERVICES.map((s) => getPage(s.wpId))])
      .then(([overview, ...pages]) => {
        if (cancelled) return;
        const intro =
          overview.status === 'fulfilled'
            ? paragraphsFrom(overview.value.content?.rendered || '')[0] || ''
            : '';
        const services = SERVICES.map((s, i) => {
          if (pages[i].status !== 'fulfilled') return { ...s, paragraphs: [s.tagline] };
          const paras = paragraphsFrom(pages[i].value.content?.rendered || '');
          const seen = new Set();
          const packageParas = paras
            .filter((t) => PACKAGE_HINT.test(t) && !seen.has(t) && seen.add(t))
            .slice(0, 3);
          return {
            ...s,
            paragraphs: packageParas.length ? packageParas : paras.slice(0, 2) || [s.tagline],
          };
        });
        setState({ intro, services, loading: false, error: null });
      });
    return () => { cancelled = true; };
  }, []);

  return state;
}
