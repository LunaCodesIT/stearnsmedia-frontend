import { useEffect, useMemo, useState } from 'react';
import { extractBlocks } from '@/hooks/useWpPageBlocks';
import { decodeWpTitle } from '@/hooks/useWpPage';
import { getPage } from '@/services/wordpress';
import { SERVICES, WEBSITE_DESIGN_CHILD_IDS } from '@/lib/constants';

// Clean up a WP service page's block list for display:
//  - drop the page's own trailing CTA blocks (the frontend renders its own)
//  - hoist the "Packages — Feature Comparison" heading + table up to just
//    after the intro, so pricing is visible without scrolling the whole page
function prepareServiceBlocks(blocks) {
  let bs = blocks.filter(
    (b) => !(b.type === 'heading' && /ready to get started|get in touch with us today/i.test(b.text))
  );

  const headingIdx = bs.findIndex((b) => b.type === 'heading' && /comparison/i.test(b.text));
  if (headingIdx === -1) return bs;
  let end = headingIdx + 1;
  while (end < bs.length && bs[end].type !== 'heading') end += 1;
  const segment = bs.slice(headingIdx, end);
  bs = [...bs.slice(0, headingIdx), ...bs.slice(end)];

  // insert before the second heading — i.e. right after the intro block run
  let headings = 0;
  let insertAt = bs.length;
  for (let i = 0; i < bs.length; i += 1) {
    if (bs[i].type === 'heading') {
      headings += 1;
      if (headings === 2) {
        insertAt = i;
        break;
      }
    }
  }
  return [...bs.slice(0, insertAt), ...segment, ...bs.slice(insertAt)];
}

// Data for one service detail page, looked up by route slug. Website Design's
// real content (and pricing) lives on its two WP child pages, so those are
// fetched and appended as sections.
export function useServicePage(slug) {
  const service = useMemo(() => SERVICES.find((s) => s.slug === slug) || null, [slug]);
  const [state, setState] = useState({ title: '', blocks: [], loading: true, error: null });

  useEffect(() => {
    if (!service) return undefined;
    let cancelled = false;
    setState({ title: '', blocks: [], loading: true, error: null });

    const childIds = service.slug === 'website-design' ? WEBSITE_DESIGN_CHILD_IDS : [];
    Promise.all([getPage(service.wpId), ...childIds.map((id) => getPage(id))])
      .then(([parent, ...children]) => {
        if (cancelled) return;
        const blocks = [
          ...prepareServiceBlocks(extractBlocks(parent.content?.rendered || '')),
          ...children.flatMap((child) => [
            { type: 'heading', text: decodeWpTitle(child.title?.rendered) },
            ...prepareServiceBlocks(extractBlocks(child.content?.rendered || '')),
          ]),
        ];
        setState({
          title: decodeWpTitle(parent.title?.rendered),
          blocks,
          loading: false,
          error: null,
        });
      })
      .catch((error) => {
        if (cancelled) return;
        setState((s) => ({ ...s, loading: false, error }));
      });
    return () => { cancelled = true; };
  }, [service]);

  return { service, ...state };
}
