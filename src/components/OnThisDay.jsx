import { useMemo } from 'react';
import Reveal from './Reveal.jsx';
import { getOnThisDay } from '../data/onThisDay.js';
import { toMonthDayKey, formatDayMonth } from '../utils/dateCalculations.js';

function Group({ title, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="glass otd-group">
      <h3>{title}</h3>
      <ul className="otd-list">
        {items.map((item, i) => (
          <li className="otd-item" key={`${item.year}-${i}`}>
            <span className="otd-year">{item.year}</span>
            <p className="otd-text">{item.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function OnThisDay({ birthDate }) {
  const key = useMemo(() => toMonthDayKey(birthDate), [birthDate]);
  const data = useMemo(() => getOnThisDay(key), [key]);
  const dayLabel = formatDayMonth(birthDate);

  const hasAny =
    data && ((data.events && data.events.length) ||
      (data.births && data.births.length) ||
      (data.deaths && data.deaths.length));

  return (
    <section className="section" aria-labelledby="otd-heading">
      <div className="container">
        <Reveal>
          <p className="eyebrow">On {dayLabel}</p>
          <h2 className="section-title" id="otd-heading">On the day you were born…</h2>
          <p className="section-lede">
            Real moments recorded across history that share your day on the calendar.
          </p>
        </Reveal>

        {hasAny ? (
          <Reveal className="otd-groups" style={{ marginTop: '1.8rem' }}>
            <Group title="Events" items={data.events} />
            <Group title="Births" items={data.births} />
            <Group title="Passings" items={data.deaths} />
          </Reveal>
        ) : (
          <Reveal className="glass otd-empty" style={{ marginTop: '1.8rem' }}>
            <p className="big">We’re still collecting stories from this day.</p>
            <p className="note">
              Our curated history doesn’t include {dayLabel} yet — and we never invent events.
            </p>
          </Reveal>
        )}

        {hasAny && (
          <Reveal>
            <p className="note" style={{ marginTop: '1.4rem' }}>
              Curated from the widely-documented public historical record. Only entries in our
              dataset are shown — nothing here is generated.
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
