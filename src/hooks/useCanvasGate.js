import { useEffect, useState } from 'react';

// Visibility gating for a section's WebGL canvas, returning two signals:
//   mounted — latches true once the element first comes within `mountMargin`
//     of the viewport, then stays true. Controls whether the <Canvas> exists.
//     Latching means the WebGL context is created once on approach and never
//     destroyed, so scrolling back never pays for context recreation.
//   visible — live; true only while the element is actually on screen.
//     Drives the canvas frameloop so off-screen (but mounted) canvases pause
//     rendering instead of burning GPU/battery every frame.
export function useCanvasGate(ref, { mountMargin = '200%', visMargin = '0px' } = {}) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const mountIO = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setMounted(true);
          mountIO.disconnect();
        }
      },
      { rootMargin: `${mountMargin} 0px ${mountMargin} 0px` }
    );
    const visIO = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), {
      rootMargin: `${visMargin} 0px ${visMargin} 0px`,
    });

    mountIO.observe(el);
    visIO.observe(el);
    return () => {
      mountIO.disconnect();
      visIO.disconnect();
    };
  }, [ref, mountMargin, visMargin]);

  return { mounted, visible };
}
