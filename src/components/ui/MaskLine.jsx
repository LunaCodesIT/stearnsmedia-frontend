import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

// Line-mask reveal: the child slides up from behind an overflow clip.
// Pass `scrollTriggered` to fire when scrolled into view instead of on mount.
export function MaskLine({ children, delay = 0, className = '', scrollTriggered = false }) {
  const innerRef = useRef(null);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const tween = gsap.fromTo(
      el,
      { yPercent: 108 },
      {
        yPercent: 0,
        duration: 1.15,
        ease: 'expo.out',
        delay,
        scrollTrigger: scrollTriggered
          ? { trigger: el, start: 'top 90%', once: true }
          : undefined,
      }
    );
    return () => tween.kill();
  }, [delay, scrollTriggered]);

  return (
    <span className={`block overflow-hidden leading-[0.98] ${className}`}>
      <span ref={innerRef} className="block" style={{ willChange: 'transform' }}>
        {children}
      </span>
    </span>
  );
}
