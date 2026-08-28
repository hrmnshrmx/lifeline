import { useMemo, useState } from 'react';
import Select from './Select.jsx';
import { parseBirthday, isFuture, MONTH_NAMES } from '../utils/dateCalculations.js';

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - 1900 + 1 }, (_, i) => {
  const y = CURRENT_YEAR - i;
  return { value: y, label: String(y) };
});
const MONTH_OPTIONS = MONTH_NAMES.map((name, i) => ({
  value: i + 1,
  label: `${String(i + 1).padStart(2, '0')} · ${name}`,
}));
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({ value: i, label: String(i).padStart(2, '0') }));
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => ({ value: i, label: String(i).padStart(2, '0') }));

function daysInMonth(month /* 1-12 */, year) {
  if (!month) return 31;
  return new Date(year || 2000, month, 0).getDate();
}

function pad(n) {
  return String(n).padStart(2, '0');
}

/**
 * Opening experience: wordmark → prompt → an unambiguous DD / MM / YYYY
 * selector (custom themed dropdowns) → Begin. Time is optional (HH : MM).
 */
export default function BirthdayInput({ onSubmit, initialDate = '', initialTime = '' }) {
  const [y0, m0, d0] = initialDate ? initialDate.split('-') : ['', '', ''];
  const [ih, im] = initialTime ? initialTime.split(':') : ['', ''];
  const [day, setDay] = useState(d0 ? String(Number(d0)) : '');
  const [month, setMonth] = useState(m0 ? String(Number(m0)) : '');
  const [year, setYear] = useState(y0 ? String(Number(y0)) : '');
  const [hour, setHour] = useState(ih !== '' && ih !== undefined ? String(Number(ih)) : '');
  const [minute, setMinute] = useState(im !== '' && im !== undefined ? String(Number(im)) : '');
  const [error, setError] = useState('');

  const maxDay = useMemo(() => daysInMonth(Number(month), Number(year)), [month, year]);
  const dayOptions = useMemo(
    () => Array.from({ length: maxDay }, (_, i) => ({ value: i + 1, label: pad(i + 1) })),
    [maxDay],
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!day || !month || !year) {
      setError('Please choose your day, month and year.');
      return;
    }
    const dateStr = `${year}-${pad(Number(month))}-${pad(Number(day))}`;
    const timeStr = hour !== '' ? `${pad(Number(hour))}:${pad(minute === '' ? 0 : Number(minute))}` : '';
    const result = parseBirthday(dateStr, timeStr);
    if (!result) {
      setError("That date doesn't exist. Please check the day and month.");
      return;
    }
    if (isFuture(result.date)) {
      setError("That date hasn't arrived yet. Choose a date in the past.");
      return;
    }
    setError('');
    onSubmit(dateStr, result.hasTime ? timeStr : '');
  };

  const clr = (setter) => (v) => {
    setError('');
    setter(v);
  };

  return (
    <section className="intro" aria-labelledby="intro-heading">
      <div className="intro-inner stagger">
        <h1 className="wordmark" id="intro-heading">Lifeline</h1>
        <p className="tagline">Your life, measured in time.</p>

        <p className="prompt">When did your story begin?</p>

        <form className="dob-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <span className="field-legend">Date of birth</span>
            <div className="dob-selects" role="group" aria-label="Date of birth, day month year">
              <div className="dob-col day">
                <Select ariaLabel="Day" placeholder="DD" value={day} onChange={clr(setDay)} options={dayOptions} />
              </div>
              <span className="dob-sep" aria-hidden="true">/</span>
              <div className="dob-col month">
                <Select
                  ariaLabel="Month"
                  placeholder="MM"
                  value={month}
                  onChange={clr((v) => {
                    setMonth(v);
                    const max = daysInMonth(Number(v), Number(year));
                    if (day && Number(day) > max) setDay(String(max));
                  })}
                  options={MONTH_OPTIONS}
                />
              </div>
              <span className="dob-sep" aria-hidden="true">/</span>
              <div className="dob-col year">
                <Select
                  ariaLabel="Year"
                  placeholder="YYYY"
                  value={year}
                  onChange={clr((v) => {
                    setYear(v);
                    const max = daysInMonth(Number(month), Number(v));
                    if (day && Number(day) > max) setDay(String(max));
                  })}
                  options={YEAR_OPTIONS}
                />
              </div>
            </div>
          </div>

          <div className="field">
            <span className="field-legend">
              Time of birth <span className="hint-optional">(optional)</span>
            </span>
            <div className="dob-selects time-selects" role="group" aria-label="Time of birth, hour and minute">
              <div className="dob-col">
                <Select ariaLabel="Hour" placeholder="HH" value={hour} onChange={clr(setHour)} options={HOUR_OPTIONS} />
              </div>
              <span className="dob-sep" aria-hidden="true">:</span>
              <div className="dob-col">
                <Select ariaLabel="Minute" placeholder="MM" value={minute} onChange={clr(setMinute)} options={MINUTE_OPTIONS} />
              </div>
              <div className="dob-col time-spacer" aria-hidden="true" />
            </div>
          </div>

          <p className="form-error" role="alert">{error}</p>

          <button type="submit" className="btn">Begin</button>

          <span className="privacy">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5l-8-3Z"
                stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.6"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Your birthday stays on this device.
          </span>
        </form>
      </div>
    </section>
  );
}
