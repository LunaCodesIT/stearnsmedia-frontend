import { useEffect, useState } from 'react';
import { fixBrandName, decodeWpTitle } from '@/hooks/useWpPage';

const SKIP_TEXT = new Set(['get a quote', 'home', 'get in touch', 'contact us']);

// Structured version of useWpPage for full pages: walks the rendered WP
// content and returns ordered blocks — headings, paragraphs, lists, and
// tables (TablePress output kept as sanitised HTML).
function extractBlocks(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  // strip scripts/styles before reading anything
  doc.querySelectorAll('script, style').forEach((el) => el.remove());
  const blocks = [];
  const seen = new Set();

  doc.querySelectorAll('h2, h3, h4, p, ul, ol, table').forEach((el) => {
    if (el.closest('table') && el.tagName !== 'TABLE') return; // table innards come with the table
    if (el.tagName === 'UL' || el.tagName === 'OL') {
      if (el.querySelector('ul, ol, table')) return; // skip wrapper/menu lists
      const items = [...el.querySelectorAll('li')]
        .map((li) => fixBrandName(li.textContent.replace(/\s+/g, ' ').trim()))
        .filter((t) => t.length > 2 && t.length < 220);
      if (items.length) blocks.push({ type: 'list', items });
      return;
    }
    if (el.tagName === 'TABLE') {
      blocks.push({ type: 'table', html: fixBrandName(el.outerHTML) });
      return;
    }
    const text = fixBrandName(el.textContent.replace(/\s+/g, ' ').trim());
    if (!text || SKIP_TEXT.has(text.toLowerCase()) || seen.has(text)) return;
    const isHeading = el.tagName !== 'P';
    if (!isHeading && text.length < 30) return; // stubs/buttons
    seen.add(text);
    blocks.push({ type: isHeading ? 'heading' : 'p', text });
  });
  return blocks;
}

export function useWpPageBlocks(fetchPage) {
  const [state, setState] = useState({ title: '', blocks: [], loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState({ title: '', blocks: [], loading: true, error: null });
    fetchPage()
      .then((page) => {
        if (cancelled) return;
        setState({
          title: decodeWpTitle(page.title?.rendered),
          blocks: extractBlocks(page.content?.rendered || ''),
          loading: false,
          error: null,
        });
      })
      .catch((error) => {
        if (cancelled) return;
        setState((s) => ({ ...s, loading: false, error }));
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchPage]);

  return state;
}
