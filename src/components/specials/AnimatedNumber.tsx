import { useEffect, useRef, useState } from 'react';

interface Props {
  value: number | string;
  decimals?: number;
}

export function AnimatedNumber({ value, decimals = 0 }: Props) {
  const numValue = typeof value === 'number' ? value : parseFloat(String(value));
  const spanRef = useRef<HTMLSpanElement>(null);
  const [displayed, setDisplayed] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (isNaN(numValue)) return;
    started.current = false;
    setDisplayed(0);

    const el = spanRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          observer.disconnect();
          const duration = 900;
          const start = performance.now();
          const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayed(eased * numValue);
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [numValue]);

  return <span ref={spanRef}>{displayed.toFixed(decimals)}</span>;
}
