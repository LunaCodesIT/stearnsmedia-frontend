import { useEffect, useState } from 'react';
import { fixBrandName } from '@/hooks/useWpPage';
import { getPage, getServicesOverviewPage } from '@/services/wordpress';
import { SERVICES, WEBSITE_DESIGN_CHILD_IDS } from '@/lib/constants';

const PRICE_ROW = /price|contract option/i;

const cellText = (el) => fixBrandName(el.textContent.replace(/\s+/g, ' ').trim());

// "R700 setup + R530/mo × 11 Own the site afterwards…" → "R700 setup + R530/mo × 11"
function tidyPrice(raw, rowLabel) {
  if (!raw || raw === '—' || raw === '-') return null;
  const m = raw.match(/R\s?[\d,]+(?:\s*setup\s*\+\s*R\s?[\d,]+\s*\/?\s*mo(?:\s*×\s*\d+)?)?(?:\s*\/\s*month)?/i);
  let price = m ? m[0].replace(/\s+/g, ' ').trim() : raw.slice(0, 40);
  if (/once-off/i.test(rowLabel) && !/once|month|\/mo/i.test(price)) price += ' once-off';
  else if (/monthly price/i.test(rowLabel) && !/month|\/mo/i.test(price)) price += ' / month';
  else if (/contract option/i.test(rowLabel)) price += ' (12-month plan)';
  return price;
}

// Parse a WP "Packages — Feature Comparison" table into [{ name, price }]:
// header row = package names, first row matching PRICE_ROW = prices.
function parsePackages(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const table = doc.querySelector('table');
  if (!table) return [];
  const rows = [...table.querySelectorAll('tr')];
  if (!rows.length) return [];
  const names = [...rows[0].querySelectorAll('th, td')].map(cellText).slice(1);
  const priceRow = rows.find((r) => PRICE_ROW.test(cellText(r.querySelector('th, td') || r)));
  const label = priceRow ? cellText(priceRow.querySelector('th, td')) : '';
  const prices = priceRow ? [...priceRow.querySelectorAll('th, td')].map(cellText).slice(1) : [];
  const hasCustom = /<h[2-4][^>]*>[^<]*custom/i.test(html);
  const packages = names
    .filter(Boolean)
    .map((name, i) => ({ name, price: tidyPrice(prices[i], label) || 'Quote on request' }));
  if (hasCustom) packages.push({ name: 'Custom Package', price: 'Quote on request' });
  return packages;
}

function introFrom(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  for (const p of doc.querySelectorAll('p')) {
    const t = cellText(p);
    if (t.length > 60) return t;
  }
  return '';
}

// The Packages page: an intro from the WP Services overview, plus structured
// {name, price} packages parsed from each service's real comparison table.
export function usePackages() {
  const [state, setState] = useState({ intro: '', services: [], loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    const fetches = SERVICES.map((s) =>
      s.slug === 'website-design'
        ? Promise.all(WEBSITE_DESIGN_CHILD_IDS.map((id) => getPage(id)))
        : getPage(s.wpId)
    );
    // allSettled + tagline fallback: the WP host rate-limits request bursts,
    // and a failed fetch must never blank the page
    Promise.allSettled([getServicesOverviewPage(), ...fetches]).then(([overview, ...results]) => {
      if (cancelled) return;
      const intro =
        overview.status === 'fulfilled' ? introFrom(overview.value.content?.rendered || '') : '';
      const services = SERVICES.map((s, i) => {
        if (results[i].status !== 'fulfilled') return { ...s, packages: [], fallback: s.tagline };
        const pages = Array.isArray(results[i].value) ? results[i].value : [results[i].value];
        const packages = pages.flatMap((p) => parsePackages(p.content?.rendered || ''));
        // a combined page set should only list "Custom Package" once, last
        const customs = packages.filter((p) => /^custom/i.test(p.name));
        const regular = packages.filter((p) => !/^custom/i.test(p.name));
        return {
          ...s,
          packages: customs.length ? [...regular, customs[0]] : regular,
          fallback: packages.length ? '' : s.tagline,
        };
      });
      setState({ intro, services, loading: false, error: null });
    });
    return () => { cancelled = true; };
  }, []);

  return state;
}
