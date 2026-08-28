import { useMemo } from 'react';
import Reveal from './Reveal.jsx';
import { getCosmicDistance, abbreviate } from '../utils/lifeExtras.js';
import { fmt } from '../utils/format.js';

export default function CosmicDistance({ birthDate }) {
  const c = useMemo(() => getCosmicDistance(birthDate), [birthDate]);

  return (
    <section className="section" aria-labelledby="cosmic-heading">
      <div className="container">
        <Reveal>
          <p className="eyebrow">You’ve been moving this whole time</p>
          <h2 className="section-title" id="cosmic-heading">How far you’ve travelled</h2>
          <p className="section-lede">
            You’ve never stood still. Even now, you’re racing through space — around the Sun, and
            with it, through the galaxy.
          </p>
        </Reveal>

        <Reveal className="cosmic-grid" style={{ marginTop: '1.8rem' }}>
          <div className="glass cosmic-card">
            <span className="cosmic-emoji" aria-hidden="true">🌍</span>
            <p className="cosmic-lead">Around the Sun</p>
            <p className="cosmic-value">{abbreviate(c.aroundSunKm)}<span className="unit"> km</span></p>
            <p className="cosmic-sub">
              That’s about {fmt(c.moonTrips)} round trips to the Moon, riding Earth at ~29.8 km per second.
            </p>
          </div>
          <div className="glass cosmic-card">
            <span className="cosmic-emoji" aria-hidden="true">🌌</span>
            <p className="cosmic-lead">Through the Milky Way</p>
            <p className="cosmic-value">{abbreviate(c.throughGalaxyKm)}<span className="unit"> km</span></p>
            <p className="cosmic-sub">
              With the Sun orbiting the galaxy’s centre at ~230 km per second — roughly {fmt(c.sunDistances)}×
              the distance from the Earth to the Sun.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <p className="note" style={{ marginTop: '1.2rem' }}>
            Estimated from average orbital speeds. Cosmic motion is relative — these are for wonder,
            not navigation.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
