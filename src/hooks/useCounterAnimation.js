import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

// Animated count-up: attach the returned ref to the element that displays the
// number. When it scrolls into view, its textContent counts from 0 to `target`
// (with optional suffix, e.g. "+"). Imperative textContent updates — no React
// re-render per tick.
export function useCounterAnimation(target, { duration = 2, suffix = '+', start = 'top 85%' } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const counter = { value: 0 };
    const tween = gsap.to(counter, {
      value: target,
      duration,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start, once: true },
      onUpdate: () => {
        el.textContent = `${Math.round(counter.value)}${suffix}`;
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [target, duration, suffix, start]);

  return ref;
}
