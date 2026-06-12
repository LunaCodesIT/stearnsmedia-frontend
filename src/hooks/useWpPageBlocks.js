import { useEffect, useState } from 'react';
import { fixBrandName, decodeWpTitle } from '@/hooks/useWpPage';

const SKIP_TEXT = new Set(['get a quote', 'home', 'get in touch', 'contact us']);

// Structured version of useWpPage for full pages: walks the rendered WP
// content and returns ordered blocks — headings, paragraphs, lists, and
// tables (TablePress output kept as sanitised HTML).
export function extractBlocks(html) {
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
    // WooCommerce product blocks render as "ROld Original price was… RNew
    // Current price is… Add to cart" — turn them into clean price blocks
    const priceMatch = text.match(/Original price was:\s*R\s?([\d.,]+?)\.?\s*R.*?Current price is:\s*R\s?([\d.,]+?)\.(?:\s|Add|$)/i);
    if (!isHeading && priceMatch) {
      blocks.push({ type: 'price', original: priceMatch[1], current: priceMatch[2] });
      return;
    }
    if (!isHeading && /add to cart/i.test(text)) return; // Woo leftovers
    // Some WP paragraphs are really lists with inline "•" bullets — split them
    if (!isHeading && (text.match(/•/g) || []).length >= 2) {
      const items = text.split('•').map((t) => t.trim()).filter((t) => t.length > 2);
      blocks.push({ type: 'list', items });
      return;
    }
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
