import { useMemo } from 'react';
import Reveal from './Reveal.jsx';
import { getWeeklyRhythms } from '../utils/lifeExtras.js';
import { fmt } from '../utils/format.js';

export default function WeeklyRhythms() {
  const r = useMemo(() => getWeeklyRhythms(), []);
  const cards = [
    { icon: '❤️', value: fmt(r.heartbeats), label: 'Heartbeats' },
    { icon: '🫁', value: fmt(r.breaths), label: 'Breaths' },
    { icon: '👁️', value: fmt(r.blinks), label: 'Blinks' },
    { icon: '🌙', value: `${r.sleepHours} hrs`, label: 'Asleep' },
  ];

  return (
    <section className="section" aria-labelledby="week-heading">
      <div className="container">
        <Reveal>
          <p className="eyebrow">Every single week</p>
          <h2 className="section-title" id="week-heading">Your body, this week</h2>
          <p className="section-lede">
            Quietly, in the background, this is roughly what a week of being alive looks like.
          </p>
        </Reveal>

        <Reveal className="rhythm-grid" style={{ marginTop: '1.8rem' }}>
          {cards.map((c) => (
            <div className="glass rhythm-card" key={c.label}>
              <span className="icon" aria-hidden="true">{c.icon}</span>
              <span className="value">{c.value}</span>
              <span className="label">{c.label}</span>
            </div>
          ))}
        </Reveal>

        <Reveal>
          <p className="note" style={{ marginTop: '1.2rem' }}>
            Based on typical adult averages (~72 heartbeats and ~16 breaths a minute, ~8 hours of
            sleep a night). Everyone is different.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
