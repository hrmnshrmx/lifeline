// useLifeCounter.js
// A real, continuously-updating counter driven off wall-clock time.
// It recomputes from birthDate -> Date.now() on every tick (never a fake
// incrementing number), so it stays accurate across tab sleeps and DST.

import { useEffect, useRef, useState } from 'react';
import { getElapsedBreakdown, getTotals } from '../utils/dateCalculations.js';

function compute(birthDate) {
  const now = new Date();
  return {
    breakdown: getElapsedBreakdown(birthDate, now),
    totals: getTotals(birthDate, now),
  };
}

export function useLifeCounter(birthDate) {
  const [state, setState] = useState(() =>
    birthDate ? compute(birthDate) : null,
  );
  const frameRef = useRef(null);
  const lastSecondRef = useRef(-1);

  useEffect(() => {
    if (!birthDate) {
      setState(null);
      return undefined;
    }

    let mounted = true;
    setState(compute(birthDate));
    lastSecondRef.current = -1;

    const tick = () => {
      if (!mounted) return;
      const now = Date.now();
      const currentSecond = Math.floor(now / 1000);
      // Only push a state update when the whole-second value changes — keeps
      // React re-renders to ~1/sec instead of 60/sec, saving battery.
      if (currentSecond !== lastSecondRef.current) {
        lastSecondRef.current = currentSecond;
        setState(compute(birthDate));
      }
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    // Recompute immediately when the tab becomes visible again.
    const onVisible = () => {
      if (document.visibilityState === 'visible' && mounted) {
        lastSecondRef.current = -1;
        setState(compute(birthDate));
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      mounted = false;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [birthDate]);

  return state;
}
