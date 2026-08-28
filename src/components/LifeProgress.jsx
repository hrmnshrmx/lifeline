import { useMemo, useState } from 'react';
import Reveal from './Reveal.jsx';
import { getLifeProgress } from '../utils/lifeStatistics.js';
import { fmt } from '../utils/format.js';

const OPTIONS = [70, 80, 90];

export default function LifeProgress({ birthDate }) {
  const [expectancy, setExpectancy] = useState(80);
  const progress = useMemo(
    () => getLifeProgress(birthDate, new Date(), expectancy),
    [birthDate, expectancy],
  );
  const pct = progress.percent.toFixed(1);

  return (
    <section className="section" aria-labelledby="progress-heading">
      <div className="container">
        <Reveal>
          <p className="eyebrow">A gentle perspective</p>
          <h2 className="section-title" id="progress-heading">If you live to {expectancy}…</h2>
          <p className="section-lede">
            An illustrative view of time — nobody knows their real lifespan. This is here to say
            one thing: you are here now.
          </p>
        </Reveal>

        <Reveal className="glass progress-card" style={{ marginTop: '1.8rem' }}>
          <div className="progress-head">
            <p className="progress-here">
              You’ve lived <span className="accent">{pct}%</span> of {expectancy} years.
            </p>
            <div className="expectancy-toggle" role="group" aria-label="Illustrative lifespan">
              {OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  className="chip"
                  aria-pressed={expectancy === opt}
                  onClick={() => setExpectancy(opt)}
                >
                  to {opt}
                </button>
              ))}
            </div>
          </div>

          <div
            className="life-track"
            role="img"
            aria-label={`About ${pct} percent of an ${expectancy}-year illustrative life.`}
          >
            <div className="life-fill" style={{ width: `${progress.percent}%` }} />
            <div className="life-marker" style={{ left: `${progress.percent}%` }} aria-hidden="true" />
          </div>

          <div className="progress-legend">
            <div className="legend-item lived">
              <span className="k">Years lived</span>
              <span className="v">{progress.yearsLived}</span>
            </div>
            <div className="legend-item">
              <span className="k">Years remaining</span>
              <span className="v">{progress.yearsRemaining}</span>
            </div>
            <div className="legend-item lived">
              <span className="k">Days lived</span>
              <span className="v">{fmt(progress.daysLived)}</span>
            </div>
            <div className="legend-item">
              <span className="k">Days remaining</span>
              <span className="v">{fmt(progress.daysRemaining)}</span>
            </div>
          </div>

          <p className="note">
            Illustrative estimate only. Figures assume a fixed lifespan for reflection — they are
            not a prediction.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
