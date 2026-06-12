import { useEffect, useState } from 'react';

// True while `ref` is within rootMargin of the viewport. Used to mount WebGL
// canvases only when (nearly) visible: browsers cap live WebGL contexts and
// evict the oldest when exceeded — which intermittently killed the globe
// canvas after route navigation. Off-screen canvases also waste GPU frames.
export function useNearViewport(ref, rootMargin = '120% 0px 120% 0px') {
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => setNear(entry.isIntersecting),
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);

  return near;
}
