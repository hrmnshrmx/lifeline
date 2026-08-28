import { useState } from 'react';
import Reveal from './Reveal.jsx';
import { useOnThisDay } from '../hooks/useOnThisDay.js';
import { formatDayMonth } from '../utils/dateCalculations.js';

function Card({ item, kind }) {
  const [imgOk, setImgOk] = useState(true);
  const showImg = item.thumb && imgOk;
  const isPerson = kind === 'births' || kind === 'deaths';
  // For people, prefer name (title) + description; for events, the sentence.
  const heading = isPerson ? (item.title || item.text) : null;
  const body = isPerson ? (item.desc || item.text) : item.text;

  const inner = (
    <>
      <div className={`otd-media ${isPerson ? 'round' : ''}`}>
        {showImg ? (
          <img
            src={item.thumb}
            alt=""
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setImgOk(false)}
          />
        ) : isPerson ? (
          <svg className="otd-media-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="8.5" r="3.6" fill="currentColor" />
            <path d="M4.5 20c0-4.2 3.4-6.6 7.5-6.6s7.5 2.4 7.5 6.6z" fill="currentColor" />
          </svg>
        ) : (
          <svg className="otd-media-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3.2 13.9 9h5.9l-4.8 3.5 1.9 5.9-4.9-3.7-4.9 3.7 1.9-5.9L4.1 9H10z" fill="currentColor" />
          </svg>
        )}
      </div>
      <div className="otd-body">
        <span className="otd-chip">{item.year}</span>
        {heading && <p className="otd-name">{heading}</p>}
        <p className="otd-desc">{body}</p>
      </div>
    </>
  );

  if (item.url) {
    return (
      <a className="otd-card" href={item.url} target="_blank" rel="noopener noreferrer">
        {inner}
        <svg className="otd-arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    );
  }
  return <div className="otd-card">{inner}</div>;
}

function Column({ title, items, kind }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="otd-col">
      <h3 className="otd-col-title">{title}</h3>
      <div className="otd-cards">
        {items.map((item, i) => (
          <Card item={item} kind={kind} key={`${item.year}-${i}`} />
        ))}
      </div>
    </div>
  );
}

function Loader() {
  return (
    <div className="otd-loader" role="status" aria-live="polite">
      <div className="otd-orbit" aria-hidden="true">
        <span className="core" />
        <span className="ring" />
        <span className="sat" />
      </div>
      <p className="otd-loader-text">Searching the archives…</p>
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

        {status === 'loading' && <Loader />}

        {status === 'ready' && data && !data.empty && (
          <>
            <Reveal className="otd-columns" style={{ marginTop: '2rem' }}>
              <Column title="Events" items={data.events} kind="events" />
              <Column title="Births" items={data.births} kind="births" />
              <Column title="Passings" items={data.deaths} kind="deaths" />
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
          <Reveal className="glass otd-empty" style={{ marginTop: '2rem' }}>
            <p className="big">We’re still collecting stories from this day.</p>
            <p className="note">We couldn’t reach the archive right now — and we never invent events.</p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
