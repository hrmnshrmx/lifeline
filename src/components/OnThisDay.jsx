import Reveal from './Reveal.jsx';
import { useOnThisDay } from '../hooks/useOnThisDay.js';
import { formatDayMonth } from '../utils/dateCalculations.js';

function Group({ title, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="glass otd-group">
      <h3>{title}</h3>
      <ul className="otd-list">
        {items.map((item, i) => (
          <li className="otd-item" key={`${item.year}-${i}`}>
            <span className="otd-year">{item.year}</span>
            {item.url ? (
              <p className="otd-text">
                <a href={item.url} target="_blank" rel="noopener noreferrer">{item.text}</a>
              </p>
            ) : (
              <p className="otd-text">{item.text}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function OnThisDay({ birthDate }) {
  const { status, data } = useOnThisDay(birthDate);
  const dayLabel = formatDayMonth(birthDate);

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

        {status === 'loading' && (
          <div className="otd-groups" style={{ marginTop: '1.8rem' }} aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div className="glass otd-group otd-skeleton" key={i}>
                <span className="sk sk-title" />
                <span className="sk sk-line" />
                <span className="sk sk-line short" />
                <span className="sk sk-line" />
              </div>
            ))}
          </div>
        )}

        {status === 'ready' && data && !data.empty && (
          <>
            <Reveal className="otd-groups" style={{ marginTop: '1.8rem' }}>
              <Group title="Events" items={data.events} />
              <Group title="Births" items={data.births} />
              <Group title="Passings" items={data.deaths} />
            </Reveal>
            <Reveal>
              <p className="note otd-source">
                {data.source === 'wikipedia' ? (
                  <>
                    Source:{' '}
                    <a href={data.sourceUrl} target="_blank" rel="noopener noreferrer">
                      Wikipedia — {dayLabel}
                    </a>
                    . Only your calendar day is looked up; your birth year never leaves this device.
                  </>
                ) : (
                  <>Curated from the public historical record. Nothing here is generated.</>
                )}
              </p>
            </Reveal>
          </>
        )}

        {status === 'ready' && data && data.empty && (
          <Reveal className="glass otd-empty" style={{ marginTop: '1.8rem' }}>
            <p className="big">We’re still collecting stories from this day.</p>
            <p className="note">We couldn’t reach the archive right now — and we never invent events.</p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
