import { useEffect, useState } from 'react';
import { refreshScrollTriggersSoon } from '@/lib/gsap';

// Strip an Elementor-rendered WP page down to clean copy: decoded title plus
// the first few meaningful paragraphs of body text.
function decodeEntities(str) {
  const el = document.createElement('textarea');
  el.innerHTML = str;
  return el.value;
}

// The live WP copy occasionally misspells the brand (e.g. "Stern Media" on
// the Graphic Design page) — normalise every variant to "Stearns Media"
export function fixBrandName(text) {
  return text.replace(/\b(?:Stern|Sterns|Stearn|Strearns?)(?=\s+Media\b)/gi, 'Stearns');
}

export function decodeWpTitle(title) {
  const el = document.createElement('textarea');
  el.innerHTML = title || '';
  return fixBrandName(el.value);
}

function extractParagraphs(html, max = 3) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const seen = new Set();
  const out = [];
  for (const p of doc.querySelectorAll('p, h2, h3')) {
    const text = fixBrandName(p.textContent.replace(/\s+/g, ' ').trim());
    if (text.length < 40 || seen.has(text)) continue; // skip stubs/duplicates
    seen.add(text);
    out.push(text);
    if (out.length >= max) break;
  }
  return out;
}

// Shared data hook: fetches a WP page via the given service function and
// exposes { title, paragraphs, loading, error }. Each section's own hook
// wraps this with its specific service call, so sections stay independent.
export function useWpPage(fetchPage, { paragraphCount = 3 } = {}) {
  const [state, setState] = useState({
    title: '',
    paragraphs: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    fetchPage()
      .then((page) => {
        if (cancelled) return;
        setState({
          title: fixBrandName(decodeEntities(page.title?.rendered || '')),
          paragraphs: extractParagraphs(page.content?.rendered || '', paragraphCount),
          loading: false,
          error: null,
        });
        // section heights change once copy lands — re-measure scroll triggers
        refreshScrollTriggersSoon();
      })
      .catch((error) => {
        if (cancelled) return;
        setState((s) => ({ ...s, loading: false, error }));
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
