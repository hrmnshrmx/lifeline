import { useMemo } from 'react';
import Reveal from './Reveal.jsx';
import { getGeneration } from '../utils/lifeExtras.js';

export default function Generation({ birthDate }) {
  const gen = useMemo(() => getGeneration(birthDate), [birthDate]);

  return (
    <section className="section" aria-labelledby="gen-heading">
      <div className="container">
        <Reveal>
          <p className="eyebrow">Your place in time</p>
          <h2 className="section-title" id="gen-heading">The generation you belong to</h2>
        </Reveal>

        <Reveal className="glass gen-card" style={{ marginTop: '1.8rem' }}>
          <div className="gen-main">
            <span className="gen-decade">Born in the {gen.decade}</span>
            <p className="gen-name">{gen.name}</p>
            <p className="gen-blurb">{gen.blurb}</p>
          </div>
          <div className="gen-badge" aria-hidden="true">
            <span>{gen.decade}</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
