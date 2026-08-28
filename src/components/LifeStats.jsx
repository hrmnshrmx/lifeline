import { useMemo } from 'react';
import Reveal from './Reveal.jsx';
import { getLifeStatistics } from '../utils/lifeStatistics.js';
import { fmt } from '../utils/format.js';

export default function LifeStats({ birthDate }) {
  // Recompute lightly; seconds precision isn't needed here so a snapshot on
  // mount / birthday change is plenty.
  const stats = useMemo(() => getLifeStatistics(birthDate), [birthDate]);

  const cards = [
    { icon: '📅', value: fmt(stats.daysLived), label: 'Days lived' },
    { icon: '🗓️', value: fmt(stats.weeksLived), label: 'Weeks lived', sub: 'approximate' },
    { icon: '🌙', value: fmt(stats.monthsLived), label: 'Months lived', sub: 'approximate' },
    { icon: '🎂', value: fmt(stats.birthdaysExperienced), label: 'Birthdays experienced' },
    { icon: '🌍', value: fmt(stats.tripsAroundSun), label: 'Trips around the Sun', sub: 'years completed' },
    { icon: '🌕', value: fmt(stats.fullMoons), label: 'Full moons', sub: 'approximate' },
    { icon: '🌅', value: fmt(stats.sunrises), label: 'Sunrises', sub: 'approximate' },
    { icon: '❄️', value: fmt(stats.leapDaysExperienced), label: 'Leap days lived' },
  ];

  return (
    <section className="section" aria-labelledby="stats-heading">
      <div className="container">
        <Reveal>
          <p className="eyebrow">Life in perspective</p>
          <h2 className="section-title" id="stats-heading">Your life in numbers</h2>
          <p className="section-lede">
            A snapshot of time behind you. Astronomical values are gentle estimates, not exact
            measurements.
          </p>
        </Reveal>

        <Reveal className="stats-grid" style={{ marginTop: '1.8rem' }}>
          {cards.map((c) => (
            <div className="glass stat-card" key={c.label}>
              <span className="icon" aria-hidden="true">{c.icon}</span>
              <span className="value">{c.value}</span>
              <span className="label">{c.label}</span>
              {c.sub && <span className="sub">{c.sub}</span>}
            </div>
          ))}
        </Reveal>

        <Reveal>
          <p className="note" style={{ marginTop: '1.4rem' }}>
            Full moons use the mean lunar cycle (~29.53 days); sunrises assume one per day. Real
            skies vary with latitude, seasons and travel.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
