import { useMemo } from 'react';
import Reveal from './Reveal.jsx';
import { estimateBirthdayRarity } from '../utils/birthdayRarity.js';
import { fmt } from '../utils/format.js';

export default function BirthdayRarity({ birthDate }) {
  const rarity = useMemo(() => estimateBirthdayRarity(birthDate), [birthDate]);
  const percent = rarity.percent.toFixed(2);
  // Bar width: scale the (small) percentage up so it's visible, capped.
  const barWidth = Math.min(100, Math.max(3, rarity.percent * 12));

  return (
    <section className="section" aria-labelledby="rarity-heading">
      <div className="container">
        <Reveal>
          <p className="eyebrow">Birthday rarity</p>
          <h2 className="section-title" id="rarity-heading">How rare is your birthday?</h2>
          <p className="section-lede">
            An honest, calendar-based estimate — not a claim about real birth records.
          </p>
        </Reveal>

        <Reveal className="glass rarity-card" style={{ marginTop: '1.8rem' }}>
          <div className="rarity-big">
            <div className="rarity-stat">
              <span className="k">Your birthday</span>
              <span className="v">{rarity.dayLabel}</span>
            </div>
            <div className="rarity-stat">
              <span className="k">Estimated frequency</span>
              <span className="v">≈ 1 in <span className="accent">{fmt(rarity.oneIn)}</span></span>
            </div>
            <div className="rarity-stat">
              <span className="k">Share of calendar dates</span>
              <span className="v">{percent}%</span>
            </div>
          </div>

          <div className="rarity-bar" role="img"
            aria-label={`Approximately ${percent} percent of calendar dates.`}>
            <span style={{ width: `${barWidth}%` }} />
          </div>

          <p className="note">{rarity.note}</p>
        </Reveal>
      </div>
    </section>
  );
}
