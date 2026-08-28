import { Suspense, lazy, useEffect, useState } from 'react';
import { useLifeCounter } from '../hooks/useLifeCounter.js';
import { fmt, pad2 } from '../utils/format.js';
import { formatFullDate } from '../utils/dateCalculations.js';

const EarthScene = lazy(() => import('./EarthScene.jsx'));

/** Decide whether this device should get the full 3D treatment. */
function detectQuality() {
  if (typeof window === 'undefined') return 'low';
  const cores = navigator.hardwareConcurrency || 4;
  const mem = navigator.deviceMemory || 4;
  const narrow = window.matchMedia('(max-width: 640px)').matches;
  const saveData = navigator.connection && navigator.connection.saveData;
  if (saveData) return 'low';
  if (narrow && (cores <= 4 || mem <= 3)) return 'low';
  if (cores <= 2 || mem <= 2) return 'low';
  return 'high';
}

export default function LifeCounter({ birthDate, hasTime, reducedMotion }) {
  const counter = useLifeCounter(birthDate);
  const [enable3D, setEnable3D] = useState(false);
  const [quality, setQuality] = useState('high');

  useEffect(() => {
    // Defer mounting the 3D canvas until after first paint so the counter is
    // interactive immediately. Also skip WebGL entirely if unsupported.
    setQuality(detectQuality());
    let supported = true;
    try {
      const canvas = document.createElement('canvas');
      supported = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch {
      supported = false;
    }
    if (!supported) return undefined;
    const id = window.requestIdleCallback
      ? window.requestIdleCallback(() => setEnable3D(true), { timeout: 1500 })
      : window.setTimeout(() => setEnable3D(true), 600);
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(id);
      else window.clearTimeout(id);
    };
  }, []);

  if (!counter) return null;
  const { breakdown, totals } = counter;

  return (
    <section className="hero" aria-labelledby="hero-heading" id="lifeline-top">
      <div className="earth-wrap" aria-hidden="true">
        {enable3D && (
          <Suspense fallback={null}>
            <EarthScene quality={quality} reducedMotion={reducedMotion} />
          </Suspense>
        )}
      </div>

      <div className="container hero-content">
        <p className="hero-kicker">
          Your life
          <span className="live-pill">
            <span className="pulse" aria-hidden="true" />
            LIVE
          </span>
        </p>

        <h1 id="hero-heading">
          You have been alive for{' '}
          <span className="accent">{breakdown.years} years</span>.
        </h1>

        {/* Primary centerpiece: seconds, ticking live. */}
        <div className="counter-primary" aria-live="off">
          <span className="value" aria-hidden="true">{fmt(totals.seconds)}</span>
          <span className="unit">seconds lived</span>
        </div>
        <p className="sr-only" aria-live="polite">
          {fmt(totals.seconds)} seconds lived.
        </p>

        <div className="counter-grid">
          <div className="counter-cell">
            <span className="num">{fmt(totals.days)}</span>
            <span className="lbl">Days</span>
          </div>
          <div className="counter-cell">
            <span className="num">{fmt(totals.hours)}</span>
            <span className="lbl">Hours</span>
          </div>
          <div className="counter-cell">
            <span className="num">{fmt(totals.minutes)}</span>
            <span className="lbl">Minutes</span>
          </div>
          <div className="counter-cell seconds">
            <span className="num">
              {pad2(breakdown.hours)}:{pad2(breakdown.minutes)}:{pad2(breakdown.seconds)}
            </span>
            <span className="lbl">Today</span>
          </div>
        </div>

        <p className="birth-caption">
          Born {formatFullDate(birthDate)}
          {hasTime
            ? ` at ${pad2(birthDate.getHours())}:${pad2(birthDate.getMinutes())}.`
            : ' — birth time unknown, so we count from midnight.'}
        </p>

        <div className="hero-scroll" aria-hidden="true">
          <span>Scroll to explore</span>
          <span className="chev">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </section>
  );
}
