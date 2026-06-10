import { useCounterAnimation } from '@/hooks/useCounterAnimation';

// One animated stat: big counting number + label. Counting behaviour comes
// entirely from useCounterAnimation.
export function StatCounter({ value, label, numberClass = 'text-stearns-green', labelClass = 'text-stearns-ink/55' }) {
  const counterRef = useCounterAnimation(value);

  return (
    <div className="text-center">
      <p
        ref={counterRef}
        className={`font-display font-black text-[clamp(2.6rem,6vw,4.5rem)] leading-none mb-3 ${numberClass}`}
      >
        0+
      </p>
      <p className={`text-sm sm:text-base font-medium tracking-wide uppercase ${labelClass}`}>
        {label}
      </p>
    </div>
  );
}
